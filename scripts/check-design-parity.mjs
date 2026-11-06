import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {JSDOM} from 'jsdom';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/home-baseline.json','utf8'));
const d=new JSDOM(fs.readFileSync('.next/server/app/index.html','utf8')).window.document;
d.querySelectorAll('script,style,link').forEach(x=>x.remove());
// The owner requested an instructor profile and removal of decorative emoji glyphs.
// Keep the original baseline, comparing every other section and the original CSS.
const normalizeText = text => text.replace(/04 \/ THE PEOPLE BEHIND THE PRACTICE[\s\S]*?(?=05 \/ MAKE TIME FOR YOURSELF)/,'{APPROVED INSTRUCTOR SECTION}').replace(/[✳✦]/gu,'').replace(/\s+/g,' ').trim().replace(/© \d{4}/g,'© {YEAR}');
const withoutInstructor = elements => {
  const start=elements.indexOf('SECTION.instructors section-pad'), end=elements.indexOf('SECTION.schedule section-pad');
  assert.ok(start>=0 && end>start,'Instructor and schedule boundaries must exist');
  return [...elements.slice(0,start),'{APPROVED INSTRUCTOR SECTION}',...elements.slice(end)];
};
assert.equal(normalizeText(d.body.textContent),normalizeText(fixture.text),'Unchanged fallback visible text changed');
assert.deepEqual(withoutInstructor([...d.body.querySelectorAll('*')].map(x=>`${x.tagName}.${x.getAttribute('class')||''}`)),withoutInstructor(fixture.elements),'Unchanged fallback DOM/class structure changed');
const css=fs.readFileSync('app/globals.css');
assert.equal(createHash('sha256').update(css.subarray(0,fixture.cssBytes)).digest('hex'),fixture.cssSha256,'Existing visual/3D/responsive CSS changed');
console.log(`Outside the approved instructor and emoji removal changes, fallback text/DOM and all original visual/3D/responsive CSS match main (${fixture.commit}).`);
