import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fallbackContent } from '../lib/content/fallback';

type Document = { _id: string; _type: string; [key: string]: unknown };
const content = fallbackContent;
const docs: Document[] = [];
const add = (_id: string, _type: string, fields: Record<string, unknown>) => docs.push({ _id, _type, ...fields });
const ref = (_ref: string) => ({ _type: 'reference', _ref });
function asset(url: string) {
  if (!url.startsWith('/images/')) throw new Error('Expected a bundled public image.');
  const file = resolve('public', url.slice(1));
  if (!existsSync(file)) throw new Error(`Missing bundled image: ${url}`);
  return { _type: 'image', _sanityAsset: `image@${pathToFileURL(file).href}` };
}
const live = (order: number) => ({ confirmed: true, active: true, order });
const { logoUrl, ...branding } = content.branding;
add('homepage', 'homepage', content.homepage);
add('branding', 'branding', { ...branding, ...(logoUrl ? { logo: asset(logoUrl) } : {}) });
for (const { key, url, ...fields } of content.photos) {
  add(`photo-${key}`, 'academyPhoto', { ...fields, key, enabled: true, image: asset(url) });
}
content.programs.forEach((fields, index) => add(`program-${index + 1}`, 'program', { ...fields, ...live(index + 1) }));
content.instructors.forEach(({ id, photoUrl, achievements, ...fields }, index) => {
  add(id, 'instructor', { ...fields, ...live(index + 1), photo: asset(photoUrl),
    achievements: achievements.map((result, i) => ({ ...result, _type: 'competitionResult', _key: `result-${i + 1}` })) });
});
const classes = new Map<string, string>();
for (const [index, { id, name, type, level, description, ...slot }] of content.schedules.entries()) {
  const key = JSON.stringify([name, type, level, description]);
  let classId = classes.get(key);
  if (!classId) {
    classId = `class-${classes.size + 1}`;
    classes.set(key, classId);
    const program = name.startsWith('Kids') ? 2 : name.includes('Jiu-Jitsu') ? 1 : 3;
    add(classId, 'classDefinition', { name, format: type, level, description, program: ref(`program-${program}`), ...live(classes.size) });
  }
  add(`schedule-${id}`, 'schedule', { ...slot, class: ref(classId), ...live(index + 1) });
}
content.faqs.forEach((fields, index) => add(`faq-${index + 1}`, 'faq', { ...fields, ...live(index + 1), enabled: true }));
mkdirSync('.sanity', { recursive: true });
writeFileSync('.sanity/cariox-seed.ndjson', docs.map(doc => JSON.stringify(doc)).join('\n') + '\n');
console.log(`Prepared ${docs.length} documents, including ${content.schedules.length} class slots, in .sanity/cariox-seed.ndjson. Nothing was uploaded.`);
