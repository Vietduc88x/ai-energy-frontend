'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  isActive: boolean;
}

interface PortfolioRun {
  id: string;
  runType: string;
  status: string;
  blendedLcoe: number | null;
  totalCapacityMw: number | null;
  technologyMix: Record<string, number> | null;
  createdAt: string;
}

const TECH_OPTIONS = ['solar_pv', 'onshore_wind', 'offshore_wind', 'bess', 'hybrid'];
const TECH_LABELS: Record<string, string> = {
  solar_pv: 'Solar PV', onshore_wind: 'Onshore Wind', offshore_wind: 'Offshore Wind', bess: 'BESS', hybrid: 'Hybrid',
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

function PortfolioInner() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [runs, setRuns] = useState<PortfolioRun[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showAsset, setShowAsset] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ name: '', description: '', base_currency: 'USD' });
  const [newAsset, setNewAsset] = useState({ name: '', technology: 'solar_pv', jurisdiction: '', capacity_mw: '' });
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ portfolios: Portfolio[] }>('/api/v1/portfolio').then(d => setPortfolios(d.portfolios)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiFetch<{ runs: PortfolioRun[] }>(`/api/v1/portfolio/${selected}/runs`).then(d => setRuns(d.runs)).catch(() => {});
  }, [selected]);

  async function createPortfolio(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const p = await apiFetch<Portfolio>('/api/v1/portfolio', { method: 'POST', body: JSON.stringify(newPortfolio) });
      setPortfolios(prev => [...prev, p]);
      setSelected(p.id);
      setShowNew(false);
      setNewPortfolio({ name: '', description: '', base_currency: 'USD' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function addAsset(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return;
    try {
      await apiFetch(`/api/v1/portfolio/${selected}/assets`, {
        method: 'POST',
        body: JSON.stringify({ ...newAsset, capacity_mw: parseFloat(newAsset.capacity_mw) }),
      });
      setShowAsset(false);
      setNewAsset({ name: '', technology: 'solar_pv', jurisdiction: '', capacity_mw: '' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
  }

  async function runPortfolio(runType: 'baseline' | 'stressed') {
    if (!selected) return; setRunLoading(true);
    try {
      await apiFetch(`/api/v1/portfolio/${selected}/run`, { method: 'POST', body: JSON.stringify({ run_type: runType }) });
      const d = await apiFetch<{ runs: PortfolioRun[] }>(`/api/v1/portfolio/${selected}/runs`);
      setRuns(d.runs);
    } catch (err) { setError(err instanceof Error ? err.message : 'Run failed'); }
    finally { setRunLoading(false); }
  }

  const selectedPortfolio = portfolios.find(p => p.id === selected);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Multi-asset investment portfolio analytics</p>
        </div>
        <button onClick={() => setShowNew(s => !s)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          + New portfolio
        </button>
      </div>

      {showNew && (
        <form onSubmit={createPortfolio} className="border border-gray-200 rounded-xl p-5 space-y-3 max-w-md">
          <h3 className="font-semibold text-sm text-gray-900">Create portfolio</h3>
          <input required value={newPortfolio.name} onChange={e => setNewPortfolio(f => ({ ...f, name: e.target.value }))} placeholder="Portfolio name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input value={newPortfolio.description} onChange={e => setNewPortfolio(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input value={newPortfolio.base_currency} onChange={e => setNewPortfolio(f => ({ ...f, base_currency: e.target.value.toUpperCase() }))} maxLength={3} placeholder="USD" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">Create</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-2">
          {portfolios.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">No portfolios yet.</div>
          ) : portfolios.map(p => (
            <button key={p.id} onClick={() => { setSelected(p.id); setRuns([]); }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${selected === p.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <div className="font-medium text-sm text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.baseCurrency}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="md:col-span-2 space-y-4">
          {!selected ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">Select a portfolio to view details.</div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{selectedPortfolio?.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAsset(s => !s)} className="px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50">+ Add asset</button>
                    <button onClick={() => runPortfolio('baseline')} disabled={runLoading} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {runLoading ? 'Running…' : 'Run baseline'}
                    </button>
                  </div>
                </div>

                {showAsset && (
                  <form onSubmit={addAsset} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input required value={newAsset.name} onChange={e => setNewAsset(f => ({ ...f, name: e.target.value }))} placeholder="Asset name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <select value={newAsset.technology} onChange={e => setNewAsset(f => ({ ...f, technology: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        {TECH_OPTIONS.map(t => <option key={t} value={t}>{TECH_LABELS[t]}</option>)}
                      </select>
                      <input required value={newAsset.jurisdiction} onChange={e => setNewAsset(f => ({ ...f, jurisdiction: e.target.value }))} placeholder="Jurisdiction (e.g. Vietnam)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input required type="number" value={newAsset.capacity_mw} onChange={e => setNewAsset(f => ({ ...f, capacity_mw: e.target.value }))} placeholder="Capacity (MW)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAsset(false)} className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg hover:bg-white">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">Add</button>
                    </div>
                  </form>
                )}
              </div>

              {/* Runs */}
              {runs.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-6">No runs yet. Add assets then run baseline.</div>
              ) : runs.map(run => (
                <div key={run.id} className="border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${run.runType === 'baseline' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{run.runType}</span>
                    <span className="text-xs text-gray-400">{new Date(run.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Blended LCOE</p>
                      <p className="text-xl font-bold text-gray-900">{run.blendedLcoe?.toFixed(1) ?? '—'} <span className="text-sm font-normal text-gray-400">$/MWh</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total capacity</p>
                      <p className="text-xl font-bold text-gray-900">{run.totalCapacityMw?.toFixed(0) ?? '—'} <span className="text-sm font-normal text-gray-400">MW</span></p>
                    </div>
                  </div>
                  {run.technologyMix && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      {Object.entries(run.technologyMix).map(([tech, pct]) => (
                        <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {TECH_LABELS[tech] ?? tech}: {(Number(pct) * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <PortfolioInner />
    </ProtectedRoute>
  );
}
