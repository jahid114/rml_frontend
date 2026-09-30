import { useState } from 'react';
import { useMedia, useCreateMedia, useDeleteMedia } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { Button, Skeleton } from '@/components/ui/primitives';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Trash2, ExternalLink, X } from 'lucide-react';
import type { MediaItem } from '@/lib/types';

export default function MediaPage() {
  const { data: media = [], isLoading } = useMedia();
  const createMedia = useCreateMedia();
  const deleteMedia = useDeleteMedia();
  const [target, setTarget] = useState<MediaItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [filename, setFilename] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async () => {
    if (!file && !url) { showToast('error', 'Please upload an image or enter a URL'); return; }
    if (!filename.trim()) { showToast('error', 'Filename is required'); return; }
    setSaving(true);
    try {
      if (file) {
        // Real file → object storage; the media row is created by the upload.
        await uploadMediaFile(file, altText.trim() || filename.trim(), 'media');
      } else {
        // External URL → linked as a media row without uploading.
        await createMedia.mutateAsync({
          url,
          filename: filename.trim(),
          altText: altText.trim() || filename.trim(),
        });
      }
      showToast('success', 'Media uploaded');
      setUrl(''); setFilename(''); setAltText(''); setFile(null); setShowForm(false);
    } catch {
      showToast('error', 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Media</h1>
          <p className="text-sm text-ink-muted">Upload and manage images and assets.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? 'Cancel' : 'Upload'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-card border border-line bg-white p-6 space-y-4">
          <ImageUpload
            label="Image"
            value={url}
            onChange={setUrl}
            onFile={setFile}
            maxSizeMB={5}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Filename</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. event-flyer.png"
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Alt text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <Button onClick={handleUpload} disabled={createMedia.isLoading || saving}>
            {saving || createMedia.isLoading ? 'Saving...' : 'Save to Media'}
          </Button>
        </div>
      )}

      {media.length === 0 ? (
        <p className="text-sm text-ink-muted">No media items yet. Click "Upload" to add images.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-card border border-line bg-white">
              <img src={m.url} alt={m.altText} className="h-40 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink">{m.filename}</p>
                <p className="truncate text-xs text-ink-muted">{m.altText}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-white/90 p-1.5 text-ink-muted shadow-sm hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setTarget(m)}
                  className="rounded bg-white/90 p-1.5 text-ink-muted shadow-sm hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!target}
        title="Delete media"
        message={`Remove "${target?.filename}"?`}
        onConfirm={async () => {
          if (!target) return;
          await deleteMedia.mutateAsync(target.id);
          showToast('success', 'Media deleted');
          setTarget(null);
        }}
        onCancel={() => setTarget(null)}
        loading={deleteMedia.isLoading}
      />
    </div>
  );
}
