import type { Metadata } from 'next';
import { AssetHero } from '@/components/assets/AssetHero';
import { AssetSection } from '@/components/assets/AssetSection';
import { AssetCta } from '@/components/assets/AssetCta';
import { CitationList } from '@/components/assets/CitationList';
import { ChecklistGroup } from '@/components/assets/ChecklistGroup';

const TITLE = 'Project Guidance for Hybrid PV + BESS';
const DESCRIPTION = 'Structured project guidance for hybrid solar PV and battery storage projects: technical due diligence, EPC review, contract management, risk register, and document requests.';
const URL = 'https://agent.techmadeeasy.info/guides/project-guidance-hybrid-pv-bess';

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

const TDD_ITEMS = [
  { text: 'Verify solar resource assessment methodology (P50/P75/P90 yield estimates)', source: 'IFC Solar Guide' },
  { text: 'Review battery degradation model and warranty terms (cycle life, calendar life, capacity fade)', source: 'IFC BESS Standards' },
  { text: 'Confirm inverter sizing ratio and clipping losses for DC-coupled vs AC-coupled topology', source: 'NREL' },
  { text: 'Assess interconnection study results and grid code compliance (frequency response, ramp rates)', source: 'IFC' },
  { text: 'Validate energy yield model inputs: GHI/DNI source, soiling assumptions, temperature coefficients', source: 'IFC Solar Guide' },
  { text: 'Review battery thermal management design (HVAC sizing, container ventilation, fire suppression)', source: 'NFPA 855' },
  { text: 'Confirm O&M strategy covers both PV and BESS with defined response times and spare parts inventory', source: 'World Bank' },
];

const EPC_ITEMS = [
  { text: 'Is the EPC scope clearly split between PV and BESS, or is it a single wrap contract?', source: 'IFC EPC Guide' },
  { text: 'How is battery performance guarantee structured — throughput (MWh) or capacity retention (%)?', source: 'IFC BESS Standards' },
  { text: 'What are the liquidated damages for delay, performance shortfall, and availability guarantee?', source: 'FIDIC Silver Book' },
  { text: 'Does the EPC contractor carry adequate insurance for BESS-specific risks (thermal runaway, electrolyte leakage)?', source: 'IFC' },
  { text: 'What is the defects notification period, and does it align with the battery warranty timeline?', source: 'FIDIC' },
  { text: 'Is there a provisional acceptance milestone for BESS commissioning separate from PV energization?', source: 'World Bank' },
];

const CONTRACT_ITEMS = [
  { text: 'PPA pricing structure: fixed vs escalating tariff, and treatment of BESS dispatch revenue', source: 'IFC' },
  { text: 'Curtailment risk allocation: who bears grid curtailment losses — developer or offtaker?', source: 'World Bank' },
  { text: 'Change in law provisions: coverage for battery-specific regulatory changes (e.g., storage mandates)', source: 'FIDIC' },
  { text: 'Module and cell supplier warranties: bankability assessment, parent company guarantee requirements', source: 'IFC Solar Guide' },
  { text: 'BESS augmentation obligations: who pays for capacity top-up to maintain guaranteed energy throughput?', source: 'IFC BESS Standards' },
];

const RISK_ITEMS = [
  { text: 'Battery thermal runaway propagation — fire suppression adequacy and site layout separation distances', source: 'NFPA 855' },
  { text: 'Technology obsolescence — BESS cell chemistry may shift (LFP vs NMC) during project development timeline', source: 'BNEF' },
  { text: 'Revenue model risk — arbitrage and ancillary service revenue depends on market design and grid conditions', source: 'IFC' },
  { text: 'Supply chain concentration — module and cell suppliers concentrated in limited geographies', source: 'IEA' },
  { text: 'Interconnection delay — grid upgrade requirements may extend timeline by 12-24 months', source: 'World Bank' },
  { text: 'Permitting complexity — hybrid projects may trigger separate permitting for generation and storage components', source: 'IRENA' },
];

const DOCUMENT_ITEMS = [
  { text: 'Independent Engineer\'s solar resource assessment report (TMY data, uncertainty analysis)' },
  { text: 'Battery manufacturer technical datasheet and cycle life test certificates (IEC 62660)' },
  { text: 'Grid interconnection study and system impact study results' },
  { text: 'Environmental and social impact assessment (ESIA) covering both PV and BESS footprint' },
  { text: 'EPC contractor\'s track record: list of completed hybrid/BESS projects with references' },
  { text: 'Insurance broker\'s report on BESS-specific coverage (property, business interruption, liability)' },
  { text: 'Land lease and access agreements, including easements for transmission line routing' },
  { text: 'O&M contractor proposal with BESS-specific KPIs (round-trip efficiency, availability, response time)' },
];

const CITATIONS = [
  { source: 'IFC', title: 'Utility-Scale Solar Photovoltaic Power Plants: A Project Developer\'s Guide', year: 2015 },
  { source: 'IFC', title: 'Energy Storage Standards and Best Practices', year: 2023 },
  { source: 'World Bank', title: 'Grid-Scale Battery Storage: Technical and Economic Assessment', year: 2023 },
  { source: 'NREL', title: 'Best Practices for Solar + Storage Projects', year: 2024 },
  { source: 'FIDIC', title: 'Conditions of Contract for EPC/Turnkey Projects (Silver Book)', year: 2017 },
  { source: 'NFPA', title: 'NFPA 855 — Standard for the Installation of Stationary Energy Storage Systems', year: 2023 },
];

export default function ProjectGuidancePage() {
  return (
    <div className="pb-8">
      <AssetHero
        tag="Project Guidance"
        tagColor="amber"
        title="Project Guidance for Hybrid PV + BESS"
        subtitle="Structured guidance for reviewing, procuring, and delivering hybrid solar PV and battery storage projects — from feasibility through construction."
        shareUrl={URL}
      />

      {/* Intro context */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">What this covers</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            Hybrid PV + BESS projects combine the complexity of solar development with battery-specific risks around
            thermal management, degradation, and revenue model uncertainty. This page consolidates technical due diligence
            checks, EPC review questions, contract considerations, key risks, and document requests — drawn from
            IFC, World Bank, NREL, and industry standard practices.
          </p>
        </div>
      </section>

      {/* TDD */}
      <AssetSection title="Technical due diligence">
        <ChecklistGroup
          title="Feasibility & design review"
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          }
          items={TDD_ITEMS}
        />
      </AssetSection>

      {/* EPC */}
      <AssetSection title="EPC review questions">
        <ChecklistGroup
          title="Construction contract review"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.385 5.385a1.5 1.5 0 01-2.121-2.121l5.384-5.385m2.121 2.121L15.96 11.63a4.5 4.5 0 00-6.364-6.364L6.06 8.803m5.36 5.367l2.121 2.121" />
            </svg>
          }
          items={EPC_ITEMS}
        />
      </AssetSection>

      {/* Contract & Procurement */}
      <AssetSection title="Contract & procurement">
        <ChecklistGroup
          title="Key contract considerations"
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          items={CONTRACT_ITEMS}
        />
      </AssetSection>

      {/* Risks */}
      <AssetSection title="Key project risks">
        <div className="space-y-2.5">
          {RISK_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-3 border border-gray-200 rounded-xl p-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
                {item.source && <p className="text-[11px] text-gray-400 mt-1">Source: {item.source}</p>}
              </div>
            </div>
          ))}
        </div>
      </AssetSection>

      {/* Documents */}
      <AssetSection title="Documents to request">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <ol className="space-y-2.5">
            {DOCUMENT_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </AssetSection>

      <CitationList citations={CITATIONS} />

      <AssetCta
        label="Generate your own project guidance"
        href="/compare?q=Project%20guidance%20for%20hybrid%20PV%20%2B%20BESS%20development"
      />
    </div>
  );
}
