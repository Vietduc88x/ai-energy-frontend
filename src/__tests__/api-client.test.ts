import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDemoComparison,
  createComparison,
  exportComparison,
  exportComparisonDirect,
  shouldUseDirectDownload,
  getBillingStatus,
  createCheckout,
  trackEvent,
  getSampleQueries,
  getAdminFunnel,
  getUserProfile,
} from '@/lib/api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('API Client', () => {
  it('getDemoComparison returns typed data', async () => {
    const demo = { id: 'demo-solar-lcoe-2024', query: { metric: 'lcoe', technology: 'Solar PV', region: 'Global', year: 2024 }, rows: [], scores: {}, metadata: {} };
    mockFetch.mockReturnValue(jsonResponse(demo));
    const res = await getDemoComparison();
    expect(res.data?.id).toBe('demo-solar-lcoe-2024');
    expect(res.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/compare/demo/solar-lcoe-2024', expect.any(Object));
  });

  it('createComparison sends POST with structured body', async () => {
    const result = { id: 'c1', query: { metric: 'capex', technology: 'solar_pv', region: 'global' }, rows: [], scores: {}, metadata: {} };
    mockFetch.mockReturnValue(jsonResponse(result));
    const res = await createComparison({ metric: 'capex', technology: 'solar_pv', region: 'global' });
    expect(res.data?.id).toBe('c1');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ metric: 'capex', technology: 'solar_pv', region: 'global' });
  });

  it('handles 429 as typed error', async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: 'Rate limit exceeded', code: 'RATE_LIMITED' }, 429));
    const res = await createComparison({ metric: 'lcoe', technology: 'solar_pv', region: 'global' });
    expect(res.data).toBeNull();
    expect(res.error?.status).toBe(429);
    expect(res.error?.code).toBe('RATE_LIMITED');
  });

  it('handles network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const res = await getBillingStatus();
    expect(res.data).toBeNull();
    expect(res.error?.status).toBe(0);
    expect(res.error?.message).toBe('Network error');
  });

  it('exportComparison sends format and returns blob', async () => {
    mockFetch.mockReturnValue(jsonResponse({ data: 'csv-content' }));
    const res = await exportComparison('c1', 'csv');
    expect(res.data).toBeInstanceOf(Blob);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.format).toBe('csv');
  });

  it('createCheckout sends plan', async () => {
    mockFetch.mockReturnValue(jsonResponse({ checkoutUrl: 'https://checkout.example.com' }));
    const res = await createCheckout('pro');
    expect(res.data?.checkoutUrl).toBe('https://checkout.example.com');
  });

  it('trackEvent sends { event, properties } (not eventName)', async () => {
    mockFetch.mockReturnValue(jsonResponse({ accepted: true }));
    await trackEvent('demo_loaded', { source: 'landing' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.event).toBe('demo_loaded');
    expect(body.eventName).toBeUndefined();
    expect(body.properties.source).toBe('landing');
  });

  it('getSampleQueries returns { queries: [...] } shape', async () => {
    const resp = { queries: [{ label: 'Solar LCOE', query: { metric: 'lcoe', technology: 'solar_pv', region: 'global' }, category: 'solar' }] };
    mockFetch.mockReturnValue(jsonResponse(resp));
    const res = await getSampleQueries();
    expect(res.data?.queries).toHaveLength(1);
    expect(res.data?.queries[0].label).toBe('Solar LCOE');
  });

  it('getAdminFunnel passes days param', async () => {
    const resp = { days: 7, since: '2026-03-03', funnel: { '2026-03-10': { demo_loaded: 5 } } };
    mockFetch.mockReturnValue(jsonResponse(resp));
    const res = await getAdminFunnel(7);
    expect(mockFetch.mock.calls[0][0]).toBe('/api/admin/funnel?days=7');
    expect(res.data?.funnel).toBeDefined();
  });

  it('getBillingStatus returns { tier, limits } shape', async () => {
    const resp = { tier: 'free', limits: { comparisonsPerMonth: 5 } };
    mockFetch.mockReturnValue(jsonResponse(resp));
    const res = await getBillingStatus();
    expect(res.data?.tier).toBe('free');
    expect(res.data?.limits.comparisonsPerMonth).toBe(5);
  });

  it('getUserProfile returns user', async () => {
    const profile = { id: 'u1', email: 'a@b.com', role: 'user', tier: 'free' };
    mockFetch.mockReturnValue(jsonResponse(profile));
    const res = await getUserProfile();
    expect(res.data?.email).toBe('a@b.com');
  });

  it('handles 503 gracefully for billing', async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: 'Not configured' }, 503));
    const res = await createCheckout('pro');
    expect(res.data).toBeNull();
    expect(res.error?.status).toBe(503);
  });

  it('getUserProfile matches backend subscription.tier shape', async () => {
    const profile = {
      id: 'u1', email: 'a@b.com', displayName: 'Test', role: 'user',
      reputation: 10, subscription: { tier: 'pro', status: 'active' },
      questionCount: 5, createdAt: '2026-01-01T00:00:00Z',
    };
    mockFetch.mockReturnValue(jsonResponse(profile));
    const res = await getUserProfile();
    expect(res.data?.subscription.tier).toBe('pro');
    expect(res.data?.subscription.status).toBe('active');
    expect(res.data?.reputation).toBe(10);
  });
});

// ─── iOS Safari export fallback ──────────────────────────────────────────────

describe('iOS Safari export fallback', () => {
  const originalNavigator = global.navigator;
  const originalDocument = global.document;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
  });

  it('shouldUseDirectDownload returns true for iPhone UA', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
      writable: true,
    });
    expect(shouldUseDirectDownload()).toBe(true);
  });

  it('shouldUseDirectDownload returns true for iPad UA', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15' },
      writable: true,
    });
    expect(shouldUseDirectDownload()).toBe(true);
  });

  it('shouldUseDirectDownload returns false for Android Chrome', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36' },
      writable: true,
    });
    expect(shouldUseDirectDownload()).toBe(false);
  });

  it('shouldUseDirectDownload returns false for desktop Chrome', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0' },
      writable: true,
    });
    expect(shouldUseDirectDownload()).toBe(false);
  });

  it('exportComparisonDirect calls window.open with GET URL', () => {
    const mockOpen = vi.fn();
    global.window.open = mockOpen;
    exportComparisonDirect('c1', 'csv');
    expect(mockOpen).toHaveBeenCalledWith('/api/v1/compare/c1/export?format=csv', '_blank');
  });
});

// ─── Event duplication guard ────────────────────────────────────────────────
// These tests lock the policy that backend-owned events are NOT emitted from
// the frontend. If a future change adds a client-side trackEvent call for any
// of these, the test will catch it by scanning source files.

describe('No frontend duplication of backend-owned events', () => {
  const BACKEND_OWNED = ['demo_loaded', 'comparison_started', 'comparison_succeeded', 'export_clicked', 'upgrade_clicked', 'quota_hit'];
  const fs = require('fs');
  const path = require('path');

  // Scan all non-test source files for trackEvent/track calls with backend-owned event names
  function scanDir(dir: string): string[] {
    const hits: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== '__tests__' && entry.name !== 'node_modules') {
        hits.push(...scanDir(full));
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')) {
        const content = fs.readFileSync(full, 'utf-8');
        for (const evt of BACKEND_OWNED) {
          // Match track('event') or trackEvent('event') or trackOnce('event')
          const pattern = new RegExp(`(?:track|trackEvent|trackOnce)\\s*\\(\\s*['"\`]${evt}['"\`]`);
          if (pattern.test(content)) {
            hits.push(`${path.relative(dir, full)} emits "${evt}"`);
          }
        }
      }
    }
    return hits;
  }

  it('no source file emits backend-owned events', () => {
    const srcDir = path.resolve(__dirname, '..');
    const violations = scanDir(srcDir);
    expect(violations).toEqual([]);
  });
});
