'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotalKes, deliveryFeeKes, totalKes, updateQuantity, removeItem, clear } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-[#EBF9EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={36} className="text-[#198A2E]" />
          </div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">Your cart is empty</h1>
          <p className="text-[#666] font-plus-jakarta text-sm mb-6">Add some items from our catalog to get started.</p>
          <Link
            href="/"
            className="bg-[#198A2E] text-white font-bold px-6 py-3 rounded-xl font-plus-jakarta hover:bg-[#166b24] transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">
            Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <button onClick={clear} className="text-sm text-red-600 font-plus-jakarta hover:underline flex items-center gap-1">
            <Trash2 size={14} />
            Clear
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-5">
          {items.map((item, i) => (
            <motion.div
              key={item.productId + (item.variantId ?? '')}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[#E8E8E0] p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-[#F5F5F0] rounded-xl flex items-center justify-center flex-shrink-0">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1 rounded-xl" />
                ) : (
                  <ShoppingBag size={24} className="text-[#1A1A1A]/15" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta line-clamp-2">{item.name}</p>
                <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mt-0.5">{formatKES(item.totalPriceKes)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  className="w-7 h-7 bg-[#F5F5F0] rounded-lg flex items-center justify-center hover:bg-[#E8E8E0] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-[#1A1A1A] w-5 text-center font-plus-jakarta">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  className="w-7 h-7 bg-[#198A2E] rounded-lg flex items-center justify-center hover:bg-[#166b24] transition-colors"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5 mb-5">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Order Summary</h2>
          <div className="space-y-2">
            <SummaryRow label="Subtotal" value={formatKES(subtotalKes)} />
            <SummaryRow
              label="Delivery fee"
              value={deliveryFeeKes === 0 ? 'FREE' : formatKES(deliveryFeeKes)}
              valueClass={deliveryFeeKes === 0 ? 'text-[#198A2E] font-bold' : ''}
            />
            {deliveryFeeKes > 0 && (
              <p className="text-xs text-[#999] font-plus-jakarta">Free delivery on orders over KES 1,000</p>
            )}
            <div className="border-t border-[#E8E8E0] pt-2 mt-2">
              <SummaryRow label="Total" value={formatKES(totalKes)} bold />
            </div>
          </div>
        </div>

        {/* Checkout CTA */}
        <Link
          href="/checkout"
          className="w-full bg-[#198A2E] text-white py-4 rounded-2xl text-base font-extrabold font-plus-jakarta flex items-center justify-center gap-2 hover:bg-[#166b24] transition-colors"
        >
          Proceed to Checkout · {formatKES(totalKes)}
        </Link>

        <Link href="/" className="block text-center text-sm text-[#198A2E] font-plus-jakarta mt-4 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass, bold }: { label: string; value: string; valueClass?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-plus-jakarta ${bold ? 'font-bold text-[#1A1A1A]' : 'text-[#666]'}`}>{label}</span>
      <span className={`text-sm font-plus-jakarta ${bold ? 'font-bold text-[#1A1A1A]' : 'text-[#444]'} ${valueClass ?? ''}`}>{value}</span>
    </div>
  );
}
