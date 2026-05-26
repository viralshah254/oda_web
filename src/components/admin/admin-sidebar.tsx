'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  LayoutDashboard, ShoppingCart, Users, Building2, Package,
  TrendingUp, Tag, Truck, Wallet, MessageSquare, Bell,
  Settings, BarChart3, Store, Brain, RefreshCcw, Shield,
  Zap, ChevronRight, Factory, Flame, LogOut, ListOrdered, Database,
} from 'lucide-react';

const navGroups = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Order Command', href: '/admin/orders/command', icon: Zap },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'B2B KYC', href: '/admin/b2b', icon: Building2 },
    ],
  },
  {
    label: 'Catalog & pricing',
    items: [
      { label: 'Catalog', href: '/admin/catalog', icon: Package },
      { label: 'Pricing', href: '/admin/pricing', icon: TrendingUp },
      { label: 'Promotions', href: '/admin/promotions', icon: Tag },
      { label: 'Deal Zones', href: '/admin/deals', icon: Flame },
    ],
  },
  {
    label: 'Supply chain',
    items: [
      { label: 'Suppliers', href: '/admin/suppliers', icon: Store },
      { label: 'Manufacturers', href: '/admin/manufacturers', icon: Building2 },
      { label: 'Supplier portal', href: '/portal/supplier', icon: Package },
      { label: 'Manufacturer portal', href: '/portal/manufacturer', icon: Factory },
      { label: 'Logistics', href: '/admin/logistics', icon: Truck },
    ],
  },
  {
    label: 'Finance & support',
    items: [
      { label: 'Payments', href: '/admin/payments', icon: Wallet },
      { label: 'Returns', href: '/admin/returns', icon: RefreshCcw },
      { label: 'Penalties', href: '/admin/penalties', icon: Shield },
      { label: 'Support', href: '/admin/support', icon: MessageSquare },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Fraud Review', href: '/admin/fraud', icon: Shield },
      { label: 'Security', href: '/admin/security', icon: Shield },
      { label: 'Queue Ops', href: '/admin/queues', icon: ListOrdered },
      { label: 'ERP Sync', href: '/admin/erp', icon: Database },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'AI Insights', href: '/admin/ai', icon: Brain },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 h-screen flex flex-col sticky top-0 border-r border-oda-charcoal/8 bg-white">
      {/* Logo / Wordmark */}
      <div className="px-5 py-4 border-b border-oda-charcoal/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-oda-charcoal flex items-center justify-center flex-shrink-0">
            <span className="text-oda-yellow font-extrabold text-sm font-plus-jakarta leading-none">O</span>
          </div>
          <div>
            <p className="text-oda-charcoal font-extrabold text-sm font-plus-jakarta leading-tight">Oda Admin</p>
            <p className="text-oda-charcoal/35 text-xs font-plus-jakarta">Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="text-[10px] font-bold text-oda-charcoal/30 uppercase tracking-widest font-plus-jakarta px-2 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-plus-jakarta font-semibold transition-all group ${
                      isActive
                        ? 'bg-oda-charcoal text-white shadow-sm'
                        : 'text-oda-charcoal/55 hover:text-oda-charcoal hover:bg-oda-ivory'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-oda-yellow' : 'text-oda-charcoal/40 group-hover:text-oda-charcoal/60'}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight size={11} className="opacity-40" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-oda-charcoal/8 bg-oda-ivory/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-oda-green flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-oda-charcoal text-xs font-bold font-plus-jakarta truncate">
              {user?.name ?? 'Staff'}
            </p>
            <p className="text-oda-charcoal/40 text-xs font-plus-jakarta truncate">
              {user?.role?.replace(/_/g, ' ').toLowerCase() ?? 'admin'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-oda-charcoal/8 text-oda-charcoal/40 hover:text-oda-charcoal transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
