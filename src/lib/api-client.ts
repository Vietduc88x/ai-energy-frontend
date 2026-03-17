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

// ─── Export Reports API ──────────────────────────────────────────────────────

export interface SaveReportRequest {
  reportType: string;
  sourceObjectType: string;
  sourceObjectId?: string | null;
  title: string;
  subtitle?: string | null;
  report: Record<string, unknown>;
}

export interface SaveReportResponse {
  id: string;
}

export interface ReportMetadata {
  title?: string;
  deliverableType?: string;
  deliverableFamily?: string;
  generatedAt?: string;
  context?: Record<string, unknown>;
  version?: string;
  confidence?: 'high' | 'medium' | 'low' | null;
  lastChecked?: string | null;
  sourceCount?: number | null;
  citations?: Array<{ source: string; title: string; url?: string | null }>;
  caveat?: string | null;
}

export interface ExportReportResponse {
  id: string;
  reportType: string;
  sourceObjectType: string;
  title: string;
  subtitle?: string | null;
  report: Record<string, unknown>;
  metadata?: ReportMetadata | null;
  createdAt: string;
}

/** Save a report snapshot for durable access */
export function saveExportReport(body: SaveReportRequest) {
  return apiFetch<SaveReportResponse>('/api/v1/export-reports', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Fetch a saved report by ID (public) */
export function getExportReport(id: string) {
  return apiFetch<ExportReportResponse>(`/api/v1/export-reports/${id}`);
}

// ─── Editable Documents API ──────────────────────────────────────────────────

export type DocumentType = 'benchmark_report' | 'policy_report' | 'project_guidance_report';

export interface EditableDocumentSummary {
  id: string;
  type: DocumentType;
  title: string;
  status: 'draft' | 'final';
  currentVersionNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditableDocument extends EditableDocumentSummary {
  contentJson: Record<string, unknown>;
}

export interface DocumentVersion {
  id: string;
  versionNo: number;
  createdAt: string;
}

export function createEditableDocument(body: { type: DocumentType; title: string; sourceExportReportId?: string; contentJson: Record<string, unknown> }) {
  return apiFetch<{ id: string; versionNo: number }>('/api/v1/documents', { method: 'POST', body: JSON.stringify(body) });
}

export function listEditableDocuments(params?: { type?: string; status?: string }) {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<{ documents: EditableDocumentSummary[] }>(`/api/v1/documents${qs}`);
}

export function getEditableDocument(id: string) {
  return apiFetch<EditableDocument>(`/api/v1/documents/${id}`);
}

export function saveEditableDocument(id: string, body: { title?: string; status?: string; contentJson: Record<string, unknown> }) {
  return apiFetch<{ id: string; versionNo: number }>(`/api/v1/documents/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function deleteEditableDocument(id: string) {
  return apiFetch<void>(`/api/v1/documents/${id}`, { method: 'DELETE' });
}

export function listDocumentVersions(id: string) {
  return apiFetch<{ versions: DocumentVersion[] }>(`/api/v1/documents/${id}/versions`);
}

export function getDocumentVersion(id: string, versionNo: number) {
  return apiFetch<{ id: string; versionNo: number; contentJson: Record<string, unknown>; createdAt: string }>(`/api/v1/documents/${id}/versions/${versionNo}`);
}

/** Fetch export file as blob and trigger browser download. */
export async function exportDocument(id: string, format: 'docx' | 'xlsx'): Promise<void> {
  const res = await fetch(`/api/v1/documents/${id}/export/${format}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? `export.${format}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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

export interface ProjectGuidancePack {
  id: string;
  type: 'project_guidance_pack';
  createdAt: string;
  projectType: string;
  technology: string[];
  stage: string;
  jurisdiction?: string | null;
  summary: string;
  stageGuidance: string[];
  checklist: Array<{ section: string; items: string[] }>;
  documentRequestList: Array<{
    category: string;
    documents: Array<{
      name: string;
      whyItMatters?: string | null;
      severity?: string | null;
      providedBy?: string | null;
      consequenceIfMissing?: string | null;
      gateBlocking?: boolean;
    }>;
  }>;
  epcReviewQuestions: Array<{ section: string; questions: string[] }>;
  riskStarter: Array<{
    risk: string;
    cause?: string | null;
    impact?: string | null;
    mitigation?: string | null;
    severity?: 'critical' | 'high' | 'medium' | 'low' | null;
  }>;
  executiveSummary?: {
    criticalItems: string[];
    topBlocker: string | null;
    topEvidenceNeed: string | null;
    topRisk: string | null;
  };
  sectionNames?: {
    criticalNow: string;
    evidenceRequired: string;
    workstreamReview: string;
    riskSection: string;
    documentSection: string;
    epcSection: string;
  };
  sectionJudgments?: Array<{
    section: string;
    judgment: string;
    mainConcern: string | null;
    criticalDependency: string | null;
    severityBreakdown: { critical: number; high: number; medium: number; low: number; total: number };
  }>;
  sourceCoverage: { guidelineCount: number; sourcesUsed: string[] };
  citations: Array<{
    source: string;
    title: string;
    section?: string | null;
    url?: string | null;
  }>;
  caveat?: string | null;
  reviewThemes?: Array<{ theme: string; items: string[]; priority: number }>;
  issueTimeline?: {
    resolvedSinceLast: string[];
    evidenceReceivedSinceLast: string[];
    stillBlocking: string[];
    mainBlockerNow: string | null;
    decisionStance: 'improved' | 'weakened' | 'unchanged' | 'still_conditional';
    stanceReason: string;
    openCriticalCount: number;
    resolvedCount: number;
  };
  workflowIssues?: Array<{
    id: string;
    title: string;
    description: string;
    category: 'blocker' | 'evidence_gap' | 'risk' | 'action_required' | 'advisory';
    severity: 'critical' | 'high' | 'medium' | 'low';
    workstream: string | null;
    gateBlocking: boolean;
    blocks: string | null;
    evidenceNeeded: string | null;
    evidenceProducer: string | null;
    consequenceIfIgnored: string | null;
    recommendedAction: string | null;
    actionOwner: string | null;
    sourceCount: number;
    state?: {
      status: 'open' | 'evidence_requested' | 'evidence_provided' | 'still_blocking' | 'mitigated' | 'resolved' | 'superseded';
      evidenceStatus: string | null;
      actionStatus: string | null;
      changeNote: string | null;
    };
  }>;
}

export interface VisualDeliverable {
  id: string;
  visualType: string;
  version: string;
  createdAt: string;
  sourceObjectType: string;
  sourceObjectId?: string | null;
  spec: Record<string, unknown>;
  citations?: Array<{ source: string; title: string; url?: string | null }>;
}

export type DeliverableMode = 'brief' | 'report' | 'checklist' | 'visual' | 'table';

export interface CopilotEvidenceItem {
  item: string;
  status: 'provided' | 'missing' | 'partial' | 'outdated';
  gateBlocking: boolean;
}

export interface CopilotPanel {
  visible: true;
  context: {
    projectContextId: string;
    label: string;
    workflowType: string;
    technology: string | null;
    technologies?: string[];
    jurisdiction: string | null;
    stage: string | null;
    contextAction: 'reused' | 'new' | 'explicit';
    confidence: number | null;
    turnCount: number;
  };
  progress: {
    planDone: number;
    planOpen: number;
    planBlocked: number;
    planDeferred: number;
    planTotal: number;
    nextActions: Array<{ actionId: string; action: string; priority: number; blocking: boolean }>;
  };
  evidence: {
    provided: number;
    missing: number;
    partial: number;
    outdated: number;
    total: number;
    gateBlockingMissing: CopilotEvidenceItem[];
    items: CopilotEvidenceItem[];
  };
  gates: Array<{
    gate: string;
    status: string;
    blockerCount: number;
    blockers: string[];
  }>;
  blockers: {
    activeCount: number;
    resolvedCount: number;
    items: Array<{
      blocker: string;
      blocks: string;
      severity: string;
      resolved: boolean;
    }>;
  };
  hasChanges: boolean;
  allPlanItems: Array<{
    actionId: string;
    action: string;
    status: 'open' | 'done' | 'blocked' | 'deferred';
    priority: number;
    blocking: boolean;
    workstream: string;
    dependsOn: string[];
    statusChangedAt: number;
  }>;
  recentChanges: Array<{
    type: 'plan' | 'evidence' | 'gate' | 'blocker';
    description: string;
    detail: string;
    turn: number;
  }>;
}

export interface ChatMeta {
  deliverableMode?: DeliverableMode;
  factsUsed: number;
  technologies: string[];
  regions: string[];
  metrics: string[];
  policyAnswer?: PolicyAnswerEnvelope;
  guidancePack?: ProjectGuidancePack;
  hasPolicyData?: boolean;
  hasGuidanceData?: boolean;
  visuals?: VisualDeliverable[];
  decisionBrief?: import('@/components/DecisionBrief').DecisionBriefData;
  decisionPacket?: DecisionPacketData;
  epcReviewMemo?: EpcReviewMemoData;
  copilotPanel?: CopilotPanel | { visible: false };
}

// ─── EPC Review Memo ─────────────────────────────────────────────────────────

export interface EpcReviewMemoData {
  recommendation: string;
  contractRisks: Array<{ title: string; judgment: string }>;
  requiredProofs: Array<{ label: string; owner?: string | null; gateBlocking?: boolean }>;
  priorityQuestions: string[];
  themeSummaries: Array<{ theme: string; judgment: string; keyChecks: string[] }>;
}

// ─── Decision Packet ─────────────────────────────────────────────────────────

export interface DecisionPacketData {
  stance: 'proceed' | 'proceed_conditionally' | 'hold' | 'insufficient_basis';
  confidence: 'high' | 'medium' | 'low';
  audience: string;
  headline: string;
  summaryLine: string;
  topReasons: string[];
  topBlockers: Array<{ title: string; severity: string; impact?: string | null }>;
  topNeeds: Array<{ type: 'evidence' | 'action'; label: string; owner?: string | null; gateBlocking?: boolean }>;
  nextGate?: string | null;
  supportingArtifacts: string[];
}

/**
 * Send a chat message and receive a streaming SSE response.
 * Returns an object with callbacks for tokens, meta, done, and error events.
 */
export interface ChatQuotaError {
  error: string;
  used: number;
  limit: number;
  tier: string;
}

export function streamChat(
  message: string,
  history: ChatMessage[],
  callbacks: {
    onMeta?: (meta: ChatMeta) => void;
    onToken?: (token: string) => void;
    onDone?: (latencyMs: number) => void;
    onError?: (message: string) => void;
    onQuotaExceeded?: (info: ChatQuotaError) => void;
  },
  options?: {
    projectContextId?: string;
    newProject?: boolean;
  },
): AbortController {
  const controller = new AbortController();

  fetch('/api/v1/chat', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-50),
      ...(options?.projectContextId && { projectContextId: options.projectContextId }),
      ...(options?.newProject && { newProject: true }),
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429 && body.limit && callbacks.onQuotaExceeded) {
          callbacks.onQuotaExceeded(body as ChatQuotaError);
          return;
        }
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

// ─── Copilot API ─────────────────────────────────────────────────────────────

export interface ContextSummary {
  id: string;
  label: string;
  workflowType: string;
  technology: string | null;
  jurisdiction: string | null;
  stage: string | null;
  turnCount: number;
  planDone: number;
  planTotal: number;
  evidenceProvided: number;
  evidenceTotal: number;
  activeBlockers: number;
  updatedAt: string;
  createdAt: string;
}

export type EvidenceStatus = 'provided' | 'missing' | 'partial' | 'outdated';
export type PlanItemStatus = 'open' | 'done' | 'blocked' | 'deferred';

/** List recent project contexts for context switching */
export function listContexts() {
  return apiFetch<{ contexts: ContextSummary[] }>('/api/v1/copilot/contexts');
}

/** Get copilot panel for a specific context (for replay/persistence) */
export function getCopilotPanel(contextId: string) {
  return apiFetch<{ panel: CopilotPanel | { visible: false } }>(`/api/v1/copilot/contexts/${contextId}/panel`);
}

/** Update evidence status on a project context */
export function updateEvidence(contextId: string, evidenceItem: string, status: EvidenceStatus, note?: string) {
  return apiFetch<{ panel: CopilotPanel | { visible: false }; changed: boolean }>('/api/v1/copilot/evidence', {
    method: 'POST',
    body: JSON.stringify({ contextId, evidenceItem, status, note }),
  });
}

/** Update plan item status on a project context */
export function updatePlanItem(contextId: string, actionId: string, status: PlanItemStatus) {
  return apiFetch<{ panel: CopilotPanel | { visible: false }; changed: boolean }>('/api/v1/copilot/plan', {
    method: 'POST',
    body: JSON.stringify({ contextId, actionId, status }),
  });
}
