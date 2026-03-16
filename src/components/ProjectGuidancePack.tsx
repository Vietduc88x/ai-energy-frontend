'use client';

import type { ProjectGuidancePack } from '@/lib/api-client';
import { FamilyBadge, DeliverableMetaFooter } from './deliverables/DeliverableBadge';

// ─── Display Caps ────────────────────────────────────────────────────────────
const MAX_CRITICAL_ITEMS = 5;
const MAX_CHECKLIST_ITEMS = 8;
const MAX_DOCS = 6;
const MAX_EPC = 6;
const MAX_RISKS = 6;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return (cut > max * 0.3 ? text.slice(0, cut) : text.slice(0, max)).trim() + '\u2026';
}

function MoreNote({ shown, total, label }: { shown: number; total: number; label: string }) {
  if (shown >= total) return null;
  return (
    <p className="text-[10px] text-gray-400 mt-2 italic">
      +{total - shown} more {label} in full report
    </p>
  );
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

export function ProjectGuidanceCard({ data }: { data: ProjectGuidancePack }) {
  const totalChecklist = data.checklist.reduce((s, c) => s + c.items.length, 0);
  const exec = data.executiveSummary;
  const names = data.sectionNames;
  const judgments = data.sectionJudgments;

  // Flatten all checklist items, prioritize critical
  const allItems = data.checklist.flatMap(s => s.items);
  const criticalItems = allItems.filter(i => parseSeverityTag(i) === 'critical');
  const otherItems = allItems.filter(i => parseSeverityTag(i) !== 'critical');

  // Flatten risk items, prioritize critical/high
  const criticalRisks = data.riskStarter.filter(r => r.severity === 'critical' || r.severity === 'high');
  const otherRisks = data.riskStarter.filter(r => r.severity !== 'critical' && r.severity !== 'high');

  // Flatten docs
  const allDocs = data.documentRequestList.flatMap(c => c.documents);

  // Flatten EPC
  const allEpc = data.epcReviewQuestions.flatMap(s => s.questions);

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

      <div className="px-5 py-4 space-y-6">

        {/* ── Decision Focus ───────────────────────────────────────── */}
        {exec && (exec.criticalItems.length > 0 || exec.topBlocker || exec.topRisk) && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-700 mb-3">
              {names?.criticalNow ?? 'Critical Now'}
            </h3>
            {exec.criticalItems.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {exec.criticalItems.slice(0, MAX_CRITICAL_ITEMS).map((item, i) => (
                  <li key={i} className="text-xs text-gray-800 leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-0.5 w-2 h-2 rounded-full bg-red-400" />
                    {truncate(item, 200)}
                  </li>
                ))}
              </ul>
            )}
            {(exec.topBlocker || exec.topEvidenceNeed || exec.topRisk) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {exec.topBlocker && (
                  <div className="bg-red-50 rounded-md px-3 py-2">
                    <span className="font-semibold text-red-700 block mb-0.5">Blocker</span>
                    <span className="text-gray-700">{truncate(exec.topBlocker, 100)}</span>
                  </div>
                )}
                {exec.topEvidenceNeed && (
                  <div className="bg-amber-50 rounded-md px-3 py-2">
                    <span className="font-semibold text-amber-700 block mb-0.5">Evidence Needed</span>
                    <span className="text-gray-700">{truncate(exec.topEvidenceNeed, 100)}</span>
                  </div>
                )}
                {exec.topRisk && (
                  <div className="bg-orange-50 rounded-md px-3 py-2">
                    <span className="font-semibold text-orange-700 block mb-0.5">Top Risk</span>
                    <span className="text-gray-700">{truncate(exec.topRisk, 100)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Summary ──────────────────────────────────────────────── */}
        <p className="text-xs text-gray-600 leading-relaxed">{truncate(data.summary, 350)}</p>

        {/* ── Section Judgments ──────────────────────────────────────── */}
        {judgments && judgments.length > 0 && (
          <div className="space-y-1.5">
            {judgments.slice(0, 3).map((j, i) => (
              <div key={i} className="bg-gray-50 rounded-md px-3 py-2">
                <p className="text-[11px] text-gray-700 leading-relaxed">{j.judgment}</p>
                {j.mainConcern && (
                  <p className="text-[10px] text-red-600 mt-0.5">Priority: {truncate(j.mainConcern, 100)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Required Evidence / Checklist ─────────────────────────── */}
        {totalChecklist > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {names?.evidenceRequired ?? 'Required Evidence'} <span className="font-normal text-gray-400">({totalChecklist})</span>
            </h3>
            <div className="space-y-1">
              {criticalItems.slice(0, MAX_CHECKLIST_ITEMS).map((item, i) => (
                <div key={`c-${i}`} className="flex items-start gap-2 text-xs text-gray-800">
                  <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 160)}</span>
                </div>
              ))}
              {otherItems.slice(0, Math.max(0, MAX_CHECKLIST_ITEMS - criticalItems.length)).map((item, i) => (
                <div key={`o-${i}`} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 160)}</span>
                </div>
              ))}
            </div>
            <MoreNote shown={Math.min(totalChecklist, MAX_CHECKLIST_ITEMS)} total={totalChecklist} label="items" />
          </div>
        )}

        {/* ── Workstream Review (Docs + EPC) ─────────────────────── */}
        {(allDocs.length > 0 || allEpc.length > 0) && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {names?.workstreamReview ?? 'Workstream Review'}
            </h3>

            {allDocs.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  {names?.documentSection ?? 'Required Documents'} ({allDocs.length})
                </p>
                <div className="space-y-1.5">
                  {allDocs.slice(0, MAX_DOCS).map((doc, i) => (
                    <div key={i} className="text-xs leading-relaxed">
                      <span className="text-gray-800">{truncate(doc.name, 80)}</span>
                      {doc.gateBlocking && (
                        <span className="text-[10px] text-red-500 ml-1 font-medium">Gate-blocking</span>
                      )}
                      {doc.providedBy && (
                        <span className="text-[10px] text-gray-400 ml-1">({doc.providedBy})</span>
                      )}
                      {doc.whyItMatters && (
                        <p className="text-[11px] text-gray-500 ml-0 mt-0.5">{truncate(doc.whyItMatters, 100)}</p>
                      )}
                      {doc.consequenceIfMissing && (
                        <p className="text-[10px] text-amber-600 ml-0">If missing: {truncate(doc.consequenceIfMissing, 80)}</p>
                      )}
                    </div>
                  ))}
                </div>
                <MoreNote shown={Math.min(allDocs.length, MAX_DOCS)} total={allDocs.length} label="documents" />
              </div>
            )}

            {allEpc.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  {names?.epcSection ?? 'Review Prompts'} ({allEpc.length})
                </p>
                <div className="space-y-1">
                  {allEpc.slice(0, MAX_EPC).map((q, i) => (
                    <p key={i} className="text-xs text-gray-600 leading-relaxed">{truncate(q, 180)}</p>
                  ))}
                </div>
                <MoreNote shown={Math.min(allEpc.length, MAX_EPC)} total={allEpc.length} label="prompts" />
              </div>
            )}
          </div>
        )}

        {/* ── Risk Register ────────────────────────────────────────── */}
        {data.riskStarter.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {names?.riskSection ?? 'Risk Register'} <span className="font-normal text-gray-400">({data.riskStarter.length})</span>
            </h3>
            <div className="space-y-2">
              {criticalRisks.slice(0, MAX_RISKS).map((risk, i) => (
                <div key={`cr-${i}`} className="bg-red-50 rounded-md px-3 py-2.5">
                  <p className="text-xs font-medium text-gray-900 mb-1">{truncate(risk.risk, 120)}</p>
                  {risk.cause && <p className="text-[11px] text-gray-600">{truncate(risk.cause, 140)}</p>}
                  {risk.mitigation && <p className="text-[11px] text-teal-700 mt-0.5">{truncate(risk.mitigation, 140)}</p>}
                </div>
              ))}
              {otherRisks.slice(0, Math.max(0, MAX_RISKS - criticalRisks.length)).map((risk, i) => (
                <div key={`or-${i}`} className="px-3 py-2 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-700">{truncate(risk.risk, 120)}</p>
                  {risk.mitigation && <p className="text-[11px] text-gray-500 mt-0.5">{truncate(risk.mitigation, 120)}</p>}
                </div>
              ))}
            </div>
            <MoreNote shown={Math.min(data.riskStarter.length, MAX_RISKS)} total={data.riskStarter.length} label="risks" />
          </div>
        )}

        {/* ── Sources ──────────────────────────────────────────────── */}
        {data.citations.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-1">
              Based on {data.sourceCoverage.guidelineCount} source{data.sourceCoverage.guidelineCount !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {data.citations.slice(0, 5).map((cit, i) => (
                <span key={i} className="text-[10px] text-gray-500">{cit.title}</span>
              ))}
              {data.citations.length > 5 && (
                <span className="text-[10px] text-gray-400">+{data.citations.length - 5} more</span>
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
