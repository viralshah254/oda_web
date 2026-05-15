'use client';

import React from 'react';

export type TrustBadgeVariant =
  | 'replacement'
  | 'freshness'
  | 'delivery'
  | 'verified'
  | 'secure-payments';

interface TrustBadge {
  id: TrustBadgeVariant;
  icon: string;
  label: string;
  sublabel?: string;
}

const BADGES: TrustBadge[] = [
  {
    id: 'replacement',
    icon: '🔄',
    label: 'Free replacement within 24h',
    sublabel: 'Wrong or damaged item? We replace it.',
  },
  {
    id: 'freshness',
    icon: '🥦',
    label: '100% fresh or money back',
    sublabel: 'Freshness guaranteed on every order.',
  },
  {
    id: 'delivery',
    icon: '⚡',
    label: 'Delivered in 30 minutes',
    sublabel: 'Lightning-fast delivery to your door.',
  },
  {
    id: 'verified',
    icon: '✅',
    label: 'Verified authentic products',
    sublabel: 'Official brands, genuine stock.',
  },
  {
    id: 'secure-payments',
    icon: '🔒',
    label: 'Secure M-Pesa payments',
    sublabel: 'No card storage. STK Push protected.',
  },
];

interface TrustBadgesProps {
  /** Which badges to show. Defaults to all badges. */
  variants?: TrustBadgeVariant[];
  /** 'horizontal' renders a scrollable row; 'grid' renders a 2-col grid */
  layout?: 'horizontal' | 'grid' | 'list';
  compact?: boolean;
  className?: string;
}

export function TrustBadges({
  variants,
  layout = 'horizontal',
  compact = false,
  className = '',
}: TrustBadgesProps) {
  const badges = variants ? BADGES.filter((b) => variants.includes(b.id)) : BADGES;

  const containerClass =
    layout === 'horizontal'
      ? 'flex gap-3 overflow-x-auto pb-1 scrollbar-hide'
      : layout === 'grid'
        ? 'grid grid-cols-2 gap-3'
        : 'flex flex-col gap-2';

  return (
    <div className={`${containerClass} ${className}`} aria-label="Trust and safety badges">
      {badges.map((badge) => (
        <TrustBadgeItem key={badge.id} badge={badge} compact={compact} />
      ))}
    </div>
  );
}

function TrustBadgeItem({ badge, compact }: { badge: TrustBadge; compact: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 shrink-0 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-800 whitespace-nowrap">
        <span role="img" aria-hidden="true">
          {badge.icon}
        </span>
        {badge.label}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 shrink-0 rounded-xl border border-gray-100 bg-white p-3 shadow-sm min-w-[180px]">
      <span className="text-2xl leading-none" role="img" aria-label={badge.label}>
        {badge.icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{badge.label}</p>
        {badge.sublabel && <p className="text-xs text-gray-500 mt-0.5">{badge.sublabel}</p>}
      </div>
    </div>
  );
}

export default TrustBadges;
