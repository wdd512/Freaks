ALTER TABLE sessions ADD COLUMN settlement_claim_id TEXT;
ALTER TABLE sessions ADD COLUMN settlement_claimed_at INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS one_active_session_per_freak
  ON sessions(token_id)
  WHERE status IN ('PENDING','ACTIVE','EXPIRED');

CREATE TRIGGER IF NOT EXISTS freaks_personality_insert_check
BEFORE INSERT ON freaks
WHEN NEW.personality NOT IN ('BULL_BRAIN','PERMABEAR','DEGEN','RISK_MANAGER','SCALPER','SWINGER','VOLATILITY_ADDICT','BORING_QUANT')
BEGIN
  SELECT RAISE(ABORT, 'invalid freak personality');
END;

CREATE TRIGGER IF NOT EXISTS freaks_personality_update_check
BEFORE UPDATE OF personality ON freaks
WHEN NEW.personality NOT IN ('BULL_BRAIN','PERMABEAR','DEGEN','RISK_MANAGER','SCALPER','SWINGER','VOLATILITY_ADDICT','BORING_QUANT')
BEGIN
  SELECT RAISE(ABORT, 'invalid freak personality');
END;

CREATE TRIGGER IF NOT EXISTS career_level_insert_check
BEFORE INSERT ON career_states
WHEN NEW.career_level NOT IN ('REKT','INTERN','GRINDER','PROFITABLE','WHALE','MARKET_GOD')
BEGIN
  SELECT RAISE(ABORT, 'invalid career level');
END;

CREATE TRIGGER IF NOT EXISTS career_level_update_check
BEFORE UPDATE OF career_level ON career_states
WHEN NEW.career_level NOT IN ('REKT','INTERN','GRINDER','PROFITABLE','WHALE','MARKET_GOD')
BEGIN
  SELECT RAISE(ABORT, 'invalid career level');
END;
