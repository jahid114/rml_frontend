import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/components/ui/cn';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  basePath: string;
  onDelete?: (row: T) => void;
  createLabel?: string;
  idField?: string;
  /** Show the built-in toolbar (item count + create button). Hide when the page renders its own header. */
  toolbar?: boolean;
  /** Filter controls bound to the table, rendered in the card toolbar next to the count. */
  filters?: ReactNode;
  /** Full (unfiltered) item count, shown as "X of Y items" alongside filters. */
  totalCount?: number;
}

export function DataTable<T>({
  columns,
  data,
  basePath,
  onDelete,
  createLabel = 'Add new',
  idField = 'id',
  toolbar = true,
  filters,
  totalCount,
}: DataTableProps<T>) {
  const get = (row: T, key: string) => (row as Record<string, unknown>)[key];
  const getId = (row: T) => String(get(row, idField));
  const showToolbar = toolbar || !!filters;
  const countText =
    totalCount != null ? `${data.length} of ${totalCount} items` : `${data.length} items`;

  return (
    <div className="rounded-card border border-line bg-white">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-sm text-ink-muted">{countText}</span>
          {toolbar ? (
            <Link to={`${basePath}/new`} className="ml-auto">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            </Link>
          ) : (
            filters && <div className="ml-auto flex flex-wrap items-center gap-3">{filters}</div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-2.5 font-medium text-ink-muted', col.className)}
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={getId(row)} className="border-b border-line last:border-0 hover:bg-canvas/50">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
                <td className="flex justify-end gap-1 px-4 py-3">
                  <Link
                    to={`${basePath}/${getId(row)}`}
                    className="rounded p-1.5 text-ink-muted transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
