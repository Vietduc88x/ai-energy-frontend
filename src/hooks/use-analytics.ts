'use client';

import { useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/api-client';

/** Deduplicated analytics hook — prevents double-firing the same event. */
export function useAnalytics() {
  const firedRef = useRef<Set<string>>(new Set());

  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      const deviceContext = {
        device_type: getDeviceType(),
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '0x0',
        is_pwa: typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(display-mode: standalone)').matches
          : false,
      };

      const key = `${eventName}:${JSON.stringify(properties ?? {})}`;
      if (firedRef.current.has(key)) return;
      firedRef.current.add(key);

      trackEvent(eventName, { ...deviceContext, ...properties });
    },
    [],
  );

  /** Fire once per session — e.g., signup_completed */
  const trackOnce = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      const sessionKey = `ea_evt_${eventName}`;
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) return;
      track(eventName, properties);
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(sessionKey, '1');
    },
    [track],
  );

  return { track, trackOnce };
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}
