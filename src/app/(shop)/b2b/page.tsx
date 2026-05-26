'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2, ChevronRight, CheckCircle, Upload, Loader2, Clock,
  XCircle, MapPin, Navigation, Pencil,
} from 'lucide-react';
import { b2bApi } from '@/lib/api-client';
import {
  b2bBusinessTypeSchema,
  b2bRegisterFormSchema,
  toRegisterPayload,
  B2B_TYPE_LABELS,
  type B2bRegisterFormValues,
} from '@/lib/b2b-shop-schema';
import { trackB2bEvent } from '@/lib/b2b-telemetry';

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = 'checking' | 'landing' | 'apply' | 'documents' | 'success'
          | 'status-pending' | 'status-approved' | 'status-rejected';

interface ExistingProfile {
  id: string;
  businessName: string;
  tradingName?: string;
  ownerName?: string;
  kycStatus?: string;   // PENDING | APPROVED | REJECTED | UNDER_REVIEW
  isWholesaleEnabled?: boolean;
  businessType?: string;
  businessPhone?: string;
  city?: string;
  county?: string;
  addressLine1?: string;
}

// ── Country dial codes ─────────────────────────────────────────────────────────
const DIAL_CODES = [
  { code: 'KE', dial: '+254', name: 'Kenya' },
  { code: 'UG', dial: '+256', name: 'Uganda' },
  { code: 'TZ', dial: '+255', name: 'Tanzania' },
  { code: 'RW', dial: '+250', name: 'Rwanda' },
  { code: 'ET', dial: '+251', name: 'Ethiopia' },
  { code: 'NG', dial: '+234', name: 'Nigeria' },
  { code: 'GH', dial: '+233', name: 'Ghana' },
  { code: 'ZA', dial: '+27',  name: 'South Africa' },
  { code: 'GB', dial: '+44',  name: 'United Kingdom' },
  { code: 'US', dial: '+1',   name: 'United States' },
  { code: 'IN', dial: '+91',  name: 'India' },
  { code: 'CN', dial: '+86',  name: 'China' },
  { code: 'AE', dial: '+971', name: 'UAE' },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────
function errMsg(e: unknown): string {
  const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string };
  const m = ax?.response?.data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join('; ');
  return (ax as { message?: string }).message || 'Request failed';
}

const KYC_SLOTS = [
  { type: 'BUSINESS_REGISTRATION', label: 'Business registration certificate', required: true },
  { type: 'KRA_PIN',               label: 'KRA PIN / tax proof',               required: false },
  { type: 'TRADE_PERMIT',          label: 'Trade permit',                       required: false },
  { type: 'OWNER_ID',              label: 'Owner ID',                           required: false },
  { type: 'SHOP_PHOTO',            label: 'Shop / business photo',              required: false },
];

function statusColor(s?: string) {
  if (!s) return 'text-oda-charcoal/60';
  if (s === 'APPROVED') return 'text-oda-green';
  if (s === 'REJECTED') return 'text-red-500';
  return 'text-oda-yellow-2';
}

function statusBg(s?: string) {
  if (!s) return 'bg-gray-50 border-gray-100';
  if (s === 'APPROVED') return 'bg-oda-mint border-oda-green/20';
  if (s === 'REJECTED') return 'bg-red-50 border-red-100';
  return 'bg-amber-50 border-amber-100';
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-oda-charcoal/10 bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/25 placeholder:text-oda-charcoal/35';

// ── Components ─────────────────────────────────────────────────────────────────
function Field({
  label, children, required, error,
}: { label: string; children: React.ReactNode; required?: boolean; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-oda-charcoal font-plus-jakarta mb-1.5">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1 font-plus-jakarta">{error}</p>}
    </div>
  );
}

function PhoneField({
  value, onChange, error,
}: { value: string; onChange: (v: string) => void; error?: string }) {
  const [dial, setDial] = useState('+254');
  const [local, setLocal] = useState('');

  // Sync on mount from pre-filled value
  useEffect(() => {
    if (!value) return;
    const match = DIAL_CODES.find((d) => value.startsWith(d.dial));
    if (match) {
      setDial(match.dial);
      setLocal(value.slice(match.dial.length));
    } else if (value.startsWith('+')) {
      setLocal(value);
    } else {
      setLocal(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fire = (d: string, l: string) => {
    const digits = l.replace(/\D/g, '');
    onChange(digits ? `${d}${digits}` : '');
  };

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={dial}
          onChange={(e) => { setDial(e.target.value); fire(e.target.value, local); }}
          className="border border-oda-charcoal/10 bg-white rounded-xl px-2 py-3 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/25 w-32 shrink-0"
        >
          {DIAL_CODES.map((d) => (
            <option key={d.code} value={d.dial}>{d.dial} {d.name}</option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          placeholder="712 345 678"
          value={local}
          onChange={(e) => { setLocal(e.target.value); fire(dial, e.target.value); }}
          className={inputClass + ' flex-1'}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1 font-plus-jakarta">{error}</p>}
    </div>
  );
}

function LocationField({
  onLocation,
}: { onLocation: (lat: number, lng: number, label: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('');
  const [err, setErr] = useState('');

  const pick = async () => {
    if (!navigator.geolocation) {
      setErr('Geolocation not supported by your browser.');
      return;
    }
    setBusy(true);
    setErr('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let resolved = 'Location detected';
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } },
          );
          if (r.ok) {
            const j = await r.json() as { display_name?: string; address?: { road?: string; suburb?: string; city?: string; town?: string; county?: string; state?: string } };
            const a = j.address;
            const parts = [a?.road ?? a?.suburb, a?.city ?? a?.town ?? a?.county, a?.state].filter(Boolean);
            resolved = parts.length ? parts.join(', ') : (j.display_name?.split(',').slice(0, 3).join(',') ?? resolved);
          }
        } catch { /* use fallback */ }
        setLabel(resolved);
        onLocation(lat, lng, resolved);
        setBusy(false);
      },
      (e) => {
        setErr(e.code === 1 ? 'Location permission denied. Please allow location access.' : 'Could not get location. Try again.');
        setBusy(false);
      },
      { timeout: 15000, maximumAge: 60000 },
    );
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={pick}
        disabled={busy}
        className="flex items-center gap-2 border border-oda-charcoal/10 bg-white rounded-xl px-4 py-3 text-sm font-semibold font-plus-jakarta text-oda-charcoal hover:border-oda-green/40 hover:text-oda-green transition-colors disabled:opacity-60 w-full"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin text-oda-green" />
        ) : (
          <Navigation size={16} className={label ? 'text-oda-green' : 'text-oda-charcoal/40'} />
        )}
        {busy ? 'Detecting location…' : label || 'Use my current location'}
        {label && !busy && <CheckCircle size={14} className="text-oda-green ml-auto" />}
      </button>
      {err && <p className="text-xs text-red-600 font-plus-jakarta">{err}</p>}
      {label && (
        <div className="flex items-start gap-2 px-3 py-2 bg-oda-mint rounded-xl">
          <MapPin size={13} className="text-oda-green mt-0.5 shrink-0" />
          <p className="text-xs text-oda-green font-semibold font-plus-jakarta">{label}</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function B2BPage() {
  const [step, setStep] = useState<Step>('checking');
  const [existing, setExisting] = useState<ExistingProfile | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [presignEnabled, setPresignEnabled] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const defaultValues = useMemo<B2bRegisterFormValues>(
    () => ({
      businessName: '', tradingName: '', ownerName: '',
      businessPhone: '', businessEmail: '', businessType: 'DUKA',
      latitude: undefined, longitude: undefined,
      addressLine1: '', city: '', county: '',
      kraPinNumber: '', businessRegNumber: '', defaultBranchName: '',
    }),
    [],
  );

  const form = useForm<B2bRegisterFormValues>({
    resolver: zodResolver(b2bRegisterFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // ── On mount: check existing profile ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await b2bApi.getProfile();
        const p = data as ExistingProfile & { kycStatus?: string };
        if (p?.id) {
          setExisting(p);
          setBusinessId(p.id);
          const s = p.kycStatus?.toUpperCase();
          if (s === 'APPROVED' || p.isWholesaleEnabled) setStep('status-approved');
          else if (s === 'REJECTED') setStep('status-rejected');
          else setStep('status-pending');
        } else {
          setStep('landing');
        }
      } catch {
        setStep('landing');
      }
    })();
  }, []);

  const prefillFormFromExisting = useCallback(() => {
    if (!existing) return;
    form.reset({
      businessName: existing.businessName ?? '',
      tradingName: existing.tradingName ?? '',
      ownerName: existing.ownerName ?? '',
      businessPhone: existing.businessPhone ?? '',
      businessEmail: '',
      businessType: (existing.businessType as B2bRegisterFormValues['businessType']) ?? 'DUKA',
      latitude: undefined,
      longitude: undefined,
      addressLine1: existing.addressLine1 ?? '',
      city: existing.city ?? '',
      county: existing.county ?? '',
      kraPinNumber: '',
      businessRegNumber: '',
      defaultBranchName: '',
    });
  }, [existing, form]);

  const loadCaps = useCallback(async () => {
    try {
      const { data } = await b2bApi.getDocumentCapabilities();
      setPresignEnabled(!!(data as { presignedPutEnabled?: boolean }).presignedPutEnabled);
    } catch { setPresignEnabled(false); }
  }, []);

  useEffect(() => {
    if (step === 'documents' && businessId) void loadCaps();
  }, [step, businessId, loadCaps]);

  async function runKycUpload(bid: string, file: File, docType: string, usePresign: boolean) {
    const mime = file.type && /^application\/pdf$|^image\/(jpeg|png|jpg)$/.test(file.type)
      ? file.type
      : file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    if (usePresign) {
      const { data: presign } = await b2bApi.presignKyc(bid, { documentType: docType, mimeType: mime, contentLength: file.size, filename: file.name });
      const presignedUrl = (presign as { presignedUrl: string }).presignedUrl;
      const uploadId = (presign as { uploadId: string }).uploadId;
      const putRes = await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': mime }, body: file });
      if (!putRes.ok) throw new Error(`Storage upload failed (${putRes.status})`);
      await b2bApi.confirmKyc(bid, { uploadId, etag: putRes.headers.get('etag') ?? undefined });
    } else {
      const fd = new FormData();
      fd.append('documentType', docType);
      fd.append('file', file);
      await b2bApi.uploadKycMultipart(bid, fd, (pct) => setUploadPct((prev) => ({ ...prev, [docType]: pct })));
    }
  }

  async function handleRegister(values: B2bRegisterFormValues) {
    setSubmitting(true);
    setError(null);
    trackB2bEvent('onboarding_submit_start', { step: 'register' });
    if (!idempotencyKeyRef.current && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    try {
      const payload = toRegisterPayload(b2bRegisterFormSchema.parse({
        ...values,
        latitude: geoCoords?.lat,
        longitude: geoCoords?.lng,
        tradingName: values.tradingName ?? '',
        businessEmail: values.businessEmail ?? '',
      }));
      const res = await b2bApi.register(payload, idempotencyKeyRef.current ?? undefined);
      const id = (res.data as { id?: string }).id;
      if (!id) throw new Error('Registration succeeded but no business id returned');
      setBusinessId(id);
      trackB2bEvent('onboarding_register_ok', { businessId: id });
      setStep('documents');
    } catch (err: unknown) {
      trackB2bEvent('onboarding_register_err', { message: errMsg(err) });
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDocumentsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    const required = KYC_SLOTS.filter((s) => s.required);
    for (const r of required) {
      if (!files[r.type]) { setError(`Please attach: ${r.label}`); return; }
    }
    const toUpload = KYC_SLOTS.filter((s) => files[s.type]);
    setUploadBusy(true);
    setError(null);
    trackB2bEvent('kyc_upload_start', { count: toUpload.length, presign: presignEnabled });
    try {
      for (const slot of toUpload) {
        const f = files[slot.type]!;
        setUploadPct((p) => ({ ...p, [slot.type]: 0 }));
        await runKycUpload(businessId, f, slot.type, presignEnabled);
        setUploadPct((p) => ({ ...p, [slot.type]: 100 }));
      }
      trackB2bEvent('kyc_upload_complete', { businessId });
      setStep('success');
    } catch (err: unknown) {
      setError(errMsg(err));
    } finally {
      setUploadBusy(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECKING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center">
        <Loader2 size={28} className="text-oda-green animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-oda-ivory flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-oda-mint rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-oda-green" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mb-2">
            Application Submitted!
          </h1>
          <p className="text-oda-charcoal/60 font-plus-jakarta mb-2">
            We'll review your application and KYC documents, usually within 24 hours.
          </p>
          <p className="text-sm text-oda-green font-semibold font-plus-jakarta mb-8">
            You'll get notified when wholesale access is enabled.
          </p>
          <button
            type="button"
            onClick={() => setStep('status-pending')}
            className="block w-full bg-oda-green text-white py-3.5 rounded-xl font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
          >
            View application status
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENTS UPLOAD
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'documents' && businessId) {
    return (
      <div className="min-h-screen bg-oda-ivory">
        <div className="bg-white border-b border-oda-charcoal/8 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button type="button" onClick={() => setStep('apply')} className="text-sm text-oda-charcoal/60 font-plus-jakarta hover:text-oda-green">← Back</button>
            <h1 className="text-base font-extrabold text-oda-charcoal font-plus-jakarta">KYC Documents</h1>
          </div>
        </div>
        <form onSubmit={handleDocumentsSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">
            Upload PDF or images (max 10MB each). The more you add, the faster we can verify.
          </p>
          {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 font-plus-jakarta border border-red-100">{error}</div>}
          {KYC_SLOTS.map((slot) => (
            <div key={slot.type}>
              <label className="block text-sm font-bold text-oda-charcoal font-plus-jakarta mb-2">
                {slot.label}{slot.required && <span className="text-red-500"> *</span>}
              </label>
              <label className="border-2 border-dashed border-oda-charcoal/10 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-oda-green/40 transition-colors bg-white">
                <Upload size={22} className={files[slot.type] ? 'text-oda-green' : 'text-oda-charcoal/30'} />
                <span className="text-xs text-oda-charcoal/60 font-plus-jakarta text-center">
                  {files[slot.type]?.name ?? 'Choose file (PDF or image)'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFiles((prev) => ({ ...prev, [slot.type]: f }));
                  }}
                />
              </label>
              {uploadPct[slot.type] != null && uploadPct[slot.type] < 100 && (
                <p className="text-xs text-oda-green mt-1 font-plus-jakarta">Uploading… {uploadPct[slot.type]}%</p>
              )}
              {uploadPct[slot.type] === 100 && (
                <p className="text-xs text-oda-green mt-1 font-plus-jakarta flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={uploadBusy}
            className="w-full bg-oda-green text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadBusy ? <><Loader2 className="animate-spin" size={18} /> Uploading…</> : 'Submit documents'}
          </button>
          <button type="button" onClick={() => setStep('success')} className="w-full text-sm text-oda-charcoal/50 font-plus-jakarta hover:text-oda-charcoal">
            Skip for now — I'll add documents later
          </button>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // APPLICATION FORM
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'apply') {
    return (
      <div className="min-h-screen bg-oda-ivory">
        <div className="bg-white border-b border-oda-charcoal/8 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button type="button" onClick={() => setStep(existing ? 'status-rejected' : 'landing')} className="text-sm text-oda-charcoal/60 hover:text-oda-green font-plus-jakarta">← Back</button>
            <h1 className="text-base font-extrabold text-oda-charcoal font-plus-jakarta">
              {existing ? 'Amend application' : 'Business Application'}
            </h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleRegister)} className="max-w-2xl mx-auto px-4 py-8 space-y-5">
          {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 font-plus-jakarta border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Business / trading name" error={form.formState.errors.businessName?.message} required>
              <input {...form.register('businessName')} className={inputClass} placeholder="e.g. Mama Njeri Minimart" />
            </Field>
            <Field label="Trading name (if different)" error={form.formState.errors.tradingName?.message}>
              <input {...form.register('tradingName')} className={inputClass} placeholder="Brand name used with customers" />
            </Field>
          </div>

          <Field label="Owner / contact name" error={form.formState.errors.ownerName?.message} required>
            <input {...form.register('ownerName')} className={inputClass} placeholder="Full name" />
          </Field>

          <Field label="Business phone" error={form.formState.errors.businessPhone?.message} required>
            <PhoneField
              value={form.watch('businessPhone')}
              onChange={(v) => form.setValue('businessPhone', v, { shouldValidate: false })}
              error={form.formState.errors.businessPhone?.message}
            />
          </Field>

          <Field label="Business email (optional)" error={form.formState.errors.businessEmail?.message}>
            <input {...form.register('businessEmail')} className={inputClass} type="email" placeholder="e.g. orders@myminimart.co.ke" />
          </Field>

          <Field label="Business type" error={form.formState.errors.businessType?.message} required>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {b2bBusinessTypeSchema.options.map((t) => {
                const selected = form.watch('businessType') === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => form.setValue('businessType', t, { shouldValidate: true })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold font-plus-jakarta border transition-colors text-left ${
                      selected
                        ? 'bg-oda-green text-white border-oda-green'
                        : 'bg-white text-oda-charcoal/70 border-oda-charcoal/10 hover:border-oda-green/40'
                    }`}
                  >
                    {B2B_TYPE_LABELS[t] ?? t}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="border-t border-oda-charcoal/8 pt-5">
            <p className="text-sm font-bold text-oda-charcoal font-plus-jakarta mb-3">Business location</p>
            <div className="space-y-3">
              <LocationField
                onLocation={(lat, lng) => {
                  setGeoCoords({ lat, lng });
                  form.setValue('latitude', lat);
                  form.setValue('longitude', lng);
                }}
              />
              <input {...form.register('addressLine1')} className={inputClass} placeholder="Street / building address" />
              <div className="grid grid-cols-2 gap-3">
                <input {...form.register('city')} className={inputClass} placeholder="City" />
                <input {...form.register('county')} className={inputClass} placeholder="County / Region" />
              </div>
            </div>
          </div>

          <div className="border-t border-oda-charcoal/8 pt-5 space-y-3">
            <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta uppercase tracking-wide">Optional details</p>
            <Field label="KRA PIN" error={form.formState.errors.kraPinNumber?.message}>
              <input {...form.register('kraPinNumber')} className={inputClass} placeholder="A000000000B" />
            </Field>
            <Field label="Business registration number">
              <input {...form.register('businessRegNumber')} className={inputClass} />
            </Field>
            <Field label="Primary outlet / branch name">
              <input {...form.register('defaultBranchName')} className={inputClass} placeholder="Head office" />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-oda-green text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : 'Continue to KYC uploads →'}
          </button>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS: PENDING
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'status-pending' && existing) {
    return (
      <div className="min-h-screen bg-oda-ivory">
        <div className="bg-oda-charcoal text-white px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold bg-oda-yellow text-oda-charcoal px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Application under review
            </span>
            <h1 className="text-3xl font-extrabold font-plus-jakarta mb-2">{existing.tradingName || existing.businessName}</h1>
            <p className="text-white/60 font-plus-jakarta">Submitted for wholesale access</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className={`rounded-2xl border p-5 ${statusBg(existing.kycStatus)}`}>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-amber-500 shrink-0" />
              <p className="font-extrabold text-oda-charcoal font-plus-jakarta">Application pending review</p>
            </div>
            <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">
              Our team is reviewing your application. This usually takes up to 24 hours on business days.
              You'll get an SMS and email notification once it's processed.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 space-y-3">
            <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta uppercase tracking-wide">Application details</p>
            <Row label="Business" value={existing.businessName} />
            <Row label="Type" value={B2B_TYPE_LABELS[existing.businessType ?? ''] ?? existing.businessType ?? '—'} />
            <Row label="Phone" value={existing.businessPhone ?? '—'} />
            {existing.city && <Row label="City" value={existing.city} />}
            <Row label="KYC status" value={existing.kycStatus ?? 'PENDING'} colored={statusColor(existing.kycStatus)} />
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 space-y-3">
            <p className="text-xs font-bold text-oda-charcoal/50 font-plus-jakarta uppercase tracking-wide">Actions</p>
            <button
              onClick={() => { prefillFormFromExisting(); setStep('apply'); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-oda-charcoal/10 rounded-xl text-sm font-semibold text-oda-charcoal font-plus-jakarta hover:border-oda-green/40 hover:text-oda-green transition-colors"
            >
              <span className="flex items-center gap-2"><Pencil size={15} /> Amend application</span>
              <ChevronRight size={15} />
            </button>
            {businessId && (
              <button
                onClick={() => setStep('documents')}
                className="w-full flex items-center justify-between px-4 py-3 border border-oda-charcoal/10 rounded-xl text-sm font-semibold text-oda-charcoal font-plus-jakarta hover:border-oda-green/40 hover:text-oda-green transition-colors"
              >
                <span className="flex items-center gap-2"><Upload size={15} /> Add / update documents</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS: REJECTED
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'status-rejected' && existing) {
    return (
      <div className="min-h-screen bg-oda-ivory">
        <div className="bg-oda-charcoal text-white px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold bg-red-400 text-white px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Application not approved
            </span>
            <h1 className="text-3xl font-extrabold font-plus-jakarta mb-2">{existing.tradingName || existing.businessName}</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="rounded-2xl border bg-red-50 border-red-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <XCircle size={20} className="text-red-500 shrink-0" />
              <p className="font-extrabold text-oda-charcoal font-plus-jakarta">Application rejected</p>
            </div>
            <p className="text-sm text-oda-charcoal/60 font-plus-jakarta">
              Your application was not approved. You can update your details and resubmit — our team will review the amended version within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 space-y-3">
            <Row label="Business" value={existing.businessName} />
            <Row label="Type" value={B2B_TYPE_LABELS[existing.businessType ?? ''] ?? existing.businessType ?? '—'} />
            <Row label="KYC status" value="REJECTED" colored="text-red-500" />
          </div>

          <button
            onClick={() => { prefillFormFromExisting(); setStep('apply'); }}
            className="w-full bg-oda-green text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors flex items-center justify-center gap-2"
          >
            <Pencil size={16} /> Update &amp; resubmit application
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS: APPROVED
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'status-approved' && existing) {
    return (
      <div className="min-h-screen bg-oda-ivory">
        <div className="bg-oda-charcoal text-white px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold bg-oda-green text-white px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Wholesale access active
            </span>
            <h1 className="text-3xl font-extrabold font-plus-jakarta mb-2">{existing.tradingName || existing.businessName}</h1>
            <p className="text-white/60 font-plus-jakarta">Your account has wholesale pricing enabled.</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="rounded-2xl border bg-oda-mint border-oda-green/20 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-oda-green shrink-0" />
              <p className="font-extrabold text-oda-charcoal font-plus-jakarta">Approved — wholesale pricing is on</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-oda-charcoal/8 p-5 space-y-3">
            <Row label="Business" value={existing.businessName} />
            <Row label="Type" value={B2B_TYPE_LABELS[existing.businessType ?? ''] ?? existing.businessType ?? '—'} />
            <Row label="KYC status" value="APPROVED" colored="text-oda-green" />
          </div>
          <a
            href="/"
            className="flex items-center justify-between w-full bg-oda-green text-white py-4 px-6 rounded-xl font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors"
          >
            Go to wholesale shop <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LANDING (no existing profile)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-oda-ivory">
      <div className="bg-oda-charcoal text-white">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold bg-oda-yellow text-oda-charcoal px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              B2B Wholesale Platform
            </span>
            <h1 className="text-4xl font-extrabold font-plus-jakarta leading-tight mb-4">
              Wholesale pricing,
              <br />
              <span className="text-oda-yellow">delivered to your door</span>
            </h1>
            <p className="text-white/70 font-plus-jakarta text-lg mb-8">
              For individuals, minimarts, dukas, hotels, restaurants, schools, and institutions across Kenya.
            </p>
            <button
              type="button"
              onClick={() => { trackB2bEvent('landing_cta', { target: 'apply' }); setStep('apply'); }}
              className="flex items-center gap-2 bg-oda-yellow text-oda-charcoal px-8 py-4 rounded-xl font-extrabold text-lg font-plus-jakarta hover:bg-oda-yellow-2 transition-colors"
            >
              Apply Now <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta mb-8 text-center">Wholesale program</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '💰', title: 'Wholesale Prices', desc: 'Corridor pricing on every SKU after onboarding approval.' },
            { emoji: '🏬', title: 'Multi-branch carts', desc: 'Bind each delivery outlet for MOQ-aware checkout.' },
            { emoji: '📄', title: 'Business invoices', desc: 'PDF invoices and KRA-aligned records for every order.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-oda-charcoal/8 p-6">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-base font-extrabold text-oda-charcoal font-plus-jakarta mb-2">{f.title}</h3>
              <p className="text-sm text-oda-charcoal/60 font-plus-jakarta leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center flex flex-col items-center gap-3">
          <Building2 size={28} className="text-oda-green" />
          <h2 className="text-2xl font-extrabold text-oda-charcoal font-plus-jakarta">Ready to save?</h2>
          <p className="text-oda-charcoal/60 font-plus-jakarta max-w-md">Sign in, submit your business details, and get wholesale pricing within 24 hours.</p>
          <button
            type="button"
            onClick={() => { trackB2bEvent('landing_cta', { target: 'get_started' }); setStep('apply'); }}
            className="bg-oda-green text-white px-10 py-4 rounded-xl font-extrabold font-plus-jakarta hover:bg-oda-green-dark transition-colors text-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, colored }: { label: string; value: string; colored?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-oda-charcoal/5 last:border-0">
      <span className="text-xs text-oda-charcoal/50 font-plus-jakarta">{label}</span>
      <span className={`text-sm font-bold font-plus-jakarta ${colored ?? 'text-oda-charcoal'}`}>{value}</span>
    </div>
  );
}
