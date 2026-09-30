import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Video, MapPin } from 'lucide-react';
import type { Event } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { OptimizedImage } from './ui/OptimizedImage';
import { Badge } from './ui/primitives';

const FORMAT_LABEL: Record<Event['eventFormat'], string> = {
  'in-person': 'In-person',
  virtual: 'Virtual',
  hybrid: 'Hybrid',
};

export function EventCard({ event }: { event: Event }) {
  const date = new Date(event.startDateTimeUtc);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const isPast = event.status === 'past';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-cardhover">
      <Link to={`/events/${event.slug}`} className="relative block">
        <OptimizedImage
          src={event.coverImageUrl}
          alt={event.title}
          ratio="16/9"
          className="rounded-t-card"
        />
        <div className="absolute left-3 top-3 flex h-14 w-14 flex-col items-center justify-center rounded-md bg-white shadow-card">
          <span className="text-lg font-bold leading-none text-primary">{day}</span>
          <span className="text-xs font-medium uppercase text-accent">{month}</span>
        </div>
        <div className="absolute right-3 top-3">
          <Badge tone={isPast ? 'neutral' : 'accent'}>
            {isPast ? 'Past' : 'Upcoming'}
          </Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(event.startDateTimeUtc)}
          </span>
        </div>
        <h3 className="text-base leading-snug">{event.title}</h3>
        <p className="mt-1 text-sm font-medium text-accent">{event.theme}</p>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{event.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone="neutral">
            <span className="inline-flex items-center gap-1">
              {event.eventFormat === 'virtual' ? (
                <Video className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {FORMAT_LABEL[event.eventFormat]}
            </span>
          </Badge>
        </div>
        <Link
          to={`/events/${event.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent"
        >
          {isPast ? 'View recap' : 'View details'} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
