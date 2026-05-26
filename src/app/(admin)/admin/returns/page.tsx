'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Loader2, RefreshCw } from 'lucide-react';
import { returnsAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface ReturnItem {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  description?: string | null;
  refundAmtKes?: number;
  createdAt: string;
  customer?: { user?: { name?: string; phone?: string } } | { name?: string; phone?: string };
  order?: { id: string };
  items?: unknown[];
  evidence?: unknown[];
}

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  if (status === 'APPROVED' || status === 'REFUND_ISSUED' || status === 'CREDIT_ISSUED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'UNDER_REVIEW' || status === 'REQUESTED') return 'warning';
  return 'info';
};

function customerName(r: ReturnItem) {
  const c = r.customer;
  if (!c) return '—';
  if ('user' in c && c.user) return c.user.name ?? c.user.phone ?? '—';
  if ('name' in c) return c.name ?? c.phone ?? '—';
  return '—';
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReturnItem | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await returnsAdminApi.queue();
      setReturns(res.data?.returns ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load returns queue');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (id: string, approved: boolean) => {
    setReviewing(true);
    try {
      await returnsAdminApi.review(id, {
        approved,
        resolution: approved ? 'REFUND' : 'REJECTED',
      });
      setSelected(null);
      await load();
    } catch {
      setError(`Failed to ${approved ? 'approve' : 'reject'} return`);
    } finally {
      setReviewing(false);
    }
  };

  const pending = returns.filter((r) => ['REQUESTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(r.status));
  const approved = returns.filter((r) => r.status === 'APPROVED');
  const totalValue = returns.reduce((s, r) => s + (r.refundAmtKes ?? 0), 0);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <AdminPageHeader
          title="Returns & Refunds"
          subtitle={`${total} return request${total === 1 ? '' : 's'}`}
          actions={
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
          }
        />

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending Review', value: pending.length, color: 'text-amber-600' },
            { label: 'Approved', value: approved.length, color: 'text-blue-600' },
            { label: 'Total in Queue', value: returns.length, color: 'text-oda-green' },
            { label: 'Total Value (KES)', value: (totalValue / 100).toLocaleString(), color: 'text-oda-charcoal' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mb-1">{s.label}</p>
              <p className={`text-xl font-extrabold font-plus-jakarta ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <AdminDataTable
          columns={['Return ID', 'Order', 'Customer', 'Reason', 'Value', 'Status', 'Evidence']}
          loading={loading}
          empty="No returns in queue"
        >
          {!loading && returns.map((r) => (
            <tr
              key={r.id}
              className="hover:bg-oda-ivory cursor-pointer transition-colors"
              onClick={() => setSelected(r)}
            >
              <td className="px-5 py-3 text-xs font-bold text-oda-charcoal/40 font-mono">{r.id.slice(0, 12)}…</td>
              <td className="px-5 py-3 text-sm font-bold text-oda-green font-plus-jakarta">
                {r.order?.id ?? r.orderId}
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal font-plus-jakarta">{customerName(r)}</td>
              <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                {r.description ?? r.reason?.replace(/_/g, ' ') ?? '—'}
              </td>
              <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                {r.refundAmtKes ? `KES ${(r.refundAmtKes / 100).toLocaleString()}` : '—'}
              </td>
              <td className="px-5 py-3">
                <AdminStatusPill label={r.status.replace(/_/g, ' ')} variant={statusVariant(r.status)} />
              </td>
              <td className="px-5 py-3">
                {(r.evidence?.length ?? 0) > 0 ? (
                  <Eye size={14} className="text-oda-green" />
                ) : (
                  <XCircle size={14} className="text-oda-charcoal/20" />
                )}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      </div>

      {selected && (
        <div className="w-80 border-l border-oda-charcoal/8 p-5 bg-white overflow-y-auto">
          <h3 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-4">{selected.id.slice(0, 16)}…</h3>
          <div className="space-y-2 mb-5">
            {[
              ['Order', selected.order?.id ?? selected.orderId],
              ['Customer', customerName(selected)],
              ['Reason', selected.reason?.replace(/_/g, ' ') ?? '—'],
              ['Items', String(selected.items?.length ?? 0)],
              ['Value', selected.refundAmtKes ? `KES ${(selected.refundAmtKes / 100).toLocaleString()}` : '—'],
              ['Status', selected.status.replace(/_/g, ' ')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-plus-jakarta">
                <span className="text-oda-charcoal/40">{k}</span>
                <span className="font-semibold text-oda-charcoal">{v}</span>
              </div>
            ))}
          </div>
          {['REQUESTED', 'UNDER_REVIEW', 'PENDING_REVIEW'].includes(selected.status) && (
            <div className="space-y-2">
              <button
                onClick={() => handleReview(selected.id, true)}
                disabled={reviewing}
                className="w-full bg-oda-green text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2 hover:bg-oda-green/90 disabled:opacity-50"
              >
                {reviewing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve Refund
              </button>
              <button
                onClick={() => handleReview(selected.id, false)}
                disabled={reviewing}
                className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {reviewing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
