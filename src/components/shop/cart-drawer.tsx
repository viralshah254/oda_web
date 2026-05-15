'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart.store';
import { formatKES } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, totalKes, subtotalKes, deliveryFeeKes, savingsKes } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-oda-ivory shadow-floating z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-oda-charcoal/8">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-oda-green" />
                <h2 className="text-lg font-bold text-oda-charcoal">Your Cart</h2>
                <span className="bg-oda-mint text-oda-green text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button onClick={closeCart} className="w-9 h-9 rounded-full bg-white border border-oda-charcoal/10 flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-oda-charcoal/20 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <p className="text-muted-foreground text-sm mt-1">Add some items to get started!</p>
                  <button onClick={closeCart} className="mt-4 bg-oda-green text-white rounded-button px-6 py-2.5 text-sm font-bold hover:bg-oda-green-dark transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item.productId}_${item.variantId}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="bg-white rounded-[16px] p-3 flex items-center gap-3 border border-oda-charcoal/6"
                  >
                    <div className="w-14 h-14 rounded-[12px] bg-oda-ivory flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-oda-charcoal/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-oda-charcoal text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-oda-green font-bold text-sm mt-0.5">{formatKES(item.unitPriceKes)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-oda-green rounded-[10px] h-8 px-2">
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="text-white text-lg font-bold w-5 flex items-center justify-center">-</button>
                        <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="text-white text-lg font-bold w-5 flex items-center justify-center">+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="w-7 h-7 rounded-full bg-red-50 text-oda-red flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t border-oda-charcoal/8 p-5 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-oda-charcoal/70">
                    <span>Subtotal</span>
                    <span>{formatKES(subtotalKes)}</span>
                  </div>
                  <div className="flex justify-between text-oda-charcoal/70">
                    <span>Delivery</span>
                    <span>{deliveryFeeKes === 0 ? <span className="text-oda-green font-medium">FREE</span> : formatKES(deliveryFeeKes)}</span>
                  </div>
                  {savingsKes > 0 && (
                    <div className="flex justify-between text-oda-green font-medium">
                      <span>You save</span>
                      <span>-{formatKES(savingsKes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-oda-charcoal font-bold text-base border-t border-oda-charcoal/8 pt-2">
                    <span>Total</span>
                    <span>{formatKES(totalKes)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-oda-green text-white text-center rounded-button py-3.5 font-bold text-base hover:bg-oda-green-dark transition-colors"
                >
                  Proceed to Checkout →
                </Link>
                <p className="text-center text-muted-foreground text-xs">
                  🔒 Secure checkout via M-Pesa
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
