import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<html><head></head><body></body></html>', { url:'https://unit.example/' });
Object.assign(globalThis, { window:dom.window, document:dom.window.document, localStorage:dom.window.localStorage, sessionStorage:dom.window.sessionStorage });
Object.defineProperty(globalThis, 'navigator', { value:dom.window.navigator, configurable:true });
Object.assign(process.env, {
  NEXT_PUBLIC_GOOGLE_TAG_ENABLED:'true', NEXT_PUBLIC_GA4_MEASUREMENT_ID:'G-UNITTEST',
  NEXT_PUBLIC_GOOGLE_ADS_ID:'AW-123456789', NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL:'fixture-label',
  NEXT_PUBLIC_META_PIXEL_ENABLED:'true', NEXT_PUBLIC_META_PIXEL_ID:'123456789',
});
const { setMarketingConsent, trackPageView, trackTrialLead } = await import('../lib/tracking/client');
const commands = () => (window.dataLayer ?? []).map(entry => Array.from(entry as ArrayLike<unknown>));
const events = () => commands().filter(command => command[0] === 'event');
const receipt = { ok:true, status:'accepted', eventId:'trial-12345678-1234-4123-8123-123456789abc' };

test('configured tags count accepted trials once per platform, only after opt-in, with no form data', () => {
  assert.equal(document.querySelectorAll('script').length,0);
  assert.equal(trackTrialLead(receipt),false);
  setMarketingConsent('granted');
  assert.equal(document.querySelectorAll('script').length,2);
  assert.equal(trackPageView('trial-tracking-page'),true);
  assert.equal(trackTrialLead({ ...receipt, status:'pending' }),false);
  assert.equal(trackTrialLead(receipt),true);
  assert.equal(trackTrialLead(receipt),false);
  assert.deepEqual(events().map(command => command[1]), ['page_view','generate_lead','conversion']);
  assert.deepEqual(events()[1][2], { send_to:'G-UNITTEST' });
  assert.deepEqual(events()[2][2], { send_to:'AW-123456789/fixture-label', transaction_id:receipt.eventId });
  assert.deepEqual(window.fbq?.queue?.filter(command => command[0] === 'track').map(command => command[1]), ['PageView','Lead']);
  setMarketingConsent('denied');
  assert.equal(document.querySelectorAll('script').length,0);
  assert.equal(events().length,0);
  assert.equal(trackTrialLead({ ...receipt, eventId:'trial-22345678-1234-4123-8123-123456789abc' }),false);
});
