'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

type Stage = 'phone' | 'otp' | 'success';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { setUser, setTokens } = useAuthStore();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return '+254' + digits.slice(1);
    if (digits.startsWith('254')) return '+' + digits;
    if (digits.startsWith('7') || digits.startsWith('1')) return '+254' + digits;
    return digits.startsWith('+') ? digits : '+254' + digits;
  };

  const handleRequestOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      await authApi.requestOtp(formatPhone(phone));
      setStage('otp');
      setResendTimer(30);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(formatPhone(phone), otp);
      const { accessToken, refreshToken, user } = res.data;

      // Store tokens in Zustand (persisted to localStorage)
      setTokens(accessToken, refreshToken);
      setUser(user);

      // Also set the cookie that Edge Middleware checks so server-side auth works
      document.cookie = `oda_access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

      setStage('success');
      setTimeout(() => {
        router.replace(returnUrl);
      }, 800);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await authApi.requestOtp(formatPhone(phone));
      setResendTimer(30);
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#EBF9EE] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-[#198A2E]" size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-1">Signed in!</h2>
        <p className="text-[#666] text-sm font-plus-jakarta">Taking you back...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stage === 'phone' && (
        <>
          <div>
            <label className="block text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                placeholder="07XX XXX XXX"
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0D8] rounded-xl text-[#1A1A1A] font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E] bg-[#FAFAF7]"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm font-plus-jakarta">{error}</p>}
          <button
            onClick={handleRequestOtp}
            disabled={loading || !phone.trim()}
            className="w-full py-3.5 bg-[#198A2E] text-white rounded-xl font-extrabold font-plus-jakarta text-base disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Continue with OTP
          </button>
          <p className="text-center text-xs text-[#999] font-plus-jakarta">
            By continuing you agree to our{' '}
            <Link href="/consent/terms" className="text-[#198A2E] underline">Terms</Link>
            {' '}and{' '}
            <Link href="/consent/privacy" className="text-[#198A2E] underline">Privacy Policy</Link>.
          </p>
        </>
      )}

      {stage === 'otp' && (
        <>
          <p className="text-sm text-[#666] font-plus-jakarta">
            We sent a 6-digit code to <span className="font-bold text-[#1A1A1A]">{phone}</span>.
          </p>
          <div>
            <label className="block text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-2">
              Enter OTP
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0D8] rounded-xl text-[#1A1A1A] font-plus-jakarta text-center tracking-[0.3em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#198A2E] bg-[#FAFAF7]"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm font-plus-jakarta">{error}</p>}
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 4}
            className="w-full py-3.5 bg-[#198A2E] text-white rounded-xl font-extrabold font-plus-jakarta text-base disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Verify & Sign In
          </button>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStage('phone')}
              className="text-sm text-[#666] font-plus-jakarta hover:text-[#1A1A1A]"
            >
              ← Change number
            </button>
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              className="text-sm font-bold text-[#198A2E] font-plus-jakarta disabled:text-[#999]"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-14 h-14 bg-[#198A2E] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-extrabold text-2xl font-plus-jakarta">O</span>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Welcome to Oda</h1>
          <p className="text-[#666] text-sm font-plus-jakarta mt-1">Kenya's fastest grocery delivery</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E8E8E0] p-7 shadow-sm">
          <Suspense fallback={<div className="py-8 text-center text-[#999]">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-[#999] font-plus-jakarta mt-6">
          Having trouble?{' '}
          <Link href="/support" className="text-[#198A2E] underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}
