/**
 * Deep link utilities for the Oda web app.
 *
 * Handles:
 *  - returnUrl: capture & restore post-login destination
 *  - promo code extraction from /promo/:code URLs
 *  - campaign UTM parsing
 */

export const RETURN_URL_KEY = 'oda_return_url';
export const PENDING_PROMO_KEY = 'oda_pending_promo';
export const PENDING_CART_RESTORE_KEY = 'oda_cart_restore';

// ---------------------------------------------------------------------------
// Return URL (post-login redirect)
// ---------------------------------------------------------------------------

export function saveReturnUrl(url: string): void {
  if (typeof sessionStorage === 'undefined') return;
  // Only store safe internal paths
  if (url.startsWith('/') && !url.startsWith('//')) {
    sessionStorage.setItem(RETURN_URL_KEY, url);
  }
}

export function consumeReturnUrl(): string {
  if (typeof sessionStorage === 'undefined') return '/';
  const url = sessionStorage.getItem(RETURN_URL_KEY) ?? '/';
  sessionStorage.removeItem(RETURN_URL_KEY);
  return url;
}

// ---------------------------------------------------------------------------
// Promo codes
// ---------------------------------------------------------------------------

export function savePendingPromo(code: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_PROMO_KEY, code.toUpperCase().trim());
}

export function consumePendingPromo(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const code = sessionStorage.getItem(PENDING_PROMO_KEY);
  if (code) sessionStorage.removeItem(PENDING_PROMO_KEY);
  return code;
}

// ---------------------------------------------------------------------------
// Cart continuation flag
// ---------------------------------------------------------------------------

export function markCartContinuation(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_CART_RESTORE_KEY, '1');
}

export function consumeCartContinuation(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  const flag = sessionStorage.getItem(PENDING_CART_RESTORE_KEY);
  if (flag) sessionStorage.removeItem(PENDING_CART_RESTORE_KEY);
  return flag === '1';
}

// ---------------------------------------------------------------------------
// Admin saved-view parsing
// ---------------------------------------------------------------------------

export interface AdminSavedView {
  view: string;
  filters: Record<string, string>;
}

export function parseAdminViewParams(searchParams: URLSearchParams): AdminSavedView | null {
  const view = searchParams.get('view');
  if (!view) return null;

  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'view') filters[key] = value;
  });

  return { view, filters };
}

// ---------------------------------------------------------------------------
// UTM / campaign tracking helpers
// ---------------------------------------------------------------------------

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export function extractUtm(searchParams: URLSearchParams): UtmParams {
  return {
    source: searchParams.get('utm_source') ?? undefined,
    medium: searchParams.get('utm_medium') ?? undefined,
    campaign: searchParams.get('utm_campaign') ?? undefined,
    content: searchParams.get('utm_content') ?? undefined,
    term: searchParams.get('utm_term') ?? undefined,
  };
}
