import { Check, Mail, ExternalLink } from 'lucide-react';
import { SectionHeading, Skeleton, Eyebrow } from '@/components/ui/primitives';
import { usePageContent } from '@/lib/hooks';
import type { ProgrammePageContent } from '@/lib/types';
import { useDocumentMeta } from '@/lib/seo';
import { webPageLd } from '@/lib/jsonld';

const TITLES = {
  internship: 'Internship Programme',
  'visiting-fellowship': 'Visiting Fellowship',
} as const;

const DESCRIPTIONS: Record<keyof typeof TITLES, string> = {
  internship:
    'Apply for the RML Internship Programme and work with RML researchers on forced displacement, migration, and refugee rights.',
  'visiting-fellowship':
    'Apply for the RML Visiting Fellowship to spend a period of research residency with the Refugee and Migration Lab.',
};

export function ProgrammePage({ pageKey = 'internship' }: { pageKey?: 'internship' | 'visiting-fellowship' }) {
  const { data, isLoading } = usePageContent<ProgrammePageContent>(pageKey);

  useDocumentMeta({
    title: data?.seoTitle?.trim() || TITLES[pageKey],
    description: data?.seoDescription?.trim() || DESCRIPTIONS[pageKey],
    path: `/programmes/${pageKey}`,
    jsonLd: webPageLd(
      data?.seoTitle?.trim() || TITLES[pageKey],
      `/programmes/${pageKey}`,
      data?.seoDescription?.trim() || DESCRIPTIONS[pageKey]
    ),
  });

  if (isLoading || !data) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  const title = TITLES[pageKey];
  const eligibilityItems = Array.isArray(data.eligibilityItems) ? data.eligibilityItems : [];
  const howToApplySteps = Array.isArray(data.howToApplySteps) ? data.howToApplySteps : [];
  const isMailto = typeof data.ctaUrl === 'string' && data.ctaUrl.startsWith('mailto:');

  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" aria-hidden />
        <div className="container-content relative pb-10 pt-12 sm:pb-12 lg:pb-14 lg:pt-16">
          <div>
            <Eyebrow tone="gold" rule className="mb-4">
              Programme
            </Eyebrow>
            <h1 className="text-[clamp(1.625rem,3.8vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] text-white">{title}</h1>
            <p className="mt-4 whitespace-pre-line text-justify leading-7 text-white/75">{data.overviewText}</p>
          </div>
        </div>
      </section>

      <div className="container-content py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Eligibility */}
          <section>
            <SectionHeading eyebrow="Who can apply" title="Eligibility" />
            <ul className="mt-6 space-y-3">
              {eligibilityItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-justify">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How to apply */}
          <section>
            <SectionHeading eyebrow="Application" title="How to apply" />
            <ol className="mt-6 space-y-4">
              {howToApplySteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-justify text-ink-soft">{step}</p>
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
            {isMailto ? <Mail className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {data.ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
}
