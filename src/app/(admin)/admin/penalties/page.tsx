'use client';

import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { AdminPageHeader } from '@/components/admin/admin-ui';

export default function AdminPenaltiesPage() {
  const [orderId, setOrderId] = useState('');
  const [actorType, setActorType] = useState('RIDER');
  const [actorId, setActorId] = useState('');
  const [penaltyKes, setPenaltyKes] = useState('');
  const [evidenceRefs, setEvidenceRefs] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const amountMinor = Math.round(Number(penaltyKes) * 100);
      const refs = evidenceRefs.split('\n').map((s) => s.trim()).filter(Boolean);
      const res = await adminApi.applyPenalty({
        orderId: orderId.trim(),
        actorType,
        actorId: actorId.trim(),
        penaltyKes: amountMinor,
        evidenceRefs: refs,
        reason: reason.trim(),
      });
      setResult(`Penalty logged (${res.data?.id ?? 'ok'}) and ledger debited when applicable.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply penalty');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <AdminPageHeader
        title="Evidence penalties"
        subtitle="Apply chain-of-custody penalties with mandatory evidence references"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 space-y-4">
        <label className="block text-sm font-semibold font-plus-jakarta">
          Order ID
          <input
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-semibold font-plus-jakarta">
            Actor type
            <select
              value={actorType}
              onChange={(e) => setActorType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm"
            >
              <option value="RIDER">Rider</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </label>
          <label className="block text-sm font-semibold font-plus-jakarta">
            Actor ID
            <input
              required
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold font-plus-jakarta">
          Penalty amount (KES)
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={penaltyKes}
            onChange={(e) => setPenaltyKes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-semibold font-plus-jakarta">
          Evidence references (one per line — POD photo URL, handover OTP, trip GPS log)
          <textarea
            required
            rows={4}
            value={evidenceRefs}
            onChange={(e) => setEvidenceRefs(e.target.value)}
            placeholder="pod://trip/abc123&#10;handover-otp:4829&#10;gps://trip/abc123"
            className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm font-mono"
          />
        </label>

        <label className="block text-sm font-semibold font-plus-jakarta">
          Reason
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-xl border border-oda-charcoal/10 px-3 py-2 text-sm"
          />
        </label>

        {error && (
          <p className="text-sm text-oda-red bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}
        {result && (
          <p className="text-sm text-oda-green bg-oda-mint border border-oda-green/20 rounded-xl px-4 py-3">{result}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oda-charcoal text-white text-sm font-bold disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          Apply penalty
        </button>
      </form>
    </div>
  );
}
