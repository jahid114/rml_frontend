import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEvents, useCreateEvent, useUpdateEvent } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Select, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { slugify } from '@/lib/utils';

interface Form {
  title: string;
  slug: string;
  theme: string;
  description: string;
  coverImageUrl: string;
  status: 'upcoming' | 'past';
  eventFormat: 'in-person' | 'virtual' | 'hybrid';
  startDateTimeUtc: string;
  organizer: string;
  collaborators: string;
}

export default function EventFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: events = [] } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const existing = !isNew ? events.find((e) => e.id === id) : undefined;
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: existing
      ? {
          ...existing,
          collaborators: existing.collaborators ?? '',
          startDateTimeUtc: existing.startDateTimeUtc.slice(0, 16),
        }
      : {
          title: '', slug: '', theme: '', description: '', coverImageUrl: '',
          status: 'upcoming', eventFormat: 'hybrid', startDateTimeUtc: '',
          organizer: 'Refugee and Migration Lab (RML)', collaborators: '',
        },
  });

  useEffect(() => {
    if (existing) {
      reset({ ...existing, collaborators: existing.collaborators ?? '', startDateTimeUtc: existing.startDateTimeUtc.slice(0, 16) });
    }
  }, [existing, reset]);

  const titleValue = watch('title');
  // Auto-fill slug from the title on new forms until edited manually.
  useEffect(() => { setSlugTouched(false); }, [id]);
  useEffect(() => {
    if (isNew && !slugTouched && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isNew, slugTouched, setValue]);

  const uniqueSlug = (v: string) =>
    !events.some((e) => e.id !== id && e.slug.toLowerCase() === v.trim().toLowerCase()) ||
    'Slug is already in use';

  const onSubmit = async (data: Form) => {
    if (!data.coverImageUrl && !coverFile) { setCoverError('Cover image is required'); return; }
    setCoverError('');
    let coverImageUrl = data.coverImageUrl;
    if (coverFile) {
      try {
        coverImageUrl = (await uploadMediaFile(coverFile, data.title || coverFile.name, 'events')).url;
      } catch {
        showToast('error', 'Image upload failed');
        return;
      }
    }
    const payload = {
      ...data,
      coverImageUrl,
      startDateTimeUtc: new Date(data.startDateTimeUtc).toISOString(),
      timezoneLabels: [],
      panelists: existing?.panelists ?? [],
    };
    try {
      if (isNew) {
        await createEvent.mutateAsync(payload);
        showToast('success', 'Event created');
      } else {
        await updateEvent.mutateAsync({ id: id!, data: payload });
        showToast('success', 'Event updated');
      }
      navigate('/admin/events');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/events" label="Back to events" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Event' : 'Edit Event'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Title" required error={errors.title?.message}>
          <Input {...register('title', { required: 'Required' })} />
        </FormField>
        <FormField label="Slug" required hint="Auto-filled from title — editable" error={errors.slug?.message}>
          <Input {...register('slug', { required: 'Required', validate: uniqueSlug, onChange: () => setSlugTouched(true) })} />
        </FormField>
        <FormField label="Theme" required error={errors.theme?.message}>
          <Input {...register('theme', { required: 'Required' })} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" required>
            <Select {...register('status')}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </Select>
          </FormField>
          <FormField label="Format" required>
            <Select {...register('eventFormat')}>
              <option value="hybrid">Hybrid</option>
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Date & Time (UTC)" required error={errors.startDateTimeUtc?.message}>
          <Input type="datetime-local" {...register('startDateTimeUtc', { required: 'Required' })} />
        </FormField>
        <ImageUpload
          label="Cover Image"
          required
          error={coverError || undefined}
          value={watch('coverImageUrl')}
          onChange={(url) => { setCoverError(''); setValue('coverImageUrl', url); }}
          onFile={(file) => { if (file) setCoverError(''); setCoverFile(file); }}
        />
        <FormField label="Organizer" required error={errors.organizer?.message}>
          <Input {...register('organizer', { required: 'Required', validate: (v) => v.trim() ? true : 'Required' })} />
        </FormField>
        <FormField label="Collaborators">
          <Input {...register('collaborators')} />
        </FormField>
        <FormField label="Description" required error={errors.description?.message}>
          <Textarea rows={4} {...register('description', { required: 'Required', validate: (v) => v.trim() ? true : 'Required' })} />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/events')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
