'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronRight, Smartphone, Wallet, Tag, Shield, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { checkoutApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/stores/cart.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatKES } from '@/lib/utils';

type Step = 'address' | 'payment' | 'review' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotalKes, deliveryFeeKes, totalKes, clear } = useCartStore();

  const [step, setStep] = useState<Step>('address');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'wallet'>('mpesa');
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=/checkout`);
    }
  }, [isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await checkoutApi.placeOrder({
        paymentMethod: paymentMethod.toUpperCase(),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      const orderId = res.data?.id ?? res.data?.orderId ?? 'unknown';
      setPlacedOrderId(orderId);
      clear();
      setStep('success');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E8E8E0] p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#EBF9EE] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-[#198A2E]" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">Order Placed!</h1>
          <p className="text-[#666] font-plus-jakarta mb-2">
            {placedOrderId ? `Order #${placedOrderId.substring(0, 8).toUpperCase()} is confirmed` : 'Your order is confirmed'}
          </p>
          <p className="text-sm text-[#198A2E] font-semibold font-plus-jakarta mb-8">Estimated delivery in ~30 minutes</p>
          <Link
            href={placedOrderId ? `/orders/${placedOrderId}` : '/orders'}
            className="block w-full bg-[#198A2E] text-white py-3.5 rounded-xl font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="block w-full mt-3 bg-[#F5F5F0] text-[#1A1A1A] py-3.5 rounded-xl font-bold font-plus-jakarta hover:bg-[#E8E8E0] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-sm text-[#666] font-plus-jakarta">← Cart</Link>
          <h1 className="text-lg font-extrabold text-[#1A1A1A] font-plus-jakarta">Checkout</h1>
          <div />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-4">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
            <div className="flex items-center gap-3 p-5 cursor-pointer" onClick={() => setStep('address')}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-plus-jakarta ${step === 'address' ? 'bg-[#198A2E] text-white' : 'bg-[#EBF9EE] text-[#198A2E]'}`}>
                {step === 'address' ? '1' : '✓'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Delivery Address</p>
                <p className="text-xs text-[#999] font-plus-jakarta">Westlands, Nairobi</p>
              </div>
              <ChevronDown size={16} className="text-[#999]" />
            </div>
            {step === 'address' && (
              <div className="px-5 pb-5 border-t border-[#E8E8E0]">
                <div className="mt-4 p-4 bg-[#F5F5F0] rounded-xl flex items-start gap-3 cursor-pointer border-2 border-[#198A2E]">
                  <MapPin size={18} className="text-[#198A2E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Home</p>
                    <p className="text-xs text-[#666] font-plus-jakarta mt-0.5">14 Mpaka Road, Westlands, Nairobi</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="mt-4 w-full bg-[#198A2E] text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
            <div className="flex items-center gap-3 p-5 cursor-pointer" onClick={() => step !== 'address' && setStep('payment')}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-plus-jakarta ${step === 'payment' ? 'bg-[#198A2E] text-white' : step === 'review' ? 'bg-[#EBF9EE] text-[#198A2E]' : 'bg-[#F5F5F0] text-[#999]'}`}>
                {step === 'review' ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Payment</p>
                <p className="text-xs text-[#999] font-plus-jakarta">{paymentMethod === 'mpesa' ? 'M-Pesa STK Push' : 'Oda Wallet'}</p>
              </div>
              <ChevronDown size={16} className="text-[#999]" />
            </div>
            {step === 'payment' && (
              <div className="px-5 pb-5 border-t border-[#E8E8E0]">
                <div className="mt-4 space-y-3">
                  {[
                    { id: 'mpesa', icon: Smartphone, label: 'M-Pesa', sub: '+254 7XX XXX XXX' },
                    { id: 'wallet', icon: Wallet, label: 'Oda Wallet', sub: 'Balance: KES 500' },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as 'mpesa' | 'wallet')}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-colors ${
                        paymentMethod === method.id ? 'border-[#198A2E] bg-[#EBF9EE]' : 'border-[#E8E8E0] bg-[#F5F5F0]'
                      }`}
                    >
                      <method.icon size={20} className={paymentMethod === method.id ? 'text-[#198A2E]' : 'text-[#666]'} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{method.label}</p>
                        <p className="text-xs text-[#666] font-plus-jakarta">{method.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-[#198A2E]' : 'border-[#999]'}`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#198A2E] rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('review')}
                  className="mt-4 w-full bg-[#198A2E] text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors"
                >
                  Review Order
                </button>
              </div>
            )}
          </div>

          {/* Review */}
          {(step === 'review') && (
            <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
              <h3 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Review & Place Order</h3>
              <div className="space-y-3 mb-4">
                {[{ name: 'Brookside UHT Milk 1L', qty: 2, price: 460 }, { name: 'Ketepa Pride Tea 100g', qty: 1, price: 190 }].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#1A1A1A] font-plus-jakarta">{item.name}</p>
                      <p className="text-xs text-[#999] font-plus-jakarta">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {item.price}</p>
                  </div>
                ))}
              </div>
              {/* Promo */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E8E0] text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20"
                  />
                </div>
                <button className="px-4 py-2.5 bg-[#F5F5F0] rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#E8E8E0] transition-colors">Apply</button>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-plus-jakarta">
                  {error}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-[#198A2E] text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield size={16} />
                    {paymentMethod === 'mpesa' ? `Send M-Pesa Prompt · ${formatKES(totalKes)}` : `Pay from Wallet · ${formatKES(totalKes)}`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5 h-fit lg:sticky lg:top-4">
          <h3 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Order Summary</h3>
          <div className="space-y-2.5 text-sm font-plus-jakarta">
            <div className="flex justify-between text-[#444]"><span>Subtotal (3 items)</span><span className="font-semibold">KES 650</span></div>
            <div className="flex justify-between text-[#444]"><span>Delivery fee</span><span className="font-semibold text-[#198A2E]">FREE</span></div>
            <div className="flex justify-between text-[#444]"><span>VAT (16%)</span><span className="font-semibold">KES 104</span></div>
            <div className="flex justify-between pt-2 border-t border-[#E8E8E0] font-extrabold text-[#1A1A1A] text-base">
              <span>Total</span><span>KES 754</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-[#EBF9EE] rounded-xl flex items-center gap-2">
            <Shield size={14} className="text-[#198A2E] shrink-0" />
            <p className="text-xs text-[#198A2E] font-semibold font-plus-jakarta">Secure checkout. 100% genuine products.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
