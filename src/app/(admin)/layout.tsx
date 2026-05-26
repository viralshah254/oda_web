'use client';

import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { parseJwtRole } from '@/lib/jwt-payload';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Must match Prisma `UserRole` values that can use the admin console UI */
const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUPPORT_AGENT',
  'SENIOR_SUPPORT_AGENT',
  'SUPPORT_MANAGER',
  'B2B_SUPPORT',
  'QA_REVIEWER',
  'PAYMENTS_SUPPORT',
  'ERP_SYNC_ADMIN',
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, accessToken, updateUser } = useAuthStore();
  /** Zustand `persist` rehydrates async; don't redirect to /login until hydration finishes or every full reload looks logged-out. */
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);

  /** Prefer `role` from the access JWT — matches server RBAC and survives stale/missing `user.role` in persisted Zustand state. */
  const roleFromJwt = parseJwtRole(accessToken);
  const roleFromStore = (user as { role?: string } | null)?.role;
  const role = roleFromJwt ?? roleFromStore;
  const canAccessAdmin = !!role && ADMIN_ROLES.includes(role);

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

  /** Only redirect unauthenticated users. Role checks are applied in render so non-admins never see the admin chrome. */
  useLayoutEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/admin')}`);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-oda-ivory">
        <p className="text-muted-foreground font-plus-jakarta">Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-oda-ivory">
        <p className="text-muted-foreground font-plus-jakarta">Redirecting to sign in…</p>
      </div>
    );
  }

  if (!canAccessAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-oda-ivory px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground font-plus-jakarta">
          The admin console is only available to Oda staff (admin, ops, support, catalog roles). You&apos;re signed in
          with a shopper account. Sign out and sign in with staff credentials, or go back to shopping.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-oda-green px-5 py-2.5 text-sm font-bold text-white font-plus-jakarta hover:brightness-105"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-oda-ivory overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
