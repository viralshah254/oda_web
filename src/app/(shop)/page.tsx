import { HomePage } from '@/components/shop/home-page';
import { fetchFeaturedProducts } from '@/lib/server/catalog-fetcher';

const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api';

async function fetchHomePromobanners() {
  try {
    const res = await fetch(
      `${API_BASE}/v1/cms/banners?section=home_promo_strip`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // backend unavailable — fall through to static fallback
  }
  return null;
}

async function fetchActiveDeals() {
  try {
    const res = await fetch(`${API_BASE}/v1/deals`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch {
    // backend unavailable — no deals shown
  }
  return [];
}

export default async function Page() {
  const [featuredProducts, banners, deals] = await Promise.all([
    fetchFeaturedProducts(12),
    fetchHomePromobanners(),
    fetchActiveDeals(),
  ]);

  return (
    <HomePage
      initialProducts={featuredProducts}
      initialBanners={banners ?? undefined}
      initialDeals={deals}
    />
  );
}

