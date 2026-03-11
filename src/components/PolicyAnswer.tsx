'use client';

import type { PolicyAnswerEnvelope } from '@/lib/api-client';

const CONFIDENCE_STYLES = {
  high: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-red-100 text-red-800 border-red-200',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</h3>
  );
}

export function PolicyAnswer({ data }: { data: PolicyAnswerEnvelope }) {
  return (
    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Policy Briefing
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLES[data.confidence]}`}>
                {data.confidence} confidence
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1.5">
              {data.jurisdiction}{data.technology ? ` — ${data.technology}` : ''}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Last checked</p>
            <p className="text-xs font-medium text-gray-600">{data.lastChecked}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Current Status */}
        <div>
          <SectionTitle>Current Status</SectionTitle>
          <p className="text-sm text-gray-800 leading-relaxed">{data.currentStatus.summary}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {data.currentStatus.statusLabels.map((label) => (
              <span key={label} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* What Changed */}
        {data.whatChanged.length > 0 && (
          <div>
            <SectionTitle>What Changed</SectionTitle>
            <div className="space-y-2">
              {data.whatChanged.map((change, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{change.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {change.detail}
                      {change.effectiveDate && (
                        <span className="text-blue-600 ml-1">({change.effectiveDate})</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works Now */}
        {data.howItWorksNow.length > 0 && (
          <div>
            <SectionTitle>How It Works Now</SectionTitle>
            <div className="space-y-2">
              {data.howItWorksNow.map((pathway, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-2.5">
                  <p className="text-sm font-medium text-gray-900">{pathway.pathway}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{pathway.description}</p>
                  {pathway.appliesTo && pathway.appliesTo.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pathway.appliesTo.map(tech => (
                        <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">
                          {tech.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Dates */}
        {data.keyDates.length > 0 && (
          <div>
            <SectionTitle>Key Dates</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.keyDates.slice(0, 6).map((kd, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono font-medium text-blue-600 flex-shrink-0 w-20">{kd.date}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800">{kd.label}</span>
                    <span className="text-gray-400 ml-1">({kd.significance})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Who Is Affected */}
        {data.whoIsAffected.length > 0 && (
          <div>
            <SectionTitle>Who Is Affected</SectionTitle>
            <div className="space-y-1.5">
              {data.whoIsAffected.map((item, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium text-gray-900">{item.actor}:</span>{' '}
                  <span className="text-gray-600">{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Implications */}
        {data.practicalImplications.length > 0 && (
          <div>
            <SectionTitle>Practical Implications</SectionTitle>
            <ul className="space-y-1">
              {data.practicalImplications.map((impl, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">&#9679;</span>
                  {impl}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What to Check Next */}
        {data.whatToCheckNext.length > 0 && (
          <div>
            <SectionTitle>What to Check Next</SectionTitle>
            <ul className="space-y-1">
              {data.whatToCheckNext.map((check, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700">
                  <span className="text-blue-500 flex-shrink-0 mt-0.5">&#10003;</span>
                  {check}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {data.sources.length > 0 && (
          <div>
            <SectionTitle>Sources</SectionTitle>
            <div className="space-y-1">
              {data.sources.map((src, i) => (
                <div key={i} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-gray-400 font-mono">[{i + 1}]</span>
                  <span>
                    <span className="font-medium text-gray-700">{src.source}</span>
                    {' — '}
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {src.title}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                    {src.date && <span className="text-gray-400 ml-1">({src.date})</span>}
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
