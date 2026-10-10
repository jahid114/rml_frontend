import { Globe, GraduationCap, Megaphone, Plus, Scale, Trash2, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import type { WhatWeDoItem } from '@/lib/types';

interface WhatWeDoEditorProps {
  items: WhatWeDoItem[];
  onChange: (items: WhatWeDoItem[]) => void;
  /** Maximum items allowed (Home: 4, About: 6 per validation schema). */
  max?: number;
  /**
   * Card appearance matching the public page the items belong to:
   * - "light": About page cards (white canvas card, accent icon circle)
   * - "dark": Home page dark-band cards (primary card, gold icon, numbered)
   */
  variant?: 'light' | 'dark';
}

const ICON_OPTIONS = ['Globe', 'Scale', 'Users', 'GraduationCap', 'Megaphone'] as const;

const ICONS: Record<string, LucideIcon> = {
  Globe,
  Scale,
  Users,
  GraduationCap,
  Megaphone,
};

export function WhatWeDoEditor({ items = [], onChange, max, variant = 'light' }: WhatWeDoEditorProps) {
  const update = (i: number, patch: Partial<WhatWeDoItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => {
    if (typeof max === 'number' && items.length >= max) return;
    onChange([...items, { icon: 'Globe', label: '', text: '' }]);
  };
  const atMax = typeof max === 'number' && items.length >= max;
  const dark = variant === 'dark';

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-ink">
        What We Do Items{typeof max === 'number' ? ` (${items.length}/${max})` : ''}
      </span>
      {items.map((item, i) => {
        const Icon = ICONS[item.icon] ?? Globe;
        return dark ? (
          <div key={i} className="rounded-card bg-primary p-6 text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-sm text-white/35">0{i + 1}</span>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
                <select
                  value={item.icon}
                  onChange={(e) => update(i, { icon: e.target.value })}
                  aria-label={`Card ${i + 1} icon`}
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-white focus:border-gold focus:outline-none"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic} className="text-ink">{ic}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove card ${i + 1}`}
                  className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Card heading"
              aria-label={`Card ${i + 1} heading`}
              className="mt-12 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xl text-white placeholder:text-white/30 hover:border-white/20 focus:border-gold focus:outline-none"
            />
            <textarea
              value={item.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="Card body text"
              aria-label={`Card ${i + 1} body text`}
              rows={2}
              className="mt-3 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm leading-6 text-white/60 placeholder:text-white/30 hover:border-white/20 focus:border-gold focus:outline-none"
            />
          </div>
        ) : (
          <div key={i} className="rounded-card border border-line bg-canvas p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ink-muted">Item {i + 1}</span>
                <select
                  value={item.icon}
                  onChange={(e) => update(i, { icon: e.target.value })}
                  aria-label={`Card ${i + 1} icon`}
                  className="rounded-md border border-line bg-white px-2 py-1.5 text-xs text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove card ${i + 1}`}
                  className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Card heading"
              aria-label={`Card ${i + 1} heading`}
              className={cn(
                'w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-left text-base text-ink',
                'placeholder:text-ink-muted/50 hover:border-line focus:border-primary focus:bg-white focus:outline-none'
              )}
            />
            <textarea
              value={item.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="Card body text"
              aria-label={`Card ${i + 1} body text`}
              rows={2}
              className={cn(
                'mt-2 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-left text-sm leading-6 text-ink-soft',
                'placeholder:text-ink-muted/50 hover:border-line focus:border-primary focus:bg-white focus:outline-none'
              )}
            />
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        disabled={atMax}
        title={atMax ? `Maximum ${max} items` : 'Add item'}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-sm text-ink-muted hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink-muted"
      >
        <Plus className="h-3.5 w-3.5" /> {atMax ? `Maximum ${max} items reached` : 'Add item'}
      </button>
    </div>
  );
}
