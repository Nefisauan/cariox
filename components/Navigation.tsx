'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAcademyContent } from './content/ContentProvider';
import useModal from './useModal';

export function Wordmark() {
  const { branding } = useAcademyContent();
  return <BrandLogo src={branding.logoUrl} />;
}
function MobileMenu({ close, openTrial }: { close: () => void; openTrial: () => void }) {
  const ref = useModal();
  const { navigation } = useAcademyContent();
  const links = navigation.links.some(link => link.href === '#home')
    ? navigation.links : [{ label: 'Home', href: '#home' }, ...navigation.links];
  return <dialog ref={ref} id="mobile-navigation" className="mobile-nav" aria-label="Site navigation" onCancel={close}>
    <div className="mobile-nav-top"><a href="#home" aria-label="CARIOX home" onClick={close}><Wordmark /></a><button className="icon-button" onClick={close} aria-label="Close navigation"><X /></button></div>
    <span className="eyebrow">FIND YOUR WAY FORWARD</span>
    <nav aria-label="Mobile navigation">{links.map((link, index) => <a href={link.href} key={link.href} onClick={close}><small>0{index + 1}</small>{link.label}<ArrowUpRight size={22} /></a>)}</nav>
    {navigation.buttonUrl
      ? <a className="button gold full" href={navigation.buttonUrl} onClick={close}>{navigation.buttonText} <ArrowUpRight size={18} /></a>
      : <button className="button gold full" onClick={() => { close(); openTrial(); }}>{navigation.buttonText} <ArrowUpRight size={18} /></button>}
    <p>BRAZILIAN ROOTS. ONE SHARED JOURNEY.</p>
  </dialog>;
}
export default function Navigation({ openTrial }: { openTrial: () => void }) {
  const { navigation } = useAcademyContent();
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
  const buttonContent = <><span className="trial-nav-long">{navigation.buttonText}</span><span className="trial-nav-short">{navigation.buttonShortText}</span><ArrowUpRight size={16} /></>;
  return <>
    <header className="site-header"><a href="#home" className="logo" aria-label="CARIOX home"><Wordmark /></a>
      <nav aria-label="Main navigation" className="nav">{navigation.links.map(link => <a href={link.href} key={link.href} aria-current={link.href === `#${active}` ? 'location' : undefined}>{link.label}</a>)}</nav>
      {navigation.buttonUrl
        ? <a className="header-cta" href={navigation.buttonUrl} aria-label={navigation.buttonText}>{buttonContent}</a>
        : <button className="header-cta" onClick={openTrial} aria-label={navigation.buttonText}>{buttonContent}</button>}
      <button className="menu-toggle icon-button" onClick={() => setMenu(true)} aria-label="Open navigation" aria-expanded={menu} aria-controls={menu ? 'mobile-navigation' : undefined}><Menu /></button>
      <div className="reading-progress" aria-hidden="true" />
    </header>
    {menu && <MobileMenu close={() => setMenu(false)} openTrial={openTrial} />}
  </>;
}
