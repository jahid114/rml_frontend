import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useResearchThemes, useCreateResearchTheme, useUpdateResearchTheme } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { slugify, isRichTextEmpty } from '@/lib/utils';

// Tiptap is heavy — load it only when an admin opens this form.
const RichTextEditor = lazy(() =>
  import('@/components/admin/RichTextEditor').then((m) => ({ default: m.RichTextEditor })),
);

interface Form {
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImageUrl: string;
}

export default function ResearchFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: themes = [] } = useResearchThemes();
  const createTheme = useCreateResearchTheme();
  const updateTheme = useUpdateResearchTheme();
  const existing = !isNew ? themes.find((t) => t.id === id) : undefined;
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: existing ?? { title: '', slug: '', summary: '', body: '', coverImageUrl: '' },
  });

  useEffect(() => {
    if (existing) reset(existing);
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
    !themes.some((t) => t.id !== id && t.slug.toLowerCase() === v.trim().toLowerCase()) ||
    'Slug is already in use';

  const onSubmit = async (data: Form) => {
    if (!data.coverImageUrl && !coverFile) { setCoverError('Cover image is required'); return; }
    setCoverError('');
    let coverImageUrl = data.coverImageUrl;
    if (coverFile) {
      try {
        coverImageUrl = (await uploadMediaFile(coverFile, data.title || coverFile.name, 'research')).url;
      } catch {
        showToast('error', 'Image upload failed');
        return;
      }
    }
    const payload = {
      ...data,
      coverImageUrl,
      relatedPublicationIds: existing?.relatedPublicationIds ?? [],
      relatedPersonIds: existing?.relatedPersonIds ?? [],
    };
    try {
      if (isNew) {
        await createTheme.mutateAsync(payload);
        showToast('success', 'Theme created');
      } else {
        await updateTheme.mutateAsync({ id: id!, data: payload });
        showToast('success', 'Theme updated');
      }
      navigate('/admin/research');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/research" label="Back to research" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Research Theme' : 'Edit Research Theme'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Title" required error={errors.title?.message}>
          <Input {...register('title', { required: 'Required' })} />
        </FormField>
        <FormField label="Slug" required hint="Auto-filled from title — editable" error={errors.slug?.message}>
          <Input {...register('slug', { required: 'Required', validate: uniqueSlug, onChange: () => setSlugTouched(true) })} />
        </FormField>
        <FormField label="Summary" required error={errors.summary?.message}>
          <Textarea rows={2} {...register('summary', { required: 'Required', validate: (v) => v.trim() ? true : 'Required' })} />
        </FormField>
        <FormField label="Body" required error={errors.body?.message}>
          <Controller
            name="body"
            control={control}
            rules={{ required: 'Required', validate: (v) => !isRichTextEmpty(v) || 'Required' }}
            render={({ field }) => (
              <Suspense fallback={<div className="h-[220px] animate-pulse rounded-md border border-line bg-line/20" aria-label="Loading editor" />}>
                <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Write the research body…" />
              </Suspense>
            )}
          />
        </FormField>
        <ImageUpload
          label="Cover Image"
          required
          error={coverError || undefined}
          value={watch('coverImageUrl')}
          onChange={(url) => { setCoverError(''); setValue('coverImageUrl', url); }}
          onFile={(file) => { if (file) setCoverError(''); setCoverFile(file); }}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/research')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
