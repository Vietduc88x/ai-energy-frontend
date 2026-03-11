'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Tiptap-based rich text editor for narrative sections.
 * Supports bold, italic, headings, lists, blockquote.
 */
export function RichTextEditor({
  content,
  onChange,
  className = '',
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[60px] px-3 py-2',
      },
    },
  });

  // Sync external content if it changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // Only re-sync when content prop changes, not on every editor update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${disabled ? 'opacity-60' : ''} ${className}`}>
      {!disabled && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-100 bg-gray-50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="B"
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="I"
            title="Italic"
            italic
          />
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="H2"
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            label="H3"
            title="Heading 3"
          />
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="•"
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="1."
            title="Numbered List"
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  title,
  italic,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  title: string;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
      } ${italic ? 'italic' : ''}`}
    >
      {label}
    </button>
  );
}
