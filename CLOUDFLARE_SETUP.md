# CARIOX website on Cloudflare Workers

The `cariox` Worker is connected to `Nefisauan/cariox`, production branch `main`. Cloudflare builds and publishes the website from GitHub. No localhost server, local production build, or Vercel redeploy is required. Vercel's Git deployments are disabled in `vercel.json`; its previous deployment is retained as a fallback during the cutover.

| Cloudflare build setting | Value |
| --- | --- |
| Root directory | `/` |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Deploy command | `npm run cf:deploy` |
| Node / npm | Node 24 from `.nvmrc`; exact npm version from `packageManager` |

The npm pin addresses the dependency-install failure in Workers Builds with npm 10. OpenNext runs Next.js and produces `.open-next/worker.js` and the static assets referenced by `wrangler.jsonc`. The Worker name and self-reference must both match `cariox`. No paid Images or shared cache bindings are required.

The assigned public hostname is [cariox.evan-7a6.workers.dev](https://cariox.evan-7a6.workers.dev/). Before connecting a custom domain, check the home page, media, gallery, schedule, and that unconfigured trial submissions return 503. To use a custom hostname in a zone you control, choose **cariox → Settings → Domains & Routes → Add → Custom Domain** and follow Cloudflare's prompts. Set the build variable `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and rebuild for correct canonical and social URLs. No custom domain or DNS records are added by the repository.

Build variables prefixed with `NEXT_PUBLIC_` are compiled into the browser code. Add private runtime values as Cloudflare Worker secrets; never set Resend keys or recipient addresses on the website Worker. The independent trial Worker and D1, email, CMS, and tracking activation steps are in [LAUNCH_SETUP.md](./LAUNCH_SETUP.md). Domain connection does not open trial submissions by itself.

References: [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [npm lockfile troubleshooting](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/), and [OpenNext deployment](https://opennext.js.org/cloudflare/howtos/dev-deploy).
