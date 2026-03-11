'use client';

import { FamilyBadge } from './DeliverableBadge';

export interface DocumentRequestMatrixSpec {
  type: 'document_request_matrix';
  title: string;
  subtitle?: string | null;
  columns: string[];
  rows: Array<{
    category: string;
    document: string;
    whyItMatters?: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
  }>;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

export function DocumentRequestMatrix({ spec }: { spec: DocumentRequestMatrixSpec }) {
  if (spec.rows.length === 0) return null;

  // Group rows by category for visual grouping
  const byCategory = new Map<string, typeof spec.rows>();
  for (const row of spec.rows) {
    if (!byCategory.has(row.category)) byCategory.set(row.category, []);
    byCategory.get(row.category)!.push(row);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <FamilyBadge family="matrix" />
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Category</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Document</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-600 hidden sm:table-cell">Why It Matters</th>
              <th className="text-center px-4 py-2 font-semibold text-gray-600 w-20">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...byCategory.entries()].map(([category, rows]) =>
              rows.map((row, i) => (
                <tr key={`${category}-${i}`} className="hover:bg-gray-50">
                  {i === 0 ? (
                    <td className="px-4 py-2 font-medium text-gray-800 align-top" rowSpan={rows.length}>
                      {category}
                    </td>
                  ) : null}
                  <td className="px-4 py-2 text-gray-700">{row.document}</td>
                  <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{row.whyItMatters || '—'}</td>
                  <td className="px-4 py-2 text-center">
                    {row.priority && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_STYLES[row.priority] || ''}`}>
                        {row.priority}
                      </span>
                    )}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
