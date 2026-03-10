'use client';

import { useEffect, useState, useCallback } from 'react';
import type { BillingStatus, UserProfile } from '@/lib/api-client';
import { getBillingStatus, getUserProfile } from '@/lib/api-client';

export interface SessionState {
  user: UserProfile | null;
  billing: BillingStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  signOut: () => Promise<void>;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [profileRes, billingRes] = await Promise.all([
      getUserProfile(),
      getBillingStatus(),
    ]);

    if (profileRes.data) {
      setUser(profileRes.data);
    } else if (profileRes.error?.status === 401) {
      setUser(null);
    } else {
      setError(profileRes.error?.message ?? 'Failed to load session');
    }

    if (billingRes.data) {
      setBilling(billingRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    setUser(null);
    setBilling(null);
  }, []);

  return { user, billing, loading, error, refresh: load, signOut };
}
