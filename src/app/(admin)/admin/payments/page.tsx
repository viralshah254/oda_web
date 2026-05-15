'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const transactions = Array.from({ length: 10 }, (_, i) => ({
  id: `TXN-${1000 + i}`,
  orderId: `ORD-${1001 + i}`,
  customer: ['Amina', 'Brian', 'Catherine', 'David', 'Eva'][i % 5],
  method: i % 3 === 0 ? 'WALLET' : 'MPESA',
  amountKes: (500 + i * 200) * 100,
  status: ['CONFIRMED', 'CONFIRMED', 'PENDING', 'CONFIRMED', 'FAILED'][i % 5] as string,
  receipt: i % 3 === 0 ? null : `QJ${(123456 + i).toString().toUpperCase()}`,
  time: new Date(Date.now() - i * 8 * 60 * 1000),
}));

const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-600',
};

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'reconciliation'>('transactions');

  const totalConfirmedKes = transactions.filter((t) => t.status === 'CONFIRMED').reduce((s, t) => s + t.amountKes, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Payments</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Confirmed Today', value: `KES ${(totalConfirmedKes / 100).toLocaleString()}`, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: '2', icon: AlertCircle, color: 'text-yellow-600' },
          { label: 'Failed', value: '1', icon: AlertCircle, color: 'text-red-600' },
          { label: 'M-Pesa Success Rate', value: '97.8%', icon: TrendingUp, color: 'text-[#198A2E]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <p className="text-xs text-[#999] font-plus-jakarta">{s.label}</p>
            </div>
            <p className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['transactions', 'reconciliation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta transition-colors ${
              activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'
            }`}
          >
            {tab === 'transactions' ? 'Transactions' : 'Reconciliation'}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' ? (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Transaction', 'Order', 'Customer', 'Method', 'Amount', 'Status', 'Receipt', 'Time'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-4 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E0]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F9F9F6]">
                  <td className="px-4 py-3 text-xs font-bold text-[#999] font-mono">{tx.id}</td>
                  <td className="px-4 py-3 text-sm text-[#198A2E] font-bold font-plus-jakarta">{tx.orderId}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{tx.customer}</td>
                  <td className="px-4 py-3 text-xs text-[#666] font-plus-jakarta">{tx.method}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {(tx.amountKes / 100).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${statusColor[tx.status]}`}>{tx.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#999] font-mono">{tx.receipt ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#999] font-plus-jakarta">{tx.time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Reconciliation</h2>
          <div className="text-center py-12">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">All transactions reconciled</p>
            <p className="text-xs text-[#999] font-plus-jakarta mt-1">Last run: Today 11:00 AM</p>
          </div>
          <button className="w-full bg-[#198A2E] text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors">
            Run Manual Reconciliation
          </button>
        </div>
      )}
    </div>
  );
}
