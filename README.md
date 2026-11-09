# CARIOX — Brazilian Martial Arts

Existing Next.js / React / TypeScript academy design, with account-independent Cloudflare, Sanity CMS, and Meta tracking readiness on `codex/cloudflare-cms-meta-readiness`.

The original 3D/perspective interactions, photography, responsive CSS, and fallback content are preserved. The client subsequently authorized Vercel production deployment through `main`. Vercel Git deployments remain disabled only for the feature branch. No external accounts were created.

The official green-and-gold logo supplied in the class schedule now replaces the prior text-only marks in the website UI, browser icons, share image, and concept mockups. See [brand assets and edit provenance](./docs/brand-update.md).

For the latest free-trial, D1, Resend, CMS and tracking activation instructions, start with [LAUNCH_SETUP.md](./LAUNCH_SETUP.md). Earlier readiness notes below are retained for the other integrations.

Read the engineering handoff:

- [CLIENT_HANDOFF.md](./CLIENT_HANDOFF.md) — implemented features, changed files, actual QA, demos, costs, and exact remaining steps.
- [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) — OpenNext/Workers build and non-deploying checks; future owner-authorized setup.
- [SANITY_SETUP.md](./SANITY_SETUP.md) — schemas, typed content, fallbacks, Studio preflight, and real-project connection.
- [META_TRACKING_SETUP.md](./META_TRACKING_SETUP.md) — consent, event semantics, verification/deduplication, optional CAPI, and Events Manager testing.
- [.env.example](./.env.example) — blank owner identifiers/secrets; tracking disabled by default.

## Account-free commands

Use Node 24 (`nvm use`), then `npm ci`.

```sh
npm run typecheck
npm test
npm run build
npm run audit:production
npm run audit:design
npm run cf:build
npm run cf:check
npm run cf:types
npm audit
```

No localhost server is required or started by these commands. `cf:check` uses Wrangler's dry-run bundler and does not upload. Studio build/type generation needs the owner's actual Studio project ID and dataset; `studio:build` intentionally stops when they are absent.

## Content and integration boundaries

The server fetches published Sanity content only when both public project settings exist; otherwise the current checked-in content is used without a CMS request. Missing/invalid/offline content retains fallbacks. The supplied 43-session schedule and corresponding program descriptions are approved fallback content; see [schedule transcription and uniform rules](./docs/schedule-content.md). Prices, business contacts, and promotions still need approved published data. The supplied instructor portrait and competition record are included as fallback content; confirmed CMS profiles can replace them. See [instructor content provenance](./docs/instructor-content.md). The supplied concept imagery and original dimension-free edits remain; see [image edit details](./docs/image-edits.md).

Free-trial requests replace the public calendar demo. Trial submission stays closed until the Worker, D1 and Resend are connected. General inquiries are local drafts and chat replies are scripted. New live API contracts are disconnected and return 503, never false success. No demo action sends a Lead or CompleteRegistration event. Marketing tracking requires a real configured Pixel and explicit consent; optional CAPI has no active call site. There are no client-side API secrets.

Search indexing stays disabled while business details/live services are unverified. Set `NEXT_PUBLIC_SITE_URL` to a confirmed HTTPS origin before a future release. Fonts are locally served WOFF2 files with open licenses in `docs/licenses/`. Production dependencies contain only application runtime packages; Studio/OpenNext tooling remains in development dependencies. Pinned transitive security overrides are recorded in `package.json` and must be retested when upgrading.

Earlier visual-review notes remain in `docs/client-handoff.md` as a historical record. They are superseded for this readiness branch by the root `CLIENT_HANDOFF.md`.

Node 24 was used for verification via the npm-provided runtime on this machine. If NVM is not installed, use an existing supported Node 24 installation, or prefix a command with `npm exec --yes --package=node@24 --` (for example, `npm exec --yes --package=node@24 -- npm test`). No system runtime was replaced.
