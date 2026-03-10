'use client';

export interface FunnelRow {
  date: string;
  [key: string]: string | number;
}

const STEPS = [
  { key: 'demo_loaded', label: 'Demo loaded' },
  { key: 'comparison_started', label: 'Compare started' },
  { key: 'comparison_succeeded', label: 'Compare succeeded' },
  { key: 'quota_hit', label: 'Quota hit' },
  { key: 'upgrade_clicked', label: 'Upgrade clicked' },
  { key: 'subscription_activated', label: 'Subscribed' },
] as const;

interface Props {
  data: FunnelRow[];
}

export function FunnelTable({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No funnel data yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600 border-b">Date</th>
            {STEPS.map((s) => (
              <th key={s.key} className="px-3 py-2 text-right font-medium text-gray-600 border-b">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date} className="border-b last:border-b-0 hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{row.date}</td>
              {STEPS.map((s) => (
                <td key={s.key} className="px-3 py-2 text-right text-gray-800">
                  {row[s.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
