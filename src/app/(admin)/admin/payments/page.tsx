'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { paymentsAdminApi, ledgerAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface PaymentTransaction {
  id: string;
  orderId?: string | null;
  method: string;
  status: string;
  amountKes: number;
  providerRef?: string | null;
  reconciledAt?: string | null;
  createdAt: string;
  order?: {
    id: string;
    customer?: { user?: { name?: string; phone?: string } };
  };
}

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED') return 'error';
  return 'neutral';
};

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingReconciliation, setPendingReconciliation] = useState(0);
  const [ledgerSummary, setLedgerSummary] = useState<Record<string, number | string | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'reconciliation'>('transactions');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsAdminApi.reconciliation({ limit: 50 });
      setTransactions(res.data?.transactions ?? []);
      setTotal(res.data?.total ?? 0);
      setPendingReconciliation(res.data?.pendingReconciliation ?? 0);
      const ledger = await ledgerAdminApi.reconciliation();
      setLedgerSummary(ledger.data ?? null);
    } catch {
      setError('Failed to load payment data');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmed = transactions.filter((t) => t.status === 'CONFIRMED');
  const pending = transactions.filter((t) => t.status === 'PENDING');
  const failed = transactions.filter((t) => t.status === 'FAILED');
  const totalConfirmedKes = confirmed.reduce((s, t) => s + t.amountKes, 0);
  const mpesaCount = transactions.filter((t) => t.method?.includes('MPESA')).length;
  const mpesaConfirmed = transactions.filter((t) => t.method?.includes('MPESA') && t.status === 'CONFIRMED').length;
  const mpesaRate = mpesaCount > 0 ? `${((mpesaConfirmed / mpesaCount) * 100).toFixed(1)}%` : '—';

  const customerLabel = (tx: PaymentTransaction) => {
    const u = tx.order?.customer?.user;
    return u?.name ?? u?.phone ?? '—';
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Payments"
        subtitle={`${total.toLocaleString()} transactions`}
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {ledgerSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Unreconciled payments', value: ledgerSummary.unreconciledPayments },
            { label: 'Missing ledger entries', value: ledgerSummary.confirmedWithoutLedger },
            { label: 'Ledger entries (24h)', value: ledgerSummary.ledgerEntriesLast24h },
            { label: 'Flagged users', value: ledgerSummary.flaggedUsers },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{s.label}</p>
              <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">{String(s.value ?? '—')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Confirmed (loaded)', value: `KES ${totalConfirmedKes.toLocaleString()}`, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: String(pending.length), icon: AlertCircle, color: 'text-amber-600' },
          { label: 'Failed', value: String(failed.length), icon: AlertCircle, color: 'text-oda-red' },
          { label: 'M-Pesa Success Rate', value: mpesaRate, icon: TrendingUp, color: 'text-oda-green' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{s.label}</p>
            </div>
            <p className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(['transactions', 'reconciliation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta transition-colors ${
              activeTab === tab ? 'bg-oda-charcoal text-white' : 'bg-white border border-oda-charcoal/10 text-oda-charcoal/60'
            }`}
          >
            {tab === 'transactions' ? 'Transactions' : 'Reconciliation'}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' ? (
        <AdminDataTable
          columns={['Transaction', 'Order', 'Customer', 'Method', 'Amount', 'Status', 'Receipt', 'Time']}
          loading={loading}
          empty="No transactions found"
        >
          {!loading && transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-oda-ivory">
              <td className="px-5 py-3 text-xs font-bold text-oda-charcoal/40 font-mono">{tx.id.slice(0, 12)}…</td>
              <td className="px-5 py-3 text-sm text-oda-green font-bold font-plus-jakarta">{tx.orderId?.slice(0, 12) ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-oda-charcoal font-plus-jakarta">{customerLabel(tx)}</td>
              <td className="px-5 py-3 text-xs text-oda-charcoal/60 font-plus-jakarta">{tx.method}</td>
              <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">KES {tx.amountKes.toLocaleString()}</td>
              <td className="px-5 py-3">
                <AdminStatusPill label={tx.status} variant={statusVariant(tx.status)} />
              </td>
              <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-mono">{tx.providerRef ?? '—'}</td>
              <td className="px-5 py-3 text-xs text-oda-charcoal/40 font-plus-jakarta">
                {new Date(tx.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6">
          <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-4">Reconciliation</h2>
          {loading ? (
            <div className="text-center py-12 text-oda-charcoal/30">Loading…</div>
          ) : pendingReconciliation === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">All confirmed payments reconciled</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">
                {pendingReconciliation} confirmed payment{pendingReconciliation !== 1 ? 's' : ''} awaiting reconciliation
              </p>
            </div>
          )}
          <button
            onClick={load}
            className="w-full bg-oda-green text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green/90 transition-colors mt-4"
          >
            Refresh Reconciliation Queue
          </button>
        </div>
      )}
    </div>
  );
}
