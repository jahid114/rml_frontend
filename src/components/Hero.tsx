import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from './ui/primitives';

export function Hero({
  image,
  heading,
  subhead,
  cta,
  eyebrow,
}: {
  image: string;
  heading: string;
  subhead: string;
  cta?: { label: string; to: string };
  eyebrow?: string;
}) {
  return (
    <section className='relative isolate overflow-hidden bg-primary'>
      <div className='absolute inset-0'>
        <img src={image} alt='' className='h-full w-full object-cover' loading='eager' />
      </div>
      <div className='slider-overlay absolute inset-0' />
      <div className='absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]' />
      {/* Top-anchored text block: eyebrow + title sit at an identical Y on
          every page. (Bottom-anchoring can't align titles when subhead
          lengths vary from one line to a full paragraph, as on About.) */}
      <div className='container-content relative flex min-h-[240px] items-start pb-10 pt-14 sm:min-h-[280px] sm:pt-16 lg:min-h-[320px] lg:pt-20'>
        <div className='max-w-3xl'>
          {eyebrow && (
            <Eyebrow tone="gold" rule className="mb-4">
              {eyebrow}
            </Eyebrow>
          )}
          <h1 className='max-w-2xl text-[clamp(1.625rem,3.8vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] text-white'>{heading}</h1>
          <p className='mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-[14px] sm:leading-6'>{subhead}</p>
          {cta && (
            <Link
              to={cta.to}
              className='group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent hover:text-white'
            >
              {cta.label} <ArrowRight className='h-4 w-4 transition group-hover:translate-x-0.5' />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function Callout({
  eyebrow,
  title,
  body,
  to,
  ctaLabel,
  icon,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  to: string;
  ctaLabel: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      to={to}
      className='group flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardhover'
    >
      <div className='mb-3 flex items-center gap-2 text-accent'>
        {icon}
        <span className='text-xs font-semibold uppercase tracking-wider'>{eyebrow}</span>
      </div>
      <h3 className='text-xl leading-snug'>{title}</h3>
      <p className='mt-2 flex-1 text-sm text-ink-soft'>{body}</p>
      <span className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent'>
        {ctaLabel} <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
      </span>
    </Link>
  );
}
