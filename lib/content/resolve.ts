import { z } from 'zod';
import { fallbackContent } from './fallback';
import { homepageSchema, brandingSchema, photoSchema, programSchema, instructorSchema, scheduleSchema, priceSchema, businessSchema, announcementSchema, faqSchema, type AcademyContent } from './types';
function validArray<T>(schema: z.ZodType<T>, value: unknown): T[] { return Array.isArray(value) ? value.flatMap(item => { const result = schema.safeParse(item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).filter(([,v]) => v !== null)) : item); return result.success ? [result.data] : []; }) : []; }
function mergeSection<T extends object>(fallback: T, value: unknown, schema: z.ZodObject): T {
  if (!value || typeof value !== 'object') return fallback;
  const result: Record<string, unknown> = { ...fallback } as Record<string, unknown>;
  for (const [key, validator] of Object.entries(schema.shape)) {
    const raw = (value as Record<string, unknown>)[key];
    if (raw === undefined || raw === null) continue;
    if (validator instanceof z.ZodObject && typeof raw === 'object' && result[key]) result[key] = mergeSection(result[key] as object, raw, validator);
    else { const checked = (validator as z.ZodType).safeParse(raw); if (checked.success) result[key] = checked.data; }
  }
  return result as T;
}
export function resolveAcademyContent(input: unknown, now = new Date()): AcademyContent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fallbackContent;
  const raw = input as Record<string, unknown>;
  const programs = validArray(programSchema, raw.programs), schedules = validArray(scheduleSchema, raw.schedules), faqs = validArray(faqSchema, raw.faqs);
  const photos = validArray(photoSchema, raw.photos), instructors = validArray(instructorSchema, raw.instructors);
  const business = businessSchema.safeParse(raw.business);
  return {
    ...fallbackContent, source: 'sanity', faqsConfirmed: faqs.length > 0,
    homepage: mergeSection(fallbackContent.homepage, raw.homepage, homepageSchema),
    branding: mergeSection(fallbackContent.branding, raw.branding, brandingSchema),
    photos: fallbackContent.photos.map(photo => photos.find(item => item.key === photo.key) || photo),
    programs: programs.length ? programs : fallbackContent.programs, programsConfirmed: programs.length > 0,
    schedules, scheduleConfirmed: schedules.length > 0,
    instructors: instructors.length ? instructors : fallbackContent.instructors, prices: validArray(priceSchema, raw.prices),
    business: business.success ? business.data : null,
    announcements: validArray(announcementSchema, raw.announcements).filter(item => (!item.startsAt || new Date(item.startsAt) <= now) && (!item.endsAt || new Date(item.endsAt) > now)),
    faqs: faqs.length ? faqs : fallbackContent.faqs,
  };
}
