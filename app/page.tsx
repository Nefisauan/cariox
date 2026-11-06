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
import { photos, photoPath } from '../lib/gallery';

const Booking = dynamic(() => import('../components/Booking'), { ssr: false });
const sampleClasses = [
  { day: 'Mon', time: '09:00', period: 'AM', name: 'Foundations', type: 'Foundations', level: 'Beginner' },
  { day: 'Mon', time: '05:30', period: 'PM', name: 'Gi practice', type: 'Gi', level: 'All levels' },
  { day: 'Tue', time: '12:00', period: 'PM', name: 'No-Gi practice', type: 'No-Gi', level: 'All levels' },
  { day: 'Wed', time: '05:30', period: 'PM', name: 'Foundations', type: 'Foundations', level: 'Beginner' },
  { day: 'Thu', time: '07:00', period: 'PM', name: 'Gi practice', type: 'Gi', level: 'Experienced' },
  { day: 'Fri', time: '12:00', period: 'PM', name: 'No-Gi practice', type: 'No-Gi', level: 'All levels' },
  { day: 'Sat', time: '09:00', period: 'AM', name: 'Gi practice', type: 'Gi', level: 'All levels' },
];
const days = [{ label: 'Mon', full: 'Monday' }, { label: 'Tue', full: 'Tuesday' }, { label: 'Wed', full: 'Wednesday' }, { label: 'Thu', full: 'Thursday' }, { label: 'Fri', full: 'Friday' }, { label: 'Sat', full: 'Saturday' }, { label: 'Sun', full: 'Sunday' }];

export default function Home() {
  const [booking, setBooking] = useState(false);
  const [gallery, setGallery] = useState<number | null>(null);
  const [day, setDay] = useState('Mon');
  const [filter, setFilter] = useState('All programs');
  const hero = useRef<HTMLElement>(null);
  usePageMotion();
  const book = () => setBooking(true);
  const classes = sampleClasses.filter(item => item.day === day && (filter === 'All programs' || filter === item.type));
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation book={book} />
    <main id="main">
      <section id="home" className="hero" ref={hero} onPointerMove={event => {
        if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        hero.current?.style.setProperty('--mx', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`);
        hero.current?.style.setProperty('--my', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
      }} onPointerLeave={() => { hero.current?.style.setProperty('--mx', '0px'); hero.current?.style.setProperty('--my', '0px'); }}>
        <div className="hero-image"><Image src={photoPath(0)} alt="CARIOX academy concept with open mats, Brazilian wall graphics, and warm architectural lighting" fill priority sizes="100vw" /></div>
        <div className="hero-shade" />
        <div className="hero-topline"><span><i /> BRAZILIAN ROOTS. LIMITLESS POTENTIAL.</span><span>THE ART OF BECOMING.</span></div>
        <div className="hero-content"><p className="eyebrow">BRAZILIAN JIU-JITSU · SALOMÃO BJJ TEAM</p><h1><span>MORE THAN</span><span>A MARTIAL ART.</span><em>A WAY FORWARD.</em></h1><div className="hero-bottom"><p>Find your strength. Build your confidence.<br />Become more, on and off the mat.</p><div className="hero-ctas"><button className="button gold" onClick={book}>Plan your first visit <ArrowUpRight size={18} /></button><a href="#gallery" className="hero-secondary">Explore the academy <ArrowRight size={15} /></a></div></div></div>
        <DepthSurface className="hero-story" strength={8}><button onClick={() => setGallery(3)} aria-label="Explore the CARIOX lounge"><div className="hero-story-image"><Image src={photoPath(3)} alt="A warm welcome in the CARIOX lounge" width={400} height={310} sizes="260px" /></div><span><small>YOUR PEOPLE. YOUR PLACE.</small>Make yourself at home. <ArrowUpRight size={18} /></span></button></DepthSurface>
        <div className="hero-foot"><a href="#about"><span className="scroll-circle"><ArrowDown size={16} /></span> THE JOURNEY STARTS HERE</a><span>DISCIPLINE / CONNECTION / EVOLUTION</span><span className="hero-preview">ACADEMY PREVIEW</span></div>
      </section>
      <div className="principles" aria-label="Our values"><span>BRAZILIAN SOUL.</span><span className="asterisk" aria-hidden="true">✳</span><span>UNIVERSAL LANGUAGE.</span><span className="asterisk" aria-hidden="true">✳</span><span>ONE TEAM.</span><span className="asterisk" aria-hidden="true">✳</span><span>CARIOX.</span></div>

      <section id="about" className="about section-pad"><div className="section-kicker reveal"><span>01 / THE PHILOSOPHY</span><span>A PRACTICE. A PEOPLE. A PURPOSE.</span></div><div className="about-grid"><div className="reveal"><span className="eyebrow muted-text">ROOTED IN SOMETHING REAL</span><h2>Leave your ego.<br />Bring your <em>everything.</em></h2><div className="about-copy"><span className="little-cross" aria-hidden="true">✳</span><div><p className="lead">Jiu-Jitsu begins with a simple decision: to show up. To be a beginner. To discover what you’re capable of.</p><p>CARIOX brings Brazilian martial arts into a space made for connection. Rooted in the Salomão BJJ Team identity, our vision is built around respect, intentional practice, and the belief that we grow together.</p><a className="underlined-link" href="#programs">Find your way onto the mat <ArrowUpRight size={17} /></a></div></div></div><DepthSurface className="about-image reveal"><Image src={photoPath(1)} alt="CARIOX welcome desk with natural wood, plants, and branded apparel" width={1448} height={1086} sizes="(max-width: 850px) 90vw, 44vw" /><span className="image-tag">BRAZILIAN IN SPIRIT. CARIOX BY NATURE.</span><div className="image-corner" aria-hidden="true">C<span>✳</span></div></DepthSurface></div>
        <div className="philosophy-notes reveal">{[{ title: 'Show up with curiosity.', text: 'Leave room to learn something new.' }, { title: 'Grow with intention.', text: 'Give the small improvements your attention.' }, { title: 'Move forward together.', text: 'Respect the people who share your journey.' }].map((item, index) => <div key={item.title}><small>0{index + 1}</small><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
      </section>

      <section id="programs" className="programs section-pad"><div className="section-kicker reveal"><span>02 / YOUR PRACTICE</span><span>EVERY JOURNEY HAS A FIRST STEP.</span></div><div className="section-heading reveal"><h2>Different paths.<br /><em>One pursuit.</em></h2><p>Finding your feet or finding your edge?<br />Start with what moves you.</p></div><p className="availability-note"><span className="status-dot" /> EXPLORE YOUR INTERESTS · PROGRAMS AWAIT CONFIRMATION</p><ProgramExplorer /></section>
      <GalleryShowcase open={setGallery} />

      <section id="instructors" className="instructors section-pad"><div className="section-kicker reveal"><span>04 / THE PEOPLE BEHIND THE PRACTICE</span><span>SALOMÃO BJJ TEAM</span></div><div className="instructors-grid"><DepthSurface className="team-mark reveal"><span>RESPECT THE ROOTS.</span><strong>CARI<span>OX</span></strong><div className="belt" aria-hidden="true"><i /><i /><i /><i /></div><small>BRAZILIAN MARTIAL ARTS<br />SALOMÃO BJJ TEAM</small><span className="team-coordinate">THE JOURNEY IS SHARED.</span></DepthSurface><div className="reveal"><span className="eyebrow muted-text">HUMAN CONNECTION. SHARED PROGRESS.</span><h2>Good technique.<br /><em>Great people.</em></h2><p>Behind every meaningful practice is a human connection. Meet the people who will guide the next chapter of CARIOX.</p><div className="coming-soon"><span className="status-dot" /><div><b>The team’s story is coming.</b><p>Instructor introductions, verified belt ranks, and biographies will be added once supplied by the academy.</p></div></div><a href="#contact" className="underlined-link">Ask about the team <ArrowUpRight size={16} /></a></div></div></section>

      <section id="schedule" className="schedule section-pad"><div className="section-kicker reveal"><span>05 / MAKE TIME FOR YOURSELF</span><span>CONSISTENCY CHANGES EVERYTHING.</span></div><div className="section-heading reveal"><h2>A little discipline.<br /><em>A different day.</em></h2><button className="button dark" onClick={book}>Explore your first session <ArrowUpRight size={16} /></button></div><div className="schedule-notice"><span className="status-dot" /><div><b>Explore a sample week.</b><p>Classes, coaches, levels, and times are illustrative. Confirmed academy classes will replace this preview.</p></div></div><div className="schedule-toolbar"><div className="days" aria-label="Filter by day">{days.map(item => <button key={item.label} onClick={() => setDay(item.label)} className={day === item.label ? 'active' : ''} aria-label={item.full} aria-pressed={day === item.label}>{item.label}</button>)}</div><select aria-label="Filter by program" value={filter} onChange={event => setFilter(event.target.value)}>{['All programs', 'Foundations', 'Gi', 'No-Gi'].map(label => <option key={label}>{label}</option>)}</select></div><div className="schedule-results" aria-live="polite">{classes.map((item, index) => <div className="class-row" key={`${day}-${index}`}><div className="class-time">{item.time}<small>{item.period}</small></div><div className="class-title"><h3>{item.name}</h3><span>Sample class · Coach to be confirmed</span></div><span className="level-tag">{item.level}</span><button className="icon-button" onClick={book} aria-label={`Explore sample ${item.name} booking`}><ArrowUpRight size={20} /></button></div>)}{!classes.length && <div className="empty-schedule"><span className="eyebrow">ROOM TO RESET</span><h3>A little space in your week.</h3><p>No sample classes match this day and filter.</p><button className="underlined-link" onClick={() => { setDay('Mon'); setFilter('All programs'); }}>View the sample week <ArrowRight size={16} /></button></div>}</div><p className="schedule-footer">This is a preview of the scheduling experience.<span>ALL TIMES ARE SAMPLE TIMES</span></p></section>

      <section className="culture section-pad"><span className="eyebrow reveal">MORE THAN A PLACE TO TRAIN.</span><h2 className="reveal">A place to<br /><em>belong.</em><span aria-hidden="true">✳</span></h2><div className="culture-bottom reveal"><p>The small conversations. The shared progress.<br />The people who keep you coming back.<br />That’s the culture we’re building.</p><div><span>THE CARIOX PHILOSOPHY</span><p>Progress is personal.<br />The journey is shared.</p></div></div></section>
      <section className="photo-strip" aria-label="Academy photo gallery">{[3, 1, 4].map(index => <DepthSurface key={index} className="photo-card"><button onClick={() => setGallery(index)} aria-label={`View ${photos[index].title}`}><Image src={photoPath(index)} width={700} height={600} alt={photos[index].description} sizes="(max-width:600px) 82vw, 33vw" /><span>{photos[index].label}<Expand size={17} /></span></button></DepthSurface>)}</section>
      <FirstVisit book={book} />

      <section id="contact" className="contact section-pad"><div className="section-kicker reveal"><span>07 / LET’S BEGIN</span><span>THE HARDEST PART IS SHOWING UP.</span></div><div className="contact-grid"><div className="reveal"><span className="eyebrow muted-text">THERE’S A PLACE FOR YOUR QUESTIONS</span><h2>Your next chapter.<br /><em>Starts here.</em></h2><p>A question, a goal, a little curiosity. Tell us what you’re looking for, or explore what your first visit could look like.</p><button className="button gold" onClick={book}>Plan your first visit <ArrowUpRight size={17} /></button><div className="contact-details"><b>COME FIND YOUR PEOPLE.</b><p>The academy’s address, phone, email, and social channels will appear here once confirmed.</p><a href="#first-visit">First-visit questions, answered <ArrowUpRight size={15} /></a></div></div><ContactForm /></div></section>
      <section className="final-cta"><span>ONE DECISION. ENDLESS POSSIBILITY.</span><button onClick={book}>STEP ONTO<br />THE <em>MAT.</em><MoveUpRight aria-hidden="true" /></button><div className="final-cta-foot"><span>DISCIPLINE STARTS WITH A DECISION.</span><span>MAKE YOURS.</span></div></section>
    </main>
    <footer><div className="footer-top"><a className="logo" href="#home" aria-label="CARIOX home"><Wordmark /></a><p>Brazilian roots.<br />A stronger tomorrow.</p><a href="#home">Back to the top <ArrowUpRight size={16} /></a></div><nav className="footer-links" aria-label="Footer navigation"><a href="#about">The academy</a><a href="#programs">Your practice</a><a href="#schedule">Schedule preview</a><a href="#first-visit">First visit & FAQ</a><a href="#contact">Get in touch</a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} CARIOX · SALOMÃO BJJ TEAM</span><span>ACADEMY PREVIEW · BOOKINGS & CHAT ARE DEMOS</span><span>BUILT WITH PURPOSE. OSS.</span></div></footer>
    <div className="mobile-visit-bar"><span>YOUR NEXT CHAPTER.</span><button onClick={book}>Plan your first visit <ArrowUpRight size={17} /></button></div>
    <Receptionist book={book} />
    {booking && <Booking close={() => setBooking(false)} />}
    {gallery !== null && <GalleryDialog index={gallery} close={() => setGallery(null)} change={setGallery} />}
  </>;
}
