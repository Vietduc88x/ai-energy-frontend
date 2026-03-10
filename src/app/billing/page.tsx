'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/components/error-toast';
import { ProtectedRoute } from '@/components/protected-route';
import { PlanCard } from '@/components/plan-card';
import { CardSkeleton } from '@/components/skeleton';
import { createCheckout } from '@/lib/api-client';

const PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    features: ['5 comparisons/month', 'CSV export', 'Community access'],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '$29',
    features: ['Unlimited comparisons', 'JSON + CSV export', 'API key access', 'Priority support'],
  },
  {
    key: 'team' as const,
    name: 'Team',
    price: '$99',
    features: ['Everything in Pro', 'Team sharing', 'Custom integrations', 'Dedicated support'],
  },
];

export default function BillingPage() {
  const session = useSession();
  const { showError } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const currentTier = session.billing?.tier ?? 'free';

  const handleUpgrade = async (plan: 'pro' | 'team') => {
    setCheckoutLoading(plan);
    const res = await createCheckout(plan);
    if (res.data?.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else if (res.error?.status === 503) {
      showError('Billing is not configured yet. Please contact support.');
    } else {
      showError(res.error?.message ?? 'Failed to start checkout');
    }
    setCheckoutLoading(null);
  };

  return (
    <ProtectedRoute session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Billing</h1>

        {session.loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <PlanCard
                key={p.key}
                name={p.name}
                price={p.price}
                features={p.features}
                current={p.key === currentTier}
                loading={checkoutLoading === p.key}
                onUpgrade={p.key !== 'free' ? () => handleUpgrade(p.key as 'pro' | 'team') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
