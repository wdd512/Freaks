# PNL FREAKS V0

PNL FREAKS is a local, playable prototype about fictional trader characters whose simulated market calls permanently change their careers. Twenty deterministic Freaks can trade BTC or ETH LONG/SHORT in locked sessions, accumulate SIM equity, unlock achievements, move between career levels, and compete on career-PnL and risk-independent skill leaderboards.

**SIM is fictional game accounting. No real financial position is opened. There is no cash-out. V0 has no blockchain, token, wallet, payment, staking, minting, or custody functionality.**

## Requirements

- Node.js 22+
- npm 10+

## Install and run

```bash
npm install
npm run db:migrate
npm run seed:demo
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The demo seed includes fresh Freaks plus REKT, GRINDER, PROFITABLE, WHALE, and MARKET GOD careers with histories. Freak #1337 is intentionally included.

For a clean collection where all 20 Freaks start at 10,000 SIM / score 340 / INTERN:

```bash
npm run db:reset
npm run seed:fresh
```

Seeding is deterministic and safe to repeat; a seed clears current local game data. The default SQLite file is `data/pnl-freaks.db`.

## Useful commands

```bash
npm run db:migrate            # create normalized SQLite tables and indexes
npm run seed:demo             # 20 varied demo careers
npm run seed:fresh            # 20 clean careers
npm run db:reset              # clear local game data
npm run settle:expired        # idempotent expired-session worker
npm run generate:freaks -- --count 4444 --seed my-seed
npm run art:export -- --count 50 --career INTERN
npm run art:export -- --count 50 --career INTERN --format png
npm run typecheck
npm run lint
npm test                      # Vitest unit + integration suite
npm run test:e2e              # Playwright critical browser flows
npm run build
```

The generator writes `generation-report.json` with trait frequencies, probabilities, personality totals, rarity totals, DNA hashes, rerolls, and collection hash.

## Development clock and market data

Development mode maps game time to real time:

| Game duration | Development duration | Production duration |
|---|---:|---:|
| 1H | 60 seconds | 3,600 seconds |
| 4H | 240 seconds | 14,400 seconds |
| 8H | 480 seconds | 28,800 seconds |

The terminal’s clearly marked **DEV ONLY** panel can advance time, finish and settle the next session, settle all expired sessions, select a deterministic scenario, reset the clock, and reseed. Set `DEVELOPMENT_TIME_MODE=false` to use production durations outside a production build.

V0 uses `DeterministicMockMarketDataProvider`. The available scenarios are `BULL_TREND`, `BEAR_TREND`, `SIDEWAYS`, `VOLATILE`, `CRASH`, and `PUMP`. The same seed and timestamp always produce the same price. Settlement requests the first 10-second mock tick at or after the immutable expiry, never the click time. Configure defaults with `MARKET_SCENARIO` and `MARKET_SEED`.

A live provider is deliberately not included in V0. The `MarketDataProvider` interface isolates that future adapter; tests and game availability never depend on an external API.

## Architecture

- `domain/` contains pure deterministic PnL, liquidation, career, rating, mood, achievement, visual-state, rarity, and collection-generation rules. It has no React or SQLite dependency.
- `services/` contains clock and market abstractions, structured game logging, query projections, and the atomic session application service.
- `db/` contains Drizzle schemas, a checked-in SQL migration, deterministic fresh/demo seeding, and SQLite connection setup.
- `app/` owns Next.js routes and server-owned actions. Clients submit choices only; prices, PnL, score, XP, and achievements are always computed server-side.
- `art/` contains versioned manifests, career pools, compatibility rules, render specs, palettes, and deterministic signatures.
- `components/` contains UI, responsive SVG charts, and independently replaceable 128×128 pixel-art layers.

Settlement is one SQLite transaction. It re-reads state inside the transaction, updates a session once, applies career/season changes, grants achievements through a unique constraint, and writes one immutable equity snapshot through another unique constraint. A partial unique index enforces one active/pending/expired session per Freak. The design maps cleanly to row locking in a future PostgreSQL repository.

Integer cents persist SIM and market prices; integer parts-per-million persist returns and drawdowns. Career Score, normalized skill, and rating retain floating-point precision because they are bounded statistical scores, not balances.

In development, `/art-lab` renders 50 deterministic QA Freaks, all six career evolutions for one identity, and matrices covering all 56 immutable visual values. More detail lives in [GAME_ENGINE.md](docs/GAME_ENGINE.md), [DATA_MODEL.md](docs/DATA_MODEL.md), [GENERATION.md](docs/GENERATION.md), and [ART_PIPELINE.md](docs/ART_PIPELINE.md).

## V0 limitations

- Mock prices are a deterministic game feed, not historical or live exchange data.
- V1 artwork uses code-authored SVG pixel layers; the asset descriptor abstraction is ready for reviewed PNG/WebP production layers.
- Share cards are responsive HTML/SVG components; server-side PNG export is not implemented.
- SQLite serializes local writes. A production deployment should move repository transactions to PostgreSQL with explicit row locks.
- No background daemon is bundled; schedule `npm run settle:expired` externally or settle lazily through the UI.

## Next logical phase

After art-direction review in Art Lab, replace individual V1 descriptors with hand-cleaned transparent layer assets while preserving DNA and render signatures. Game deployment, an optional read-only live market adapter with durable price snapshots, and season operations remain separate workstreams. Blockchain work should remain separate until the game is fun and the deterministic engine is stable.
