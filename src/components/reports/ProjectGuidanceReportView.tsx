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
  sectionNames?: {
    criticalNow: string;
    evidenceRequired: string;
    workstreamReview: string;
    riskSection: string;
    documentSection: string;
    epcSection: string;
  };
  stageGuidance: string[];
  checklist: Array<{
    section: string;
    items: Array<{ label: string; severity?: string | null }>;
  }>;
  sectionJudgments?: Array<{
    section: string;
    judgment: string;
    mainConcern: string | null;
    criticalDependency: string | null;
  }>;
  documentRequestMatrix: Array<{
    category: string;
    document: string;
    whyItMatters?: string | null;
    priority?: string | null;
    providedBy?: string | null;
    consequenceIfMissing?: string | null;
    gateBlocking?: boolean;
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
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function ProjectGuidanceReportView({ report, metadata }: { report: ProjectGuidanceReportData; metadata?: ReportMetadata | null }) {
  const exec = report.executiveSummary;
  const names = report.sectionNames;

  // Separate critical vs other risks
  const criticalRisks = report.riskStarter.filter(r => r.severity === 'critical' || r.severity === 'high');
  const otherRisks = report.riskStarter.filter(r => r.severity !== 'critical' && r.severity !== 'high');

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

      {/* Project context */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
          {report.projectContext.projectType.replace(/_/g, ' ')}
        </span>
        {report.projectContext.technology.map((t) => (
          <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
            {t.replace(/_/g, ' ')}
          </span>
        ))}
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
          {report.projectContext.stage.replace(/_/g, ' ')}
        </span>
        {report.projectContext.jurisdiction && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
            {report.projectContext.jurisdiction}
          </span>
        )}
      </div>

      {/* ── Executive Summary ─────────────────────────────────────── */}
      <ReportSection title="Executive Summary">
        <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
      </ReportSection>

      {/* ── Critical Now ──────────────────────────────────────────── */}
      {exec && (exec.criticalItems.length > 0 || exec.topBlocker || exec.topRisk) && (
        <ReportSection title={names?.criticalNow ?? 'Critical Now'}>
          {exec.criticalItems.length > 0 && (
            <ul className="space-y-2 mb-4">
              {exec.criticalItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                  <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {(exec.topBlocker || exec.topEvidenceNeed || exec.topRisk) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {exec.topBlocker && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-1">Blocker</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{exec.topBlocker}</p>
                </div>
              )}
              {exec.topEvidenceNeed && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Evidence Needed</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{exec.topEvidenceNeed}</p>
                </div>
              )}
              {exec.topRisk && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide mb-1">Top Risk</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{exec.topRisk}</p>
                </div>
              )}
            </div>
          )}
        </ReportSection>
      )}

      {/* ── Stage Guidance ────────────────────────────────────────── */}
      {report.stageGuidance.length > 0 && (
        <ReportSection title="Stage Guidance">
          <ul className="space-y-2">
            {report.stageGuidance.map((item, i) => (
              <li key={i} className="text-xs text-gray-700 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {/* ── Checklist ─────────────────────────────────────────────── */}
      {report.checklist.length > 0 && (
        <ReportSection title={names?.evidenceRequired ?? 'Due Diligence Checklist'}>
          <div className="space-y-5">
            {report.checklist.map((section) => {
              const sj = report.sectionJudgments?.find(j => j.section === section.section);
              return (
                <div key={section.section}>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">{section.section}</h4>
                  {sj && (
                    <div className="bg-gray-50 rounded px-3 py-1.5 mb-2">
                      <p className="text-[11px] text-gray-600 leading-relaxed">{sj.judgment}</p>
                      {sj.mainConcern && (
                        <p className="text-[10px] text-red-600 mt-0.5">Priority: {sj.mainConcern}</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <div key={j} className={`flex items-start gap-2 text-xs leading-relaxed ${item.severity === 'critical' ? 'text-gray-900' : 'text-gray-600'}`}>
                        <span className={`flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${item.severity === 'critical' ? 'bg-red-400' : 'bg-gray-300'}`} />
                        <span className="flex-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>
      )}

      {/* ── Document Request ──────────────────────────────────────── */}
      {report.documentRequestMatrix.length > 0 && (
        <ReportSection title={names?.documentSection ?? 'Required Documents'}>
          <div className="space-y-3">
            {report.documentRequestMatrix.map((row, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{row.document}</span>
                  {row.gateBlocking && (
                    <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Gate-blocking</span>
                  )}
                </div>
                {row.whyItMatters && row.whyItMatters !== '\u2014' && (
                  <p className="text-[11px] text-gray-500 mt-0.5">{row.whyItMatters}</p>
                )}
                {(row.providedBy || row.consequenceIfMissing) && (
                  <div className="flex gap-4 mt-0.5 text-[10px]">
                    {row.providedBy && <span className="text-gray-400">Source: {row.providedBy}</span>}
                    {row.consequenceIfMissing && <span className="text-amber-600">If missing: {row.consequenceIfMissing}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* ── EPC Review Prompts ────────────────────────────────────── */}
      {report.epcReviewQuestions.length > 0 && (
        <ReportSection title={names?.epcSection ?? 'Review Prompts'}>
          <div className="space-y-4">
            {report.epcReviewQuestions.map((section) => (
              <div key={section.section}>
                <h4 className="text-xs font-semibold text-gray-800 mb-1.5">{section.section}</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  {section.questions.map((q, j) => (
                    <li key={j} className="text-xs text-gray-700 leading-relaxed pl-1">{q}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* ── Risk Register ─────────────────────────────────────────── */}
      {report.riskStarter.length > 0 && (
        <ReportSection title={names?.riskSection ?? 'Risk Register'}>
          <div className="space-y-3">
            {criticalRisks.map((r, i) => (
              <div key={`c-${i}`} className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs font-medium text-gray-900 mb-1">{r.risk}</p>
                {r.cause && <p className="text-[11px] text-gray-600 leading-relaxed">{r.cause}</p>}
                {r.mitigation && <p className="text-[11px] text-teal-700 leading-relaxed mt-1">{r.mitigation}</p>}
              </div>
            ))}
            {otherRisks.map((r, i) => (
              <div key={`o-${i}`} className="border-l-2 border-gray-200 pl-3 py-1">
                <p className="text-xs text-gray-700">{r.risk}</p>
                {r.mitigation && <p className="text-[11px] text-gray-500 mt-0.5">{r.mitigation}</p>}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.caveat && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 mt-6 break-inside-avoid">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Note:</span> {report.caveat}
          </p>
        </div>
      )}

      <ReportCitationList citations={report.citations} />

      <footer className="mt-8 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 print:mt-4">
        Generated by AI Energy Analyst &middot; {new Date(report.generatedAt).toLocaleDateString()}
      </footer>
    </div>
  );
}
