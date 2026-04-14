'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FindingResult {
  controlCode: string;
  result: string;
  severity: string;
  recommendation: string | null;
}

interface SectionResult {
  id: string;
  label: string;
  findings: FindingResult[];
}

interface AssessResult {
  runId: string;
  framework: string;
  summary: { total: number; passed: number; failed: number; warnings: number; score: number };
  sections: SectionResult[];
}

type MessageKind = 'text' | 'result';

interface Message {
  role: 'user' | 'assistant';
  kind: MessageKind;
  content: string;
  result?: AssessResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EPC_KEYWORDS = [
  'ntp', 'liquidated damages', 'fidic', 'contractor', 'employer',
  'variation', 'time for completion', 'performance bond', 'clause',
  'sub-clause', 'retention', 'advance payment', 'taking-over',
  'defects notification', 'force majeure', 'epc',
];

const TDD_KEYWORDS = [
  'p50', 'p90', 'performance ratio', 'yield', 'inverter', 'module',
  'scada', 'iec 61724', 'capacity factor', 'megawatt', 'pv system',
  'irradiance', 'soiling', 'degradation', 'tdd', 'technical due diligence',
];

function detectFramework(text: string): 'epc' | 'tdd' {
  const lower = text.toLowerCase();
  const epcScore = EPC_KEYWORDS.filter(k => lower.includes(k)).length;
  const tddScore = TDD_KEYWORDS.filter(k => lower.includes(k)).length;
  return epcScore >= tddScore ? 'epc' : 'tdd';
}

function isDocument(text: string): boolean {
  return text.trim().length > 300;
}

const SEVERITY_BAR: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-50',
  high:     'border-l-orange-400 bg-orange-50',
  medium:   'border-l-amber-400 bg-amber-50',
  low:      'border-l-blue-400 bg-blue-50',
  info:     'border-l-gray-300',
};

const RESULT_BADGE: Record<string, string> = {
  pass:               'bg-emerald-100 text-emerald-700',
  fail:               'bg-red-100 text-red-700',
  warning:            'bg-amber-100 text-amber-700',
  not_applicable:     'bg-gray-100 text-gray-500',
  insufficient_data:  'bg-gray-100 text-gray-500',
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-blue-100 text-blue-700',
  info:     'bg-gray-100 text-gray-500',
};

function markdownToHtml(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-gray-900 mt-4 mb-1">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-gray-800 mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/^(?!<[hul]|<\/[hul])(.+)$/gm, '<p class="mb-2">$1</p>');
}

const SUGGESTIONS = [
  { label: 'EPC clause check', text: 'Paste an EPC contract clause to review for FIDIC compliance, LD caps, and risk allocation.' },
  { label: 'TDD section review', text: 'Paste a TDD section to evaluate against IEC standards and performance benchmarks.' },
  { label: 'Good faith question', text: 'Explain the good faith obligation under FIDIC Sub-Clause 1.14 and when it applies to NTP.' },
  { label: 'NTP conditions', text: 'What conditions must be satisfied before NTP can be validly issued under a FIDIC Yellow Book contract?' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultCard({ result }: { result: AssessResult }) {
  const score = result.summary.score;
  const scoreColor = score >= 0.8 ? 'text-emerald-600' : score >= 0.6 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden max-w-[85%]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {result.framework.toUpperCase()} Assessment
        </span>
        <span className={`text-sm font-bold ${scoreColor}`}>
          {(score * 100).toFixed(0)}%
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: 'Total',    value: result.summary.total,    color: 'text-gray-900' },
          { label: 'Passed',   value: result.summary.passed,   color: 'text-emerald-600' },
          { label: 'Failed',   value: result.summary.failed,   color: 'text-red-600' },
          { label: 'Warnings', value: result.summary.warnings, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="px-3 py-2.5 text-center">
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Findings */}
      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
        {result.sections.flatMap(section =>
          section.findings.map(f => (
            <div key={f.controlCode} className={`px-4 py-2.5 border-l-4 ${SEVERITY_BAR[f.severity] ?? ''}`}>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {f.controlCode}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RESULT_BADGE[f.result] ?? 'bg-gray-100 text-gray-600'}`}>
                  {f.result}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_BADGE[f.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                  {f.severity}
                </span>
              </div>
              {f.recommendation && (
                <p className="text-xs text-gray-600 leading-relaxed">{f.recommendation}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">Ask a follow-up question or paste another document.</p>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  if (msg.kind === 'result' && msg.result) {
    return (
      <div className="flex gap-3 mb-4 justify-start">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
          AI
        </div>
        <ResultCard result={msg.result} />
      </div>
    );
  }
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
          AI
        </div>
      )}
      <div className={[
        'max-w-[70%] rounded-2xl px-4 py-3 text-sm',
        isUser
          ? 'bg-emerald-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm',
      ].join(' ')}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }} />
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function AssessInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function submit(text: string) {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    if (isDocument(text)) {
      // Run assessment
      const framework = detectFramework(text);
      const preview = text.length > 120 ? text.slice(0, 120) + '…' : text;
      setMessages(prev => [...prev, { role: 'user', kind: 'text', content: preview }]);
      try {
        const res = await fetch('/api/v1/assess', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            framework,
            documents: [{ title: 'Pasted content', content: text }],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        setMessages(prev => [...prev, { role: 'assistant', kind: 'result', content: '', result: data }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant', kind: 'text',
          content: `Assessment failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        }]);
      }
    } else {
      // Chat
      setMessages(prev => [...prev, { role: 'user', kind: 'text', content: text }]);
      try {
        const res = await fetch('/api/v1/chat', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.filter(m => m.kind === 'text').map(m => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        setMessages(prev => [...prev, {
          role: 'assistant', kind: 'text',
          content: data.answer ?? data.message ?? 'No response.',
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant', kind: 'text',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        }]);
      }
    }

    setLoading(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }

  const inputIsDoc = isDocument(input);
  const detectedFw = input.length > 50 ? detectFramework(input) : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Technical Assessment</h1>
          <p className="text-xs text-gray-400">Paste a contract clause or TDD section — framework auto-detected</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-gray-400 hover:text-gray-600">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="text-4xl">📋</div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Paste any contract or TDD content</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Auto-detects EPC vs TDD and runs the assessment instantly.
                Short questions are answered as chat.
              </p>
            </div>
            <div className="grid gap-2 w-full max-w-md mt-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => setInput(s.text)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{s.label}</span>
                  <span className="text-gray-300 mx-1">·</span>
                  <span>{s.text.length > 60 ? s.text.slice(0, 60) + '…' : s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  AI
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {inputIsDoc ? 'Running assessment…' : 'Thinking…'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        {detectedFw && input.length > 50 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Detected:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              detectedFw === 'epc' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {detectedFw === 'epc' ? '📝 EPC Contract Review' : '📋 Technical Due Diligence'}
            </span>
            {inputIsDoc && <span className="text-xs text-gray-400">· will run assessment</span>}
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); submit(input); }} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); }
            }}
            placeholder={
              messages.some(m => m.kind === 'result')
                ? 'Ask a follow-up or paste another document…'
                : 'Paste a clause, TDD section, or ask a question… (Enter to send)'
            }
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            style={{ overflow: 'hidden', minHeight: '52px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="self-end px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            {inputIsDoc ? 'Assess' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5">
          {inputIsDoc ? 'Long content — full assessment will run. Shift+Enter for new line.' : 'Short input — chat mode. Paste 300+ chars to trigger assessment.'}
        </p>
      </div>
    </div>
  );
}

export default function AssessPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <AssessInner />
    </ProtectedRoute>
  );
}
