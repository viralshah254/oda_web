'use client';

import React, { useState } from 'react';

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

const INITIAL_CITIES: CityStatus[] = [
  { id: 'nbi-cbd', name: 'Nairobi CBD', catalogScore: 92, checklistPct: 97, riderCount: 48, branchCount: 3, paymentTested: true, supportReady: true, launched: true, status: 'GREEN' },
  { id: 'nbi-west', name: 'Nairobi Westlands', catalogScore: 88, checklistPct: 91, riderCount: 35, branchCount: 2, paymentTested: true, supportReady: true, launched: true, status: 'GREEN' },
  { id: 'nbi-east', name: 'Nairobi Eastlands', catalogScore: 80, checklistPct: 78, riderCount: 22, branchCount: 1, paymentTested: true, supportReady: false, launched: false, status: 'AMBER' },
  { id: 'nbi-south', name: 'Nairobi South', catalogScore: 65, checklistPct: 60, riderCount: 10, branchCount: 1, paymentTested: false, supportReady: false, launched: false, status: 'RED' },
  { id: 'mombasa', name: 'Mombasa', catalogScore: 72, checklistPct: 74, riderCount: 18, branchCount: 1, paymentTested: true, supportReady: false, launched: false, status: 'AMBER' },
  { id: 'kisumu', name: 'Kisumu', catalogScore: 58, checklistPct: 45, riderCount: 5, branchCount: 0, paymentTested: false, supportReady: false, launched: false, status: 'RED' },
  { id: 'nakuru', name: 'Nakuru', catalogScore: 55, checklistPct: 40, riderCount: 3, branchCount: 0, paymentTested: false, supportReady: false, launched: false, status: 'RED' },
  { id: 'eldoret', name: 'Eldoret', catalogScore: 48, checklistPct: 35, riderCount: 2, branchCount: 0, paymentTested: false, supportReady: false, launched: false, status: 'RED' },
];

const STATUS_COLORS: Record<ReadinessStatus, { bg: string; text: string; label: string }> = {
  GREEN: { bg: 'bg-green-100', text: 'text-green-800', label: '● GREEN' },
  AMBER: { bg: 'bg-amber-100', text: 'text-amber-800', label: '● AMBER' },
  RED: { bg: 'bg-red-100', text: 'text-red-800', label: '● RED' },
};

export default function RolloutPage() {
  const [cities, setCities] = useState<CityStatus[]>(INITIAL_CITIES);
  const [confirmAction, setConfirmAction] = useState<{ cityId: string; type: 'launch' | 'rollback' } | null>(null);

  function handleLaunch(cityId: string) {
    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, launched: true } : c)),
    );
    setConfirmAction(null);
  }

  function handleRollback(cityId: string) {
    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, launched: false } : c)),
    );
    setConfirmAction(null);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">City Launch Status Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor readiness scores and control city launches. GREEN = go, AMBER = conditional, RED = blocked.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cities', value: cities.length },
          { label: 'Launched', value: cities.filter((c) => c.launched).length, color: 'text-green-600' },
          { label: 'AMBER', value: cities.filter((c) => c.status === 'AMBER').length, color: 'text-amber-600' },
          { label: 'RED / Blocked', value: cities.filter((c) => c.status === 'RED').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* City table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['City', 'Status', 'Catalog Score', 'Checklist', 'Riders', 'Branches', 'Payment', 'Support', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cities.map((city) => {
                const sc = STATUS_COLORS[city.status];
                return (
                  <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {city.name}
                      {city.launched && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Live</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${city.catalogScore >= 85 ? 'bg-green-500' : city.catalogScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${city.catalogScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{city.catalogScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${city.checklistPct >= 90 ? 'text-green-600' : city.checklistPct >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {city.checklistPct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${city.riderCount >= 30 ? 'text-green-600' : city.riderCount >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                        {city.riderCount} {city.riderCount >= 30 ? '✓' : '⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${city.branchCount >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {city.branchCount} {city.branchCount >= 1 ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{city.paymentTested ? '✅' : '❌'}</td>
                    <td className="px-4 py-3 text-center">{city.supportReady ? '✅' : '❌'}</td>
                    <td className="px-4 py-3">
                      {city.launched ? (
                        <button
                          onClick={() => setConfirmAction({ cityId: city.id, type: 'rollback' })}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 font-semibold hover:bg-red-100 transition-colors"
                        >
                          Rollback
                        </button>
                      ) : (
                        <button
                          onClick={() => city.status === 'GREEN' && setConfirmAction({ cityId: city.id, type: 'launch' })}
                          disabled={city.status !== 'GREEN'}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            city.status === 'GREEN'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Launch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.type === 'launch' ? '🚀 Confirm Launch' : '⏸ Confirm Rollback'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {confirmAction.type === 'launch'
                ? `Launch ${cities.find((c) => c.id === confirmAction.cityId)?.name}? This will make the city live for customers.`
                : `Rollback ${cities.find((c) => c.id === confirmAction.cityId)?.name}? This will disable the city for customers.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmAction.type === 'launch'
                    ? handleLaunch(confirmAction.cityId)
                    : handleRollback(confirmAction.cityId)
                }
                className={`flex-1 py-2 rounded-xl text-sm font-semibold text-white ${
                  confirmAction.type === 'launch' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'launch' ? 'Launch' : 'Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
