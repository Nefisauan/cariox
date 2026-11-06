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
  assert.ok(image.getAttribute('alt'), 'Every editorial image needs a meaningful alt');
  const url = new URL(image.getAttribute('src'), 'https://cariox.example');
  const source = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
  assert.ok(source && fs.existsSync(`public${source}`), `Missing image file: ${source}`);
  assert.ok(!['/images/academy.jpg', '/images/performance.jpg'].includes(source), 'Annotated originals must not be shown');
}
assert.ok(!document.head.innerHTML.includes('localhost'), 'Production metadata must not link to localhost');
assert.ok(document.querySelector('meta[name="robots"]')?.content.includes('noindex'), 'Unverified preview must stay out of search');
const results = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } } });
const report = results.violations.map(item => ({ id: item.id, impact: item.impact, help: item.help, elements: item.nodes.map(node => node.target) }));
if (report.length) { console.error(JSON.stringify(report, null, 2)); process.exitCode = 1; }
else console.log(`Production audit passed: one h1; unique IDs; all section links and ${document.querySelectorAll('img').length} images resolve; no annotated originals; preview indexing disabled; ${results.passes.length} structural accessibility checks passed. Browser layout, contrast, and real network services require live verification.`);
