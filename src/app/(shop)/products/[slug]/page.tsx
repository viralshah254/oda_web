import type { Metadata } from 'next';
import { ShoppingBag, Star, ChevronLeft, Shield, RotateCcw, Zap, Lock, Package, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { fetchProductBySlug } from '@/lib/server/catalog-fetcher';
import { ProductDetailAddToCart } from './product-detail-add-to-cart';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: 'Product | Oda' };
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
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">Product not found</h1>
          <p className="text-oda-charcoal/50 font-plus-jakarta mb-6">This product may no longer be available.</p>
          <Link href="/" className="bg-oda-green text-white font-bold px-6 py-3 rounded-xl font-plus-jakarta">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const saving = product.mrpKes && product.mrpKes > product.priceKes
    ? Math.round(((product.mrpKes - product.priceKes) / product.mrpKes) * 100)
    : 0;

  const hasTiers = (product.pricingTiers?.length ?? 0) > 0;
  const hasCase = !!(product.caseSize && product.caseSize > 1);
  const casePrice = hasCase && hasTiers
    ? product.pricingTiers!.find(t => t.minQuantity <= (product.caseSize ?? 1))?.priceKes
    : null;

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Back nav */}
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/categories/${product.categorySlug || 'groceries-kitchen'}`}
            className="flex items-center gap-1 text-sm text-oda-charcoal/50 font-plus-jakarta hover:text-oda-green transition-colors w-fit"
          >
            <ChevronLeft size={16} />
            {product.categorySlug?.replace(/-/g, ' ') ?? 'Back'}
          </Link>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10">

          {/* LEFT: Image Gallery */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 aspect-square flex items-center justify-center overflow-hidden relative">
              {saving > 0 && (
                <div className="absolute top-4 left-4 bg-oda-green text-white text-sm font-extrabold px-3 py-1 rounded-full font-plus-jakarta">
                  {saving}% off
                </div>
              )}
              {!product.inStock && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta">
                  Out of stock
                </div>
              )}
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="w-3/4 h-3/4 object-contain" />
              ) : (
                <ShoppingBag size={96} className="text-oda-charcoal/10" />
              )}
            </div>

            {/* Guarantees row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: 'Genuine products guaranteed' },
                { icon: RotateCcw, text: '30-day easy returns' },
                { icon: Zap, text: 'Delivered in ~30 minutes' },
                { icon: Package, text: 'Secure packing' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white border border-oda-charcoal/8 rounded-xl p-3">
                  <Icon size={15} className="text-oda-green shrink-0" />
                  <span className="text-xs text-oda-charcoal/60 font-plus-jakarta">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product info — sticky on scroll */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-5">
            {/* Category + stock */}
            {product.categorySlug && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-oda-green bg-oda-mint px-2 py-1 rounded-full font-plus-jakarta">
                  {product.categorySlug.replace(/-/g, ' ')}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-oda-charcoal font-plus-jakarta leading-tight mb-1">
                {product.name}
              </h1>
              {product.brandName && (
                <p className="text-sm text-oda-charcoal/50 font-plus-jakarta">{product.brandName}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} size={14} className={i < 4 ? 'text-oda-yellow fill-oda-yellow' : 'text-oda-charcoal/20'} />
                ))}
              </div>
              <span className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">4.5</span>
              <span className="text-sm text-oda-charcoal/40 font-plus-jakarta">(24 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-oda-charcoal font-plus-jakarta">
                KES {(product.priceKes / 100).toFixed(0)}
              </span>
              {product.mrpKes && product.mrpKes > product.priceKes && (
                <>
                  <span className="text-lg text-oda-charcoal/40 line-through font-plus-jakarta">
                    KES {(product.mrpKes / 100).toFixed(0)}
                  </span>
                  <span className="text-sm font-bold text-oda-green bg-oda-mint px-2 py-1 rounded-full font-plus-jakarta">
                    Save {saving}%
                  </span>
                </>
              )}
            </div>

            {/* Pack / Case info */}
            {(hasCase || product.minimumOrderQty && product.minimumOrderQty > 1) && (
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-oda-charcoal/60">
                {hasCase && (
                  <span className="bg-oda-ivory border border-oda-charcoal/10 px-2.5 py-1 rounded-lg">
                    Case of {product.caseSize}
                  </span>
                )}
                {product.minimumOrderQty && product.minimumOrderQty > 1 && (
                  <span className="bg-oda-ivory border border-oda-charcoal/10 px-2.5 py-1 rounded-lg">
                    MOQ: {product.minimumOrderQty}
                  </span>
                )}
                {product.unitOfMeasure && product.unitOfMeasure !== 'UNIT' && (
                  <span className="bg-oda-ivory border border-oda-charcoal/10 px-2.5 py-1 rounded-lg">
                    per {product.unitOfMeasure}
                  </span>
                )}
              </div>
            )}

            {/* Volume pricing ladder */}
            {hasTiers && (
              <div className="bg-white border border-oda-charcoal/8 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={16} className="text-oda-green" />
                  <h3 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Bulk savings</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-oda-charcoal/50 font-plus-jakarta px-1">
                    <span>Quantity</span>
                    <span>Price per unit</span>
                  </div>
                  <div className="flex items-center justify-between bg-oda-ivory rounded-xl px-3 py-2">
                    <span className="text-xs font-semibold text-oda-charcoal font-plus-jakarta">1 unit</span>
                    <span className="text-xs font-bold text-oda-charcoal font-plus-jakarta">KES {(product.priceKes / 100).toFixed(0)}</span>
                  </div>
                  {product.pricingTiers!.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between bg-oda-mint rounded-xl px-3 py-2">
                      <div>
                        <span className="text-xs font-semibold text-oda-green font-plus-jakarta">{tier.label}</span>
                        {tier.discountPct && (
                          <span className="ml-2 text-[10px] font-bold bg-oda-green text-white px-1.5 py-0.5 rounded-full">{tier.discountPct}% off</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-oda-green font-plus-jakarta">KES {(tier.priceKes / 100).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B2B wholesale callout */}
            {product.b2bPriceKes ? (
              <div className="bg-oda-charcoal rounded-2xl p-4 flex items-start gap-3">
                <Lock size={18} className="text-oda-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-oda-yellow font-extrabold text-sm font-plus-jakarta mb-0.5">Wholesale price</p>
                  <p className="text-white font-extrabold text-xl font-plus-jakarta">
                    KES {(product.b2bPriceKes / 100).toFixed(0)}
                    <span className="text-white/50 font-normal text-sm ml-2">for registered businesses</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-oda-charcoal rounded-2xl p-4 flex items-start gap-3">
                <Lock size={18} className="text-oda-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-oda-yellow font-extrabold text-sm font-plus-jakarta mb-0.5">Wholesale prices available</p>
                  <p className="text-white/70 text-xs font-plus-jakarta mb-2">
                    Register your business to unlock lower B2B prices, volume discounts, and credit terms.
                  </p>
                  <Link href="/b2b" className="inline-block bg-oda-yellow text-oda-charcoal text-xs font-extrabold px-4 py-2 rounded-lg hover:bg-oda-yellow-2 transition-colors font-plus-jakarta">
                    Apply for wholesale
                  </Link>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <ProductDetailAddToCart product={product} />

            {/* Description */}
            {(product as any).description && (
              <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
                <h2 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta mb-2">About this product</h2>
                <p className="text-sm text-oda-charcoal/60 font-plus-jakarta leading-relaxed">{(product as any).description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
