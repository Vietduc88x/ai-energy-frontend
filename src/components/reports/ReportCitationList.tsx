'use client';

interface Citation {
  source: string;
  title: string;
  url?: string | null;
  date?: string | null;
}

export function ReportCitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-8 pt-4 border-t border-gray-300 break-inside-avoid">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Sources</h2>
      <ol className="space-y-1 list-decimal list-inside">
        {citations.map((cit, i) => (
          <li key={i} className="text-xs text-gray-600">
            <span className="font-medium text-gray-800">{cit.source}</span>
            {' — '}
            {cit.url ? (
              <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline print:text-gray-800 print:no-underline">
                {cit.title}
              </a>
            ) : (
              <span>{cit.title}</span>
            )}
            {cit.date && <span className="text-gray-400 ml-1">({cit.date})</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
