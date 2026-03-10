'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBillingStatus } from '@/lib/api-client';

export default function BillingSuccessPage() {
  const [tier, setTier] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const attempts = useRef(0);
  const maxAttempts = 20; // ~60s at 3s intervals

  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      attempts.current++;
      const res = await getBillingStatus();

      if (res.data && (res.data.tier === 'pro' || res.data.tier === 'team')) {
        setTier(res.data.tier);
        setPolling(false);
      }

      if (attempts.current >= maxAttempts) {
        setPolling(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling]);

  return (
    <div className="max-w-md mx-auto text-center pt-12 space-y-6">
      {polling && (
        <>
          <div className="skeleton w-16 h-16 rounded-full mx-auto" />
          <h1 className="text-2xl font-bold">Processing your payment...</h1>
          <p className="text-sm text-gray-600">
            This usually takes a few seconds. Do not close this page.
          </p>
        </>
      )}

      {!polling && tier && (
        <>
          <div className="text-5xl">+</div>
          <h1 className="text-2xl font-bold text-brand-700">Welcome to {tier}!</h1>
          <p className="text-sm text-gray-600">
            Your account has been upgraded. All {tier} features are now unlocked.
          </p>
          <Link
            href="/compare"
            className="inline-block px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm touch-target"
          >
            Start comparing
          </Link>
        </>
      )}

      {!polling && !tier && (
        <>
          <h1 className="text-2xl font-bold">Almost there</h1>
          <p className="text-sm text-gray-600">
            Your payment may still be processing. Check your email or refresh in a few minutes.
          </p>
          <button
            onClick={() => { attempts.current = 0; setPolling(true); }}
            className="px-6 py-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 touch-target"
          >
            Check again
          </button>
        </>
      )}
    </div>
  );
}
