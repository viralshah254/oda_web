'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart.store';
import { catalogApi } from '@/lib/api-client';
import { formatKES } from '@/lib/utils';

const POPULAR_SEARCHES = ['maize flour', 'cooking oil', 'milk', 'rice', 'sugar', 'bread', 'eggs', 'tomatoes'];

interface Product {
  id: string;
  slug?: string;
  name: string;
  priceKes: number;
  mrpKes?: number;
  imageUrl?: string | null;
  inStock: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const stored = JSON.parse(localStorage.getItem('oda_recent_searches') || '[]');
      setRecentSearches(stored.slice(0, 6));
    } catch {}
  }, []);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    catalogApi.search(debouncedQuery, { limit: 20 })
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        const items: Product[] = Array.isArray(data) ? data : data.items ?? [];
        setResults(items);
        // Persist to recent searches
        const updated = [debouncedQuery, ...recentSearches.filter((s) => s !== debouncedQuery)].slice(0, 6);
        setRecentSearches(updated);
        localStorage.setItem('oda_recent_searches', JSON.stringify(updated));
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#198A2E] animate-spin" />
        ) : query ? (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-[#999]" />
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for groceries, drinks, essentials..."
          className="w-full pl-11 pr-10 py-3.5 rounded-[18px] bg-white border border-[#E0E0D8] text-sm text-[#1A1A1A] font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/30 transition-all"
        />
      </div>

      {/* Suggestions / empty state */}
      {!query && (
        <div className="space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-3">Recent</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="bg-white border border-[#E0E0D8] text-[#1A1A1A] text-sm px-3 py-1.5 rounded-full hover:bg-[#EBF9EE] hover:text-[#198A2E] transition-colors font-plus-jakarta">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-3">Popular</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => setQuery(s)} className="bg-[#EBF9EE] border border-[#198A2E]/20 text-[#198A2E] text-sm px-3 py-1.5 rounded-full hover:bg-[#198A2E] hover:text-white transition-colors font-plus-jakarta font-medium">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && !loading && results.length === 0 && debouncedQuery === query.trim() && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-bold text-[#1A1A1A] font-plus-jakarta">No results for &quot;{query}&quot;</p>
          <p className="text-sm text-[#666] font-plus-jakarta mt-1">Try different keywords or browse categories.</p>
          <Link href="/categories" className="inline-block mt-4 text-[#198A2E] font-bold text-sm font-plus-jakarta underline">Browse categories</Link>
        </div>
      )}

      {query && results.length > 0 && (
        <div>
          <p className="text-sm text-[#666] font-plus-jakarta mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((product, i) => (
              <SearchProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchProductCard({ product, index }: { product: Product; index: number }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const saving = product.mrpKes ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100) : 0;
  const href = `/products/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-product-card border border-oda-charcoal/6 overflow-hidden hover:shadow-soft transition-all"
    >
      <div className="relative">
        {saving > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#198A2E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{saving}% off</span>
          </div>
        )}
        <Link href={href}>
          <div className="aspect-square bg-[#F5F5F0] flex items-center justify-center">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
            ) : (
              <ShoppingCart className="w-8 h-8 text-[#1A1A1A]/15" />
            )}
          </div>
        </Link>
      </div>
      <div className="p-2.5">
        <Link href={href}>
          <p className="text-[#1A1A1A] text-xs font-medium line-clamp-2 min-h-[2.5rem] mb-1 hover:text-[#198A2E] transition-colors font-plus-jakarta">{product.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[#1A1A1A] font-bold text-sm font-plus-jakarta">{formatKES(product.priceKes)}</span>
          {product.mrpKes && <span className="text-[#999] text-[10px] line-through font-plus-jakarta">{formatKES(product.mrpKes)}</span>}
        </div>
        {quantity === 0 ? (
          <button
            onClick={() => addItem({ id: product.id, productId: product.id, name: product.name, unitPriceKes: product.priceKes, quantity: 1 })}
            className="w-full h-8 bg-[#198A2E] text-white text-xs font-bold rounded-button flex items-center justify-center gap-1 hover:bg-[#166b24] font-plus-jakarta"
          >
            + ADD
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#198A2E] rounded-button h-8 px-2">
            <button onClick={() => updateQuantity(product.id, undefined, quantity - 1)} className="text-white text-lg font-bold">-</button>
            <span className="text-white font-bold text-sm">{quantity}</span>
            <button onClick={() => updateQuantity(product.id, undefined, quantity + 1)} className="text-white text-lg font-bold">+</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
