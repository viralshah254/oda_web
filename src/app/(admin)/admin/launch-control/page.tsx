'use client';

import React, { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricCard {
  title: string;
  primary: string;
  secondary: string;
  status: 'ok' | 'warn' | 'crit';
  icon: string;
}

interface FeatureFlag {
  id: string;
  label: string;
  enabled: boolean;
  category: string;
}

interface IncidentAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_FLAGS: FeatureFlag[] = [
  { id: 'checkout', label: 'Checkout Flow', enabled: true, category: 'Core' },
  { id: 'mpesa_stk', label: 'M-Pesa STK Push', enabled: true, category: 'Payments' },
  { id: 'wallet_pay', label: 'Wallet Payments', enabled: true, category: 'Payments' },
  { id: 'instant_delivery', label: 'Instant Delivery', enabled: true, category: 'Delivery' },
  { id: 'scheduled_delivery', label: 'Scheduled Delivery', enabled: false, category: 'Delivery' },
  { id: 'b2b', label: 'B2B / Wholesale', enabled: true, category: 'B2B' },
  { id: 'loyalty', label: 'Loyalty Points', enabled: true, category: 'Growth' },
  { id: 'referrals', label: 'Referral Program', enabled: true, category: 'Growth' },
  { id: 'ai_substitution', label: 'AI Substitution', enabled: false, category: 'AI' },
  { id: 'manufacturer_ads', label: 'Manufacturer Ads', enabled: true, category: 'Monetisation' },
];

const MOCK_INCIDENTS: IncidentAlert[] = [
  { id: '1', severity: 'critical', title: 'M-Pesa STK Push latency spike', detail: 'P99 > 8s (threshold 3s). Investigating with Safaricom API team.', time: '13:42' },
  { id: '2', severity: 'warning', title: 'Mombasa rider pool below minimum', detail: '12 online riders vs target 30. Peak hour approaching.', time: '13:28' },
  { id: '3', severity: 'info', title: 'Deployment v2.14.3 completed', detail: 'Blue-green promotion successful. Zero downtime.', time: '12:55' },
  { id: '4', severity: 'info', title: 'Daily reconciliation run started', detail: 'Processing 2,847 transactions from yesterday.', time: '12:00' },
  { id: '5', severity: 'warning', title: 'Support ticket backlog rising', detail: 'Open tickets: 34 (threshold 25). 3 tickets >SLA.', time: '11:45' },
];

// ── Component ─────────────────────────────────────────────────────────────────

function statusBg(s: 'ok' | 'warn' | 'crit') {
  return { ok: 'border-green-200 bg-green-50', warn: 'border-amber-200 bg-amber-50', crit: 'border-red-200 bg-red-50' }[s];
}

function statusText(s: 'ok' | 'warn' | 'crit') {
  return { ok: 'text-green-700', warn: 'text-amber-700', crit: 'text-red-700' }[s];
}

function severityBg(s: 'critical' | 'warning' | 'info') {
  return { critical: 'bg-red-50 border-red-200', warning: 'bg-amber-50 border-amber-200', info: 'bg-blue-50 border-blue-200' }[s];
}

function severityText(s: 'critical' | 'warning' | 'info') {
  return { critical: 'text-red-700', warning: 'text-amber-700', info: 'text-blue-700' }[s];
}

export default function LaunchControlPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate live refresh every 30s
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const metrics: MetricCard[] = [
    { title: 'Payment Health', icon: '💳', primary: 'STK Success: 94.2%', secondary: '12 failed · 3 pending recon', status: 'warn' },
    { title: 'Order Creation', icon: '🛒', primary: '342 orders/hr', secondary: 'Conversion: 68% · +4% vs yesterday', status: 'ok' },
    { title: 'Delivery SLA', icon: '⚡', primary: '87% on-time (last 2h)', secondary: 'Avg delivery: 28 min', status: 'warn' },
    { title: 'Branch SLA', icon: '🏪', primary: 'Pick: 4.2 min avg', secondary: 'Pack: 2.8 min · Queue: 14 orders', status: 'ok' },
    { title: 'Support Backlog', icon: '🎧', primary: '34 open tickets', secondary: '3 >SLA · 1 critical', status: 'warn' },
    { title: 'Executive Summary', icon: '📊', primary: 'GMV: KSh 1.24M today', secondary: '2,847 orders · 142 riders active · 8 branches', status: 'ok' },
  ];

  function toggleFlag(id: string) {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  }

  const flagsByCategory = flags.reduce<Record<string, FeatureFlag[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚨 Launch Control Center</h1>
          <p className="text-gray-500 text-sm mt-1">War-room dashboard. Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-600 font-medium">System live</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className={`rounded-2xl border p-4 ${statusBg(m.status)}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{m.icon}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{m.title}</span>
            </div>
            <p className={`text-lg font-bold ${statusText(m.status)}`}>{m.primary}</p>
            <p className="text-xs text-gray-600 mt-0.5">{m.secondary}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature flags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">🎛 Rollback Flags (Kill Switches)</h2>
          <div className="space-y-5">
            {Object.entries(flagsByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                <div className="space-y-2">
                  {items.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700">{flag.label}</span>
                      <button
                        onClick={() => toggleFlag(flag.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          flag.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={flag.enabled}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            flag.enabled ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">📡 Incident Feed (last 10)</h2>
          <div className="space-y-3">
            {MOCK_INCIDENTS.map((inc) => (
              <div key={inc.id} className={`rounded-xl border p-3 ${severityBg(inc.severity)}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${severityText(inc.severity)}`}>{inc.title}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{inc.time}</span>
                </div>
                <p className={`text-xs mt-0.5 ${severityText(inc.severity)} opacity-80`}>{inc.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
