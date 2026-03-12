'use client';

import { Suspense } from 'react';
import { ProjectGuidanceReportView, type ProjectGuidanceReportData } from '@/components/reports/ProjectGuidanceReportView';
import { useReportData } from '@/components/reports/useReportData';

function GuidanceReportInner() {
  const { data, metadata, error, loading } = useReportData<ProjectGuidanceReportData>();
  if (error) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-red-600">{error}</div>;
  if (loading || !data) return <div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading report…</div>;
  return <ProjectGuidanceReportView report={data} metadata={metadata} />;
}

export default function GuidanceReportPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-8 py-16 text-center text-sm text-gray-400">Loading…</div>}>
      <GuidanceReportInner />
    </Suspense>
  );
}
