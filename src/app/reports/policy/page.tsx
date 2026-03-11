'use client';

import { Suspense } from 'react';
import { PolicyReportView, type PolicyReportData } from '@/components/reports/PolicyReportView';
import { useReportData } from '@/components/reports/useReportData';

function PolicyReportInner() {
  const { data, error, loading } = useReportData<PolicyReportData>();
  if (error) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-red-600">{error}</div>;
  if (loading || !data) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading report…</div>;
  return <PolicyReportView report={data} />;
}

export default function PolicyReportPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading…</div>}>
      <PolicyReportInner />
    </Suspense>
  );
}
