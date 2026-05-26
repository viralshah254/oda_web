import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SentryInit } from '@/components/sentry-init';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Oda — Kenya's Quick Commerce",
  description: 'Order groceries, snacks, beauty, household essentials and more. Delivered in minutes across Kenya.',
  keywords: ['grocery delivery', 'Kenya', 'quick commerce', 'Nairobi', 'Oda'],
  openGraph: {
    title: 'Oda — Delivered in Minutes',
    description: "Kenya's quick-commerce super platform",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased`}>
        <SentryInit />
        {children}
      </body>
    </html>
  );
}
