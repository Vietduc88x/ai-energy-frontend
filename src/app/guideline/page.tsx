'use client';

import Link from 'next/link';

interface Section {
  icon: string;
  title: string;
  description: string;
  examples: string[];
  badge?: string;
}

const SECTIONS: Section[] = [
  {
    icon: '⚡',
    title: 'Energy Benchmarks & LCOE',
    description: 'Ask for cost benchmarks, LCOE data, CAPEX/OPEX ranges, capacity factors, and auction prices across technologies and regions. The AI pulls from IRENA, EIA, BNEF, Ember, and other curated sources.',
    badge: 'Most used',
    examples: [
      'What is the LCOE for utility-scale solar in Vietnam in 2024?',
      'Compare CAPEX for onshore wind vs solar PV in Southeast Asia.',
      'What capacity factor should I use for BESS in the Philippines?',
      'Show me auction prices for solar in India over the last 3 years.',
    ],
  },
  {
    icon: '📋',
    title: 'EPC Contract Review',
    description: 'Paste any EPC contract clause — the AI auto-detects it as an EPC document, evaluates it against FIDIC controls (LD caps, payment terms, risk allocation, performance guarantees), and returns structured findings.',
    examples: [
      'Paste Sub-Clause 8.8 of your EPC contract → instant FIDIC compliance check.',
      'Paste your payment milestone schedule → checks CR-001 cross-reference.',
      'Paste your defects liability clause → flags DNP period adequacy.',
      'Ask: "What LD rate is standard for a 100MW solar EPC?"',
    ],
  },
  {
    icon: '🔬',
    title: 'Technical Due Diligence',
    description: 'Paste TDD document sections for evaluation against IEC standards and performance benchmarks. Auto-detected as TDD content when P50, yield, inverter, or IEC 61724 keywords appear.',
    examples: [
      'Paste your energy yield section → checks P50/P90 methodology.',
      'Paste performance guarantee clause → validates against IEC 61724-2.',
      'Ask: "What PR should I expect for a tracker system in Vietnam?"',
      'Ask: "What does a bankable TDD report require for grid compliance?"',
    ],
  },
  {
    icon: '📜',
    title: 'Policy & Regulatory Questions',
    description: 'Ask about feed-in tariffs, auction frameworks, grid codes, permitting processes, and renewable energy policy across Vietnam, Philippines, India, Australia, and other markets.',
    examples: [
      'What is the current solar FIT policy in Vietnam?',
      'Explain the GEAP auction mechanism in the Philippines.',
      'What grid connection requirements apply to large solar in India?',
      'Summarise Australia\'s Capacity Investment Scheme.',
    ],
  },
  {
    icon: '⚖️',
    title: 'FIDIC & Contract Law',
    description: 'Ask any question about FIDIC contract provisions, good faith obligations, NTP conditions, EOT claims, variation procedures, or dispute resolution. The AI applies FIDIC Yellow Book (2017) and general EPC contract law.',
    examples: [
      'Explain good faith under FIDIC Sub-Clause 1.14.',
      'Can we issue NTP if the contractor hasn\'t received their local license yet?',
      'What are the grounds for an EOT claim under FIDIC Clause 8.5?',
      'How does the prevention principle apply to employer-caused delays?',
    ],
  },
  {
    icon: '📊',
    title: 'IEC Standards & Technical Questions',
    description: 'Ask about IEC, IEEE, and other technical standards relevant to solar, wind, BESS, and grid infrastructure. The AI references IEC 61724, 62446, 61400, 60076, and others.',
    examples: [
      'What does IEC 62446 require for PV system documentation?',
      'Explain the difference between IEC 61724-1 and IEC 61724-2.',
      'What protection relay settings are required for grid-connected BESS?',
      'What IEC standards apply to offshore wind installation?',
    ],
  },
];

const TIPS = [
  {
    icon: '📌',
    title: 'Paste long content for instant assessment',
    body: 'Any text over 300 characters with contract or TDD language automatically triggers a structured assessment — no need to navigate to a separate tool.',
  },
  {
    icon: '💬',
    title: 'Ask short questions as normal chat',
    body: 'Short questions (under 300 chars) go through the AI chat engine and draw on the full knowledge base of 56 reference books.',
  },
  {
    icon: '🔍',
    title: 'Be specific for better answers',
    body: 'Include technology type (solar PV, onshore wind, BESS), region (Vietnam, Philippines), year, and scale (MW). The more specific, the more precise the data.',
  },
  {
    icon: '📎',
    title: 'Follow up in the same thread',
    body: 'After an assessment or answer, ask follow-up questions in the same chat. The AI retains context across the conversation.',
  },
];

export default function GuidelinePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">How to use Energy Analyst</h1>
            <p className="text-sm text-gray-400">One chat interface. All your energy intelligence needs.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Everything runs through the <Link href="/compare" className="text-emerald-600 font-medium hover:underline">Chat</Link> tab.
          Just type a question or paste a document — the AI automatically detects what you need and runs the right analysis.
          No tools to select, no forms to fill.
        </p>
      </div>

      {/* Quick tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPS.map(tip => (
          <div key={tip.title} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
            <span className="text-lg flex-shrink-0">{tip.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">{tip.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What you can ask */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">What you can ask</h2>
        <div className="space-y-4">
          {SECTIONS.map(section => (
            <div key={section.title} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                <span className="text-xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                    {section.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.description}</p>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2">
                {section.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">→</span>
                    <p className="text-xs text-gray-600 italic">{ex}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge base */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Knowledge base</h2>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          The AI draws from 56 curated reference books and datasets, including:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            'IRENA Renewable Power Generation Costs 2024', 'IRENA BESS Cost Data 2024',
            'EIA Annual Energy Outlook 2025', 'NREL Annual Technology Baseline 2024',
            'BloombergNEF New Energy Outlook 2025', 'Ember Global Electricity Review 2024',
            'FIDIC Yellow Book 2017 (2nd Ed.)', 'IFC Environmental, Health & Safety Guidelines',
            'IEC 61724-1/2 (PV System Monitoring)', 'IEC 62446 (PV System Documentation)',
            'IEC 61400 Series (Wind Turbines)', 'IEC 60076 (Power Transformers)',
            'IEC 62933 (Electrical Energy Storage)', 'IEEE 1547 (DER Interconnection)',
            'Lazard LCOE Analysis v17', 'World Bank ESMAP Solar Resource Data',
          ].map(source => (
            <div key={source} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
              {source}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-4">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Start chatting
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="text-xs text-gray-400 mt-2">No setup required — just type or paste</p>
      </div>

    </div>
  );
}
