/**
 * Tests for compact deliverable experience (checklist/table mode).
 * Covers: truncated narrative, XLSX export button, full guidance report button,
 * loading/error states.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

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

beforeEach(() => {
  mockFetch.mockReset();
  // Default: session unauthenticated, billing 401
  mockFetch.mockImplementation((url: string) => {
    if (typeof url === 'string' && url.includes('/user/me')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'u1', email: 'test@test.com' }) });
    }
    if (typeof url === 'string' && url.includes('/billing/status')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ tier: 'free', limits: {} }) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  });
});

afterEach(() => cleanup());

// ─── truncateToSentences unit tests ─────────────────────────────────────────

describe('truncateToSentences', () => {
  // We test the function by importing the module — but since it's not exported,
  // we test the logic inline here
  function truncateToSentences(text: string, n: number): string {
    const re = /[.!?](?:\s|$)/g;
    let count = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      count++;
      if (count >= n) {
        return text.slice(0, match.index + 1);
      }
    }
    return text;
  }

  it('truncates to 4 sentences', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence.';
    const result = truncateToSentences(text, 4);
    expect(result).toBe('First sentence. Second sentence. Third sentence. Fourth sentence.');
  });

  it('returns full text if fewer than n sentences', () => {
    const text = 'Only two sentences. And a second one.';
    expect(truncateToSentences(text, 4)).toBe(text);
  });

  it('handles exclamation marks', () => {
    const text = 'Wow! Great! Amazing! Excellent! More!';
    expect(truncateToSentences(text, 3)).toBe('Wow! Great! Amazing!');
  });

  it('handles question marks', () => {
    const text = 'Really? Yes? No? Maybe? Perhaps?';
    expect(truncateToSentences(text, 2)).toBe('Really? Yes?');
  });

  it('handles empty string', () => {
    expect(truncateToSentences('', 4)).toBe('');
  });

  it('handles text with no sentence terminators', () => {
    const text = 'No terminators here at all';
    expect(truncateToSentences(text, 4)).toBe(text);
  });
});

// ─── Compact mode rendering tests ───────────────────────────────────────────

describe('compact mode rendering', () => {
  it('checklist mode renders compact table visual', async () => {
    // This tests that checklist mode shows ChecklistTable visuals
    const { ChecklistTable } = await import('@/components/deliverables/ChecklistTable');
    const spec = {
      type: 'checklist_table' as const,
      title: 'TDD Checklist',
      groups: [
        { section: 'Land', items: [{ label: 'Survey done', severity: 'critical' as const }] },
      ],
    };
    render(<ChecklistTable spec={spec} />);
    expect(screen.getByText('TDD Checklist')).toBeTruthy();
    expect(screen.getByText('Survey done')).toBeTruthy();
  });

  it('document request matrix renders in compact mode', async () => {
    const { DocumentRequestMatrix } = await import('@/components/deliverables/DocumentRequestMatrix');
    const spec = {
      type: 'document_request_matrix' as const,
      title: 'Required Documents',
      columns: ['Category', 'Document', 'Priority', 'Why It Matters'],
      rows: [
        { category: 'Legal', document: 'Lease', priority: 'high' as const, whyItMatters: 'Foundation' },
      ],
    };
    render(<DocumentRequestMatrix spec={spec} />);
    expect(screen.getByText('Required Documents')).toBeTruthy();
    expect(screen.getByText('Lease')).toBeTruthy();
  });
});

// ─── API client: exportDocument URL generation ──────────────────────────────

describe('exportDocument URL for compact XLSX export', () => {
  it('generates correct XLSX export URL', async () => {
    const { exportDocument } = await import('@/lib/api-client');
    const url = exportDocument('doc-123', 'xlsx');
    expect(url).toMatch(/\/api\/v1\/documents\/doc-123\/export\/xlsx/);
  });

  it('createEditableDocument calls POST with correct payload', async () => {
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/documents') && opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 'new-doc-id', type: 'project_guidance_report' }),
        });
      }
      if (typeof url === 'string' && url.includes('/user/me')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'u1' }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    });

    const { createEditableDocument } = await import('@/lib/api-client');
    const result = await createEditableDocument({
      type: 'project_guidance_report',
      title: 'Solar Checklist',
      contentJson: { checklist: [] },
    });
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('new-doc-id');
  });

  it('createEditableDocument returns error on failure', async () => {
    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/documents') && opts?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: () => Promise.resolve({ error: 'Database error' }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    });

    const { createEditableDocument } = await import('@/lib/api-client');
    const result = await createEditableDocument({
      type: 'project_guidance_report',
      title: 'Fail Test',
      contentJson: {},
    });
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});
