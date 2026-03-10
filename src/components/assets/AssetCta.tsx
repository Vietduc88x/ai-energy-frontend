import Link from 'next/link';

interface Props {
  label: string;
  href: string;
}

export function AssetCta({ label, href }: Props) {
  return (
    <section className="max-w-2xl mx-auto text-center py-12">
      <div className="bg-gray-900 rounded-2xl p-8 md:p-10 shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Ready to go deeper?
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          No credit card required. Get a structured, cited answer in seconds.
        </p>
        <Link
          href={href}
          className="inline-block px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-sm hover:shadow-md"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
