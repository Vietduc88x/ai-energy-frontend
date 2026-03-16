'use client';

import { useState } from 'react';
import type { ProjectGuidancePack } from '@/lib/api-client';
import { FamilyBadge, DeliverableMetaFooter } from './deliverables/DeliverableBadge';

// ─── Display Caps ────────────────────────────────────────────────────────────
const INITIAL_CRITICAL = 3;
const INITIAL_CHECKLIST = 4;
const INITIAL_DOCS = 3;
const INITIAL_RISKS = 3;
const INITIAL_EPC = 3;
const EXPANDED_LIMIT = 20;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return (cut > max * 0.3 ? text.slice(0, cut) : text.slice(0, max)).trim() + '\u2026';
}

/** Strip severity tags from checklist item text for display */
function stripTag(text: string): string {
  return text.replace(/^\[(critical|recommended|optional|retrieved)\]\s*/i, '');
}

function parseSeverityTag(text: string): string | null {
  const m = text.match(/^\[(critical|recommended|optional|retrieved)\]/i);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  return tag === 'critical' ? 'critical' : tag === 'recommended' ? 'high' : null;
}

function ExpandToggle({ expanded, onToggle, hiddenCount, label }: {
  expanded: boolean; onToggle: () => void; hiddenCount: number; label: string;
}) {
  if (hiddenCount <= 0 && !expanded) return null;
  return (
    <button
      onClick={onToggle}
      className="text-[10px] text-blue-600 hover:text-blue-800 mt-2 cursor-pointer"
    >
      {expanded ? 'Show less' : `+${hiddenCount} more ${label}`}
    </button>
  );
}

export function ProjectGuidanceCard({ data }: { data: ProjectGuidancePack }) {
  const [expandedSections, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const exec = data.executiveSummary;
  const names = data.sectionNames;
  const judgmentMap = new Map((data.sectionJudgments ?? []).map(j => [j.section, j]));

  // Flatten and prioritize
  const allItems = data.checklist.flatMap(s => s.items);
  const criticalItems = allItems.filter(i => parseSeverityTag(i) === 'critical');
  const otherItems = allItems.filter(i => parseSeverityTag(i) !== 'critical');
  const totalChecklist = allItems.length;

  // Issue-centric: use workflowIssues for risks and blockers when available
  const issues = data.workflowIssues ?? [];
  const issueBlockers = issues.filter(i => i.category === 'blocker');
  const issueRisks = issues.filter(i => i.category === 'risk');
  const issueEvidence = issues.filter(i => i.category === 'evidence_gap');
  const hasIssues = issues.length > 0;

  // Fallback to riskStarter when no issues
  const criticalRisks = hasIssues
    ? issueRisks.filter(r => r.severity === 'critical' || r.severity === 'high')
    : data.riskStarter.filter(r => r.severity === 'critical' || r.severity === 'high');
  const otherRisks = hasIssues
    ? issueRisks.filter(r => r.severity !== 'critical' && r.severity !== 'high')
    : data.riskStarter.filter(r => r.severity !== 'critical' && r.severity !== 'high');

  const allDocs = data.documentRequestList.flatMap(c => c.documents);
  const gateBlockingDocs = allDocs.filter(d => d.gateBlocking);
  const otherDocs = allDocs.filter(d => !d.gateBlocking);
  const sortedDocs = [...gateBlockingDocs, ...otherDocs];

  const allEpc = data.epcReviewQuestions.flatMap(s => s.questions);

  // Dynamic limits
  const checklistLimit = expandedSections.checklist ? EXPANDED_LIMIT : INITIAL_CHECKLIST;
  const docsLimit = expandedSections.docs ? EXPANDED_LIMIT : INITIAL_DOCS;
  const risksLimit = expandedSections.risks ? EXPANDED_LIMIT : INITIAL_RISKS;
  const epcLimit = expandedSections.epc ? EXPANDED_LIMIT : INITIAL_EPC;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <FamilyBadge family="pack" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {data.stage.replace(/_/g, ' ')}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-gray-900">
          {data.technology.length > 0
            ? data.technology.map(t => t.replace(/_/g, ' ')).join(', ')
            : data.projectType.replace(/_/g, ' ')}
          {data.jurisdiction ? ` \u2014 ${data.jurisdiction}` : ''}
        </h2>
      </div>

      <div className="px-5 py-4 space-y-5">

        {/* ── Critical Now ─────────────────────────────────────────── */}
        {exec && (exec.criticalItems.length > 0 || exec.topBlocker || exec.topRisk) && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-700 mb-2">
              {names?.criticalNow ?? 'Critical Now'}
            </h3>
            {exec.criticalItems.length > 0 && (
              <ul className="space-y-1 mb-2">
                {exec.criticalItems.slice(0, INITIAL_CRITICAL).map((item, i) => (
                  <li key={i} className="text-xs text-gray-800 leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                    {truncate(item, 180)}
                  </li>
                ))}
              </ul>
            )}
            {(exec.topBlocker || exec.topEvidenceNeed || exec.topRisk) && (
              <div className="flex flex-wrap gap-2 text-[11px]">
                {exec.topBlocker && (
                  <span className="bg-red-50 text-red-700 rounded px-2 py-1">
                    <span className="font-semibold">Blocker:</span> {truncate(exec.topBlocker, 60)}
                  </span>
                )}
                {exec.topEvidenceNeed && (
                  <span className="bg-amber-50 text-amber-700 rounded px-2 py-1">
                    <span className="font-semibold">Evidence:</span> {truncate(exec.topEvidenceNeed, 60)}
                  </span>
                )}
                {exec.topRisk && (
                  <span className="bg-orange-50 text-orange-700 rounded px-2 py-1">
                    <span className="font-semibold">Risk:</span> {truncate(exec.topRisk, 60)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Summary ──────────────────────────────────────────────── */}
        <p className="text-xs text-gray-600 leading-relaxed">{truncate(data.summary, 280)}</p>

        {/* ── Key Blockers (issue-centric) ─────────────────────────── */}
        {hasIssues && issueBlockers.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-700 mb-2">
              Blockers <span className="font-normal text-red-400">({issueBlockers.length})</span>
            </h3>
            <div className="space-y-1">
              {issueBlockers.slice(0, 3).map((b, i) => (
                <div key={`bl-${i}`} className={`rounded px-3 py-1.5 ${b.state?.status === 'resolved' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900">{truncate(b.title, 100)}</p>
                    {b.state?.status === 'resolved' && (
                      <span className="text-[9px] text-green-600 bg-green-100 px-1 py-0.5 rounded font-medium">Resolved</span>
                    )}
                    {b.state?.status === 'evidence_provided' && (
                      <span className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-medium">Evidence received</span>
                    )}
                  </div>
                  {b.blocks && <p className="text-[10px] text-red-600">Blocks: {b.blocks}</p>}
                  {b.recommendedAction && <p className="text-[10px] text-teal-700 mt-0.5">{truncate(b.recommendedAction, 100)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Top Risks ────────────────────────────────────────────── */}
        {(hasIssues ? issueRisks.length > 0 : criticalRisks.length > 0) && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {names?.riskSection ?? 'Risk Register'} <span className="font-normal text-gray-400">({hasIssues ? issueRisks.length : data.riskStarter.length})</span>
            </h3>
            <div className="space-y-1.5">
              {criticalRisks.slice(0, risksLimit).map((risk: any, i: number) => (
                <div key={`cr-${i}`} className="bg-red-50 rounded px-3 py-2">
                  <p className="text-xs font-medium text-gray-900">{truncate(risk.title ?? risk.risk, 120)}</p>
                  {(risk.consequenceIfIgnored || risk.mitigation) && (
                    <p className="text-[11px] text-teal-700 mt-0.5">{truncate(risk.consequenceIfIgnored ?? risk.mitigation, 120)}</p>
                  )}
                </div>
              ))}
              {expandedSections.risks && otherRisks.slice(0, EXPANDED_LIMIT - criticalRisks.length).map((risk: any, i: number) => (
                <div key={`or-${i}`} className="px-3 py-1.5 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-700">{truncate(risk.title ?? risk.risk, 120)}</p>
                </div>
              ))}
            </div>
            <ExpandToggle
              expanded={!!expandedSections.risks}
              onToggle={() => toggle('risks')}
              hiddenCount={(hasIssues ? issueRisks.length : data.riskStarter.length) - Math.min(criticalRisks.length, risksLimit)}
              label="risks"
            />
          </div>
        )}

        {/* ── Required Evidence ─────────────────────────────────────── */}
        {totalChecklist > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {names?.evidenceRequired ?? 'Required Evidence'} <span className="font-normal text-gray-400">({totalChecklist})</span>
            </h3>
            <div className="space-y-0.5">
              {criticalItems.slice(0, checklistLimit).map((item, i) => (
                <div key={`c-${i}`} className="flex items-start gap-2 text-xs text-gray-800">
                  <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 150)}</span>
                </div>
              ))}
              {otherItems.slice(0, Math.max(0, checklistLimit - criticalItems.length)).map((item, i) => (
                <div key={`o-${i}`} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 150)}</span>
                </div>
              ))}
            </div>
            <ExpandToggle
              expanded={!!expandedSections.checklist}
              onToggle={() => toggle('checklist')}
              hiddenCount={totalChecklist - Math.min(totalChecklist, checklistLimit)}
              label="items"
            />
          </div>
        )}

        {/* ── Documents ────────────────────────────────────────────── */}
        {allDocs.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {names?.documentSection ?? 'Required Documents'} <span className="font-normal text-gray-400">({allDocs.length})</span>
            </h3>
            <div className="space-y-1">
              {sortedDocs.slice(0, docsLimit).map((doc, i) => (
                <div key={i} className="text-xs leading-relaxed">
                  <span className="text-gray-800">{truncate(doc.name, 80)}</span>
                  {doc.gateBlocking && (
                    <span className="text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded ml-1 font-medium">Gate-blocking</span>
                  )}
                  {expandedSections.docs && doc.providedBy && (
                    <span className="text-[10px] text-gray-400 ml-1">({doc.providedBy})</span>
                  )}
                </div>
              ))}
            </div>
            <ExpandToggle
              expanded={!!expandedSections.docs}
              onToggle={() => toggle('docs')}
              hiddenCount={allDocs.length - Math.min(allDocs.length, docsLimit)}
              label="documents"
            />
          </div>
        )}

        {/* ── Review Prompts ───────────────────────────────────────── */}
        {allEpc.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {names?.epcSection ?? 'Review Prompts'} <span className="font-normal text-gray-400">({allEpc.length})</span>
            </h3>
            <div className="space-y-0.5">
              {allEpc.slice(0, epcLimit).map((q, i) => (
                <p key={i} className="text-xs text-gray-600 leading-relaxed">{truncate(q, 160)}</p>
              ))}
            </div>
            <ExpandToggle
              expanded={!!expandedSections.epc}
              onToggle={() => toggle('epc')}
              hiddenCount={allEpc.length - Math.min(allEpc.length, epcLimit)}
              label="prompts"
            />
          </div>
        )}

        {/* ── Sources ──────────────────────────────────────────────── */}
        {data.citations.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              Based on {data.sourceCoverage.guidelineCount} source{data.sourceCoverage.guidelineCount !== 1 ? 's' : ''}
              {data.citations.length > 0 && (
                <span className="ml-1 text-gray-400">
                  ({data.citations.slice(0, 3).map(c => c.title).join(', ')}{data.citations.length > 3 ? `, +${data.citations.length - 3} more` : ''})
                </span>
              )}
            </p>
          </div>
        )}

      </div>

      <DeliverableMetaFooter meta={{
        deliverableFamily: 'pack',
        sourceCount: data.sourceCoverage.guidelineCount,
        caveat: data.caveat ?? null,
      }} />
    </div>
  );
}
