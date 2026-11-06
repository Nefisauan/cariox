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
mock.module('next/image', { defaultExport: ({fill, sizes, loading, unoptimized, ...props}: Record<string, unknown>) => React.createElement('img', props) });
const { default: ProgramExplorer } = await import('../components/ProgramExplorer');
const { default: GalleryShowcase } = await import('../components/GalleryShowcase');
const { default: BookingDialog } = await import('../components/Booking');
const { default: Navigation } = await import('../components/Navigation');
const { default: FirstVisit } = await import('../components/FirstVisit');
const { default: ContactForm } = await import('../components/ContactForm');
const { default: Receptionist } = await import('../components/Receptionist');
afterEach(() => { cleanup(); document.body.style.overflow = ''; });

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


test('booking supports date, details, honest receipt, and restores focus on close', async () => {
  const trigger = document.createElement('button'); trigger.textContent = 'Booking trigger'; document.body.appendChild(trigger); trigger.focus();
  document.body.style.overflow = 'clip';
  const view = render(<BookingDialog close={() => view.unmount()} />);
  assert.equal(document.body.style.overflow, 'hidden');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(today); target.setDate(target.getDate() + 1);
  while (target.getDay() === 0) target.setDate(target.getDate() + 1);
  if (target.getMonth() !== today.getMonth()) fireEvent.click(view.getByRole('button', { name: 'Next month' }));
  fireEvent.click(view.getByRole('button', { name: target.toLocaleDateString('en-US', { dateStyle: 'full' }) }));
  await waitFor(() => assert.ok(view.getByRole('button', { name: '09:00 AM' })));
  fireEvent.click(view.getByRole('button', { name: '09:00 AM' }));
  fireEvent.click(view.getByRole('button', { name: 'Continue to your details' }));
  fireEvent.change(view.getByLabelText('Full name'), { target: { value: 'Alex Visitor' } });
  fireEvent.change(view.getByLabelText('Email address'), { target: { value: 'alex@example.com' } });
  fireEvent.change(view.getByLabelText('Phone number'), { target: { value: '5551234567' } });
  fireEvent.click(view.getByRole('button', { name: 'Complete booking preview' }));
  await waitFor(() => assert.match(view.getByRole('status').textContent!, /not reserved/));
  assert.match(view.getByRole('status').textContent!, /Nothing was sent or saved/);
  fireEvent.click(view.getByRole('button', { name: 'Close booking' }));
  assert.equal(document.body.style.overflow, 'clip');
  assert.equal(document.activeElement, trigger);
  trigger.remove();
});

test('mobile navigation labels its dialog and restores scroll state after selecting a section', () => {
  const view = render(<Navigation book={() => {}} />);
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
  const view = render(<FirstVisit book={() => {}} />);
  const question = view.getByRole('button', { name: 'Does booking here reserve a real class?' });
  fireEvent.click(question);
  assert.equal(question.getAttribute('aria-expanded'), 'true');
  assert.match(view.getByRole('region', { name: 'Does booking here reserve a real class?' }).textContent!, /no reservation/);
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

test('receptionist does not steal initial focus and supports Escape and booking handoff', () => {
  let booked = false;
  const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus();
  const view = render(<Receptionist book={() => { booked = true; }} />);
  assert.equal(document.activeElement, trigger);
  const toggle = view.getByRole('button', { name: 'Let’s talk' });
  fireEvent.click(toggle);
  assert.equal(document.activeElement, view.getByRole('textbox', { name: 'Your message' }));
  fireEvent.keyDown(view.getByRole('textbox', { name: 'Your message' }), { key: 'Escape' });
  assert.equal(view.queryByRole('log'), null);
  assert.equal(document.activeElement, toggle);
  fireEvent.click(toggle);
  fireEvent.click(view.getByRole('button', { name: 'Explore booking' }));
  assert.equal(booked, true);
  assert.equal(view.queryByRole('log'), null);
  trigger.remove();
});
