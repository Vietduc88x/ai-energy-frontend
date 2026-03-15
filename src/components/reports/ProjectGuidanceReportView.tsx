'use client';

import { ReportHeader } from './ReportHeader';
import { ReportSection } from './ReportSection';
import { ReportCitationList } from './ReportCitationList';
import type { ReportMetadata } from '@/lib/api-client';

export interface ProjectGuidanceReportData {
  type: 'project_guidance_report';
  title: string;
  subtitle?: string | null;
  generatedAt: string;
  projectContext: {
    projectType: string;
    technology: string[];
    stage: string;
    jurisdiction?: string | null;
  };
  summary: string;
  executiveSummary?: {
    criticalItems: string[];
    topBlocker: string | null;
    topEvidenceNeed: string | null;
    topRisk: string | null;
  };
  stageGuidance: string[];
  checklist: Array<{
    section: string;
    items: Array<{ label: string; severity?: string | null }>;
  }>;
  documentRequestMatrix: Array<{
    category: string;
    document: string;
    whyItMatters?: string | null;
    priority?: string | null;
  }>;
  epcReviewQuestions: Array<{ section: string; questions: string[] }>;
  riskStarter: Array<{
    risk: string;
    likelihood: string;
    impact: string;
    cause?: string | null;
    mitigation?: string | null;
    severity?: 'critical' | 'high' | 'medium' | 'low' | null;
  }>;
  citations: Array<{ source: string; title: string; url?: string | null }>;
  caveat?: string | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

const RISK_COLORS: Record<string, Record<string, string>> = {
  high: { high: 'bg-red-100', medium: 'bg-red-50', low: 'bg-orange-50' },
  medium: { high: 'bg-orange-100', medium: 'bg-amber-50', low: 'bg-yellow-50' },
  low: { high: 'bg-yellow-50', medium: 'bg-green-50', low: 'bg-green-50' },
};

function riskBg(likelihood: string, impact: string): string {
  return RISK_COLORS[impact]?.[likelihood] || 'bg-gray-50';
}

export function ProjectGuidanceReportView({ report, metadata }: { report: ProjectGuidanceReportData; metadata?: ReportMetadata | null }) {
  // Group document request rows by category
  const docsByCategory = new Map<string, typeof report.documentRequestMatrix>();
  for (const row of report.documentRequestMatrix) {
    if (!docsByCategory.has(row.category)) docsByCategory.set(row.category, []);
    docsByCategory.get(row.category)!.push(row);
  }

  const exec = report.executiveSummary;

  return (
    <div className="report-container max-w-3xl mx-auto px-8 py-10 bg-white print:px-0 print:py-0 print:max-w-none">
      <ReportHeader
        title={report.title}
        subtitle={report.subtitle}
        generatedAt={report.generatedAt}
        sourceCount={metadata?.sourceCount}
        lastChecked={metadata?.lastChecked}
        onPrint={() => window.print()}
      />

      {/* Project context badge row */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
          {report.projectContext.projectType.replace(/_/g, ' ')}
        </span>
        {report.projectContext.technology.map((t) => (
          <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
            {t.replace(/_/g, ' ')}
          </span>
        ))}
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {report.projectContext.stage.replace(/_/g, ' ')}
        </span>
        {report.projectContext.jurisdiction && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {report.projectContext.jurisdiction}
          </span>
        )}
      </div>

      {/* ── Executive Summary ─────────────────────────────────────── */}
      <ReportSection title="Executive Summary">
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{report.summary}</p>
        {exec && (exec.criticalItems.length > 0 || exec.topBlocker || exec.topRisk) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2">Critical Attention Items</h4>
            {exec.criticalItems.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {exec.criticalItems.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-red-800">
                    <span className="text-red-500 flex-shrink-0 font-bold mt-0.5">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              {exec.topBlocker && (
                <div className="bg-white/60 rounded p-2">
                  <span className="font-semibold text-red-700 block mb-0.5">Top Blocker</span>
                  <span className="text-red-800">{exec.topBlocker}</span>
                </div>
              )}
              {exec.topEvidenceNeed && (
                <div className="bg-white/60 rounded p-2">
                  <span className="font-semibold text-amber-700 block mb-0.5">Evidence Need</span>
                  <span className="text-amber-800">{exec.topEvidenceNeed}</span>
                </div>
              )}
              {exec.topRisk && (
                <div className="bg-white/60 rounded p-2">
                  <span className="font-semibold text-orange-700 block mb-0.5">Top Risk</span>
                  <span className="text-orange-800">{exec.topRisk}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </ReportSection>

      {report.stageGuidance.length > 0 && (
        <ReportSection title="Stage Guidance">
          <ul className="space-y-1.5">
            {report.stageGuidance.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-teal-500 flex-shrink-0 mt-0.5">&#9679;</span>
                {item}
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {/* Checklist */}
      {report.checklist.length > 0 && (
        <ReportSection title="Due Diligence Checklist">
          <div className="space-y-4">
            {report.checklist.map((section) => (
              <div key={section.section}>
                <h4 className="text-xs font-semibold text-gray-800 mb-1.5">{section.section}</h4>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j} className={`flex items-start gap-2 text-xs ${item.severity === 'critical' ? 'text-red-800 font-medium' : ''}`}>
                      <span className={`flex-shrink-0 mt-0.5 ${item.severity === 'critical' ? 'text-red-300' : 'text-gray-300'}`}>&#9744;</span>
                      <span className="text-gray-700 flex-1">{item.label}</span>
                      {item.severity && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${SEVERITY_STYLES[item.severity] || ''}`}>
                          {item.severity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Document Request Matrix */}
      {report.documentRequestMatrix.length > 0 && (
        <ReportSection title="Document Request List">
          <table className="w-full text-xs border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Category</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Document</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 hidden sm:table-cell">Why It Matters</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-20">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...docsByCategory.entries()].map(([category, rows]) =>
                rows.map((row, i) => (
                  <tr key={`${category}-${i}`}>
                    {i === 0 ? (
                      <td className="px-3 py-2 font-medium text-gray-800 align-top" rowSpan={rows.length}>
                        {category}
                      </td>
                    ) : null}
                    <td className="px-3 py-2 text-gray-700">{row.document}</td>
                    <td className="px-3 py-2 text-gray-500 hidden sm:table-cell">{row.whyItMatters || '\u2014'}</td>
                    <td className="px-3 py-2 text-center">
                      {row.priority && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_STYLES[row.priority] || ''}`}>
                          {row.priority}
                        </span>
                      )}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </ReportSection>
      )}

      {/* EPC Review Questions */}
      {report.epcReviewQuestions.length > 0 && (
        <ReportSection title="EPC Review Questions">
          <div className="space-y-3">
            {report.epcReviewQuestions.map((section) => (
              <div key={section.section}>
                <h4 className="text-xs font-semibold text-gray-800 mb-1">{section.section}</h4>
                <ol className="space-y-0.5 list-decimal list-inside">
                  {section.questions.map((q, j) => (
                    <li key={j} className="text-xs text-gray-700 pl-1">{q}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Risk Register — split by severity */}
      {report.riskStarter.length > 0 && (
        <ReportSection title="Risk Register">
          <div className="space-y-2">
            {report.riskStarter.map((r, i) => (
              <div key={i} className={`rounded-lg p-3 ${r.severity === 'critical' || r.severity === 'high' ? 'border border-red-200 bg-red-50' : riskBg(r.likelihood, r.impact)}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-gray-900">{r.risk}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    {r.severity && (
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${SEVERITY_STYLES[r.severity] || ''}`}>
                        {r.severity}
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                      L:{r.likelihood[0].toUpperCase()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                      I:{r.impact[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                {r.cause && (
                  <p className="text-[11px] text-gray-600 mt-1">
                    <span className="font-medium">Cause:</span> {r.cause}
                  </p>
                )}
                {r.mitigation && (
                  <p className="text-[11px] text-teal-700 mt-0.5">
                    <span className="font-medium">Mitigation:</span> {r.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.caveat && (
        <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 mt-6 break-inside-avoid">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Note:</span> {report.caveat}
          </p>
        </div>
      )}

      <ReportCitationList citations={report.citations} />

      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 print:mt-4">
        Generated by AI Energy Analyst &middot; {new Date(report.generatedAt).toLocaleDateString()}
      </footer>
    </div>
  );
}
