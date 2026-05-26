/**
 * Server-side catalog fetcher.
 * Used by Next.js server components (page.tsx, layout.tsx) to fetch data
 * at request time (or statically). Falls back gracefully so the page still
 * renders even when the API is down.
 */

const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface PricingTier {
  minQuantity: number;
  priceKes: number;
  discountPct: number | null;
  label: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  brandName?: string;
  priceKes: number;
  mrpKes?: number;
  imageUrl?: string;
  inStock: boolean;
  storageType: string;
  isFeatured?: boolean;
  categorySlug?: string;
  // Wholesale / pack fields
  packSize?: number;
  caseSize?: number | null;
  minimumOrderQty?: number;
  unitOfMeasure?: string;
  unitLabel?: string;
  // Volume pricing
  pricingTiers?: PricingTier[];
  b2bPriceKes?: number | null;
  variants?: Array<{ priceKes?: number; mrpKes?: number; isDefault?: boolean }>;
  images?: Array<{ url?: string; isPrimary?: boolean }>;
}

/** Map raw API product (variant-based pricing) to shop CatalogProduct shape */
export function normalizeCatalogProduct(raw: Record<string, unknown>): CatalogProduct {
  const variants = (raw.variants as CatalogProduct['variants']) ?? [];
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const images = (raw.images as CatalogProduct['images']) ?? [];
  const primaryImage = images.find((i) => i.isPrimary) ?? images[0];
  const priceKes =
    (raw.priceKes as number | undefined) ??
    defaultVariant?.priceKes ??
    0;
  const mrpKes =
    (raw.mrpKes as number | undefined) ??
    defaultVariant?.mrpKes;

  const category = raw.category as { slug?: string; group?: { slug?: string } } | undefined;

  return {
    id: String(raw.id),
    slug: String(raw.slug ?? raw.id),
    name: String(raw.name ?? 'Product'),
    description: raw.description as string | undefined,
    brandName: (raw.brandName as string | undefined) ?? (raw.brand as { name?: string } | undefined)?.name,
    priceKes,
    mrpKes,
    imageUrl: (raw.imageUrl as string | undefined) ?? primaryImage?.url,
    inStock: raw.inStock !== false,
    storageType: String(raw.storageType ?? 'AMBIENT'),
    isFeatured: raw.isFeatured as boolean | undefined,
    categorySlug:
      (raw.categorySlug as string | undefined) ??
      category?.group?.slug ??
      category?.slug,
    packSize: raw.packSize as number | undefined,
    caseSize: raw.caseSize as number | null | undefined,
    minimumOrderQty: raw.minimumOrderQty as number | undefined,
    unitOfMeasure: raw.unitOfMeasure as string | undefined,
    pricingTiers: raw.pricingTiers as PricingTier[] | undefined,
    b2bPriceKes: raw.b2bPriceKes as number | null | undefined,
  };
}

function normalizeProductList(data: unknown): CatalogProduct[] {
  if (!data) return [];
  const list = Array.isArray(data)
    ? data
    : (data as { items?: unknown[] }).items ?? [];
  return list.map((item) => normalizeCatalogProduct(item as Record<string, unknown>));
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
  return normalizeProductList(data);
}

export async function fetchProductsByCategory(
  categorySlug: string,
  opts?: { subcategory?: string; sort?: string; page?: number; limit?: number },
): Promise<CatalogProduct[]> {
  const slug = opts?.subcategory || categorySlug;
  const data = await apiFetch<{ items: CatalogProduct[] } | CatalogProduct[]>(
    '/catalog/products',
    { category: slug, ...opts },
  );
  return normalizeProductList(data);
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const data = await apiFetch<Record<string, unknown>>(`/catalog/products/${slug}`);
  return data ? normalizeCatalogProduct(data) : null;
}

export async function searchProducts(query: string, limit = 30): Promise<CatalogProduct[]> {
  const data = await apiFetch<{ items: CatalogProduct[] } | CatalogProduct[]>(
    '/catalog/search',
    { q: query, limit },
  );
  return normalizeProductList(data);
}
