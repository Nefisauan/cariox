import type { Metadata, Viewport } from 'next';
import './globals.css';
import MarketingConsent from '../components/tracking/MarketingConsent';
import { getAcademyContent } from '../lib/content/load';
import { getPublicSiteUrl } from '../lib/config/site';

// The Cloudflare-assigned hostname is the production origin until a custom domain is configured.
const siteUrl = getPublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? new URL('https://cariox.evan-7a6.workers.dev');

const baseMetadata: Metadata = {
  metadataBase: siteUrl,
  alternates: siteUrl ? { canonical: '/' } : undefined,
  title: 'CARIOX | Brazilian Jiu-Jitsu & Martial Arts',
  description: 'Brazilian roots. A way forward. Explore the CARIOX academy, the Salomão BJJ Team philosophy, and your first steps in Brazilian Jiu-Jitsu.',
  applicationName: 'CARIOX',
  openGraph: { title: 'CARIOX — A Way Forward', description: 'Discipline. Connection. Evolution. Brazilian martial arts with purpose.', type: 'website', locale: 'en_US', ...(siteUrl ? { url: siteUrl, images: [{ url: '/share-image.png', width: 1200, height: 630, alt: 'CARIOX — A Way Forward' }] } : {}) },
  twitter: { card: 'summary_large_image', title: 'CARIOX — A Way Forward', description: 'Brazilian roots. A stronger tomorrow.', images: [{ url: '/share-image.png', alt: 'CARIOX Brazilian Martial Arts · Salomão BJJ Team' }] },
  // Preview stays out of search until verified business information is provided.
  robots: { index: false, follow: false },
};
export async function generateMetadata(): Promise<Metadata> {
  const { homepage, source } = await getAcademyContent();
  return { ...baseMetadata, title: homepage.seo.title, description: homepage.seo.description, ...(source === 'sanity' ? { openGraph: { ...baseMetadata.openGraph, title: homepage.seo.title, description: homepage.seo.description }, twitter: { ...baseMetadata.twitter, title: homepage.seo.title, description: homepage.seo.description } } : {}) };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1c3025', colorScheme: 'light' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><link rel="preload" href="/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}<MarketingConsent /></body></html>;
}
