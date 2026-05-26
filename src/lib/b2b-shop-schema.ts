import { z } from 'zod';

/** Matches Prisma `B2BBusinessType` */
export const b2bBusinessTypeSchema = z.enum([
  'INDIVIDUAL',
  'KIOSK',
  'DUKA',
  'MINIMART',
  'SUPERMARKET',
  'RESTAURANT',
  'HOTEL',
  'SCHOOL',
  'OFFICE',
  'CATERER',
  'RESELLER',
  'INSTITUTION',
  'OTHER',
]);

export const B2B_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Individual / Sole Trader',
  KIOSK: 'Kiosk',
  DUKA: 'Shop (Duka)',
  MINIMART: 'Minimart',
  SUPERMARKET: 'Supermarket',
  RESTAURANT: 'Restaurant / Café',
  HOTEL: 'Hotel',
  SCHOOL: 'School',
  OFFICE: 'Office',
  CATERER: 'Caterer',
  RESELLER: 'Reseller / Distributor',
  INSTITUTION: 'Institution / NGO',
  OTHER: 'Other',
};

/** Mirrors `RegisterB2BDto` — wholesale shop onboarding */
export const b2bRegisterFormSchema = z.object({
  businessName: z.string().min(2).max(180),
  tradingName: z.string().max(180).optional().or(z.literal('')),
  ownerName: z.string().min(2).max(180),
  businessPhone: z
    .string()
    .min(10)
    .max(18)
    .regex(/^\+?[0-9][\d\s-]{8,}$/, 'Use a valid phone (e.g. +254712345678)'),
  businessEmail: z.string().email().optional().or(z.literal('')),
  businessType: b2bBusinessTypeSchema,
  latitude: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(-90).max(90).optional(),
  ),
  longitude: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(-180).max(180).optional(),
  ),
  addressLine1: z.string().max(240).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  county: z.string().max(120).optional().or(z.literal('')),
  kraPinNumber: z.string().max(40).optional().or(z.literal('')),
  businessRegNumber: z.string().max(80).optional().or(z.literal('')),
  defaultBranchName: z.string().max(120).optional().or(z.literal('')),
});

export type B2bRegisterFormValues = z.infer<typeof b2bRegisterFormSchema>;

export function toRegisterPayload(values: B2bRegisterFormValues): Record<string, unknown> {
  const p: Record<string, unknown> = {
    businessName: values.businessName.trim(),
    ownerName: values.ownerName.trim(),
    businessPhone: values.businessPhone.trim(),
    businessType: values.businessType,
  };
  const t = values.tradingName?.trim();
  if (t) p.tradingName = t;
  const em = values.businessEmail?.trim();
  if (em) p.businessEmail = em;
  if (values.latitude != null) p.latitude = values.latitude;
  if (values.longitude != null) p.longitude = values.longitude;
  const a = values.addressLine1?.trim();
  if (a) p.addressLine1 = a;
  const c = values.city?.trim();
  if (c) p.city = c;
  const co = values.county?.trim();
  if (co) p.county = co;
  const pin = values.kraPinNumber?.trim();
  if (pin) p.kraPinNumber = pin;
  const reg = values.businessRegNumber?.trim();
  if (reg) p.businessRegNumber = reg;
  const br = values.defaultBranchName?.trim();
  if (br) p.defaultBranchName = br;
  return p;
}
