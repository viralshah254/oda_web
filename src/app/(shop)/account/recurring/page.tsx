'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, RefreshCw, Pause, Play, SkipForward, Trash2, Loader2 } from 'lucide-react';
import { recurringApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

interface RecurringSchedule {
  id: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  nextDeliveryAt?: string;
  itemCount?: number;
  estimatedTotalKes?: number;
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', BIWEEKLY: 'Every 2 weeks', MONTHLY: 'Monthly',
};

export default function RecurringPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/recurring');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const res = await recurringApi.list();
      setSchedules(res.data?.schedules ?? res.data?.items ?? res.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const toggle = async (id: string, status: string) => {
    try {
      if (status === 'ACTIVE') await recurringApi.pause(id);
      else await recurringApi.resume(id);
      load();
    } catch { /* ignore */ }
  };

  const skip = async (id: string) => {
    try { await recurringApi.skip(id); load(); } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try { await recurringApi.remove(id); setSchedules((s) => s.filter((x) => x.id !== id)); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Recurring Cart</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-5 space-y-3">
        {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="text-oda-green animate-spin" /></div>}

        {!loading && schedules.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No recurring orders set up yet</p>
            <Link href="/" className="mt-4 inline-block text-sm font-bold text-oda-green font-plus-jakarta">Set up from cart</Link>
          </div>
        )}

        {schedules.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.status === 'ACTIVE' ? 'bg-oda-mint' : 'bg-oda-ivory'}`}>
                <RefreshCw size={18} className={s.status === 'ACTIVE' ? 'text-oda-green' : 'text-oda-charcoal/30'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">{FREQ_LABELS[s.frequency] ?? s.frequency}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-plus-jakarta ${s.status === 'ACTIVE' ? 'bg-oda-mint text-oda-green' : 'bg-oda-charcoal/8 text-oda-charcoal/50'}`}>
                    {s.status}
                  </span>
                </div>
                {s.nextDeliveryAt && (
                  <p className="text-xs text-oda-charcoal/50 font-plus-jakarta">
                    Next: {new Date(s.nextDeliveryAt).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                )}
                {s.itemCount && (
                  <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                    {s.itemCount} items{s.estimatedTotalKes ? ` · KES ${(s.estimatedTotalKes / 100).toFixed(0)}` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggle(s.id, s.status)} className="p-2 text-oda-charcoal/40 hover:text-oda-green transition-colors">
                  {s.status === 'ACTIVE' ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button onClick={() => skip(s.id)} className="p-2 text-oda-charcoal/40 hover:text-oda-green transition-colors">
                  <SkipForward size={15} />
                </button>
                <button onClick={() => remove(s.id)} className="p-2 text-oda-charcoal/40 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
