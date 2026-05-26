'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Share2, Copy, CheckCircle, Loader2, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

interface ReferralStats {
  code: string;
  referralCount: number;
  totalEarnedKes: number;
  pendingKes: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/referrals');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/growth/referrals');
      setStats(res.data);
    } catch { /* ignore — GrowthModule may not be wired yet */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const handleCopy = () => {
    if (!stats?.code) return;
    navigator.clipboard.writeText(`https://oda.co.ke/r/${stats.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Refer a Friend</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-5">
        {/* Hero */}
        <div className="bg-oda-charcoal rounded-3xl p-6 text-center text-white">
          <div className="w-14 h-14 bg-oda-yellow/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Share2 size={24} className="text-oda-yellow" />
          </div>
          <h2 className="text-xl font-extrabold font-plus-jakarta mb-1">Earn KES 200 per referral</h2>
          <p className="text-white/60 text-sm font-plus-jakarta">
            Share your code. When a friend places their first order, you both get KES 200 in wallet credits.
          </p>
        </div>

        {loading && <div className="flex justify-center py-6"><Loader2 size={24} className="text-oda-green animate-spin" /></div>}

        {!loading && stats && (
          <>
            {/* Referral code */}
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
              <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta mb-2">Your referral code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-oda-ivory border border-oda-charcoal/10 rounded-xl px-4 py-3">
                  <p className="text-xl font-extrabold text-oda-charcoal tracking-widest font-plus-jakarta">
                    {stats.code}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`p-3 rounded-xl transition-colors ${copied ? 'bg-oda-mint text-oda-green' : 'bg-oda-charcoal text-white hover:bg-oda-charcoal/80'}`}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-2">
                Link: https://oda.co.ke/r/{stats.code}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Friends referred', value: stats.referralCount, suffix: '' },
                { label: 'Total earned', value: `KES ${(stats.totalEarnedKes / 100).toLocaleString()}`, suffix: '' },
                { label: 'Pending', value: `KES ${(stats.pendingKes / 100).toLocaleString()}`, suffix: '' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4 text-center">
                  <p className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta">{value}</p>
                  <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !stats && (
          <div className="text-center py-8">
            <Users size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">Referral stats will appear here once available</p>
          </div>
        )}
      </div>
    </div>
  );
}
