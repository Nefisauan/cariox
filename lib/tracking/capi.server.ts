import 'server-only';
import { prepareCapiEvent } from './capi-payload';
// No public forwarding endpoint and no invocation from any demo flow.
export async function sendConversionsApiEvent(input:Parameters<typeof prepareCapiEvent>[0]):Promise<{sent:boolean;reason?:string}> {
  if (!input.consent || process.env.META_CAPI_ENABLED !== 'true') return {sent:false,reason:'disabled-or-no-consent'};
  const pixelId=process.env.META_PIXEL_ID,token=process.env.META_CAPI_ACCESS_TOKEN,version=process.env.META_GRAPH_API_VERSION;
  if(!pixelId||!/^\d{5,30}$/.test(pixelId)||!token||!version||!/^v\d+\.\d+$/.test(version))return {sent:false,reason:'not-configured'};
  if(process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.NEXT_PUBLIC_META_PIXEL_ID !== pixelId)return {sent:false,reason:'pixel-mismatch'};
  const event=await prepareCapiEvent(input);if(!event)return {sent:false,reason:'unverified'};
  try {
    const response=await fetch(`https://graph.facebook.com/${version}/${pixelId}/events`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({data:[event],...(process.env.META_TEST_EVENT_CODE?{test_event_code:process.env.META_TEST_EVENT_CODE}:{})}),signal:AbortSignal.timeout(5000)});
    if(!response.ok)return {sent:false,reason:'provider-rejected'};
    const result=await response.json() as {events_received?:number};return {sent:result.events_received===1};
  } catch { return {sent:false,reason:'provider-unavailable'}; }
}
