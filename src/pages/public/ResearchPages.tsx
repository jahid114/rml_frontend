import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePublishedPublications, useResearchThemes, usePublishedPeople } from '@/lib/hooks';
import { PublicationCard } from '@/components/PublicationCard';
import { Hero } from '@/components/Hero';
import { SectionHeading, EmptyState, Skeleton, DetailHeader, Eyebrow } from '@/components/ui/primitives';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { RichText } from '@/components/ui/RichText';
import { useDocumentMeta } from '@/lib/seo';
import { collectionPageLd, researchThemeLd } from '@/lib/jsonld';

const RESEARCH_IMAGE =
  '/images/site/hero-humanitarian-aid.jpg';

const RESEARCH_DESCRIPTION =
  'RML organizes its work into interdisciplinary research streams addressing forced displacement, rights, and climate mobility.';

export function ResearchPage() {
  const { data: themes, isLoading } = useResearchThemes();

  useDocumentMeta({
    title: 'Research',
    description: RESEARCH_DESCRIPTION,
    path: '/research',
    jsonLd: collectionPageLd(
      'Research',
      '/research',
      RESEARCH_DESCRIPTION,
      themes?.map((t) => `/research/${t.slug}`)
    ),
  });

  return (
    <>
      <Hero
        image={RESEARCH_IMAGE}
        eyebrow="Research"
        heading="Research"
        subhead="RML organizes its work into interdisciplinary research streams addressing forced displacement, rights, and climate mobility."
      />
      <div className="container-content py-12 lg:py-16">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-card" />
            ))}
          </div>
        ) : !themes || themes.length === 0 ? (
          <EmptyState title="No research themes yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => (
              <Link
                key={t.id}
                to={`/research/${t.slug}`}
                className="group overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-cardhover"
              >
                <OptimizedImage src={t.coverImageUrl} alt={t.title} ratio="16/9" className="rounded-t-card" />
                <div className="p-5">
                  <h3 className="text-lg leading-snug">{t.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{t.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent">
                    Explore theme
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function ResearchDetailPage() {
  const { slug } = useParams();
  const { data: themes } = useResearchThemes();
  const { data: pubs } = usePublishedPublications();
  const { data: people } = usePublishedPeople();

  const theme = themes?.find((t) => t.slug === slug);

  useDocumentMeta({
    title: theme?.title ?? 'Research theme',
    description: theme?.summary,
    path: `/research/${slug ?? ''}`,
    type: 'article',
    image: theme?.coverImageUrl,
    robots: themes && !theme ? 'noindex, follow' : 'index, follow',
    jsonLd: theme ? researchThemeLd(theme) : undefined,
  });

  if (!themes) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="container-content py-20">
        <EmptyState
          title="Research theme not found"
          action={<Link to="/research" className="text-accent underline">Back to research</Link>}
        />
      </div>
    );
  }

  const relatedPubs = (theme.relatedPublicationIds ?? [])
    .map((id) => pubs?.find((p) => p.id === id))
    .filter(Boolean);
  const relatedPeople = (theme.relatedPersonIds ?? [])
    .map((id) => people?.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <>
      <div className="container-content pt-8 lg:pt-12">
        <Link to="/research" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> All research
        </Link>

        {/* Cover image on top — full-width 16:9, no overlaid text */}
        <div className="overflow-hidden rounded-card shadow-card">
          <OptimizedImage
            src={theme.coverImageUrl}
            alt={theme.title}
            ratio="16/9"
            priority
            className="w-full"
          />
        </div>

        {/* Header separated out below the image, before the body */}
        <DetailHeader
          eyebrow={<Eyebrow>Research</Eyebrow>}
          title={theme.title}
          sub={theme.summary}
        />
      </div>
      <div className="container-content py-12 lg:py-16">
        <div>
          <RichText html={theme.body} className="max-w-none" />
        </div>

        {relatedPubs.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Related" title="Publications" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPubs.map((p) => p && <PublicationCard key={p.id} pub={p} />)}
            </div>
          </section>
        )}

        {relatedPeople.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow="Related" title="Researchers" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPeople.map((p) => p && (
                <Link
                  key={p.id}
                  to={`/team/${p.slug}`}
                  className="flex items-center gap-3 rounded-card bg-white p-4 shadow-card transition-shadow hover:shadow-cardhover"
                >
                  <OptimizedImage src={p.photoUrl} alt={p.name} ratio="square" align="top" compact className="h-14 w-14 rounded-full" />
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-sm text-ink-muted">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
