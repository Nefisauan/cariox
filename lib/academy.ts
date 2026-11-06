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

export function receptionistReply(question: string): string {
  const q = question.toLowerCase();
  if (/\b(price|pricing|cost|membership|much)\b/.test(q)) return 'Membership pricing has not been published. The academy will need to confirm current pricing. You can explore the booking preview without making a reservation.';
  if (/\b(kid|kids|child|children|age|ages)\b/.test(q)) return 'Children’s programs and minimum ages are awaiting academy confirmation. No age or enrollment policy is available in this demo.';
  if (/\b(hour|hours|schedule|time|times)\b/.test(q)) return 'The schedule shown here is a sample, not the academy’s operating hours. Open the booking preview to try selecting a date and time.';
  if (/\b(bring|wear|first)\b/.test(q)) return 'As general preparation, bring water and comfortable training clothes. Please confirm clothing, hygiene, and equipment requirements with the academy before attending.';
  if (/\b(book|booking|trial|visit|calendar)\b/.test(q)) return 'Use “Explore booking” below to choose a sample date and time. This preview won’t reserve a class or send a confirmation. A real appointment requires the academy’s live booking service.';
  if (/\b(beginner|beginners|private|program|programs|class|classes)\b/.test(q)) return 'The confirmed program list is coming soon. You can prepare a message about your training interests in the inquiry form. The sample schedule does not confirm that a class is offered.';
  if (/\b(where|address|location|phone|email|contact)\b/.test(q)) return 'The academy’s address and contact information are awaiting confirmation. I won’t guess those details. You can prepare your questions in the inquiry section.';
  return 'I’m the CARIOX demo receptionist. I can explain first-session preparation and the sample booking flow. Ask about pricing, programs, or what to bring. Responses are scripted; live academy details will be added after confirmation.';
}
