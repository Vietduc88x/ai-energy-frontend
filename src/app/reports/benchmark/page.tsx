'use client';

import { Suspense } from 'react';
import { BenchmarkReportView, type BenchmarkReportData } from '@/components/reports/BenchmarkReportView';
import { useReportData } from '@/components/reports/useReportData';

function BenchmarkReportInner() {
  const { data, metadata, error, loading } = useReportData<BenchmarkReportData>();
  if (error) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-red-600">{error}</div>;
  if (loading || !data) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading report…</div>;
  return <BenchmarkReportView report={data} metadata={metadata} />;
}

export default function BenchmarkReportPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading…</div>}>
      <BenchmarkReportInner />
    </Suspense>
  );
}
