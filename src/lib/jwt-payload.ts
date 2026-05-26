/**
 * Decode JWT payload without verifying the signature (client-side UX only).
 * Server routes still enforce auth via the API.
 */
export function parseJwtPayload(accessToken: string | null | undefined): Record<string, unknown> | null {
  if (!accessToken || typeof accessToken !== 'string') return null;
  const parts = accessToken.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    if (typeof atob === 'undefined') return null;
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parseJwtRole(accessToken: string | null | undefined): string | undefined {
  const payload = parseJwtPayload(accessToken);
  const r = payload?.role;
  return typeof r === 'string' ? r : undefined;
}
