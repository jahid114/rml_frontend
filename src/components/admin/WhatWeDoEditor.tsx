import { Plus, Trash2 } from 'lucide-react';
import type { WhatWeDoItem } from '@/lib/types';

interface WhatWeDoEditorProps {
  items: WhatWeDoItem[];
  onChange: (items: WhatWeDoItem[]) => void;
}

const ICON_OPTIONS = ['Globe', 'Scale', 'Users', 'GraduationCap', 'Megaphone'] as const;

export function WhatWeDoEditor({ items, onChange }: WhatWeDoEditorProps) {
  const update = (i: number, patch: Partial<WhatWeDoItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { icon: 'Globe', label: '', text: '' }]);

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-ink">What We Do Items</span>
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-line p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Item {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
            <select
              value={item.icon}
              onChange={(e) => update(i, { icon: e.target.value })}
              className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ICON_OPTIONS.map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </select>
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <textarea
            value={item.text}
            onChange={(e) => update(i, { text: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-sm text-ink-muted hover:border-primary hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}
