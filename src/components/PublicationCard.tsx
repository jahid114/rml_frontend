import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Publication } from '@/lib/types';
import { PUBLICATION_TYPE_LABELS } from '@/lib/types';
import { OptimizedImage } from './ui/OptimizedImage';
import { Badge } from './ui/primitives';

export function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-cardhover">
      <Link to={`/publications/${pub.slug}`} className="block">
        <OptimizedImage
          src={pub.coverImageUrl}
          alt={`Cover of ${pub.title}`}
          ratio="2/3"
          className="rounded-t-card"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="accent">{PUBLICATION_TYPE_LABELS[pub.type]}</Badge>
          <span className="text-xs text-ink-muted">{pub.year}</span>
        </div>
        <h3 className="text-base leading-snug">{pub.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{pub.authors.join(', ')}</p>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{pub.description}</p>
        <Link
          to={`/publications/${pub.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent"
        >
          Read more <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
