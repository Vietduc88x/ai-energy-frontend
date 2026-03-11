import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Battery Storage Cost Trends: 2020-2024';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Cost Trends',
    tagColor: 'emerald',
    title: 'Battery Storage Cost Trends: 2020-2024',
    subtitle: 'Li-ion pack prices, grid-scale CAPEX, and LCOS from IRENA, Lazard, BNEF, and NREL — plus what\'s driving the decline.',
  });
}
