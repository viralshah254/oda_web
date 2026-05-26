'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// ── PageHeader ─────────────────────────────────────────────────────────────────

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-oda-charcoal/50 font-plus-jakarta mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── MetricCard ─────────────────────────────────────────────────────────────────

export function AdminMetricCard({
  label,
  value,
  subValue,
  icon,
  accent = 'green',
}: {
  label: string;
  value: string;
  subValue?: string;
  icon?: ReactNode;
  accent?: 'green' | 'yellow' | 'charcoal' | 'orange' | 'red';
}) {
  const accentColors = {
    green: 'text-oda-green bg-oda-green/10',
    yellow: 'text-oda-orange bg-oda-yellow/20',
    charcoal: 'text-oda-charcoal bg-oda-charcoal/8',
    orange: 'text-oda-orange bg-oda-orange/10',
    red: 'text-oda-red bg-oda-red/10',
  };

  return (
    <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 shadow-sm">
      {icon && (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accentColors[accent]}`}>
          {icon}
        </div>
      )}
      <p className="text-xs font-bold text-oda-charcoal/40 font-plus-jakarta uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mt-1">{value}</p>
      {subValue && (
        <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────────

export function AdminDataTable({
  columns,
  children,
  loading,
  empty,
}: {
  columns: string[];
  children?: ReactNode;
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-oda-charcoal/8">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left text-xs font-bold text-oda-charcoal/40 px-5 py-3.5 font-plus-jakarta tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-oda-charcoal/4">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Loader2 className="animate-spin inline text-oda-charcoal/30" size={20} />
              </td>
            </tr>
          ) : children ? (
            children
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-oda-charcoal/30 font-plus-jakarta">
                {empty ?? 'No data'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── StatusPill ─────────────────────────────────────────────────────────────────

export function AdminStatusPill({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info';
}) {
  const cls = {
    success: 'bg-oda-mint text-oda-green-dark',
    warning: 'bg-oda-yellow/20 text-oda-orange',
    error: 'bg-oda-red/10 text-oda-red',
    neutral: 'bg-oda-charcoal/8 text-oda-charcoal/60',
    info: 'bg-oda-blue/10 text-oda-blue',
  }[variant];

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta ${cls}`}>
      {label}
    </span>
  );
}

// ── CommandBar ─────────────────────────────────────────────────────────────────

export function AdminCommandBar({
  value,
  onChange,
  placeholder,
  actions,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-oda-charcoal/30"
          width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Search…'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oda-charcoal/10 bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/20"
        />
      </div>
      {actions}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────

export function AdminEmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-oda-charcoal/8 flex items-center justify-center text-oda-charcoal/30 mb-1">
          {icon}
        </div>
      )}
      <p className="text-base font-extrabold text-oda-charcoal font-plus-jakarta">{title}</p>
      {body && <p className="text-sm text-oda-charcoal/40 font-plus-jakarta max-w-sm">{body}</p>}
      {action}
    </div>
  );
}
