'use client';

import {
  FAMILY_LABELS,
  FAMILY_COLORS,
  CONFIDENCE_COLORS,
  type DeliverableFamily,
  type ConfidenceLevel,
} from '@/lib/deliverable-taxonomy';

/**
 * Badge showing the deliverable family (Figure, Table, Checklist, etc.).
 * Used in visual deliverable headers and report cards.
 */
export function FamilyBadge({ family }: { family: DeliverableFamily }) {
  const colors = FAMILY_COLORS[family];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {FAMILY_LABELS[family]}
    </span>
  );
}

/**
 * Badge showing confidence level (High, Medium, Low).
 * Used in report headers and policy briefs.
 */
export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const colors = CONFIDENCE_COLORS[level];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} confidence
    </span>
  );
}

/**
 * Compact metadata line for deliverables.
 * Shows family badge + optional confidence + optional date.
 */
export function DeliverableMetaLine({
  family,
  confidence,
  generatedAt,
}: {
  family: DeliverableFamily;
  confidence?: ConfidenceLevel | null;
  generatedAt?: string | null;
}) {
  const dateStr = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="flex items-center gap-2 text-[10px] text-gray-400">
      <FamilyBadge family={family} />
      {confidence && <ConfidenceBadge level={confidence} />}
      {dateStr && <span>{dateStr}</span>}
    </div>
  );
}
