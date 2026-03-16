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
  // Auto-expand first 2 themes
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0, 1]));

  if (spec.groups.length === 0) return null;

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalQuestions = spec.groups.reduce((s, g) => s + g.questions.length, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <FamilyBadge family="checklist" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {totalQuestions} review items
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{spec.title}</h3>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      {/* ── Review Themes ── */}
      <div className="divide-y divide-gray-100">
        {spec.groups.map((group, gi) => {
          const isExpanded = expandedSections.has(gi);
          return (
            <div key={gi}>
              <button
                onClick={() => toggleSection(gi)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-800">
                  {group.section}
                  <span className="ml-1.5 font-normal text-gray-400">({group.questions.length})</span>
                </span>
                <span className="text-gray-400 text-[10px] flex-shrink-0">
                  {isExpanded ? '\u25B2' : '\u25BC'}
                </span>
              </button>
              {isExpanded && (
                <div className="px-5 pb-3.5 space-y-2">
                  {group.questions.map((q, qi) => (
                    <div key={qi} className="flex items-start gap-2.5 text-xs">
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <div className="flex-1">
                        <span className="text-gray-700 leading-relaxed">{q.question}</span>
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
