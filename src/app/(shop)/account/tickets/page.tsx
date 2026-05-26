'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Ticket, Plus, Loader2, MessageSquare } from 'lucide-react';
import { supportApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN:        'bg-oda-blue/10 text-oda-blue',
  IN_PROGRESS: 'bg-oda-yellow/20 text-amber-700',
  RESOLVED:    'bg-oda-mint text-oda-green',
  CLOSED:      'bg-oda-charcoal/8 text-oda-charcoal/40',
};

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/tickets');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const res = await supportApi.listTickets();
      setTickets(res.data?.tickets ?? res.data?.items ?? res.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);
    try {
      await supportApi.createTicket({ subject, description });
      setSubject(''); setDescription(''); setShowNew(false);
      load();
    } catch { /* ignore */ } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Support Tickets</h1>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-oda-green text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-oda-green-dark transition-colors font-plus-jakarta"
          >
            <Plus size={14} /> New ticket
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-5 space-y-3">
        {loading && <div className="flex justify-center py-10"><Loader2 size={24} className="text-oda-green animate-spin" /></div>}

        {showNew && (
          <div className="bg-white border border-oda-green/30 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">New support ticket</h3>
            <input
              placeholder="Subject *"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
            />
            <textarea
              placeholder="Describe your issue *"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 border border-oda-charcoal/15 rounded-xl text-sm font-semibold text-oda-charcoal/60 font-plus-jakarta">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={creating || !subject.trim() || !description.trim()}
                className="flex-1 py-2 bg-oda-green text-white rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />} Submit
              </button>
            </div>
          </div>
        )}

        {!loading && tickets.length === 0 && !showNew && (
          <div className="text-center py-12">
            <Ticket size={36} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No support tickets yet</p>
          </div>
        )}

        {tickets.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-oda-charcoal/8 p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-oda-ivory rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-oda-charcoal/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta truncate">{t.subject}</p>
              <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                {new Date(t.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full font-plus-jakarta whitespace-nowrap ${STATUS_STYLES[t.status] ?? STATUS_STYLES.OPEN}`}>
              {t.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
