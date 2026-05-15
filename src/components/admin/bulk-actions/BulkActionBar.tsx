'use client';

import { useState } from 'react';
import { X, ChevronDown, AlertTriangle, Loader2 } from 'lucide-react';

export type BulkAction = {
  value: string;
  label: string;
  destructive?: boolean;
};

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (action: string, approved: boolean) => Promise<{ requiresApproval?: boolean; summary?: { message: string } } | void>;
  onClear: () => void;
  resource: string;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  onClear,
  resource,
}: BulkActionBarProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [impactSummary, setImpactSummary] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (selectedCount === 0) return null;

  const activeAction = actions.find((a) => a.value === selectedAction);

  const handleExecute = async () => {
    if (!selectedAction) return;
    setLoading(true);
    try {
      const result = await onAction(selectedAction, false);
      if (result?.requiresApproval) {
        setImpactSummary(result.summary?.message ?? `This will affect ${selectedCount} ${resource}.`);
        setShowConfirm(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await onAction(selectedAction, true);
      onClear();
      setSelectedAction('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bulk action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 min-w-[380px]">
        {/* Count badge */}
        <div className="bg-[#198A2E] text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
          {selectedCount} selected
        </div>

        {/* Action dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 rounded-xl text-sm font-medium"
          >
            <span className={selectedAction ? 'text-white' : 'text-white/50'}>
              {activeAction?.label ?? 'Choose action…'}
            </span>
            <ChevronDown size={14} className="text-white/60" />
          </button>
          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-[#E8E8E0] overflow-hidden z-10">
              {actions.map((action) => (
                <button
                  key={action.value}
                  onClick={() => {
                    setSelectedAction(action.value);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#F5F5F0] transition-colors ${
                    action.destructive ? 'text-red-600' : 'text-[#1A1A1A]'
                  }`}
                >
                  {action.label}
                  {action.destructive && (
                    <span className="ml-2 text-xs text-red-400 font-normal">Destructive</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apply button */}
        <button
          onClick={handleExecute}
          disabled={!selectedAction || loading}
          className="flex items-center gap-2 bg-[#198A2E] hover:bg-[#166b24] disabled:opacity-40 transition-colors text-white text-sm font-bold px-4 py-2 rounded-xl shrink-0"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Apply
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
        >
          <X size={16} className="text-white/70" />
        </button>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-1">
                  Confirm Bulk Action
                </h3>
                <p className="text-sm text-[#666] font-plus-jakarta">{impactSummary}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F5F5F0] text-[#1A1A1A] text-sm font-bold font-plus-jakarta hover:bg-[#E8E8E0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold font-plus-jakarta hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
