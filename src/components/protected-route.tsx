'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { SessionState } from '@/hooks/use-session';

interface Props {
  session: SessionState;
  adminOnly?: boolean;
  children: React.ReactNode;
}

function ProtectedRouteInner({ session, adminOnly, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = session;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Preserve the full URL so sign-in can redirect back (including ?q= params)
      const returnUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      router.replace(`/auth/signin?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }
    if (adminOnly && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, adminOnly, router, pathname, searchParams]);

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

/** Redirects unauthenticated users to signin. Blocks non-admins from admin routes. */
export function ProtectedRoute(props: Props) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="skeleton w-64 h-8" />
      </div>
    }>
      <ProtectedRouteInner {...props} />
    </Suspense>
  );
}
