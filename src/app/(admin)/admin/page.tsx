import { BarChart3, ShoppingBag, Users, Truck, AlertTriangle } from 'lucide-react';
import { ordersApi, authApi } from '@/lib/api-client';

async function fetchDashboardStats() {
  const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${API_BASE}/v1/admin/dashboard/stats`, {
      next: { revalidate: 30 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

async function fetchRecentOrders() {
  const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${API_BASE}/v1/orders?limit=5&sort=recent`, {
      next: { revalidate: 15 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : data.items ?? [];
    }
  } catch {}
  return null;
}

const statusColor: Record<string, string> = {
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
  PAYMENT_PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PAYMENT_FAILED: 'Failed',
};

export default async function AdminDashboard() {
  const [statsData, recentOrders] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentOrders(),
  ]);

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const stats = [
    {
      label: "Today's Orders",
      value: statsData?.todayOrderCount ?? '—',
      change: statsData?.todayOrderChange ?? '',
      icon: ShoppingBag,
      color: 'bg-[#198A2E]',
    },
    {
      label: 'Revenue (KES)',
      value: statsData?.todayRevenueKes ? `${Math.floor(statsData.todayRevenueKes / 100).toLocaleString()}` : '—',
      change: statsData?.revenueChange ?? '',
      icon: BarChart3,
      color: 'bg-[#1565C0]',
    },
    {
      label: 'Active Riders',
      value: statsData?.activeRiders ?? '—',
      change: '',
      icon: Truck,
      color: 'bg-[#E65100]',
    },
    {
      label: 'Open Tickets',
      value: statsData?.openTickets ?? '—',
      change: '',
      icon: AlertTriangle,
      color: 'bg-[#AD1457]',
    },
  ];

  const fallbackOrders = [
    { id: 'ORD-SAMPLE', customer: 'Loading...', status: 'CONFIRMED', totalAmountKes: 0, createdAt: new Date().toISOString() },
  ];

  const orders = recentOrders ?? fallbackOrders;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Dashboard</h1>
        <p className="text-sm text-[#666] mt-1 font-plus-jakarta">{today} · Nairobi, Kenya</p>
        {!statsData && (
          <p className="text-xs text-yellow-600 mt-1 font-plus-jakarta">⚠ Live data unavailable — connect the backend to see real stats.</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{value}</p>
            <p className="text-sm text-[#666] font-plus-jakarta mt-0.5">{label}</p>
            {change && (
              <p className={`text-xs font-semibold mt-1 font-plus-jakarta ${change.startsWith('+') ? 'text-[#198A2E]' : 'text-red-600'}`}>
                {change} vs yesterday
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-[#198A2E] font-semibold font-plus-jakarta hover:underline">
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#999] font-plus-jakarta border-b border-[#E8E8E0]">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Total</th>
                <th className="pb-2 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="py-3">
                    <a href={`/admin/orders/${order.id}`} className="font-bold text-[#198A2E] font-plus-jakarta hover:underline">
                      #{(order.id ?? '').substring(0, 8).toUpperCase()}
                    </a>
                  </td>
                  <td className="py-3 text-[#444] font-plus-jakarta">
                    {order.customer?.name ?? order.customerName ?? 'Customer'}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-[#1A1A1A] font-plus-jakarta">
                    KES {order.totalAmountKes ? Math.floor(order.totalAmountKes / 100) : '—'}
                  </td>
                  <td className="py-3 text-right text-[#999] font-plus-jakarta">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-KE', { timeStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
