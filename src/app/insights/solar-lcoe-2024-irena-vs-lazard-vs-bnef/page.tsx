import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';

const TITLE = 'Solar LCOE 2024: 5-Source Benchmark Comparison';
const DESCRIPTION = 'Compare solar PV levelized cost of energy across IRENA, Lazard, BNEF, EIA, and NREL for 2024. Understand why the numbers disagree and what drives the differences.';
const URL = 'https://agent.techmadeeasy.info/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef';

export const metadata: Metadata = {
  title: `${TITLE} | AI Energy Analyst`,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'AI Energy Analyst',
    type: 'article',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const COMPARISON_ROWS = [
  { source: 'IRENA RPGC 2024', value: '0.049', unit: 'USD/kWh', year: 2023, scope: 'Global weighted average, utility-scale', confidence: 0.92 },
  { source: 'Lazard LCOE 16.0', value: '0.024–0.096', unit: 'USD/kWh', year: 2024, scope: 'US, unsubsidized, utility-scale', confidence: 0.88 },
  { source: 'BNEF NEO 2024', value: '0.041', unit: 'USD/kWh', year: 2024, scope: 'Global benchmark, new-build', confidence: 0.85 },
  { source: 'EIA AEO 2024', value: '0.033', unit: 'USD/kWh', year: 2024, scope: 'US, plants entering service 2029', confidence: 0.80 },
  { source: 'NREL ATB 2024', value: '0.028', unit: 'USD/kWh', year: 2024, scope: 'US, moderate scenario, Class 5', confidence: 0.90 },
];

const DISAGREEMENT_REASONS = [
  {
    title: 'Financing assumptions',
    detail: 'IRENA uses a real WACC of 7.5% for OECD, 10% for non-OECD. Lazard assumes a 60/40 debt-equity structure with 8% cost of equity. NREL uses a fixed charge rate. These alone can shift LCOE by 15-25%.',
  },
  {
    title: 'System boundary',
    detail: 'NREL and EIA include interconnection costs in some scenarios. IRENA excludes grid costs. Lazard shows "unsubsidized" but includes ITC/PTC-eligible configurations separately. The boundary definition matters more than the model.',
  },
  {
    title: 'Geography and irradiance',
    detail: 'IRENA reports a global capacity-weighted average (which blends high-irradiance markets like India and the Middle East with lower-irradiance Europe). Lazard and EIA focus on the US. BNEF uses a global reference plant. Higher irradiance = lower LCOE.',
  },
  {
    title: 'Reference year and vintage',
    detail: 'IRENA\'s 2024 report covers projects commissioned through 2023. Lazard and BNEF model costs for new projects in 2024. EIA models plants entering service in 2029. Different vintage = different module prices and installation costs.',
  },
  {
    title: 'Module price assumptions',
    detail: 'Module prices fell ~50% in 2023 due to Chinese overcapacity. Reports published early in the year may use higher module price assumptions than those published later. This single variable can swing LCOE by 20-30%.',
  },
];

const CITATIONS = [
  { source: 'IRENA', title: 'Renewable Power Generation Costs in 2023', year: 2024 },
  { source: 'Lazard', title: 'Levelized Cost of Energy Analysis v16.0', year: 2024 },
  { source: 'BloombergNEF', title: 'New Energy Outlook 2024', year: 2024 },
  { source: 'EIA', title: 'Annual Energy Outlook 2024', year: 2024 },
  { source: 'NREL', title: 'Annual Technology Baseline 2024', year: 2024 },
];

export default function SolarLcoeBenchmarkPage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Benchmark Comparison"
        tagColor="emerald"
        title="Solar LCOE 2024: IRENA vs Lazard vs BNEF"
        subtitle="Five major sources report solar PV costs — and none of them agree. Here's what each says, and why the numbers diverge."
      />

      {/* Key takeaway */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Key takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            Utility-scale solar PV LCOE in 2024 ranges from <strong>$0.024 to $0.096/kWh</strong> depending on the source.
            The global weighted average is <strong>$0.041–0.049/kWh</strong>. The spread is driven by financing assumptions,
            geographic scope, and system boundary definitions — not by disagreement about the technology itself.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <AssetSection title="Source comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">LCOE</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">Year</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b hidden md:table-cell">Scope</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 border-b">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.source} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.source}</td>
                  <td className="px-4 py-3 text-gray-800 font-mono text-xs">{row.value} {row.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{row.year}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{row.scope}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{Math.round(row.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile scope cards */}
        <div className="md:hidden mt-4 space-y-2">
          {COMPARISON_ROWS.map((row) => (
            <div key={row.source} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">{row.source}</span>
                <span className="font-mono text-xs text-gray-700">{row.value}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{row.scope}</p>
            </div>
          ))}
        </div>
      </AssetSection>

      {/* Why numbers disagree */}
      <AssetSection title="Why the numbers disagree">
        <div className="space-y-4">
          {DISAGREEMENT_REASONS.map((reason) => (
            <div key={reason.title} className="border border-gray-200 rounded-xl p-4 md:p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{reason.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{reason.detail}</p>
            </div>
          ))}
        </div>
      </AssetSection>

      <CitationList citations={CITATIONS} />

      <AssetCta
        label="Ask your own benchmark question"
        href="/compare?q=Compare%20solar%20LCOE%202024%20across%20IRENA%2C%20Lazard%2C%20BNEF%2C%20EIA%2C%20and%20NREL"
      />
    </div>
  );
}
