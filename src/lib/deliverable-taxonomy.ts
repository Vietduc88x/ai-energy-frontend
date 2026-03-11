/**
 * Deliverable Taxonomy — frontend-side classification for UI labels, badges,
 * export-format awareness, verbosity, and UI action rules.
 *
 * This mirrors the backend taxonomy in src/lib/deliverable-taxonomy.ts.
 * Keep in sync when adding new families or kinds.
 *
 * ── KEY RULES ──
 *
 * 1. Pack Rule: A Pack MUST contain 2+ deliverables. Single artifact = its own family.
 * 2. Checklist vs Table vs Matrix:
 *    - Checklist: actionable, step-like, review-oriented, completion-oriented
 *    - Table: neutral structured data in rows/columns, not action-oriented
 *    - Matrix: 2-dimensional decision/relationship/mapping structure
 * 3. Taxonomy Drives Behavior: family determines rendering, export, verbosity, and UI actions.
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

// ─── Verbosity Defaults ─────────────────────────────────────────────────────

/**
 * Default output verbosity per family.
 *   short   — compact, data-first, minimal narrative
 *   full    — complete narrative with analysis
 *   bundled — structured multi-section output
 */
export type Verbosity = 'short' | 'full' | 'bundled';

export const FAMILY_VERBOSITY: Record<DeliverableFamily, Verbosity> = {
  figure:    'short',
  table:     'short',
  checklist: 'short',
  diagram:   'short',
  timeline:  'short',
  matrix:    'short',
  report:    'full',
  pack:      'bundled',
};

export function verbosityForFamily(family: DeliverableFamily): Verbosity {
  return FAMILY_VERBOSITY[family];
}

// ─── UI Action Mapping ──────────────────────────────────────────────────────

/**
 * Available UI actions for each deliverable family.
 * Determines which buttons appear when a deliverable is rendered.
 */
export type UIAction = 'export_xlsx' | 'export_png' | 'export_pdf' | 'export_docx' | 'open_report' | 'print';

export const FAMILY_UI_ACTIONS: Record<DeliverableFamily, UIAction[]> = {
  figure:    ['export_png', 'open_report'],
  table:     ['export_xlsx', 'export_pdf'],
  checklist: ['export_xlsx', 'open_report'],
  diagram:   ['export_png', 'export_pdf'],
  timeline:  ['export_png', 'export_pdf'],
  matrix:    ['export_xlsx', 'export_pdf', 'export_docx'],
  report:    ['print', 'export_pdf', 'export_docx'],
  pack:      ['export_pdf', 'export_docx', 'export_xlsx'],
};

export function uiActionsForFamily(family: DeliverableFamily): UIAction[] {
  return FAMILY_UI_ACTIONS[family];
}

// ─── Confidence Badge ───────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, { bg: string; text: string }> = {
  high:   { bg: 'bg-green-100',  text: 'text-green-700' },
  medium: { bg: 'bg-amber-100',  text: 'text-amber-700' },
  low:    { bg: 'bg-red-100',    text: 'text-red-700' },
};
