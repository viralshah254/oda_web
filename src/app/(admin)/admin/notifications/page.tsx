'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, Phone, Mail, Send, Loader2, Plus, RefreshCw } from 'lucide-react';
import { notificationsAdminApi } from '@/lib/api-client';
import { AdminPageHeader, AdminStatusPill } from '@/components/admin/admin-ui';

interface NotificationCampaign {
  id: string;
  key: string;
  channel: string;
  titleTemplate?: string | null;
  bodyTemplate: string;
  variables?: string[];
  isActive: boolean;
  updatedAt?: string;
}

const channelConfig: Record<string, { icon: typeof Bell; color: string }> = {
  PUSH: { icon: Bell, color: 'bg-blue-50 text-blue-700' },
  SMS: { icon: Phone, color: 'bg-green-50 text-green-700' },
  WHATSAPP: { icon: MessageSquare, color: 'bg-green-50 text-green-700' },
  EMAIL: { icon: Mail, color: 'bg-purple-50 text-purple-700' },
};

export default function AdminNotificationsPage() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NotificationCampaign | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    key: '',
    channel: 'PUSH',
    titleTemplate: '',
    bodyTemplate: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsAdminApi.campaigns();
      const list = res.data?.campaigns ?? [];
      setCampaigns(list);
      setSelected((prev) => prev ?? list[0] ?? null);
    } catch {
      setError('Failed to load notification campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.key.trim() || !form.bodyTemplate.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await notificationsAdminApi.createCampaign({
        key: form.key.trim(),
        channel: form.channel,
        titleTemplate: form.titleTemplate.trim() || undefined,
        bodyTemplate: form.bodyTemplate.trim(),
      });
      setShowCreate(false);
      setForm({ key: '', channel: 'PUSH', titleTemplate: '', bodyTemplate: '' });
      await load();
    } catch {
      setError('Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Notifications"
        subtitle={`${campaigns.length} templates / campaigns`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-oda-charcoal/40 hover:text-oda-charcoal transition-colors p-2">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-oda-green text-white px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-oda-green/90"
            >
              <Plus size={14} /> Create Campaign
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-plus-jakarta">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="mb-6 bg-white rounded-2xl border border-oda-charcoal/8 p-5">
          <h3 className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-4">New campaign / template</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="Template key (e.g. promo_flash)"
              className="px-4 py-2.5 rounded-xl border border-oda-charcoal/10 text-sm font-plus-jakarta"
            />
            <select
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-oda-charcoal/10 text-sm font-plus-jakarta"
            >
              {['PUSH', 'SMS', 'WHATSAPP', 'EMAIL'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.titleTemplate}
              onChange={(e) => setForm((f) => ({ ...f, titleTemplate: e.target.value }))}
              placeholder="Title template (optional)"
              className="col-span-2 px-4 py-2.5 rounded-xl border border-oda-charcoal/10 text-sm font-plus-jakarta"
            />
            <textarea
              value={form.bodyTemplate}
              onChange={(e) => setForm((f) => ({ ...f, bodyTemplate: e.target.value }))}
              placeholder="Body template"
              rows={3}
              className="col-span-2 px-4 py-2.5 rounded-xl border border-oda-charcoal/10 text-sm font-plus-jakarta"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 bg-oda-green text-white px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta disabled:opacity-60"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Save
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta bg-oda-charcoal/5 text-oda-charcoal"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-oda-charcoal/30" size={28} />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-12 text-center">
          <Bell size={32} className="text-oda-charcoal/20 mx-auto mb-3" />
          <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">No campaigns yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 bg-oda-green text-white px-5 py-2 rounded-xl text-sm font-bold font-plus-jakarta"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            {campaigns.map((t) => {
              const config = channelConfig[t.channel] ?? { icon: Bell, color: 'bg-oda-charcoal/8 text-oda-charcoal/60' };
              const Icon = config.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer hover:border-oda-green/30 ${
                    selected?.id === t.id ? 'border-oda-green' : 'border-oda-charcoal/8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${config.color}`}>
                        <Icon size={10} />
                        {t.channel}
                      </span>
                      <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta">{t.key}</p>
                    </div>
                    <AdminStatusPill label={t.isActive ? 'ACTIVE' : 'INACTIVE'} variant={t.isActive ? 'success' : 'neutral'} />
                  </div>
                  <p className="text-xs text-oda-charcoal/50 font-plus-jakarta truncate">{t.bodyTemplate}</p>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="w-80 bg-white rounded-2xl border border-oda-charcoal/8 p-5 h-fit">
              <h3 className="text-base font-bold text-oda-charcoal font-plus-jakarta mb-1">{selected.key}</h3>
              <p className="text-xs text-oda-charcoal/40 font-mono mb-4">{selected.id}</p>
              {selected.titleTemplate && (
                <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta mb-2">{selected.titleTemplate}</p>
              )}
              <div className="bg-oda-ivory rounded-xl p-4 text-sm text-oda-charcoal/60 font-plus-jakarta mb-4 font-mono leading-relaxed">
                {selected.bodyTemplate}
              </div>
              {selected.variables && selected.variables.length > 0 && (
                <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mb-4">
                  Variables: {selected.variables.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
