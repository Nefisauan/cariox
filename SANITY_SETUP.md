# Sanity CMS readiness

For the latest launch flow, see [LAUNCH_SETUP.md](./LAUNCH_SETUP.md). The earlier integration notes follow.

## Available now

`sanity/schemaTypes/` contains schemas for homepage, branding, academy photos, programs, classes, instructors, weekly schedules, membership pricing, business information, announcements/promotions, and FAQs. References connect class → program/instructor and schedule → class. Owner approval and active/published fields keep unconfirmed offers, prices, and profiles out of public queries. Scheduled promotions are also checked against start/end dates in the content resolver.

`sanity.config.ts` and `sanity.cli.ts` configure a standalone Studio. No Studio/account was created or deployed. Studio deliberately reports a missing-configuration error rather than using an invented project ID or connecting to someone else's project. No Studio JavaScript is added to the homepage.

`lib/sanity/queries.ts` defines a typed, published-perspective GROQ query using Sanity’s `groq` `defineQuery`. The runtime uses `@sanity/client` directly so the standalone Studio/CLI remains build tooling rather than part of the public application dependency path. `lib/content/types.ts` supplies runtime schemas and inferred TypeScript content types. Query payloads are treated as untrusted and normalized before becoming client props. Missing, invalid, empty, or unavailable CMS values retain existing fallback copy and photos. Optional pricing/business/promotion data is hidden until valid, approved information exists. The client-supplied instructor portrait and competition record remain as fallback until valid, approved CMS profiles replace them.

`lib/content/fallback.ts` contains the current major homepage copy, five photograph slots, program-interest panels, branding, FAQs, the supplied instructor profile, and the approved timetable. The client-supplied 43-session timetable and corresponding program descriptions are approved fallback content. Empty or invalid CMS schedules retain that timetable. The booking calendar remains explicitly a demo. `ContentProvider`, `ContentHeading`, `ContentLines`, `BusinessContact`, `InstructorSection`, and `MembershipPricing` are reusable data-driven components; existing galleries, FAQ panels, navigation/wordmark, programs, schedule, and instructor content consume the same typed content. Nothing in a CMS document can confirm a booking or enable marketing tracking.

Without configuration, loading stops before constructing a Sanity client and no Sanity network request is attempted. With configuration, the server uses a short-timeout read-only published query and falls back on failure. Tokens are server-only. Website data does not contain API credentials or unpublished drafts.

## What has and has not been tested

All schema types compile offline. Tests cover missing config, empty/partial/invalid documents, malicious image URLs, retained photo slots, invalid time zones, and expired/future promotions. The GROQ query is parsed offline. Fallback text and element/class structure outside the approved instructor update and removed emoji decorations are compared against the original main-branch fixture; all original CSS bytes remain unchanged. See `docs/instructor-content.md` for the supplied results and outstanding name/biography details.

No account authentication, actual dataset fetch, media upload, Studio login, CORS configuration, editor workflow, publish-to-website cycle, private-dataset access, or Sanity TypeGen against a configured Studio has been validated. The CMS is **not claimed to work end to end** yet.

## Exact owner steps

1. Get the owner's existing project ID, dataset name, intended public/private access, and Studio/editor permissions. Confirm any billing limits. Do not create a project or dataset automatically.
2. Copy `.env.example` to ignored `.env.local`. Fill `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`; set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` to the same real project/dataset for the CLI. Project IDs and dataset names are public settings, not API secrets.
3. For a private dataset only, provide a least-privilege read token as `SANITY_API_READ_TOKEN` in the server secret environment. Never put read or write tokens in a public variable. Editors authenticate in Studio through Sanity, not a public write token.
4. Run `npm run studio:build`. When project settings exist, this compiles the standalone Studio into ignored `studio-dist/`; it does not deploy it. Decide where the owner wants Studio hosted later. No `/studio` route has been exposed in the production website.
5. Review and, when authorized, configure the owner's permitted Studio/website origins in Sanity Manage. Keep credentialed CORS origins restricted to actual approved origins. Do not add wildcard origins.
6. Use the singleton navigation for documents with IDs `homepage`, `branding`, and `businessInformation`. Add one approved photo for each key: `academy`, `reception`, `performance`, `lounge`, `collection`. Keep meaningful alt text. Use only imagery approved for public representation of the real facility.
7. Populate actual programs, instructors (including the supplied competition results and confirmed full name), classes, schedules (including the confirmed academy IANA time zone), prices/currency, business contacts, promotions/terms, and FAQs. Set `confirmed` and `active` where applicable, plus `enabled` for photos/FAQs. Publish approved documents. No credentials, private client records, or reservations belong in this public-content schema.
8. Rebuild with the real settings. Verify each section with published data and again with empty/unpublished/invalid content. Break the CMS connection deliberately in staging to verify fallbacks. Confirm no draft content or token appears in client bundles.
9. Run `npm run studio:typegen` once the Studio configuration is valid. `sanity-typegen.json` is prepared for schema extraction/query types. Until then the implementation uses explicit query-result contracts plus Zod validation; it does not pretend generated account-backed types exist.
10. Test the complete editor → publish → staging website path. Current requests use the Sanity CDN plus uncached server reads; there is no webhook/live-preview/ISR integration to claim. Add those only if an actual editing requirement warrants them.

The static fallback build remains available with both public Sanity values blank. A CMS configuration change must be rebuilt/redeployed later; readiness work itself performs no deployment.

## Sources

- [Typed queries in Next.js](https://www.sanity.io/docs/nextjs/query-content-nextjs)
- [Sanity Studio environment variables](https://www.sanity.io/docs/studio/environment-variables)
- [Sanity Next.js client configuration](https://www.sanity.io/docs/nextjs/configure-sanity-client-nextjs)

- [Sanity GROQ/TypeGen guidance](https://www.sanity.io/docs/developer-guides/an-opinionated-guide-to-sanity-studio) documents the direct `groq` `defineQuery` helper used here.
