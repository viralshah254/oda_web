'use client';

import { useState } from 'react';
import { Package, CheckCircle, XCircle, Eye } from 'lucide-react';

const returns = [
  { id: 'RET-001', orderId: 'ORD-0992', customer: 'Amina W.', issue: 'Wrong item received', items: 2, valueKes: 380, status: 'PENDING_REVIEW', evidence: true, time: '2 hours ago' },
  { id: 'RET-002', orderId: 'ORD-0985', customer: 'Brian O.', issue: 'Damaged product', items: 1, valueKes: 220, status: 'APPROVED', evidence: true, time: '5 hours ago' },
  { id: 'RET-003', orderId: 'ORD-0978', customer: 'Catherine N.', issue: 'Missing item', items: 1, valueKes: 95, status: 'REFUNDED', evidence: false, time: '1 day ago' },
  { id: 'RET-004', orderId: 'ORD-0971', customer: 'David M.', issue: 'Expired product', items: 3, valueKes: 450, status: 'PENDING_REVIEW', evidence: true, time: '1 day ago' },
];

const statusConfig: Record<string, string> = {
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REFUNDED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function AdminReturnsPage() {
  const [selected, setSelected] = useState<typeof returns[0] | null>(null);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Returns & Refunds</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending Review', value: returns.filter((r) => r.status === 'PENDING_REVIEW').length, color: 'text-yellow-600' },
            { label: 'Approved', value: returns.filter((r) => r.status === 'APPROVED').length, color: 'text-blue-600' },
            { label: 'Refunded Today', value: 3, color: 'text-green-600' },
            { label: 'Total Value (KES)', value: returns.reduce((s, r) => s + r.valueKes, 0).toLocaleString(), color: 'text-[#1A1A1A]' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-4">
              <p className="text-xs text-[#999] font-plus-jakarta mb-1">{s.label}</p>
              <p className={`text-xl font-extrabold font-plus-jakarta ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Return ID', 'Order', 'Customer', 'Issue', 'Value', 'Status', 'Evidence', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-4 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6] cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-4 py-3 text-xs font-bold text-[#999] font-mono">{r.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#198A2E] font-plus-jakarta">{r.orderId}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{r.customer}</td>
                  <td className="px-4 py-3 text-sm text-[#666] font-plus-jakarta">{r.issue}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {r.valueKes}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${statusConfig[r.status]}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.evidence ? <Eye size={14} className="text-[#198A2E]" /> : <XCircle size={14} className="text-[#CCC]" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#999] font-plus-jakarta">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-80 border-l border-[#E8E8E0] p-5 bg-white overflow-y-auto">
          <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">{selected.id}</h3>
          <div className="space-y-2 mb-5">
            {[
              ['Order', selected.orderId],
              ['Customer', selected.customer],
              ['Issue', selected.issue],
              ['Items', selected.items.toString()],
              ['Value', `KES ${selected.valueKes}`],
              ['Status', selected.status.replace(/_/g, ' ')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-plus-jakarta">
                <span className="text-[#999]">{k}</span>
                <span className="font-semibold text-[#1A1A1A]">{v}</span>
              </div>
            ))}
          </div>
          {selected.status === 'PENDING_REVIEW' && (
            <div className="space-y-2">
              <button className="w-full bg-[#198A2E] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2 hover:bg-[#166b24]">
                <CheckCircle size={14} /> Approve Refund
              </button>
              <button className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2">
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
