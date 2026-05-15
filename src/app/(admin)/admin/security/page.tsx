'use client';

import { useState } from 'react';
import {
  Shield,
  FileText,
  Users,
  Key,
  Webhook,
  Database,
  Trash2,
  Download,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockAuditLogs = [
  { id: '1', user: 'admin@oda.co.ke', action: 'EXPORT_DOWNLOAD', resource: 'ExportJob', timestamp: '2026-05-06 10:23', ip: '41.90.2.1', result: 'SUCCESS' },
  { id: '2', user: 'alice@oda.co.ke', action: 'IMPERSONATION_START', resource: 'User', timestamp: '2026-05-06 09:15', ip: '41.90.2.2', result: 'SUCCESS' },
  { id: '3', user: 'bob@oda.co.ke', action: 'BULK_CANCEL', resource: 'orders', timestamp: '2026-05-06 08:44', ip: '41.90.2.3', result: 'SUCCESS' },
  { id: '4', user: 'unknown', action: 'LOGIN_FAILED', resource: 'Auth', timestamp: '2026-05-06 07:30', ip: '41.90.9.99', result: 'FAILED' },
];

const mockSessions = [
  { id: 's1', user: 'admin@oda.co.ke', device: 'Chrome / macOS', ip: '41.90.2.1', lastActive: '2 min ago', createdAt: '2026-05-06 10:00' },
  { id: 's2', user: 'alice@oda.co.ke', device: 'Safari / iOS', ip: '41.90.2.5', lastActive: '15 min ago', createdAt: '2026-05-06 09:00' },
];

const mockConsentRecords = [
  { id: 'c1', user: '+254712345678', consents: ['terms', 'privacy', 'age', 'location', 'pharmacy'], timestamp: '2026-05-01 08:00', marketing: true },
  { id: 'c2', user: '+254798765432', consents: ['terms', 'privacy', 'age', 'location', 'pharmacy'], timestamp: '2026-04-30 14:22', marketing: false },
];

const mockExportRequests = [
  { id: 'e1', user: 'admin@oda.co.ke', type: 'ORDERS', format: 'CSV', status: 'COMPLETED', requestedAt: '2026-05-05 15:00', downloadUrl: '#' },
  { id: 'e2', user: 'alice@oda.co.ke', type: 'CUSTOMERS', format: 'XLSX', status: 'PROCESSING', requestedAt: '2026-05-06 10:00', downloadUrl: null },
];

const mockDeletionRequests = [
  { id: 'd1', user: '+254712300001', requestedAt: '2026-05-04 09:00', status: 'PENDING', deadline: '2026-06-04' },
  { id: 'd2', user: '+254798000002', requestedAt: '2026-04-01 08:00', status: 'COMPLETED', deadline: '2026-05-01' },
];

const mockApiKeys = [
  { id: 'k1', name: 'ERP Integration', scopes: ['orders:read', 'inventory:read'], lastUsed: '2 min ago', usageCount: 12340, createdAt: '2026-01-01', expiresAt: '2027-01-01' },
  { id: 'k2', name: 'Supplier Portal', scopes: ['catalog:read', 'inventory:write'], lastUsed: '1 hr ago', usageCount: 5612, createdAt: '2026-02-01', expiresAt: null },
];

const mockWebhooks = [
  { id: 'w1', url: 'https://erp.example.com/hooks/oda', events: ['order.created', 'order.delivered'], status: 'ACTIVE', lastDelivery: '5 min ago', successRate: 99.2 },
  { id: 'w2', url: 'https://wms.example.com/stock', events: ['inventory.updated'], status: 'ACTIVE', lastDelivery: '1 hr ago', successRate: 97.8 },
];

const mockIntegrations = [
  { id: 'i1', name: 'Sage 300 ERP', type: 'ERP', status: 'CONNECTED', lastSync: '10 min ago' },
  { id: 'i2', name: 'Safaricom Daraja', type: 'PAYMENTS', status: 'CONNECTED', lastSync: '2 min ago' },
  { id: 'i3', name: 'Africa\'s Talking', type: 'SMS', status: 'CONNECTED', lastSync: '1 hr ago' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Tab = 'audit' | 'sessions' | 'consent' | 'exports' | 'deletions' | 'apikeys' | 'webhooks' | 'integrations';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'audit', label: 'Audit Logs', icon: <FileText size={14} /> },
  { id: 'sessions', label: 'Active Sessions', icon: <Users size={14} /> },
  { id: 'consent', label: 'Consent Records', icon: <Shield size={14} /> },
  { id: 'exports', label: 'Data Exports', icon: <Download size={14} /> },
  { id: 'deletions', label: 'Deletion Requests', icon: <Trash2 size={14} /> },
  { id: 'apikeys', label: 'API Keys', icon: <Key size={14} /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={14} /> },
  { id: 'integrations', label: 'Integrations', icon: <Database size={14} /> },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: 'bg-[#EBF9EE] text-[#198A2E]',
    COMPLETED: 'bg-[#EBF9EE] text-[#198A2E]',
    ACTIVE: 'bg-[#EBF9EE] text-[#198A2E]',
    CONNECTED: 'bg-[#EBF9EE] text-[#198A2E]',
    FAILED: 'bg-red-50 text-red-600',
    PROCESSING: 'bg-blue-50 text-blue-600',
    PENDING: 'bg-orange-50 text-orange-600',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[#F5F5F0] text-[#666]'}`}>
      {status}
    </span>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('audit');
  const [auditFilter, setAuditFilter] = useState('');

  const filteredAudit = mockAuditLogs.filter((log) =>
    !auditFilter ||
    log.user.includes(auditFilter) ||
    log.action.includes(auditFilter.toUpperCase()) ||
    log.resource.includes(auditFilter),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#EBF9EE] rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-[#198A2E]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Privacy & Security</h1>
            <p className="text-sm text-[#666] font-plus-jakarta">Audit logs, sessions, consent records, and integrations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-white border border-[#E8E8E0] rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold font-plus-jakarta transition-colors ${
              activeTab === tab.id
                ? 'bg-[#198A2E] text-white'
                : 'text-[#666] hover:bg-[#F5F5F0]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-[#E8E8E0]">

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0] flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Audit Logs</h2>
              <input
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                placeholder="Filter by user, action, resource…"
                className="px-3 py-2 text-xs rounded-xl border border-[#E8E8E0] font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20 w-64"
              />
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead className="bg-[#F5F5F0]">
                <tr>
                  {['User', 'Action', 'Resource', 'Timestamp', 'IP', 'Result'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((log) => (
                  <tr key={log.id} className="border-t border-[#F5F5F0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#1A1A1A]">{log.user}</td>
                    <td className="px-4 py-3 font-mono text-[#444]">{log.action}</td>
                    <td className="px-4 py-3 text-[#666]">{log.resource}</td>
                    <td className="px-4 py-3 text-[#999]">{log.timestamp}</td>
                    <td className="px-4 py-3 text-[#999]">{log.ip}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ACTIVE SESSIONS */}
        {activeTab === 'sessions' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0]">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Active JWT Sessions</h2>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead className="bg-[#F5F5F0]">
                <tr>
                  {['User', 'Device', 'IP', 'Last Active', 'Created', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockSessions.map((s) => (
                  <tr key={s.id} className="border-t border-[#F5F5F0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#1A1A1A]">{s.user}</td>
                    <td className="px-4 py-3 text-[#666]">{s.device}</td>
                    <td className="px-4 py-3 text-[#999]">{s.ip}</td>
                    <td className="px-4 py-3 text-[#999]">{s.lastActive}</td>
                    <td className="px-4 py-3 text-[#999]">{s.createdAt}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-600 text-xs font-semibold">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONSENT RECORDS */}
        {activeTab === 'consent' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0]">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Customer Consent History</h2>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead className="bg-[#F5F5F0]">
                <tr>
                  {['User', 'Consents Granted', 'Marketing', 'Timestamp'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockConsentRecords.map((c) => (
                  <tr key={c.id} className="border-t border-[#F5F5F0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#1A1A1A]">{c.user}</td>
                    <td className="px-4 py-3 text-[#444]">{c.consents.join(', ')}</td>
                    <td className="px-4 py-3">
                      {c.marketing
                        ? <CheckCircle size={14} className="text-[#198A2E]" />
                        : <XCircle size={14} className="text-[#999]" />}
                    </td>
                    <td className="px-4 py-3 text-[#999]">{c.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DATA EXPORTS */}
        {activeTab === 'exports' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0]">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Data Export Requests</h2>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead className="bg-[#F5F5F0]">
                <tr>
                  {['Requested By', 'Type', 'Format', 'Status', 'Requested At', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockExportRequests.map((e) => (
                  <tr key={e.id} className="border-t border-[#F5F5F0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#1A1A1A]">{e.user}</td>
                    <td className="px-4 py-3 font-mono text-[#444]">{e.type}</td>
                    <td className="px-4 py-3 text-[#666]">{e.format}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 text-[#999]">{e.requestedAt}</td>
                    <td className="px-4 py-3">
                      {e.downloadUrl && (
                        <a href={e.downloadUrl} className="flex items-center gap-1 text-[#198A2E] font-semibold hover:underline">
                          <Download size={12} /> Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELETION REQUESTS */}
        {activeTab === 'deletions' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0]">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Data Deletion Requests</h2>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead className="bg-[#F5F5F0]">
                <tr>
                  {['User', 'Requested At', 'Deadline', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockDeletionRequests.map((d) => (
                  <tr key={d.id} className="border-t border-[#F5F5F0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#1A1A1A]">{d.user}</td>
                    <td className="px-4 py-3 text-[#999]">{d.requestedAt}</td>
                    <td className="px-4 py-3 text-[#999] flex items-center gap-1">
                      <Clock size={11} />
                      {d.deadline}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* API KEYS */}
        {activeTab === 'apikeys' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">API Keys</h2>
              <button className="flex items-center gap-1.5 text-xs text-white bg-[#198A2E] px-3 py-2 rounded-xl font-semibold font-plus-jakarta hover:bg-[#166b24] transition-colors">
                <Key size={12} /> New Key
              </button>
            </div>
            <div className="divide-y divide-[#F5F5F0]">
              {mockApiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA]">
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{k.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {k.scopes.map((s) => (
                        <span key={s} className="text-[10px] bg-[#F5F5F0] text-[#444] px-1.5 py-0.5 rounded font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-[#999] font-plus-jakarta">
                    <span>Last used: {k.lastUsed}</span>
                    <span>{k.usageCount.toLocaleString()} calls</span>
                    {k.expiresAt && <span>Expires: {k.expiresAt}</span>}
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-[#F5F5F0] rounded-lg"><RefreshCw size={13} className="text-[#444]" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-500" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEBHOOKS */}
        {activeTab === 'webhooks' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Configured Webhooks</h2>
              <button className="flex items-center gap-1.5 text-xs text-white bg-[#198A2E] px-3 py-2 rounded-xl font-semibold font-plus-jakarta hover:bg-[#166b24] transition-colors">
                <Webhook size={12} /> Add Webhook
              </button>
            </div>
            <div className="divide-y divide-[#F5F5F0]">
              {mockWebhooks.map((w) => (
                <div key={w.id} className="px-5 py-4 hover:bg-[#FAFAFA]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono text-[#1A1A1A]">{w.url}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#198A2E] font-semibold font-plus-jakarta">{w.successRate}% success</span>
                      <StatusBadge status={w.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {w.events.map((e) => (
                      <span key={e} className="text-[10px] bg-[#F5F5F0] text-[#444] px-1.5 py-0.5 rounded font-mono">{e}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#999] mt-1 font-plus-jakarta">Last delivery: {w.lastDelivery}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div>
            <div className="p-5 border-b border-[#E8E8E0]">
              <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Integration Credentials</h2>
              <p className="text-xs text-[#999] font-plus-jakarta mt-0.5">Credential values are masked. Contact SUPER_ADMIN to rotate.</p>
            </div>
            <div className="divide-y divide-[#F5F5F0]">
              {mockIntegrations.map((i) => (
                <div key={i.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA]">
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{i.name}</p>
                    <p className="text-xs text-[#999] font-plus-jakarta">{i.type}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-plus-jakarta">
                    <span className="text-[#999]">Last sync: {i.lastSync}</span>
                    <StatusBadge status={i.status} />
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-[#F5F5F0] rounded-lg"><Eye size={13} className="text-[#444]" /></button>
                      <button className="p-1.5 hover:bg-[#F5F5F0] rounded-lg"><RefreshCw size={13} className="text-[#444]" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
