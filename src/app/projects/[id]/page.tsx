'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';

interface Project {
  id: string;
  name: string;
  slug: string;
  technology: string;
  stage: string;
  capacityMw: number | null;
  countryCode: string | null;
  createdAt: string;
}

const TECH_ICONS: Record<string, string> = {
  solar_pv: '☀', onshore_wind: '💨', offshore_wind: '🌊', bess: '🔋', hybrid: '⚡',
};
const TECH_LABELS: Record<string, string> = {
  solar_pv: 'Solar PV', onshore_wind: 'Onshore Wind', offshore_wind: 'Offshore Wind', bess: 'BESS', hybrid: 'Hybrid',
};

const PIPELINE: { key: string; label: string }[] = [
  { key: 'origination', label: 'Origination' },
  { key: 'development', label: 'Development' },
  { key: 'pre_construction', label: 'Pre-Construction' },
  { key: 'ntp_ready', label: 'NTP Ready' },
  { key: 'construction', label: 'Construction' },
  { key: 'commissioning', label: 'Commissioning' },
  { key: 'taking_over', label: 'Taking Over' },
  { key: 'operations', label: 'Operations' },
  { key: 'fac_closed', label: 'FAC Closed' },
];

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

function StagePipeline({ stage }: { stage: string }) {
  const currentIdx = PIPELINE.findIndex(s => s.key === stage);
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-0 min-w-max">
        {PIPELINE.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center">
              <div className={[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full',
                active ? 'bg-emerald-600 text-white shadow-sm' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400',
              ].join(' ')}>
                {done && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                {s.label}
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={`w-4 h-px ${i < currentIdx ? 'bg-emerald-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectDetailInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [editStage, setEditStage] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [stageLoading, setStageLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Project>(`/api/v1/projects/${id}`)
      .then(p => { setProject(p); setNewStage(p.stage); })
      .catch(() => setError('Project not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStage() {
    if (!project || newStage === project.stage) { setEditStage(false); return; }
    setStageLoading(true);
    try {
      const updated = await apiFetch<Project>(`/api/v1/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      });
      setProject(updated);
      setEditStage(false);
    } catch { /* ignore */ }
    finally { setStageLoading(false); }
  }

  async function deleteProject() {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/v1/projects/${id}`, { method: 'DELETE' });
      router.push('/projects');
    } catch { setDeleting(false); }
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>;
  if (error || !project) return (
    <div className="text-center py-12">
      <p className="text-gray-400 text-sm">{error || 'Project not found.'}</p>
      <Link href="/projects" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">← Back to projects</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/projects" className="text-gray-400 hover:text-gray-600 mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{TECH_ICONS[project.technology] ?? '⚡'}</span>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {TECH_LABELS[project.technology]}{project.capacityMw ? ` · ${project.capacityMw} MW` : ''}{project.countryCode ? ` · ${project.countryCode}` : ''}
            </p>
          </div>
        </div>
        <button onClick={deleteProject} disabled={deleting} className="text-xs text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {/* Stage pipeline */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Development pipeline</h2>
          <button onClick={() => setEditStage(s => !s)} className="text-xs text-emerald-600 hover:underline">
            {editStage ? 'Cancel' : 'Update stage'}
          </button>
        </div>
        <StagePipeline stage={project.stage} />
        {editStage && (
          <div className="flex gap-2 pt-2">
            <select
              value={newStage}
              onChange={e => setNewStage(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PIPELINE.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button onClick={updateStage} disabled={stageLoading} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {stageLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Technology', value: TECH_LABELS[project.technology] ?? project.technology },
          { label: 'Capacity', value: project.capacityMw ? `${project.capacityMw} MW` : '—' },
          { label: 'Country', value: project.countryCode ?? '—' },
          { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
        ].map(d => (
          <div key={d.label} className="border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{d.label}</div>
            <div className="font-semibold text-gray-900 text-sm">{d.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Assess', icon: '📋', href: '/assess', desc: 'TDD / EPC review' },
            { label: 'Compare', icon: '📊', href: '/compare', desc: 'LCOE comparison' },
            { label: 'Scenario', icon: '📈', href: '/scenario', desc: 'Stress-test model' },
            { label: 'Chat', icon: '💬', href: '/chat', desc: 'Ask AI anything' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors group text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">{action.label}</div>
                <div className="text-xs text-gray-400">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <ProjectDetailInner />
    </ProtectedRoute>
  );
}
