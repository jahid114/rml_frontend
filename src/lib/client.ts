// Typed content-client service layer. Components and hooks call ONLY these
// functions, never fetch directly. Backed by the Hono REST API
// (VITE_API_URL); signatures match the old localStorage client so
// hooks/pages stay untouched.

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
  PageContentKey,
} from './types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined ?? 'http://localhost:3000').replace(/\/$/, '');

// Session storage key shared with the auth provider.
export const SESSION_KEY = 'rml_admin_session';

interface StoredSession {
  token: string;
  user: Omit<AdminUser, 'password'>;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const session = raw ? (JSON.parse(raw) as StoredSession | null) : null;
    return session?.token ?? null;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function api<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  if (res.status === 401) {
    // Token expired/revoked — drop the session so RequireAuth redirects to login.
    clearSession();
    try {
      window.dispatchEvent(new Event('rml:unauthorized'));
    } catch {
      /* ignore */
    }
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: unknown };
      if (typeof data?.error === 'string' && data.error) message = data.error;
    } catch {
      /* keep default */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Upload a file to object storage. Returns the created media row. */
export async function uploadMediaFile(file: File, altText: string, entity = 'media'): Promise<MediaItem> {
  const form = new FormData();
  form.append('file', file);
  form.append('altText', altText);
  form.append('entity', entity);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/media`, { method: 'POST', headers, body: form });
  if (res.status === 401) {
    clearSession();
    try {
      window.dispatchEvent(new Event('rml:unauthorized'));
    } catch {
      /* ignore */
    }
  }
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: unknown };
      if (typeof data?.error === 'string' && data.error) message = data.error;
    } catch {
      /* keep default */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as MediaItem;
}

// ---------- People ----------
export async function getPeople(): Promise<Person[]> {
  return api<Person[]>('/people');
}

export async function getPublishedPeople(): Promise<Person[]> {
  return api<Person[]>('/people/published');
}

export async function getPersonBySlug(slug: string): Promise<Person | null> {
  return getOrNull<Person>(`/people/${encodeURIComponent(slug)}`);
}

export async function createPerson(data: Omit<Person, 'id'>): Promise<Person> {
  return api<Person>('/people', 'POST', data);
}

export async function updatePerson(id: string, data: Partial<Person>): Promise<Person> {
  return api<Person>(`/people/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deletePerson(id: string): Promise<void> {
  await api<{ ok: true }>(`/people/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Publications ----------
export async function getPublications(): Promise<Publication[]> {
  return api<Publication[]>('/publications');
}

export async function getPublishedPublications(): Promise<Publication[]> {
  return api<Publication[]>('/publications/published');
}

export async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  return getOrNull<Publication>(`/publications/${encodeURIComponent(slug)}`);
}

export async function createPublication(data: Omit<Publication, 'id'>): Promise<Publication> {
  return api<Publication>('/publications', 'POST', data);
}

export async function updatePublication(id: string, data: Partial<Publication>): Promise<Publication> {
  return api<Publication>(`/publications/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deletePublication(id: string): Promise<void> {
  await api<{ ok: true }>(`/publications/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Events ----------
export async function getEvents(): Promise<Event[]> {
  return api<Event[]>('/events');
}

export async function getUpcomingEvents(): Promise<Event[]> {
  return api<Event[]>('/events/upcoming');
}

export async function getPublishedEvents(): Promise<Event[]> {
  return api<Event[]>('/events/published');
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return getOrNull<Event>(`/events/${encodeURIComponent(slug)}`);
}

export async function createEvent(data: Omit<Event, 'id'>): Promise<Event> {
  return api<Event>('/events', 'POST', data);
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<Event> {
  return api<Event>(`/events/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deleteEvent(id: string): Promise<void> {
  await api<{ ok: true }>(`/events/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Jobs ----------
export async function getJobs(): Promise<JobOpening[]> {
  return api<JobOpening[]>('/jobs');
}

export async function getOpenJobs(): Promise<JobOpening[]> {
  return api<JobOpening[]>('/jobs/open');
}

export async function getFeaturedJob(): Promise<JobOpening | null> {
  return api<JobOpening | null>('/jobs/featured');
}

export async function createJob(data: Omit<JobOpening, 'id'>): Promise<JobOpening> {
  return api<JobOpening>('/jobs', 'POST', data);
}

export async function updateJob(id: string, data: Partial<JobOpening>): Promise<JobOpening> {
  return api<JobOpening>(`/jobs/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deleteJob(id: string): Promise<void> {
  await api<{ ok: true }>(`/jobs/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Research themes ----------
export async function getResearchThemes(): Promise<ResearchTheme[]> {
  return api<ResearchTheme[]>('/themes');
}

export async function getResearchThemeBySlug(slug: string): Promise<ResearchTheme | null> {
  return getOrNull<ResearchTheme>(`/themes/${encodeURIComponent(slug)}`);
}

export async function createResearchTheme(data: Omit<ResearchTheme, 'id'>): Promise<ResearchTheme> {
  return api<ResearchTheme>('/themes', 'POST', data);
}

export async function updateResearchTheme(id: string, data: Partial<ResearchTheme>): Promise<ResearchTheme> {
  return api<ResearchTheme>(`/themes/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deleteResearchTheme(id: string): Promise<void> {
  await api<{ ok: true }>(`/themes/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Page content ----------
export async function getPageContent(key: PageContentKey): Promise<unknown> {
  return api<unknown>(`/pages/${encodeURIComponent(key)}`);
}

export async function updatePageContent(key: PageContentKey, data: unknown): Promise<unknown> {
  return api<unknown>(`/pages/${encodeURIComponent(key)}`, 'PUT', data);
}

// ---------- Settings ----------
export async function getSiteSettings(): Promise<SiteSettings> {
  return api<SiteSettings>('/settings');
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  return api<SiteSettings>('/settings', 'PUT', data);
}

// ---------- Media ----------
// NOTE: data URLs are no longer stored. Upload files via uploadMediaFile()
// (multipart → object storage); use createMedia only to link an external URL.
export async function getMedia(): Promise<MediaItem[]> {
  return api<MediaItem[]>('/media');
}

export async function createMedia(data: Omit<MediaItem, 'id'>): Promise<MediaItem> {
  return api<MediaItem>('/media', 'POST', data);
}

export async function updateMedia(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
  return api<MediaItem>(`/media/${encodeURIComponent(id)}`, 'PATCH', data);
}

export async function deleteMedia(id: string): Promise<void> {
  await api<{ ok: true }>(`/media/${encodeURIComponent(id)}`, 'DELETE');
}

// ---------- Users ----------
// The API never returns password hashes. Callers needing AdminUser shape get
// password: '' (forms collect passwords via their own inputs).
function withPasswordBlank(u: Omit<AdminUser, 'password'>): AdminUser {
  return { ...u, password: '' };
}

export async function getUsers(): Promise<AdminUser[]> {
  const users = await api<Omit<AdminUser, 'password'>[]>('/users');
  return users.map(withPasswordBlank);
}

export async function createUser(data: Omit<AdminUser, 'id'>): Promise<AdminUser> {
  const created = await api<Omit<AdminUser, 'password'>>('/users', 'POST', data);
  return withPasswordBlank(created);
}

export async function updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
  const updated = await api<Omit<AdminUser, 'password'>>(`/users/${encodeURIComponent(id)}`, 'PATCH', data);
  return withPasswordBlank(updated);
}

export async function deleteUser(id: string): Promise<void> {
  await api<{ ok: true }>(`/users/${encodeURIComponent(id)}`, 'DELETE');
}

export async function loginAdmin(identifier: string, password: string): Promise<AdminUser | null> {
  try {
    const res = await api<{ token: string; user: Omit<AdminUser, 'password'> }>('/auth/login', 'POST', {
      identifier,
      password,
    });
    void res.token; // token is persisted by the auth provider, not here
    return withPasswordBlank(res.user);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

// ---------- Activity ----------
export async function getActivity(): Promise<ActivityLogEntry[]> {
  return api<ActivityLogEntry[]>('/activity');
}

// ---------- Contact ("Send us a note", public, no token needed) ----------
export interface ContactNote {
  name: string;
  email: string;
  message: string;
}

export async function sendContactNote(data: ContactNote): Promise<void> {
  await api<{ ok: true }>('/contact', 'POST', data);
}
