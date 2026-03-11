import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Vietnam Solar Policy Snapshot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Policy Snapshot',
    tagColor: 'blue',
    title: 'Vietnam Solar Policy Snapshot',
    subtitle: 'FiT successor, DPPA pilot, rooftop rules, grid access — the regulatory landscape for solar energy as of early 2025.',
  });
}
