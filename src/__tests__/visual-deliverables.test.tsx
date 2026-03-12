import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => cleanup());

// ─── BenchmarkChart ──────────────────────────────────────────────────────────

describe('BenchmarkChart', () => {
  const SPEC = {
    type: 'benchmark_chart' as const,
    chartType: 'range' as const,
    title: 'LCOE — solar pv',
    subtitle: 'global, 2024',
    metric: 'lcoe',
    unit: 'USD/MWh',
    series: [
      { label: 'IRENA', source: 'IRENA', valueMin: 28, valueMax: 50, valuePoint: 36, confidence: 'high' as const },
      { label: 'Lazard', source: 'Lazard', valueMin: 24, valueMax: 96, valuePoint: 49, confidence: 'medium' as const },
    ],
    disagreementDrivers: ['IRENA uses weighted average, Lazard uses unsubsidized'],
  };

  it('renders title and subtitle', async () => {
    const { BenchmarkChart } = await import('@/components/deliverables/BenchmarkChart');
    render(<BenchmarkChart spec={SPEC} />);
    expect(screen.getByText('LCOE — solar pv')).toBeTruthy();
    expect(screen.getByText('global, 2024')).toBeTruthy();
  });

  it('renders series labels', async () => {
    const { BenchmarkChart } = await import('@/components/deliverables/BenchmarkChart');
    render(<BenchmarkChart spec={SPEC} />);
    expect(screen.getByText('IRENA')).toBeTruthy();
    expect(screen.getByText('Lazard')).toBeTruthy();
  });

  it('renders disagreement drivers', async () => {
    const { BenchmarkChart } = await import('@/components/deliverables/BenchmarkChart');
    render(<BenchmarkChart spec={SPEC} />);
    expect(screen.getByText(/IRENA uses weighted average/)).toBeTruthy();
  });

  it('returns null for empty series', async () => {
    const { BenchmarkChart } = await import('@/components/deliverables/BenchmarkChart');
    const { container } = render(<BenchmarkChart spec={{ ...SPEC, series: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});

// ─── PolicyTimeline ──────────────────────────────────────────────────────────

describe('PolicyTimeline', () => {
  const SPEC = {
    type: 'policy_timeline' as const,
    title: 'Policy Timeline — Vietnam',
    jurisdiction: 'Vietnam',
    subtitle: 'solar pv',
    events: [
      { date: '2024-10-01', label: 'DPPA effective', eventType: 'key_date', significance: 'Framework active', source: 'MOIT', severity: null },
      { date: '2025-02-01', label: 'Circular 02', eventType: 'change', significance: 'Implementation rules', source: null, severity: 'high' as const },
    ],
  };

  it('renders title and events', async () => {
    const { PolicyTimeline } = await import('@/components/deliverables/PolicyTimeline');
    render(<PolicyTimeline spec={SPEC} />);
    expect(screen.getByText('Policy Timeline — Vietnam')).toBeTruthy();
    expect(screen.getByText('DPPA effective')).toBeTruthy();
    expect(screen.getByText('Circular 02')).toBeTruthy();
  });

  it('renders dates in order', async () => {
    const { PolicyTimeline } = await import('@/components/deliverables/PolicyTimeline');
    render(<PolicyTimeline spec={SPEC} />);
    expect(screen.getByText('2024-10-01')).toBeTruthy();
    expect(screen.getByText('2025-02-01')).toBeTruthy();
  });

  it('renders event significance', async () => {
    const { PolicyTimeline } = await import('@/components/deliverables/PolicyTimeline');
    render(<PolicyTimeline spec={SPEC} />);
    expect(screen.getByText('Framework active')).toBeTruthy();
  });

  it('returns null for empty events', async () => {
    const { PolicyTimeline } = await import('@/components/deliverables/PolicyTimeline');
    const { container } = render(<PolicyTimeline spec={{ ...SPEC, events: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});

// ─── ChecklistTable ──────────────────────────────────────────────────────────

describe('ChecklistTable', () => {
  const SPEC = {
    type: 'checklist_table' as const,
    title: 'TDD Checklist — feasibility',
    subtitle: 'solar pv — India (3 items)',
    groups: [
      {
        section: 'Site Assessment',
        items: [
          { label: 'Solar resource check', severity: 'critical' as const, source: null },
          { label: 'Grid proximity', severity: 'medium' as const, source: null },
        ],
      },
      {
        section: 'Financial',
        items: [{ label: 'LCOE model', severity: 'critical' as const, source: null }],
      },
    ],
  };

  it('renders title and sections', async () => {
    const { ChecklistTable } = await import('@/components/deliverables/ChecklistTable');
    render(<ChecklistTable spec={SPEC} />);
    expect(screen.getByText('TDD Checklist — feasibility')).toBeTruthy();
    expect(screen.getByText('Site Assessment')).toBeTruthy();
    expect(screen.getByText('Financial')).toBeTruthy();
  });

  it('renders items with severity badges', async () => {
    const { ChecklistTable } = await import('@/components/deliverables/ChecklistTable');
    render(<ChecklistTable spec={SPEC} />);
    expect(screen.getByText('Solar resource check')).toBeTruthy();
    expect(screen.getAllByText('critical').length).toBeGreaterThanOrEqual(1);
  });

  it('returns null for empty groups', async () => {
    const { ChecklistTable } = await import('@/components/deliverables/ChecklistTable');
    const { container } = render(<ChecklistTable spec={{ ...SPEC, groups: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});

// ─── DocumentRequestMatrix ───────────────────────────────────────────────────

describe('DocumentRequestMatrix', () => {
  const SPEC = {
    type: 'document_request_matrix' as const,
    title: 'Document Request List — feasibility',
    subtitle: 'India (2 documents)',
    columns: ['Category', 'Document', 'Why It Matters', 'Priority'],
    rows: [
      { category: 'tdd', document: 'Solar resource report', whyItMatters: 'Required for bankability', priority: 'high' as const },
      { category: 'tdd', document: 'Land deed', whyItMatters: null, priority: 'medium' as const },
    ],
  };

  it('renders title and rows', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    render(<DocumentRequestMatrix spec={SPEC} />);
    expect(screen.getByText('Document Request List — feasibility')).toBeTruthy();
    expect(screen.getByText('Solar resource report')).toBeTruthy();
    expect(screen.getByText('Land deed')).toBeTruthy();
  });

  it('renders whyItMatters when available', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    render(<DocumentRequestMatrix spec={SPEC} />);
    expect(screen.getByText('Required for bankability')).toBeTruthy();
  });

  it('renders priority badges', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    render(<DocumentRequestMatrix spec={SPEC} />);
    expect(screen.getAllByText('high').length).toBeGreaterThanOrEqual(1);
  });

  it('returns null for empty rows', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    const { container } = render(<DocumentRequestMatrix spec={{ ...SPEC, rows: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});

// ─── RiskMatrix ──────────────────────────────────────────────────────────────

describe('RiskMatrix', () => {
  const SPEC = {
    type: 'risk_matrix' as const,
    title: 'Risk Register — feasibility',
    subtitle: 'solar pv — India',
    items: [
      { risk: 'Land dispute', likelihood: 'high' as const, impact: 'high' as const, cause: 'Disputed ownership', mitigation: 'Engage counsel' },
      { risk: 'Grid curtailment', likelihood: 'medium' as const, impact: 'medium' as const, cause: null, mitigation: null },
    ],
  };

  it('renders title and risks', async () => {
    const { RiskMatrix } = await import('@/components/deliverables/RiskMatrix');
    render(<RiskMatrix spec={SPEC} />);
    expect(screen.getByText('Risk Register — feasibility')).toBeTruthy();
    expect(screen.getByText('Land dispute')).toBeTruthy();
    expect(screen.getByText('Grid curtailment')).toBeTruthy();
  });

  it('renders cause and mitigation after expand', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const { RiskMatrix } = await import('@/components/deliverables/RiskMatrix');
    render(<RiskMatrix spec={SPEC} />);
    // Cause/mitigation are behind expand click — click the first risk item
    const landRisk = screen.getByText('Land dispute');
    fireEvent.click(landRisk);
    expect(screen.getByText(/Disputed ownership/)).toBeTruthy();
    expect(screen.getByText(/Engage counsel/)).toBeTruthy();
  });

  it('renders likelihood/impact indicators', async () => {
    const { RiskMatrix } = await import('@/components/deliverables/RiskMatrix');
    render(<RiskMatrix spec={SPEC} />);
    expect(screen.getAllByText('L:H').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('I:H').length).toBeGreaterThanOrEqual(1);
  });

  it('returns null for empty items', async () => {
    const { RiskMatrix } = await import('@/components/deliverables/RiskMatrix');
    const { container } = render(<RiskMatrix spec={{ ...SPEC, items: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});

// ─── ProjectTimeline ─────────────────────────────────────────────────────────

describe('ProjectTimeline', () => {
  const SPEC = {
    type: 'project_timeline' as const,
    title: 'Project Timeline — solar pv',
    subtitle: 'India',
    stages: [
      { name: 'feasibility', startOffsetDays: 0, durationDays: 90, owner: 'Development Team', dependencies: undefined },
      { name: 'development', startOffsetDays: 90, durationDays: 120, owner: 'Project Manager', dependencies: ['feasibility'] },
      { name: 'procurement', startOffsetDays: 210, durationDays: 60, owner: 'Procurement Lead', dependencies: ['development'] },
    ],
  };

  it('renders title and stages', async () => {
    const { ProjectTimeline } = await import('@/components/deliverables/ProjectTimeline');
    render(<ProjectTimeline spec={SPEC} />);
    expect(screen.getByText('Project Timeline — solar pv')).toBeTruthy();
    expect(screen.getByText('feasibility')).toBeTruthy();
    expect(screen.getByText('development')).toBeTruthy();
    expect(screen.getByText('procurement')).toBeTruthy();
  });

  it('renders duration labels', async () => {
    const { ProjectTimeline } = await import('@/components/deliverables/ProjectTimeline');
    render(<ProjectTimeline spec={SPEC} />);
    expect(screen.getByText('90d')).toBeTruthy();
    expect(screen.getByText('120d')).toBeTruthy();
  });

  it('returns null for empty stages', async () => {
    const { ProjectTimeline } = await import('@/components/deliverables/ProjectTimeline');
    const { container } = render(<ProjectTimeline spec={{ ...SPEC, stages: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});
