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
        <NavLink href="/chat">Chat</NavLink>
        <NavLink href="/projects">Projects</NavLink>
        <NavLink href="/assess">Assess</NavLink>
        <NavLink href="/compare">Compare</NavLink>
        <NavLink href="/scenario">Scenario</NavLink>
        <NavLink href="/portfolio">Portfolio</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/settings">Settings</NavLink>
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
      <Tab href="/chat" label="Chat" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      } />
      <Tab href="/projects" label="Projects" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      } />
      <Tab href="/dashboard" label="Dashboard" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      } />
      <Tab href="/settings" label="Settings" icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
