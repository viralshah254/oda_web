'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Clock, Plus, X } from 'lucide-react';
import { recommendationsApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCartStore, afterLocalCartAdd } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';

const DISMISS_KEY = 'oda:forgotten-shelf-dismissed';

export interface ForgottenItemsShelfProps {
  cartProductIds: string[];
}

export function ForgottenItemsShelf({ cartProductIds }: ForgottenItemsShelfProps) {
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [dismissed, setDismissed] = useState(false);
  const [items, setItems] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      priceKes: number;
      daysSinceLast: number;
    }>
  >([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  const load = useCallback(async () => {
    if (!isAuthenticated || dismissed) return;
    try {
      const { data } = await recommendationsApi.preCheckout(cartProductIds);
      const list = (data as { items?: typeof items })?.items ?? [];
      setItems(list);
    } catch {
      setItems([]);
    }
  }, [isAuthenticated, dismissed, cartProductIds]);

  useEffect(() => {
    void load();
  }, [load]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
    setItems([]);
  };

  if (!isAuthenticated || dismissed || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-oda-charcoal/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-oda-mint flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-oda-green" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Did you forget anything?</p>
            <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">
              Based on what you usually reorder — quick add below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1.5 rounded-lg text-oda-charcoal/30 hover:text-oda-charcoal hover:bg-oda-ivory transition-colors"
          aria-label="Dismiss suggestions"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {items.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-[148px] rounded-xl border border-oda-charcoal/8 bg-oda-ivory/40 p-2.5 flex flex-col"
          >
            <div className="relative w-full aspect-square rounded-lg bg-white overflow-hidden mb-2">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1" sizes="120px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-oda-charcoal/30 font-plus-jakarta">
                  No image
                </div>
              )}
            </div>
            <p className="text-[11px] font-semibold text-oda-charcoal font-plus-jakarta line-clamp-2 min-h-[2.25rem]">{p.name}</p>
            <p className="text-[10px] text-oda-charcoal/45 font-plus-jakarta mt-0.5">
              ~{p.daysSinceLast}d since last buy
            </p>
            <p className="text-xs font-extrabold text-oda-charcoal font-plus-jakarta mt-1">{formatKES(p.priceKes)}</p>
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: `${p.id}_${Date.now()}`,
                  productId: p.id,
                  name: p.name,
                  imageUrl: p.imageUrl ?? undefined,
                  unitPriceKes: p.priceKes,
                  quantity: 1,
                });
                afterLocalCartAdd(p.id, 1);
              }}
              className="mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-oda-green text-white text-[11px] font-bold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
            >
              <Plus size={12} strokeWidth={3} /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
