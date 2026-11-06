// Creates an offline snapshot from Next's production HTML. No web server is used.
// It is for visual QA only; interactive behavior is tested separately in the DOM.
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
const root = process.cwd();
const dom = new JSDOM(fs.readFileSync('.next/server/app/index.html', 'utf8'));
const document = dom.window.document;
const mime = { '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const dataUrl = file => `data:${mime[path.extname(file)] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
for (const script of document.querySelectorAll('script')) script.remove();
for (const link of document.querySelectorAll('link')) {
  if (link.rel === 'stylesheet') {
    const file = path.join(root, '.next', link.getAttribute('href').replace(/^\/_next\//, ''));
    const style = document.createElement('style');
    style.textContent = fs.readFileSync(file, 'utf8').replace(/url\(["']?(\/fonts\/[^)"']+)["']?\)/g, (_, asset) => `url(${dataUrl(path.join(root, 'public', asset))})`);
    link.replaceWith(style);
  } else link.remove();
}
for (const image of document.querySelectorAll('img')) {
  const url = new URL(image.getAttribute('src'), 'https://review.example');
  const source = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
  if (source?.startsWith('/images/')) image.src = dataUrl(path.join(root, 'public', source));
  image.removeAttribute('srcset');
  image.removeAttribute('loading');
}
const note = document.createElement('meta'); note.name = 'description'; note.content = 'Offline visual QA snapshot — interactions verified separately.'; document.head.appendChild(note);
fs.writeFileSync('/tmp/cariox-review.html', dom.serialize());
console.log('Offline production snapshot: /tmp/cariox-review.html');
