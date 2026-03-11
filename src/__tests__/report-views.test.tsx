import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

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

// ─── BenchmarkReportView ────────────────────────────────────────────────────

describe('BenchmarkReportView', () => {
  const REPORT = {
    type: 'benchmark_report' as const,
    title: 'LCOE Benchmark Report — solar pv',
    subtitle: 'Global, 2024',
    generatedAt: '2026-03-11T00:00:00.000Z',
    query: { metric: 'lcoe', technology: 'solar_pv', region: 'global', year: 2024 },
    summary: 'Compares LCOE across 3 sources.',
    keyTakeaway: 'LCOE ranges from 36 to 49 USD/MWh.',
    comparisonTable: [
      { source: 'IRENA', valueMin: 28, valueMax: 50, valuePoint: 36, unit: 'USD/MWh', methodology: 'Weighted average' },
      { source: 'Lazard', valueMin: 24, valueMax: 96, valuePoint: 49, unit: 'USD/MWh', methodology: 'Unsubsidized' },
    ],
    chartSpec: {
      chartType: 'range',
      series: [
        { label: 'IRENA', valueMin: 28, valueMax: 50, valuePoint: 36 },
        { label: 'Lazard', valueMin: 24, valueMax: 96, valuePoint: 49 },
      ],
    },
    disagreementDrivers: ['Methodology differences between IRENA and Lazard'],
    normalization: { currency: 'USD', priceYear: 2024, unit: 'USD/MWh' },
    citations: [{ source: 'IRENA', title: 'IRENA Report', url: null }],
    caveat: 'Data is approximate.',
  };

  it('renders title and subtitle', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getByText('LCOE Benchmark Report — solar pv')).toBeTruthy();
    expect(screen.getByText('Global, 2024')).toBeTruthy();
  });

  it('renders key takeaway', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getByText(/LCOE ranges from 36/)).toBeTruthy();
  });

  it('renders comparison table rows', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getAllByText('IRENA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Lazard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Weighted average')).toBeTruthy();
  });

  it('renders disagreement drivers', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getByText(/Methodology differences/)).toBeTruthy();
  });

  it('renders caveat', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getByText(/Data is approximate/)).toBeTruthy();
  });

  it('renders citations', async () => {
    const { BenchmarkReportView } = await import('@/components/reports/BenchmarkReportView');
    render(<BenchmarkReportView report={REPORT} />);
    expect(screen.getByText('IRENA Report')).toBeTruthy();
  });
});

// ─── PolicyReportView ───────────────────────────────────────────────────────

describe('PolicyReportView', () => {
  const REPORT = {
    type: 'policy_report' as const,
    title: 'Policy Report — Vietnam',
    subtitle: 'solar pv',
    generatedAt: '2026-03-11T00:00:00.000Z',
    jurisdiction: 'Vietnam',
    technology: 'solar_pv',
    lastChecked: '2026-03-10',
    confidence: 'high' as const,
    currentStatus: { summary: 'Active DPPA framework', statusLabels: ['active', 'DPPA'] },
    whatChanged: [
      { title: 'New Circular', detail: 'Implementation rules issued', effectiveDate: '2025-02-01' },
    ],
    howItWorksNow: [{ pathway: 'DPPA', description: 'Direct PPA between generator and consumer', appliesTo: ['solar_pv'] }],
    keyDates: [
      { label: 'DPPA effective', date: '2024-10-01', significance: 'Framework active' },
    ],
    whoIsAffected: [{ actor: 'IPP', impact: 'Can sell directly to C&I' }],
    practicalImplications: ['C&I offtake agreements now viable'],
    whatToCheckNext: ['Monitor EVN grid access rules'],
    timelineEvents: [
      { date: '2024-10-01', label: 'DPPA effective', significance: 'Framework active', severity: null },
      { date: '2025-02-01', label: 'New Circular', significance: 'Implementation rules', severity: 'high' },
    ],
    citations: [{ source: 'MOIT', title: 'Decision 80/2024', url: 'https://example.com' }],
    caveat: null,
  };

  it('renders title and confidence badge', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.getByText('Policy Report — Vietnam')).toBeTruthy();
    expect(screen.getByText('high confidence')).toBeTruthy();
  });

  it('renders current status', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.getByText('Active DPPA framework')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });

  it('renders what changed section', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.getAllByText('New Circular').length).toBeGreaterThanOrEqual(1);
  });

  it('renders who is affected', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.getByText(/IPP/)).toBeTruthy();
  });

  it('renders timeline events', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.getAllByText('DPPA effective').length).toBeGreaterThanOrEqual(1);
  });

  it('hides caveat when null', async () => {
    const { PolicyReportView } = await import('@/components/reports/PolicyReportView');
    render(<PolicyReportView report={REPORT} />);
    expect(screen.queryByText('Note:')).toBeNull();
  });
});

// ─── ProjectGuidanceReportView ──────────────────────────────────────────────

describe('ProjectGuidanceReportView', () => {
  const REPORT = {
    type: 'project_guidance_report' as const,
    title: 'Project Guidance Report — solar pv',
    subtitle: 'feasibility — India',
    generatedAt: '2026-03-11T00:00:00.000Z',
    projectContext: {
      projectType: 'solar_farm',
      technology: ['solar_pv'],
      stage: 'feasibility',
      jurisdiction: 'India',
    },
    summary: 'Guidance for solar PV feasibility in India.',
    stageGuidance: ['Complete site assessment first', 'Engage local counsel'],
    checklist: [
      {
        section: 'Site Assessment',
        items: [
          { label: 'Verify GHI > 4.5', severity: 'critical' },
          { label: 'Check distance to substation', severity: 'medium' },
          { label: 'Basic topographic survey', severity: null },
        ],
      },
    ],
    documentRequestMatrix: [
      { category: 'Technical', document: 'Solar resource report', whyItMatters: 'Required for bankability', priority: 'high' },
      { category: 'Technical', document: 'Land deed', whyItMatters: null, priority: 'medium' },
    ],
    epcReviewQuestions: [
      { section: 'Technical', questions: ['Has contractor done similar work?'] },
    ],
    riskStarter: [
      { risk: 'Land dispute', likelihood: 'high', impact: 'high', cause: 'Common in rural areas', mitigation: 'Engage counsel' },
      { risk: 'Grid curtailment', likelihood: 'medium', impact: 'low', cause: null, mitigation: null },
    ],
    citations: [
      { source: 'IFC', title: 'IFC Solar Guide', url: null },
      { source: 'IRENA', title: 'IRENA Report', url: 'https://example.com' },
    ],
    caveat: 'For informational purposes only.',
  };

  it('renders title and subtitle', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Project Guidance Report — solar pv')).toBeTruthy();
    expect(screen.getByText('feasibility — India')).toBeTruthy();
  });

  it('renders project context badges', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('solar farm')).toBeTruthy();
    expect(screen.getByText('solar pv')).toBeTruthy();
    expect(screen.getByText('India')).toBeTruthy();
  });

  it('renders executive summary', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText(/Guidance for solar PV/)).toBeTruthy();
  });

  it('renders stage guidance items', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Complete site assessment first')).toBeTruthy();
    expect(screen.getByText('Engage local counsel')).toBeTruthy();
  });

  it('renders checklist with severity badges', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Site Assessment')).toBeTruthy();
    expect(screen.getByText('Verify GHI > 4.5')).toBeTruthy();
    expect(screen.getByText('critical')).toBeTruthy();
    expect(screen.getAllByText('medium').length).toBeGreaterThanOrEqual(1);
  });

  it('renders document request table', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Solar resource report')).toBeTruthy();
    expect(screen.getByText('Land deed')).toBeTruthy();
  });

  it('renders EPC review questions', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Has contractor done similar work?')).toBeTruthy();
  });

  it('renders risk register with L/I indicators', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('Land dispute')).toBeTruthy();
    expect(screen.getByText('Grid curtailment')).toBeTruthy();
    expect(screen.getAllByText('L:H').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('I:H').length).toBeGreaterThanOrEqual(1);
  });

  it('renders caveat when present', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText(/For informational purposes/)).toBeTruthy();
  });

  it('renders citations', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    render(<ProjectGuidanceReportView report={REPORT} />);
    expect(screen.getByText('IFC Solar Guide')).toBeTruthy();
  });

  it('hides sections when empty', async () => {
    const { ProjectGuidanceReportView } = await import('@/components/reports/ProjectGuidanceReportView');
    const emptyReport = {
      ...REPORT,
      stageGuidance: [],
      checklist: [],
      documentRequestMatrix: [],
      epcReviewQuestions: [],
      riskStarter: [],
      caveat: null,
    };
    render(<ProjectGuidanceReportView report={emptyReport} />);
    expect(screen.queryByText('Stage Guidance')).toBeNull();
    expect(screen.queryByText('Due Diligence Checklist')).toBeNull();
    expect(screen.queryByText('Risk Register')).toBeNull();
  });
});
