import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Project Guidance for Hybrid PV + BESS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Project Guidance',
    tagColor: 'amber',
    title: 'Project Guidance for Hybrid PV + BESS',
    subtitle: 'Technical due diligence, EPC review, contract management, risk register — structured guidance from IFC, World Bank, and NREL.',
  });
}
