'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { cn, formatKES } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartStore, afterLocalCartAdd } from '@/lib/stores/cart.store';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    priceKes: number;
    mrpKes?: number;
    savingPct?: number;
    storageType?: string;
    isChilled?: boolean;
    packSize?: number;
    caseSize?: number | null;
    minimumOrderQty?: number;
    unitLabel?: string;
    badge?: string;
    inStock?: boolean;
    pricingTiers?: Array<{ minQuantity: number; priceKes: number; discountPct: number | null }>;
    b2bPriceKes?: number | null;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const saving = product.mrpKes && product.mrpKes > product.priceKes
    ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100)
    : 0;

  // Best bulk discount from volume tiers
  const bestTierDiscount = product.pricingTiers?.length
    ? Math.max(...product.pricingTiers.map((t) => t.discountPct ?? 0))
    : 0;
  const caseLabel = product.caseSize ? `Case of ${product.caseSize}` : product.packSize && product.packSize > 1 ? `Pack of ${product.packSize}` : null;

  const handleAdd = async () => {
    setIsAdding(true);
    addItem({
      id: `${product.id}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPriceKes: product.priceKes,
      quantity: 1,
    });
    afterLocalCartAdd(product.id, 1);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative bg-white rounded-product-card border border-oda-charcoal/6 overflow-hidden hover:shadow-soft transition-all duration-200',
        !product.inStock && 'opacity-60',
        className,
      )}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {saving > 0 && (
          <Badge variant="green" className="text-[10px] px-1.5 py-0.5">
            {saving}% off
          </Badge>
        )}
        {bestTierDiscount > 0 && (
          <Badge variant="orange" className="text-[10px] px-1.5 py-0.5">
            Up to {bestTierDiscount}% bulk
          </Badge>
        )}
        {product.storageType === 'CHILLED' && (
          <Badge variant="blue" className="text-[10px] px-1.5 py-0.5">
            Chilled
          </Badge>
        )}
        {product.storageType === 'FROZEN' && (
          <Badge variant="blue" className="text-[10px] px-1.5 py-0.5">
            Frozen
          </Badge>
        )}
        {product.badge && (
          <Badge variant="orange" className="text-[10px] px-1.5 py-0.5">
            {product.badge}
          </Badge>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-oda-ivory overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-oda-charcoal/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 pb-3">
        <p className="text-oda-charcoal font-medium text-xs leading-tight line-clamp-2 mb-1.5 min-h-[2.5rem]">
          {product.name}
        </p>

        {caseLabel && (
          <p className="text-oda-charcoal/50 text-[10px] font-semibold mb-1 bg-oda-ivory px-1.5 py-0.5 rounded-md inline-block">
            {caseLabel}
          </p>
        )}

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-oda-charcoal font-bold text-sm">
            {formatKES(product.priceKes)}
          </span>
          {product.mrpKes && product.mrpKes > product.priceKes && (
            <span className="text-muted-foreground text-[11px] line-through">
              {formatKES(product.mrpKes)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        {product.inStock === false ? (
          <div className="w-full h-8 rounded-button bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Out of stock</span>
          </div>
        ) : quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            animate={isAdding ? { scale: [1, 1.15, 1] } : {}}
            onClick={handleAdd}
            className="w-full h-8 rounded-button bg-oda-green text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-oda-green-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-oda-green rounded-button h-8 px-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(product.id, undefined, quantity - 1)}
              className="text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-oda-green-dark transition-colors"
            >
              <Minus className="w-3 h-3" />
            </motion.button>
            <span className="text-white font-bold text-sm">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                updateQuantity(product.id, undefined, quantity + 1);
                if (!cartItem?.cartItemId) afterLocalCartAdd(product.id, 1);
              }}
              className="text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-oda-green-dark transition-colors"
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
