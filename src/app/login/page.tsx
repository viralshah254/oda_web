'use client';

import { useState, useEffect, useRef, Suspense, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Mail, Shield, CheckCircle, Sparkles, X, Lock } from 'lucide-react';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth.store';

type Stage = 'phone' | 'otp' | 'success';

type LoginMethod = 'phone' | 'email';

type OtpCredential = { phone?: string; email?: string };

const OTP_LENGTH = 4;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Where to send users who leave sign-in: prefer safe in-app URLs; never send guests to auth-only areas. */
function getExitHref(returnUrl: string | null): string {
  if (!returnUrl) return '/';
  const trimmed = returnUrl.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/';
  const path = trimmed.split('?')[0] ?? '';
  if (!path || path === '/login') return '/';
  if (
    path.startsWith('/account') ||
    path.startsWith('/admin') ||
    path.startsWith('/portal')
  ) {
    return '/';
  }
  return trimmed;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { setUser, setTokens } = useAuthStore();

  const adminReturn = returnUrl.startsWith('/admin');

  const [stage, setStage] = useState<Stage>('phone');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otpCredential, setOtpCredential] = useState<OtpCredential | null>(null);
  const [destinationHint, setDestinationHint] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const otpRef = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  const otpCode = otpDigits.join('');
  const otpComplete = otpCode.length === OTP_LENGTH;

  useEffect(() => {
    if (stage !== 'otp') return;
    const t = window.setTimeout(() => otpRef.current[0]?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (adminReturn && !staffEmail) {
      setStaffEmail('superadmin@odaflow.com');
    }
  }, [adminReturn, staffEmail]);

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

  const parseLoginCredential = (raw: string, method: LoginMethod): OtpCredential | null => {
    const t = raw.trim();
    if (!t) return null;
    if (method === 'email') {
      const email = t.toLowerCase();
      if (!EMAIL_RE.test(email)) return null;
      return { email };
    }
    const phone = formatPhone(t);
    if (!phone.startsWith('+254')) return null;
    const national = phone.slice(4);
    if (national.length !== 9 || !/^\d{9}$/.test(national)) return null;
    return { phone };
  };

  const fillOtpFromString = (fromIndex: number, raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!digitsOnly) return;
    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < digitsOnly.length && fromIndex + i < OTP_LENGTH; i++) {
        next[fromIndex + i] = digitsOnly[i]!;
      }
      return next;
    });
    const focusAt = Math.min(fromIndex + digitsOnly.length, OTP_LENGTH - 1);
    window.requestAnimationFrame(() => otpRef.current[focusAt]?.focus());
  };

  const setOtpCell = (index: number, raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      fillOtpFromString(index, digitsOnly);
      return;
    }
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digitsOnly.slice(-1);
      return next;
    });
    if (digitsOnly && index < OTP_LENGTH - 1) {
      window.requestAnimationFrame(() => otpRef.current[index + 1]?.focus());
    }
  };

  const readOtpFromInputs = (): string =>
    otpRef.current.map((el) => el?.value?.replace(/\D/g, '') ?? '').join('').slice(0, OTP_LENGTH);

  const handleRequestOtp = async () => {
    const cred = parseLoginCredential(identifier, loginMethod);
    if (!cred) {
      setError(
        loginMethod === 'email'
          ? 'Enter a valid email address.'
          : 'Enter a valid Kenyan mobile number (e.g. 07XX XXX XXX).'
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.requestOtp(cred);
      setOtpCredential(cred);
      setDestinationHint(identifier.trim());
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setStage('otp');
      setResendTimer(30);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = (codeOverride ?? otpDigits.join('')).replace(/\D/g, '');
    if (code.length !== OTP_LENGTH) return;
    if (!otpCredential || (!otpCredential.phone && !otpCredential.email)) {
      setError('Session expired. Please enter your details again.');
      setStage('phone');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(otpCredential, code);
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

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setOtpDigits((prev) => {
        const next = [...prev];
        if (prev[index]) {
          next[index] = '';
          return next;
        }
        if (index > 0) {
          next[index - 1] = '';
          window.requestAnimationFrame(() => otpRef.current[index - 1]?.focus());
        }
        return next;
      });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = readOtpFromInputs();
      if (code.length === OTP_LENGTH) void handleVerifyOtp(code);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !otpCredential) return;
    setLoading(true);
    setError('');
    try {
      await authApi.requestOtp(otpCredential);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setResendTimer(30);
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffPasswordLogin = async () => {
    const email = staffEmail.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      setError('Enter a valid work email address.');
      return;
    }
    if (!staffPassword) {
      setError('Enter your password.');
      return;
    }
    setStaffLoading(true);
    setError('');
    try {
      const res = await authApi.loginWithPassword({ email }, staffPassword);
      const { accessToken, refreshToken, user } = res.data;

      setTokens(accessToken, refreshToken);
      setUser(user);

      document.cookie = `oda_access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

      setStage('success');
      setTimeout(() => {
        router.replace(returnUrl);
      }, 800);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setStaffLoading(false);
    }
  };

  if (stage === 'success') {
    return (
      <div className="text-center py-10 px-2">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-oda-mint/80 blur-md" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-oda-mint to-white shadow-soft ring-1 ring-oda-green/15">
            <CheckCircle className="text-oda-green" size={36} strokeWidth={2.25} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-oda-charcoal font-plus-jakarta mb-1.5">
          You&apos;re in
        </h2>
        <p className="text-oda-charcoal-2/80 text-sm font-plus-jakarta">Redirecting you now…</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {stage === 'phone' && (
        <>
          <div className="space-y-4">
            <div>
              <p
                id="login-method-label"
                className="mb-2.5 text-sm font-semibold text-oda-charcoal font-plus-jakarta"
              >
                Sign in with
              </p>
              <div
                role="group"
                aria-labelledby="login-method-label"
                className="grid grid-cols-2 gap-2 rounded-2xl bg-oda-mint/50 p-1 ring-1 ring-oda-green/10"
              >
                <button
                  type="button"
                  aria-pressed={loginMethod === 'phone'}
                  onClick={() => {
                    setLoginMethod('phone');
                    setIdentifier('');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold font-plus-jakarta transition ${
                    loginMethod === 'phone'
                      ? 'bg-white text-oda-charcoal shadow-sm ring-1 ring-oda-charcoal/8'
                      : 'text-oda-charcoal-2/75 hover:text-oda-charcoal'
                  }`}
                >
                  <Phone size={18} strokeWidth={2} aria-hidden className="opacity-80" />
                  Phone
                </button>
                <button
                  type="button"
                  aria-pressed={loginMethod === 'email'}
                  onClick={() => {
                    setLoginMethod('email');
                    setIdentifier('');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold font-plus-jakarta transition ${
                    loginMethod === 'email'
                      ? 'bg-white text-oda-charcoal shadow-sm ring-1 ring-oda-charcoal/8'
                      : 'text-oda-charcoal-2/75 hover:text-oda-charcoal'
                  }`}
                >
                  <Mail size={18} strokeWidth={2} aria-hidden className="opacity-80" />
                  Email
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label
                htmlFor="login-identifier"
                className="block text-sm font-semibold text-oda-charcoal font-plus-jakarta"
              >
                {loginMethod === 'email' ? 'Email address' : 'Kenyan mobile number'}
              </label>
              <div className="group relative flex rounded-2xl bg-white ring-1 ring-oda-charcoal/10 transition-all duration-200 hover:ring-oda-charcoal/14 focus-within:shadow-[0_0_0_3px_rgba(25,138,46,0.2)] focus-within:ring-oda-green/40">
                <span className="flex shrink-0 items-center justify-center pl-4 pr-2 text-oda-charcoal-2/50">
                  {loginMethod === 'email' ? (
                    <Mail size={20} strokeWidth={2} aria-hidden />
                  ) : (
                    <Phone size={20} strokeWidth={2} aria-hidden />
                  )}
                </span>
                <input
                  id="login-identifier"
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  inputMode={loginMethod === 'email' ? 'email' : 'tel'}
                  autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
                  data-cy="phone-input"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && void handleRequestOtp()}
                  placeholder={loginMethod === 'email' ? 'you@example.com' : '07XX XXX XXX'}
                  className="min-w-0 flex-1 bg-transparent py-4 pr-4 text-oda-charcoal placeholder:text-oda-charcoal-2/45 font-plus-jakarta text-[15px] outline-none rounded-r-2xl"
                />
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-oda-yellow/35 bg-gradient-to-br from-oda-yellow/12 to-oda-mint/40 px-4 py-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-oda-green" aria-hidden />
              <p className="text-[13px] leading-snug text-oda-charcoal-2 font-plus-jakarta">
                <span className="font-bold text-oda-charcoal">New here?</span> We&apos;ll create your account after you
                enter the one-time code — no password needed.
              </p>
            </div>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-oda-red font-plus-jakarta ring-1 ring-red-100">
              {error}
            </p>
          )}
          <button
            type="button"
            data-cy="send-otp-btn"
            onClick={handleRequestOtp}
            disabled={loading || !identifier.trim()}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-oda-green via-oda-green to-oda-green-dark py-4 text-[15px] font-extrabold text-white font-plus-jakarta shadow-lg shadow-oda-green/30 transition hover:brightness-[1.06] hover:shadow-xl hover:shadow-oda-green/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/0 to-white/15 opacity-0 transition group-hover:opacity-100" aria-hidden />
            {loading && <Loader2 size={18} className="animate-spin relative" />}
            <span className="relative">
              {loginMethod === 'email' ? 'Email me a code' : 'Text me a code'}
            </span>
          </button>
          <p className="text-center text-xs leading-relaxed text-oda-charcoal-2/55 font-plus-jakarta px-1">
            By continuing you agree to our{' '}
            <Link
              href="/legal/terms"
              className="font-semibold text-oda-green underline decoration-oda-green/30 underline-offset-2 hover:text-oda-green-dark"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/legal/privacy"
              className="font-semibold text-oda-green underline decoration-oda-green/30 underline-offset-2 hover:text-oda-green-dark"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {adminReturn && (
            <div className="space-y-4 rounded-2xl border border-oda-charcoal/10 bg-oda-charcoal/[0.03] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-oda-charcoal">
                <Lock className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                <p className="text-sm font-bold font-plus-jakarta">Oda staff (admin console)</p>
              </div>
              <p className="text-xs leading-relaxed text-oda-charcoal-2/80 font-plus-jakarta">
                Console access uses <span className="font-semibold text-oda-charcoal">email + password</span>, not OTP.
                Use the account provisioned in your backend seed.
              </p>
              <div className="space-y-3">
                <label htmlFor="staff-email" className="sr-only">
                  Work email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  data-cy="staff-email-input"
                  value={staffEmail}
                  onChange={(e) => {
                    setStaffEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-oda-charcoal/12 bg-white px-4 py-3 text-sm text-oda-charcoal placeholder:text-oda-charcoal-2/45 font-plus-jakarta outline-none ring-oda-green/0 transition focus:border-oda-green/50 focus:ring-2 focus:ring-oda-green/20"
                />
                <label htmlFor="staff-password" className="sr-only">
                  Password
                </label>
                <input
                  id="staff-password"
                  type="password"
                  autoComplete="current-password"
                  data-cy="staff-password-input"
                  value={staffPassword}
                  onChange={(e) => {
                    setStaffPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Password"
                  onKeyDown={(e) => e.key === 'Enter' && void handleStaffPasswordLogin()}
                  className="w-full rounded-xl border border-oda-charcoal/12 bg-white px-4 py-3 text-sm text-oda-charcoal placeholder:text-oda-charcoal-2/45 font-plus-jakarta outline-none focus:border-oda-green/50 focus:ring-2 focus:ring-oda-green/20"
                />
              </div>
              <button
                type="button"
                data-cy="staff-login-btn"
                onClick={() => void handleStaffPasswordLogin()}
                disabled={staffLoading || !staffEmail.trim() || !staffPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-oda-charcoal/15 bg-white py-3.5 text-sm font-extrabold text-oda-charcoal font-plus-jakarta transition hover:border-oda-green/35 hover:bg-oda-mint/30 disabled:pointer-events-none disabled:opacity-50"
              >
                {staffLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in to admin
              </button>
            </div>
          )}
        </>
      )}

      {stage === 'otp' && (
        <>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-oda-mint to-white shadow-soft ring-1 ring-oda-green/12">
              <Shield className="text-oda-green" size={26} strokeWidth={2} aria-hidden />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm leading-relaxed text-oda-charcoal-2 font-plus-jakarta">
                Enter the <span className="font-bold text-oda-charcoal">4-digit code</span> we sent to
              </p>
              <p className="break-all text-[15px] font-bold text-oda-charcoal font-plus-jakarta tracking-tight">
                {destinationHint}
              </p>
            </div>
            <p className="max-w-[280px] text-xs leading-relaxed text-oda-charcoal-2/65 font-plus-jakarta">
              {otpCredential?.email
                ? 'Check your inbox and spam folder. Code expires in 5 minutes.'
                : 'Check your text messages. Code expires in 5 minutes.'}
            </p>
          </div>
          <div>
            <label className="sr-only">One-time code</label>
            <div
              className="flex justify-center gap-2.5 sm:gap-3"
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text.replace(/\D/g, '').length >= OTP_LENGTH) {
                  e.preventDefault();
                  fillOtpFromString(0, text);
                }
              }}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  name={index === 0 ? 'one-time-code' : undefined}
                  maxLength={OTP_LENGTH}
                  data-cy={`otp-digit-${index}`}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  value={digit}
                  onChange={(e) => setOtpCell(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-[52px] w-11 sm:h-14 sm:w-[52px] shrink-0 rounded-2xl border-2 border-oda-charcoal/8 bg-white text-center text-xl font-bold tabular-nums tracking-tight text-oda-charcoal font-plus-jakarta shadow-sm transition-all placeholder:text-transparent focus:border-oda-green focus:outline-none focus:ring-4 focus:ring-oda-green/15"
                />
              ))}
            </div>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-center text-sm text-oda-red font-plus-jakarta ring-1 ring-red-100">
              {error}
            </p>
          )}
          <button
            type="button"
            data-cy="verify-otp-btn"
            onClick={() => void handleVerifyOtp()}
            disabled={loading || !otpComplete}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-oda-green to-oda-green-dark py-4 text-[15px] font-extrabold text-white font-plus-jakarta shadow-md shadow-oda-green/25 transition hover:brightness-[1.05] hover:shadow-lg active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/0 to-white/15 opacity-0 transition group-hover:opacity-100" aria-hidden />
            {loading && <Loader2 size={18} className="animate-spin relative" />}
            <span className="relative">Verify & sign in</span>
          </button>
          <div className="flex flex-col-reverse gap-3 border-t border-oda-charcoal/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setOtpDigits(Array(OTP_LENGTH).fill(''));
                setOtpCredential(null);
                setDestinationHint('');
                setStage('phone');
              }}
              className="text-sm font-semibold text-oda-charcoal-2/80 font-plus-jakarta transition hover:text-oda-charcoal"
            >
              ← Use a different number or email
            </button>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resendTimer > 0 || loading}
              className="text-sm font-bold text-oda-green font-plus-jakarta transition hover:text-oda-green-dark disabled:text-oda-charcoal-2/35"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoginPageInner({ exitHref }: { exitHref: string }) {
  return (
    <div className="relative z-10 w-full max-w-[440px] animate-fade-in">
      <div className="mb-4 flex justify-end sm:mb-5">
        <Link
          href={exitHref}
          prefetch
          className="inline-flex items-center gap-2 rounded-full border border-oda-charcoal/10 bg-white/80 px-3.5 py-2 text-sm font-bold text-oda-charcoal-2 shadow-sm backdrop-blur-sm transition hover:border-oda-green/25 hover:bg-white hover:text-oda-charcoal font-plus-jakarta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oda-green/35"
          aria-label="Continue without signing in — back to shopping"
        >
          <span className="hidden sm:inline">Back to shopping</span>
          <span className="sm:hidden">Back</span>
          <X className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <div className="mb-8 text-center">
        <Link href="/" className="group inline-flex flex-col items-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-oda-green to-oda-green-dark opacity-90 blur-md transition group-hover:opacity-100" />
            <div className="relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-oda-green to-oda-green-dark shadow-floating ring-[3px] ring-white/90">
              <span className="text-[1.65rem] font-extrabold leading-none text-white font-plus-jakarta">O</span>
            </div>
          </div>
          <h1 className="text-[1.65rem] font-extrabold tracking-tight text-oda-charcoal font-plus-jakarta sm:text-3xl">
            Welcome to Oda
          </h1>
          <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-oda-charcoal-2/90 font-plus-jakarta">
            Kenya&apos;s freshest groceries, delivered fast — sign in to shop and track every order.
          </p>
          <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold text-oda-green-dark/90 font-plus-jakarta">
            <span className="rounded-full bg-oda-mint/70 px-2.5 py-0.5 ring-1 ring-oda-green/15">No password</span>
            <span className="hidden sm:inline text-oda-charcoal-2/35" aria-hidden>
              ·
            </span>
            <span className="rounded-full bg-oda-mint/70 px-2.5 py-0.5 ring-1 ring-oda-green/15">OTP only</span>
          </p>
        </Link>
      </div>

      <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-8 shadow-floating backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 ring-1 ring-oda-green/[0.08] sm:p-9">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-oda-charcoal-2/60 font-plus-jakarta">Loading…</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-xs text-oda-charcoal-2/55 font-plus-jakarta">
        Having trouble?{' '}
        <Link
          href="/support"
          className="font-semibold text-oda-green underline decoration-oda-green/25 underline-offset-2 hover:text-oda-green-dark"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}

function LoginPageWithExitHref() {
  const searchParams = useSearchParams();
  return <LoginPageInner exitHref={getExitHref(searchParams.get('returnUrl'))} />;
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-oda-ivory via-white to-oda-mint/30 flex items-center justify-center p-4 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(234,248,239,0.9),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-oda-mint/80 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-oda-yellow/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-oda-green/[0.09] blur-3xl"
        aria-hidden
      />

      <Suspense fallback={<LoginPageInner exitHref="/" />}>
        <LoginPageWithExitHref />
      </Suspense>
    </div>
  );
}
