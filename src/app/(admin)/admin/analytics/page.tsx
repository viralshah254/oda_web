'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { analyticsAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminMetricCard } from '@/components/admin/admin-ui';

interface ProfitabilityReport {
  period?: { from: string; to: string };
  totalRevenueKes?: number;
  totalDeliveryFeesKes?: number;
  orderCount?: number;
  avgOrderValueKes?: number;
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatKes(paise?: number) {
  if (paise == null) return '—';
  return `KES ${(paise / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AdminAnalyticsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [report, setReport] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsAdminApi.profitability({ from, to });
      setReport(res.data ?? null);
    } catch {
      setError('Failed to load analytics');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const metrics = [
    { label: 'Total Orders', value: report?.orderCount?.toLocaleString() ?? '—' },
    { label: 'Gross Revenue', value: formatKes(report?.totalRevenueKes) },
    { label: 'Delivery Fees', value: formatKes(report?.totalDeliveryFeesKes) },
    { label: 'Avg Order Value', value: formatKes(report?.avgOrderValueKes) },
  ];

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Analytics"
        subtitle="Profitability report for selected date range"
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-oda-charcoal/40 font-plus-jakarta block mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-oda-charcoal/10 rounded-xl px-4 py-2 text-sm font-plus-jakarta outline-none focus:ring-2 focus:ring-oda-green/20"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-oda-charcoal/40 font-plus-jakarta block mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border border-oda-charcoal/10 rounded-xl px-4 py-2 text-sm font-plus-jakarta outline-none focus:ring-2 focus:ring-oda-green/20"
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-oda-green text-white text-sm font-bold font-plus-jakarta hover:bg-oda-green/90 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-oda-green animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {metrics.map((m) => (
              <AdminMetricCard key={m.label} label={m.label} value={m.value} />
            ))}
          </div>

          {report?.period && (
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6">
              <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-2">Report Period</h2>
              <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">
                {new Date(report.period.from).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' — '}
                {new Date(report.period.to).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
