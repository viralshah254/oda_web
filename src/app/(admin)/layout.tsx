'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useAuthStore } from '@/lib/stores/auth.store';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'OPS_MANAGER', 'SUPPORT_AGENT', 'CATALOG_MANAGER'];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=/admin`);
      return;
    }
    const role = (user as any)?.role;
    if (role && !ADMIN_ROLES.includes(role)) {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F5F0]">
        <p className="text-[#666] font-plus-jakarta">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F0] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
