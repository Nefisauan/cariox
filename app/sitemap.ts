import type { MetadataRoute } from 'next';
import { publicSiteUrl } from '../lib/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL('/', publicSiteUrl).href }];
}
