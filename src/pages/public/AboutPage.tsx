import { Link } from 'react-router-dom';
import { Globe, Scale, Users, GraduationCap, Megaphone, ArrowRight, type LucideIcon } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { SectionHeading, Skeleton } from '@/components/ui/primitives';
import { useAboutContent, usePublishedPeople } from '@/lib/hooks';

const ICONS: Record<string, LucideIcon> = {
  Globe, Scale, Users, GraduationCap, Megaphone,
};

export default function AboutPage() {
  const { data: about, isLoading } = useAboutContent();
  const { data: people } = usePublishedPeople();

  if (isLoading || !about) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  const teamCount = people?.length ?? 0;

  return (
    <>
      <Hero
        image={about.heroImageUrl}
        eyebrow="About RML"
        heading="About the RML"
        subhead={about.introText}
      />

      <section className="container-content py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <SectionHeading eyebrow="Who we are" title="A research collective, not a single-discipline lab" />
          </div>
          <p className="text-lg leading-8 text-ink-soft">{about.missionText}</p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="container-content">
          <SectionHeading eyebrow="What RML does" title="Our work in focus" center />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.whatWeDoItems.map((item, i) => {
              const Icon = ICONS[item.icon] ?? Globe;
              return (
                <div key={i} className="rounded-card border border-line bg-canvas p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base">{item.label}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{item.text}</p>
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
