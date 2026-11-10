import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { createTrialGateway, trialGatewayConfig } from '../lib/trial/gateway';
import { isTrialReceipt } from '../lib/trial/contract';
import { trialDeliveryConfig } from '../lib/trial/delivery';
import { createTrialWorker, type TrialDatabase, type TrialStatement } from '../workers/trial';

const providerId = '12345678-1234-4123-8123-123456789abc';
const secret = 'unit-fixture-secret-only-123456789abcdef';
const from = 'trial@example.com', recipients = ['first@example.com', 'second@example.com'];
const settings = { url:'https://worker.example/trial', secret };
const lead = { name: 'Test Visitor', email: 'visitor@example.com', phone: '+1 (555) 123-4567', interests: ['Brazilian Jiu-Jitsu', 'Kids Classes'], website: '' };
const request = (body: unknown = lead, origin = 'https://unit.example', key = 'test-submission-key-123') =>
  new Request('https://unit.example/api/trial', { method: 'POST', headers: {
    origin, 'Content-Type': 'application/json', 'Idempotency-Key': key,
  }, body: JSON.stringify(body) });

function setup(send: typeof fetch) {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../workers/trial/migrations/0001_trial_leads.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../workers/trial/migrations/0002_preferred_time.sql', import.meta.url), 'utf8'));
  const database: TrialDatabase = {
    prepare(query) {
      const statement = sql.prepare(query);
      let values: SQLInputValue[] = [];
      const adapter: TrialStatement = {
        bind(...params) { values = params; return adapter; },
        async first<T>() { return (statement.get(...values) ?? null) as T | null; },
        async all<T>() { return { results:statement.all(...values) as T[], success:true }; },
        async run() { statement.run(...values); return { success:true }; },
      };
      return adapter;
    },
  };
  let now = 1_800_000_000;
  const worker = createTrialWorker({send,now:()=>now});
  const env = { LEADS_DB:database, TRIAL_WORKER_SECRET:secret, RESEND_API_KEY:'fixture', TRIAL_FROM_EMAIL:from, TRIAL_NOTIFY_EMAILS:recipients.join(',') };
  const jobs: Promise<unknown>[] = [];
  const ctx = { waitUntil: (task:Promise<unknown>) => { jobs.push(task); } };
  const service = { fetch: (request: Request) => worker.fetch(request, env, ctx) };
  const gateway = createTrialGateway({
    config: () => trialGatewayConfig({ TRIAL_LEADS_ENABLED:'true', TRIAL_WORKER_SECRET:secret }, service),
    clientIp: () => '192.0.2.12',
    send: async () => assert.fail('The Cloudflare gateway must use its private Worker binding'),
  });
  return { sql, gateway, worker, env, ctx, drain:()=>Promise.all(jobs.splice(0)), advance:(seconds:number)=>{now += seconds;} };
}

test('trial delivery remains closed until the gateway is explicitly configured and requires two recipients', async () => {
  assert.equal(trialGatewayConfig({}), null);
  const env = { TRIAL_LEADS_ENABLED:'true', TRIAL_WORKER_URL:settings.url, TRIAL_WORKER_SECRET:secret };
  assert.deepEqual(trialGatewayConfig(env),settings);
  assert.equal(trialGatewayConfig({...env,TRIAL_WORKER_URL:'http://worker.example/trial'}),null);
  const service = { fetch: async () => new Response() };
  assert.equal(trialGatewayConfig({...env,TRIAL_LEADS_ENABLED:'false'},service),null);
  assert.equal(trialGatewayConfig({...env,TRIAL_WORKER_SECRET:'invalid'},service),null);
  assert.equal(trialGatewayConfig(env,service)?.service,service);
  assert.equal(trialDeliveryConfig({RESEND_API_KEY:'fixture',TRIAL_FROM_EMAIL:from,TRIAL_NOTIFY_EMAILS:'owner@example.com,OWNER@example.com'}),null);
  const gateway = createTrialGateway({config:()=>null,send:async()=>assert.fail('Unconfigured gateway called a provider')});
  const response = await gateway(request());
  assert.equal(response.status,503);
  assert.equal(isTrialReceipt(await response.json()),false);
});

test('real SQLite migration persists one row; concurrent repeats send one notification to both owners', async () => {
  let calls = 0;
  const preferredTime = { date: '2027-02-12', className: 'Jiu-Jitsu · No-Gi', time: '7:00 PM' };
  const submission = { ...lead, preferredTime };
  const app = setup(async (url,init) => {
    calls++;
    assert.equal(url,'https://api.resend.com/emails');
    assert.match(new Headers(init?.headers).get('idempotency-key')!,/^cariox-trial\/trial-/);
    const message=JSON.parse(String(init?.body));
    assert.deepEqual(message.to,recipients);
    assert.equal(message.reply_to,lead.email);
    for(const value of [lead.name,lead.email,lead.phone,...lead.interests]) assert.ok(message.text.includes(value));
    for(const value of Object.values(preferredTime)) assert.ok(message.text.includes(value));
    return Response.json({id:providerId});
  });
  try {
    const results=await Promise.all([app.gateway(request(submission)),app.gateway(request(submission))]);
    assert.deepEqual(results.map(result=>result.status),[201,201]);
    const [a,b]=await Promise.all(results.map(result=>result.json()));
    assert.ok(isTrialReceipt(a)); assert.deepEqual(a,b);
    assert.ok(!JSON.stringify(a).includes(lead.email));
    await app.drain();
    const rows=app.sql.prepare('SELECT * FROM trial_leads').all();
    assert.equal(rows.length,1);
    assert.equal(rows[0].email,lead.email);
    assert.equal(rows[0].preferred_time,JSON.stringify(preferredTime));
    assert.equal(rows[0].notification_id,providerId);
    assert.equal(calls,1);
    assert.equal((await app.gateway(request({...submission,preferredTime:{...preferredTime,time:'5:30 AM'}}))).status,409);
  } finally { app.sql.close(); }
});

test('failed mail remains in D1 and a scheduled retry sends it with the same provider key', async () => {
  const keys:string[]=[];
  const app=setup(async (_url,init)=>{
    keys.push(new Headers(init?.headers).get('idempotency-key')!);
    return keys.length===1 ? Response.json({}, {status:429}) : Response.json({id:providerId});
  });
  try {
    assert.equal((await app.gateway(request())).status,201);
    await app.drain();
    const lookup=()=>app.sql.prepare('SELECT notification_id,attempts FROM trial_leads').get();
    assert.equal(lookup()?.notification_id,null);
    assert.equal(lookup()?.attempts,1);
    app.advance(600);
    await app.worker.scheduled(null,app.env);
    assert.equal(lookup()?.notification_id,providerId);
    assert.deepEqual(keys,[keys[0],keys[0]]);
  } finally { app.sql.close(); }
});

test('storage failure never returns a conversion receipt or emails a lead', async () => {
  const app=setup(async()=>assert.fail('Storage failure sent email'));
  try {
    app.sql.exec('DROP TABLE trial_leads');
    const result=await app.gateway(request());
    assert.equal(result.status,502);
    assert.equal(isTrialReceipt(await result.json()),false);
  } finally { app.sql.close(); }
});

test('gateway rejects invalid, spam, cross-origin, and recipient-injection requests; worker requires secret', async () => {
  const app=setup(async()=>assert.fail('Invalid request sent mail'));
  try {
    for(const invalid of [
      {...lead,email:'invalid'}, {...lead,phone:'123'}, {...lead,interests:[]},
      {...lead,interests:['Unknown']}, {...lead,interests:['Kids Classes','Kids Classes']},
      {...lead,website:'https://spam.example'}, {...lead,to:['attacker@example.com']},
    ]) assert.equal((await app.gateway(request(invalid))).status,400);
    assert.equal((await app.gateway(request(lead,'https://other.example'))).status,403);
    assert.equal((await app.gateway(request(lead,'https://unit.example',''))).status,400);
    assert.equal((await app.gateway(request({...lead,name:'x'.repeat(9000)}))).status,413);
    assert.equal((await app.worker.fetch(new Request(settings.url,{method:'POST'}),app.env,app.ctx)).status,403);
    assert.equal(app.sql.prepare('SELECT count(*) AS count FROM trial_leads').get()?.count,0);
  } finally { app.sql.close(); }
});

test('D1-backed throttle limits new leads across requests but permits an idempotent retry', async () => {
  const app=setup(async()=>Response.json({id:providerId}));
  try {
    for(let i=0;i<6;i++) assert.equal((await app.gateway(request(lead,'https://unit.example',`unique-key-fixture-${i}`))).status,201);
    assert.equal((await app.gateway(request())).status,429);
    assert.equal((await app.gateway(request(lead,'https://unit.example','unique-key-fixture-0'))).status,201);
    app.advance(600);
    assert.equal((await app.gateway(request())).status,201);
    await app.drain();
    assert.equal(app.sql.prepare('SELECT count(*) AS count FROM trial_leads').get()?.count,7);
  } finally { app.sql.close(); }
});
