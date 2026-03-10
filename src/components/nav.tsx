'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { SessionState } from '@/hooks/use-session';

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-emerald-100 text-emerald-700',
  team: 'bg-emerald-500 text-white',
};

interface NavProps {
  session: SessionState;
}

export function TopNav({ session }: NavProps) {
  const { user, billing, loading, signOut } = session;
  const tier = billing?.tier ?? 'free';

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-bold text-gray-900">Energy Analyst</span>
      </Link>
      <nav className="flex items-center gap-1">
        <NavLink href="/compare">Chat</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/billing">Billing</NavLink>
        {user?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
      </nav>
      <div className="flex items-center gap-3">
        {!loading && user && (
          <>
            <span className={clsx('text-[11px] px-2.5 py-1 rounded-full font-semibold', TIER_COLORS[tier])}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
            <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-700 touch-target transition-colors">
              Sign out
            </button>
          </>
        )}
        {!loading && !user && (
          <Link href="/auth/signin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 touch-target transition-colors">
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-40 pb-safe flex justify-around">
      <Tab href="/" label="Home" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      } />
      <Tab href="/compare" label="Chat" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      } />
      <Tab href="/dashboard" label="Dashboard" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      } />
      <Tab href="/billing" label="Billing" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      } />
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={clsx(
        'touch-target flex items-center px-3 py-1.5 rounded-lg text-sm transition-all',
        active
          ? 'bg-emerald-50 text-emerald-700 font-semibold'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
      )}
    >
      {children}
    </Link>
  );
}

function Tab({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={clsx(
        'touch-target flex flex-col items-center justify-center py-2 px-3 text-[10px] font-medium transition-colors',
        active ? 'text-emerald-600' : 'text-gray-400',
      )}
    >
      {icon}
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}
