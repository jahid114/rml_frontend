import { useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';
import type { Role } from '@/lib/types';
import { ROLE_GROUPS, FELLOWS_ROLES, AFFILIATES_ROLES, ROLE_LABELS } from '@/lib/types';
import { usePublishedPeople } from '@/lib/hooks';
import { PersonCard } from '@/components/PersonCard';
import { Hero } from '@/components/Hero';
import { SectionHeading, EmptyState, Skeleton } from '@/components/ui/primitives';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { RichText } from '@/components/ui/RichText';

type Variant = 'team' | 'fellows' | 'affiliates';

const VARIANT_CONFIG: Record<Variant, { roles: Role[]; title: string; subhead: string; image: string }> = {
  team: {
    roles: ROLE_GROUPS.flatMap((g) => g.roles),
    title: 'RML Research Team',
    subhead: 'Our directors, fellows, associates, researchers, and assistants.',
    image: '/images/site/hero-rohingya-camps.jpg',
  },
  fellows: {
    roles: FELLOWS_ROLES,
    title: 'Non-Resident Fellows',
    subhead: 'Fellows based at partner institutions around the world.',
    image: '/images/site/hero-humanitarian-aid.jpg',
  },
  affiliates: {
    roles: AFFILIATES_ROLES,
    title: 'Research Affiliates',
    subhead: 'PhD candidates and early-career affiliates connected to RML.',
    image: '/images/site/hero-rohingya-camps.jpg',
  },
};

function getVariant(slug?: string): Variant {
  if (slug === 'non-resident-fellows') return 'fellows';
  if (slug === 'affiliates') return 'affiliates';
  return 'team';
}

export function TeamListPage() {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean)[1];
  const variant = getVariant(segment);
  const config = VARIANT_CONFIG[variant];
  const { data: people, isLoading } = usePublishedPeople();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!people) return [];
    const inRoles = people.filter((p) => config.roles.includes(p.role));
    if (!query.trim()) return inRoles;
    const q = query.toLowerCase();
    return inRoles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.affiliation.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
    );
  }, [people, config.roles, query]);

  // Group by role-group (only for the main team view)
  const groups = useMemo(() => {
    if (variant !== 'team') return [{ group: config.title, roles: config.roles, people: filtered }];
    return ROLE_GROUPS.map((g) => ({
      group: g.group,
      roles: g.roles,
      people: filtered.filter((p) => g.roles.includes(p.role)),
    })).filter((g) => g.people.length > 0);
  }, [filtered, variant, config.title, config.roles]);

  return (
    <>
      <Hero image={config.image} eyebrow="Our people" heading={config.title} subhead={config.subhead} />

      <div className="container-content py-12 lg:py-16">
        {/* Sub-nav between team views */}
        <div className="mb-8 flex flex-wrap gap-2">
          <SubNav to="/team" active={variant === 'team'}>Research Team</SubNav>
          <SubNav to="/team/non-resident-fellows" active={variant === 'fellows'}>Non-Resident Fellows</SubNav>
          <SubNav to="/team/affiliates" active={variant === 'affiliates'}>Research Affiliates</SubNav>
        </div>

        {/* Search */}
        <div className="relative mb-10 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title, or affiliation"
            className="w-full rounded-md border border-line bg-white py-2.5 pl-10 pr-3 text-sm focus:border-accent focus:outline-none"
            aria-label="Search team"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-card" />
            ))}
          </div>
        ) : groups.length === 0 || filtered.length === 0 ? (
          <EmptyState title="No one found" description="Try a different search term." />
        ) : (
          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.group} id={g.group.toLowerCase().replace(/\s+/g, '-')}>
                <SectionHeading title={g.group} />
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {g.people.map((p) => (
                    <PersonCard key={p.id} person={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SubNav({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={
        active
          ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white'
          : 'rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-primary'
      }
    >
      {children}
    </Link>
  );
}

export function PersonDetailPage() {
  const { slug } = useParams();
  const { data: people } = usePublishedPeople();
  const person = people?.find((p) => p.slug === slug);

  if (!people) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container-content py-20">
        <EmptyState
          title="Profile not found"
          description="This person may have been removed or is not published."
          action={<Link to="/team" className="text-accent underline">Back to team</Link>}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-primary text-white">
        <div className="container-content py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
            <OptimizedImage
              src={person.photoUrl}
              alt={person.name}
              ratio="square"
              className="rounded-card"
            />
            <div>
              <p className="text-sm uppercase tracking-wider text-accent-200">{ROLE_LABELS[person.role]}</p>
              <h1 className="mt-2 text-3xl text-white sm:text-4xl">{person.name}</h1>
              <p className="mt-2 text-lg text-accent-200">{person.title}</p>
              <p className="mt-1 text-white/80">{person.affiliation}</p>
              {person.secondaryAffiliation && (
                <p className="mt-1 text-white/60">{person.secondaryAffiliation}</p>
              )}
              {person.profileUrl && (
                <a
                  href={person.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  External profile <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-content py-12 lg:py-16">
        <div className="max-w-prose">
          {person.bio ? (
            <RichText html={person.bio} />
          ) : (
            <p className="text-ink-soft">Biography coming soon.</p>
          )}
        </div>
        <div className="mt-10">
          <Link to="/team" className="inline-flex items-center gap-1 text-sm text-primary hover:text-accent">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to team
          </Link>
        </div>
      </div>
    </>
  );
}
