'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, CheckCircle, Clock, Truck, MapPin, Loader2 } from 'lucide-react';
import { ordersApi } from '@/lib/api-client';
import { formatKES } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'PAYMENT_PENDING', label: 'Payment', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: Package },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

function getStatusIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    ordersApi.getOrder(id as string)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Could not load order.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <Loader2 size={32} className="text-oda-green animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-5xl mb-4">📦</p>
          <h1 className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">Order not found</h1>
          <Link href="/orders" className="text-oda-green font-bold font-plus-jakarta underline">Back to orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <Link href="/orders" className="flex items-center gap-1 text-sm text-[#666] font-plus-jakarta hover:text-oda-green">
          <ChevronLeft size={16} /> My Orders
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Order header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-[#999] font-plus-jakarta">Order ID</p>
              <p className="text-base font-bold text-oda-charcoal font-plus-jakarta">#{order.id?.substring(0, 8).toUpperCase()}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-[#666] font-plus-jakarta">
            Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : ''}
          </p>
        </div>

        {/* Status timeline */}
        {!['CANCELLED', 'PAYMENT_FAILED', 'FAILED'].includes(order.status) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-4">Order Progress</h2>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.filter((_, i) => i <= 4).map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-oda-green' : 'bg-oda-ivory'} ${active ? 'ring-2 ring-[#198A2E] ring-offset-2' : ''}`}>
                      <Icon size={16} className={done ? 'text-white' : 'text-[#999]'} />
                    </div>
                    <p className={`text-[10px] font-plus-jakarta text-center ${done ? 'text-oda-green font-bold' : 'text-[#999]'}`}>{step.label}</p>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 w-full mt-4 absolute ${done ? 'bg-oda-green' : 'bg-gray-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order.deliveryAddress && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-oda-green" />
              <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta">Delivery Address</h2>
            </div>
            <p className="text-sm text-[#444] font-plus-jakarta">
              {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city ?? 'Nairobi'}
            </p>
          </div>
        )}

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-3">Items</h2>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-oda-charcoal font-plus-jakarta line-clamp-1">{item.product?.name ?? item.productName ?? 'Item'}</p>
                    <p className="text-xs text-[#999] font-plus-jakarta">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta ml-4">{formatKES(item.totalPriceKes ?? item.unitPriceKes * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-3">Summary</h2>
          <div className="space-y-2">
            {order.deliveryFeeKes !== undefined && (
              <div className="flex justify-between text-sm font-plus-jakarta text-[#666]">
                <span>Delivery fee</span>
                <span>{order.deliveryFeeKes === 0 ? 'FREE' : formatKES(order.deliveryFeeKes)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold font-plus-jakarta text-oda-charcoal pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatKES(order.totalAmountKes)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    PAYMENT_PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    CONFIRMED: { bg: 'bg-oda-mint', text: 'text-oda-green', label: 'Confirmed' },
    PREPARING: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Preparing' },
    OUT_FOR_DELIVERY: { bg: 'bg-oda-mint', text: 'text-oda-green', label: 'On the way' },
    DELIVERED: { bg: 'bg-oda-mint', text: 'text-oda-green', label: 'Delivered' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    PAYMENT_FAILED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
  };
  const config = configs[status] ?? { bg: 'bg-oda-ivory', text: 'text-[#666]', label: status };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
