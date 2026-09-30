import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { HeroSlide } from '@/lib/types';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { FormField, Input, Textarea } from '@/components/admin/FormField';

interface HeroSlidesEditorProps {
  slides: HeroSlide[];
  onChange: (slides: HeroSlide[]) => void;
  /** Receives selected files keyed by slide index; parent uploads on save. */
  onFile?: (index: number, file: File | null) => void;
}

const EMPTY_SLIDE: HeroSlide = {
  imageUrl: '',
  eyebrow: '',
  title: '',
  description: '',
  ctaLabel: '',
  ctaUrl: '',
};

export function HeroSlidesEditor({ slides, onChange, onFile }: HeroSlidesEditorProps) {
  const safeSlides = Array.isArray(slides) ? slides : [];

  const update = (i: number, patch: Partial<HeroSlide>) => {
    const next = [...safeSlides];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const remove = (i: number) => {
    if (safeSlides.length <= 1) return;
    onChange(safeSlides.filter((_, idx) => idx !== i));
  };

  const add = () => onChange([...safeSlides, { ...EMPTY_SLIDE }]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= safeSlides.length) return;
    const next = [...safeSlides];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">Hero slides ({safeSlides.length})</span>
        <span className="text-xs text-ink-muted">Add, edit, delete & reorder</span>
      </div>

      {safeSlides.map((slide, i) => (
        <div key={i} className="space-y-3 rounded-md border border-line p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Slide {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move slide ${i + 1} up`}
                className="rounded p-1.5 text-ink-muted transition hover:bg-line/50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === safeSlides.length - 1}
                aria-label={`Move slide ${i + 1} down`}
                className="rounded p-1.5 text-ink-muted transition hover:bg-line/50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={safeSlides.length <= 1}
                title={safeSlides.length <= 1 ? 'At least one slide is required' : 'Delete slide'}
                aria-label={`Delete slide ${i + 1}`}
                className="rounded p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <FormField label={`Slide ${i + 1} image`}>
            <ImageUpload value={slide.imageUrl} onChange={(url) => update(i, { imageUrl: url })} onFile={onFile ? (file) => onFile(i, file) : undefined} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Eyebrow" required>
              <Input
                value={slide.eyebrow}
                onChange={(e) => update(i, { eyebrow: e.target.value })}
                placeholder="e.g. Refugee & Migration Lab"
              />
            </FormField>
            <FormField label="CTA URL" required hint="Internal path like /about">
              <Input
                value={slide.ctaUrl}
                onChange={(e) => update(i, { ctaUrl: e.target.value })}
                placeholder="/about"
              />
            </FormField>
          </div>

          <FormField label="Title" required>
            <Input
              value={slide.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Slide headline"
            />
          </FormField>

          <FormField label="Description" required>
            <Textarea
              rows={2}
              value={slide.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Short supporting copy"
            />
          </FormField>

          <FormField label="CTA label" required>
            <Input
              value={slide.ctaLabel}
              onChange={(e) => update(i, { ctaLabel: e.target.value })}
              placeholder="e.g. Discover our story"
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2.5 text-sm text-ink-muted transition hover:border-primary hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" /> Add slide
      </button>
    </div>
  );
}
