'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/components/error-toast';
import { ProtectedRoute } from '@/components/protected-route';
import { QueryInput } from '@/components/query-input';
import { SampleQueryChips } from '@/components/sample-query-chips';
import { ComparisonTable } from '@/components/comparison-table';
import { QuotaModal } from '@/components/quota-modal';
import { TableSkeleton } from '@/components/skeleton';
import { createComparison, exportComparison, exportComparisonDirect, shouldUseDirectDownload, type ComparisonResult, type CompareRequest } from '@/lib/api-client';

type PageState = 'idle' | 'loading' | 'success' | 'quota_hit' | 'error';

export default function ComparePage() {
  const session = useSession();
  const { showError } = useToast();
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<{ tier: string; limit: number | 'unlimited' } | null>(null);

  const runComparison = async (request: CompareRequest) => {
    setState('loading');
    setResult(null);
    // Backend emits comparison_started and comparison_succeeded — do not duplicate here

    const res = await createComparison(request);

    if (res.data) {
      setResult(res.data);
      setState('success');
    } else if (res.error?.status === 429) {
      setState('quota_hit');
      setQuotaInfo({
        tier: session.billing?.tier ?? 'free',
        limit: session.billing?.limits.comparisonsPerMonth ?? 5,
      });
    } else {
      setState('error');
      showError(res.error?.message ?? 'Comparison failed');
    }
  };

  /** Parse free-text into a structured CompareRequest (best-effort) */
  const handleFreeText = (input: string) => {
    const lower = input.toLowerCase();
    const metric = (['lcoe', 'capex', 'opex', 'capacity_factor', 'irr', 'curtailment', 'auction_price', 'generation', 'capacity'] as const)
      .find((m) => lower.includes(m.replace('_', ' '))) ?? 'lcoe';
    const technology = lower.includes('wind') ? 'onshore_wind'
      : lower.includes('nuclear') ? 'nuclear'
      : lower.includes('batter') || lower.includes('bess') ? 'bess'
      : lower.includes('hydro') ? 'hydropower'
      : 'solar_pv';
    const region = lower.includes('vietnam') ? 'vietnam'
      : lower.includes('india') ? 'india'
      : lower.includes('us') || lower.includes('united states') ? 'united_states'
      : 'global';
    const yearMatch = input.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

    runComparison({ metric, technology, region, year });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!result) return;
    // Backend emits export_clicked — do NOT track client-side to avoid double-counting

    // iOS Safari doesn't support Blob + a.download — use GET navigation instead
    if (shouldUseDirectDownload()) {
      exportComparisonDirect(result.id, format);
      return;
    }

    const res = await exportComparison(result.id, format);
    if (res.error) {
      showError(res.error.message);
      return;
    }
    if (res.data) {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison-${result.id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ProtectedRoute session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Compare</h1>

        <SampleQueryChips onSelect={runComparison} />
        <QueryInput onSubmit={handleFreeText} loading={state === 'loading'} />

        {state === 'loading' && <TableSkeleton />}

        {state === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
            Something went wrong. Try a different query.
          </p>
        )}

        {state === 'success' && result && (
          <div className="space-y-4">
            <ComparisonTable result={result} />
            <div className="flex gap-2">
              <button onClick={() => handleExport('csv')} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 touch-target">
                Export CSV
              </button>
              <button onClick={() => handleExport('json')} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 touch-target">
                Export JSON
              </button>
            </div>
          </div>
        )}

        {state === 'quota_hit' && quotaInfo && (
          <QuotaModal
            tier={quotaInfo.tier}
            limit={quotaInfo.limit}
            onClose={() => setState('idle')}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
