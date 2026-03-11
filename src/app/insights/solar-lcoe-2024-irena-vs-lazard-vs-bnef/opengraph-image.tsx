import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Solar LCOE 2024: 5-Source Benchmark Comparison';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Benchmark Comparison',
    tagColor: 'emerald',
    title: 'Solar LCOE 2024: IRENA vs Lazard vs BNEF vs EIA vs NREL',
    subtitle: 'Five major sources report solar PV costs — and none of them agree. See the data, understand the differences.',
  });
}
