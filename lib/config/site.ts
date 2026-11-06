export function getPublicSiteUrl(value:string|undefined):URL|undefined{
  if(!value)return undefined;
  try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)return undefined;return new URL(url.origin);}
  catch{return undefined;}
}
