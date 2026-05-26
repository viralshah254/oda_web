'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function RiderApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '', vehicle: 'MOTORBIKE' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-oda-ivory py-16 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-oda-charcoal/8 p-8">
        <Link href="/rider" className="text-sm text-oda-green font-semibold font-plus-jakarta">← Rider program</Link>
        <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mt-4 mb-2">Apply as a rider</h1>
        <p className="text-sm text-oda-charcoal/60 font-plus-jakarta mb-6">
          Join the Oda delivery network. Flexible hours and weekly payouts.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-oda-mint p-6 text-center">
            <p className="font-bold text-oda-charcoal font-plus-jakarta">Application received</p>
            <p className="text-sm text-oda-charcoal/60 mt-2 font-plus-jakarta">Download the Oda Delivery app to complete KYC.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {[
              ['name', 'Full name'],
              ['phone', 'Phone (+254…)'],
              ['city', 'Primary city'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-oda-charcoal/40 mb-1 font-plus-jakarta">{label}</label>
                <input
                  required
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-plus-jakarta"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-oda-charcoal/40 mb-1 font-plus-jakarta">Vehicle type</label>
              <select
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                className="w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-plus-jakarta"
              >
                <option value="MOTORBIKE">Motorbike</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="VAN">Van</option>
              </select>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-oda-green text-white py-3 rounded-xl font-bold font-plus-jakarta">
              Submit application <ChevronRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
