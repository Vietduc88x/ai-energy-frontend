'use client';

import { useEffect, useState } from 'react';
import { getSampleQueries, type SampleQueryEntry, type CompareRequest } from '@/lib/api-client';

interface Props {
  onSelect: (query: CompareRequest) => void;
}

export function SampleQueryChips({ onSelect }: Props) {
  const [queries, setQueries] = useState<SampleQueryEntry[]>([]);

  useEffect(() => {
    getSampleQueries().then((res) => {
      if (res.data?.queries) setQueries(res.data.queries);
    });
  }, []);

  if (queries.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {queries.map((q) => (
        <button
          key={q.label}
          onClick={() => onSelect(q.query)}
          className="flex-shrink-0 text-xs px-3 py-2 rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 touch-target whitespace-nowrap"
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
