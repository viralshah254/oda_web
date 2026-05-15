'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/server/catalog-fetcher';

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Best Offer', value: 'discount' },
];

interface Props {
  slug: string;
  initialProducts: CatalogProduct[];
}

export function CategoryPageClient({ slug, initialProducts }: Props) {
  const [sort, setSort] = useState('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categoryLabel = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const sortedProducts = [...initialProducts].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return a.priceKes - b.priceKes;
      case 'price_desc': return b.priceKes - a.priceKes;
      case 'discount':
        const discA = a.mrpKes ? (a.mrpKes - a.priceKes) / a.mrpKes : 0;
        const discB = b.mrpKes ? (b.mrpKes - b.priceKes) / b.mrpKes : 0;
        return discB - discA;
      default: return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-oda-charcoal/50 mb-4 font-plus-jakarta">
        <Link href="/" className="hover:text-oda-green">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/categories" className="hover:text-oda-green">Categories</Link>
        <span className="mx-1.5">/</span>
        <span className="text-oda-charcoal">{categoryLabel}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta capitalize">
          {categoryLabel}
        </h1>
        <span className="text-sm text-oda-charcoal/50 font-plus-jakarta">
          {sortedProducts.length} items
        </span>
      </div>

      {/* Sort + Filter bar */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-oda-charcoal/10 rounded-xl text-sm font-semibold text-oda-charcoal font-plus-jakarta hover:border-oda-green transition-colors"
          >
            <span>Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
            <ChevronDown size={14} />
          </button>
          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-oda-charcoal/10 shadow-lg z-20 min-w-[180px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-plus-jakarta hover:bg-oda-mint transition-colors first:rounded-t-xl last:rounded-b-xl ${sort === opt.value ? 'text-oda-green font-bold' : 'text-oda-charcoal'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-oda-charcoal/10 rounded-xl text-sm font-semibold text-oda-charcoal font-plus-jakarta hover:border-oda-green transition-colors">
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>

      {/* Product grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-bold text-oda-charcoal font-plus-jakarta">No products found</p>
          <p className="text-sm text-oda-charcoal/50 font-plus-jakarta mt-1">Try a different category or search above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedProducts.map((product, i) => (
            <CategoryProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryProductCard({ product, index }: { product: CatalogProduct; index: number }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const saving = product.mrpKes ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100) : 0;
  const productHref = `/products/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-product-card border border-oda-charcoal/6 overflow-hidden hover:shadow-soft transition-all"
    >
      <div className="relative">
        {saving > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-oda-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{saving}% off</span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-xs font-bold text-oda-charcoal/50 bg-white border border-oda-charcoal/10 px-2 py-1 rounded-full">Out of stock</span>
          </div>
        )}
        <Link href={productHref}>
          <div className="aspect-square bg-oda-ivory flex items-center justify-center">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
            ) : (
              <ShoppingCart className="w-8 h-8 text-oda-charcoal/15" />
            )}
          </div>
        </Link>
      </div>
      <div className="p-2.5">
        <Link href={productHref}>
          <p className="text-oda-charcoal text-xs font-medium line-clamp-2 min-h-[2.5rem] mb-1 hover:text-oda-green transition-colors">{product.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-oda-charcoal font-bold text-sm">{formatKES(product.priceKes)}</span>
          {product.mrpKes && <span className="text-muted-foreground text-[10px] line-through">{formatKES(product.mrpKes)}</span>}
        </div>
        {!product.inStock ? (
          <div className="h-8 rounded-button bg-oda-charcoal/5 flex items-center justify-center text-xs text-oda-charcoal/40 font-plus-jakarta">Unavailable</div>
        ) : quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => addItem({ id: product.id, productId: product.id, name: product.name, unitPriceKes: product.priceKes, quantity: 1 })}
            className="w-full h-8 bg-oda-green text-white text-xs font-bold rounded-button flex items-center justify-center gap-1 hover:bg-oda-green-dark"
          >
            <span>+</span> ADD
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-oda-green rounded-button h-8 px-2">
            <button onClick={() => updateQuantity(product.id, undefined, quantity - 1)} className="text-white text-lg font-bold">-</button>
            <span className="text-white font-bold text-sm">{quantity}</span>
            <button onClick={() => updateQuantity(product.id, undefined, quantity + 1)} className="text-white text-lg font-bold">+</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
