'use client';

import { Plus, Tag, Percent } from 'lucide-react';

const promotions = [
  { id: 'promo_1', name: 'First Order Free Delivery', type: 'FIRST_ORDER', discount: 'Free delivery', uses: 120, budget: 'KES 12,000', status: 'ACTIVE' },
  { id: 'promo_2', name: 'Brookside 20% Off', type: 'PERCENTAGE', discount: '20% off', uses: 340, budget: 'KES 8,500', status: 'ACTIVE' },
  { id: 'promo_3', name: 'Ramadhan Bundle Deal', type: 'BUNDLE', discount: 'Bundle', uses: 89, budget: 'KES 5,000', status: 'ENDED' },
];

export default function AdminPromotionsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Promotions</h1>
        <button className="flex items-center gap-2 bg-[#198A2E] text-white px-4 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors">
          <Plus size={16} /> New Promotion
        </button>
      </div>

      <div className="grid gap-4">
        {promotions.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#E8E8E0] p-5 flex items-center gap-5">
            <div className="w-12 h-12 bg-[#FFF8DC] rounded-xl flex items-center justify-center shrink-0">
              {p.type === 'PERCENTAGE' ? <Percent size={20} className="text-[#F8C915]" /> : <Tag size={20} className="text-[#F8C915]" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{p.name}</p>
              <p className="text-xs text-[#666] mt-0.5 font-plus-jakarta">{p.type} · {p.discount} · {p.uses} uses · Budget {p.budget}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta ${
              p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
