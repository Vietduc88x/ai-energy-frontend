'use client';

import { useRef, useState, useEffect } from 'react';
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
  'What is the LCOE of solar PV in 2024?',
  'Compare solar vs wind costs globally',
  'How much does offshore wind cost in Europe?',
  'Battery storage cost trends',
  'Nuclear vs solar LCOE comparison',
  'Solar PV auction prices in the Middle East',
  'Green hydrogen production cost',
  'What is the capacity factor of onshore wind?',
];

export default function ComparePage() {
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    // Build history from existing messages (exclude the new ones)
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
        inputRef.current?.focus();
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

  return (
    <ProtectedRoute session={session}>
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-2 md:px-0 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Energy Analyst</h1>
              <p className="text-gray-500 mb-8 max-w-md">
                Ask me anything about energy costs, technologies, and markets.
                I compare data from IRENA, Lazard, BNEF, EIA, NREL, and IFC.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 pt-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.loading && !msg.content ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <AssistantMessage content={msg.content} meta={msg.meta} />
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t bg-white px-4 py-3">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about energy costs, technologies, markets..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              disabled={streaming}
              autoFocus
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className={`px-5 py-3 rounded-xl font-medium text-sm text-white touch-target ${
                streaming || !input.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              {streaming ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ─── Markdown-lite renderer for assistant messages ──────────────────────────

function AssistantMessage({ content, meta }: { content: string; meta?: ChatMeta }) {
  // Simple markdown rendering: bold, bullet points, line breaks
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      // Bullet points
      if (line.match(/^[-*•]\s/)) {
        return (
          <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*•]\s/, '') }} />
        );
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, '') }} />
        );
      }

      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} className="font-semibold mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="font-bold mt-3 mb-1">{line.replace('## ', '')}</h3>;
      }

      // Empty line = paragraph break
      if (!line.trim()) return <br key={i} />;

      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="space-y-1">
      <div className="prose-sm">{renderContent(content)}</div>
      {meta && meta.factsUsed > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          Based on {meta.factsUsed} data points
          {meta.technologies.length > 0 && ` | ${meta.technologies.join(', ')}`}
        </div>
      )}
    </div>
  );
}
