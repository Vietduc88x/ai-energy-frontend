'use client';

import { ReportHeader } from './ReportHeader';
import { ReportSection } from './ReportSection';
import { ReportCitationList } from './ReportCitationList';

export interface BenchmarkReportData {
  type: 'benchmark_report';
  title: string;
  subtitle?: string | null;
  generatedAt: string;
  query: { metric: string; technology: string; region: string; year?: number | null };
  summary: string;
  keyTakeaway: string;
  comparisonTable: Array<{
    source: string;
    valueMin?: number | null;
    valueMax?: number | null;
    valuePoint?: number | null;
    unit: string;
    methodology?: string | null;
  }>;
  chartSpec?: {
    chartType: string;
    series: Array<{ label: string; valueMin?: number | null; valueMax?: number | null; valuePoint?: number | null }>;
  } | null;
  disagreementDrivers: string[];
  normalization: { currency: string; priceYear: number; unit: string };
  citations: Array<{ source: string; title: string; url?: string | null }>;
  caveat?: string | null;
}

const BAR_COLORS = ['#0d9488', '#0891b2', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

export function BenchmarkReportView({ report }: { report: BenchmarkReportData }) {
  // Chart rendering
  const series = report.chartSpec?.series || [];
  const allValues = series.flatMap(s => [s.valuePoint, s.valueMin, s.valueMax].filter((v): v is number => v != null));
  const scaleMax = allValues.length > 0 ? Math.max(...allValues) * 1.15 : 1;

  return (
    <div className="report-container max-w-3xl mx-auto px-8 py-10 bg-white print:px-0 print:py-0 print:max-w-none">
      <ReportHeader
        title={report.title}
        subtitle={report.subtitle}
        generatedAt={report.generatedAt}
        onPrint={() => window.print()}
      />

      <ReportSection title="Summary">
        <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
      </ReportSection>

      <ReportSection title="Key Takeaway">
        <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-r">
          <p className="text-sm font-medium text-gray-900">{report.keyTakeaway}</p>
        </div>
      </ReportSection>

      {/* Inline chart */}
      {series.length > 0 && (
        <ReportSection title="Benchmark Comparison">
          <div className="space-y-2">
            {series.map((s, i) => {
              const color = BAR_COLORS[i % BAR_COLORS.length];
              const hasRange = s.valueMin != null && s.valueMax != null;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700 w-20 flex-shrink-0 truncate">{s.label}</span>
                  <div className="flex-1 relative h-6 bg-gray-100 rounded">
                    {hasRange ? (
                      <div
                        className="absolute top-1 bottom-1 rounded opacity-50"
                        style={{
                          left: `${((s.valueMin! / scaleMax) * 100)}%`,
                          width: `${(((s.valueMax! - s.valueMin!) / scaleMax) * 100)}%`,
                          backgroundColor: color,
                        }}
                      />
                    ) : null}
                    {s.valuePoint != null && (
                      <div
                        className="absolute top-0.5 bottom-0.5 w-1 rounded"
                        style={{ left: `${((s.valuePoint / scaleMax) * 100)}%`, backgroundColor: color }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-mono text-gray-600 w-24 text-right flex-shrink-0">
                    {hasRange ? `${s.valueMin}–${s.valueMax}` : s.valuePoint ?? '—'}
                    <span className="text-gray-400 ml-0.5">{report.normalization.unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </ReportSection>
      )}

      {/* Comparison table */}
      <ReportSection title="Detailed Comparison">
        <table className="w-full text-xs border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 font-semibold">Source</th>
              <th className="text-right px-3 py-2 font-semibold">Point</th>
              <th className="text-right px-3 py-2 font-semibold">Range</th>
              <th className="text-left px-3 py-2 font-semibold">Methodology</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.comparisonTable.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-gray-800">{row.source}</td>
                <td className="px-3 py-2 text-right font-mono">{row.valuePoint ?? '—'}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-500">
                  {row.valueMin != null && row.valueMax != null ? `${row.valueMin}–${row.valueMax}` : '—'}
                </td>
                <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate">{row.methodology || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] text-gray-400 mt-1">
          All values in {report.normalization.currency} {report.normalization.priceYear} {report.normalization.unit}
        </p>
      </ReportSection>

      {report.disagreementDrivers.length > 0 && (
        <ReportSection title="Source Disagreements">
          <ul className="space-y-1">
            {report.disagreementDrivers.map((d, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-amber-500 flex-shrink-0 mt-0.5">&#9679;</span>
                {d}
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {report.caveat && (
        <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 mt-6 break-inside-avoid">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Note:</span> {report.caveat}
          </p>
        </div>
      )}

      <ReportCitationList citations={report.citations} />

      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 print:mt-4">
        Generated by AI Energy Analyst &middot; {new Date(report.generatedAt).toLocaleDateString()}
      </footer>
    </div>
  );
}
