'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Copy,
  ImageOff,
  Barcode,
  Package,
  Link2,
  TrendingDown,
  Clock,
  Search,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { dataQualityAdminApi } from '@/lib/api-client';
import { AdminPageHeader } from '@/components/admin/admin-ui';

interface DQCheck {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  severity: 'ok' | 'warning' | 'critical';
  fixHref: string;
}

const CHECK_META: Omit<DQCheck, 'count' | 'severity'>[] = [
  {
    id: 'duplicates',
    label: 'Duplicate Products',
    description: 'Same barcode OR same name+brand+pack size with different IDs.',
    icon: <Copy size={20} />,
    fixHref: '/admin/catalog?filter=duplicates',
  },
  {
    id: 'missing-images',
    label: 'Missing Images',
    description: 'Active products with 0 approved product images.',
    icon: <ImageOff size={20} />,
    fixHref: '/admin/catalog?filter=no-images',
  },
  {
    id: 'missing-barcodes',
    label: 'Missing Barcodes',
    description: 'Products without a valid EAN-13 or UPC-A barcode.',
    icon: <Barcode size={20} />,
    fixHref: '/admin/catalog?filter=no-barcode',
  },
  {
    id: 'invalid-pack-sizes',
    label: 'Invalid Pack Sizes',
    description: 'Products where pack size is null or in an unrecognised format.',
    icon: <Package size={20} />,
    fixHref: '/admin/catalog?filter=invalid-packsize',
  },
  {
    id: 'unmapped-supplier-skus',
    label: 'Unmapped Supplier SKUs',
    description: 'Supplier SKU records not linked to a canonical product.',
    icon: <Link2 size={20} />,
    fixHref: '/admin/suppliers?filter=unmapped-skus',
  },
  {
    id: 'negative-inventory',
    label: 'Negative Inventory',
    description: 'Branch stock records with quantity below 0.',
    icon: <TrendingDown size={20} />,
    fixHref: '/admin/logistics?filter=negative-stock',
  },
  {
    id: 'stale-prices',
    label: 'Stale Prices',
    description: 'Active products whose price has not been updated in >30 days.',
    icon: <Clock size={20} />,
    fixHref: '/admin/pricing?filter=stale',
  },
  {
    id: 'search-gaps',
    label: 'Search Zero-Result Queries',
    description: 'Top search queries that returned 0 results in the past 30 days.',
    icon: <Search size={20} />,
    fixHref: '/admin/catalog?filter=search-gaps',
  },
];

const API_KEY_MAP: Record<string, keyof ReturnType<typeof mapReportToCounts>> = {
  duplicates: 'duplicateProducts',
  'missing-images': 'missingImages',
  'missing-barcodes': 'missingBarcodes',
  'invalid-pack-sizes': 'invalidPackSizes',
  'unmapped-supplier-skus': 'unmappedSupplierSkus',
  'negative-inventory': 'negativeInventory',
  'stale-prices': 'stalePrices',
  'search-gaps': 'searchGaps',
};

function mapReportToCounts(data: Record<string, number>) {
  return {
    duplicateProducts: data.duplicateProducts ?? 0,
    missingImages: data.missingImages ?? 0,
    missingBarcodes: data.missingBarcodes ?? 0,
    invalidPackSizes: data.invalidPackSizes ?? 0,
    unmappedSupplierSkus: data.unmappedSupplierSkus ?? 0,
    negativeInventory: data.negativeInventory ?? 0,
    stalePrices: data.stalePrices ?? 0,
    searchGaps: data.searchGaps ?? 0,
  };
}

function severityForCount(id: string, count: number): DQCheck['severity'] {
  if (count === 0) return 'ok';
  if (id === 'duplicates' || id === 'negative-inventory') return 'critical';
  if (count > 20) return 'critical';
  return 'warning';
}

function severityColor(s: DQCheck['severity']) {
  if (s === 'ok') return 'text-oda-green bg-oda-mint';
  if (s === 'critical') return 'text-red-600 bg-red-50';
  return 'text-orange-500 bg-orange-50';
}

function severityBadge(count: number) {
  if (count === 0) return { icon: <CheckCircle size={13} />, cls: 'text-oda-green' };
  if (count > 20) return { icon: <AlertTriangle size={13} />, cls: 'text-red-500' };
  return { icon: <AlertTriangle size={13} />, cls: 'text-orange-500' };
}

export default function DataQualityPage() {
  const [checks, setChecks] = useState<DQCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataQualityAdminApi.getReport();
      const counts = mapReportToCounts(res.data ?? {});
      const built = CHECK_META.map((meta) => {
        const apiKey = API_KEY_MAP[meta.id];
        const count = counts[apiKey as keyof typeof counts] ?? 0;
        return {
          ...meta,
          count,
          severity: severityForCount(meta.id, count),
        };
      });
      setChecks(built);
    } catch {
      setError('Failed to load data quality report');
      setChecks(CHECK_META.map((m) => ({ ...m, count: 0, severity: 'ok' as const })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const critical = checks.filter((c) => c.severity === 'critical' && c.count > 0);
  const total = checks.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminPageHeader
        title="Data Quality"
        subtitle={
          loading
            ? 'Loading…'
            : total > 0
              ? `${total} issues found across ${checks.filter((c) => c.count > 0).length} checks`
              : 'All checks passed'
        }
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-oda-charcoal/60 bg-white border border-oda-charcoal/10 px-4 py-2 rounded-xl font-semibold font-plus-jakarta hover:bg-oda-ivory transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-plus-jakarta">
            <strong>{critical.length} critical issue{critical.length > 1 ? 's' : ''}</strong> require immediate attention:{' '}
            {critical.map((c) => c.label).join(', ')}.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="text-oda-green animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {checks.map((check) => {
            const badge = severityBadge(check.count);
            const isSelected = selectedCheck === check.id;
            return (
              <div
                key={check.id}
                onClick={() => setSelectedCheck(isSelected ? null : check.id)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-oda-green shadow-md' : 'border-oda-charcoal/8'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severityColor(check.severity)}`}>
                    {check.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold font-plus-jakarta ${badge.cls}`}>
                    {badge.icon}
                    <span>{check.count}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-1">{check.label}</p>
                <p className="text-xs text-oda-charcoal/50 font-plus-jakarta leading-relaxed line-clamp-2">{check.description}</p>
                {check.count > 0 && (
                  <Link
                    href={check.fixHref}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-3 text-xs text-oda-green font-semibold font-plus-jakarta hover:underline"
                  >
                    Fix issues <ArrowRight size={11} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedCheck && !loading && (
        <div className="mt-6 bg-white rounded-2xl border border-oda-charcoal/8 p-6">
          {(() => {
            const check = checks.find((c) => c.id === selectedCheck)!;
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta">{check.label} — Details</h2>
                  <Link
                    href={`/admin/data-quality/${check.id}`}
                    className="text-xs text-oda-green font-semibold font-plus-jakarta hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {check.count === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-oda-green font-plus-jakarta">
                    <CheckCircle size={16} /> No issues found for this check.
                  </div>
                ) : (
                  <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">
                    {check.count} records affected. Click &quot;Fix issues&quot; to navigate to the relevant admin page with the filter pre-applied.
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
