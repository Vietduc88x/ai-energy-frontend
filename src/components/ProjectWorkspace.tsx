'use client';

import { useState } from 'react';
import type { CopilotPanel as CopilotPanelData, ContextSummary, EvidenceStatus } from '@/lib/api-client';
import { buildVisibleContextIdentity, formatContextLabel, formatEnumLabel } from '@/lib/format-display';

// ─── Status styling ──────────────────────────────────────────────────────────

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

const GATE_STYLE: Record<string, string> = {
  met:           'text-emerald-700 bg-emerald-50 border-emerald-200',
  partially_met: 'text-amber-700 bg-amber-50 border-amber-200',
  not_met:       'text-red-700 bg-red-50 border-red-200',
  unknown:       'text-gray-500 bg-gray-50 border-gray-200',
};

const SEVERITY_STYLE: Record<string, string> = {
  critical:    'text-red-600',
  significant: 'text-amber-600',
  minor:       'text-gray-500',
};

const PLAN_STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  open:     { dot: 'bg-blue-400',    text: 'text-blue-600',    label: 'Open' },
  done:     { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Done' },
  blocked:  { dot: 'bg-red-400',     text: 'text-red-600',     label: 'Blocked' },
  deferred: { dot: 'bg-gray-400',    text: 'text-gray-500',    label: 'Deferred' },
};

const CHANGE_TYPE_ICON: Record<string, { icon: string; color: string }> = {
  plan:     { icon: '▸', color: 'text-blue-500' },
  evidence: { icon: '◆', color: 'text-amber-500' },
  gate:     { icon: '◇', color: 'text-violet-500' },
  blocker:  { icon: '✓', color: 'text-emerald-500' },
};

const EVIDENCE_CYCLE: EvidenceStatus[] = ['missing', 'partial', 'provided'];

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ProjectWorkspaceProps {
  panel: CopilotPanelData;
  recentContexts?: ContextSummary[];
  onSwitchContext?: (contextId: string) => void;
  onNewContext?: () => void;
  onUpdateEvidence?: (item: string, status: EvidenceStatus) => void;
  onMarkActionDone?: (actionId: string) => void;
  onClose: () => void;
}

// ─── Sections ────────────────────────────────────────────────────────────────

type Section = 'plan' | 'evidence' | 'gates' | 'blockers' | 'changes';

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjectWorkspace({
  panel,
  recentContexts,
  onSwitchContext,
  onNewContext,
  onUpdateEvidence,
  onMarkActionDone,
  onClose,
}: ProjectWorkspaceProps) {
  const { context, progress, evidence, gates, blockers, allPlanItems, recentChanges } = panel;
  const visibleIdentity = buildVisibleContextIdentity(context);
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(['plan', 'evidence', 'gates', 'blockers', 'changes']),
  );
  const [planFilter, setPlanFilter] = useState<'all' | 'open' | 'done' | 'blocked' | 'deferred'>('all');

  const toggleSection = (s: Section) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const otherContexts = recentContexts?.filter(c => c.id !== context.projectContextId) ?? [];
  const progressPct = progress.planTotal > 0 ? Math.round((progress.planDone / progress.planTotal) * 100) : 0;

  // Full plan items with optional filtering
  const planItems = allPlanItems ?? [];
  const filteredPlan = planFilter === 'all' ? planItems : planItems.filter(p => p.status === planFilter);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-[340px] flex-shrink-0" data-testid="project-workspace">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Project Workspace</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors" title="Close workspace">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="font-medium text-sm text-gray-800 leading-snug">{visibleIdentity.title || formatContextLabel(context.label)}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
          <span className="text-gray-400">{formatEnumLabel(context.workflowType)}</span>
          {context.technology && <span className="text-gray-300">·</span>}
          {visibleIdentity.technologyLabel && <span className="text-gray-400">{visibleIdentity.technologyLabel}</span>}
          {context.jurisdiction && <span className="text-gray-300">·</span>}
          {context.jurisdiction && <span className="text-gray-500 font-medium">{context.jurisdiction}</span>}
          {context.stage && <span className="text-gray-300">·</span>}
          {context.stage && <span className="text-gray-400">{formatEnumLabel(context.stage)}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
          <span className="text-gray-400">Turn {context.turnCount}</span>
          {panel.hasChanges && <span className="text-blue-500 font-medium">· Updated this turn</span>}
        </div>

        {/* Context switcher */}
        {otherContexts.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-300">Other contexts</span>
            <div className="mt-1 space-y-0.5">
              {otherContexts.slice(0, 3).map(c => (
                <button
                  key={c.id}
                  onClick={() => onSwitchContext?.(c.id)}
                  className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors truncate"
                >
                  {formatContextLabel(c.label)}
                  <span className="text-gray-300 ml-1">({c.planDone}/{c.planTotal})</span>
                </button>
              ))}
              {onNewContext && (
                <button
                  onClick={onNewContext}
                  className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-blue-50 text-blue-500 font-medium transition-colors"
                >
                  + New project
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">

        {/* ── Progress overview ── */}
        <div className="text-xs text-gray-500 flex items-center gap-3 mb-3 px-1">
          <span className="font-semibold text-lg text-gray-800">{progressPct}%</span>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              {progress.planDone > 0 && (
                <div className="bg-emerald-500 rounded-l-full transition-all" style={{ width: `${(progress.planDone / progress.planTotal) * 100}%` }} />
              )}
              {progress.planBlocked > 0 && (
                <div className="bg-red-400 transition-all" style={{ width: `${(progress.planBlocked / progress.planTotal) * 100}%` }} />
              )}
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-gray-400">
              <span>{progress.planDone} done</span>
              <span>{progress.planOpen} open</span>
              {progress.planBlocked > 0 && <span className="text-red-400">{progress.planBlocked} blocked</span>}
            </div>
          </div>
        </div>

        {/* ── Recent changes ── */}
        {recentChanges && recentChanges.length > 0 && (
          <SectionAccordion
            title="Recent Changes"
            count={`${recentChanges.length}`}
            expanded={expandedSections.has('changes')}
            onToggle={() => toggleSection('changes')}
            accent="blue"
          >
            <div className="space-y-1.5" data-testid="recent-changes">
              {recentChanges.slice(0, 8).map((c, i) => {
                const style = CHANGE_TYPE_ICON[c.type] ?? CHANGE_TYPE_ICON.plan;
                return (
                  <div key={i} className="flex items-start gap-1.5 text-xs" data-testid="change-item">
                    <span className={`flex-shrink-0 mt-0.5 ${style.color} font-bold`}>{style.icon}</span>
                    <div className="flex-1 min-w-0 leading-snug">
                      <span className="text-gray-600 truncate block">{c.description}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-medium">{c.detail}</span>
                        <span className="text-[9px] text-gray-300">turn {c.turn}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionAccordion>
        )}

        {/* ── Full plan ── */}
        {planItems.length > 0 && (
          <SectionAccordion
            title="Plan"
            count={`${progress.planDone}/${progress.planTotal}`}
            expanded={expandedSections.has('plan')}
            onToggle={() => toggleSection('plan')}
          >
            {/* Filter tabs */}
            <div className="flex gap-1 mb-2 flex-wrap" data-testid="plan-filters">
              {(['all', 'open', 'blocked', 'done', 'deferred'] as const).map(f => {
                const count = f === 'all' ? planItems.length
                  : f === 'open' ? progress.planOpen
                  : f === 'blocked' ? progress.planBlocked
                  : f === 'done' ? progress.planDone
                  : progress.planDeferred;
                if (f !== 'all' && count === 0) return null;
                return (
                  <button
                    key={f}
                    onClick={() => setPlanFilter(f)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      planFilter === f
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`plan-filter-${f}`}
                  >
                    {f === 'all' ? 'All' : PLAN_STATUS_STYLE[f]?.label ?? f} ({count})
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5" data-testid="full-plan-list">
              {filteredPlan.map((p, i) => {
                const style = PLAN_STATUS_STYLE[p.status] ?? PLAN_STATUS_STYLE.open;
                const isDone = p.status === 'done';
                const isActionable = p.status === 'open' && onMarkActionDone;
                return (
                  <div key={p.actionId || i} className="flex items-start gap-2 group" data-testid="plan-item">
                    {isActionable ? (
                      <button
                        onClick={() => onMarkActionDone!(p.actionId)}
                        className="flex-shrink-0 w-4 h-4 mt-0.5 rounded border border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                        title="Mark done"
                        data-testid="ws-mark-done-btn"
                      />
                    ) : isDone ? (
                      <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className={`flex-shrink-0 w-2.5 h-2.5 mt-1 rounded-full ${style.dot}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs leading-snug ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {p.action}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {p.blocking && <span className="text-[9px] text-red-400 font-semibold">CRITICAL</span>}
                        <span className={`text-[9px] font-medium ${style.text}`}>{style.label}</span>
                        {p.workstream && <span className="text-[9px] text-gray-300">{p.workstream}</span>}
                        {p.dependsOn.length > 0 && (
                          <span className="text-[9px] text-gray-300" title={`Depends on: ${p.dependsOn.join(', ')}`}>
                            ← {p.dependsOn.length} dep{p.dependsOn.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPlan.length === 0 && (
                <div className="text-[10px] text-gray-400 py-1">No {planFilter} items</div>
              )}
            </div>
          </SectionAccordion>
        )}

        {/* ── Evidence ── */}
        {evidence.total > 0 && (
          <SectionAccordion
            title="Evidence"
            count={`${evidence.provided}/${evidence.total}`}
            expanded={expandedSections.has('evidence')}
            onToggle={() => toggleSection('evidence')}
          >
            <div className="space-y-1">
              {evidence.items.map((e, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  {onUpdateEvidence ? (
                    <button
                      onClick={() => {
                        const nextIdx = (EVIDENCE_CYCLE.indexOf(e.status) + 1) % EVIDENCE_CYCLE.length;
                        onUpdateEvidence(e.item, EVIDENCE_CYCLE[nextIdx]);
                      }}
                      className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${EVIDENCE_DOT[e.status]} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all cursor-pointer`}
                      title={`${e.status} — click to cycle`}
                      data-testid="ws-evidence-btn"
                    />
                  ) : (
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full ${EVIDENCE_DOT[e.status]}`} />
                  )}
                  <span className={`flex-1 text-xs leading-snug ${EVIDENCE_TEXT[e.status]}`}>{e.item}</span>
                  {e.gateBlocking && e.status !== 'provided' && (
                    <span className="text-[8px] text-red-400 font-bold flex-shrink-0">GATE</span>
                  )}
                </div>
              ))}
            </div>
          </SectionAccordion>
        )}

        {/* ── Stage Gates ── */}
        {gates.length > 0 && (
          <SectionAccordion
            title="Stage Gates"
            count={`${gates.filter(g => g.status === 'met').length}/${gates.length}`}
            expanded={expandedSections.has('gates')}
            onToggle={() => toggleSection('gates')}
          >
            <div className="space-y-2">
              {gates.map((g, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${GATE_STYLE[g.status] ?? GATE_STYLE.unknown}`}>
                      {g.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-700 font-medium">{g.gate}</span>
                  </div>
                  {g.blockers.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {g.blockers.map((b, j) => (
                        <div key={j} className="text-[11px] text-red-500 flex items-start gap-1">
                          <span className="text-red-300 flex-shrink-0 mt-px">·</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionAccordion>
        )}

        {/* ── Blockers ── */}
        {blockers.activeCount > 0 && (
          <SectionAccordion
            title="Blockers"
            count={`${blockers.activeCount} active`}
            expanded={expandedSections.has('blockers')}
            onToggle={() => toggleSection('blockers')}
            accent="red"
          >
            <div className="space-y-2">
              {blockers.items.filter(b => !b.resolved).map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className={`flex-shrink-0 mt-0.5 text-xs font-bold ${SEVERITY_STYLE[b.severity] ?? 'text-gray-500'}`}>
                    {b.severity === 'critical' ? '!!' : '!'}
                  </span>
                  <div className="text-xs leading-snug">
                    <span className="text-gray-800 font-medium">{b.blocker}</span>
                    <div className="text-gray-400 mt-0.5">Blocks: {b.blocks}</div>
                    <span className={`text-[9px] font-semibold uppercase ${SEVERITY_STYLE[b.severity] ?? 'text-gray-400'}`}>{b.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionAccordion>
        )}

        {blockers.resolvedCount > 0 && (
          <div className="text-[10px] text-gray-400 px-1 pt-1">
            {blockers.resolvedCount} blocker{blockers.resolvedCount > 1 ? 's' : ''} resolved
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Accordion helper ────────────────────────────────────────────────────────

function SectionAccordion({
  title,
  count,
  expanded,
  onToggle,
  accent,
  children,
}: {
  title: string;
  count: string;
  expanded: boolean;
  onToggle: () => void;
  accent?: 'red' | 'blue';
  children: React.ReactNode;
}) {
  const accentColor = accent === 'red' ? 'text-red-600' : accent === 'blue' ? 'text-blue-600' : 'text-gray-700';
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50/80 transition-colors"
      >
        <span className={`text-xs font-semibold ${accentColor}`}>{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{count}</span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
