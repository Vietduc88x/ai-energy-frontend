'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';
import { CardSkeleton } from '@/components/skeleton';

interface DocInput {
  title: string;
  content: string;
  filename: string;
}

interface FindingResult {
  controlCode: string;
  result: string;
  severity: string;
  recommendation: string | null;
}

interface SectionResult {
  id: string;
  label: string;
  findings: FindingResult[];
}

interface AssessResult {
  runId: string;
  framework: string;
  summary: { total: number; passed: number; failed: number; warnings: number; score: number };
  sections: SectionResult[];
}

const SEVERITY_BAR: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-50',
  high: 'border-l-orange-400 bg-orange-50',
  medium: 'border-l-amber-400 bg-amber-50',
  low: 'border-l-blue-400 bg-blue-50',
  info: 'border-l-gray-300',
};

const RESULT_BADGE: Record<string, string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  fail: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  not_applicable: 'bg-gray-100 text-gray-500',
  insufficient_data: 'bg-gray-100 text-gray-500',
};

function AssessForm({ onResult }: { onResult: (r: AssessResult) => void }) {
  const [framework, setFramework] = useState<'tdd' | 'epc'>('tdd');
  const [projectName, setProjectName] = useState('');
  const [docs, setDocs] = useState<DocInput[]>([{ title: '', content: '', filename: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addDoc() { setDocs(d => [...d, { title: '', content: '', filename: '' }]); }
  function removeDoc(i: number) { setDocs(d => d.filter((_, j) => j !== i)); }
  function updateDoc(i: number, field: keyof DocInput, val: string) {
    setDocs(d => d.map((doc, j) => j === i ? { ...doc, [field]: val } : doc));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validDocs = docs.filter(d => d.title && d.content);
    if (!validDocs.length) { setError('Add at least one document with a title and content.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/assess', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          projectName: projectName || undefined,
          documents: validDocs.map(d => ({
            title: d.title, content: d.content,
            source: d.filename ? { filename: d.filename } : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Framework toggle */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Framework</p>
        <div className="flex gap-3">
          {(['tdd', 'epc'] as const).map(fw => (
            <button
              key={fw} type="button"
              onClick={() => setFramework(fw)}
              className={[
                'flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors',
                framework === fw ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300',
              ].join(' ')}
            >
              {fw === 'tdd' ? '📋 Technical Due Diligence' : '📝 EPC Contract Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Project name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project name (optional)</label>
        <input
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="e.g. Mekong Solar Phase 1"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Documents</p>
          <button type="button" onClick={addDoc} className="text-xs text-emerald-600 hover:underline font-medium">+ Add document</button>
        </div>
        <div className="space-y-4">
          {docs.map((doc, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              {docs.length > 1 && (
                <button type="button" onClick={() => removeDoc(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-sm">✕</button>
              )}
              <input
                value={doc.title}
                onChange={e => updateDoc(i, 'title', e.target.value)}
                placeholder={`Document ${i + 1} title (e.g. EPC Contract Draft v3)`}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={doc.content}
                onChange={e => updateDoc(i, 'content', e.target.value)}
                placeholder="Paste document content or key clauses here…"
                rows={6}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
              <input
                value={doc.filename}
                onChange={e => updateDoc(i, 'filename', e.target.value)}
                placeholder="Filename (optional, e.g. contract-v3.pdf)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analysing…' : 'Run assessment'}
      </button>
    </form>
  );
}

function AssessResults({ result, onReset }: { result: AssessResult; onReset: () => void }) {
  const score = result.summary.score;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Results · {result.framework.toUpperCase()}</h2>
        <button onClick={onReset} className="text-sm text-emerald-600 hover:underline">New assessment</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: result.summary.total, color: 'text-gray-900' },
          { label: 'Passed', value: result.summary.passed, color: 'text-emerald-600' },
          { label: 'Failed', value: result.summary.failed, color: 'text-red-600' },
          { label: 'Warnings', value: result.summary.warnings, color: 'text-amber-600' },
          { label: 'Score', value: `${(score * 100).toFixed(0)}%`, color: score >= 0.7 ? 'text-emerald-600' : 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="border border-gray-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {result.sections.map(section => (
        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">{section.label}</span>
            <span className="text-xs text-gray-400">{section.findings.length} controls</span>
          </div>
          <div className="divide-y divide-gray-50">
            {section.findings.map(f => (
              <div key={f.controlCode} className={`px-5 py-3 border-l-4 ${SEVERITY_BAR[f.severity] ?? ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{f.controlCode}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RESULT_BADGE[f.result] ?? 'bg-gray-100 text-gray-600'}`}>{f.result}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RESULT_BADGE[f.severity] ?? 'bg-gray-100 text-gray-600'}`}>{f.severity}</span>
                </div>
                {f.recommendation && <p className="text-xs text-gray-600">{f.recommendation}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AssessPage() {
  const session = useSession();
  const [result, setResult] = useState<AssessResult | null>(null);

  return (
    <ProtectedRoute session={session}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Technical Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Evaluate project documents against TDD or EPC controls</p>
        </div>
        {result ? (
          <AssessResults result={result} onReset={() => setResult(null)} />
        ) : (
          <AssessForm onResult={setResult} />
        )}
      </div>
    </ProtectedRoute>
  );
}
