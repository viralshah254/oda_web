'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface DQCheck {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  severity: 'ok' | 'warning' | 'critical';
  fixHref: string;
}

// Mock data — replace with real API call
const checks: DQCheck[] = [
  {
    id: 'duplicates',
    label: 'Duplicate Products',
    description: 'Same barcode OR same name+brand+pack size with different IDs.',
    icon: <Copy size={20} />,
    count: 12,
    severity: 'critical',
    fixHref: '/admin/catalog?filter=duplicates',
  },
  {
    id: 'missing-images',
    label: 'Missing Images',
    description: 'Active products with 0 approved product images.',
    icon: <ImageOff size={20} />,
    count: 47,
    severity: 'warning',
    fixHref: '/admin/catalog?filter=no-images',
  },
  {
    id: 'missing-barcodes',
    label: 'Missing Barcodes',
    description: 'Products without a valid EAN-13 or UPC-A barcode.',
    icon: <Barcode size={20} />,
    count: 23,
    severity: 'warning',
    fixHref: '/admin/catalog?filter=no-barcode',
  },
  {
    id: 'invalid-pack-sizes',
    label: 'Invalid Pack Sizes',
    description: 'Products where pack size is null or in an unrecognised format.',
    icon: <Package size={20} />,
    count: 8,
    severity: 'warning',
    fixHref: '/admin/catalog?filter=invalid-packsize',
  },
  {
    id: 'unmapped-supplier-skus',
    label: 'Unmapped Supplier SKUs',
    description: 'Supplier SKU records not linked to a canonical product.',
    icon: <Link2 size={20} />,
    count: 34,
    severity: 'warning',
    fixHref: '/admin/suppliers?filter=unmapped-skus',
  },
  {
    id: 'negative-inventory',
    label: 'Negative Inventory',
    description: 'Branch stock records with quantity below 0.',
    icon: <TrendingDown size={20} />,
    count: 3,
    severity: 'critical',
    fixHref: '/admin/logistics?filter=negative-stock',
  },
  {
    id: 'stale-prices',
    label: 'Stale Prices',
    description: 'Active products whose price has not been updated in >30 days.',
    icon: <Clock size={20} />,
    count: 61,
    severity: 'warning',
    fixHref: '/admin/pricing?filter=stale',
  },
  {
    id: 'search-gaps',
    label: 'Search Zero-Result Queries',
    description: 'Top search queries that returned 0 results in the past 30 days.',
    icon: <Search size={20} />,
    count: 19,
    severity: 'warning',
    fixHref: '/admin/catalog?filter=search-gaps',
  },
];

function severityColor(s: DQCheck['severity']) {
  if (s === 'ok') return 'text-[#198A2E] bg-[#EBF9EE]';
  if (s === 'critical') return 'text-red-600 bg-red-50';
  return 'text-orange-500 bg-orange-50';
}

function severityBadge(count: number) {
  if (count === 0) return { icon: <CheckCircle size={13} />, cls: 'text-[#198A2E]' };
  if (count > 20) return { icon: <AlertTriangle size={13} />, cls: 'text-red-500' };
  return { icon: <AlertTriangle size={13} />, cls: 'text-orange-500' };
}

export default function DataQualityPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const critical = checks.filter((c) => c.severity === 'critical' && c.count > 0);
  const total = checks.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Data Quality</h1>
          <p className="text-sm text-[#666] font-plus-jakarta mt-0.5">
            {total > 0
              ? `${total} issues found across ${checks.filter((c) => c.count > 0).length} checks`
              : 'All checks passed'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-[#444] bg-white border border-[#E8E8E0] px-4 py-2 rounded-xl font-semibold font-plus-jakarta hover:bg-[#F5F5F0] transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-plus-jakarta">
            <strong>{critical.length} critical issue{critical.length > 1 ? 's' : ''}</strong> require immediate attention:{' '}
            {critical.map((c) => c.label).join(', ')}.
          </p>
        </div>
      )}

      {/* Check cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {checks.map((check) => {
          const badge = severityBadge(check.count);
          const isSelected = selectedCheck === check.id;
          return (
            <div
              key={check.id}
              onClick={() => setSelectedCheck(isSelected ? null : check.id)}
              className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-[#198A2E] shadow-md' : 'border-[#E8E8E0]'
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
              <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-1">{check.label}</p>
              <p className="text-xs text-[#666] font-plus-jakarta leading-relaxed line-clamp-2">{check.description}</p>
              {check.count > 0 && (
                <Link
                  href={check.fixHref}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 mt-3 text-xs text-[#198A2E] font-semibold font-plus-jakarta hover:underline"
                >
                  Fix issues <ArrowRight size={11} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedCheck && (
        <div className="mt-6 bg-white rounded-2xl border border-[#E8E8E0] p-6">
          {(() => {
            const check = checks.find((c) => c.id === selectedCheck)!;
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">{check.label} — Details</h2>
                  <Link
                    href={`/admin/data-quality/${check.id}`}
                    className="text-xs text-[#198A2E] font-semibold font-plus-jakarta hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                {check.count === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-[#198A2E] font-plus-jakarta">
                    <CheckCircle size={16} /> No issues found for this check.
                  </div>
                ) : (
                  <p className="text-sm text-[#666] font-plus-jakarta">
                    {check.count} records affected. Click "Fix issues" to navigate to the relevant admin page with the filter pre-applied.
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
