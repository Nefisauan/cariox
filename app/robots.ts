import type { MetadataRoute } from 'next';
import { publicSiteUrl } from '../lib/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', publicSiteUrl).href,
  };
}
