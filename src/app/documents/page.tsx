'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import {
  listEditableDocuments,
  deleteEditableDocument,
  type EditableDocumentSummary,
} from '@/lib/api-client';

const TYPE_LABELS: Record<string, string> = {
  benchmark_report: 'Benchmark',
  policy_report: 'Policy Brief',
  project_guidance_report: 'Guidance',
};

const TYPE_COLORS: Record<string, string> = {
  benchmark_report: 'bg-teal-50 text-teal-700',
  policy_report: 'bg-blue-50 text-blue-700',
  project_guidance_report: 'bg-purple-50 text-purple-700',
};

function DocumentsListContent() {
  const { user, loading: sessionLoading } = useSession();
  const [docs, setDocs] = useState<EditableDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    const { data } = await listEditableDocuments();
    if (data) setDocs(data.documents);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionLoading || !user) return;
    fetchDocs();
  }, [user, sessionLoading, fetchDocs]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteEditableDocument(id);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading documents…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to view your documents.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <Link
          href="/compare"
          className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          New from Chat
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-300 text-5xl mb-4">📄</div>
          <p className="text-gray-500 mb-2">No documents yet.</p>
          <p className="text-gray-400 text-sm">
            Generate a report in the chat and click &quot;Edit&quot; to create your first editable document.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_COLORS[doc.type] || 'bg-gray-100 text-gray-600'}`}>
                      {TYPE_LABELS[doc.type] || doc.type}
                    </span>
                    <span className="text-xs text-gray-400">v{doc.currentVersionNo}</span>
                    {doc.status === 'final' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">Final</span>
                    )}
                  </div>
                  <Link
                    href={`/documents/edit?id=${doc.id}`}
                    className="text-gray-900 font-medium hover:text-blue-600 transition-colors truncate block"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()} at {new Date(doc.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/documents/edit?id=${doc.id}`}
                    className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading…</div></div>}>
      <DocumentsListContent />
    </Suspense>
  );
}
