import { test } from 'node:test';import assert from 'node:assert/strict';
import { ConsentAwareTracker } from '../lib/tracking/engine';
import { getMetaConfiguration,isVerifiedConversion,type VerifiedConversion } from '../lib/tracking/contracts';
import { parseConsent } from '../lib/tracking/consent';
import { prepareCapiEvent } from '../lib/tracking/capi-payload';
// Synthetic receipts are unit fixtures only. No external API is called in this test suite.
const receipt:VerifiedConversion={verified:true,mode:'live',status:'confirmed',reference:'unit-reference-1234',eventId:'unit-event-1234',verifiedAt:'2026-11-06T12:00:00Z'};
test('tracking stays disabled with no real config or no opt-in consent',()=>{
  assert.equal(getMetaConfiguration({}).enabled,false);
  assert.equal(getMetaConfiguration({NEXT_PUBLIC_META_PIXEL_ENABLED:'true',NEXT_PUBLIC_META_PIXEL_ID:'not-an-id'}).enabled,false);
  let count=0;const tracker=new ConsentAwareTracker(true,()=>count++);
  assert.equal(tracker.track('PageView','unit-page-1234'),false);
  tracker.setConsent('denied');assert.equal(tracker.track('Lead','unit-lead-1234'),false);assert.equal(count,0);
  const disabled=new ConsentAwareTracker(false,()=>count++);disabled.setConsent('granted');assert.equal(disabled.track('PageView','unit-page-1234'),false);
});
test('consent revocation drops future events; strict-mode and repeated receipt events deduplicate',()=>{
  const events:string[]=[];const persistent=new Set<string>();
  const tracker=new ConsentAwareTracker(true,(event,id)=>events.push(`${event}:${id}`),key=>persistent.has(key),key=>persistent.add(key));
  tracker.setConsent('granted');assert.equal(tracker.track('PageView','unit-page-1234'),true);assert.equal(tracker.track('PageView','unit-page-1234'),false);
  assert.equal(tracker.track('CompleteRegistration',receipt.eventId),true);assert.equal(tracker.track('CompleteRegistration',receipt.eventId),false);
  const reloaded=new ConsentAwareTracker(true,()=>events.push('duplicate'),key=>persistent.has(key));reloaded.setConsent('granted');assert.equal(reloaded.track('CompleteRegistration',receipt.eventId),false);
  tracker.setConsent('denied');assert.equal(tracker.track('Lead','unit-lead-1234'),false);assert.equal(events.length,2);
});
test('conversion receipt guards reject demo, pending, unverified, and mismatched event results',()=>{
  assert.equal(isVerifiedConversion(receipt,'CompleteRegistration'),true);
  assert.equal(isVerifiedConversion({...receipt,mode:'demo'},'CompleteRegistration'),false);
  assert.equal(isVerifiedConversion({...receipt,status:'pending'},'CompleteRegistration'),false);
  assert.equal(isVerifiedConversion({...receipt,verified:false},'CompleteRegistration'),false);
  assert.equal(isVerifiedConversion(receipt,'Lead'),false);
});
test('consent storage validates format, expiry, and future timestamps',()=>{
  const now=Date.parse('2026-11-06T12:00:00Z');const record=(updatedAt:number)=>JSON.stringify({version:2,value:'granted',updatedAt});
  assert.equal(parseConsent(JSON.stringify({version:1,value:'granted',updatedAt:now}),now),'unknown');assert.equal(parseConsent(null,now),'unknown');assert.equal(parseConsent('invalid',now),'unknown');
  assert.equal(parseConsent(record(now-1000),now),'granted');assert.equal(parseConsent(record(now+1000),now),'unknown');
  assert.equal(parseConsent(record(now-181*86400000),now),'unknown');
});
test('optional CAPI payload is consent-gated, hashes identifiers, strips queries, and shares event IDs',async()=>{
  assert.equal(await prepareCapiEvent({event:'CompleteRegistration',receipt,consent:false,sourceUrl:'https://unit.example/'}),null);
  assert.equal(await prepareCapiEvent({event:'CompleteRegistration',receipt:{...receipt,mode:'demo'} as unknown as VerifiedConversion,consent:true,sourceUrl:'https://unit.example/'}),null);
  const event=await prepareCapiEvent({event:'CompleteRegistration',receipt,consent:true,sourceUrl:'https://unit.example/register?private=value#details',email:' UNIT@EXAMPLE.COM ',phone:'+1 (555) 123-4567'});
  assert.equal(event?.event_id,receipt.eventId);assert.equal(event?.event_source_url,'https://unit.example/register');assert.match(event!.user_data.em![0],/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(event).includes('UNIT@'));
});
