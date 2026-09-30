import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePeople, useDeletePerson } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FilterSelect } from '@/components/admin/FilterBar';
import { showToast } from '@/components/admin/Toast';
import { Badge, Button, Skeleton } from '@/components/ui/primitives';
import type { Person } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/types';

export default function PeopleListPage() {
  const { data: people = [], isLoading } = usePeople();
  const deletePerson = useDeletePerson();
  const [target, setTarget] = useState<Person | null>(null);
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');

  const filtered = people.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      (role === 'all' || p.role === role)
  );

  const columns: Column<Person>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <span className="font-medium text-ink">{r.name}</span>
      ),
    },
    { key: 'role', header: 'Role', render: (r) => <Badge>{ROLE_LABELS[r.role]}</Badge> },
    { key: 'affiliation', header: 'Affiliation', render: (r) => r.affiliation },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'published' ? 'success' : 'warning'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">People</h1>
        <Link to="/admin/people/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add person
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        basePath="/admin/people"
        onDelete={setTarget}
        toolbar={false}
        totalCount={people.length}
        filters={
          <>
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
            <FilterSelect
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: 'all', label: 'All roles' },
                ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
          </>
        }
      />
      <ConfirmDialog
        open={!!target}
        title="Delete person"
        message={`Remove "${target?.name}" from the team?`}
        onConfirm={async () => {
          if (!target) return;
          await deletePerson.mutateAsync(target.id);
          showToast('success', 'Person deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deletePerson.isLoading}
      />
    </div>
  );
}
