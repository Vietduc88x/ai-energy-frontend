/**
 * Shared display formatting — one formatting layer, many surfaces.
 *
 * Consolidates technology labels, context identity, severity display,
 * and enum formatting into one reusable module.
 */

// ─── Technology Label Formatting ────────────────────────────────────────────

const TECH_OVERRIDES: Array<[RegExp, string]> = [
  [/\bPv\b/g, 'PV'],
  [/\bBess\b/g, 'BESS'],
  [/\bCsp\b/g, 'CSP'],
  [/\bHv\b/g, 'HV'],
  [/\bMv\b/g, 'MV'],
  [/\bLv\b/g, 'LV'],
];

/** Format a single technology slug into professional display label */
export function formatTechLabel(tech: string): string {
  let result = tech.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  for (const [pattern, replacement] of TECH_OVERRIDES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/** Format multiple technologies into a hybrid-aware label: "Solar PV + BESS" */
export function formatTechList(technologies: string[]): string {
  if (technologies.length === 0) return '';
  return technologies.map(formatTechLabel).join(' + ');
}

// ─── Context Label Repair ───────────────────────────────────────────────────

const LABEL_FIXES: Array<[RegExp, string]> = [
  [/\bsolar pv\b/gi, 'Solar PV'],
  [/\bbess\b/gi, 'BESS'],
  [/\bcsp\b/gi, 'CSP'],
  [/\bonshore wind\b/gi, 'Onshore Wind'],
  [/\boffshore wind\b/gi, 'Offshore Wind'],
  [/\bsolar_pv\b/gi, 'Solar PV'],
  [/\bonshore_wind\b/gi, 'Onshore Wind'],
  [/\boffshore_wind\b/gi, 'Offshore Wind'],
];

/** Repair stale persisted context labels at render time */
export function formatContextLabel(label: string): string {
  let result = label;
  for (const [pattern, replacement] of LABEL_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ─── Visible Context Identity ───────────────────────────────────────────────

export interface VisibleContextIdentity {
  title: string;
  technologyLabel: string;
  stageLabel: string;
  workflowLabel: string;
}

/**
 * Derive the canonical visible identity for a project context.
 * Uses structured fields in priority order, falls back to stored label.
 */
export function buildVisibleContextIdentity(context: {
  label?: string | null;
  workflowType?: string | null;
  technology?: string | null;
  stage?: string | null;
  jurisdiction?: string | null;
}, packTechnologies?: string[]): VisibleContextIdentity {
  // Derive technology label from structured data (priority) or context field (fallback)
  let technologyLabel: string;
  if (packTechnologies && packTechnologies.length > 0) {
    technologyLabel = formatTechList(packTechnologies);
  } else if (context.technology) {
    // Handle comma-separated or single technology strings
    const techs = context.technology.includes(',')
      ? context.technology.split(',').map(t => formatTechLabel(t.trim()))
      : [formatTechLabel(context.technology)];
    technologyLabel = techs.join(' + ');
  } else {
    technologyLabel = '';
  }

  const workflowLabel = context.workflowType
    ? formatEnumLabel(context.workflowType)
    : '';

  const stageLabel = context.stage
    ? formatEnumLabel(context.stage)
    : '';

  // Build title from best available data
  const titleParts = [workflowLabel, technologyLabel].filter(Boolean);
  if (context.jurisdiction) titleParts.push(context.jurisdiction);
  const title = titleParts.join(' \u2014 ') || formatContextLabel(context.label ?? '');

  return { title, technologyLabel, stageLabel, workflowLabel };
}

// ─── Enum / Stage Formatting ────────────────────────────────────────────────

/** Format any underscore-separated enum value for display */
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Severity Display ───────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  high:     { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  medium:   { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  low:      { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' },
};
