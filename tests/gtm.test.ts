import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<html><head></head><body></body></html>',{url:'https://unit.example/'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
Object.assign(process.env,{
  NEXT_PUBLIC_GOOGLE_TAG_ENABLED:'true', NEXT_PUBLIC_GTM_CONTAINER_ID:'GTM-UNITTEST',
  NEXT_PUBLIC_GA4_MEASUREMENT_ID:'G-UNITTEST', NEXT_PUBLIC_META_PIXEL_ENABLED:'true', NEXT_PUBLIC_META_PIXEL_ID:'123456789',
});
const { setMarketingConsent, trackTrialLead } = await import('../lib/tracking/client');
const receipt = {ok:true,status:'accepted',eventId:'trial-12345678-1234-4123-8123-123456789abc'};
test('GTM takes precedence over direct tags and receives one PII-free lead event after opt-in',()=>{
  assert.equal(document.scripts.length,0);
  assert.equal(trackTrialLead(receipt),false);
  setMarketingConsent('granted');
  assert.equal(document.scripts.length,1);
  assert.match(document.scripts[0].src,/\/gtm\.js\?id=GTM-UNITTEST$/);
  assert.equal(trackTrialLead(receipt),true);
  assert.equal(trackTrialLead(receipt),false);
  assert.deepEqual(window.dataLayer?.filter(item=>item && typeof item==='object' && 'event' in item && item.event==='generate_lead'),[
    {event:'generate_lead',lead_event_id:receipt.eventId},
  ]);
  setMarketingConsent('denied');
  assert.equal(document.scripts.length,0);
  assert.ok(!JSON.stringify(window.dataLayer).includes('generate_lead'));
});
