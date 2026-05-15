import { notFound } from 'next/navigation';
import { DealDetailClient } from './deal-detail-client';

const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000/api';

async function fetchDeal(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/v1/deals/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (res.ok) return res.json();
  } catch {
    // backend unavailable
  }
  return null;
}

export default async function DealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await fetchDeal(slug);
  if (!deal) notFound();
  return <DealDetailClient deal={deal} />;
}
