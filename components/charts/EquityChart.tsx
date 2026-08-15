import { formatSim } from "@/components/ui/format";

export function EquityChart({ points }: { points: { equityAfterCents: number }[] }) {
  const values = points.length ? [1_000_000, ...points.map((point) => point.equityAfterCents)] : [1_000_000];
  const min = Math.min(...values) * 0.96;
  const max = Math.max(...values) * 1.04;
  const range = Math.max(1, max - min);
  const path = values.map((value, index) => `${index ? "L" : "M"}${(index / Math.max(1, values.length - 1) * 700).toFixed(1)},${(220 - (value - min) / range * 190).toFixed(1)}`).join(" ");
  return <div className="chart"><div className="chart-labels"><span>{formatSim(Math.round(max))}</span><span>{formatSim(Math.round(min))}</span></div><svg viewBox="0 0 700 240" preserveAspectRatio="none" aria-label="Career equity curve"><defs><linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#53f68b" stopOpacity=".35"/><stop offset="1" stopColor="#53f68b" stopOpacity="0"/></linearGradient></defs><path d={`${path} L700,235 L0,235 Z`} fill="url(#equityFill)"/><path d={path} fill="none" stroke="#53f68b" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg></div>;
}
