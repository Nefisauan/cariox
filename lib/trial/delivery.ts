import { emailAddress, type TrialInput } from './input';

export type DeliveryConfig = { apiKey: string; from: string; recipients: string[] };

export function trialDeliveryConfig(env: Record<string, string | undefined>): DeliveryConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.TRIAL_FROM_EMAIL?.trim() ?? '';
  const recipients = env.TRIAL_NOTIFY_EMAILS?.split(',').map(value => value.trim()) ?? [];
  if (!apiKey || !emailAddress.safeParse(from).success || recipients.length !== 2
    || new Set(recipients.map(value => value.toLowerCase())).size !== 2
    || recipients.some(value => !emailAddress.safeParse(value).success)) return null;
  return { apiKey, from, recipients };
}

export async function sendTrialNotification(settings: DeliveryConfig, eventId: string, input: TrialInput, send = fetch) {
  const response = await send('https://api.resend.com/emails', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${settings.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `cariox-trial/${eventId}` },
    body: JSON.stringify({
      from: settings.from, to: settings.recipients, reply_to: input.email,
      subject: 'New CARIOX free trial request',
      text: [
        'A visitor requested a free trial class. Please contact them to coordinate their first class.',
        '', `Full name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`,
        '', 'Areas of interest:', ...input.interests.map(value => `- ${value}`),
        '', `Request reference: ${eventId}`,
      ].join('\n'),
    }),
  });
  if (!response.ok) throw new Error('Email provider did not accept the notification');
  const result: unknown = await response.json();
  const id = result && typeof result === 'object' && 'id' in result ? result.id : undefined;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Email provider did not return a valid notification identifier');
  }
  return id;
}
