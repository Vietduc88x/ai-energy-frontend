interface CheckItem {
  text: string;
  source?: string;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  items: CheckItem[];
  color?: 'emerald' | 'blue' | 'amber';
}

const COLOR_STYLES = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', check: 'text-emerald-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', check: 'text-blue-400' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', check: 'text-amber-400' },
};

export function ChecklistGroup({ title, icon, items, color = 'emerald' }: Props) {
  const s = COLOR_STYLES[color];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className={s.icon}>{icon}</span>}
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">
              {item.text}
              {item.source && <span className="text-gray-400 text-xs ml-1">({item.source})</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
