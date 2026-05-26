import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Oda',
  description: 'Oda Commerce Terms of Service — your rights and obligations when using the Oda platform.',
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using the Oda platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use the Service.',
  },
  {
    title: '2. Description of Service',
    content: 'Oda is a Kenya-first quick-commerce and wholesale platform connecting consumers, B2B buyers, suppliers, manufacturers, and logistics partners. Oda provides technology to facilitate transactions between these parties but does not itself stock or sell products directly.',
  },
  {
    title: '3. User Accounts',
    content: 'You must provide a valid Kenyan mobile number to create an account. You are responsible for all activity on your account. Oda reserves the right to suspend accounts that violate these terms or engage in fraudulent activity.',
  },
  {
    title: '4. Ordering and Payments',
    content: 'All prices are in Kenyan Shillings (KES) and include applicable taxes unless stated otherwise. Payment is required at checkout via M-Pesa, wallet balance, or card. Orders are fulfilled subject to stock availability at your nearest supplier branch.',
  },
  {
    title: '5. Delivery',
    content: 'Estimated delivery times are provided in good faith and may vary due to traffic, weather, or demand. Oda is not liable for delays caused by factors outside our control. Delivery fees are displayed at checkout.',
  },
  {
    title: '6. Returns and Refunds',
    content: 'You may return eligible products within 30 days of delivery if they are damaged, incorrect, or expired. Refunds are processed to your Oda wallet within 24 hours of return verification. Non-perishable items must be returned in original condition.',
  },
  {
    title: '7. B2B Wholesale Accounts',
    content: 'B2B accounts require KYC verification. Wholesale prices and credit terms are subject to approval. Oda reserves the right to suspend wholesale access if usage violates these terms or if KYC information is found to be inaccurate.',
  },
  {
    title: '8. Prohibited Conduct',
    content: 'You may not use the Service for fraud, resale outside permitted territories, circumventing pricing controls, scraping, or any activity that disrupts the Service. Violations may result in immediate account termination.',
  },
  {
    title: '9. Intellectual Property',
    content: 'All content, trademarks, logos, and software on the Oda platform are owned by Oda Commerce Ltd or its licensors. You may not reproduce, distribute, or create derivative works without written permission.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'To the maximum extent permitted by Kenyan law, Oda shall not be liable for indirect, incidental, or consequential damages arising from use of the Service. Our liability is limited to the value of the specific transaction giving rise to the claim.',
  },
  {
    title: '11. Governing Law',
    content: 'These terms are governed by the laws of Kenya. Any disputes shall be resolved by the courts of Kenya, with Nairobi as the seat of jurisdiction.',
  },
  {
    title: '12. Changes to Terms',
    content: 'We may update these terms from time to time. Material changes will be communicated via the app or email. Continued use of the Service after changes constitutes acceptance of the new terms.',
  },
  {
    title: '13. Contact',
    content: 'For questions about these terms, contact us at legal@odaflow.com or write to Oda Commerce Ltd, Nairobi, Kenya.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-oda-ivory">
      {/* Header */}
      <div className="bg-oda-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-plus-jakarta transition-colors mb-6">
            <ChevronLeft size={16} /> Back to Oda
          </Link>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-plus-jakarta mb-2">Terms of Service</h1>
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
          <Link href="/legal/privacy" className="text-sm font-semibold text-oda-green hover:underline font-plus-jakarta">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
