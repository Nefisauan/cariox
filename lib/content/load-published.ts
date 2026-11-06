import { fallbackContent } from './fallback';
import { resolveAcademyContent } from './resolve';
import type { SanityEnvironment } from '../sanity/env';
import type { AcademyQueryResult } from '../sanity/queries';
export async function loadPublishedContent(config:SanityEnvironment|null,read:(config:SanityEnvironment)=>Promise<AcademyQueryResult>,onError:(error:unknown)=>void=()=>{}) {
  if(!config)return fallbackContent;
  try{return resolveAcademyContent(await read(config));}
  catch(error){onError(error);return fallbackContent;}
}
