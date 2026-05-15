'use client';

import { ArrowDownLeft, ArrowUpRight, Plus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const transactions = [
  { type: 'credit', label: 'Order Refund · ORD-0980', amount: '+KES 230', date: 'May 5, 2026' },
  { type: 'debit', label: 'Order Payment · ORD-0992', amount: '-KES 1,240', date: 'May 4, 2026' },
  { type: 'credit', label: 'Wallet Top-up', amount: '+KES 1,000', date: 'May 3, 2026' },
  { type: 'debit', label: 'Order Payment · ORD-0988', amount: '-KES 650', date: 'May 2, 2026' },
];

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-4 flex items-center gap-3">
        <Link href="/account"><ChevronLeft size={20} className="text-[#666]" /></Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A] font-plus-jakarta">Oda Wallet</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Balance Card */}
        <div className="bg-[#198A2E] rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
          <p className="text-white/70 text-sm font-plus-jakarta mb-2">Available Balance</p>
          <p className="text-4xl font-extrabold text-white font-plus-jakarta mb-6">KES 500</p>
          <div className="flex gap-3">
            <button className="flex-1 bg-white text-[#198A2E] py-3 rounded-xl font-extrabold font-plus-jakarta text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
              <Plus size={16} /> Top Up
            </button>
          </div>
        </div>

        {/* Transactions */}
        <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-3">Transactions</h2>
        <div className="space-y-2">
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-[#E8E8E0] p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-[#EBF9EE]' : 'bg-red-50'}`}>
                {tx.type === 'credit'
                  ? <ArrowDownLeft size={18} className="text-[#198A2E]" />
                  : <ArrowUpRight size={18} className="text-red-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{tx.label}</p>
                <p className="text-xs text-[#999] font-plus-jakarta">{tx.date}</p>
              </div>
              <p className={`text-sm font-extrabold font-plus-jakarta ${tx.type === 'credit' ? 'text-[#198A2E]' : 'text-[#1A1A1A]'}`}>{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
