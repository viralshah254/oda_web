'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { queueOpsAdminApi } from '@/lib/api-client';
import { AdminDataTable, AdminPageHeader } from '@/components/admin/admin-ui';

interface QueueStat {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState<QueueStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dlq, setDlq] = useState<Array<{ id: string; name: string; failedReason?: string }>>([]);
  const [dlqLoading, setDlqLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await queueOpsAdminApi.stats();
      setQueues(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load queue stats');
      setQueues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadDlq = async (name: string) => {
    setSelected(name);
    setDlqLoading(true);
    try {
      const res = await queueOpsAdminApi.dlq(name);
      setDlq(res.data?.items ?? []);
    } catch {
      setDlq([]);
      setError(`Failed to load DLQ for ${name}`);
    } finally {
      setDlqLoading(false);
    }
  };

  const replay = async (name: string, jobId: string) => {
    try {
      await queueOpsAdminApi.replay(name, jobId);
      await loadDlq(name);
      await load();
    } catch {
      setError('Replay failed');
    }
  };

  return (
    <div className="p-8 flex gap-6 h-full">
      <div className="flex-1">
        <AdminPageHeader
          title="Queue Operations"
          subtitle="BullMQ queue health and dead-letter replay"
          actions={
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
          }
        />

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
            {error}
          </div>
        )}

        <AdminDataTable
          columns={['Queue', 'Waiting', 'Active', 'Failed', 'Delayed', '']}
          loading={loading}
          empty="No queues registered"
        >
          {!loading &&
            queues.map((q) => (
              <tr key={q.name} className="border-t border-oda-charcoal/5 hover:bg-oda-ivory/50">
                <td className="px-4 py-3 text-sm font-mono font-plus-jakarta">{q.name}</td>
                <td className="px-4 py-3 text-sm font-plus-jakarta">{q.waiting}</td>
                <td className="px-4 py-3 text-sm font-plus-jakarta">{q.active}</td>
                <td className="px-4 py-3 text-sm font-plus-jakarta text-red-600">{q.failed}</td>
                <td className="px-4 py-3 text-sm font-plus-jakarta">{q.delayed}</td>
                <td className="px-4 py-3">
                  {q.failed > 0 && (
                    <button
                      onClick={() => loadDlq(q.name)}
                      className="text-xs font-semibold text-oda-green hover:underline font-plus-jakarta"
                    >
                      View DLQ
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </AdminDataTable>
      </div>

      {selected && (
        <div className="w-96 bg-white rounded-2xl border border-oda-charcoal/8 p-4 overflow-y-auto">
          <h3 className="text-sm font-bold font-plus-jakarta mb-3">DLQ — {selected}</h3>
          {dlqLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-oda-green" />
            </div>
          ) : dlq.length === 0 ? (
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">No failed jobs</p>
          ) : (
            <ul className="space-y-2">
              {dlq.map((j) => (
                <li key={j.id} className="border border-oda-charcoal/8 rounded-xl p-3">
                  <p className="text-xs font-mono text-oda-charcoal">{j.name}</p>
                  <p className="text-[10px] text-oda-charcoal/50 mt-1 truncate">{j.failedReason ?? '—'}</p>
                  <button
                    onClick={() => replay(selected, j.id)}
                    className="mt-2 text-xs font-semibold text-oda-green hover:underline font-plus-jakarta"
                  >
                    Replay
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
