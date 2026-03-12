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

/** Standardized metadata from backend DeliverableMetadata. */
export interface DeliverableMetadataProps {
  deliverableFamily?: string | null;
  confidence?: ConfidenceLevel | null;
  lastChecked?: string | null;
  sourceCount?: number | null;
  caveat?: string | null;
  generatedAt?: string | null;
}

/**
 * Compact metadata footer for any deliverable visual.
 * Shows source count, confidence, last-checked date, and caveat.
 * Designed to be appended inside deliverable cards without adding clutter.
 */
export function DeliverableMetaFooter({ meta }: { meta?: DeliverableMetadataProps | null }) {
  if (!meta) return null;

  const parts: string[] = [];

  if (meta.sourceCount != null && meta.sourceCount > 0) {
    parts.push(`${meta.sourceCount} source${meta.sourceCount !== 1 ? 's' : ''}`);
  }

  if (meta.lastChecked) {
    const d = new Date(meta.lastChecked);
    parts.push(`Checked ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
  }

  const hasContent = parts.length > 0 || meta.confidence || meta.caveat;
  if (!hasContent) return null;

  return (
    <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
      {meta.confidence && <ConfidenceBadge level={meta.confidence} />}
      {parts.length > 0 && <span>{parts.join(' · ')}</span>}
      {meta.caveat && (
        <span className="text-amber-500 italic">{meta.caveat}</span>
      )}
    </div>
  );
}
