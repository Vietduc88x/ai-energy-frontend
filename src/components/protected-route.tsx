'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionState } from '@/hooks/use-session';

interface Props {
  session: SessionState;
  adminOnly?: boolean;
  children: React.ReactNode;
}

/** Redirects unauthenticated users to signin. Blocks non-admins from admin routes. */
export function ProtectedRoute({ session, adminOnly, children }: Props) {
  const router = useRouter();
  const { user, loading } = session;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/signin');
      return;
    }
    if (adminOnly && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="skeleton w-64 h-8" />
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && user.role !== 'admin') return null;

  return <>{children}</>;
}
