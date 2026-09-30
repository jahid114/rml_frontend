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
}

// Lazy-loading image with blur-up placeholder and explicit dimensions to
// prevent CLS. Uses native loading=lazy + async decode.
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  ratio = 'auto',
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
          failed ? 'hidden' : 'opacity-100',
        )}
      />
    </span>
  );
}
