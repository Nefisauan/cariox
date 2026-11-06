import type { Metadata, Viewport } from 'next';
import './globals.css';

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = configuredUrl && /^https:\/\/[^\s]+$/.test(configuredUrl) ? new URL(configuredUrl) : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  alternates: siteUrl ? { canonical: '/' } : undefined,
  title: 'CARIOX | Brazilian Jiu-Jitsu & Martial Arts',
  description: 'Brazilian roots. A way forward. Explore the CARIOX academy, the Salomão BJJ Team philosophy, and your first steps in Brazilian Jiu-Jitsu.',
  applicationName: 'CARIOX',
  openGraph: { title: 'CARIOX — A Way Forward', description: 'Discipline. Connection. Evolution. Brazilian martial arts with purpose.', type: 'website', locale: 'en_US', ...(siteUrl ? { url: siteUrl, images: [{ url: '/share-image', width: 1200, height: 630, alt: 'CARIOX — A Way Forward' }] } : {}) },
  twitter: { card: 'summary_large_image', title: 'CARIOX — A Way Forward', description: 'Brazilian roots. A stronger tomorrow.' },
  // Preview stays out of search until verified business information is provided.
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1c3025', colorScheme: 'light' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><link rel="preload" href="/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
