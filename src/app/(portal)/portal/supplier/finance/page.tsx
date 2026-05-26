'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { supplierApi } from '@/lib/api-client';
import { AdminPageHeader } from '@/components/admin/admin-ui';

interface SettlementRow {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  netPayableKes?: number;
  status?: string;
}

export default function SupplierFinancePage() {
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await supplierApi.getSettlements({ page: 1 });
      const data = res.data;
      setRows(Array.isArray(data) ? data : (data as { items?: SettlementRow[] }).items ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <AdminPageHeader title="Settlements" subtitle="Weekly supplier payouts" actions={
        <button type="button" onClick={() => void load()}><RefreshCw size={16} /></button>
      } />
      {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-oda-green" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-oda-charcoal/8">
                {['Period', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-oda-charcoal/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-oda-charcoal/30">No settlements yet</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-oda-charcoal/4">
                  <td className="px-5 py-3 font-plus-jakarta">
                    {r.periodStart && r.periodEnd
                      ? `${new Date(r.periodStart).toLocaleDateString()} – ${new Date(r.periodEnd).toLocaleDateString()}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3 font-bold">KES {r.netPayableKes ? (r.netPayableKes / 100).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3">{r.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
