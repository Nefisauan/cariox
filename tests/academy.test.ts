import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateBooking,demoSchedulingProvider,receptionistReply} from '../lib/academy.ts';
const booking={session:'Academy visit',date:'2026-11-09',time:'09:00 AM',name:'Test Visitor',email:'test@example.com',phone:'5551234567'};
test('validates contact details before demo submission',()=>{assert.equal(validateBooking(booking),null);assert.match(validateBooking({...booking,email:'invalid'})!,/email/);assert.match(validateBooking({...booking,phone:'1'})!,/phone/)});
test('demo bookings never report a live reservation',async()=>{const result=await demoSchedulingProvider.submit(booking);assert.equal(result.live,false);assert.match(result.reference,/^DEMO-/)});
test('availability is rechecked at submission',async()=>{await assert.rejects(()=>demoSchedulingProvider.submit({...booking,time:'03:00 AM'}),/unavailable/);assert.deepEqual(await demoSchedulingProvider.getAvailability('2026-11-08'),[])});
test('receptionist does not invent pricing or age policies',()=>{assert.match(receptionistReply('What is the cost?'),/not been published/);assert.match(receptionistReply('What age can my child start?'),/awaiting academy confirmation/)});
test('receptionist does not invent location or reviews',()=>{assert.match(receptionistReply('Where are you located?'),/not published yet/);assert.match(receptionistReply('Do you have reviews?'),/will not invent testimonials/)});
