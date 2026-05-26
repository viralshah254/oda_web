'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, MapPin, Bell, FlaskConical, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConsentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  checked: boolean;
  icon: React.ReactNode;
  link?: { label: string; href: string };
}

export default function ConsentPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'terms',
      label: 'Terms of Service',
      description: 'I have read and agree to the Oda Terms of Service governing use of the platform, purchases, and delivery.',
      required: true,
      checked: false,
      icon: <Shield size={18} className="text-oda-green" />,
      link: { label: 'Read Terms of Service', href: '/legal/terms' },
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      description: 'I consent to Oda collecting and processing my personal data as described in the Privacy Policy, including order history and location data.',
      required: true,
      checked: false,
      icon: <Shield size={18} className="text-oda-green" />,
      link: { label: 'Read Privacy Policy', href: '/legal/privacy' },
    },
    {
      id: 'age',
      label: 'Age Verification',
      description: 'I confirm I am 18 years of age or older. Some products (alcohol, tobacco, pharmacy) require age verification.',
      required: true,
      checked: false,
      icon: <AlertCircle size={18} className="text-oda-green" />,
    },
    {
      id: 'location',
      label: 'Location Permission',
      description: 'Oda uses your device location to show nearby branches, accurate delivery times, and real-time order tracking. Location is only used when the app is active.',
      required: true,
      checked: false,
      icon: <MapPin size={18} className="text-oda-green" />,
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy Disclaimer',
      description: 'I understand that Oda facilitates the purchase of OTC pharmacy products. Prescription-only medicines require a valid prescription. Oda does not provide medical advice.',
      required: true,
      checked: false,
      icon: <FlaskConical size={18} className="text-oda-green" />,
      link: { label: 'Pharmacy Policy', href: '/legal/pharmacy' },
    },
    {
      id: 'marketing',
      label: 'Marketing Communications',
      description: 'I agree to receive personalised offers, promotions, and product recommendations via SMS, email, and push notifications. You can unsubscribe at any time.',
      required: false,
      checked: false,
      icon: <Bell size={18} className="text-[#666]" />,
    },
  ]);

  const toggle = (id: string) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)),
    );
  };

  const allRequired = consents.filter((c) => c.required).every((c) => c.checked);

  const handleSubmit = () => {
    if (!allRequired) return;
    setSubmitted(true);
    setTimeout(() => router.push('/'), 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-oda-mint rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-oda-green" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">All set!</h1>
          <p className="text-[#666] font-plus-jakarta">Your preferences have been saved. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-[#666] font-plus-jakarta">← Back</Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Privacy & Consent</h1>
          <div />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-oda-mint rounded-2xl flex items-center justify-center shrink-0">
              <Shield size={24} className="text-oda-green" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-oda-charcoal font-plus-jakarta mb-1">Your privacy matters</h2>
              <p className="text-sm text-[#666] font-plus-jakarta leading-relaxed">
                Please review and accept the required agreements before using Oda. Required items are marked with a red asterisk (<span className="text-red-500 font-bold">*</span>).
              </p>
            </div>
          </div>
        </div>

        {/* Consent Items */}
        {consents.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border transition-colors ${
              item.checked ? 'border-oda-green' : 'border-gray-100'
            }`}
          >
            <label className="flex items-start gap-4 p-5 cursor-pointer">
              {/* Checkbox */}
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-oda-green border-oda-green' : 'border-[#CCC] bg-white'
                  }`}
                >
                  {item.checked && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="text-sm font-bold text-oda-charcoal font-plus-jakarta">
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                    {!item.required && (
                      <span className="ml-2 text-xs text-[#999] font-normal font-plus-jakarta">Optional</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-[#666] font-plus-jakarta leading-relaxed">{item.description}</p>
                {item.link && (
                  <Link
                    href={item.link.href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-oda-green font-semibold font-plus-jakarta hover:underline"
                  >
                    {item.link.label}
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </label>
          </div>
        ))}

        {/* Notice */}
        <p className="text-xs text-center text-[#999] font-plus-jakarta px-4">
          You can update your consent preferences at any time in{' '}
          <Link href="/account" className="text-oda-green hover:underline">Account Settings</Link>.
        </p>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!allRequired}
          className="w-full bg-oda-green text-white py-4 rounded-2xl text-base font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Save & Continue
        </button>

        {!allRequired && (
          <p className="text-xs text-center text-red-500 font-plus-jakarta">
            Please accept all required items to continue.
          </p>
        )}
      </div>
    </div>
  );
}
