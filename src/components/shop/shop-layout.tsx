'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, ShoppingCart, User, ChevronDown, Menu, X, LogOut,
  Zap, Store, Tag, Truck, MapPin
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { CartDrawer } from './cart-drawer';

const NAV_LINKS = [
  { label: 'Shop', href: '/' },
  { label: 'Deals', href: '/deals' },
  { label: 'B2B Wholesale', href: '/b2b', highlight: true },
  { label: 'Track Order', href: '/orders' },
];

const SIDEBAR_CATEGORIES = [
  { emoji: '🥦', name: 'Groceries & Kitchen',   slug: 'groceries-kitchen' },
  { emoji: '🍿', name: 'Snacks & Drinks',        slug: 'snacks-drinks' },
  { emoji: '💄', name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
  { emoji: '🧹', name: 'Household Essentials',   slug: 'household-essentials' },
  { emoji: '💊', name: 'Health & Pharma',        slug: 'health-pharma' },
  { emoji: '👶', name: 'Baby & Kids',            slug: 'baby-kids' },
  { emoji: '🐾', name: 'Pet Care',               slug: 'pet-care' },
  { emoji: '🥕', name: 'Fresh Produce',          slug: 'fresh-produce' },
  { emoji: '🧃', name: 'Beverages',              slug: 'beverages' },
  { emoji: '🏪', name: 'B2B / Wholesale',        slug: 'b2b-wholesale' },
];

export function ShopLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { items, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const isAdminOrB2b = pathname.startsWith('/admin') || pathname.startsWith('/b2b');

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* ── TOP NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[100] bg-oda-charcoal text-white shadow-floating">
        {/* Delivery promise bar */}
        <div className="bg-oda-yellow text-oda-charcoal text-xs font-bold text-center py-1.5 hidden lg:block">
          <Zap className="inline w-3 h-3 mr-1" />
          Free delivery on orders over KES 2,500 &nbsp;·&nbsp; Delivered in ~30 minutes across Nairobi
        </div>

        <div className="max-w-screen-2xl mx-auto flex items-center gap-4 px-4 lg:px-8 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-oda-yellow rounded-lg flex items-center justify-center">
              <span className="text-oda-charcoal font-extrabold text-sm">O</span>
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight hidden sm:block">Oda</span>
          </Link>

          {/* Location picker (desktop) */}
          <button className="hidden lg:flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium shrink-0">
            <MapPin className="w-4 h-4 text-oda-yellow" />
            <span>Nairobi</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Search bar (desktop) */}
          <div className="flex-1 hidden lg:block max-w-xl">
            <Link href="/search" className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2 transition-colors cursor-pointer w-full">
              <Search className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-sm font-medium">Search groceries, drinks&hellip;</span>
            </Link>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  link.highlight
                    ? 'bg-oda-yellow text-oda-charcoal hover:bg-oda-yellow-2'
                    : pathname === link.href
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {/* Cart */}
            <button
              onClick={() => openCart()}
              className="relative flex items-center gap-1.5 bg-oda-green hover:bg-oda-green-dark text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-oda-yellow text-oda-charcoal text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="relative z-[110] hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative z-[110] flex items-center gap-1.5 text-white/80 hover:text-white px-2 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 bg-oda-green rounded-full flex items-center justify-center text-xs font-bold">
                  {isAuthenticated && user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-floating border border-oda-charcoal/8 py-2 z-[120]">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-oda-charcoal/8">
                        <p className="text-sm font-extrabold text-oda-charcoal">{user?.name ?? 'Account'}</p>
                        <p className="text-xs text-oda-charcoal/50">{user?.phone ?? user?.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-oda-charcoal hover:bg-oda-mint transition-colors">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-oda-charcoal hover:bg-oda-mint transition-colors">
                        <Store className="w-4 h-4" /> My Orders
                      </Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-oda-charcoal hover:bg-oda-mint transition-colors">
                        <User className="w-4 h-4" /> Sign In
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-oda-charcoal border-t border-white/10 px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-white/80 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── BODY: SIDEBAR + MAIN ──────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto flex">
        {/* Left category sidebar (desktop) */}
        {!isAdminOrB2b && (
          <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-[calc(4rem+28px)] h-[calc(100vh-4rem-28px)] overflow-y-auto py-4 pr-2">
            <p className="text-xs font-extrabold text-oda-charcoal/40 uppercase tracking-wider px-3 mb-2">
              Categories
            </p>
            {SIDEBAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === `/categories/${cat.slug}`
                    ? 'bg-oda-mint text-oda-green'
                    : 'text-oda-charcoal/70 hover:bg-oda-mint hover:text-oda-green'
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span className="truncate">{cat.name}</span>
              </Link>
            ))}
            {/* B2B upsell */}
            <div className="mt-4 mx-3 bg-oda-charcoal rounded-2xl p-3 text-center">
              <p className="text-oda-yellow font-extrabold text-xs mb-1">Wholesale prices</p>
              <p className="text-white/60 text-[10px] mb-2">Register your business</p>
              <Link href="/b2b" className="block bg-oda-yellow text-oda-charcoal text-xs font-bold py-1.5 rounded-lg hover:bg-oda-yellow-2 transition-colors">
                Apply now
              </Link>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile search */}
          <div className="lg:hidden px-4 pt-3 pb-1">
            <Link href="/search" className="flex items-center gap-2 bg-white border border-oda-charcoal/10 rounded-xl px-4 py-2.5 shadow-pressed w-full">
              <Search className="w-4 h-4 text-oda-charcoal/40" />
              <span className="text-oda-charcoal/40 text-sm font-medium">Search groceries, drinks&hellip;</span>
            </Link>
          </div>
          {children}
        </main>
      </div>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-transparent" aria-hidden onClick={() => setUserMenuOpen(false)} />
      )}
    </div>
  );
}
