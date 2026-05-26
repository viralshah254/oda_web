import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, Sparkles } from 'lucide-react';
import { DealZone, type DealCollection } from '@/components/shop/deal-zone';

const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api';

export const metadata: Metadata = {
  title: 'Deals & Offers | Oda',
  description: 'Weekly deals, bulk savings, and special offers on groceries across Kenya.',
};

async function fetchActiveDeals(): Promise<DealCollection[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/deals`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch {
    /* backend unavailable */
  }
  return [];
}

export default async function DealsIndexPage() {
  const deals = await fetchActiveDeals();

  return (
    <div className="px-4 lg:px-8 pb-16 max-w-screen-2xl mx-auto w-full">
      <div className="pt-6 lg:pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-oda-green font-plus-jakarta mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Save more
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-oda-charcoal font-plus-jakarta tracking-tight">
              Deals &amp; offers
            </h1>
            <p className="text-oda-charcoal/55 font-plus-jakarta mt-2 max-w-xl text-sm lg:text-base">
              Bulk discounts, promos, and curated savings — same fast delivery across Nairobi.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-oda-charcoal/10 bg-white px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta shadow-sm hover:border-oda-green/30 hover:bg-oda-mint/50 transition-colors shrink-0"
          >
            Browse all categories
          </Link>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-[22px] border border-oda-charcoal/8 bg-white p-12 lg:p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-oda-mint flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7 text-oda-green" />
          </div>
          <h2 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta mb-2">
            No active deals right now
          </h2>
          <p className="text-sm text-oda-charcoal/50 font-plus-jakarta mb-6">
            Check back soon or explore the full catalog for everyday wholesale pricing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-oda-green text-white px-6 py-3 text-sm font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {deals.map((deal) => (
            <DealZone key={deal.id} collection={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
