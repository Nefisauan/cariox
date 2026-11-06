# Official logo update — November 6, 2026

The client identified the logo at the top of `PHOTO-2026-11-06-13-31-33.jpg` as the correct CARIOX logo. It supersedes the site's prior text-only wordmark and C monogram. The approved identity is green CARIO lettering, gold OX with a brushstroke X, the mountain/Christ silhouette, BRAZILIAN MARTIAL ARTS, and SALOMÃO BJJ TEAM.

The built-in image generation/editing tool was used in background-extraction mode to isolate the supplied logo on transparency, then in precise-object-edit mode for the four concept mockups. These are raster derivatives of the client's schedule and conceptual images, not an original vector brand package. Tiny perspective-dependent printing in mockups is illustrative; the shared UI asset is the authoritative website artwork. No new business facts or real facility photographs are claimed.

## Saved assets

- `public/images/cariox-logo.png`: transparent master, 1280 × 517, used by `BrandLogo`.
- `app/icon.png`: browser icon derived from the same artwork on ivory; replaces the old SVG monogram.
- `app/apple-icon.png`: touch icon from the same artwork.
- `public/images/academy-branded.webp`: corrected left-wall and cage branding.
- `public/images/performance-branded.webp`: corrected cage-panel and floor branding.
- `public/images/reception-branded.webp`: corrected CARIOX merchandise/accessory branding.
- `public/images/collection-branded.webp`: corrected apparel/wordmark branding.

Original concept files and previous dimension-free edits remain as historical source assets, but the public content resolver now uses the branded derivatives. The instructor portrait and lounge photo are unchanged.

## Website placements

`components/BrandLogo.tsx` and `lib/branding.ts` centralize the official asset. Navigation (desktop/mobile), footer, about-image badge, instructor caption, chat avatar, 404 page, and error page use it. Dark contexts use a small ivory ground to retain the original green/gold colors and keep the dark lettering legible. Mobile widths are explicitly constrained.

The statically generated `/share-image` embeds the same PNG. Open Graph/Twitter metadata points to that card. The verified existing Vercel production origin, `https://cariox-smoky.vercel.app`, is the metadata fallback when `NEXT_PUBLIC_SITE_URL` is absent; a later approved custom domain can override it. No DNS changes are made.

Original animation/responsive CSS is retained. Additions are limited to the artwork placements and sizes. The original design parity fixture remains; its comparator recognizes only the approved text-logo-to-image replacements, alongside the previously approved instructor/schedule changes.

## Final prompt set

Tool: built-in `image_gen.imagegen`; no CLI/API-key fallback.

Master input: `/Users/nefisauan/Downloads/PHOTO-2026-11-06-13-31-33.jpg`. Transparency enabled. Final prompt:

> Use case: background-extraction. Edit target: the supplied CARIOX weekly schedule image. Extract ONLY the official main CARIOX logo at the top center into a clean transparent PNG, tightly framed with a little transparent margin. Preserve the exact existing logo, not a redesign: the dark emerald green and metallic gold CARIOX custom letterforms, green/gold mountain silhouette with the small Christ statue above it, the gold brushstroke X, the gold text BRAZILIAN MARTIAL ARTS, and the dark green text SALOMÃO BJJ TEAM below with its thin horizontal side rules. Keep all lettering and spelling exactly as in the source, all silhouettes, proportions, logo layout, gold and green gradients, and alignment. Remove the white/gray mountain scenery behind the logo, all schedule content, CLASS SCHEDULE heading, and every unrelated element. Do not add any new text, emoji, symbols, tagline, shadows, scenery, or creative interpretation. The full official logo must be complete and legible. Output a single isolated logo centered horizontally in a wide landscape canvas on actual alpha transparency.

Mockup prompts use the following exact template, replacing `{scope}` with each table entry. Input 1 is the listed original image, input 2 is `public/images/cariox-logo.png`; transparency is disabled.

> Use case: precise-object-edit. Image 1 is the edit target. Image 2 is the approved official CARIOX logo; it is the exact artwork to use, not a style reference. Replace ONLY {scope} with the official logo from image 2. Preserve its exact green CARIO lettering, gold OX brushstroke, green/gold mountain and Christ silhouette, and the exact text BRAZILIAN MARTIAL ARTS and SALOMÃO BJJ TEAM. Remove the previous CARIOX logos rather than adding more marks. Fit the official full logo naturally to each existing branding location with the appropriate perspective, material texture, folds and lighting. For narrow vertical or tiny wordmarks use the exact approved CARIOX wordmark lettering/colors from image 2, without inventing a different font. Keep the original photo/composite dimensions, framing, objects, geometry, architecture, furniture, garments, sewing, flags, scenery, lighting, and every unrelated brand completely unchanged. No extra signage, annotations, crowns, logos, emoji, or other text. On very dark materials a discreet ivory print ground under the logo may be used for readability, confined to the existing logo footprint. This is a branding replacement, not a scene redesign. Preserve all areas outside the existing CARIOX branding.

| Input 1 | Exact scope substitution |
| --- | --- |
| `public/images/academy-clean.webp` | the large CARIOX logo on the left wall and the small CARIOX mark on the cage at the back |
| `public/images/performance-clean.webp` | both CARIOX logos on the black cage back panel and the cage floor |
| `public/images/reception.jpg` | all CARIOX marks on the clothing, hats, bag, and branded accessories behind the counter |
| `public/images/collection.jpg` | all CARIOX logos and CARIOX wordmarks across every garment, waistband, sleeve, short leg, and logo close-up panel in this apparel concept |
