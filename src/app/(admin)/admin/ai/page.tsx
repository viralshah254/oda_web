'use client';

import { useState, useEffect, useCallback } from 'react';
import { Brain, Loader2, RefreshCw } from 'lucide-react';
import { aiAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface AiInsight {
  id: string;
  title: string;
  value: number;
  severity: string;
}

const severityVariant = (severity: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  const s = severity.toLowerCase();
  if (s === 'high' || s === 'error') return 'error';
  if (s === 'warning' || s === 'medium') return 'warning';
  if (s === 'info') return 'info';
  return 'neutral';
};

const formatValue = (id: string, value: number) => {
  if (id.includes('revenue')) return `KES ${value.toLocaleString()}`;
  return value.toLocaleString();
};

interface ForecastRow {
  sku: string;
  productName?: string;
  branchId: string;
  units: number;
  date: string;
}

export default function AdminAIPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [forecasts, setForecasts] = useState<ForecastRow[]>([]);
  const [forecastSource, setForecastSource] = useState<string>('heuristic');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [insightRes, forecastRes] = await Promise.all([
        aiAdminApi.insights(),
        aiAdminApi.demandForecast({ horizonDays: 7 }),
      ]);
      setInsights(insightRes.data?.insights ?? []);
      setGeneratedAt(insightRes.data?.generatedAt ?? null);
      setForecasts(forecastRes.data?.forecasts ?? []);
      setForecastSource(forecastRes.data?.source ?? 'heuristic');
    } catch {
      setError('Failed to load AI insights');
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const severities = ['ALL', ...Array.from(new Set(insights.map((i) => i.severity.toUpperCase())))];
  const filtered =
    severityFilter === 'ALL'
      ? insights
      : insights.filter((i) => i.severity.toUpperCase() === severityFilter);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="AI Insights"
        subtitle={
          generatedAt
            ? `Updated ${new Date(generatedAt).toLocaleString('en-KE')}`
            : `${insights.length} signals`
        }
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-oda-charcoal/30" size={28} />
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {severities.map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta ${
                  severityFilter === s ? 'bg-oda-charcoal text-white' : 'bg-white border border-oda-charcoal/10 text-oda-charcoal/60'
                }`}
              >
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-oda-charcoal/8">
              <Brain size={32} className="text-oda-charcoal/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">No insights for this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <AdminStatusPill
                      label={insight.severity.toUpperCase()}
                      variant={severityVariant(insight.severity)}
                    />
                    <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta mt-2">{insight.title}</p>
                    <p className="text-xs text-oda-charcoal/40 font-mono mt-0.5">{insight.id}</p>
                  </div>
                  <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta shrink-0">
                    {formatValue(insight.id, insight.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-oda-charcoal font-plus-jakarta mb-2">Demand forecast (7d)</h2>
        <p className="text-xs text-oda-charcoal/40 mb-4 font-plus-jakarta">Source: {forecastSource}</p>
        {forecasts.length === 0 ? (
          <p className="text-sm text-oda-charcoal/50">No forecast data.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-oda-ivory text-oda-charcoal/50 text-left">
                <tr>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">Units/day</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f, i) => (
                  <tr key={`${f.sku}-${i}`} className="border-t border-oda-charcoal/5">
                    <td className="px-4 py-2 font-mono text-xs">{f.sku}</td>
                    <td className="px-4 py-2">{f.productName ?? '—'}</td>
                    <td className="px-4 py-2">{f.branchId}</td>
                    <td className="px-4 py-2 font-bold">{f.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
