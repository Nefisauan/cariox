import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedSchedule, scheduleMinutes } from '../lib/content/schedule';
import { scheduleSchema } from '../lib/content/types';
import { resolveAcademyContent } from '../lib/content/resolve';
import { receptionistReply } from '../lib/academy';

test('all 43 supplied sessions have valid unique identities and the exact photographed times', () => {
  assert.equal(publishedSchedule.length,43);
  assert.equal(new Set(publishedSchedule.map(item=>item.id)).size,43);
  const expected: Record<string,string[]> = {
    Mon:['05:30 AM','07:00 AM','08:00 AM','08:30 AM','09:30 AM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'],
    Tue:['07:00 AM','09:30 AM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'],
    Wed:['05:30 AM','07:00 AM','08:00 AM','08:30 AM','09:30 AM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'],
    Thu:['07:00 AM','09:30 AM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'],
    Fri:['05:30 AM','06:30 AM','07:00 AM','08:00 AM','08:30 AM','09:30 AM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'],
    Sat:['08:00 AM','09:00 AM','10:00 AM'],
  };
  for(const [day,times] of Object.entries(expected)) assert.deepEqual(publishedSchedule.filter(item=>item.day===day).map(item=>`${item.time} ${item.period}`),times);
  for(const item of publishedSchedule) {
    assert.ok(scheduleSchema.safeParse(item).success);
    assert.equal(item.timezone,undefined); assert.equal(item.level,undefined); assert.equal(item.instructor,undefined);
  }
});

test('Gi and No-Gi corrections preserve Wednesday women and kids in Gi and Friday/Saturday in No-Gi',()=>{
  const formats=(name:string,day:string)=>publishedSchedule.filter(item=>item.name===name&&item.day===day).map(item=>item.type);
  for(const day of ['Mon','Tue','Thu']) assert.deepEqual(formats('Jiu-Jitsu',day),['Gi','Gi','Gi']);
  for(const day of ['Wed','Fri']) assert.deepEqual(formats('Jiu-Jitsu',day),['No-Gi','No-Gi','No-Gi']);
  for(const day of ['Mon','Wed']) {
    assert.deepEqual(formats("Women's Jiu-Jitsu",day),['Gi']);
    assert.deepEqual(formats("Kids' Jiu-Jitsu",day),['Gi']);
  }
  assert.deepEqual(formats("Women's Jiu-Jitsu",'Fri'),['No-Gi']);
  for(const day of ['Fri','Sat']) assert.deepEqual(formats("Kids' Jiu-Jitsu",day),['No-Gi']);
  assert.deepEqual(formats('Open Mat','Fri'),['No-Gi']);
  assert.deepEqual(formats('Adults Open Mat','Sat'),['No-Gi']);
  assert.deepEqual(formats('Muay Thai Sparring','Sat'),['Muay Thai']);
});

test('empty, invalid, or offline CMS schedule data retains the approved week; valid CMS classes replace it',()=>{
  for(const schedules of [undefined,[],[{id:'invalid',time:'99:00'}]]) assert.deepEqual(resolveAcademyContent({schedules}).schedules,publishedSchedule);
  const cms={...publishedSchedule[0],id:'cms-fixture',time:'06:00',timezone:'America/New_York'};
  assert.deepEqual(resolveAcademyContent({schedules:[cms]}).schedules,[cms]);
  assert.equal(scheduleMinutes({time:'12:00',period:'AM'}),0);
  assert.equal(scheduleMinutes({time:'12:00',period:'PM'}),720);
  assert.equal(scheduleMinutes({time:'07:00',period:'PM'}),1140);
});

test('scripted receptionist distinguishes the published timetable from demo booking availability',()=>{
  const answer=receptionistReply('What is the schedule?');
  assert.match(answer,/weekly class schedule is published/i);
  assert.doesNotMatch(answer,/schedule.*sample/i);
  assert.match(answer,/booking calendar remains a demo/);
  assert.match(receptionistReply('What classes are offered?'),/Muay Thai/);
});
