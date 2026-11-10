import { handle, idempotencyKey, json, readInput, ServiceError } from '../services/http';
import { isTrialReceipt } from './contract';
import { trialInput } from './input';

export type TrialService = { fetch(request: Request): Promise<Response> };
type TrialGatewayConfig = { url: string; secret: string; service?: TrialService };

export function trialGatewayConfig(env: Record<string, string | undefined>, service?: TrialService): TrialGatewayConfig | null {
  const secret = env.TRIAL_WORKER_SECRET;
  if (env.TRIAL_LEADS_ENABLED !== 'true' || !secret || !/^[A-Za-z0-9_-]{32,128}$/.test(secret)) return null;
  if (service) return { url: 'https://cariox-trial.internal/trial', secret, service };
  try {
    const url = new URL(env.TRIAL_WORKER_URL ?? '');
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/trial') return null;
    return { url: url.href, secret };
  } catch { return null; }
}

export function createTrialGateway({
  config = () => trialGatewayConfig(process.env),
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
    const init: RequestInit = {
      method: 'POST', credentials: 'omit', redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${settings.secret}`, 'Content-Type': 'application/json', 'Idempotency-Key': key,
        ...(ip && /^[\da-fA-F:.]{3,64}$/.test(ip) ? { 'X-Trial-Client-IP': ip } : {}),
      },
      body: JSON.stringify(input),
    };
    const response = settings.service
      ? await settings.service.fetch(new Request(settings.url, init))
      : await send(settings.url, init);
    if (response.status === 429) throw new ServiceError(429, 'TRY_LATER', 'Please try again in a few minutes.');
    if (response.status === 409) throw new ServiceError(409, 'KEY_CONFLICT', 'Close and reopen the form, then try again.');
    if (response.status !== 201) throw new ServiceError(502, 'SAVE_UNCONFIRMED', 'We couldn’t confirm your request. Please try again.');
    const receipt: unknown = await response.json();
    if (!isTrialReceipt(receipt)) throw new ServiceError(502, 'SAVE_UNCONFIRMED', 'We couldn’t confirm your request. Please try again.');
    return json({ ok: true, status: 'accepted', eventId: receipt.eventId }, 201);
  });
}
