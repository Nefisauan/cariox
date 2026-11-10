'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, Expand, MoveUpRight } from 'lucide-react';
import Navigation, { Wordmark } from '../components/Navigation';
import Receptionist from '../components/Receptionist';
import DepthSurface from '../components/DepthSurface';
import ProgramExplorer from '../components/ProgramExplorer';
import GalleryShowcase from '../components/GalleryShowcase';
import GalleryDialog from '../components/GalleryDialog';
import ContactForm from '../components/ContactForm';
import FirstVisit from '../components/FirstVisit';
import usePageMotion from '../components/usePageMotion';
import { useAcademyContent } from './content/ContentProvider';
import { ContentHeading, ContentLines } from './content/ContentHeading';
import { BusinessContact } from './content/BusinessContact';
import MembershipPricing from './content/MembershipPricing';
import InstructorSection from './content/InstructorSection';
import ClassSchedule from './content/ClassSchedule';
import BrandLogo from './BrandLogo';
import { TRIAL_CTA } from '../lib/trial/contract';

const TrialDialog = dynamic(() => import('./TrialDialog'), { ssr: false });

export default function Home({ trialAvailable }: { trialAvailable: boolean }) {
  const content = useAcademyContent();
  const { homepage, photos } = content;
  const photoPath = (index: number) => photos[index].url;
  const [trial, setTrial] = useState(false);
  const [gallery, setGallery] = useState<number | null>(null);
  const hero = useRef<HTMLElement>(null);
  usePageMotion();
  function openTrial() {
    if (homepage.bookingUrl) window.location.assign(homepage.bookingUrl);
    else setTrial(true);
  }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation openTrial={openTrial} />
    <main id="main">
      {content.announcements.map(item => <aside key={item.id} className="schedule-notice" aria-label="Academy announcement"><div><b>{item.title}</b><p>{item.body}</p>{item.link && <a href={item.link} target="_blank" rel="noopener noreferrer">Learn more</a>}</div></aside>)}
      <section id="home" className="hero" ref={hero} onPointerMove={event => {
        if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        hero.current?.style.setProperty('--mx', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`);
        hero.current?.style.setProperty('--my', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
      }} onPointerLeave={() => { hero.current?.style.setProperty('--mx', '0px'); hero.current?.style.setProperty('--my', '0px'); }}>
        <div className="hero-image"><Image src={photoPath(0)} alt={photos[0].alt} fill priority sizes="100vw" /></div>
        <div className="hero-shade" />
        <div className="hero-topline"><span><i /> BRAZILIAN ROOTS. LIMITLESS POTENTIAL.</span><span>THE ART OF BECOMING.</span></div>
        <div className="hero-content"><p className="eyebrow">{homepage.heroEyebrow}</p><h1><span>{homepage.heroTitle[0]}</span><span>{homepage.heroTitle[1]}</span><em>{homepage.heroTitle[2]}</em></h1><div className="hero-bottom"><p><ContentLines text={homepage.heroDescription} /></p><div className="hero-ctas"><button className="button gold" onClick={openTrial}>{TRIAL_CTA} <ArrowUpRight size={18} /></button><a href="#gallery" className="hero-secondary">{homepage.secondaryCta} <ArrowRight size={15} /></a></div></div></div>
        <DepthSurface className="hero-story" strength={8}><button onClick={() => setGallery(3)} aria-label="Explore the CARIOX lounge"><div className="hero-story-image"><Image src={photoPath(3)} alt={photos[3].alt} width={400} height={310} sizes="260px" /></div><span><small>YOUR PEOPLE. YOUR PLACE.</small>Make yourself at home. <ArrowUpRight size={18} /></span></button></DepthSurface>
        <div className="hero-foot"><a href="#about"><span className="scroll-circle"><ArrowDown size={16} /></span> THE JOURNEY STARTS HERE</a><span>DISCIPLINE / CONNECTION / EVOLUTION</span><span className="hero-preview">ACADEMY PREVIEW</span></div>
      </section>
      <div className="principles" aria-label="Our values"><span>BRAZILIAN SOUL.</span><span className="asterisk" aria-hidden="true"></span><span>UNIVERSAL LANGUAGE.</span><span className="asterisk" aria-hidden="true"></span><span>ONE TEAM.</span><span className="asterisk" aria-hidden="true"></span><span>CARIOX.</span></div>

      <section id="about" className="about section-pad"><div className="section-kicker reveal"><span>01 / THE PHILOSOPHY</span><span>A PRACTICE. A PEOPLE. A PURPOSE.</span></div><div className="about-grid"><div className="reveal"><span className="eyebrow muted-text">{homepage.about.eyebrow}</span><ContentHeading title={homepage.about.title} accent={homepage.about.accent} prefix={homepage.about.accentPrefix} /><div className="about-copy"><span className="little-cross" aria-hidden="true"></span><div><p className="lead">{homepage.about.lead}</p><p>{homepage.about.body}</p><a className="underlined-link" href="#programs">Find your way onto the mat <ArrowUpRight size={17} /></a></div></div></div><DepthSurface className="about-image reveal"><Image src={photoPath(1)} alt={photos[1].alt} width={1448} height={1086} sizes="(max-width: 850px) 90vw, 44vw" /><span className="image-tag">{homepage.about.imageCaption}</span><div className="image-corner" aria-hidden="true"><BrandLogo src={content.branding.logoUrl} decorative /></div></DepthSurface></div>
        <div className="philosophy-notes reveal">{[{ title: 'Show up with curiosity.', text: 'Leave room to learn something new.' }, { title: 'Grow with intention.', text: 'Give the small improvements your attention.' }, { title: 'Move forward together.', text: 'Respect the people who share your journey.' }].map((item, index) => <div key={item.title}><small>0{index + 1}</small><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
      </section>

      <section id="programs" className="programs section-pad"><div className="section-kicker reveal"><span>02 / YOUR PRACTICE</span><span>EVERY JOURNEY HAS A FIRST STEP.</span></div><div className="section-heading reveal"><ContentHeading title={homepage.programs.title} accent={homepage.programs.accent} /><p><ContentLines text={homepage.programs.description} /></p></div><p className="availability-note"><span className="status-dot" /> {content.programsConfirmed ? 'ACADEMY PROGRAMS · OWNER APPROVED' : 'EXPLORE YOUR INTERESTS · PROGRAMS AWAIT CONFIRMATION'}</p><ProgramExplorer /></section>
      <GalleryShowcase open={setGallery} />

      <InstructorSection />

      <ClassSchedule />

      <MembershipPricing prices={content.prices} />
      <section className="culture section-pad"><span className="eyebrow reveal">{homepage.culture.eyebrow}</span><h2 className="reveal">{homepage.culture.title}<br /><em>{homepage.culture.accent}</em><span aria-hidden="true"></span></h2><div className="culture-bottom reveal"><p><ContentLines text={homepage.culture.body} /></p><div><span>THE CARIOX PHILOSOPHY</span><p><ContentLines text={homepage.culture.quote} /></p></div></div></section>
      <section className="photo-strip" aria-label="Academy photo gallery">{[3, 1, 4].map(index => <DepthSurface key={index} className="photo-card"><button onClick={() => setGallery(index)} aria-label={`View ${photos[index].title}`}><Image src={photoPath(index)} width={700} height={600} alt={photos[index].alt} sizes="(max-width:600px) 82vw, 33vw" /><span>{photos[index].label}<Expand size={17} /></span></button></DepthSurface>)}</section>
      <FirstVisit openTrial={openTrial} />

      <section id="contact" className="contact section-pad"><div className="section-kicker reveal"><span>07 / LET’S BEGIN</span><span>THE HARDEST PART IS SHOWING UP.</span></div><div className="contact-grid"><div className="reveal"><span className="eyebrow muted-text">{homepage.contact.eyebrow}</span><ContentHeading title={homepage.contact.title} accent={homepage.contact.accent} /><p>{homepage.contact.body}</p><button className="button gold" onClick={openTrial}>{TRIAL_CTA} <ArrowUpRight size={17} /></button><BusinessContact business={content.business} /></div><ContactForm /></div></section>
      <section className="final-cta"><span>ONE DECISION. ENDLESS POSSIBILITY.</span><button onClick={openTrial}>STEP ONTO<br />THE <em>MAT.</em><MoveUpRight aria-hidden="true" /></button><div className="final-cta-foot"><span>DISCIPLINE STARTS WITH A DECISION.</span><span>MAKE YOURS.</span></div></section>
    </main>
    <footer><div className="footer-top"><a className="logo" href="#home" aria-label="CARIOX home"><Wordmark /></a><p>Brazilian roots.<br />A stronger tomorrow.</p><a href="#home">Back to the top <ArrowUpRight size={16} /></a></div><nav className="footer-links" aria-label="Footer navigation"><a href="#about">The academy</a><a href="#programs">Your practice</a><a href="#schedule">Class schedule</a><a href="#first-visit">First visit & FAQ</a><a href="#contact">Get in touch</a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} {content.branding.wordmarkLeft}{content.branding.wordmarkRight} · {content.branding.affiliation}</span><span>FREE TRIALS BY ARRANGEMENT</span><span>BUILT WITH PURPOSE. OSS.</span></div></footer>
    <div className="mobile-visit-bar"><span>YOUR NEXT CHAPTER.</span><button onClick={openTrial}>{TRIAL_CTA} <ArrowUpRight size={17} /></button></div>
    <Receptionist openTrial={openTrial} />
    {trial && <TrialDialog available={trialAvailable} close={() => setTrial(false)} />}
    {gallery !== null && <GalleryDialog index={gallery} close={() => setGallery(null)} change={setGallery} />}
  </>;
}
