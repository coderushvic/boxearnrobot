ALTER TABLE users ADD COLUMN verified_ad_views INTEGER NOT NULL DEFAULT 0 CHECK (verified_ad_views >= 0);
ALTER TABLE users ADD COLUMN ad_boxes_awarded INTEGER NOT NULL DEFAULT 0 CHECK (ad_boxes_awarded >= 0);

CREATE TABLE IF NOT EXISTS ad_sessions (
  ymid TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_sessions_user ON ad_sessions(telegram_id, created_at DESC);
