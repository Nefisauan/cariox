'use client';
import { isVerifiedConversion, type VerifiedConversion } from '../tracking/contracts';
import { trackLead, trackCompleteRegistration } from '../tracking/client';
import { availabilityResult, type RegistrationInput, type InquiryInput } from './contracts';
async function submit(path:string,input:unknown,idempotencyKey:string){
  const response=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(input),signal:AbortSignal.timeout(10000)});
  const body:unknown=await response.json();if(!response.ok)throw new Error('This live service is not available. Nothing has been confirmed.');return body;
}
// Not used by the demo UI. Reuse the SAME idempotency key when retrying a submission.
export async function registerWithLiveProvider(input:RegistrationInput,idempotencyKey:string):Promise<VerifiedConversion>{
  const result=await submit('/api/registration',input,idempotencyKey);
  if(!isVerifiedConversion(result,'CompleteRegistration'))throw new Error('Registration has not been verified.');
  await trackCompleteRegistration(result.reference);return result;
}
export async function deliverLiveInquiry(input:InquiryInput,idempotencyKey:string):Promise<VerifiedConversion>{
  const result=await submit('/api/contact',input,idempotencyKey);
  if(!isVerifiedConversion(result,'Lead'))throw new Error('Inquiry delivery has not been verified.');
  await trackLead(result.reference);return result;
}

export async function getLiveAvailability(sessionId:string,date:string) {
 const response=await fetch('/api/registration/availability',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,date}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Live availability is not connected.');
 const result=availabilityResult.safeParse(await response.json());if(!result.success)throw new Error('Live availability could not be verified.');return result.data.slots;
}
