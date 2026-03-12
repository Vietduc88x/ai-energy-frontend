/**
 * Tests for chat welcome screen: 3-level prompt hierarchy.
 * Covers: Start Here (3 hero prompts), Benchmark (4), Policy (4),
 * Project Guidance (6), More Ways (4 secondary), prompt click, key headings.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within, act, waitFor } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/compare',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// jsdom doesn't support scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation((url: string) => {
    if (typeof url === 'string' && url.includes('/user/me'))
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'u1', email: 'test@test.com', name: 'Test' }) });
    if (typeof url === 'string' && url.includes('/billing/status'))
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ tier: 'pro', limits: {} }) });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  cleanup();
});

async function renderWelcome() {
  const mod = await import('@/app/compare/page');
  const Page = mod.default;
  render(<Page />);
}

// ─── Structure tests ────────────────────────────────────────────────────────

describe('Chat welcome screen structure', () => {

  it('renders Start Here section with exactly 3 hero prompts', async () => {
    await renderWelcome();
    const section = screen.getByTestId('start-here');
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('renders Benchmark section with exactly 4 prompts', async () => {
    await renderWelcome();
    const section = screen.getByTestId('section-benchmark');
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('renders Policy section with exactly 4 prompts', async () => {
    await renderWelcome();
    const section = screen.getByTestId('section-policy');
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('renders Project Guidance section with exactly 6 prompts', async () => {
    await renderWelcome();
    const section = screen.getByTestId('section-guidance');
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('renders More Ways section with exactly 4 secondary prompts', async () => {
    await renderWelcome();
    const section = screen.getByTestId('more-ways');
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('More Ways section uses smaller/lighter styling than primary sections', async () => {
    await renderWelcome();
    const more = screen.getByTestId('more-ways');
    const moreButtons = within(more).getAllByRole('button');
    // More Ways buttons use text-xs (smaller than Level 2's text-[13px])
    expect(moreButtons[0].className).toContain('text-xs');
    // More Ways buttons use text-gray-400 (lighter)
    expect(moreButtons[0].className).toContain('text-gray-400');
  });
});

// ─── Key headings ────────────────────────────────────────────────────────────

describe('Chat welcome key headings', () => {

  it('displays AI Energy Analyst title', async () => {
    await renderWelcome();
    expect(screen.getByText('AI Energy Analyst')).toBeInTheDocument();
  });

  it('displays section labels: Benchmark, Policy, Project Guidance', async () => {
    await renderWelcome();
    const primary = screen.getByTestId('primary-sections');
    expect(within(primary).getByText('Benchmark')).toBeInTheDocument();
    expect(within(primary).getByText('Policy')).toBeInTheDocument();
    expect(within(primary).getByText('Project Guidance')).toBeInTheDocument();
  });

  it('displays More ways to ask heading', async () => {
    await renderWelcome();
    expect(screen.getByText('More ways to ask')).toBeInTheDocument();
  });

  it('hero prompts have labels: Benchmark, Policy, Guidance', async () => {
    await renderWelcome();
    const hero = screen.getByTestId('start-here');
    const labels = within(hero).getAllByText(/^(Benchmark|Policy|Guidance)$/);
    expect(labels).toHaveLength(3);
  });
});

// ─── Prompt click ────────────────────────────────────────────────────────────

describe('Prompt click behavior', () => {

  it('clicking a hero prompt sends the message (removes welcome screen)', async () => {
    await renderWelcome();
    // Wait for session to load (useSession fetches user/billing)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    // Allow async state updates to settle
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    const hero = screen.getByTestId('start-here');
    const firstButton = within(hero).getAllByRole('button')[0];
    await act(async () => { fireEvent.click(firstButton); });
    await waitFor(() => {
      expect(screen.queryByTestId('start-here')).toBeNull();
    });
  });

  it('clicking a Level 2 prompt sends the message', async () => {
    await renderWelcome();
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    const section = screen.getByTestId('section-policy');
    const firstButton = within(section).getAllByRole('button')[0];
    await act(async () => { fireEvent.click(firstButton); });
    await waitFor(() => {
      expect(screen.queryByTestId('primary-sections')).toBeNull();
    });
  });

  it('clicking a More Ways prompt sends the message', async () => {
    await renderWelcome();
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });

    const more = screen.getByTestId('more-ways');
    const firstButton = within(more).getAllByRole('button')[0];
    await act(async () => { fireEvent.click(firstButton); });
    await waitFor(() => {
      expect(screen.queryByTestId('more-ways')).toBeNull();
    });
  });
});
