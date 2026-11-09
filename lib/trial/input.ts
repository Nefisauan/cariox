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
  website: z.literal('').optional(),
});
export type TrialInput = z.infer<typeof trialInput>;
