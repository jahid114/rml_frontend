import { Link } from 'react-router-dom';
import { Globe, Scale, Users, GraduationCap, Megaphone, ArrowRight, type LucideIcon } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { SectionHeading, Skeleton } from '@/components/ui/primitives';
import { useAboutContent, usePublishedPeople, useSiteSettings } from '@/lib/hooks';
import { normalizeAboutContent } from '@/lib/utils';
import { useDocumentMeta, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { organizationLd, webPageLd } from '@/lib/jsonld';

const ICONS: Record<string, LucideIcon> = {
  Globe, Scale, Users, GraduationCap, Megaphone,
};

export default function AboutPage() {
  const { data: about, isLoading } = useAboutContent();
  const { data: people } = usePublishedPeople();
  const { data: settings } = useSiteSettings();

  useDocumentMeta({
    title: about?.seoTitle?.trim() || 'About the RML',
    description: about?.seoDescription?.trim() || DEFAULT_DESCRIPTION,
    path: '/about',
    jsonLd: [
      organizationLd(settings),
      webPageLd('About the RML', '/about', about?.seoDescription?.trim() || DEFAULT_DESCRIPTION),
    ],
  });

  if (isLoading || !about) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  const teamCount = people?.length ?? 0;

  // Single source of truth: the pages-content API (Admin → Pages → About).
  // normalizeAboutContent only backfills seed defaults when the API has
  // nothing saved yet — it never overrides saved content.
  const content = normalizeAboutContent(about);
  const workItems = content.whatWeDoItems ?? [];

  return (
    <>
      <Hero
        image={content.heroImageUrl}
        eyebrow="About RML"
        heading="About the RML"
        subhead={content.introText}
      />

      <section className="container-content py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <SectionHeading eyebrow="Who we are" title="A research collective, not a single-discipline lab" />
          </div>
          <p className="text-justify text-lg leading-8 text-ink-soft">{content.missionText}</p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="container-content">
          <SectionHeading eyebrow={content.whatWeDoKicker || 'What RML does'} title={content.whatWeDoHeading || 'Our work in focus'} center />
          <p className="mt-6 text-center text-base text-ink-soft">{content.whatWeDoIntro || 'The RML works on the following:'}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workItems.map((item, i) => {
              const Icon = ICONS[item.icon] ?? Globe;
              return (
                <div key={i} className="rounded-card border border-line bg-canvas p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  {Boolean(item.label) && <h3 className="text-base">{item.label}</h3>}
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-content py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat value={teamCount} label="Researchers" />
            <Stat value={3} label="Research streams" />
            <Stat value={7} label="Social platforms" />
          </div>
          <div className="lg:order-first">
            <SectionHeading
              eyebrow="The team"
              title="Scholars from across the world"
              intro="RML brings together anthropologists, legal scholars, political scientists, and practitioners from institutions across South Asia, Europe, and North America."
            />
            <Link
              to="/team"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent"
            >
              Meet the team <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <div className="text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-muted">{label}</div>
    </div>
  );
}
