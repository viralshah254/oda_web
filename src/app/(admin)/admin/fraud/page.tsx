'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fraudAdminApi } from '@/lib/api-client';
import { AdminDataTable, AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface FraudItem {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  isFraudFlagged: boolean;
  risk?: { score?: number; reasons?: string[] };
}

export default function AdminFraudPage() {
  const [items, setItems] = useState<FraudItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fraudAdminApi.queue();
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load fraud queue');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClear = async (userId: string) => {
    setActing(userId);
    try {
      await fraudAdminApi.clear(userId, 'Cleared from admin fraud queue');
      await load();
    } catch {
      setError('Failed to clear fraud flag');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Fraud Review"
        subtitle={`${total} flagged account${total === 1 ? '' : 's'}`}
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-oda-red/10 border border-oda-red/20 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <AdminDataTable
        columns={['User', 'Contact', 'Risk score', 'Reasons', 'Status', 'Actions']}
        loading={loading}
        empty="No flagged users in queue"
      >
        {!loading &&
          items.map((u) => (
            <tr key={u.id} className="border-t border-oda-charcoal/5 hover:bg-oda-ivory/50">
              <td className="px-4 py-3 text-sm font-plus-jakarta">{u.name ?? '—'}</td>
              <td className="px-4 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                {u.phone ?? u.email ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm font-bold font-plus-jakarta">{u.risk?.score ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-oda-charcoal/50 font-plus-jakarta max-w-xs truncate">
                {(u.risk?.reasons ?? []).join(', ') || '—'}
              </td>
              <td className="px-4 py-3">
                <AdminStatusPill label="Flagged" variant="error" />
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={acting === u.id}
                  onClick={() => handleClear(u.id)}
                  className="text-xs font-semibold text-oda-green hover:underline disabled:opacity-50 font-plus-jakarta"
                >
                  {acting === u.id ? 'Clearing…' : 'Clear flag'}
                </button>
              </td>
            </tr>
          ))}
      </AdminDataTable>
    </div>
  );
}
