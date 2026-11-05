import React from 'react';
import { test, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://cariox.example' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
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
afterEach(cleanup);

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
