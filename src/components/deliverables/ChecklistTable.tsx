'use client';

import { useState, useMemo } from 'react';
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

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
  info: 'bg-blue-300',
};

/** Sections with no critical/high items start collapsed */
function hasHighPriorityItems(items: ChecklistTableSpec['groups'][number]['items']): boolean {
  return items.some(i => i.severity === 'critical' || i.severity === 'high');
}

export function ChecklistTable({ spec, metadata }: { spec: ChecklistTableSpec; metadata?: DeliverableMetadataProps | null }) {
  const totalItems = useMemo(() => spec.groups.reduce((s, g) => s + g.items.length, 0), [spec]);
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const g of spec.groups) {
      for (const item of g.items) {
        if (item.severity && counts[item.severity] !== undefined) counts[item.severity]++;
      }
    }
    return counts;
  }, [spec]);

  // Sections with critical/high items start expanded; others start collapsed
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(() => {
    const collapsed = new Set<number>();
    spec.groups.forEach((g, i) => {
      if (!hasHighPriorityItems(g.items)) collapsed.add(i);
    });
    return collapsed;
  });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (spec.groups.length === 0) return null;

  const toggleSection = (gi: number) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(gi)) next.delete(gi);
      else next.add(gi);
      return next;
    });
  };

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const hasSeverityData = Object.values(severityCounts).some(c => c > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <FamilyBadge family="checklist" />
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      {/* Priority summary bar */}
      {hasSeverityData && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-3 text-[10px]">
          <span className="text-gray-500 font-medium">{totalItems} items</span>
          <span className="text-gray-300">|</span>
          {severityCounts.critical > 0 && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT.critical}`} />
              <span className="text-red-700 font-semibold">{severityCounts.critical} critical</span>
            </span>
          )}
          {severityCounts.high > 0 && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT.high}`} />
              <span className="text-orange-700">{severityCounts.high} high</span>
            </span>
          )}
          {severityCounts.medium > 0 && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT.medium}`} />
              <span className="text-amber-700">{severityCounts.medium} med</span>
            </span>
          )}
          {(severityCounts.low > 0 || severityCounts.info > 0) && (
            <span className="text-gray-400">{severityCounts.low + severityCounts.info} other</span>
          )}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {spec.groups.map((group, gi) => {
          const isCollapsed = collapsedSections.has(gi);
          const groupCritical = group.items.filter(i => i.severity === 'critical').length;
          const groupHigh = group.items.filter(i => i.severity === 'high').length;

          return (
            <div key={gi}>
              {/* Collapsible section header */}
              <div
                className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => toggleSection(gi)}
              >
                <span className="text-gray-400 text-[10px] flex-shrink-0">{isCollapsed ? '▸' : '▾'}</span>
                <p className="text-xs font-semibold text-gray-800 flex-1">{group.section}</p>
                <span className="text-[10px] text-gray-400">{group.items.length}</span>
                {groupCritical > 0 && (
                  <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-1 rounded">{groupCritical} critical</span>
                )}
                {groupHigh > 0 && (
                  <span className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded">{groupHigh} high</span>
                )}
              </div>

              {/* Section items (collapsible) */}
              {!isCollapsed && (
                <div className="px-4 pb-2.5 space-y-1">
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
                          <span className={`flex-1 ${item.severity === 'critical' ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                            {item.label}
                          </span>
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
              )}
            </div>
          );
        })}
      </div>

      <DeliverableMetaFooter meta={metadata} />
    </div>
  );
}
