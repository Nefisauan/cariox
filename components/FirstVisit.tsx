'use client';
import { TRIAL_CTA } from '../lib/trial/contract';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { useAcademyContent } from './content/ContentProvider';
import { useState } from 'react';

export default function FirstVisit({ openTrial }: { openTrial: () => void }) {
  const questions = useAcademyContent().faqs;
  const [open, setOpen] = useState<number | null>(0);
  return <section id="first-visit" className="first-visit section-pad">
    <div className="section-kicker reveal"><span>06 / BEFORE YOU STEP IN</span><span>A LITTLE CLARITY GOES A LONG WAY.</span></div>
    <div className="first-visit-grid"><div className="reveal"><span className="eyebrow gold-text">YOUR FIRST CHAPTER</span><h2>You don’t need<br />all the answers.<br /><em>Just a first step.</em></h2><p>New room. New people. New possibilities. Here’s a little guidance to make the beginning feel familiar.</p>
      <div className="visit-checks">{['Explore the academy', 'Share your experience and goals', 'Confirm your session before attending'].map(text => <span key={text}><Check size={14} />{text}</span>)}</div>
      <button className="underlined-link" onClick={openTrial}>{TRIAL_CTA} <ArrowUpRight size={16} /></button>
    </div><div className="faq-list">{questions.map((item, index) => <article className="faq-item" key={item.question}><h3><button aria-expanded={open === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} onClick={() => setOpen(open === index ? null : index)}><span>{item.question}</span><Plus size={18} /></button></h3><div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={open !== index}><p>{item.answer}</p></div></article>)}</div></div>
  </section>;
}
