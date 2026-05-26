import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Oda',
  description: 'Oda Commerce Privacy Policy — how we collect, use, and protect your personal data.',
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'We collect your mobile phone number, name, delivery address, order history, device identifiers, and usage data when you use the Oda platform. For B2B users we also collect business registration details, KRA PIN, and KYC documents as required by law.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your information to: process orders and payments; send delivery updates and receipts via WhatsApp and SMS; provide customer support; personalise your shopping experience; detect and prevent fraud; comply with Kenyan legal obligations.',
  },
  {
    title: '3. Sharing of Information',
    content: 'We share your information with: supplier partners to fulfil orders; logistics/rider partners for delivery; M-Pesa and payment processors for payments; WhatsApp Business API for receipts. We do not sell your personal data to third-party marketers.',
  },
  {
    title: '4. Data Security',
    content: 'We use industry-standard encryption (TLS) for data in transit and AES-256 for sensitive data at rest. Access controls, audit logging, and regular security reviews protect your data. No system is 100% secure; please report suspected breaches to security@odaflow.com.',
  },
  {
    title: '5. Data Retention',
    content: 'Order and account data is retained for 7 years to comply with Kenyan tax and commercial law. You may request deletion of non-essential personal data by contacting privacy@odaflow.com. Deletion requests are processed within 30 days subject to legal retention requirements.',
  },
  {
    title: '6. Your Rights',
    content: 'Under Kenya\'s Data Protection Act 2019 you have the right to: access your personal data; correct inaccurate data; restrict processing; data portability; lodge a complaint with the Office of the Data Protection Commissioner (ODPC).',
  },
  {
    title: '7. Cookies and Analytics',
    content: 'The Oda website uses essential cookies for session management. Analytics cookies (e.g. performance metrics) are only set with your consent. You can manage cookie preferences in your browser settings. The mobile app does not use cookies.',
  },
  {
    title: '8. WhatsApp Communication',
    content: 'By placing an order you consent to receiving order confirmations, receipts, and delivery updates via WhatsApp to your registered mobile number. You may opt out of marketing messages at any time by replying STOP.',
  },
  {
    title: '9. Children\'s Privacy',
    content: 'The Oda platform is not directed at children under 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us personal data, please contact privacy@odaflow.com.',
  },
  {
    title: '10. Changes to This Policy',
    content: 'We may update this policy to reflect changes in our practices or Kenyan law. Material changes will be communicated via the app at least 14 days in advance.',
  },
  {
    title: '11. Contact',
    content: 'For privacy enquiries, contact our Data Protection Officer at privacy@odaflow.com or write to: Data Protection Officer, Oda Commerce Ltd, Nairobi, Kenya.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Header */}
      <div className="bg-oda-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-plus-jakarta transition-colors mb-6">
            <ChevronLeft size={16} /> Back to Oda
          </Link>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-plus-jakarta mb-2">Privacy Policy</h1>
          <p className="text-white/50 text-sm font-plus-jakarta">Last updated: May 15, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="prose prose-slate max-w-none">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="text-lg font-extrabold text-oda-charcoal font-plus-jakarta mb-3">{section.title}</h2>
              <p className="text-oda-charcoal/70 font-plus-jakarta leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-oda-charcoal/10 flex items-center justify-between">
          <p className="text-xs text-oda-charcoal/40 font-plus-jakarta">© 2026 Oda Commerce Ltd. All rights reserved.</p>
          <Link href="/legal/terms" className="text-sm font-semibold text-oda-green hover:underline font-plus-jakarta">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
