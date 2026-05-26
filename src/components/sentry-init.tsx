'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

let initialized = false;

/** Client-side Sentry init when NEXT_PUBLIC_SENTRY_DSN is configured. */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
    if (!dsn || initialized) return;

    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    });
    initialized = true;
  }, []);

  return null;
}
