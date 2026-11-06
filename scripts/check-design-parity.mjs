import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {JSDOM} from 'jsdom';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/home-baseline.json','utf8'));
const d=new JSDOM(fs.readFileSync('.next/server/app/index.html','utf8')).window.document;
d.querySelectorAll('script,style,link').forEach(x=>x.remove());
assert.equal(d.body.textContent.replace(/\s+/g,' ').trim().replace(/© \d{4}/g,'© {YEAR}'),fixture.text,'Fallback visible text changed');
assert.deepEqual([...d.body.querySelectorAll('*')].map(x=>`${x.tagName}.${x.getAttribute('class')||''}`),fixture.elements,'Fallback DOM/class structure changed');
const css=fs.readFileSync('app/globals.css');
assert.equal(createHash('sha256').update(css.subarray(0,fixture.cssBytes)).digest('hex'),fixture.cssSha256,'Existing visual/3D/responsive CSS changed');
console.log(`Fallback text, DOM/class structure, and all original visual/3D/responsive CSS match main (${fixture.commit}).`);
