'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Zap, TrendingDown } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';
import { ForgottenItemsShelf } from '@/components/shop/forgotten-items-shelf';
import { hydrateCartFromServerIfAuthed } from '@/lib/cart-server-sync';

function SummaryRow({ label, value, valueClass, bold }: { label: string; value: string; valueClass?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-plus-jakarta ${bold ? 'font-extrabold text-oda-charcoal' : 'text-oda-charcoal/60'}`}>{label}</span>
      <span className={`text-sm font-plus-jakarta ${bold ? 'font-extrabold text-oda-charcoal' : 'text-oda-charcoal/80'} ${valueClass ?? ''}`}>{value}</span>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotalKes, deliveryFeeKes, totalKes, updateQuantity, removeItem, clear } = useCartStore();

  useEffect(() => {
    hydrateCartFromServerIfAuthed();
  }, []);

  // Total savings vs MRP
  const totalSavingsKes = items.reduce((s, item) => {
    const mrpTotal = (item.mrpKes ?? item.unitPriceKes) * item.quantity;
    const actualTotal = item.totalPriceKes;
    return s + Math.max(0, mrpTotal - actualTotal);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-oda-mint rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={36} className="text-oda-green" />
          </div>
          <h1 className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">Your cart is empty</h1>
          <p className="text-oda-charcoal/50 font-plus-jakarta text-sm mb-6">Add some items from our catalog to get started.</p>
          <Link href="/" className="bg-oda-green text-white font-bold px-6 py-3 rounded-xl font-plus-jakarta hover:bg-oda-green-dark transition-colors inline-block">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Savings banner */}
      {totalSavingsKes > 0 && (
        <div className="bg-oda-green text-white px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <TrendingDown size={16} />
            <p className="text-sm font-extrabold font-plus-jakarta">
              You&apos;re saving {formatKES(totalSavingsKes)} on this order!
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">
            Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <button onClick={clear} className="text-sm text-red-500 font-plus-jakarta hover:underline flex items-center gap-1">
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8">
          {/* Items column */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => {
                const itemSavings = item.mrpKes
                  ? Math.max(0, (item.mrpKes - item.unitPriceKes) * item.quantity)
                  : 0;

                return (
                  <motion.div
                    key={item.productId + (item.variantId ?? '')}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-oda-charcoal/8 p-4 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-oda-ivory rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <ShoppingBag size={22} className="text-oda-charcoal/15" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta line-clamp-2">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">{formatKES(item.totalPriceKes)}</p>
                        {itemSavings > 0 && (
                          <span className="text-xs font-bold text-oda-green bg-oda-mint px-1.5 py-0.5 rounded-full font-plus-jakarta">
                            Save {formatKES(itemSavings)}
                          </span>
                        )}
                      </div>
                      {itemSavings === 0 && item.quantity >= 3 && (
                        <p className="text-[10px] text-oda-charcoal/40 font-plus-jakarta mt-0.5 flex items-center gap-1">
                          <Tag size={10} /> Bulk pricing applied
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-7 h-7 bg-oda-ivory rounded-lg flex items-center justify-center hover:bg-oda-charcoal/10 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-oda-charcoal w-5 text-center font-plus-jakarta">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-7 h-7 bg-oda-green rounded-lg flex items-center justify-center hover:bg-oda-green-dark transition-colors"
                      >
                        <Plus size={14} className="text-white" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-oda-charcoal/20 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <Link href="/" className="block text-center text-sm text-oda-green font-plus-jakarta mt-2 hover:underline">
              + Continue Shopping
            </Link>
          </div>

          {/* Order summary — sticky on desktop */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
              <h2 className="text-base font-extrabold text-oda-charcoal font-plus-jakarta mb-4">Order Summary</h2>
              <div className="space-y-2.5">
                <SummaryRow label="Subtotal" value={formatKES(subtotalKes)} />
                <SummaryRow
                  label="Delivery fee"
                  value={deliveryFeeKes === 0 ? 'FREE' : formatKES(deliveryFeeKes)}
                  valueClass={deliveryFeeKes === 0 ? 'text-oda-green font-extrabold' : ''}
                />
                {deliveryFeeKes > 0 && (
                  <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">Free delivery on orders over KES 2,500</p>
                )}
                {totalSavingsKes > 0 && (
                  <SummaryRow label="You save" value={formatKES(totalSavingsKes)} valueClass="text-oda-green font-extrabold" />
                )}
                <div className="border-t border-oda-charcoal/8 pt-2.5 mt-2.5">
                  <SummaryRow label="Total" value={formatKES(totalKes)} bold />
                </div>
              </div>
            </div>

            {/* Delivery promise */}
            <div className="flex items-center gap-2 bg-oda-mint rounded-xl px-4 py-3">
              <Zap size={15} className="text-oda-green shrink-0" />
              <p className="text-sm font-semibold text-oda-green font-plus-jakarta">Delivered in ~30 minutes</p>
            </div>

            {/* Forgotten habitual items */}
            <ForgottenItemsShelf cartProductIds={items.map((i) => i.productId)} />

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-oda-green text-white py-4 rounded-2xl text-base font-extrabold font-plus-jakarta flex items-center justify-center gap-2 hover:bg-oda-green-dark transition-colors"
            >
              Proceed to Checkout · {formatKES(totalKes)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
