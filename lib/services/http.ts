import { z } from 'zod';
export class ServiceError extends Error { constructor(public status:number,public code:string,message:string){super(message);} }
export const unavailable = () => new ServiceError(503,'NOT_CONNECTED','This service is not connected yet. No registration, message delivery, or AI request has been completed.');
export function json(body:unknown,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function readInput<T>(request:Request,schema:z.ZodType<T>):Promise<T>{
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)throw new ServiceError(403,'ORIGIN_REJECTED','Requests must originate from this website.');
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new ServiceError(415,'JSON_REQUIRED','Send a JSON request.');
  if(Number(request.headers.get('content-length')||0)>8192)throw new ServiceError(413,'BODY_TOO_LARGE','Request is too large.');
  const reader=request.body?.getReader(); if(!reader)throw new ServiceError(400,'INVALID_BODY','Request body is required.');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();throw new ServiceError(413,'BODY_TOO_LARGE','Request is too large.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let body:unknown;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ServiceError(400,'INVALID_JSON','Request must contain valid JSON.');}
  const result=schema.safeParse(body);if(!result.success)throw new ServiceError(400,'INVALID_INPUT','Check the submitted fields and try again.');return result.data;
}
export function idempotencyKey(request:Request){const key=request.headers.get('idempotency-key');if(!key||!/^[A-Za-z0-9_-]{16,128}$/.test(key))throw new ServiceError(400,'IDEMPOTENCY_KEY_REQUIRED','A unique idempotency key is required.');return key;}
export async function handle(action:()=>Promise<Response>){try{return await action();}catch(error){if(error instanceof ServiceError)return json({ok:false,code:error.code,message:error.message},error.status);return json({ok:false,code:'SERVICE_ERROR',message:'The service could not complete this request. Please try again later.'},502);}}
