'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Building2, CheckCircle, Eye, Loader2, XCircle } from 'lucide-react';
import { adminB2bApi } from '@/lib/api-client';

type Row = {
  id: string;
  businessName: string;
  ownerName: string;
  businessPhone?: string;
  county?: string | null;
  businessType: string;
  kycStatus: string;
  createdAt: string;
  slaAgeHours?: number;
  kycDocuments?: Array<{ id: string; documentType: string }>;
};

const statusConfig: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  MORE_INFO_REQUIRED: 'bg-orange-100 text-orange-700',
};

type ViewPayload =
  | { mode: 'PRESIGNED'; url: string; expiresIn: number }
  | { mode: 'STREAM'; streamPath: string; documentId: string };

export default function AdminB2BKycPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterStatus = searchParams.get('status') ?? '';
  const filterSearch = searchParams.get('q') ?? '';
  const filterSort = searchParams.get('sort') ?? 'recent';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [preview, setPreview] = useState<{ title: string; src: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [searchDraft, setSearchDraft] = useState(filterSearch);
  const [creditTermsDays, setCreditTermsDays] = useState<14 | 30>(14);

  useEffect(() => {
    setSearchDraft(filterSearch);
  }, [filterSearch]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const setQuery = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const q = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') q.delete(k);
        else q.set(k, v);
      }
      if (resetPage) q.set('page', '1');
      router.push(`${pathname}?${q.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setErr(null);
      }
      try {
        const res = await adminB2bApi.list({
          page: pageNum,
          limit: 50,
          ...(filterStatus ? { status: filterStatus } : {}),
          ...(filterSearch.trim() ? { search: filterSearch.trim() } : {}),
          ...(filterSort ? { sort: filterSort } : {}),
        });
        const data = res.data as { rows: Row[]; total: number; page: number };
        setTotal(data.total);
        if (append) setRows((r) => [...r, ...data.rows]);
        else setRows(data.rows);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load applications';
        setErr(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterSearch, filterSort, filterStatus],
  );

  useEffect(() => {
    void load(page, page > 1);
  }, [load, page, filterStatus, filterSearch, filterSort]);

  const hasMore = rows.length < total;

  const counts = useMemo(() => {
    const c = { PENDING: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0 };
    for (const r of rows) {
      const k = r.kycStatus as keyof typeof c;
      if (k in c) c[k] += 1;
    }
    return c;
  }, [rows]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 108,
    overscan: 8,
  });

  async function openPreview(businessId: string, documentId: string, title: string) {
    setPreviewLoading(true);
    setPreview({ title, src: '' });
    try {
      const { data } = await adminB2bApi.getKycDocumentViewUrl(businessId, documentId);
      const payload = data as ViewPayload;
      if (payload.mode === 'PRESIGNED') {
        setPreview({ title, src: payload.url });
        return;
      }
      const res = await adminB2bApi.getKycDocumentFile(payload.documentId);
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      setPreview({ title, src: url });
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (preview?.src.startsWith('blob:')) URL.revokeObjectURL(preview.src);
    };
  }, [preview]);

  async function doReview(row: Row, outcome: 'APPROVE' | 'REJECT') {
    let reason: string | undefined;
    if (outcome === 'REJECT') {
      reason =
        typeof window !== 'undefined'
          ? window.prompt('Rejection reason (required for ops):') ?? undefined
          : undefined;
      if (!reason?.trim()) return;
    }
    setActionBusy(true);
    try {
      await adminB2bApi.review(row.id, {
        outcome,
        reason,
        ...(outcome === 'APPROVE' ? { creditTermsDays } : {}),
      });
      await load(1, false);
      setSelected(null);
    } finally {
      setActionBusy(false);
    }
  }

  async function markOpen(row: Row) {
    setActionBusy(true);
    try {
      await adminB2bApi.openReview(row.id);
      await load(1, false);
    } finally {
      setActionBusy(false);
    }
  }

  async function bulkMarkUnderReview() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setActionBusy(true);
    try {
      for (const id of ids) {
        await adminB2bApi.openReview(id);
      }
      setSelectedIds(new Set());
      await load(1, false);
    } finally {
      setActionBusy(false);
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function downloadCsv() {
    try {
      const res = await adminB2bApi.exportCsvBlob({
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(filterSearch.trim() ? { search: filterSearch.trim() } : {}),
        ...(filterSort ? { sort: filterSort } : {}),
      });
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'b2b-applications.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* toast optional */
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-[#E8E8E0]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#E8E8E0]">
              <p className="font-bold text-[#1A1A1A] font-plus-jakarta text-sm truncate pr-2">{preview.title}</p>
              <button
                type="button"
                className="text-sm text-[#666] font-plus-jakarta shrink-0"
                onClick={() => {
                  if (preview.src.startsWith('blob:')) URL.revokeObjectURL(preview.src);
                  setPreview(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="flex-1 min-h-[50vh] bg-[#F5F5F0] relative">
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#198A2E]" />
                </div>
              ) : preview.src ? (
                <iframe title={preview.title} src={preview.src} className="w-full h-[70vh] rounded-b-2xl border-0" />
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 min-w-0 flex-row">
      <div className="flex flex-1 flex-col p-6 overflow-hidden min-h-0 min-w-0">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">B2B Applications</h1>
        <p className="text-sm text-[#999] font-plus-jakarta mb-4">
          Paged from /api/v1/admin/b2b/applications · filters persist in the URL
        </p>

        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <label className="flex flex-col text-xs font-plus-jakarta text-[#666]">
            Status
            <select
              value={filterStatus}
              onChange={(e) => setQuery({ status: e.target.value || null })}
              className="mt-1 rounded-xl border border-[#E8E8E0] px-3 py-2 text-sm bg-white"
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="MORE_INFO_REQUIRED">MORE_INFO_REQUIRED</option>
            </select>
          </label>
          <label className="flex flex-col text-xs font-plus-jakarta text-[#666] flex-1 min-w-[200px]">
            Search
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onBlur={() => setQuery({ q: searchDraft.trim() || null })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              placeholder="Business, owner, phone"
              className="mt-1 rounded-xl border border-[#E8E8E0] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs font-plus-jakarta text-[#666]">
            Sort
            <select
              value={filterSort}
              onChange={(e) => setQuery({ sort: e.target.value })}
              className="mt-1 rounded-xl border border-[#E8E8E0] px-3 py-2 text-sm bg-white"
            >
              <option value="recent">Newest</option>
              <option value="sla">SLA (oldest first)</option>
              <option value="updated_desc">Updated</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            className="text-sm font-bold text-[#198A2E] font-plus-jakarta py-2"
          >
            Export CSV
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm text-[#666] font-plus-jakarta">{selectedIds.size} selected</span>
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => void bulkMarkUnderReview()}
              className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold font-plus-jakarta"
            >
              Mark UNDER_REVIEW
            </button>
          </div>
        )}

        {err && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-700 px-4 py-2 text-sm font-plus-jakarta">{err}</div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
          {[
            { label: 'Pending', value: counts.PENDING, color: 'text-yellow-600' },
            { label: 'Under Review', value: counts.UNDER_REVIEW, color: 'text-blue-600' },
            { label: 'Approved', value: counts.APPROVED, color: 'text-green-600' },
            { label: 'Rejected', value: counts.REJECTED, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-4 text-center">
              <p className="text-xs text-[#999] font-plus-jakarta mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold font-plus-jakarta ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[#666] font-plus-jakarta">
            <Loader2 className="animate-spin" size={18} /> Loading dossiers…
          </div>
        ) : (
          <div ref={listRef} className="flex-1 overflow-auto min-h-[320px] border border-[#E8E8E0] rounded-2xl bg-white">
            <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const app = rows[vi.index];
                if (!app) return null;
                return (
                  <div
                    key={app.id}
                    className="absolute left-0 top-0 w-full flex gap-2 items-stretch border-b border-[#F0F0EA] px-2 py-2"
                    style={{ transform: `translateY(${vi.start}px)` }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleRow(app.id)}
                      className="mt-4 self-start"
                      aria-label={`Select ${app.businessName}`}
                    />
                    <button
                      type="button"
                      onClick={() => setSelected(app)}
                      className={`flex-1 text-left rounded-xl border p-4 cursor-pointer hover:border-[#198A2E]/30 ${
                        selected?.id === app.id ? 'border-[#198A2E]' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#198A2E]" />
                          <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{app.businessName}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${
                            statusConfig[app.kycStatus] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {app.kycStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#999] font-plus-jakarta">
                        <span>
                          {app.ownerName}
                          {app.county ? ` · ${app.county}` : ''}
                        </span>
                        <span>{app.businessType}</span>
                        <span>
                          {new Date(app.createdAt).toLocaleDateString()} · SLA {app.slaAgeHours ?? '—'}h
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <div className="p-4 text-center border-t border-[#E8E8E0]">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => setQuery({ page: String(page + 1) }, false)}
                  className="text-sm font-bold text-[#198A2E] font-plus-jakarta"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
            {!rows.length && (
              <p className="text-[#888] font-plus-jakarta text-sm p-6">No wholesale applications loaded.</p>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="w-96 border-l border-[#E8E8E0] p-5 bg-white overflow-y-auto shrink-0 max-h-full">
          <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">{selected.businessName}</h3>
          <div className="space-y-2 mb-5">
            {[
              ['Owner', selected.ownerName],
              ['Phone', selected.businessPhone ?? '—'],
              ['County', selected.county ?? '—'],
              ['Type', selected.businessType],
              ['Applied', new Date(selected.createdAt).toLocaleString()],
              ['Docs', String(selected.kycDocuments?.length ?? 0)],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-2 text-xs font-plus-jakarta">
                <span className="text-[#999] shrink-0">{k}</span>
                <span className="font-semibold text-[#1A1A1A] text-right break-all">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#BBB] mb-3 font-mono truncate" title={selected.id}>
            id: {selected.id}
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-xs font-bold text-[#1A1A1A] font-plus-jakarta">Documents</p>
            {(selected.kycDocuments ?? []).length === 0 ? (
              <p className="text-xs text-[#999]">No uploads</p>
            ) : (
              (selected.kycDocuments ?? []).map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className="w-full flex items-center justify-between gap-2 bg-[#F5F5F0] text-[#1A1A1A] py-2 px-3 rounded-xl text-xs font-bold font-plus-jakarta"
                  onClick={() =>
                    void openPreview(selected.id, doc.id, `${doc.documentType} · ${doc.id.slice(0, 8)}…`)
                  }
                >
                  <span className="truncate">{doc.documentType}</span>
                  <Eye size={14} className="shrink-0" />
                </button>
              ))
            )}
          </div>
          {['PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED'].includes(selected.kycStatus) && (
            <div className="space-y-2">
              <div className="rounded-xl border border-oda-charcoal/10 p-3 space-y-2">
                <p className="text-xs font-bold text-oda-charcoal font-plus-jakarta">Trade credit terms (on approve)</p>
                <div className="flex gap-2">
                  {([14, 30] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setCreditTermsDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold font-plus-jakarta border ${
                        creditTermsDays === days
                          ? 'bg-oda-mint border-oda-green text-oda-green'
                          : 'bg-white border-oda-charcoal/10 text-oda-charcoal/60'
                      }`}
                    >
                      NET_{days}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => void markOpen(selected)}
                className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta"
              >
                Mark UNDER_REVIEW
              </button>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => void doReview(selected, 'APPROVE')}
                className="w-full bg-[#198A2E] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => void doReview(selected, 'REJECT')}
                className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta flex items-center justify-center gap-2"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
