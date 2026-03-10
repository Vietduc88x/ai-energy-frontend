'use client';

import { clsx } from 'clsx';

interface Props {
  name: string;
  price: string;
  features: string[];
  current?: boolean;
  onUpgrade?: () => void;
  loading?: boolean;
}

export function PlanCard({ name, price, features, current, onUpgrade, loading }: Props) {
  return (
    <div className={clsx(
      'border rounded-xl p-6 flex flex-col',
      current ? 'border-brand-400 bg-brand-50' : 'border-gray-200',
    )}>
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-2xl font-bold mt-1">
        {price}<span className="text-sm font-normal text-gray-500">/mo</span>
      </p>
      <ul className="mt-4 space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-brand-500 mt-0.5">+</span>
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <p className="mt-4 text-center text-sm text-brand-600 font-medium">Current plan</p>
      ) : (
        <button
          onClick={onUpgrade}
          disabled={loading}
          className={clsx(
            'mt-4 w-full py-3 rounded-lg font-medium text-sm text-white touch-target',
            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600',
          )}
        >
          {loading ? 'Processing...' : `Upgrade to ${name}`}
        </button>
      )}
    </div>
  );
}
