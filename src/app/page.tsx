'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDemoComparison, type ComparisonResult } from '@/lib/api-client';
import { ComparisonTable } from '@/components/comparison-table';
import { CardSkeleton } from '@/components/skeleton';

// ─── Data ────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    title: 'Cost Benchmarks',
    subtitle: 'LCOE, CAPEX, OPEX, capacity factors, auction prices',
    description: 'Compare energy costs across technologies, regions, and time periods. Normalized to a common currency and price year with full methodology transparency.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    queries: [
      'What is the LCOE of solar PV in 2024?',
      'Compare CAPEX for onshore wind vs offshore wind',
      'Battery storage cost trends 2020-2024',
      'Solar auction prices in the Middle East',
    ],
    sources: ['IRENA', 'Lazard', 'BNEF', 'EIA', 'NREL'],
    color: 'emerald',
  },
  {
    title: 'Policy Tracker',
    subtitle: 'Regulations, incentives, deadlines by jurisdiction',
    description: 'Track energy policy changes across 15+ countries. Get alerts on regulatory shifts, permitting updates, and subsidy changes that affect your projects.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    queries: [
      'What are current solar incentives in India?',
      'Recent policy changes for wind energy in EU',
      'Permitting requirements for BESS in Australia',
      'Compare renewable energy targets: US vs China',
    ],
    sources: ['DCCEEW', 'MNRE', 'EU Commission', 'DOE'],
    color: 'blue',
  },
  {
    title: 'Project Guidelines',
    subtitle: 'Technical DD, EPC review, risk registers, checklists',
    description: 'Generate structured checklists for technical due diligence, EPC contract review, risk assessment, and document requests — sourced from IFC, OPIC, and industry best practices.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    queries: [
      'TDD checklist for solar PV feasibility in India',
      'EPC contract review questions for construction',
      'Risk register for hybrid PV + BESS project',
      'Document request list for procurement stage',
    ],
    sources: ['IFC', 'OPIC', 'World Bank', 'ADB'],
    color: 'amber',
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
    title: 'Country-aware',
    desc: 'Results are ranked and enriched with local regulatory context for 15+ countries.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Export & API',
    desc: 'Download CSV/JSON or integrate via API key for automated workflows.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

// ─── Color helpers ───────────────────────────────────────────────────────────

const PILLAR_STYLES: Record<string, { bg: string; border: string; iconBg: string; text: string; tag: string; queryHover: string }> = {
  emerald: {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    text: 'text-emerald-700',
    tag: 'bg-emerald-100 text-emerald-700',
    queryHover: 'hover:border-emerald-300 hover:bg-emerald-50/60',
  },
  blue: {
    bg: 'bg-blue-50/60',
    border: 'border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    text: 'text-blue-700',
    tag: 'bg-blue-100 text-blue-700',
    queryHover: 'hover:border-blue-300 hover:bg-blue-50/60',
  },
  amber: {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-600',
    text: 'text-amber-700',
    tag: 'bg-amber-100 text-amber-700',
    queryHover: 'hover:border-amber-300 hover:bg-amber-50/60',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [demo, setDemo] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-20 pb-12">
      {/* ── Hero ── */}
      <section className="text-center pt-10 md:pt-20 space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Powered by IRENA, Lazard, BNEF, EIA, NREL, IFC
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Energy intelligence for
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            decisions that matter
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Compare costs, track policies, and generate project checklists
          — all backed by structured data from the world&apos;s leading energy reports.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={loadDemo}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm touch-target transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading demo...
              </span>
            ) : (
              'Try it — Solar LCOE comparison'
            )}
          </button>
          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm touch-target text-center transition-all"
          >
            Sign in free
          </Link>
        </div>
      </section>

      {/* ── Demo result ── */}
      {loading && (
        <section className="max-w-3xl mx-auto">
          <CardSkeleton />
        </section>
      )}

      {error && (
        <section className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-red-600 bg-red-50 rounded-xl p-4">{error}</p>
        </section>
      )}

      {demo && !loading && (
        <section className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Solar LCOE Comparison — 2024</h2>
            </div>
            <ComparisonTable result={demo} />
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link
                href="/compare"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Ask your own question &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* ── Three pillars ── */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Three workflows, one platform</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Whether you&apos;re benchmarking costs, tracking regulations, or running due diligence
            — structured data replaces hours of manual research.
          </p>
        </div>

        <div className="space-y-8">
          {PILLARS.map((pillar) => {
            const s = PILLAR_STYLES[pillar.color];
            return (
              <div
                key={pillar.title}
                className={`rounded-2xl border ${s.border} ${s.bg} p-6 md:p-8`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Left: info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center text-white shadow-sm`}>
                        {pillar.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{pillar.title}</h3>
                        <p className={`text-xs font-medium ${s.text}`}>{pillar.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pillar.sources.map((src) => (
                        <span key={src} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.tag}`}>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: example queries */}
                  <div className="md:w-[340px] space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Example queries</p>
                    {pillar.queries.map((q) => (
                      <Link
                        key={q}
                        href={`/compare?q=${encodeURIComponent(q)}`}
                        className={`block text-left text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-700 transition-all duration-150 hover:shadow-sm ${s.queryHover}`}
                      >
                        {q}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
            Start with a question
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            No credit card required. Ask about any energy cost, policy, or guideline
            and get a structured, cited answer in seconds.
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
