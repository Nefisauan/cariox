CREATE TABLE trial_leads (
  submission_key TEXT PRIMARY KEY NOT NULL,
  event_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  interests TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  notification_id TEXT,
  notified_at INTEGER,
  first_attempt_at INTEGER,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX trial_leads_pending ON trial_leads(next_attempt_at) WHERE notification_id IS NULL;

CREATE TABLE trial_rate_limits (
  bucket TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  hits INTEGER NOT NULL
);
CREATE INDEX trial_rate_limit_expiry ON trial_rate_limits(expires_at);
