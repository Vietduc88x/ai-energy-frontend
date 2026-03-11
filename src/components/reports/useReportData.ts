'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getExportReport } from '@/lib/api-client';

/**
 * Reads report data from:
 *   1. ?id=<uuid>   — fetch from backend (durable, shareable)
 *   2. ?data=<json>  — inline URL data (fallback)
 *   3. ?key=<key>    — sessionStorage (legacy fallback)
 *
 * Returns { data, error, loading }.
 */
export function useReportData<T>(): { data: T | null; error: string | null; loading: boolean } {
  const params = useSearchParams();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportId = params.get('id');
    const encoded = params.get('data');
    const storageKey = params.get('key');

    // Priority 1: fetch by ID from backend
    if (reportId) {
      setLoading(true);
      getExportReport(reportId).then(({ data: result, error: err }) => {
        if (err) {
          setError(err.status === 404 ? 'Report not found.' : err.message);
        } else if (result) {
          setData((result.report as T) ?? null);
        }
        setLoading(false);
      });
      return;
    }

    // Priority 2: inline URL data
    if (encoded) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encoded));
        setData(parsed.report ?? parsed);
      } catch {
        setError('Invalid report data.');
      }
      setLoading(false);
      return;
    }

    // Priority 3: sessionStorage fallback
    if (storageKey) {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        sessionStorage.removeItem(storageKey);
        try {
          const parsed = JSON.parse(raw);
          setData(parsed.report ?? parsed);
        } catch {
          setError('Invalid report data.');
        }
      } else {
        setError('Report data expired. Please generate the report again.');
      }
      setLoading(false);
      return;
    }

    setError('No report data provided.');
    setLoading(false);
  }, [params]);

  return { data, error, loading };
}
