// Generates public/sitemap.xml and public/sitemap.txt from the live CMS.
//
// Run automatically by `npm run build` (see the `prebuild` script). Content
// URLs are read from the same API the site uses, so every published person,
// publication, event and research theme is listed.
//
// The script never fails the build: if the API is unreachable it falls back to
// the static route list and exits 0.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/** Minimal .env reader — the project has no dotenv dependency. */
async function readEnvFile(file) {
  try {
    const raw = await readFile(file, 'utf8');
    const env = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const fileEnv = await readEnvFile(join(root, '.env'));

const SITE_URL = (
  process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL || 'https://refugeemigrationlab.org'
).replace(/\/+$/, '');

const API_URL = (
  process.env.VITE_API_URL || fileEnv.VITE_API_URL || 'https://api.refugeemigrationlab.org'
).replace(/\/+$/, '');

const OUTPUT_DIR = join(root, 'public');

/**
 * Static routes, mirroring src/App.tsx. `priority` and `changefreq` are
 * Google hints only — they do not affect crawl budget.
 */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/team', changefreq: 'weekly', priority: '0.9' },
  { path: '/team/research-assistants', changefreq: 'weekly', priority: '0.7' },
  { path: '/team/non-resident-fellows', changefreq: 'weekly', priority: '0.7' },
  { path: '/team/affiliates', changefreq: 'weekly', priority: '0.7' },
  { path: '/research', changefreq: 'weekly', priority: '0.9' },
  { path: '/publications', changefreq: 'weekly', priority: '0.9' },
  { path: '/events', changefreq: 'weekly', priority: '0.9' },
  { path: '/programmes/internship', changefreq: 'monthly', priority: '0.7' },
  { path: '/programmes/visiting-fellowship', changefreq: 'monthly', priority: '0.7' },
  { path: '/join', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchJson(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Strip anything that is not a safe URL path segment. */
function safeSegment(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9._~-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function collectDynamicRoutes() {
  const routes = [];
  const warnings = [];

  const sources = [
    {
      label: 'people',
      endpoint: '/people/published',
      prefix: '/team',
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      label: 'publications',
      endpoint: '/publications/published',
      prefix: '/publications',
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      label: 'events',
      endpoint: '/events/published',
      prefix: '/events',
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      label: 'research themes',
      endpoint: '/themes',
      prefix: '/research',
      changefreq: 'monthly',
      priority: '0.7',
    },
  ];

  for (const source of sources) {
    try {
      const items = await fetchJson(source.endpoint);
      for (const item of items) {
        const slug = safeSegment(item?.slug);
        if (!slug) continue;
        routes.push({
          path: `${source.prefix}/${slug}`,
          changefreq: source.changefreq,
          priority: source.priority,
        });
      }
      console.log(`  ${source.label}: ${items.length}`);
    } catch (error) {
      warnings.push(`${source.label} (${source.endpoint}): ${error.message}`);
    }
  }

  return { routes, warnings };
}

async function main() {
  console.log(`[sitemap] site: ${SITE_URL}`);
  console.log(`[sitemap] api:  ${API_URL}`);

  const { routes: dynamicRoutes, warnings } = await collectDynamicRoutes();

  if (warnings.length > 0) {
    console.warn('[sitemap] WARNING: some content could not be read:');
    for (const warning of warnings) console.warn(`  - ${warning}`);
    console.warn('[sitemap] continuing with the URLs that are available.');
  }

  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = allRoutes
    .map(
      (route) =>
        `  <url>\n` +
        `    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${route.changefreq}</changefreq>\n` +
        `    <priority>${route.priority}</priority>\n` +
        `  </url>`
    )
    .join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!-- Generated by scripts/generate-sitemap.mjs — do not edit by hand. -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  const txt = allRoutes.map((route) => `${SITE_URL}${route.path}`).join('\n') + '\n';

  await writeFile(join(OUTPUT_DIR, 'sitemap.xml'), xml, 'utf8');
  await writeFile(join(OUTPUT_DIR, 'sitemap.txt'), txt, 'utf8');

  console.log(
    `[sitemap] wrote ${allRoutes.length} URLs (${STATIC_ROUTES.length} static, ${dynamicRoutes.length} dynamic) to public/sitemap.xml`
  );
}

main().catch(async (error) => {
  console.warn(`[sitemap] could not generate the sitemap: ${error.message}`);
  console.warn('[sitemap] falling back to the static route list.');
  try {
    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = STATIC_ROUTES.map(
      (route) =>
        `  <url>\n` +
        `    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${route.changefreq}</changefreq>\n` +
        `    <priority>${route.priority}</priority>\n` +
        `  </url>`
    ).join('\n');
    await writeFile(
      join(OUTPUT_DIR, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      'utf8'
    );
    console.log(`[sitemap] wrote ${STATIC_ROUTES.length} static URLs.`);
  } catch (writeError) {
    console.warn(`[sitemap] could not write the fallback sitemap: ${writeError.message}`);
  }
  process.exitCode = 0;
});
