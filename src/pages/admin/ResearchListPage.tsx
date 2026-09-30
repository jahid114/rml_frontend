import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useResearchThemes, useDeleteResearchTheme } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import { Button, Skeleton } from '@/components/ui/primitives';
import type { ResearchTheme } from '@/lib/types';

export default function ResearchListPage() {
  const { data: themes = [], isLoading } = useResearchThemes();
  const deleteTheme = useDeleteResearchTheme();
  const [target, setTarget] = useState<ResearchTheme | null>(null);

  const columns: Column<ResearchTheme>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { key: 'summary', header: 'Summary', render: (r) => <span className="line-clamp-1 text-ink-muted">{r.summary}</span> },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Research Themes</h1>
        <Link to="/admin/research/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add theme
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={themes}
        basePath="/admin/research"
        onDelete={setTarget}
        toolbar={false}
      />
      <ConfirmDialog
        open={!!target}
        title="Delete research theme"
        message={`Remove "${target?.title}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deleteTheme.mutateAsync(target.id);
          showToast('success', 'Theme deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deleteTheme.isLoading}
      />
    </div>
  );
}
