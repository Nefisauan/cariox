'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import DepthSurface from '../DepthSurface';
import { useAcademyContent } from './ContentProvider';
import { ContentHeading } from './ContentHeading';
import BrandLogo from '../BrandLogo';

const placements = { 1: '1st', 2: '2nd', 3: '3rd' } as const;

export default function InstructorSection() {
  const { homepage, branding, instructors } = useAcademyContent();
  return <section id="instructors" className="instructors section-pad">
    <div className="section-kicker reveal"><span>04 / THE PEOPLE BEHIND THE PRACTICE</span><span>{branding.affiliation}</span></div>
    {instructors.map((person, index) => <article className="instructors-grid instructor-profile" key={person.id} aria-labelledby={`instructor-${index}`}>
      <DepthSurface className="instructor-portrait reveal" strength={5}>
        <figure>
          <Image src={person.photoUrl} alt={person.photoAlt} width={1320} height={1615} sizes="(max-width: 600px) 90vw, 44vw" />
          <figcaption>
            {/* Keep the decorative logo out of the caption’s accessible name. */}
            <span className="instructor-brand" aria-hidden="true"><BrandLogo src={branding.logoUrl} decorative /></span>
            <span>{branding.affiliation}</span>
          </figcaption>
        </figure>
      </DepthSurface>
      <div className="instructor-details reveal">
        {index === 0 && <><span className="eyebrow muted-text">HUMAN CONNECTION. SHARED PROGRESS.</span><ContentHeading title={homepage.team.title} accent={homepage.team.accent} /><p className="instructor-intro">{homepage.team.body}</p></>}
        <header className="instructor-identity"><h3 id={`instructor-${index}`}>{person.name || 'Your instructor'}</h3><p>{person.rank}{person.experience ? ` · ${person.experience}` : ''}</p></header>
        {person.biography && <p className="instructor-biography">{person.biography}</p>}
        {person.specialties.length > 0 && <p className="instructor-specialties">{person.specialties.join(' · ')}</p>}
        {person.achievements.length > 0 && <div className="competition-record">
          <h4>Competition highlights</h4>
          <ul aria-label={`${person.name || 'Instructor'} competition results`}>{person.achievements.map((achievement, resultIndex) => <li key={`${achievement.event}-${resultIndex}`}>
            <span className={`competition-placement place-${achievement.placement}`}>{placements[achievement.placement as keyof typeof placements]}<span className="sr-only"> place</span></span>
            <span>{achievement.event}</span>
          </li>)}</ul>
        </div>}
        <a href="#contact" className="underlined-link">Ask about training <ArrowUpRight size={16} /></a>
      </div>
    </article>)}
  </section>;
}
