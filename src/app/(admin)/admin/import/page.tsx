'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, Download, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, X } from 'lucide-react';

type ImportType = 'PRODUCTS' | 'SUPPLIER_PRICE_LIST' | 'INVENTORY' | 'CUSTOMERS' | 'LEGACY_ORDERS';

interface ImportJob {
  jobId: string;
  importType: ImportType;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  importedRows?: number;
  failedRows?: number;
  createdAt: string;
  errorReport?: { row: number; message: string }[];
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

const mockHistory: ImportJob[] = [
  { jobId: 'imp-001', importType: 'PRODUCTS', status: 'COMPLETED', totalRows: 150, importedRows: 148, failedRows: 2, createdAt: '2026-05-05 14:00' },
  { jobId: 'imp-002', importType: 'INVENTORY', status: 'PROCESSING', totalRows: 300, createdAt: '2026-05-06 09:00' },
];

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-[#EBF9EE] text-[#198A2E]',
    QUEUED: 'bg-blue-50 text-blue-600',
    PROCESSING: 'bg-orange-50 text-orange-600',
    FAILED: 'bg-red-50 text-red-600',
  };
  const icons: Record<string, React.ReactNode> = {
    COMPLETED: <CheckCircle size={11} />,
    FAILED: <XCircle size={11} />,
    PROCESSING: <Loader2 size={11} className="animate-spin" />,
    QUEUED: <Clock size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[#F5F5F0] text-[#666]'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState<ImportType>('PRODUCTS');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ rows: Record<string, string>[]; errors: { row: number; message: string }[] } | null>(null);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
  };

  const handleDryRun = async () => {
    if (!file) return;
    setUploading(true);
    // Simulate dry run
    await new Promise((r) => setTimeout(r, 800));
    setPreview({
      rows: [{ name: 'Brookside UHT Milk', sku: 'BRK-001', price_kes: '230' }],
      errors: [],
    });
    setUploading(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setActiveJob({
      jobId: `imp-${Date.now()}`,
      importType: selectedType,
      status: 'QUEUED',
      totalRows: 150,
      createdAt: new Date().toLocaleString(),
    });
    setFile(null);
    setPreview(null);
    setUploading(false);
  };

  const config = IMPORT_CONFIGS[selectedType];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Data Import</h1>
        <p className="text-sm text-[#666] font-plus-jakarta mt-0.5">Upload CSV files to bulk import data into the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type selector */}
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <label className="text-xs font-semibold text-[#666] font-plus-jakarta block mb-2">Import Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(IMPORT_CONFIGS) as ImportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setFile(null); setPreview(null); }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold font-plus-jakarta border transition-colors ${
                    selectedType === type
                      ? 'bg-[#198A2E] text-white border-[#198A2E]'
                      : 'bg-white text-[#444] border-[#E8E8E0] hover:bg-[#F5F5F0]'
                  }`}
                >
                  {IMPORT_CONFIGS[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Columns info + template */}
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#666] font-plus-jakarta">Required Columns</p>
              <button
                onClick={() => downloadTemplate(selectedType)}
                className="flex items-center gap-1.5 text-xs text-[#198A2E] font-semibold font-plus-jakarta hover:underline"
              >
                <Download size={12} /> Download Template
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.columns.map((col) => (
                <span key={col} className="text-[10px] bg-[#F5F5F0] text-[#444] px-2 py-1 rounded font-mono">{col}</span>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragging ? 'border-[#198A2E] bg-[#EBF9EE]' : 'border-[#E8E8E0] hover:border-[#198A2E] hover:bg-[#FAFAFA]'
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Upload size={32} className={`mb-3 ${dragging ? 'text-[#198A2E]' : 'text-[#CCC]'}`} />
            {file ? (
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#198A2E]" />
                <span className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-1">
                  <X size={14} className="text-[#999]" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">Drop CSV here or click to browse</p>
                <p className="text-xs text-[#999] font-plus-jakarta mt-1">Only .csv files accepted</p>
              </>
            )}
          </div>

          {file && (
            <div className="flex gap-3">
              <button
                onClick={handleDryRun}
                disabled={uploading}
                className="flex-1 py-3 rounded-xl border border-[#198A2E] text-[#198A2E] text-sm font-bold font-plus-jakarta hover:bg-[#EBF9EE] transition-colors disabled:opacity-40"
              >
                {uploading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Dry Run (Validate)'}
              </button>
              <button
                onClick={handleImport}
                disabled={uploading}
                className="flex-1 py-3 rounded-xl bg-[#198A2E] text-white text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors disabled:opacity-40"
              >
                {uploading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Import'}
              </button>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#1A1A1A] font-plus-jakarta">Preview (first 10 rows)</p>
                {preview.errors.length > 0 && (
                  <button onClick={() => setShowErrors(true)} className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                    <AlertTriangle size={12} /> {preview.errors.length} errors
                  </button>
                )}
                {preview.errors.length === 0 && (
                  <span className="flex items-center gap-1 text-xs text-[#198A2E] font-semibold">
                    <CheckCircle size={12} /> No validation errors
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="text-[10px] font-plus-jakarta w-full">
                  <thead>
                    <tr className="bg-[#F5F5F0]">
                      {Object.keys(preview.rows[0] ?? {}).map((k) => (
                        <th key={k} className="text-left px-2 py-2 text-[#666] font-semibold">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-t border-[#F5F5F0]">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-2 text-[#444]">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active job status */}
          {activeJob && (
            <div className="bg-white rounded-2xl border border-[#E8E8E0] p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{activeJob.importType} import in progress</p>
                <p className="text-xs text-[#666] font-plus-jakarta">{activeJob.totalRows} rows · {activeJob.createdAt}</p>
              </div>
              <StatusBadge status={activeJob.status} />
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="bg-white rounded-2xl border border-[#E8E8E0] h-fit">
          <div className="p-5 border-b border-[#E8E8E0]">
            <h2 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">Import History</h2>
          </div>
          <div className="divide-y divide-[#F5F5F0]">
            {mockHistory.map((job) => (
              <div key={job.jobId} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-[#1A1A1A] font-plus-jakarta">{IMPORT_CONFIGS[job.importType]?.label}</p>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-[10px] text-[#999] font-plus-jakarta">{job.createdAt}</p>
                {job.importedRows !== undefined && (
                  <p className="text-[10px] text-[#444] font-plus-jakarta mt-0.5">
                    {job.importedRows} imported · {job.failedRows} failed
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error modal */}
      {showErrors && preview?.errors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">Validation Errors</h3>
              <button onClick={() => setShowErrors(false)}><X size={18} /></button>
            </div>
            <table className="w-full text-xs font-plus-jakarta">
              <thead>
                <tr className="bg-[#F5F5F0]">
                  <th className="text-left px-3 py-2 text-[#666]">Row</th>
                  <th className="text-left px-3 py-2 text-[#666]">Error</th>
                </tr>
              </thead>
              <tbody>
                {preview.errors.map((e, i) => (
                  <tr key={i} className="border-t border-[#F5F5F0]">
                    <td className="px-3 py-2 text-[#444]">{e.row}</td>
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
