'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  ImageIcon,
  Star,
  Paperclip,
  Package,
  Image,
  Clock,
  Filter,
  Loader2,
} from 'lucide-react';

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
  submitter: string;
  submitterRole: string;
  createdAt: string;
  status: ItemStatus;
  priority: 1 | 2 | 3;
  preview?: string;
}

const mockItems: ModerationItem[] = [
  { id: 'mod-001', type: 'PRODUCT_EDIT', entityId: 'prod-123', title: 'Price update: Brookside Milk 1L → KES 265', submitter: 'Brookside Dairy', submitterRole: 'SUPPLIER', createdAt: '10 min ago', status: 'PENDING', priority: 2 },
  { id: 'mod-002', type: 'NEW_PRODUCT_PROHIBITED_CATEGORY', entityId: 'prod-456', title: 'New product: Tusker Lager 500ml (Alcohol)', submitter: 'EABL', submitterRole: 'MANUFACTURER', createdAt: '25 min ago', status: 'PENDING', priority: 3 },
  { id: 'mod-003', type: 'MANUFACTURER_ASSET', entityId: 'asset-789', title: 'Campaign banner: Safaricom Promo May 2026', submitter: 'Safaricom', submitterRole: 'MANUFACTURER', createdAt: '1 hr ago', status: 'PENDING', priority: 2 },
  { id: 'mod-004', type: 'CUSTOMER_REVIEW', entityId: 'review-101', title: '"Great product, very fresh!" — 5★ review', submitter: '+254712345678', submitterRole: 'CUSTOMER', createdAt: '2 hr ago', status: 'PENDING', priority: 1 },
  { id: 'mod-005', type: 'SUPPORT_ATTACHMENT', entityId: 'attach-202', title: 'Receipt photo for refund request TKT-5512', submitter: '+254798765432', submitterRole: 'CUSTOMER', createdAt: '3 hr ago', status: 'PENDING', priority: 1 },
];

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

const PRIORITY_LABELS: Record<number, { label: string; cls: string }> = {
  1: { label: 'Normal', cls: 'bg-[#F5F5F0] text-[#666]' },
  2: { label: 'High', cls: 'bg-orange-50 text-orange-600' },
  3: { label: 'Critical', cls: 'bg-red-50 text-red-600' },
};

type ActionState = Record<string, 'approving' | 'rejecting' | 'flagging' | null>;

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>(mockItems);
  const [filterType, setFilterType] = useState<ItemType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ItemStatus>('PENDING');
  const [selected, setSelected] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});

  const filtered = items.filter(
    (i) =>
      i.status === filterStatus &&
      (filterType === '' || i.type === filterType),
  );

  const doAction = async (id: string, action: 'approve' | 'reject' | 'flag', reason?: string) => {
    setActionState((s) => ({ ...s, [id]: action === 'approve' ? 'approving' : action === 'reject' ? 'rejecting' : 'flagging' }));
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'FLAGGED' }
          : i,
      ),
    );
    setActionState((s) => ({ ...s, [id]: null }));
    if (selected?.id === id) setSelected(null);
  };

  const handleReject = (id: string) => {
    setRejectTarget(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setShowRejectModal(false);
    await doAction(rejectTarget, 'reject', rejectReason);
    setRejectReason('');
    setRejectTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Content Moderation</h1>
          <p className="text-sm text-[#666] font-plus-jakarta mt-0.5">
            {filtered.length} items awaiting review
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | '')}
            className="text-xs border border-[#E8E8E0] rounded-xl px-3 py-2 font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20"
          >
            <option value="">All Types</option>
            {(Object.keys(TYPE_LABELS) as ItemType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ItemStatus)}
            className="text-xs border border-[#E8E8E0] rounded-xl px-3 py-2 font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FLAGGED">Flagged</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#999]">
                <CheckCircle size={40} className="mb-3 text-[#198A2E]" />
                <p className="text-sm font-plus-jakarta">No items in this queue</p>
              </div>
            ) : (
              <table className="w-full text-xs font-plus-jakarta">
                <thead className="bg-[#F5F5F0]">
                  <tr>
                    {['Type', 'Item', 'Submitter', 'Age', 'Priority', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[#666] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const p = PRIORITY_LABELS[item.priority];
                    const state = actionState[item.id];
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className={`border-t border-[#F5F5F0] cursor-pointer hover:bg-[#FAFAFA] transition-colors ${selected?.id === item.id ? 'bg-[#EBF9EE]' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[#444]">
                            {TYPE_ICONS[item.type]}
                            <span>{TYPE_LABELS[item.type]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#1A1A1A] max-w-xs truncate">{item.title}</td>
                        <td className="px-4 py-3">
                          <p className="text-[#444]">{item.submitter}</p>
                          <p className="text-[#999] text-[10px]">{item.submitterRole}</p>
                        </td>
                        <td className="px-4 py-3 text-[#999] flex items-center gap-1">
                          <Clock size={11} />{item.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.cls}`}>{p.label}</span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {item.status === 'PENDING' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => doAction(item.id, 'approve')}
                                disabled={!!state}
                                className="p-1.5 hover:bg-[#EBF9EE] rounded-lg transition-colors"
                                title="Approve"
                              >
                                {state === 'approving' ? <Loader2 size={14} className="animate-spin text-[#198A2E]" /> : <CheckCircle size={14} className="text-[#198A2E]" />}
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={!!state}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                {state === 'rejecting' ? <Loader2 size={14} className="animate-spin text-red-500" /> : <XCircle size={14} className="text-red-500" />}
                              </button>
                              <button
                                onClick={() => doAction(item.id, 'flag', 'Flagged for legal review')}
                                disabled={!!state}
                                className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Flag for Legal"
                              >
                                {state === 'flagging' ? <Loader2 size={14} className="animate-spin text-orange-500" /> : <Flag size={14} className="text-orange-500" />}
                              </button>
                            </div>
                          )}
                          {item.status !== 'PENDING' && (
                            <span className={`text-[10px] font-semibold ${item.status === 'APPROVED' ? 'text-[#198A2E]' : item.status === 'REJECTED' ? 'text-red-500' : 'text-orange-500'}`}>
                              {item.status}
                            </span>
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

        {/* Preview panel */}
        <div className="bg-white rounded-2xl border border-[#E8E8E0] h-fit">
          {selected ? (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#EBF9EE] rounded-lg flex items-center justify-center text-[#198A2E]">
                  {TYPE_ICONS[selected.type]}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A] font-plus-jakarta">{TYPE_LABELS[selected.type]}</p>
                  <p className="text-[10px] text-[#999] font-plus-jakarta">ID: {selected.entityId}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-plus-jakarta mb-4">
                <div>
                  <p className="text-[#999] mb-0.5">Title</p>
                  <p className="text-[#1A1A1A] font-semibold">{selected.title}</p>
                </div>
                <div>
                  <p className="text-[#999] mb-0.5">Submitted by</p>
                  <p className="text-[#444]">{selected.submitter} <span className="text-[#999]">({selected.submitterRole})</span></p>
                </div>
                <div>
                  <p className="text-[#999] mb-0.5">Age</p>
                  <p className="text-[#444]">{selected.createdAt}</p>
                </div>
                <div>
                  <p className="text-[#999] mb-0.5">Priority</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORITY_LABELS[selected.priority].cls}`}>
                    {PRIORITY_LABELS[selected.priority].label}
                  </span>
                </div>
              </div>

              {/* Preview placeholder */}
              <div className="w-full h-32 bg-[#F5F5F0] rounded-xl flex items-center justify-center mb-4">
                <div className="flex flex-col items-center gap-2 text-[#CCC]">
                  <Eye size={24} />
                  <p className="text-xs font-plus-jakarta">Preview</p>
                </div>
              </div>

              {selected.status === 'PENDING' && (
                <div className="space-y-2">
                  <button
                    onClick={() => doAction(selected.id, 'approve')}
                    className="w-full py-2.5 bg-[#198A2E] text-white rounded-xl text-xs font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors"
                  >
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => handleReject(selected.id)}
                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold font-plus-jakarta hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => doAction(selected.id, 'flag', 'Flagged for legal review')}
                    className="w-full py-2.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold font-plus-jakarta hover:bg-orange-100 transition-colors"
                  >
                    Flag for Legal Review
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#999]">
              <Eye size={32} className="mb-2" />
              <p className="text-xs font-plus-jakarta">Select an item to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-3">Reject Item</h3>
            <p className="text-xs text-[#666] font-plus-jakarta mb-3">Provide a reason for rejection. This will be sent to the submitter.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Image does not meet quality standards…"
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E8E0] font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-red-400/20 mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTarget(null); }}
                className="flex-1 py-2.5 rounded-xl bg-[#F5F5F0] text-[#444] text-xs font-bold font-plus-jakarta"
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
