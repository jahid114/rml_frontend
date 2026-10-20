// Per-route document metadata: title, description, canonical, Open Graph,
// Twitter cards and robots directives.
//
// The app renders client-side, so this is what crawlers and social scrapers
// read after the JS bundle runs. Every public route calls useDocumentMeta so
// no two pages share the same title/description/canonical.

import { useEffect, useMemo, useRef } from 'react';

export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://refugeemigrationlab.org'
).replace(/\/+$/, '');

export const SITE_NAME = 'Refugee and Migration Lab';
export const SITE_FULL_NAME = `${SITE_NAME} (RML)`;
export const SITE_SHORT_NAME = 'RML';
export const SITE_TAGLINE = 'Researching people and politics across borders.';
export const SITE_LOCALE = 'en_US';

export const DEFAULT_DESCRIPTION =
  'The Refugee and Migration Lab (RML) is an interdisciplinary research collective addressing forced displacement, migration, and refugee rights.';

/** Fallback social share card (1200x630). */
export const DEFAULT_IMAGE = `${SITE_URL}/images/site/og-default.jpg`;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  if (!path) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Canonical path for a route: strips the query string, the hash and any
 * trailing slash (except for the root), so /team/abc/ and /team/abc?x=1 both
 * canonicalise to /team/abc.
 */
export function canonicalPath(pathname: string): string {
  const clean = pathname.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return '/';
  return clean.replace(/\/+$/, '');
}

/** Trim a description to a search-snippet-friendly length on a word boundary. */
export function truncateDescription(text: string, max = 300): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** "Page title | Refugee and Migration Lab" — without duplicating the site name. */
export function fullTitle(title: string): string {
  const clean = title.trim();
  if (!clean) return SITE_NAME;
  // Already names the organisation (e.g. "Refugee and Migration Lab (RML)") —
  // appending the site name again would only add noise.
  if (clean.includes(SITE_NAME)) return clean;
  return `${clean} | ${SITE_NAME}`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_MARKER = 'data-seo-jsonld';

function clearJsonLd(): void {
  document.head.querySelectorAll(`script[${JSON_LD_MARKER}]`).forEach((el) => el.remove());
}

function applyJsonLd(data: unknown): void {
  clearJsonLd();
  const blocks = Array.isArray(data) ? data : [data];
  blocks.forEach((block) => {
    if (!block) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(JSON_LD_MARKER, '');
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  });
}

export interface DocumentMeta {
  /** Page title. The site name is appended automatically. */
  title: string;
  /** Meta description. */
  description?: string;
  /** Route path used for the canonical URL. Defaults to the current location. */
  path?: string;
  /** Absolute or site-relative social share image. */
  image?: string;
  /** Open Graph type: website, article, book, event, profile… */
  type?: string;
  /** Robots directive. Defaults to "index, follow". */
  robots?: string;
  /** One JSON-LD object, or an array of them. */
  jsonLd?: unknown;
  /** Publish/modified date surfaced as article:published_time. */
  publishedTime?: string;
}

/**
 * Apply document metadata for the lifetime of the calling component.
 * Re-runs whenever any field changes, so a route change swaps title,
 * description, canonical and JSON-LD in one commit.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  const {
    title,
    description,
    path,
    image,
    type = 'website',
    robots = 'index, follow',
    jsonLd,
    publishedTime,
  } = meta;

  const resolvedTitle = fullTitle(title);
  const resolvedDescription = truncateDescription(description || DEFAULT_DESCRIPTION);
  const resolvedPath = canonicalPath(
    path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const canonical = absoluteUrl(resolvedPath);
  const resolvedImage = image ? absoluteUrl(image) : DEFAULT_IMAGE;

  // The JSON-LD payload is rebuilt inline by callers on every render, so the
  // effect keys off its serialised form while the payload itself is kept in a
  // ref (a stable dependency for the linter and for the effect itself).
  const jsonLdKey = useMemo(() => (jsonLd ? JSON.stringify(jsonLd) : ''), [jsonLd]);
  const jsonLdRef = useRef(jsonLd);
  jsonLdRef.current = jsonLd;

  useEffect(() => {
    document.title = resolvedTitle;

    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('name', 'robots', robots);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', SITE_LOCALE);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', resolvedImage);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:image:alt', `${SITE_NAME} — ${SITE_TAGLINE}`);
    if (publishedTime) {
      upsertMeta('property', 'article:published_time', publishedTime);
    } else {
      document.head
        .querySelector('meta[property="article:published_time"]')
        ?.remove();
    }

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);
    upsertMeta('name', 'twitter:image', resolvedImage);

    upsertCanonical(canonical);

    if (jsonLdKey) applyJsonLd(jsonLdRef.current);
    else clearJsonLd();
  }, [
    resolvedTitle,
    resolvedDescription,
    canonical,
    resolvedImage,
    type,
    robots,
    publishedTime,
    jsonLdKey,
  ]);

  // On unmount, drop the JSON-LD block and restore the default robots
  // directive so a route without its own metadata never leaves a stale tag.
  useEffect(
    () => () => {
      clearJsonLd();
      upsertMeta('name', 'robots', 'index, follow');
    },
    []
  );
}
