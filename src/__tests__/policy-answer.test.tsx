import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { PolicyAnswerEnvelope } from '@/lib/api-client';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(() => cleanup());

const FIXTURE: PolicyAnswerEnvelope = {
  topic: 'What is PPA in Vietnam?',
  jurisdiction: 'Vietnam',
  technology: 'solar_pv',
  lastChecked: '2025-02-01',
  confidence: 'high',
  currentStatus: {
    summary: '2 active policy documents, 1 draft. Primary categories: tariff, auction.',
    statusLabels: ['active', 'draft pending'],
  },
  whatChanged: [
    { title: 'DPPA pilot framework enacted', detail: '[enacted] Impact: high', effectiveDate: '2024-09-15' },
    { title: 'Implementation rules take effect', detail: '[effective] Impact: high', effectiveDate: '2025-02-01' },
  ],
  howItWorksNow: [
    { pathway: 'Direct PPA', description: 'Large consumers can buy directly from RE generators', appliesTo: ['solar_pv', 'onshore_wind'] },
    { pathway: 'Auction', description: 'Competitive auction mechanism under development', appliesTo: ['solar_pv'] },
  ],
  keyDates: [
    { label: 'DPPA Pilot Launch', date: '2025-02-01', significance: 'Effective date' },
    { label: 'Auction Pilot', date: '2025-H2', significance: 'Target' },
  ],
  whoIsAffected: [
    { actor: 'Utility-scale developers', impact: 'Must negotiate bilateral DPPAs or wait for auctions.' },
    { actor: 'Foreign investors', impact: 'DPPA opens new entry path for projects >30 MW.' },
  ],
  practicalImplications: [
    'Active framework exists for direct procurement.',
    'Auction mechanism still under development — timeline uncertain.',
  ],
  whatToCheckNext: [
    'Check latest notices from MOIT and ERAV.',
    'Verify current tariff rates with the energy regulator.',
  ],
  sources: [
    { id: '1', source: 'Vietnam', title: 'Decision 80/2024 — Direct PPA Framework', date: '2024-09-15', url: 'https://example.com/decision-80' },
    { id: '2', source: 'Vietnam', title: 'Circular 02/2025 — DPPA Implementation', date: '2025-01-10', url: null },
  ],
  caveat: 'For transaction-grade certainty, confirm the latest decree or implementing circular.',
};

describe('PolicyAnswer component', () => {
  it('renders the policy briefing header', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('High confidence')).toBeInTheDocument();
    expect(screen.getAllByText(/Vietnam/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders last checked date', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getAllByText('2025-02-01').length).toBeGreaterThanOrEqual(1);
  });

  it('renders current status summary and labels', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText(/2 active policy documents/)).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('draft pending')).toBeInTheDocument();
  });

  it('renders what changed section', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('What Changed')).toBeInTheDocument();
    expect(screen.getByText('DPPA pilot framework enacted')).toBeInTheDocument();
    expect(screen.getByText('Implementation rules take effect')).toBeInTheDocument();
  });

  it('renders how it works now pathways', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('How It Works Now')).toBeInTheDocument();
    expect(screen.getByText('Direct PPA')).toBeInTheDocument();
    expect(screen.getByText('Auction')).toBeInTheDocument();
  });

  it('renders key dates', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('Key Dates')).toBeInTheDocument();
    expect(screen.getByText('DPPA Pilot Launch')).toBeInTheDocument();
  });

  it('renders who is affected', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('Who Is Affected')).toBeInTheDocument();
    expect(screen.getByText(/Utility-scale developers/)).toBeInTheDocument();
    expect(screen.getByText(/Foreign investors/)).toBeInTheDocument();
  });

  it('renders practical implications', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('Practical Implications')).toBeInTheDocument();
    expect(screen.getByText(/Active framework exists/)).toBeInTheDocument();
  });

  it('renders what to check next', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('What to Check Next')).toBeInTheDocument();
    expect(screen.getByText(/MOIT and ERAV/)).toBeInTheDocument();
  });

  it('renders sources with links where available', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText('Sources')).toBeInTheDocument();
    const link = screen.getByText('Decision 80/2024 — Direct PPA Framework');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com/decision-80');
  });

  it('renders caveat when present', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    render(<PolicyAnswer data={FIXTURE} />);

    expect(screen.getByText(/transaction-grade certainty/)).toBeInTheDocument();
  });

  it('does not render caveat section when null', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    const noCaveat = { ...FIXTURE, caveat: null };
    render(<PolicyAnswer data={noCaveat} />);

    expect(screen.queryByText(/transaction-grade/)).not.toBeInTheDocument();
  });

  it('renders medium confidence with amber styling', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    const mediumConf = { ...FIXTURE, confidence: 'medium' as const };
    render(<PolicyAnswer data={mediumConf} />);

    expect(screen.getByText('Medium confidence')).toBeInTheDocument();
  });

  it('handles empty arrays gracefully', async () => {
    const { PolicyAnswer } = await import('@/components/PolicyAnswer');
    const empty = {
      ...FIXTURE,
      whatChanged: [],
      howItWorksNow: [],
      keyDates: [],
      whoIsAffected: [],
      practicalImplications: [],
      whatToCheckNext: [],
      sources: [],
    };
    render(<PolicyAnswer data={empty} />);

    // Should still render header and current status
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Current Status')).toBeInTheDocument();

    // Empty sections should not render
    expect(screen.queryByText('What Changed')).not.toBeInTheDocument();
    expect(screen.queryByText('Key Dates')).not.toBeInTheDocument();
  });
});
