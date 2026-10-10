import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, ExternalLink, ArrowLeft, Users } from 'lucide-react';
import type { Event } from '@/lib/types';
import { usePublishedEvents } from '@/lib/hooks';
import { EventCard } from '@/components/EventCard';
import { Hero } from '@/components/Hero';
import { SectionHeading, EmptyState, Skeleton, Badge, DetailHeader } from '@/components/ui/primitives';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { RichText } from '@/components/ui/RichText';
import { formatDate } from '@/lib/utils';

const HERO_IMAGE =
  '/images/site/hero-rohingya-camps.jpg';

const FORMAT_LABEL: Record<Event['eventFormat'], string> = {
  'in-person': 'In-person',
  virtual: 'Virtual',
  hybrid: 'Hybrid',
};

export function EventsPage() {
  const { data: events, isLoading } = usePublishedEvents();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = useMemo(() => {
    if (!events) return [];
    return Array.from(
      new Set(events.map((e) => new Date(e.startDateTimeUtc).getUTCFullYear()))
    ).sort((a, b) => b - a);
  }, [events]);

  const filtered = useMemo(() => {
    if (!events) return [];
    return events
      .filter((e) => e.status === tab)
      .filter((e) => yearFilter === 'all' || new Date(e.startDateTimeUtc).getUTCFullYear().toString() === yearFilter)
      .sort((a, b) =>
        tab === 'upcoming'
          ? new Date(a.startDateTimeUtc).getTime() - new Date(b.startDateTimeUtc).getTime()
          : new Date(b.startDateTimeUtc).getTime() - new Date(a.startDateTimeUtc).getTime()
      );
  }, [events, tab, yearFilter]);

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        eyebrow="Events & News"
        heading="Events & News"
        subhead="Panel discussions, seminars, and commemorations convened by RML."
      />
      <div className="container-content py-12 lg:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('upcoming')}
              className={
                tab === 'upcoming'
                  ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-primary'
              }
            >
              Upcoming
            </button>
            <button
              onClick={() => setTab('past')}
              className={
                tab === 'past'
                  ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-primary'
              }
            >
              Past
            </button>
          </div>
          {tab === 'past' && years.length > 0 && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-md border border-line bg-white px-3 py-2 text-sm"
              aria-label="Filter by year"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            description={tab === 'upcoming' ? 'Check back soon for new RML events.' : undefined}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function EventDetailPage() {
  const { slug } = useParams();
  const { data: events } = usePublishedEvents();
  const event = events?.find((e) => e.slug === slug);

  if (!events) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-content py-20">
        <EmptyState
          title="Event not found"
          action={<Link to="/events" className="text-accent underline">Back to events</Link>}
        />
      </div>
    );
  }

  const isPast = event.status === 'past';
  const moderator = event.panelists.find((p) => p.isModerator);

  return (
    <>
      <div className="container-content pt-8 lg:pt-12">
        <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> All events
        </Link>

        {/* Cover image on top — full-width 16:9, no overlaid text */}
        <div className="overflow-hidden rounded-card shadow-card">
          <OptimizedImage
            src={event.coverImageUrl}
            alt={event.title}
            ratio="16/9"
            priority
            className="w-full"
          />
        </div>

        {/* Header separated out below the image, before the description */}
        <DetailHeader
          eyebrow={
            <div className="flex flex-wrap gap-2">
              <Badge tone={isPast ? 'neutral' : 'accentSolid'}>
                {isPast ? 'Past event' : 'Upcoming'}
              </Badge>
              <Badge tone="neutral">
                <span className="inline-flex items-center gap-1">
                  {event.eventFormat === 'virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {FORMAT_LABEL[event.eventFormat]}
                </span>
              </Badge>
            </div>
          }
          title={event.title}
          sub={event.theme}
        />
      </div>

      <div className="container-content py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div>
              <RichText html={event.description} className="max-w-none" />
            </div>

            {/* Panelists */}
            {event.panelists.length > 0 && (
              <section className="mt-12">
                <SectionHeading eyebrow="Speakers" title="Panelists" />
                {moderator && (
                  <p className="mt-3 text-sm text-ink-muted">
                    Moderated by <span className="font-medium text-ink">{moderator.name}</span>
                  </p>
                )}
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {event.panelists.map((p) => (
                    <div key={p.id} className="rounded-card bg-white p-4 shadow-card">
                      {p.photoUrl && (
                        <OptimizedImage
                          src={p.photoUrl}
                          alt={p.name}
                          ratio="square"
                          className="mb-3 w-24 rounded-full"
                        />
                      )}
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.isModerator && <Badge tone="accent">Moderator</Badge>}
                      <p className="mt-2 text-sm text-ink-soft">{p.bio}</p>
                      {p.profileUrl && (
                        <a
                          href={p.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          Profile <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-white p-6 shadow-card">
              <h2 className="text-lg">When &amp; where</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{formatDate(event.startDateTimeUtc)}</span>
                </div>
                {event.timezoneLabels.map((tz, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-accent" />
                    <span>
                      <span className="font-medium">{tz.label}:</span> {tz.time}
                    </span>
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{FORMAT_LABEL[event.eventFormat]}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 text-accent" />
                  <span>Organized by {event.organizer}</span>
                </div>
                {event.collaborators && (
                  <p className="text-ink-muted">In collaboration with {event.collaborators}</p>
                )}
              </div>

              {isPast ? (
                event.recordingUrl && (
                  <a
                    href={event.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                  >
                    <Video className="h-4 w-4" /> Watch recording
                  </a>
                )
              ) : (
                event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                  >
                    Register now <ExternalLink className="h-4 w-4" />
                  </a>
                )
              )}

              {event.socialLinks && event.socialLinks.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-xs uppercase tracking-wider text-ink-muted">Follow live on</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.socialLinks.map((s) => (
                      <a
                        key={s.platform + s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-accent hover:text-accent"
                      >
                        {s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
