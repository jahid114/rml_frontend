import { useEffect, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useJobs, useCreateJob, useUpdateJob } from '@/lib/hooks';
import { FormField, Input, Select, Textarea } from '@/components/admin/FormField';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { isRichTextEmpty } from '@/lib/utils';

// Tiptap is heavy — load it only when an admin opens this form.
const RichTextEditor = lazy(() =>
  import('@/components/admin/RichTextEditor').then((m) => ({ default: m.RichTextEditor })),
);

interface Form {
  title: string;
  summary: string;
  richDescription: string;
  applyUrl: string;
  applyEmail: string;
  deadline: string;
  status: 'open' | 'closed';
  featuredOnHome: boolean;
}

export default function JobFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: jobs = [] } = useJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const existing = !isNew ? jobs.find((j) => j.id === id) : undefined;

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: existing
      ? { ...existing, applyUrl: existing.applyUrl ?? '', applyEmail: existing.applyEmail ?? '', deadline: existing.deadline ?? '' }
      : { title: '', summary: '', richDescription: '', applyUrl: '', applyEmail: '', deadline: '', status: 'open', featuredOnHome: false },
  });

  useEffect(() => {
    if (existing) reset({ ...existing, applyUrl: existing.applyUrl ?? '', applyEmail: existing.applyEmail ?? '', deadline: existing.deadline ?? '' });
  }, [existing, reset]);

  const optionalUrl = (v: string) =>
    !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim()) || 'Must be a valid URL';
  const optionalEmail = (v: string) =>
    !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Must be a valid email';

  const onSubmit = async (data: Form) => {
    try {
      if (isNew) {
        await createJob.mutateAsync(data);
        showToast('success', 'Job created');
      } else {
        await updateJob.mutateAsync({ id: id!, data });
        showToast('success', 'Job updated');
      }
      navigate('/admin/jobs');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/jobs" label="Back to jobs" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Job' : 'Edit Job'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Title" required error={errors.title?.message}>
          <Input {...register('title', { required: 'Required' })} />
        </FormField>
        <FormField label="Summary" required error={errors.summary?.message}>
          <Textarea rows={2} {...register('summary', { required: 'Required', validate: (v) => v.trim() ? true : 'Required' })} />
        </FormField>
        <FormField label="Description" required error={errors.richDescription?.message}>
          <Controller
            name="richDescription"
            control={control}
            rules={{ required: 'Required', validate: (v) => !isRichTextEmpty(v) || 'Required' }}
            render={({ field }) => (
              <Suspense fallback={<div className="h-[220px] animate-pulse rounded-md border border-line bg-line/20" aria-label="Loading editor" />}>
                <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Write the job description…" />
              </Suspense>
            )}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Apply URL" error={errors.applyUrl?.message}>
            <Input {...register('applyUrl', { validate: optionalUrl })} placeholder="https://..." />
          </FormField>
          <FormField label="Apply Email" error={errors.applyEmail?.message}>
            <Input {...register('applyEmail', { validate: optionalEmail })} placeholder="jobs@example.org" />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Deadline">
            <Input type="date" {...register('deadline')} />
          </FormField>
          <FormField label="Status">
            <Select {...register('status')}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('featuredOnHome')} className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
          Featured on home page
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/jobs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
