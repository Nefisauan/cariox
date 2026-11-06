import Image from 'next/image';
import { OFFICIAL_LOGO_ALT, OFFICIAL_LOGO_URL, OFFICIAL_LOGO_WIDTH, OFFICIAL_LOGO_HEIGHT } from '../lib/branding';

/** A single artwork source for every website brand placement. */
export default function BrandLogo({ src = OFFICIAL_LOGO_URL, className = '', decorative = false }: {
  src?: string; className?: string; decorative?: boolean;
}) {
  return <Image className={`brand-logo ${className}`.trim()} src={src} alt={decorative ? '' : OFFICIAL_LOGO_ALT} width={OFFICIAL_LOGO_WIDTH} height={OFFICIAL_LOGO_HEIGHT} sizes="(max-width: 600px) 150px, 220px" />;
}
