import { z } from 'zod';
import { fallbackContent } from './fallback';
import { TRIAL_BOOKING_GUIDANCE } from '../trial/contract';
import { navigationSchema } from './navigation';
import { homepageSchema, brandingSchema, photoSchema, programSchema, instructorSchema, scheduleSchema, priceSchema, businessSchema, announcementSchema, faqSchema, type AcademyContent } from './types';

const bookingFaqAnswers: Readonly<Record<string, string>> = {
  'How do I schedule a free trial?': TRIAL_BOOKING_GUIDANCE,
  'Where can I find pricing and the class schedule?': 'The weekly timetable is in the Schedule section. Use the booking page to see which classes have open trial spots. Ask the academy about current pricing.',
};

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
  const homepage = mergeSection(fallbackContent.homepage, raw.homepage, homepageSchema);
  const questions = faqs.length ? faqs : fallbackContent.faqs;
  if (homepage.bookingUrl && homepage.schedule.description === fallbackContent.homepage.schedule.description) {
    homepage.schedule = { ...homepage.schedule, description: 'Class times may change. Use the free trial booking page to see available spots.' };
  }
  return {
    ...fallbackContent, source: 'sanity', faqsConfirmed: faqs.length > 0,
    homepage,
    navigation: mergeSection(fallbackContent.navigation, raw.navigation, navigationSchema),
    branding: mergeSection(fallbackContent.branding, raw.branding, brandingSchema),
    photos: fallbackContent.photos.map(photo => photos.find(item => item.key === photo.key) || photo),
    programs: programs.length ? programs : fallbackContent.programs, programsConfirmed: programs.length > 0 || fallbackContent.programsConfirmed,
    schedules: schedules.length ? schedules : fallbackContent.schedules, scheduleConfirmed: schedules.length > 0 || fallbackContent.scheduleConfirmed,
    instructors: instructors.length ? instructors : fallbackContent.instructors, prices: validArray(priceSchema, raw.prices),
    business: business.success ? business.data : null,
    announcements: validArray(announcementSchema, raw.announcements).filter(item => (!item.startsAt || new Date(item.startsAt) <= now) && (!item.endsAt || new Date(item.endsAt) > now)),
    faqs: homepage.bookingUrl ? questions.map(item => {
      const answer = bookingFaqAnswers[item.question];
      const isDefault = fallbackContent.faqs.some(faq => faq.question === item.question && faq.answer === item.answer);
      return answer && isDefault ? { ...item, answer } : item;
    }) : questions,
  };
}
