'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';

interface CompareRun {
  id: string;
  metric: string | null;
  technology: string | null;
  createdAt: string;
  status: string;
}

interface ScenarioOutput {
  technology: string;
  lcoePoint: number | null;
  baselineLcoePoint: number | null;
  deltaFromBaseline: number | null;
  monteCarlo: { p10: number; p50: number; p90: number } | null;
  sensitivity: { parameter: string; delta: number; lcoe: number }[];
}

interface ScenarioResult {
  id: string;
  status: string;
  outputs: ScenarioOutput[];
  warnings: string[];
}

function ScenarioInner() {
  const [runs, setRuns] = useState<CompareRun[]>([]);
  const [form, setForm] = useState({
    comparison_run_id: '',
    discount_rate: '8',
    capex_delta_pct: '0',
    opex_delta_pct: '0',
    carbon_price: '',
    monte_carlo: false,
    mc_iterations: '500',
  });
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/compare?limit=50', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setRuns(d.items ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.comparison_run_id) { setError('Select a baseline comparison run.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/scenario', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparison_run_id: form.comparison_run_id,
          discount_rate: parseFloat(form.discount_rate) / 100,
          capex_delta_pct: parseFloat(form.capex_delta_pct) / 100,
          opex_delta_pct: parseFloat(form.opex_delta_pct) / 100,
          carbon_price_usd_per_ton: form.carbon_price ? parseFloat(form.carbon_price) : undefined,
          monte_carlo: form.monte_carlo ? { enabled: true, iterations: parseInt(form.mc_iterations) } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scenario failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenario Modelling</h1>
        <p className="text-sm text-gray-500 mt-1">Stress-test LCOE under custom parameters with optional Monte Carlo</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baseline comparison run</label>
            <select
              value={form.comparison_run_id}
              onChange={e => setForm(f => ({ ...f, comparison_run_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a comparison run…</option>
              {runs.filter(r => r.status === 'completed').map(r => (
                <option key={r.id} value={r.id}>
                  {r.metric ?? 'run'}{r.technology ? ` · ${r.technology}` : ''} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Discount rate (%)', key: 'discount_rate', hint: 'e.g. 8 for 8%' },
              { label: 'CAPEX delta (%)', key: 'capex_delta_pct', hint: '+10 = 10% higher' },
              { label: 'OPEX delta (%)', key: 'opex_delta_pct', hint: '' },
              { label: 'Carbon price ($/t CO₂)', key: 'carbon_price', hint: 'optional' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type="number"
                  value={form[field.key as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.hint}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="mc" type="checkbox"
              checked={form.monte_carlo}
              onChange={e => setForm(f => ({ ...f, monte_carlo: e.target.checked }))}
              className="h-4 w-4 text-emerald-600 rounded"
            />
            <label htmlFor="mc" className="text-sm text-gray-700">Enable Monte Carlo</label>
          </div>

          {form.monte_carlo && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Iterations</label>
              <input
                type="number" min="100" max="5000"
                value={form.mc_iterations}
                onChange={e => setForm(f => ({ ...f, mc_iterations: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={loading || !form.comparison_run_id}
            className="w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Running…' : 'Run scenario'}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {result.warnings.map((w, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">{w}</div>
              ))}
              {result.outputs.map(out => (
                <div key={out.technology} className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{out.technology}</h3>
                    {out.deltaFromBaseline != null && (
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${out.deltaFromBaseline > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {out.deltaFromBaseline > 0 ? '+' : ''}{out.deltaFromBaseline.toFixed(1)} $/MWh
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Scenario LCOE</p>
                      <p className="text-2xl font-bold text-gray-900">{out.lcoePoint?.toFixed(1) ?? '—'} <span className="text-sm font-normal text-gray-400">$/MWh</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Baseline LCOE</p>
                      <p className="text-2xl font-bold text-gray-400">{out.baselineLcoePoint?.toFixed(1) ?? '—'} <span className="text-sm font-normal text-gray-300">$/MWh</span></p>
                    </div>
                  </div>

                  {out.monteCarlo && (
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      {[['P10', out.monteCarlo.p10], ['P50', out.monteCarlo.p50], ['P90', out.monteCarlo.p90]].map(([label, val]) => (
                        <div key={label as string} className="text-center">
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-base font-semibold text-gray-700">{(val as number).toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {out.sensitivity.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">Sensitivity</p>
                      <div className="space-y-1.5">
                        {out.sensitivity.slice(0, 4).map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{s.parameter}</span>
                            <span className="font-medium text-gray-700">{s.lcoe.toFixed(1)} $/MWh</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📈</p>
              <p className="text-sm">Results will appear here after you run a scenario.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScenarioPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <ScenarioInner />
    </ProtectedRoute>
  );
}
