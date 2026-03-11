/**
 * Typed API client — all backend calls go through here.
 *
 * Uses Next.js rewrite proxy (/api/* → backend), so no CORS issues in dev.
 * Every method returns { data, error } — never throws.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ApiResult<T> {
  data: T | null;
  error: { message: string; code?: string; status: number } | null;
}

export interface BillingStatus {
  tier: 'free' | 'pro' | 'team';
  limits: {
    comparisonsPerMonth: number | 'unlimited';
  };
}

export interface CompareRequest {
  metric: 'lcoe' | 'capex' | 'opex' | 'capacity_factor' | 'generation' | 'capacity' | 'irr' | 'curtailment' | 'auction_price';
  technology: string;
  region: string;
  year?: number;
  sources?: string[];
  currency?: 'USD';
  include_methodology?: boolean;
}

export interface ComparisonRow {
  source: string;
  value_min: number | null;
  value_max: number | null;
  value_point: number | null;
  unit: string;
  year: number | null;
  methodology_summary: string | null;
  assumptions: Record<string, unknown>[] | null;
  confidence: number | null;
}

export interface ComparisonResult {
  id: string;
  query: { metric: string; technology: string; region: string; year: number | null };
  normalization: { currency: string; priceYear: number; deflatorSource: string; targetUnit: string; warnings?: string[] };
  rows: ComparisonRow[];
  deltas: Array<{ type: string; description: string; severity: string; affected_sources: string[] }>;
  scores: { coverage: number; conflict: number; missing_sources: Array<{ source: string; reason: string }>; sources_used: string[] };
  metadata: { row_count: number; latency_ms: number; created_at: string; demo?: boolean };
}

export interface SampleQueryEntry {
  label: string;
  query: CompareRequest;
  category: string;
}

export interface SampleQueriesResponse {
  queries: SampleQueryEntry[];
}

export interface FunnelResponse {
  days: number;
  since: string;
  funnel: Record<string, Record<string, number>>;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  reputation: number;
  subscription: { tier: string; status: string };
  questionCount: number;
  createdAt: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        data: null,
        error: {
          message: body.error || res.statusText,
          code: body.code,
          status: res.status,
        },
      };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, status: 0 },
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Detect environments where Blob + a.download is unreliable (iOS Safari).
 * Returns true when the export should use a direct GET navigation instead.
 */
export function shouldUseDirectDownload(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iOS Safari, Chrome on iOS, Firefox on iOS — all use WebKit and lack a.download support
  return /iP(hone|ad|od)/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
}

// ─── API Methods ────────────────────────────────────────────────────────────

/** Public demo comparison (no auth) */
export function getDemoComparison() {
  return apiFetch<ComparisonResult>('/api/v1/compare/demo/solar-lcoe-2024');
}

/** Run a comparison (auth required) */
export function createComparison(body: CompareRequest) {
  return apiFetch<ComparisonResult>('/api/v1/compare', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Export comparison via POST fetch — returns Blob for programmatic download */
export async function exportComparison(id: string, format: 'csv' | 'json'): Promise<ApiResult<Blob>> {
  try {
    const res = await fetch(`/api/v1/compare/${id}/export`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: { message: body.error || res.statusText, code: body.code, status: res.status } };
    }
    const blob = await res.blob();
    return { data: blob, error: null };
  } catch (err) {
    return { data: null, error: { message: (err as Error).message, status: 0 } };
  }
}

/**
 * Export via GET navigation — opens a new window/tab that triggers Content-Disposition download.
 * Used on iOS Safari where Blob + a.download is unreliable.
 * Backend emits export_clicked on the GET route — no frontend tracking needed.
 */
export function exportComparisonDirect(id: string, format: 'csv' | 'json'): void {
  window.open(`/api/v1/compare/${id}/export?format=${format}`, '_blank');
}

/** Current billing/subscription status */
export function getBillingStatus() {
  return apiFetch<BillingStatus>('/api/v1/billing/status');
}

/** Create LemonSqueezy checkout */
export function createCheckout(plan: 'pro' | 'team') {
  return apiFetch<CheckoutResponse>('/api/v1/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

/**
 * Track a frontend analytics event.
 * Backend expects: { event: string, sessionId?: string, properties?: Record }
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  return apiFetch<{ accepted: boolean }>('/api/v1/events', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  });
}

/** Sample queries for first-session UX */
export function getSampleQueries() {
  return apiFetch<SampleQueriesResponse>('/api/v1/events/sample-queries');
}

/** Admin funnel data */
export function getAdminFunnel(days: number = 30) {
  return apiFetch<FunnelResponse>(`/api/admin/funnel?days=${days}`);
}

/** Current user profile */
export function getUserProfile() {
  return apiFetch<UserProfile>('/api/v1/user/me');
}

// ─── Chat API (SSE streaming) ────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PolicyAnswerEnvelope {
  topic: string;
  jurisdiction: string;
  technology?: string | null;
  lastChecked: string;
  confidence: 'high' | 'medium' | 'low';
  currentStatus: { summary: string; statusLabels: string[] };
  whatChanged: Array<{ title: string; detail: string; effectiveDate?: string | null }>;
  howItWorksNow: Array<{ pathway: string; description: string; appliesTo?: string[] | null }>;
  keyDates: Array<{ label: string; date: string; significance: string }>;
  whoIsAffected: Array<{ actor: string; impact: string }>;
  practicalImplications: string[];
  whatToCheckNext: string[];
  sources: Array<{ id?: string | null; source: string; title: string; date?: string | null; url?: string | null }>;
  caveat?: string | null;
}

export interface ChatMeta {
  factsUsed: number;
  technologies: string[];
  regions: string[];
  metrics: string[];
  policyAnswer?: PolicyAnswerEnvelope;
}

/**
 * Send a chat message and receive a streaming SSE response.
 * Returns an object with callbacks for tokens, meta, done, and error events.
 */
export function streamChat(
  message: string,
  history: ChatMessage[],
  callbacks: {
    onMeta?: (meta: ChatMeta) => void;
    onToken?: (token: string) => void;
    onDone?: (latencyMs: number) => void;
    onError?: (message: string) => void;
  },
): AbortController {
  const controller = new AbortController();

  fetch('/api/v1/chat', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        callbacks.onError?.(body.error || `Request failed (${res.status})`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        callbacks.onError?.('No response stream');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'meta':
                callbacks.onMeta?.(data);
                break;
              case 'token':
                callbacks.onToken?.(data.token);
                break;
              case 'done':
                callbacks.onDone?.(data.latencyMs);
                break;
              case 'error':
                callbacks.onError?.(data.message);
                break;
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.(err.message || 'Network error');
      }
    });

  return controller;
}
