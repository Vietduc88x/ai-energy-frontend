'use client';

import { ReportHeader } from './ReportHeader';
import { ReportSection } from './ReportSection';
import { ReportCitationList } from './ReportCitationList';
import type { ReportMetadata } from '@/lib/api-client';

export interface PolicyReportData {
  type: 'policy_report';
  title: string;
  subtitle?: string | null;
  generatedAt: string;
  jurisdiction: string;
  technology?: string | null;
  lastChecked: string;
  confidence: 'high' | 'medium' | 'low';
  currentStatus: { summary: string; statusLabels: string[] };
  whatChanged: Array<{ title: string; detail: string; effectiveDate?: string | null }>;
  howItWorksNow: Array<{ pathway: string; description: string; appliesTo?: string[] | null }>;
  keyDates: Array<{ label: string; date: string; significance: string }>;
  whoIsAffected: Array<{ actor: string; impact: string }>;
  practicalImplications: string[];
  whatToCheckNext: string[];
  timelineEvents: Array<{ date: string; label: string; significance: string; severity?: string | null }>;
  citations: Array<{ source: string; title: string; url?: string | null; date?: string | null }>;
  caveat?: string | null;
}

const SEVERITY_DOT = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-gray-400' };

export function PolicyReportView({ report, metadata }: { report: PolicyReportData; metadata?: ReportMetadata | null }) {
  return (
    <div className="report-container max-w-3xl mx-auto px-8 py-10 bg-white print:px-0 print:py-0 print:max-w-none">
      <ReportHeader
        title={report.title}
        subtitle={report.subtitle}
        generatedAt={report.generatedAt}
        confidence={report.confidence}
        sourceCount={metadata?.sourceCount}
        lastChecked={metadata?.lastChecked ?? report.lastChecked}
        onPrint={() => window.print()}
      />

      <ReportSection title="Current Status">
        <p className="text-sm text-gray-700 leading-relaxed">{report.currentStatus.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {report.currentStatus.statusLabels.map((label) => (
            <span key={label} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {label}
            </span>
          ))}
        </div>
      </ReportSection>

      {report.whatChanged.length > 0 && (
        <ReportSection title="What Changed">
          <div className="space-y-2">
            {report.whatChanged.map((change, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{change.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {change.detail}
                    {change.effectiveDate && <span className="text-blue-600 ml-1">({change.effectiveDate})</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.howItWorksNow.length > 0 && (
        <ReportSection title="How It Works Now">
          <div className="space-y-3">
            {report.howItWorksNow.map((pathway, i) => (
              <div key={i} className="border border-gray-200 rounded p-3">
                <p className="text-sm font-medium text-gray-900">{pathway.pathway}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{pathway.description}</p>
                {pathway.appliesTo && pathway.appliesTo.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {pathway.appliesTo.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">
                        {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Timeline */}
      {report.timelineEvents.length > 0 && (
        <ReportSection title="Policy Timeline">
          <div className="relative ml-2">
            <div className="absolute left-[68px] top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-3">
              {report.timelineEvents.map((event, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-xs font-mono text-gray-500 w-[62px] flex-shrink-0 text-right pt-0.5">{event.date}</span>
                  <div className={`flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${event.severity ? SEVERITY_DOT[event.severity as keyof typeof SEVERITY_DOT] || 'bg-blue-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">{event.label}</p>
                    <p className="text-[11px] text-gray-500">{event.significance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>
      )}

      {report.keyDates.length > 0 && (
        <ReportSection title="Key Dates">
          <table className="w-full text-xs border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold w-24">Date</th>
                <th className="text-left px-3 py-2 font-semibold">Event</th>
                <th className="text-left px-3 py-2 font-semibold">Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.keyDates.map((kd, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 font-mono text-blue-600">{kd.date}</td>
                  <td className="px-3 py-2 text-gray-800">{kd.label}</td>
                  <td className="px-3 py-2 text-gray-500">{kd.significance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>
      )}

      {report.whoIsAffected.length > 0 && (
        <ReportSection title="Who Is Affected">
          <div className="space-y-1.5">
            {report.whoIsAffected.map((item, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium text-gray-900">{item.actor}:</span>{' '}
                <span className="text-gray-600">{item.impact}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.practicalImplications.length > 0 && (
        <ReportSection title="Practical Implications">
          <ul className="space-y-1">
            {report.practicalImplications.map((impl, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-amber-500 flex-shrink-0 mt-0.5">&#9679;</span>
                {impl}
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {report.whatToCheckNext.length > 0 && (
        <ReportSection title="What to Check Next">
          <ul className="space-y-1">
            {report.whatToCheckNext.map((check, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">&#10003;</span>
                {check}
              </li>
            ))}
          </ul>
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
