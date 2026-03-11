import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock next/navigation (required by Link and other Next.js internals)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => cleanup());

// ─── Benchmark asset page ────────────────────────────────────────────────────

describe('Benchmark asset page', () => {
  it('renders headline and key takeaway', async () => {
    const Page = (await import('@/app/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef/page')).default;
    render(<Page />);

    expect(screen.getByText('Solar LCOE 2024: IRENA vs Lazard vs BNEF')).toBeInTheDocument();
    expect(screen.getByText(/Key takeaway/i)).toBeInTheDocument();
  });

  it('renders comparison table with all sources', async () => {
    const Page = (await import('@/app/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef/page')).default;
    render(<Page />);

    expect(screen.getAllByText(/IRENA RPGC 2024/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lazard LCOE/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BNEF NEO/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NREL ATB/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EIA AEO/).length).toBeGreaterThan(0);
  });

  it('renders "Why the numbers disagree" section', async () => {
    const Page = (await import('@/app/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef/page')).default;
    render(<Page />);

    expect(screen.getByText('Why the numbers disagree')).toBeInTheDocument();
    expect(screen.getByText('Financing assumptions')).toBeInTheDocument();
    expect(screen.getByText('System boundary')).toBeInTheDocument();
  });

  it('has correct CTA link with prefilled query', async () => {
    const Page = (await import('@/app/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef/page')).default;
    render(<Page />);

    const cta = screen.getByText('Ask your own benchmark question');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });

  it('is not auth-gated (no ProtectedRoute wrapper)', async () => {
    const Page = (await import('@/app/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef/page')).default;
    const { container } = render(<Page />);

    // Page should render content immediately without auth checks
    expect(container.textContent).toContain('Solar LCOE 2024');
  });
});

// ─── Policy asset page ──────────────────────────────────────────────────────

describe('Policy asset page', () => {
  it('renders headline and current status', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText('Vietnam Solar Policy Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Current status')).toBeInTheDocument();
  });

  it('renders timeline events', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText('Recent changes')).toBeInTheDocument();
    expect(screen.getAllByText(/Decision 80/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DPPA pilot/).length).toBeGreaterThan(0);
  });

  it('renders who is affected section', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText('Who is affected')).toBeInTheDocument();
    expect(screen.getByText('Utility-scale developers')).toBeInTheDocument();
    expect(screen.getByText('Foreign investors')).toBeInTheDocument();
  });

  it('has correct CTA link with prefilled query', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    render(<Page />);

    const cta = screen.getByText('Track your market');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });

  it('shows last updated badge', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });

  it('is public (no auth gate)', async () => {
    const Page = (await import('@/app/policy/vietnam-solar-snapshot/page')).default;
    const { container } = render(<Page />);
    expect(container.textContent).toContain('Vietnam Solar');
  });
});

// ─── Project Guidance asset page ────────────────────────────────────────────

describe('Project Guidance asset page', () => {
  it('renders headline and scope description', async () => {
    const Page = (await import('@/app/guides/project-guidance-hybrid-pv-bess/page')).default;
    render(<Page />);

    expect(screen.getByText('Project Guidance for Hybrid PV + BESS')).toBeInTheDocument();
    expect(screen.getByText(/What this covers/i)).toBeInTheDocument();
  });

  it('renders all guidance sections', async () => {
    const Page = (await import('@/app/guides/project-guidance-hybrid-pv-bess/page')).default;
    render(<Page />);

    expect(screen.getByText('Technical due diligence')).toBeInTheDocument();
    expect(screen.getByText('EPC review questions')).toBeInTheDocument();
    expect(screen.getByText('Contract & procurement')).toBeInTheDocument();
    expect(screen.getByText('Key project risks')).toBeInTheDocument();
    expect(screen.getByText('Documents to request')).toBeInTheDocument();
  });

  it('renders checklist items with sources', async () => {
    const Page = (await import('@/app/guides/project-guidance-hybrid-pv-bess/page')).default;
    render(<Page />);

    // TDD items (may appear in both table and mobile views)
    expect(screen.getAllByText(/solar resource assessment/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/battery degradation/i).length).toBeGreaterThan(0);

    // Source attributions
    expect(screen.getAllByText(/IFC/).length).toBeGreaterThan(0);
  });

  it('has correct CTA link with prefilled query', async () => {
    const Page = (await import('@/app/guides/project-guidance-hybrid-pv-bess/page')).default;
    render(<Page />);

    const cta = screen.getByText('Generate your own project guidance');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });

  it('is public (no auth gate)', async () => {
    const Page = (await import('@/app/guides/project-guidance-hybrid-pv-bess/page')).default;
    const { container } = render(<Page />);
    expect(container.textContent).toContain('Hybrid PV + BESS');
  });
});

// ─── Wind LCOE asset page ───────────────────────────────────────────────────

describe('Wind LCOE asset page', () => {
  it('renders headline and key takeaway', async () => {
    const Page = (await import('@/app/insights/wind-lcoe-2024-onshore-vs-offshore/page')).default;
    render(<Page />);

    expect(screen.getByText('Wind LCOE 2024: Onshore vs Offshore')).toBeInTheDocument();
    expect(screen.getByText(/Key takeaway/i)).toBeInTheDocument();
  });

  it('renders both onshore and offshore tables', async () => {
    const Page = (await import('@/app/insights/wind-lcoe-2024-onshore-vs-offshore/page')).default;
    render(<Page />);

    expect(screen.getByText('Onshore wind')).toBeInTheDocument();
    expect(screen.getByText('Offshore wind')).toBeInTheDocument();
  });

  it('has correct CTA link', async () => {
    const Page = (await import('@/app/insights/wind-lcoe-2024-onshore-vs-offshore/page')).default;
    render(<Page />);

    const cta = screen.getByText('Compare wind costs for your market');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });
});

// ─── Philippines policy asset page ──────────────────────────────────────────

describe('Philippines policy asset page', () => {
  it('renders headline and current status', async () => {
    const Page = (await import('@/app/policy/philippines-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText('Philippines Solar Policy Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Current status')).toBeInTheDocument();
  });

  it('renders timeline and who is affected', async () => {
    const Page = (await import('@/app/policy/philippines-solar-snapshot/page')).default;
    render(<Page />);

    expect(screen.getByText('Recent changes')).toBeInTheDocument();
    expect(screen.getByText('Who is affected')).toBeInTheDocument();
    expect(screen.getByText('Utility-scale developers')).toBeInTheDocument();
  });

  it('has correct CTA link', async () => {
    const Page = (await import('@/app/policy/philippines-solar-snapshot/page')).default;
    render(<Page />);

    const cta = screen.getByText('Track Philippines energy policy');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });
});

// ─── Battery storage cost trends page ───────────────────────────────────────

describe('Battery storage cost trends page', () => {
  it('renders headline and key takeaway', async () => {
    const Page = (await import('@/app/insights/battery-storage-cost-trends-2020-2024/page')).default;
    render(<Page />);

    expect(screen.getByText('Battery Storage Cost Trends: 2020-2024')).toBeInTheDocument();
    expect(screen.getByText(/Key takeaway/i)).toBeInTheDocument();
  });

  it('renders pack price trend', async () => {
    const Page = (await import('@/app/insights/battery-storage-cost-trends-2020-2024/page')).default;
    render(<Page />);

    expect(screen.getByText('$115')).toBeInTheDocument();
    expect(screen.getByText('$151')).toBeInTheDocument();
  });

  it('renders system cost comparison table', async () => {
    const Page = (await import('@/app/insights/battery-storage-cost-trends-2020-2024/page')).default;
    render(<Page />);

    expect(screen.getByText('Grid-scale system costs (2024)')).toBeInTheDocument();
  });

  it('has correct CTA link', async () => {
    const Page = (await import('@/app/insights/battery-storage-cost-trends-2020-2024/page')).default;
    render(<Page />);

    const cta = screen.getByText('Analyze storage costs for your project');
    expect(cta.closest('a')?.getAttribute('href')).toContain('/compare?q=');
  });
});

// ─── Shared components ──────────────────────────────────────────────────────

describe('Asset shared components', () => {
  it('AssetHero renders tag, title, and subtitle', async () => {
    const { AssetHero } = await import('@/components/assets/AssetHero');
    render(<AssetHero tag="Test Tag" title="Test Title" subtitle="Test subtitle text" />);

    expect(screen.getByText('Test Tag')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle text')).toBeInTheDocument();
  });

  it('AssetCta renders link with correct href', async () => {
    const { AssetCta } = await import('@/components/assets/AssetCta');
    render(<AssetCta label="Click me" href="/test-route" />);

    const link = screen.getByText('Click me');
    expect(link.closest('a')).toHaveAttribute('href', '/test-route');
  });

  it('CitationList renders all citations', async () => {
    const { CitationList } = await import('@/components/assets/CitationList');
    render(<CitationList citations={[
      { source: 'Source A', title: 'Report A', year: 2024 },
      { source: 'Source B', title: 'Report B', year: 2023, url: 'https://example.com' },
    ]} />);

    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Report B')).toBeInTheDocument();
    expect(screen.getByText('[1]')).toBeInTheDocument();
    expect(screen.getByText('[2]')).toBeInTheDocument();
  });

  it('ChecklistGroup renders items with check icons', async () => {
    const { ChecklistGroup } = await import('@/components/assets/ChecklistGroup');
    render(<ChecklistGroup title="Test Group" items={[
      { text: 'Item one', source: 'IFC' },
      { text: 'Item two' },
    ]} />);

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('Item one')).toBeInTheDocument();
    expect(screen.getByText('(IFC)')).toBeInTheDocument();
    expect(screen.getByText('Item two')).toBeInTheDocument();
  });

  it('PolicyTimeline renders events with dates', async () => {
    const { PolicyTimeline } = await import('@/components/assets/PolicyTimeline');
    render(<PolicyTimeline events={[
      { date: 'Jan 2025', title: 'Event A', description: 'Description A', severity: 'high' },
      { date: 'Mar 2024', title: 'Event B', description: 'Description B', severity: 'low' },
    ]} />);

    expect(screen.getByText('Jan 2025')).toBeInTheDocument();
    expect(screen.getByText('Event A')).toBeInTheDocument();
    expect(screen.getByText('Event B')).toBeInTheDocument();
  });
});
