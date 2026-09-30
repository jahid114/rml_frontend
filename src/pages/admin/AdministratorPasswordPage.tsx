import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUpdateUser, useUsers } from '@/lib/hooks';
import { BackButton } from '@/components/admin/BackButton';
import { FormField, Input } from '@/components/admin/FormField';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';

interface Form {
  password: string;
  confirmPassword: string;
}

export default function AdministratorPasswordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: users = [] } = useUsers();
  const updateUser = useUpdateUser();
  const existing = users.find((u) => u.id === id);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async (data: Form) => {
    if (!existing) {
      showToast('error', 'Administrator not found');
      return;
    }
    try {
      await updateUser.mutateAsync({ id: id!, data: { password: data.password } });
      showToast('success', `Password updated for ${existing.name}`);
      navigate('/admin/administrators');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/administrators" label="Back to administrators" />
      <div>
        <h1 className="text-2xl font-semibold text-ink">Change Password</h1>
        {existing && (
          <p className="mt-1 text-sm text-ink-muted">
            {existing.name} · {existing.email}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="New Password" required error={errors.password?.message}>
          <Input
            type="password"
            {...register('password', { required: 'Required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
          <Input
            type="password"
            {...register('confirmPassword', {
              required: 'Required',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
            autoComplete="new-password"
          />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>Update password</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/administrators')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
