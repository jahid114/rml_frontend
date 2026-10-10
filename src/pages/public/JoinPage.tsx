import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { SectionHeading, EmptyState, Skeleton, Badge } from '@/components/ui/primitives';
import { RichText } from '@/components/ui/RichText';
import { useOpenJobs, useSiteSettings } from '@/lib/hooks';
import { formatShortDate } from '@/lib/utils';

const HERO_IMAGE =
  '/images/site/hero-humanitarian-aid.jpg';

/**
 * Splits a job's rich HTML description at its headings (h1/h2/h3) so sections
 * like "Responsibilities" and "Qualifications" can sit side by side, mirroring
 * the two-column Eligibility / How-to-apply layout of the programme pages.
 * Falls back to a single block when no headings are present.
 */
function splitJobSections(html: string): { intro: string; sections: { heading: string; body: string }[] } {
  const fallback = { intro: html, sections: [] as { heading: string; body: string }[] };
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const children = Array.from(doc.body.children);
    const firstHeading = children.findIndex((el) => /^H[1-3]$/.test(el.tagName));
    if (firstHeading === -1) return fallback;
    const intro = children
      .slice(0, firstHeading)
      .map((el) => el.outerHTML)
      .join('');
    const sections: { heading: string; body: string }[] = [];
    let current: { heading: string; parts: string[] } | null = null;
    for (const el of children.slice(firstHeading)) {
      if (/^H[1-3]$/.test(el.tagName)) {
        if (current) sections.push({ heading: current.heading, body: current.parts.join('') });
        current = { heading: el.textContent?.trim() ?? '', parts: [] };
      } else if (current) {
        current.parts.push(el.outerHTML);
      }
    }
    if (current) sections.push({ heading: current.heading, body: current.parts.join('') });
    if (sections.length === 0) return fallback;
    return { intro, sections };
  } catch {
    return fallback;
  }
}

function JobDescription({ html }: { html: string }) {
  const { intro, sections } = useMemo(() => splitJobSections(html), [html]);
  // Single block (no headings found) — full width, justified.
  if (sections.length < 2) {
    return <RichText html={html} className="max-w-none" />;
  }
  return (
    <div>
      {intro.trim() && <RichText html={intro} className="max-w-none" />}
      <div className="grid gap-8 lg:grid-cols-2">
        {sections.map((s, i) => (
          <section key={i}>
            <h3 className="text-xl">{s.heading}</h3>
            <div className="mt-3">
              <RichText html={s.body || '<p>—</p>'} className="max-w-none" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function JoinPage() {
  const { data: jobs, isLoading } = useOpenJobs();
  const { data: settings } = useSiteSettings();

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        eyebrow="Join us"
        heading="Join the RML Team"
        subhead="RML is a dynamic, interdisciplinary research collective. We welcome scholars, practitioners, and students from around the world."
      />

      <div className="container-content py-12 lg:py-16">
        <SectionHeading
          eyebrow="Current openings"
          title="Open positions"
          intro="RML recruits research assistants, fellows, and visiting scholars on a rolling basis."
        />

        <div className="mt-10">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-card" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-10 w-10" />}
              title="No open positions right now"
              description="RML posts new roles throughout the year. Get in touch to be notified, or check back soon."
              action={
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
                >
                  Get notified <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-card border border-line bg-white p-6 shadow-card sm:p-8"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl">{job.title}</h3>
                      <p className="mt-2 text-ink-soft">{job.summary}</p>
                      {job.deadline && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                          <Calendar className="h-4 w-4" /> Apply by {formatShortDate(job.deadline)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-none flex-col items-start gap-2">
                      <Badge tone="success">Open</Badge>
                      {job.applyUrl ? (
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
                        >
                          Apply now <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : job.applyEmail ? (
                        <a
                          href={`mailto:${job.applyEmail}`}
                          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
                        >
                          <Mail className="h-4 w-4" /> Apply by email
                        </a>
                      ) : null}
                    </div>
                  </div>
                  {job.richDescription && (
                    <div className="mt-6 border-t border-line pt-6">
                      <JobDescription html={job.richDescription} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* How we recruit */}
        <section className="mt-16 rounded-card bg-white p-8 shadow-card sm:p-10">
          <SectionHeading eyebrow="How we recruit" title="What to expect" />
          <p className="mt-4 max-w-prose text-justify text-ink-soft">
            RML reviews applications on a rolling basis. Shortlisted candidates are invited to a
            conversation with the relevant research lead. We welcome applicants from the Global
            South and from displaced backgrounds, and we are committed to an inclusive, equitable
            hiring process.
          </p>
          {settings?.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent"
            >
              <Mail className="h-4 w-4" /> {settings.contactEmail}
            </a>
          )}
        </section>
      </div>
    </>
  );
}
