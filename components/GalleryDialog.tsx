'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import DepthSurface from './DepthSurface';
import useModal from './useModal';
import { photos, photoPath } from '../lib/gallery';

export default function GalleryDialog({ index, close, change }: { index: number; close: () => void; change: (index: number) => void }) {
  const ref = useModal();
  const [zoom, setZoom] = useState(false);
  useEffect(() => { setZoom(false); }, [index]);
  const next = (direction: number) => change((index + photos.length + direction) % photos.length);
  return <dialog ref={ref} className="gallery-dialog" aria-label="Academy photo viewer" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); next(event.key === 'ArrowLeft' ? -1 : 1); }
  }}>
    <button className="close" aria-label="Close image" onClick={close}><X /></button>
    <button className="viewer-zoom" aria-label={zoom ? 'Zoom out' : 'Zoom in'} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />} {zoom ? 'Fit image' : 'Explore details'}</button>
    <DepthSurface className={`viewer-depth ${zoom ? 'viewer-zoomed' : ''}`} strength={5}>
      <Image src={photoPath(index)} alt={photos[index].description} width={1536} height={1024} sizes="94vw" unoptimized />
      <div className="depth-glow" aria-hidden="true" />
    </DepthSurface>
    <div className="gallery-dialog-caption"><button aria-label="Previous image" onClick={() => next(-1)}><ChevronLeft /></button><div><small aria-live="polite">{photos[index].label}</small><h3>{photos[index].title}</h3></div><button aria-label="Next image" onClick={() => next(1)}><ChevronRight /></button></div>
  </dialog>;
}
