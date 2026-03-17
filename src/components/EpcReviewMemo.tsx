'use client';

import type { EpcReviewMemoData } from '@/lib/api-client';

export function EpcReviewMemo({ data }: { data: EpcReviewMemoData }) {
  const hasRisks = data.contractRisks.length > 0;
  const hasProofs = data.requiredProofs.length > 0;
  const hasQuestions = data.priorityQuestions.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" data-testid="epc-review-memo">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">EPC Contract Review Memo</h3>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{data.recommendation}</p>
      </div>

      <div className="px-5 py-3 space-y-4">
        {/* Contract Risks */}
        {hasRisks && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-1.5">
              Top Contract Risks
            </h4>
            <div className="space-y-1.5">
              {data.contractRisks.map((r, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium text-gray-900">{r.title}</span>
                  <span className="text-gray-500 ml-1">{'\u2014'} {r.judgment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Proof */}
        {hasProofs && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1.5">
              Required Proof Before Finalization
            </h4>
            <div className="space-y-1">
              {data.requiredProofs.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className={`flex-shrink-0 mt-0.5 text-[10px] font-bold ${p.gateBlocking ? 'text-red-400' : 'text-gray-400'}`}>
                    {'\u25C6'}
                  </span>
                  <span>
                    {p.label}
                    {p.owner && <span className="text-gray-400 ml-1">({p.owner})</span>}
                    {p.gateBlocking && <span className="text-[9px] text-red-400 font-semibold ml-1">GATE</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Questions */}
        {hasQuestions && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Priority Questions for Review
            </h4>
            <ol className="space-y-1 list-decimal list-inside">
              {data.priorityQuestions.map((q, i) => (
                <li key={i} className="text-xs text-gray-700 leading-relaxed">{q}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
