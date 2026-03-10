'use client';

import { clsx } from 'clsx';

interface Props {
  used: number;
  limit: number;
  label?: string;
}

export function UsageMeter({ used, limit, label = 'Comparisons this month' }: Props) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={clsx('font-medium', isHigh ? 'text-red-600' : 'text-gray-800')}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', isHigh ? 'bg-red-500' : 'bg-brand-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
