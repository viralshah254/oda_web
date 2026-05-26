'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { logisticsAdminApi } from '@/lib/api-client';

export default function PortalLogisticsPage() {
  const [partnerId, setPartnerId] = useState('');
  const [dashboard, setDashboard] = useState<{ riderCount?: number; activeTrips?: number; completedToday?: number } | null>(null);
  const [fleet, setFleet] = useState<Array<{ id: string; plateNumber?: string; vehicleType?: string }>>([]);
  const [settlements, setSettlements] = useState<Array<{ id: string; amountKes: number; status: string; periodEnd: string }>>([]);
  const [disputes, setDisputes] = useState<Array<{ id: string; reason: string; status: string }>>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!partnerId.trim()) return;
    setLoading(true);
    try {
      const [dash, fleetRes, sett, disp] = await Promise.all([
        logisticsAdminApi.dashboard(partnerId.trim()),
        logisticsAdminApi.fleet(partnerId.trim()),
        logisticsAdminApi.settlements(partnerId.trim()),
        logisticsAdminApi.disputes(partnerId.trim(), 'OPEN'),
      ]);
      setDashboard(dash.data ?? null);
      setFleet(Array.isArray(fleetRes.data) ? fleetRes.data : []);
      setSettlements(Array.isArray(sett.data) ? sett.data : []);
      setDisputes(Array.isArray(disp.data) ? disp.data : []);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('oda_logistics_partner_id') : null;
    if (stored) setPartnerId(stored);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">Logistics Partner Portal</h1>
      <p className="text-sm text-oda-charcoal/50 mb-6 font-plus-jakarta">Fleet, settlements, and dispute queue</p>

      <div className="flex gap-2 mb-6">
        <input
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          placeholder="Partner ID"
          className="flex-1 rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
        />
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('oda_logistics_partner_id', partnerId.trim());
            void load();
          }}
          className="px-4 py-2 rounded-xl bg-oda-green text-white text-sm font-bold"
        >
          Load
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-oda-charcoal/50 text-sm mb-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {dashboard && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Riders', value: dashboard.riderCount ?? 0, icon: Truck },
            { label: 'Active trips', value: dashboard.activeTrips ?? 0, icon: AlertCircle },
            { label: 'Completed today', value: dashboard.completedToday ?? 0, icon: Wallet },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
              <s.icon size={16} className="text-oda-green mb-2" />
              <p className="text-xs text-oda-charcoal/40">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
          <h2 className="font-bold text-sm mb-3">Fleet ({fleet.length})</h2>
          {fleet.length === 0 ? (
            <p className="text-sm text-oda-charcoal/40">No vehicles registered.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {fleet.map((v) => (
                <li key={v.id} className="flex justify-between border-b border-oda-charcoal/5 pb-2">
                  <span>{v.plateNumber ?? v.id.slice(0, 8)}</span>
                  <span className="text-oda-charcoal/50">{v.vehicleType ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
          <h2 className="font-bold text-sm mb-3">Open disputes ({disputes.length})</h2>
          {disputes.length === 0 ? (
            <p className="text-sm text-oda-charcoal/40">No open disputes.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {disputes.map((d) => (
                <li key={d.id} className="border-b border-oda-charcoal/5 pb-2">{d.reason}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 md:col-span-2">
          <h2 className="font-bold text-sm mb-3">Settlement periods</h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-oda-charcoal/40">No settlement runs yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-oda-charcoal/40">
                  <th className="pb-2">Period end</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-t border-oda-charcoal/5">
                    <td className="py-2">{new Date(s.periodEnd).toLocaleDateString()}</td>
                    <td className="py-2">KES {(s.amountKes / 100).toLocaleString()}</td>
                    <td className="py-2">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
