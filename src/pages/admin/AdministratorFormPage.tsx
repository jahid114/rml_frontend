import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { useCreateUser, useUpdateUser, useUsers } from '@/lib/hooks';
import { BackButton } from '@/components/admin/BackButton';
import { FormField, Input, Select } from '@/components/admin/FormField';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import type { AdminRole } from '@/lib/types';

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'admin', label: 'Admin — full access, manages administrators' },
  { value: 'editor', label: 'Editor — manages content' },
];

interface Form {
  name: string;
  email: string;
  role: AdminRole;
  password: string;
  confirmPassword: string;
}

export default function AdministratorFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const existing = !isNew ? users.find((u) => u.id === id) : undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    defaultValues: { name: '', email: '', role: 'editor', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name, email: existing.email, role: existing.role, password: '', confirmPassword: '' });
    }
  }, [existing, reset]);

  const uniqueName = (v: string) =>
    !users.some((u) => u.id !== id && u.name.toLowerCase() === v.trim().toLowerCase()) ||
    'Username is already taken';
  const uniqueEmail = (v: string) =>
    !users.some((u) => u.id !== id && u.email.toLowerCase() === v.trim().toLowerCase()) ||
    'Email is already taken';

  const onSubmit = async (data: Form) => {
    try {
      if (isNew) {
        await createUser.mutateAsync({
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          password: data.password,
        });
        showToast('success', 'Administrator created');
      } else {
        if (existing && existing.id === session?.user.id && data.role !== existing.role) {
          showToast('error', 'You cannot change your own role');
          return;
        }
        await updateUser.mutateAsync({
          id: id!,
          data: { name: data.name.trim(), email: data.email.trim(), role: data.role },
        });
        showToast('success', 'Administrator updated');
      }
      navigate('/admin/administrators');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/administrators" label="Back to administrators" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Administrator' : 'Edit Administrator'}</h1>
        {!isNew && (
          <Link
            to={`/admin/administrators/${id}/password`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent"
          >
            <KeyRound className="h-4 w-4" /> Change password
          </Link>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Username" required error={errors.name?.message}>
          <Input
            {...register('name', { required: 'Required', validate: uniqueName })}
            placeholder="e.g. site-admin"
            autoComplete="username"
          />
        </FormField>
        <FormField label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            {...register('email', {
              required: 'Required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Must be a valid email' },
              validate: uniqueEmail,
            })}
            placeholder="admin@example.org"
          />
        </FormField>
        <FormField label="Role" required hint="Only admins can manage administrators">
          <Select {...register('role')}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </FormField>
        {isNew && (
          <>
            <FormField label="Password" required error={errors.password?.message}>
              <Input
                type="password"
                {...register('password', { required: 'Required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
              <Input
                type="password"
                {...register('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                autoComplete="new-password"
              />
            </FormField>
          </>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/administrators')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
