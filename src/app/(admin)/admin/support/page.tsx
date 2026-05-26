'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Clock, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { supportAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface SupportTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  priority: string;
  orderId?: string | null;
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
    user?: { name?: string; phone?: string };
  };
  order?: { id: string; status?: string };
}

const priorityConfig: Record<string, { variant: 'error' | 'warning' | 'neutral' | 'info'; icon: typeof AlertTriangle }> = {
  CRITICAL: { variant: 'error', icon: AlertTriangle },
  HIGH: { variant: 'warning', icon: AlertTriangle },
  MEDIUM: { variant: 'info', icon: Clock },
  LOW: { variant: 'neutral', icon: MessageSquare },
};

const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' | 'info' => {
  if (status === 'OPEN') return 'error';
  if (status === 'IN_PROGRESS') return 'info';
  if (status === 'RESOLVED' || status === 'CLOSED') return 'success';
  return 'warning';
};

function customerLabel(t: SupportTicket) {
  const c = t.customer;
  if (!c) return 'Unknown';
  return c.user?.name ?? c.name ?? c.user?.phone ?? c.phone ?? 'Unknown';
}

function formatAge(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportAdminApi.queue();
      setTickets(res.data?.tickets ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      setError('Failed to load support queue');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const criticalCount = tickets.filter((t) => t.priority === 'CRITICAL').length;

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <AdminPageHeader
          title="Support Tickets"
          subtitle={`${total} ticket${total === 1 ? '' : 's'} in queue`}
          actions={
            <>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold font-plus-jakarta">
                {openCount} Open
              </span>
              {criticalCount > 0 && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold font-plus-jakarta">
                  {criticalCount} Critical
                </span>
              )}
              <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
                <RefreshCw size={16} />
              </button>
            </>
          }
        />

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-oda-green animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 py-16 text-center">
            <MessageSquare size={32} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">No tickets in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const pCfg = priorityConfig[ticket.priority] ?? priorityConfig.MEDIUM;
              const PriorityIcon = pCfg.icon;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer hover:border-oda-green/30 transition-colors ${
                    selected?.id === ticket.id ? 'border-oda-green' : 'border-oda-charcoal/8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-oda-charcoal/40 font-mono">
                        {ticket.ticketNumber ?? ticket.id.slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-1">
                        <PriorityIcon size={10} className="text-oda-charcoal/50" />
                        <AdminStatusPill label={ticket.priority} variant={pCfg.variant} />
                      </span>
                    </div>
                    <AdminStatusPill label={ticket.status.replace(/_/g, ' ')} variant={statusVariant(ticket.status)} />
                  </div>
                  <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta mb-1">{ticket.subject}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">
                      {customerLabel(ticket)} · {ticket.order?.id ?? ticket.orderId ?? 'No order'}
                    </p>
                    <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">{formatAge(ticket.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected ? (
        <div className="w-96 border-l border-oda-charcoal/8 p-6 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-4">{selected.subject}</h2>
          <div className="space-y-3 mb-6">
            {[
              ['Customer', customerLabel(selected)],
              ['Phone', selected.customer?.user?.phone ?? selected.customer?.phone ?? '—'],
              ['Order', selected.order?.id ?? selected.orderId ?? '—'],
              ['Priority', selected.priority],
              ['Status', selected.status.replace(/_/g, ' ')],
              ['Created', formatAge(selected.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm font-plus-jakarta">
                <span className="text-oda-charcoal/40">{label}</span>
                <span className="font-semibold text-oda-charcoal">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-96 border-l border-oda-charcoal/8 flex items-center justify-center bg-oda-ivory">
          <div className="text-center">
            <MessageSquare size={32} className="text-oda-charcoal/20 mx-auto mb-2" />
            <p className="text-sm text-oda-charcoal/40 font-plus-jakarta">Select a ticket to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
