'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';
import { streamChat, type ChatMessage, type ChatMeta } from '@/lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: ChatMeta;
  loading?: boolean;
}

const SAMPLE_QUESTIONS = [
  { emoji: '☀️', text: 'What is the LCOE of solar PV in 2024?' },
  { emoji: '🌊', text: 'How much does offshore wind cost in Europe?' },
  { emoji: '⚡', text: 'Compare solar vs wind costs globally' },
  { emoji: '🔋', text: 'Battery storage cost trends' },
  { emoji: '⚛️', text: 'Nuclear vs solar LCOE comparison' },
  { emoji: '🏜️', text: 'Solar auction prices in the Middle East' },
  { emoji: '🟢', text: 'Green hydrogen production cost' },
  { emoji: '💨', text: 'Capacity factor of onshore wind?' },
];

export default function ComparePage() {
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

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

  return (
    <ProtectedRoute session={session}>
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Welcome screen ── */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-5 shadow-lg">
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Energy Analyst</h1>
              <p className="text-gray-500 mb-8 max-w-md text-sm">
                Ask me anything about energy costs, technologies, and markets.
                Powered by data from IRENA, Lazard, BNEF, EIA, NREL &amp; IFC.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="group text-left text-sm px-4 py-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/60 text-gray-700 transition-all duration-150 hover:shadow-sm"
                  >
                    <span className="mr-2">{q.emoji}</span>
                    {q.text}
                  </button>
                ))}
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
        <div className="border-t bg-white/80 backdrop-blur-sm px-4 py-3">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  title="New chat"
                  className="flex-shrink-0 w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mb-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about energy costs, technologies, markets..."
                  rows={1}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none leading-relaxed"
                  disabled={streaming}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className={`absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    streaming || !input.trim()
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {streaming ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Shift + Enter for new line &middot; Data may not reflect the latest market conditions
            </p>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ─── Markdown-lite renderer for assistant messages ──────────────────────────

function AssistantMessage({ content, meta }: { content: string; meta?: ChatMeta }) {
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

  return (
    <div>
      <div className="space-y-0.5">{renderContent(content)}</div>
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
