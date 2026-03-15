'use client';

import { useState } from 'react';
import type { CopilotPanel as CopilotPanelData, ContextSummary, EvidenceStatus } from '@/lib/api-client';

// ─── Status colors ──────────────────────────────────────────────────────────

const CONTEXT_ACTION_LABEL: Record<string, { text: string; color: string }> = {
  reused:   { text: 'Continuing',    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  new:      { text: 'New context',   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  explicit: { text: 'Selected',      color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

const EVIDENCE_DOT: Record<string, string> = {
  provided: 'bg-emerald-500',
  missing:  'bg-red-400',
  partial:  'bg-amber-400',
  outdated: 'bg-gray-400',
};

const EVIDENCE_TEXT: Record<string, string> = {
  provided: 'text-emerald-700',
  missing:  'text-red-600',
  partial:  'text-amber-600',
  outdated: 'text-gray-500',
};

const GATE_STATUS_STYLE: Record<string, string> = {
  met:           'text-emerald-700 bg-emerald-50',
  partially_met: 'text-amber-700 bg-amber-50',
  not_met:       'text-red-700 bg-red-50',
  unknown:       'text-gray-500 bg-gray-50',
};

const SEVERITY_STYLE: Record<string, string> = {
  critical:    'text-red-600',
  significant: 'text-amber-600',
  minor:       'text-gray-500',
};

const EVIDENCE_CYCLE: EvidenceStatus[] = ['missing', 'partial', 'provided'];

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CopilotPanelProps {
  panel: CopilotPanelData;
  /** Recent contexts for the context switcher */
  recentContexts?: ContextSummary[];
  /** Called when user switches to a different context */
  onSwitchContext?: (contextId: string) => void;
  /** Called when user wants a new context */
  onNewContext?: () => void;
  /** Called when user updates evidence status */
  onUpdateEvidence?: (item: string, status: EvidenceStatus) => void;
  /** Called when user marks an action as done */
  onMarkActionDone?: (actionId: string) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CopilotPanel({
  panel,
  recentContexts,
  onSwitchContext,
  onNewContext,
  onUpdateEvidence,
  onMarkActionDone,
}: CopilotPanelProps) {
  const { context, progress, evidence, gates, blockers, hasChanges } = panel;
  const actionStyle = CONTEXT_ACTION_LABEL[context.contextAction] ?? CONTEXT_ACTION_LABEL.new;

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showEvidenceDetail, setShowEvidenceDetail] = useState(false);

  const hasProgress = progress.planTotal > 0;
  const hasEvidence = evidence.total > 0;
  const hasGates = gates.length > 0 && gates.some(g => g.status !== 'unknown');
  const hasBlockers = blockers.activeCount > 0;

  const otherContexts = recentContexts?.filter(c => c.id !== context.projectContextId) ?? [];
  const hasContextSwitcher = otherContexts.length > 0 || !!onNewContext;

  return (
    <div className="mb-3 rounded-xl border border-gray-200 bg-white overflow-hidden text-xs" data-testid="copilot-panel">
      {/* ── Header: Context identity + switcher ── */}
      <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2 flex-wrap relative">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${actionStyle.color}`}>
          {context.contextAction === 'reused' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {context.contextAction === 'new' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {actionStyle.text}
        </span>
        <span className="font-medium text-gray-800 truncate">{context.label}</span>

        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {context.turnCount > 1 && (
            <span className="text-gray-400">Turn {context.turnCount}</span>
          )}
          {hasContextSwitcher && (
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className="p-1 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
              title="Switch context"
              data-testid="context-menu-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Context switcher dropdown */}
        {showContextMenu && (
          <div
            className="absolute right-3 top-full mt-1 z-10 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[220px] max-w-[320px]"
            data-testid="context-menu"
          >
            {otherContexts.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  onSwitchContext?.(c.id);
                  setShowContextMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                data-testid="context-option"
              >
                <div className="font-medium text-gray-700 truncate">{c.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {c.planDone}/{c.planTotal} done
                  {c.activeBlockers > 0 && <span className="text-red-400 ml-1">({c.activeBlockers} blocker{c.activeBlockers > 1 ? 's' : ''})</span>}
                  <span className="ml-1">· Turn {c.turnCount}</span>
                </div>
              </button>
            ))}
            {onNewContext && (
              <>
                {otherContexts.length > 0 && <div className="border-t border-gray-100 my-1" />}
                <button
                  onClick={() => {
                    onNewContext();
                    setShowContextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-blue-600 font-medium"
                  data-testid="new-context-btn"
                >
                  + Start new project context
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Body: Progress + Evidence + Gates + Blockers ── */}
      <div className="px-4 py-3 space-y-3">

        {/* Progress bar + next actions with mark-done */}
        {hasProgress && (
          <div data-testid="copilot-progress">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-700">Plan progress</span>
              <span className="text-gray-400">
                {progress.planDone}/{progress.planTotal} done
                {progress.planBlocked > 0 && <span className="text-red-500 ml-1">({progress.planBlocked} blocked)</span>}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              {progress.planDone > 0 && (
                <div
                  className="bg-emerald-500 rounded-l-full"
                  style={{ width: `${(progress.planDone / progress.planTotal) * 100}%` }}
                />
              )}
              {progress.planBlocked > 0 && (
                <div
                  className="bg-red-400"
                  style={{ width: `${(progress.planBlocked / progress.planTotal) * 100}%` }}
                />
              )}
            </div>
            {progress.nextActions.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Next steps</span>
                {progress.nextActions.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-gray-600 group">
                    {onMarkActionDone ? (
                      <button
                        onClick={() => onMarkActionDone(a.actionId)}
                        className="flex-shrink-0 w-3.5 h-3.5 rounded border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors mt-px"
                        title="Mark done"
                        data-testid="mark-done-btn"
                      />
                    ) : a.blocking ? (
                      <span className="text-red-400 flex-shrink-0 mt-px" title="Critical path">!</span>
                    ) : (
                      <span className="text-gray-300 flex-shrink-0 mt-px">-</span>
                    )}
                    <span className="leading-snug flex-1">{a.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evidence summary + interactive detail */}
        {hasEvidence && (
          <div data-testid="copilot-evidence">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={() => setShowEvidenceDetail(!showEvidenceDetail)}
                className="font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
                data-testid="evidence-toggle"
              >
                Evidence
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform ${showEvidenceDetail ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <span className="text-gray-400">
                {evidence.provided}/{evidence.total} provided
              </span>
            </div>

            {/* Summary dots */}
            {!showEvidenceDetail && (
              <div className="flex gap-3 text-[10px]">
                {evidence.provided > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700">{evidence.provided} provided</span>
                  </span>
                )}
                {evidence.missing > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-red-600">{evidence.missing} missing</span>
                  </span>
                )}
                {evidence.partial > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-amber-600">{evidence.partial} partial</span>
                  </span>
                )}
              </div>
            )}

            {/* Expandable detail with clickable status */}
            {showEvidenceDetail && (
              <div className="space-y-1 mt-1" data-testid="evidence-detail">
                {evidence.items.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    {onUpdateEvidence ? (
                      <button
                        onClick={() => {
                          const nextIdx = (EVIDENCE_CYCLE.indexOf(e.status) + 1) % EVIDENCE_CYCLE.length;
                          onUpdateEvidence(e.item, EVIDENCE_CYCLE[nextIdx]);
                        }}
                        className={`flex-shrink-0 w-2 h-2 rounded-full ${EVIDENCE_DOT[e.status]} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all cursor-pointer`}
                        title={`${e.status} — click to cycle`}
                        data-testid="evidence-status-btn"
                      />
                    ) : (
                      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${EVIDENCE_DOT[e.status]}`} />
                    )}
                    <span className={`flex-1 leading-snug ${EVIDENCE_TEXT[e.status]}`}>
                      {e.item}
                    </span>
                    {e.gateBlocking && e.status !== 'provided' && (
                      <span className="text-[9px] text-red-400 font-medium flex-shrink-0">GATE</span>
                    )}
                    <span className={`text-[10px] flex-shrink-0 ${EVIDENCE_TEXT[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Gate-blocking callout (collapsed mode only) */}
            {!showEvidenceDetail && evidence.gateBlockingMissing.length > 0 && (
              <div className="mt-1.5 bg-red-50/50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <span className="text-[10px] font-medium text-red-600 uppercase tracking-wide">Gate-blocking (missing)</span>
                {evidence.gateBlockingMissing.map((e, i) => (
                  <div key={i} className="text-red-600 mt-0.5 leading-snug">- {e.item}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gate status */}
        {hasGates && (
          <div data-testid="copilot-gates">
            <span className="font-medium text-gray-700">Stage gates</span>
            <div className="mt-1 space-y-1">
              {gates.filter(g => g.status !== 'unknown').map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${GATE_STATUS_STYLE[g.status] ?? GATE_STATUS_STYLE.unknown}`}>
                    {g.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-600 truncate">{g.gate}</span>
                  {g.blockerCount > 0 && (
                    <span className="text-red-400 flex-shrink-0">({g.blockerCount} blocker{g.blockerCount > 1 ? 's' : ''})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active blockers */}
        {hasBlockers && (
          <div data-testid="copilot-blockers">
            <span className="font-medium text-gray-700">Active blockers</span>
            <div className="mt-1 space-y-1">
              {blockers.items.filter(b => !b.resolved).slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className={`flex-shrink-0 mt-0.5 ${SEVERITY_STYLE[b.severity] ?? 'text-gray-500'}`}>
                    {b.severity === 'critical' ? '!!' : '!'}
                  </span>
                  <div className="leading-snug">
                    <span className="text-gray-700">{b.blocker}</span>
                    <span className="text-gray-400 ml-1">blocks {b.blocks}</span>
                  </div>
                </div>
              ))}
              {blockers.activeCount > 3 && (
                <span className="text-gray-400 text-[10px]">+{blockers.activeCount - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* No progress yet */}
        {!hasProgress && !hasEvidence && !hasGates && !hasBlockers && (
          <div className="text-gray-400 text-center py-1">
            Context created — progress will appear as the workflow develops.
          </div>
        )}
      </div>

      {/* ── Change indicator ── */}
      {hasChanges && (
        <div className="px-4 py-1.5 bg-blue-50/50 border-t border-blue-100 text-[10px] text-blue-600 font-medium">
          State updated this turn
        </div>
      )}
    </div>
  );
}
