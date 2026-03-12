import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { ProjectGuidancePack } from '@/lib/api-client';

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

const FIXTURE: ProjectGuidancePack = {
  id: '11111111-1111-1111-1111-111111111111',
  type: 'project_guidance_pack',
  createdAt: '2026-03-11T00:00:00.000Z',
  projectType: 'solar_farm',
  technology: ['solar_pv'],
  stage: 'feasibility',
  jurisdiction: 'India',
  summary: 'Project guidance pack for solar PV at the feasibility stage in India. Includes 3 checklist items.',
  stageGuidance: [
    'Tdd: 2 critical requirement(s) — Site selection; Resource assessment',
    'Financial: 1 recommended item(s) — LCOE model',
  ],
  checklist: [
    {
      section: 'Site Assessment',
      items: [
        '[critical] Solar resource check: Verify GHI',
        '[critical] Land survey: Verify ownership',
      ],
    },
    {
      section: 'Financial',
      items: ['[recommended] LCOE model: Prepare estimate'],
    },
  ],
  documentRequestList: [
    {
      category: 'tdd',
      documents: [
        { name: 'Resource report', whyItMatters: 'Required for bankability' },
        { name: 'Land deed', whyItMatters: null },
      ],
    },
  ],
  epcReviewQuestions: [
    {
      section: 'Technical',
      questions: ['Has the contractor completed similar projects?'],
    },
  ],
  riskStarter: [
    {
      risk: 'Land acquisition delay',
      cause: 'Disputed ownership',
      impact: 'High — may block project progression',
      mitigation: 'Engage local counsel',
    },
    {
      risk: 'Grid curtailment',
      cause: null,
      impact: 'Medium — requires monitoring',
      mitigation: null,
    },
  ],
  sourceCoverage: {
    guidelineCount: 2,
    sourcesUsed: ['IFC Solar Guide', 'IRENA Best Practices'],
  },
  citations: [
    { source: 'IFC Solar Guide', title: 'IFC Utility-Scale Solar PV Guide', section: 'Ch. 3', url: null },
    { source: 'IRENA', title: 'IRENA Project Development', section: null, url: 'https://example.com/irena' },
  ],
  caveat: 'Limited source coverage — consider supplementing with local standards.',
};

// Lazy import to apply mocks before component loads
async function renderCard(data: ProjectGuidancePack) {
  const { ProjectGuidanceCard } = await import('@/components/ProjectGuidancePack');
  return render(<ProjectGuidanceCard data={data} />);
}

describe('ProjectGuidanceCard', () => {
  it('renders the header with tag and stage', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText('Pack')).toBeTruthy();
    expect(screen.getByText('feasibility')).toBeTruthy();
  });

  it('renders technology and jurisdiction in header', async () => {
    await renderCard(FIXTURE);
    // Tech and jurisdiction appear in header: "solar pv — India"
    const matches = screen.getAllByText(/India/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/solar pv/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders summary text', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText(/Project guidance pack for solar PV/)).toBeTruthy();
  });

  it('renders stage guidance items', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText(/Tdd: 2 critical/)).toBeTruthy();
    expect(screen.getByText(/Financial: 1 recommended/)).toBeTruthy();
  });

  it('renders checklist sections and items', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText('Site Assessment')).toBeTruthy();
    expect(screen.getByText(/Solar resource check/)).toBeTruthy();
    expect(screen.getByText('Financial')).toBeTruthy();
  });

  it('renders document request list', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText('Resource report')).toBeTruthy();
    expect(screen.getByText(/Required for bankability/)).toBeTruthy();
  });

  it('renders EPC review questions', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText(/Has the contractor completed similar projects/)).toBeTruthy();
  });

  it('renders risk starter with cause and mitigation', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText('Land acquisition delay')).toBeTruthy();
    expect(screen.getByText(/Disputed ownership/)).toBeTruthy();
    expect(screen.getByText(/Engage local counsel/)).toBeTruthy();
  });

  it('renders citations with links', async () => {
    await renderCard(FIXTURE);
    const link = screen.getByText('IRENA Project Development');
    expect(link.closest('a')).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('https://example.com/irena');
  });

  it('renders caveat when present', async () => {
    await renderCard(FIXTURE);
    expect(screen.getByText(/Limited source coverage/)).toBeTruthy();
  });

  it('hides caveat when null', async () => {
    await renderCard({ ...FIXTURE, caveat: null });
    expect(screen.queryByText(/Note:/)).toBeNull();
  });

  it('hides empty sections', async () => {
    await renderCard({
      ...FIXTURE,
      stageGuidance: [],
      checklist: [],
      documentRequestList: [],
      epcReviewQuestions: [],
      riskStarter: [],
      citations: [],
    });
    // Should still render header and summary
    expect(screen.getByText('Pack')).toBeTruthy();
    expect(screen.getByText(/Project guidance pack/)).toBeTruthy();
    // Should not render section titles for empty sections
    expect(screen.queryByText(/Stage Guidance/)).toBeNull();
    expect(screen.queryByText(/Risk Register/)).toBeNull();
  });

  it('displays correct item counts in header', async () => {
    await renderCard(FIXTURE);
    // 3 checklist items total
    expect(screen.getByText('3')).toBeTruthy();
    // 2 risks
    expect(screen.getByText('2')).toBeTruthy();
  });
});
