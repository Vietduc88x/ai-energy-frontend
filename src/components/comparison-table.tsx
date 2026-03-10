'use client';

import type { ComparisonResult, ComparisonRow } from '@/lib/api-client';

interface Props {
  result: ComparisonResult;
}

function formatValue(row: ComparisonRow): string {
  if (row.value_point != null) return `${row.value_point} ${row.unit}`;
  if (row.value_min != null && row.value_max != null) return `${row.value_min}–${row.value_max} ${row.unit}`;
  if (row.value_min != null) return `≥${row.value_min} ${row.unit}`;
  if (row.value_max != null) return `≤${row.value_max} ${row.unit}`;
  return '-';
}

export function ComparisonTable({ result }: Props) {
  const { rows, scores, deltas } = result;

  if (!rows || rows.length === 0) {
    return <p className="text-gray-500 text-sm">No comparison data available.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Coverage + conflict summary */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Coverage: {Math.round(scores.coverage * 100)}%</span>
        <span>Conflict: {Math.round(scores.conflict * 100)}%</span>
        <span>Sources: {scores.sources_used.join(', ')}</span>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b">Source</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b">Value</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b">Year</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 border-b hidden lg:table-cell">Methodology</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600 border-b">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-800 font-medium">{row.source}</td>
                <td className="px-4 py-2 text-gray-800">{formatValue(row)}</td>
                <td className="px-4 py-2 text-gray-600">{row.year ?? '-'}</td>
                <td className="px-4 py-2 text-gray-600 text-xs hidden lg:table-cell">{row.methodology_summary ?? '-'}</td>
                <td className="px-4 py-2 text-right text-gray-600">{row.confidence != null ? `${Math.round(row.confidence * 100)}%` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Source</span>
              <span className="text-gray-800 font-medium">{row.source}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Value</span>
              <span className="text-gray-800">{formatValue(row)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Year</span>
              <span className="text-gray-600">{row.year ?? '-'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deltas / discrepancies */}
      {deltas && deltas.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Discrepancies</h4>
          <ul className="space-y-1">
            {deltas.map((d, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${d.severity === 'high' ? 'bg-red-400' : d.severity === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                {d.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
