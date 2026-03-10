'use client';

import { useRouter } from 'next/navigation';

interface Props {
  tier: string;
  limit: number | 'unlimited';
  suggestedTier?: string;
  onClose: () => void;
}

export function QuotaModal({ tier, limit, suggestedTier, onClose }: Props) {
  const router = useRouter();

  const handleUpgrade = () => {
    // Backend emits upgrade_clicked on POST /billing/checkout — do not duplicate here
    router.push('/billing');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bottom-sheet-backdrop z-50" onClick={onClose} />

      {/* Desktop: centered modal | Mobile: bottom sheet */}
      <div className="fixed z-50 md:inset-0 md:flex md:items-center md:justify-center inset-x-0 bottom-0">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md p-6 pb-safe">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Usage limit reached</h2>
          <p className="text-sm text-gray-600 mb-4">
            You&apos;ve hit the <strong>{limit}</strong> comparisons/month limit on the <strong>{tier}</strong> plan.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current tier</span>
              <span className="font-medium">{tier}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Monthly limit</span>
              <span className="font-medium">{limit}</span>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm touch-target"
          >
            Upgrade to {suggestedTier ?? 'Pro'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 mt-2 text-sm text-gray-500 hover:text-gray-700 touch-target"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
