'use client';

import { useState } from 'react';

const orders = [
  { id: 'ORD-1001', customer: 'Amina W.', branch: 'Westlands', status: 'BRANCH_ACCEPTED', paymentStatus: 'CONFIRMED', totalKes: 1850, time: '8 min ago', eta: 28 },
  { id: 'ORD-1002', customer: 'Brian O.', branch: 'Kilimani', status: 'RIDER_ASSIGNED', paymentStatus: 'CONFIRMED', totalKes: 2200, time: '15 min ago', eta: 18 },
  { id: 'ORD-1003', customer: 'Catherine N.', branch: 'Westlands', status: 'PLACED', paymentStatus: 'PENDING', totalKes: 950, time: '2 min ago', eta: null },
  { id: 'ORD-1004', customer: 'David M.', branch: 'CBD', status: 'IN_TRANSIT', paymentStatus: 'CONFIRMED', totalKes: 3200, time: '35 min ago', eta: 5 },
  { id: 'ORD-1005', customer: 'Eva A.', branch: 'Kilimani', status: 'PACKING', paymentStatus: 'CONFIRMED', totalKes: 1100, time: '22 min ago', eta: 25 },
];

const statusColor: Record<string, string> = {
  PLACED: 'bg-gray-100 text-gray-600',
  PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-700',
  BRANCH_ACCEPTED: 'bg-yellow-100 text-yellow-700',
  PICKING: 'bg-orange-100 text-orange-700',
  PACKING: 'bg-orange-100 text-orange-700',
  RIDER_ASSIGNED: 'bg-purple-100 text-purple-700',
  IN_TRANSIT: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-green-200 text-green-800',
};

export default function OrderCommandPage() {
  const [view, setView] = useState<'kanban' | 'table'>('table');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Order Command Center</h1>
        <div className="flex gap-2">
          {(['table', 'kanban'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta capitalize ${view === v ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Order', 'Customer', 'Branch', 'Status', 'Payment', 'Total', 'ETA', 'Time'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-4 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6] cursor-pointer">
                  <td className="px-4 py-3 text-sm font-bold text-[#198A2E] font-plus-jakarta">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{o.customer}</td>
                  <td className="px-4 py-3 text-xs text-[#999] font-plus-jakarta">{o.branch}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${statusColor[o.status]}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${o.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {o.totalKes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-[#666] font-plus-jakarta">{o.eta ? `~${o.eta} min` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#999] font-plus-jakarta">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 overflow-x-auto">
          {['Placed', 'Accepted', 'Dispatched', 'In Transit'].map((stage) => (
            <div key={stage} className="bg-[#F5F5F0] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#999] font-plus-jakarta mb-3">{stage}</p>
              {orders.slice(0, 2).map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-[#E8E8E0] p-3 mb-2">
                  <p className="text-xs font-bold text-[#198A2E] font-plus-jakarta">{o.id}</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{o.customer}</p>
                  <p className="text-xs text-[#999] font-plus-jakarta">KES {o.totalKes.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
