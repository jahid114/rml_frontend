import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePartners, useCreatePartner, useUpdatePartner } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { BackButton } from '@/components/admin/BackButton';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';

interface Form {
  name: string;
  logoUrl: string;
  link: string;
  order: number;
}

export default function PartnerFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data: partners = [] } = usePartners();
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const existing = !isNew ? partners.find((p) => p.id === id) : undefined;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: { name: '', logoUrl: '', link: '', order: 0 },
  });

  useEffect(() => {
    if (existing) reset({ ...existing, link: existing.link ?? '' });
  }, [existing, reset]);

  const optionalUrl = (v: string) =>
    !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim()) || 'Must be a valid URL';

  const onSubmit = async (data: Form) => {
    if (!data.logoUrl && !logoFile) { setLogoError('Logo is required'); return; }
    setLogoError('');
    try {
      let logoUrl = data.logoUrl;
      if (logoFile) logoUrl = (await uploadMediaFile(logoFile, data.name || logoFile.name, 'partners')).url;
      const payload = { ...data, logoUrl, link: data.link.trim(), order: Number.isFinite(data.order) ? data.order : 0 };
      if (isNew) {
        await createPartner.mutateAsync(payload);
        showToast('success', 'Partner created');
      } else {
        await updatePartner.mutateAsync({ id: id!, data: payload });
        showToast('success', 'Partner updated');
      }
      navigate('/admin/partners');
    } catch {
      showToast('error', 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/admin/partners" label="Back to partners" />
      <h1 className="text-2xl font-semibold text-ink">{isNew ? 'Add Partner' : 'Edit Partner'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-line bg-white p-6">
        <FormField label="Name" required error={errors.name?.message}>
          <Input {...register('name', { required: 'Required', validate: (v) => v.trim() ? true : 'Required' })} />
        </FormField>
        <ImageUpload
          label="Logo"
          required
          error={logoError || undefined}
          value={watch('logoUrl')}
          onChange={(url) => { setLogoError(''); setValue('logoUrl', url); }}
          onFile={(file) => { if (file) setLogoError(''); setLogoFile(file); }}
        />
        <FormField label="Link" error={errors.link?.message}>
          <Input {...register('link', { validate: optionalUrl })} placeholder="https://..." />
        </FormField>
        <FormField label="Order" hint="Lower numbers appear first">
          <Input type="number" {...register('order', { valueAsNumber: true })} />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>{isNew ? 'Create' : 'Save'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/partners')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
