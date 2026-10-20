// schema.org JSON-LD builders.
//
// Rich-text fields (bio, description, body) are HTML, which is invalid inside
// JSON-LD strings, so they are flattened to plain text first.

import type { Event, Person, Publication, ResearchTheme, SiteSettings } from './types';
import { absoluteUrl, SITE_NAME, SITE_TAGLINE, SITE_URL } from './seo';

function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function trim(text: string, max = 500): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function organizationNode(settings?: SiteSettings | null) {
  const node: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'RML',
    url: `${SITE_URL}/`,
    description: SITE_TAGLINE,
  };
  if (settings?.logoUrl) node.logo = absoluteUrl(settings.logoUrl);
  if (settings?.contactEmail) node.email = settings.contactEmail;
  if (settings?.socialLinks?.length) {
    node.sameAs = settings.socialLinks.map((s) => s.url);
  }
  return node;
}

export function organizationLd(settings?: SiteSettings | null) {
  return organizationNode(settings);
}

export function webSiteLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: 'RML',
    url: `${SITE_URL}/`,
    description: SITE_TAGLINE,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  };
}

export function personLd(person: Person) {
  const node: Record<string, unknown> = {
    '@type': 'Person',
    name: person.name,
    jobTitle: person.title,
    description: trim(stripHtml(person.bio), 500) || undefined,
    image: person.photoUrl ? absoluteUrl(person.photoUrl) : undefined,
    url: `${SITE_URL}/team/${person.slug}`,
    affiliation: {
      '@type': 'Organization',
      name: person.affiliation,
    },
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
  };
  if (person.secondaryAffiliation) {
    node.affiliation = [
      { '@type': 'Organization', name: person.affiliation },
      { '@type': 'Organization', name: person.secondaryAffiliation },
    ];
  }
  if (person.profileUrl) node.sameAs = person.profileUrl;
  return node;
}

const PUBLICATION_SCHEMA_TYPE: Record<Publication['type'], string> = {
  book: 'Book',
  'journal-article': 'ScholarlyArticle',
  'policy-paper': 'Report',
  chapter: 'Chapter',
};

export function publicationLd(pub: Publication) {
  return {
    '@type': PUBLICATION_SCHEMA_TYPE[pub.type] ?? 'CreativeWork',
    name: pub.title,
    headline: pub.title,
    description: trim(stripHtml(pub.description), 500),
    url: `${SITE_URL}/publications/${pub.slug}`,
    image: pub.coverImageUrl ? absoluteUrl(pub.coverImageUrl) : undefined,
    datePublished: String(pub.year),
    author: pub.authors.map((name) => ({ '@type': 'Person', name })),
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  };
}

const ATTENDANCE_MODE: Record<Event['eventFormat'], string> = {
  'in-person': 'https://schema.org/OfflineEventAttendanceMode',
  virtual: 'https://schema.org/OnlineEventAttendanceMode',
  hybrid: 'https://schema.org/MixedEventAttendanceMode',
};

export function eventLd(event: Event) {
  const eventUrl = `${SITE_URL}/events/${event.slug}`;
  const isPast = event.status === 'past';

  const location =
    event.eventFormat === 'virtual'
      ? {
          '@type': 'VirtualLocation',
          url: event.registrationUrl || eventUrl,
        }
      : event.eventFormat === 'hybrid'
        ? [
            { '@type': 'Place', name: 'Venue to be announced' },
            { '@type': 'VirtualLocation', url: event.registrationUrl || eventUrl },
          ]
        : { '@type': 'Place', name: 'Venue to be announced' };

  return {
    '@type': 'Event',
    name: event.title,
    description: trim(stripHtml(event.description), 500),
    url: eventUrl,
    image: event.coverImageUrl ? absoluteUrl(event.coverImageUrl) : undefined,
    startDate: event.startDateTimeUtc,
    eventStatus: isPast
      ? 'https://schema.org/EventCompleted'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: ATTENDANCE_MODE[event.eventFormat],
    location,
    organizer: {
      '@type': 'Organization',
      name: event.organizer || SITE_NAME,
      url: `${SITE_URL}/`,
    },
    ...(event.collaborators
      ? {
          collaborator: {
            '@type': 'Organization',
            name: event.collaborators,
          },
        }
      : {}),
    performer: event.panelists.map((p) => ({
      '@type': 'Person',
      name: p.name,
      image: p.photoUrl ? absoluteUrl(p.photoUrl) : undefined,
      ...(p.isModerator ? { jobTitle: 'Moderator' } : {}),
    })),
    inLanguage: 'en',
  };
}

export function researchThemeLd(theme: ResearchTheme) {
  return {
    '@type': 'ScholarlyArticle',
    headline: theme.title,
    name: theme.title,
    description: trim(stripHtml(theme.summary), 500),
    url: `${SITE_URL}/research/${theme.slug}`,
    image: theme.coverImageUrl ? absoluteUrl(theme.coverImageUrl) : undefined,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    inLanguage: 'en',
  };
}

export function collectionPageLd(name: string, path: string, description: string, items?: string[]) {
  return {
    '@type': 'CollectionPage',
    name,
    url: `${SITE_URL}${path}`,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(items?.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: items.map((url, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}${url}`,
            })),
          },
        }
      : {}),
  };
}

export function webPageLd(name: string, path: string, description: string) {
  return {
    '@type': 'WebPage',
    name,
    url: `${SITE_URL}${path}`,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    inLanguage: 'en',
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
