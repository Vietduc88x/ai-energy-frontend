'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface Props {
  onSubmit: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function QueryInput({ onSubmit, loading, placeholder = 'Compare LCOE for solar vs wind...' }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Desktop layout */}
      <div className="hidden md:flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className={clsx(
            'px-6 py-3 rounded-lg font-medium text-sm text-white touch-target',
            loading || !value.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600',
          )}
        >
          {loading ? 'Running...' : 'Compare'}
        </button>
      </div>

      {/* Mobile layout — sticky bottom composer */}
      <div className="md:hidden fixed bottom-16 inset-x-0 bg-white border-t p-3 pb-safe z-30">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className={clsx(
              'px-5 py-3 rounded-lg font-medium text-sm text-white touch-target min-w-[44px]',
              loading || !value.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600',
            )}
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>
      </div>
    </form>
  );
}
