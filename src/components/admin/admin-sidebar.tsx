'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Users, Building2, Package,
  TrendingUp, Tag, Truck, Wallet, MessageSquare, Bell,
  Settings, BarChart3, Store, Brain, RefreshCcw, Shield,
  Zap, ChevronRight, Factory, Flame,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Order Command', href: '/admin/orders/command', icon: Zap },
  { divider: true },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'B2B KYC', href: '/admin/b2b', icon: Building2 },
  { divider: true },
  { label: 'Catalog', href: '/admin/catalog', icon: Package },
  { label: 'Pricing', href: '/admin/pricing', icon: TrendingUp },
  { label: 'Promotions', href: '/admin/promotions', icon: Tag },
  { label: 'Deal Zones', href: '/admin/deals', icon: Flame },
  { divider: true },
  { label: 'Suppliers', href: '/admin/suppliers', icon: Store },
  { label: 'Manufacturers', href: '/admin/manufacturers', icon: Building2 },
  { label: 'Supplier portal', href: '/portal/supplier', icon: Package },
  { label: 'Manufacturer portal', href: '/portal/manufacturer', icon: Factory },
  { label: 'Logistics', href: '/admin/logistics', icon: Truck },
  { divider: true },
  { label: 'Payments', href: '/admin/payments', icon: Wallet },
  { label: 'Returns', href: '/admin/returns', icon: RefreshCcw },
  { label: 'Support', href: '/admin/support', icon: MessageSquare },
  { divider: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'AI Insights', href: '/admin/ai', icon: Brain },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#1A1A1A] flex flex-col sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFD700] rounded-xl flex items-center justify-center">
            <span className="text-[#1A1A1A] font-extrabold text-sm">O</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm font-plus-jakarta">Oda Admin</p>
            <p className="text-white/40 text-xs font-plus-jakarta">Console v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item, i) => {
          if ('divider' in item && item.divider) {
            return <div key={i} className="my-2 border-t border-white/5" />;
          }
          
          const Icon = item.icon!;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href!));
          
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-plus-jakarta font-semibold transition-colors group ${
                isActive
                  ? 'bg-[#198A2E] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#198A2E] flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold font-plus-jakarta truncate">Super Admin</p>
            <p className="text-white/40 text-xs font-plus-jakarta truncate">admin@oda.co.ke</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
