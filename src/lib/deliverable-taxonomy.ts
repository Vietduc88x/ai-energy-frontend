/**
 * Deliverable Taxonomy — frontend-side classification for UI labels, badges,
 * and export-format awareness.
 *
 * This mirrors the backend taxonomy in src/lib/deliverable-taxonomy.ts.
 * Keep in sync when adding new families or kinds.
 */

// ─── Deliverable Families ───────────────────────────────────────────────────

export const DELIVERABLE_FAMILIES = [
  'figure',
  'table',
  'checklist',
  'diagram',
  'timeline',
  'matrix',
  'report',
  'pack',
] as const;
export type DeliverableFamily = (typeof DELIVERABLE_FAMILIES)[number];

// ─── Family Labels & Colors ─────────────────────────────────────────────────

export const FAMILY_LABELS: Record<DeliverableFamily, string> = {
  figure: 'Figure',
  table: 'Table',
  checklist: 'Checklist',
  diagram: 'Diagram',
  timeline: 'Timeline',
  matrix: 'Matrix',
  report: 'Report',
  pack: 'Pack',
};

export const FAMILY_COLORS: Record<DeliverableFamily, { bg: string; text: string; border: string }> = {
  figure:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  table:     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
  checklist: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  diagram:   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  timeline:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  matrix:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  report:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
  pack:      { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
};

// ─── Visual Type → Family Mapping ───────────────────────────────────────────

export type VisualType =
  | 'benchmark_chart'
  | 'policy_timeline'
  | 'checklist_table'
  | 'document_request_matrix'
  | 'risk_matrix'
  | 'project_timeline';

const VISUAL_TO_FAMILY: Record<VisualType, DeliverableFamily> = {
  benchmark_chart: 'figure',
  policy_timeline: 'timeline',
  checklist_table: 'checklist',
  document_request_matrix: 'matrix',
  risk_matrix: 'matrix',
  project_timeline: 'timeline',
};

export function familyForVisualType(visualType: VisualType): DeliverableFamily {
  return VISUAL_TO_FAMILY[visualType];
}

// ─── Export Format Mapping ──────────────────────────────────────────────────

export type ExportFormat = 'png' | 'pdf' | 'xlsx' | 'docx';

export const FAMILY_EXPORT_FORMATS: Record<DeliverableFamily, ExportFormat[]> = {
  figure:    ['png', 'pdf'],
  table:     ['xlsx', 'pdf', 'docx'],
  checklist: ['xlsx', 'pdf', 'docx'],
  diagram:   ['png', 'pdf'],
  timeline:  ['png', 'pdf'],
  matrix:    ['xlsx', 'pdf', 'docx'],
  report:    ['pdf', 'docx'],
  pack:      ['pdf', 'docx', 'xlsx'],
};

export function exportFormatsForFamily(family: DeliverableFamily): ExportFormat[] {
  return FAMILY_EXPORT_FORMATS[family];
}

// ─── Confidence Badge ───────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, { bg: string; text: string }> = {
  high:   { bg: 'bg-green-100',  text: 'text-green-700' },
  medium: { bg: 'bg-amber-100',  text: 'text-amber-700' },
  low:    { bg: 'bg-red-100',    text: 'text-red-700' },
};
