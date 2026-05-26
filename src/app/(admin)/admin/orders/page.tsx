'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api-client';

const STATUSES = ['ALL', 'PLACED', 'CONFIRMED', 'BEING_PREPARED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const STATUS_COLOR: Record<string, string> = {
  PLACED: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  BEING_PREPARED: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

interface Order {
  id: string;
  status: string;
  totalKes: number;
  createdAt: string;
  customer?: { user?: { name?: string; phone?: string } };
  branch?: { name: string };
}

export default function AdminOrdersPage() {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        status: activeStatus !== 'ALL' ? activeStatus : undefined,
        page,
        limit: 20,
      });
      setOrders(res.data?.orders ?? []);
      setTotal(res.data?.total ?? 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [activeStatus, page]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? orders.filter((o) => {
        const name = o.customer?.user?.name?.toLowerCase() ?? '';
        const phone = o.customer?.user?.phone ?? '';
        return o.id.toLowerCase().includes(search.toLowerCase()) || name.includes(search.toLowerCase()) || phone.includes(search);
      })
    : orders;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">Orders</h1>
          <p className="text-sm text-oda-charcoal/40 font-plus-jakarta mt-0.5">{total.toLocaleString()} total orders</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-oda-charcoal/50 hover:text-oda-charcoal font-plus-jakarta">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold font-plus-jakarta transition-colors ${
              activeStatus === s ? 'bg-oda-charcoal text-white' : 'bg-white text-oda-charcoal/60 border border-oda-charcoal/10 hover:border-oda-charcoal'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-oda-charcoal/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or customer…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-oda-charcoal/10 bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-oda-green animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-oda-charcoal/8">
                {['Order ID', 'Customer', 'Branch', 'Status', 'Total', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-oda-charcoal/40 px-5 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-oda-charcoal/4">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-oda-ivory cursor-pointer transition-colors">
                  <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-oda-charcoal font-plus-jakarta">{order.customer?.user?.name ?? '—'}</p>
                    <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{order.customer?.user?.phone ?? ''}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">{order.branch?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                    KES {(order.totalKes / 100).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-plus-jakarta">
                    {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">Page {page} of {Math.ceil(total / 20)}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-oda-charcoal/10 disabled:opacity-40 hover:border-oda-charcoal font-plus-jakarta">Prev</button>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-oda-charcoal/10 disabled:opacity-40 hover:border-oda-charcoal font-plus-jakarta">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
