'use client';

import { Package, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const queueOrders = [
  { id: 'ORD-2001', customer: 'Fatuma Osman', items: 4, total: 'KES 3,200', status: 'PLACED', waitMins: 3 },
  { id: 'ORD-2002', customer: 'George Mwaka', items: 2, total: 'KES 1,400', status: 'BEING_PREPARED', waitMins: 8 },
  { id: 'ORD-2003', customer: 'Hannah Chebet', items: 6, total: 'KES 5,600', status: 'READY_FOR_PICKUP', waitMins: 15 },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PLACED: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
  BEING_PREPARED: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  READY_FOR_PICKUP: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

export default function SupplierPortalPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Branch Queue</h1>
        <p className="text-sm text-[#666] mt-1 font-plus-jakarta">Westlands Branch · 3 active orders</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New Orders', value: '1', color: 'text-blue-600' },
          { label: 'Preparing', value: '1', color: 'text-yellow-600' },
          { label: 'Ready', value: '1', color: 'text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#E8E8E0] text-center">
            <p className={`text-3xl font-extrabold font-plus-jakarta ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#666] mt-1 font-plus-jakarta">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {queueOrders.map((order) => {
          const config = statusConfig[order.status];
          const Icon = config.icon;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">{order.id}</span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full font-plus-jakarta ${config.color}`}>
                      <Icon size={11} />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#666] mt-0.5 font-plus-jakarta">
                    {order.customer} · {order.items} items · {order.total}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#999] font-plus-jakarta">{order.waitMins}m ago</p>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === 'PLACED' && (
                  <button className="flex-1 bg-[#198A2E] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors">
                    Accept & Start Preparing
                  </button>
                )}
                {order.status === 'BEING_PREPARED' && (
                  <button className="flex-1 bg-[#F8C915] text-[#1A1A1A] py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#e6b914] transition-colors">
                    Mark Ready for Pickup
                  </button>
                )}
                {order.status === 'READY_FOR_PICKUP' && (
                  <div className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta text-center">
                    Awaiting Rider
                  </div>
                )}
                <button className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center hover:bg-[#E8E8E0] transition-colors">
                  <ArrowRight size={16} className="text-[#666]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
