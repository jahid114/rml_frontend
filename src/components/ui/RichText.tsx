import { sanitizeHtml } from '@/lib/utils';

// Renders sanitized HTML from the rich text editor consistently.
export function RichText({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeHtml(html);
  return <div className={`prose-rml ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
