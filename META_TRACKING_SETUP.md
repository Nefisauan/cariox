# Meta Pixel and optional Conversions API

For the latest launch flow, see [LAUNCH_SETUP.md](./LAUNCH_SETUP.md). The earlier integration notes follow.

## Default behavior

Tracking is OFF. `.env.example` has no Pixel ID, server token, test code, or Graph API version. Without both `NEXT_PUBLIC_META_PIXEL_ENABLED=true` and a syntactically valid owner Pixel ID, no consent overlay or Pixel script is rendered/loaded. No noscript image bypasses consent. No integration was tested against a real Meta account.

The enabled feature asks for marketing consent with equal accept/essential-only choices and a persistent privacy-choices control. Essential site features work without marketing. Consent is versioned, expires after 180 days, survives reload where local storage is available, and defaults to unknown. Browser GPC / Do Not Track signals override a grant. Revocation stops future events, discards queued tracking calls, removes the injected script, and attempts to remove `_fbp` / `_fbc` first-party cookies. Already transmitted data cannot be recalled by this code.

The client disables Pixel automatic event detection and does not supply advanced-matching contact details. The owner must also review automatic events/advanced matching and any pre-existing GTM/Pixel installation in Events Manager to avoid a second tracker outside this code's control. Consent text/data handling must be reviewed for the actual business and deployment jurisdiction before public activation; no claim of legal compliance is made by this technical implementation.

## Event semantics

| Event | Allowed trigger | Explicitly excluded |
| --- | --- | --- |
| `PageView` | Current path after marketing opt-in, once per actual navigation | Modal opens, schedule filters, repeated React effects, anchor changes |
| `Lead` | `trackLead(reference)` after an authenticated server lookup verifies actual provider delivery | Contact draft preview, copy button, chat open, CTA click |
| `CompleteRegistration` | `trackCompleteRegistration(reference)` after the server verifies a live confirmed registration with a matching opaque reference/event ID | Demo receipt, selected calendar time, form submit alone, pending/failed/unverified provider response |

Conversion receipts include `verified: true`, `mode: 'live'`, the matching confirmed/delivered status, opaque reference, stable event ID, and verification time. The browser never trusts a query string or client-provided “success” boolean. Server handlers reject invented receipts; all production adapters are currently disconnected. The live browser adapter functions are prepared but **not called by the demo UI**.

The in-memory event set handles duplicate effects/submissions; conversion IDs are also remembered in session storage. Reuse the SAME server event ID on retries and on browser/Conversions API copies. Client-side deduplication is not a substitute for durable registration-provider idempotency or Meta's deduplication.

## Exact owner steps — Pixel

1. Get access to the owner's existing Meta business/Events Manager data source. Obtain the real Pixel ID; do not create an account, Pixel, or paid ad campaign automatically.
2. Inventory any Pixel/GTM plugins already installed. Choose a single installation path. Review automatic events and advanced matching; this code expects controlled explicit events.
3. In an authorized **staging** environment, set the real `NEXT_PUBLIC_META_PIXEL_ID` and `NEXT_PUBLIC_META_PIXEL_ENABLED=true`, then rebuild. Leave CAPI disabled. Do not activate tracking in production during readiness work.
4. Validate the actual privacy text, consent behavior, GPC behavior, and revocation with the owner. Start with a clean browser: before consent, there must be no `connect.facebook.net` script request, `facebook.com/tr` request, or Meta tracking cookies created by this integration.
5. Open Events Manager → the correct data source → **Test events**. Use the actual staging URL and Pixel Helper/browser network inspection. Accept marketing and verify one `PageView`; reload/navigate as appropriate and check each real view, not each component render. Deny/revoke and confirm further events stop.
6. Until live provider adapters exist, verify that every demo booking, inquiry draft/copy, and scripted chat produces **zero Lead/CompleteRegistration events**. Do not fabricate a real registration merely to test conversions.
7. After a real provider and authenticated receipt lookup are implemented, test authorized successful and failed registrations/inquiries in provider sandbox/staging. Confirm only verified successes appear, and repeated callbacks/retries do not double-count. Test blocked scripts, denied consent, network failure, and session-storage denial.
8. Only after account-backed tests and owner approval should a separate production activation be considered. No ad spending, audience setup, domain verification, or production activation was performed here.

## Optional CAPI architecture

`lib/tracking/capi-payload.ts` builds consent-gated verified payloads with Web Crypto SHA-256 normalization for identifiers. It strips source-URL queries/fragments and preserves the same event ID as the browser. `capi.server.ts` is server-only, has no public forwarding route, is not called by demo flows, and exits without sending unless explicitly enabled and fully configured. It requires a real Pixel ID, secret access token, and owner-selected supported Graph API version. Unknown values stay blank; no token or API version has been invented.

To connect later:

1. Select and implement the actual registration/contact adapter and authenticated receipt lookup. Confirm durable event IDs and idempotency. Add provider-verified webhook/session handling, rate limiting/bot controls, and any required persistent event store before enabling public submissions.
2. Store marketing consent/provenance server-side with the real submission and recheck it when processing callbacks. Do not treat an arbitrary request-body boolean as sufficient server-side evidence of current consent.
3. Call `sendConversionsApiEvent` only with a provider-verified receipt and verified current consent. The optional sender must be connected deliberately; a token alone does not wire it into the app.
4. Set `META_CAPI_ENABLED=true`, `META_PIXEL_ID` equal to the browser Pixel's data source, secret `META_CAPI_ACCESS_TOKEN`, the current supported `META_GRAPH_API_VERSION`, and an authorized staging `META_TEST_EVENT_CODE` from Events Manager.
5. Confirm in Test Events that browser `eventID` and server `event_id` match and the event is deduplicated. Verify zero events for failed/demo/pending submissions and opt-outs. Check Diagnostics, normalization/matching, token permissions, and rate limits. The code does not claim that hashing identifiers alone provides legal permission.
6. Clear the test code before a separately approved future live activation. Add monitoring/retry policy only after deciding on the owner's infrastructure and retention requirements; no paid queue or database was provisioned.

## Sources and verification limit

- [Pixel reference](https://developers.facebook.com/docs/meta-pixel/reference/)
- [Pixel consent implementation](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr/)
- [Conversion tracking](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking/)
- [Browser/server deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)
- [CAPI server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event/)

Meta's documentation endpoints returned HTTP 429 during this session. These are the canonical owner verification links, not a claim that their current contents or an account-backed event flow were inspected successfully. Unit tests exercised the consent queue, deduplication, receipt guards, and payload normalization with synthetic fixtures and no Meta network requests.
