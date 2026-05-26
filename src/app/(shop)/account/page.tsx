'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, MapPin, Package, Wallet, Star, RefreshCw,
  Ticket, Heart, Share2, Settings, LogOut, ChevronRight,
  Building2, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';

const MENU_ITEMS = [
  { icon: Package,   label: 'My Orders',      href: '/orders',             sub: null },
  { icon: MapPin,    label: 'Saved Addresses', href: '/account/addresses',  sub: null },
  { icon: Wallet,    label: 'Oda Wallet',      href: '/account/wallet',     sub: null },
  { icon: Star,      label: 'Loyalty Points',  href: '/account/loyalty',    sub: null },
  { icon: RefreshCw, label: 'Recurring Cart',  href: '/account/recurring',  sub: null },
  { icon: Heart,     label: 'Saved Lists',     href: '/account/lists',      sub: null },
  { icon: Share2,    label: 'Refer a Friend',  href: '/account/referrals',  sub: 'Earn KES 200 per referral' },
  { icon: Ticket,    label: 'Support Tickets', href: '/account/tickets',    sub: null },
  { icon: Settings,  label: 'Settings',        href: '/account/settings',   sub: null },
];

function roleBadge(role?: string) {
  if (!role) return { label: 'Customer', className: 'bg-oda-mint text-oda-green' };
  if (role === 'SUPER_ADMIN') return { label: 'Super Admin', className: 'bg-red-100 text-red-700' };
  if (role === 'ADMIN') return { label: 'Admin', className: 'bg-orange-100 text-orange-700' };
  if (role === 'B2B_ACTIVE') return { label: 'B2B Wholesale', className: 'bg-oda-charcoal text-oda-yellow' };
  return { label: 'Customer', className: 'bg-oda-mint text-oda-green' };
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-oda-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-oda-charcoal/50 font-plus-jakarta text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  const badge = roleBadge(user.role);
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Header */}
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-6">
        <div className="max-w-2xl lg:max-w-3xl mx-auto">
          <h1 className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta mb-4">Account</h1>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-oda-mint flex items-center justify-center shrink-0">
              <span className="text-oda-green font-extrabold text-xl">
                {user.name ? user.name[0].toUpperCase() : <User size={24} />}
              </span>
            </div>
            <div>
              <p className="text-base font-extrabold text-oda-charcoal font-plus-jakarta">
                {user.name ?? 'Account'}
              </p>
              <p className="text-sm text-oda-charcoal/50 font-plus-jakarta">
                {user.phone ?? user.email ?? '—'}
              </p>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${badge.className}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 lg:px-8 py-5 space-y-2">
        {/* Admin shortcut */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-4 bg-oda-charcoal text-white rounded-xl border border-oda-charcoal px-4 py-3.5 hover:bg-oda-charcoal/90 transition-colors mb-4"
          >
            <div className="w-9 h-9 bg-oda-yellow/20 rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} className="text-oda-yellow" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold font-plus-jakarta">Admin Dashboard</p>
              <p className="text-xs text-white/50 font-plus-jakarta">Manage orders, catalog, pricing</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </Link>
        )}

        {/* B2B shortcut */}
        {user.role?.includes('B2B') && (
          <Link
            href="/b2b"
            className="flex items-center gap-4 bg-oda-green text-white rounded-xl border border-oda-green px-4 py-3.5 hover:bg-oda-green-dark transition-colors mb-4"
          >
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold font-plus-jakarta">Business Workspace</p>
              <p className="text-xs text-white/70 font-plus-jakarta">Orders, restock, POS, cashflow</p>
            </div>
            <ChevronRight size={16} className="text-white/50" />
          </Link>
        )}

        {MENU_ITEMS.map(({ icon: Icon, label, href, sub }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 bg-white rounded-xl border border-oda-charcoal/8 px-4 py-3.5 hover:border-oda-green/30 hover:bg-oda-mint/30 transition-colors"
          >
            <div className="w-9 h-9 bg-oda-ivory rounded-lg flex items-center justify-center shrink-0">
              <Icon size={16} className="text-oda-charcoal/60" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">{label}</p>
              {sub && <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{sub}</p>}
            </div>
            <ChevronRight size={16} className="text-oda-charcoal/20" />
          </Link>
        ))}

        <button
          onClick={() => { logout(); }}
          className="flex items-center gap-4 w-full bg-white rounded-xl border border-oda-charcoal/8 px-4 py-3.5 hover:border-red-200 hover:bg-red-50/50 transition-colors mt-2"
        >
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <LogOut size={16} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-500 font-plus-jakarta">Sign Out</p>
        </button>
      </div>
    </div>
  );
}
