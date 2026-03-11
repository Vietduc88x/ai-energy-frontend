import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  metadataBase: new URL('https://energyanalyst.ai'),
  title: {
    default: 'AI Energy Analyst',
    template: '%s | AI Energy Analyst',
  },
  description: 'Compare energy costs, track policies, and generate project checklists — backed by IRENA, Lazard, BNEF, EIA, NREL, and IFC.',
  openGraph: {
    siteName: 'AI Energy Analyst',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a8a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Energy AI" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
      </head>
      <body className="min-h-screen-safe bg-gray-50 text-gray-900 pt-safe">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
