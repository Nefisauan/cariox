# Cloudflare Workers readiness

For the latest launch flow, see [LAUNCH_SETUP.md](./LAUNCH_SETUP.md). The earlier integration notes follow.

## Implemented, without account access

This remains a Next.js 16 App Router application with React and TypeScript. The interactive page moved to `components/AcademyHome.tsx`; a server page now loads CMS content. Native dialogs, CSS perspective, cursor tilt, galleries, local fonts, and mobile styles are retained. Vercel's normal `npm run build` path remains supported.

The supported Workers path is **OpenNext**, not the deprecated `next-on-pages` adapter. Dependencies are locked in `package-lock.json`: `@opennextjs/cloudflare` and Wrangler. Current installed versions and Next.js 16.4.5 were verified together. Use Node 24 (`.nvmrc`); the host Node 25 is outside a Sanity dependency's supported engines. Node 24 was used for verification.

`wrangler.jsonc` defines only the asset binding and the documented Worker self-reference. It contains no account ID, zone, domain route, R2 bucket, KV namespace, database, secret, or paid Images binding. The local planned name `cariox-readiness` is not an existing external resource. `workers_dev` and preview URLs are disabled. Compatibility date `2026-11-06` enables Node compatibility by default under current Workers documentation; `global_fetch_strictly_public` is included.

`open-next.config.ts` uses the default adapter without shared incremental cache infrastructure. Once Sanity is configured, `connection()` and uncached published queries use server rendering; Sanity's CDN handles content delivery caching. No ISR/webhook invalidation claim is made. If shared ISR is wanted later, deliberately design and approve its R2/queue/cache bindings and billing first.

## Images and assets

`cf:build` sets `CLOUDFLARE_BUILD=1`, making Next Image use existing source assets on Workers. This avoids a required Cloudflare Images subscription and a broken `/_next/image` optimizer without a binding. The supplied clean WebP/JPEG images and visual composition are preserved. On Vercel, leave that variable unset: the standard Next optimizer remains active. Sanity image requests are restricted to the Sanity CDN; the content layer validates URLs as well. `public/_headers` adds immutable caching for hashed Next assets and bundled fonts.

## Commands that do not deploy

```sh
nvm use
npm ci
npm run typecheck
npm test
npm run build
npm run audit:production
npm run audit:design
npm run cf:build
npm run cf:check
npm run cf:types
```

`cf:check` is explicitly `wrangler deploy --dry-run`: it bundles locally, does not upload, and exits. No preview/dev server was started. Build output is ignored under `.open-next/`; generated Wrangler types and local secrets are ignored too.

Observed dry-run size before final documentation-only changes: about 8,230 KiB uncompressed / 2,033 KiB gzip. No runtime latency, Worker startup, CPU quota, or live routing result has been claimed. Cloudflare's current size limit is based on uncompressed size; verify current account quotas and billing rather than using the old 3 MB / 10 MB compressed limits.

## Exact owner steps remaining — do not execute automatically

1. Obtain access to the **existing** owner Cloudflare account and confirm the intended deployment account, staging Worker name, and budget. Do not create an account, enable paid products, or edit DNS as part of readiness work.
2. Use Node 24 and `npm ci`. Review the feature branch before merging anything. The production Vercel project and deployment remain untouched.
3. Authenticate through the owner's authorized workflow (`npx wrangler login`, or a least-privilege API token in the deployment environment). Run `npx wrangler whoami` and confirm the account. Set `CLOUDFLARE_ACCOUNT_ID` when needed; keep tokens secret and out of JSON/Git.
4. Edit BOTH `name` and `services[0].service` in `wrangler.jsonc` to the same approved **staging** Worker name. For an authorized staging URL, explicitly enable `workers_dev`; current config intentionally exposes no URL. Leave domain routes absent.
5. Supply approved build variables and server runtime secrets. Public Next variables must be set for the build; server Sanity/CAPI tokens belong in Wrangler secrets. Never put secrets in `NEXT_PUBLIC_*`. Use `npx wrangler secret put SANITY_API_READ_TOKEN` only if a private dataset needs it. Use no CAPI secret until that optional feature is approved.
6. Run the non-deploying checks above. Confirm CMS failure still renders fallbacks, consent denial loads no Pixel, and disconnected API endpoints remain honest.
7. Only after separate staging-deployment authorization, run `npm run cf:build`, then `npx opennextjs-cloudflare deploy`. This command was **not** run during implementation. Test staging desktop/mobile rendering, animations, image loading, runtime environment access, headers, forms, and routing.
8. Retain Vercel as the current production host. A production migration, traffic switch, custom domain, DNS, cache storage, or paid service needs a separate owner-approved action. Remove/adjust no existing Vercel deployment.

`vercel.json` disables Git deployments **only for this readiness branch**, so pushing it should not cause even a preview deployment. It does not disconnect Vercel or disable main. Do not merge or manually deploy this branch without review.

## Sources

- [OpenNext setup and compatibility](https://opennext.js.org/cloudflare/get-started)
- [Cloudflare Next.js guidance](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)
- [OpenNext image options](https://opennext.js.org/cloudflare/howtos/image)
- [OpenNext caching](https://opennext.js.org/cloudflare/caching)
- [Current Worker size limits change](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/)
- [Vercel branch deployment controls](https://vercel.com/docs/project-configuration/git-configuration)

Node 24 was used for verification via the npm-provided runtime on this machine. If NVM is not installed, use an existing supported Node 24 installation, or prefix a command with `npm exec --yes --package=node@24 --` (for example, `npm exec --yes --package=node@24 -- npm test`). No system runtime was replaced.
