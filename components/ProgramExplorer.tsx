'use client';

import { useState } from 'react';
import { useAcademyContent } from './content/ContentProvider';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';

export default function ProgramExplorer() {
  const interests = useAcademyContent().programs;
  const [expanded, setExpanded] = useState<number | null>(null);
  return <div className="program-list">{interests.map((program, index) => <article className={`program-row ${expanded === index ? 'expanded' : ''}`} key={program.title}>
    <h3 className="program-heading"><button id={`program-toggle-${index}`} type="button" aria-expanded={expanded === index} aria-controls={`program-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}>
      <span className="row-number">0{index + 1}</span>
      <span className="program-copy"><small>{program.tag}</small><span className="program-title">{program.title}</span></span>
      <span className="round-icon">{expanded === index ? <Minus /> : <Plus />}</span>
    </button></h3>
    <div id={`program-${index}`} className="program-details" role="region" aria-labelledby={`program-toggle-${index}`} hidden={expanded !== index}>
      <p>{program.body}</p><a href="#contact" className="underlined-link">Share your training goals <ArrowUpRight size={16} /></a>
    </div>
  </article>)}</div>;
}
