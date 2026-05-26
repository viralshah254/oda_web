'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Smartphone, Wallet, Tag, Shield, ChevronDown,
  CheckCircle, Loader2, Plus, Pencil, X,
} from 'lucide-react';
import Link from 'next/link';
import { checkoutApi, addressApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/stores/cart.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { hydrateCartFromServerIfAuthed } from '@/lib/cart-server-sync';
import { formatKES } from '@/lib/utils';
import { AddressLabelPicker } from '@/components/shop/address-label-picker';

type Step = 'address' | 'payment' | 'review' | 'success';

interface Address {
  id: string;
  label?: string | null;
  addressLine1: string;
  city?: string | null;
  isDefault: boolean;
}

interface AddressFormState {
  label: string;
  addressLine1: string;
  city: string;
}

const EMPTY_FORM: AddressFormState = { label: 'Home', addressLine1: '', city: 'Nairobi' };

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: AddressFormState;
  onSave: (d: AddressFormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof AddressFormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1.5">Address type</p>
        <AddressLabelPicker value={form.label} onChange={(v) => set('label', v)} />
      </div>
      <input
        placeholder="Street address *"
        value={form.addressLine1}
        onChange={(e) => set('addressLine1', e.target.value)}
        className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/30 placeholder:text-oda-charcoal/35"
      />
      <input
        placeholder="City"
        value={form.city}
        onChange={(e) => set('city', e.target.value)}
        className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/30 placeholder:text-oda-charcoal/35"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} type="button" className="flex-1 py-2.5 border border-oda-charcoal/15 rounded-xl text-sm font-semibold text-oda-charcoal/60 font-plus-jakarta hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.addressLine1.trim()}
          type="button"
          className="flex-1 py-2.5 bg-oda-green text-white rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-oda-green-dark transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save &amp; select
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotalKes, deliveryFeeKes, totalKes, clear } = useCartStore();

  // Steps
  const [step, setStep] = useState<Step>('address');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'wallet'>('mpesa');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [error, setError] = useState('');

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addrPanel, setAddrPanel] = useState<'add' | string | null>(null); // 'add' | edit-id | null
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/checkout');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) hydrateCartFromServerIfAuthed();
  }, [isAuthenticated]);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await addressApi.list();
      const raw: Address[] = res.data?.addresses ?? res.data?.items ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      setAddresses(list);
      if (!selectedId) {
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedId(def.id);
      }
    } catch {
      /* show empty state */
    } finally {
      setAddrLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (isAuthenticated) loadAddresses();
  }, [isAuthenticated, loadAddresses]);

  const handleAddAddress = async (form: AddressFormState) => {
    setAddrSaving(true);
    try {
      const res = await addressApi.create({ label: form.label, addressLine1: form.addressLine1, city: form.city });
      const newId = res.data?.id;
      await loadAddresses();
      if (newId) setSelectedId(newId);
      setAddrPanel(null);
    } catch {
      /* ignore */
    } finally {
      setAddrSaving(false);
    }
  };

  const handleEditAddress = async (id: string, form: AddressFormState) => {
    setAddrSaving(true);
    try {
      await addressApi.update(id, { label: form.label, addressLine1: form.addressLine1, city: form.city });
      await loadAddresses();
      setAddrPanel(null);
    } catch {
      /* ignore */
    } finally {
      setAddrSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    try {
      const res = await checkoutApi.placeOrder({
        addressId: selectedId,
        paymentMethod: paymentMethod === 'mpesa' ? 'MPESA' : 'WALLET',
        couponCode: promoCode.trim() || undefined,
      });
      const orderId = res.data?.orderId ?? res.data?.id ?? 'unknown';
      setPlacedOrderId(orderId);
      clear();
      setStep('success');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedId);
  const addrSubtitle = selectedAddress
    ? `${selectedAddress.label ?? 'Address'} · ${selectedAddress.addressLine1}${selectedAddress.city ? `, ${selectedAddress.city}` : ''}`
    : addrLoading
    ? 'Loading…'
    : 'Select delivery address';

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-oda-charcoal/8 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-oda-mint rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-oda-green" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">Order Placed!</h1>
          <p className="text-oda-charcoal/60 font-plus-jakarta mb-2">
            {placedOrderId ? `Order #${placedOrderId.substring(0, 8).toUpperCase()} is confirmed` : 'Your order is confirmed'}
          </p>
          <p className="text-sm text-oda-green font-semibold font-plus-jakarta mb-8">
            Estimated delivery in ~30 minutes
          </p>
          <Link
            href={placedOrderId ? `/orders/${placedOrderId}` : '/orders'}
            className="block w-full bg-oda-green text-white py-3.5 rounded-xl font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="block w-full mt-3 bg-oda-ivory text-oda-charcoal py-3.5 rounded-xl font-bold font-plus-jakarta hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout layout ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Header */}
      <div className="bg-white border-b border-oda-charcoal/8 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-sm text-oda-charcoal/60 font-plus-jakarta">← Cart</Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Checkout</h1>
          <div />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── Step 1: Delivery Address ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            <div
              className="flex items-center gap-3 p-5 cursor-pointer"
              onClick={() => setStep('address')}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-plus-jakarta ${step === 'address' ? 'bg-oda-green text-white' : 'bg-oda-mint text-oda-green'}`}>
                {step !== 'address' ? '✓' : '1'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">Delivery Address</p>
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta truncate">{addrSubtitle}</p>
              </div>
              <ChevronDown size={16} className="text-oda-charcoal/40 shrink-0" />
            </div>

            {step === 'address' && (
              <div className="px-5 pb-5 border-t border-oda-charcoal/8 space-y-3 pt-4">
                {addrLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="text-oda-green animate-spin" />
                  </div>
                )}

                {/* No saved addresses — guided full-width prompt */}
                {!addrLoading && addresses.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-oda-green/35 bg-gradient-to-b from-oda-mint/45 to-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md ring-1 ring-oda-charcoal/5">
                        <MapPin className="text-oda-green" size={30} />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <p className="text-base font-extrabold text-oda-charcoal font-plus-jakarta">
                          Add your first delivery address
                        </p>
                        <p className="text-xs text-oda-charcoal/60 font-plus-jakarta leading-relaxed">
                          We&apos;ll bring your order right to your door. Choose an address type —{' '}
                          <span className="font-semibold">Home</span>, <span className="font-semibold">Work</span>, or{' '}
                          <span className="font-semibold">Other</span> to give it any nickname you like (e.g. Mom&apos;s, Gym, Studio).
                        </p>
                      </div>
                    </div>
                    {addrPanel !== 'add' ? (
                      <button
                        type="button"
                        onClick={() => setAddrPanel('add')}
                        className="mt-5 w-full py-3.5 rounded-xl bg-oda-green text-white text-sm font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors shadow-sm"
                      >
                        Add delivery address
                      </button>
                    ) : (
                      <div className="mt-5 bg-oda-ivory border border-oda-green/25 rounded-xl p-4 text-left">
                        <p className="text-xs font-extrabold text-oda-charcoal/60 font-plus-jakarta mb-3">New address</p>
                        <AddressForm
                          initial={EMPTY_FORM}
                          onSave={handleAddAddress}
                          onCancel={() => setAddrPanel(null)}
                          saving={addrSaving}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Saved address cards */}
                {!addrLoading && addresses.length > 0 && addresses.map((addr) => (
                  <div key={addr.id}>
                    <div
                      onClick={() => { setSelectedId(addr.id); setAddrPanel(null); }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition-colors ${
                        selectedId === addr.id
                          ? 'border-oda-green bg-oda-mint/50'
                          : 'border-oda-charcoal/10 bg-oda-ivory hover:border-oda-green/30'
                      }`}
                    >
                      <MapPin
                        size={16}
                        className={`mt-0.5 shrink-0 ${selectedId === addr.id ? 'text-oda-green' : 'text-oda-charcoal/40'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">
                          {addr.label ?? 'Address'}
                          {addr.isDefault && (
                            <span className="ml-1.5 text-[10px] font-bold bg-oda-mint text-oda-green px-1.5 py-0.5 rounded-full align-middle">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-oda-charcoal/55 font-plus-jakarta truncate">
                          {addr.addressLine1}{addr.city ? `, ${addr.city}` : ''}
                        </p>
                      </div>
                      {selectedId === addr.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddrPanel(addrPanel === addr.id ? null : addr.id); }}
                          className="p-1 text-oda-charcoal/40 hover:text-oda-green transition-colors shrink-0"
                        >
                          {addrPanel === addr.id ? <X size={14} /> : <Pencil size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Inline edit for this card */}
                    {addrPanel === addr.id && (
                      <div className="mt-2 bg-oda-ivory border border-oda-charcoal/8 rounded-xl p-4">
                        <AddressForm
                          initial={{ label: addr.label ?? 'Home', addressLine1: addr.addressLine1, city: addr.city ?? 'Nairobi' }}
                          onSave={(form) => handleEditAddress(addr.id, form)}
                          onCancel={() => setAddrPanel(null)}
                          saving={addrSaving}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new address (when user already has at least one) */}
                {!addrLoading && addresses.length > 0 && (
                  addrPanel === 'add' ? (
                    <div className="bg-oda-ivory border border-oda-green/25 rounded-xl p-4">
                      <p className="text-xs font-extrabold text-oda-charcoal/60 font-plus-jakarta mb-3">New address</p>
                      <AddressForm
                        initial={EMPTY_FORM}
                        onSave={handleAddAddress}
                        onCancel={() => setAddrPanel(null)}
                        saving={addrSaving}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddrPanel('add')}
                      className="flex items-center gap-2 text-sm font-semibold text-oda-green font-plus-jakarta hover:underline"
                    >
                      <Plus size={14} /> Add new address
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  disabled={!selectedId}
                  className="w-full bg-oda-green text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green-dark transition-colors disabled:opacity-50 mt-2"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* ── Step 2: Payment ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            <div
              className={`flex items-center gap-3 p-5 ${step !== 'address' ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
              onClick={() => step !== 'address' && setStep('payment')}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-plus-jakarta ${step === 'payment' ? 'bg-oda-green text-white' : step === 'review' ? 'bg-oda-mint text-oda-green' : 'bg-oda-ivory text-oda-charcoal/40'}`}>
                {step === 'review' ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">Payment</p>
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                  {paymentMethod === 'mpesa' ? 'M-Pesa STK Push' : 'Oda Wallet'}
                </p>
              </div>
              <ChevronDown size={16} className="text-oda-charcoal/40" />
            </div>

            {step === 'payment' && (
              <div className="px-5 pb-5 border-t border-oda-charcoal/8">
                <div className="mt-4 space-y-3">
                  {[
                    { id: 'mpesa', icon: Smartphone, label: 'M-Pesa', sub: 'STK prompt to your phone' },
                    { id: 'wallet', icon: Wallet, label: 'Oda Wallet', sub: 'Pay from wallet balance' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as 'mpesa' | 'wallet')}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-colors ${
                        paymentMethod === m.id ? 'border-oda-green bg-oda-mint' : 'border-oda-charcoal/8 bg-oda-ivory'
                      }`}
                    >
                      <m.icon size={20} className={paymentMethod === m.id ? 'text-oda-green' : 'text-oda-charcoal/60'} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{m.label}</p>
                        <p className="text-xs text-oda-charcoal/60 font-plus-jakarta">{m.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-oda-green' : 'border-oda-charcoal/30'}`}>
                        {paymentMethod === m.id && <div className="w-2.5 h-2.5 bg-oda-green rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('review')}
                  className="mt-4 w-full bg-oda-green text-white py-3 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
                >
                  Review Order
                </button>
              </div>
            )}
          </div>

          {/* ── Step 3: Review & Place ───────────────────────────────────── */}
          {step === 'review' && (
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
              <h3 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-4">Review &amp; Place Order</h3>

              {/* Delivery address recap */}
              {selectedAddress && (
                <div className="mb-4 p-3 bg-oda-ivory rounded-xl flex items-start gap-2 text-xs font-plus-jakarta">
                  <MapPin size={13} className="text-oda-green mt-0.5 shrink-0" />
                  <span className="text-oda-charcoal/70">
                    <span className="font-bold text-oda-charcoal">{selectedAddress.label ?? 'Address'}</span>
                    {' — '}
                    {selectedAddress.addressLine1}{selectedAddress.city ? `, ${selectedAddress.city}` : ''}
                  </span>
                </div>
              )}

              {/* Cart items */}
              <div className="space-y-3 mb-4">
                {items.length > 0 ? items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-oda-charcoal font-plus-jakarta">{item.name}</p>
                      <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">
                      {formatKES(item.totalPriceKes)}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-oda-charcoal/50 font-plus-jakarta">No items in cart</p>
                )}
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-oda-charcoal/40" />
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-oda-charcoal/10 bg-white text-sm font-plus-jakarta text-oda-charcoal placeholder:text-oda-charcoal/35 focus:outline-none focus:ring-2 focus:ring-oda-green/20"
                  />
                </div>
                <button className="px-4 py-2.5 bg-oda-ivory rounded-xl text-sm font-bold font-plus-jakarta hover:bg-gray-100 transition-colors">
                  Apply
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-plus-jakarta">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedId}
                className="w-full bg-oda-green text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Shield size={16} />
                    {paymentMethod === 'mpesa'
                      ? `Send M-Pesa Prompt · ${formatKES(totalKes)}`
                      : `Pay from Wallet · ${formatKES(totalKes)}`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Order summary (sticky) */}
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 h-fit lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-4">Order Summary</h3>
          <div className="space-y-2.5 text-sm font-plus-jakarta">
            <div className="flex justify-between text-oda-charcoal/70">
              <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span className="font-semibold">{formatKES(subtotalKes)}</span>
            </div>
            <div className="flex justify-between text-oda-charcoal/70">
              <span>Delivery fee</span>
              <span className={`font-semibold ${deliveryFeeKes === 0 ? 'text-oda-green' : ''}`}>
                {deliveryFeeKes === 0 ? 'FREE' : formatKES(deliveryFeeKes)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-oda-charcoal/8 font-extrabold text-oda-charcoal text-base">
              <span>Total</span>
              <span>{formatKES(totalKes)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-oda-mint rounded-xl flex items-center gap-2">
            <Shield size={14} className="text-oda-green shrink-0" />
            <p className="text-xs text-oda-green font-semibold font-plus-jakarta">
              Secure checkout. 100% genuine products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
