import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';
import { PolicyTimeline } from '@/components/assets/PolicyTimeline';

const TITLE = 'Vietnam Solar Policy Snapshot';
const DESCRIPTION = 'Current solar energy policy in Vietnam: FiT successor mechanism, rooftop rules, grid access, and recent regulatory changes for developers and investors.';
const URL = 'https://agent.techmadeeasy.info/policy/vietnam-solar-snapshot';

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

const STATUS_ITEMS = [
  {
    label: 'Feed-in tariff',
    value: 'Expired (FiT 2 ended Dec 2020)',
    detail: 'The 7.09 USc/kWh FiT for ground-mounted and 8.38 USc/kWh for rooftop expired. No direct FiT successor has been enacted.',
  },
  {
    label: 'Current mechanism',
    value: 'Transitional — Direct PPA pilot',
    detail: 'Decision 80/2024/QD-TTg authorizes a direct power purchase agreement (DPPA) pilot for large consumers (>200 kV). Competitive auctions for utility-scale projects are under development.',
  },
  {
    label: 'Rooftop solar',
    value: 'Net metering suspended, self-consumption allowed',
    detail: 'New rooftop installations can self-consume but cannot sell surplus to EVN at a guaranteed price. Circular 01/2024 provides technical requirements for behind-the-meter systems.',
  },
  {
    label: 'Grid access',
    value: 'Constrained in key regions',
    detail: 'Ninh Thuan and Binh Thuan provinces face significant curtailment (20-30% in peak periods). New capacity additions require transmission upgrade confirmation from EVN.',
  },
];

const TIMELINE_EVENTS = [
  {
    date: 'Jan 2025',
    title: 'DPPA pilot implementation rules published',
    description: 'MOIT Circular 02/2025 details eligible buyer criteria, contract templates, and wheeling charge methodology for the DPPA pilot under Decision 80.',
    severity: 'high' as const,
  },
  {
    date: 'Nov 2024',
    title: 'PDP8 implementation plan updated',
    description: 'Prime Minister approved revised Power Development Plan VIII implementation targets: 20 GW solar by 2030, down from initial 27 GW target due to grid constraints.',
    severity: 'high' as const,
  },
  {
    date: 'Sep 2024',
    title: 'Decision 80 — Direct PPA framework',
    description: 'Establishes the legal basis for direct power purchase agreements between renewable generators and large consumers, bypassing EVN as sole buyer.',
    severity: 'high' as const,
  },
  {
    date: 'Jun 2024',
    title: 'Circular on rooftop solar technical standards',
    description: 'MOIT Circular 01/2024 sets technical standards for behind-the-meter rooftop solar: inverter requirements, protection relay specs, and metering obligations.',
    severity: 'medium' as const,
  },
  {
    date: 'Mar 2024',
    title: 'EVN publishes curtailment data',
    description: 'First official disclosure of solar curtailment rates by province. Ninh Thuan reported 28% average curtailment in Q1 2024.',
    severity: 'medium' as const,
  },
  {
    date: 'Dec 2023',
    title: 'Competitive auction framework proposed',
    description: 'MOIT draft circular proposes auction-based allocation for new utility-scale solar capacity. Target: pilot auctions in 2025 for 2-3 GW.',
    severity: 'low' as const,
  },
];

const WHO_IS_AFFECTED = [
  { role: 'Utility-scale developers', impact: 'No guaranteed offtake mechanism. Must wait for auctions or negotiate bilateral DPPAs with eligible buyers.' },
  { role: 'Rooftop installers', impact: 'Self-consumption economics only. Payback depends entirely on avoided tariff (currently ~1,800-2,900 VND/kWh for commercial).' },
  { role: 'Foreign investors', impact: 'DPPA pilot opens a new entry path. Projects >30 MW in designated zones can contract directly with industrial buyers.' },
  { role: 'Industrial consumers', impact: 'Large consumers (>200 kV connection) can now procure renewable electricity directly, enabling RE100 and ESG commitments.' },
];

const CITATIONS = [
  { source: 'Vietnam PM', title: 'Decision 80/2024/QD-TTg — Direct Power Purchase Agreement Pilot', year: 2024 },
  { source: 'MOIT', title: 'Circular 02/2025 — DPPA Implementation Rules', year: 2025 },
  { source: 'MOIT', title: 'Circular 01/2024 — Rooftop Solar Technical Standards', year: 2024 },
  { source: 'EVN', title: 'Power Development Plan VIII Implementation Report', year: 2024 },
  { source: 'MOIT', title: 'Draft Circular on Competitive Auction Framework', year: 2023 },
];

export default function VietnamSolarPolicyPage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Policy Snapshot"
        tagColor="blue"
        title="Vietnam Solar Policy Snapshot"
        subtitle="The regulatory landscape for solar energy in Vietnam as of early 2025 — current mechanisms, recent changes, and what's next for developers and investors."
        badge="Last updated: March 2025"
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">DPPA pilot</p>
              <p className="text-sm font-bold text-gray-900 mt-1">Q1 2025</p>
              <p className="text-xs text-gray-500 mt-0.5">First contracts expected</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Auction pilot</p>
              <p className="text-sm font-bold text-gray-900 mt-1">H2 2025 (target)</p>
              <p className="text-xs text-gray-500 mt-0.5">2-3 GW initial capacity</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">PDP8 review</p>
              <p className="text-sm font-bold text-gray-900 mt-1">2026</p>
              <p className="text-xs text-gray-500 mt-0.5">Mid-term capacity target revision</p>
            </div>
          </div>
        </div>
      </AssetSection>

      <CitationList citations={CITATIONS} />

      <AssetCta
        label="Track your market"
        href="/compare?q=Current%20solar%20energy%20policy%20and%20regulations%20in%20Vietnam"
      />
    </div>
  );
}
