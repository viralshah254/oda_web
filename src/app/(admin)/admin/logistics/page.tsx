'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Zap, Clock, AlertCircle, Loader2, RefreshCw, Radio, Wallet, MessageSquareWarning } from 'lucide-react';
import { adminApi, logisticsAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface Rider {
  id: string;
  status: string;
  isOnline: boolean;
  isAvailable: boolean;
  user?: { name?: string; phone?: string };
  vehicle?: { vehicleType?: string; plateNumber?: string };
  score?: { avgDeliveryMin?: number };
}

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  OFFLINE: 'Offline',
  APPROVED: 'Approved',
  PENDING_KYC: 'Pending KYC',
  KYC_SUBMITTED: 'KYC Submitted',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
};

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'OFFLINE') return 'neutral';
  if (status === 'SUSPENDED' || status === 'TERMINATED') return 'error';
  return 'warning';
};

export default function AdminLogisticsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState('');
  const [dispatchRiders, setDispatchRiders] = useState<Rider[]>([]);
  const [settlements, setSettlements] = useState<Array<{ id: string; amountKes: number; status: string; periodEnd: string }>>([]);
  const [disputes, setDisputes] = useState<Array<{ id: string; reason: string; status: string }>>([]);
  const [fleet, setFleet] = useState<Array<{ id: string; plateNumber?: string; vehicleType?: string }>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getRiders({ limit: 50 });
      setRiders(res.data?.riders ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load riders');
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadDispatch = useCallback(async () => {
    if (!partnerId.trim()) return;
    try {
      const pid = partnerId.trim();
      const [ridersRes, fleetRes, settRes, dispRes] = await Promise.all([
        logisticsAdminApi.activeRiders(pid),
        logisticsAdminApi.fleet(pid),
        logisticsAdminApi.settlements(pid),
        logisticsAdminApi.disputes(pid, 'OPEN'),
      ]);
      setDispatchRiders(ridersRes.data?.riders ?? ridersRes.data ?? []);
      setFleet(Array.isArray(fleetRes.data) ? fleetRes.data : []);
      setSettlements(Array.isArray(settRes.data) ? settRes.data : []);
      setDisputes(Array.isArray(dispRes.data) ? dispRes.data : []);
    } catch {
      setDispatchRiders([]);
      setFleet([]);
      setSettlements([]);
      setDisputes([]);
    }
  }, [partnerId]);

  useEffect(() => { void loadDispatch(); }, [loadDispatch]);

  const online = riders.filter((r) => r.isOnline);
  const available = riders.filter((r) => r.isAvailable && r.isOnline);
  const active = riders.filter((r) => r.status === 'ACTIVE');

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Logistics Command"
        subtitle={`${total} rider${total === 1 ? '' : 's'} registered`}
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Riders', value: active.length, icon: Zap, color: 'text-oda-green' },
          { label: 'Online', value: online.length, icon: MapPin, color: 'text-blue-600' },
          { label: 'Available', value: available.length, icon: Clock, color: 'text-orange-600' },
          { label: 'Offline', value: riders.filter((r) => !r.isOnline).length, icon: AlertCircle, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{s.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Radio size={16} className="text-oda-green" />
          <h2 className="text-sm font-bold font-plus-jakarta">Partner dispatch map</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            placeholder="Logistics partner ID"
            className="flex-1 rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
          />
          <button type="button" onClick={() => void loadDispatch()} className="px-4 py-2 rounded-xl bg-oda-green text-white text-sm font-bold">
            Load online fleet
          </button>
        </div>
        {dispatchRiders.length === 0 ? (
          <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">Enter a partner ID to view live riders for dispatch.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dispatchRiders.map((r) => (
              <div key={r.id} className="rounded-xl border border-oda-charcoal/8 px-4 py-3 text-sm font-plus-jakarta">
                <p className="font-semibold">{r.user?.name ?? r.id.slice(0, 8)}</p>
                <p className="text-oda-charcoal/50">{r.isAvailable ? 'Available' : 'Busy'} · {r.vehicle?.vehicleType ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {partnerId.trim() && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-oda-green" />
              <h2 className="text-sm font-bold font-plus-jakarta">Settlement runs ({settlements.length})</h2>
            </div>
            {settlements.length === 0 ? (
              <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No settlement periods for this partner.</p>
            ) : (
              <ul className="space-y-2 text-sm font-plus-jakarta">
                {settlements.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex justify-between border-b border-oda-charcoal/5 pb-2">
                    <span>{new Date(s.periodEnd).toLocaleDateString()}</span>
                    <span>KES {(s.amountKes / 100).toLocaleString()} · {s.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareWarning size={16} className="text-orange-600" />
              <h2 className="text-sm font-bold font-plus-jakarta">Open disputes ({disputes.length})</h2>
            </div>
            {disputes.length === 0 ? (
              <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No open disputes.</p>
            ) : (
              <ul className="space-y-2 text-sm font-plus-jakarta">
                {disputes.map((d) => (
                  <li key={d.id} className="border-b border-oda-charcoal/5 pb-2">{d.reason}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 md:col-span-2">
            <h2 className="text-sm font-bold font-plus-jakarta mb-3">Fleet ({fleet.length})</h2>
            {fleet.length === 0 ? (
              <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No vehicles registered for partner.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {fleet.map((v) => (
                  <div key={v.id} className="rounded-xl border border-oda-charcoal/8 px-4 py-3 text-sm font-plus-jakarta">
                    <p className="font-semibold">{v.plateNumber ?? v.id.slice(0, 8)}</p>
                    <p className="text-oda-charcoal/50">{v.vehicleType ?? '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <AdminDataTable
          columns={['Rider', 'Status', 'Online', 'Vehicle', 'Phone']}
          loading={loading}
          empty="No riders found"
        >
          {!loading && riders.map((rider) => (
            <tr key={rider.id} className="hover:bg-oda-ivory transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-oda-mint flex items-center justify-center">
                    <span className="text-xs font-bold text-oda-green font-plus-jakarta">
                      {(rider.user?.name?.[0] ?? '?').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">
                      {rider.user?.name ?? '—'}
                    </p>
                    <p className="text-xs text-oda-charcoal/40 font-mono">{rider.id.slice(0, 10)}…</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <AdminStatusPill
                  label={statusLabel[rider.status] ?? rider.status}
                  variant={statusVariant(rider.status)}
                />
              </td>
              <td className="px-5 py-3">
                <AdminStatusPill
                  label={rider.isOnline ? (rider.isAvailable ? 'Available' : 'Busy') : 'Offline'}
                  variant={rider.isOnline ? (rider.isAvailable ? 'success' : 'warning') : 'neutral'}
                />
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                {rider.vehicle?.vehicleType ?? '—'}
                {rider.vehicle?.plateNumber && ` · ${rider.vehicle.plateNumber}`}
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                {rider.user?.phone ?? '—'}
              </td>
            </tr>
          ))}
        </AdminDataTable>
    </div>
  );
}
