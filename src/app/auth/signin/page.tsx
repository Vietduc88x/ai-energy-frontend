'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/hooks/use-analytics';

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackOnce } = useAnalytics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('google_signup') === '1') {
      trackOnce('signup_completed', { method: 'google' });
      router.replace('/compare');
      return;
    }

    if (searchParams.get('authError') === 'google') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [router, searchParams, trackOnce]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'signin' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || body.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        trackOnce('signup_completed', { method: 'email' });
      }

      router.push('/compare');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    // OAuth must go directly to the backend (not via Next.js proxy)
    // so the state cookie is set on the same domain as the callback.
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await fetch(`${apiBase}/api/auth/sign-in/social`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: `${window.location.origin}/compare`,
          newUserCallbackURL: `${window.location.origin}/auth/signin?google_signup=1`,
          errorCallbackURL: `${window.location.origin}/auth/signin?authError=google`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.url) {
        // Better Auth returns a redirect URL to Google's OAuth page
        window.location.href = data.url;
      } else {
        setError('Failed to start Google sign-in');
        setGoogleLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-12 space-y-6">
      <h1 className="text-2xl font-bold text-center">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium text-sm touch-target disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or use email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm touch-target disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {mode === 'signin' ? (
          <>
            No account?{' '}
            <button onClick={() => setMode('signup')} className="text-brand-600 font-medium hover:underline touch-target">
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} className="text-brand-600 font-medium hover:underline touch-target">
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto pt-12 text-center text-sm text-gray-500">Loading sign-in...</div>}>
      <SignInPageContent />
    </Suspense>
  );
}
