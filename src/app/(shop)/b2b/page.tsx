'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ChevronRight, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { b2bApi } from '@/lib/api-client';
import {
  b2bBusinessTypeSchema,
  b2bRegisterFormSchema,
  toRegisterPayload,
  type B2bRegisterFormValues,
} from '@/lib/b2b-shop-schema';
import { trackB2bEvent } from '@/lib/b2b-telemetry';

type Step = 'landing' | 'apply' | 'documents' | 'success';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#E8E8E0] bg-white text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-[#198A2E]/20';

const KYC_SLOTS: { type: string; label: string; required: boolean }[] = [
  { type: 'BUSINESS_REGISTRATION', label: 'Business registration certificate', required: true },
  { type: 'KRA_PIN', label: 'KRA PIN / tax proof', required: false },
  { type: 'TRADE_PERMIT', label: 'Trade permit', required: false },
  { type: 'OWNER_ID', label: 'Owner ID', required: false },
  { type: 'SHOP_PHOTO', label: 'Shop photo', required: false },
];

function errMsg(e: unknown): string {
  const ax = e as {
    response?: { data?: { message?: string | string[]; code?: string } };
    message?: string;
  };
  const m = ax?.response?.data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join('; ');
  return ax.message || 'Request failed';
}

export default function B2BPage() {
  const [step, setStep] = useState<Step>('landing');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [presignEnabled, setPresignEnabled] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const defaultValues = useMemo<B2bRegisterFormValues>(
    () => ({
      businessName: '',
      tradingName: '',
      ownerName: '',
      businessPhone: '',
      businessEmail: '',
      businessType: 'DUKA',
      latitude: undefined,
      longitude: undefined,
      addressLine1: '',
      city: '',
      county: '',
      kraPinNumber: '',
      businessRegNumber: '',
      defaultBranchName: '',
    }),
    [],
  );

  const form = useForm<B2bRegisterFormValues>({
    resolver: zodResolver(b2bRegisterFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const loadCaps = useCallback(async () => {
    try {
      const { data } = await b2bApi.getDocumentCapabilities();
      setPresignEnabled(!!(data as { presignedPutEnabled?: boolean }).presignedPutEnabled);
    } catch {
      setPresignEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'documents' && businessId) void loadCaps();
  }, [step, businessId, loadCaps]);

  async function runKycUpload(bid: string, file: File, docType: string, usePresign: boolean) {
    const mime =
      file.type && /^application\/pdf$|^image\/(jpeg|png|jpg)$/.test(file.type)
        ? file.type
        : file.name.toLowerCase().endsWith('.pdf')
          ? 'application/pdf'
          : 'image/jpeg';

    if (usePresign) {
      const { data: presign } = await b2bApi.presignKyc(bid, {
        documentType: docType,
        mimeType: mime,
        contentLength: file.size,
        filename: file.name,
      });
      const presignedUrl = (presign as { presignedUrl: string }).presignedUrl;
      const uploadId = (presign as { uploadId: string }).uploadId;
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mime },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Storage upload failed (${putRes.status})`);
      const etag = putRes.headers.get('etag') ?? undefined;
      await b2bApi.confirmKyc(bid, { uploadId, etag: etag ?? undefined });
    } else {
      const fd = new FormData();
      fd.append('documentType', docType);
      fd.append('file', file);
      await b2bApi.uploadKycMultipart(bid, fd, (pct) =>
        setUploadPct((prev) => ({ ...prev, [docType]: pct })),
      );
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
      const payload = toRegisterPayload(
        b2bRegisterFormSchema.parse({
          ...values,
          tradingName: values.tradingName ?? '',
          businessEmail: values.businessEmail ?? '',
        }),
      );
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
      if (!files[r.type]) {
        setError(`Please attach: ${r.label}`);
        return;
      }
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
        trackB2bEvent('kyc_upload_file_ok', { documentType: slot.type });
      }
      trackB2bEvent('kyc_upload_complete', { businessId });
      setStep('success');
    } catch (err: unknown) {
      trackB2bEvent('kyc_upload_err', { message: errMsg(err) });
      setError(errMsg(err));
    } finally {
      setUploadBusy(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E8E8E0] p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#EBF9EE] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-[#198A2E]" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">
            Application Submitted
          </h1>
          <p className="text-[#666] font-plus-jakarta mb-2">
            We&apos;ll review your KYC and notify you when wholesale access is enabled.
          </p>
          <button
            type="button"
            onClick={() => {
              setStep('landing');
              setBusinessId(null);
              form.reset(defaultValues);
              setFiles({});
            }}
            className="mt-4 text-[#198A2E] text-sm font-bold font-plus-jakarta"
          >
            Back to overview
          </button>
        </div>
      </div>
    );
  }

  if (step === 'documents' && businessId) {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <div className="bg-white border-b border-[#E8E8E0] px-4 py-4">
          <button
            type="button"
            onClick={() => setStep('apply')}
            className="text-sm text-[#666] font-plus-jakarta"
          >
            ← Back
          </button>
        </div>
        <form onSubmit={handleDocumentsSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">KYC documents</h1>
          <p className="text-sm text-[#666] font-plus-jakarta">
            Upload PDF or images (max 10MB each).{' '}
            {presignEnabled
              ? 'Direct-to-storage upload is enabled.'
              : 'Files are sent securely to our API (multipart).'}
          </p>
          <input type="hidden" name="b2bBusinessId" value={businessId} readOnly />
          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 font-plus-jakarta">
              {error}
            </div>
          )}
          {KYC_SLOTS.map((slot) => (
            <div key={slot.type}>
              <label className="block text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-2">
                {slot.label}
                {slot.required ? <span className="text-red-500"> *</span> : null}
              </label>
              <label className="border-2 border-dashed border-[#E8E8E0] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#198A2E]/40 transition-colors">
                <Upload size={22} className="text-[#198A2E]" />
                <span className="text-xs text-[#666] font-plus-jakarta text-center">
                  {files[slot.type]?.name ?? 'Choose file'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFiles((prev) => ({ ...prev, [slot.type]: f }));
                    trackB2bEvent('kyc_file_selected', { documentType: slot.type });
                  }}
                />
              </label>
              {uploadPct[slot.type] != null && uploadPct[slot.type] < 100 && (
                <p className="text-xs text-[#198A2E] mt-1 font-plus-jakarta">
                  Uploading… {uploadPct[slot.type]}%
                </p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={uploadBusy}
            className="w-full bg-[#198A2E] text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadBusy ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Uploading…
              </>
            ) : (
              'Submit documents'
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'apply') {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <div className="bg-white border-b border-[#E8E8E0] px-4 py-4">
          <button
            type="button"
            onClick={() => setStep('landing')}
            className="text-sm text-[#666] font-plus-jakarta"
          >
            ← Back
          </button>
        </div>
        <form onSubmit={form.handleSubmit(handleRegister)} className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">
            Business Application
          </h1>
          <p className="text-sm text-[#666] font-plus-jakarta mb-4">
            Validated with Zod, sent to <code className="text-xs bg-[#eee] px-1 rounded">POST /api/v1/b2b/register</code>{' '}
            with <code className="text-xs bg-[#eee] px-1 rounded">Idempotency-Key</code> and{' '}
            <code className="text-xs bg-[#eee] px-1 rounded">X-Correlation-Id</code>. Sign in first.
          </p>
          {error && (
            <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 font-plus-jakarta">{error}</div>
          )}

          <Field label="Business name" error={form.formState.errors.businessName?.message} required>
            <input {...form.register('businessName')} className={inputClass} placeholder="e.g. Mama Njeri Supermarket" />
          </Field>
          <Field label="Trading name (optional)" error={form.formState.errors.tradingName?.message}>
            <input {...form.register('tradingName')} className={inputClass} />
          </Field>
          <Field label="Owner name" error={form.formState.errors.ownerName?.message} required>
            <input {...form.register('ownerName')} className={inputClass} />
          </Field>
          <Field label="Business phone" error={form.formState.errors.businessPhone?.message} required>
            <input {...form.register('businessPhone')} className={inputClass} placeholder="+254712345678" type="tel" />
          </Field>
          <Field label="Business email (optional)" error={form.formState.errors.businessEmail?.message}>
            <input {...form.register('businessEmail')} className={inputClass} type="email" />
          </Field>
          <Field label="Business type" error={form.formState.errors.businessType?.message} required>
            <select {...form.register('businessType')} className={inputClass}>
              {b2bBusinessTypeSchema.options.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Street / building" error={form.formState.errors.addressLine1?.message}>
            <input {...form.register('addressLine1')} className={inputClass} />
          </Field>
          <Field label="City" error={form.formState.errors.city?.message}>
            <input {...form.register('city')} className={inputClass} />
          </Field>
          <Field label="County" error={form.formState.errors.county?.message}>
            <input {...form.register('county')} className={inputClass} />
          </Field>
          <Field label="Default branch name (optional)" error={form.formState.errors.defaultBranchName?.message}>
            <input {...form.register('defaultBranchName')} className={inputClass} placeholder="Head office" />
          </Field>
          <Field label="KRA PIN (optional)" error={form.formState.errors.kraPinNumber?.message}>
            <input {...form.register('kraPinNumber')} className={inputClass} />
          </Field>
          <Field label="Business registration number (optional)" error={form.formState.errors.businessRegNumber?.message}>
            <input {...form.register('businessRegNumber')} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Latitude (optional)" error={form.formState.errors.latitude?.message as string | undefined}>
              <input {...form.register('latitude')} className={inputClass} inputMode="decimal" placeholder="-1.29" />
            </Field>
            <Field label="Longitude (optional)" error={form.formState.errors.longitude?.message as string | undefined}>
              <input {...form.register('longitude')} className={inputClass} inputMode="decimal" placeholder="36.82" />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#198A2E] text-white py-4 rounded-xl text-base font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Continue to KYC uploads'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold bg-[#F8C915] text-[#1A1A1A] px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              B2B Wholesale Platform
            </span>
            <h1 className="text-4xl font-extrabold font-plus-jakarta leading-tight mb-4">
              Wholesale pricing,
              <br />
              <span className="text-[#F8C915]">delivered to your door</span>
            </h1>
            <p className="text-white/70 font-plus-jakarta text-lg mb-8">
              For minimarts, dukas, hotels, restaurants, schools, and institutions across Kenya.
            </p>
            <button
              type="button"
              onClick={() => {
                trackB2bEvent('landing_cta', { target: 'apply' });
                setStep('apply');
              }}
              className="flex items-center gap-2 bg-[#F8C915] text-[#1A1A1A] px-8 py-4 rounded-xl font-extrabold text-lg font-plus-jakarta hover:bg-[#e6b914] transition-colors"
            >
              Apply Now <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8 text-center">
          Wholesale program
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: '💰',
              title: 'Wholesale Prices',
              desc: 'B2B catalogue pricing after onboarding approval.',
            },
            { emoji: '🏬', title: 'Branch-linked carts', desc: 'Bind a depot for MOQ-aware checkout on the backend.' },
            { emoji: '📄', title: 'Business invoices', desc: 'PDF invoicing hooks for fulfilled B2B orders.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-[#E8E8E0] p-6">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-base font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">{f.title}</h3>
              <p className="text-sm text-[#666] font-plus-jakarta leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center flex flex-col items-center gap-3">
          <Building2 size={28} className="text-[#198A2E]" />
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Ready?</h2>
          <p className="text-[#666] font-plus-jakarta max-w-md">Sign in, then submit your business registration.</p>
          <button
            type="button"
            onClick={() => {
              trackB2bEvent('landing_cta', { target: 'get_started' });
              setStep('apply');
            }}
            className="bg-[#198A2E] text-white px-10 py-4 rounded-xl font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors text-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-2">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1 font-plus-jakarta">{error}</p> : null}
    </div>
  );
}
