export const TRIAL_CTA = 'Schedule Your Free Trial Class';
export const TRIAL_BOOKING_GUIDANCE = `Select “${TRIAL_CTA}” to choose a class and an available time. The booking page will confirm your reservation.`;
export const TRIAL_INTERESTS = [
  'Brazilian Jiu-Jitsu', 'Self-Defense', 'Muay Thai', 'Kids Classes', "Women's Only Classes",
] as const;
export type TrialInterest = typeof TRIAL_INTERESTS[number];
export type TrialPreference = { date: string; className: string; time: string };
export type TrialReceipt = { ok: true; status: 'accepted'; eventId: string };
export function isTrialReceipt(value: unknown): value is TrialReceipt {
  if (!value || typeof value !== 'object') return false;
  const receipt = value as Record<string, unknown>;
  return receipt.ok === true && receipt.status === 'accepted' && typeof receipt.eventId === 'string'
    && /^trial-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(receipt.eventId);
}
