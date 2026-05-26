const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function trackCampaignEvent(
  campaignId: string,
  eventType: 'IMPRESSION' | 'CLICK' | 'ORDER',
  productId?: string,
) {
  try {
    const sessionId =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('oda_session_id') ?? undefined
        : undefined;
    await fetch(`${API_BASE}/v1/manufacturer/campaigns/${campaignId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, productId, sessionId }),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}

export type SponsoredPlacement = { campaignId: string; productId: string };

export async function fetchActiveSponsoredPlacements(): Promise<SponsoredPlacement[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/manufacturer/placements/active`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { placements?: SponsoredPlacement[] };
    return data.placements ?? [];
  } catch {
    return [];
  }
}
