'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  saveEditableDocument,
  exportDocument,
  type EditableDocument,
} from '@/lib/api-client';

interface DocumentEditorShellProps {
  document: EditableDocument;
  children: (props: {
    content: Record<string, unknown>;
    updateField: (key: string, value: unknown) => void;
    saving: boolean;
  }) => React.ReactNode;
}

/**
 * Shell component that wraps any editable report editor.
 * Handles: save, autosave indicator, export buttons, version display.
 */
export function DocumentEditorShell({ document: doc, children }: DocumentEditorShellProps) {
  const [content, setContent] = useState<Record<string, unknown>>(doc.contentJson);
  const [title, setTitle] = useState(doc.title);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [versionNo, setVersionNo] = useState(doc.currentVersionNo);
  const [dirty, setDirty] = useState(false);

  const updateField = useCallback((key: string, value: unknown) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await saveEditableDocument(doc.id, {
        title,
        contentJson: { ...content, title },
      });
      if (result.data) {
        setVersionNo(result.data.versionNo);
        setLastSaved(new Date().toLocaleTimeString());
        setDirty(false);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [doc.id, title, content]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const handleExport = async (format: 'docx' | 'xlsx') => {
    try {
      await exportDocument(doc.id, format);
    } catch (err: any) {
      alert(err?.message ?? 'Export failed');
    }
  };

  const typeLabels: Record<string, string> = {
    benchmark_report: 'Benchmark Report',
    policy_report: 'Policy Brief',
    project_guidance_report: 'Project Guidance Report',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {typeLabels[doc.type] || doc.type}
            </span>
            <span className="text-xs text-gray-300">v{versionNo}</span>
            {dirty && <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>}
            {lastSaved && !dirty && (
              <span className="text-xs text-green-500">Saved {lastSaved}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('docx')}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Export DOCX
            </button>
            <button
              type="button"
              onClick={() => handleExport('xlsx')}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Export XLSX
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              PDF / Print
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="text-xs px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor body */}
      <div className="max-w-4xl mx-auto px-6 py-8 print:px-0 print:py-0 print:max-w-none">
        {/* Editable title */}
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-transparent focus:border-blue-300 focus:ring-0 bg-transparent pb-1 mb-6"
          placeholder="Document title…"
        />

        {children({ content, updateField, saving })}
      </div>
    </div>
  );
}
