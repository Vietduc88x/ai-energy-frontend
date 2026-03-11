'use client';

import { useSession } from '@/hooks/use-session';
import { TopNav, BottomTabs } from '@/components/nav';
import { ToastProvider } from '@/components/error-toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();

  return (
    <ToastProvider>
      <TopNav session={session} />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomTabs session={session} />
    </ToastProvider>
  );
}
