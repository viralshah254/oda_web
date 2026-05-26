'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Percent, Loader2, RefreshCw, X } from 'lucide-react';
import { promotionsAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface Promotion {
  id: string;
  name: string;
  type: string;
  discountPct?: number | null;
  discountKes?: number | null;
  isActive: boolean;
  maxRedeemCount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [discountPct, setDiscountPct] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await promotionsAdminApi.list();
      const data = res.data;
      setPromotions(Array.isArray(data) ? data : data?.promotions ?? []);
    } catch {
      setError('Failed to load promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !discountPct) return;
    setCreating(true);
    try {
      await promotionsAdminApi.create({
        name: name.trim(),
        type: 'PERCENTAGE',
        discountPct: Number(discountPct),
        isActive: true,
      });
      setShowForm(false);
      setName('');
      setDiscountPct('');
      await load();
    } catch {
      setError('Failed to create promotion');
    } finally {
      setCreating(false);
    }
  };

  const formatDiscount = (p: Promotion) => {
    if (p.discountPct) return `${p.discountPct}% off`;
    if (p.discountKes) return `KES ${(p.discountKes / 100).toLocaleString()} off`;
    return '—';
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Promotions"
        subtitle={loading ? 'Loading…' : `${promotions.length} active promotion${promotions.length === 1 ? '' : 's'}`}
        actions={
          <>
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-oda-green text-white px-4 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green/90 transition-colors"
            >
              <Plus size={16} /> New Promotion
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-oda-green animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 py-16 text-center">
          <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No promotions found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm font-bold text-oda-green font-plus-jakarta hover:underline"
          >
            Create your first promotion
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 flex items-center gap-5">
              <div className="w-12 h-12 bg-oda-mint rounded-xl flex items-center justify-center shrink-0">
                {p.type === 'PERCENTAGE' ? (
                  <Percent size={20} className="text-oda-yellow" />
                ) : (
                  <Tag size={20} className="text-oda-yellow" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{p.name}</p>
                <p className="text-xs text-oda-charcoal/50 mt-0.5 font-plus-jakarta">
                  {p.type} · {formatDiscount(p)}
                  {p.maxRedeemCount != null && ` · Max ${p.maxRedeemCount} uses`}
                </p>
              </div>
              <AdminStatusPill
                label={p.isActive ? 'ACTIVE' : 'INACTIVE'}
                variant={p.isActive ? 'success' : 'neutral'}
              />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta">New Percentage Promotion</h2>
              <button onClick={() => setShowForm(false)} className="text-oda-charcoal/40 hover:text-oda-charcoal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta block mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border border-oda-charcoal/10 rounded-xl px-4 py-2 text-sm font-plus-jakarta outline-none focus:ring-2 focus:ring-oda-green/20"
                  placeholder="e.g. Summer Sale 20%"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta block mb-1">Discount %</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  required
                  className="w-full bg-white border border-oda-charcoal/10 rounded-xl px-4 py-2 text-sm font-plus-jakarta outline-none focus:ring-2 focus:ring-oda-green/20"
                  placeholder="20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-oda-charcoal/10 text-sm font-bold font-plus-jakarta text-oda-charcoal/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-oda-green text-white text-sm font-bold font-plus-jakarta hover:bg-oda-green/90 disabled:opacity-50 flex items-center justify-center"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
