import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as client from './client';
import { useTheme } from './theme';
import type {
  Person,
  Publication,
  Event,
  JobOpening,
  ResearchTheme,
  SiteSettings,
  MediaItem,
  AdminUser,
  ActivityLogEntry,
  HomeContent,
  AboutContent,
  ProgrammePageContent,
  ContactContent,
  PageContentKey,
} from './types';

const KEYS = {
  people: ['people'] as const,
  peoplePublished: ['people', 'published'] as const,
  publications: ['publications'] as const,
  publicationsPublished: ['publications', 'published'] as const,
  events: ['events'] as const,
  eventsUpcoming: ['events', 'upcoming'] as const,
  eventsPublished: ['events', 'published'] as const,
  jobs: ['jobs'] as const,
  jobsOpen: ['jobs', 'open'] as const,
  jobsFeatured: ['jobs', 'featured'] as const,
  research: ['research'] as const,
  media: ['media'] as const,
  settings: ['settings'] as const,
  users: ['users'] as const,
  activity: ['activity'] as const,
  page: (k: PageContentKey) => ['page', k] as const,
};

// ---------- People ----------
export function usePeople() {
  return useQuery<Person[]>({ queryKey: KEYS.people, queryFn: client.getPeople });
}
export function usePublishedPeople() {
  return useQuery<Person[]>({
    queryKey: KEYS.peoplePublished,
    queryFn: client.getPublishedPeople,
  });
}
export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Person, 'id'>) => client.createPerson(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.people });
      qc.invalidateQueries({ queryKey: KEYS.peoplePublished });
    },
  });
}
export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Person> }) =>
      client.updatePerson(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.people });
      qc.invalidateQueries({ queryKey: KEYS.peoplePublished });
    },
  });
}
export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deletePerson(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.people });
      qc.invalidateQueries({ queryKey: KEYS.peoplePublished });
    },
  });
}

// ---------- Publications ----------
export function usePublications() {
  return useQuery<Publication[]>({ queryKey: KEYS.publications, queryFn: client.getPublications });
}
export function usePublishedPublications() {
  return useQuery<Publication[]>({
    queryKey: KEYS.publicationsPublished,
    queryFn: client.getPublishedPublications,
  });
}
export function useCreatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Publication, 'id'>) => client.createPublication(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.publications });
      qc.invalidateQueries({ queryKey: KEYS.publicationsPublished });
    },
  });
}
export function useUpdatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Publication> }) =>
      client.updatePublication(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.publications });
      qc.invalidateQueries({ queryKey: KEYS.publicationsPublished });
    },
  });
}
export function useDeletePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deletePublication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.publications });
      qc.invalidateQueries({ queryKey: KEYS.publicationsPublished });
    },
  });
}

// ---------- Events ----------
export function useEvents() {
  return useQuery<Event[]>({ queryKey: KEYS.events, queryFn: client.getEvents });
}
export function useUpcomingEvents() {
  return useQuery<Event[]>({ queryKey: KEYS.eventsUpcoming, queryFn: client.getUpcomingEvents });
}
export function usePublishedEvents() {
  return useQuery<Event[]>({ queryKey: KEYS.eventsPublished, queryFn: client.getPublishedEvents });
}
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Event, 'id'>) => client.createEvent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.events });
      qc.invalidateQueries({ queryKey: KEYS.eventsUpcoming });
      qc.invalidateQueries({ queryKey: KEYS.eventsPublished });
    },
  });
}
export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      client.updateEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.events });
      qc.invalidateQueries({ queryKey: KEYS.eventsUpcoming });
      qc.invalidateQueries({ queryKey: KEYS.eventsPublished });
    },
  });
}
export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.events });
      qc.invalidateQueries({ queryKey: KEYS.eventsUpcoming });
      qc.invalidateQueries({ queryKey: KEYS.eventsPublished });
    },
  });
}

// ---------- Jobs ----------
export function useJobs() {
  return useQuery<JobOpening[]>({ queryKey: KEYS.jobs, queryFn: client.getJobs });
}
export function useOpenJobs() {
  return useQuery<JobOpening[]>({ queryKey: KEYS.jobsOpen, queryFn: client.getOpenJobs });
}
export function useFeaturedJob() {
  return useQuery<JobOpening | null>({
    queryKey: KEYS.jobsFeatured,
    queryFn: client.getFeaturedJob,
  });
}
export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<JobOpening, 'id'>) => client.createJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.jobs });
      qc.invalidateQueries({ queryKey: KEYS.jobsOpen });
      qc.invalidateQueries({ queryKey: KEYS.jobsFeatured });
    },
  });
}
export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobOpening> }) =>
      client.updateJob(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.jobs });
      qc.invalidateQueries({ queryKey: KEYS.jobsOpen });
      qc.invalidateQueries({ queryKey: KEYS.jobsFeatured });
    },
  });
}
export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.jobs });
      qc.invalidateQueries({ queryKey: KEYS.jobsOpen });
      qc.invalidateQueries({ queryKey: KEYS.jobsFeatured });
    },
  });
}

// ---------- Research ----------
export function useResearchThemes() {
  return useQuery<ResearchTheme[]>({ queryKey: KEYS.research, queryFn: client.getResearchThemes });
}
export function useCreateResearchTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ResearchTheme, 'id'>) => client.createResearchTheme(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.research }),
  });
}
export function useUpdateResearchTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResearchTheme> }) =>
      client.updateResearchTheme(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.research }),
  });
}
export function useDeleteResearchTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteResearchTheme(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.research }),
  });
}

// ---------- Brand colors ----------

function hexToRgb(hex: string): string | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const h = m[1];
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
}

// Applies the brand colors from site settings to CSS variables,
// following the active theme mode (light/dark). Invalid values are ignored.
export function useApplyBrandColors() {
  const { theme } = useTheme();
  const { data: settings } = useSiteSettings();
  useEffect(() => {
    if (!settings) return;
    const dark = theme === 'dark';
    const primary = hexToRgb(dark ? settings.primaryColorDark || settings.primaryColor : settings.primaryColor);
    const accent = hexToRgb(dark ? settings.accentColorDark || settings.accentColor : settings.accentColor);
    // NOTE: --color-canvas is consumed as a raw color (not wrapped in rgb()),
    // so it must be written as hex — an "r g b" triplet would invalidate every bg-canvas surface.
    const rawBackground = dark ? settings.backgroundColorDark || settings.backgroundColor : settings.backgroundColor;
    const background = /^#[0-9a-fA-F]{6}$/.test(rawBackground.trim()) ? rawBackground.trim() : null;
    const root = document.documentElement;
    if (primary) root.style.setProperty('--color-primary', primary);
    if (accent) root.style.setProperty('--color-accent', accent);
    if (background) root.style.setProperty('--color-canvas', background);
  }, [settings, theme]);
}

// ---------- Favicon ----------

function imageTypeFor(url: string): string | null {
  const ext = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'ico': return 'image/x-icon';
    case 'svg': return 'image/svg+xml';
    default: return null;
  }
}

/**
 * Applies the favicon configured in the site settings to the home-screen icon
 * (apple-touch-icon).
 *
 * The `rel="icon"` links are deliberately left static on /favicon.ico: Google
 * allows only one favicon per hostname and requires a stable URL, so a CMS
 * asset that changes on every upload must not take over the site icon that
 * appears in search results. The PWA manifest keeps pointing at the static,
 * generated wordmark icons.
 */
export function useApplyFavicon() {
  const { data: settings } = useSiteSettings();
  const faviconUrl = settings?.faviconUrl;
  useEffect(() => {
    if (!faviconUrl) return;
    const type = imageTypeFor(faviconUrl);

    let touchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!touchIcon) {
      touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(touchIcon);
    }
    touchIcon.href = faviconUrl;
    if (type) touchIcon.type = type;
    touchIcon.sizes = '180x180';
  }, [faviconUrl]);
}

// ---------- Page content ----------
export function usePageContent<T>(key: PageContentKey) {
  return useQuery<T>({ queryKey: KEYS.page(key), queryFn: () => client.getPageContent(key) as Promise<T> });
}
export function useUpdatePageContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: PageContentKey; data: unknown }) =>
      client.updatePageContent(key, data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: KEYS.page(vars.key) }),
  });
}

// ---------- Settings ----------
export function useSiteSettings() {
  return useQuery<SiteSettings>({ queryKey: KEYS.settings, queryFn: client.getSiteSettings });
}
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteSettings>) => client.updateSiteSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.settings }),
  });
}

// ---------- Media ----------
export function useMedia() {
  return useQuery<MediaItem[]>({ queryKey: KEYS.media, queryFn: client.getMedia });
}
export function useCreateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MediaItem, 'id'>) => client.createMedia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.media }),
  });
}
export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaItem> }) =>
      client.updateMedia(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.media }),
  });
}
export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteMedia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.media }),
  });
}

// ---------- Users ----------
export function useUsers() {
  return useQuery<AdminUser[]>({ queryKey: KEYS.users, queryFn: client.getUsers });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminUser, 'id'>) => client.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.users }),
  });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      client.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.users }),
  });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.users }),
  });
}

// ---------- Activity ----------
export function useActivity() {
  return useQuery<ActivityLogEntry[]>({ queryKey: KEYS.activity, queryFn: client.getActivity });
}

// Re-export the page-content type-aware hooks for convenience.
export function useHomeContent() {
  return usePageContent<HomeContent>('home');
}
export function useAboutContent() {
  return usePageContent<AboutContent>('about');
}
export function useInternshipContent() {
  return usePageContent<ProgrammePageContent>('internship');
}
export function useVisitingContent() {
  return usePageContent<ProgrammePageContent>('visiting-fellowship');
}
export function useContactContent() {
  return usePageContent<ContactContent>('contact');
}
