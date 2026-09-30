import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useEvents, useDeleteEvent } from '@/lib/hooks';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FilterSelect } from '@/components/admin/FilterBar';
import { showToast } from '@/components/admin/Toast';
import { Badge, Button, Skeleton } from '@/components/ui/primitives';
import type { Event } from '@/lib/types';

export default function EventsListPage() {
  const { data: events = [], isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();
  const [target, setTarget] = useState<Event | null>(null);
  const [status, setStatus] = useState('all');

  const filtered = events.filter((e) => status === 'all' || e.status === status);

  const columns: Column<Event>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-ink">{r.title}</span> },
    { key: 'theme', header: 'Theme', render: (r) => r.theme },
    { key: 'startDateTimeUtc', header: 'Date', render: (r) => new Date(r.startDateTimeUtc).toLocaleDateString() },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={r.status === 'upcoming' ? 'success' : 'neutral'}>{r.status}</Badge>,
    },
    { key: 'eventFormat', header: 'Format', render: (r) => <Badge tone="accent">{r.eventFormat}</Badge> },
  ];

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Events</h1>
        <Link to="/admin/events/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add event
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        basePath="/admin/events"
        onDelete={setTarget}
        toolbar={false}
        totalCount={events.length}
        filters={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
            ]}
          />
        }
      />
      <ConfirmDialog
        open={!!target}
        title="Delete event"
        message={`Remove "${target?.title}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deleteEvent.mutateAsync(target.id);
          showToast('success', 'Event deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deleteEvent.isLoading}
      />
    </div>
  );
}
