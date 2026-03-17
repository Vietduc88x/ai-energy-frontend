'use client';

import { useState } from 'react';
import type { ExpertJudgmentMemoData, ExpertJudgmentData } from '@/lib/api-client';

const SEVERITY_STYLE: Record<string, { dot: string; bg: string }> = {
  critical: { dot: 'bg-red-500', bg: 'bg-red-50 border-red-100' },
  high:     { dot: 'bg-amber-400', bg: 'bg-amber-50/50 border-amber-100' },
  medium:   { dot: 'bg-gray-400', bg: 'bg-gray-50 border-gray-100' },
};

function JudgmentCard({ j }: { j: ExpertJudgmentData }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLE[j.severity] ?? SEVERITY_STYLE.medium;
  const hasProof = j.requiredProof.length > 0;
  const hasChecks = j.supportingChecks.length > 0;
  const hasDetail = hasProof || hasChecks || j.implications.length > 0;

  return (
    <div className={`rounded-lg border ${style.bg} p-3`}>
      {/* Theme + Judgment */}
      <div className="flex items-start gap-2">
        <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${style.dot}`} />
        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-semibold text-gray-900">{j.theme}</h5>
          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{j.judgment}</p>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed italic">{j.rationale}</p>
        </div>
      </div>

      {/* Required Proof (always visible if exists) */}
      {hasProof && (
        <div className="mt-2 ml-4">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">Required proof</span>
          <div className="mt-0.5 space-y-0.5">
            {j.requiredProof.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                <span className="text-amber-400 flex-shrink-0">{'\u25C6'}</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable detail */}
      {hasDetail && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 ml-4 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? 'Hide detail' : 'Show detail'}
          <svg className={`w-3 h-3 inline ml-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {expanded && (
        <div className="mt-2 ml-4 space-y-2">
          {j.implications.length > 0 && (
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Implications</span>
              <ul className="mt-0.5 space-y-0.5">
                {j.implications.map((imp, i) => (
                  <li key={i} className="text-[11px] text-gray-500 flex gap-1.5">
                    <span className="text-gray-300">{'\u2022'}</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasChecks && (
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Supporting checks</span>
              <ul className="mt-0.5 space-y-0.5">
                {j.supportingChecks.map((c, i) => (
                  <li key={i} className="text-[11px] text-gray-500 flex gap-1.5">
                    <span className="text-gray-300">{'\u2022'}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExpertJudgmentMemo({ data }: { data: ExpertJudgmentMemoData }) {
  const [showAll, setShowAll] = useState(false);
  const visibleJudgments = showAll ? data.judgments : data.judgments.slice(0, 3);
  const hasMore = data.judgments.length > 3;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" data-testid="expert-judgment-memo">
      <div className="px-5 pt-4 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{data.memoTitle}</h3>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{data.recommendation}</p>
      </div>

      <div className="px-5 py-3 space-y-2.5">
        {visibleJudgments.map(j => (
          <JudgmentCard key={j.id} j={j} />
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showAll ? 'Show fewer' : `Show ${data.judgments.length - 3} more judgments`}
          </button>
        )}

        {/* Closing Actions — role-specific next steps */}
        {(data.closingActions?.length ?? 0) > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              {data.closingTitle || 'Next Actions'}
            </h4>
            <div className="space-y-1">
              {data.closingActions!.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className={`flex-shrink-0 mt-0.5 font-bold text-[10px] ${
                    a.priority === 'critical' ? 'text-red-400' : a.priority === 'important' ? 'text-amber-400' : 'text-gray-400'
                  }`}>{i + 1}.</span>
                  <span>
                    {a.action}
                    {a.owner && <span className="text-gray-400 ml-1">({a.owner})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
