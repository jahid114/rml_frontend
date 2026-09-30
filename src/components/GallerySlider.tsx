import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from './ui/cn';

export interface GallerySlide {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  cta: string;
}

const SLIDE_INTERVAL = 6500;

export function GallerySlider({ slides }: { slides: GallerySlide[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => setActive((index + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goTo(active + 1);
      if (event.key === 'ArrowLeft') goTo(active - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, goTo, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[active];

  return (
    <section
      className='relative isolate min-h-[620px] overflow-hidden bg-primary sm:min-h-[700px] lg:min-h-[760px]'
      aria-roledescription='carousel'
      aria-label='Featured stories'
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null || slides.length < 2) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(deltaX) > 48) goTo(active + (deltaX < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {slides.map((s, index) => (
        <div
          key={s.title}
          className={cn('absolute inset-0 transition-opacity duration-1000 ease-out', index === active ? 'z-0 opacity-100' : '-z-10 opacity-0')}
          aria-hidden={index !== active}
        >
          <img
            src={s.image}
            alt=''
            loading={index === 0 ? 'eager' : 'lazy'}
            className={cn('h-full w-full object-cover transition-transform duration-[7000ms] ease-out', index === active && playing ? 'scale-105' : 'scale-100')}
          />
        </div>
      ))}
      <div className='slider-overlay absolute inset-0' />
      <div className='absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]' />

      <div className='container-content relative flex min-h-[620px] items-end pb-28 pt-20 sm:min-h-[700px] sm:pb-32 lg:min-h-[760px] lg:pb-36'>
        <div className='max-w-4xl' aria-live='polite'>
          <div className='mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold'>
            <span className='h-px w-10 bg-gold' />
            {slide.eyebrow}
          </div>
          <h1 className='max-w-2xl text-[clamp(1.875rem,4.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white'>{slide.title}</h1>
          <p className='mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-[15px] sm:leading-7'>{slide.description}</p>
          <div className='mt-9 flex flex-wrap items-center gap-5'>
            <Link
              to={slide.to}
              className='group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-accent hover:text-white'
            >
              {slide.cta}
              <ArrowRight className='h-4 w-4 transition group-hover:translate-x-1' />
            </Link>
            <span className='font-serif text-sm tracking-[0.2em] text-white/60' aria-hidden>
              {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className='absolute bottom-6 left-0 right-0 sm:bottom-8'>
        <div className='container-content flex items-center justify-between gap-6'>
          <div className='flex items-center gap-2' role='tablist' aria-label='Choose a slide'>
            {slides.map((s, index) =>
              index === active ? (
                <button
                  key={s.title}
                  type='button'
                  onClick={() => setPlaying(false)}
                  className='h-1 w-16 overflow-hidden rounded-full bg-white/30'
                  role='tab'
                  aria-selected='true'
                  aria-label={`Slide ${index + 1}: ${s.title}`}
                >
                  <span
                    key={`${active}-${playing}`}
                    className='block h-full origin-left rounded-full bg-gold'
                    style={{
                      width: playing ? '100%' : undefined,
                      transformOrigin: 'left',
                      animation: playing ? `slide-progress ${SLIDE_INTERVAL}ms linear forwards` : undefined,
                      transform: playing ? undefined : 'scaleX(1)',
                      backgroundColor: playing ? undefined : 'var(--color-gold)',
                    }}
                  />
                </button>
              ) : (
                <button
                  key={s.title}
                  type='button'
                  onClick={() => {
                    setPlaying(false);
                    goTo(index);
                  }}
                  className='h-1 w-7 rounded-full bg-white/35 transition-all duration-300 hover:bg-white/70'
                  role='tab'
                  aria-selected='false'
                  aria-label={`Show slide ${index + 1}: ${s.title}`}
                />
              ),
            )}
          </div>
          <div className='flex items-center gap-2 text-white'>
            <button type='button' onClick={() => goTo(active - 1)} className='rounded-full border border-white/30 p-2.5 transition hover:bg-white hover:text-primary' aria-label='Previous slide'><ArrowLeft className='h-4 w-4' /></button>
            <button type='button' onClick={() => setPlaying((value) => !value)} className='rounded-full border border-white/30 p-2.5 transition hover:bg-white hover:text-primary' aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>{playing ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}</button>
            <button type='button' onClick={() => goTo(active + 1)} className='rounded-full border border-white/30 p-2.5 transition hover:bg-white hover:text-primary' aria-label='Next slide'><ArrowRight className='h-4 w-4' /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
