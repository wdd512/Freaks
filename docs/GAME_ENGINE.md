# Game engine

All return-like persisted values use parts per million (`1.00% = 10,000 ppm`). Prices and SIM equity use integer cents. UI values are formatting only.

## Session lifecycle

A server-validated open request contains only Freak, asset, direction, risk, and duration. The server obtains entry data, calculates an immutable expiry through `Clock`, and persists the `ACTIVE` session. A partial unique SQLite index permits only one `PENDING`, `ACTIVE`, or `EXPIRED` session per Freak. Sessions cannot be edited or closed early.

The normal state path is `ACTIVE → EXPIRED → SETTLED`; the service accepts an expired `ACTIVE` row directly. `FAILED` is reserved for unrecoverable consistency or market-data failures. Settlement re-reads the row inside a transaction. A second call returns the settled row and cannot apply PnL twice.

Settlement requests the first market tick at or after `expiresAt`. Entry and exit timestamps are stored. A late click therefore cannot select a later price.

## PnL and risk

```text
marketReturn       = exit / entry - 1
direction          = LONG: +1, SHORT: -1
directionalReturn  = marketReturn × direction
rawPnl             = directionalReturn × riskMultiplier × personalityMultiplier
```

Risk multipliers are SAFE `0.75`, NORMAL `1.00`, DEGEN `1.50`, and FULL SEND `2.00`. Personality specialization multiplies positive and negative results symmetrically. Bull Brain and Permabear specialize by direction; Degen and Risk Manager by risk; Scalper and Swinger by duration; Volatility Addict and Boring Quant by the absolute underlying move. Rarity never enters a gameplay formula.

SAFE and NORMAL do not liquidate. DEGEN liquidates when raw PnL is `<= -15%` and settles at `-18%`. FULL SEND liquidates when raw PnL is `<= -10%` and settles at `-20%`. Otherwise PnL is clamped to `[-20%, +20%]`.

Final PnL above `+0.10%` is WIN, below `-0.10%` is LOSS, and the inclusive middle is SCRATCH. LIQUIDATED overrides LOSS.

## Equity, drawdown, and record

Every Freak starts at `10,000 SIM`:

```text
newEquity    = oldEquity × (1 + finalPnl)
careerReturn = currentEquity / 10,000 SIM - 1
equityPeak   = max(previousPeak, currentEquity)
currentDD    = 1 - currentEquity / equityPeak
maxDD        = max(previousMaxDD, currentDD)
winRate      = wins / (wins + losses)
```

Scratch does not enter the win-rate denominator and resets streak to zero. Wins maintain a positive signed streak; losses and liquidations maintain a negative one. Empty win rate is 50% only inside score calculation and displays as an em dash.

## Career Score and levels

```text
Score = 300
      + 280 × tanh(R / 0.50)
      + 120 × (2W - 1) × min(1, sqrt(N / 30))
      + 100 × (0.40 - DD)
      + 100 × (1 - exp(-N / 40))
      + 8 × clamp(S, -10, +10)
      + A
```

The result is clamped to `[0, 1000]`; `A` is achievement points capped at 100. A fresh Freak scores exactly 340.

Base levels are REKT `0`, INTERN `250`, GRINDER `400`, PROFITABLE `550`, WHALE `700`, and MARKET GOD `850`. Promotion uses the normal threshold. Demotion requires falling 30 points below the current level threshold. The transition function can move through several levels and persists actual state/history rather than re-deriving visuals on render.

## Mood and visuals

Mood uses the three latest results. `WWW → EUPHORIC`, `LLL → MELTDOWN`, at least two wins → HAPPY, at least two losses → TILTED, one win plus one loss → FOCUSED, otherwise NEUTRAL. Liquidation counts as loss; mood never changes PnL.

Immutable DNA is passed with level and mood to a deterministic visual resolver. Outfit, desk, screens, prop, environment, and effects evolve while body, skin, head, eyes, mouth, and hair identity stay fixed.

## Skill, season rating, and XP

```text
edge         = direction × ln(exit / entry)
z            = edge / expectedAssetVolatility
sessionSkill = tanh(z)
rating       = 1000 + 400 × averageSkill × sqrt(N / (N + 20))
```

BTC mock expected volatility is 2.0%; ETH is 2.7%. Risk never enters skill. XP bases are 10/20/30 for 1H/4H/8H plus `0..15` from positive normalized skill; risk does not multiply XP.

## Achievements

The engine grants First Blood, REKT, Diamond Hands, Permabear, Green Machine, Wall Street Intern, God Candle, From Zero to Hero, and Round Tripper. Persistent `hasBeenRekt` and `hasBeenWhale` milestone flags support cross-career achievements. `(tokenId, code)` is unique, so grants and points are idempotent.
