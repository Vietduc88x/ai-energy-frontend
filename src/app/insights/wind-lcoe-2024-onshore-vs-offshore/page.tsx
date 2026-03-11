import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';

const TITLE = 'Wind LCOE 2024: Onshore vs Offshore Benchmark';
const DESCRIPTION = 'Compare onshore and offshore wind levelized cost of energy across IRENA, Lazard, BNEF, and NREL for 2024. Understand cost drivers, regional spreads, and where the gap is closing.';
const URL = 'https://agent.techmadeeasy.info/insights/wind-lcoe-2024-onshore-vs-offshore';

export const metadata: Metadata = {
  title: TITLE,
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
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const ONSHORE_ROWS = [
  { source: 'IRENA RPGC 2024', value: '0.033', unit: 'USD/kWh', year: 2023, scope: 'Global weighted average', confidence: 0.92 },
  { source: 'Lazard LCOE 16.0', value: '0.024–0.075', unit: 'USD/kWh', year: 2024, scope: 'US, unsubsidized', confidence: 0.88 },
  { source: 'BNEF NEO 2024', value: '0.038', unit: 'USD/kWh', year: 2024, scope: 'Global benchmark, new-build', confidence: 0.85 },
  { source: 'NREL ATB 2024', value: '0.030', unit: 'USD/kWh', year: 2024, scope: 'US, moderate scenario, Class 4', confidence: 0.90 },
];

const OFFSHORE_ROWS = [
  { source: 'IRENA RPGC 2024', value: '0.075', unit: 'USD/kWh', year: 2023, scope: 'Global weighted average', confidence: 0.88 },
  { source: 'Lazard LCOE 16.0', value: '0.072–0.140', unit: 'USD/kWh', year: 2024, scope: 'US/Europe, fixed-bottom', confidence: 0.82 },
  { source: 'BNEF NEO 2024', value: '0.082', unit: 'USD/kWh', year: 2024, scope: 'Global benchmark, new-build', confidence: 0.80 },
  { source: 'NREL ATB 2024', value: '0.063', unit: 'USD/kWh', year: 2024, scope: 'US, moderate scenario, fixed-bottom', confidence: 0.85 },
];

const COST_DRIVERS = [
  {
    title: 'Turbine size matters enormously',
    detail: 'Onshore turbines have grown from 2 MW average in 2015 to 5-7 MW in 2024. Offshore turbines now reach 14-16 MW (Siemens Gamesa SG 14-236 DD, Vestas V236-15.0). Larger rotors = higher capacity factors = lower LCOE, but also higher per-unit CAPEX and installation complexity.',
  },
  {
    title: 'Offshore foundation costs',
    detail: 'Fixed-bottom foundations (monopile, jacket) account for 20-25% of offshore CAPEX. Water depth is the key variable: costs increase ~40% going from 20m to 40m depth. Floating foundations (spar, semi-sub, TLP) are still 2-3x more expensive but are necessary for 60m+ depths.',
  },
  {
    title: 'Supply chain bottlenecks (2022-2024)',
    detail: 'Unlike solar, wind LCOE actually increased in 2022-2023 due to steel prices, vessel availability (offshore), and OEM margin recovery. Vestas, Siemens Gamesa, and GE all reported losses on fixed-price turbine contracts. 2024 shows the first signs of stabilization.',
  },
  {
    title: 'Capacity factor gap is narrowing',
    detail: 'Onshore wind averages 30-40% capacity factor globally (up from 25% in 2010). Offshore wind averages 40-50%. The gap has narrowed as onshore turbines get taller (140-170m hub height) and use longer blades. In windy markets like the US Great Plains, onshore capacity factors exceed 45%.',
  },
  {
    title: 'Grid connection dominates offshore costs',
    detail: 'Offshore wind requires HVDC or HVAC export cables, offshore substations, and onshore grid reinforcement. These balance-of-plant costs can exceed 30% of total CAPEX for projects 50+ km from shore. IRENA excludes these; Lazard includes partial estimates.',
  },
];

const CITATIONS = [
  { source: 'IRENA', title: 'Renewable Power Generation Costs in 2023', year: 2024 },
  { source: 'Lazard', title: 'Levelized Cost of Energy Analysis v16.0', year: 2024 },
  { source: 'BloombergNEF', title: 'New Energy Outlook 2024', year: 2024 },
  { source: 'NREL', title: 'Annual Technology Baseline 2024', year: 2024 },
  { source: 'IEA', title: 'Offshore Wind Outlook 2024', year: 2024 },
];

function ComparisonTable({ rows, label }: { rows: typeof ONSHORE_ROWS; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{label}</p>
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
            {rows.map((row) => (
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
    </div>
  );
}

export default function WindLcoeBenchmarkPage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Benchmark Comparison"
        tagColor="emerald"
        title="Wind LCOE 2024: Onshore vs Offshore"
        subtitle="Onshore wind is the cheapest new electricity source in many markets. Offshore is catching up. Here's what the data shows."
        shareUrl={URL}
      />

      {/* Key takeaway */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Key takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            Onshore wind LCOE ranges from <strong>$0.024 to $0.075/kWh</strong> (global average ~$0.033-0.038).
            Offshore wind ranges from <strong>$0.063 to $0.140/kWh</strong> (global average ~$0.075-0.082).
            The offshore-onshore gap has narrowed from 3x in 2015 to roughly 2x in 2024, driven by larger turbines and higher capacity factors.
          </p>
        </div>
      </section>

      {/* Comparison tables */}
      <AssetSection title="Source comparison">
        <div className="space-y-8">
          <ComparisonTable rows={ONSHORE_ROWS} label="Onshore wind" />
          <ComparisonTable rows={OFFSHORE_ROWS} label="Offshore wind" />
        </div>
      </AssetSection>

      {/* Cost drivers */}
      <AssetSection title="What drives the cost difference">
        <div className="space-y-4">
          {COST_DRIVERS.map((item) => (
            <div key={item.title} className="border border-gray-200 rounded-xl p-4 md:p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </AssetSection>

      <CitationList citations={CITATIONS} />

      <AssetCta
        label="Compare wind costs for your market"
        href="/compare?q=Compare%20onshore%20and%20offshore%20wind%20LCOE%20in%202024"
      />
    </div>
  );
}
