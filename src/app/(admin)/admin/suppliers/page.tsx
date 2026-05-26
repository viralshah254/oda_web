'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface Supplier {
  id: string;
  name: string;
  tradingName?: string | null;
  isActive: boolean;
  branches?: { id: string; name: string; isActive: boolean }[];
  _count?: { orders: number };
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSuppliers({ limit: 50 });
      setSuppliers(res.data?.suppliers ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Supplier Tenants"
        subtitle={`${total.toLocaleString()} registered`}
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

      <AdminDataTable
        columns={['Supplier', 'Branches', 'Orders', 'Status']}
        loading={loading}
        empty="No suppliers found"
      >
        {!loading && suppliers.map((s) => {
          const branchCount = s.branches?.length ?? 0;
          const activeBranches = s.branches?.filter((b) => b.isActive).length ?? 0;
          return (
            <tr key={s.id} className="hover:bg-oda-ivory transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-oda-mint flex items-center justify-center">
                    <Store size={14} className="text-oda-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{s.name}</p>
                    <p className="text-xs text-oda-charcoal/40 font-mono">{s.id.slice(0, 12)}…</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                {branchCount > 0 ? `${activeBranches}/${branchCount} active` : '—'}
              </td>
              <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                {s._count?.orders?.toLocaleString() ?? '—'}
              </td>
              <td className="px-5 py-3">
                <AdminStatusPill
                  label={s.isActive ? 'ACTIVE' : 'INACTIVE'}
                  variant={s.isActive ? 'success' : 'neutral'}
                />
              </td>
            </tr>
          );
        })}
      </AdminDataTable>
    </div>
  );
}
