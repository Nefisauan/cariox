import 'server-only';
import { unstable_rethrow } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '@sanity/client';
import { getSanityEnvironment } from '../sanity/env';
import { ACADEMY_QUERY, type AcademyQueryResult } from '../sanity/queries';
import { loadPublishedContent } from './load-published';
export const getAcademyContent = cache(() => loadPublishedContent(getSanityEnvironment(), async config => {
  const client=createClient({...config,useCdn:true,perspective:'published',token:process.env.SANITY_API_READ_TOKEN||undefined,timeout:3500,maxRetries:0});
  return client.fetch<AcademyQueryResult>(ACADEMY_QUERY,{}, {cache:'no-store'});
},error=>{
  unstable_rethrow(error);
  // Never log tokens or raw CMS payloads.
  console.warn('Sanity content unavailable; serving the checked-in academy content.');
}));
