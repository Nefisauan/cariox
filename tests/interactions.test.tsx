import React from 'react';
import { test, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://cariox.example' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, FormData: dom.window.FormData, getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); this.querySelector<HTMLButtonElement>('button')?.focus(); };
dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
dom.window.HTMLElement.prototype.scrollTo = function () {};
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0) as unknown as number;
globalThis.cancelAnimationFrame = (handle: number) => clearTimeout(handle);
const css = document.createElement('style');
css.textContent = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
document.head.appendChild(css);

const { render, fireEvent, cleanup, waitFor } = await import('@testing-library/react');
// Next's image component is supplied by its compiler in production.
// Use a normal image in DOM tests to control network load/error events.
mock.module('next/image', { defaultExport: ({fill, sizes, loading, unoptimized, priority, ...props}: Record<string, unknown>) => React.createElement('img', props) });
const { default: DepthSurface } = await import('../components/DepthSurface');
const { default: ProgramExplorer } = await import('../components/ProgramExplorer');
const { default: GalleryShowcase } = await import('../components/GalleryShowcase');
const { default: TrialDialog } = await import('../components/TrialDialog');
const { default: Navigation } = await import('../components/Navigation');
const { default: FirstVisit } = await import('../components/FirstVisit');
const { default: ContactForm } = await import('../components/ContactForm');
const { default: Receptionist } = await import('../components/Receptionist');
const { default: InstructorSection } = await import('../components/content/InstructorSection');
const { default: ClassSchedule } = await import('../components/content/ClassSchedule');
const { default: AcademyHome } = await import('../components/AcademyHome');
const { AcademyContentProvider } = await import('../components/content/ContentProvider');
const { resolveAcademyContent } = await import('../lib/content/resolve');
const { parseDateKey } = await import('../lib/academy');
afterEach(() => { cleanup(); document.body.style.overflow = ''; });

test('the published schedule switches days and filters without losing the Wednesday Gi exceptions', () => {
  const view = render(<ClassSchedule />);
  assert.equal(view.container.querySelectorAll('.class-row').length,43);
  assert.equal(view.getByRole('region',{name:'Monday'}).querySelectorAll('.class-row').length,9);
  fireEvent.click(view.getByRole('button',{name:'Wednesday'}));
  fireEvent.change(view.getByRole('combobox',{name:'Filter by program'}),{target:{value:'Gi'}});
  let panel=view.getByRole('region',{name:'Wednesday'});
  assert.equal(panel.querySelectorAll('.class-row').length,2);
  assert.match(panel.textContent!,/Women's Jiu-Jitsu/);assert.match(panel.textContent!,/Kids' Jiu-Jitsu/);
  fireEvent.change(view.getByRole('combobox',{name:'Filter by program'}),{target:{value:'No-Gi'}});
  assert.equal(panel.querySelectorAll('.class-row').length,3);
  fireEvent.click(view.getByRole('button',{name:'Friday'}));
  panel=view.getByRole('region',{name:'Friday'});
  assert.equal(panel.querySelectorAll('.class-row').length,6);
  assert.match(panel.textContent!,/Women's Jiu-Jitsu/);assert.match(panel.textContent!,/Kids' Jiu-Jitsu/);
  fireEvent.click(view.getByRole('button',{name:'Saturday'}));
  assert.equal(view.getByRole('region',{name:'Saturday'}).querySelectorAll('.class-row').length,2);
  fireEvent.change(view.getByRole('combobox',{name:'Filter by program'}),{target:{value:'Muay Thai'}});
  assert.match(view.getByRole('region',{name:'Saturday'}).textContent!,/10:00AMMuay Thai Sparring/);
  fireEvent.click(view.getByRole('button',{name:'Sunday'}));
  assert.match(view.getByRole('region',{name:'Sunday'}).textContent!,/No Muay Thai classes are listed/);
  fireEvent.click(view.getByRole('button',{name:'View Monday’s classes'}));
  assert.equal((view.getByRole('combobox') as HTMLSelectElement).value,'All programs');
  assert.equal(view.getByRole('region',{name:'Monday'}).querySelectorAll('.class-row').length,9);
  assert.equal(view.getByRole('link',{name:/Ask about Kids' Jiu-Jitsu, Gi, Monday/}).getAttribute('href'),'#contact');
});

test('instructor portrait and all supplied competition results render as accessible text without medal emojis', () => {
  const view = render(<InstructorSection />);
  assert.ok(view.getByRole('img', { name: /CARIOX instructor/ }));
  assert.ok(view.getByRole('heading', { name: 'Your instructor' }));
  const results = view.getByRole('list', { name: 'Instructor competition results' });
  assert.equal(results.querySelectorAll('li').length, 10);
  assert.equal(results.querySelectorAll('.place-1').length, 7);
  assert.equal(results.querySelectorAll('.place-3').length, 3);
  for (const event of ['World No-Gi','Pan American','American National']) {
    assert.match(view.getByText(event).closest('li')!.textContent!, /3rd place/);
  }
  assert.ok(!/\p{Extended_Pictographic}/u.test(view.container.textContent!));
  assert.equal(view.getByRole('link', { name: /Ask about training/ }).getAttribute('href'), '#contact');
});

test('1–2–3 panels retain visible headings and details across open, close, and reopen', () => {
  const view = render(<ProgramExplorer />);
  for (let round = 0; round < 2; round++) {
    ['The first step', 'The next generation', 'The deeper practice'].forEach((title, index) => {
      const toggle = view.getByRole('button', { name: new RegExp(title) });
      fireEvent.click(toggle);
      assert.equal(toggle.getAttribute('aria-expanded'), 'true');
      const region = view.getByRole('region', { name: new RegExp(title) });
      assert.equal(region.id, `program-${index}`);
      assert.equal(region.hidden, false);
      assert.notEqual(getComputedStyle(toggle.closest('article')!).opacity, '0');
      assert.notEqual(getComputedStyle(region).display, 'none');
      assert.ok(region.textContent!.includes('Share your training goals'));
      fireEvent.click(toggle);
      assert.equal(toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(view.queryByRole('region', { name: new RegExp(title) }), null);
    });
  }
});

test('gallery keeps the current view until the requested image loads, then supports all five views', async () => {
  const opened: number[] = [];
  const view = render(<GalleryShowcase open={index => opened.push(index)} />);
  const images = view.container.querySelectorAll('img');
  const scene = () => view.container.querySelector('.showcase-image.active');
  const original = scene();
  fireEvent.click(view.getByRole('button', { name: /02The welcome/ }));
  assert.equal(scene(), original);
  assert.ok(view.getByRole('status').textContent!.includes('Loading'));
  fireEvent.load(images[1]);
  await waitFor(() => assert.equal(scene(), images[1].parentElement));
  for (let index = 0; index < 5; index++) {
    fireEvent.load(images[index]);
    const name = ['The mat', 'The welcome', 'Performance', 'The lounge', 'The collection'][index];
    fireEvent.click(view.getByRole('button', { name: new RegExp(`0${index + 1}${name}`) }));
    await waitFor(() => assert.equal(scene(), images[index].parentElement));
    fireEvent.click(view.getByRole('button', { name: /View image/ }));
    assert.equal(opened.at(-1), index);
  }
});

test('failed gallery images leave the current photograph visible and show an error', async () => {
  const view = render(<GalleryShowcase open={() => {}} />);
  const images = view.container.querySelectorAll('img');
  const original = view.container.querySelector('.showcase-image.active');
  fireEvent.click(view.getByRole('button', { name: /03Performance/ }));
  fireEvent.error(images[2]);
  fireEvent.error(images[2]);
  await waitFor(() => assert.ok(view.getByRole('alert').textContent!.includes('could not load')));
  assert.equal(view.container.querySelector('.showcase-image.active'), original);
});

test('depth has an accessible on/off control and scene arrows work after image loading', async () => {
  const view = render(<GalleryShowcase open={() => {}} />);
  const toggle = view.getByRole('button', { name: /Depth on/ });
  fireEvent.click(toggle);
  assert.equal(toggle.getAttribute('aria-pressed'), 'false');
  fireEvent.click(toggle);
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  view.container.querySelectorAll('img').forEach(image => fireEvent.load(image));
  fireEvent.click(view.getByRole('button', { name: 'Next academy view' }));
  await waitFor(() => assert.equal(view.getByRole('button', { name: /02The welcome/ }).getAttribute('aria-pressed'), 'true'));
  fireEvent.click(view.getByRole('button', { name: 'Previous academy view' }));
  await waitFor(() => assert.equal(view.getByRole('button', { name: /01The mat/ }).getAttribute('aria-pressed'), 'true'));
});


test('trial form sends multiple interests, preserves the retry key, and confirms only a saved request', async () => {
  const original = globalThis.fetch;
  const keys: string[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(url, '/api/trial');
    keys.push(new Headers(init?.headers).get('Idempotency-Key')!);
    assert.deepEqual(JSON.parse(String(init?.body)).interests, ['Brazilian Jiu-Jitsu', 'Kids Classes']);
    if (keys.length === 1) return Response.json({ ok: false }, { status: 502 });
    return Response.json({ ok: true, status: 'accepted', eventId: 'trial-12345678-1234-4123-8123-123456789abc' }, { status: 201 });
  };
  const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus();
  document.body.style.overflow = 'clip';
  try {
    const view = render(<TrialDialog available close={() => view.unmount()} />);
    assert.equal(document.body.style.overflow, 'hidden');
    assert.equal(view.queryByRole('button', { name: 'Next month' }), null);
    fireEvent.change(view.getByLabelText('Full Name'), { target: { value: 'Alex Visitor' } });
    fireEvent.change(view.getByLabelText('Email Address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(view.getByLabelText('Phone Number'), { target: { value: '5551234567' } });
    fireEvent.click(view.getByRole('button', { name: 'Request My Free Trial' }));
    assert.match(view.getByRole('alert').textContent!, /Select at least one/);
    assert.equal(keys.length, 0);
    fireEvent.click(view.getByRole('checkbox', { name: 'Brazilian Jiu-Jitsu' }));
    fireEvent.click(view.getByRole('checkbox', { name: 'Kids Classes' }));
    fireEvent.click(view.getByRole('button', { name: 'Request My Free Trial' }));
    await waitFor(() => assert.match(view.getByRole('alert').textContent!, /couldn’t confirm/));
    assert.equal(view.queryByRole('status'), null);
    fireEvent.click(view.getByRole('button', { name: 'Request My Free Trial' }));
    await waitFor(() => assert.match(view.getByRole('status').textContent!, /coordinate your first free class/));
    assert.equal(keys.length, 2);
    assert.equal(keys[0], keys[1]);
    fireEvent.click(view.getByRole('button', { name: 'Back to the academy' }));
    assert.equal(document.body.style.overflow, 'clip');
    assert.equal(document.activeElement, trigger);
  } finally { globalThis.fetch = original; trigger.remove(); }
});

test('every homepage trial entry point opens the same form', async () => {
  const view = render(<AcademyHome trialAvailable={false} />);
  const expectTrial = async () => {
    const dialog = await view.findByRole('dialog', { name: 'Schedule Your Free Trial Class' });
    assert.ok(dialog.querySelector('input[name="email"]'));
    fireEvent.click(view.getByRole('button', {name:'Close trial form'}));
  };
  for (const selector of ['.header-cta','.hero-ctas button','#first-visit button.underlined-link',
    '#contact .contact-grid > div > button','.final-cta button','.mobile-visit-bar button']) {
    const button = view.container.querySelector(selector);
    assert.ok(button, selector);
    fireEvent.click(button);
    await expectTrial();
  }
  fireEvent.click(view.container.querySelector('.menu-toggle')!);
  fireEvent.click(view.container.querySelector('.mobile-nav > button.full')!);
  await expectTrial();
  fireEvent.click(view.getByRole('button', {name:'Let’s talk'}));
  fireEvent.click(view.container.querySelector('.chat-suggestions > button:last-child')!);
  await expectTrial();
});

test('the preferred date and class time are sent with the existing trial form', async () => {
  const originalFetch = globalThis.fetch;
  const schedules = [{ id: 'test-monday', day: 'Mon', time: '07:00', period: 'PM', name: 'Jiu-Jitsu', type: 'Gi' }] as const;
  let captured: { date: string; className: string; time: string } | undefined;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, '/api/trial');
    captured = JSON.parse(String(init?.body)).preferredTime;
    return Response.json({ ok: true, status: 'accepted', eventId: 'trial-12345678-1234-4123-8123-123456789abc' }, { status: 201 });
  };
  try {
    const view = render(<TrialDialog available schedules={[...schedules]} close={() => {}} />);
    const areas = view.getByRole('group', { name: /Areas of Interest/ });
    const calendar = view.getByRole('region', { name: /Preferred class time/ });
    assert.ok(areas.compareDocumentPosition(calendar) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    const monday = () => view.getAllByRole('button', { name: /^Monday, / }).find(button => !button.hasAttribute('disabled'));
    if (!monday()) fireEvent.click(view.getByRole('button', { name: 'Next month' }));
    const date = monday()!;
    fireEvent.click(date);
    fireEvent.click(view.getByRole('button', { name: /7:00 PM.*Jiu-Jitsu/ }));
    fireEvent.change(view.getByLabelText('Full Name'), { target: { value: 'Alex Visitor' } });
    fireEvent.change(view.getByLabelText('Email Address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(view.getByLabelText('Phone Number'), { target: { value: '5551234567' } });
    fireEvent.click(view.getByRole('checkbox', { name: 'Brazilian Jiu-Jitsu' }));
    fireEvent.click(view.getByRole('button', { name: 'Request My Free Trial' }));
    await view.findByText('Request received.');
    assert.ok(captured);
    assert.equal(parseDateKey(captured.date)?.toLocaleDateString('en-US', { dateStyle: 'full' }), date.getAttribute('aria-label'));
    assert.equal(captured.className, 'Jiu-Jitsu · Gi');
    assert.equal(captured.time, '7:00 PM');
  } finally { globalThis.fetch = originalFetch; }
});

test('unconfigured trial dialog does not accept visitor information', () => {
  const view = render(<TrialDialog available={false} close={() => {}} />);
  assert.ok(view.getByText(/online trial requests aren’t open yet/i));
  assert.ok((view.getByRole('button', {name:'Request My Free Trial'}) as HTMLButtonElement).matches(':disabled'));
  assert.ok((view.getByRole('textbox', {name:'Full Name'}) as HTMLInputElement).matches(':disabled'));
});

test('an enabled booking link takes the trial CTA to the configured page', () => {
  const content = resolveAcademyContent({ homepage: { bookingUrl: `${window.location.origin}/#booking` } });
  const view = render(<AcademyContentProvider content={content}><AcademyHome trialAvailable={true} /></AcademyContentProvider>);
  try {
    fireEvent.click(view.container.querySelector('.header-cta')!);
    assert.equal(window.location.hash, '#booking');
    assert.equal(view.queryByRole('dialog', { name: 'Schedule Your Free Trial Class' }), null);
  } finally {
    window.history.replaceState(null, '', '/');
  }
});

test('the trial CTA opens the embedded calendar with the public page and request form available', async () => {
  const bookingUrl = 'https://book.example/trial';
  const bookingEmbedUrl = 'https://book.example/embed/trial';
  const content = resolveAcademyContent({ homepage: { bookingUrl, bookingEmbedUrl } });
  const view = render(<AcademyContentProvider content={content}><AcademyHome trialAvailable /></AcademyContentProvider>);
  assert.equal(view.queryByTitle('CARIOX trial class booking calendar'), null);

  fireEvent.click(view.container.querySelector('.header-cta')!);
  const dialog = await view.findByRole('dialog', { name: 'Schedule Your Free Trial Class' });
  assert.equal(view.getByTitle('CARIOX trial class booking calendar').getAttribute('src'), bookingEmbedUrl);
  assert.equal(view.getByRole('link', { name: 'Open the booking page' }).getAttribute('href'), bookingUrl);
  const request = dialog.querySelector('details')!;
  assert.equal(request.open, false);
  fireEvent.click(view.getByText('Prefer help choosing a class? Send a trial request'));
  assert.equal(request.open, true);
  assert.ok(view.getByRole('checkbox', { name: 'Brazilian Jiu-Jitsu' }));
  assert.ok(view.getByRole('button', { name: 'Request My Free Trial' }));
});

test('mobile navigation labels its dialog and restores scroll state after selecting a section', () => {
  const view = render(<Navigation openTrial={() => {}} />);
  // JSDOM has no responsive layout engine; expose the mobile trigger for its behavior test.
  const toggle = view.container.querySelector<HTMLButtonElement>('[aria-label="Open navigation"]')!;
  toggle.style.display = 'inline-grid';
  toggle.focus(); fireEvent.click(toggle);
  const menu = view.getByRole('dialog', { name: 'Site navigation' });
  assert.equal(document.body.style.overflow, 'hidden');
  fireEvent.click(view.getByRole('navigation', { name: 'Mobile navigation' }).querySelector('a[href="#programs"]')!);
  assert.equal(view.queryByRole('dialog'), null);
  assert.equal(document.body.style.overflow, '');
  assert.equal(document.activeElement, toggle);
  assert.ok(menu);
});

test('FAQs expand and collapse while keeping truthful answers accessible', () => {
  const view = render(<FirstVisit openTrial={() => {}} />);
  const question = view.getByRole('button', { name: 'How do I schedule a free trial?' });
  fireEvent.click(question);
  assert.equal(question.getAttribute('aria-expanded'), 'true');
  assert.match(view.getByRole('region', { name: 'How do I schedule a free trial?' }).textContent!, /does not reserve/);
  fireEvent.click(question);
  assert.equal(question.getAttribute('aria-expanded'), 'false');
});

test('an inquiry becomes a copyable draft and retains details when edited', async () => {
  let copied = '';
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { copied = text; } } });
  const view = render(<ContactForm />);
  fireEvent.change(view.getByLabelText('Your name'), { target: { value: 'Alex Visitor' } });
  fireEvent.change(view.getByLabelText('Email address'), { target: { value: 'alex@example.com' } });
  fireEvent.change(view.getByLabelText('Your message'), { target: { value: 'I would like to learn about getting started.' } });
  fireEvent.click(view.getByRole('button', { name: 'Prepare your inquiry' }));
  assert.match(view.getByRole('status').textContent!, /hasn’t sent/);
  fireEvent.click(view.getByRole('button', { name: 'Copy your message' }));
  await waitFor(() => assert.match(copied, /Alex Visitor/));
  fireEvent.click(view.getByRole('button', { name: 'Edit your inquiry' }));
  assert.equal((view.getByLabelText('Your name') as HTMLInputElement).value, 'Alex Visitor');
});

test('receptionist does not steal initial focus and supports Escape and trial handoff', () => {
  let booked = false;
  const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus();
  const view = render(<Receptionist openTrial={() => { booked = true; }} />);
  assert.equal(document.activeElement, trigger);
  const toggle = view.getByRole('button', { name: 'Let’s talk' });
  fireEvent.click(toggle);
  assert.equal(document.activeElement, view.getByRole('textbox', { name: 'Your message' }));
  fireEvent.keyDown(view.getByRole('textbox', { name: 'Your message' }), { key: 'Escape' });
  assert.equal(view.queryByRole('log'), null);
  assert.equal(document.activeElement, toggle);
  fireEvent.click(toggle);
  fireEvent.click(view.getByRole('button', { name: 'Schedule Your Free Trial Class' }));
  assert.equal(booked, true);
  assert.equal(view.queryByRole('log'), null);
  trigger.remove();
});


test('photographic depth responds to a mouse and respects touch/reduced-motion fallbacks', async () => {
  class UnitPointerEvent extends dom.window.MouseEvent { pointerType: string; constructor(type: string, init: MouseEventInit & {pointerType?:string} = {}) { super(type,init); this.pointerType=init.pointerType||'mouse'; } }
  Object.defineProperty(window,'PointerEvent',{value:UnitPointerEvent,configurable:true});
  const view=render(<DepthSurface><span>Unit photograph</span></DepthSurface>);
  const surface=view.container.firstElementChild as HTMLDivElement;
  surface.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:200,bottom:100,width:200,height:100,toJSON(){}});
  fireEvent.pointerMove(surface,{clientX:100,clientY:25,pointerType:'mouse'});
  await waitFor(()=>assert.equal(surface.style.getPropertyValue('--rx'),'1.5deg'));
  fireEvent.pointerLeave(surface);assert.equal(surface.style.getPropertyValue('--rx'),'0deg');
  fireEvent.pointerMove(surface,{clientX:100,clientY:25,pointerType:'touch'});assert.equal(surface.style.getPropertyValue('--rx'),'0deg');
  const originalMatchMedia=window.matchMedia;window.matchMedia=()=>({matches:true}) as MediaQueryList;
  fireEvent.pointerMove(surface,{clientX:100,clientY:25,pointerType:'mouse'});assert.equal(surface.style.getPropertyValue('--rx'),'0deg');
  window.matchMedia=originalMatchMedia;
});


test('a raw Cloudflare image failure stops loading immediately without losing the current view', async () => {
  const view=render(<GalleryShowcase open={()=>{}} />);
  const original=view.container.querySelector('.showcase-image.active');
  fireEvent.click(view.getByRole('button',{name:/03Performance/}));
  fireEvent.error(view.container.querySelectorAll('img')[2]);
  await waitFor(()=>assert.ok(view.getByRole('alert')));
  assert.equal(view.queryByRole('status'),null);
  assert.equal(view.container.querySelector('.showcase-image.active'),original);
  fireEvent.click(view.getByRole('button',{name:/03Performance/}));
  assert.equal(view.queryByRole('status'),null);
});
