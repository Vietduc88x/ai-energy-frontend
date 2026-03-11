import { ShareBar } from './ShareBar';

interface Props {
  tag: string;
  tagColor?: 'emerald' | 'blue' | 'amber';
  title: string;
  subtitle: string;
  badge?: string;
  shareUrl?: string;
}

const TAG_STYLES = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
};

export function AssetHero({ tag, tagColor = 'emerald', title, subtitle, badge, shareUrl }: Props) {
  return (
    <section className="pt-10 md:pt-16 pb-8 text-center max-w-3xl mx-auto space-y-4">
      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${TAG_STYLES[tagColor]}`}>
        {tag}
      </span>
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
        {title}
      </h1>
      <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      {badge && (
        <p className="text-xs text-gray-400 italic">{badge}</p>
      )}
      {shareUrl && (
        <div className="flex justify-center pt-1">
          <ShareBar url={shareUrl} title={title} />
        </div>
      )}
    </section>
  );
}
