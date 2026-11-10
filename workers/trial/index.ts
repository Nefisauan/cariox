import { handle, idempotencyKey, json, readInput, ServiceError } from '../../lib/services/http';
import { trialInput, type TrialInput } from '../../lib/trial/input';
import { sendTrialNotification, trialDeliveryConfig, type DeliveryConfig } from '../../lib/trial/delivery';

export interface TrialStatement {
  bind(...params: (string | number)[]): TrialStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<{ success: boolean }>;
}
export interface TrialDatabase { prepare(sql: string): TrialStatement }
type Env = {
  LEADS_DB: TrialDatabase;
  TRIAL_WORKER_SECRET?: string;
  RESEND_API_KEY?: string;
  TRIAL_FROM_EMAIL?: string;
  TRIAL_NOTIFY_EMAILS?: string;
};
type Context = { waitUntil(work: Promise<unknown>): void };
type Row = { submission_key: string; event_id: string; name: string; email: string; phone: string; interests: string };
const currentTime = () => Math.floor(Date.now() / 1000);
const retryWindow = 23 * 60 * 60;
const due = 'notification_id IS NULL AND next_attempt_at <= ? AND attempts < 8 AND (first_attempt_at IS NULL OR first_attempt_at > ?)';

async function rateBucket(secret: string, ip: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ip)));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function rateLimit(db: TrialDatabase, bucket: string, now: number) {
  const rate = await db.prepare(`INSERT INTO trial_rate_limits(bucket,expires_at,hits) VALUES (?, ?, 1)
    ON CONFLICT(bucket) DO UPDATE SET hits = CASE WHEN expires_at <= ? THEN 1 ELSE min(hits + 1, 7) END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING hits`)
    .bind(bucket, now + 600, now, now).first<{hits:number}>();
  if (!rate || rate.hits > 6) throw new ServiceError(429,'TRY_LATER','Please try again in a few minutes.');
}

function matches(row: Row, input: TrialInput) {
  return row.name === input.name && row.email === input.email && row.phone === input.phone && row.interests === JSON.stringify(input.interests);
}

export function createTrialWorker({ send = fetch.bind(globalThis), now = currentTime } = {}) {
  async function notify(env: Env, settings: DeliveryConfig, row: Row) {
    try {
      const time = now();
      // Claim atomically so a visitor retry and the scheduled job do not send twice.
      const claim = await env.LEADS_DB.prepare(`UPDATE trial_leads SET
        first_attempt_at = coalesce(first_attempt_at, ?), attempts = attempts + 1,
        next_attempt_at = ? + min(3600, 60 << attempts)
        WHERE submission_key = ? AND ${due} RETURNING event_id`)
        .bind(time, time, row.submission_key, time, time - retryWindow).first();
      if (!claim) return;
      const input = trialInput.parse({ name:row.name, email:row.email, phone:row.phone, interests:JSON.parse(row.interests) });
      const notificationId = await sendTrialNotification(settings, row.event_id, input, send);
      const marked = await env.LEADS_DB.prepare('UPDATE trial_leads SET notification_id = ?, notified_at = ? WHERE submission_key = ?')
        .bind(notificationId, now(), row.submission_key).run();
      if (!marked.success) throw new Error('Could not mark the notification');
    } catch (error) {
      // No lead data, credentials, or provider response bodies in logs. D1 retains the pending row.
      const reason = error instanceof ServiceError && error.code === 'EMAIL_REJECTED'
        ? `email provider HTTP ${error.status}`
        : error instanceof TypeError ? 'request error' : 'notification error';
      console.warn(`Trial notification pending retry (${reason}).`);
    }
  }

  return {
    fetch(request: Request, env: Env, ctx: Context) {
      return handle(async () => {
        if (new URL(request.url).pathname !== '/trial' || request.method !== 'POST') return json({ok:false},404);
        const secret = env.TRIAL_WORKER_SECRET;
        if (!secret || !/^[A-Za-z0-9_-]{32,128}$/.test(secret) || request.headers.get('authorization') !== `Bearer ${secret}`) {
          return json({ok:false},403);
        }
        const settings = trialDeliveryConfig({ RESEND_API_KEY:env.RESEND_API_KEY, TRIAL_FROM_EMAIL:env.TRIAL_FROM_EMAIL, TRIAL_NOTIFY_EMAILS:env.TRIAL_NOTIFY_EMAILS });
        if (!settings || !env.LEADS_DB) return json({ok:false},503);
        const key = idempotencyKey(request);
        const input = await readInput(request, trialInput);
        const db = env.LEADS_DB;
        const find = () => db.prepare('SELECT submission_key,event_id,name,email,phone,interests FROM trial_leads WHERE submission_key = ?').bind(key).first<Row>();
        let row = await find();
        if (!row) {
          const ip = request.headers.get('x-trial-client-ip');
          // Missing gateway IPs share a conservative bucket instead of bypassing the limit.
          await rateLimit(db, await rateBucket(secret, ip || 'unknown'), now());
          const saved = await db.prepare(`INSERT INTO trial_leads(submission_key,event_id,name,email,phone,interests,created_at)
            VALUES (?,?,?,?,?,?,?) ON CONFLICT(submission_key) DO NOTHING`)
            .bind(key, `trial-${crypto.randomUUID()}`, input.name, input.email, input.phone, JSON.stringify(input.interests), now()).run();
          if (!saved.success) throw new Error('Could not save trial');
          row = await find();
        }
        if (!row) throw new Error('Saved trial could not be read');
        if (!matches(row,input)) throw new ServiceError(409,'KEY_CONFLICT','Start a new request and try again.');
        ctx.waitUntil(notify(env, settings, row));
        return json({ok:true,status:'accepted',eventId:row.event_id},201);
      });
    },
    async scheduled(_event: unknown, env: Env) {
      const settings = trialDeliveryConfig({ RESEND_API_KEY:env.RESEND_API_KEY, TRIAL_FROM_EMAIL:env.TRIAL_FROM_EMAIL, TRIAL_NOTIFY_EMAILS:env.TRIAL_NOTIFY_EMAILS });
      if (!settings || !env.LEADS_DB) return;
      const time = now();
      await env.LEADS_DB.prepare('DELETE FROM trial_rate_limits WHERE expires_at <= ?').bind(time).run();
      const rows = await env.LEADS_DB.prepare(`SELECT submission_key,event_id,name,email,phone,interests FROM trial_leads
        WHERE ${due} ORDER BY next_attempt_at LIMIT 10`).bind(time, time - retryWindow).all<Row>();
      if (!rows.success) throw new Error('Could not load pending notifications');
      for (const row of rows.results) await notify(env, settings, row);
    },
  };
}

export default createTrialWorker();
