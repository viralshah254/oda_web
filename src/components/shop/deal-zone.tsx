'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, afterLocalCartAdd } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DealProduct {
  id: string;
  slug?: string;
  name: string;
  priceKes: number;
  mrpKes?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
  isHighlighted?: boolean;
  rowIndex?: number | null;
  colIndex?: number | null;
}

export interface DealCollection {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  badgeLabel?: string | null;
  theme: string;
  layout: string;
  icon?: string | null;
  products: Array<{
    sortOrder: number;
    rowIndex?: number | null;
    colIndex?: number | null;
    isHighlighted: boolean;
    product: DealProduct;
  }>;
}

// ── Theme map ────────────────────────────────────────────────────────────────

const THEMES: Record<string, { bg: string; accent: string; badge: string; badgeText: string; headerText: string }> = {
  green:  { bg: '#EBF9EE', accent: '#198A2E', badge: '#198A2E', badgeText: '#fff', headerText: '#198A2E' },
  yellow: { bg: '#FFFBEB', accent: '#D97706', badge: '#F8C915', badgeText: '#1A1A1A', headerText: '#92400E' },
  red:    { bg: '#FEF2F2', accent: '#DC2626', badge: '#DC2626', badgeText: '#fff', headerText: '#991B1B' },
  blue:   { bg: '#EFF6FF', accent: '#2563EB', badge: '#2563EB', badgeText: '#fff', headerText: '#1D4ED8' },
  purple: { bg: '#F5F3FF', accent: '#7C3AED', badge: '#7C3AED', badgeText: '#fff', headerText: '#5B21B6' },
  black:  { bg: '#1A1A1A', accent: '#F8C915', badge: '#F8C915', badgeText: '#1A1A1A', headerText: '#ffffff' },
  orange: { bg: '#FFF7ED', accent: '#EA580C', badge: '#EA580C', badgeText: '#fff', headerText: '#9A3412' },
};

function getTheme(key: string) {
  return THEMES[key] ?? THEMES.green;
}

// ── Zone Header ───────────────────────────────────────────────────────────────

function ZoneHeader({ collection }: { collection: DealCollection }) {
  const theme = getTheme(collection.theme);
  const isDark = collection.theme === 'black';
  return (
    <div className={`flex items-center justify-between mb-4 ${isDark ? '' : ''}`}>
      <div className="flex items-center gap-2.5">
        {collection.icon && (
          <span className="text-2xl leading-none">{collection.icon}</span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2
              className="text-xl font-extrabold font-plus-jakarta"
              style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
            >
              {collection.name}
            </h2>
            {collection.badgeLabel && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full font-plus-jakarta"
                style={{ backgroundColor: theme.badge, color: theme.badgeText }}
              >
                {collection.badgeLabel}
              </span>
            )}
          </div>
          {collection.tagline && (
            <p
              className="text-xs font-plus-jakarta"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,26,0.5)' }}
            >
              {collection.tagline}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/deals/${collection.slug}`}
        className="text-sm font-semibold font-plus-jakarta flex items-center gap-1 hover:underline"
        style={{ color: theme.accent }}
      >
        See all <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ── Product Card (deal variant) ───────────────────────────────────────────────

export function DealProductCard({
  product,
  index,
  size = 'normal',
  isDarkBg = false,
}: {
  product: DealProduct;
  index: number;
  size?: 'normal' | 'large' | 'small';
  isDarkBg?: boolean;
}) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const saving = product.mrpKes
    ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100)
    : 0;
  const productHref = `/products/${product.slug || product.id}`;

  const cardBg = isDarkBg ? '#2A2A2A' : '#ffffff';
  const cardBorder = isDarkBg ? 'border-[#3A3A3A]' : 'border-[#E8E8E0]/60';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border ${cardBorder} overflow-hidden hover:shadow-md hover:-translate-y-px transition-all`}
      style={{ backgroundColor: cardBg }}
    >
      <div className="relative">
        {saving > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-oda-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full font-plus-jakarta">
              {saving}% off
            </span>
          </div>
        )}
        {product.isHighlighted && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-[#F8C915] text-oda-charcoal text-[10px] font-bold px-1.5 py-0.5 rounded-full font-plus-jakarta">
              ⭐ Pick
            </span>
          </div>
        )}
        <Link href={productHref} className="block">
          <div
            className={`bg-oda-ivory flex items-center justify-center ${size === 'large' ? 'aspect-[4/3]' : size === 'small' ? 'aspect-square' : 'aspect-square'}`}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <ShoppingCart className="w-8 h-8 text-oda-charcoal/10" />
            )}
          </div>
        </Link>
      </div>
      <div className="p-2.5">
        <Link href={productHref}>
          <p
            className={`text-xs font-medium line-clamp-2 mb-1.5 hover:text-oda-green transition-colors font-plus-jakarta ${size === 'large' ? 'min-h-[2rem]' : 'min-h-[2.5rem]'}`}
            style={{ color: isDarkBg ? '#e0e0e0' : '#1A1A1A' }}
          >
            {product.name}
          </p>
        </Link>
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="font-extrabold text-sm font-plus-jakarta"
            style={{ color: isDarkBg ? '#ffffff' : '#1A1A1A' }}
          >
            {formatKES(product.priceKes)}
          </span>
          {product.mrpKes && (
            <span className="text-[10px] line-through font-plus-jakarta" style={{ color: isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(26,26,26,0.35)' }}>
              {formatKES(product.mrpKes)}
            </span>
          )}
        </div>
        {quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              addItem({ id: product.id, productId: product.id, name: product.name, unitPriceKes: product.priceKes, quantity: 1 });
              afterLocalCartAdd(product.id, 1);
            }}
            className="w-full h-8 bg-oda-green hover:bg-oda-green-dark text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors font-plus-jakarta"
          >
            + ADD
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-oda-green rounded-xl h-8 px-2">
            <button onClick={() => updateQuantity(product.id, undefined, quantity - 1)} className="text-white text-lg font-bold leading-none">−</button>
            <span className="text-white font-bold text-sm font-plus-jakarta">{quantity}</span>
            <button
              onClick={() => {
                updateQuantity(product.id, undefined, quantity + 1);
                if (!cartItem?.cartItemId) afterLocalCartAdd(product.id, 1);
              }}
              className="text-white text-lg font-bold leading-none"
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Layout: scroll ────────────────────────────────────────────────────────────

function ScrollLayout({ collection }: { collection: DealCollection }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = collection.products.map((p) => ({ ...p.product, isHighlighted: p.isHighlighted }));
  const isDark = collection.theme === 'black';

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {products.map((product, i) => (
          <div key={product.id} className="flex-shrink-0 w-[140px] sm:w-[160px]">
            <DealProductCard product={product} index={i} isDarkBg={isDark} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Layout: grid ──────────────────────────────────────────────────────────────

function GridLayout({ collection }: { collection: DealCollection }) {
  const products = collection.products.map((p) => ({ ...p.product, isHighlighted: p.isHighlighted }));
  const isDark = collection.theme === 'black';
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map((product, i) => (
        <DealProductCard key={product.id} product={product} index={i} isDarkBg={isDark} />
      ))}
    </div>
  );
}

// ── Layout: featured ──────────────────────────────────────────────────────────

function FeaturedLayout({ collection }: { collection: DealCollection }) {
  const products = collection.products.map((p) => ({ ...p.product, isHighlighted: p.isHighlighted }));
  const isDark = collection.theme === 'black';
  const [hero, ...rest] = products;
  if (!hero) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-1">
        <DealProductCard product={hero} index={0} size="large" isDarkBg={isDark} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rest.slice(0, 4).map((p, i) => (
          <DealProductCard key={p.id} product={p} index={i + 1} isDarkBg={isDark} />
        ))}
      </div>
    </div>
  );
}

// ── Layout: mosaic ────────────────────────────────────────────────────────────

function MosaicLayout({ collection }: { collection: DealCollection }) {
  const products = collection.products.map((p) => ({ ...p.product, isHighlighted: p.isHighlighted }));
  const isDark = collection.theme === 'black';

  // Slot [0] = tall hero (row-span-2), [1,2] = stacked right top, [3,4,5] = bottom row
  const Hero = products[0];
  const secondary = products.slice(1, 3);
  const tertiary = products.slice(3, 6);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Hero — spans 2 rows on md */}
      {Hero && (
        <div className="row-span-2 hidden md:block">
          <DealProductCard product={Hero} index={0} size="large" isDarkBg={isDark} />
        </div>
      )}
      {/* Hero mobile fallback */}
      {Hero && (
        <div className="block md:hidden">
          <DealProductCard product={Hero} index={0} isDarkBg={isDark} />
        </div>
      )}
      {/* Secondary row */}
      {secondary.map((p, i) => (
        <DealProductCard key={p.id} product={p} index={i + 1} isDarkBg={isDark} />
      ))}
      {/* Tertiary row */}
      {tertiary.map((p, i) => (
        <DealProductCard key={p.id} product={p} index={i + 3} size="small" isDarkBg={isDark} />
      ))}
    </div>
  );
}

// ── Main DealZone ─────────────────────────────────────────────────────────────

export function DealZone({ collection }: { collection: DealCollection }) {
  if (!collection.products || collection.products.length === 0) return null;

  const theme = getTheme(collection.theme);
  const layout = collection.layout ?? 'scroll';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[22px] p-5 mb-6"
      style={{ backgroundColor: theme.bg }}
    >
      <ZoneHeader collection={collection} />

      {layout === 'scroll' && <ScrollLayout collection={collection} />}
      {layout === 'grid' && <GridLayout collection={collection} />}
      {layout === 'featured' && <FeaturedLayout collection={collection} />}
      {layout === 'mosaic' && <MosaicLayout collection={collection} />}
    </motion.section>
  );
}
