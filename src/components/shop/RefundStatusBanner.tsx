'use client';

import React from 'react';

export type RefundStage =
  | 'INITIATED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED';

interface RefundStatusBannerProps {
  stage: RefundStage;
  refundAmount?: number;
  currency?: string;
  /** ISO date string of when refund was initiated */
  initiatedAt?: string;
  /** ISO date string of expected completion */
  expectedAt?: string;
  /** Rejection reason if REJECTED */
  rejectionReason?: string;
  className?: string;
}

const STAGE_META: Record<
  RefundStage,
  { label: string; sublabel: string; color: string; bgColor: string; icon: string }
> = {
  INITIATED: {
    label: 'Refund request received',
    sublabel: 'We are reviewing your return. This usually takes 1 business day.',
    color: 'text-blue-800',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: '📋',
  },
  APPROVED: {
    label: 'Refund approved',
    sublabel: 'Your refund has been approved and is being processed.',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: '✅',
  },
  PROCESSING: {
    label: 'Refund processing',
    sublabel: 'Funds are being transferred. Expected in 2–3 business days.',
    color: 'text-purple-800',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: '⏳',
  },
  COMPLETED: {
    label: 'Refund completed',
    sublabel: 'The refund has been credited to your M-Pesa or Oda wallet.',
    color: 'text-green-800',
    bgColor: 'bg-green-50 border-green-200',
    icon: '💚',
  },
  REJECTED: {
    label: 'Refund not approved',
    sublabel: 'Unfortunately your refund request was not approved.',
    color: 'text-red-800',
    bgColor: 'bg-red-50 border-red-200',
    icon: '❌',
  },
};

const ALL_STAGES: RefundStage[] = ['INITIATED', 'APPROVED', 'PROCESSING', 'COMPLETED'];

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function RefundStatusBanner({
  stage,
  refundAmount,
  currency = 'KSh',
  initiatedAt,
  expectedAt,
  rejectionReason,
  className = '',
}: RefundStatusBannerProps) {
  const meta = STAGE_META[stage];
  const stageIndex = ALL_STAGES.indexOf(stage);

  return (
    <div
      className={`rounded-xl border p-4 ${meta.bgColor} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none" aria-hidden="true">
          {meta.icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${meta.color}`}>{meta.label}</p>
            {refundAmount !== undefined && (
              <span className={`font-bold text-sm ${meta.color}`}>
                {currency} {refundAmount.toLocaleString()}
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${meta.color} opacity-80`}>{meta.sublabel}</p>

          {stage === 'REJECTED' && rejectionReason && (
            <p className="text-xs mt-1 text-red-700 font-medium">Reason: {rejectionReason}</p>
          )}

          {initiatedAt && (
            <p className="text-xs mt-1 text-gray-500">
              Initiated {formatDate(initiatedAt)}
              {expectedAt && stage !== 'COMPLETED' && ` · Expected by ${formatDate(expectedAt)}`}
            </p>
          )}
        </div>
      </div>

      {/* Progress stepper — only for non-rejected flows */}
      {stage !== 'REJECTED' && (
        <div className="mt-3 flex items-center gap-1">
          {ALL_STAGES.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= stageIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
              {i < ALL_STAGES.length - 1 && <div className="w-1" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default RefundStatusBanner;
