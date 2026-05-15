'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Package, ImageIcon, Save, Loader2, Plus, Trash2, Edit2, LayoutList } from 'lucide-react';
import { catalogApi, cmsApi } from '@/lib/api-client';

type CategoryGroupRow = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  showcaseImageUrls?: string[];
  productCount?: number;
  overflowProductCount?: number;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  approvalStatus: string;
  category?: { name: string };
  variants?: Array<{ priceKes: number; isDefault?: boolean }>;
  images?: Array<{ url: string; isPrimary?: boolean; sortOrder?: number }>;
};

type BannerRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkType?: string | null;
  linkId?: string | null;
  linkUrl?: string | null;
  backgroundColor?: string | null;
  ctaLabel?: string | null;
  isActive: boolean;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  section?: { key: string; title?: string } | null;
  // Derived on load from section.key — used in editor / save payload
  sectionKey?: string | null;
  // Placement targeting
  categoryGroupSlug?: string | null;
  injectAfterRow?: number | null;
};

const LINK_TYPES = ['CATEGORY', 'BRAND', 'SEARCH', 'URL', 'ALL_OFFERS'];
const DEFAULT_BG = '#FFC523';

const PLACEMENT_OPTIONS = [
  { key: 'home_promo_strip',        label: 'Home — promo strip' },
  { key: 'home_above_quick_picks',  label: 'Home — above Quick Picks' },
  { key: 'categories_root',         label: 'Categories tab — top' },
  { key: 'category_listing_top',    label: 'Category listing — top banner' },
  { key: 'category_listing_inline', label: 'Category listing — inline ad' },
] as const;


const EMPTY_BANNER: Omit<BannerRow, 'id' | 'section'> = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkType: 'CATEGORY',
  linkId: '',
  linkUrl: '',
  backgroundColor: DEFAULT_BG,
  ctaLabel: 'Shop now',
  isActive: true,
  sortOrder: 0,
  startsAt: null,
  endsAt: null,
  sectionKey: 'home_promo_strip',
  categoryGroupSlug: null,
  injectAfterRow: null,
};

function formatKes(paise: number) {
  return `KES ${Math.round(paise / 100).toLocaleString()}`;
}

function BannerPreview({ banner }: { banner: Partial<BannerRow> }) {
  const bg = banner.backgroundColor || DEFAULT_BG;
  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };
  const textColor = bg.startsWith('#') && isLight(bg) ? '#1A1A1A' : '#ffffff';

  return (
    <div
      className="relative flex items-center rounded-2xl overflow-hidden"
      style={{ background: bg, height: 96, minWidth: 280, maxWidth: 340 }}
    >
      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt=""
          className="h-full w-24 object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center" style={{ color: textColor }}>
        <p className="font-extrabold text-sm leading-tight truncate">
          {banner.title || 'Banner title'}
        </p>
        {banner.subtitle && (
          <p className="text-xs opacity-80 mt-0.5 truncate">{banner.subtitle}</p>
        )}
        {banner.ctaLabel && (
          <span
            className="mt-1.5 self-start text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
              color: textColor,
            }}
          >
            {banner.ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<'groups' | 'products' | 'banners'>('groups');

  // ── Groups ────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<CategoryGroupRow[]>([]);
  const [editingGroup, setEditingGroup] = useState<CategoryGroupRow | null>(null);
  const [groupUrls, setGroupUrls] = useState(['', '', '', '']);
  const [savingGroup, setSavingGroup] = useState(false);

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [imageLines, setImageLines] = useState('');
  const [savingImages, setSavingImages] = useState(false);

  // ── Banners ───────────────────────────────────────────────────────────────
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerRow> | null>(null);
  const [isNewBanner, setIsNewBanner] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Shared ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    const res = await catalogApi.getCategoryGroups();
    setGroups(res.data as CategoryGroupRow[]);
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await catalogApi.getProducts({ limit: 80, page: 1 });
    const data = res.data as { items?: ProductRow[] };
    setProducts(data.items ?? []);
  }, []);

  const loadBanners = useCallback(async () => {
    // Load ALL banners across all placements (no section filter)
    const res = await cmsApi.getBanners();
    const raw = res.data as BannerRow[];
    // Normalise: pull sectionKey up from nested section relation
    setBanners(raw.map((b) => ({ ...b, sectionKey: b.section?.key ?? null })));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    Promise.all([loadGroups(), loadProducts(), loadBanners()])
      .catch((e) => {
        if (!cancelled) setErr(e?.message || 'Failed to load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [loadGroups, loadProducts, loadBanners]);

  // ── Group actions ─────────────────────────────────────────────────────────
  const openGroupEditor = (g: CategoryGroupRow) => {
    const cur = [...(g.showcaseImageUrls ?? [])];
    while (cur.length < 4) cur.push('');
    setEditingGroup(g);
    setGroupUrls(cur.slice(0, 4).map((u) => u || ''));
  };

  const saveGroupShowcase = async () => {
    if (!editingGroup) return;
    setSavingGroup(true);
    try {
      await catalogApi.updateCategoryGroup(editingGroup.id, {
        showcaseImageUrls: groupUrls.map((s) => s.trim()).filter(Boolean),
      });
      await loadGroups();
      setEditingGroup(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSavingGroup(false);
    }
  };

  // ── Product actions ───────────────────────────────────────────────────────
  const openProductImages = (p: ProductRow) => {
    const ordered = [...(p.images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setEditingProduct(p);
    setImageLines(ordered.map((i) => i.url).join('\n'));
  };

  const saveProductImages = async () => {
    if (!editingProduct) return;
    setSavingImages(true);
    try {
      const urls = imageLines.split('\n').map((l) => l.trim()).filter(Boolean);
      const images = urls.map((url, i) => ({ url, sortOrder: i, isPrimary: i === 0 }));
      await catalogApi.syncProductImages(editingProduct.id, images);
      await loadProducts();
      setEditingProduct(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save images failed');
    } finally {
      setSavingImages(false);
    }
  };

  // ── Banner actions ────────────────────────────────────────────────────────
  const openNewBanner = () => {
    setIsNewBanner(true);
    setEditingBanner({ ...EMPTY_BANNER });
  };

  const openEditBanner = (b: BannerRow) => {
    setIsNewBanner(false);
    setEditingBanner({ ...b });
  };

  const saveBanner = async () => {
    if (!editingBanner) return;
    setSavingBanner(true);
    try {
      const { section: _section, ...rest } = editingBanner as BannerRow;
      const payload: Record<string, unknown> = {
        ...rest,
        sectionKey: editingBanner.sectionKey ?? 'home_promo_strip',
        categoryGroupSlug: editingBanner.categoryGroupSlug || null,
        injectAfterRow: editingBanner.injectAfterRow ?? null,
      };
      if (isNewBanner) {
        await cmsApi.createBanner(payload);
      } else {
        await cmsApi.updateBanner(editingBanner.id!, payload);
      }
      await loadBanners();
      setEditingBanner(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save banner failed');
    } finally {
      setSavingBanner(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    setDeletingId(id);
    try {
      await cmsApi.deleteBanner(id);
      await loadBanners();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q) ?? false) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Catalog & media</h1>
        <div className="flex rounded-xl border border-[#E8E8E0] overflow-hidden bg-white">
          {(
            [
              { key: 'groups', label: 'Category groups' },
              { key: 'products', label: 'Products' },
              { key: 'banners', label: 'Banners' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-bold font-plus-jakarta ${
                tab === key ? 'bg-[#198A2E] text-white' : 'text-[#666]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-xl bg-red-50 text-red-800 text-sm px-4 py-3 font-plus-jakarta border border-red-100">
          {err}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-[#666] font-plus-jakarta">
          <Loader2 className="animate-spin" size={18} />
          Loading catalog…
        </div>
      ) : tab === 'groups' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-[#E8E8E0] p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-extrabold text-[#1A1A1A] font-plus-jakarta">{g.name}</h2>
                  <p className="text-xs text-[#999] font-mono">{g.slug}</p>
                  <p className="text-xs text-[#666] mt-1 font-plus-jakarta">
                    {(g.productCount ?? 0).toLocaleString()} products
                    {(g.overflowProductCount ?? 0) > 0 && ` · +${g.overflowProductCount} beyond quad`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openGroupEditor(g)}
                  className="text-xs font-bold text-[#198A2E] font-plus-jakarta hover:underline flex items-center gap-1"
                >
                  <ImageIcon size={14} /> Edit pics
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#F5F5F0] aspect-square max-h-40">
                {(g.showcaseImageUrls ?? []).slice(0, 4).map((u, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={u} alt="" className="w-full h-full object-cover bg-[#eee]" />
                ))}
                {(!g.showcaseImageUrls || g.showcaseImageUrls.length < 4) &&
                  Array.from({ length: Math.max(0, 4 - (g.showcaseImageUrls?.length ?? 0)) }).map(
                    (_, i) => (
                      <div key={`ph-${i}`} className="flex items-center justify-center text-[#ccc]">
                        <Package size={20} />
                      </div>
                    ),
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'products' ? (
        <>
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E8E0] bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20"
            />
          </div>
          <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E8E0]">
                  {['Product', 'SKU', 'Category', 'From price', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E0]">
                {filteredProducts.map((p) => {
                  const v = p.variants?.find((x) => x.isDefault) ?? p.variants?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-[#F9F9F6]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F5F5F0] rounded-lg overflow-hidden flex items-center justify-center">
                            {p.images?.[0]?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={14} className="text-[#999]" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#999] font-mono">{p.sku ?? '—'}</td>
                      <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{p.category?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">
                        {v ? formatKes(v.priceKes) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${
                            p.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {p.approvalStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => openProductImages(p)}
                          className="text-xs text-[#198A2E] font-bold font-plus-jakarta hover:underline"
                        >
                          Images
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ── Banners tab ──────────────────────────────────────────────── */
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#666] font-plus-jakarta flex items-center gap-1.5">
              <LayoutList size={14} />
              Manage ads &amp; promotions across all placements
            </p>
            <button
              type="button"
              onClick={openNewBanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#198A2E] text-white text-sm font-bold font-plus-jakarta"
            >
              <Plus size={14} /> New banner
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="text-center py-16 text-[#999] font-plus-jakarta text-sm">
              No banners yet. Create one above.
            </div>
          ) : (
            <div className="space-y-8">
              {PLACEMENT_OPTIONS.map((placement) => {
                const items = banners.filter((b) => b.sectionKey === placement.key);
                return (
                  <div key={placement.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-extrabold text-sm text-[#1A1A1A] font-plus-jakarta">{placement.label}</span>
                      <span className="font-mono text-xs text-[#999] bg-[#F5F5F0] px-2 py-0.5 rounded-lg">{placement.key}</span>
                      <span className="text-xs text-[#999] font-plus-jakarta">{items.length} banner{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    {items.length === 0 ? (
                      <p className="text-xs text-[#bbb] font-plus-jakarta pl-1">No banners for this placement.</p>
                    ) : (
                      <div className="space-y-3">
                        {items.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white rounded-2xl border border-[#E8E8E0] p-4 flex items-center gap-4"
                          >
                            <BannerPreview banner={b} />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1A1A1A] font-plus-jakarta truncate">{b.title}</p>
                              {b.subtitle && (
                                <p className="text-xs text-[#666] font-plus-jakarta truncate">{b.subtitle}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {b.linkType && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F0F0EA] text-[#555] font-plus-jakarta">
                                    {b.linkType}{b.linkId ? `: ${b.linkId}` : ''}
                                  </span>
                                )}
                                {b.categoryGroupSlug && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-plus-jakarta">
                                    scope: {b.categoryGroupSlug}
                                  </span>
                                )}
                                {b.injectAfterRow != null && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-plus-jakarta">
                                    after row {b.injectAfterRow}
                                  </span>
                                )}
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${
                                    b.isActive ? 'bg-green-100 text-green-700' : 'bg-[#F0F0EA] text-[#999]'
                                  }`}
                                >
                                  {b.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditBanner(b)}
                                className="p-2 rounded-xl hover:bg-[#F0F0EA] text-[#666]"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteBanner(b.id)}
                                disabled={deletingId === b.id}
                                className="p-2 rounded-xl hover:bg-red-50 text-red-500 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === b.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Group editor modal ─────────────────────────────────────────────── */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-extrabold text-lg font-plus-jakarta mb-1">{editingGroup.name}</h3>
            <p className="text-xs text-[#666] mb-4 font-plus-jakarta">
              Up to 4 HTTPS image URLs for the home / category quad tile. Empty slots fall back to product photos.
            </p>
            <div className="space-y-2 mb-4">
              {groupUrls.map((u, i) => (
                <input
                  key={i}
                  value={u}
                  onChange={(e) => {
                    const next = [...groupUrls];
                    next[i] = e.target.value;
                    setGroupUrls(next);
                  }}
                  placeholder={`Image URL ${i + 1}`}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingGroup(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-[#666] font-plus-jakarta">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveGroupShowcase()}
                disabled={savingGroup}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#198A2E] text-white text-sm font-bold font-plus-jakarta disabled:opacity-50"
              >
                {savingGroup ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product image editor modal ─────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="font-extrabold text-lg font-plus-jakarta mb-1">{editingProduct.name}</h3>
            <p className="text-xs text-[#666] mb-4 font-plus-jakarta">
              One image URL per line, in order. First line is primary.
            </p>
            <textarea
              value={imageLines}
              onChange={(e) => setImageLines(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-mono mb-4"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-[#666] font-plus-jakarta">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveProductImages()}
                disabled={savingImages}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#198A2E] text-white text-sm font-bold font-plus-jakarta disabled:opacity-50"
              >
                {savingImages ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner create/edit modal ──────────────────────────────────────── */}
      {editingBanner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl my-4">
            <h3 className="font-extrabold text-lg font-plus-jakarta mb-4">
              {isNewBanner ? 'New banner' : 'Edit banner'}
            </h3>

            {/* Live preview */}
            <div className="mb-5 flex justify-center">
              <BannerPreview banner={editingBanner} />
            </div>

            <div className="space-y-3">
              {/* Placement */}
              <div>
                <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Placement *</label>
                <select
                  value={editingBanner.sectionKey ?? 'home_promo_strip'}
                  onChange={(e) => setEditingBanner({
                    ...editingBanner,
                    sectionKey: e.target.value,
                    // Reset category-specific fields when switching away
                    categoryGroupSlug: e.target.value.startsWith('category_listing') ? editingBanner.categoryGroupSlug : null,
                    injectAfterRow: e.target.value === 'category_listing_inline' ? (editingBanner.injectAfterRow ?? 1) : null,
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta bg-white"
                >
                  {PLACEMENT_OPTIONS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Category scope — show for listing placements */}
              {(editingBanner.sectionKey ?? '').startsWith('category_listing') && (
                <div className={editingBanner.sectionKey === 'category_listing_inline' ? 'grid grid-cols-2 gap-3' : ''}>
                  <div>
                    <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">
                      Category slug scope <span className="font-normal text-[#999]">(leave blank for all categories)</span>
                    </label>
                    <input
                      value={editingBanner.categoryGroupSlug ?? ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, categoryGroupSlug: e.target.value || null })}
                      placeholder="e.g. beauty-personal-care"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                    />
                  </div>
                  {editingBanner.sectionKey === 'category_listing_inline' && (
                    <div>
                      <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Inject after row #</label>
                      <input
                        type="number"
                        min={1}
                        value={editingBanner.injectAfterRow ?? 1}
                        onChange={(e) => setEditingBanner({ ...editingBanner, injectAfterRow: Number(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Title *</label>
                  <input
                    value={editingBanner.title ?? ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. First Order Free"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">CTA label</label>
                  <input
                    value={editingBanner.ctaLabel ?? ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLabel: e.target.value })}
                    placeholder="Shop now"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Subtitle</label>
                <input
                  value={editingBanner.subtitle ?? ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="e.g. Use code WELCOME"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Background colour</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingBanner.backgroundColor || DEFAULT_BG}
                      onChange={(e) => setEditingBanner({ ...editingBanner, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-[#E8E8E0] cursor-pointer p-0.5"
                    />
                    <input
                      value={editingBanner.backgroundColor ?? DEFAULT_BG}
                      onChange={(e) => setEditingBanner({ ...editingBanner, backgroundColor: e.target.value })}
                      placeholder="#FFC523"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Image URL (optional)</label>
                  <input
                    value={editingBanner.imageUrl ?? ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Link type</label>
                  <select
                    value={editingBanner.linkType ?? 'CATEGORY'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, linkType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta bg-white"
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">
                    {editingBanner.linkType === 'URL'
                      ? 'URL'
                      : editingBanner.linkType === 'BRAND'
                      ? 'Brand slug (e.g. dove)'
                      : 'Link value (slug / query)'}
                  </label>
                  <input
                    value={(editingBanner.linkType === 'URL' ? editingBanner.linkUrl : editingBanner.linkId) ?? ''}
                    onChange={(e) =>
                      setEditingBanner(
                        editingBanner.linkType === 'URL'
                          ? { ...editingBanner, linkUrl: e.target.value }
                          : { ...editingBanner, linkId: e.target.value },
                      )
                    }
                    placeholder={
                      editingBanner.linkType === 'URL'
                        ? 'https://...'
                        : editingBanner.linkType === 'BRAND'
                        ? 'dove'
                        : 'groceries-kitchen'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                  {editingBanner.linkType === 'BRAND' && (
                    <p className="text-xs text-[#999] mt-1 font-plus-jakarta">
                      Opens search filtered to this brand's products.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Sort order</label>
                  <input
                    type="number"
                    value={editingBanner.sortOrder ?? 0}
                    onChange={(e) => setEditingBanner({ ...editingBanner, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">Start date</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.startsAt?.slice(0, 16) ?? ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, startsAt: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#666] font-plus-jakarta block mb-1">End date</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.endsAt?.slice(0, 16) ?? ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, endsAt: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-plus-jakarta cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBanner.isActive ?? true}
                  onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setEditingBanner(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-[#666] font-plus-jakarta">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveBanner()}
                disabled={savingBanner || !editingBanner.title?.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#198A2E] text-white text-sm font-bold font-plus-jakarta disabled:opacity-50"
              >
                {savingBanner ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isNewBanner ? 'Create' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
