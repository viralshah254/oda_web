import type { Metadata } from 'next';
import { ShoppingBag, Star, ChevronLeft, Shield, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import { fetchProductBySlug } from '@/lib/server/catalog-fetcher';
import { ProductDetailAddToCart } from './product-detail-add-to-cart';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    return { title: 'Product | Oda' };
  }
  return {
    title: `${product.name} | Oda`,
    description: `Buy ${product.name} on Oda — delivered in ~30 minutes across Kenya.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">Product not found</h1>
          <p className="text-[#666] font-plus-jakarta mb-6">This product may no longer be available.</p>
          <Link href="/" className="bg-[#198A2E] text-white font-bold px-6 py-3 rounded-xl font-plus-jakarta">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const saving = product.mrpKes
    ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Back nav */}
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-3">
        <Link href={`/categories/${product.categorySlug || 'groceries-kitchen'}`} className="flex items-center gap-1 text-sm text-[#666] font-plus-jakarta hover:text-[#198A2E] transition-colors">
          <ChevronLeft size={16} />
          {product.categorySlug?.replace(/-/g, ' ') ?? 'Back'}
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="bg-white rounded-2xl aspect-square flex items-center justify-center mb-3 border border-[#E8E8E0]">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-6" />
            ) : (
              <ShoppingBag size={80} className="text-[#1A1A1A]/10" />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {product.categorySlug && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#198A2E] bg-[#EBF9EE] px-2 py-1 rounded-full font-plus-jakarta">
                {product.categorySlug.replace(/-/g, ' ')}
              </span>
              {!product.inStock && (
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full font-plus-jakarta">
                  Out of stock
                </span>
              )}
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta leading-tight mb-1">
            {product.name}
          </h1>
          {product.brandName && (
            <p className="text-sm text-[#666] font-plus-jakarta mb-3">{product.brandName}</p>
          )}

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array(5).fill(null).map((_, i) => (
                <Star key={i} size={14} className={i < 4 ? 'text-[#F8C915] fill-[#F8C915]' : 'text-[#E8E8E0]'} />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">4.5</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold text-[#1A1A1A] font-plus-jakarta">
              KES {Math.floor(product.priceKes / 100)}
            </span>
            {product.mrpKes && product.mrpKes > product.priceKes && (
              <>
                <span className="text-lg text-[#999] line-through font-plus-jakarta">
                  KES {Math.floor(product.mrpKes / 100)}
                </span>
                <span className="text-sm font-bold text-[#198A2E] bg-[#EBF9EE] px-2 py-1 rounded-full font-plus-jakarta">
                  {saving}% off
                </span>
              </>
            )}
          </div>

          {/* Delivery info */}
          <div className="flex items-center gap-2 bg-[#EBF9EE] rounded-xl p-3 mb-5">
            <Zap size={16} className="text-[#198A2E]" />
            <span className="text-sm font-semibold text-[#198A2E] font-plus-jakarta">Delivery in ~30 minutes</span>
          </div>

          {/* Add to cart (client component) */}
          <ProductDetailAddToCart product={product} />

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { icon: Shield, text: 'Genuine products guaranteed' },
              { icon: RotateCcw, text: '30-day easy returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white border border-[#E8E8E0] rounded-xl p-3">
                <Icon size={16} className="text-[#198A2E] shrink-0" />
                <span className="text-xs text-[#444] font-plus-jakarta">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {(product as any).description && (
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6 mb-4">
            <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-3">About this product</h2>
            <p className="text-sm text-[#444] font-plus-jakarta leading-relaxed">{(product as any).description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
