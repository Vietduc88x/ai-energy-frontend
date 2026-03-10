interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  severity?: 'high' | 'medium' | 'low';
}

interface Props {
  events: TimelineEvent[];
}

const SEVERITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
};

export function PolicyTimeline({ events }: Props) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
      <div className="space-y-5">
        {events.map((evt, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 mt-1.5">
              <div className={`w-[15px] h-[15px] rounded-full border-2 border-white shadow-sm ${SEVERITY_DOT[evt.severity || 'medium']}`} />
            </div>
            <div className="flex-1 pb-1">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{evt.date}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{evt.title}</p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
