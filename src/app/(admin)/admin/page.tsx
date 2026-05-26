'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, ShoppingBag, Truck, AlertTriangle, Loader2 } from 'lucide-react';
import { AdminPageHeader, AdminMetricCard, AdminStatusPill } from '@/components/admin/admin-ui';
import { adminApi } from '@/lib/api-client';

interface DashboardStats {
  orders?: { today?: number; growth?: number };
  revenue?: { todayKes?: number };
  operations?: { activeRiders?: number; openTickets?: number };
}

interface OrderRow {
  id: string;
  status: string;
  totalKes?: number;
  totalAmountKes?: number;
  createdAt?: string;
  customer?: { user?: { name?: string }; name?: string };
  customerName?: string;
}

const statusLabel: Record<string, string> = {
  PAYMENT_PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PAYMENT_FAILED: 'Failed',
};

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getOrders({ limit: 5, page: 1 }),
      ]);
      setStatsData(statsRes.data as DashboardStats);
      const raw = ordersRes.data as { orders?: OrderRow[] };
      setOrders(raw.orders ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const growth = statsData?.orders?.growth;
  const growthStr = growth != null ? `${growth >= 0 ? '+' : ''}${growth}%` : '';

  const stats = [
    {
      label: "Today's Orders",
      value: statsData?.orders?.today?.toLocaleString() ?? '—',
      change: growthStr,
      icon: ShoppingBag,
      accent: 'green' as const,
    },
    {
      label: 'Revenue (KES)',
      value: statsData?.revenue?.todayKes
        ? Math.floor(statsData.revenue.todayKes / 100).toLocaleString()
        : '—',
      change: '',
      icon: BarChart3,
      accent: 'yellow' as const,
    },
    {
      label: 'Active Riders',
      value: statsData?.operations?.activeRiders?.toLocaleString() ?? '—',
      change: '',
      icon: Truck,
      accent: 'orange' as const,
    },
    {
      label: 'Open Tickets',
      value: statsData?.operations?.openTickets?.toLocaleString() ?? '—',
      change: '',
      icon: AlertTriangle,
      accent: 'red' as const,
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <AdminPageHeader title="Dashboard" subtitle={`${today} · Nairobi, Kenya`} />

      {err && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 font-plus-jakarta">
          {err}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-oda-charcoal/40">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading dashboard…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, change, icon: Icon, accent }) => (
              <AdminMetricCard
                key={label}
                label={label}
                value={String(value)}
                subValue={change ? `${change} vs yesterday` : undefined}
                icon={<Icon size={17} />}
                accent={accent}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-oda-charcoal/8">
              <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm text-oda-green font-semibold font-plus-jakarta hover:underline">
                View all →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-oda-charcoal/8">
                    {['Order', 'Customer', 'Status', 'Total', 'Time'].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-oda-charcoal/40 px-5 py-3 font-plus-jakarta">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-oda-charcoal/4">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-oda-charcoal/30 font-plus-jakarta text-sm">
                        No recent orders
                      </td>
                    </tr>
                  ) : orders.map((order) => {
                    const total = order.totalKes ?? order.totalAmountKes ?? 0;
                    const customerName =
                      order.customer?.user?.name ??
                      order.customer?.name ??
                      order.customerName ??
                      'Customer';
                    return (
                      <tr key={order.id} className="hover:bg-oda-ivory/60 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-bold text-oda-green font-plus-jakarta">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-oda-charcoal/70 font-plus-jakarta">{customerName}</td>
                        <td className="px-5 py-3">
                          <AdminStatusPill
                            label={statusLabel[order.status] ?? order.status}
                            variant={
                              order.status === 'DELIVERED' ? 'success' :
                              order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED' ? 'error' :
                              order.status === 'PAYMENT_PENDING' ? 'warning' : 'neutral'
                            }
                          />
                        </td>
                        <td className="px-5 py-3 font-bold text-oda-charcoal font-plus-jakarta">
                          KES {total ? Math.floor(total / 100).toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-3 text-oda-charcoal/40 font-plus-jakarta">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString('en-KE', { timeStyle: 'short' })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
