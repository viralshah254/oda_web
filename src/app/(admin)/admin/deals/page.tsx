'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Trash2, Edit2, Loader2, Save, Search, X,
  GripVertical, Star, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  LayoutGrid, Rows3, Sparkles, Layers, Package,
} from 'lucide-react';
import { catalogApi, dealsApi } from '@/lib/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

type DealProduct = {
  id: string;
  name: string;
  slug?: string;
  sku?: string | null;
  variants?: Array<{ priceKes: number; isDefault?: boolean }>;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  category?: { name: string };
};

type DealCollectionProduct = {
  id: string;
  productId: string;
  sortOrder: number;
  rowIndex?: number | null;
  colIndex?: number | null;
  isHighlighted: boolean;
  product: DealProduct;
};

type DealCollection = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  badgeLabel?: string | null;
  theme: string;
  layout: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  products?: DealCollectionProduct[];
  _count?: { products: number };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const THEMES = [
  { key: 'green',  label: 'Forest Green', bg: '#EBF9EE', accent: '#198A2E' },
  { key: 'yellow', label: 'Savanna Gold', bg: '#FFFBEB', accent: '#D97706' },
  { key: 'red',    label: 'Flame Red',    bg: '#FEF2F2', accent: '#DC2626' },
  { key: 'blue',   label: 'Ocean Blue',   bg: '#EFF6FF', accent: '#2563EB' },
  { key: 'purple', label: 'Maasai Purple',bg: '#F5F3FF', accent: '#7C3AED' },
  { key: 'black',  label: 'Midnight',     bg: '#1A1A1A', accent: '#F8C915' },
  { key: 'orange', label: 'Mango Orange', bg: '#FFF7ED', accent: '#EA580C' },
];

const LAYOUTS = [
  { key: 'scroll',   label: 'Scroll Strip', icon: Rows3,       desc: 'Horizontal scroll row — great for many products' },
  { key: 'grid',     label: 'Product Grid', icon: LayoutGrid,  desc: '2–5 column product grid' },
  { key: 'featured', label: 'Featured',     icon: Sparkles,    desc: 'Hero card left + 4 smaller cards right' },
  { key: 'mosaic',   label: 'Mosaic',       icon: Layers,      desc: 'Staggered asymmetric layout — looks stunning' },
];

const EMPTY: Omit<DealCollection, 'id' | '_count'> = {
  name: '',
  slug: '',
  tagline: '',
  badgeLabel: '',
  theme: 'green',
  layout: 'scroll',
  icon: '',
  isActive: true,
  sortOrder: 0,
  startsAt: null,
  endsAt: null,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatKes(paise: number) {
  return `KES ${(paise / 100).toFixed(2)}`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDealsPage() {
  const [collections, setCollections] = useState<DealCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<DealCollection | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dealsApi.adminListAll();
      setCollections(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load deal collections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing({ ...EMPTY, id: '' });
    setEditorOpen(true);
  }

  function openEdit(c: DealCollection) {
    setEditing({ ...c });
    setEditorOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deal zone? This cannot be undone.')) return;
    try {
      await dealsApi.adminDelete(id);
      await load();
    } catch {
      alert('Failed to delete.');
    }
  }

  async function handleToggleActive(c: DealCollection) {
    try {
      await dealsApi.adminUpdate(c.id, { isActive: !c.isActive });
      await load();
    } catch {
      alert('Failed to update.');
    }
  }

  async function handleSave(form: DealCollection) {
    setSaving(true);
    try {
      if (form.id) {
        await dealsApi.adminUpdate(form.id, {
          name: form.name,
          slug: form.slug,
          tagline: form.tagline || null,
          badgeLabel: form.badgeLabel || null,
          theme: form.theme,
          layout: form.layout,
          icon: form.icon || null,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
        });
      } else {
        await dealsApi.adminCreate({
          name: form.name,
          slug: form.slug,
          tagline: form.tagline || null,
          badgeLabel: form.badgeLabel || null,
          theme: form.theme,
          layout: form.layout,
          icon: form.icon || null,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
        });
      }
      setEditorOpen(false);
      await load();
    } catch {
      alert('Failed to save deal collection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Zones</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage featured deal sections shown on the home page.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Deal Zone
        </button>
      </div>

      {/* Suggested names banner */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-100 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Suggested Kenya-inspired names</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Nairobi Rush', badge: '⚡ Flash Deal', theme: 'red' },
            { name: 'Stack & Save', badge: '📦 Bulk', theme: 'green' },
            { name: 'The Daily Drop', badge: '🌅 Today', theme: 'orange' },
            { name: 'Farm to Door', badge: '🌿 Fresh', theme: 'green' },
            { name: 'Bulk Buys', badge: '🏷️ Wholesale', theme: 'blue' },
            { name: 'Brand Spotlight', badge: '✨ Featured', theme: 'purple' },
            { name: 'Just Landed', badge: '🆕 New', theme: 'yellow' },
            { name: 'Weekend Vibes', badge: '🎉 Weekend', theme: 'black' },
          ].map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setEditing({
                  ...EMPTY,
                  id: '',
                  name: s.name,
                  slug: slugify(s.name),
                  badgeLabel: s.badge,
                  theme: s.theme,
                });
                setEditorOpen(true);
              }}
              className="text-xs bg-white border border-green-200 hover:border-green-400 text-gray-700 font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              + {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No deal zones yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click &ldquo;New Deal Zone&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Layout</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Products</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Schedule</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Active</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => {
                const theme = THEMES.find((t) => t.key === c.theme) ?? THEMES[0];
                const layout = LAYOUTS.find((l) => l.key === c.layout) ?? LAYOUTS[0];
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ backgroundColor: theme.bg }}
                        >
                          {c.icon || '🏷️'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.slug}</p>
                          {c.badgeLabel && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                              style={{ backgroundColor: theme.accent, color: theme.key === 'yellow' ? '#1A1A1A' : '#fff' }}
                            >
                              {c.badgeLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg capitalize">
                        {layout.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-600">{c._count?.products ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {c.startsAt ? new Date(c.startsAt).toLocaleDateString() : '—'}
                      {c.endsAt ? ` → ${new Date(c.endsAt).toLocaleDateString()}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(c)}>
                        {c.isActive
                          ? <ToggleRight className="w-7 h-7 text-green-600" />
                          : <ToggleLeft className="w-7 h-7 text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && editing && (
        <DealEditor
          collection={editing}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

// ── Deal Editor Modal ──────────────────────────────────────────────────────────

function DealEditor({
  collection,
  saving,
  onSave,
  onClose,
}: {
  collection: DealCollection;
  saving: boolean;
  onSave: (form: DealCollection) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DealCollection>({ ...collection });
  const [tab, setTab] = useState<'details' | 'products'>('details');
  const isNew = !form.id;

  function set<K extends keyof DealCollection>(key: K, val: DealCollection[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'name' && isNew) {
        next.slug = slugify(val as string);
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? 'New Deal Zone' : `Edit: ${collection.name}`}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 px-6 flex gap-0">
          {(['details', 'products'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'products' && !isNew ? `Products (${form.products?.length ?? 0})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 px-6 py-5">
          {tab === 'details' && (
            <DetailsTab form={form} set={set} isNew={isNew} />
          )}
          {tab === 'products' && !isNew && (
            <ProductsTab collectionId={form.id} layout={form.layout} />
          )}
          {tab === 'products' && isNew && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Save the deal zone first, then add products.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name || !form.slug}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Zone'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({
  form,
  set,
  isNew,
}: {
  form: DealCollection;
  set: <K extends keyof DealCollection>(key: K, val: DealCollection[K]) => void;
  isNew: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Name + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Zone Name *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Nairobi Rush"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
            placeholder="nairobi-rush"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
      </div>

      {/* Tagline + Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
          <input
            value={form.tagline ?? ''}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Lightning deals — grab them fast"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Label</label>
          <input
            value={form.badgeLabel ?? ''}
            onChange={(e) => set('badgeLabel', e.target.value)}
            placeholder="⚡ Flash Deal"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Icon (emoji)</label>
        <input
          value={form.icon ?? ''}
          onChange={(e) => set('icon', e.target.value)}
          placeholder="🔥"
          className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-2xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
        />
      </div>

      {/* Theme picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Theme</label>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => set('theme', t.key)}
              className={`rounded-xl p-3 border-2 transition-all text-left ${
                form.theme === t.key ? 'border-green-500 shadow-sm' : 'border-transparent hover:border-gray-200'
              }`}
              style={{ backgroundColor: t.bg }}
            >
              <div
                className="w-5 h-5 rounded-full mb-1"
                style={{ backgroundColor: t.accent }}
              />
              <p className="text-[11px] font-semibold" style={{ color: t.accent }}>{t.label}</p>
              {form.theme === t.key && (
                <p className="text-[10px] text-gray-500 mt-0.5">Selected</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layout picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Layout</label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => set('layout', l.key)}
                className={`rounded-xl p-3 border-2 text-left transition-all ${
                  form.layout === l.key
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${form.layout === l.key ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${form.layout === l.key ? 'text-green-700' : 'text-gray-700'}`}>
                    {l.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{l.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort order + Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              form.isActive
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            {form.isActive
              ? <><ToggleRight className="w-5 h-5" /> Active</>
              : <><ToggleLeft className="w-5 h-5" /> Inactive</>
            }
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date (optional)</label>
          <input
            type="datetime-local"
            value={form.startsAt ? form.startsAt.slice(0, 16) : ''}
            onChange={(e) => set('startsAt', e.target.value || null)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">End Date (optional)</label>
          <input
            type="datetime-local"
            value={form.endsAt ? form.endsAt.slice(0, 16) : ''}
            onChange={(e) => set('endsAt', e.target.value || null)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl p-4 border border-gray-100" style={{ backgroundColor: THEMES.find((t) => t.key === form.theme)?.bg ?? '#EBF9EE' }}>
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
        <div className="flex items-center gap-2.5">
          {form.icon && <span className="text-2xl">{form.icon}</span>}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-gray-900">{form.name || 'Zone Name'}</span>
              {form.badgeLabel && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: THEMES.find((t) => t.key === form.theme)?.accent ?? '#198A2E',
                    color: form.theme === 'yellow' ? '#1A1A1A' : '#fff',
                  }}
                >
                  {form.badgeLabel}
                </span>
              )}
            </div>
            {form.tagline && <p className="text-xs text-gray-500 mt-0.5">{form.tagline}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

function ProductsTab({ collectionId, layout }: { collectionId: string; layout: string }) {
  const [products, setProducts] = useState<DealCollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DealProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showGrid = layout === 'grid' || layout === 'mosaic';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dealsApi.adminListAll();
      const all = Array.isArray(res.data) ? res.data : [];
      const found = all.find((c: DealCollection) => c.id === collectionId);
      if (found?.products) setProducts(found.products);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await catalogApi.getProducts({ q, limit: 10 });
      const items = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.products) ? res.data.products : []);
      setSearchResults(items);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addProduct(product: DealProduct) {
    setAdding(product.id);
    try {
      await dealsApi.adminAddProduct(collectionId, {
        productId: product.id,
        sortOrder: products.length,
      });
      setSearchQuery('');
      setSearchResults([]);
      await loadProducts();
    } catch {
      alert('Failed to add product.');
    } finally {
      setAdding(null);
    }
  }

  async function removeProduct(productId: string) {
    if (!confirm('Remove this product from the deal zone?')) return;
    try {
      await dealsApi.adminRemoveProduct(collectionId, productId);
      await loadProducts();
    } catch {
      alert('Failed to remove product.');
    }
  }

  async function updateProductMeta(
    productId: string,
    data: { sortOrder?: number; rowIndex?: number; colIndex?: number; isHighlighted?: boolean },
  ) {
    try {
      await dealsApi.adminUpdateProduct(collectionId, productId, data);
      await loadProducts();
    } catch {
      alert('Failed to update.');
    }
  }

  return (
    <div className="space-y-4">
      {/* Search / add */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Add Product</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-1 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.map((p) => {
              const already = products.some((dp) => dp.productId === p.id);
              const price = p.variants?.find((v) => v.isDefault)?.priceKes ?? p.variants?.[0]?.priceKes;
              return (
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.images?.[0]?.url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.images[0].url} alt="" className="w-full h-full object-contain" />
                        : <Package className="w-4 h-4 text-gray-300" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name}
                        {price ? ` · ${formatKes(price)}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addProduct(p)}
                    disabled={already || adding === p.id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      already
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {adding === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : already ? 'Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No products yet. Search above to add some.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {showGrid && ' · Grid position editing enabled'}
          </p>
          {products.map((dp, idx) => {
            const price = dp.product.variants?.find((v) => v.isDefault)?.priceKes ?? dp.product.variants?.[0]?.priceKes;
            const expanded = expandedId === dp.id;
            return (
              <div key={dp.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {dp.product.images?.[0]?.url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={dp.product.images[0].url} alt="" className="w-full h-full object-contain" />
                      : <Package className="w-4 h-4 text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{dp.product.name}</p>
                    <p className="text-xs text-gray-400">
                      #{idx + 1} · Sort {dp.sortOrder}
                      {price ? ` · ${formatKes(price)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {dp.isHighlighted && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-full">⭐ Pick</span>
                    )}
                    <button
                      onClick={() => setExpandedId(expanded ? null : dp.id)}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                    >
                      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                    </button>
                    <button
                      onClick={() => removeProduct(dp.productId)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded controls */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Sort Order</label>
                        <input
                          type="number"
                          defaultValue={dp.sortOrder}
                          onBlur={(e) => updateProductMeta(dp.productId, { sortOrder: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      {showGrid && (
                        <>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Row (0-indexed)</label>
                            <input
                              type="number"
                              min={0}
                              defaultValue={dp.rowIndex ?? ''}
                              placeholder="auto"
                              onBlur={(e) => updateProductMeta(dp.productId, { rowIndex: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Column (0-indexed)</label>
                            <input
                              type="number"
                              min={0}
                              defaultValue={dp.colIndex ?? ''}
                              placeholder="auto"
                              onBlur={(e) => updateProductMeta(dp.productId, { colIndex: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Highlighted</label>
                        <button
                          type="button"
                          onClick={() => updateProductMeta(dp.productId, { isHighlighted: !dp.isHighlighted })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            dp.isHighlighted
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-yellow-200'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${dp.isHighlighted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {dp.isHighlighted ? 'Highlighted' : 'Normal'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
