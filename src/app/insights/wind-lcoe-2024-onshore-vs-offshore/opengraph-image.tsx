import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Wind LCOE 2024: Onshore vs Offshore Benchmark';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Benchmark Comparison',
    tagColor: 'emerald',
    title: 'Wind LCOE 2024: Onshore vs Offshore',
    subtitle: 'Onshore wind is the cheapest new electricity in many markets. Offshore is catching up. See the multi-source data.',
  });
}
