'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Heart, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { wishlistApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCartStore, afterLocalCartAdd } from '@/lib/stores/cart.store';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceKes: number;
    images?: Array<{ url: string }>;
  };
}

export default function ListsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/lists');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const res = await wishlistApi.list();
      setItems(res.data?.items ?? res.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch { /* ignore */ }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      id: `${item.productId}_${Date.now()}`,
      productId: item.productId,
      name: item.product.name,
      imageUrl: item.product.images?.[0]?.url,
      unitPriceKes: item.product.priceKes,
      quantity: 1,
    });
    afterLocalCartAdd(item.productId, 1);
  };

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Saved Lists</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-5 space-y-3">
        {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="text-oda-green animate-spin" /></div>}

        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <Heart size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">Your wishlist is empty</p>
            <Link href="/" className="mt-4 inline-block text-sm font-bold text-oda-green font-plus-jakarta">Browse products</Link>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-oda-ivory rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {item.product.images?.[0]?.url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-contain p-1" />
                : <Heart size={20} className="text-oda-charcoal/20" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.product.slug}`} className="text-sm font-semibold text-oda-charcoal font-plus-jakarta line-clamp-2 hover:text-oda-green">
                {item.product.name}
              </Link>
              <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta mt-0.5">
                KES {(item.product.priceKes / 100).toFixed(0)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddToCart(item)}
                className="p-2 bg-oda-green text-white rounded-xl hover:bg-oda-green-dark transition-colors"
              >
                <ShoppingCart size={14} />
              </button>
              <button
                onClick={() => handleRemove(item.productId)}
                className="p-2 text-oda-charcoal/30 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
