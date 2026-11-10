import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM(fs.readFileSync('.next/server/app/index.html', 'utf8'), { url: 'https://cariox.example', pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Element: dom.window.Element, HTMLElement: dom.window.HTMLElement });
const { default: axe } = await import('axe-core');
const document = dom.window.document;
assert.equal(document.querySelectorAll('h1').length, 1, 'The page must have a single main heading');
const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
assert.equal(new Set(ids).size, ids.length, 'Page IDs must be unique');
for (const anchor of document.querySelectorAll('a[href^="#"]')) {
  assert.ok(document.getElementById(anchor.getAttribute('href').slice(1)), `Missing anchor target: ${anchor.getAttribute('href')}`);
}
for (const image of document.querySelectorAll('img')) {
  assert.ok(image.classList.contains('brand-logo') ? image.hasAttribute('alt') : image.getAttribute('alt'), 'Every editorial image needs a meaningful alt; decorative brand repeats need an explicit empty alt');
  const url = new URL(image.getAttribute('src'), 'https://cariox.example');
  const source = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
  assert.ok(source && fs.existsSync(`public${source}`), `Missing image file: ${source}`);
  assert.ok(!['/images/academy.jpg', '/images/performance.jpg'].includes(source), 'Annotated originals must not be shown');
  assert.ok(!['/images/academy-clean.webp','/images/performance-clean.webp','/images/reception.jpg','/images/collection.jpg'].includes(source),'Prior-brand mockups must not be shown');
}
assert.ok(!document.head.innerHTML.includes('localhost'), 'Production metadata must not link to localhost');
assert.ok(document.querySelector('meta[name="robots"]')?.content.includes('noindex'), 'Unverified preview must stay out of search');
const visibleText = document.body.cloneNode(true);
visibleText.querySelectorAll('script,style').forEach(element => element.remove());
assert.ok(!/[\p{Extended_Pictographic}]/u.test(visibleText.textContent.replace(/©/g,'')), 'Website copy must not contain emoji decorations');
assert.equal(document.querySelectorAll('#instructors .competition-record li').length,10,'All ten supplied competition results must render in the fallback build');
assert.ok(document.querySelector('.site-header .brand-logo'),'Header must use the official logo artwork');
assert.ok(document.querySelector('.footer-top .brand-logo'),'Footer must use the official logo artwork');
assert.equal(document.querySelectorAll('.wordmark').length,0,'Old text-only logos must not render');
assert.ok(document.head.querySelector('link[rel="icon"][href^="/icon.png"]'),'Browser icon must use the official logo');
assert.ok(document.head.querySelector('meta[property="og:image"]')?.content.endsWith('/share-image.png'),'Share metadata must point to the official-logo card');
assert.ok(visibleText.textContent.includes('Schedule Your Free Trial Class'),'The homepage must offer the free trial request');
assert.ok(!/Complete booking preview|Explore the booking experience|BOOKINGS & CHAT ARE DEMOS/.test(visibleText.textContent),'The old demo booking language must not render');
assert.equal(document.querySelectorAll('#schedule .class-row').length,43,'All 43 supplied weekly classes must render');
assert.ok(!/sample|illustrative|preview/i.test(document.querySelector('#schedule').textContent),'Published schedule must not contain demo timetable copy');
for (const id of ['wed-0930-am','wed-0400-pm']) assert.equal(document.querySelector(`[data-class-id="${id}"] .level-tag`).textContent,'Gi');
for (const id of ['fri-0930-am','fri-0400-pm','sat-0900-am']) assert.equal(document.querySelector(`[data-class-id="${id}"] .level-tag`).textContent,'No-Gi');
const results = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } } });
const report = results.violations.map(item => ({ id: item.id, impact: item.impact, help: item.help, elements: item.nodes.map(node => node.target) }));
if (report.length) { console.error(JSON.stringify(report, null, 2)); process.exitCode = 1; }
else console.log(`Production audit passed: one h1; unique IDs; all section links and ${document.querySelectorAll('img').length} images resolve; no annotated originals; preview indexing disabled; ${results.passes.length} structural accessibility checks passed. Browser layout, contrast, and real network services require live verification.`);
