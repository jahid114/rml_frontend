// One-time migration from the legacy hash router (#/about) to clean URLs
// (/about). The app previously used createHashRouter, so every public URL
// Google may have discovered looks like https://refugeemigrationlab.org/#/about.
//
// The fragment is never sent to the server, so this cannot be a 301 — it has
// to happen in the browser. history.replaceState (not location.replace) is used
// so the URL is rewritten synchronously without a second page load, and before
// createBrowserRouter reads window.location.
//
// Called from src/App.tsx before the router is created.

const LEGACY_HASH_PREFIX = '#/';

export function migrateLegacyHashUrl(): void {
  if (typeof window === 'undefined') return;

  const hash = window.location.hash;
  if (!hash.startsWith(LEGACY_HASH_PREFIX)) return;

  // '#/team?x=1' -> '/team?x=1'; '#/' -> '/'
  const path = hash.slice(LEGACY_HASH_PREFIX.length - 1) || '/';

  window.history.replaceState(window.history.state, '', path + window.location.search);
}
