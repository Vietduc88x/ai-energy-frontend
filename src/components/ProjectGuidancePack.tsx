'use client';

import type { ProjectGuidancePack } from '@/lib/api-client';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</h3>
  );
}

export function ProjectGuidanceCard({ data }: { data: ProjectGuidancePack }) {
  const totalChecklist = data.checklist.reduce((s, c) => s + c.items.length, 0);
  const totalDocs = data.documentRequestList.reduce((s, c) => s + c.documents.length, 0);
  const totalQuestions = data.epcReviewQuestions.reduce((s, c) => s + c.questions.length, 0);

  return (
    <div className="bg-white border border-teal-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                Project Guidance Pack
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {data.stage.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1.5">
              {data.technology.length > 0
                ? data.technology.map(t => t.replace(/_/g, ' ')).join(', ')
                : data.projectType.replace(/_/g, ' ')}
              {data.jurisdiction ? ` — ${data.jurisdiction}` : ''}
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
        {/* Summary */}
        <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>

        {/* Stage Guidance */}
        {data.stageGuidance.length > 0 && (
          <div>
            <SectionTitle>Stage Guidance</SectionTitle>
            <ul className="space-y-1">
              {data.stageGuidance.map((g, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700">
                  <span className="text-teal-500 flex-shrink-0 mt-0.5">&#9679;</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checklist */}
        {data.checklist.length > 0 && (
          <div>
            <SectionTitle>Checklist ({totalChecklist} items)</SectionTitle>
            <div className="space-y-3">
              {data.checklist.map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{section.section}</p>
                  <ul className="space-y-0.5 ml-3">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex gap-2 text-xs text-gray-600">
                        <span className="text-gray-300 flex-shrink-0">&#9744;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Request List */}
        {data.documentRequestList.length > 0 && (
          <div>
            <SectionTitle>Document Request List ({totalDocs})</SectionTitle>
            <div className="space-y-3">
              {data.documentRequestList.map((cat, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{cat.category}</p>
                  <div className="space-y-1 ml-3">
                    {cat.documents.map((doc, j) => (
                      <div key={j} className="text-xs">
                        <span className="text-gray-700">{doc.name}</span>
                        {doc.whyItMatters && (
                          <span className="text-gray-400 ml-1">— {doc.whyItMatters}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EPC Review Questions */}
        {data.epcReviewQuestions.length > 0 && (
          <div>
            <SectionTitle>EPC Review Questions ({totalQuestions})</SectionTitle>
            <div className="space-y-3">
              {data.epcReviewQuestions.map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-gray-800 mb-1">{section.section}</p>
                  <ul className="space-y-0.5 ml-3">
                    {section.questions.map((q, j) => (
                      <li key={j} className="flex gap-2 text-xs text-gray-600">
                        <span className="text-teal-400 flex-shrink-0">?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Starter */}
        {data.riskStarter.length > 0 && (
          <div>
            <SectionTitle>Risk Register Starter ({data.riskStarter.length})</SectionTitle>
            <div className="space-y-2">
              {data.riskStarter.map((risk, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-gray-900">{risk.risk}</p>
                  {risk.cause && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      <span className="font-medium text-gray-600">Cause:</span> {risk.cause}
                    </p>
                  )}
                  {risk.impact && (
                    <p className="text-[11px] text-gray-500">
                      <span className="font-medium text-gray-600">Impact:</span> {risk.impact}
                    </p>
                  )}
                  {risk.mitigation && (
                    <p className="text-[11px] text-teal-700">
                      <span className="font-medium">Mitigation:</span> {risk.mitigation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {data.citations.length > 0 && (
          <div>
            <SectionTitle>Sources ({data.sourceCoverage.guidelineCount} guidelines)</SectionTitle>
            <div className="space-y-1">
              {data.citations.map((cit, i) => (
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
            </div>
          </div>
        )}

        {/* Caveat */}
        {data.caveat && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-600">Note:</span> {data.caveat}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
