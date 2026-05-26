'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { supplierApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface OrderRow {
  id: string;
  status: string;
  totalKes?: number;
  createdAt?: string;
  customer?: { user?: { name?: string; phone?: string } };
  items?: unknown[];
}

export default function SupplierPortalPage() {
  const [profile, setProfile] = useState<{ name?: string; branches?: { id: string; name: string }[] } | null>(null);
  const [branchId, setBranchId] = useState<string>('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const profRes = await supplierApi.getProfile();
      const prof = profRes.data as { name?: string; branches?: { id: string; name: string }[] };
      setProfile(prof);
      const bid = branchId || prof.branches?.[0]?.id || '';
      if (bid && !branchId) setBranchId(bid);
      if (bid) {
        const ordRes = await supplierApi.getOrders({ branchId: bid, limit: 30 });
        const data = ordRes.data as { orders?: OrderRow[] };
        setOrders(data.orders ?? []);
      } else {
        setOrders([]);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load queue');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => { void load(); }, [load]);

  const accept = async (id: string) => {
    setActing(id);
    try {
      await supplierApi.acceptOrder(id);
      await load();
    } finally {
      setActing(null);
    }
  };

  const [handoverOtp, setHandoverOtp] = useState<Record<string, string>>({});

  const markReady = async (id: string) => {
    setActing(id);
    try {
      await supplierApi.markReady(id);
      await load();
    } finally {
      setActing(null);
    }
  };

  const initHandover = async (id: string) => {
    setActing(id);
    try {
      const res = await supplierApi.initHandover(id);
      const data = res.data as { handoverOtp?: string };
      if (data.handoverOtp) {
        setHandoverOtp((prev) => ({ ...prev, [id]: data.handoverOtp! }));
      }
      await load();
    } finally {
      setActing(null);
    }
  };

  const newCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PLACED').length;
  const prepCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'BEING_PREPARED').length;
  const readyCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <AdminPageHeader
        title="Branch queue"
        subtitle={profile?.name ? `${profile.name}${branchId ? ` · branch ${branchId.slice(0, 8)}` : ''}` : 'Supplier orders'}
        actions={
          <button type="button" onClick={() => void load()} className="p-2 text-oda-charcoal/40 hover:text-oda-charcoal">
            <RefreshCw size={16} />
          </button>
        }
      />

      {err && <div className="mb-4 rounded-xl bg-oda-red/10 border border-oda-red/20 text-oda-red text-sm px-4 py-3">{err}</div>}

      {profile?.branches && profile.branches.length > 1 && (
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="mb-4 rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-plus-jakarta"
        >
          {profile.branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'New', value: newCount },
          { label: 'Preparing', value: prepCount },
          { label: 'Ready', value: readyCount },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-oda-charcoal/8 text-center">
            <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">{s.value}</p>
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-oda-green" /></div>
      ) : orders.length === 0 ? (
        <p className="text-center text-sm text-oda-charcoal/40 font-plus-jakarta py-12">No orders in queue</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const name = order.customer?.user?.name ?? 'Customer';
            const canAccept = ['PLACED', 'CONFIRMED', 'PAYMENT_CONFIRMED'].includes(order.status);
            const canReady = ['PREPARING', 'BEING_PREPARED'].includes(order.status);
            const canHandover = order.status === 'READY_FOR_PICKUP';
            const otp = handoverOtp[order.id];
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-oda-charcoal font-plus-jakarta">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">{name}</p>
                    <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-1">
                      KES {order.totalKes ? Math.floor(order.totalKes / 100).toLocaleString() : '—'}
                    </p>
                  </div>
                  <AdminStatusPill label={order.status.replace(/_/g, ' ')} variant={canReady ? 'warning' : canAccept ? 'neutral' : 'success'} />
                </div>
                <div className="flex gap-2">
                  {canAccept && (
                    <button
                      type="button"
                      disabled={acting === order.id}
                      onClick={() => void accept(order.id)}
                      className="flex-1 bg-oda-green text-white py-2 rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-50"
                    >
                      Accept & prepare
                    </button>
                  )}
                  {canReady && (
                    <button
                      type="button"
                      disabled={acting === order.id}
                      onClick={() => void markReady(order.id)}
                      className="flex-1 bg-oda-yellow text-oda-charcoal py-2 rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-50"
                    >
                      Mark ready
                    </button>
                  )}
                  {canHandover && (
                    <button
                      type="button"
                      disabled={acting === order.id}
                      onClick={() => void initHandover(order.id)}
                      className="flex-1 bg-oda-charcoal text-white py-2 rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-50"
                    >
                      {otp ? `OTP: ${otp}` : 'Generate handover OTP'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
