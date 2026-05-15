import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';

const orders = [
  { id: 'ORD-1001', date: 'Today, 11:30 AM', status: 'IN_TRANSIT', items: '3 items', total: 'KES 754', etaMin: 12 },
  { id: 'ORD-0998', date: 'Yesterday, 3:15 PM', status: 'DELIVERED', items: '2 items', total: 'KES 420', etaMin: null },
  { id: 'ORD-0992', date: 'May 4, 2026', status: 'DELIVERED', items: '5 items', total: 'KES 1,240', etaMin: null },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  IN_TRANSIT: { label: 'On the way', color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  BEING_PREPARED: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-700' },
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Your Orders</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {orders.map((order) => {
          const config = statusConfig[order.status];
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-[#E8E8E0] p-5 hover:border-[#198A2E]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center">
                    <Package size={18} className="text-[#666]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{order.id}</p>
                    <p className="text-xs text-[#999] font-plus-jakarta">{order.date} · {order.items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta ${config.color}`}>{config.label}</span>
                  <ChevronRight size={16} className="text-[#999]" />
                </div>
              </div>
              {order.etaMin && (
                <div className="mt-3 flex items-center gap-2 bg-[#EBF9EE] rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-[#198A2E] font-plus-jakarta">⚡ Arriving in ~{order.etaMin} minutes</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{order.total}</span>
                {order.status === 'DELIVERED' && (
                  <button className="text-xs font-bold text-[#198A2E] font-plus-jakarta">Reorder</button>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
