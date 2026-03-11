'use client';

import { FamilyBadge } from './DeliverableBadge';

export interface RiskMatrixSpec {
  type: 'risk_matrix';
  title: string;
  subtitle?: string | null;
  items: Array<{
    risk: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    cause?: string | null;
    mitigation?: string | null;
  }>;
}

const LEVEL_MAP = { low: 0, medium: 1, high: 2 };
const CELL_COLORS = [
  ['bg-green-100', 'bg-yellow-100', 'bg-orange-100'],  // low impact
  ['bg-yellow-100', 'bg-orange-100', 'bg-red-100'],    // medium impact
  ['bg-orange-100', 'bg-red-100', 'bg-red-200'],       // high impact
];

function riskColor(likelihood: string, impact: string): string {
  const l = LEVEL_MAP[likelihood as keyof typeof LEVEL_MAP] ?? 1;
  const i = LEVEL_MAP[impact as keyof typeof LEVEL_MAP] ?? 1;
  return CELL_COLORS[i][l];
}

export function RiskMatrix({ spec }: { spec: RiskMatrixSpec }) {
  if (spec.items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">{spec.title}</h3>
          <FamilyBadge family="matrix" />
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">Starter</span>
        </div>
        {spec.subtitle && <p className="text-xs text-gray-500 mt-0.5">{spec.subtitle}</p>}
        <p className="text-[10px] text-gray-400 mt-1 italic">Likelihood and impact are inferred from text — validate with your team before use.</p>
      </div>

      {/* Grid view */}
      <div className="px-4 py-3">
        {/* 3x3 matrix grid */}
        <div className="mb-3">
          <div className="grid grid-cols-4 gap-px text-center text-[10px] font-medium">
            {/* Header row */}
            <div className="text-gray-400 py-1" />
            <div className="text-gray-500 py-1">Low</div>
            <div className="text-gray-500 py-1">Medium</div>
            <div className="text-gray-500 py-1">High</div>

            {/* Impact rows (high to low) */}
            {(['high', 'medium', 'low'] as const).map(impact => (
              <>
                <div key={`label-${impact}`} className="text-gray-500 py-2 text-right pr-1 capitalize">
                  {impact}
                </div>
                {(['low', 'medium', 'high'] as const).map(likelihood => {
                  const matching = spec.items.filter(
                    item => item.likelihood === likelihood && item.impact === impact,
                  );
                  return (
                    <div
                      key={`${impact}-${likelihood}`}
                      className={`${riskColor(likelihood, impact)} rounded py-2 px-1 min-h-[28px]`}
                    >
                      {matching.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-700">{matching.length}</span>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-8">
            <span>Likelihood &rarr;</span>
            <span>&uarr; Impact</span>
          </div>
        </div>

        {/* Risk list */}
        <div className="space-y-2 border-t border-gray-100 pt-3">
          {spec.items.map((item, i) => (
            <div key={i} className={`rounded-lg p-2.5 ${riskColor(item.likelihood, item.impact)}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-gray-900">{item.risk}</p>
                <div className="flex gap-1 flex-shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                    L:{item.likelihood[0].toUpperCase()}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                    I:{item.impact[0].toUpperCase()}
                  </span>
                </div>
              </div>
              {item.cause && (
                <p className="text-[11px] text-gray-600 mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
              )}
              {item.mitigation && (
                <p className="text-[11px] text-teal-700 mt-0.5">
                  <span className="font-medium">Mitigation:</span> {item.mitigation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
