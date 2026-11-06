import {test,mock} from 'node:test';import assert from 'node:assert/strict';
mock.module('server-only',{defaultExport:{}});
const {sendConversionsApiEvent}=await import('../lib/tracking/capi.server');
const input={event:'CompleteRegistration' as const,receipt:{verified:true as const,mode:'live' as const,status:'confirmed' as const,reference:'unit-reference-1234',eventId:'unit-event-1234',verifiedAt:'2026-11-06T12:00:00Z'},consent:true,sourceUrl:'https://unit.example/'};
test('optional CAPI sends no request when disabled, denied, or missing owner credentials',async()=>{
 let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('No network allowed in this test');};
 process.env.META_CAPI_ENABLED='false';assert.equal((await sendConversionsApiEvent(input)).sent,false);
 process.env.META_CAPI_ENABLED='true';delete process.env.META_CAPI_ACCESS_TOKEN;delete process.env.META_PIXEL_ID;delete process.env.META_GRAPH_API_VERSION;
 assert.equal((await sendConversionsApiEvent(input)).sent,false);assert.equal((await sendConversionsApiEvent({...input,consent:false})).sent,false);assert.equal(requests,0);
});
