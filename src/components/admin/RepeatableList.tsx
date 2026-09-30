import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/components/ui/cn';

interface RepeatableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
}

export function RepeatableList({ items, onChange, label, placeholder = 'Add item...', hint }: RepeatableListProps) {
  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="space-y-2">
      {label && (
        <div>
          <span className="text-sm font-medium text-ink">{label}</span>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 rounded-md p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className={cn(
          'flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-sm text-ink-muted hover:border-primary hover:text-primary'
        )}
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}
