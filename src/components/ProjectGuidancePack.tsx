'use client';

import { useState } from 'react';
import type { ProjectGuidancePack } from '@/lib/api-client';
import { FamilyBadge, DeliverableMetaFooter } from './deliverables/DeliverableBadge';
import { formatTechLabel, formatEnumLabel, cleanVisibleText } from '@/lib/format-display';

// ─── Display Caps ────────────────────────────────────────────────────────────
const INITIAL_ITEMS = 3;
const EXPANDED_LIMIT = 15;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return (cut > max * 0.3 ? text.slice(0, cut) : text.slice(0, max)).trim() + '\u2026';
}

function stripTag(text: string): string {
  return text.replace(/^\[(critical|recommended|optional|retrieved)\]\s*/i, '');
}

function parseSeverityTag(text: string): string | null {
  const m = text.match(/^\[(critical|recommended|optional|retrieved)\]/i);
  if (!m) return null;
  return m[1].toLowerCase() === 'critical' ? 'critical' : m[1].toLowerCase() === 'recommended' ? 'high' : null;
}

function ExpandButton({ expanded, onToggle, hiddenCount, label }: {
  expanded: boolean; onToggle: () => void; hiddenCount: number; label: string;
}) {
  if (hiddenCount <= 0 && !expanded) return null;
  return (
    <button onClick={onToggle} className="text-[10px] text-blue-600 hover:text-blue-800 mt-1.5 cursor-pointer">
      {expanded ? 'Show less' : `+${hiddenCount} more ${label}`}
    </button>
  );
}

// ─── Section Component ──────────────────────────────────────────────────────

function Section({ title, count, children, className }: {
  title: string; count?: number; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-gray-800 tracking-wide mb-2.5">
        {title}
        {count !== undefined && <span className="font-normal text-gray-400 ml-1.5">({count})</span>}
      </h3>
      {children}
    </div>
  );
}

// ─── Main Card Component ────────────────────────────────────────────────────

export function ProjectGuidanceCard({ data }: { data: ProjectGuidancePack }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const exec = data.executiveSummary;
  const names = data.sectionNames;
  const timeline = data.issueTimeline;
  const issues = data.workflowIssues ?? [];
  const themes = data.reviewThemes ?? [];

  // Flatten and categorize
  const allItems = data.checklist.flatMap(s => s.items);
  const criticalItems = allItems.filter(i => parseSeverityTag(i) === 'critical');
  const otherItems = allItems.filter(i => parseSeverityTag(i) !== 'critical');

  const issueBlockers = issues.filter(i => i.category === 'blocker');
  const issueRisks = issues.filter(i => i.category === 'risk');
  const hasIssues = issues.length > 0;

  const allDocs = data.documentRequestList.flatMap(c => c.documents);
  const sortedDocs = [...allDocs].sort((a, b) => (b.gateBlocking ? 1 : 0) - (a.gateBlocking ? 1 : 0));

  const allEpc = data.epcReviewQuestions.flatMap(s => s.questions);

  const criticalRisks = hasIssues
    ? issueRisks.filter(r => r.severity === 'critical' || r.severity === 'high')
    : data.riskStarter.filter(r => r.severity === 'critical' || r.severity === 'high');

  // Technology labels — hybrid-aware
  const techLabels = data.technology.length > 0
    ? data.technology.map(formatTechLabel)
    : [formatEnumLabel(data.projectType)];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

      {/* ── Deliverable Header ─────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <FamilyBadge family="pack" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {formatEnumLabel(data.stage)}
          </span>
        </div>
        <h2 className="text-base font-semibold text-gray-900 leading-snug">
          {techLabels.join(' + ')}
          {data.jurisdiction ? <span className="text-gray-500 font-normal"> \u2014 {data.jurisdiction}</span> : ''}
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{truncate(cleanVisibleText(data.summary), 200)}</p>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* ── Decision Stance ──────────────────────────────────────── */}
        {timeline && timeline.decisionStance !== 'unchanged' && (
          <div className={`rounded-lg px-4 py-3 text-xs ${
            timeline.decisionStance === 'improved' ? 'bg-green-50 text-green-800 border border-green-200' :
            timeline.decisionStance === 'weakened' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <p className="font-medium">{timeline.stanceReason}</p>
            {timeline.mainBlockerNow && timeline.decisionStance !== 'improved' && (
              <p className="text-[11px] mt-1 opacity-75">Main blocker: {truncate(timeline.mainBlockerNow, 80)}</p>
            )}
          </div>
        )}

        {/* ── Critical Now Strip ───────────────────────────────────── */}
        {exec && (exec.topBlocker || exec.topEvidenceNeed || exec.topRisk) && (
          <div className="flex flex-wrap gap-2">
            {exec.topBlocker && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-3 py-1 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {truncate(exec.topBlocker, 50)}
              </span>
            )}
            {exec.topEvidenceNeed && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {truncate(exec.topEvidenceNeed, 50)}
              </span>
            )}
            {exec.topRisk && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 rounded-full px-3 py-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                {truncate(exec.topRisk, 50)}
              </span>
            )}
          </div>
        )}

        {/* ── Blockers ─────────────────────────────────────────────── */}
        {hasIssues && issueBlockers.length > 0 && (
          <Section title="Blockers" count={issueBlockers.length}>
            <div className="space-y-2">
              {issueBlockers.slice(0, INITIAL_ITEMS).map((b, i) => (
                <div key={i} className={`rounded-lg px-4 py-2.5 ${b.state?.status === 'resolved' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900 flex-1">{truncate(b.title, 100)}</p>
                    {b.state?.status === 'resolved' && (
                      <span className="text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">Resolved</span>
                    )}
                  </div>
                  {b.blocks && <p className="text-[11px] text-red-600 mt-1">Blocks: {b.blocks}</p>}
                  {b.recommendedAction && <p className="text-[11px] text-teal-700 mt-0.5">{truncate(b.recommendedAction, 100)}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Top Risks ────────────────────────────────────────────── */}
        {criticalRisks.length > 0 && (
          <Section title={names?.riskSection ?? 'Key Risks'} count={hasIssues ? issueRisks.length : data.riskStarter.length}>
            <div className="space-y-1.5">
              {criticalRisks.slice(0, expanded.risks ? EXPANDED_LIMIT : INITIAL_ITEMS).map((risk: any, i: number) => (
                <div key={i} className="rounded-lg bg-gray-50 px-4 py-2.5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-900">{truncate(risk.title ?? risk.risk, 120)}</p>
                  {(risk.consequenceIfIgnored || risk.mitigation) && (
                    <p className="text-[11px] text-gray-600 mt-0.5">{truncate(risk.consequenceIfIgnored ?? risk.mitigation, 120)}</p>
                  )}
                </div>
              ))}
            </div>
            <ExpandButton expanded={!!expanded.risks} onToggle={() => toggle('risks')}
              hiddenCount={(hasIssues ? issueRisks.length : data.riskStarter.length) - INITIAL_ITEMS} label="risks" />
          </Section>
        )}

        {/* ── Required Evidence ─────────────────────────────────────── */}
        {allItems.length > 0 && (
          <Section title={names?.evidenceRequired ?? 'Required Evidence'} count={allItems.length}>
            <div className="space-y-1">
              {criticalItems.slice(0, expanded.evidence ? EXPANDED_LIMIT : INITIAL_ITEMS).map((item, i) => (
                <div key={`c-${i}`} className="flex items-start gap-2.5 text-xs text-gray-800 py-0.5">
                  <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 140)}</span>
                </div>
              ))}
              {otherItems.slice(0, Math.max(0, (expanded.evidence ? EXPANDED_LIMIT : INITIAL_ITEMS) - criticalItems.length)).map((item, i) => (
                <div key={`o-${i}`} className="flex items-start gap-2.5 text-xs text-gray-500 py-0.5">
                  <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="leading-relaxed">{truncate(stripTag(item), 140)}</span>
                </div>
              ))}
            </div>
            <ExpandButton expanded={!!expanded.evidence} onToggle={() => toggle('evidence')}
              hiddenCount={allItems.length - INITIAL_ITEMS} label="items" />
          </Section>
        )}

        {/* ── Review Themes (replaces flat EPC list) ───────────────── */}
        {themes.length > 0 && (
          <Section title={names?.epcSection ?? 'Review Themes'} count={allEpc.length}>
            <div className="space-y-3">
              {themes.slice(0, expanded.themes ? themes.length : 4).map((theme, ti) => (
                <div key={ti}>
                  <button
                    onClick={() => toggle(`theme-${ti}`)}
                    className="w-full text-left flex items-center justify-between group cursor-pointer"
                  >
                    <h4 className="text-[11px] font-semibold text-gray-700 group-hover:text-gray-900">
                      {theme.theme} <span className="font-normal text-gray-400">({theme.items.length})</span>
                    </h4>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                      {expanded[`theme-${ti}`] ? '\u25B2' : '\u25BC'}
                    </span>
                  </button>
                  {expanded[`theme-${ti}`] && (
                    <div className="mt-1.5 ml-1 space-y-1 border-l-2 border-gray-100 pl-3">
                      {theme.items.map((item, qi) => (
                        <p key={qi} className="text-[11px] text-gray-600 leading-relaxed">{truncate(item, 150)}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {themes.length > 4 && (
              <ExpandButton expanded={!!expanded.themes} onToggle={() => toggle('themes')}
                hiddenCount={themes.length - 4} label="themes" />
            )}
          </Section>
        )}

        {/* ── Documents ────────────────────────────────────────────── */}
        {allDocs.length > 0 && (
          <Section title={names?.documentSection ?? 'Required Documents'} count={allDocs.length}>
            <div className="space-y-1">
              {sortedDocs.slice(0, expanded.docs ? EXPANDED_LIMIT : INITIAL_ITEMS).map((doc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs py-0.5">
                  <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${doc.gateBlocking ? 'bg-red-400' : 'bg-gray-300'}`} />
                  <span className="text-gray-800 leading-relaxed">
                    {truncate(doc.name, 80)}
                    {doc.gateBlocking && <span className="text-[9px] text-red-600 ml-1 font-medium">Gate-blocking</span>}
                  </span>
                </div>
              ))}
            </div>
            <ExpandButton expanded={!!expanded.docs} onToggle={() => toggle('docs')}
              hiddenCount={allDocs.length - INITIAL_ITEMS} label="documents" />
          </Section>
        )}

        {/* ── Sources ──────────────────────────────────────────────── */}
        {data.citations.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              Based on {data.sourceCoverage.guidelineCount} source{data.sourceCoverage.guidelineCount !== 1 ? 's' : ''}
              <span className="ml-1">
                ({data.citations.slice(0, 2).map(c => c.title).join(', ')}{data.citations.length > 2 ? `, +${data.citations.length - 2}` : ''})
              </span>
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
