/**
 * Lightweight client telemetry for B2B shop funnel. Extend with Segment / GA4 / backend
 * `/v1/analytics/events` when product analytics is wired.
 *
 * Auth uses Bearer tokens in `localStorage` (shop session). CSRF is not required for
 * that pattern; refresh cookies should be `SameSite=Lax` or `Strict` on the API.
 */

type TelemetryPayload = Record<string, unknown>;

export function trackB2bEvent(event: string, payload?: TelemetryPayload) {
  if (typeof window === 'undefined') return;
  const body = { event, ts: Date.now(), ...payload };
  if (process.env.NODE_ENV === 'development') {
    console.info('[b2b.telemetry]', body);
  }
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    if (!w.dataLayer) w.dataLayer = [];
    w.dataLayer.push({ event: `b2b_${event}`, ts: Date.now(), ...(payload ?? {}) });
  } catch {
    /* no-op */
  }
}
