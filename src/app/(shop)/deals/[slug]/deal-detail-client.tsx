'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { DealProductCard, type DealCollection } from '@/components/shop/deal-zone';

const THEMES: Record<string, { bg: string; accent: string; badge: string; badgeText: string }> = {
  green:  { bg: '#EBF9EE', accent: '#198A2E', badge: '#198A2E', badgeText: '#fff' },
  yellow: { bg: '#FFFBEB', accent: '#D97706', badge: '#F8C915', badgeText: '#1A1A1A' },
  red:    { bg: '#FEF2F2', accent: '#DC2626', badge: '#DC2626', badgeText: '#fff' },
  blue:   { bg: '#EFF6FF', accent: '#2563EB', badge: '#2563EB', badgeText: '#fff' },
  purple: { bg: '#F5F3FF', accent: '#7C3AED', badge: '#7C3AED', badgeText: '#fff' },
  black:  { bg: '#1A1A1A', accent: '#F8C915', badge: '#F8C915', badgeText: '#1A1A1A' },
  orange: { bg: '#FFF7ED', accent: '#EA580C', badge: '#EA580C', badgeText: '#fff' },
};

function getTheme(key: string) {
  return THEMES[key] ?? THEMES.green;
}

export function DealDetailClient({ deal }: { deal: DealCollection }) {
  const theme = getTheme(deal.theme);
  const isDark = deal.theme === 'black';
  const products = deal.products.map((p) => ({ ...p.product, isHighlighted: p.isHighlighted }));

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: theme.bg }} className="border-b border-gray-100/40">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold font-plus-jakarta mb-4"
            style={{ color: theme.accent }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-start gap-3">
            {deal.icon && (
              <span className="text-4xl leading-none mt-1">{deal.icon}</span>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-2xl sm:text-3xl font-extrabold font-plus-jakarta"
                  style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
                >
                  {deal.name}
                </h1>
                {deal.badgeLabel && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta"
                    style={{ backgroundColor: theme.badge, color: theme.badgeText }}
                  >
                    {deal.badgeLabel}
                  </span>
                )}
              </div>
              {deal.tagline && (
                <p
                  className="text-sm mt-1 font-plus-jakarta"
                  style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,26,0.55)' }}
                >
                  {deal.tagline}
                </p>
              )}
              <p
                className="text-sm mt-2 font-plus-jakarta font-semibold"
                style={{ color: theme.accent }}
              >
                <Tag className="w-3.5 h-3.5 inline mr-1" />
                {products.length} item{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-oda-charcoal/40 font-plus-jakarta">No products in this deal yet.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {products.map((product, i) => (
              <DealProductCard key={product.id} product={product} index={i} isDarkBg={isDark} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
