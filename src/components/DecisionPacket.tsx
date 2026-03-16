'use client';

import { useState } from 'react';
import type { DecisionPacketData } from '@/lib/api-client';

// ─── Stance styling ──────────────────────────────────────────────────────────

const STANCE_STYLE: Record<string, { bg: string; border: string; icon: string; iconColor: string }> = {
  proceed:                { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '\u2713', iconColor: 'text-emerald-600' },
  proceed_conditionally:  { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: '\u26A0', iconColor: 'text-amber-600' },
  hold:                   { bg: 'bg-red-50',     border: 'border-red-200',     icon: '\u2716', iconColor: 'text-red-600' },
  insufficient_basis:     { bg: 'bg-gray-50',    border: 'border-gray-200',    icon: '?',      iconColor: 'text-gray-500' },
};

const CONFIDENCE_LABEL: Record<string, { text: string; color: string }> = {
  high:   { text: 'High confidence', color: 'text-emerald-600' },
  medium: { text: 'Medium confidence', color: 'text-amber-600' },
  low:    { text: 'Low confidence', color: 'text-red-500' },
};

const SEVERITY_DOT: Record<string, string> = {
  critical:    'bg-red-500',
  significant: 'bg-amber-400',
  moderate:    'bg-gray-400',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DecisionPacket({ data }: { data: DecisionPacketData }) {
  const [showArtifacts, setShowArtifacts] = useState(false);
  const style = STANCE_STYLE[data.stance] ?? STANCE_STYLE.insufficient_basis;
  const conf = CONFIDENCE_LABEL[data.confidence] ?? CONFIDENCE_LABEL.medium;

  const hasBlockers = data.topBlockers.length > 0;
  const hasNeeds = data.topNeeds.length > 0;
  const hasReasons = data.topReasons.length > 0;
  const hasArtifacts = data.supportingArtifacts.length > 0;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`} data-testid="decision-packet">
      {/* ── Stance header ── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <span className={`text-lg flex-shrink-0 ${style.iconColor}`}>{style.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug" data-testid="packet-summary">
              {data.summaryLine}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium ${conf.color}`}>{conf.text}</span>
              {data.nextGate && (
                <span className="text-[10px] text-gray-400">
                  Next gate: {data.nextGate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: reasons + blockers + needs ── */}
      <div className="px-5 pb-4 space-y-3">
        {/* Why */}
        {hasReasons && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Why</h4>
            <ul className="space-y-0.5">
              {data.topReasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                  <span className="flex-shrink-0 w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Blockers */}
        {hasBlockers && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">What blocks this</h4>
            <div className="space-y-1">
              {data.topBlockers.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${SEVERITY_DOT[b.severity] ?? 'bg-gray-400'}`} />
                  <div>
                    <span className="text-gray-800 font-medium">{b.title}</span>
                    {b.impact && <span className="text-gray-500"> \u2014 {b.impact}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next needs */}
        {hasNeeds && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">What is needed next</h4>
            <div className="space-y-1">
              {data.topNeeds.map((n, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className={`flex-shrink-0 mt-0.5 text-[10px] font-bold ${n.gateBlocking ? 'text-red-400' : 'text-gray-400'}`}>
                    {n.type === 'evidence' ? '\u25C6' : '\u25B8'}
                  </span>
                  <span>
                    {n.label}
                    {n.owner && <span className="text-gray-400 ml-1">({n.owner})</span>}
                    {n.gateBlocking && <span className="text-[9px] text-red-400 font-semibold ml-1">GATE</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supporting artifacts toggle */}
        {hasArtifacts && (
          <button
            type="button"
            onClick={() => setShowArtifacts(v => !v)}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors mt-1"
            data-testid="packet-artifacts-toggle"
          >
            {showArtifacts ? 'Hide' : 'Show'} supporting detail ({data.supportingArtifacts.length})
            <svg
              className={`w-3 h-3 inline ml-0.5 transition-transform ${showArtifacts ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
