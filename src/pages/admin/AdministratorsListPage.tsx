import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { useDeleteUser, useUsers } from '@/lib/hooks';
import { BackButton } from '@/components/admin/BackButton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FilterSelect } from '@/components/admin/FilterBar';
import { showToast } from '@/components/admin/Toast';
import { Badge, Button, Skeleton } from '@/components/ui/primitives';
import { cn } from '@/components/ui/cn';
import type { AdminUser } from '@/lib/types';

export default function AdministratorsListPage() {
  const { data: users = [], isLoading } = useUsers();
  const { session } = useAuth();
  const deleteUser = useDeleteUser();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [role, setRole] = useState('all');

  const filtered = users.filter((u) => role === 'all' || u.role === role);

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;
  }

  const handleDelete = async () => {
    if (!target) return;
    if (target.id === session?.user.id) {
      showToast('error', 'You cannot delete your own account');
      return;
    }
    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      showToast('error', 'You cannot delete the last remaining admin');
      return;
    }
    await deleteUser.mutateAsync(target.id);
    showToast('success', 'Administrator deleted');
    setTarget(null);
  };

  return (
    <div className="space-y-6">
      <BackButton to="/admin" label="Back to dashboard" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Administrators</h1>
        <Link to="/admin/administrators/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add administrator
          </Button>
        </Link>
      </div>
      <div className="rounded-card border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-sm text-ink-muted">{filtered.length} of {users.length} items</span>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: 'all', label: 'All roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
              ]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas">
              <th className="px-4 py-2.5 font-medium text-ink-muted">Username</th>
              <th className="px-4 py-2.5 font-medium text-ink-muted">Email</th>
              <th className="px-4 py-2.5 font-medium text-ink-muted">Role</th>
              <th className="px-4 py-2.5 text-right font-medium text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-canvas/50">
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">{u.name}</span>
                  {u.id === session?.user.id && (
                    <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-xs text-accent">You</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === 'admin' ? 'primary' : u.role === 'editor' ? 'accent' : 'neutral'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/admin/administrators/${u.id}`}
                      title="Edit info"
                      className="rounded p-1.5 text-ink-muted transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/admin/administrators/${u.id}/password`}
                      title="Change password"
                      className="rounded p-1.5 text-ink-muted transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTarget(u)}
                      title="Delete"
                      className={cn(
                        'rounded p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600',
                        u.id === session?.user.id && 'opacity-30 hover:bg-transparent hover:text-ink-muted'
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        open={!!target}
        title="Delete administrator"
        message={`Remove "${target?.name}" (${target?.email})? They will immediately lose access to the Admin Panel.`}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
        loading={deleteUser.isLoading}
      />
    </div>
  );
}
