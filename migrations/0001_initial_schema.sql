PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  telegram_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  photo_url TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  balance_micro INTEGER NOT NULL DEFAULT 0 CHECK (balance_micro >= 0),
  boxes INTEGER NOT NULL DEFAULT 2 CHECK (boxes >= 0),
  checkin_cycle INTEGER NOT NULL DEFAULT 0 CHECK (checkin_cycle BETWEEN 0 AND 2),
  last_checkin_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  event_type TEXT NOT NULL,
  amount_micro INTEGER NOT NULL DEFAULT 0,
  boxes_delta INTEGER NOT NULL DEFAULT 0,
  reference TEXT NOT NULL UNIQUE,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_ledger_user_created ON ledger(telegram_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_boxes INTEGER NOT NULL DEFAULT 1 CHECK (reward_boxes > 0),
  task_type TEXT NOT NULL DEFAULT 'manual',
  active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  task_id TEXT NOT NULL REFERENCES tasks(id),
  proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(telegram_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status, created_at);

CREATE TABLE IF NOT EXISTS referrals (
  invitee_id TEXT PRIMARY KEY REFERENCES users(telegram_id),
  inviter_id TEXT NOT NULL REFERENCES users(telegram_id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','qualified')),
  rewarded_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (invitee_id <> inviter_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON referrals(inviter_id, status);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  amount_micro INTEGER NOT NULL CHECK (amount_micro >= 100000),
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'BEP20',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status, created_at);

CREATE TABLE IF NOT EXISTS ad_events (
  event_id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  provider TEXT NOT NULL,
  verified_views INTEGER NOT NULL DEFAULT 1 CHECK (verified_views > 0),
  credited_boxes INTEGER NOT NULL DEFAULT 0 CHECK (credited_boxes >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_ad_events_user_created ON ad_events(telegram_id, created_at);
