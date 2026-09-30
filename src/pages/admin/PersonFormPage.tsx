import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePeople, useCreatePerson, useUpdatePerson } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Select, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { slugify } from '@/lib/utils';
import type { Role } from '@/lib/types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'director', label: 'Director' },
  { value: 'research-fellow', label: 'Research Fellow' },
  { value: 'research-associate', label: 'Research Associate' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'research-assistant-full-time', label: 'Research Assistant (Full-Time)' },
  { value: 'research-assistant-part-time', label: 'Research Assistant (Part-Time)' },
  { value: 'non-resident-fellow', label: 'Non-Resident Fellow' },
  { value: 'research-affiliate', label: 'Research Affiliate' },
];

interface Form {
  name: string;
  slug: string;
  role: Role;
  title: string;
  affiliation: string;
  secondaryAffiliation: string;
  photoUrl: string;
  profileUrl: string;
  bio: string;
  order: number;
  featured: boolean;
  status: 'draft' | 'published';
}

export default function PersonFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: people = [] } = usePeople();
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const existing = !isNew ? people.find((p) => p.id === id) : undefined;
  const [slugTouched, setSlugTouched] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: existing
      ? { ...existing, secondaryAffiliation: existing.secondaryAffiliation ?? '', profileUrl: existing.profileUrl ?? '', bio: existing.bio ?? '' }
      : { name: '', slug: '', role: 'research-fellow', title: '', affiliation: '', secondaryAffiliation: '', photoUrl: '', profileUrl: '', bio: '', order: 0, featured: false, status: 'published' },
  });

  useEffect(() => {
    if (existing) {
      reset({ ...existing, secondaryAffiliation: existing.secondaryAffiliation ?? '', profileUrl: existing.profileUrl ?? '', bio: existing.bio ?? '' });
    }
  }, [existing, reset]);

  const nameValue = watch('name');
  // Auto-fill slug from the name on new forms until edited manually.
  useEffect(() => { setSlugTouched(false); }, [id]);
  useEffect(() => {
    if (isNew && !slugTouched && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isNew, slugTouched, setValue]);

  const uniqueSlug = (v: string) =>
    !people.some((p) => p.id !== id && p.slug.toLowerCase() === v.trim().toLowerCase()) ||
    'Slug is already in use';

  const onSubmit = async (data: Form) => {
    if (!data.photoUrl && !photoFile) { setPhotoError('Photo is required'); return; }
    setPhotoError('');
    try {
      let photoUrl = data.photoUrl;
      if (photoFile) {
        const uploaded = await uploadMediaFile(photoFile, data.name || photoFile.name, 'people');
        photoUrl = uploaded.url;
      }
      // order arrives as NaN when the number input is cleared — API expects an int.
      const payload = { ...data, photoUrl, order: Number.isFinite(data.order) ? data.order : 0 };
      if (isNew) {
        await createPerson.mutateAsync(payload);
        showToast('success', 'Person created');
      } else {
        await updatePerson.mutateAsync({ id: id!, data: payload });
        showToast('success', 'Person updated');
      }
      navigate('/admin/people');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/people" label="Back to people" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Person' : 'Edit Person'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Name" required error={errors.name?.message}>
          <Input {...register('name', { required: 'Required' })} />
        </FormField>
        <FormField label="Slug" required hint="Auto-filled from name — editable" error={errors.slug?.message}>
          <Input {...register('slug', { required: 'Required', validate: uniqueSlug, onChange: () => setSlugTouched(true) })} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Role" required>
            <Select {...register('role')}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Required' })} />
          </FormField>
        </div>
        <FormField label="Affiliation" required error={errors.affiliation?.message}>
          <Input {...register('affiliation', { required: 'Required' })} />
        </FormField>
        <FormField label="Secondary Affiliation">
          <Input {...register('secondaryAffiliation')} />
        </FormField>
        <ImageUpload
          label="Photo"
          required
          error={photoError || undefined}
          value={watch('photoUrl')}
          onChange={(url) => { setPhotoError(''); setValue('photoUrl', url); }}
          onFile={(file) => { if (file) setPhotoError(''); setPhotoFile(file); }}
        />
        <FormField label="Profile URL">
          <Input {...register('profileUrl')} />
        </FormField>
        <FormField label="Bio">
          <Textarea rows={3} {...register('bio')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Sort order">
            <Input type="number" {...register('order', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Status">
            <Select {...register('status')}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
          Featured
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/people')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
