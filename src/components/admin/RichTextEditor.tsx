import { useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Unlink,
  Eraser,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '@/components/ui/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// Word-like text sizing. Stored as <span data-size="small|large|xl"> (never
// inline styles, so sanitizeHtml preserves it) and rendered by the
// `.prose-rml [data-size]` rules — identical scale in admin and public.
const FontSize = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-size'),
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return { 'data-size': attributes.size };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-size]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
});

const FONT_SIZES = [
  { value: '', label: 'Normal' },
  { value: 'small', label: 'Small' },
  { value: 'large', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
] as const;

function FontSizeControl({ editor }: { editor: Editor }) {
  const current =
    FONT_SIZES.find((s) => s.value && editor.isActive('fontSize', { size: s.value }))?.value ?? '';
  return (
    <select
      value={current}
      onChange={(e) => {
        const size = e.target.value;
        if (!size) editor.chain().focus().unsetMark('fontSize').run();
        else editor.chain().focus().setMark('fontSize', { size }).run();
      }}
      title="Text size"
      aria-label="Text size"
      className="rounded border border-line bg-white px-1.5 py-1 text-xs text-ink focus:border-primary focus:outline-none"
    >
      {FONT_SIZES.map((s) => (
        <option key={s.label} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        'rounded p-1.5 transition-colors',
        active ? 'bg-primary text-white' : 'text-ink-muted hover:bg-primary/10 hover:text-ink',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-ink-muted',
      )}
    >
      {children}
    </button>
  );
}

function LinkControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const isLinked = editor.isActive('link');

  const apply = () => {
    const href = url.trim();
    if (!href) return;
    editor.chain().focus().setLink({ href }).run();
    setUrl('');
    setOpen(false);
  };

  if (!open) {
    return (
      <>
        <ToolbarButton onClick={() => { setUrl(editor.getAttributes('link').href ?? ''); setOpen(true); }} active={isLinked} title="Add link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {isLinked && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}
      </>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } if (e.key === 'Escape') setOpen(false); }}
        placeholder="https://..."
        className="w-44 rounded border border-line px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
      />
      <ToolbarButton onClick={apply} title="Apply link">
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setOpen(false)} title="Cancel">
        <Unlink className="h-4 w-4" />
      </ToolbarButton>
    </span>
  );
}

// Controlled WYSIWYG editor. Value is an HTML string — the caller never
// touches markup; conversion happens automatically on every keystroke.
export function RichTextEditor({ value, onChange, placeholder = 'Write something…', className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      FontSize,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        // No text-size class here: content renders at the same size as the
        // public site so the admin preview is WYSIWYG.
        class: 'prose-rml max-w-none min-h-[180px] px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Keep the editor in sync when the parent resets the value
  // (e.g. existing content loading in edit mode). useEditor owns
  // creation/destruction, so never touch a destroyed instance here.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="h-[220px] animate-pulse rounded-md border border-line bg-line/20" aria-label="Loading editor" />;
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-line bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-canvas px-2 py-1.5" role="toolbar" aria-label="Formatting">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <FontSizeControl editor={editor} />
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <LinkControl editor={editor} />
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
