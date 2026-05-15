'use client';

import { Store } from 'lucide-react';

const suppliers = [
  { id: 'SUP-001', name: 'FreshMart Kenya', branches: 3, activeSku: 1240, ordersToday: 45, avgSlaMin: 22, slaCompliance: 97, status: 'ACTIVE' },
  { id: 'SUP-002', name: 'Quick Supplies Ltd', branches: 1, activeSku: 680, ordersToday: 18, avgSlaMin: 27, slaCompliance: 89, status: 'ACTIVE' },
  { id: 'SUP-003', name: 'Nairobi Wholesale Hub', branches: 2, activeSku: 890, ordersToday: 31, avgSlaMin: 31, slaCompliance: 82, status: 'ACTIVE' },
  { id: 'SUP-004', name: 'Savanna Distribution', branches: 1, activeSku: 420, ordersToday: 0, avgSlaMin: 0, slaCompliance: 0, status: 'INACTIVE' },
];

export default function AdminSuppliersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Supplier Tenants</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['Supplier', 'Branches', 'Active SKUs', 'Orders Today', 'Avg SLA (min)', 'SLA Compliance', 'Status', ''].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF9EE] flex items-center justify-center">
                      <Store size={14} className="text-[#198A2E]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{s.name}</p>
                      <p className="text-xs text-[#999] font-mono">{s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{s.branches}</td>
                <td className="px-5 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{s.activeSku.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{s.ordersToday}</td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{s.avgSlaMin > 0 ? `${s.avgSlaMin} min` : '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-[#F5F5F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#198A2E] rounded-full" style={{ width: `${s.slaCompliance}%` }} />
                    </div>
                    <span className={`text-xs font-bold font-plus-jakarta ${s.slaCompliance >= 90 ? 'text-green-600' : s.slaCompliance >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {s.slaCompliance > 0 ? `${s.slaCompliance}%` : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-xs text-[#198A2E] font-bold font-plus-jakarta hover:underline">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
