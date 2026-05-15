'use client';

import { useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

const statuses = ['ALL', 'PLACED', 'CONFIRMED', 'BEING_PREPARED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const statusColor: Record<string, string> = {
  PLACED: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  BEING_PREPARED: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const orders = Array.from({ length: 15 }, (_, i) => ({
  id: `ORD-${1000 + i}`,
  customer: ['Amina Wanjiku', 'Brian Otieno', 'Catherine Njeri', 'David Kipchoge', 'Eva Muthoni'][i % 5],
  phone: '+254 7XX XXX XXX',
  status: statuses[1 + (i % (statuses.length - 1))] as string,
  totalKes: (800 + i * 350) * 100,
  branch: ['Westlands', 'Kilimani', 'Karen', 'CBD', 'Ruaka'][i % 5],
  rider: i % 3 === 0 ? 'James Mwangi' : null,
  createdAt: new Date(Date.now() - i * 7 * 60 * 1000),
}));

export default function AdminOrdersPage() {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = orders.filter((o) => {
    if (activeStatus !== 'ALL' && o.status !== activeStatus) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Orders</h1>
        <button className="flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] font-plus-jakarta">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold font-plus-jakarta transition-colors ${
              activeStatus === s
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-[#666] border border-[#E8E8E0] hover:border-[#1A1A1A]'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or customer..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E8E0] bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['Order ID', 'Customer', 'Branch', 'Rider', 'Status', 'Total', 'Time'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E0]">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-[#F9F9F6] cursor-pointer">
                <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{order.id}</td>
                <td className="px-5 py-3 text-sm text-[#1A1A1A] font-plus-jakarta">{order.customer}</td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{order.branch}</td>
                <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{order.rider ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {(order.totalKes / 100).toLocaleString()}</td>
                <td className="px-5 py-3 text-xs text-[#999] font-plus-jakarta">
                  {order.createdAt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#999] font-plus-jakarta">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
