'use client';

import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';
import { CardSkeleton } from '@/components/skeleton';

export default function DashboardPage() {
  const session = useSession();
  const { user, billing, loading } = session;

  return (
    <ProtectedRoute session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Account summary */}
            <div className="border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Account</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-800">{user?.email ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tier</span>
                  <span className="font-medium text-brand-600">{billing?.tier ?? 'free'}</span>
                </div>
              </div>
            </div>

            {/* Plan limits */}
            <div className="border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Plan</h2>
              {billing ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Comparisons/month</span>
                    <span className="font-medium text-gray-800">
                      {billing.limits.comparisonsPerMonth === 'unlimited' ? 'Unlimited' : billing.limits.comparisonsPerMonth}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No billing data available.</p>
              )}
            </div>
          </div>
        )}

        {/* Recent comparisons — placeholder until list endpoint exists */}
        <div className="border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Recent comparisons</h2>
          {/* TODO: call GET /api/v1/compare when list endpoint is confirmed */}
          <p className="text-sm text-gray-500">No recent comparisons to display.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
