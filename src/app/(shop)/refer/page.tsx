'use client';

import React, { useEffect, useState } from 'react';

interface ReferralStats {
  code: string | null;
  inviteLink: string | null;
  totalInvited: number;
  totalRewarded: number;
  totalEarnedKsh: number;
  referrals: Array<{
    name: string;
    status: string;
    joinedAt?: string;
    rewardedAt?: string;
  }>;
}

const PLACEHOLDER_STATS: ReferralStats = {
  code: 'ODA8XYZQ',
  inviteLink: 'https://oda.co.ke/refer/ODA8XYZQ',
  totalInvited: 4,
  totalRewarded: 2,
  totalEarnedKsh: 400,
  referrals: [
    { name: 'Alice W.', status: 'REWARDED', joinedAt: '2026-04-10', rewardedAt: '2026-04-12' },
    { name: 'Brian O.', status: 'REWARDED', joinedAt: '2026-04-15', rewardedAt: '2026-04-17' },
    { name: 'Carol M.', status: 'PENDING', joinedAt: '2026-04-28' },
    { name: 'David K.', status: 'PENDING', joinedAt: '2026-05-01' },
  ],
};

export default function ReferPage() {
  const [stats, setStats] = useState<ReferralStats>(PLACEHOLDER_STATS);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!stats.inviteLink) return;
    await navigator.clipboard.writeText(stats.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Join Oda for groceries delivered in 30 min! Use my link: ${stats.inviteLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function handleSMS() {
    const body = encodeURIComponent(
      `Get groceries in 30 min on Oda. Use my invite link: ${stats.inviteLink}`,
    );
    window.open(`sms:?&body=${body}`, '_blank');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-2xl font-bold text-gray-900">Invite friends, earn KSh 200</h1>
          <p className="text-gray-500 mt-2 text-sm">
            For every friend who completes their first Oda order, you get KSh 200 in your wallet.
          </p>
        </div>

        {/* Referral code card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Your referral link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <span className="flex-1 text-sm font-mono text-gray-800 break-all">
              {stats.inviteLink ?? 'Loading...'}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 transition-opacity"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleSMS}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 transition-opacity"
            >
              <span>Send SMS</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Friends invited', value: stats.totalInvited },
            { label: 'Orders placed', value: stats.totalRewarded },
            { label: 'Earned', value: `KSh ${stats.totalEarnedKsh}` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center"
            >
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Referral list */}
        {stats.referrals.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">Your referrals</p>
            </div>
            <ul className="divide-y divide-gray-50">
              {stats.referrals.map((r, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      Joined {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString('en-KE') : '—'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'REWARDED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {r.status === 'REWARDED' ? '✓ KSh 200 earned' : 'Pending order'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">How it works</p>
          <ol className="space-y-2 text-sm text-gray-600 list-none">
            {[
              'Share your unique link with a friend',
              'Friend signs up and places their first order',
              'You earn KSh 200 in your Oda wallet instantly',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
