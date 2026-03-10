interface Citation {
  source: string;
  title: string;
  year: number;
  url?: string;
}

interface Props {
  citations: Citation[];
}

export function CitationList({ citations }: Props) {
  return (
    <section className="max-w-3xl mx-auto py-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Sources</h3>
      <div className="space-y-2">
        {citations.map((c, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="text-gray-300 font-mono text-xs mt-0.5">[{i + 1}]</span>
            <div>
              <span className="font-medium text-gray-700">{c.source}</span>
              <span className="text-gray-400"> — </span>
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  {c.title}
                </a>
              ) : (
                <span className="text-gray-600">{c.title}</span>
              )}
              <span className="text-gray-400"> ({c.year})</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
