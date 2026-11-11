# CARIOX launch setup

The website deploys to the `cariox` Cloudflare Worker. See [hosting setup](./CLOUDFLARE_SETUP.md). Trial requests go through the existing site origin to an authenticated Cloudflare Worker. The Worker saves each request to private D1 storage before returning a confirmation, then sends one email addressed to the configured owners through Resend. A failed email leaves the saved request available for recovery. The site and all tracking work in a safe disabled state until their respective services are configured.

## 1. Save leads and deliver email

1. The repository's `wrangler.trial.jsonc` points to the production `cariox-trials` D1 database. Apply `0001_trial_leads.sql` and `0002_preferred_time.sql` in order before deploying the trial Worker. For a separate test environment, copy `wrangler.trial.example.jsonc` to the ignored `wrangler.trial.local.jsonc`, change the Worker name and set the test database name and ID. Apply migrations with `npx wrangler d1 migrations apply LEADS_DB --remote --config wrangler.trial.local.jsonc` from an authenticated Wrangler CLI. Keep D1 access limited to authorized operators. [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).
2. The production `cariox-trial` Worker is deployed from `Nefisauan/cariox` through Cloudflare Workers Builds. Its production branch is `main`, its build command is `npm run typecheck`, and its deploy command is `npm run cf:trial:deploy`. Preview builds are off. The Worker has no public URL and has a ten-minute email retry trigger. The website's `wrangler.jsonc` defines its private `TRIAL_SERVICE` binding. [Cloudflare service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/).
3. Open a gym-owned [Resend account](https://resend.com/). Add a sending domain or subdomain that the gym controls; add the DNS records shown by Resend and wait for verification. Create a key restricted to sending from that verified domain. Pick a sender address on the domain. The recipients can use any valid email domain. [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction).
4. Generate a unique shared secret with `openssl rand -hex 32`. Keep it in a password manager. Set the trial Worker's secrets in **Settings → Variables and Secrets**, or run `npx wrangler secret put VARIABLE_NAME --config wrangler.trial.jsonc` for each secret. Set the owner-approved notification recipients, separated by commas if there is more than one. Never paste the key or secret into chat or commit it.

   | Worker setting | Value |
   | --- | --- |
   | `LEADS_DB` | Actual D1 binding in the Wrangler config |
   | `TRIAL_WORKER_SECRET` | Shared secret used only by the site server and Worker |
   | `RESEND_API_KEY` | Domain-scoped sending key |
   | `TRIAL_FROM_EMAIL` | Plain sender address on the verified domain |
   | `TRIAL_NOTIFY_EMAILS` | One or more distinct owner addresses, comma-separated |

5. Set `TRIAL_WORKER_SECRET` as a runtime secret on the website Worker with the same value as on the trial Worker. Leave `TRIAL_WORKER_URL` unset on Cloudflare. Keep production closed during testing. In the test environment, use the corresponding test Worker binding and set `TRIAL_LEADS_ENABLED=true` as a runtime setting. If setting the flag in the dashboard, use a secret so subsequent Git deployments retain it. Keep Resend credentials and recipients on the trial Worker only.
6. Submit a real test lead with permission, choosing more than one interest. Confirm the visitor sees the coordination message, D1 has one row, and the configured recipients receive the details. In Resend, check delivery or bounce status for each recipient; the Worker’s accepted notification ID does not guarantee inbox delivery. Repeat an identical test request with the same idempotency key to check it still has one row and one notification. Turn the production feature flag on and redeploy only after the configured flow is verified.

Inspect status in the D1 console without retrieving contact details:

```sql
SELECT event_id, datetime(created_at, 'unixepoch') AS saved_at,
       attempts, notification_id, datetime(notified_at, 'unixepoch') AS accepted_by_mail_provider_at
FROM trial_leads ORDER BY created_at DESC LIMIT 30;
```

To recover a request that never reached an inbox, find its reference in D1 and Resend. Follow up using the saved record; a missing provider ID means the system has not recorded provider acceptance. The Worker retries pending notifications with backoff, up to eight attempts and within 23 hours of the first attempt. After that it leaves the row for manual review to avoid blindly resending beyond [Resend’s idempotency window](https://resend.com/docs/dashboard/emails/idempotency-keys). Keep private lead access and retention under the owners’ control. No public lead-listing endpoint exists.

## 2. Give both owners access to edit the site

1. The gym confirmed [Sanity project `bj74aamw`](https://www.sanity.io/manage/project/bj74aamw) and its public `production` dataset. Keep lead details and credentials out of the dataset. In Sanity, create a project-scoped token with permission to write content and deploy Studio. Add it under **GitHub → CARIOX → Settings → Secrets and variables → Actions → New repository secret** as `SANITY_AUTH_TOKEN`. [Studio CI deployment](https://www.sanity.io/docs/studio/deployment#host-with-sanity-in-a-cicd-flow).
2. On GitHub, open **Actions → Publish CARIOX Studio → Run workflow**, select `main`, choose the Studio subdomain, and check **Import website content and images** on the first run. GitHub builds Studio remotely. The import includes existing text, gallery images, the logo, instructor, classes, and all 43 timetable slots. The `--missing` import preserves existing documents with matching IDs. Later releases can leave seeding off. [Sanity import guide](https://www.sanity.io/docs/content-lake/importing-data).
3. Open the published Studio and verify the content. Under **Sanity Manage → project → Members**, invite each owner individually with editing permission. On the Free plan, Administrator has edit rights and Viewer does not. Use Editor when available on the selected plan. Confirm both owners can sign in. [Studio deployment and invitations](https://www.sanity.io/docs/deploying-studio-and-inviting-editors).
4. The website Worker reads the confirmed public `production` dataset using the variables in `wrangler.jsonc`. Empty or unavailable content falls back to the bundled website content. For a private dataset on a plan that supports one, add `SANITY_API_READ_TOKEN` as a **server-only, read-only** secret. Do not add write tokens to the website Worker or browser variables.
5. In Studio, open **Homepage** for headings, copy, the Explore button and schedule display. **Academy photos** controls the five gallery slots and their alt text. **Programs**, **Classes**, and **Weekly schedule** manage descriptions, formats and times. Use **Homepage → Schedule display → Show class times** to hide the preliminary timetable. **Instructors** controls the portrait and biography. **Branding**, **FAQs** and other sections work the same way. Publish a small approved change and verify it on the site; drafts are not public. An empty or unavailable CMS retains the bundled content rather than blanking the site.

The trial request form shows the published timetable as an optional date and class picker. The email notification includes any selected time for the gym to confirm with the visitor.

When the gym has a booking service, set its free-trial classes, available times, capacity, and confirmations there. In **Studio → Homepage → Online class booking**, paste the provider’s public HTTPS booking link. To show the calendar in the trial dialog, add the provider’s iframe URL to **Calendar embed link**. Use the URL from the provider’s embed settings and allow `carioxgym.com` in the provider’s settings if it asks for allowed sites. Turn on **Enable online class booking** and click **Publish**.

The embedded calendar handles availability, booking details, and reservation confirmations. Visitors can also open the standalone booking page or expand the trial request form to ask for help. Verify date and time selection, one test reservation, and the provider’s confirmation on desktop and mobile. Clear the embed field and publish to send visitors directly to the booking page. Turn off the switch and publish to use the trial request form as the default. The weekly timetable is edited separately in Studio. Configure booking conversion tracking in the provider if needed.

## 3. Connect conversion tracking

Choose **GTM** (recommended for owner-managed tags) **or direct tags**. Both modes require opt-in. The site sends one event per accepted, persisted request; clicks, validation errors and failed saves never count. Lead payloads contain no name, email, phone, or interests. Existing Meta-only consent is not reused for the expanded tracking setup.

**GTM:** Create a web container and set `NEXT_PUBLIC_GOOGLE_TAG_ENABLED=true` and `NEXT_PUBLIC_GTM_CONTAINER_ID` in the website Worker’s build variables. A valid enabled container suppresses the app’s direct tags. Redeploy. In GTM:

- Use native Google tags for GA4 and Ads, with the gym’s GA4 web stream ID and Ads account/action. Configure the Google tag and Conversion Linker as appropriate for the container.
- Create a Custom Event trigger for `generate_lead` and a Data Layer Variable named `lead_event_id`. Send a GA4 Event named `generate_lead` on that trigger and mark it as a key event in GA4. Configure a Google Ads website conversion action for the trial request; on the same trigger, use the action’s conversion ID/label and map `lead_event_id` to Transaction ID. Use **One** for the Ads lead count. If counting the native Ads tag as primary, don’t also count an imported GA4 version as another primary goal.
- Use an approved Meta Pixel template for the base pixel and standard `Lead` on the same trigger; map `lead_event_id` to Event ID if the template supports it. Do not add a second copy of the pixel elsewhere.
- Require `analytics_storage` consent for GA4 and `ad_storage` / `ad_user_data` for Ads and Meta. The app delays loading the container until opt-in and updates Google consent when choices change. Do not add any tag or template that bypasses consent, scrapes form fields, or redefines the site’s consent defaults. Do not enable automatic form conversion goals or enhanced conversions using visitor details for this setup.

**Direct tags:** Leave `NEXT_PUBLIC_GTM_CONTAINER_ID` blank. For Google, set `NEXT_PUBLIC_GOOGLE_TAG_ENABLED=true`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (the G- ID), and/or the matching `NEXT_PUBLIC_GOOGLE_ADS_ID` (AW- ID) with `NEXT_PUBLIC_GOOGLE_ADS_TRIAL_LABEL`. For Meta, set `NEXT_PUBLIC_META_PIXEL_ENABLED=true` and `NEXT_PUBLIC_META_PIXEL_ID`. Redeploy. The app sends the corresponding GA4 `generate_lead`, Google Ads `conversion`, and Meta `Lead` events. Existing optional CAPI stays disabled.

**Verify:** In [GTM Preview / Tag Assistant](https://tagassistant.google.com/), connect the test site, reject tracking, and verify no tag or conversion fires. Then allow tracking, submit a test with a failed validation and check it produces zero events. Submit one valid test and confirm a single `generate_lead`, each intended tag fires once, and only an opaque event ID is used. Check [GA4 DebugView](https://support.google.com/analytics/answer/7201382), Google Ads diagnostics and Meta Events Manager → Test Events. Check both inboxes and D1 for the same test. Repeat on a phone. Publish the GTM workspace after verification; browser blocking and declined consent will reduce measured conversions.

## Hosting and expected cost

- **Website hosting:** Cloudflare Workers Builds runs from GitHub. Vercel automatic deployments are disabled; no paid plan or subscription change was made.
- **Cloudflare Worker and D1:** can start on Free for modest traffic. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) list 100,000 requests/day and 10 ms CPU per invocation; [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) lists 5 million reads/day, 100,000 writes/day, and 5 GB total storage on Free. Quota exhaustion can prevent new leads from being saved.
- **Resend:** [Free transactional tier](https://resend.com/pricing) lists 3,000 emails/month and 100/day. Check usage with both recipients; failed or over-limit delivery stays visible in D1. A domain is separate if the gym does not already own one.
- **Sanity:** [Free plan](https://www.sanity.io/pricing) supports public datasets and up to 20 seats with limited roles and usage quotas. Use it for public content only.
- GTM/GA4 can start with their standard offerings; ad spend is separate. No accounts, paid plans, DNS records, or ad campaigns were created by this code change.

## Verification boundaries

The automated suite exercises the public form, gateway, real SQLite migration and queries, concurrent idempotent submissions, durable throttling, mail retry, and both tracking modes with provider responses simulated. The Cloudflare bundle can be checked without uploading or running a local server. Real D1, email delivery, Studio logins/publishing, ad account events, and live mobile tests with all services enabled remain dependent on owner accounts.

## Files added or changed

- `.env.example`
- `.gitignore`
- `CLIENT_HANDOFF.md`
- `CLOUDFLARE_SETUP.md`
- `LAUNCH_SETUP.md`
- `META_TRACKING_SETUP.md`
- `README.md`
- `SANITY_SETUP.md`
- `app/api/trial/route.ts`
- `app/globals.css`
- `app/page.tsx`
- `components/AcademyHome.tsx`
- `components/FirstVisit.tsx`
- `components/Navigation.tsx`
- `components/Receptionist.tsx`
- `components/TrialDialog.tsx`
- `components/content/ClassSchedule.tsx`
- `components/tracking/MarketingConsent.tsx`
- `lib/academy.ts`
- `lib/content/fallback.ts`
- `lib/content/types.ts`
- `lib/sanity/queries.ts`
- `lib/tracking/client.ts`
- `lib/tracking/consent.ts`
- `lib/tracking/google.ts`
- `lib/trial/contract.ts`
- `lib/trial/delivery.ts`
- `lib/trial/gateway.ts`
- `lib/trial/input.ts`
- `package.json`
- `sanity/schemaTypes/homepage.ts`
- `sanity/schemaTypes/instructor.ts`
- `sanity/schemaTypes/programs.ts`
- `sanity/schemaTypes/schedule.ts`
- `scripts/audit-production.mjs`
- `scripts/check-design-parity.mjs`
- `scripts/prepare-sanity-content.ts`
- `tests/academy.test.ts`
- `tests/gtm.test.ts`
- `tests/interactions.test.tsx`
- `tests/schedule.test.ts`
- `tests/tracking.test.ts`
- `tests/trial-tracking.test.ts`
- `tests/trial.test.ts`
- `workers/trial/index.ts`
- `workers/trial/migrations/0001_trial_leads.sql`
- `wrangler.trial.example.jsonc`
