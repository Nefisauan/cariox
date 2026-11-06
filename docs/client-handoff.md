# CARIOX — client delivery review

Reviewed November 6, 2026. Scope: repository implementation and competitor research. No localhost server was started. This is a polished academy preview, with live booking, contact delivery, and business information still awaiting confirmation.

## Competitive review

Sources checked directly:

- [Wolves Den Jiu Jitsu](https://www.wolvesdenjiujitsu.com/): prominent paths into its programs, founder introductions, academy locations, and repeated first-class booking actions. CARIOX’s opportunity is to pair its distinctive physical space with a visitor journey that is equally clear.
- [Crown BJJ](https://www.crownbjj.com/): visible schedule access, first-visit guidance, FAQs, and persistent mobile booking. CARIOX now offers clearer first-visit guidance and a persistent mobile visit action while retaining its own identity.
- [Gracie Barra Orem](https://graciebarraorem.com/): showed a maintenance page at the time of review. A reliable design comparison was unavailable.

The sites’ business claims were treated as their own published information. No competitor reviews, credentials, class offerings, pricing, addresses, or policies were copied into CARIOX.

## Changes completed

- Refined spacing, type hierarchy, color contrast, button sizes, image composition, and consistent typography. Replaced the remote font dependency with locally served WOFF2 files and included their licenses.
- Added a layered lounge photograph to the desktop hero and a second action to explore the academy.
- Added philosophy notes, useful first-visit guidance, and accessible expandable FAQs. Replaced the empty testimonial area with CARIOX philosophy copy rather than invented reviews.
- Added a native-dialog mobile menu with focus and scroll restoration, a reading-progress indicator, footer navigation, and a mobile visit action. Touch and reduced-motion fallbacks remain.
- Improved the booking preview with progress steps, calendar styling, session summaries, async error handling, bounded contact inputs, valid-date checks, past-date rejection, and truthful demo receipts.
- Fixed chat keyword matching, added useful booking/location replies, prevented initial focus theft, supported Escape, and bounded conversation history. Replies remain transparently scripted.
- Made inquiries copyable and editable without sending or storing visitor details. Added a fallback message when clipboard access is unavailable.
- Preserved the fixed 1–2–3 program panels, persistent gallery transitions, image-failure handling, zoom, and photographic depth. Gallery images now load lazily instead of all competing with the hero.
- Added matching 404 and recoverable-error screens, plus a branded favicon and social-card route. Canonical/social URLs use a confirmed HTTPS origin from configuration; the build does not create localhost links in metadata.

## Verification

- Production build and TypeScript validation pass.
- 14 automated validation and DOM interaction tests pass, including booking end to end, modal focus restoration, mobile menu behavior, inquiry edit/copy, FAQs, chat handoff, numbered panels, and photo transitions/errors.
- 24 WCAG structural accessibility checks pass through axe-core on the production HTML. This excludes browser-dependent layout and contrast checks; it is not a claim of complete WCAG conformance.
- All local section links resolve, IDs are unique, the page has one h1, all 11 visible image placements resolve to repository assets, and annotated originals are absent from visible placements.
- Branded 404 output and the 1200 × 630 social-card output were checked in the production build.
- `npm audit --omit=dev --audit-level=moderate` reports zero known production dependency vulnerabilities as of this review.
- Key solid-background text color pairs were checked numerically. No Lighthouse, Core Web Vitals, cross-browser, or real-device performance score has been claimed.

## Required before public launch

1. Supply the confirmed academy name/affiliation approval, programs and age groups, pricing or inquiry policy, instructor names/photos/ranks/bios, address, contact details, operating hours, social links, and approved real class schedule.
2. Confirm the first-visit offer before advertising a free class. Calls to action currently say “Plan your first visit”; the calendar is explicitly a preview.
3. Connect booking to a real provider, with server-side validation, live availability, idempotency and conflict handling. Connect contact delivery and the receptionist’s verified knowledge base. Test real submission and failure paths. No demo receipt should be relabeled as a real confirmation.
4. Confirm how the supplied academy/apparel concept imagery may be presented. Original reference images include concept layouts and are labeled accordingly in the gallery.
5. Provide the deployed URL, set `NEXT_PUBLIC_SITE_URL`, and perform desktop/mobile/browser visual and keyboard QA there. Browser security in this session blocked opening an offline file, and no deployment URL was supplied. Responsive CSS and DOM behavior have been reviewed; actual browser rendering of CARIOX has not been verified.
6. Review the site’s final data handling and publish accurate privacy/consent information for the actual connected services. Keep the current “nothing is sent or stored” notices only while they remain true.
7. Once verified content, live services, and browser QA are complete, remove preview labels where appropriate, enable indexing in `app/layout.tsx`, and submit the confirmed domain to search tools.

## Reproduce checks

```sh
npm ci
npm run build
npm test
npm run audit:production
npm audit --omit=dev --audit-level=moderate
```

`npm run build` includes TypeScript validation. Tests simulate DOM behavior; they do not run a web server or contact calendar, mail, or AI providers.
