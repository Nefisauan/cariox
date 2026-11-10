import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import MarketingConsent from '../components/tracking/MarketingConsent';
import { getAcademyContent } from '../lib/content/load';
import { publicSiteUrl } from '../lib/config/site';

const baseMetadata: Metadata = {
  metadataBase: publicSiteUrl,
  alternates: { canonical: '/' },
  title: 'CARIOX | Brazilian Jiu-Jitsu & Martial Arts',
  description: 'Brazilian roots. A way forward. Explore the CARIOX academy, the Salomão BJJ Team philosophy, and your first steps in Brazilian Jiu-Jitsu.',
  applicationName: 'CARIOX',
  openGraph: { title: 'CARIOX — A Way Forward', description: 'Discipline. Connection. Evolution. Brazilian martial arts with purpose.', type: 'website', locale: 'en_US', url: publicSiteUrl, images: [{ url: '/share-image.png', width: 1200, height: 630, alt: 'CARIOX — A Way Forward' }] },
  twitter: { card: 'summary_large_image', title: 'CARIOX — A Way Forward', description: 'Brazilian roots. A stronger tomorrow.', images: [{ url: '/share-image.png', alt: 'CARIOX Brazilian Martial Arts · Salomão BJJ Team' }] },
};
export async function generateMetadata(): Promise<Metadata> {
  const [{ homepage, source }, requestHeaders] = await Promise.all([getAcademyContent(), headers()]);
  const index = requestHeaders.get('host')?.toLowerCase() === publicSiteUrl.host;
  const { title, description } = homepage.seo;

  return {
    ...baseMetadata,
    title,
    description,
    robots: { index, follow: index },
    ...(source === 'sanity' ? {
      openGraph: { ...baseMetadata.openGraph, title, description },
      twitter: { ...baseMetadata.twitter, title, description },
    } : {}),
  };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1c3025', colorScheme: 'light' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><link rel="preload" href="/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}<MarketingConsent /></body></html>;
}
