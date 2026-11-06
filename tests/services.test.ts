import { test } from 'node:test';import assert from 'node:assert/strict';
import { createServiceHandlers } from '../lib/services/handlers';
const request=(path:string,body:unknown,extra:Record<string,string>={})=>new Request(`https://unit.example/api/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unit.example',...extra},body:JSON.stringify(body)});
const valid={sessionId:'unit-session-123',slotId:'unit-slot-123',name:'Unit Visitor',email:'unit@example.com',phone:'5551234567',marketingConsent:false};
test('unconfigured registration, contact, chat, and receipt verification never report success',async()=>{
  const h=createServiceHandlers();
  const results=await Promise.all([h.register(request('registration',valid)),h.availability(request('registration/availability',{sessionId:'unit-session-123',date:'2026-11-10'})),h.registrationStatus(request('registration/status',{reference:'unit-reference-1234'})),h.contact(request('contact',{name:'Unit Visitor',email:'unit@example.com',interest:'Unit fixture',message:'This is a test inquiry only.'})),h.contactStatus(request('contact/status',{reference:'unit-reference-1234'})),h.chat(request('chat',{message:'Unit fixture'}))]);
  for(const response of results){assert.equal(response.status,503);const body=await response.json();assert.equal(body.ok,false);assert.equal(body.code,'NOT_CONNECTED');assert.ok(!('verified' in body));}
});
test('requests reject cross-origin submissions, invalid fields, oversized bodies, and fake success flags',async()=>{
  const h=createServiceHandlers();assert.equal((await h.register(request('registration',valid,{Origin:'https://other.example'}))).status,403);
  assert.equal((await h.register(request('registration',{...valid,verified:true}))).status,400);
  assert.equal((await h.chat(request('chat',{message:'x'.repeat(9000)}))).status,413);
  assert.equal((await h.register(request('registration',{...valid,email:'invalid'}))).status,400);
});
test('provider adapters must actually verify registration and idempotency is required',async()=>{
  const bad=createServiceHandlers({registration:{availability:async()=>({mode:'live',verified:true,slots:[]}),register:async()=>({verified:false}) as never,verify:async()=>null}});
  assert.equal((await bad.register(request('registration',valid))).status,400);
  assert.equal((await bad.register(request('registration',valid,{'Idempotency-Key':'unit-idempotency-1234'}))).status,502);
  assert.equal((await bad.registrationStatus(request('registration/status',{reference:'unit-reference-1234'}))).status,404);
});

test('future AI knowledge excludes the illustrative schedule and unconfirmed program interests',async()=>{
 const {buildAcademyKnowledge}=await import('../lib/services/knowledge');const {fallbackContent}=await import('../lib/content/fallback');
 const knowledge=buildAcademyKnowledge(fallbackContent);assert.deepEqual(knowledge.programs,[]);assert.deepEqual(knowledge.schedule,[]);assert.equal(knowledge.business,null);assert.equal(knowledge.serviceStatus.registration,'not-connected');
});
