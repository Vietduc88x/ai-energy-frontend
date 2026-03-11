'use client';

interface ReportHeaderProps {
  title: string;
  subtitle?: string | null;
  generatedAt: string;
  confidence?: 'high' | 'medium' | 'low' | null;
  onPrint?: () => void;
}

const CONFIDENCE_STYLES = {
  high: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-red-100 text-red-800',
};

export function ReportHeader({ title, subtitle, generatedAt, confidence, onPrint }: ReportHeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="border-b-2 border-gray-900 pb-4 mb-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            AI Energy Analyst
          </p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 print:block">
          <p className="text-xs text-gray-400">Generated</p>
          <p className="text-sm font-medium text-gray-600">{formattedDate}</p>
          {confidence && (
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mt-1 ${CONFIDENCE_STYLES[confidence]}`}>
              {confidence} confidence
            </span>
          )}
        </div>
      </div>
      {onPrint && (
        <button
          onClick={onPrint}
          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 print:hidden flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Save as PDF / Print
        </button>
      )}
    </header>
  );
}
