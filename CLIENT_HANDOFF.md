# CARIOX — account-independent engineering handoff

Branch: `codex/cloudflare-cms-meta-readiness`  
Baseline: `main` commit `4da844a`  
Prepared: November 6, 2026

## Current release status

The client subsequently authorized Vercel production deployment on November 6, 2026. Commit `497d132` was deployed successfully to https://cariox-smoky.vercel.app through `main`, with the instructor portrait, ten competition results, and no emoji decorations verified over HTTPS. The next authorized update replaces the sample week with the supplied 43-session timetable and corrected Gi/No-Gi rules; see [schedule provenance](./docs/schedule-content.md). Registration and the booking calendar remain demos. No Cloudflare migration, CMS connection, Meta activation, account creation, paid subscription, or DNS change is authorized by this content release.

## Official logo update

The client identified the schedule logo as the official artwork. `BrandLogo` now serves that green/gold artwork in desktop/mobile navigation, footer, about badge, instructor caption, chat, 404/error pages, browser/touch icons, and the social card. Four concept images were rebranded using the built-in image-editing tool. Historical source images remain, but the visible content uses new `*-branded.webp` files. See [saved assets and final prompt set](./docs/brand-update.md). The existing verified production origin is the social-metadata fallback when no custom origin is configured.

## Original readiness scope (historical)

The initial readiness work was isolated on the feature branch before the later release authorization. The original design, five image slots, 3D/perspective interactions, dialogs, gallery, local fonts, and responsive CSS remain. No production deployment, Worker upload, account/project creation, domain/DNS change, ad activation, paid subscription, or deletion of Vercel resources was performed. Vercel automatic Git deployments are disabled only for this feature branch in `vercel.json`; main is not disabled. Do not merge this branch as a substitute for an approved production release.

No real account IDs, business claims, Pixel IDs, access tokens, or external service credentials were invented. Numeric IDs and receipts in tests are explicitly synthetic unit fixtures; tests do not send them to external providers.

## Instructor and professional presentation update

The client supplied an instructor portrait and competition résumé after the readiness implementation. The instructor section now displays the optimized portrait with interactive depth and ten text-based results, including third place at Pan American and American National. Decorative emoji/star glyphs were removed from the homepage and chat. Existing functional SVG icons remain. Sanity supports editable competition results, and empty CMS instructor data retains the supplied profile. The instructor name/title and biography remain outstanding; the heading currently reads “Your instructor.” See [source details](./docs/instructor-content.md). No production deployment or localhost server was used.

Files for this follow-up: `components/content/InstructorSection.tsx`, `components/AcademyHome.tsx`, `components/Receptionist.tsx`, `app/globals.css`, `public/images/instructor-portrait.webp`, `lib/content/{types,fallback,resolve}.ts`, `lib/sanity/queries.ts`, `sanity/schemaTypes/instructor.ts`, `tests/{content.test.ts,interactions.test.tsx}`, `scripts/{audit-production,check-design-parity}.mjs`, `docs/instructor-content.md`, `SANITY_SETUP.md`, `README.md`, and this handoff.

## Implemented

### Cloudflare

- Supported OpenNext Workers adapter, Wrangler config, compatibility date/flags, asset/self bindings, build/dry-run/type-generation scripts, and Node 24 pin.
- Kept normal Next/Vercel build support. Workers builds use original optimized image assets without a paid Cloudflare Images binding. Vercel retains its native image optimizer.
- No shared ISR/cache storage is provisioned; configured CMS requests use SSR and Sanity CDN reads. An R2/queue/cache design is optional future work, not a hidden dependency.
- [Exact Cloudflare setup](./CLOUDFLARE_SETUP.md).

### Sanity

- Schemas for homepage, branding/photos, programs/classes, instructors, schedules, membership pricing, business information, announcements/promotions, and FAQs.
- Standalone Studio configuration, missing-settings preflight, singleton navigation, explicit published GROQ projections, hand-maintained typed query contracts, prepared TypeGen configuration, and runtime content validation.
- Server content loader with no-request behavior when unconfigured and checked-in fallbacks on partial/empty/malformed/offline content. Tokens never become browser props.
- Reusable content/heading/contact/pricing components and content bindings in the existing homepage, gallery, programs, FAQ, instructors, schedule, and wordmark.
- Approval gates, valid time zones, scheduled announcements, constrained image URLs, and safe public-origin parsing for metadata.
- [Exact Sanity setup](./SANITY_SETUP.md). No end-to-end CMS or owner Studio workflow is claimed yet.

### Meta

- Configurable Pixel loader, default OFF. No script before explicit marketing consent. Consent choices, expiry/version checks, GPC/DNT handling, revocation, queued-event clearing, and privacy-choice reopening.
- PageView per navigation; reusable Lead and CompleteRegistration helpers requiring authenticated server-verified live receipts. No demo event triggers.
- Repeated effect/receipt deduplication, opaque stable event IDs, and optional server-only CAPI preparation/sending with consent gates, identifier hashing, URL cleanup, and shared browser/server event IDs.
- CAPI remains disabled, unconfigured, uninvoked, and has no public forwarding endpoint.
- [Exact Meta setup and Test Events steps](./META_TRACKING_SETUP.md). Meta documentation endpoints returned 429 during research; account-backed verification remains mandatory.

### Registration, inquiries, and chatbot

- Typed real-provider contracts for verified availability, atomic registrations, inquiry delivery, authenticated status lookup, and AI responses.
- Closed API routes with JSON/body-size validation, same-origin checks, idempotency-key requirements for future submissions, generic errors, and no personal-data logging.
- Service registry contains no real adapters. Keys alone cannot activate it. Valid requests currently return HTTP 503 `NOT_CONNECTED`, never fake confirmation.
- Future live browser helpers verify results before using conversion utilities. They are not wired into current demo forms.
- Future AI knowledge builder excludes the illustrative schedule, unconfirmed program interests, and unapproved fallback FAQs. It does not fabricate an AI connection or a provider response.
- Confirmed gallery failure fix for unoptimized Workers images; previous photo remains visible while a requested view loads, with a bounded loading timeout.

## Actual feature status

| Feature | Works now | Still required for real business operation |
| --- | --- | --- |
| Website/3D/gallery/navigation | Existing interactive front end with fallbacks | Browser/device review on authorized staging with real CMS data |
| Booking calendar | Interactive browser-memory demo; no reservation or email | Owner-selected scheduling adapter, live availability, auth/session model, durable idempotency/capacity enforcement, provider-backed testing |
| Registration API/status | Validated disconnected architecture; returns 503 | Real provider, authenticated receipts/webhooks, persistence and conflict handling |
| Inquiry form | Prepares, edits, and copies a draft; does not send/store remotely | Actual CRM/mail adapter and owner-approved privacy/consent/data handling |
| Chat | Clearly labeled scripted demo | LLM/service provider, approved knowledge base, server secrets, rate limiting and budget controls |
| Sanity | Schemas, typed pipeline, fallbacks, prepared Studio | Existing owner project/dataset, auth/CORS, published approved content, editor/publish integration test |
| Meta Pixel | Configured consent/dedup code, default disabled | Real owner Pixel ID, authorized activation, consent review, Test Events |
| CAPI | Server-only optional payload/sender foundation | Verified provider callbacks, current server consent evidence, owner token/API version, Test Events and dedup diagnostics |
| Cloudflare hosting | Adapter builds and dry-run packages | Owner account, staging configuration/secrets, authorized deployment and runtime QA |
| Vercel production | Existing project retained; client authorized releases through main | Verify each release at cariox-smoky.vercel.app |

## What was actually tested

- Next.js production build and TypeScript checks under Node 24.
- Cloudflare/OpenNext production build and Wrangler `--dry-run`; no upload/deployment. The instructor update was rebuilt and dry-run packaged at about 8,233 KiB uncompressed / 2,034 KiB gzip; nothing was uploaded.
- Wrangler binding/runtime type generation. Generated global Workers declarations are excluded from the browser/Next type project to prevent conflicting global DOM types.
- 45 automated tests (including the 43-session transcription, Gi/No-Gi exceptions, schedule filters, instructor résumé, and CMS fallback behavior): validation; CMS schema compile and GROQ parse; absent/invalid/offline CMS; approval/fallback data; image URL/time-zone/metadata guards; booking/calendar flow; mobile menu and modal focus; FAQs; copy/edit inquiry; chat handoff; mouse/touch/reduced-motion depth; numbered panels; image loading/failure; disconnected APIs and fake-receipt rejection; consent/deduplication; CAPI no-send and hashing behavior.
- Outside the approved instructor/schedule sections, associated program/FAQ copy, footer schedule label, official logo replacements, and removed emoji glyphs, fallback visible text and DOM/class structure match the production baseline; all original visual/animation/responsive CSS bytes match the baseline. Additions are scoped to the instructor profile, plain separators, and consent UI (inactive by default).
- Production HTML audit: 26 structural WCAG checks pass; one h1, unique IDs, all section targets, and all 16 image placements resolve; all ten supplied competition results and all 43 weekly classes render, the Wednesday exceptions are Gi, and no emoji decorations appear in page copy; no annotated reference photos are shown. Preview indexing remains disabled and no metadata points at localhost.
- Complete dependency audit: zero known vulnerabilities after pinned security overrides. Build/Studio tooling is separate from runtime dependencies. Overrides for glob, minimatch, js-yaml, smol-toml, and undici must be reviewed against future upstream updates rather than silently removed or replaced by `npm audit fix --force`.
- Sanity schema compile works offline. A missing-settings Studio preflight intentionally exits with a clear error. No successful owner-project Studio login/publish cycle has been tested.

Not performed: real Cloudflare Worker execution; actual Sanity project/media/CORS/publish tests; Meta Events Manager/Pixel Helper tests with a real ID; real mail/calendar/LLM calls; real-device screenshots, cross-browser visual testing, Lighthouse/Core Web Vitals, or production load testing. No localhost server was started. Vercel production publication was separately authorized after the original readiness work. DOM/CSS parity and interaction tests do not substitute for an authorized staging browser/device pass.

## Exact remaining sequence

1. **Review the current release and feature branch.** Vercel main-branch releases are now authorized for the supplied content updates. Use Node 24 and `npm ci`; keep flags off and IDs/tokens blank until actual access arrives.
2. **Collect owner facts and access.** Obtain existing Cloudflare account access, Sanity project ID/dataset/editor/read permissions, Meta data-source access/Pixel ID, approved business details/programs/instructors/schedule/pricing/images, and the chosen booking/contact/AI providers. Do not infer the academy time zone or claim a free offer without approval.
3. **Configure and populate Sanity.** Fill the public project/dataset and separate Studio pair in ignored local/deployment environment settings; add a server-only read token only if necessary. Build Studio, configure authorized origins, create/publish approved documents, run TypeGen, and test full edit/publish/fallback behavior as documented in `SANITY_SETUP.md`.
4. **Implement real service adapters.** Replace the empty registry with the owner's selected providers. Add real authentication/receipt authorization, verified webhooks where applicable, live slot/capacity checks, durable idempotency, rate limits/bot controls, error recovery, and persistent consent evidence. Do not relabel the demo UI as live until the actual provider has been tested. Connect `buildAcademyKnowledge` to an actual server-side AI adapter only after verified business data and provider access exist.
5. **Authorize a staging deployment.** Follow `CLOUDFLARE_SETUP.md`: confirm account/name, set BOTH self-reference/name consistently, supply build/runtime settings and secrets, explicitly choose a staging URL, run checks, and only then deploy if the owner authorizes it. No DNS or production traffic switch is required for that staging test.
6. **Test real flows in staging.** Use real provider sandbox/test modes where available. Check successful, failed, expired, concurrent, duplicate, and unauthorized bookings, actual inquiry delivery, and real AI failures. Verify desktop/mobile layouts, all existing depth/interactions, image/CDN errors, keyboard/accessibility, metadata, runtime limits, and measured performance.
7. **Connect Meta in authorized test mode.** Set a real Pixel ID with explicit enablement, validate opt-in/revoke/GPC, and inspect PageView in Test Events. Check zero conversions for every demo/failed/pending operation. Only after verified provider flows exist should Lead/CompleteRegistration be exercised. If CAPI is needed, configure secret access/version/test code, match event IDs, verify deduplication, and recheck server-side consent. Then remove test codes before any separately approved live activation.
8. **Obtain final business/release approval.** Review real data processing/privacy information, remove only the demo labels that are genuinely obsolete, and decide when indexing may be enabled. A production migration, deployment, custom domain/DNS change, paid plan, or ad campaign remains a separate authorized action. Retain the current Vercel deployment unless the owner later requests otherwise.

## External services and payment

No paid service was subscribed to or provisioned. Source preparation, local builds, schema compile, unit tests, and dry runs require no owner accounts. The implementation does not require paid Cloudflare Images, R2, KV, D1, a new database, a new CRM, an LLM vendor, or any ad spending.

Actual hosting traffic, Sanity seats/storage/API usage, scheduling/email/CRM providers, and an LLM can have account-specific limits or charges. Use the owner's existing services where suitable and obtain approval before paid activation. The free/paid tier choice and actual API budgets cannot be verified without the owner's account information. Meta account/data-source access and event testing are distinct from paying for advertising; no campaigns were created here.

## Reproduce account-free checks

With public Sanity settings blank and Meta disabled:

```sh
nvm use
npm ci
npm run typecheck
npm test
npm run build
npm run audit:design
npm run audit:production
npm run cf:build
npm run cf:check
npm run cf:types
npm audit
```

`npm run studio:build` is intentionally blocked by preflight until the owner's Studio project and dataset settings exist. After they are supplied it is a build command, not a deployment command. No deployment script is attached to these checks.

## Changed files

The following inventory covers changes relative to the baseline. `.open-next/`, `.wrangler/`, generated binding types, local secret files, and Studio build output are ignored and are not part of the handoff commit.

- `.env.example`
- `.gitignore`
- `.nvmrc`
- `CLIENT_HANDOFF.md`
- `CLOUDFLARE_SETUP.md`
- `META_TRACKING_SETUP.md`
- `SANITY_SETUP.md`
- `app/api/chat/route.ts`
- `app/api/contact/route.ts`
- `app/api/contact/status/route.ts`
- `app/api/registration/availability/route.ts`
- `app/api/registration/route.ts`
- `app/api/registration/status/route.ts`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `components/AcademyHome.tsx`
- `components/FirstVisit.tsx`
- `components/GalleryDialog.tsx`
- `components/GalleryShowcase.tsx`
- `components/Navigation.tsx`
- `components/ProgramExplorer.tsx`
- `components/content/BusinessContact.tsx`
- `components/content/ContentHeading.tsx`
- `components/content/ContentProvider.tsx`
- `components/content/MembershipPricing.tsx`
- `components/tracking/MarketingConsent.tsx`
- `lib/config/site.ts`
- `lib/content/fallback.ts`
- `lib/content/load-published.ts`
- `lib/content/load.ts`
- `lib/content/resolve.ts`
- `lib/content/types.ts`
- `lib/gallery.ts`
- `lib/sanity/env.ts`
- `lib/sanity/queries.ts`
- `lib/services/browser.ts`
- `lib/services/contracts.ts`
- `lib/services/handlers.ts`
- `lib/services/http.ts`
- `lib/services/knowledge.ts`
- `lib/services/registry.server.ts`
- `lib/tracking/capi-payload.ts`
- `lib/tracking/capi.server.ts`
- `lib/tracking/client.ts`
- `lib/tracking/consent.ts`
- `lib/tracking/contracts.ts`
- `lib/tracking/engine.ts`
- `next.config.ts`
- `open-next.config.ts`
- `package-lock.json`
- `package.json`
- `public/_headers`
- `sanity-typegen.json`
- `sanity.cli.ts`
- `sanity.config.ts`
- `sanity/schemaTypes/announcement.ts`
- `sanity/schemaTypes/branding.ts`
- `sanity/schemaTypes/businessInformation.ts`
- `sanity/schemaTypes/faq.ts`
- `sanity/schemaTypes/homepage.ts`
- `sanity/schemaTypes/index.ts`
- `sanity/schemaTypes/instructor.ts`
- `sanity/schemaTypes/membershipPrice.ts`
- `sanity/schemaTypes/programs.ts`
- `sanity/schemaTypes/schedule.ts`
- `sanity/schemaTypes/shared.ts`
- `scripts/check-design-parity.mjs`
- `scripts/check-sanity-env.mjs`
- `tests/capi-safety.test.ts`
- `tests/content.test.ts`
- `tests/fixtures/home-baseline.json`
- `tests/interactions.test.tsx`
- `tests/services.test.ts`
- `tests/tracking-browser.test.ts`
- `tests/tracking.test.ts`
- `tsconfig.json`
- `vercel.json`
- `wrangler.jsonc`

Node 24 was used for verification via the npm-provided runtime on this machine. If NVM is not installed, use an existing supported Node 24 installation, or prefix a command with `npm exec --yes --package=node@24 --` (for example, `npm exec --yes --package=node@24 -- npm test`). No system runtime was replaced.
