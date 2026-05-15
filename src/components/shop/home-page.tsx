'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown, ShoppingCart, User, Zap, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';
import { CartDrawer } from './cart-drawer';
import { DealZone, type DealCollection } from './deal-zone';

// ── Category nav data ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Groceries',  slug: 'groceries-kitchen',       emoji: '🥦', color: '#EBF9EE' },
  { name: 'Snacks',     slug: 'snacks-drinks',            emoji: '🍿', color: '#FEF9C3' },
  { name: 'Beauty',     slug: 'beauty-personal-care',     emoji: '💄', color: '#FDF2F8' },
  { name: 'Household',  slug: 'household-essentials',     emoji: '🧹', color: '#EFF6FF' },
  { name: 'Health',     slug: 'health-pharma',            emoji: '💊', color: '#F0FDF4' },
  { name: 'Baby',       slug: 'baby-kids',                emoji: '👶', color: '#FFF7ED' },
  { name: 'Pet',        slug: 'pet-care',                 emoji: '🐾', color: '#F5F3FF' },
  { name: 'Kenya',      slug: 'kenya-essentials',         emoji: '🇰🇪', color: '#ECFDF5' },
  { name: 'Fresh',      slug: 'fresh-produce',            emoji: '🥕', color: '#FEF2F2' },
  { name: 'Beverages',  slug: 'beverages',                emoji: '🧃', color: '#FFFBEB' },
];

const FALLBACK_OFFERS = [
  { title: 'First Order Free Delivery', subtitle: 'No minimum required', backgroundColor: '#FFC523', linkType: 'SEARCH', linkId: null },
  { title: 'Up to 30% off Groceries',   subtitle: 'This week only',      backgroundColor: '#1B7A3E', linkType: 'CATEGORY', linkId: 'groceries-kitchen' },
  { title: 'B2B Wholesale Prices',      subtitle: 'Register your business', backgroundColor: '#2563EB', linkType: 'CATEGORY', linkId: 'b2b-wholesale' },
];

const FALLBACK_PRODUCTS = [
  { id: 'g1', slug: 'unga-jogoo-maize-flour-2kg',     name: 'Unga Jogoo Maize Flour 2kg',       priceKes: 16500, mrpKes: 18000,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 'g2', slug: 'bidco-gold-fry-cooking-oil-2l',  name: 'Bidco Gold Fry Cooking Oil 2L',    priceKes: 49000, mrpKes: 52000,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 'g3', slug: 'tropikal-white-sugar-2kg',       name: 'Tropikal White Sugar 2kg',          priceKes: 32000, mrpKes: 35000,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 'g4', slug: 'pishori-aromatic-rice-2kg',      name: 'Mwea Pishori Aromatic Rice 2kg',   priceKes: 38000, mrpKes: 42000,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 'g5', slug: 'brookside-fresh-milk-500ml',     name: 'Brookside Fresh Milk 500ml',        priceKes: 7500,  mrpKes: 8500,   imageUrl: null, inStock: true, storageType: 'CHILLED' },
  { id: 'g6', slug: 'royco-mchuzi-mix-beef',          name: 'Royco Mchuzi Mix Beef 6×8g',        priceKes: 5500,  mrpKes: 6000,   imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 's1', slug: 'lays-classic-crisps-100g',       name: "Lay's Classic Crisps 100g",         priceKes: 12000, mrpKes: 13500,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
  { id: 'b1', slug: 'dove-beauty-bar-100g',           name: 'Dove Beauty Moisturising Bar 100g', priceKes: 9500,  mrpKes: 11000,  imageUrl: null, inStock: true, storageType: 'AMBIENT' },
];

interface Product {
  id: string;
  slug?: string;
  name: string;
  priceKes: number;
  mrpKes?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
  storageType: string;
}

interface CmsBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  backgroundColor?: string | null;
  imageUrl?: string | null;
  linkType?: string | null;
  linkId?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  sortOrder: number;
}

function parseColor(hex: string | null | undefined): string {
  return hex || '#198A2E';
}

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function bannerHref(banner: CmsBanner): string {
  switch (banner.linkType?.toUpperCase()) {
    case 'CATEGORY': return banner.linkId ? `/categories/${banner.linkId}` : '/categories';
    case 'BRAND':    return banner.linkId ? `/search?brand=${banner.linkId}` : '/search';
    case 'SEARCH':   return banner.linkId ? `/search?q=${banner.linkId}` : '/search';
    case 'URL':      return banner.linkUrl || '/';
    default:         return '/';
  }
}

// ── HomePage component ────────────────────────────────────────────────────────

export function HomePage({
  initialProducts,
  initialBanners,
  initialDeals,
}: {
  initialProducts?: Product[];
  initialBanners?: CmsBanner[];
  initialDeals?: DealCollection[];
}) {
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : FALLBACK_PRODUCTS;
  const banners  = initialBanners  && initialBanners.length  > 0 ? initialBanners  : FALLBACK_OFFERS as CmsBanner[];
  const deals    = initialDeals    && initialDeals.length    > 0 ? initialDeals    : [];

  const [searchFocused, setSearchFocused] = useState(false);
  const { items, totalKes, openCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E8E0]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-extrabold font-plus-jakarta">
                <span className="text-[#198A2E]">Oda</span><span className="text-[#F8C915]">.</span>
              </Link>
              <button className="flex items-center gap-1 text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors">
                <MapPin className="w-4 h-4 text-[#198A2E]" />
                <span className="font-semibold font-plus-jakarta">Nairobi</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-[#EBF9EE] rounded-full px-3 py-1.5">
                <Zap className="w-3.5 h-3.5 text-[#198A2E] fill-[#198A2E]" />
                <span className="text-xs font-semibold text-[#198A2E] font-plus-jakarta">~30 min</span>
              </div>
              <Link href="/account" className="w-9 h-9 rounded-full bg-white border border-[#E8E8E0] flex items-center justify-center hover:bg-[#EBF9EE] transition-colors shadow-sm">
                <User className="w-4 h-4 text-[#1A1A1A]" />
              </Link>
              <button
                onClick={openCart}
                className="relative w-9 h-9 rounded-full bg-[#198A2E] flex items-center justify-center hover:bg-[#166B24] transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#F8C915] rounded-full text-[10px] font-bold text-[#1A1A1A] flex items-center justify-center font-plus-jakarta"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div animate={{ scale: searchFocused ? 1.005 : 1 }} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
            <Link href="/search">
              <div
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5F5F0] border border-[#E8E8E0] text-sm text-[#1A1A1A]/40 font-plus-jakarta cursor-text hover:border-[#198A2E]/30 transition-colors"
                onMouseEnter={() => setSearchFocused(true)}
                onMouseLeave={() => setSearchFocused(false)}
              >
                Search for groceries, drinks, essentials...
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ── Category Nav Bar ──────────────────────────────────────────── */}
        <div className="border-t border-[#F0F0E8]">
          <div className="flex overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-[#F5F5F0] transition-colors group min-w-[72px]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.emoji}
                </div>
                <span className="text-[11px] font-semibold text-[#1A1A1A]/65 group-hover:text-[#198A2E] whitespace-nowrap font-plus-jakarta transition-colors">
                  {cat.name}
                </span>
                <div className="h-0.5 w-0 bg-[#198A2E] group-hover:w-full transition-all rounded-full" />
              </Link>
            ))}
            <Link
              href="/categories"
              className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-[#F5F5F0] transition-colors group min-w-[72px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F0] border border-[#E8E8E0] flex items-center justify-center text-lg transition-transform group-hover:scale-105">
                ⋯
              </div>
              <span className="text-[11px] font-semibold text-[#1A1A1A]/65 group-hover:text-[#198A2E] whitespace-nowrap font-plus-jakarta transition-colors">
                All
              </span>
              <div className="h-0.5 w-0 bg-[#198A2E] group-hover:w-full transition-all rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F5F5F0]" style={{ minHeight: 220 }}>
        <div className="absolute inset-0">
          <Image
            src="/images/oda_hero.png"
            alt="Oda delivery"
            fill
            priority
            className="object-cover object-right"
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #F5F5F0 30%, #F5F5F0cc 52%, #F5F5F080 70%, transparent 100%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, #F5F5F0)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-xs sm:max-w-sm"
          >
            <p className="text-xs font-bold text-[#198A2E] uppercase tracking-widest mb-2 font-plus-jakarta">
              Delivered in minutes
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] leading-tight font-plus-jakarta mb-2">
              Bulk savings,<br />delivered.
            </h1>
            <p className="text-sm text-[#1A1A1A]/60 font-plus-jakarta mb-5">
              More in your cart. More in your pocket.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-[#198A2E] hover:bg-[#166B24] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors font-plus-jakarta shadow-sm"
            >
              Shop now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-10 pt-5">

        {/* ── Promo Banners ────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:overflow-visible md:mx-0 md:px-0 md:grid md:grid-cols-3">
            {banners.map((banner, i) => {
              const bg    = parseColor(banner.backgroundColor);
              const light = isLightColor(bg);
              const textColor = light ? '#1A1A1A' : '#ffffff';
              const href  = bannerHref(banner);
              return (
                <motion.div
                  key={banner.id ?? i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex-shrink-0 w-[78vw] sm:w-[52vw] md:w-auto"
                >
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 h-16 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                    style={{ backgroundColor: bg }}
                  >
                    {banner.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={banner.imageUrl} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                    ) : (
                      <Tag className="w-5 h-5 flex-shrink-0" style={{ color: textColor, opacity: 0.85 }} />
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-[13px] leading-tight truncate font-plus-jakarta" style={{ color: textColor }}>
                        {banner.title}
                      </p>
                      {banner.subtitle && (
                        <p className="text-[10px] font-plus-jakarta truncate" style={{ color: textColor, opacity: 0.75 }}>
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Bestsellers ──────────────────────────────────────────────── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#198A2E]" />
              <h2 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Bestsellers</h2>
            </div>
            <Link href="/categories/groceries-kitchen" className="text-sm text-[#198A2E] font-semibold hover:underline font-plus-jakarta flex items-center gap-1">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.slice(0, 6).map((product, i) => (
              <ProductCardSimple key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>

        {/* ── Deal Zones ───────────────────────────────────────────────── */}
        {deals.map((deal) => (
          <DealZone key={deal.id} collection={deal} />
        ))}

        {/* ── Quick Picks ──────────────────────────────────────────────── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#198A2E] fill-[#198A2E]" />
              <h2 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Quick Picks</h2>
            </div>
            <Link href="/search" className="text-sm text-[#198A2E] font-semibold hover:underline font-plus-jakarta flex items-center gap-1">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.slice(2, Math.min(8, products.length)).map((product, i) => (
              <ProductCardSimple key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>

        {/* ── B2B CTA ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-[#1A1A1A] rounded-[22px] p-6 mb-8 ring-1 ring-[#198A2E]/20 shadow-floating">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#198A2E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#198A2E] uppercase tracking-widest mb-1 font-plus-jakarta">For businesses</p>
              <h3 className="text-xl font-extrabold text-white mb-1 font-plus-jakarta">Running a business? 🏪</h3>
              <p className="text-white/60 text-sm font-plus-jakarta">Wholesale prices, bulk discounts, and POS tools for your shop.</p>
            </div>
            <Link
              href="/b2b"
              className="flex-shrink-0 bg-[#F8C915] hover:bg-[#FFD84D] text-[#1A1A1A] font-bold px-6 py-3 rounded-xl transition-colors font-plus-jakarta text-sm shadow-sm"
            >
              Apply for B2B
            </Link>
          </div>
        </div>

        <p className="text-center text-[#1A1A1A]/40 text-sm py-4 font-plus-jakarta">
          Oda — Kenya&apos;s last-mile commerce platform. Delivered in minutes.
        </p>
      </main>

      {/* ── Sticky Cart Bar ──────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <button
            onClick={openCart}
            className="w-full max-w-md mx-auto flex bg-[#198A2E] text-white rounded-[20px] px-5 py-4 items-center justify-between shadow-floating"
          >
            <div className="bg-[#166B24] rounded-xl px-3 py-1 text-sm font-bold font-plus-jakarta">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </div>
            <span className="font-bold text-base font-plus-jakarta">View Cart</span>
            <span className="font-bold text-base font-plus-jakarta">{formatKES(totalKes)}</span>
          </button>
        </motion.div>
      )}

      <CartDrawer />
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCardSimple({ product, index }: { product: Product; index: number }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const saving = product.mrpKes
    ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100)
    : 0;
  const productHref = `/products/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-[#E8E8E0]/60 overflow-hidden hover:shadow-soft hover:-translate-y-px transition-all"
    >
      <div className="relative">
        {saving > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#198A2E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-plus-jakarta">
              {saving}% off
            </span>
          </div>
        )}
        <Link href={productHref} className="block">
          <div className="aspect-square bg-[#F5F5F0] flex items-center justify-center">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
            ) : (
              <ShoppingCart className="w-8 h-8 text-[#1A1A1A]/10" />
            )}
          </div>
        </Link>
      </div>
      <div className="p-2.5">
        <Link href={productHref}>
          <p className="text-[#1A1A1A] text-xs font-medium line-clamp-2 min-h-[2.5rem] mb-1.5 hover:text-[#198A2E] transition-colors font-plus-jakarta">
            {product.name}
          </p>
        </Link>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-[#1A1A1A] font-extrabold text-sm font-plus-jakarta">{formatKES(product.priceKes)}</span>
          {product.mrpKes && (
            <span className="text-[#1A1A1A]/35 text-[10px] line-through font-plus-jakarta">{formatKES(product.mrpKes)}</span>
          )}
        </div>
        {quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => addItem({ id: product.id, productId: product.id, name: product.name, unitPriceKes: product.priceKes, quantity: 1 })}
            className="w-full h-8 bg-[#198A2E] hover:bg-[#166B24] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors font-plus-jakarta"
          >
            + ADD
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-[#198A2E] rounded-xl h-8 px-2">
            <button onClick={() => updateQuantity(product.id, undefined, quantity - 1)} className="text-white text-lg font-bold leading-none">−</button>
            <span className="text-white font-bold text-sm font-plus-jakarta">{quantity}</span>
            <button onClick={() => updateQuantity(product.id, undefined, quantity + 1)} className="text-white text-lg font-bold leading-none">+</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
