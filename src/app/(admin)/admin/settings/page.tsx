'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { featureFlagsAdminApi } from '@/lib/api-client';
import { AdminPageHeader } from '@/components/admin/admin-ui';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  isEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await featureFlagsAdminApi.list();
      const data = res.data;
      setFlags(Array.isArray(data) ? data : data?.flags ?? []);
    } catch {
      setError('Failed to load feature flags');
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (key: string, enabled: boolean) => {
    setToggling(key);
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: enabled } : f)));
    try {
      await featureFlagsAdminApi.toggle(key, enabled);
    } catch {
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: !enabled } : f)));
      setError('Failed to update feature flag');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <AdminPageHeader
        title="Settings"
        subtitle="Toggle features without deploying code"
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

      <div className="bg-white rounded-2xl border border-oda-charcoal/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-oda-charcoal/8">
          <h2 className="text-base font-bold text-oda-charcoal font-plus-jakarta">Feature Flags</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-oda-green animate-spin" />
          </div>
        ) : flags.length === 0 ? (
          <p className="text-center py-12 text-sm text-oda-charcoal/40 font-plus-jakarta">No feature flags configured</p>
        ) : (
          <div className="divide-y divide-oda-charcoal/8">
            {flags.map((flag) => (
              <div key={flag.key} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-oda-charcoal font-plus-jakarta">{flag.name}</p>
                  <p className="text-xs text-oda-charcoal/40 mt-0.5 font-plus-jakarta">
                    {flag.description ?? flag.key}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(flag.key, !flag.isEnabled)}
                  disabled={toggling === flag.key}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    flag.isEnabled ? 'bg-oda-green' : 'bg-oda-charcoal/15'
                  } ${toggling === flag.key ? 'opacity-60' : ''}`}
                >
                  {toggling === flag.key ? (
                    <Loader2 size={14} className="absolute top-1 left-1/2 -translate-x-1/2 animate-spin text-white" />
                  ) : (
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        flag.isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
