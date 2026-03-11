'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { getEditableDocument, type EditableDocument } from '@/lib/api-client';
import { DocumentEditorShell } from '@/components/editor/DocumentEditorShell';
import { BenchmarkEditor } from '@/components/editor/BenchmarkEditor';
import { PolicyEditor } from '@/components/editor/PolicyEditor';
import { GuidanceEditor } from '@/components/editor/GuidanceEditor';

function EditPageContent() {
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const [doc, setDoc] = useState<EditableDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const id = searchParams.get('id');

  useEffect(() => {
    if (sessionLoading || !user) return;
    if (!id) { setError('No document ID provided'); setLoading(false); return; }

    getEditableDocument(id).then(({ data, error: err }) => {
      if (err || !data) {
        setError(typeof err === 'string' ? err : err?.message || 'Document not found');
      } else {
        setDoc(data);
      }
      setLoading(false);
    });
  }, [id, user, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading document…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to edit documents.</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Document not found'}</p>
      </div>
    );
  }

  return (
    <DocumentEditorShell document={doc}>
      {({ content, updateField }) => {
        switch (doc.type) {
          case 'benchmark_report':
            return <BenchmarkEditor content={content} updateField={updateField} />;
          case 'policy_report':
            return <PolicyEditor content={content} updateField={updateField} />;
          case 'project_guidance_report':
            return <GuidanceEditor content={content} updateField={updateField} />;
          default:
            return <p className="text-gray-500">Unknown document type: {doc.type}</p>;
        }
      }}
    </DocumentEditorShell>
  );
}

export default function EditDocumentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading…</div></div>}>
      <EditPageContent />
    </Suspense>
  );
}
