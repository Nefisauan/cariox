import { ImageResponse } from 'next/og';
const size = { width: 1200, height: 630 };
export const dynamic = 'force-static';
export function GET() {
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#1c3025', color: '#f4f2eb', padding: '65px 75px', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 42, fontWeight: 700, fontStyle: 'italic' }}>CARI<span style={{ color: '#e8b84c' }}>OX</span></div><div style={{ fontSize: 17, letterSpacing: 3 }}>BRAZILIAN MARTIAL ARTS</div></div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 90, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}><div>MORE THAN</div><div>A MARTIAL ART.</div><div style={{ color: '#e8b84c' }}>A WAY FORWARD.</div></div><div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #63785a', paddingTop: 20, fontSize: 15, letterSpacing: 3 }}><div>SALOMÃO BJJ TEAM</div><div>DISCIPLINE / CONNECTION / EVOLUTION</div></div></div>, size);
}
