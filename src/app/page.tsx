'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDemoComparison, type ComparisonResult } from '@/lib/api-client';
import { ComparisonTable } from '@/components/comparison-table';
import { CardSkeleton } from '@/components/skeleton';

// ─── Sample chat conversations ──────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  table?: { headers: string[]; rows: string[][] };
  badge?: string;
  sources?: string[];
}

const SAMPLE_CHATS: { label: string; color: string; messages: ChatMessage[] }[] = [
  {
    label: 'Cost Benchmark',
    color: 'emerald',
    messages: [
      { role: 'user', text: 'Compare solar PV LCOE across IRENA, Lazard, and BNEF — why do they disagree?' },
      {
        role: 'assistant',
        text: 'Solar PV LCOE ranges from $24-$96/MWh across sources. The disagreement stems from methodology: IRENA uses weighted-average deployed costs while Lazard models unsubsidized greenfield projects. Here\'s the breakdown:',
        table: {
          headers: ['Source', 'LCOE (USD/MWh)', 'Range', 'Key Methodology'],
          rows: [
            ['IRENA', '$36', '$28 - $50', 'Weighted avg, global deployed'],
            ['Lazard', '$49', '$24 - $96', 'Unsubsidized, US greenfield'],
            ['BNEF', '$41', '$30 - $55', 'Global benchmark, H2 2024'],
            ['EIA', '$33', '$29 - $42', 'US utility-scale, AEO 2024'],
          ],
        },
        badge: 'benchmark_report',
        sources: ['IRENA RPGC 2024', 'Lazard LCOE 16.0', 'BNEF 1H 2024', 'EIA AEO 2024'],
      },
    ],
  },
  {
    label: 'Policy Intelligence',
    color: 'blue',
    messages: [
      { role: 'user', text: 'Can foreign investors do direct PPAs in Vietnam now? What changed?' },
      {
        role: 'assistant',
        text: 'Yes — Vietnam enacted the DPPA framework in late 2024, opening a direct procurement path for projects > 30 MW. Implementation rules took effect Feb 2025. Key changes:',
        table: {
          headers: ['Policy Change', 'Effective', 'Impact for Investors'],
          rows: [
            ['DPPA framework enacted', 'Nov 2024', 'Foreign investors can negotiate bilateral PPAs'],
            ['Circular 02 implementation rules', 'Feb 2025', 'Defines eligible buyer/seller criteria'],
            ['PDP8 solar cap: 12.8 GW by 2030', 'Active', 'Limits new utility-scale capacity'],
          ],
        },
        badge: 'policy_report',
        sources: ['Decision 80/2024', 'Circular 02/2025', 'PDP8 Resolution'],
      },
    ],
  },
  {
    label: 'Project Guidance',
    color: 'amber',
    messages: [
      { role: 'user', text: 'I\'m doing feasibility for a 50 MW solar PV in India — give me a TDD checklist' },
      {
        role: 'assistant',
        text: 'Here\'s your technical due diligence checklist for a 50 MW solar PV feasibility in India, sourced from IFC Performance Standards and World Bank guidelines:',
        table: {
          headers: ['Category', 'Check Item', 'Priority'],
          rows: [
            ['Resource', 'GHI data validated (> 4.5 kWh/m\u00B2/day)', 'Critical'],
            ['Site', 'Geotechnical survey & topography', 'Critical'],
            ['Grid', 'Substation capacity & evacuation plan', 'Critical'],
            ['Land', 'Lease agreement / title clearance', 'Critical'],
            ['Permits', 'State electricity board approval', 'High'],
            ['Environmental', 'EIA clearance (if applicable)', 'High'],
            ['Financial', 'PPA / SECI bid confirmation', 'Critical'],
          ],
        },
        badge: 'project_guidance_report',
        sources: ['IFC Solar Guide', 'MNRE Guidelines', 'World Bank RE Toolkit'],
      },
    ],
  },
];

// ─── Pillar data ────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    persona: 'Investment Analyst',
    problem: 'Spends 3+ hours manually comparing LCOE data across IRENA, Lazard, and BNEF reports',
    solution: 'One question returns a cross-source benchmark table with conflict detection — in 10 seconds',
    query: 'Compare solar PV LCOE across IRENA, Lazard, and BNEF — why do they disagree?',
  },
  {
    persona: 'Project Developer',
    problem: 'Missed a DPPA deadline because policy updates were buried across government websites',
    solution: 'Structured policy brief with key dates, who is affected, and what to check next',
    query: 'Can foreign investors do direct PPAs in Vietnam now?',
  },
  {
    persona: 'Technical Advisor',
    problem: 'Manually rebuilds DD checklists from IFC/World Bank PDFs for every new project',
    solution: 'Country-specific due diligence pack with checklist, risk register, document list, and EPC review questions',
    query: 'TDD checklist for 50 MW solar PV feasibility in India',
  },
  {
    persona: 'Lender / DFI',
    problem: 'Reviews 200-page feasibility reports without a standard risk framework to compare projects',
    solution: 'Structured risk matrix with likelihood/impact scoring, editable in-browser, exportable to DOCX/XLSX',
    query: 'Risk register for hybrid PV + BESS project in Philippines',
  },
];

const METRICS = [
  { label: 'LCOE', desc: 'Levelized Cost of Energy' },
  { label: 'CAPEX', desc: 'Capital Expenditure' },
  { label: 'OPEX', desc: 'Operating Costs' },
  { label: 'IRR', desc: 'Internal Rate of Return' },
  { label: 'Capacity Factor', desc: 'Generation Efficiency' },
  { label: 'Auction Prices', desc: 'Competitive Tenders' },
];

const TRUST_ITEMS = [
  {
    title: 'Cited sources',
    desc: 'Every data point links back to its original report, page number, and publication date.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.69" />
      </svg>
    ),
  },
  {
    title: 'Conflict detection',
    desc: 'When sources disagree, we flag it and explain the methodology differences.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Editable deliverables',
    desc: 'Edit AI-generated reports in-browser, save drafts with version history, export to DOCX or XLSX.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
  {
    title: 'Country-aware',
    desc: 'Results enriched with local regulatory context for Vietnam, India, Philippines, Australia & more.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

// ─── Chat badge colors ──────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  benchmark_report: 'bg-emerald-100 text-emerald-700',
  policy_report: 'bg-blue-100 text-blue-700',
  project_guidance_report: 'bg-amber-100 text-amber-700',
};

const BADGE_LABELS: Record<string, string> = {
  benchmark_report: 'Benchmark Report',
  policy_report: 'Policy Brief',
  project_guidance_report: 'Guidance Pack',
};

const TAB_COLORS: Record<string, { active: string; inactive: string }> = {
  emerald: { active: 'bg-emerald-600 text-white shadow-sm', inactive: 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50' },
  blue: { active: 'bg-blue-600 text-white shadow-sm', inactive: 'text-gray-500 hover:text-blue-700 hover:bg-blue-50' },
  amber: { active: 'bg-amber-600 text-white shadow-sm', inactive: 'text-gray-500 hover:text-amber-700 hover:bg-amber-50' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [demo, setDemo] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState(0);
  const [typing, setTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  const loadDemo = async () => {
    setLoading(true);
    setError(null);
    const res = await getDemoComparison();
    if (res.data) {
      setDemo(res.data);
    } else {
      setError(res.error?.message ?? 'Failed to load demo');
    }
    setLoading(false);
  };

  // Auto-load live demo on page load
  useEffect(() => {
    loadDemo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate chat messages appearing one by one
  useEffect(() => {
    const chat = SAMPLE_CHATS[activeChat];
    setVisibleMessages(0);
    setTyping(false);

    const timers: NodeJS.Timeout[] = [];

    chat.messages.forEach((_, i) => {
      timers.push(setTimeout(() => {
        if (i > 0) setTyping(true);
        timers.push(setTimeout(() => {
          setTyping(false);
          setVisibleMessages(i + 1);
        }, i === 0 ? 0 : 800));
      }, i === 0 ? 200 : 1200 * i));
    });

    return () => timers.forEach(clearTimeout);
  }, [activeChat]);

  return (
    <div className="space-y-20 pb-12">
      {/* ── Hero ── */}
      <section className="text-center pt-10 md:pt-20 space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Powered by IRENA, Lazard, BNEF, EIA, NREL, IFC
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Your AI analyst for
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            renewable energy decisions
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Ask a question in plain English. Get a structured, cited answer from IRENA, Lazard, BNEF, and 10+ energy sources
          — benchmark reports, policy briefs, and project guidance packs you can edit and export.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/compare"
            className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm touch-target transition-all shadow-sm hover:shadow-md"
          >
            Try it free — no signup required
          </Link>
          <a
            href="#live-demo"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm touch-target text-center transition-all"
          >
            See live demo below
          </a>
        </div>
      </section>

      {/* ── Sample Chat Demo ── */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">See it in action</h2>
          <p className="text-gray-500 text-sm">
            Real questions energy professionals ask every day. Click a tab to see how the AI responds.
          </p>
        </div>

        {/* Chat tabs */}
        <div className="flex gap-2 mb-4 justify-center">
          {SAMPLE_CHATS.map((chat, i) => {
            const colors = TAB_COLORS[chat.color];
            return (
              <button
                key={chat.label}
                onClick={() => setActiveChat(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeChat === i ? colors.active : colors.inactive
                }`}
              >
                {chat.label}
              </button>
            );
          })}
        </div>

        {/* Chat window */}
        <div
          ref={chatRef}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">AI Energy Analyst</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 min-h-[320px]">
            {SAMPLE_CHATS[activeChat].messages.slice(0, visibleMessages).map((msg, i) => (
              <div
                key={`${activeChat}-${i}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === 'user' ? (
                  <div className="bg-gray-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] text-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md max-w-[95%] p-4 space-y-3">
                    {msg.badge && (
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[msg.badge]}`}>
                        {BADGE_LABELS[msg.badge]}
                      </span>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p>
                    {msg.table && (
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr>
                              {msg.table.headers.map((h) => (
                                <th key={h} className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-600 bg-white">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.table.rows.map((row, ri) => (
                              <tr key={ri} className="border-b border-gray-50 last:border-0">
                                {row.map((cell, ci) => (
                                  <td key={ci} className="px-3 py-2 text-gray-700">
                                    {ci === 0 ? <span className="font-medium">{cell}</span> : cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {msg.sources && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.sources.map((s) => (
                          <span key={s} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/compare?q=${encodeURIComponent(SAMPLE_CHATS[activeChat].messages[0].text)}`}
                        className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Try this query
                      </Link>
                      <span className="text-gray-200">|</span>
                      <span className="text-[11px] text-gray-400">Edit & export to DOCX</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mock input */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <Link
              href="/compare"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-400 hover:border-emerald-300 hover:text-gray-500 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              Ask about any energy cost, policy, or project guideline...
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live demo result ── */}
      <section id="live-demo" className="max-w-3xl mx-auto scroll-mt-20">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Live demo — real data, real AI</h2>
          <p className="text-gray-500 text-sm">
            This is a live API response, not a mockup. The same engine powers the chat interface.
          </p>
        </div>
        {loading && <CardSkeleton />}
        {error && (
          <div className="text-center">
            <p className="text-sm text-red-600 bg-red-50 rounded-xl p-4">{error}</p>
          </div>
        )}
        {demo && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Solar PV LCOE — Cross-Source Comparison</h3>
                <p className="text-xs text-gray-400">Query: &ldquo;What is the LCOE of solar PV in 2024?&rdquo;</p>
              </div>
            </div>
            <ComparisonTable result={demo} />
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/compare?q=Compare%20solar%20PV%20LCOE%20across%20IRENA%2C%20Lazard%2C%20and%20BNEF"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-sm hover:shadow"
              >
                Try this query yourself
              </Link>
              <Link
                href="/compare"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                or ask your own question &rarr;
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Who is this for ── */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Built for energy professionals</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Replace hours of manual research with one question. Here&apos;s what your peers use it for.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {USE_CASES.map((uc) => (
            <div key={uc.persona} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                  {uc.persona.split(' ').map(w => w[0]).join('')}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{uc.persona}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-xs mt-0.5 flex-shrink-0">Before:</span>
                  <p className="text-xs text-gray-500 leading-relaxed">{uc.problem}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 text-xs mt-0.5 flex-shrink-0">Now:</span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{uc.solution}</p>
                </div>
              </div>
              <Link
                href={`/compare?q=${encodeURIComponent(uc.query)}`}
                className="inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Try: &ldquo;{uc.query}&rdquo; &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metrics bar ── */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Metrics we cover</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center py-3 px-2 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">From question to deliverable in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Ask in plain English',
              desc: 'Type any energy question. The AI detects whether you need a benchmark, policy brief, or project guidance pack.',
              example: '"What is the LCOE of offshore wind in Europe?"',
            },
            {
              step: '2',
              title: 'Get a structured answer',
              desc: 'Cross-referenced data from IRENA, Lazard, BNEF, and government sources. With tables, charts, and conflict detection.',
              example: 'Comparison table + narrative + source citations',
            },
            {
              step: '3',
              title: 'Edit, save, export',
              desc: 'Open the report in-browser. Edit any field. Save drafts with version history. Export to DOCX or XLSX for your team.',
              example: 'Editable benchmark report exported as Word doc',
            },
          ].map((s) => (
            <div key={s.step} className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mx-auto">
                {s.step}
              </div>
              <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              <p className="text-[11px] text-gray-400 italic">{s.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Built for trust</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Every answer is traceable back to its source. No hallucinations, no guesswork.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto text-center">
        <div className="bg-gray-900 rounded-2xl p-8 md:p-10 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Replace hours of PDF research with one question
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            No credit card required. 5 free queries per week. Benchmark reports, policy briefs, and project guidance
            packs — structured, cited, and exportable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/compare"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm touch-target transition-all shadow-sm hover:shadow-md"
            >
              Open AI Analyst
            </Link>
            <Link
              href="/auth/signin"
              className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-medium text-sm touch-target text-center transition-all"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 pt-4 space-y-1">
        <p>Data sourced from IRENA, Lazard, BloombergNEF, EIA, NREL, IFC, World Bank, and government agencies.</p>
        <p>AI Energy Analyst is not affiliated with any data provider. All data is used under fair use for analysis.</p>
      </footer>
    </div>
  );
}
