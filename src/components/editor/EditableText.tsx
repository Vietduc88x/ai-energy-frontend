'use client';

import { useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  disabled?: boolean;
}

/**
 * Inline contentEditable text field for titles, subtitles, and short text.
 * NOT a rich text editor — just plain text with configurable HTML tag.
 */
export function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit…',
  tag: Tag = 'p',
  disabled = false,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  // Sync external value → DOM (only when DOM differs)
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <Tag
      ref={ref as any}
      contentEditable={!disabled}
      suppressContentEditableWarning
      className={`outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 rounded px-1 -mx-1 ${
        disabled ? '' : 'hover:bg-gray-50 cursor-text'
      } ${!value ? 'text-gray-400' : ''} ${className}`}
      data-placeholder={placeholder}
      onBlur={(e) => {
        const text = (e.target as HTMLElement).textContent || '';
        if (text !== value) onChange(text);
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
    />
  );
}
