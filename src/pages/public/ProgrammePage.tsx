import { useParams } from 'react-router-dom';
import { Check, Mail, ExternalLink } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { SectionHeading, Skeleton } from '@/components/ui/primitives';
import { useInternshipContent, useVisitingContent } from '@/lib/hooks';

export function ProgrammePage() {
  const { slug } = useParams();
  const isVisiting = slug === 'visiting-fellowship';
  const internship = useInternshipContent();
  const visiting = useVisitingContent();
  const { data, isLoading } = isVisiting ? visiting : internship;

  if (isLoading || !data) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  const title = data.slug === 'internship' ? 'Internship Programme' : 'Visiting Fellowship';

  return (
    <>
      <Hero image={data.heroImageUrl} eyebrow="Programme" heading={title} subhead={data.overviewText} />

      <div className="container-content py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Eligibility */}
          <section>
            <SectionHeading eyebrow="Who can apply" title="Eligibility" />
            <ul className="mt-6 space-y-3">
              {data.eligibilityItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How to apply */}
          <section>
            <SectionHeading eyebrow="Application" title="How to apply" />
            <ol className="mt-6 space-y-4">
              {data.howToApplySteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-ink-soft">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-card bg-primary p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl text-white">Ready to apply?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">
            {data.ctaLabel}
          </p>
          <a
            href={data.ctaUrl}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-600"
          >
            {data.ctaUrl.startsWith('mailto:') ? <Mail className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {data.ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
}
