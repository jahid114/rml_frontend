import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePartners, useDeletePartner } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import { Button, Skeleton } from '@/components/ui/primitives';
import type { Partner } from '@/lib/types';

export default function PartnersListPage() {
  const { data: partners = [], isLoading } = usePartners();
  const deletePartner = useDeletePartner();
  const [target, setTarget] = useState<Partner | null>(null);

  const columns: Column<Partner>[] = [
    { key: 'logo', header: 'Logo', render: (r) => <img src={r.logoUrl} alt="" className="h-10 w-16 object-contain" /> },
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { key: 'link', header: 'Link', render: (r) => <span className="line-clamp-1 text-ink-muted">{r.link || '—'}</span> },
    { key: 'order', header: 'Order', render: (r) => r.order },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Partners</h1>
        <Link to="/admin/partners/new">
          <Button size="sm"><Plus className="h-4 w-4" />Add partner</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={partners} basePath="/admin/partners" onDelete={setTarget} toolbar={false} />
      <ConfirmDialog
        open={!!target}
        title="Delete partner"
        message={`Remove "${target?.name}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deletePartner.mutateAsync(target.id);
          showToast('success', 'Partner deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deletePartner.isLoading}
      />
    </div>
  );
}
