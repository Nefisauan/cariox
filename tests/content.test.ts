import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackContent } from '../lib/content/fallback';
import { resolveAcademyContent } from '../lib/content/resolve';
import { getSanityEnvironment } from '../lib/sanity/env';
import { photoSchema, homepageSchema, scheduleSchema, instructorSchema } from '../lib/content/types';
import { schemaTypes } from '../sanity/schemaTypes';
import { loadPublishedContent } from '../lib/content/load-published';
import { ACADEMY_QUERY } from '../lib/sanity/queries';
import { getPublicSiteUrl } from '../lib/config/site';
import { evaluate, parse } from 'groq-js';
import { Schema } from '@sanity/schema';

test('all required CMS schema types compile without an account',()=>{
  const names: string[]=schemaTypes.map(type=>type.name);
  for(const name of ['homepage','branding','academyPhoto','program','classDefinition','instructor','schedule','membershipPrice','businessInformation','announcement','faq'])assert.ok(names.includes(name));
  const schema=Schema.compile({name:'offline-schema-test',types:schemaTypes});
  for(const name of names)assert.ok(schema.get(name));
});
test('no Sanity configuration returns no client configuration; blank or incomplete values are safe',()=>{
  assert.equal(getSanityEnvironment({}),null);
  assert.equal(getSanityEnvironment({SANITY_STUDIO_PROJECT_ID:'unitfixture',SANITY_STUDIO_DATASET:'unitfixture'}),null);
  assert.equal(getSanityEnvironment({NEXT_PUBLIC_SANITY_PROJECT_ID:'',NEXT_PUBLIC_SANITY_DATASET:'production'}),null);
  assert.equal(getSanityEnvironment({NEXT_PUBLIC_SANITY_PROJECT_ID:'invalid/id',NEXT_PUBLIC_SANITY_DATASET:'production'}),null);
});
test('missing or empty CMS content retains existing content and photograph slots',()=>{
  assert.equal(resolveAcademyContent(null),fallbackContent);
  const resolved=resolveAcademyContent({});
  assert.deepEqual(resolved.homepage,fallbackContent.homepage);
  assert.deepEqual(resolved.photos,fallbackContent.photos);
  assert.deepEqual(resolved.programs,fallbackContent.programs);
  assert.deepEqual(resolved.instructors,fallbackContent.instructors);
  assert.equal(resolved.programsConfirmed,true);assert.equal(resolved.scheduleConfirmed,true);
  assert.deepEqual(resolved.schedules,fallbackContent.schedules);
  assert.ok(homepageSchema.safeParse(fallbackContent.homepage).success);
});
test('supplied instructor results survive empty or invalid CMS data and approved profiles can replace them',()=>{
  for (const instructors of [[], [{id:'invalid',achievements:[{event:'Invalid result',placement:0}]}]]) {
    assert.deepEqual(resolveAcademyContent({instructors}).instructors,fallbackContent.instructors);
  }
  const approved={...fallbackContent.instructors[0],id:'cms-fixture',name:'Test Instructor',achievements:[{event:'Test event',placement:2}]};
  assert.equal(resolveAcademyContent({instructors:[approved]}).instructors[0].name,'Test Instructor');
  assert.equal(instructorSchema.safeParse({...approved,achievements:[{event:'Test event',placement:4}]}).success,false);
  assert.equal(instructorSchema.safeParse({...approved,achievements:[{event:'Test event',placement:1.5}]}).success,false);
});
test('valid published fields override individually while malformed fields keep the original fallback',()=>{
  const result=resolveAcademyContent({homepage:{heroEyebrow:'Owner-approved heading',heroTitle:[],about:{title:'A new title',body:7}},branding:{tagline:''},photos:[{...fallbackContent.photos[2],url:'https://malicious.example/a.jpg'}]});
  assert.equal(result.homepage.heroEyebrow,'Owner-approved heading');
  assert.deepEqual(result.homepage.heroTitle,fallbackContent.homepage.heroTitle);
  assert.equal(result.homepage.about.title,'A new title');assert.equal(result.homepage.about.body,fallbackContent.homepage.about.body);
  assert.deepEqual(result.photos,fallbackContent.photos);assert.deepEqual(result.branding,fallbackContent.branding);
});
test('Sanity images are allowlisted and expired/future promotions never render',()=>{
  assert.equal(photoSchema.safeParse({...fallbackContent.photos[0],url:'javascript:alert(1)'}).success,false);
  assert.equal(photoSchema.safeParse({...fallbackContent.photos[0],url:'/images/../../secret'}).success,false);
  const base={id:'unit-announcement',title:'Unit fixture',body:'Test only; not business copy.'};
  const result=resolveAcademyContent({announcements:[{...base,startsAt:'2099-01-01T00:00:00Z'},{...base,endsAt:'2000-01-01T00:00:00Z'},{...base,id:'unit-active'}]},new Date('2026-11-06T12:00:00Z'));
  assert.equal(result.announcements.length,1);assert.equal(result.announcements[0].id,'unit-active');
});
test('schedule rejects an unknown timezone rather than guessing the academy location',()=>{
  assert.equal(scheduleSchema.safeParse({id:'test-only',day:'Mon',time:'09:00',period:'AM',name:'Fixture',type:'Fixture',level:'Fixture',timezone:'Unknown/TimeZone'}).success,false);
});

test('published GROQ query parses offline',()=>{assert.ok(parse(ACADEMY_QUERY));});

test('published booking settings activate only with an enabled public HTTPS link', async () => {
  const query = parse(ACADEMY_QUERY);
  const bookingUrl = 'https://book.example/trial?class=jiu-jitsu';
  const project = async (trialBooking?: { enabled: boolean; url?: string }) => {
    const result = await evaluate(query, { dataset: [{ _id: 'homepage', _type: 'homepage', trialBooking }] });
    return resolveAcademyContent(await result.get());
  };

  assert.equal((await project()).homepage.bookingUrl, undefined);
  assert.equal((await project({ enabled: false, url: bookingUrl })).homepage.bookingUrl, undefined);
  for (const url of [undefined, 'not a url', 'javascript:alert(1)', 'http://book.example', 'https://user:password@book.example']) {
    assert.equal((await project({ enabled: true, url })).homepage.bookingUrl, undefined);
  }

  const published = await project({ enabled: true, url: bookingUrl });
  assert.equal(published.homepage.bookingUrl, bookingUrl);
  assert.match(published.homepage.schedule.description, /booking page/);
  assert.match(published.faqs.find(faq => faq.question === 'How do I schedule a free trial?')!.answer, /confirm your reservation/);
});

test('unconfigured loader makes no request and CMS outages retain existing content',async()=>{let requests=0;const read=async()=>{requests++;throw new Error('Synthetic offline failure');};assert.equal(await loadPublishedContent(null,read),fallbackContent);assert.equal(requests,0);assert.equal(await loadPublishedContent({projectId:'unitfixture',dataset:'unitfixture',apiVersion:'2026-11-06'},read),fallbackContent);assert.equal(requests,1);});

test('invalid or credential-bearing public URLs cannot break metadata or leak into canonical links',()=>{assert.equal(getPublicSiteUrl('https://invalid::'),undefined);assert.equal(getPublicSiteUrl('https://user:password@unit.example/'),undefined);assert.equal(getPublicSiteUrl('https://unit.example/?private=value'),undefined);assert.equal(getPublicSiteUrl('https://unit.example/')?.origin,'https://unit.example');});
