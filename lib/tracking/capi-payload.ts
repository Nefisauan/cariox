import { isVerifiedConversion, type MetaEvent, type VerifiedConversion } from './contracts';
export type CapiEvent = { event_name: Exclude<MetaEvent,'PageView'>; event_id: string; event_time: number; action_source:'website'; event_source_url: string; user_data: {em?:string[];ph?:string[];external_id:string[]} };
export async function sha256(value: string): Promise<string> { const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join(''); }
export async function prepareCapiEvent(input: {event:'Lead'|'CompleteRegistration';receipt:VerifiedConversion;consent:boolean;sourceUrl:string;email?:string;phone?:string}):Promise<CapiEvent|null> {
  if (!input.consent || !isVerifiedConversion(input.receipt,input.event)) return null;
  let url:URL;try{url=new URL(input.sourceUrl);}catch{return null;}
  if(url.protocol!=='https:'||url.username||url.password)return null; url.search='';url.hash='';
  const user_data:CapiEvent['user_data']={external_id:[await sha256(input.receipt.reference)]};
  if(input.email)user_data.em=[await sha256(input.email.trim().toLowerCase())];
  if(input.phone)user_data.ph=[await sha256(input.phone.replace(/\D/g,''))];
  return {event_name:input.event,event_id:input.receipt.eventId,event_time:Math.floor(Date.parse(input.receipt.verifiedAt)/1000),action_source:'website',event_source_url:url.toString(),user_data};
}
