'use client';

import { useState } from 'react';
import { Search, Users } from 'lucide-react';

const customers = Array.from({ length: 10 }, (_, i) => ({
  id: `CUST-${1000 + i}`,
  name: ['Amina Wanjiku', 'Brian Otieno', 'Catherine Njeri', 'David Mwangi', 'Eva Akinyi', 'Frank Kipchoge', 'Grace Mutua', 'Hassan Osman', 'Irene Waweru', 'James Kamau'][i],
  phone: `+254 712 ${String(100000 + i * 1111).slice(0, 6)}`,
  tier: ['BRONZE', 'SILVER', 'GOLD', 'BRONZE', 'SILVER', 'BRONZE', 'BRONZE', 'SILVER', 'BRONZE', 'GOLD'][i] as string,
  totalOrders: 3 + i * 2,
  totalSpendKes: (800 + i * 450) * 100,
  lastOrderDate: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE'),
  status: i === 3 ? 'SUSPENDED' : 'ACTIVE',
}));

const tierColor: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-gray-100 text-gray-700',
  GOLD: 'bg-yellow-100 text-yellow-700',
};

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.id.includes(search)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Customers</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="bg-white border border-[#E8E8E0] rounded-xl pl-9 pr-4 py-2 text-sm font-plus-jakarta outline-none w-60"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: customers.length.toLocaleString(), icon: Users },
          { label: 'Active Today', value: '8', icon: Users },
          { label: 'New This Week', value: '3', icon: Users },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-4">
            <p className="text-xs text-[#999] font-plus-jakarta mb-1">{s.label}</p>
            <p className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['ID', 'Name', 'Phone', 'Tier', 'Orders', 'Total Spend', 'Last Order', 'Status'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-4 py-3 font-plus-jakarta">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6] cursor-pointer">
                <td className="px-4 py-3 text-xs font-bold text-[#999] font-mono">{c.id}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{c.name}</td>
                <td className="px-4 py-3 text-sm text-[#666] font-plus-jakarta">{c.phone}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${tierColor[c.tier]}`}>{c.tier}</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{c.totalOrders}</td>
                <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {(c.totalSpendKes / 100).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-[#999] font-plus-jakarta">{c.lastOrderDate}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
