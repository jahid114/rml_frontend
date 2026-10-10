// Publishes the About page content (including the 6 "What RML does" cards)
// to the pages-content API — no backend change needed. The public website
// and the admin panel both read this same API record, so they stay in sync.
//
// Usage:
//   node scripts/publish-about.mjs --api https://rml-api.shikhonmate.com --email you@example.org --password "secret"
//   # or via env: RML_API_URL, RML_ADMIN_EMAIL, RML_ADMIN_PASSWORD
//
// Requires Node 18+ (global fetch).

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq !== -1) {
      out[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        out[a.slice(2)] = next;
        i++;
      } else {
        out[a.slice(2)] = true;
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

const API_URL = (args.api ?? process.env.RML_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const identifier = args.email ?? args.identifier ?? process.env.RML_ADMIN_EMAIL ?? process.env.RML_ADMIN_IDENTIFIER;
const password = args.password ?? process.env.RML_ADMIN_PASSWORD;

if (!identifier || !password) {
  console.error(
    'Missing admin credentials.\n' +
      'Pass --email <address> --password <password> or set RML_ADMIN_EMAIL / RML_ADMIN_PASSWORD.'
  );
  process.exit(1);
}

const WORK_ITEMS = [
  { icon: 'Globe', label: 'Empirically grounded research', text: 'Conducting intensive and empirically grounded research' },
  { icon: 'Users', label: 'Scholarly collaboration', text: 'Building collaboration with refugee and migration scholars, schools and institutions' },
  { icon: 'GraduationCap', label: 'Training and education', text: 'Offering training, education and on forced displacement, refugee and migration studies' },
  { icon: 'Megaphone', label: 'Seminars and conferences', text: 'Organising seminar series, talks, symposiums, conferences, and workshops' },
  { icon: 'Scale', label: 'Publications', text: 'Publishing monographs, edited volumes, and policy papers on refugee and migration' },
  { icon: 'Users', label: 'Internships and visiting scholarships', text: 'Offering internships and visiting scholarships in forced displacement, refugee and migration studies' },
];

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const detail = typeof data?.error === 'string' && data.error ? `: ${data.error}` : '';
    throw new Error(`${method} ${path} failed (${res.status})${detail}`);
  }
  return data;
}

const login = await req('/auth/login', { method: 'POST', body: { identifier, password } }).catch((e) => {
  console.error(`Login failed. Check email/password and API URL (${API_URL}).\n${e.message}`);
  process.exit(1);
});
console.log(`Logged in as ${login.user?.email ?? identifier} (${login.user?.role ?? 'unknown role'}).`);

const current = await req('/pages/about', { token: login.token });
console.log(`Current about: ${Array.isArray(current?.whatWeDoItems) ? current.whatWeDoItems.length : 0} card(s).`);

const payload = {
  ...(current && typeof current === 'object' ? current : {}),
  whatWeDoKicker: 'What RML does',
  whatWeDoHeading: 'Our work in focus',
  whatWeDoIntro: 'The RML works on the following:',
  whatWeDoItems: WORK_ITEMS,
};

try {
  await req('/pages/about', { method: 'PUT', token: login.token, body: payload });
  console.log('Saved full About content (headings + 6 cards).');
} catch (e) {
  console.warn(`Full save failed (${e.message}). Retrying with legacy shape (cards only)…`);
  const { whatWeDoKicker, whatWeDoHeading, whatWeDoIntro, ...legacyPayload } = payload;
  await req('/pages/about', { method: 'PUT', token: login.token, body: legacyPayload });
  console.log(
    'Saved cards with legacy shape. NOTE: the backend rejected the section-heading ' +
      'fields — cards are live, headings fall back to defaults until the backend accepts them.'
  );
}

const verify = await req('/pages/about', { token: login.token });
const items = Array.isArray(verify?.whatWeDoItems) ? verify.whatWeDoItems : [];
console.log(`Verified: API now serves ${items.length} card(s):`);
for (const [i, it] of items.entries()) console.log(`  ${i + 1}. [${it.icon}] ${it.label} — ${it.text}`);
if (items.length !== WORK_ITEMS.length) {
  console.error(`Expected ${WORK_ITEMS.length} cards but API returned ${items.length}.`);
  process.exit(1);
}
console.log('Done. Website and admin panel now read the same 6 cards from the API.');
