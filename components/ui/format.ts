export const formatSim = (cents: number, decimals = 0): string => `${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} SIM`;
export const formatPercentPpm = (ppm: number, decimals = 2): string => `${ppm >= 0 ? "+" : ""}${(ppm / 10_000).toFixed(decimals)}%`;
export const formatPercent = (value: number, decimals = 1): string => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(decimals)}%`;
export const formatPrice = (cents: number): string => (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const labelize = (value: string): string => value.replaceAll("_", " ");

export function timeLeft(expiresAt: string | Date, now = Date.now()): string {
  const total = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor(total % 3600 / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
