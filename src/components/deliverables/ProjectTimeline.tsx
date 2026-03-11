'use client';

export interface ProjectTimelineSpec {
  type: 'project_timeline';
  title: string;
  subtitle?: string | null;
  stages: Array<{
    name: string;
    startOffsetDays: number;
    durationDays: number;
    owner?: string | null;
    dependencies?: string[];
  }>;
}

const STAGE_COLORS = [
  '#0d9488', '#0891b2', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#f97316', '#eab308',
];

export function ProjectTimeline({ spec }: { spec: ProjectTimelineSpec }) {
  if (spec.stages.length === 0) return null;

  const totalDays = Math.max(
    ...spec.stages.map(s => s.startOffsetDays + s.durationDays),
    1,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">Illustrative</span>
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
      </div>

      <div className="px-4 py-3">
        <p className="text-[10px] text-gray-400 mb-2 italic">Durations are estimated defaults — adjust to your project specifics.</p>
        {/* Timeline scale */}
        <div className="flex justify-between text-[10px] text-gray-400 mb-2 px-24">
          <span>Day 0</span>
          <span>Day {Math.round(totalDays / 2)}</span>
          <span>Day {totalDays}</span>
        </div>

        <div className="space-y-2">
          {spec.stages.map((stage, i) => {
            const leftPct = (stage.startOffsetDays / totalDays) * 100;
            const widthPct = (stage.durationDays / totalDays) * 100;
            const color = STAGE_COLORS[i % STAGE_COLORS.length];

            return (
              <div key={i} className="flex items-center gap-2">
                {/* Stage name */}
                <span className="text-xs text-gray-700 w-24 flex-shrink-0 text-right capitalize truncate" title={stage.name}>
                  {stage.name}
                </span>

                {/* Bar container */}
                <div className="flex-1 relative h-7 bg-gray-50 rounded">
                  <div
                    className="absolute top-0.5 bottom-0.5 rounded flex items-center px-1.5 overflow-hidden"
                    style={{
                      left: `${leftPct}%`,
                      width: `${Math.max(widthPct, 2)}%`,
                      backgroundColor: color,
                      opacity: 0.75,
                    }}
                  >
                    <span className="text-[10px] font-medium text-white truncate">
                      {stage.durationDays}d
                    </span>
                  </div>
                </div>

                {/* Owner */}
                <span className="text-[10px] text-gray-400 w-28 flex-shrink-0 truncate hidden sm:block" title={stage.owner || ''}>
                  {stage.owner || ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
