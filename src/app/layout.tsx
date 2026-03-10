'use client';

import './globals.css';
import { useSession } from '@/hooks/use-session';
import { TopNav, BottomTabs } from '@/components/nav';
import { ToastProvider } from '@/components/error-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a8a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Energy AI" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <title>AI Energy Analyst</title>
      </head>
      <body className="min-h-screen-safe bg-gray-50 text-gray-900 pt-safe">
        <ToastProvider>
          <TopNav session={session} />
          <main className="max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6">
            {children}
          </main>
          <BottomTabs session={session} />
        </ToastProvider>
      </body>
    </html>
  );
}
