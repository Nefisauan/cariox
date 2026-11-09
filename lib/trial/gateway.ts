import { handle, idempotencyKey, json, readInput, ServiceError } from '../services/http';
import { isTrialReceipt } from './contract';
import { trialInput } from './input';

export function trialGatewayConfig(env: Record<string, string | undefined> = process.env) {
  if (env.TRIAL_LEADS_ENABLED !== 'true' || !/^[A-Za-z0-9_-]{32,128}$/.test(env.TRIAL_WORKER_SECRET ?? '')) return null;
  try {
    const url = new URL(env.TRIAL_WORKER_URL ?? '');
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/trial') return null;
    return { url: url.href, secret: env.TRIAL_WORKER_SECRET! };
  } catch { return null; }
}

export function createTrialGateway({
  config = () => trialGatewayConfig(),
  send = fetch,
  clientIp = () => null,
}: {
  config?: () => ReturnType<typeof trialGatewayConfig>;
  send?: typeof fetch;
  clientIp?: (request: Request) => string | null;
} = {}) {
  return (request: Request) => handle(async () => {
    const settings = config();
    if (!settings) throw new ServiceError(503, 'TRIAL_UNAVAILABLE', 'Online trial requests aren’t open yet.');
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      throw new ServiceError(403, 'ORIGIN_REJECTED', 'Please submit from the academy website.');
    }
    const key = idempotencyKey(request);
    const input = await readInput(request, trialInput);
    const ip = clientIp(request);
    const response = await send(settings.url, {
      method: 'POST', credentials: 'omit', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${settings.secret}`, 'Content-Type': 'application/json', 'Idempotency-Key': key,
        ...(ip && /^[\da-fA-F:.]{3,64}$/.test(ip) ? { 'X-Trial-Client-IP': ip } : {}),
      },
      body: JSON.stringify(input),
    });
    if (response.status === 429) throw new ServiceError(429, 'TRY_LATER', 'Please try again in a few minutes.');
    if (response.status === 409) throw new ServiceError(409, 'KEY_CONFLICT', 'Close and reopen the form, then try again.');
    if (response.status !== 201) throw new ServiceError(502, 'SAVE_UNCONFIRMED', 'We couldn’t confirm your request. Please try again.');
    const receipt: unknown = await response.json();
    if (!isTrialReceipt(receipt)) throw new ServiceError(502, 'SAVE_UNCONFIRMED', 'We couldn’t confirm your request. Please try again.');
    return json({ ok: true, status: 'accepted', eventId: receipt.eventId }, 201);
  });
}
