// Verifies that a deployed build serves every public URL correctly.
//
// This is the gate before submitting a sitemap to Google Search Console: the
// app is a client-side-routed SPA, so every route below must return 200 via
// the server's SPA fallback (`try_files $uri $uri/ /index.html` in nginx).
// A sitemap full of 404s makes Google deprioritise the whole domain.
//
// Usage:
//   node scripts/verify-deploy.mjs
//   node scripts/verify-deploy.mjs --base http://localhost:4173
//   node scripts/verify-deploy.mjs --base https://refugeemigrationlab.org --sitemap
//
// Exit code 0 = every check passed, 1 = at least one failure.

const args = process.argv.slice(2);

function argValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const BASE = argValue('--base', 'https://refugeemigrationlab.org').replace(/\/+$/, '');
const USE_SITEMAP = args.includes('--sitemap');
const TIMEOUT_MS = 20_000;

/** Routes that must always resolve, independent of CMS content. */
const STATIC_ROUTES = [
  '/',
  '/about',
  '/team',
  '/team/research-assistants',
  '/team/non-resident-fellows',
  '/team/affiliates',
  '/research',
  '/publications',
  '/events',
  '/programmes/internship',
  '/programmes/visiting-fellowship',
  '/join',
  '/contact',
];

/** Files that must be served as real files, not swallowed by the fallback. */
const STATIC_FILES = ['/robots.txt', '/sitemap.xml', '/favicon.svg'];

/** Admin must resolve but must never be indexable. */
const ADMIN_ROUTES = ['/admin/login', '/admin'];

const results = [];

async function probe(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'rml-deploy-verify/1.0' },
      signal: controller.signal,
    });
    const body = res.status === 200 ? await res.text() : '';
    return { status: res.status, body, headers: res.headers };
  } finally {
    clearTimeout(timer);
  }
}

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function checkPath(path, { expect = 200, label } = {}) {
  try {
    const { status, headers, body } = await probe(path);
    const name = label ?? path;

    if (status !== expect) {
      const hint =
        status === 404
          ? ' (no SPA fallback — nginx needs try_files $uri $uri/ /index.html)'
          : '';
      record(name, false, `HTTP ${status}${hint}`);
      return { status, headers, body };
    }

    // A 200 that is actually the SPA fallback for a static file means the
    // fallback is swallowing real files.
    if (path.endsWith('.xml') || path.endsWith('.txt')) {
      const looksLikeSpa = body.includes('<div id="root">');
      if (looksLikeSpa) {
        record(name, false, 'HTTP 200 but returned index.html instead of the file');
        return { status, headers, body };
      }
    }

    record(name, true, `HTTP ${status}`);
    return { status, headers, body };
  } catch (error) {
    record(label ?? path, false, error.name === 'AbortError' ? 'timeout' : error.message);
    return null;
  }
}

(async () => {
  console.log(`\n===== deploy verification: ${BASE} =====\n`);

  console.log('--- static routes ---');
  for (const path of STATIC_ROUTES) {
    await checkPath(path);
  }

  console.log('\n--- static files ---');
  for (const path of STATIC_FILES) {
    await checkPath(path);
  }

  console.log('\n--- admin routes (must resolve, must be noindex) ---');
  for (const path of ADMIN_ROUTES) {
    const res = await checkPath(path);
    if (res && res.status === 200) {
      const header = res.headers.get('x-robots-tag');
      const inHeader = header?.toLowerCase().includes('noindex') ?? false;
      const inMeta = res.body.includes('content="noindex');

      if (inHeader) {
        record(`${path} is noindex (header)`, true, header);
      } else if (inMeta) {
        record(`${path} is noindex (meta)`, true, 'meta robots noindex');
      } else {
        // The app adds <meta name="robots" content="noindex, nofollow"> at
        // runtime, so a plain HTTP fetch cannot see it. Only a rendering
        // crawler will. Flag it, but do not fail the run.
        console.log(
          `  WARN  ${path} — no X-Robots-Tag header (the app sets a noindex meta at runtime instead)`
        );
      }
    }
  }

  if (USE_SITEMAP) {
    console.log('\n--- every URL in sitemap.xml ---');
    try {
      const res = await fetch(`${BASE}/sitemap.xml`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      console.log(`  sitemap lists ${urls.length} URLs`);
      if (urls.length === 0) {
        record('sitemap contains URLs', false, 'no <loc> entries found');
      }
      let failures = 0;
      for (const url of urls) {
        // Rebase onto the target being checked, so --base http://localhost:4173
        // tests the local build rather than the production site.
        let path = url;
        try {
          const parsed = new URL(url);
          path = parsed.pathname + parsed.search;
        } catch {
          /* leave as-is */
        }
        const target = url.startsWith(BASE) ? url : `${BASE}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
          const r = await fetch(target, { redirect: 'manual', signal: controller.signal });
          if (r.status !== 200) {
            failures++;
            console.log(`  FAIL  ${r.status}  ${target}`);
          }
        } catch {
          failures++;
          console.log(`  FAIL  ERR ${target}`);
        } finally {
          clearTimeout(timer);
        }
      }
      record(
        `all ${urls.length} sitemap URLs return 200`,
        failures === 0,
        failures ? `${failures} failing` : ''
      );
    } catch (error) {
      record('sitemap.xml could be fetched', false, error.message);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n===== ${results.length - failed.length}/${results.length} checks passed =====`
  );
  if (failed.length) {
    console.log('\nFAILURES:');
    failed.forEach((f) => console.log(`  - ${f.name} ${f.detail}`));
    console.log(
      '\nMost likely cause: the web server has no SPA fallback.\n' +
        '  nginx:  location / { try_files $uri $uri/ /index.html; }\n' +
        '  see deploy/nginx.conf'
    );
    process.exitCode = 1;
  }
})();
