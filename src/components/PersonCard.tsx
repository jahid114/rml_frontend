import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import type { Person } from '@/lib/types';
import { OptimizedImage } from './ui/OptimizedImage';
import { Badge } from './ui/primitives';

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="group overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-cardhover">
      <Link to={`/team/${person.slug}`} className="block">
        <OptimizedImage
          src={person.photoUrl}
          alt={person.name}
          ratio="square"
          className="rounded-t-card"
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg leading-tight">{person.name}</h3>
        <p className="mt-0.5 text-sm font-medium text-accent">{person.title}</p>
        <p className="mt-1 text-sm text-ink-muted">{person.affiliation}</p>
        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/team/${person.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent"
          >
            View profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {person.profileUrl && (
            <a
              href={person.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-accent"
            >
              External <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function PersonCardWithStatus({ person }: { person: Person }) {
  return (
    <div className="relative">
      <PersonCard person={person} />
      {person.status === 'draft' && (
        <div className="absolute right-2 top-2">
          <Badge tone="warning">Draft</Badge>
        </div>
      )}
    </div>
  );
}
