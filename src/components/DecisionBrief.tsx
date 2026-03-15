'use client';

import { FamilyBadge } from './deliverables/DeliverableBadge';

// ─── Types (mirrors backend DecisionBrief) ───────────────────────────────────

interface PolicyViabilityNote {
  supportMechanism: string;
  implementationClarity: 'clear' | 'evolving' | 'unclear';
  bankabilityImplication: string;
  unresolvedRisks: string[];
}

export interface DecisionBriefData {
  briefType: 'project_decision' | 'investment_assessment' | 'benchmark_decision';
  headline: string;
  bottomLine: string;
  whatWeKnow: string[];
  whatMatters: string[];
  missingInformation: string[];
  decisionBlockers: Array<{ blocker: string; severity: string; resolution: string }>;
  evidenceRequired: Array<{ item: string; producer: string; leadTime: string; gateBlocking: boolean }>;
  recommendedActions: Array<{ action: string; priority: number; owner: string; blocking: boolean }>;
  confidenceNote: string;
  sourcesUsed: string[];
  viabilityNote: PolicyViabilityNote | null;
  nextMilestone: string | null;
  countryContext: string | null;
  stageGateNote: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRIEF_TYPE_LABELS: Record<string, string> = {
  project_decision: 'Project Decision Brief',
  investment_assessment: 'Investment Assessment',
  benchmark_decision: 'Benchmark Decision Brief',
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  significant: 'bg-amber-100 text-amber-700',
  moderate: 'bg-yellow-100 text-yellow-700',
};

const CLARITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  clear: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Clear' },
  evolving: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Evolving' },
  unclear: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unclear' },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{children}</h3>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DecisionBrief({ data }: { data: DecisionBriefData }) {
  // Guard against partial/malformed data from SSE
  const whatWeKnow = data.whatWeKnow ?? [];
  const whatMatters = data.whatMatters ?? [];
  const missingInformation = data.missingInformation ?? [];
  const decisionBlockers = data.decisionBlockers ?? [];
  const evidenceRequired = data.evidenceRequired ?? [];
  const recommendedActions = data.recommendedActions ?? [];
  const sourcesUsed = data.sourcesUsed ?? [];

  const hasBlockers = decisionBlockers.length > 0;
  const hasEvidence = evidenceRequired.length > 0;
  const hasActions = recommendedActions.length > 0;
  const hasMissing = missingInformation.length > 0;
  const hasWhatMatters = whatMatters.length > 0;

  return (
    <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
        <div className="flex items-center gap-2 flex-wrap">
          <FamilyBadge family="brief" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
            {BRIEF_TYPE_LABELS[data.briefType] || 'Decision Brief'}
          </span>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-1.5 leading-snug">{data.headline}</p>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Bottom Line */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-lg px-3 py-2">
          <SectionTitle>Bottom Line</SectionTitle>
          <p className="text-sm text-gray-800 leading-relaxed">{data.bottomLine}</p>
        </div>

        {/* What We Know */}
        {whatWeKnow.length > 0 && (
          <div>
            <SectionTitle>What We Know</SectionTitle>
            <ul className="space-y-1">
              {whatWeKnow.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700">
                  <span className="flex-shrink-0 w-1 h-1 rounded-full bg-orange-400 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What Matters */}
        {hasWhatMatters && (
          <div>
            <SectionTitle>What Matters</SectionTitle>
            <ul className="space-y-1">
              {whatMatters.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-800 font-medium">
                  <span className="flex-shrink-0 w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decision Blockers */}
        {hasBlockers && (
          <div>
            <SectionTitle>Decision Blockers</SectionTitle>
            <div className="space-y-1.5">
              {decisionBlockers.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${SEVERITY_STYLES[b.severity] || 'bg-gray-100 text-gray-600'}`}>
                    {b.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800">{b.blocker}</span>
                    <span className="text-gray-400 ml-1">— {b.resolution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Information */}
        {hasMissing && (
          <div>
            <SectionTitle>What Is Missing</SectionTitle>
            <ul className="space-y-1">
              {missingInformation.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600">
                  <span className="flex-shrink-0 text-amber-500">?</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence Required */}
        {hasEvidence && (
          <div>
            <SectionTitle>Evidence Required</SectionTitle>
            <div className="space-y-1">
              {evidenceRequired.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {e.gateBlocking && (
                    <span className="flex-shrink-0 px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">GATE</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800">{e.item}</span>
                    <span className="text-gray-400 ml-1">({e.producer}, ~{e.leadTime})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {hasActions && (
          <div>
            <SectionTitle>Recommended Next Actions</SectionTitle>
            <div className="space-y-1">
              {recommendedActions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    a.blocking ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800">{a.action}</span>
                    <span className="text-gray-400 ml-1">({a.owner})</span>
                    {a.blocking && (
                      <span className="ml-1 text-[9px] font-semibold text-orange-600">CRITICAL PATH</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Viability Note */}
        {data.viabilityNote && typeof data.viabilityNote === 'object' && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2">
            <SectionTitle>Policy Viability</SectionTitle>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Support mechanism:</span>
                <span className="text-gray-800 font-medium">{String(data.viabilityNote.supportMechanism || '').slice(0, 100)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Implementation clarity:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CLARITY_STYLES[data.viabilityNote.implementationClarity]?.bg} ${CLARITY_STYLES[data.viabilityNote.implementationClarity]?.text}`}>
                  {CLARITY_STYLES[data.viabilityNote.implementationClarity]?.label}
                </span>
              </div>
              <p className="text-gray-600">{data.viabilityNote.bankabilityImplication}</p>
              {(data.viabilityNote.unresolvedRisks ?? []).length > 0 && (
                <div>
                  <span className="text-gray-500">Unresolved risks: </span>
                  <span className="text-amber-700">{(data.viabilityNote.unresolvedRisks ?? []).join('; ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage Gate + Next Milestone row */}
        {(data.stageGateNote || data.nextMilestone) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {data.stageGateNote && (
              <div className="flex-1 min-w-[140px] bg-gray-50 rounded px-2.5 py-1.5">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">Stage Gates</span>
                <p className="text-gray-700 mt-0.5">{data.stageGateNote}</p>
              </div>
            )}
            {data.nextMilestone && (
              <div className="flex-1 min-w-[140px] bg-gray-50 rounded px-2.5 py-1.5">
                <span className="text-gray-400 text-[10px] uppercase font-semibold">Next Milestone</span>
                <p className="text-gray-700 mt-0.5">{data.nextMilestone}</p>
              </div>
            )}
          </div>
        )}

        {/* Country Context */}
        {data.countryContext && (
          <div className="text-xs text-gray-500 italic">{data.countryContext}</div>
        )}
      </div>

      {/* Footer — Confidence + Sources */}
      <div className="px-4 py-2 border-t border-gray-100 space-y-1">
        <p className="text-[10px] text-gray-500">{data.confidenceNote}</p>
        {sourcesUsed.length > 0 && (
          <p className="text-[10px] text-gray-400">Sources: {sourcesUsed.join(', ')}</p>
        )}
      </div>
    </div>
  );
}
