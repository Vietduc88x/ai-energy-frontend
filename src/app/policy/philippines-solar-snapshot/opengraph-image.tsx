import { generateOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const alt = 'Philippines Solar Policy Snapshot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateOgImage({
    tag: 'Policy Snapshot',
    tagColor: 'blue',
    title: 'Philippines Solar Policy Snapshot',
    subtitle: 'Green Energy Auction, net metering, RPS, 100% foreign ownership — the regulatory landscape for solar in the Philippines.',
  });
}
