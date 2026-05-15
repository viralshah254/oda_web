'use client';

import { Package } from 'lucide-react';

const manufacturers = [
  { id: 'MFG-001', name: 'Unga Group PLC', brands: ['Jogoo', 'Pembe', 'Starehe'], activeCampaigns: 2, totalSpendKes: 480000, products: 34, status: 'ACTIVE' },
  { id: 'MFG-002', name: 'Bidco Africa', brands: ['Elianto', 'Salit', 'Olympic'], activeCampaigns: 1, totalSpendKes: 320000, products: 28, status: 'ACTIVE' },
  { id: 'MFG-003', name: 'Procter & Gamble Kenya', brands: ['Ariel', 'Pampers', 'Always'], activeCampaigns: 3, totalSpendKes: 750000, products: 52, status: 'ACTIVE' },
  { id: 'MFG-004', name: 'Coca-Cola Kenya', brands: ['Coca-Cola', 'Fanta', 'Sprite', 'Dasani'], activeCampaigns: 0, totalSpendKes: 0, products: 18, status: 'INACTIVE' },
];

export default function AdminManufacturersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Manufacturers & Brands</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Manufacturers', value: manufacturers.filter((m) => m.status === 'ACTIVE').length },
          { label: 'Active Campaigns', value: manufacturers.reduce((s, m) => s + m.activeCampaigns, 0) },
          { label: 'Total Ad Spend (MTD)', value: `KES ${manufacturers.reduce((s, m) => s + m.totalSpendKes, 0).toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <p className="text-xs text-[#999] font-plus-jakarta mb-1">{s.label}</p>
            <p className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['Manufacturer', 'Brands', 'Products', 'Active Campaigns', 'MTD Spend', 'Status', ''].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manufacturers.map((m) => (
              <tr key={m.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F0FF] flex items-center justify-center">
                      <Package size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{m.name}</p>
                      <p className="text-xs text-[#999] font-mono">{m.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {m.brands.slice(0, 2).map((b) => (
                      <span key={b} className="text-xs bg-[#F5F5F0] text-[#666] px-2 py-0.5 rounded-lg font-plus-jakarta">{b}</span>
                    ))}
                    {m.brands.length > 2 && <span className="text-xs text-[#999] font-plus-jakarta">+{m.brands.length - 2}</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{m.products}</td>
                <td className="px-5 py-3 text-sm font-bold text-[#198A2E] font-plus-jakarta">{m.activeCampaigns}</td>
                <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{m.totalSpendKes > 0 ? `KES ${m.totalSpendKes.toLocaleString()}` : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.status}
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
