'use client';

import { ArrowUpRight, CalendarDays, MessageSquareText, Sparkles } from 'lucide-react';

const steps = [
  {
    n: '01',
    title: 'Choose your interest',
    body: 'Browse beginner, family, or experienced paths. Confirmed class offerings will replace these interests once the academy publishes them.',
    href: '#programs',
    cta: 'Explore programs',
    icon: Sparkles,
  },
  {
    n: '02',
    title: 'Try the booking demo',
    body: 'Walk through a sample calendar and demo receipt. No reservation, email, or calendar event is created in this preview.',
    href: '#schedule',
    cta: 'See sample schedule',
    icon: CalendarDays,
  },
  {
    n: '03',
    title: 'Leave a real question',
    body: 'Preview an inquiry or chat with the scripted receptionist. Live mail, CRM, and AI answers connect after owner review.',
    href: '#contact',
    cta: 'Open contact',
    icon: MessageSquareText,
  },
];

export default function StartPath({ book }: { book: () => void }) {
  return (
    <section id="start" className="start-path section-pad" aria-labelledby="start-heading">
      <div className="section-kicker reveal">
        <span>00 / HOW TO BEGIN</span>
        <span>CLEAR PATH. HONEST DEMO.</span>
      </div>
      <div className="section-heading reveal">
        <h2 id="start-heading">
          Three steps.
          <br />
          <em>Zero pressure.</em>
        </h2>
        <p>
          Competitors bury the first visit behind forms and claims. Here the path is
          visible — and clearly labeled until live booking is connected.
        </p>
      </div>
      <ol className="start-steps">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.n} className="start-step reveal">
              <div className="start-step-top">
                <span className="start-num">{step.n}</span>
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <a className="underlined-link" href={step.href}>
                {step.cta} <ArrowUpRight size={16} />
              </a>
            </li>
          );
        })}
      </ol>
      <div className="start-cta reveal">
        <button className="button gold" type="button" onClick={book}>
          Open booking demo <ArrowUpRight size={17} />
        </button>
        <span className="demo-chip">Demo only · no live reservation</span>
      </div>
    </section>
  );
}
