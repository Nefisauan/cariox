'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  MoveUpRight,
  Expand,
  Check,
  ShieldCheck,
  EyeOff,
  CalendarClock,
} from 'lucide-react';
import Receptionist from '@/components/Receptionist';
import DepthSurface from '@/components/DepthSurface';
import ProgramExplorer from '@/components/ProgramExplorer';
import GalleryShowcase from '@/components/GalleryShowcase';
import GalleryDialog from '@/components/GalleryDialog';
import StartPath from '@/components/StartPath';
import Faq from '@/components/Faq';
import usePageMotion from '@/components/usePageMotion';
import { photos, photoPath } from '@/lib/gallery';

const Booking = dynamic(() => import('@/components/Booking'), { ssr: false });

const sampleClasses = [
  { day: 'Mon', time: '09:00', period: 'AM', name: 'Foundations', type: 'Foundations', level: 'Beginner' },
  { day: 'Mon', time: '05:30', period: 'PM', name: 'Gi practice', type: 'Gi', level: 'All levels' },
  { day: 'Tue', time: '12:00', period: 'PM', name: 'No-Gi practice', type: 'No-Gi', level: 'All levels' },
  { day: 'Wed', time: '05:30', period: 'PM', name: 'Foundations', type: 'Foundations', level: 'Beginner' },
  { day: 'Thu', time: '07:00', period: 'PM', name: 'Gi practice', type: 'Gi', level: 'Experienced' },
  { day: 'Fri', time: '12:00', period: 'PM', name: 'No-Gi practice', type: 'No-Gi', level: 'All levels' },
  { day: 'Sat', time: '09:00', period: 'AM', name: 'Gi practice', type: 'Gi', level: 'All levels' },
];

export default function Home() {
  const [booking, setBooking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [gallery, setGallery] = useState<number | null>(null);
  const [day, setDay] = useState('Mon');
  const [filter, setFilter] = useState('All programs');
  const [sent, setSent] = useState(false);
  const hero = useRef<HTMLElement>(null);
  usePageMotion();

  const nav = ['About', 'Programs', 'Schedule', 'Gallery', 'FAQ', 'Contact'];
  const book = () => {
    setBooking(true);
    setMenu(false);
  };

  const filtered = sampleClasses.filter(
    (c) => c.day === day && (filter === 'All programs' || filter === c.type),
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="preview-banner" role="status">
        <span>Academy website preview</span>
        <span>Bookings, chat, and inquiry are demos · SEO indexing off until verified business info</span>
      </div>

      <header className="site-header">
        <a href="#home" className="logo" aria-label="CARIOX home">
          CARI<span>OX</span>
          <small>BRAZILIAN MARTIAL ARTS</small>
        </a>
        <nav aria-label="Main navigation" className={menu ? 'nav open' : 'nav'}>
          <a href="#home" className="mobile-home" onClick={() => setMenu(false)}>
            Home
          </a>
          {nav.map((n) => (
            <a href={'#' + n.toLowerCase()} key={n} onClick={() => setMenu(false)}>
              {n}
            </a>
          ))}
          <button className="nav-book mobile-only" type="button" onClick={book}>
            Book a trial <ArrowUpRight size={16} />
          </button>
        </nav>
        <button className="header-cta" type="button" onClick={book}>
          Book a trial <ArrowUpRight size={16} />
        </button>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menu}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      <main id="main">
        <section
          id="home"
          className="hero"
          ref={hero}
          onPointerMove={(e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            hero.current?.style.setProperty('--mx', `${(e.clientX / window.innerWidth - 0.5) * 10}px`);
            hero.current?.style.setProperty('--my', `${(e.clientY / window.innerHeight - 0.5) * 8}px`);
          }}
          onPointerLeave={() => {
            hero.current?.style.setProperty('--mx', '0px');
            hero.current?.style.setProperty('--my', '0px');
          }}
        >
          <div className="hero-image">
            <Image
              src={photoPath(0)}
              alt="CARIOX academy concept with expansive mats, Brazilian wall graphics, and warm architectural lighting"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="hero-atmosphere" aria-hidden="true" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="brand-mark">
              CARI<span>OX</span>
            </p>
            <p className="brand-sub">Brazilian Martial Arts · Salomão BJJ Team</p>
            <h1>
              More than a martial art.
              <em> A way forward.</em>
            </h1>
            <p className="hero-lead">
              Find your strength. Build your confidence. Become more — on and off the mat.
            </p>
            <div className="hero-actions">
              <button className="button gold" type="button" onClick={book}>
                Book your free trial <ArrowUpRight size={18} />
              </button>
              <a className="button ghost" href="#programs">
                Explore programs <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="hero-foot">
            <a href="#about">
              <span className="scroll-circle">
                <ArrowDown size={16} />
              </span>
              Start the journey
            </a>
            <span>Discipline / Connection / Evolution</span>
          </div>
        </section>

        <div className="principles" aria-hidden="true">
          <div className="principles-track">
            {Array.from({ length: 2 }).map((_, copy) => (
              <div className="principles-group" key={copy}>
                <span>BRAZILIAN SOUL.</span>
                <span className="asterisk">✳</span>
                <span>UNIVERSAL LANGUAGE.</span>
                <span className="asterisk">✳</span>
                <span>ONE TEAM.</span>
                <span className="asterisk">✳</span>
                <span>CARIOX.</span>
                <span className="asterisk">✳</span>
              </div>
            ))}
          </div>
        </div>

        <StartPath book={book} />

        <section id="about" className="about section-pad">
          <div className="section-kicker reveal">
            <span>01 / THE PHILOSOPHY</span>
            <span>A PRACTICE. A PEOPLE. A PURPOSE.</span>
          </div>
          <div className="about-grid">
            <div className="reveal">
              <h2>
                Leave your ego.
                <br />
                Bring your <em>everything.</em>
              </h2>
              <div className="about-copy">
                <span className="little-cross">✳</span>
                <div>
                  <p>
                    Jiu-Jitsu begins with a simple decision: to show up. To be a beginner. To
                    discover what you’re capable of.
                  </p>
                  <p>
                    CARIOX brings Brazilian martial arts into a space made for connection. Rooted
                    in the Salomão BJJ Team identity, our vision is built around respect,
                    intentional practice, and the belief that we grow together.
                  </p>
                  <a className="underlined-link" href="#programs">
                    Find your way onto the mat <ArrowUpRight size={17} />
                  </a>
                </div>
              </div>
            </div>
            <DepthSurface className="about-image reveal">
              <Image
                src="/images/reception.jpg"
                alt="CARIOX welcome desk with wood paneling, plants, and branded apparel"
                width={1448}
                height={1086}
                sizes="(max-width: 800px) 100vw, 45vw"
              />
              <span className="image-tag">BRAZILIAN IN SPIRIT. CARIOX BY NATURE.</span>
              <div className="image-corner">
                C<span>✳</span>
              </div>
            </DepthSurface>
          </div>
        </section>

        <section id="programs" className="programs section-pad">
          <div className="section-kicker reveal">
            <span>02 / YOUR PRACTICE</span>
            <span>EVERY JOURNEY HAS A FIRST STEP.</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              Different paths.
              <br />
              <em>One pursuit.</em>
            </h2>
            <p>
              Wolves Den and Crown lead with named tracks. Until CARIOX confirms offerings, choose
              the interest that fits — then tell us what you need.
            </p>
          </div>
          <p className="availability-note">
            EXPLORE YOUR INTERESTS · CONFIRMED PROGRAMS COMING SOON
          </p>
          <ProgramExplorer />
        </section>

        <GalleryShowcase open={setGallery} />

        <section id="instructors" className="instructors section-pad">
          <div className="section-kicker reveal">
            <span>04 / THE PEOPLE BEHIND THE PRACTICE</span>
            <span>SALOMÃO BJJ TEAM</span>
          </div>
          <div className="instructors-grid">
            <DepthSurface className="team-mark reveal">
              <span>RESPECT THE ROOTS.</span>
              <strong>
                CARI<span>OX</span>
              </strong>
              <div className="belt">
                <i />
                <i />
                <i />
                <i />
              </div>
              <small>
                BRAZILIAN MARTIAL ARTS
                <br />
                SALOMÃO BJJ TEAM
              </small>
            </DepthSurface>
            <div className="reveal">
              <h2>
                Good technique.
                <br />
                <em>Great people.</em>
              </h2>
              <p>
                Competitors win trust with named coaches and ranks. CARIOX will publish verified
                instructor profiles, belt ranks, and biographies only when those details are
                confirmed — never invented for the page.
              </p>
              <div className="coming-soon">
                <span className="status-dot" />
                <div>
                  <b>Meet your instructors, soon.</b>
                  <p>
                    Verified instructor profiles, belt ranks, and biographies are awaiting the
                    academy’s details.
                  </p>
                </div>
              </div>
              <a href="#contact" className="underlined-link">
                Ask about the team <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section id="schedule" className="schedule section-pad">
          <div className="section-kicker reveal">
            <span>05 / MAKE TIME FOR YOURSELF</span>
            <span>CONSISTENCY CHANGES EVERYTHING.</span>
          </div>
          <div className="section-heading reveal">
            <h2>
              A little discipline.
              <br />
              <em>A different day.</em>
            </h2>
            <button className="button dark" type="button" onClick={book}>
              Find your first session <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="schedule-notice">
            <span className="status-dot" /> SAMPLE SCHEDULE — Classes, coaches, and times below are
            illustrative and not confirmed.
          </div>
          <div className="schedule-toolbar">
            <div className="days" aria-label="Filter by day" role="tablist">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  onClick={() => setDay(d)}
                  className={day === d ? 'active' : ''}
                  aria-pressed={day === d}
                  aria-selected={day === d}
                >
                  {d}
                </button>
              ))}
            </div>
            <select
              aria-label="Filter by program"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {['All programs', 'Foundations', 'Gi', 'No-Gi'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="schedule-results" aria-live="polite">
            {filtered.map((c, i) => (
              <div className="class-row" key={i}>
                <div className="class-time">
                  {c.time}
                  <small>{c.period}</small>
                </div>
                <div>
                  <h3>{c.name}</h3>
                  <span>Sample class · Instructor to be confirmed</span>
                </div>
                <span className="level-tag">{c.level}</span>
                <button
                  type="button"
                  onClick={book}
                  aria-label={'Explore sample ' + c.name + ' booking'}
                >
                  <ArrowUpRight />
                </button>
              </div>
            ))}
            {!filtered.length && (
              <div className="empty-schedule">
                A little room to reset.
                <p>No sample classes match this day and filter. Try another day.</p>
              </div>
            )}
          </div>
          <p className="schedule-footer">
            Your actual training schedule will appear here when the academy confirms its classes.{' '}
            <span>ALL TIMES ARE SAMPLE TIMES</span>
          </p>
        </section>

        <section className="trust section-pad" aria-labelledby="trust-heading">
          <div className="section-kicker reveal">
            <span>TRUST WITHOUT FICTION</span>
            <span>WHAT WE WILL NOT FAKE</span>
          </div>
          <div className="section-heading reveal">
            <h2 id="trust-heading">
              Built for belief.
              <br />
              <em>Not borrowed quotes.</em>
            </h2>
            <p>
              Local competitors lean on ratings and testimonials. CARIOX will publish reviews,
              ranks, and facility claims only when they are real.
            </p>
          </div>
          <ul className="trust-grid">
            <li className="reveal">
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>Verified coaches only</h3>
              <p>No invented names, belt ranks, or championship claims on this site.</p>
            </li>
            <li className="reveal">
              <EyeOff size={22} aria-hidden="true" />
              <h3>No fake testimonials</h3>
              <p>Student stories appear here when authentic reviews are available.</p>
            </li>
            <li className="reveal">
              <CalendarClock size={22} aria-hidden="true" />
              <h3>Sample schedule, labeled</h3>
              <p>Times and class names are illustrative until the academy confirms them.</p>
            </li>
          </ul>
        </section>

        <section className="culture section-pad">
          <span className="eyebrow reveal">MORE THAN A PLACE TO TRAIN.</span>
          <h2 className="reveal">
            A place to
            <br />
            <em>belong.</em>
            <span>✳</span>
          </h2>
          <div className="culture-bottom reveal">
            <p>
              The small conversations. The shared progress.
              <br />
              The people who keep you coming back.
              <br />
              That’s the culture we’re building.
            </p>
            <div>
              <span>THE COMMUNITY’S VOICE</span>
              <p>Student stories will be shared here when authentic reviews are available.</p>
            </div>
          </div>
        </section>

        <section className="photo-strip" aria-label="Academy photo gallery">
          {[3, 1, 4].map((i) => (
            <DepthSurface key={i} className="photo-card">
              <button type="button" onClick={() => setGallery(i)} aria-label={'View ' + photos[i].title}>
                <Image
                  src={photoPath(i)}
                  width={700}
                  height={600}
                  alt={photos[i].description}
                  sizes="(max-width:600px) 75vw, 33vw"
                />
                <span>
                  {photos[i].label}
                  <Expand size={17} />
                </span>
              </button>
            </DepthSurface>
          ))}
        </section>

        <Faq />

        <section id="contact" className="contact section-pad">
          <div className="section-kicker reveal">
            <span>08 / LET’S BEGIN</span>
            <span>THE HARDEST PART IS SHOWING UP.</span>
          </div>
          <div className="contact-grid">
            <div className="reveal">
              <h2>
                Your next chapter.
                <br />
                <em>Starts here.</em>
              </h2>
              <p>
                Have a question or a goal in mind? Preview an inquiry, or take the booking
                experience for a spin. Live contact details publish after confirmation.
              </p>
              <button className="button gold" type="button" onClick={book}>
                Book your free trial <ArrowUpRight size={17} />
              </button>
              <div className="contact-details">
                <b>COME FIND YOUR PEOPLE.</b>
                <p>Academy address, phone, email, and social channels will be published once confirmed.</p>
                <span>CARIOX · BRAZILIAN MARTIAL ARTS</span>
              </div>
            </div>
            <form
              className="inquiry-form reveal"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {sent ? (
                <div className="inquiry-done" role="status">
                  <Check size={30} />
                  <h3>Your inquiry preview is ready.</h3>
                  <p>
                    This demo has not sent or saved your details. Live inquiries will be enabled
                    when the academy’s contact service is connected.
                  </p>
                  <button type="button" className="underlined-link" onClick={() => setSent(false)}>
                    Write another inquiry <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="eyebrow">LET’S START A CONVERSATION</span>
                  <p className="demo-chip inline">Inquiry demo · not sent or stored</p>
                  <div className="form-pair">
                    <label>
                      Your name
                      <input name="name" autoComplete="name" required placeholder="Full name" minLength={2} />
                    </label>
                    <label>
                      Email address
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                  <label>
                    I’m interested in
                    <select name="interest">
                      <option>Starting my Jiu-Jitsu journey</option>
                      <option>Training for my child</option>
                      <option>Advancing my practice</option>
                      <option>Visiting the academy</option>
                      <option>Something else</option>
                    </select>
                  </label>
                  <label>
                    Your message
                    <textarea
                      name="message"
                      required
                      minLength={10}
                      placeholder="Tell us a little about yourself and your goals."
                      rows={3}
                    />
                  </label>
                  <p className="fine-print">
                    Inquiry demo. Your details stay in your browser for this preview and are not
                    sent or stored.
                  </p>
                  <button className="button dark full" type="submit">
                    Preview your inquiry <ArrowUpRight size={17} />
                  </button>
                </>
              )}
            </form>
          </div>
        </section>

        <section className="final-cta">
          <span>ONE DECISION. ENDLESS POSSIBILITY.</span>
          <button type="button" onClick={book}>
            STEP ONTO
            <br />
            THE <em>MAT.</em>
            <MoveUpRight />
          </button>
        </section>
      </main>

      <footer>
        <div className="footer-top">
          <a className="logo" href="#home">
            CARI<span>OX</span>
            <small>BRAZILIAN MARTIAL ARTS</small>
          </a>
          <p>
            Brazilian roots.
            <br />
            A stronger tomorrow.
          </p>
          <a href="#home">
            Back to the top <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CARIOX · SALOMÃO BJJ TEAM</span>
          <span>ACADEMY WEBSITE PREVIEW · BOOKINGS & CHAT ARE DEMOS</span>
          <span>BUILT WITH PURPOSE. OSS.</span>
        </div>
      </footer>

      <Receptionist book={book} />
      {booking && <Booking close={() => setBooking(false)} />}
      {gallery !== null && (
        <GalleryDialog index={gallery} close={() => setGallery(null)} change={setGallery} />
      )}
    </>
  );
}
