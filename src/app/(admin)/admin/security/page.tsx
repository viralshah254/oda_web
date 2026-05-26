'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  FileText,
  Users,
  Key,
  Download,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { securityAdminApi } from '@/lib/api-client';
import { AdminStatusPill } from '@/components/admin/admin-ui';

type Tab = 'audit' | 'sessions' | 'consent' | 'exports' | 'deletions' | 'apikeys' | 'impersonation';

const TABS: { id: Tab; label: string; icon: React.ReactNode; wired: boolean }[] = [
  { id: 'impersonation', label: 'Impersonation', icon: <Users size={14} />, wired: true },
  { id: 'exports', label: 'Data Exports', icon: <Download size={14} />, wired: true },
  { id: 'apikeys', label: 'API Keys', icon: <Key size={14} />, wired: true },
  { id: 'audit', label: 'Audit Logs', icon: <FileText size={14} />, wired: false },
  { id: 'sessions', label: 'Active Sessions', icon: <Users size={14} />, wired: false },
  { id: 'consent', label: 'Consent Records', icon: <Shield size={14} />, wired: false },
  { id: 'deletions', label: 'Deletion Requests', icon: <Trash2 size={14} />, wired: false },
];

function UnwiredPanel({ label }: { label: string }) {
  return (
    <div className="p-8 text-center text-sm text-oda-charcoal/45 font-plus-jakarta">
      {label} is not exposed via admin API yet. Use operational logs or database tooling.
    </div>
  );
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('impersonation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [impersonation, setImpersonation] = useState<Array<Record<string, unknown>>>([]);
  const [exports, setExports] = useState<Array<Record<string, unknown>>>([]);
  const [apiKeys, setApiKeys] = useState<Array<Record<string, unknown>>>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const loadTab = useCallback(async (tab: Tab) => {
    if (!TABS.find((t) => t.id === tab)?.wired) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'impersonation') {
        const res = await securityAdminApi.listImpersonation();
        setImpersonation(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'exports') {
        const res = await securityAdminApi.listExports();
        setExports(res.data?.items ?? []);
      } else if (tab === 'apikeys') {
        const res = await securityAdminApi.listApiKeys();
        setApiKeys(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const endImpersonation = async (sessionId: string) => {
    try {
      await securityAdminApi.endImpersonation(sessionId);
      await loadTab('impersonation');
    } catch {
      setError('Failed to end impersonation session');
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await securityAdminApi.createApiKey({
        name: newKeyName.trim(),
        scopes: ['orders:read', 'inventory:read'],
      });
      setCreatedSecret(String(res.data?.secret ?? ''));
      setNewKeyName('');
      await loadTab('apikeys');
    } catch {
      setError('Failed to create API key');
    }
  };

  const revokeKey = async (id: string) => {
    try {
      await securityAdminApi.revokeApiKey(id);
      await loadTab('apikeys');
    } catch {
      setError('Failed to revoke API key');
    }
  };

  const requestExport = async () => {
    try {
      await securityAdminApi.requestExport({ exportType: 'ORDERS', format: 'CSV' });
      await loadTab('exports');
    } catch {
      setError('Failed to request export');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-oda-green/10 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-oda-green" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta">Privacy & Security</h1>
            <p className="text-sm text-oda-charcoal/55 font-plus-jakarta">Impersonation, exports, and API keys</p>
          </div>
          <button
            onClick={() => loadTab(activeTab)}
            className="ml-auto text-oda-charcoal/40 hover:text-oda-charcoal p-2"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-oda-red/10 border border-oda-red/20 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="flex gap-1 flex-wrap mb-6 bg-white border border-oda-charcoal/8 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold font-plus-jakarta transition-colors ${
              activeTab === tab.id ? 'bg-oda-charcoal text-white' : 'text-oda-charcoal/55 hover:bg-oda-ivory'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-oda-charcoal/8 min-h-[320px]">
        {loading && (
          <div className="flex justify-center py-16 text-oda-charcoal/40 text-sm font-plus-jakarta">Loading…</div>
        )}

        {!loading && activeTab === 'impersonation' && (
          <div>
            <div className="p-5 border-b border-oda-charcoal/8">
              <h2 className="text-sm font-bold font-plus-jakarta">Active impersonation sessions</h2>
            </div>
            {impersonation.length === 0 ? (
              <p className="p-6 text-sm text-oda-charcoal/40 font-plus-jakarta">No active sessions</p>
            ) : (
              <table className="w-full text-xs font-plus-jakarta">
                <thead className="bg-oda-ivory">
                  <tr>
                    {['Admin', 'Target', 'Reason', 'Expires', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-oda-charcoal/50 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {impersonation.map((s) => (
                    <tr key={String(s.id)} className="border-t border-oda-charcoal/5">
                      <td className="px-4 py-3">{(s.adminUser as { email?: string })?.email ?? '—'}</td>
                      <td className="px-4 py-3">{(s.targetUser as { phone?: string })?.phone ?? '—'}</td>
                      <td className="px-4 py-3">{String(s.reason ?? '—')}</td>
                      <td className="px-4 py-3">{s.expiresAt ? new Date(String(s.expiresAt)).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => endImpersonation(String(s.id))}
                          className="text-oda-red font-semibold hover:underline"
                        >
                          End
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && activeTab === 'exports' && (
          <div>
            <div className="p-5 border-b border-oda-charcoal/8 flex justify-between items-center">
              <h2 className="text-sm font-bold font-plus-jakarta">Data export jobs</h2>
              <button
                onClick={requestExport}
                className="text-xs font-semibold bg-oda-green text-white px-3 py-2 rounded-xl hover:opacity-90"
              >
                Request orders CSV
              </button>
            </div>
            {exports.length === 0 ? (
              <p className="p-6 text-sm text-oda-charcoal/40 font-plus-jakarta">No export jobs</p>
            ) : (
              <table className="w-full text-xs font-plus-jakarta">
                <thead className="bg-oda-ivory">
                  <tr>
                    {['Type', 'Format', 'Status', 'Created', 'Download'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-oda-charcoal/50 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exports.map((e) => (
                    <tr key={String(e.id)} className="border-t border-oda-charcoal/5">
                      <td className="px-4 py-3 font-mono">{String(e.exportType)}</td>
                      <td className="px-4 py-3">{String(e.format)}</td>
                      <td className="px-4 py-3">
                        <AdminStatusPill label={String(e.status)} variant="info" />
                      </td>
                      <td className="px-4 py-3">{e.createdAt ? new Date(String(e.createdAt)).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">
                        {e.downloadUrl ? (
                          <a href={String(e.downloadUrl)} className="text-oda-green font-semibold hover:underline">
                            Download
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && activeTab === 'apikeys' && (
          <div>
            <div className="p-5 border-b border-oda-charcoal/8 flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-sm font-bold font-plus-jakarta">API keys</h2>
              <div className="flex gap-2">
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name"
                  className="px-3 py-2 text-xs rounded-xl border border-oda-charcoal/10 font-plus-jakarta"
                />
                <button
                  onClick={createApiKey}
                  className="text-xs font-semibold bg-oda-green text-white px-3 py-2 rounded-xl"
                >
                  Create
                </button>
              </div>
            </div>
            {createdSecret && (
              <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-mono break-all">
                Copy secret now: {createdSecret}
              </div>
            )}
            <div className="divide-y divide-oda-charcoal/5">
              {apiKeys.map((k) => (
                <div key={String(k.id)} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-bold font-plus-jakarta">{String(k.name)}</p>
                    <p className="text-xs font-mono text-oda-charcoal/50">{String(k.prefix)}…</p>
                  </div>
                  <button onClick={() => revokeKey(String(k.id))} className="text-xs text-oda-red font-semibold">
                    Revoke
                  </button>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <p className="p-6 text-sm text-oda-charcoal/40 font-plus-jakarta">No API keys</p>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'audit' && <UnwiredPanel label="Audit logs" />}
        {!loading && activeTab === 'sessions' && <UnwiredPanel label="Active JWT sessions" />}
        {!loading && activeTab === 'consent' && <UnwiredPanel label="Consent records" />}
        {!loading && activeTab === 'deletions' && <UnwiredPanel label="Deletion requests" />}
      </div>
    </div>
  );
}
