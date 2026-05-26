'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api-client';

type ReadinessStatus = 'GREEN' | 'AMBER' | 'RED';

interface CityStatus {
  id: string;
  name: string;
  catalogScore: number;
  checklistPct: number;
  riderCount: number;
  branchCount: number;
  paymentTested: boolean;
  supportReady: boolean;
  launched: boolean;
  status: ReadinessStatus;
}

const STATUS_COLORS: Record<ReadinessStatus, { bg: string; text: string; label: string }> = {
  GREEN: { bg: 'bg-oda-mint', text: 'text-oda-green-dark', label: '● GREEN' },
  AMBER: { bg: 'bg-amber-100', text: 'text-amber-800', label: '● AMBER' },
  RED: { bg: 'bg-red-100', text: 'text-oda-red', label: '● RED' },
};

export default function RolloutPage() {
  const [cities, setCities] = useState<CityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getRolloutCities();
      setCities(res.data?.cities ?? []);
      setGeneratedAt(res.data?.generatedAt ?? null);
    } catch {
      setError('Could not load rollout data from admin API');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">City Launch Status Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live readiness from branches, delivery zones, rider pool, and payment history.
          </p>
          {generatedAt && (
            <p className="text-xs text-gray-400 mt-1">Updated {new Date(generatedAt).toLocaleString()}</p>
          )}
        </div>
        <button type="button" onClick={() => void load()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="text-sm text-oda-red bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading cities…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cities', value: cities.length },
              { label: 'GREEN', value: cities.filter((c) => c.status === 'GREEN').length, color: 'text-green-600' },
              { label: 'AMBER', value: cities.filter((c) => c.status === 'AMBER').length, color: 'text-amber-600' },
              { label: 'RED / Blocked', value: cities.filter((c) => c.status === 'RED').length, color: 'text-oda-red' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className={`text-2xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['City', 'Status', 'Catalog Score', 'Checklist', 'Riders', 'Branches', 'Payment', 'Support'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No active branches found — seed supplier branches to populate rollout cities.
                      </td>
                    </tr>
                  ) : (
                    cities.map((city) => {
                      const sc = STATUS_COLORS[city.status];
                      return (
                        <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {city.name}
                            {city.launched && (
                              <span className="ml-2 text-xs bg-oda-mint text-oda-green-dark px-1.5 py-0.5 rounded-full">Ready</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">{city.catalogScore}%</td>
                          <td className="px-4 py-3">{city.checklistPct}%</td>
                          <td className="px-4 py-3">{city.riderCount}</td>
                          <td className="px-4 py-3">{city.branchCount}</td>
                          <td className="px-4 py-3 text-center">{city.paymentTested ? '✅' : '❌'}</td>
                          <td className="px-4 py-3 text-center">{city.supportReady ? '✅' : '❌'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
