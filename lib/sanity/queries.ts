import { defineQuery } from 'groq';
import type { HomepageContent, Branding, AcademyPhoto, AcademyProgram, Instructor, AcademySchedule, MembershipPrice, BusinessInformation, Announcement, AcademyFaq } from '../content/types';
// Published perspective is also enforced by the client. No draft/preview token is exposed.
export const ACADEMY_QUERY = defineQuery(`{
  "homepage": *[_type == "homepage" && _id == "homepage"][0]{heroEyebrow,heroTitle,heroDescription,primaryCta,secondaryCta,about,programs,team,culture,contact,seo},
  "branding": *[_type == "branding" && _id == "branding"][0]{wordmarkLeft,wordmarkRight,tagline,affiliation,"logoUrl":logo.asset->url},
  "photos": *[_type == "academyPhoto" && enabled == true] {key,title,label,description,alt,tab,"url":image.asset->url},
  "programs": *[_type == "program" && active == true && confirmed == true] | order(order asc) {title,tag,body},
  "instructors": *[_type == "instructor" && active == true && confirmed == true] | order(order asc) {"id":_id,name,rank,experience,specialties,biography,"achievements":coalesce(achievements[]{event,placement},[]),"photoUrl":photo.asset->url,photoAlt},
  "schedules": *[_type == "schedule" && active == true && confirmed == true && class->active == true && class->confirmed == true && class->program->active == true && class->program->confirmed == true] | order(order asc) {"id":_id,day,time,period,timezone,"name":class->name,"type":class->format,"level":class->level,"instructor":select(class->instructor->confirmed == true && class->instructor->active == true => class->instructor->name)},
  "prices": *[_type == "membershipPrice" && active == true && confirmed == true] | order(order asc) {"id":_id,title,description,amount,currency,interval},
  "business": *[_type == "businessInformation" && _id == "businessInformation" && confirmed == true][0]{name,address,phone,email,timezone,hours,mapUrl,socialLinks},
  "announcements": *[_type == "announcement" && active == true && confirmed == true] | order(order asc) {"id":_id,title,body,startsAt,endsAt,link},
  "faqs": *[_type == "faq" && active == true && enabled == true && confirmed == true] | order(order asc) {question,answer}
}`);
// Hand-maintained projection types until TypeGen runs with the owner's configured Studio.
// Runtime validation remains mandatory: network payloads can be malformed despite TS types.
type CmsPartial<T> = T extends (infer Item)[] ? CmsPartial<Item>[] : T extends object ? {[Key in keyof T]?: CmsPartial<T[Key]> | null} : T;
export type AcademyQueryResult = {
  homepage?: CmsPartial<HomepageContent> | null; branding?: CmsPartial<Branding> | null;
  photos?: CmsPartial<AcademyPhoto>[] | null; programs?: CmsPartial<AcademyProgram>[] | null;
  instructors?: CmsPartial<Instructor>[] | null; schedules?: CmsPartial<AcademySchedule>[] | null;
  prices?: CmsPartial<MembershipPrice>[] | null; business?: CmsPartial<BusinessInformation> | null;
  announcements?: CmsPartial<Announcement>[] | null; faqs?: CmsPartial<AcademyFaq>[] | null;
};
