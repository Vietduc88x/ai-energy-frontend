interface Props {
  title: string;
  children: React.ReactNode;
}

export function AssetSection({ title, children }: Props) {
  return (
    <section className="max-w-3xl mx-auto py-6">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}
