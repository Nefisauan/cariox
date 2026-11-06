export type MarketingConsent = 'unknown' | 'granted' | 'denied';
export type MetaEvent = 'PageView' | 'Lead' | 'CompleteRegistration';
export type VerifiedConversion = { verified: true; mode: 'live'; status: 'confirmed' | 'delivered'; reference: string; eventId: string; verifiedAt: string };
export function isVerifiedConversion(value: unknown, event: Exclude<MetaEvent, 'PageView'>): value is VerifiedConversion {
  if (!value || typeof value !== 'object') return false;
  const receipt = value as Record<string, unknown>;
  return receipt.verified === true && receipt.mode === 'live' && receipt.status === (event === 'CompleteRegistration' ? 'confirmed' : 'delivered') && typeof receipt.reference === 'string' && /^[A-Za-z0-9_:-]{8,160}$/.test(receipt.reference) && typeof receipt.eventId === 'string' && /^[A-Za-z0-9_:-]{8,160}$/.test(receipt.eventId) && typeof receipt.verifiedAt === 'string' && Number.isFinite(Date.parse(receipt.verifiedAt)) && !receipt.reference.startsWith('DEMO-');
}
export function getMetaConfiguration(env: Record<string, string | undefined>) {
  const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID || '';
  return { enabled: env.NEXT_PUBLIC_META_PIXEL_ENABLED === 'true' && /^\d{5,30}$/.test(pixelId), pixelId };
}
