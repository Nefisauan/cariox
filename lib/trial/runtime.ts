import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { trialGatewayConfig, type TrialService } from './gateway';

export function getTrialGatewayConfig() {
  if (process.env.TRIAL_LEADS_ENABLED !== 'true') return null;
  try {
    const { env } = getCloudflareContext();
    const { TRIAL_SERVICE } = env as CloudflareEnv & { TRIAL_SERVICE?: TrialService };
    return trialGatewayConfig(process.env, TRIAL_SERVICE);
  } catch {
    // A non-Cloudflare runtime can still use an explicitly configured HTTPS endpoint.
    return trialGatewayConfig(process.env);
  }
}
