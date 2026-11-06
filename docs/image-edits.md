> Update: the client subsequently supplied the official schedule logo. The visible academy/performance/reception/collection mockups now use the branded derivatives documented in [brand-update.md](./brand-update.md). The earlier source and clean files below are retained for provenance.

# Dimension-free academy images

Edited with the built-in imagegen tool. Original uploaded JPEGs remain unchanged. The two final website assets were visually inspected and converted to WebP at quality 88 for delivery.

- Training floor: `public/images/academy-clean.webp`
- Performance area: `public/images/performance-clean.webp`

The hero, gallery scenes, and full-screen viewer use these paths through `lib/gallery.ts`.

## Final prompt — training floor

Use case: precise-object-edit. Edit target: the supplied CARIOX academy interior photograph. Remove ALL overlaid architectural dimension annotations: every white measurement number, units, Portuguese measurement descriptions, white arrows, dimension lines and ticks at the top, left, right, and bottom. Seamlessly reconstruct the underlying floor tiles, walls and ceiling where annotations were. Preserve the original room, perspective, framing, size, equipment, furniture, lighting, colors, wall art and CARIOX branding as closely as possible. Preserve actual signage and branding, including exit signage. Do not crop the image, change the layout, add anything, add text, or add watermarks. Output a clean photographic image for the academy website.

## Final prompt — performance area

Use case: precise-object-edit. Edit target: the supplied CARIOX performance area photograph. Remove ALL overlaid architectural dimensions: all white measurement numbers, units, Portuguese dimension descriptions, arrows, lines and ticks at top, bottom and right. Reconstruct the underlying floor, walls and ceiling seamlessly. Preserve original perspective, entire framing, equipment on left, blue cold plunge, octagonal cage on right, CARIOX logos, actual exit sign, lighting, colors and all other details as closely as possible. Do not crop, alter layout, add text, add objects or watermarks. Output a clean photographic image for use in the website.
