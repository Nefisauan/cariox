export const photos = [
  { src: 'academy', title: 'Space to become more.', label: '01 / THE TRAINING FLOOR', description: 'An open mat. An open mind. A space designed around the work.' },
  { src: 'reception', title: 'A different kind of welcome.', label: '02 / THE WELCOME', description: 'Warm materials, thoughtful details, and Brazilian identity from the moment you arrive.' },
  { src: 'performance', title: 'Beyond the technique.', label: '03 / PERFORMANCE & RECOVERY', description: 'Explore the performance and recovery area in the supplied academy concept.' },
  { src: 'lounge', title: 'Stay a little longer.', label: '04 / THE COMMUNITY', description: 'Connection continues beyond the mat in a welcoming lounge.' },
  { src: 'collection', title: 'Carry the culture.', label: '05 / THE CARIOX COLLECTION', description: 'Brazilian roots. A distinctive identity. Explore the supplied apparel concept; availability is not yet announced.' },
];

export const photoPath = (index: number) => `/images/${photos[index].src}${[0, 2].includes(index) ? '-clean.webp' : '.jpg'}`;
