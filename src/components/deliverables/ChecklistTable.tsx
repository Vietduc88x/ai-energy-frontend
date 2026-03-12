'use client';

import { useState } from 'react';
import { FamilyBadge, DeliverableMetaFooter, type DeliverableMetadataProps } from './DeliverableBadge';

export interface ChecklistTableSpec {
  type: 'checklist_table';
  title: string;
  subtitle?: string | null;
  groups: Array<{
    section: string;
    items: Array<{
      label: string;
      detail?: string | null;
      severity?: 'critical' | 'high' | 'medium' | 'low' | 'info' | null;
      source?: string | null;
    }>;
  }>;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  info: 'bg-blue-100 text-blue-600 border-blue-200',
};

export function ChecklistTable({ spec, metadata }: { spec: ChecklistTableSpec; metadata?: DeliverableMetadataProps | null }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (spec.groups.length === 0) return null;

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
        {spec.groups.map((group, gi) => (
          <div key={gi} className="px-4 py-2.5">
            <p className="text-xs font-semibold text-gray-800 mb-1.5">{group.section}</p>
            <div className="space-y-1">
              {group.items.map((item, ii) => {
                const itemKey = `${gi}-${ii}`;
                const isExpanded = expandedItems.has(itemKey);
                const hasDetail = !!item.detail;

                return (
                  <div key={ii}>
                    <div
                      className={`flex items-start gap-2 text-xs ${hasDetail ? 'cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded' : ''}`}
                      onClick={hasDetail ? () => toggleItem(itemKey) : undefined}
                    >
                      <span className="text-gray-300 mt-0.5 flex-shrink-0">&#9744;</span>
                      <span className="text-gray-700 flex-1">{item.label}</span>
                      {hasDetail && (
                        <span className="text-gray-300 mt-0.5 flex-shrink-0 text-[10px]">
                          {isExpanded ? '▾' : '▸'}
                        </span>
                      )}
                      {item.severity && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.info}`}>
                          {item.severity}
                        </span>
                      )}
                    </div>
                    {isExpanded && item.detail && (
                      <div className="ml-6 mt-1 mb-1 text-[11px] text-gray-500 leading-relaxed border-l-2 border-gray-100 pl-2">
                        {item.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <DeliverableMetaFooter meta={metadata} />
    </div>
  );
}
