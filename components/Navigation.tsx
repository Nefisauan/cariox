'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useAcademyContent } from './content/ContentProvider';
import useModal from './useModal';

const links = ['About', 'Programs', 'Instructors', 'Schedule', 'Gallery', 'Contact'];
export function Wordmark() {
  const { branding } = useAcademyContent();
  if (branding.logoUrl) return <Image src={branding.logoUrl} alt={`${branding.wordmarkLeft}${branding.wordmarkRight}`} width={150} height={50} style={{objectFit:"contain"}} />;
  return <span className="wordmark">{branding.wordmarkLeft}<span>{branding.wordmarkRight}</span><small>{branding.tagline}</small></span>;
}
function MobileMenu({ close, book }: { close: () => void; book: () => void }) {
  const ref = useModal();
  return <dialog ref={ref} id="mobile-navigation" className="mobile-nav" aria-label="Site navigation" onCancel={close}>
    <div className="mobile-nav-top"><a href="#home" aria-label="CARIOX home" onClick={close}><Wordmark /></a><button className="icon-button" onClick={close} aria-label="Close navigation"><X /></button></div>
    <span className="eyebrow">FIND YOUR WAY FORWARD</span>
    <nav aria-label="Mobile navigation">{['Home', ...links].map((label, index) => <a href={`#${label.toLowerCase()}`} key={label} onClick={close}><small>0{index + 1}</small>{label}<ArrowUpRight size={22} /></a>)}</nav>
    <button className="button gold full" onClick={() => { close(); book(); }}>Plan your first visit <ArrowUpRight size={18} /></button>
    <p>BRAZILIAN ROOTS. ONE SHARED JOURNEY.</p>
  </dialog>;
}
export default function Navigation({ book }: { book: () => void }) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('home');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.2, 0.5] });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <>
    <header className="site-header"><a href="#home" className="logo" aria-label="CARIOX home"><Wordmark /></a>
      <nav aria-label="Main navigation" className="nav">{links.map(label => <a href={`#${label.toLowerCase()}`} key={label} aria-current={active === label.toLowerCase() ? 'location' : undefined}>{label}</a>)}</nav>
      <button className="header-cta" onClick={book}>Your first visit <ArrowUpRight size={16} /></button>
      <button className="menu-toggle icon-button" onClick={() => setMenu(true)} aria-label="Open navigation" aria-expanded={menu} aria-controls={menu ? 'mobile-navigation' : undefined}><Menu /></button>
      <div className="reading-progress" aria-hidden="true" />
    </header>
    {menu && <MobileMenu close={() => setMenu(false)} book={book} />}
  </>;
}
