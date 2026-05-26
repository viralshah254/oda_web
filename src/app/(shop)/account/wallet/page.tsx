'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Plus, Wallet, Loader2 } from 'lucide-react';
import { walletApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/wallet');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [balRes, txRes] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions(),
      ]);
      setBalance(balRes.data?.balanceKes ?? balRes.data?.balance ?? 0);
      setTransactions(txRes.data?.transactions ?? txRes.data?.items ?? []);
    } catch {
      setError('Could not load wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const balanceFormatted = balance !== null ? `KES ${(balance / 100).toLocaleString()}` : '—';

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Oda Wallet</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-5">
        {/* Balance card */}
        <div className="bg-oda-charcoal rounded-3xl p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-oda-yellow" />
            <p className="text-white/60 text-sm font-plus-jakarta">Available balance</p>
          </div>
          {loading ? (
            <div className="h-10 bg-white/10 rounded-xl animate-pulse w-40" />
          ) : (
            <p className="text-3xl font-extrabold font-plus-jakarta">{balanceFormatted}</p>
          )}
          <button className="mt-4 flex items-center gap-2 bg-oda-yellow text-oda-charcoal font-extrabold text-sm px-4 py-2 rounded-xl hover:bg-oda-yellow-2 transition-colors font-plus-jakarta">
            <Plus size={14} /> Top up wallet
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-oda-charcoal/8">
          <div className="px-5 py-4 border-b border-oda-charcoal/6">
            <h2 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Transaction history</h2>
          </div>
          {error && <p className="px-5 py-4 text-sm text-red-600 font-plus-jakarta">{error}</p>}
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="text-oda-green animate-spin" />
            </div>
          )}
          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-10">
              <Wallet size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
              <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No transactions yet</p>
            </div>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-oda-charcoal/4 last:border-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'CREDIT' ? 'bg-oda-mint' : 'bg-red-50'}`}>
                {tx.type === 'CREDIT'
                  ? <ArrowDownLeft size={16} className="text-oda-green" />
                  : <ArrowUpRight size={16} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta truncate">{tx.description}</p>
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                  {new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-sm font-extrabold font-plus-jakarta ${tx.type === 'CREDIT' ? 'text-oda-green' : 'text-red-500'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}KES {(tx.amount / 100).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
