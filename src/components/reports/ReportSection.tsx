'use client';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
