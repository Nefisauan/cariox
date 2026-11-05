'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import DepthSurface from './DepthSurface';
import { photos, photoPath } from '../lib/gallery';

export default function GalleryDialog({ index, close, change }: { index: number; close: () => void; change: (index: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  useEffect(() => { ref.current?.showModal(); document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  useEffect(() => { setZoom(false); }, [index]);
  const next = (direction: number) => change((index + photos.length + direction) % photos.length);
  return <dialog ref={ref} className="gallery-dialog" aria-label="Academy photo viewer" onCancel={close} onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); next(event.key === 'ArrowLeft' ? -1 : 1); }
  }}>
    <button className="close" aria-label="Close image" onClick={close}><X /></button>
    <button className="viewer-zoom" aria-label={zoom ? 'Zoom out' : 'Zoom in'} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />} {zoom ? 'Fit image' : 'Explore details'}</button>
    <DepthSurface className={`viewer-depth ${zoom ? 'viewer-zoomed' : ''}`} strength={5}>
      <Image src={photoPath(index)} alt={photos[index].description} width={1536} height={1024} sizes="94vw" unoptimized />
      <div className="depth-glow" aria-hidden="true" />
    </DepthSurface>
    <div className="gallery-dialog-caption"><button aria-label="Previous image" onClick={() => next(-1)}><ChevronLeft /></button><div><small>{photos[index].label}</small><h3>{photos[index].title}</h3></div><button aria-label="Next image" onClick={() => next(1)}><ChevronRight /></button></div>
  </dialog>;
}
