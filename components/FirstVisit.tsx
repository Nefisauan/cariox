'use client';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { useState } from 'react';

const questions = [
  { question: 'Do I need experience to explore Jiu-Jitsu?', answer: 'No prior knowledge is needed to learn about the practice. If you’re new, share that with the academy so the team can confirm a suitable introduction before you attend.' },
  { question: 'What should I bring for a first visit?', answer: 'As a general starting point, bring water and comfortable training clothes. Ask the academy to confirm its uniform, equipment, and hygiene requirements before joining a class.' },
  { question: 'Can I ask about training for my child?', answer: 'Absolutely. Use the inquiry form to share your child’s age and your questions. Children’s programs, age groups, and enrollment requirements still need academy confirmation.' },
  { question: 'Where can I find pricing and the real schedule?', answer: 'Confirmed pricing, operating hours, and class times have not yet been supplied. The schedule and calendar on this preview use sample information and should not be used to plan an actual class.' },
  { question: 'Does booking here reserve a real class?', answer: 'This is a booking preview. You can try selecting a date, time, and session, but no reservation, email, or calendar event is created. A real booking will be available once the academy connects its scheduling service.' },
];
export default function FirstVisit({ book }: { book: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return <section id="first-visit" className="first-visit section-pad">
    <div className="section-kicker reveal"><span>06 / BEFORE YOU STEP IN</span><span>A LITTLE CLARITY GOES A LONG WAY.</span></div>
    <div className="first-visit-grid"><div className="reveal"><span className="eyebrow gold-text">YOUR FIRST CHAPTER</span><h2>You don’t need<br />all the answers.<br /><em>Just a first step.</em></h2><p>New room. New people. New possibilities. Here’s a little guidance to make the beginning feel familiar.</p>
      <div className="visit-checks">{['Explore the academy', 'Share your experience and goals', 'Confirm your session before attending'].map(text => <span key={text}><Check size={14} />{text}</span>)}</div>
      <button className="underlined-link" onClick={book}>Explore the booking experience <ArrowUpRight size={16} /></button>
    </div><div className="faq-list">{questions.map((item, index) => <article className="faq-item" key={item.question}><h3><button aria-expanded={open === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} onClick={() => setOpen(open === index ? null : index)}><span>{item.question}</span><Plus size={18} /></button></h3><div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={open !== index}><p>{item.answer}</p></div></article>)}</div></div>
  </section>;
}
