import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import type { PublicationType } from '@/lib/types';
import { PUBLICATION_TYPE_LABELS } from '@/lib/types';
import { usePublishedPublications } from '@/lib/hooks';
import { PublicationCard } from '@/components/PublicationCard';
import { Hero } from '@/components/Hero';
import { EmptyState, Skeleton, Badge, DetailHeader } from '@/components/ui/primitives';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { RichText } from '@/components/ui/RichText';

const HERO_IMAGE =
  '/images/site/hero-rohingya-camps.jpg';

const FILTERS: { key: PublicationType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'book', label: 'Books' },
  { key: 'journal-article', label: 'Journal Articles' },
  { key: 'policy-paper', label: 'Policy Papers' },
  { key: 'chapter', label: 'Chapters' },
];

export function PublicationsPage() {
  const { data: pubs, isLoading } = usePublishedPublications();
  const [filter, setFilter] = useState<PublicationType | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filtered = useMemo(() => {
    if (!pubs) return [];
    let list = filter === 'all' ? pubs : pubs.filter((p) => p.type === filter);
    list = [...list].sort((a, b) =>
      sort === 'newest' ? b.year - a.year : a.year - b.year
    );
    return list;
  }, [pubs, filter, sort]);

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        eyebrow="Publications"
        heading="Publications"
        subhead="Books, articles, policy papers, and chapters from RML researchers."
      />
      <div className="container-content py-12 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
                    : 'rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-primary'
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
            aria-label="Sort publications"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No publications found" description="Try a different filter." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <PublicationCard key={p.id} pub={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function PublicationDetailPage() {
  const { slug } = useParams();
  const { data: pubs } = usePublishedPublications();
  const pub = pubs?.find((p) => p.slug === slug);

  if (!pubs) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="container-content py-20">
        <EmptyState
          title="Publication not found"
          action={<Link to="/publications" className="text-accent underline">Back to publications</Link>}
        />
      </div>
    );
  }

  return (
    <>
      <div className="container-content py-12 lg:py-16">
        <Link to="/publications" className="mb-8 inline-flex items-center gap-1 text-sm text-primary hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> All publications
        </Link>
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <OptimizedImage src={pub.coverImageUrl} alt={`Cover of ${pub.title}`} ratio="2/3" className="rounded-card shadow-card" />
            <div className="mt-4 space-y-2">
              <Badge tone="accent">{PUBLICATION_TYPE_LABELS[pub.type]}</Badge>
              <p className="text-sm text-ink-muted">Published {pub.year}</p>
              {pub.externalUrl.trim() && (
                <a
                  href={pub.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                >
                  View / purchase <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <DetailHeader title={pub.title} sub={pub.authors.join(', ')} subTone="accent" />
            <div className="mt-6">
              <RichText html={pub.description} className="max-w-none" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
