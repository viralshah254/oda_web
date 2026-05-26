'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { manufacturerApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

export default function ManufacturerPortalPage() {
  const [manufacturerId, setManufacturerId] = useState('');
  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; status: string; spentKes?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!manufacturerId.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const [dashRes, campRes] = await Promise.all([
        manufacturerApi.getDashboard(manufacturerId.trim()),
        manufacturerApi.getCampaigns(manufacturerId.trim(), { page: 1 }),
      ]);
      setDashboard(dashRes.data as Record<string, number>);
      const raw = campRes.data as { campaigns?: typeof campaigns };
      setCampaigns(raw.campaigns ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load manufacturer data');
    } finally {
      setLoading(false);
    }
  }, [manufacturerId]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('oda_manufacturer_id') : null;
    if (saved) setManufacturerId(saved);
  }, []);

  useEffect(() => {
    if (manufacturerId.trim()) {
      localStorage.setItem('oda_manufacturer_id', manufacturerId.trim());
      void load();
    }
  }, [manufacturerId, load]);

  const createCampaign = async () => {
    if (!manufacturerId.trim() || !name.trim()) return;
    setCreating(true);
    try {
      await manufacturerApi.createCampaign(manufacturerId.trim(), { name: name.trim(), billingModel: 'CPC' });
      setName('');
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <AdminPageHeader title="Manufacturer dashboard" subtitle="Campaigns and spend analytics" />

      <div className="mb-6 flex gap-2">
        <input
          value={manufacturerId}
          onChange={(e) => setManufacturerId(e.target.value)}
          placeholder="Manufacturer ID"
          className="flex-1 rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
        />
        <button type="button" onClick={() => void load()} className="px-4 py-2 rounded-xl bg-oda-green text-white text-sm font-bold">
          Load
        </button>
        <button type="button" onClick={() => void load()} className="p-2"><RefreshCw size={16} /></button>
      </div>

      {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-oda-green" /></div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active campaigns', value: dashboard.activeCampaigns ?? 0 },
              { label: 'Brands', value: dashboard.brands ?? 0 },
              { label: 'Products', value: dashboard.productCount ?? 0 },
              { label: 'Spend (KES)', value: Math.floor((dashboard.totalSpentKes ?? 0) / 100) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
                <p className="text-2xl font-extrabold font-plus-jakarta">{s.value.toLocaleString()}</p>
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 mb-4">
            <h2 className="text-sm font-bold mb-3 font-plus-jakarta">New campaign</h2>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
              <button type="button" disabled={creating} onClick={() => void createCampaign()} className="px-4 py-2 rounded-xl bg-oda-green text-white text-sm font-bold disabled:opacity-50">
                Create
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-oda-charcoal/8">
                  {['Campaign', 'Status', 'Spend'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-oda-charcoal/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-oda-charcoal/4">
                    <td className="px-5 py-3 font-semibold">{c.name}</td>
                    <td className="px-5 py-3"><AdminStatusPill label={c.status} variant={c.status === 'ACTIVE' ? 'success' : 'warning'} /></td>
                    <td className="px-5 py-3">KES {((c.spentKes ?? 0) / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">Enter your manufacturer ID to load dashboard data.</p>
      )}
    </div>
  );
}
