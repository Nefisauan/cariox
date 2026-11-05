'use client';

import { useEffect } from 'react';

export default function usePageMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Content remains visible by default. Reveal animations never control visibility.
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!reduced.matches && typeof entry.target.animate === 'function') {
            entry.target.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.65,.3,1)' });
          }
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 }) : null;
    document.querySelectorAll('.reveal').forEach(element => observer?.observe(element));

    let active: HTMLElement | null = null;
    let frame: number | null = null;
    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      active?.style.setProperty('--bx', '0deg');
      active?.style.setProperty('--by', '0deg');
      active = null;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.button,.header-cta,.chat-toggle') : null;
      if (target !== active) reset();
      active = target;
      if (!target) return;
      const bounds = target.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        target.style.setProperty('--bx', `${(0.5 - y) * 12}deg`);
        target.style.setProperty('--by', `${(x - 0.5) * 12}deg`);
        target.style.setProperty('--px', `${x * 100}%`);
        target.style.setProperty('--py', `${y * 100}%`);
      });
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => { observer?.disconnect(); reset(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', reset); window.removeEventListener('blur', reset); };
  }, []);
}
