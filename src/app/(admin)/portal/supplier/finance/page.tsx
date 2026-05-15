'use client';

import { useState } from 'react';
import { Download, CheckCircle } from 'lucide-react';

const settlements = [
  { id: 'STL-001', period: 'Apr 1–15, 2026', orders: 312, grossKes: 485000, deductionsKes: 12000, netKes: 473000, status: 'PAID', paidOn: '2026-04-18' },
  { id: 'STL-002', period: 'Apr 16–30, 2026', orders: 287, grossKes: 421000, deductionsKes: 8500, netKes: 412500, status: 'PROCESSING', paidOn: null },
  { id: 'STL-003', period: 'May 1–15, 2026', orders: 198, grossKes: 310000, deductionsKes: 6200, netKes: 303800, status: 'PENDING', paidOn: null },
];

export default function SupplierFinancePage() {
  const [activeTab, setActiveTab] = useState<'settlements' | 'payables' | 'returns'>('settlements');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Finance</h1>
        <button className="flex items-center gap-2 text-sm font-bold text-[#198A2E] font-plus-jakarta bg-[#EBF9EE] px-4 py-2 rounded-xl hover:bg-[#D4F0DB]">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Settled (MTD)', value: 'KES 473,000', color: 'text-[#198A2E]' },
          { label: 'Pending Settlement', value: 'KES 303,800', color: 'text-orange-600' },
          { label: 'Returns Deductions', value: 'KES 6,200', color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <p className="text-xs text-[#999] font-plus-jakarta mb-2">{s.label}</p>
            <p className={`text-xl font-extrabold font-plus-jakarta ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(['settlements', 'payables', 'returns'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta capitalize ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'settlements' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Period', 'Orders', 'Gross', 'Deductions', 'Net', 'Status', 'Paid On'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6]">
                  <td className="px-5 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{s.period}</td>
                  <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{s.orders}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">KES {s.grossKes.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-red-600 font-plus-jakarta">-KES {s.deductionsKes.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm font-bold text-[#198A2E] font-plus-jakarta">KES {s.netKes.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${
                        s.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : s.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#999] font-plus-jakarta">{s.paidOn ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab !== 'settlements' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-8 text-center">
          <CheckCircle size={32} className="text-[#198A2E] mx-auto mb-3" />
          <p className="text-sm font-bold font-plus-jakarta text-[#1A1A1A]">All up to date</p>
          <p className="text-xs text-[#999] font-plus-jakarta mt-1">No outstanding {activeTab}</p>
        </div>
      )}
    </div>
  );
}
