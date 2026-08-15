export const ASSETS = ["BTC", "ETH"] as const;
export const DIRECTIONS = ["LONG", "SHORT"] as const;
export const RISK_MODES = ["SAFE", "NORMAL", "DEGEN", "FULL_SEND"] as const;
export const DURATIONS = ["1H", "4H", "8H"] as const;
export const PERSONALITIES = [
  "BULL_BRAIN",
  "PERMABEAR",
  "DEGEN",
  "RISK_MANAGER",
  "SCALPER",
  "SWINGER",
  "VOLATILITY_ADDICT",
  "BORING_QUANT",
] as const;
export const CAREER_LEVELS = ["REKT", "INTERN", "GRINDER", "PROFITABLE", "WHALE", "MARKET_GOD"] as const;
export const MOODS = ["EUPHORIC", "HAPPY", "FOCUSED", "NEUTRAL", "TILTED", "MELTDOWN"] as const;
export const RARITY_TIERS = ["COMMON", "UNCOMMON", "RARE", "EPIC", "MYTHIC"] as const;
export const SESSION_STATUSES = ["PENDING", "ACTIVE", "EXPIRED", "SETTLED", "FAILED"] as const;
export const SESSION_RESULTS = ["WIN", "LOSS", "SCRATCH", "LIQUIDATED"] as const;
export const MARKET_SCENARIOS = ["BULL_TREND", "BEAR_TREND", "SIDEWAYS", "VOLATILE", "CRASH", "PUMP"] as const;

export type Asset = (typeof ASSETS)[number];
export type Direction = (typeof DIRECTIONS)[number];
export type RiskMode = (typeof RISK_MODES)[number];
export type SessionDuration = (typeof DURATIONS)[number];
export type Personality = (typeof PERSONALITIES)[number];
export type CareerLevel = (typeof CAREER_LEVELS)[number];
export type Mood = (typeof MOODS)[number];
export type RarityTier = (typeof RARITY_TIERS)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type SessionResult = (typeof SESSION_RESULTS)[number];
export type MarketScenario = (typeof MARKET_SCENARIOS)[number];

export type FreakDNA = {
  body: string;
  skin: string;
  head: string;
  eyes: string;
  mouth: string;
  hair: string;
};

export type VisualState = {
  outfit: string;
  workstation: string;
  screens: string;
  prop: string;
  environment: string;
  effects: string[];
};

export type MarketPrice = {
  asset: Asset;
  priceCents: number;
  timestamp: Date;
  source: string;
};

export type SessionCalculation = {
  marketReturnPpm: number;
  personalityMultiplier: number;
  rawPnlPpm: number;
  finalPnlPpm: number;
  result: SessionResult;
  liquidated: boolean;
};

export type CareerSnapshot = {
  equityCents: number;
  equityPeakCents: number;
  maxDrawdownPpm: number;
  wins: number;
  losses: number;
  scratches: number;
  liquidations: number;
  settledSessions: number;
  currentStreak: number;
  careerScore: number;
  careerLevel: CareerLevel;
};
