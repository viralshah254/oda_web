'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ordersCommandAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface CommandOrder {
  id: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  totalKes: number;
  createdAt: string;
  estimatedDeliveryAt?: string | null;
  customer?: { user?: { name?: string; phone?: string } };
  branch?: { name?: string } | null;
}

interface CommandColumn {
  status: string;
  orders: CommandOrder[];
}

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  if (status === 'DELIVERED') return 'success';
  if (status === 'OUT_FOR_DELIVERY') return 'info';
  if (status === 'PREPARING' || status === 'CONFIRMED') return 'warning';
  if (status === 'PAYMENT_PENDING') return 'neutral';
  return 'neutral';
};

const paymentVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED') return 'error';
  return 'neutral';
};

function customerName(o: CommandOrder) {
  const u = o.customer?.user;
  return u?.name ?? u?.phone ?? '—';
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

function etaMinutes(o: CommandOrder): string {
  if (!o.estimatedDeliveryAt) return '—';
  const mins = Math.max(0, Math.round((new Date(o.estimatedDeliveryAt).getTime() - Date.now()) / 60000));
  return mins > 0 ? `~${mins} min` : 'Due';
}

export default function OrderCommandPage() {
  const [columns, setColumns] = useState<CommandColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'table'>('table');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersCommandAdminApi.board();
      setColumns(res.data?.columns ?? []);
    } catch {
      setError('Failed to load order command board');
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allOrders = columns.flatMap((c) => c.orders.map((o) => ({ ...o, columnStatus: c.status })));

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Order Command Center"
        subtitle={`${allOrders.length} active orders`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
            {(['table', 'kanban'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta capitalize ${
                  view === v ? 'bg-oda-charcoal text-white' : 'bg-white border border-oda-charcoal/10 text-oda-charcoal/60'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {view === 'table' ? (
        <AdminDataTable
          columns={['Order', 'Customer', 'Branch', 'Status', 'Payment', 'Total', 'ETA', 'Time']}
          loading={loading}
          empty="No orders on the board"
        >
          {!loading && allOrders.map((o) => (
            <tr key={o.id} className="hover:bg-oda-ivory cursor-pointer">
              <td className="px-5 py-3 text-sm font-bold text-oda-green font-plus-jakarta">
                {o.orderNumber ?? o.id.slice(0, 12)}
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal font-plus-jakarta">{customerName(o)}</td>
              <td className="px-5 py-3 text-xs text-oda-charcoal/50 font-plus-jakarta">{o.branch?.name ?? '—'}</td>
              <td className="px-5 py-3">
                <AdminStatusPill label={o.status.replace(/_/g, ' ')} variant={statusVariant(o.status)} />
              </td>
              <td className="px-5 py-3">
                <AdminStatusPill label={o.paymentStatus} variant={paymentVariant(o.paymentStatus)} />
              </td>
              <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                KES {o.totalKes.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">{etaMinutes(o)}</td>
              <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-plus-jakarta">{formatRelative(o.createdAt)}</td>
            </tr>
          ))}
        </AdminDataTable>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
          {loading ? (
            <div className="col-span-full text-center py-12 text-oda-charcoal/30 font-plus-jakarta">Loading board…</div>
          ) : columns.length === 0 ? (
            <div className="col-span-full text-center py-12 text-oda-charcoal/30 font-plus-jakarta">No columns</div>
          ) : (
            columns.map((col) => (
              <div key={col.status} className="bg-oda-ivory rounded-2xl p-4 min-w-[180px]">
                <p className="text-xs font-bold text-oda-charcoal/40 font-plus-jakarta mb-3">
                  {col.status.replace(/_/g, ' ')} ({col.orders.length})
                </p>
                {col.orders.length === 0 ? (
                  <p className="text-xs text-oda-charcoal/30 font-plus-jakarta">Empty</p>
                ) : (
                  col.orders.map((o) => (
                    <div key={o.id} className="bg-white rounded-xl border border-oda-charcoal/8 p-3 mb-2">
                      <p className="text-xs font-bold text-oda-green font-plus-jakarta">{o.orderNumber ?? o.id.slice(0, 10)}</p>
                      <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">{customerName(o)}</p>
                      <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">KES {o.totalKes.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
