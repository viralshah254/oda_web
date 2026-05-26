'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Image,
  Star,
  Paperclip,
  Package,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { moderationAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

type ItemType =
  | 'PRODUCT_EDIT'
  | 'MANUFACTURER_ASSET'
  | 'CUSTOMER_REVIEW'
  | 'SUPPORT_ATTACHMENT'
  | 'NEW_PRODUCT_PROHIBITED_CATEGORY';

type ItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

interface ModerationItem {
  id: string;
  type: ItemType;
  entityId: string;
  title: string;
  status: ItemStatus;
  priority: number;
  createdAt: string;
  submitter?: { id?: string; name?: string; role?: string };
  submitterName?: string;
  submitterRole?: string;
}

const TYPE_ICONS: Record<ItemType, React.ReactNode> = {
  PRODUCT_EDIT: <Package size={16} />,
  MANUFACTURER_ASSET: <Image size={16} />,
  CUSTOMER_REVIEW: <Star size={16} />,
  SUPPORT_ATTACHMENT: <Paperclip size={16} />,
  NEW_PRODUCT_PROHIBITED_CATEGORY: <Shield size={16} />,
};

const TYPE_LABELS: Record<ItemType, string> = {
  PRODUCT_EDIT: 'Product Edit',
  MANUFACTURER_ASSET: 'Creative Asset',
  CUSTOMER_REVIEW: 'Customer Review',
  SUPPORT_ATTACHMENT: 'Support File',
  NEW_PRODUCT_PROHIBITED_CATEGORY: 'Prohibited Category',
};

const PRIORITY_LABELS: Record<number, { label: string; variant: 'neutral' | 'warning' | 'error' }> = {
  1: { label: 'Normal', variant: 'neutral' },
  2: { label: 'High', variant: 'warning' },
  3: { label: 'Critical', variant: 'error' },
};

type ActionState = Record<string, 'approving' | 'rejecting' | null>;

function formatAge(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`;
}

function mapItem(raw: Record<string, unknown>): ModerationItem {
  const submitter = raw.submitter as ModerationItem['submitter'];
  return {
    id: String(raw.id),
    type: raw.type as ItemType,
    entityId: String(raw.entityId ?? ''),
    title: String(raw.title ?? 'Untitled'),
    status: raw.status as ItemStatus,
    priority: Number(raw.priority ?? 1),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    submitter,
    submitterName: submitter?.name,
    submitterRole: submitter?.role,
  };
}

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ItemType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ItemStatus>('PENDING');
  const [selected, setSelected] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await moderationAdminApi.queue({
        type: filterType || undefined,
        status: filterStatus,
      });
      const rawItems = res.data?.items ?? [];
      setItems(rawItems.map((i: Record<string, unknown>) => mapItem(i)));
      setTotal(res.data?.total ?? rawItems.length);
    } catch {
      setError('Failed to load moderation queue');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const doApprove = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: 'approving' }));
    try {
      await moderationAdminApi.approve(id);
      if (selected?.id === id) setSelected(null);
      await load();
    } catch {
      setError('Failed to approve item');
    } finally {
      setActionState((s) => ({ ...s, [id]: null }));
    }
  };

  const doReject = async (id: string, reason: string) => {
    setActionState((s) => ({ ...s, [id]: 'rejecting' }));
    try {
      await moderationAdminApi.reject(id, reason);
      if (selected?.id === id) setSelected(null);
      await load();
    } catch {
      setError('Failed to reject item');
    } finally {
      setActionState((s) => ({ ...s, [id]: null }));
    }
  };

  const handleReject = (id: string) => {
    setRejectTarget(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setShowRejectModal(false);
    await doReject(rejectTarget, rejectReason);
    setRejectReason('');
    setRejectTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminPageHeader
        title="Content Moderation"
        subtitle={loading ? 'Loading…' : `${total} item${total === 1 ? '' : 's'} in queue`}
        actions={
          <>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ItemType | '')}
              className="text-xs border border-oda-charcoal/10 rounded-xl px-3 py-2 font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20 bg-white"
            >
              <option value="">All Types</option>
              {(Object.keys(TYPE_LABELS) as ItemType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ItemStatus)}
              className="text-xs border border-oda-charcoal/10 rounded-xl px-3 py-2 font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20 bg-white"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FLAGGED">Flagged</option>
            </select>
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="text-oda-green animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-oda-charcoal/40">
                <CheckCircle size={40} className="mb-3 text-oda-green" />
                <p className="text-sm font-plus-jakarta">No items in this queue</p>
              </div>
            ) : (
              <table className="w-full text-xs font-plus-jakarta">
                <thead className="bg-oda-ivory">
                  <tr>
                    {['Type', 'Item', 'Submitter', 'Age', 'Priority', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-oda-charcoal/50 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const p = PRIORITY_LABELS[item.priority] ?? PRIORITY_LABELS[1];
                    const state = actionState[item.id];
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className={`border-t border-oda-charcoal/5 cursor-pointer hover:bg-oda-ivory transition-colors ${
                          selected?.id === item.id ? 'bg-oda-mint' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-oda-charcoal/70">
                            {TYPE_ICONS[item.type]}
                            <span>{TYPE_LABELS[item.type]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-oda-charcoal max-w-xs truncate">{item.title}</td>
                        <td className="px-4 py-3">
                          <p className="text-oda-charcoal/70">{item.submitterName ?? '—'}</p>
                          <p className="text-oda-charcoal/40 text-[10px]">{item.submitterRole ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 text-oda-charcoal/40">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />{formatAge(item.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusPill label={p.label} variant={p.variant} />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {item.status === 'PENDING' ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => doApprove(item.id)}
                                disabled={!!state}
                                className="p-1.5 hover:bg-oda-mint rounded-lg transition-colors"
                                title="Approve"
                              >
                                {state === 'approving' ? (
                                  <Loader2 size={14} className="animate-spin text-oda-green" />
                                ) : (
                                  <CheckCircle size={14} className="text-oda-green" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={!!state}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                {state === 'rejecting' ? (
                                  <Loader2 size={14} className="animate-spin text-red-500" />
                                ) : (
                                  <XCircle size={14} className="text-red-500" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <AdminStatusPill
                              label={item.status}
                              variant={
                                item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'error' : 'warning'
                              }
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-oda-charcoal/8 h-fit">
          {selected ? (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-oda-mint rounded-lg flex items-center justify-center text-oda-green">
                  {TYPE_ICONS[selected.type]}
                </div>
                <div>
                  <p className="text-xs font-bold text-oda-charcoal font-plus-jakarta">{TYPE_LABELS[selected.type]}</p>
                  <p className="text-[10px] text-oda-charcoal/40 font-plus-jakarta">ID: {selected.entityId}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-plus-jakarta mb-4">
                <div>
                  <p className="text-oda-charcoal/40 mb-0.5">Title</p>
                  <p className="text-oda-charcoal font-semibold">{selected.title}</p>
                </div>
                <div>
                  <p className="text-oda-charcoal/40 mb-0.5">Submitted by</p>
                  <p className="text-oda-charcoal/70">
                    {selected.submitterName ?? '—'}{' '}
                    {selected.submitterRole && <span className="text-oda-charcoal/40">({selected.submitterRole})</span>}
                  </p>
                </div>
                <div>
                  <p className="text-oda-charcoal/40 mb-0.5">Age</p>
                  <p className="text-oda-charcoal/70">{formatAge(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-oda-charcoal/40 mb-0.5">Priority</p>
                  <AdminStatusPill
                    label={PRIORITY_LABELS[selected.priority]?.label ?? 'Normal'}
                    variant={PRIORITY_LABELS[selected.priority]?.variant ?? 'neutral'}
                  />
                </div>
              </div>

              <div className="w-full h-32 bg-oda-ivory rounded-xl flex items-center justify-center mb-4">
                <div className="flex flex-col items-center gap-2 text-oda-charcoal/20">
                  <Eye size={24} />
                  <p className="text-xs font-plus-jakarta">Preview</p>
                </div>
              </div>

              {selected.status === 'PENDING' && (
                <div className="space-y-2">
                  <button
                    onClick={() => doApprove(selected.id)}
                    disabled={!!actionState[selected.id]}
                    className="w-full py-2.5 bg-oda-green text-white rounded-xl text-xs font-bold font-plus-jakarta hover:bg-oda-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionState[selected.id] === 'approving' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => handleReject(selected.id)}
                    disabled={!!actionState[selected.id]}
                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold font-plus-jakarta hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-oda-charcoal/40">
              <Eye size={32} className="mb-2" />
              <p className="text-xs font-plus-jakarta">Select an item to preview</p>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-3">Reject Item</h3>
            <p className="text-xs text-oda-charcoal/50 font-plus-jakarta mb-3">
              Provide a reason for rejection. This will be sent to the submitter.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Image does not meet quality standards…"
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-oda-charcoal/10 font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-red-400/20 mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTarget(null); }}
                className="flex-1 py-2.5 rounded-xl bg-oda-ivory text-oda-charcoal/70 text-xs font-bold font-plus-jakarta"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold font-plus-jakarta disabled:opacity-40"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
