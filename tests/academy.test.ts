import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBooking, demoSchedulingProvider, receptionistReply, localDateKey, parseDateKey } from '../lib/academy.ts';
const nextDay = new Date(); nextDay.setDate(nextDay.getDate() + 1);
while (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1);
const booking = { session: 'Academy visit', date: localDateKey(nextDay), time: '09:00 AM', name: 'Test Visitor', email: 'test@example.com', phone: '5551234567' };

test('validates contact details before demo submission', () => {
  assert.equal(validateBooking(booking), null);
  assert.match(validateBooking({ ...booking, email: 'invalid' })!, /email/);
  assert.match(validateBooking({ ...booking, phone: '1' })!, /phone/);
  assert.match(validateBooking({ ...booking, phone: 'not-a-phone1234567' })!, /phone/);
});
test('rejects impossible dates, past dates, and unknown sessions', () => {
  assert.equal(parseDateKey('2026-02-31'), null);
  assert.equal(parseDateKey('2026-13-01'), null);
  assert.equal(parseDateKey('2026-11-06')?.getDate(), 6);
  assert.match(validateBooking({ ...booking, date: '2026-02-31' })!, /Choose/);
  assert.match(validateBooking({ ...booking, date: '2000-01-01' })!, /passed/);
  assert.match(validateBooking({ ...booking, session: 'Unconfirmed program' })!, /Choose/);
});
test('demo bookings never report a live reservation', async () => {
  const result = await demoSchedulingProvider.submit(booking);
  assert.equal(result.live, false);
  assert.match(result.reference, /^DEMO-/);
});
test('availability is rechecked at submission', async () => {
  await assert.rejects(() => demoSchedulingProvider.submit({ ...booking, time: '03:00 AM' }), /unavailable/);
  const sunday = new Date(nextDay); while (sunday.getDay() !== 0) sunday.setDate(sunday.getDate() + 1);
  assert.deepEqual(await demoSchedulingProvider.getAvailability(localDateKey(sunday)), []);
  assert.deepEqual(await demoSchedulingProvider.getAvailability('2000-01-01'), []);
  assert.deepEqual(await demoSchedulingProvider.getAvailability('not-a-date'), []);
});
test('receptionist does not invent policies or misclassify substrings', () => {
  assert.match(receptionistReply('What is the cost?'), /not been published/);
  assert.match(receptionistReply('What age can my child start?'), /awaiting academy confirmation/);
  assert.doesNotMatch(receptionistReply('Can I leave a message?'), /minimum ages/);
  assert.match(receptionistReply('Where are you located?'), /address/);
  assert.match(receptionistReply('Can I book a trial?'), /won’t reserve/);
});
