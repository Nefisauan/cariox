import type { MarketingConsent } from './contracts';
export const CONSENT_KEY = 'cariox:marketing-consent:v2';
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
export function parseConsent(value: string | null, now = Date.now()): MarketingConsent {
  try {
    const record = JSON.parse(value || 'null');
    if (record?.version !== 2 || !['granted','denied'].includes(record?.value) || !Number.isFinite(record?.updatedAt) || record.updatedAt > now || now - record.updatedAt > MAX_AGE_MS) return 'unknown';
    return record.value;
  } catch { return 'unknown'; }
}
export function privacySignal(): boolean {
  return typeof navigator !== 'undefined' && ((navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl === true || navigator.doNotTrack === '1');
}
export function readConsent(): MarketingConsent {
  if (privacySignal()) return 'denied';
  try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return 'unknown'; }
}
export function storeConsent(value: Exclude<MarketingConsent,'unknown'>) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({version:2,value,updatedAt:Date.now()})); } catch { /* Memory-only consent still applies when storage is blocked. */ }
}
