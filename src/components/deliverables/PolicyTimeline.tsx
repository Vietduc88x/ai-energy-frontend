'use client';

export interface PolicyTimelineSpec {
  type: 'policy_timeline';
  title: string;
  jurisdiction: string;
  subtitle?: string | null;
  events: Array<{
    date: string;
    label: string;
    eventType: string;
    significance: string;
    source?: string | null;
    severity?: 'high' | 'medium' | 'low' | null;
  }>;
}

const SEVERITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-400',
};

export function PolicyTimeline({ spec }: { spec: PolicyTimelineSpec }) {
  if (spec.events.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-3">
            {spec.events.map((event, i) => {
              const dotColor = event.severity
                ? SEVERITY_COLORS[event.severity]
                : 'bg-blue-500';

              return (
                <div key={i} className="flex gap-3 items-start">
                  {/* Date */}
                  <span className="text-xs font-mono text-gray-500 w-[66px] flex-shrink-0 text-right pt-0.5">
                    {event.date}
                  </span>

                  {/* Dot */}
                  <div className="flex-shrink-0 mt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-2 ring-white`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-xs font-medium text-gray-900">{event.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{event.significance}</p>
                    {event.source && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{event.source}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
