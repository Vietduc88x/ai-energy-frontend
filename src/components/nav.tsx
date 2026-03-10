'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { SessionState } from '@/hooks/use-session';

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-200 text-gray-700',
  pro: 'bg-brand-100 text-brand-700',
  team: 'bg-brand-500 text-white',
};

interface NavProps {
  session: SessionState;
}

export function TopNav({ session }: NavProps) {
  const { user, billing, loading, signOut } = session;
  const tier = billing?.tier ?? 'free';

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-40">
      <Link href="/" className="font-bold text-lg text-brand-700">
        Energy Analyst
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <NavLink href="/compare">Compare</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/billing">Billing</NavLink>
        {user?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
      </nav>
      <div className="flex items-center gap-3">
        {!loading && user && (
          <>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', TIER_COLORS[tier])}>
              {tier}
            </span>
            <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-800 touch-target">
              Sign out
            </button>
          </>
        )}
        {!loading && !user && (
          <Link href="/auth/signin" className="text-sm font-medium text-brand-600 hover:text-brand-800 touch-target">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

/** Mobile bottom tab bar — visible only on small screens */
export function BottomTabs({ session }: NavProps) {
  const { user } = session;
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40 pb-safe flex justify-around">
      <Tab href="/" label="Home" icon="H" />
      <Tab href="/compare" label="Compare" icon="C" />
      <Tab href="/dashboard" label="Dashboard" icon="D" />
      <Tab href="/billing" label="Billing" icon="B" />
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={clsx('touch-target flex items-center', active ? 'text-brand-600 font-semibold' : 'text-gray-600 hover:text-gray-900')}
    >
      {children}
    </Link>
  );
}

function Tab({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={clsx(
        'touch-target flex flex-col items-center justify-center py-2 px-3 text-xs',
        active ? 'text-brand-600 font-semibold' : 'text-gray-500',
      )}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
