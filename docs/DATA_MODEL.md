# Data model

The checked-in migration is `db/migrations/0000_initial.sql`; Drizzle definitions live in `db/schema/index.ts`.

| Table | Purpose | Mutability |
|---|---|---|
| `freaks` | Token ID, name, personality, rarity | Identity fields immutable after generation |
| `freak_dna` | Six visual DNA slots and unique DNA hash | Immutable |
| `career_states` | SIM equity, record, drawdown, streak, score, level, mood, XP, milestones | Updated once per settlement |
| `season_states` | Session count, raw skill total, rating, season XP | Updated once per settlement |
| `sessions` | Locked choices, entry/expiry, exit/result/skill, state machine, transient settlement claim | Parameters immutable; settlement fields write once |
| `price_snapshots` | Entry and exit source/timestamp/price evidence | Append-only |
| `achievements` | Achievement definition and points | Configuration data |
| `freak_achievements` | Unique grants tied to a Freak and session | Append-only, unique by Freak/code |
| `career_level_history` | Promotions, demotions, and genesis level | Append-only |
| `equity_history` | Equity/return/drawdown/score/level after each session | Append-only, unique by session |
| `game_config` | Local scenario and development-clock offset | Development/operator state |

Foreign keys connect future blockchain-shaped `tokenId` identity to mutable off-chain game state without placing database concerns in the domain engine. DNA uniqueness, positive prices, nonnegative equity, enum-like values, timestamp order, active-session uniqueness, settlement-history uniqueness, and achievement-grant uniqueness are enforced at the database boundary in addition to domain validation.

SQLite is the V0 repository. Applied SQL files are recorded in `_game_migrations`. `SessionService` receives a database, market provider, and clock and owns the transaction. SQLite settlement uses an atomic claim-token compare-and-set; a PostgreSQL implementation can preserve the service boundary and replace that claim with `SELECT … FOR UPDATE` row locking.
