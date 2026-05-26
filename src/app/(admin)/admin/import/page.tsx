'use client';

import { useState, useRef, useEffect, useCallback, DragEvent } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertTriangle, Loader2, X, RefreshCw } from 'lucide-react';
import { apiClient, importAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

type ImportType = 'PRODUCTS' | 'SUPPLIER_PRICE_LIST' | 'INVENTORY' | 'CUSTOMERS' | 'LEGACY_ORDERS';

interface ImportJob {
  id: string;
  importType: ImportType;
  status: string;
  totalRows: number;
  importedRows?: number | null;
  failedRows?: number | null;
  createdAt: string;
}

const IMPORT_CONFIGS: Record<ImportType, { label: string; columns: string[]; templateRows: string[][] }> = {
  PRODUCTS: {
    label: 'Product Catalog',
    columns: ['name', 'sku', 'barcode', 'category_slug', 'brand', 'price_kes', 'stock_qty', 'images_csv'],
    templateRows: [['Brookside UHT Milk 1L', 'BRK-MILK-1L', '6001067015978', 'dairy', 'Brookside', '230', '50', '']],
  },
  SUPPLIER_PRICE_LIST: {
    label: 'Supplier Price List',
    columns: ['sku', 'supplier_cost', 'moq', 'lead_time'],
    templateRows: [['BRK-MILK-1L', '180', '12', '2']],
  },
  INVENTORY: {
    label: 'Branch Inventory',
    columns: ['branch_id', 'sku', 'qty_on_hand'],
    templateRows: [['branch-nairobi-west', 'BRK-MILK-1L', '48']],
  },
  CUSTOMERS: {
    label: 'Customer List',
    columns: ['name', 'phone', 'email', 'segment'],
    templateRows: [['Jane Wanjiku', '+254712345678', 'jane@example.com', 'VIP']],
  },
  LEGACY_ORDERS: {
    label: 'Legacy Order References',
    columns: ['old_order_id', 'new_order_id'],
    templateRows: [['OLD-12345', 'ORD-98765']],
  },
};

function downloadTemplate(type: ImportType) {
  const config = IMPORT_CONFIGS[type];
  const rows = [config.columns, ...config.templateRows];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oda_import_template_${type.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED') return 'error';
  if (status === 'PROCESSING') return 'warning';
  return 'info';
}

async function uploadImport(type: ImportType, file: File, dryRun: boolean) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/admin/imports/${type}`, formData, {
    params: dryRun ? { dryRun: 'true' } : undefined,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState<ImportType>('PRODUCTS');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{
    rows: Record<string, string>[];
    errors: { row: number; message: string }[];
  } | null>(null);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [history, setHistory] = useState<ImportJob[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await importAdminApi.list();
      setHistory(res.data?.items ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
  };

  const handleDryRun = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await uploadImport(selectedType, file, true);
      setPreview({
        rows: (data.preview ?? []) as Record<string, string>[],
        errors: (data.validationErrors ?? []).map((e: { row?: number; message?: string }, i: number) => ({
          row: e.row ?? i + 1,
          message: e.message ?? 'Validation error',
        })),
      });
    } catch {
      setError('Dry run failed — check file format and columns');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await uploadImport(selectedType, file, false);
      setActiveJob({
        id: data.jobId,
        importType: selectedType,
        status: data.status ?? 'QUEUED',
        totalRows: data.totalRows ?? 0,
        createdAt: new Date().toISOString(),
      });
      setFile(null);
      setPreview(null);
      await loadHistory();
    } catch {
      setError('Import failed — check file format and try again');
    } finally {
      setUploading(false);
    }
  };

  const config = IMPORT_CONFIGS[selectedType];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminPageHeader
        title="Data Import"
        subtitle="Upload CSV files to bulk import data into the platform"
        actions={
          <button onClick={loadHistory} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
            <RefreshCw size={16} />
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <label className="text-xs font-semibold text-oda-charcoal/50 font-plus-jakarta block mb-2">Import Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(IMPORT_CONFIGS) as ImportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setFile(null); setPreview(null); }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold font-plus-jakarta border transition-colors ${
                    selectedType === type
                      ? 'bg-oda-green text-white border-oda-green'
                      : 'bg-white text-oda-charcoal/70 border-oda-charcoal/10 hover:bg-oda-ivory'
                  }`}
                >
                  {IMPORT_CONFIGS[type].label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-oda-charcoal/50 font-plus-jakarta">Required Columns</p>
              <button
                onClick={() => downloadTemplate(selectedType)}
                className="flex items-center gap-1.5 text-xs text-oda-green font-semibold font-plus-jakarta hover:underline"
              >
                <Download size={12} /> Download Template
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.columns.map((col) => (
                <span key={col} className="text-[10px] bg-oda-ivory text-oda-charcoal/70 px-2 py-1 rounded font-mono">{col}</span>
              ))}
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragging ? 'border-oda-green bg-oda-mint' : 'border-oda-charcoal/10 hover:border-oda-green hover:bg-oda-ivory'
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Upload size={32} className={`mb-3 ${dragging ? 'text-oda-green' : 'text-oda-charcoal/20'}`} />
            {file ? (
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-oda-green" />
                <span className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-1">
                  <X size={14} className="text-oda-charcoal/40" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">Drop CSV here or click to browse</p>
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-1">Only .csv files accepted</p>
              </>
            )}
          </div>

          {file && (
            <div className="flex gap-3">
              <button
                onClick={handleDryRun}
                disabled={uploading}
                className="flex-1 py-3 rounded-xl border border-oda-green text-oda-green text-sm font-bold font-plus-jakarta hover:bg-oda-mint transition-colors disabled:opacity-40 flex items-center justify-center"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Dry Run (Validate)'}
              </button>
              <button
                onClick={handleImport}
                disabled={uploading}
                className="flex-1 py-3 rounded-xl bg-oda-green text-white text-sm font-bold font-plus-jakarta hover:bg-oda-green/90 transition-colors disabled:opacity-40 flex items-center justify-center"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Import'}
              </button>
            </div>
          )}

          {preview && (
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-oda-charcoal font-plus-jakarta">Preview (first 10 rows)</p>
                {preview.errors.length > 0 ? (
                  <button onClick={() => setShowErrors(true)} className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                    <AlertTriangle size={12} /> {preview.errors.length} errors
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-oda-green font-semibold">
                    <CheckCircle size={12} /> No validation errors
                  </span>
                )}
              </div>
              {preview.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="text-[10px] font-plus-jakarta w-full">
                    <thead>
                      <tr className="bg-oda-ivory">
                        {Object.keys(preview.rows[0]).map((k) => (
                          <th key={k} className="text-left px-2 py-2 text-oda-charcoal/50 font-semibold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="border-t border-oda-charcoal/5">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="px-2 py-2 text-oda-charcoal/70">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">No preview rows returned</p>
              )}
            </div>
          )}

          {activeJob && (
            <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{activeJob.importType} import queued</p>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">{activeJob.totalRows} rows · {activeJob.id.slice(0, 12)}…</p>
              </div>
              <AdminStatusPill label={activeJob.status} variant={statusVariant(activeJob.status)} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-oda-charcoal/8 h-fit">
          <div className="p-5 border-b border-oda-charcoal/8">
            <h2 className="text-sm font-bold text-oda-charcoal font-plus-jakarta">Import History</h2>
          </div>
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="text-oda-green animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-12 text-xs text-oda-charcoal/40 font-plus-jakarta">No import jobs yet</p>
          ) : (
            <div className="divide-y divide-oda-charcoal/5">
              {history.map((job) => (
                <div key={job.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-oda-charcoal font-plus-jakarta">
                      {IMPORT_CONFIGS[job.importType]?.label ?? job.importType}
                    </p>
                    <AdminStatusPill label={job.status} variant={statusVariant(job.status)} />
                  </div>
                  <p className="text-[10px] text-oda-charcoal/40 font-plus-jakarta">
                    {new Date(job.createdAt).toLocaleString('en-KE')}
                  </p>
                  {job.importedRows != null && (
                    <p className="text-[10px] text-oda-charcoal/60 font-plus-jakarta mt-0.5">
                      {job.importedRows} imported · {job.failedRows ?? 0} failed
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showErrors && preview?.errors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-oda-charcoal font-plus-jakarta">Validation Errors</h3>
              <button onClick={() => setShowErrors(false)}><X size={18} /></button>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead>
                <tr className="bg-oda-ivory">
                  <th className="text-left px-3 py-2 text-oda-charcoal/50">Row</th>
                  <th className="text-left px-3 py-2 text-oda-charcoal/50">Error</th>
                </tr>
              </thead>
              <tbody>
                {preview.errors.map((e, i) => (
                  <tr key={i} className="border-t border-oda-charcoal/5">
                    <td className="px-3 py-2 text-oda-charcoal/70">{e.row}</td>
                    <td className="px-3 py-2 text-red-600">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
