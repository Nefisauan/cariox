# CARIOX — Brazilian Martial Arts

A responsive Next.js / React / TypeScript academy website built directly in this repository. Uses the five supplied CARIOX images, charcoal, ivory, and gold branding, cursor-responsive photographic depth, a CSS belt composition, reduced-motion support, an interactive gallery, expandable training interests, sample schedule filters, a booking dialog, and a scripted receptionist.

## Commands

- `npm ci` installs locked dependencies.
- `npm run build` creates the production application.
- `npm run typecheck` checks TypeScript.
- `npm test` checks booking validation, sample availability, honest demo receipts, and receptionist content boundaries.

No preview server is required for these checks. Deploy the GitHub repository with a Next.js-compatible host using `npm run build`. Node 22.18+ recommended for the native TypeScript tests. No secrets are required for the demo.

## Content and integration status

Uploaded images are presented as supplied academy/apparel concept references. They include dimension annotations preserved from the originals. No testimonials, instructors, ranks, addresses, business hours, pricing, or offered programs have been invented. Program sections collect interests; actual offerings require confirmation. Sample classes are labeled. Contact details and coach profiles await verified content. SEO indexing is intentionally disabled in `app/layout.tsx` until business information is ready.

`lib/academy.ts` defines `SchedulingProvider`. Replace the demo with server-mediated availability and reservation calls to Cal.com, Calendly, Google Calendar, or another provider. Live booking must validate dates and contact details server-side, recheck availability, use provider idempotency and atomic reservation controls, and handle conflicts and provider failures. Current submission is browser-memory-only and returns `live: false`; it never sends email or makes a calendar event.

The receptionist uses an explicit scripted demo responder. To connect an LLM, add a server-only endpoint with a curated, verified academy knowledge base, rate limiting and input validation; stream its response to the chat UI. Keep provider keys server-side. Its booking action already opens the same booking flow.

The inquiry form only previews local input; connect a validated server-side mail/CRM route before renaming the submit action. It currently neither stores nor sends personal information. See `.env.example` for private integration configuration. Replace unconfirmed details and enable indexing only after review. Google Fonts are loaded with system font fallbacks; supplied images use Next.js image optimization.
