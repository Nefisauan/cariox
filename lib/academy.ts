import { fallbackContent } from './content/fallback';
import type { AcademyContent } from './content/types';

export type Booking = { session: string; date: string; time: string; name: string; email: string; phone: string };
export interface SchedulingProvider {
  getAvailability(date: string): Promise<string[]>;
  submit(booking: Booking): Promise<{ reference: string; live: boolean }>;
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return localDateKey(date) === value ? date : null;
}

export function validateBooking(booking: Booking, now = new Date()): string | null {
  const date = parseDateKey(booking.date);
  if (!['Introductory session', 'Academy visit'].includes(booking.session) || !date || !booking.time) return 'Choose a session, date, and time.';
  if (booking.date < localDateKey(now)) return 'That date has passed. Please choose today or a future date.';
  if (booking.name.trim().length < 2 || booking.name.trim().length > 100) return 'Please enter your full name (2–100 characters).';
  if (booking.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) return 'Please enter a valid email address.';
  const phone = booking.phone.replace(/\D/g, '');
  if (phone.length < 7 || phone.length > 15 || !/^[\d\s()+.\-]+$/.test(booking.phone)) return 'Please enter a valid phone number.';
  return null;
}

export const demoSchedulingProvider: SchedulingProvider = {
  async getAvailability(value) {
    const date = parseDateKey(value);
    if (!date || value < localDateKey(new Date()) || date.getDay() === 0) return [];
    return ['09:00 AM', '12:00 PM', '05:30 PM', '07:00 PM'];
  },
  async submit(booking) {
    const error = validateBooking(booking);
    if (error) throw new Error(error);
    const slots = await this.getAvailability(booking.date);
    if (!slots.includes(booking.time)) throw new Error('This sample time is unavailable. Choose another time.');
    return { reference: 'DEMO-' + Date.now().toString(36).toUpperCase(), live: false };
  },
};

export function receptionistReply(question: string, content: AcademyContent = fallbackContent): string {
  const q = question.toLowerCase();
  if (/\b(price|pricing|cost|membership|much)\b/.test(q)) return 'Membership pricing has not been published. The academy will need to confirm current pricing. You can explore the booking preview without making a reservation.';
  if (/\b(kid|kids|child|children|age|ages)\b/.test(q)) return content.scheduleConfirmed ? 'Kids’ classes are listed in the published Schedule section. Check each session’s Gi or No-Gi label. Minimum ages and enrollment requirements are awaiting academy confirmation.' : 'Children’s programs and minimum ages are awaiting academy confirmation. No age or enrollment policy is available in this demo.';
  if (/\b(hour|hours|schedule|time|times|gi|nogi|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(q)) return content.scheduleConfirmed ? 'The weekly class schedule is published in the Schedule section. Select a day and program for class times and Gi/No-Gi labels. Times are academy local time. General opening hours and class availability still need academy confirmation; the booking calendar remains a demo.' : 'A confirmed class schedule has not been supplied. The booking calendar is a demonstration and does not confirm real class times or availability.';
  if (/\b(bring|wear|first)\b/.test(q)) return 'As general preparation, bring water and comfortable training clothes. Please confirm clothing, hygiene, and equipment requirements with the academy before attending.';
  if (/\b(book|booking|trial|visit|calendar)\b/.test(q)) return 'Use “Explore booking” below to choose a sample date and time. This preview won’t reserve a class or send a confirmation. A real appointment requires the academy’s live booking service.';
  if (/\b(beginner|beginners|private|program|programs|class|classes)\b/.test(q)) return content.scheduleConfirmed ? `The published schedule lists ${[...new Set(content.schedules.map(item => item.name))].join(', ')}. Ask the academy which session suits your experience. A listing is not a reservation.` : 'The confirmed program list is coming soon. You can prepare a message about your training interests in the inquiry form.';
  if (/\b(where|address|location|phone|email|contact)\b/.test(q)) return 'The academy’s address and contact information are awaiting confirmation. I won’t guess those details. You can prepare your questions in the inquiry section.';
  return 'I’m the CARIOX demo receptionist. I can point you to the class schedule and explain first-session preparation and the sample booking flow. Responses are scripted; reservations require a connected booking service.';
}
