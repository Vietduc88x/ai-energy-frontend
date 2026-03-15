'use client';

import type { ProjectGuidancePack } from '@/lib/api-client';
import { FamilyBadge, DeliverableMetaFooter } from './deliverables/DeliverableBadge';

// ─── Compact Caps ────────────────────────────────────────────────────────────
const MAX_STAGE_BULLETS = 6;
const MAX_CHECKLIST_SECTIONS = 4;
const MAX_CHECKLIST_ITEMS_PER_SECTION = 5;
const MAX_DOC_CATEGORIES = 4;
const MAX_DOCS_PER_CATEGORY = 5;
const MAX_EPC_SECTIONS = 4;
const MAX_QUESTIONS_PER_SECTION = 5;
const MAX_RISKS = 8;
const MAX_CITATIONS = 5;

/** Truncate text to max chars at word boundary, adding '...' if needed. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return (cut > max * 0.3 ? text.slice(0, cut) : text.slice(0, max)).trim() + '\u2026';
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</h3>
  );
}

function OmittedNote({ shown, total, label }: { shown: number; total: number; label: string }) {
  if (shown >= total) return null;
  return (
    <p className="text-[10px] text-gray-400 mt-1 italic">
      Showing {shown} of {total} {label} — open full report for complete list
    </p>
  );
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-500',
};

function SeverityBadge({ severity }: { severity?: string | null }) {
  if (!severity) return null;
  return (
    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${SEVERITY_BADGE[severity] || SEVERITY_BADGE.medium}`}>
      {severity}
    </span>
  );
}

export function ProjectGuidanceCard({ data }: { data: ProjectGuidancePack }) {
  const totalChecklist = data.checklist.reduce((s, c) => s + c.items.length, 0);
  const totalDocs = data.documentRequestList.reduce((s, c) => s + c.documents.length, 0);
  const totalQuestions = data.epcReviewQuestions.reduce((s, c) => s + c.questions.length, 0);
  const exec = data.executiveSummary;
  const criticalRisks = data.riskStarter.filter(r => r.severity === 'critical' || r.severity === 'high');
  const supportingRisks = data.riskStarter.filter(r => r.severity !== 'critical' && r.severity !== 'high');

  return (
    <div className="bg-white border border-teal-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <FamilyBadge family="pack" />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {data.stage.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1.5">
              {data.technology.length > 0
                ? data.technology.map(t => t.replace(/_/g, ' ')).join(', ')
                : data.projectType.replace(/_/g, ' ')}
              {data.jurisdiction ? ` \u2014 ${data.jurisdiction}` : ''}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-teal-700">{totalChecklist}</p>
                <p className="text-[10px] text-gray-400 uppercase">checks</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal-700">{data.riskStarter.length}</p>
                <p className="text-[10px] text-gray-400 uppercase">risks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">

        {/* ── 1. Executive Summary ────────────────────────────────────── */}
        {exec && (exec.criticalItems.length > 0 || exec.topBlocker || exec.topRisk) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2">Executive Summary</h3>
            {exec.criticalItems.length > 0 && (
              <ul className="space-y-1 mb-2">
                {exec.criticalItems.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-red-800">
                    <span className="text-red-500 flex-shrink-0 font-bold mt-0.5">!</span>
                    {truncate(item, 200)}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 text-[11px]">
              {exec.topBlocker && (
                <div><span className="font-semibold text-red-700">Top Blocker:</span> <span className="text-red-800">{truncate(exec.topBlocker, 100)}</span></div>
              )}
              {exec.topEvidenceNeed && (
                <div><span className="font-semibold text-amber-700">Evidence Need:</span> <span className="text-amber-800">{truncate(exec.topEvidenceNeed, 100)}</span></div>
              )}
              {exec.topRisk && (
                <div><span className="font-semibold text-orange-700">Top Risk:</span> <span className="text-orange-800">{truncate(exec.topRisk, 100)}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <p className="text-sm text-gray-700 leading-relaxed">{truncate(data.summary, 400)}</p>

        {/* ── 2. Critical Issues (checklist items with [critical] tag) ── */}
        {data.checklist.length > 0 && (
          <div>
            <SectionTitle>Due Diligence Checklist ({totalChecklist} items)</SectionTitle>
            <div className="space-y-3">
              {data.checklist.slice(0, MAX_CHECKLIST_SECTIONS).map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{section.section}</p>
                  <ul className="space-y-0.5 ml-3">
                    {section.items.slice(0, MAX_CHECKLIST_ITEMS_PER_SECTION).map((item, j) => {
                      const isCritical = item.toLowerCase().startsWith('[critical]');
                      const display = item.replace(/^\[(critical|recommended|optional|retrieved)\]\s*/i, '');
                      const tag = item.match(/^\[(critical|recommended|optional|retrieved)\]/i)?.[1]?.toLowerCase();
                      return (
                        <li key={j} className={`flex items-start gap-2 text-xs ${isCritical ? 'text-red-800 font-medium' : 'text-gray-600'}`}>
                          <span className={`flex-shrink-0 mt-0.5 ${isCritical ? 'text-red-400' : 'text-gray-300'}`}>&#9744;</span>
                          <span className="flex-1">{truncate(display, 120)}</span>
                          {tag && <SeverityBadge severity={tag === 'critical' ? 'critical' : tag === 'recommended' ? 'high' : 'low'} />}
                        </li>
                      );
                    })}
                    {section.items.length > MAX_CHECKLIST_ITEMS_PER_SECTION && (
                      <li className="text-[10px] text-gray-400 italic ml-5">
                        +{section.items.length - MAX_CHECKLIST_ITEMS_PER_SECTION} more
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <OmittedNote shown={Math.min(data.checklist.length, MAX_CHECKLIST_SECTIONS)} total={data.checklist.length} label="sections" />
          </div>
        )}

        {/* ── 3. Workstream Review (Stage Guidance + Docs + EPC) ───── */}
        {data.stageGuidance.length > 0 && (
          <div>
            <SectionTitle>Stage Guidance</SectionTitle>
            <ul className="space-y-1">
              {data.stageGuidance.slice(0, MAX_STAGE_BULLETS).map((g, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700">
                  <span className="text-teal-500 flex-shrink-0 mt-0.5">&#9679;</span>
                  {truncate(g, 200)}
                </li>
              ))}
            </ul>
            <OmittedNote shown={Math.min(data.stageGuidance.length, MAX_STAGE_BULLETS)} total={data.stageGuidance.length} label="bullets" />
          </div>
        )}

        {data.documentRequestList.length > 0 && (
          <div>
            <SectionTitle>Document Request List ({totalDocs})</SectionTitle>
            <div className="space-y-3">
              {data.documentRequestList.slice(0, MAX_DOC_CATEGORIES).map((cat, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{cat.category}</p>
                  <div className="space-y-1 ml-3">
                    {cat.documents.slice(0, MAX_DOCS_PER_CATEGORY).map((doc, j) => (
                      <div key={j} className="text-xs">
                        <span className="text-gray-700">{truncate(doc.name, 100)}</span>
                        {doc.whyItMatters && (
                          <span className="text-gray-400 ml-1">&mdash; {truncate(doc.whyItMatters, 80)}</span>
                        )}
                      </div>
                    ))}
                    {cat.documents.length > MAX_DOCS_PER_CATEGORY && (
                      <p className="text-[10px] text-gray-400 italic">
                        +{cat.documents.length - MAX_DOCS_PER_CATEGORY} more
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <OmittedNote shown={Math.min(data.documentRequestList.length, MAX_DOC_CATEGORIES)} total={data.documentRequestList.length} label="categories" />
          </div>
        )}

        {data.epcReviewQuestions.length > 0 && (
          <div>
            <SectionTitle>EPC Review Questions ({totalQuestions})</SectionTitle>
            <div className="space-y-3">
              {data.epcReviewQuestions.slice(0, MAX_EPC_SECTIONS).map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{section.section}</p>
                  <ul className="space-y-0.5 ml-3">
                    {section.questions.slice(0, MAX_QUESTIONS_PER_SECTION).map((q, j) => (
                      <li key={j} className="flex gap-2 text-xs text-gray-600">
                        <span className="text-teal-400 flex-shrink-0">?</span>
                        {truncate(q, 150)}
                      </li>
                    ))}
                    {section.questions.length > MAX_QUESTIONS_PER_SECTION && (
                      <li className="text-[10px] text-gray-400 italic ml-5">
                        +{section.questions.length - MAX_QUESTIONS_PER_SECTION} more
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <OmittedNote shown={Math.min(data.epcReviewQuestions.length, MAX_EPC_SECTIONS)} total={data.epcReviewQuestions.length} label="sections" />
          </div>
        )}

        {/* ── 4. Risk Register ─────────────────────────────────────── */}
        {data.riskStarter.length > 0 && (
          <div>
            <SectionTitle>Risk Register ({data.riskStarter.length})</SectionTitle>
            <div className="space-y-2">
              {/* Critical/High risks shown prominently */}
              {criticalRisks.slice(0, MAX_RISKS).map((risk, i) => (
                <div key={`crit-${i}`} className="border border-red-200 bg-red-50 rounded-lg p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900 flex-1">{truncate(risk.risk, 100)}</p>
                    <SeverityBadge severity={risk.severity} />
                  </div>
                  {risk.cause && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      <span className="font-medium text-gray-600">Cause:</span> {truncate(risk.cause, 120)}
                    </p>
                  )}
                  {risk.impact && (
                    <p className="text-[11px] text-gray-500">
                      <span className="font-medium text-gray-600">Impact:</span> {truncate(risk.impact, 120)}
                    </p>
                  )}
                  {risk.mitigation && (
                    <p className="text-[11px] text-teal-700">
                      <span className="font-medium">Mitigation:</span> {truncate(risk.mitigation, 120)}
                    </p>
                  )}
                </div>
              ))}
              {/* Supporting risks (medium/low) — compact */}
              {supportingRisks.length > 0 && (
                <div className="space-y-1.5 mt-1">
                  {supportingRisks.slice(0, Math.max(0, MAX_RISKS - criticalRisks.length)).map((risk, i) => (
                    <div key={`supp-${i}`} className="border border-gray-100 rounded-lg p-2 opacity-80">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-gray-700 flex-1">{truncate(risk.risk, 100)}</p>
                        <SeverityBadge severity={risk.severity} />
                      </div>
                      {risk.mitigation && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          <span className="font-medium">Mitigation:</span> {truncate(risk.mitigation, 100)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <OmittedNote shown={Math.min(data.riskStarter.length, MAX_RISKS)} total={data.riskStarter.length} label="risks" />
          </div>
        )}

        {/* ── 5. Sources ───────────────────────────────────────────── */}
        {data.citations.length > 0 && (
          <div>
            <SectionTitle>Sources ({data.sourceCoverage.guidelineCount} guidelines)</SectionTitle>
            <div className="space-y-1">
              {data.citations.slice(0, MAX_CITATIONS).map((cit, i) => (
                <div key={i} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-gray-400 font-mono">[{i + 1}]</span>
                  <span>
                    {cit.url ? (
                      <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                        {cit.title}
                      </a>
                    ) : (
                      <span className="text-gray-700">{cit.title}</span>
                    )}
                    {cit.section && <span className="text-gray-400 ml-1">({cit.section})</span>}
                  </span>
                </div>
              ))}
              {data.citations.length > MAX_CITATIONS && (
                <p className="text-[10px] text-gray-400 italic">
                  +{data.citations.length - MAX_CITATIONS} more sources — see full report
                </p>
              )}
            </div>
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
