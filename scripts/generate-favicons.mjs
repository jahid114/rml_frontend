/**
 * Generates the favicon / app-icon set in public/ from two sources:
 *
 *   - the vector mark in public/favicon.svg  -> favicon.ico + favicon-*.png
 *     (the Google site icon: square, opaque, in a format Google supports)
 *   - the site logo (the "RML" wordmark)    -> apple-touch-icon.png +
 *     icon-192.png + icon-512.png (home screen / PWA icons, padded square)
 *
 * Google Search only accepts favicons in BMP, GIF, ICO, PNG, JPEG, PPM and
 * TIFF (see https://developers.google.com/search/docs/appearance/favicon-in-search),
 * which is why the SVG alone is not enough and a real favicon.ico is shipped.
 *
 * Usage:
 *   node scripts/generate-favicons.mjs [--logo <url|path>] [--out <dir>]
 *
 * --logo defaults to the logo currently configured in the site settings
 * (VITE_API_URL or the production API). The generated files are committed, so
 * this script only needs to run when the brand artwork changes.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public');
const MARK_SVG = join(ROOT, 'public', 'favicon.svg');

const BRAND = {
  primary: '#123F3F',
  accent: '#C55A2A',
  surface: '#F4F1E9',
};

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { logo: null, out: OUT_DIR };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--logo') out.logo = args[++i];
    else if (args[i] === '--out') out.out = resolve(ROOT, args[++i]);
  }
  return out;
}

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'Chrome/Chromium not found. Set CHROME_PATH to the browser executable and retry.',
    );
  }
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Minimal CDP client: launch a headless browser and drive it over the DevTools protocol. */
async function launchBrowser() {
  // A dedicated profile in the OS temp dir; --remote-debugging-port=0 lets
  // Chrome pick a free port and report it through DevToolsActivePort.
  const userDataDir = join(tmpdir(), 'rml-favicon-chrome');
  rmSync(userDataDir, { recursive: true, force: true });
  mkdirSync(userDataDir, { recursive: true });
  const portFile = join(userDataDir, 'DevToolsActivePort');

  const chrome = spawn(
    findChrome(),
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${userDataDir}`,
      '--remote-debugging-port=0',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let wsUrl = null;
  for (let i = 0; i < 80 && !wsUrl; i++) {
    await sleep(250);
    if (!existsSync(portFile)) continue;
    const port = readFileSync(portFile, 'utf8').split('\n')[0]?.trim();
    if (!port) continue;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = await res.json();
      wsUrl = json.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
  }
  if (!wsUrl) throw new Error('Could not start headless Chrome');

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: ok, reject: fail } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? fail(new Error(JSON.stringify(msg.error))) : ok(msg.result);
    }
  };
  const send = (method, params = {}, sessionId) => {
    const msgId = ++id;
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
    });
  };

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (method, params) => send(method, params, sessionId);

  await S('Page.enable');
  await S('Emulation.setDefaultBackgroundColorOverride', {
    color: { r: 0, g: 0, b: 0, a: 0 },
  });

  return {
    async close() {
      ws.close();
      chrome.kill();
    },
    async screenshot(html, size) {
      await S('Emulation.setDeviceMetricsOverride', {
        width: size,
        height: size,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      await S('Page.navigate', { url });
      await sleep(400);
      const { data } = await S('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: size, height: size, scale: 1 },
      });
      return Buffer.from(data, 'base64');
    },
  };
}

async function resolveLogoSource(explicit) {
  if (explicit) {
    if (/^https?:\/\//.test(explicit)) return explicit;
    const path = isAbsolute(explicit) ? explicit : resolve(ROOT, explicit);
    if (!existsSync(path)) throw new Error(`Logo not found: ${path}`);
    return `data:image/png;base64,${readFileSync(path).toString('base64')}`;
  }

  const api = (process.env.VITE_API_URL || 'https://api.refugeemigrationlab.org').replace(/\/$/, '');
  try {
    const res = await fetch(`${api}/settings`);
    if (!res.ok) throw new Error(String(res.status));
    const settings = await res.json();
    if (settings.logoUrl) return settings.logoUrl;
  } catch (err) {
    console.warn(`[favicons] could not read site settings (${err.message}); using the vector mark.`);
  }
  return null;
}

function markHtml(svg, size) {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}</style></head>
<body><div style="width:${size}px;height:${size}px">${svg.replace(
    '<svg ',
    `<svg width="${size}" height="${size}" `,
  )}</div></body></html>`;
}

function wordmarkHtml(src, size) {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:${BRAND.primary}}
img{width:100%;height:100%;object-fit:contain;display:block}</style></head>
<body><img src="${src}" alt=""></body></html>`;
}

/** Packs PNG images into a single .ico container (PNG payloads are valid for Vista+). */
function packIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buffer)]);
}

async function main() {
  const args = parseArgs();
  mkdirSync(args.out, { recursive: true });

  const svg = readFileSync(MARK_SVG, 'utf8');
  const browser = await launchBrowser();

  try {
    // 1. The mark: square, in the sizes browsers and crawlers ask for.
    const markSizes = [16, 32, 48, 192, 512];
    const markPngs = new Map();
    for (const size of markSizes) {
      markPngs.set(size, await browser.screenshot(markHtml(svg, size), size));
      console.log(`[favicons] mark ${size}x${size}`);
    }

    // 2. The wordmark: padded to a square on the brand colour for home screens.
    const logoSrc = await resolveLogoSource(args.logo);
    const wordmarkSizes = [180, 192, 512];
    const wordmarkPngs = new Map();
    if (logoSrc) {
      for (const size of wordmarkSizes) {
        wordmarkPngs.set(size, await browser.screenshot(wordmarkHtml(logoSrc, size), size));
        console.log(`[favicons] wordmark ${size}x${size}`);
      }
    } else {
      console.warn('[favicons] no logo source; reusing the mark for the home-screen icons.');
    }

    // 3. Write the files.
    const written = [];
    const write = (name, buffer) => {
      writeFileSync(join(args.out, name), buffer);
      written.push(name);
    };

    write('favicon.ico', packIco([16, 32, 48].map((size) => ({ size, buffer: markPngs.get(size) }))));
    write('favicon-16.png', markPngs.get(16));
    write('favicon-32.png', markPngs.get(32));
    write('favicon-48.png', markPngs.get(48));
    write('icon-192.png', wordmarkPngs.get(192) ?? markPngs.get(192));
    write('icon-512.png', wordmarkPngs.get(512) ?? markPngs.get(512));
    write('apple-touch-icon.png', wordmarkPngs.get(180) ?? markPngs.get(192));

    write(
      'site.webmanifest',
      Buffer.from(
        `${JSON.stringify(
          {
            name: 'Refugee and Migration Lab',
            short_name: 'RML',
            description: 'Refugee and Migration Lab (RML) — an interdisciplinary research collective.',
            start_url: '/',
            display: 'standalone',
            background_color: BRAND.primary,
            theme_color: BRAND.primary,
            icons: [
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            ],
          },
          null,
          2,
        )}\n`,
        'utf8',
      ),
    );

    console.log(`[favicons] wrote ${written.length} files to ${args.out}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[favicons]', err.message);
  process.exit(1);
});
