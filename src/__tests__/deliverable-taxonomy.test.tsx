/**
 * Tests for Deliverable Taxonomy — frontend types, badges, labels, and mappings.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => cleanup());

// ─── Taxonomy Types ─────────────────────────────────────────────────────────

describe('deliverable taxonomy types', () => {
  it('exports 8 families', async () => {
    const { DELIVERABLE_FAMILIES } = await import('@/lib/deliverable-taxonomy');
    expect(DELIVERABLE_FAMILIES).toHaveLength(8);
  });

  it('contains all expected families', async () => {
    const { DELIVERABLE_FAMILIES } = await import('@/lib/deliverable-taxonomy');
    expect([...DELIVERABLE_FAMILIES]).toEqual(
      expect.arrayContaining([
        'figure', 'table', 'checklist', 'diagram',
        'timeline', 'matrix', 'report', 'pack',
      ]),
    );
  });

  it('every family has a label', async () => {
    const { DELIVERABLE_FAMILIES, FAMILY_LABELS } = await import('@/lib/deliverable-taxonomy');
    for (const family of DELIVERABLE_FAMILIES) {
      expect(FAMILY_LABELS[family]).toBeDefined();
      expect(FAMILY_LABELS[family].length).toBeGreaterThan(0);
    }
  });

  it('every family has colors', async () => {
    const { DELIVERABLE_FAMILIES, FAMILY_COLORS } = await import('@/lib/deliverable-taxonomy');
    for (const family of DELIVERABLE_FAMILIES) {
      expect(FAMILY_COLORS[family]).toBeDefined();
      expect(FAMILY_COLORS[family].bg).toBeTruthy();
      expect(FAMILY_COLORS[family].text).toBeTruthy();
      expect(FAMILY_COLORS[family].border).toBeTruthy();
    }
  });
});

// ─── Visual Type → Family Mapping ───────────────────────────────────────────

describe('familyForVisualType', () => {
  it('maps visual types to correct families', async () => {
    const { familyForVisualType } = await import('@/lib/deliverable-taxonomy');
    expect(familyForVisualType('benchmark_chart')).toBe('figure');
    expect(familyForVisualType('policy_timeline')).toBe('timeline');
    expect(familyForVisualType('checklist_table')).toBe('checklist');
    expect(familyForVisualType('document_request_matrix')).toBe('matrix');
    expect(familyForVisualType('risk_matrix')).toBe('matrix');
    expect(familyForVisualType('project_timeline')).toBe('timeline');
  });
});

// ─── Export Format Mapping ──────────────────────────────────────────────────

describe('export format mapping', () => {
  it('every family has export formats', async () => {
    const { DELIVERABLE_FAMILIES, FAMILY_EXPORT_FORMATS } = await import('@/lib/deliverable-taxonomy');
    for (const family of DELIVERABLE_FAMILIES) {
      expect(FAMILY_EXPORT_FORMATS[family].length).toBeGreaterThan(0);
    }
  });

  it('exportFormatsForFamily returns correct formats', async () => {
    const { exportFormatsForFamily } = await import('@/lib/deliverable-taxonomy');
    expect(exportFormatsForFamily('figure')).toEqual(['png', 'pdf']);
    expect(exportFormatsForFamily('checklist')).toEqual(['xlsx', 'pdf', 'docx']);
    expect(exportFormatsForFamily('report')).toEqual(['pdf', 'docx']);
  });
});

// ─── Badge Components ───────────────────────────────────────────────────────

describe('FamilyBadge', () => {
  it('renders family label text', async () => {
    const { FamilyBadge } = await import('@/components/deliverables/DeliverableBadge');
    render(<FamilyBadge family="figure" />);
    expect(screen.getByText('Figure')).toBeTruthy();
  });

  it('renders all family types without error', async () => {
    const { FamilyBadge } = await import('@/components/deliverables/DeliverableBadge');
    const { DELIVERABLE_FAMILIES, FAMILY_LABELS } = await import('@/lib/deliverable-taxonomy');
    for (const family of DELIVERABLE_FAMILIES) {
      const { unmount } = render(<FamilyBadge family={family} />);
      expect(screen.getByText(FAMILY_LABELS[family])).toBeTruthy();
      unmount();
    }
  });
});

describe('ConfidenceBadge', () => {
  it('renders high confidence', async () => {
    const { ConfidenceBadge } = await import('@/components/deliverables/DeliverableBadge');
    render(<ConfidenceBadge level="high" />);
    expect(screen.getByText('High confidence')).toBeTruthy();
  });

  it('renders medium confidence', async () => {
    const { ConfidenceBadge } = await import('@/components/deliverables/DeliverableBadge');
    render(<ConfidenceBadge level="medium" />);
    expect(screen.getByText('Medium confidence')).toBeTruthy();
  });

  it('renders low confidence', async () => {
    const { ConfidenceBadge } = await import('@/components/deliverables/DeliverableBadge');
    render(<ConfidenceBadge level="low" />);
    expect(screen.getByText('Low confidence')).toBeTruthy();
  });
});

describe('DeliverableMetaLine', () => {
  it('renders family badge and confidence', async () => {
    const { DeliverableMetaLine } = await import('@/components/deliverables/DeliverableBadge');
    render(
      <DeliverableMetaLine
        family="report"
        confidence="high"
        generatedAt="2026-03-12T00:00:00Z"
      />,
    );
    expect(screen.getByText('Report')).toBeTruthy();
    expect(screen.getByText('High confidence')).toBeTruthy();
    expect(screen.getByText('Mar 12, 2026')).toBeTruthy();
  });

  it('renders without optional fields', async () => {
    const { DeliverableMetaLine } = await import('@/components/deliverables/DeliverableBadge');
    render(<DeliverableMetaLine family="checklist" />);
    expect(screen.getByText('Checklist')).toBeTruthy();
  });
});

// ─── Visual deliverable components show family badges ───────────────────────

describe('visual components render family badges', () => {
  it('BenchmarkChart shows Figure badge', async () => {
    const { BenchmarkChart } = await import('@/components/deliverables/BenchmarkChart');
    render(
      <BenchmarkChart
        spec={{
          type: 'benchmark_chart',
          chartType: 'bar',
          title: 'Test Chart',
          metric: 'lcoe',
          unit: '$/MWh',
          series: [{ label: 'IRENA', source: 'IRENA', valuePoint: 40 }],
        }}
      />,
    );
    expect(screen.getByText('Figure')).toBeTruthy();
  });

  it('ChecklistTable shows Checklist badge', async () => {
    const { ChecklistTable } = await import('@/components/deliverables/ChecklistTable');
    render(
      <ChecklistTable
        spec={{
          type: 'checklist_table',
          title: 'TDD Checklist',
          groups: [{ section: 'Land', items: [{ label: 'Survey' }] }],
        }}
      />,
    );
    expect(screen.getByText('Checklist')).toBeTruthy();
  });

  it('DocumentRequestMatrix shows Matrix badge', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    render(
      <DocumentRequestMatrix
        spec={{
          type: 'document_request_matrix',
          title: 'Docs',
          columns: ['Category', 'Document'],
          rows: [{ category: 'Legal', document: 'Lease' }],
        }}
      />,
    );
    expect(screen.getByText('Matrix')).toBeTruthy();
  });

  it('RiskMatrix shows Matrix badge', async () => {
    const { RiskMatrix } = await import('@/components/deliverables/RiskMatrix');
    render(
      <RiskMatrix
        spec={{
          type: 'risk_matrix',
          title: 'Risks',
          items: [{ risk: 'Delay', likelihood: 'medium', impact: 'high' }],
        }}
      />,
    );
    expect(screen.getByText('Matrix')).toBeTruthy();
  });

  it('ProjectTimeline shows Timeline badge', async () => {
    const { ProjectTimeline } = await import('@/components/deliverables/ProjectTimeline');
    render(
      <ProjectTimeline
        spec={{
          type: 'project_timeline',
          title: 'Schedule',
          stages: [{ name: 'Feasibility', startOffsetDays: 0, durationDays: 30 }],
        }}
      />,
    );
    expect(screen.getByText('Timeline')).toBeTruthy();
  });
});
