import { z } from 'zod';
import { TRIAL_INTERESTS } from './contract';

export const emailAddress = z.email().max(254);
export const trialInput = z.strictObject({
  name: z.string().trim().min(2).max(100).regex(/^[^\p{Cc}\p{Cf}]+$/u),
  email: z.string().trim().pipe(emailAddress),
  phone: z.string().trim().max(30).regex(/^[\d\s()+.-]+$/)
    .refine(value => /^\d{7,15}$/.test(value.replace(/\D/g, '')) && !/[\r\n]/.test(value)),
  interests: z.array(z.enum(TRIAL_INTERESTS)).min(1).max(TRIAL_INTERESTS.length)
    .refine(values => values.length === new Set(values).size)
    .transform(values => TRIAL_INTERESTS.filter(value => values.includes(value))),
  preferredTime: z.strictObject({
    date: z.iso.date(),
    className: z.string().trim().min(1).max(200).regex(/^[^\p{Cc}\p{Cf}]+$/u),
    time: z.string().regex(/^(?:[1-9]|1[0-2]):[0-5][0-9] (?:AM|PM)$/),
  }).optional(),
  website: z.literal('').optional(),
});
export type TrialInput = z.infer<typeof trialInput>;
