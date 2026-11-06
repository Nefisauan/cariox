export type Booking = {session:string;date:string;time:string;name:string;email:string;phone:string};
export interface SchedulingProvider {getAvailability(date:string):Promise<string[]>; submit(booking:Booking):Promise<{reference:string;live:boolean}>}
export function validateBooking(b:Booking):string|null {
 if(!b.session || !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !b.time) return 'Choose a session, date, and time.';
 if(b.name.trim().length<2) return 'Please enter your full name.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return 'Please enter a valid email address.';
 if(b.phone.replace(/\D/g,'').length<7) return 'Please enter a valid phone number.';
 return null;
}
export const demoSchedulingProvider:SchedulingProvider = {
 async getAvailability(date){const day=new Date(date+'T12:00:00').getDay();return day===0?[]:['09:00 AM','12:00 PM','05:30 PM','07:00 PM'];},
 async submit(booking){const error=validateBooking(booking);if(error)throw new Error(error);const slots=await this.getAvailability(booking.date);if(!slots.includes(booking.time))throw new Error('This sample time is unavailable. Choose another time.');return {reference:'DEMO-'+Date.now().toString(36).toUpperCase(),live:false};}
};
export function receptionistReply(question:string):string {
 const q=question.toLowerCase();
 if(/price|cost|membership/.test(q))return 'Membership pricing has not been published. I can help you explore the trial booking demo; the academy will need to confirm current pricing.';
 if(/kid|child|age/.test(q))return 'Children’s programs and minimum ages are awaiting academy confirmation. No age or enrollment policy is available in this demo.';
 if(/address|locat|where|map|phone|email|contact/.test(q))return 'Address, phone, email, and social channels are not published yet. Use the inquiry preview or booking demo; live contact details appear after the owner confirms them.';
 if(/hour|schedule|time/.test(q))return 'The schedule shown here is a sample, not the academy’s operating hours. Open the booking demo to try selecting a date and time.';
 if(/bring|wear|first/.test(q))return 'As general preparation, bring water and comfortable training clothes. Please confirm clothing, hygiene, and equipment requirements with the academy before attending.';
 if(/beginner|private|program|class/.test(q))return 'The confirmed program list is coming soon. You can record your training interests in the inquiry form. The sample schedule does not confirm that a class is offered.';
 if(/review|testimonial|rating/.test(q))return 'Student reviews are not listed yet. This site will not invent testimonials; authentic stories will appear when available.';
 return 'I’m the CARIOX demo receptionist. I can explain this site, first-session preparation, and the sample booking flow. Live academy details and AI responses will be available after integration.';
}
