// Small utility helpers.

import type { AboutContent, HomeContent, ProgrammePageContent } from './types';
import { seedAboutContent, seedHomeContent, seedInternshipContent, seedVisitingContent } from './seed';

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// WCAG AA contrast ratio check between two hex colors.
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// Sanitize HTML from the rich text editor. Strips script/style/event handlers.
export function sanitizeHtml(html: string): string {  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed').forEach((el) => el.remove());
  // Legacy <font> tags (Word/paste junk) carry size/color — unwrap them so
  // text falls back to the site scale instead of rendering at odd sizes.
  doc.querySelectorAll('font').forEach((el) => el.replaceWith(...Array.from(el.childNodes)));
  doc.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      // Inline styles (mostly Word-paste font-size/font-family junk) would
      // override the site type scale — drop them. Editor-controlled sizing
      // uses data-size spans, which are preserved.
      if (attr.name === 'style') el.removeAttribute(attr.name);
      if (attr.name === 'href' && /^\s*javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

/** True when editor HTML has no visible text (e.g. Tiptap's empty `<p></p>`). */
export function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
}

// Normalize home page content from the API: backfill missing fields from seed
// defaults and convert the legacy flat-slide shape to heroSlides.
export function normalizeHomeContent(raw: unknown): HomeContent {
  const fallback = seedHomeContent;
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;
  // New shape: heroSlides array present — merge over seed defaults.
  if (Array.isArray(r.heroSlides)) {
    return {
      ...fallback,
      ...(r as unknown as Partial<HomeContent>),
      heroSlides:
        (r.heroSlides as HomeContent['heroSlides']).length > 0
          ? (r.heroSlides as HomeContent['heroSlides'])
          : fallback.heroSlides,
      includeEventSlide:
        typeof r.includeEventSlide === 'boolean' ? r.includeEventSlide : fallback.includeEventSlide,
    };
  }
  // Legacy shape (flat slide 1 + slide 2 fields) → convert to heroSlides.
  const legacy = r as Record<string, string>;
  if (typeof legacy.heroHeading === 'string' || typeof legacy.secondarySlideTitle === 'string') {
    return {
      ...(fallback as HomeContent),
      ...(r as unknown as Partial<HomeContent>),
      heroSlides: [
        {
          imageUrl: legacy.heroImageUrl || fallback.heroSlides[0].imageUrl,
          eyebrow: legacy.heroEyebrow || fallback.heroSlides[0].eyebrow,
          title: legacy.heroHeading || fallback.heroSlides[0].title,
          description: legacy.heroSubhead || fallback.heroSlides[0].description,
          ctaLabel: legacy.heroCtaLabel || fallback.heroSlides[0].ctaLabel,
          ctaUrl: legacy.heroCtaUrl || fallback.heroSlides[0].ctaUrl,
        },
        {
          imageUrl: legacy.secondarySlideImageUrl || fallback.heroSlides[1].imageUrl,
          eyebrow: legacy.secondarySlideEyebrow || fallback.heroSlides[1].eyebrow,
          title: legacy.secondarySlideTitle || fallback.heroSlides[1].title,
          description: legacy.secondarySlideDescription || fallback.heroSlides[1].description,
          ctaLabel: legacy.secondarySlideCtaLabel || fallback.heroSlides[1].ctaLabel,
          ctaUrl: legacy.secondarySlideCtaUrl || fallback.heroSlides[1].ctaUrl,
        },
      ],
      includeEventSlide: true,
    } as HomeContent;
  }
  return { ...fallback, ...(r as unknown as Partial<HomeContent>) };
}

// Normalize programme page content (internship / visiting-fellowship):
// backfill missing fields from seed defaults so the public page and the
// admin editor never crash on partial API payloads.
export function normalizeProgrammeContent(
  raw: unknown,
  pageKey: 'internship' | 'visiting-fellowship',
): ProgrammePageContent {
  const fallback = pageKey === 'internship' ? seedInternshipContent : seedVisitingContent;
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<ProgrammePageContent>;
  return {
    slug: pageKey,
    heroImageUrl: typeof r.heroImageUrl === 'string' ? r.heroImageUrl : fallback.heroImageUrl,
    overviewText:
      typeof r.overviewText === 'string' && r.overviewText ? r.overviewText : fallback.overviewText,
    eligibilityItems:
      Array.isArray(r.eligibilityItems) && r.eligibilityItems.length > 0
        ? r.eligibilityItems
        : [...fallback.eligibilityItems],
    howToApplySteps:
      Array.isArray(r.howToApplySteps) && r.howToApplySteps.length > 0
        ? r.howToApplySteps
        : [...fallback.howToApplySteps],
    ctaLabel: typeof r.ctaLabel === 'string' && r.ctaLabel ? r.ctaLabel : fallback.ctaLabel,
    ctaUrl: typeof r.ctaUrl === 'string' && r.ctaUrl ? r.ctaUrl : fallback.ctaUrl,
    seoTitle: typeof r.seoTitle === 'string' ? r.seoTitle : fallback.seoTitle,
    seoDescription: typeof r.seoDescription === 'string' ? r.seoDescription : fallback.seoDescription,
  };
}

// Normalize about page content: backfill missing fields from seed defaults so
// the public page and the admin editor never crash on partial API payloads
// (e.g. payloads saved before the "What RML does" heading fields existed).
export function normalizeAboutContent(raw: unknown): AboutContent {
  const fallback = seedAboutContent;
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<AboutContent>;
  const text = (v: unknown, fb: string) => (typeof v === 'string' && v ? v : fb);
  return {
    heroImageUrl: text(r.heroImageUrl, fallback.heroImageUrl),
    introText: text(r.introText, fallback.introText),
    missionText: text(r.missionText, fallback.missionText),
    whatWeDoKicker: text(r.whatWeDoKicker, fallback.whatWeDoKicker ?? ''),
    whatWeDoHeading: text(r.whatWeDoHeading, fallback.whatWeDoHeading ?? ''),
    whatWeDoIntro: text(r.whatWeDoIntro, fallback.whatWeDoIntro ?? ''),
    whatWeDoItems:
      Array.isArray(r.whatWeDoItems) && r.whatWeDoItems.length > 0
        ? r.whatWeDoItems
        : [...fallback.whatWeDoItems],
    seoTitle: typeof r.seoTitle === 'string' ? r.seoTitle : fallback.seoTitle,
    seoDescription: typeof r.seoDescription === 'string' ? r.seoDescription : fallback.seoDescription,
  };
}
