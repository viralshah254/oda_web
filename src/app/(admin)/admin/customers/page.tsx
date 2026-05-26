'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api-client';

interface Customer {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  customerProfile?: { tier?: string; totalOrders?: number; totalSpentKes?: number; lastOrderAt?: string };
  user?: { name?: string; phone?: string; email?: string };
  tier?: string;
  totalOrders?: number;
  totalSpentKes?: number;
  lastOrderAt?: string;
  status?: string;
  isFraudFlagged?: boolean;
}

const TIER_COLOR: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-gray-100 text-gray-700',
  GOLD:   'bg-yellow-100 text-yellow-700',
};

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({ page, limit: 25, search: search || undefined });
      setCustomers(res.data?.users ?? res.data?.customers ?? res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">Customers</h1>
          <p className="text-sm text-oda-charcoal/40 font-plus-jakarta mt-0.5">{total.toLocaleString()} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-oda-charcoal/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, phone…"
              className="bg-white border border-oda-charcoal/10 rounded-xl pl-9 pr-4 py-2 text-sm font-plus-jakarta outline-none focus:ring-2 focus:ring-oda-green/20 w-60"
            />
          </div>
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Registered', value: total.toLocaleString() },
          { label: 'Showing', value: customers.length.toLocaleString() },
          { label: 'Page', value: `${page}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 px-5 py-4">
            <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">{s.value}</p>
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-0.5">{s.label}</p>
          </div>
        ))}
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
                {['Customer', 'Phone / Email', 'Tier', 'Orders', 'Total Spend', 'Last Order'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-oda-charcoal/40 px-5 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-oda-charcoal/4">
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-oda-charcoal/40 font-plus-jakarta">
                    No customers found
                  </td>
                </tr>
              )}
              {customers.map((c) => {
                const name = c.user?.name ?? c.name ?? '—';
                const contact = c.user?.phone ?? c.phone ?? c.user?.email ?? c.email ?? '—';
                const tier = c.tier ?? c.customerProfile?.tier ?? 'BRONZE';
                const totalOrders = c.totalOrders ?? c.customerProfile?.totalOrders ?? 0;
                const totalSpent = c.totalSpentKes ?? c.customerProfile?.totalSpentKes;
                const lastOrder = c.lastOrderAt ?? c.customerProfile?.lastOrderAt;
                return (
                <tr key={c.id} className="hover:bg-oda-ivory cursor-pointer transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-oda-mint flex items-center justify-center shrink-0">
                        <span className="text-oda-green text-xs font-extrabold">{name[0]?.toUpperCase() ?? '?'}</span>
                      </div>
                      <span className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">{name}</span>
                      {c.isFraudFlagged && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">⚠ Flagged</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">{contact}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full font-plus-jakarta ${TIER_COLOR[tier] ?? TIER_COLOR.BRONZE}`}>
                      {tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-oda-charcoal font-plus-jakarta">{totalOrders}</td>
                  <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                    {totalSpent ? `KES ${(totalSpent / 100).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-plus-jakarta">
                    {lastOrder ? new Date(lastOrder).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">Page {page} of {Math.ceil(total / 25)}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-oda-charcoal/10 disabled:opacity-40 hover:border-oda-charcoal font-plus-jakarta">Prev</button>
            <button disabled={page >= Math.ceil(total / 25)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-oda-charcoal/10 disabled:opacity-40 hover:border-oda-charcoal font-plus-jakarta">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
