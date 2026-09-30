import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePublications, useDeletePublication } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FilterSelect } from '@/components/admin/FilterBar';
import { showToast } from '@/components/admin/Toast';
import { Badge, Button, Skeleton } from '@/components/ui/primitives';
import type { Publication } from '@/lib/types';
import { PUBLICATION_TYPE_LABELS } from '@/lib/types';

export default function PublicationsListPage() {
  const { data: pubs = [], isLoading } = usePublications();
  const deletePub = useDeletePublication();
  const [target, setTarget] = useState<Publication | null>(null);
  const [status, setStatus] = useState('all');

  const filtered = pubs.filter((p) => status === 'all' || p.status === status);

  const columns: Column<Publication>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge>{PUBLICATION_TYPE_LABELS[r.type]}</Badge> },
    { key: 'year', header: 'Year', render: (r) => r.year },
    { key: 'authors', header: 'Authors', render: (r) => r.authors.join(', ') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={r.status === 'published' ? 'success' : 'warning'}>{r.status}</Badge>,
    },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Publications</h1>
        <Link to="/admin/publications/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add publication
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        basePath="/admin/publications"
        onDelete={setTarget}
        toolbar={false}
        totalCount={pubs.length}
        filters={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
          />
        }
      />
      <ConfirmDialog
        open={!!target}
        title="Delete publication"
        message={`Remove "${target?.title}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deletePub.mutateAsync(target.id);
          showToast('success', 'Publication deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deletePub.isLoading}
      />
    </div>
  );
}
