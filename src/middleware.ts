import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for the Oda web app.
 *
 * Handles:
 *  - `/track/:id` → `/orders/:id`.
 *  - `/promo/:code` persists promo cookie, redirects home (or `/categories/:slug`).
 *  - Protected routes (see PROTECTED_PREFIXES) redirect to `/login` with `returnUrl` cookie when unauthenticated (`/admin` pairs with RBAC layout).
 *  - `/checkout?continue=1` passes through with `x-oda-cart-restore` header hint.
 */

const RETURN_URL_COOKIE = 'oda_return_url';
const PENDING_PROMO_COOKIE = 'oda_pending_promo';

// Routes that require authentication (prefix match)
const PROTECTED_PREFIXES = [
  '/orders',
  '/account',
  '/wallet',
  '/loyalty',
  '/checkout',
  '/recurring',
  '/returns',
  '/support',
  '/b2b',
  '/admin',
];

// Routes that are always public
const PUBLIC_PREFIXES = [
  '/login',
  '/consent',
  '/legal',
  '/_next',
  '/api',
  '/favicon',
];

function isProtected(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthenticated(req: NextRequest): boolean {
  // Check for access token cookie (set by auth flow)
  return !!req.cookies.get('oda_access_token')?.value;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ------------------------------------------------------------------
  // 1. /track/:id → /orders/:id (order tracking alias)
  // ------------------------------------------------------------------
  const trackMatch = pathname.match(/^\/track\/(.+)$/);
  if (trackMatch) {
    const url = req.nextUrl.clone();
    url.pathname = `/orders/${trackMatch[1]}`;
    url.searchParams.set('focus', 'eta');
    return NextResponse.redirect(url, { status: 301 });
  }

  // ------------------------------------------------------------------
  // 2. /promo/:code → store promo, redirect to homepage
  // ------------------------------------------------------------------
  const promoMatch = pathname.match(/^\/promo\/([A-Z0-9_-]+)$/i);
  if (promoMatch) {
    const code = promoMatch[1].toUpperCase();
    const url = req.nextUrl.clone();

    // Check if there's a category or product context
    const category = searchParams.get('category');
    url.pathname = category ? `/categories/${category}` : '/';
    url.search = '';

    const response = NextResponse.redirect(url);
    response.cookies.set(PENDING_PROMO_COOKIE, code, {
      path: '/',
      maxAge: 60 * 30, // 30 min
      sameSite: 'lax',
    });
    return response;
  }

  // ------------------------------------------------------------------
  // 3. Auth guard — capture returnUrl on protected routes
  // ------------------------------------------------------------------
  if (isProtected(pathname) && !isAuthenticated(req)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';

    const returnUrl = pathname + (req.nextUrl.search ?? '');
    loginUrl.searchParams.set('returnUrl', returnUrl);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(RETURN_URL_COOKIE, returnUrl, {
      path: '/',
      maxAge: 60 * 15, // 15 min
      httpOnly: true,
      sameSite: 'lax',
    });
    return response;
  }

  // ------------------------------------------------------------------
  // 4. /checkout?continue=1 — mark cart restoration (pass through)
  // ------------------------------------------------------------------
  if (pathname === '/checkout' && searchParams.get('continue') === '1') {
    const response = NextResponse.next();
    response.headers.set('x-oda-cart-restore', '1');
    return response;
  }

  // ------------------------------------------------------------------
  // 5. Admin saved views — ensure params are forwarded correctly
  //    /admin?view=:name → rewrite so server component can read
  // ------------------------------------------------------------------
  if (pathname.startsWith('/admin') && searchParams.has('view')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
