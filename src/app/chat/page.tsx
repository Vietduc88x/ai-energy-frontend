'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';
import type { ChatMessage } from '@/lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What is the LCOE for utility-scale solar in Southeast Asia?',
  'Summarise key risks in a TDD for a 50 MW onshore wind project.',
  'What IEC standards apply to offshore wind turbine installation?',
  'Compare capacity factors: onshore wind vs solar PV in Vietnam.',
];

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

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
          AI
        </div>
      )}
      <div
        className={[
          'max-w-[70%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-emerald-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm',
        ].join(' ')}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }} />
        )}
      </div>
    </div>
  );
}

function ChatInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'ai' | 'private'>('ai');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          privacyMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? data.message ?? 'No response.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div>
          <h1 className="text-base font-semibold text-gray-900">AI Chat</h1>
          <p className="text-xs text-gray-400">Energy projects, standards, benchmarks</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['ai', 'private'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setPrivacyMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                privacyMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {mode === 'private' ? '🔒 Private' : 'AI Mode'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="text-5xl">💬</div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Start a conversation</p>
              <p className="text-sm text-gray-400 max-w-sm">Ask about LCOE, IEC standards, project risks, EPC clauses, policy.</p>
            </div>
            <div className="grid gap-2 w-full max-w-md mt-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
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
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask about LCOE, IEC standards, EPC risks… (Enter to send)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="self-end px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            Send
          </button>
        </form>
        {privacyMode === 'private' && (
          <p className="text-xs text-amber-600 mt-1.5">🔒 Private — structured data only, no AI inference.</p>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <ChatInner />
    </ProtectedRoute>
  );
}
