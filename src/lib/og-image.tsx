import { ImageResponse } from 'next/og';

const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  emerald: { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  blue: { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  amber: { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
};

export function generateOgImage({
  tag,
  tagColor = 'emerald',
  title,
  subtitle,
}: {
  tag: string;
  tagColor?: string;
  title: string;
  subtitle: string;
}) {
  const colors = TAG_COLORS[tagColor] || TAG_COLORS.emerald;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: tag + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: colors.bg,
              border: `2px solid ${colors.dot}30`,
              borderRadius: '999px',
              padding: '8px 20px',
              alignSelf: 'flex-start',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: colors.dot,
              }}
            />
            <span style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>
              {tag}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '22px',
                color: '#64748b',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '900px',
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Bottom: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #34d399, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#374151' }}>
            AI Energy Analyst
          </span>
          <span style={{ fontSize: '18px', color: '#9ca3af', marginLeft: '8px' }}>
            agent.techmadeeasy.info
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
