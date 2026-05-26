'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  AlertCircle,
  Loader2,
  Search,
  Package,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi, catalogApi } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TierRow {
  id?: string;
  minQuantity: number;
  priceKes: number;
  discountPct?: number | null;
  tierType: 'RETAIL' | 'WHOLESALE';
  _new?: boolean;
}

interface PriceRuleDetail {
  id: string;
  supplierCostKes: number;
  retailPriceKes: number;
  wholesaleUnitPriceKes: number | null;
  mrpKes: number | null;
  targetMarginPct: number | null;
  minMarginPct: number | null;
  retailTiers: TierRow[];
  wholesaleTiers: TierRow[];
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  images?: Array<{ url: string }>;
  variants?: Array<{ priceKes: number; isDefault?: boolean }>;
  approvalStatus: string;
  category?: { name: string };
  _priceRule?: PriceRuleDetail | null;
  _pricingStatus?: 'active' | 'needsPricing' | 'belowGuardrail' | 'noImage' | 'noSku';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (kes: number) => `KES ${(kes / 100).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
const pct = (n: number | null | undefined) => (n != null ? `${n.toFixed(1)}%` : '—');

function marginColor(m: number | null | undefined) {
  if (m == null) return 'text-oda-charcoal/40';
  if (m < 5) return 'text-red-600';
  if (m < 10) return 'text-orange-500';
  return 'text-oda-green';
}

function computeMargin(priceKes: number, costKes: number) {
  if (costKes <= 0 || priceKes <= 0) return null;
  return ((priceKes - costKes) / priceKes) * 100;
}

function StatusPill({ status }: { status: ProductRow['_pricingStatus'] }) {
  const map = {
    active: { label: 'Priced', cls: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
    needsPricing: { label: 'No B2B price', cls: 'bg-amber-100 text-amber-700', Icon: HelpCircle },
    belowGuardrail: { label: 'Below guardrail', cls: 'bg-red-100 text-red-600', Icon: ShieldAlert },
    noImage: { label: 'No image', cls: 'bg-slate-100 text-slate-500', Icon: Package },
    noSku: { label: 'No SKU', cls: 'bg-slate-100 text-slate-500', Icon: Package },
  };
  const { label, cls, Icon } = map[status ?? 'active'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${cls}`}>
      <Icon size={10} /> {label}
    </span>
  );
}

// ── Pricing drawer ─────────────────────────────────────────────────────────────

function PricingDrawer({
  product,
  onClose,
  onSaved,
}: {
  product: ProductRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rule, setRule] = useState<PriceRuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Form fields
  const [costKes, setCostKes] = useState('');
  const [retailKes, setRetailKes] = useState('');
  const [mrpKes, setMrpKes] = useState('');
  const [wholesaleKes, setWholesaleKes] = useState('');
  const [targetMargin, setTargetMargin] = useState('');
  const [minMargin, setMinMargin] = useState('');
  const [retailTiers, setRetailTiers] = useState<TierRow[]>([]);
  const [wholesaleTiers, setWholesaleTiers] = useState<TierRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPriceRules(product.id);
      const rules = (res.data as PriceRuleDetail[]) ?? [];
      const r = rules[0] ?? null;
      setRule(r);
      if (r) {
        setCostKes(r.supplierCostKes ? String(r.supplierCostKes / 100) : '');
        setRetailKes(r.retailPriceKes ? String(r.retailPriceKes / 100) : '');
        setMrpKes(r.mrpKes ? String(r.mrpKes / 100) : '');
        setWholesaleKes(r.wholesaleUnitPriceKes ? String(r.wholesaleUnitPriceKes / 100) : '');
        setTargetMargin(r.targetMarginPct ? String(r.targetMarginPct) : '');
        setMinMargin(r.minMarginPct ? String(r.minMarginPct) : '');
        setRetailTiers(r.retailTiers);
        setWholesaleTiers(r.wholesaleTiers);
      }
    } catch {
      setErr('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => { void load(); }, [load]);

  const toInt = (s: string) => Math.round(parseFloat(s) * 100) || 0;

  const suggestedRetail =
    costKes && targetMargin
      ? Math.ceil((parseFloat(costKes) * 100) / (1 - parseFloat(targetMargin) / 100)) / 100
      : null;

  const suggestedWholesale =
    costKes && targetMargin
      ? Math.ceil((parseFloat(costKes) * 100) / (1 - (parseFloat(targetMargin) * 0.5) / 100)) / 100
      : null;

  const retailMargin = computeMargin(toInt(retailKes), toInt(costKes));
  const wholesaleMargin = computeMargin(toInt(wholesaleKes), toInt(costKes));

  const addTier = (type: 'RETAIL' | 'WHOLESALE') => {
    const newTier: TierRow = { minQuantity: 0, priceKes: 0, tierType: type, _new: true };
    if (type === 'RETAIL') setRetailTiers((p) => [...p, newTier]);
    else setWholesaleTiers((p) => [...p, newTier]);
  };

  const updateTier = (type: 'RETAIL' | 'WHOLESALE', idx: number, field: keyof TierRow, value: string | number) => {
    const setter = type === 'RETAIL' ? setRetailTiers : setWholesaleTiers;
    setter((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const removeTier = (type: 'RETAIL' | 'WHOLESALE', idx: number) => {
    const setter = type === 'RETAIL' ? setRetailTiers : setWholesaleTiers;
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await adminApi.updatePriceRule(product.id, {
        supplierCostKes: toInt(costKes),
        retailPriceKes: toInt(retailKes),
        mrpKes: toInt(mrpKes) || null,
        b2bPriceKes: toInt(wholesaleKes) || null,
        targetMarginPct: parseFloat(targetMargin) || null,
        minMarginPct: parseFloat(minMargin) || null,
      });
      // Upsert tiers
      await Promise.all([
        ...retailTiers.map((t) =>
          adminApi.upsertPriceTier(product.id, {
            minQuantity: t.minQuantity,
            priceKes: t.priceKes,
            discountPct: t.discountPct ?? undefined,
            tierType: 'RETAIL',
          }),
        ),
        ...wholesaleTiers.map((t) =>
          adminApi.upsertPriceTier(product.id, {
            minQuantity: t.minQuantity,
            priceKes: t.priceKes,
            discountPct: t.discountPct ?? undefined,
            tierType: 'WHOLESALE',
          }),
        ),
      ]);
      onSaved();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-oda-charcoal/8 sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta font-bold uppercase tracking-wide">Pricing</p>
            <h2 className="font-extrabold text-oda-charcoal font-plus-jakarta leading-tight">{product.name}</h2>
            {product.sku && <p className="text-xs text-oda-charcoal/40 font-mono mt-0.5">{product.sku}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-oda-ivory text-oda-charcoal/50">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-oda-charcoal/30" size={24} />
          </div>
        ) : (
          <div className="flex-1 px-6 py-5 space-y-6">
            {err && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 font-plus-jakarta flex items-center gap-2">
                <AlertCircle size={14} /> {err}
              </div>
            )}

            {/* ── Cost & margin config ────────────────────────────────────── */}
            <section>
              <h3 className="text-xs font-bold text-oda-charcoal/50 uppercase tracking-wide font-plus-jakarta mb-3">Cost &amp; margin rules</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Supplier cost (KES)" value={costKes} onChange={setCostKes} placeholder="0.00" />
                <Field label="Target margin %" value={targetMargin} onChange={setTargetMargin} placeholder="e.g. 20" />
                <Field label="Min margin floor %" value={minMargin} onChange={setMinMargin} placeholder="e.g. 5" />
                <Field label="MRP / max price (KES)" value={mrpKes} onChange={setMrpKes} placeholder="0.00" />
              </div>

              {/* Smart suggestions */}
              {(suggestedRetail || suggestedWholesale) && (
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200/60 p-3 flex flex-col gap-2">
                  <p className="text-xs font-bold text-amber-700 font-plus-jakarta flex items-center gap-1.5">
                    <Lightbulb size={12} /> Smart suggestions (from cost + target margin)
                  </p>
                  <div className="flex gap-4">
                    {suggestedRetail && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-amber-600 font-plus-jakarta">Retail</span>
                        <button
                          className="text-sm font-bold text-amber-800 font-plus-jakarta hover:underline"
                          onClick={() => setRetailKes(String(suggestedRetail))}
                        >
                          KES {suggestedRetail.toFixed(2)} →
                        </button>
                      </div>
                    )}
                    {suggestedWholesale && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-amber-600 font-plus-jakarta">Wholesale unit</span>
                        <button
                          className="text-sm font-bold text-amber-800 font-plus-jakarta hover:underline"
                          onClick={() => setWholesaleKes(String(suggestedWholesale))}
                        >
                          KES {suggestedWholesale.toFixed(2)} →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ── Retail pricing ──────────────────────────────────────────── */}
            <section>
              <h3 className="text-xs font-bold text-oda-charcoal/50 uppercase tracking-wide font-plus-jakarta mb-3">Retail pricing</h3>
              <Field label="Retail unit price (KES)" value={retailKes} onChange={setRetailKes} placeholder="0.00" />
              {retailMargin !== null && (
                <p className={`text-xs mt-1.5 font-plus-jakarta font-bold ${marginColor(retailMargin)}`}>
                  Retail margin: {pct(retailMargin)}
                </p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta">Retail bulk tiers</p>
                  <button onClick={() => addTier('RETAIL')} className="flex items-center gap-1 text-xs text-oda-green font-bold font-plus-jakarta">
                    <Plus size={12} /> Add tier
                  </button>
                </div>
                <TierTable
                  tiers={retailTiers}
                  type="RETAIL"
                  costKes={toInt(costKes)}
                  onUpdate={updateTier}
                  onRemove={removeTier}
                />
              </div>
            </section>

            {/* ── Wholesale pricing ───────────────────────────────────────── */}
            <section>
              <h3 className="text-xs font-bold text-oda-charcoal/50 uppercase tracking-wide font-plus-jakarta mb-3">Wholesale pricing</h3>
              <Field label="Wholesale unit price (KES)" value={wholesaleKes} onChange={setWholesaleKes} placeholder="0.00" />
              {wholesaleMargin !== null && (
                <p className={`text-xs mt-1.5 font-plus-jakarta font-bold ${marginColor(wholesaleMargin)}`}>
                  Wholesale margin: {pct(wholesaleMargin)}
                </p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta">Wholesale bulk tiers</p>
                  <button onClick={() => addTier('WHOLESALE')} className="flex items-center gap-1 text-xs text-oda-green font-bold font-plus-jakarta">
                    <Plus size={12} /> Add tier
                  </button>
                </div>
                <TierTable
                  tiers={wholesaleTiers}
                  type="WHOLESALE"
                  costKes={toInt(costKes)}
                  onUpdate={updateTier}
                  onRemove={removeTier}
                />
              </div>
            </section>

            {/* ── Margin preview ──────────────────────────────────────────── */}
            {costKes && (retailKes || wholesaleKes) && (
              <section>
                <h3 className="text-xs font-bold text-oda-charcoal/50 uppercase tracking-wide font-plus-jakarta mb-3">Margin preview</h3>
                <div className="rounded-xl bg-oda-ivory border border-oda-charcoal/8 p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Retail margin', margin: retailMargin },
                    { label: 'Wholesale margin', margin: wholesaleMargin },
                  ].map(({ label, margin }) => (
                    <div key={label}>
                      <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">{label}</p>
                      <p className={`text-xl font-extrabold font-plus-jakarta ${marginColor(margin)}`}>
                        {pct(margin)}
                      </p>
                    </div>
                  ))}
                </div>
                {(retailMargin !== null && retailMargin < (parseFloat(minMargin) || 5)) && (
                  <p className="mt-2 text-xs text-red-600 font-bold font-plus-jakarta flex items-center gap-1">
                    <ShieldAlert size={12} /> Retail price below margin floor — requires approval
                  </p>
                )}
                {(wholesaleMargin !== null && wholesaleMargin < (parseFloat(minMargin) || 5)) && (
                  <p className="mt-2 text-xs text-red-600 font-bold font-plus-jakarta flex items-center gap-1">
                    <ShieldAlert size={12} /> Wholesale price below margin floor — requires approval
                  </p>
                )}
              </section>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-4 border-t border-oda-charcoal/8 flex justify-end gap-2 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-oda-charcoal/60 font-plus-jakarta hover:bg-oda-ivory"
            >
              Cancel
            </button>
            <button
              onClick={() => void save()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oda-charcoal text-white text-sm font-bold font-plus-jakarta disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
              Save pricing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta block mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-oda-ivory border border-oda-charcoal/10 rounded-xl px-3 py-2 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20"
      />
    </div>
  );
}

function TierTable({
  tiers,
  type,
  costKes,
  onUpdate,
  onRemove,
}: {
  tiers: TierRow[];
  type: 'RETAIL' | 'WHOLESALE';
  costKes: number;
  onUpdate: (type: 'RETAIL' | 'WHOLESALE', idx: number, field: keyof TierRow, value: string | number) => void;
  onRemove: (type: 'RETAIL' | 'WHOLESALE', idx: number) => void;
}) {
  if (tiers.length === 0) {
    return (
      <p className="text-xs text-oda-charcoal/30 font-plus-jakarta italic">No tiers — add one above</p>
    );
  }
  return (
    <div className="rounded-xl border border-oda-charcoal/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-oda-ivory border-b border-oda-charcoal/8">
            <th className="text-left text-xs font-bold text-oda-charcoal/40 px-3 py-2 font-plus-jakarta">Min qty</th>
            <th className="text-left text-xs font-bold text-oda-charcoal/40 px-3 py-2 font-plus-jakarta">Price (KES)</th>
            <th className="text-left text-xs font-bold text-oda-charcoal/40 px-3 py-2 font-plus-jakarta">Margin</th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-oda-charcoal/4">
          {tiers.map((t, i) => {
            const margin = computeMargin(t.priceKes, costKes);
            return (
              <tr key={i}>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={t.minQuantity}
                    onChange={(e) => onUpdate(type, i, 'minQuantity', Number(e.target.value))}
                    className="w-16 bg-transparent text-sm font-plus-jakarta border-b border-oda-charcoal/10 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={t.priceKes / 100}
                    onChange={(e) => onUpdate(type, i, 'priceKes', Math.round(parseFloat(e.target.value) * 100) || 0)}
                    className="w-20 bg-transparent text-sm font-plus-jakarta border-b border-oda-charcoal/10 focus:outline-none"
                  />
                </td>
                <td className={`px-3 py-2 text-xs font-bold font-plus-jakarta ${marginColor(margin)}`}>
                  {pct(margin)}
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => onRemove(type, i)} className="text-oda-charcoal/30 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'needsPricing' | 'belowGuardrail' | 'active';

export default function AdminPricingPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  // Price simulation
  const [showSim, setShowSim] = useState(false);
  const [simCost, setSimCost] = useState('');
  const [simMarkup, setSimMarkup] = useState('20');
  const [simVat, setSimVat] = useState('16');
  const [simResult, setSimResult] = useState<{ selling: number; margin: number; final: number } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await catalogApi.getProducts({ limit: 100, page: 1 });
      const data = res.data as { items?: ProductRow[] };
      const items = (data.items ?? []).map((p) => ({
        ...p,
        _pricingStatus: deriveStatus(p),
      }));
      setProducts(items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  useEffect(() => {
    const pid = searchParams.get('productId');
    if (!pid || products.length === 0) return;
    const match = products.find((p) => p.id === pid);
    if (match) setEditingProduct(match);
  }, [searchParams, products]);

  function deriveStatus(p: ProductRow): ProductRow['_pricingStatus'] {
    if (!p.images?.length) return 'noImage';
    if (!p.sku) return 'noSku';
    // Without fetching full price rules per-product, we can only derive from available data
    const v = p.variants?.find((x) => x.isDefault) ?? p.variants?.[0];
    if (!v || v.priceKes <= 0) return 'needsPricing';
    return 'active';
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false);
    const matchStatus = filterStatus === 'all' || p._pricingStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const simulate = () => {
    const cost = parseFloat(simCost) * 100;
    const markup = parseFloat(simMarkup) / 100;
    const vat = parseFloat(simVat) / 100;
    if (isNaN(cost) || cost <= 0) return;
    const selling = cost * (1 + markup);
    const final = selling * (1 + vat);
    const margin = ((selling - cost) / selling) * 100;
    setSimResult({ selling: selling / 100, margin, final: final / 100 });
  };

  const statusCounts = {
    all: products.length,
    active: products.filter((p) => p._pricingStatus === 'active').length,
    needsPricing: products.filter((p) => p._pricingStatus === 'needsPricing').length,
    belowGuardrail: products.filter((p) => p._pricingStatus === 'belowGuardrail').length,
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">Pricing</h1>
          <p className="text-sm text-oda-charcoal/50 font-plus-jakarta mt-0.5">
            Manage retail &amp; wholesale pricing, tiers, and margin guardrails
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSim((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-oda-charcoal/10 text-sm font-bold font-plus-jakarta text-oda-charcoal/70 hover:bg-oda-ivory"
          >
            <TrendingUp size={14} /> Simulate
          </button>
          <button
            onClick={() => void loadProducts()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-oda-charcoal/10 text-sm font-bold font-plus-jakarta text-oda-charcoal/70 hover:bg-oda-ivory"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Simulation panel */}
      {showSim && (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 mb-6">
          <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-4">Quick price simulator</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Supplier Cost (KES)', value: simCost, set: setSimCost, placeholder: '0.00' },
              { label: 'Markup %', value: simMarkup, set: setSimMarkup, placeholder: '20' },
              { label: 'VAT %', value: simVat, set: setSimVat, placeholder: '16' },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta block mb-1">{f.label}</label>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-oda-ivory border border-oda-charcoal/10 rounded-xl px-3 py-2 text-sm font-plus-jakarta"
                />
              </div>
            ))}
          </div>
          <button
            onClick={simulate}
            className="mt-4 bg-oda-green text-white px-5 py-2 rounded-xl text-sm font-bold font-plus-jakarta"
          >
            Calculate
          </button>
          {simResult && (
            <div className={`mt-4 rounded-xl p-4 border ${simResult.margin < 8 ? 'bg-red-50 border-red-200' : 'bg-oda-mint/20 border-oda-green/20'} grid grid-cols-3 gap-4`}>
              <div>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">Selling (ex-VAT)</p>
                <p className="font-extrabold text-oda-charcoal font-plus-jakarta">KES {simResult.selling.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">Final (incl. VAT)</p>
                <p className="font-extrabold text-oda-charcoal font-plus-jakarta">KES {simResult.final.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">Gross margin</p>
                <p className={`font-extrabold font-plus-jakarta ${marginColor(simResult.margin)}`}>{simResult.margin.toFixed(1)}%</p>
                {simResult.margin < 8 && (
                  <p className="text-xs text-red-600 font-plus-jakarta flex items-center gap-1 mt-0.5">
                    <AlertCircle size={10} /> Below guardrail
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all', label: `All (${statusCounts.all})` },
          { key: 'active', label: `Priced (${statusCounts.active})` },
          { key: 'needsPricing', label: `No B2B price (${statusCounts.needsPricing})` },
          { key: 'belowGuardrail', label: `Below guardrail (${statusCounts.belowGuardrail})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-plus-jakarta transition-colors ${
              filterStatus === key
                ? 'bg-oda-charcoal text-white'
                : 'bg-white border border-oda-charcoal/10 text-oda-charcoal/60 hover:bg-oda-ivory'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-oda-charcoal/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or SKU…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oda-charcoal/10 bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20"
        />
      </div>

      {err && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 font-plus-jakarta">
          {err}
        </div>
      )}

      {/* Product table */}
      {loading ? (
        <div className="flex items-center gap-2 text-oda-charcoal/40 font-plus-jakarta py-10 justify-center">
          <Loader2 className="animate-spin" size={20} /> Loading products…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-oda-charcoal/8">
                {['Product', 'SKU', 'Category', 'Retail price', 'Status', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-oda-charcoal/40 px-5 py-3 font-plus-jakarta">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-oda-charcoal/4">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-oda-charcoal/30 font-plus-jakarta">
                    No products match this filter
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const v = p.variants?.find((x) => x.isDefault) ?? p.variants?.[0];
                return (
                  <tr key={p.id} className="hover:bg-oda-ivory/60 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-oda-ivory overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={14} className="text-oda-charcoal/20" />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta line-clamp-1">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-mono">{p.sku ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">{p.category?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                      {v ? fmt(v.priceKes) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={p._pricingStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="flex items-center gap-1 text-xs text-oda-charcoal/50 font-bold font-plus-jakarta group-hover:text-oda-green transition-colors"
                      >
                        Edit pricing <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing drawer */}
      {editingProduct && (
        <PricingDrawer
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => void loadProducts()}
        />
      )}
    </div>
  );
}
