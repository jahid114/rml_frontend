import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, GraduationCap, Megaphone, Scale, Users, type LucideIcon } from 'lucide-react';
import { GallerySlider, type GallerySlide } from '@/components/GallerySlider';
import { useFeaturedJob, useHomeContent, useSiteSettings, useUpcomingEvents } from '@/lib/hooks';
import { normalizeHomeContent } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Skeleton, Eyebrow } from '@/components/ui/primitives';
import { useDocumentMeta, DEFAULT_DESCRIPTION, SITE_FULL_NAME } from '@/lib/seo';
import { organizationLd, webSiteLd } from '@/lib/jsonld';

const ICONS: Record<string, LucideIcon> = { Globe: Globe2, Scale, Users, GraduationCap, Megaphone };

export default function HomePage() {
  const { data: home, isLoading, isError, refetch } = useHomeContent();
  const { data: job } = useFeaturedJob();
  const { data: events } = useUpcomingEvents();
  const { data: settings } = useSiteSettings();
  const nextEvent = events?.[0];

  useDocumentMeta({
    title: home?.seoTitle?.trim() || SITE_FULL_NAME,
    description: home?.seoDescription?.trim() || DEFAULT_DESCRIPTION,
    path: '/',
    jsonLd: [organizationLd(settings), webSiteLd()],
  });

  if (isLoading) return <div className='container-content py-20'><Skeleton className='h-[70vh] w-full rounded-[2rem]' /></div>;
  if (isError || !home) return (
    <div className='container-content py-24 text-center'>
      <h1 className='text-3xl'>Unable to load the homepage</h1>
      <p className='mt-3 text-ink-muted'>Please try again.</p>
      <button type='button' onClick={() => void refetch()} className='mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white'>Try again</button>
    </div>
  );

  const content = normalizeHomeContent(home);

  const adminSlides: GallerySlide[] = content.heroSlides.map((s) => ({
    image: s.imageUrl,
    eyebrow: s.eyebrow,
    title: s.title,
    description: s.description,
    to: s.ctaUrl,
    cta: s.ctaLabel,
  }));
  const slides: GallerySlide[] =
    content.includeEventSlide && nextEvent
      ? [
          ...adminSlides,
          {
            image: nextEvent.coverImageUrl,
            eyebrow: 'Upcoming gathering',
            title: nextEvent.title,
            description: `${formatDate(nextEvent.startDateTimeUtc)} · ${nextEvent.theme}`,
            to: `/events/${nextEvent.slug}`,
            cta: 'View event details',
          },
        ]
      : adminSlides;

  return (
    <>
      <GallerySlider slides={slides} />

      <section className='relative overflow-hidden py-20 sm:py-28'>
        <div className='absolute -right-32 top-12 h-80 w-80 rounded-full border border-accent/20' />
        <div className='container-content grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24'>
          <div>
            <Eyebrow>{content.purposeKicker}</Eyebrow>
            <p className='mt-6 font-serif text-2xl leading-snug text-primary sm:text-3xl'>{content.purposeQuote}</p>
          </div>
          <div>
            <h2 className='text-3xl leading-tight sm:text-4xl lg:text-5xl'>{content.purposeHeading}</h2>
            <p className='mt-7 text-justify text-base leading-8 text-ink-soft sm:text-lg'>{content.missionText}</p>
            <Link to='/about' className='group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-primary'>{content.purposeCtaLabel} <span className='flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 transition group-hover:bg-primary group-hover:text-white'><ArrowRight className='h-4 w-4' /></span></Link>
          </div>
        </div>
      </section>

      <section className='bg-primary py-20 text-white sm:py-28'>
        <div className='container-content'>
          <div className='grid gap-8 border-b border-white/15 pb-12 lg:grid-cols-2 lg:items-end'>
            <div><Eyebrow tone="gold">{content.whatWeDoKicker}</Eyebrow><h2 className='mt-5 text-3xl text-white sm:text-5xl'>{content.whatWeDoHeading}</h2></div>
            <p className='max-w-xl text-base leading-7 text-white/65 lg:justify-self-end'>{content.whatWeDoIntro}</p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4'>
            {content.whatWeDoItems.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Globe2;
              return <article key={item.label} className='group border-b border-white/15 py-10 sm:border-r sm:px-7 lg:border-b-0 first:pl-0 last:border-r-0 last:pr-0'>
                <div className='flex items-center justify-between'><span className='font-serif text-sm text-white/35'>0{index + 1}</span><Icon className='h-5 w-5 text-gold' /></div>
                <h3 className='mt-12 text-xl text-white'>{item.label}</h3><p className='mt-3 text-sm leading-6 text-white/60'>{item.text}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className='py-20 sm:py-28'>
        <div className='container-content'>
          <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
            <div><Eyebrow>{content.eventsKicker}</Eyebrow><h2 className='mt-4 text-3xl sm:text-5xl'>{content.eventsHeading}</h2></div>
            <Link to='/events' className='inline-flex items-center gap-2 text-sm font-semibold text-primary'>{content.eventsLinkLabel} <ArrowRight className='h-4 w-4' /></Link>
          </div>
          <div className='mt-12 grid gap-6 lg:grid-cols-[1.35fr_.65fr]'>
            <Link to={nextEvent ? `/events/${nextEvent.slug}` : '/events'} className='group relative min-h-[480px] overflow-hidden rounded-[1.5rem] bg-primary'>
              {nextEvent ? (
                <img src={nextEvent.coverImageUrl} alt='' className='absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105' />
              ) : (
                <div className='absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent/40' aria-hidden />
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent' />
              <div className='absolute inset-x-0 bottom-0 p-7 sm:p-10'><p className='text-xs font-semibold uppercase tracking-[.2em] text-gold'>{nextEvent ? `Next event · ${formatDate(nextEvent.startDateTimeUtc)}` : 'Events archive'}</p><h3 className='mt-4 max-w-2xl text-2xl leading-tight text-white sm:text-4xl'>{nextEvent?.title ?? 'Catch up on RML seminars, panels, and commemorations'}</h3><span className='mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white'>{content.featuredCardCtaLabel} <ArrowRight className='h-4 w-4' /></span></div>
            </Link>
            <Link to='/join' className='group flex min-h-[330px] flex-col justify-between rounded-[1.5rem] bg-accent p-8 text-white sm:p-10 lg:min-h-0'>
              <div className='flex items-center justify-between'><Users className='h-6 w-6' /><span className='rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-widest'>{job ? 'Open call' : content.joinFallbackBadge}</span></div>
              <div><h3 className='text-2xl leading-tight text-white sm:text-3xl'>{job?.title ?? content.joinFallbackTitle}</h3><p className='mt-4 text-sm leading-6 text-white/75'>{job?.summary ?? content.joinFallbackText}</p><span className='mt-7 inline-flex items-center gap-2 text-sm font-semibold'>{content.joinCtaLabel} <ArrowRight className='h-4 w-4 transition group-hover:translate-x-1' /></span></div>
            </Link>
          </div>
        </div>
      </section>

      <section className='border-y border-line bg-white py-16'>
        <div className='container-content flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left'>
          <div><Eyebrow>{content.connectKicker}</Eyebrow><h2 className='mt-3 text-2xl sm:text-3xl'>{content.connectHeading}</h2></div>
          <div className='flex flex-wrap justify-center gap-2'>{settings?.socialLinks?.map((social) => <a key={social.platform + social.url} href={social.url} target='_blank' rel='noreferrer' className='rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-accent hover:bg-accent hover:text-white'>{social.platform}</a>)}</div>
        </div>
      </section>
    </>
  );
}
