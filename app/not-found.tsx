import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
export const metadata: Metadata = { title: 'Find Your Way Back | CARIOX' };
export default function NotFound() {
  return <main className="recovery-page"><div className="recovery-image"><Image src="/images/academy-clean.webp" alt="The CARIOX training floor" fill sizes="100vw" priority /></div><div className="recovery-shade" /><div className="recovery-content"><Link href="/" className="recovery-brand" aria-label="CARIOX home">CARI<span>OX</span></Link><span className="eyebrow">404 / A DIFFERENT KIND OF DETOUR</span><h1>LET’S FIND<br />YOUR WAY <em>BACK.</em></h1><p>This page isn’t on the mat. The academy is waiting right where you left it.</p><div><Link href="/" className="button gold"><ArrowLeft size={17} /> Back to the academy</Link><Link href="/#contact" className="recovery-link">Get in touch <ArrowUpRight size={16} /></Link></div><small>BRAZILIAN ROOTS. A WAY FORWARD.</small></div></main>;
}
