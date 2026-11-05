# CARIOX — Brazilian Martial Arts

A responsive Next.js / React / TypeScript academy website built directly in this repository. Uses the five supplied CARIOX images, charcoal, ivory, and gold branding, cursor-responsive 3D photographic tilt, layered lighting, raised interactive buttons, a CSS belt composition, reduced-motion support, an interactive gallery, expandable training interests, sample schedule filters, a booking dialog, and a scripted receptionist.

## Commands

- `npm ci` installs locked dependencies.
- `npm run build` creates the production application.
- `npm run typecheck` checks TypeScript.
- `npm test` checks booking validation, honest demo receipts, receptionist content boundaries, repeated 1–2–3 panel interactions, gallery loading/error transitions, and depth controls in a DOM environment without a server.

No preview server is required for these checks. Deploy the GitHub repository with a Next.js-compatible host using `npm run build`. Node 22.18+ recommended; DOM tests run through tsx and use Node’s experimental module-mocking feature for the Next.js image wrapper. No secrets are required for the demo.

## Content and integration status

Uploaded images are presented as supplied academy/apparel concept references. Dimension text and arrows were removed from the training-floor and performance images with the built-in image editing tool, then optimized to WebP. Original uploads remain archived in `public/images`; all visible placements use the cleaned versions. See `docs/image-edits.md` for asset paths and prompts. No testimonials, instructors, ranks, addresses, business hours, pricing, or offered programs have been invented. Program sections collect interests; actual offerings require confirmation. Sample classes are labeled. Contact details and coach profiles await verified content. SEO indexing is intentionally disabled in `app/layout.tsx` until business information is ready.

`lib/academy.ts` defines `SchedulingProvider`. Replace the demo with server-mediated availability and reservation calls to Cal.com, Calendly, Google Calendar, or another provider. Live booking must validate dates and contact details server-side, recheck availability, use provider idempotency and atomic reservation controls, and handle conflicts and provider failures. Current submission is browser-memory-only and returns `live: false`; it never sends email or makes a calendar event.

The receptionist uses an explicit scripted demo responder. To connect an LLM, add a server-only endpoint with a curated, verified academy knowledge base, rate limiting and input validation; stream its response to the chat UI. Keep provider keys server-side. Its booking action already opens the same booking flow.

The inquiry form only previews local input; connect a validated server-side mail/CRM route before renaming the submit action. It currently neither stores nor sends personal information. See `.env.example` for private integration configuration. Replace unconfirmed details and enable indexing only after review. Google Fonts are loaded with system font fallbacks; supplied images use Next.js image optimization.

## Interaction fixes

Scroll reveals use the Web Animations API, with content visible by default. Opening a program row no longer overwrites a visibility class and hides the panel. Photo switching retains the current image until the next image loads, retries image-optimizer failures using the original asset URL, and shows a readable error if both attempts fail. The full-screen photo viewer supports zoom, previous/next buttons, and arrow keys. CSS perspective layers provide photographic depth without claiming a reconstructed 3D room. Touch devices retain tap and carousel controls, and reduced-motion preferences disable tilt and motion.
