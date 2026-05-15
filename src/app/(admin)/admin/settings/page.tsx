'use client';

import { useState } from 'react';

const flags = [
  { key: 'enable_b2b_wholesale', label: 'B2B Wholesale', description: 'Enable B2B wholesale pricing and account registration', enabled: true },
  { key: 'enable_loyalty', label: 'Loyalty Program', description: 'Enable point earning and redemption for customers', enabled: true },
  { key: 'enable_recurring_cart', label: 'Recurring Cart', description: 'Allow customers to schedule recurring orders', enabled: false },
  { key: 'enable_ai_recommendations', label: 'AI Recommendations', description: 'Enable ML-powered product recommendations', enabled: false },
  { key: 'enable_mpesa_stk', label: 'M-Pesa STK Push', description: 'Enable M-Pesa STK push for checkout payments', enabled: true },
  { key: 'enable_franchise_dashboard', label: 'Franchise Dashboard', description: 'Enable multi-franchise management views', enabled: false },
];

export default function AdminSettingsPage() {
  const [flagState, setFlagState] = useState<Record<string, boolean>>(
    Object.fromEntries(flags.map((f) => [f.key, f.enabled]))
  );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8">Settings</h1>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#E8E8E0]">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">Feature Flags</h2>
          <p className="text-xs text-[#999] mt-0.5 font-plus-jakarta">Toggle features without deploying code</p>
        </div>
        <div className="divide-y divide-[#E8E8E0]">
          {flags.map((flag) => (
            <div key={flag.key} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{flag.label}</p>
                <p className="text-xs text-[#999] mt-0.5 font-plus-jakarta">{flag.description}</p>
              </div>
              <button
                onClick={() => setFlagState((s) => ({ ...s, [flag.key]: !s[flag.key] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  flagState[flag.key] ? 'bg-[#198A2E]' : 'bg-[#E8E8E0]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    flagState[flag.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
