import { useEffect, useState } from 'react';
import { useSiteSettings, useUpdateSettings } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/primitives';
import { showToast } from '@/components/admin/Toast';
import { Plus, Trash2 } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import { DEFAULT_BRAND_COLORS } from '@/lib/seed';

function ColorField({ label, hint, value, placeholder, onChange }: {
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label} hint={hint}>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded border border-line"
          aria-label={`${label} picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </FormField>
  );
}

/**
 * Pads an image to a square (1:1) on the brand background and re-encodes it as
 * PNG. Icons have to be square to be eligible for the browser tab, the iOS
 * home screen and the Google site icon, so a non-square upload (e.g. a
 * 376x272 wordmark) is normalised before it is stored.
 */
async function toSquareIcon(file: File, background: string): Promise<File> {
  const load = async (): Promise<{ width: number; height: number; draw: CanvasImageSource }> => {
    try {
      const bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height, draw: bitmap };
    } catch {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Could not read image'));
          el.src = url;
        });
        return { width: img.naturalWidth, height: img.naturalHeight, draw: img };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  };

  let image: { width: number; height: number; draw: CanvasImageSource };
  try {
    image = await load();
  } catch {
    return file;
  }

  const size = Math.max(image.width, image.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);
  const scale = Math.min(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image.draw, (size - width) / 2, (size - height) / 2, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return file;
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.png`, { type: 'image/png' });
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const set = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) =>
    setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    try {
      let next = form;
      if (logoFile) {
        const uploaded = await uploadMediaFile(logoFile, logoFile.name, 'settings');
        next = { ...next, logoUrl: uploaded.url };
      }
      if (faviconFile) {
        // Icons must be square to be usable as tab / home-screen / site icons.
        const square = await toSquareIcon(faviconFile, form.primaryColor || '#123F3F');
        const uploaded = await uploadMediaFile(square, square.name, 'settings');
        next = { ...next, faviconUrl: uploaded.url };
      }
      await updateSettings.mutateAsync(next);
      setForm(next);
      setLogoFile(null);
      setFaviconFile(null);
      showToast('success', 'Settings saved');
    } catch { showToast('error', 'Something went wrong'); }
  };

  const handleResetColors = () => {
    setForm((f) => (f ? { ...f, ...DEFAULT_BRAND_COLORS } : f));
    showToast('success', 'Default colors restored — save to apply');
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Site Settings</h1>
        <p className="text-sm text-ink-muted">Manage logo, colours, social links, navigation labels, and contact info.</p>
      </div>

      <div className="rounded-card border border-line bg-white p-6 space-y-6">
        {/* Branding */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Branding</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload label="Logo" value={form.logoUrl} onChange={(url) => set('logoUrl', url)} onFile={setLogoFile} />
            <ImageUpload
              label="Favicon"
              hint="Square (1:1) image, 512×512 or larger. Non-square uploads are padded automatically."
              value={form.faviconUrl}
              onChange={(url) => set('faviconUrl', url)}
              onFile={setFaviconFile}
            />
          </div>
        </section>

        {/* Colours */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Colours</h2>
            <Button type="button" variant="ghost" size="sm" onClick={handleResetColors}>
              Reset to defaults
            </Button>
          </div>
          <p className="text-xs text-ink-muted">Light and dark mode each use their own brand colors. Changes apply after saving.</p>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-ink">Light mode</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary Colour"
                hint="Used for headers and buttons"
                value={form.primaryColor}
                placeholder="#123F3F"
                onChange={(v) => set('primaryColor', v)}
              />
              <ColorField
                label="Accent Colour"
                hint="Used for highlights and links"
                value={form.accentColor}
                placeholder="#C55A2A"
                onChange={(v) => set('accentColor', v)}
              />
              <ColorField
                label="Background Colour"
                hint="Page background"
                value={form.backgroundColor}
                placeholder="#f4f1e9"
                onChange={(v) => set('backgroundColor', v)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-ink">Dark mode</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary Colour"
                hint="Used for headers and buttons"
                value={form.primaryColorDark}
                placeholder="#123F3F"
                onChange={(v) => set('primaryColorDark', v)}
              />
              <ColorField
                label="Accent Colour"
                hint="Used for highlights and links"
                value={form.accentColorDark}
                placeholder="#C55A2A"
                onChange={(v) => set('accentColorDark', v)}
              />
              <ColorField
                label="Background Colour"
                hint="Page background"
                value={form.backgroundColorDark}
                placeholder="#0e1616"
                onChange={(v) => set('backgroundColorDark', v)}
              />
            </div>
          </div>
        </section>

        {/* Navigation Labels */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Navigation Labels</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(form.navLabels).map(([key, label]) => (
              <FormField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <Input
                  value={label}
                  onChange={(e) => set('navLabels', { ...form.navLabels, [key]: e.target.value })}
                />
              </FormField>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Social Links</h2>
          {form.socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={link.platform}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = { ...next[i], platform: e.target.value };
                  set('socialLinks', next);
                }}
                placeholder="Platform"
                className="w-32 shrink-0 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[i] = { ...next[i], url: e.target.value };
                  set('socialLinks', next);
                }}
                placeholder="https://..."
                className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => set('socialLinks', form.socialLinks.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-md p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('socialLinks', [...form.socialLinks, { platform: '', url: '' }])}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-sm text-ink-muted hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Add social link
          </button>
        </section>

        {/* Contact & Footer */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Contact & Footer</h2>
          <FormField label="Contact Email">
            <Input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </FormField>
          <FormField label="Footer Text">
            <Textarea rows={2} value={form.footerText} onChange={(e) => set('footerText', e.target.value)} />
          </FormField>
        </section>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateSettings.isLoading}>
            {updateSettings.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
