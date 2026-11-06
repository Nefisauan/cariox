'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Layers3, LoaderCircle } from 'lucide-react';
import DepthSurface from './DepthSurface';
import { photos, photoPath } from '../lib/gallery';

export default function GalleryShowcase({ open }: { open: (index: number) => void }) {
  const [active, setActive] = useState(0);
  const [requested, setRequested] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean[]>(photos.map(() => false));
  const [raw, setRaw] = useState<boolean[]>(photos.map(() => false));
  const [error, setError] = useState('');
  const [depth, setDepth] = useState(true);

  useEffect(() => {
    if (requested !== null && loaded[requested]) { setActive(requested); setRequested(null); }
  }, [requested, loaded]);

  function select(index: number) {
    setError('');
    if (loaded[index]) { setActive(index); setRequested(null); }
    else setRequested(index);
  }

  return <section className="academy-showcase" id="gallery" aria-label="Interactive academy gallery">
    <DepthSurface className="showcase-depth" enabled={depth} strength={4}>
      <div className="showcase-planes" aria-label="Academy photographs">
        {photos.map((photo, index) => <div key={photo.src} className={`showcase-image ${active === index ? 'active' : ''}`} aria-hidden={active !== index}>
          <Image src={photoPath(index)} fill sizes="100vw" loading="lazy" alt={photo.description} unoptimized={raw[index]}
            onLoad={() => setLoaded(previous => previous.map((ready, i) => i === index ? true : ready))}
            onError={() => {
              if (!raw[index]) setRaw(previous => previous.map((retry, i) => i === index ? true : retry));
              else if (requested === index || active === index) { setRequested(null); setError('This image could not load. Please try another view.'); }
            }} />
        </div>)}
      </div>
      <div className="showcase-shade" />
      <div className="depth-glow" aria-hidden="true" />
      <div className="showcase-top"><span className="eyebrow">03 / INSIDE CARIOX</span><div className="showcase-actions">
        <button className="outline-button depth-toggle" aria-pressed={depth} onClick={() => setDepth(!depth)}><Layers3 size={15} /> Depth {depth ? 'on' : 'off'}</button>
        <button className="outline-button" onClick={() => open(active)}>View image <Expand size={15} /></button>
      </div></div>
      <div className="showcase-content" aria-live="polite"><span className="eyebrow">{photos[active].label}</span><h2>{photos[active].title}</h2><p>{photos[active].description}</p></div>
      <div className="scene-controls"><button aria-label="Previous academy view" onClick={() => select((active + photos.length - 1) % photos.length)}><ChevronLeft size={20} /></button><span>{depth ? 'MOVE TO EXPLORE' : 'EXPLORE THE ACADEMY'}<small>{String(active + 1).padStart(2, '0')} / 05</small></span><button aria-label="Next academy view" onClick={() => select((active + 1) % photos.length)}><ChevronRight size={20} /></button></div>
    </DepthSurface>
    {requested !== null && <div className="gallery-status" role="status"><LoaderCircle size={14} /> Loading the next view…</div>}
    {error && <p className="gallery-status" role="alert">{error}</p>}
    <div className="showcase-nav" aria-label="Choose academy view">{photos.map((photo, index) => <button key={photo.src} className={active === index ? 'active' : ''} onClick={() => select(index)} aria-pressed={active === index} aria-busy={requested === index}><span>0{index + 1}</span>{['The mat', 'The welcome', 'Performance', 'The lounge', 'The collection'][index]}<ArrowUpRight size={16} /></button>)}</div>
    <span className="concept-label">SUPPLIED ACADEMY & APPAREL CONCEPT IMAGERY</span>
  </section>;
}
