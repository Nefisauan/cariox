'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackingEnabled, newEventId, setMarketingConsent, trackPageView } from '../../lib/tracking/client';
import { privacySignal, readConsent } from '../../lib/tracking/consent';
import type { MarketingConsent as Consent } from '../../lib/tracking/contracts';
export default function MarketingConsent() {
  const pathname = usePathname();
  const [consent,setConsent] = useState<Consent>('unknown');
  const [ready,setReady] = useState(false);
  const [preferences,setPreferences] = useState(false);
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!trackingEnabled) return;
    setConsent(setMarketingConsent(readConsent(), false)); setReady(true);
    const sync = () => { setConsent(setMarketingConsent(readConsent(),false)); };
    window.addEventListener('storage',sync);
    return () => window.removeEventListener('storage',sync);
  },[]);
  useEffect(() => {
    if (!ready || consent !== 'granted' || lastPath.current === pathname) return;
    if (trackPageView(newEventId('page'))) lastPath.current = pathname;
  },[consent,pathname,ready]);
  if (!trackingEnabled || !ready) return null;
  function choose(value: 'granted'|'denied') { setConsent(setMarketingConsent(value)); setPreferences(false); }
  return <>{consent === 'unknown' || preferences ? <section className="marketing-consent" aria-label="Marketing privacy preferences"><div><b>Your privacy. Your choice.</b><p>Essential features work without marketing tracking. With your permission, we use Meta and Google tools to measure visits and successful trial requests. You can request a trial without accepting tracking. You can change your choice at any time.</p>{privacySignal() && <p>Your browser’s privacy signal is being respected. Marketing tracking is disabled.</p>}</div><div><button className="button dark" onClick={()=>choose('denied')}>Essential only</button><button className="button gold" disabled={privacySignal()} onClick={()=>choose('granted')}>Allow analytics and ads</button></div></section> : <button className="privacy-choices" onClick={()=>setPreferences(true)}>Privacy choices</button>}</>;
}
