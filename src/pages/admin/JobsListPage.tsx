import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useJobs, useDeleteJob } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FilterSelect } from '@/components/admin/FilterBar';
import { showToast } from '@/components/admin/Toast';
import { Badge, Button, Skeleton } from '@/components/ui/primitives';
import type { JobOpening } from '@/lib/types';

export default function JobsListPage() {
  const { data: jobs = [], isLoading } = useJobs();
  const deleteJob = useDeleteJob();
  const [target, setTarget] = useState<JobOpening | null>(null);
  const [status, setStatus] = useState('all');

  const filtered = jobs.filter((j) => status === 'all' || j.status === status);

  const columns: Column<JobOpening>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { key: 'summary', header: 'Summary', render: (r) => <span className="line-clamp-1 text-ink-muted">{r.summary}</span> },
    { key: 'deadline', header: 'Deadline', render: (r) => r.deadline ?? '\u2014' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'open' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Jobs</h1>
        <Link to="/admin/jobs/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add job
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        basePath="/admin/jobs"
        onDelete={setTarget}
        toolbar={false}
        totalCount={jobs.length}
        filters={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        }
      />
      <ConfirmDialog
        open={!!target}
        title="Delete job"
        message={`Remove "${target?.title}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deleteJob.mutateAsync(target.id);
          showToast('success', 'Job deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deleteJob.isLoading}
      />
    </div>
  );
}
