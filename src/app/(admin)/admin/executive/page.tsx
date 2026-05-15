'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

// ── Mock data ─────────────────────────────────────────────────────────────────

const gmvDaily = [
  { day: 'Apr 30', gmv: 980000 }, { day: 'May 1', gmv: 1120000 }, { day: 'May 2', gmv: 1050000 },
  { day: 'May 3', gmv: 870000 }, { day: 'May 4', gmv: 920000 }, { day: 'May 5', gmv: 1340000 },
  { day: 'May 6', gmv: 1240000 },
];

const retentionTrend = [
  { month: 'Feb', rate: 32 }, { month: 'Mar', rate: 38 }, { month: 'Apr', rate: 44 }, { month: 'May', rate: 47 },
];

const deliverySLA = [
  { hour: '08:00', pct: 92 }, { hour: '10:00', pct: 91 }, { hour: '12:00', pct: 88 },
  { hour: '14:00', pct: 90 }, { hour: '16:00', pct: 87 }, { hour: '18:00', pct: 84 }, { hour: '20:00', pct: 86 },
];

const branchFillRate = [
  { branch: 'CBD', rate: 97 }, { branch: 'Westlands', rate: 94 }, { branch: 'Eastlands', rate: 89 },
  { branch: 'Karen', rate: 96 }, { branch: 'Mombasa', rate: 88 },
];

const campaignROAS = [
  { campaign: 'Unga Campaign', roas: 3.2 }, { campaign: 'Cooking Oil', roas: 4.1 },
  { campaign: 'Beverages', roas: 2.8 }, { campaign: 'Dairy', roas: 5.0 },
];

const marginProducts = [
  { name: 'Unga 2kg', margin: 28 }, { name: 'Omo 1kg', margin: 24 }, { name: 'Cooking Oil', margin: 22 },
  { name: 'Fresh Milk', margin: 18 }, { name: 'Bread', margin: 15 },
];

const b2bPipeline = [
  { name: 'KYC Submitted', value: 24, color: '#F59E0B' },
  { name: 'KYC Approved', value: 18, color: '#10B981' },
  { name: 'First Order', value: 11, color: '#3B82F6' },
  { name: 'Active B2B', value: 8, color: '#8B5CF6' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKsh(v: number) {
  if (v >= 1_000_000) return `KSh ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `KSh ${(v / 1_000).toFixed(0)}K`;
  return `KSh ${v}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-4">{children}</h2>;
}

function KpiCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: string }) {
  const up = trend?.startsWith('+');
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      {trend && <p className={`text-xs font-semibold mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>{trend} vs yesterday</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExecutivePage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Oda Commerce — Kenya. As of today, 6 May 2026.</p>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                period === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Growth ─────────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>📈 Growth</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="GMV Today" value="KSh 1.24M" trend="+6.2%" />
          <KpiCard label="Orders Today" value="2,847" trend="+4.1%" />
          <KpiCard label="New Customers" value="312" sub="Today" trend="+11%" />
          <KpiCard label="Repeat Rate" value="47%" sub="Last 7 days" trend="+3%" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">GMV — Last 7 Days</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={gmvDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatKsh(v)} />
                <Line type="monotone" dataKey="gmv" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Retention Rate Trend (%)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={retentionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[20, 60]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── 2. Profitability ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle>💰 Profitability</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Net Revenue" value="KSh 223K" sub="Today" trend="+5.8%" />
          <KpiCard label="Contribution Margin" value="KSh 99K" sub="Today" trend="+3.1%" />
          <KpiCard label="Margin %" value="8.0%" sub="vs 7.8% yesterday" trend="+0.2%" />
          <KpiCard label="Refund Rate" value="1.8%" sub="Last 7 days" trend="-0.3%" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Top Margin Products (%)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={marginProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="margin" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 3. Supply Health ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle>🏪 Supply Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Avg Fill Rate" value="93%" sub="All branches" trend="+1%" />
          <KpiCard label="ERP Sync Health" value="99.2%" sub="Dynamics 365" />
          <KpiCard label="Stock Accuracy" value="94.8%" sub="Last 7 days" trend="-0.5%" />
          <KpiCard label="Supplier SLA" value="97%" sub="On-time branch replenish" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Fill Rate by Branch (%)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={branchFillRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="branch" tick={{ fontSize: 10 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 4. Logistics Health ──────────────────────────────────────────── */}
      <section>
        <SectionTitle>⚡ Logistics Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Delivery SLA" value="88%" sub="Last 2h" trend="-2%" />
          <KpiCard label="Avg Delivery Time" value="28 min" sub="Last 2h" trend="-1 min" />
          <KpiCard label="Active Riders" value="142" sub="Online now" />
          <KpiCard label="Incident Rate" value="0.8%" sub="Per 1000 orders" trend="-0.2%" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Delivery SLA % by Hour</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={deliverySLA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="pct" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 5. Customer Health ───────────────────────────────────────────── */}
      <section>
        <SectionTitle>💚 Customer Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="30-Day Retention" value="47%" trend="+3%" />
          <KpiCard label="Churn (30-day)" value="53%" trend="-3%" />
          <KpiCard label="NPS" value="54" sub="Based on 820 responses" trend="+4" />
          <KpiCard label="Support SLA" value="91%" sub="Within SLA" trend="+1%" />
        </div>
      </section>

      {/* ── 6. B2B Health ────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>🏢 B2B Health</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Active B2B Accounts" value="8" sub="Placed order this week" />
          <KpiCard label="B2B GMV" value="KSh 320K" sub="This week" trend="+18%" />
          <KpiCard label="Avg B2B Order" value="KSh 40K" trend="+5%" />
          <KpiCard label="KYC Pipeline" value="24" sub="Awaiting approval" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">B2B KYC Funnel</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={b2bPipeline} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {b2bPipeline.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 7. Manufacturer Revenue ──────────────────────────────────────── */}
      <section>
        <SectionTitle>📣 Manufacturer Revenue</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Ad Spend (Month)" value="KSh 185K" sub="Sponsored products" />
          <KpiCard label="Avg ROAS" value="3.8×" sub="This month" trend="+0.2×" />
          <KpiCard label="Active Campaigns" value="4" />
          <KpiCard label="Subscription Revenue" value="KSh 45K" sub="This month" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Campaign ROAS</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={campaignROAS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="campaign" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="roas" fill="#8B5CF6" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 8. Risk ──────────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>🛡 Risk</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Fraud Flags" value="3" sub="Last 24h" />
          <KpiCard label="Payment Fail Rate" value="5.8%" sub="Last 1h" trend="+1.2%" />
          <KpiCard label="Refund Rate" value="1.8%" sub="Last 7 days" trend="-0.3%" />
          <KpiCard label="Suspicious Activity" value="1" sub="Under review" />
        </div>
      </section>
    </div>
  );
}
