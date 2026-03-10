'use client';

interface Source {
  title: string;
  source_url?: string | null;
  snippet?: string | null;
}

interface Props {
  sources: Source[];
}

export function CitationList({ sources }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="border-t pt-3 mt-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sources</h4>
      <ol className="space-y-2">
        {sources.map((s, i) => (
          <li key={i} className="text-sm">
            <span className="text-gray-400 mr-1">[{i + 1}]</span>
            {s.source_url ? (
              <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline touch-target inline">
                {s.title}
              </a>
            ) : (
              <span className="text-gray-700">{s.title}</span>
            )}
            {s.snippet && <p className="text-xs text-gray-500 mt-0.5 ml-5">{s.snippet}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
