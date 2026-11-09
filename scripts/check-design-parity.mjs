import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {JSDOM} from 'jsdom';
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/home-baseline.json','utf8'));
const d=new JSDOM(fs.readFileSync('.next/server/app/index.html','utf8')).window.document;
d.querySelectorAll('script,style,link').forEach(x=>x.remove());
// Preserve the original fixture. Exclude only the approved instructor/schedule
// sections and the program/FAQ copy updated to reflect the supplied timetable.
const normalizeText = text => text
  .replace(/02 \/ YOUR PRACTICE[\s\S]*?(?=03 \/ INSIDE CARIOX)/,'{APPROVED PROGRAM COPY}')
  .replace(/04 \/ THE PEOPLE BEHIND THE PRACTICE[\s\S]*?(?=MORE THAN A PLACE TO TRAIN\.)/,'{APPROVED INSTRUCTOR AND SCHEDULE}')
  .replace(/Can I ask about training for my child\?[\s\S]*?(?=07 \/ LET’S BEGIN)/,'{APPROVED SCHEDULE FAQ COPY}')
  .replace('Schedule preview','Class schedule')
  .replaceAll('Schedule Your Free Trial ClassFree Trial Class','{TRIAL CTA}')
  .replaceAll('Schedule Your Free Trial Class','{TRIAL CTA}')
  .replaceAll('Plan your first visit','{TRIAL CTA}')
  .replaceAll('Your first visit','{TRIAL CTA}')
  .replaceAll('Explore the booking experience','{TRIAL CTA}')
  .replace('ACADEMY PREVIEW · BOOKINGS & CHAT ARE DEMOS','FREE TRIALS BY ARRANGEMENT')
  .replaceAll('CARIOXBRAZILIAN MARTIAL ARTS','')
  .replace('BRAZILIAN IN SPIRIT. CARIOX BY NATURE.C','BRAZILIAN IN SPIRIT. CARIOX BY NATURE.')
  .replace(/[✳✦]/gu,'').replace(/\s+/g,' ').trim().replace(/© \d{4}/g,'© {YEAR}');
const withoutInstructor = elements => {
  const start=elements.indexOf('SECTION.instructors section-pad'), end=elements.indexOf('SECTION.culture section-pad');
  assert.ok(start>=0 && end>start,'Instructor and culture boundaries must exist');
  return [...elements.slice(0,start),'{APPROVED INSTRUCTOR AND SCHEDULE}',...elements.slice(end)];
};
assert.equal(normalizeText(d.body.textContent),normalizeText(fixture.text),'Unchanged fallback visible text changed');
const normalizeLogos = elements => {
  const result=[];
  for(let i=0;i<elements.length;i++){
    const element=elements[i];
    if(element==='SPAN.trial-nav-long' || element==='SPAN.trial-nav-short') continue;
    if(element==='SPAN.wordmark'){
      assert.deepEqual(elements.slice(i+1,i+3),['SPAN.','SMALL.']);
      result.push('{OFFICIAL BRAND ARTWORK}'); i+=2;
    }else if(element==='DIV.image-corner'){
      assert.ok(elements[i+1]==='SPAN.' || elements[i+1].startsWith('IMG.brand-logo'));
      result.push(element,'{OFFICIAL BRAND ARTWORK}'); i++;
    }else result.push(element.startsWith('IMG.brand-logo')?'{OFFICIAL BRAND ARTWORK}':element);
  }
  return result;
};
assert.deepEqual(normalizeLogos(withoutInstructor([...d.body.querySelectorAll('*')].map(x=>`${x.tagName}.${x.getAttribute('class')||''}`))),normalizeLogos(withoutInstructor(fixture.elements)),'Unchanged fallback DOM/class structure changed');
const css=fs.readFileSync('app/globals.css');
assert.equal(createHash('sha256').update(css.subarray(0,fixture.cssBytes)).digest('hex'),fixture.cssSha256,'Existing visual/3D/responsive CSS changed');
console.log(`Outside approved instructor/schedule content, official logo replacements, free-trial entry points, and emoji removal, fallback text/DOM and all original visual/3D/responsive CSS match main (${fixture.commit}).`);
