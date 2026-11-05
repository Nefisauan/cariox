'use client';

import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';

const interests = [
  { title: 'The first step', tag: 'NEW TO JIU-JITSU', body: 'Curious about Brazilian Jiu-Jitsu? Tell us what brings you to the mat. The academy can help determine the right starting point once its program information is confirmed.' },
  { title: 'The next generation', tag: 'PARENTS & FAMILIES', body: 'Explore an interest in training for your child. Age groups, children’s programs, and enrollment requirements will be published after confirmation.' },
  { title: 'The deeper practice', tag: 'EXPERIENCED PRACTITIONERS', body: 'Interested in advancing your practice, No-Gi, or private instruction? Share your goals through the inquiry form. Offered formats and coaching details are awaiting confirmation.' },
];

export default function ProgramExplorer() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return <div className="program-list">{interests.map((program, index) => <article className={`program-row ${expanded === index ? 'expanded' : ''}`} key={program.title}>
    <button id={`program-toggle-${index}`} type="button" aria-expanded={expanded === index} aria-controls={`program-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}>
      <span className="row-number">0{index + 1}</span>
      <div><small>{program.tag}</small><h3>{program.title}</h3></div>
      <span className="round-icon">{expanded === index ? <Minus /> : <Plus />}</span>
    </button>
    <div id={`program-${index}`} className="program-details" role="region" aria-labelledby={`program-toggle-${index}`} hidden={expanded !== index}>
      <p>{program.body}</p><a href="#contact" className="underlined-link">Share your training goals <ArrowUpRight size={16} /></a>
    </div>
  </article>)}</div>;
}
