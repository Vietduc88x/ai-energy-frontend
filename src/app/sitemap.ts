import type { MetadataRoute } from 'next';

const BASE = 'https://agent.techmadeeasy.info';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    // Landing
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },

    // Compare (public preview)
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },

    // Insights — benchmarks & cost analysis
    { url: `${BASE}/insights/solar-lcoe-2024-irena-vs-lazard-vs-bnef`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/insights/wind-lcoe-2024-onshore-vs-offshore`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/insights/battery-storage-cost-trends-2020-2024`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Policy snapshots
    { url: `${BASE}/policy/vietnam-solar-snapshot`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/policy/philippines-solar-snapshot`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Guides
    { url: `${BASE}/guides/project-guidance-hybrid-pv-bess`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
