'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { loyaltyApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

interface LoyaltyAccount {
  pointsBalance: number;
  tier: string;
  lifetimePoints?: number;
  expiringPoints?: number;
  conversionRate?: number; // points per KES 1
}

interface LoyaltyTx {
  id: string;
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'BONUS';
  points: number;
  description: string;
  createdAt: string;
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-700 bg-amber-50',
  SILVER: 'text-slate-600 bg-slate-100',
  GOLD:   'text-oda-gold bg-yellow-50',
};

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [txs, setTxs] = useState<LoyaltyTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState(100);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/loyalty');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        loyaltyApi.getAccount(),
        loyaltyApi.getTransactions(),
      ]);
      setAccount(accRes.data);
      setTxs(txRes.data?.transactions ?? txRes.data?.items ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const handleConvert = async () => {
    if (!account || account.pointsBalance < convertAmount) return;
    setConverting(true);
    try {
      await loyaltyApi.convertToWallet(convertAmount);
      load();
    } catch { /* ignore */ } finally { setConverting(false); }
  };

  const tierStyle = TIER_COLORS[account?.tier ?? 'BRONZE'] ?? TIER_COLORS.BRONZE;
  const rateLabel = account?.conversionRate ? `${account.conversionRate} pts = KES 1` : '1,000 pts = KES 100';

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Loyalty Points</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-5">
        {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="text-oda-green animate-spin" /></div>}

        {!loading && account && (
          <>
            {/* Balance card */}
            <div className="bg-oda-charcoal rounded-3xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-oda-yellow fill-oda-yellow" />
                  <p className="text-white/60 text-sm font-plus-jakarta">Points balance</p>
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full font-plus-jakarta ${tierStyle}`}>
                  {account.tier ?? 'Bronze'}
                </span>
              </div>
              <p className="text-4xl font-extrabold font-plus-jakarta mb-1">
                {account.pointsBalance.toLocaleString()}
                <span className="text-xl text-white/50 font-normal ml-1">pts</span>
              </p>
              <p className="text-white/40 text-xs font-plus-jakarta">{rateLabel}</p>
            </div>

            {/* Convert to credits */}
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-oda-green" />
                <h3 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Convert to wallet credits</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(Number(e.target.value))}
                  min={100}
                  step={100}
                  max={account.pointsBalance}
                  className="w-32 border border-oda-charcoal/15 rounded-xl px-3 py-2 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
                />
                <ArrowRight size={16} className="text-oda-charcoal/30" />
                <span className="text-sm font-extrabold text-oda-green font-plus-jakarta">
                  KES {(convertAmount / 10).toFixed(0)} credit
                </span>
              </div>
              <button
                onClick={handleConvert}
                disabled={converting || account.pointsBalance < convertAmount}
                className="w-full py-2.5 bg-oda-green text-white rounded-xl text-sm font-extrabold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {converting && <Loader2 size={14} className="animate-spin" />}
                Convert {convertAmount.toLocaleString()} pts to KES {(convertAmount / 10).toFixed(0)}
              </button>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-oda-charcoal/8">
              <div className="px-5 py-4 border-b border-oda-charcoal/6">
                <h2 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Points history</h2>
              </div>
              {txs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No points activity yet</p>
                </div>
              )}
              {txs.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3 border-b border-oda-charcoal/4 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'EARN' || tx.type === 'BONUS' ? 'bg-oda-mint' : 'bg-red-50'}`}>
                    <Star size={14} className={tx.type === 'EARN' || tx.type === 'BONUS' ? 'text-oda-green' : 'text-red-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-oda-charcoal font-plus-jakarta truncate">{tx.description}</p>
                    <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                      {new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold font-plus-jakarta ${tx.type === 'EARN' || tx.type === 'BONUS' ? 'text-oda-green' : 'text-red-500'}`}>
                    {tx.type === 'EARN' || tx.type === 'BONUS' ? '+' : '-'}{tx.points.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
