'use client';

import { useState } from 'react';
import { FamilyBadge, DeliverableMetaFooter, type DeliverableMetadataProps } from './DeliverableBadge';

export interface EpcQuestionsSpec {
  type: 'epc_questions';
  title: string;
  subtitle?: string | null;
  groups: Array<{
    section: string;
    questions: Array<{
      question: string;
      rationale?: string | null;
    }>;
  }>;
}

export function EpcQuestions({ spec, metadata }: { spec: EpcQuestionsSpec; metadata?: DeliverableMetadataProps | null }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));

  if (spec.groups.length === 0) return null;

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <FamilyBadge family="checklist" />
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      <div className="divide-y divide-gray-100">
        {spec.groups.map((group, gi) => {
          const isExpanded = expandedSections.has(gi);
          return (
            <div key={gi}>
              <button
                onClick={() => toggleSection(gi)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-gray-800">
                  {group.section}
                  <span className="ml-1.5 font-normal text-gray-400">({group.questions.length})</span>
                </span>
                <span className="text-gray-300 text-[10px] flex-shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5">
                  {group.questions.map((q, qi) => (
                    <div key={qi} className="flex items-start gap-2 text-xs">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0 font-medium">{qi + 1}.</span>
                      <div className="flex-1">
                        <span className="text-gray-700">{q.question}</span>
                        {q.rationale && (
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{q.rationale}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DeliverableMetaFooter meta={metadata} />
    </div>
  );
}
