import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';
import { PolicyTimeline } from '@/components/assets/PolicyTimeline';

const TITLE = 'Philippines Solar Policy Snapshot';
const DESCRIPTION = 'Current solar energy policy in the Philippines: Green Energy Auction Program, net metering, RPS compliance, and recent regulatory changes for developers and investors.';
const URL = 'https://agent.techmadeeasy.info/policy/philippines-solar-snapshot';

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

const STATUS_ITEMS = [
  {
    label: 'Green Energy Auction',
    value: 'GEAP Round 3 (2024)',
    detail: 'The Green Energy Auction Program (GEAP) is the primary procurement mechanism. Round 2 awarded 3.6 GW across solar, wind, and biomass. Round 3 targets an additional 4.6 GW with solar allocated 2 GW.',
  },
  {
    label: 'Net metering',
    value: '100 kW cap, export credit',
    detail: 'RA 9513 (Renewable Energy Act) provides net metering for systems up to 100 kW. Export credits are valued at the blended generation rate (~PHP 5.5-6.5/kWh). DUs are obligated to interconnect eligible systems.',
  },
  {
    label: 'RPS compliance',
    value: '2.52% annual increment',
    detail: 'The Renewable Portfolio Standard requires distribution utilities and retail electricity suppliers to source an increasing share from renewables. The minimum annual increment is 2.52%, reaching 35% RE share by 2030.',
  },
  {
    label: 'Foreign ownership',
    value: '100% allowed since 2022',
    detail: 'RA 11659 (amended Public Service Act) allows 100% foreign ownership of renewable energy projects. Previously capped at 40%. This has significantly increased foreign developer interest.',
  },
];

const TIMELINE_EVENTS = [
  {
    date: 'Feb 2025',
    title: 'GEAP Round 3 results expected',
    description: 'DOE is reviewing bids for 4.6 GW across all RE technologies. Solar submissions reportedly exceeded 8 GW, indicating strong developer interest and competitive pricing.',
    severity: 'high' as const,
  },
  {
    date: 'Oct 2024',
    title: 'GEAP Round 3 launched',
    description: 'DOE opened bidding for 4.6 GW: 2 GW solar, 1.5 GW wind, 600 MW biomass, 500 MW emerging RE. Reserve prices set at PHP 4.72/kWh for solar.',
    severity: 'high' as const,
  },
  {
    date: 'Jul 2024',
    title: 'Enhanced net metering rules',
    description: 'ERC Resolution 2024-18 streamlines interconnection for net metering systems. Processing time reduced from 45 to 20 business days. Metering equipment costs to be shared.',
    severity: 'medium' as const,
  },
  {
    date: 'Mar 2024',
    title: 'GEAP Round 2 contracts signed',
    description: 'Final PSAs executed for 3.6 GW from Round 2. Average solar price: PHP 3.88/kWh (~$0.069/kWh), 12% below the reserve price. 20-year contract terms.',
    severity: 'high' as const,
  },
  {
    date: 'Nov 2023',
    title: 'Green Energy Option Program expansion',
    description: 'DOE expanded the GEOP to allow commercial/industrial users with 100 kW+ demand to source directly from RE generators. Over 200 end-users registered by Q1 2024.',
    severity: 'medium' as const,
  },
  {
    date: 'Jun 2023',
    title: 'Updated RE incentive framework',
    description: 'Board of Investments extended the income tax holiday for RE projects to 7 years for solar (up from 4). Duty-free importation of RE equipment also extended through 2030.',
    severity: 'medium' as const,
  },
];

const WHO_IS_AFFECTED = [
  { role: 'Utility-scale developers', impact: 'GEAP is the primary entry pathway. Competitive auction prices have dropped below PHP 4/kWh for solar. Must secure grid connection and environmental compliance certificate before bidding.' },
  { role: 'C&I rooftop installers', impact: 'Net metering up to 100 kW with export credit. GEOP enables direct sourcing for 100 kW+ users. Strong demand from BPO, manufacturing, and retail sectors.' },
  { role: 'Foreign investors', impact: '100% foreign ownership enabled since 2022. No restrictions on RE project ownership. Tax holidays, duty-free imports, and carbon credit eligibility available.' },
  { role: 'Distribution utilities', impact: 'Must comply with RPS targets (2.52% annual increment). Obligated to interconnect net metering systems. Competitive procurement through GEAP auctions.' },
];

const CITATIONS = [
  { source: 'DOE Philippines', title: 'Green Energy Auction Program Round 3 — Terms of Reference', year: 2024 },
  { source: 'DOE Philippines', title: 'Philippine Energy Plan 2023-2050', year: 2023 },
  { source: 'ERC', title: 'Resolution 2024-18 — Net Metering Interconnection Standards', year: 2024 },
  { source: 'BOI', title: 'Investment Priorities Plan — Renewable Energy Incentives', year: 2023 },
  { source: 'Congress', title: 'RA 11659 — Amended Public Service Act', year: 2022 },
];

export default function PhilippinesSolarPolicyPage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Policy Snapshot"
        tagColor="blue"
        title="Philippines Solar Policy Snapshot"
        subtitle="The Philippines has become one of Southeast Asia's most attractive solar markets — open to foreign investors, with competitive auctions and rising demand. Here's the regulatory picture."
        badge="Last updated: March 2025"
        shareUrl={URL}
      />

      {/* Current status */}
      <AssetSection title="Current status">
        <div className="grid sm:grid-cols-2 gap-3">
          {STATUS_ITEMS.map((item) => (
            <div key={item.label} className="border border-gray-200 rounded-xl p-4 space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{item.value}</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </AssetSection>

      {/* Timeline */}
      <AssetSection title="Recent changes">
        <PolicyTimeline events={TIMELINE_EVENTS} />
      </AssetSection>

      {/* Who is affected */}
      <AssetSection title="Who is affected">
        <div className="space-y-3">
          {WHO_IS_AFFECTED.map((item) => (
            <div key={item.role} className="flex gap-4 border border-gray-200 rounded-xl p-4">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{item.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </AssetSection>

      {/* Key dates */}
      <AssetSection title="Key dates">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">GEAP Round 3</p>
              <p className="text-sm font-bold text-gray-900 mt-1">Q1 2025</p>
              <p className="text-xs text-gray-500 mt-0.5">Results & PSA execution</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">RPS target</p>
              <p className="text-sm font-bold text-gray-900 mt-1">35% by 2030</p>
              <p className="text-xs text-gray-500 mt-0.5">Minimum RE share for DUs</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Energy Plan</p>
              <p className="text-sm font-bold text-gray-900 mt-1">15 GW solar by 2040</p>
              <p className="text-xs text-gray-500 mt-0.5">PEP 2023-2050 target</p>
            </div>
          </div>
        </div>
      </AssetSection>

      <CitationList citations={CITATIONS} />

      <AssetCta
        label="Track Philippines energy policy"
        href="/compare?q=Current%20solar%20energy%20policy%20and%20incentives%20in%20the%20Philippines"
      />
    </div>
  );
}
