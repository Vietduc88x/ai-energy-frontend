'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';
import { getAdminFunnel, type FunnelResponse } from '@/lib/api-client';
import { TableSkeleton } from '@/components/skeleton';
import { useToast } from '@/components/error-toast';
import type { FunnelRow } from '@/components/funnel-table';

/** Transform backend funnel shape into flat rows for the table */
function transformFunnel(resp: FunnelResponse): FunnelRow[] {
  return Object.entries(resp.funnel)
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([date, events]) => ({
      date,
      demo_loaded: events.demo_loaded ?? 0,
      comparison_started: events.comparison_started ?? 0,
      comparison_succeeded: events.comparison_succeeded ?? 0,
      quota_hit: events.quota_hit ?? 0,
      upgrade_clicked: events.upgrade_clicked ?? 0,
      subscription_activated: events.subscription_activated ?? 0,
    }));
}

// Code-split heavy table for mobile performance
const FunnelTable = dynamic(() => import('@/components/funnel-table').then((m) => ({ default: m.FunnelTable })), {
  loading: () => <TableSkeleton />,
});

const PERIOD_OPTIONS = [7, 30, 90] as const;

export default function AdminPage() {
  const session = useSession();
  const { showError } = useToast();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminFunnel(days).then((res) => {
      if (res.data) setData(transformFunnel(res.data));
      else showError(res.error?.message ?? 'Failed to load funnel');
      setLoading(false);
    });
  }, [days, showError]);

  return (
    <ProtectedRoute session={session} adminOnly>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin — Funnel</h1>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-sm rounded-lg touch-target ${
                  days === d ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? <TableSkeleton rows={7} cols={7} /> : <FunnelTable data={data} />}
      </div>
    </ProtectedRoute>
  );
}
