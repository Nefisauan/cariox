'use client';

import { useEffect, useRef, type ReactNode, type PointerEvent, type CSSProperties } from 'react';

type Props = { children: ReactNode; className?: string; enabled?: boolean; strength?: number; style?: CSSProperties };

/** CSS perspective keeps the photographs intact and works without a WebGL canvas. */
export default function DepthSurface({ children, className = '', enabled = true, strength = 6, style }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const el = surface.current;
    if (!el) return;
    for (const [key, value] of Object.entries({ '--rx': '0deg', '--ry': '0deg', '--px': '50%', '--py': '50%', '--dx': '0px', '--dy': '0px' })) {
      el.style.setProperty(key, value);
    }
  }

  useEffect(() => {
    if (!enabled) reset();
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [enabled]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = surface.current;
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - y) * strength}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * strength}deg`);
      el.style.setProperty('--px', `${x * 100}%`);
      el.style.setProperty('--py', `${y * 100}%`);
      el.style.setProperty('--dx', `${(x - 0.5) * -14}px`);
      el.style.setProperty('--dy', `${(y - 0.5) * -10}px`);
    });
  }

  return <div ref={surface} className={`depth-surface ${enabled ? 'depth-enabled' : ''} ${className}`} style={style} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    {children}
  </div>;
}
