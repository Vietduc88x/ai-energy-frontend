import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// ─── Mock next/navigation ───────────────────────────────────────────────────
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock fetch ─────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonOk(data: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
}
function jsonErr(data: unknown, status: number) {
  return Promise.resolve({ ok: false, status, statusText: 'Error', json: () => Promise.resolve(data) });
}

beforeEach(() => {
  mockFetch.mockReset();
  mockPush.mockReset();
  mockReplace.mockReset();
});

afterEach(() => {
  cleanup();
});

// ─── Test: Unauthenticated redirect ─────────────────────────────────────────

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to signin', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/user/me')) return jsonErr({ error: 'Unauthorized' }, 401);
      if (url.includes('/billing/status')) return jsonErr({ error: 'Unauthorized' }, 401);
      return jsonOk({});
    });

    const { ProtectedRoute } = await import('@/components/protected-route');
    const { useSession } = await import('@/hooks/use-session');

    function TestPage() {
      const session = useSession();
      return (
        <ProtectedRoute session={session}>
          <div>Protected content</div>
        </ProtectedRoute>
      );
    }

    render(<TestPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/auth/signin'));
    });
  });
});

// ─── Test: Demo render ──────────────────────────────────────────────────────

describe('Landing page demo', () => {
  it('renders demo comparison on button click', async () => {
    const demoData = {
      id: 'demo-solar-lcoe-2024',
      query: { metric: 'lcoe', technology: 'Solar PV', region: 'Global', year: 2024 },
      normalization: { currency: 'USD', priceYear: 2024, deflatorSource: 'IMF', targetUnit: '$/MWh' },
      rows: [{ source: 'IRENA', value_min: 29, value_max: 52, value_point: 40, unit: '$/MWh', year: 2024, methodology_summary: null, assumptions: null, confidence: 0.9 }],
      deltas: [],
      scores: { coverage: 0.6, conflict: 0.07, missing_sources: [], sources_used: ['IRENA'] },
      metadata: { row_count: 1, latency_ms: 0, created_at: '2026-03-09T00:00:00.000Z', demo: true },
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('demo/solar-lcoe-2024')) return jsonOk(demoData);
      if (url.includes('/user/me')) return jsonErr({}, 401);
      if (url.includes('/billing')) return jsonErr({}, 401);
      if (url.includes('sample-queries')) return jsonOk({ queries: [] });
      if (url.includes('/events')) return jsonOk({ accepted: true });
      return jsonOk({});
    });

    const LandingPage = (await import('@/app/page')).default;
    render(<LandingPage />);

    const btn = screen.getByText(/Try it/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getAllByText('IRENA').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/40 \$\/MWh/).length).toBeGreaterThan(0);
    });
  });
});

// ─── Test: 429 triggers quota modal ─────────────────────────────────────────

describe('Quota modal on 429', () => {
  it('api client returns typed 429 error', async () => {
    mockFetch.mockReturnValue(jsonErr({ error: 'Rate limit', code: 'RATE_LIMITED' }, 429));

    const { createComparison } = await import('@/lib/api-client');
    const res = await createComparison({ metric: 'lcoe', technology: 'solar_pv', region: 'global' });

    expect(res.data).toBeNull();
    expect(res.error?.status).toBe(429);
    expect(res.error?.code).toBe('RATE_LIMITED');
  });

  it('QuotaModal renders with tier info and closes', async () => {
    mockFetch.mockReturnValue(jsonOk({ accepted: true }));

    const { QuotaModal } = await import('@/components/quota-modal');
    const onClose = vi.fn();

    render(<QuotaModal tier="free" limit={5} onClose={onClose} />);

    expect(screen.getByText(/Usage limit reached/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Maybe later/i));
    expect(onClose).toHaveBeenCalled();
  });
});

// ─── Test: Checkout redirect ────────────────────────────────────────────────

describe('Billing checkout', () => {
  it('createCheckout returns checkout URL', async () => {
    mockFetch.mockReturnValue(jsonOk({ checkoutUrl: 'https://pay.example.com/checkout' }));

    const { createCheckout } = await import('@/lib/api-client');
    const res = await createCheckout('pro');
    expect(res.data?.checkoutUrl).toBe('https://pay.example.com/checkout');
  });
});

// ─── Test: Billing success polling ──────────────────────────────────────────

describe('Billing success page', () => {
  it('renders processing state initially then upgrades on poll', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/billing/status')) return jsonOk({ tier: 'pro', limits: { comparisonsPerMonth: 'unlimited' } });
      return jsonOk({});
    });

    const SuccessPage = (await import('@/app/billing/success/page')).default;
    render(<SuccessPage />);

    expect(screen.getByText(/Processing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Welcome to pro/i)).toBeInTheDocument();
    }, { timeout: 8000 });
  }, 10000);
});
