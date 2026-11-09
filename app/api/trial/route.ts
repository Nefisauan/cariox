import { createTrialGateway } from '../../../lib/trial/gateway';

export const POST = createTrialGateway({
  clientIp: request => process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')
    : request.headers.get('cf-connecting-ip'),
});
