import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/components/ui/cn';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /**
   * Called with the selected file (or null when cleared / switching to URL
   * mode). The parent uploads it via uploadMediaFile() on submit and writes
   * the returned public URL back through onChange. When omitted, falls back
   * to the legacy inline data-URL behavior.
   */
  onFile?: (file: File | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  required?: boolean;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  onFile,
  label = 'Image',
  hint,
  accept = 'image/*',
  maxSizeMB = 5,
  className,
  required,
  error,
}: ImageUploadProps) {
  const safeValue = value ?? '';
  const [mode, setMode] = useState<'upload' | 'url'>(safeValue.startsWith('http') ? 'url' : 'upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs when replaced or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const clearFile = useCallback(() => {
    clearPreview();
    onFile?.(null);
  }, [clearPreview, onFile]);

  const switchMode = useCallback(
    (next: 'upload' | 'url') => {
      setMode(next);
      setFileError('');
      if (next === 'url') clearFile();
    },
    [clearFile]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setFileError('');
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFileError(`File exceeds ${maxSizeMB} MB limit`);
        return;
      }
      if (!onFile) {
        // Legacy path: inline data URL (no backend upload wired up).
        setLoading(true);
        try {
          const dataURL = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
          onChange(dataURL);
        } catch (e) {
          setFileError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
          setLoading(false);
        }
        return;
      }
      clearPreview();
      setPreviewUrl(URL.createObjectURL(file));
      onFile(file);
    },
    [onChange, onFile, maxSizeMB, clearPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    clearFile();
    onChange('');
    setFileError('');
  }, [clearFile, onChange]);

  const isDataUrl = safeValue.startsWith('data:');
  const isHttpUrl = safeValue.startsWith('http');
  const displaySrc = previewUrl ?? (safeValue || null);
  const hasImage = !!displaySrc;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        <div className="flex rounded-md border border-line text-xs">
          <button
            type="button"
            onClick={() => switchMode('upload')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 transition-colors',
              mode === 'upload' ? 'bg-primary text-white' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Upload className="h-3 w-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => switchMode('url')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 transition-colors',
              mode === 'url' ? 'bg-primary text-white' : 'text-ink-muted hover:text-ink'
            )}
          >
            <LinkIcon className="h-3 w-3" />
            URL
          </button>
        </div>
      </div>

      {hint && <p className='text-xs text-ink-muted'>{hint}</p>}

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50',
            hasImage && 'p-3'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          {hasImage && displaySrc ? (
            <div className="relative w-full">
              <img
                src={displaySrc}
                alt="Preview"
                className="mx-auto max-h-48 rounded object-contain"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {previewUrl ? (
                <p className="mt-2 text-center text-xs text-ink-muted">Selected — will upload on save</p>
              ) : (
                isDataUrl && (
                  <p className="mt-2 text-center text-xs text-ink-muted">Uploaded image (stored as data URL)</p>
                )
              )}
            </div>
          ) : (
            <>
              <ImageIcon className="mb-2 h-8 w-8 text-ink-muted/40" />
              <p className="text-sm text-ink-muted">
                {loading ? 'Processing...' : 'Click or drag to upload'}
              </p>
              <p className="mt-1 text-xs text-ink-muted/60">Max {maxSizeMB} MB</p>
            </>
          )}
        </div>
      ) : (
        <input
          ref={urlInputRef}
          type="url"
          value={isHttpUrl ? safeValue : ''}
          onChange={(e) => { setFileError(''); onChange(e.target.value); }}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}

      {(error || fileError) && <p className="text-xs text-red-600">{error || fileError}</p>}

      {hasImage && mode === 'url' && (
        <div className="flex items-center gap-2">
          <img src={safeValue} alt="Preview" className="h-16 w-16 rounded object-cover" />
          <button
            type="button"
            onClick={() => { onChange(''); setFileError(''); }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
