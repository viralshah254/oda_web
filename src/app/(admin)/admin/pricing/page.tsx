'use client';

import { useState } from 'react';
import { TrendingUp, AlertCircle, Edit3 } from 'lucide-react';

const categories = [
  { name: 'Grocery & Staples', markupPct: 18, marginFloorPct: 8, vatPct: 0, products: 1240 },
  { name: 'Snacks & Drinks', markupPct: 22, marginFloorPct: 10, vatPct: 16, products: 870 },
  { name: 'Beauty & Personal Care', markupPct: 28, marginFloorPct: 15, vatPct: 16, products: 620 },
  { name: 'Household & Cleaning', markupPct: 20, marginFloorPct: 10, vatPct: 16, products: 450 },
  { name: 'Electronics & Gadgets', markupPct: 12, marginFloorPct: 6, vatPct: 16, products: 380 },
  { name: 'B2B Wholesale', markupPct: 8, marginFloorPct: 3, vatPct: 16, products: 890 },
];

const belowMarginApprovals = [
  { id: 'PO-001', product: 'Tusker Lager 6-pack', requestedMarkup: -2, reason: 'Competitor promo match', requestedBy: 'Admin', time: '30 min ago' },
  { id: 'PO-002', product: 'Indomie Noodles x24', requestedMarkup: 4, reason: 'Flash deal campaign', requestedBy: 'Sales', time: '2 hrs ago' },
];

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'approvals' | 'simulation'>('categories');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Pricing Engine</h1>

      <div className="flex gap-2 mb-6">
        {(['categories', 'approvals', 'simulation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta capitalize ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'}`}
          >
            {tab === 'categories' ? 'Category Rules' : tab === 'approvals' ? `Below-Margin (${belowMarginApprovals.length})` : 'Simulation'}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Category', 'Markup %', 'Margin Floor %', 'VAT', 'Products', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.name} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6]">
                  <td className="px-5 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{c.name}</td>
                  <td className="px-5 py-3 text-sm font-bold text-[#198A2E] font-plus-jakarta">{c.markupPct}%</td>
                  <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{c.marginFloorPct}%</td>
                  <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{c.vatPct}%</td>
                  <td className="px-5 py-3 text-sm text-[#999] font-plus-jakarta">{c.products.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-[#198A2E] font-bold font-plus-jakarta flex items-center gap-1 hover:underline">
                      <Edit3 size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {belowMarginApprovals.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-orange-200 border-l-4 border-l-orange-500 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" />
                  <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{req.product}</p>
                </div>
                <span className="text-xs text-[#999] font-plus-jakarta">{req.time}</span>
              </div>
              <p className="text-xs text-[#666] font-plus-jakarta mb-3">Requested markup: <strong>{req.requestedMarkup}%</strong> · Reason: {req.reason}</p>
              <div className="flex gap-2">
                <button className="bg-[#198A2E] text-white px-4 py-1.5 rounded-xl text-xs font-bold font-plus-jakarta">Approve</button>
                <button className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold font-plus-jakarta">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'simulation' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Price Simulation</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Supplier Cost (KES)', placeholder: '0.00' },
              { label: 'Markup %', placeholder: '20' },
              { label: 'VAT %', placeholder: '16' },
              { label: 'Promo Discount %', placeholder: '0' },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-bold text-[#999] font-plus-jakarta block mb-1">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full bg-[#F5F5F0] rounded-xl px-4 py-2.5 text-sm font-plus-jakarta outline-none" />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-[#198A2E] text-white px-6 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] flex items-center gap-2">
            <TrendingUp size={14} /> Simulate Price
          </button>
        </div>
      )}
    </div>
  );
}
