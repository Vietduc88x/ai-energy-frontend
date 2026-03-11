'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { streamChat, saveExportReport, createEditableDocument, exportDocument as exportDocumentUrl, type ChatMessage, type ChatMeta, type ChatQuotaError, type DocumentType } from '@/lib/api-client';
import { PolicyAnswer } from '@/components/PolicyAnswer';
import { ProjectGuidanceCard } from '@/components/ProjectGuidancePack';
import { QuotaModal } from '@/components/quota-modal';
import { BenchmarkChart } from '@/components/deliverables/BenchmarkChart';
import { PolicyTimeline } from '@/components/deliverables/PolicyTimeline';
import { ChecklistTable } from '@/components/deliverables/ChecklistTable';
import { DocumentRequestMatrix } from '@/components/deliverables/DocumentRequestMatrix';
import { RiskMatrix } from '@/components/deliverables/RiskMatrix';
import { ProjectTimeline } from '@/components/deliverables/ProjectTimeline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: ChatMeta;
  loading?: boolean;
}

const SAMPLE_SECTIONS = [
  {
    label: 'Cost Benchmarks',
    color: 'emerald' as const,
    questions: [
      { text: 'What is the LCOE of solar PV in 2024?' },
      { text: 'Compare CAPEX for onshore vs offshore wind' },
      { text: 'Battery storage cost trends 2020-2024' },
      { text: 'Green hydrogen production cost by region' },
    ],
  },
  {
    label: 'Policy & Regulation',
    color: 'blue' as const,
    questions: [
      { text: 'Current solar incentives in India' },
      { text: 'EU renewable energy targets for 2030' },
      { text: 'Permitting timeline for wind in Australia' },
      { text: 'US IRA tax credits for clean energy' },
    ],
  },
  {
    label: 'Project Guidelines',
    color: 'amber' as const,
    questions: [
      { text: 'TDD checklist for solar PV feasibility' },
      { text: 'EPC contract review questions' },
      { text: 'Risk register for hybrid PV + BESS' },
      { text: 'Document request list for procurement' },
    ],
  },
];

const SECTION_COLORS = {
  emerald: { label: 'text-emerald-600', dot: 'bg-emerald-400', hover: 'hover:border-emerald-300 hover:bg-emerald-50/60' },
  blue: { label: 'text-blue-600', dot: 'bg-blue-400', hover: 'hover:border-blue-300 hover:bg-blue-50/60' },
  amber: { label: 'text-amber-600', dot: 'bg-amber-400', hover: 'hover:border-amber-300 hover:bg-amber-50/60' },
};

function ComparePageContent() {
  const session = useSession();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const prefillConsumed = useRef(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<ChatQuotaError | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    // Gate: require auth before sending
    if (!session.user) {
      setInput(trimmed);
      setShowAuthPrompt(true);
      return;
    }

    setShowAuthPrompt(false);
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    const history: ChatMessage[] = messages.map(m => ({ role: m.role, content: m.content }));

    const controller = streamChat(trimmed, history, {
      onMeta: (meta) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, meta } : m
        ));
      },
      onToken: (token) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: m.content + token, loading: false } : m
        ));
      },
      onDone: () => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, loading: false } : m
        ));
        setStreaming(false);
        textareaRef.current?.focus();
      },
      onQuotaExceeded: (info) => {
        setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
        setQuotaInfo(info);
        setStreaming(false);
      },
      onError: (errMsg) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: `Error: ${errMsg}`, loading: false } : m
        ));
        setStreaming(false);
      },
    });

    controllerRef.current = controller;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (streaming) {
      controllerRef.current?.abort();
      setStreaming(false);
    }
    setMessages([]);
  };

  // Auto-send prefilled query from ?q= search param (e.g. from landing page example queries)
  useEffect(() => {
    if (prefillConsumed.current) return;
    if (session.loading) return;
    const q = searchParams.get('q');
    if (q && q.trim()) {
      prefillConsumed.current = true;
      window.history.replaceState({}, '', '/compare');
      if (session.user) {
        sendMessage(q.trim());
      } else {
        // Prefill input and show auth prompt for unauth users
        setInput(q.trim());
        setShowAuthPrompt(true);
      }
    }
  }, [session.loading, session.user, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Welcome screen ── */
            <div className="flex flex-col items-center justify-center h-full px-4 py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">AI Energy Analyst</h1>
              <p className="text-gray-500 mb-6 max-w-md text-sm text-center">
                Compare costs, track policies, and generate project checklists
                — powered by IRENA, Lazard, BNEF, EIA, NREL &amp; IFC.
              </p>
              <div className="max-w-2xl w-full space-y-5">
                {SAMPLE_SECTIONS.map((section) => {
                  const sc = SECTION_COLORS[section.color];
                  return (
                    <div key={section.label}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${sc.label}`}>{section.label}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.questions.map((q) => (
                          <button
                            key={q.text}
                            onClick={() => sendMessage(q.text)}
                            className={`group text-left text-sm px-4 py-3 rounded-xl border border-gray-200 text-gray-700 transition-all duration-150 hover:shadow-sm ${sc.hover}`}
                          >
                            {q.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Chat messages ── */
            <div className="max-w-3xl mx-auto pt-4 pb-4 px-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 mb-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* Assistant avatar */}
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-100'
                    }`}
                  >
                    {msg.loading && !msg.content ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <AssistantMessage content={msg.content} meta={msg.meta} />
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div className="bg-gradient-to-t from-white via-white to-white/80 px-4 pt-3 pb-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  title="New chat"
                  className="flex-shrink-0 w-11 h-11 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <div className="flex-1 relative">
                <div className="flex items-end rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:shadow-md focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
                  <div className="pl-4 pb-3 pt-3 flex items-center">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about energy costs, technologies, markets..."
                    rows={1}
                    className="flex-1 px-3 py-3 pr-2 text-sm bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                    disabled={streaming}
                    autoFocus
                  />
                  <div className="pr-2 pb-2 flex items-end">
                    <button
                      type="submit"
                      disabled={streaming || !input.trim()}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        streaming || !input.trim()
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow'
                      }`}
                    >
                      {streaming ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2.5">
              Press Enter to send &middot; Shift+Enter for new line
            </p>
          </form>

          {/* Auth prompt — shown when unauth user tries to send */}
          {showAuthPrompt && (
            <div className="max-w-3xl mx-auto mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Sign in to ask your question</p>
                <p className="text-xs text-emerald-600 mt-0.5">Free account — no credit card required. Your question will be sent automatically after sign-in.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/auth/signin?returnTo=${encodeURIComponent(`/compare?q=${encodeURIComponent(input)}`)}`}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="px-3 py-2 rounded-lg text-emerald-600 hover:bg-emerald-100 text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {quotaInfo && (
            <QuotaModal
              tier={quotaInfo.tier}
              limit={quotaInfo.limit}
              onClose={() => setQuotaInfo(null)}
            />
          )}
        </div>
      </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="skeleton w-64 h-8" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Truncate text to roughly `n` sentences, preserving whole sentences. */
function truncateToSentences(text: string, n: number): string {
  // Match sentence-ending punctuation followed by whitespace or end-of-string
  const re = /[.!?](?:\s|$)/g;
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    count++;
    if (count >= n) {
      return text.slice(0, match.index + 1);
    }
  }
  // Fewer than n sentences — return full text
  return text;
}

// ─── Markdown-lite renderer for assistant messages ──────────────────────────

function AssistantMessage({ content, meta }: { content: string; meta?: ChatMeta }) {
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [xlsxLoading, setXlsxLoading] = useState(false);

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const Tag = listType;
        elements.push(
          <Tag key={`list-${elements.length}`} className={listType === 'ul' ? 'list-disc pl-5 space-y-1 my-2' : 'list-decimal pl-5 space-y-1 my-2'}>
            {listItems}
          </Tag>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      if (line.match(/^[-*•]\s/)) {
        if (listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(
          <li key={i} dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*•]\s/, '') }} />
        );
        return;
      }

      if (line.match(/^\d+\.\s/)) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(
          <li key={i} dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, '') }} />
        );
        return;
      }

      flushList();

      if (line.startsWith('### ')) {
        elements.push(<h4 key={i} className="font-semibold mt-3 mb-1 text-gray-900">{line.replace('### ', '')}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={i} className="font-bold mt-3 mb-1 text-gray-900">{line.replace('## ', '')}</h3>);
      } else if (!line.trim()) {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />);
      }
    });

    flushList();
    return elements;
  };

  const editReport = async (type: 'policy' | 'guidance' | 'benchmark', data: unknown) => {
    const reportData = data as Record<string, unknown>;
    const docTypeMap: Record<string, DocumentType> = {
      policy: 'policy_report',
      guidance: 'project_guidance_report',
      benchmark: 'benchmark_report',
    };
    const title = String(reportData.topic ?? reportData.summary ?? type).slice(0, 200);

    const { data: created, error } = await createEditableDocument({
      type: docTypeMap[type],
      title,
      contentJson: { ...reportData, title },
    });

    if (created?.id) {
      window.open(`/documents/edit?id=${created.id}`, '_blank');
    }
  };

  const openReport = async (type: 'policy' | 'guidance' | 'benchmark', data: unknown) => {
    const reportData = data as Record<string, unknown>;
    const sourceObjectTypeMap = { policy: 'policy_brief', guidance: 'project_guidance_pack', benchmark: 'benchmark_brief' };
    const reportTypeMap = { policy: 'policy_report', guidance: 'project_guidance_report', benchmark: 'benchmark_report' };

    setReportLoading(true);
    setReportError(null);

    try {
      const { data: saved, error } = await saveExportReport({
        reportType: reportTypeMap[type],
        sourceObjectType: sourceObjectTypeMap[type],
        title: (reportData.topic ?? reportData.summary ?? type) as string,
        report: reportData,
      });

      if (saved?.id) {
        window.open(`/reports/${type}?id=${saved.id}`, '_blank');
      } else {
        setReportError(error?.message ?? 'Failed to save report');
      }
    } catch (err: any) {
      setReportError(err?.message ?? 'Failed to create report');
    } finally {
      setReportLoading(false);
    }
  };

  const exportXlsx = async (data: unknown) => {
    setXlsxLoading(true);
    setReportError(null);
    try {
      const reportData = data as Record<string, unknown>;
      const title = String(reportData.topic ?? reportData.summary ?? 'guidance').slice(0, 200);
      const { data: created, error } = await createEditableDocument({
        type: 'project_guidance_report',
        title,
        contentJson: { ...reportData, title },
      });
      if (created?.id) {
        // Trigger XLSX download
        const url = exportDocumentUrl(created.id, 'xlsx');
        window.open(url, '_blank');
      } else {
        setReportError(error?.message ?? 'Failed to export');
      }
    } catch (err: any) {
      setReportError(err?.message ?? 'Export failed');
    } finally {
      setXlsxLoading(false);
    }
  };

  const mode = meta?.deliverableMode ?? 'report'; // fallback to report (full) for old responses
  const showProductCards = mode === 'report' || mode === 'brief';
  const isCompactMode = mode === 'checklist' || mode === 'table';

  // In compact mode, truncate narrative to first ~3 sentences
  const displayContent = isCompactMode && content.length > 0
    ? truncateToSentences(content, 4)
    : content;

  return (
    <div>
      {/* Structured policy briefing card — only in report/brief modes */}
      {showProductCards && meta?.policyAnswer && (
        <div className="mb-3">
          <PolicyAnswer data={meta.policyAnswer} />
        </div>
      )}

      {/* Structured guidance pack — only in report/brief modes */}
      {showProductCards && meta?.guidancePack && (
        <div className="mb-3">
          <ProjectGuidanceCard data={meta.guidancePack} />
        </div>
      )}

      {/* Visual deliverables — rendered from structured specs */}
      {meta?.visuals && meta.visuals.length > 0 && (
        <div className="mb-3 space-y-3">
          {meta.visuals.map((v) => {
            const s = v.spec as any;
            switch (v.visualType) {
              case 'benchmark_chart': return <BenchmarkChart key={v.id} spec={s} />;
              case 'policy_timeline': return <PolicyTimeline key={v.id} spec={s} />;
              case 'checklist_table': return <ChecklistTable key={v.id} spec={s} />;
              case 'document_request_matrix': return <DocumentRequestMatrix key={v.id} spec={s} />;
              case 'risk_matrix': return <RiskMatrix key={v.id} spec={s} />;
              case 'project_timeline': return <ProjectTimeline key={v.id} spec={s} />;
              default: return null;
            }
          })}
        </div>
      )}

      {/* Narrative content from LLM — truncated in compact modes */}
      <div className="space-y-0.5">{renderContent(displayContent)}</div>

      {/* Error message for report/export actions */}
      {reportError && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {reportError}
        </div>
      )}

      {/* Compact mode action bar — XLSX export + full report request */}
      {isCompactMode && meta?.guidancePack && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => exportXlsx(meta.guidancePack)}
            disabled={xlsxLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors print:hidden disabled:opacity-60"
          >
            {xlsxLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Export XLSX
          </button>
          <button
            onClick={() => openReport('guidance', meta.guidancePack)}
            disabled={reportLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors print:hidden disabled:opacity-60"
          >
            {reportLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Open Full Guidance Report
          </button>
        </div>
      )}

      {/* Full mode action bar — report export + edit buttons */}
      {!isCompactMode && (meta?.policyAnswer || meta?.guidancePack || meta?.hasPolicyData || meta?.hasGuidanceData) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(meta?.policyAnswer || meta?.hasPolicyData) && (
            <button
              onClick={() => meta?.policyAnswer && openReport('policy', meta.policyAnswer)}
              disabled={!meta?.policyAnswer || reportLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
              title={!meta?.policyAnswer ? 'Ask for a "full report" to generate the exportable version' : undefined}
            >
              {reportLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Open Policy Report
            </button>
          )}
          {meta?.guidancePack && (
            <button
              onClick={() => openReport('guidance', meta.guidancePack)}
              disabled={reportLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors print:hidden disabled:opacity-60"
            >
              {reportLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Open Guidance Report
            </button>
          )}
          {/* Edit buttons — create editable draft */}
          {meta?.policyAnswer && (
            <button
              onClick={() => editReport('policy', meta.policyAnswer)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Policy Brief
            </button>
          )}
          {meta?.guidancePack && (
            <button
              onClick={() => editReport('guidance', meta.guidancePack)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Guidance Pack
            </button>
          )}
        </div>
      )}

      {/* Footer: data points used */}
      {meta && meta.factsUsed > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {meta.factsUsed} data points used
          {meta.technologies.length > 0 && (
            <span className="text-gray-300 ml-1">
              &middot; {meta.technologies.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
