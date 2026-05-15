/**
 * Server-side catalog fetcher.
 * Used by Next.js server components (page.tsx, layout.tsx) to fetch data
 * at request time (or statically). Falls back gracefully so the page still
 * renders even when the API is down.
 */

const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brandName?: string;
  priceKes: number;
  mrpKes?: number;
  imageUrl?: string;
  inStock: boolean;
  storageType: string;
  isFeatured?: boolean;
  categorySlug?: string;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  productCount?: number;
}

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T | null> {
  try {
    const url = new URL(`${API_BASE}/v1${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const data = await apiFetch<CatalogCategory[] | { items: CatalogCategory[] }>('/catalog/categories');
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchFeaturedProducts(limit = 12): Promise<CatalogProduct[]> {
  const data = await apiFetch<{ items: CatalogProduct[] } | CatalogProduct[]>(
    '/catalog/products',
    { featured: true, limit },
  );
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchProductsByCategory(
  categorySlug: string,
  opts?: { subcategory?: string; sort?: string; page?: number; limit?: number },
): Promise<CatalogProduct[]> {
  const data = await apiFetch<{ items: CatalogProduct[] } | CatalogProduct[]>(
    '/catalog/products',
    { category: categorySlug, ...opts },
  );
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  return apiFetch<CatalogProduct>(`/catalog/products/${slug}`);
}

export async function searchProducts(query: string, limit = 30): Promise<CatalogProduct[]> {
  const data = await apiFetch<{ items: CatalogProduct[] } | CatalogProduct[]>(
    '/catalog/search',
    { q: query, limit },
  );
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
}
