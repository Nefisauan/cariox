'use client';

import { privacySignal } from './consent';
import type { MarketingConsent } from './contracts';
import { ConsentAwareTracker } from './engine';

export function getGoogleConfiguration(env: Record<string, string | undefined>) {
  const active = env.NEXT_PUBLIC_GOOGLE_TAG_ENABLED === 'true';
  const container = env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? '';
  const gtmId = active && /^GTM-[A-Z0-9]{4,20}$/.test(container) ? container : '';
  const ga = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? '';
  const ads = env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '';
  const label = env.NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL ?? '';
  const analyticsId = active && !gtmId && /^G-[A-Z0-9]{4,24}$/.test(ga) ? ga : '';
  const adsId = active && !gtmId && /^AW-\d{5,20}$/.test(ads) && /^[\w-]{1,100}$/.test(label) ? ads : '';
  return { enabled: Boolean(gtmId || analyticsId || adsId), gtmId, analyticsId, adsId, conversion: adsId ? `${adsId}/${label}` : '' };
}

export const googleConfig = getGoogleConfiguration({
  NEXT_PUBLIC_GOOGLE_TAG_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_TAG_ENABLED,
  NEXT_PUBLIC_GTM_CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL,
});

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}
let script: HTMLScriptElement | null = null;
let loaded = false;
let failed = false;
let granted = false;
const pending = new Set<unknown>();
function enqueue(command: unknown) {
  (window.dataLayer ??= []).push(command);
  if (!loaded) pending.add(command);
}
function dropPending() {
  const layer = window.dataLayer;
  if (layer) for (let i = layer.length - 1; i >= 0; i--) if (pending.has(layer[i])) layer.splice(i, 1);
  pending.clear();
}
const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

export function setGoogleConsent(value: MarketingConsent) {
  if (!googleConfig.enabled || typeof window === 'undefined') return;
  const allow = value === 'granted' && !privacySignal();
  googleTracker.setConsent(allow ? 'granted' : 'denied');
  if (googleConfig.analyticsId) Object.assign(window, { [`ga-disable-${googleConfig.analyticsId}`]: !allow });
  if (!allow) {
    granted = false;
    if (!loaded) {
      dropPending();
      script?.remove();
      script = null;
    }
    window.gtag?.('consent', 'update', denied);
    return;
  }
  if (granted && !failed) return;
  granted = true;
  if (!window.gtag) {
    window.gtag = function () {
      enqueue(arguments);
    };
  }
  if (!loaded && !script) {
    failed = false;
    window.gtag('consent', 'default', denied);
  }
  window.gtag('consent', 'update', {
    ...denied, analytics_storage: (googleConfig.analyticsId || googleConfig.gtmId) ? 'granted' : 'denied',
    ad_storage: (googleConfig.adsId || googleConfig.gtmId) ? 'granted' : 'denied',
    ad_user_data: (googleConfig.adsId || googleConfig.gtmId) ? 'granted' : 'denied',
  });
  if (script) return;
  if (googleConfig.gtmId) {
    enqueue({ 'gtm.start': Date.now(), event:'gtm.js' });
  } else {
    window.gtag('js', new Date());
    for (const id of [googleConfig.analyticsId, googleConfig.adsId].filter(Boolean)) {
      window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    }
  }
  const element = document.createElement('script');
  element.id = 'cariox-google-tag';
  element.async = true;
  element.src = googleConfig.gtmId
    ? `https://www.googletagmanager.com/gtm.js?id=${googleConfig.gtmId}`
    : `https://www.googletagmanager.com/gtag/js?id=${googleConfig.analyticsId || googleConfig.adsId}`;
  element.onload = () => { if (script === element) { loaded = true; pending.clear(); } };
  element.onerror = () => {
    if (script !== element) return;
    failed = true;
    dropPending();
    element.remove();
    script = null;
  };
  script = element;
  document.head.appendChild(element);
}

const googleTracker = new ConsentAwareTracker(googleConfig.enabled, (event, eventId) => {
  if (!window.gtag || failed || privacySignal()) throw new Error('Google measurement unavailable');
  if (event === 'PageView') {
    if (!googleConfig.analyticsId) throw new Error('GA4 unavailable');
    window.gtag('event', 'page_view', { send_to: googleConfig.analyticsId, page_location: window.location.origin + window.location.pathname });
  } else if (event === 'Lead') {
    if (googleConfig.gtmId) {
      enqueue({ event:'generate_lead', lead_event_id:eventId });
      return;
    }
    if (googleConfig.analyticsId) window.gtag('event', 'generate_lead', { send_to: googleConfig.analyticsId });
    if (googleConfig.conversion) window.gtag('event', 'conversion', { send_to: googleConfig.conversion, transaction_id: eventId });
  }
}, key => { try { return sessionStorage.getItem(`cariox:google:${key}`) === '1'; } catch { return false; } },
key => { try { sessionStorage.setItem(`cariox:google:${key}`, '1'); } catch { /* Memory dedup still works. */ } });

export const trackGooglePageView = (navigationId: string) => googleTracker.track('PageView', navigationId);
export const trackGoogleTrialLead = (eventId: string) => googleTracker.track('Lead', eventId);
