import { z } from 'zod';
import { parseDateKey } from '../academy';
import type { VerifiedConversion } from '../tracking/contracts';
const opaque = z.string().regex(/^[A-Za-z0-9_:-]{8,160}$/);
export const registrationInput = z.object({ sessionId:opaque, slotId:opaque, name:z.string().trim().min(2).max(100), email:z.email().max(254), phone:z.string().max(30).regex(/^[\d\s()+.\-]{7,30}$/), marketingConsent:z.boolean().default(false) }).strict();
export type RegistrationInput = z.infer<typeof registrationInput>;
export const inquiryInput = z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254),interest:z.string().trim().min(1).max(200),message:z.string().trim().min(10).max(2000),marketingConsent:z.boolean().default(false)}).strict();
export type InquiryInput = z.infer<typeof inquiryInput>;
export const chatInput = z.object({message:z.string().trim().min(1).max(1000)}).strict();
export const referenceInput = z.object({reference:opaque}).strict();
export const availabilityInput = z.object({sessionId:opaque,date:z.string().refine(value=>parseDateKey(value)!==null)}).strict();
export const availabilityResult = z.object({mode:z.literal('live'),verified:z.literal(true),slots:z.array(z.object({slotId:opaque,sessionId:opaque,startsAt:z.iso.datetime({offset:true}),endsAt:z.iso.datetime({offset:true}),timeZone:z.string().refine(value=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}})}).refine(slot=>Date.parse(slot.endsAt)>Date.parse(slot.startsAt)))});
export type AvailabilityResult = z.infer<typeof availabilityResult>;
export interface RegistrationProvider {
  /** Return verified availability from the real provider, with its confirmed time zone. */
  availability(input:z.infer<typeof availabilityInput>,request:Request):Promise<AvailabilityResult>;
  /** Must atomically recheck live capacity and durably enforce this idempotency key. */
  register(input:RegistrationInput,idempotencyKey:string,request:Request):Promise<VerifiedConversion>;
  /** Must authenticate the receipt/session before returning any registration status. */
  verify(reference:string,request:Request):Promise<VerifiedConversion|null>;
}
export interface ContactProvider {
  /** Return delivered only after the actual CRM/mail system accepts the inquiry. */
  deliver(input:InquiryInput,idempotencyKey:string,request:Request):Promise<VerifiedConversion>;
  verify(reference:string,request:Request):Promise<VerifiedConversion|null>;
}
export interface ChatProvider { reply(message:string,request:Request):Promise<{reply:string}> }
