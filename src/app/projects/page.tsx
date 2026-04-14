'use client';

import { useState, useEffect } from 'react';
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
const STAGE_LABELS: Record<string, string> = {
  origination: 'Origination', development: 'Development', pre_construction: 'Pre-Construction',
  ntp_ready: 'NTP Ready', construction: 'Construction', commissioning: 'Commissioning',
  taking_over: 'Taking Over', operations: 'Operations', fac_closed: 'FAC Closed',
};
const STAGE_COLOR: Record<string, string> = {
  origination: 'bg-gray-100 text-gray-600',
  development: 'bg-blue-100 text-blue-700',
  pre_construction: 'bg-indigo-100 text-indigo-700',
  ntp_ready: 'bg-violet-100 text-violet-700',
  construction: 'bg-amber-100 text-amber-700',
  commissioning: 'bg-orange-100 text-orange-700',
  taking_over: 'bg-emerald-100 text-emerald-700',
  operations: 'bg-emerald-200 text-emerald-800',
  fac_closed: 'bg-gray-200 text-gray-700',
};

const TECH_OPTIONS = Object.entries(TECH_LABELS).map(([v, l]) => ({ value: v, label: l }));
const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([v, l]) => ({ value: v, label: l }));

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

function ProjectsInner() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', technology: 'solar_pv', stage: 'origination', capacityMw: '', countryCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ projects: Project[]; total: number }>('/api/v1/projects')
      .then(d => { setProjects(d.projects); setTotal(d.total); })
      .catch(() => {});
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await apiFetch('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name, technology: form.technology, stage: form.stage,
          capacityMw: form.capacityMw ? Number(form.capacityMw) : undefined,
          countryCode: form.countryCode || undefined,
        }),
      });
      const d = await apiFetch<{ projects: Project[]; total: number }>('/api/v1/projects');
      setProjects(d.projects); setTotal(d.total);
      setShowNew(false);
      setForm({ name: '', technology: 'solar_pv', stage: 'origination', capacityMw: '', countryCode: '' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{total} project{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(s => !s)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          + New project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: '📁' },
          { label: 'Construction', value: projects.filter(p => p.stage === 'construction').length, icon: '🏗' },
          { label: 'Operating', value: projects.filter(p => p.stage === 'operations').length, icon: '⚡' },
          { label: 'Total MW', value: `${projects.reduce((s, p) => s + (p.capacityMw ?? 0), 0).toFixed(0)} MW`, icon: '🔋' },
        ].map(stat => (
          <div key={stat.label} className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* New project form */}
      {showNew && (
        <form onSubmit={createProject} className="border border-gray-200 rounded-xl p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold text-sm text-gray-900">New project</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Project name (e.g. Mekong Solar Phase 1)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={form.technology} onChange={e => setForm(f => ({ ...f, technology: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {TECH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="number" value={form.capacityMw} onChange={e => setForm(f => ({ ...f, capacityMw: e.target.value }))} placeholder="Capacity (MW)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))} placeholder="Country code (VN, TH…)" maxLength={3} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">{loading ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm">No projects yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-lg flex-shrink-0">
                    {TECH_ICONS[p.technology] ?? '⚡'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {TECH_LABELS[p.technology]}{p.capacityMw ? ` · ${p.capacityMw} MW` : ''}{p.countryCode ? ` · ${p.countryCode}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STAGE_COLOR[p.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STAGE_LABELS[p.stage] ?? p.stage}
                  </span>
                  <span className="text-gray-300">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <ProjectsInner />
    </ProtectedRoute>
  );
}
