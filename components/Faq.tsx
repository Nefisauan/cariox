'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const faqs = [
  {
    q: 'Do I need experience to start?',
    a: 'Most academies welcome absolute beginners. CARIOX has not published a confirmed beginner track yet — share your goals in the inquiry form and we will route you once offerings are confirmed.',
  },
  {
    q: 'What ages can children train?',
    a: 'Children’s age groups and enrollment rules are awaiting academy confirmation. No minimum age is stated on this site.',
  },
  {
    q: 'What should I wear to a first visit?',
    a: 'As general preparation, bring water and comfortable athletic clothes. Confirm gi rental, hygiene, and equipment requirements with the academy before attending.',
  },
  {
    q: 'Can I book a class on this website?',
    a: 'The booking calendar is a browser-memory demo. It validates sample availability and returns a DEMO receipt with live: false. Live scheduling connects after a provider is wired server-side.',
  },
  {
    q: 'Where is the academy and what are your hours?',
    a: 'Address, phone, email, and business hours will appear here only after the owner confirms them. Nothing on this page invents that information.',
  },
  {
    q: 'Is membership pricing listed?',
    a: 'No. Pricing and membership packages have not been published. Ask through the inquiry preview or receptionist demo; live answers require confirmed academy data.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="faq section-pad" aria-labelledby="faq-heading">
      <div className="section-kicker reveal">
        <span>07 / STRAIGHT ANSWERS</span>
        <span>NO INVENTED POLICY.</span>
      </div>
      <div className="section-heading reveal">
        <h2 id="faq-heading">
          Questions
          <br />
          <em>before the mat.</em>
        </h2>
        <p>
          Crown and Wolves Den win trust with specifics. Until CARIOX publishes verified
          details, these answers stay intentionally honest.
        </p>
      </div>
      <div className="faq-list">
        {faqs.map((item, index) => {
          const expanded = open === index;
          return (
            <article key={item.q} className={`faq-row ${expanded ? 'expanded' : ''}`}>
              <button
                type="button"
                id={`faq-toggle-${index}`}
                aria-expanded={expanded}
                aria-controls={`faq-${index}`}
                onClick={() => setOpen(expanded ? null : index)}
              >
                <span>{item.q}</span>
                <span className="round-icon" aria-hidden="true">
                  {expanded ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              <div
                id={`faq-${index}`}
                className="faq-answer"
                role="region"
                aria-labelledby={`faq-toggle-${index}`}
                hidden={!expanded}
              >
                <p>{item.a}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
