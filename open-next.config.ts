import { defineCloudflareConfig } from '@opennextjs/cloudflare';
// SSR + Sanity CDN: no R2, KV, database, image binding, or billable cache provisioned.
export default defineCloudflareConfig({});
