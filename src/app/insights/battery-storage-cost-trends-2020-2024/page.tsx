import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';

const TITLE = 'Battery Storage Cost Trends: 2020–2024';
const DESCRIPTION = 'Track lithium-ion battery energy storage costs from 2020 to 2024. CAPEX, LCOS, and pack prices across IRENA, Lazard, BNEF, and NREL with analysis of the key cost drivers.';
const URL = 'https://agent.techmadeeasy.info/insights/battery-storage-cost-trends-2020-2024';

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
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const PACK_PRICE_TREND = [
  { year: 2020, price: 137, note: 'Post-COVID recovery, Li-ion pack average' },
  { year: 2021, price: 132, note: 'Supply chain tightening begins' },
  { year: 2022, price: 151, note: 'Lithium spike, first price increase since tracking began' },
  { year: 2023, price: 139, note: 'Lithium crash (-80%), LFP gains share' },
  { year: 2024, price: 115, note: 'LFP dominant, Chinese overcapacity drives prices down' },
];

const SYSTEM_COST_ROWS = [
  { source: 'IRENA 2024', capex: '250–475', lcos: '0.10–0.20', duration: '4h', scope: 'Global average, utility-scale Li-ion' },
  { source: 'Lazard LCOS 8.0', capex: '234–456', lcos: '0.12–0.18', duration: '4h', scope: 'US, Li-ion standalone' },
  { source: 'BNEF 2024', capex: '196–340', lcos: '0.08–0.15', duration: '4h', scope: 'Global benchmark, grid-scale LFP' },
  { source: 'NREL ATB 2024', capex: '220–380', lcos: '0.09–0.16', duration: '4h', scope: 'US, moderate scenario, LFP' },
];

const COST_DRIVERS = [
  {
    title: 'Chemistry shift: NMC to LFP',
    detail: 'Lithium iron phosphate (LFP) has overtaken nickel-manganese-cobalt (NMC) as the dominant grid storage chemistry. LFP is 15-25% cheaper per kWh, has better cycle life (6,000+ cycles vs 3,000-4,000), and avoids cobalt/nickel supply risks. The trade-off is lower energy density, which matters less for stationary storage.',
  },
  {
    title: 'Lithium price volatility',
    detail: 'Lithium carbonate spiked to $80,000/tonne in late 2022, driving the first-ever annual increase in pack prices. By late 2023, prices collapsed to $15,000/tonne due to new supply from Australia, Chile, and China. This 80% drop flowed through to a ~20% reduction in cell-level costs.',
  },
  {
    title: 'Chinese manufacturing overcapacity',
    detail: 'CATL, BYD, EVE Energy, and other Chinese manufacturers expanded capacity aggressively in 2022-2023. By 2024, global LFP cell manufacturing capacity exceeded demand by ~2x. This overcapacity is pushing prices below production costs for some manufacturers, creating a buyer\'s market for project developers.',
  },
  {
    title: 'Duration premium is shrinking',
    detail: 'The cost premium for longer-duration systems (6-8h vs 2-4h) has narrowed as cell costs fall. Cells now represent ~35-40% of total system cost (down from 50%+ in 2020). Balance-of-system costs (inverters, enclosures, EMS, installation) are increasingly the dominant cost component.',
  },
  {
    title: 'Augmentation and degradation',
    detail: 'LCOS calculations depend heavily on assumed degradation rates and augmentation strategies. A system degrading at 2%/year over 15 years needs significant augmentation in years 8-15. BNEF uses a 1.5%/year assumption; Lazard uses 2.5%. This single assumption can shift LCOS by 20-30%.',
  },
];

const CITATIONS = [
  { source: 'IRENA', title: 'Electricity Storage and Renewables: Costs and Markets to 2030', year: 2024 },
  { source: 'Lazard', title: 'Levelized Cost of Storage Analysis v8.0', year: 2024 },
  { source: 'BloombergNEF', title: 'Lithium-Ion Battery Pack Prices Report', year: 2024 },
  { source: 'NREL', title: 'Annual Technology Baseline 2024 — Storage', year: 2024 },
  { source: 'IEA', title: 'World Energy Outlook 2024 — Storage Annex', year: 2024 },
];

export default function BatteryStorageCostPage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Cost Trends"
        tagColor="emerald"
        title="Battery Storage Cost Trends: 2020-2024"
        subtitle="Li-ion battery costs fell 89% from 2010 to 2024, but the path wasn't linear — a price spike in 2022 was followed by the sharpest annual decline ever. Here's what happened."
        shareUrl={URL}
      />

      {/* Key takeaway */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Key takeaway</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            Li-ion battery pack prices hit <strong>$115/kWh in 2024</strong> — down from $137/kWh in 2020 and $1,200/kWh in 2010.
            Grid-scale system CAPEX (4h duration) is <strong>$196–475/kWh</strong> depending on source and geography.
            The LCOS for utility-scale storage is now <strong>$0.08–0.20/kWh</strong>, making storage competitive with gas peakers in most markets.
          </p>
        </div>
      </section>

      {/* Pack price trend */}
      <AssetSection title="Li-ion pack price trend ($/kWh)">
        <div className="space-y-2">
          {PACK_PRICE_TREND.map((row) => (
            <div key={row.year} className="flex items-center gap-4 border border-gray-200 rounded-xl p-4">
              <div className="flex-shrink-0 w-12 text-sm font-bold text-gray-900">{row.year}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 rounded-full bg-emerald-400" style={{ width: `${(row.price / 160) * 100}%` }} />
                  <span className="font-mono text-sm font-bold text-gray-900">${row.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 italic">Source: BloombergNEF Lithium-Ion Battery Pack Price Survey</p>
      </AssetSection>

      {/* System cost comparison */}
      <AssetSection title="Grid-scale system costs (2024)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">CAPEX ($/kWh)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">LCOS ($/kWh)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-b hidden md:table-cell">Scope</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEM_COST_ROWS.map((row) => (
                <tr key={row.source} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.source}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">{row.capex}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">{row.lcos}</td>
                  <td className="px-4 py-3 text-gray-600">{row.duration}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{row.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AssetSection>

      {/* Cost drivers */}
      <AssetSection title="What's driving costs down (and up)">
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
        label="Analyze storage costs for your project"
        href="/compare?q=Battery%20storage%20CAPEX%20and%20LCOS%20for%20a%204h%20grid-scale%20system%20in%202024"
      />
    </div>
  );
}
