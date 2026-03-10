'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDemoComparison, type ComparisonResult } from '@/lib/api-client';
import { ComparisonTable } from '@/components/comparison-table';
import { CardSkeleton } from '@/components/skeleton';

export default function LandingPage() {
  const [demo, setDemo] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDemo = async () => {
    setLoading(true);
    setError(null);
    const res = await getDemoComparison();
    // Backend emits demo_loaded on GET /compare/demo/* — do not duplicate here
    if (res.data) {
      setDemo(res.data);
    } else {
      setError(res.error?.message ?? 'Failed to load demo');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center pt-8 md:pt-16 space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          AI-powered energy market intelligence
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Compare LCOE, CAPEX, and capacity factors across technologies and regions. Backed by IRENA, Lazard, EIA, and BloombergNEF data.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={loadDemo}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm touch-target"
          >
            {loading ? 'Loading...' : 'Try demo — Solar LCOE 2024'}
          </button>
          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm touch-target text-center"
          >
            Sign in to compare anything
          </Link>
        </div>
      </section>

      {/* Demo result */}
      {loading && (
        <section className="max-w-3xl mx-auto">
          <CardSkeleton />
        </section>
      )}

      {error && (
        <section className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        </section>
      )}

      {demo && !loading && (
        <section className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-3">Solar LCOE Comparison — 2024</h2>
          <ComparisonTable result={demo} />
        </section>
      )}

      {/* Value props */}
      <section className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[
          { title: 'Trusted data', desc: 'Pre-indexed reports from IRENA, Lazard, EIA, IFC, and BloombergNEF.' },
          { title: 'AI-verified', desc: 'Every answer passes a verifier policy with citation, confidence, and conflict checks.' },
          { title: 'Export & API', desc: 'Download CSV/JSON or integrate via API key for automated workflows.' },
        ].map((v) => (
          <div key={v.title} className="text-center space-y-1">
            <h3 className="font-semibold text-gray-900">{v.title}</h3>
            <p className="text-sm text-gray-600">{v.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
