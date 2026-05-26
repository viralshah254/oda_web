'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { erpAdminApi } from '@/lib/api-client';
import { AdminDataTable, AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface ErpIntegration {
  id: string;
  tenantId: string;
  erpType: string;
  baseUrl: string;
  isEnabled: boolean;
  lastSyncAt?: string | null;
  syncIntervalMin: number;
  tenant?: { id: string; name: string };
}

interface ErpJob {
  id: string;
  entityType: string;
  status: string;
  recordsSuccess: number;
  recordsFailed: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export default function AdminErpPage() {
  const [integrations, setIntegrations] = useState<ErpIntegration[]>([]);
  const [jobs, setJobs] = useState<ErpJob[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await erpAdminApi.integrations();
      const list = Array.isArray(res.data) ? res.data : [];
      setIntegrations(list);
      const tenantId = selectedTenant ?? list[0]?.tenantId ?? null;
      setSelectedTenant(tenantId);
      if (tenantId) {
        const jobsRes = await erpAdminApi.jobs(tenantId);
        setJobs(jobsRes.data?.jobs ?? []);
      } else {
        setJobs([]);
      }
    } catch {
      setError('Failed to load ERP integrations');
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  useEffect(() => {
    load();
  }, [load]);

  const triggerSync = async (tenantId: string, entityType: string) => {
    setSyncing(`${tenantId}-${entityType}`);
    try {
      await erpAdminApi.sync(tenantId, entityType);
      setSelectedTenant(tenantId);
      const jobsRes = await erpAdminApi.jobs(tenantId);
      setJobs(jobsRes.data?.jobs ?? []);
    } catch {
      setError(`Failed to sync ${entityType}`);
    } finally {
      setSyncing(null);
    }
  };

  const jobVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
    if (status === 'SUCCESS') return 'success';
    if (status === 'PARTIAL') return 'warning';
    if (status === 'FAILED') return 'error';
    return 'info';
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ERP Sync"
        subtitle="Dynamics 365 integrations and sync jobs"
        actions={
          <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-oda-red/10 border border-oda-red/20 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-3">Integrations</h2>
          <AdminDataTable columns={['Tenant', 'Type', 'Status', 'Last sync', 'Actions']} loading={loading} empty="No ERP integrations">
            {!loading &&
              integrations.map((i) => (
                <tr
                  key={i.id}
                  className={`border-t border-oda-charcoal/5 hover:bg-oda-ivory/50 cursor-pointer ${
                    selectedTenant === i.tenantId ? 'bg-oda-ivory/80' : ''
                  }`}
                  onClick={() => setSelectedTenant(i.tenantId)}
                >
                  <td className="px-4 py-3 text-sm font-plus-jakarta">{i.tenant?.name ?? i.tenantId}</td>
                  <td className="px-4 py-3 text-xs font-mono text-oda-charcoal/60">{i.erpType}</td>
                  <td className="px-4 py-3">
                    <AdminStatusPill label={i.isEnabled ? 'Enabled' : 'Disabled'} variant={i.isEnabled ? 'success' : 'neutral'} />
                  </td>
                  <td className="px-4 py-3 text-xs text-oda-charcoal/50 font-plus-jakarta">
                    {i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {(['products', 'stock'] as const).map((entityType) => (
                      <button
                        key={entityType}
                        disabled={syncing === `${i.tenantId}-${entityType}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerSync(i.tenantId, entityType);
                        }}
                        className="text-xs font-semibold text-oda-green hover:underline disabled:opacity-50 font-plus-jakarta"
                      >
                        Sync {entityType}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
          </AdminDataTable>
        </div>

        <div>
          <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-3">
            Sync jobs {selectedTenant ? `(${selectedTenant.slice(0, 8)}…)` : ''}
          </h2>
          <AdminDataTable columns={['Type', 'Status', 'OK', 'Failed', 'Started']} loading={loading && !selectedTenant} empty="Select an integration">
            {!loading &&
              jobs.map((j) => (
                <tr key={j.id} className="border-t border-oda-charcoal/5">
                  <td className="px-4 py-3 text-xs font-mono">{j.entityType}</td>
                  <td className="px-4 py-3">
                    <AdminStatusPill label={j.status} variant={jobVariant(j.status)} />
                  </td>
                  <td className="px-4 py-3 text-sm">{j.recordsSuccess}</td>
                  <td className="px-4 py-3 text-sm">{j.recordsFailed}</td>
                  <td className="px-4 py-3 text-xs text-oda-charcoal/50">
                    {j.startedAt ? new Date(j.startedAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
          </AdminDataTable>
        </div>
      </div>
    </div>
  );
}
