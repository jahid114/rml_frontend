import { useState } from 'react';
import { cn } from './cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  ratio?: 'square' | '2/3' | '16/9' | 'auto';
  /** Focal discipline (C10): portraits use "top" so square crops keep faces. */
  align?: 'center' | 'top';
  /** Compact monogram fallback for small thumbs (e.g. 56px avatar circles). */
  compact?: boolean;
}

// Lazy-loading image with blur-up placeholder and explicit dimensions to
// prevent CLS. Uses native loading=lazy + async decode. On failure renders an
// institutional RML monogram (C11) instead of an empty grey block.
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  ratio = 'auto',
  align = 'center',
  compact = false,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ratioClass =
    ratio === 'square' ? 'aspect-square' : ratio === '2/3' ? 'aspect-[2/3]' : ratio === '16/9' ? 'aspect-video' : '';

  return (
    <span
      className={cn('relative block overflow-hidden bg-line/40', ratioClass, className)}
      style={ratio === 'auto' && width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      {!loaded && !failed && <span className='absolute inset-0 animate-pulse bg-line/50' aria-hidden />}
      {failed ? (
        <span
          className='flex h-full min-h-[6rem] w-full flex-col items-center justify-center gap-1 bg-primary/5 px-2 text-center'
          role='img'
          aria-label={`${alt} (image unavailable)`}
        >
          <span className={cn('font-serif leading-none text-primary/60', compact ? 'text-base' : 'text-3xl')}>
            RML
          </span>
          {!compact && (
            <span className='text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted/70'>
              Image unavailable
            </span>
          )}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding='async'
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'relative h-full w-full object-cover transition-opacity duration-500',
            align === 'top' && 'object-top',
            'opacity-100',
          )}
        />
      )}
    </span>
  );
}
