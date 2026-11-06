import { z } from 'zod';
const text = z.string().trim().min(1).max(5000);
export const imageUrl = z.string().refine(value => /^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..') || /^https:\/\/cdn\.sanity\.io\/images\/[a-z0-9]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(?:\?[^#]*)?$/.test(value), 'Use an uploaded Sanity image or a local /images/ asset');
export const photoSchema = z.object({ key: z.enum(['academy', 'reception', 'performance', 'lounge', 'collection']), url: imageUrl, title: text, label: text, description: text, alt: text, tab: text });
export type AcademyPhoto = z.infer<typeof photoSchema>;
export const programSchema = z.object({ title: text, tag: text, body: text });
export type AcademyProgram = z.infer<typeof programSchema>;
export const faqSchema = z.object({ question: text, answer: text });
export type AcademyFaq = z.infer<typeof faqSchema>;
export const headingSchema = z.object({ title: text, accent: text });
export const homepageSchema = z.object({
  heroEyebrow: text.max(120), heroTitle: z.array(text.max(40)).length(3), heroDescription: text.max(500), primaryCta: text.max(60), secondaryCta: text.max(60),
  about: headingSchema.extend({ eyebrow: text, accentPrefix: z.string().max(100).optional(), lead: text, body: text, imageCaption: text }),
  programs: headingSchema.extend({ description: text }),
  team: headingSchema.extend({ body: text }),
  culture: headingSchema.extend({ eyebrow: text, body: text, quote: text }),
  contact: headingSchema.extend({ eyebrow: text, body: text }),
  seo: z.object({ title: text.max(100), description: text.max(300) }),
});
export type HomepageContent = z.infer<typeof homepageSchema>;
export const brandingSchema = z.object({ wordmarkLeft: text.max(20), wordmarkRight: text.max(20), tagline: text.max(100), affiliation: text.max(100), logoUrl: imageUrl.optional() });
export type Branding = z.infer<typeof brandingSchema>;
export const achievementSchema = z.object({ event: text.max(160), placement: z.number().int().min(1).max(3) });
export const instructorSchema = z.object({ id: text, name: text.optional(), rank: text, experience: text.optional(), specialties: z.array(text).default([]), biography: text.optional(), achievements: z.array(achievementSchema).max(50).default([]), photoUrl: imageUrl, photoAlt: text });
export type Instructor = z.infer<typeof instructorSchema>;
export const classSchema = z.object({ id: text, name: text, type: text, level: text, instructor: text.optional() });
export const scheduleSchema = z.object({ id: text, day: z.enum(['Mon','Tue','Wed','Thu','Fri','Sat','Sun']), time: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9]$/), period: z.enum(['AM','PM']), name: text, type: text, level: text.optional(), instructor: text.optional(), timezone: text.refine(value => { try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; } }).optional() });
export type AcademySchedule = z.infer<typeof scheduleSchema>;
export const priceSchema = z.object({ id: text, title: text, description: text, amount: z.number().nonnegative(), currency: z.string().regex(/^[A-Z]{3}$/), interval: z.enum(['month','year','session','one-time']) });
export type MembershipPrice = z.infer<typeof priceSchema>;
const externalLink = z.url().refine(value => new URL(value).protocol === 'https:', 'Use HTTPS');
export const businessSchema = z.object({ name: text, address: text.optional(), phone: z.string().regex(/^[\d\s()+.\-]{7,30}$/).optional(), email: z.email().optional(), timezone: text.optional(), hours: text.optional(), mapUrl: externalLink.optional(), socialLinks: z.array(z.object({ label: text, url: externalLink })).default([]) });
export type BusinessInformation = z.infer<typeof businessSchema>;
export const announcementSchema = z.object({ id: text, title: text, body: text, startsAt: z.iso.datetime().optional(), endsAt: z.iso.datetime().optional(), link: externalLink.optional() });
export type Announcement = z.infer<typeof announcementSchema>;
export type AcademyContent = { homepage: HomepageContent; branding: Branding; photos: AcademyPhoto[]; programs: AcademyProgram[]; instructors: Instructor[]; schedules: AcademySchedule[]; prices: MembershipPrice[]; business: BusinessInformation | null; announcements: Announcement[]; faqs: AcademyFaq[]; source: 'fallback' | 'sanity'; faqsConfirmed: boolean; programsConfirmed: boolean; scheduleConfirmed: boolean };
