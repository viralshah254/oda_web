'use client';

import { BarChart3, Eye, ShoppingBag, DollarSign } from 'lucide-react';

export default function ManufacturerPortalPage() {
  const stats = [
    { label: 'Active Campaigns', value: '3', icon: BarChart3, change: '+1', color: 'bg-[#198A2E]' },
    { label: 'Impressions (7d)', value: '48,200', icon: Eye, change: '+12%', color: 'bg-[#1565C0]' },
    { label: 'Orders Influenced', value: '142', icon: ShoppingBag, change: '+18%', color: 'bg-[#E65100]' },
    { label: 'Ad Spend (KES)', value: '24,500', icon: DollarSign, change: 'This month', color: 'bg-[#AD1457]' },
  ];

  const campaigns = [
    { name: 'Brookside June Promo', brand: 'Brookside', status: 'ACTIVE', impressions: 12400, spend: 8200 },
    { name: 'Bidco Flash Deal', brand: 'Bidco', status: 'ACTIVE', impressions: 9800, spend: 6100 },
    { name: 'Ketepa Tea Launch', brand: 'Ketepa', status: 'PENDING_APPROVAL', impressions: 0, spend: 0 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8">Manufacturer Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E8E8E0]">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={18} className="text-white" />
              </div>
              <span className="text-xs text-[#666] font-plus-jakarta">{s.change}</span>
            </div>
            <p className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{s.value}</p>
            <p className="text-xs text-[#666] mt-1 font-plus-jakarta">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E8E0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">Campaigns</h2>
          <button type="button" className="text-sm font-semibold text-[#198A2E] font-plus-jakarta">
            + New Campaign
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['Campaign', 'Brand', 'Status', 'Impressions', 'Spend (KES)'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E0]">
            {campaigns.map((c) => (
              <tr key={c.name} className="hover:bg-[#F9F9F6]">
                <td className="px-5 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{c.name}</td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{c.brand}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${
                      c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{c.impressions.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{c.spend.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
