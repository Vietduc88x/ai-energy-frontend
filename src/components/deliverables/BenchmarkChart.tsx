'use client';

import { FamilyBadge, DeliverableMetaFooter, type DeliverableMetadataProps } from './DeliverableBadge';

export interface BenchmarkChartSpec {
  type: 'benchmark_chart';
  chartType: 'bar' | 'range' | 'line';
  title: string;
  subtitle?: string | null;
  metric: string;
  unit: string;
  series: Array<{
    label: string;
    source: string;
    valueMin?: number | null;
    valueMax?: number | null;
    valuePoint?: number | null;
    confidence?: 'high' | 'medium' | 'low' | null;
  }>;
  disagreementDrivers?: string[];
}

const CONFIDENCE_COLORS = {
  high: '#059669',
  medium: '#d97706',
  low: '#dc2626',
};

const BAR_COLORS = [
  '#0d9488', '#0891b2', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#f97316', '#eab308',
];

export function BenchmarkChart({ spec, metadata }: { spec: BenchmarkChartSpec; metadata?: DeliverableMetadataProps | null }) {
  const validSeries = spec.series.filter(
    s => s.valuePoint != null || (s.valueMin != null && s.valueMax != null),
  );

  if (validSeries.length === 0) return null;

  // Find scale range
  const allValues = validSeries.flatMap(s => [
    s.valuePoint, s.valueMin, s.valueMax,
  ].filter((v): v is number => v != null));
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.15 || dataMax * 0.1;
  const scaleMin = Math.max(0, dataMin - padding);
  const scaleMax = dataMax + padding;
  const range = scaleMax - scaleMin || 1;

  const chartW = 100; // percentage
  const barH = 28;
  const gap = 6;
  const totalH = validSeries.length * (barH + gap);

  const toX = (v: number) => ((v - scaleMin) / range) * chartW;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <FamilyBadge family="figure" />
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      <div className="px-4 py-3">
        <div style={{ height: totalH }} className="relative">
          {validSeries.map((s, i) => {
            const y = i * (barH + gap);
            const hasRange = s.valueMin != null && s.valueMax != null;
            const color = BAR_COLORS[i % BAR_COLORS.length];

            return (
              <div key={i} className="absolute left-0 right-0" style={{ top: y, height: barH }}>
                {/* Label */}
                <div className="flex items-center gap-2 h-full">
                  <span className="text-xs font-medium text-gray-700 w-24 flex-shrink-0 truncate" title={s.label}>
                    {s.label}
                  </span>
                  <div className="flex-1 relative h-full">
                    {/* Background track */}
                    <div className="absolute inset-0 bg-gray-50 rounded" />

                    {hasRange ? (
                      <>
                        {/* Range bar */}
                        <div
                          className="absolute top-1 bottom-1 rounded opacity-30"
                          style={{
                            left: `${toX(s.valueMin!)}%`,
                            width: `${toX(s.valueMax!) - toX(s.valueMin!)}%`,
                            backgroundColor: color,
                          }}
                        />
                        {/* Point marker */}
                        {s.valuePoint != null && (
                          <div
                            className="absolute top-0.5 bottom-0.5 w-0.5 rounded"
                            style={{ left: `${toX(s.valuePoint)}%`, backgroundColor: color }}
                          />
                        )}
                      </>
                    ) : s.valuePoint != null ? (
                      <div
                        className="absolute top-1 bottom-1 rounded"
                        style={{
                          left: 0,
                          width: `${toX(s.valuePoint)}%`,
                          backgroundColor: color,
                          opacity: 0.7,
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Value label */}
                  <span className="text-xs font-mono text-gray-600 w-20 text-right flex-shrink-0">
                    {hasRange
                      ? `${s.valueMin}–${s.valueMax}`
                      : s.valuePoint != null
                        ? `${s.valuePoint}`
                        : '—'}
                    <span className="text-gray-400 ml-0.5">{spec.unit}</span>
                  </span>

                  {/* Confidence dot */}
                  {s.confidence && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CONFIDENCE_COLORS[s.confidence] }}
                      title={`${s.confidence} confidence`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disagreement drivers */}
        {spec.disagreementDrivers && spec.disagreementDrivers.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Source Disagreements</p>
            <ul className="space-y-0.5">
              {spec.disagreementDrivers.map((d, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-amber-500 flex-shrink-0">&#9679;</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DeliverableMetaFooter meta={metadata} />
    </div>
  );
}
