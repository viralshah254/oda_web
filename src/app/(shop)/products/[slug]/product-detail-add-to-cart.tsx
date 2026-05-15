'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import type { CatalogProduct } from '@/lib/server/catalog-fetcher';

export function ProductDetailAddToCart({ product }: { product: CatalogProduct }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const [localQty, setLocalQty] = useState(Math.max(quantity, 1));

  const handleAdd = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      unitPriceKes: product.priceKes,
      quantity: localQty,
    });
  };

  if (!product.inStock) {
    return (
      <div className="w-full py-3.5 bg-[#F5F5F0] text-[#999] rounded-xl text-base font-extrabold font-plus-jakarta text-center">
        Out of Stock
      </div>
    );
  }

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-white border border-[#E8E8E0] rounded-xl px-4 py-3 flex-1">
          <button
            onClick={() => updateQuantity(product.id, undefined, quantity - 1)}
            className="w-8 h-8 bg-[#F5F5F0] rounded-lg flex items-center justify-center hover:bg-[#E8E8E0] transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-lg font-extrabold text-[#1A1A1A] font-plus-jakarta flex-1 text-center">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, undefined, quantity + 1)}
            className="w-8 h-8 bg-[#198A2E] rounded-lg flex items-center justify-center hover:bg-[#166b24] transition-colors"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>
        <div className="bg-[#198A2E] text-white px-4 py-3 rounded-xl text-sm font-bold font-plus-jakarta flex items-center gap-1">
          <ShoppingBag size={16} />
          In Cart
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 bg-white border border-[#E8E8E0] rounded-xl px-4 py-3">
        <button
          onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
          className="w-8 h-8 bg-[#F5F5F0] rounded-lg flex items-center justify-center hover:bg-[#E8E8E0] transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="text-lg font-extrabold text-[#1A1A1A] font-plus-jakarta w-6 text-center">{localQty}</span>
        <button
          onClick={() => setLocalQty((q) => q + 1)}
          className="w-8 h-8 bg-[#198A2E] rounded-lg flex items-center justify-center hover:bg-[#166b24] transition-colors"
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        className="flex-1 bg-[#198A2E] text-white py-3 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingBag size={18} />
        Add to Cart · KES {Math.floor(product.priceKes / 100) * localQty}
      </motion.button>
    </div>
  );
}
