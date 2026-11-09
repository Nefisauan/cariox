'use client';
import { getMetaConfiguration, isVerifiedConversion, type MarketingConsent, type MetaEvent } from './contracts';
import { ConsentAwareTracker } from './engine';
import { privacySignal, storeConsent } from './consent';
import { googleConfig, setGoogleConsent, trackGooglePageView, trackGoogleTrialLead } from './google';
import { isTrialReceipt } from '../trial/contract';

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; callMethod?: (...args: unknown[]) => void; push?: Fbq; loaded?: boolean; version?: string };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }
export const metaConfig = getMetaConfiguration({ NEXT_PUBLIC_META_PIXEL_ENABLED: googleConfig.gtmId ? undefined : process.env.NEXT_PUBLIC_META_PIXEL_ENABLED, NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID });
export const trackingEnabled = metaConfig.enabled || googleConfig.enabled;
let initialized = false;
let script: HTMLScriptElement | null = null;
let scriptFailed = false;
function initializePixel() {
  if (!metaConfig.enabled || typeof window === 'undefined') return;
  if (!window.fbq) {
    const fbq: Fbq = (...args: unknown[]) => { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue!.push(args); };
    fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
    window.fbq = fbq; window._fbq = fbq;
  }
  // Never infer consent from a Pixel ID, and disable automatic event detection.
  window.fbq('consent', 'grant');
  if (!initialized) { window.fbq('set','autoConfig',false,metaConfig.pixelId); window.fbq('init',metaConfig.pixelId); initialized = true; }
  if (!script) {
    scriptFailed = false;
    script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; script.id = 'cariox-meta-pixel';
    script.onerror = () => { scriptFailed = true; };
    document.head.appendChild(script);
  }
}
function deleteMetaCookies() {
  const domains = [null, ...window.location.hostname.split('.').map((_,index,array) => `.${array.slice(index).join('.')}`)];
  for (const name of ['_fbp','_fbc']) for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
}
export const tracker = new ConsentAwareTracker(metaConfig.enabled, (event: MetaEvent, eventId: string) => {
  if (!window.fbq || scriptFailed || privacySignal()) throw new Error('Tracking unavailable');
  window.fbq('track',event,{}, {eventID:eventId});
}, key => { try { return sessionStorage.getItem(`cariox:meta:${key}`) === '1'; } catch { return false; } }, key => { try { sessionStorage.setItem(`cariox:meta:${key}`,'1'); } catch { /* In-memory dedup remains active. */ } });
export function setMarketingConsent(requested: MarketingConsent, persist = true): MarketingConsent {
  const value = privacySignal() ? 'denied' : requested;
  tracker.setConsent(value);
  setGoogleConsent(value);
  if (persist && value !== 'unknown') storeConsent(value);
  if (value === 'granted') initializePixel();
  else if (typeof window !== 'undefined') {
    // Drop any queued events before a delayed script can execute after revocation.
    if (window.fbq?.queue) window.fbq.queue = window.fbq.queue.filter(args => args[0] !== 'track' && args[0] !== 'trackCustom');
    window.fbq?.('consent','revoke');
    script?.remove(); script = null;
    deleteMetaCookies();
  }
  return value;
}
export const newEventId = (prefix: string) => `${prefix}:${crypto.randomUUID()}`;
export function trackPageView(navigationId: string) {
  const meta = tracker.track('PageView', navigationId);
  const google = trackGooglePageView(navigationId);
  return meta || google;
}
export function trackTrialLead(receipt: unknown) {
  if (!isTrialReceipt(receipt) || privacySignal()) return false;
  const meta = tracker.track('Lead', receipt.eventId);
  const google = trackGoogleTrialLead(receipt.eventId);
  return meta || google;
}
async function trackVerified(event: 'Lead'|'CompleteRegistration', reference: string): Promise<boolean> {
  if (!tracker.canTrack() || privacySignal() || !/^[A-Za-z0-9_:-]{8,160}$/.test(reference)) return false;
  try {
    const response = await fetch(event === 'Lead' ? '/api/contact/status' : '/api/registration/status', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reference}), credentials:'same-origin', cache:'no-store' });
    if (!response.ok) return false;
    const receipt: unknown = await response.json();
    if (!isVerifiedConversion(receipt,event) || receipt.reference !== reference) return false;
    return tracker.track(event,receipt.eventId);
  } catch { return false; }
}
// These verify server receipts; they do not accept a client-supplied "success" flag.
export const trackLead = (reference: string) => trackVerified('Lead',reference);
export const trackCompleteRegistration = (reference: string) => trackVerified('CompleteRegistration',reference);
