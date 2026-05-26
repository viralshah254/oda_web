'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Plus, Trash2, Star, Pencil, Loader2, Check, X } from 'lucide-react';
import { addressApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AddressLabelPicker } from '@/components/shop/address-label-picker';

interface Address {
  id: string;
  label?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
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
  onSave: (data: AddressFormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressFormState>(initial);
  const set = (k: keyof AddressFormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1.5">
          Address type
        </label>
        <AddressLabelPicker value={form.label} onChange={(v) => set('label', v)} />
      </div>
      <div>
        <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1.5">
          Street address *
        </label>
        <input
          placeholder="e.g. 14 Mpaka Road, Westlands"
          value={form.addressLine1}
          onChange={(e) => set('addressLine1', e.target.value)}
          className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/30 placeholder:text-oda-charcoal/35"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1.5">
          City
        </label>
        <input
          placeholder="Nairobi"
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/30 placeholder:text-oda-charcoal/35"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          type="button"
          className="flex-1 py-2.5 border border-oda-charcoal/15 rounded-xl text-sm font-semibold text-oda-charcoal/60 font-plus-jakarta hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.addressLine1.trim()}
          type="button"
          className="flex-1 py-2.5 bg-oda-green text-white rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-oda-green-dark transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save address
        </button>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Panel state: 'add' | edit id | null
  const [panel, setPanel] = useState<'add' | string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/addresses');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const res = await addressApi.list();
      const raw = res.data?.addresses ?? res.data?.items ?? res.data ?? [];
      setAddresses(Array.isArray(raw) ? raw : []);
    } catch {
      /* show empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const handleAdd = async (form: AddressFormState) => {
    setSaving(true);
    try {
      await addressApi.create({ label: form.label, addressLine1: form.addressLine1, city: form.city });
      setPanel(null);
      await load();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string, form: AddressFormState) => {
    setSaving(true);
    try {
      await addressApi.update(id, { label: form.label, addressLine1: form.addressLine1, city: form.city });
      setPanel(null);
      await load();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await addressApi.remove(id);
      setAddresses((a) => a.filter((x) => x.id !== id));
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      setAddresses((a) => a.map((x) => ({ ...x, isDefault: x.id === id })));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Saved Addresses</h1>
          </div>
          <button
            onClick={() => setPanel('add')}
            className="flex items-center gap-1.5 bg-oda-green text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-oda-green-dark transition-colors font-plus-jakarta"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="text-oda-green animate-spin" />
          </div>
        )}

        {/* Add form */}
        {panel === 'add' && (
          <div className="bg-white border border-oda-green/30 rounded-2xl p-5">
            <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta mb-4">New address</p>
            <AddressForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setPanel(null)}
              saving={saving}
            />
          </div>
        )}

        {!loading && addresses.length === 0 && panel !== 'add' && (
          <div className="text-center py-12">
            <MapPin size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No saved addresses yet</p>
            <button
              onClick={() => setPanel('add')}
              className="mt-4 inline-flex items-center gap-2 bg-oda-green text-white px-5 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
            >
              <Plus size={14} /> Add your first address
            </button>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
              addr.isDefault ? 'border-oda-green/40' : 'border-oda-charcoal/8'
            }`}
          >
            {/* Card header */}
            <div className="flex items-start gap-3 p-4">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  addr.isDefault ? 'bg-oda-mint' : 'bg-oda-ivory'
                }`}
              >
                <MapPin size={16} className={addr.isDefault ? 'text-oda-green' : 'text-oda-charcoal/40'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">
                    {addr.label ?? 'Address'}
                  </p>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold bg-oda-mint text-oda-green px-1.5 py-0.5 rounded-full font-plus-jakarta">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">
                  {addr.addressLine1}
                  {addr.city ? `, ${addr.city}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {/* Edit */}
                <button
                  onClick={() => setPanel(panel === addr.id ? null : addr.id)}
                  title="Edit"
                  className="p-2 text-oda-charcoal/30 hover:text-oda-green transition-colors"
                >
                  {panel === addr.id ? <X size={16} /> : <Pencil size={16} />}
                </button>
                {/* Set default */}
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    title="Set as default"
                    className="p-2 text-oda-charcoal/30 hover:text-oda-yellow transition-colors"
                  >
                    <Star size={16} />
                  </button>
                )}
                {/* Delete */}
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="p-2 text-oda-charcoal/30 hover:text-red-500 transition-colors"
                >
                  {deletingId === addr.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            {panel === addr.id && (
              <div className="border-t border-oda-charcoal/8 px-4 pb-4 pt-3 bg-oda-ivory/60">
                <AddressForm
                  initial={{
                    label: addr.label ?? 'Home',
                    addressLine1: addr.addressLine1,
                    city: addr.city ?? 'Nairobi',
                  }}
                  onSave={(form) => handleEdit(addr.id, form)}
                  onCancel={() => setPanel(null)}
                  saving={saving}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
