import {test} from 'node:test';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'https://unit.example'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
// Synthetic unit-only ID; JSDOM does not load remote scripts. No Meta requests occur.
process.env.NEXT_PUBLIC_META_PIXEL_ENABLED='true';process.env.NEXT_PUBLIC_META_PIXEL_ID='123456789';
const client=await import('../lib/tracking/client');
const events=()=>window.fbq?.queue?.filter(args=>args[0]==='track')||[];
test('Pixel script is absent before opt-in and queued events are dropped on revoke',()=>{
  assert.equal(document.querySelector('#cariox-meta-pixel'),null);assert.equal(client.trackPageView('unit-before-consent'),false);
  client.setMarketingConsent('granted');assert.ok(document.querySelector('#cariox-meta-pixel'));
  assert.equal(client.trackPageView('unit-consented-page'),true);assert.equal(events().length,1);
  client.setMarketingConsent('denied');assert.equal(document.querySelector('#cariox-meta-pixel'),null);assert.equal(events().length,0);
  assert.equal(client.trackPageView('unit-after-revocation'),false);
});
test('CompleteRegistration requires server verification and matching reference, not a clicked button or demo receipt',async()=>{
  client.setMarketingConsent('granted');
  let calls=0;
  globalThis.fetch=async()=>{calls++;return Response.json({mode:'demo',verified:false});};
  assert.equal(await client.trackCompleteRegistration('unit-reference-1234'),false);assert.equal(events().length,0);
  globalThis.fetch=async()=>Response.json({verified:true,mode:'live',status:'confirmed',reference:'wrong-reference-123',eventId:'unit-conversion-123',verifiedAt:'2026-11-06T12:00:00Z'});
  assert.equal(await client.trackCompleteRegistration('unit-reference-1234'),false);
  globalThis.fetch=async()=>Response.json({verified:true,mode:'live',status:'confirmed',reference:'unit-reference-1234',eventId:'unit-conversion-123',verifiedAt:'2026-11-06T12:00:00Z'});
  assert.equal(await client.trackCompleteRegistration('unit-reference-1234'),true);assert.equal(await client.trackCompleteRegistration('unit-reference-1234'),false);assert.equal(events().length,1);
  client.setMarketingConsent('denied');let deniedCalls=0;globalThis.fetch=async()=>{deniedCalls++;throw new Error('No request permitted after opt-out');};assert.equal(await client.trackCompleteRegistration('unit-reference-1234'),false);assert.equal(deniedCalls,0);assert.equal(calls,1);
});
test('global privacy signals override stored grants and suppress Pixel loading',()=>{
  Object.defineProperty(navigator,'globalPrivacyControl',{value:true,configurable:true});
  assert.equal(client.setMarketingConsent('granted'),'denied');assert.equal(document.querySelector('#cariox-meta-pixel'),null);
  Object.defineProperty(navigator,'globalPrivacyControl',{value:false,configurable:true});
});
