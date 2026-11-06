import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const size = { width: 1200, height: 630 };
export const dynamic = 'force-static';
export async function GET() {
  const artwork = await readFile(join(process.cwd(), 'public/images/cariox-logo.png'));
  const logo = `data:image/png;base64,${artwork.toString('base64')}`;
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#1c3025', color: '#f4f2eb', padding: '55px 75px', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', background: '#f4f2eb', padding: '12px 18px', borderRadius: 2 }}><img src={logo} alt="CARIOX Brazilian Martial Arts · Salomão BJJ Team" width={340} height={137} /></div><div style={{ fontSize: 17, letterSpacing: 3 }}>BRAZILIAN MARTIAL ARTS</div></div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 80, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}><div>MORE THAN</div><div>A MARTIAL ART.</div><div style={{ color: '#e8b84c' }}>A WAY FORWARD.</div></div><div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #63785a', paddingTop: 20, fontSize: 15, letterSpacing: 3 }}><div>SALOMÃO BJJ TEAM</div><div>DISCIPLINE / CONNECTION / EVOLUTION</div></div></div>, size);
}
