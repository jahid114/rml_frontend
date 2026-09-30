import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePublications, useCreatePublication, useUpdatePublication } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Select, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { slugify } from '@/lib/utils';
import type { PublicationType } from '@/lib/types';

const TYPES: { value: PublicationType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'journal-article', label: 'Journal Article' },
  { value: 'policy-paper', label: 'Policy Paper' },
  { value: 'chapter', label: 'Book Chapter' },
];

interface Form {
  title: string;
  slug: string;
  type: PublicationType;
  coverImageUrl: string;
  description: string;
  authors: string;
  year: number;
  externalUrl: string;
  status: 'draft' | 'published';
}

export default function PublicationFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: pubs = [] } = usePublications();
  const createPub = useCreatePublication();
  const updatePub = useUpdatePublication();
  const existing = !isNew ? pubs.find((p) => p.id === id) : undefined;
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: existing
      ? { ...existing, authors: existing.authors.join(', ') }
      : { title: '', slug: '', type: 'book', coverImageUrl: '', description: '', authors: '', year: new Date().getFullYear(), externalUrl: '', status: 'published' },
  });

  useEffect(() => {
    if (existing) reset({ ...existing, authors: existing.authors.join(', ') });
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
    !pubs.some((p) => p.id !== id && p.slug.toLowerCase() === v.trim().toLowerCase()) ||
    'Slug is already in use';

  const nonEmpty = (v: string) => (v.trim() ? true : 'Required');
  const optionalUrl = (v: string) =>
    !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim()) || 'Must be a valid URL';
  const atLeastOneAuthor = (v: string) =>
    v.split(',').map((s) => s.trim()).filter(Boolean).length > 0 || 'At least one author is required';

  const onSubmit = async (data: Form) => {
    const payload = { ...data, authors: data.authors.split(',').map((s) => s.trim()).filter(Boolean) };
    if (!payload.coverImageUrl && !coverFile) { setCoverError('Cover image is required'); return; }
    setCoverError('');
    if (!Number.isFinite(payload.year)) { showToast('error', 'Enter a valid year'); return; }
    try {
      let coverImageUrl = payload.coverImageUrl;
      if (coverFile) {
        coverImageUrl = (await uploadMediaFile(coverFile, data.title || coverFile.name, 'publications')).url;
      }
      const finalPayload = { ...payload, coverImageUrl };
      if (isNew) {
        await createPub.mutateAsync(finalPayload);
        showToast('success', 'Publication created');
      } else {
        await updatePub.mutateAsync({ id: id!, data: finalPayload });
        showToast('success', 'Publication updated');
      }
      navigate('/admin/publications');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/publications" label="Back to publications" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Publication' : 'Edit Publication'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Title" required error={errors.title?.message}>
          <Input {...register('title', { required: 'Required' })} />
        </FormField>
        <FormField label="Slug" required hint="Auto-filled from title — editable" error={errors.slug?.message}>
          <Input {...register('slug', { required: 'Required', validate: uniqueSlug, onChange: () => setSlugTouched(true) })} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Type" required>
            <Select {...register('type')}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
          </FormField>
          <FormField label="Year" required error={errors.year?.message}>
            <Input
              type="number"
              {...register('year', {
                valueAsNumber: true,
                required: 'Required',
                min: { value: 1900, message: 'Enter a valid year' },
                max: { value: 2100, message: 'Enter a valid year' },
              })}
            />
          </FormField>
        </div>
        <FormField label="Authors" required hint="Comma-separated" error={errors.authors?.message}>
          <Input {...register('authors', { required: 'Required', validate: atLeastOneAuthor })} />
        </FormField>
        <ImageUpload
          label="Cover Image"
          required
          error={coverError || undefined}
          value={watch('coverImageUrl')}
          onChange={(url) => { setCoverError(''); setValue('coverImageUrl', url); }}
          onFile={(file) => { if (file) setCoverError(''); setCoverFile(file); }}
        />
        <FormField label="Purchase Link" error={errors.externalUrl?.message}>
          <Input {...register('externalUrl', { validate: optionalUrl })} placeholder="https://..." />
        </FormField>
        <FormField label="Description" required error={errors.description?.message}>
          <Textarea rows={4} {...register('description', { required: 'Required', validate: nonEmpty })} />
        </FormField>
        <FormField label="Status">
          <Select {...register('status')}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/publications')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
