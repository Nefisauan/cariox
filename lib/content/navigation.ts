import { z } from 'zod';
import { TRIAL_CTA } from '../trial/contract';

const sections = ['home', 'about', 'programs', 'instructors', 'schedule', 'gallery', 'first-visit', 'contact'];
export const navigationDestination = z.string().trim().refine(value => {
  if (value.startsWith('#')) return sections.includes(value.slice(1));
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}, 'Use an existing section anchor or a public HTTPS URL');

export const navigationSchema = z.object({
  links: z.array(z.object({ label: z.string().trim().min(1).max(24), href: navigationDestination }))
    .min(1).max(6).refine(links => new Set(links.map(link => link.href)).size === links.length),
  buttonText: z.string().trim().min(1).max(60),
  buttonShortText: z.string().trim().min(1).max(24),
  buttonUrl: navigationDestination.optional(),
});
export type NavigationContent = z.infer<typeof navigationSchema>;

export const defaultNavigation: NavigationContent = {
  links: [
    { label: 'About', href: '#about' },
    { label: 'Programs', href: '#programs' },
    { label: 'Instructors', href: '#instructors' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ],
  buttonText: TRIAL_CTA,
  buttonShortText: 'Free Trial Class',
};
