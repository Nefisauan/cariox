'use client';
import { ArrowRight, RefreshCw } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="recovery-page"><div className="recovery-content"><a href="/" className="recovery-brand" aria-label="CARIOX home"><BrandLogo /></a><span className="eyebrow">A MOMENT TO RESET</span><h1>TAKE A BREATH.<br /><em>TRY AGAIN.</em></h1><p>Something interrupted this page. Try loading it again, or return to the academy.</p><div><button className="button gold" onClick={reset}>Try again <RefreshCw size={17} /></button><a href="/" className="recovery-link">Back to the academy <ArrowRight size={16} /></a></div><small>BRAZILIAN ROOTS. A WAY FORWARD.</small></div></main>;
}
