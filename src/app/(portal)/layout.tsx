'use client';

import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { parseJwtRole } from '@/lib/jwt-payload';
import { useAuthStore } from '@/lib/stores/auth.store';

const SUPPLIER_ROLES = [
  'SUPPLIER_OWNER',
  'SUPPLIER_FINANCE',
  'SUPPLIER_OPERATIONS',
  'BRANCH_MANAGER',
  'PICKER',
  'PACKER',
  'DISPATCH_VERIFIER',
  'RETURNS_OFFICER',
  'SUPPLIER_AUDITOR',
  'SUPPLIER_SUPPORT',
];

const MANUFACTURER_ROLES = ['MANUFACTURER_OWNER', 'MANUFACTURER_STAFF'];

const STAFF_PREVIEW_ROLES = ['SUPER_ADMIN', 'ADMIN'];

function canAccessPortal(role: string | undefined, pathname: string) {
  if (!role) return false;
  if (STAFF_PREVIEW_ROLES.includes(role)) return true;
  if (pathname.startsWith('/portal/supplier')) {
    return SUPPLIER_ROLES.includes(role);
  }
  if (pathname.startsWith('/portal/manufacturer')) {
    return MANUFACTURER_ROLES.includes(role);
  }
  return SUPPLIER_ROLES.includes(role) || MANUFACTURER_ROLES.includes(role);
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, accessToken, updateUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);

  const roleFromJwt = parseJwtRole(accessToken);
  const roleFromStore = (user as { role?: string } | null)?.role;
  const role = roleFromJwt ?? roleFromStore;
  const allowed = canAccessPortal(role, pathname);

  useEffect(() => {
    if (roleFromJwt && roleFromJwt !== roleFromStore) {
      updateUser({ role: roleFromJwt });
    }
  }, [roleFromJwt, roleFromStore, updateUser]);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  useLayoutEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname || '/portal/supplier')}`);
    }
  }, [hydrated, isAuthenticated, router, pathname]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-oda-ivory">
        <p className="text-muted-foreground font-plus-jakarta">Loading session…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-oda-ivory px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground font-plus-jakarta">
          Partner portals are for supplier and manufacturer accounts. Sign in with the correct role or contact Oda support.
        </p>
        <Link href="/" className="rounded-xl bg-oda-green px-5 py-2.5 text-sm font-bold text-white font-plus-jakarta">
          Go to shop
        </Link>
      </div>
    );
  }

  const isSupplier = pathname.startsWith('/portal/supplier');

  return (
    <div className="min-h-screen bg-oda-ivory">
      <header className="border-b border-oda-charcoal/8 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-oda-charcoal/40 font-plus-jakarta uppercase tracking-wide">Oda Partner</p>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">
            {isSupplier ? 'Supplier Portal' : 'Manufacturer Portal'}
          </h1>
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold font-plus-jakarta">
          {isSupplier ? (
            <>
              <Link href="/portal/supplier" className={pathname === '/portal/supplier' ? 'text-oda-green' : 'text-oda-charcoal/60'}>Queue</Link>
              <Link href="/portal/supplier/finance" className={pathname.includes('/finance') ? 'text-oda-green' : 'text-oda-charcoal/60'}>Finance</Link>
            </>
          ) : (
            <Link href="/portal/manufacturer" className="text-oda-green">Dashboard</Link>
          )}
          <Link href="/admin" className="text-oda-charcoal/40 text-xs">Staff admin</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
