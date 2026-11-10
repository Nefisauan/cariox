import { createTrialGateway } from '../../../lib/trial/gateway';
import { getTrialGatewayConfig } from '../../../lib/trial/runtime';

export const POST = createTrialGateway({
  config: getTrialGatewayConfig,
  clientIp: request => process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')
    : request.headers.get('cf-connecting-ip'),
});
