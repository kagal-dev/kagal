CREATE TABLE tasks (
  task_id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  params TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'dispatched', 'ok', 'error')),
  result TEXT,
  error TEXT,
  queued_at TEXT NOT NULL DEFAULT (datetime('now')),
  dispatched_at TEXT,
  completed_at TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status);

CREATE TABLE nonce_state (
  agent_id TEXT PRIMARY KEY,
  nonce_current TEXT NOT NULL,
  nonce_previous TEXT,
  rotated_at TEXT NOT NULL DEFAULT (datetime('now')),
  boot_count INTEGER DEFAULT 0,
  hw_serial TEXT DEFAULT ''
);

CREATE TABLE agent_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE quarantine (
  agent_id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  claim_code TEXT NOT NULL,
  quarantined_at TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_at TEXT,
  claimed_by TEXT
);
