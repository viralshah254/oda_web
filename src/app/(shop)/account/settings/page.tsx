'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, CheckCircle, Lock } from 'lucide-react';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?returnUrl=/account/settings');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) { setName(user.name ?? ''); setEmail(user.email ?? ''); }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await authApi.getProfile(); // warm-up; real update below
      const res = await authApi.getProfile();
      // update via profile endpoint
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/v1/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('oda_access_token')}` },
        body: JSON.stringify({ name, email }),
      });
      updateUser({ name, email });
      setSaved(true);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    setPwSaving(true); setPwError(''); setPwSaved(false);
    try {
      await authApi.changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw('');
      setPwSaved(true);
    } catch (e: any) {
      setPwError(e?.response?.data?.message ?? 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-white border-b border-oda-charcoal/8 px-4 lg:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-oda-charcoal/50 hover:text-oda-green transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Profile</h2>
          <div>
            <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-oda-charcoal/60 font-plus-jakarta mb-1">Phone number</label>
            <input
              value={user?.phone ?? ''}
              disabled
              className="w-full border border-oda-charcoal/10 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta text-oda-charcoal/40 bg-oda-ivory cursor-not-allowed"
            />
            <p className="text-xs text-oda-charcoal/40 font-plus-jakarta mt-1">Phone number cannot be changed here. Contact support.</p>
          </div>
          {error && <p className="text-sm text-red-600 font-plus-jakarta">{error}</p>}
          {saved && <p className="text-sm text-oda-green font-plus-jakarta flex items-center gap-1"><CheckCircle size={14} /> Saved!</p>}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-2.5 bg-oda-green text-white rounded-xl text-sm font-extrabold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-oda-charcoal/50" />
            <h2 className="text-sm font-extrabold text-oda-charcoal font-plus-jakarta">Change password</h2>
          </div>
          <input
            type="password"
            placeholder="Current password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
          />
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green"
          />
          {pwError && <p className="text-sm text-red-600 font-plus-jakarta">{pwError}</p>}
          {pwSaved && <p className="text-sm text-oda-green font-plus-jakarta flex items-center gap-1"><CheckCircle size={14} /> Password updated!</p>}
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPw || newPw.length < 8}
            className="w-full py-2.5 bg-oda-charcoal text-white rounded-xl text-sm font-extrabold font-plus-jakarta disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pwSaving && <Loader2 size={14} className="animate-spin" />}
            Update password
          </button>
        </div>
      </div>
    </div>
  );
}
