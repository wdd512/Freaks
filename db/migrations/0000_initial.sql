PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS freaks (
  token_id INTEGER PRIMARY KEY, name TEXT NOT NULL, personality TEXT NOT NULL,
  rarity_score REAL NOT NULL, rarity_tier TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS freak_dna (
  token_id INTEGER PRIMARY KEY REFERENCES freaks(token_id) ON DELETE CASCADE,
  body TEXT NOT NULL, skin TEXT NOT NULL, head TEXT NOT NULL, eyes TEXT NOT NULL, mouth TEXT NOT NULL, hair TEXT NOT NULL,
  dna_hash TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS career_states (
  token_id INTEGER PRIMARY KEY REFERENCES freaks(token_id) ON DELETE CASCADE,
  equity_cents INTEGER NOT NULL CHECK(equity_cents >= 0), equity_peak_cents INTEGER NOT NULL CHECK(equity_peak_cents >= 0),
  max_drawdown_ppm INTEGER NOT NULL DEFAULT 0 CHECK(max_drawdown_ppm >= 0),
  wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0, scratches INTEGER NOT NULL DEFAULT 0,
  liquidations INTEGER NOT NULL DEFAULT 0, settled_sessions INTEGER NOT NULL DEFAULT 0, winning_shorts INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0, best_pnl_ppm INTEGER, worst_pnl_ppm INTEGER,
  career_score REAL NOT NULL, career_level TEXT NOT NULL, mood TEXT NOT NULL, lifetime_xp INTEGER NOT NULL DEFAULT 0,
  has_been_rekt INTEGER NOT NULL DEFAULT 0, has_been_whale INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS season_states (
  token_id INTEGER PRIMARY KEY REFERENCES freaks(token_id) ON DELETE CASCADE,
  season_id TEXT NOT NULL DEFAULT 'V0', settled_sessions INTEGER NOT NULL DEFAULT 0,
  skill_total REAL NOT NULL DEFAULT 0, rating REAL NOT NULL DEFAULT 1000, xp INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, token_id INTEGER NOT NULL REFERENCES freaks(token_id) ON DELETE CASCADE,
  asset TEXT NOT NULL CHECK(asset IN ('BTC','ETH')), direction TEXT NOT NULL CHECK(direction IN ('LONG','SHORT')),
  risk_mode TEXT NOT NULL CHECK(risk_mode IN ('SAFE','NORMAL','DEGEN','FULL_SEND')),
  duration TEXT NOT NULL CHECK(duration IN ('1H','4H','8H')),
  status TEXT NOT NULL CHECK(status IN ('PENDING','ACTIVE','EXPIRED','SETTLED','FAILED')),
  entry_price_cents INTEGER NOT NULL CHECK(entry_price_cents > 0), entry_price_timestamp INTEGER NOT NULL,
  opened_at INTEGER NOT NULL, expires_at INTEGER NOT NULL CHECK(expires_at > opened_at),
  exit_price_cents INTEGER CHECK(exit_price_cents > 0), exit_price_timestamp INTEGER,
  raw_pnl_ppm INTEGER, final_pnl_ppm INTEGER, result TEXT CHECK(result IS NULL OR result IN ('WIN','LOSS','SCRATCH','LIQUIDATED')),
  session_skill REAL, settled_at INTEGER, failure_reason TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  CHECK(exit_price_timestamp IS NULL OR exit_price_timestamp >= entry_price_timestamp)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_session_per_freak ON sessions(token_id) WHERE status IN ('PENDING','ACTIVE','EXPIRED');
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(status, expires_at);
CREATE TABLE IF NOT EXISTS price_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL REFERENCES sessions(id), kind TEXT NOT NULL CHECK(kind IN ('ENTRY','EXIT')),
  asset TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents > 0), timestamp INTEGER NOT NULL, source TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS achievements (code TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, points INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS freak_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT, token_id INTEGER NOT NULL REFERENCES freaks(token_id) ON DELETE CASCADE,
  code TEXT NOT NULL REFERENCES achievements(code), session_id TEXT REFERENCES sessions(id), granted_at INTEGER NOT NULL,
  UNIQUE(token_id, code)
);
CREATE TABLE IF NOT EXISTS career_level_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, token_id INTEGER NOT NULL REFERENCES freaks(token_id), session_id TEXT REFERENCES sessions(id),
  from_level TEXT, to_level TEXT NOT NULL, career_score REAL NOT NULL, timestamp INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS equity_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, token_id INTEGER NOT NULL REFERENCES freaks(token_id), session_id TEXT REFERENCES sessions(id),
  equity_before_cents INTEGER NOT NULL, equity_after_cents INTEGER NOT NULL, career_return_ppm INTEGER NOT NULL,
  drawdown_ppm INTEGER NOT NULL, career_score REAL NOT NULL, career_level TEXT NOT NULL, timestamp INTEGER NOT NULL,
  UNIQUE(session_id)
);
CREATE TABLE IF NOT EXISTS game_config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
