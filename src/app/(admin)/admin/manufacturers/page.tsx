'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Megaphone,
} from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminDataTable, AdminStatusPill } from '@/components/admin/admin-ui';

interface SupplierRow {
  id: string;
  name: string;
  tradingName?: string | null;
  isActive: boolean;
  branches?: { id: string; name: string; isActive: boolean }[];
  _count?: { orders: number };
}

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  billingModel: string;
  budgetKes: number;
  spentKes: number;
  createdAt: string;
  manufacturer?: { id: string; name: string };
  brand?: { id: string; name: string } | null;
}

type ActionState = Record<string, 'approving' | 'rejecting' | null>;

export default function AdminManufacturersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [total, setTotal] = useState(0);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});
  const [rejectTarget, setRejectTarget] = useState<CampaignRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSuppliers({ limit: 50 });
      setSuppliers(res.data?.suppliers ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load supplier registry');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    setCampaignError(null);
    try {
      const res = await adminApi.getCampaigns({ status: 'PENDING_APPROVAL', limit: 50 });
      setCampaigns(res.data?.campaigns ?? []);
      setCampaignTotal(res.data?.total ?? 0);
    } catch {
      setCampaignError('Failed to load pending campaigns');
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    await Promise.all([loadSuppliers(), loadCampaigns()]);
  }, [loadSuppliers, loadCampaigns]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (campaign: CampaignRow) => {
    setActionState((s) => ({ ...s, [campaign.id]: 'approving' }));
    try {
      await adminApi.approveCampaign(campaign.id);
      await loadCampaigns();
    } catch {
      setCampaignError(`Failed to approve "${campaign.name}"`);
    } finally {
      setActionState((s) => ({ ...s, [campaign.id]: null }));
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setActionState((s) => ({ ...s, [rejectTarget.id]: 'rejecting' }));
    try {
      await adminApi.rejectCampaign(rejectTarget.id, rejectReason.trim());
      setRejectTarget(null);
      setRejectReason('');
      await loadCampaigns();
    } catch {
      setCampaignError(`Failed to reject "${rejectTarget.name}"`);
    } finally {
      setActionState((s) => ({ ...s, [rejectTarget.id]: null }));
    }
  };

  const activeCount = suppliers.filter((s) => s.isActive).length;

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Manufacturers & Brands"
        subtitle="Review ad campaigns and manage the supplier registry"
        actions={
          <Link
            href="/portal/manufacturer"
            className="flex items-center gap-2 bg-oda-green text-white px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green/90"
          >
            <ExternalLink size={14} />
            Manufacturer Portal
          </Link>
        }
      />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-oda-purple" />
            <h2 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">
              Pending Campaign Approvals
            </h2>
            <span className="text-xs bg-oda-yellow/20 text-oda-charcoal px-2 py-0.5 rounded-full font-bold">
              {campaignTotal}
            </span>
          </div>
          <button
            onClick={loadCampaigns}
            className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {campaignError && (
          <div className="mb-4 text-sm text-oda-red bg-oda-red/10 border border-oda-red/20 rounded-xl px-4 py-3 font-plus-jakarta">
            {campaignError}
          </div>
        )}

        <AdminDataTable
          columns={['Campaign', 'Manufacturer', 'Model', 'Budget', 'Submitted', 'Actions']}
          loading={campaignsLoading}
          empty="No campaigns awaiting approval"
        >
          {!campaignsLoading &&
            campaigns.map((c) => {
              const action = actionState[c.id];
              return (
                <tr key={c.id} className="hover:bg-oda-ivory">
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{c.name}</p>
                    <p className="text-xs text-oda-charcoal/40 font-mono">{c.id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                    {c.manufacturer?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <AdminStatusPill label={c.billingModel} variant="neutral" />
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                    KSh {c.budgetKes.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(c)}
                        disabled={!!action}
                        className="flex items-center gap-1 text-xs font-bold text-oda-green-dark bg-oda-mint hover:bg-oda-mint/80 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {action === 'approving' ?
                          <Loader2 size={12} className="animate-spin" />
                        : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectTarget(c);
                          setRejectReason('');
                        }}
                        disabled={!!action}
                        className="flex items-center gap-1 text-xs font-bold text-oda-red bg-oda-red/10 hover:bg-oda-red/15 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {action === 'rejecting' ?
                          <Loader2 size={12} className="animate-spin" />
                        : <XCircle size={12} />}
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </AdminDataTable>
      </div>

      {error && (
        <div className="mb-4 text-sm text-oda-red bg-oda-red/10 border border-oda-red/20 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Registered Tenants', value: total.toLocaleString() },
          { label: 'Active', value: activeCount.toLocaleString() },
          { label: 'Pending Campaigns', value: campaignTotal.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mb-1">{s.label}</p>
            <p className="text-xl font-extrabold text-oda-charcoal font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
          <RefreshCw size={16} />
        </button>
      </div>

      <AdminDataTable
        columns={['Tenant', 'Trading name', 'Branches', 'Orders', 'Status', '']}
        loading={loading}
        empty="No tenants found"
      >
        {!loading &&
          suppliers.map((s) => {
            const branchCount = s.branches?.length ?? 0;
            const activeBranches = s.branches?.filter((b) => b.isActive).length ?? 0;
            return (
              <tr key={s.id} className="hover:bg-oda-ivory">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-oda-purple/10 flex items-center justify-center">
                      <Package size={14} className="text-oda-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{s.name}</p>
                      <p className="text-xs text-oda-charcoal/40 font-mono">{s.id.slice(0, 12)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                  {s.tradingName ?? '—'}
                </td>
                <td className="px-5 py-3 text-sm text-oda-charcoal/60 font-plus-jakarta">
                  {branchCount > 0 ? `${activeBranches}/${branchCount} active` : '—'}
                </td>
                <td className="px-5 py-3 text-sm font-bold text-oda-charcoal font-plus-jakarta">
                  {s._count?.orders?.toLocaleString() ?? '—'}
                </td>
                <td className="px-5 py-3">
                  <AdminStatusPill
                    label={s.isActive ? 'ACTIVE' : 'INACTIVE'}
                    variant={s.isActive ? 'success' : 'neutral'}
                  />
                </td>
                <td className="px-5 py-3">
                  <Link
                    href="/portal/manufacturer"
                    className="text-xs text-oda-green font-bold font-plus-jakarta hover:underline"
                  >
                    Portal →
                  </Link>
                </td>
              </tr>
            );
          })}
      </AdminDataTable>

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta mb-2">
              Reject campaign
            </h3>
            <p className="text-sm text-oda-charcoal/60 font-plus-jakarta mb-4">
              Provide a reason for rejecting &ldquo;{rejectTarget.name}&rdquo;.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason…"
              rows={3}
              className="w-full border border-oda-charcoal/10 rounded-xl px-3 py-2 text-sm font-plus-jakarta mb-4 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-bold text-oda-charcoal/60 hover:text-oda-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionState[rejectTarget.id] === 'rejecting'}
                className="px-4 py-2 text-sm font-bold text-white bg-oda-red rounded-xl hover:bg-oda-red/90 disabled:opacity-50"
              >
                Reject campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
