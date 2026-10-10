import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from './cn';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.to && !last ? (
              <Link to={item.to} className="text-ink-muted hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={cn(last ? 'text-ink' : 'text-ink-muted')}>{item.label}</span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden />}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * Single eyebrow/kicker token (B6): small-caps label with wide tracking.
 * - tone "accent" for light surfaces, "gold" for dark/photo surfaces.
 * - rule adds the short leading line used on heroes and programme headers.
 */
export function Eyebrow({
  children,
  tone = 'accent',
  rule = false,
  className,
}: {
  children: ReactNode;
  tone?: 'accent' | 'gold';
  rule?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em]',
        tone === 'gold' ? 'text-gold' : 'text-accent',
        className
      )}
    >
      {rule && (
        <span className={cn('h-px w-8', tone === 'gold' ? 'bg-gold' : 'bg-accent')} aria-hidden />
      )}
      <span>{children}</span>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <Eyebrow className="mb-2">{eyebrow}</Eyebrow>
      )}
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      {intro && <p className="mt-3 text-ink-soft">{intro}</p>}
    </div>
  );
}

/**
 * Shared detail-page header scale (events / research / publications):
 * eyebrow row (kicker or badges), left-aligned h1, subtitle.
 * Keeps all detail headers on one type scale with one alignment.
 */
export function DetailHeader({
  eyebrow,
  title,
  sub,
  subTone = 'soft',
}: {
  eyebrow?: ReactNode;
  title: string;
  sub?: string;
  subTone?: 'soft' | 'accent';
}) {
  return (
    <div className="mt-6">
      {eyebrow && <div className="mb-4">{eyebrow}</div>}
      <h1 className="text-left text-3xl sm:text-4xl">{title}</h1>
      {sub && (
        <p className={cn('mt-3 text-left text-lg', subTone === 'accent' ? 'text-accent' : 'text-ink-soft')}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'primary' | 'success' | 'warning' | 'accentSolid' | 'lightSolid';
}) {
  // Usage rules (B7): translucent tones (neutral/accent/success/warning) on
  // light surfaces only; `primary` anywhere; `accentSolid`/`lightSolid` are
  // the ONLY tones permitted over photos (translucents wash out on images).
  const tones: Record<string, string> = {
    neutral: 'bg-primary/10 text-primary',
    accent: 'bg-accent/15 text-accent-700',
    primary: 'bg-primary text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    // Solid chips for use over photos (event cards / detail banners) where the
    // translucent tones wash out and fail contrast.
    accentSolid: 'bg-accent text-white shadow-md',
    lightSolid: 'bg-white/95 text-primary shadow-md',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-600',
    accent: 'bg-accent text-white hover:bg-accent-600',
    outline: 'border border-primary text-primary hover:bg-primary/5',
    ghost: 'text-primary hover:bg-primary/5',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-line/60', className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/50 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-ink-muted">{icon}</div>}
      <h3 className="text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-md text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
