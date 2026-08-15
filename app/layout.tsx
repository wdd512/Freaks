import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "PNL FREAKS", description: "A deterministic simulated trader career game." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><header className="site-header"><nav className="nav"><Link className="brand" href="/">PNL FREAKS</Link><div className="nav-links"><Link href="/terminal">TERMINAL</Link><Link href="/freaks">FREAKS</Link><Link href="/leaderboard">LEADERBOARD</Link><Link href="/history">HISTORY</Link></div></nav></header>{children}<footer className="shell muted" style={{paddingTop:20,borderTop:"1px solid var(--line)",fontSize:11}}>SIM IS FICTIONAL GAME ACCOUNTING. NO REAL POSITION IS OPENED. NO BLOCKCHAIN. NO TOKEN. NO CASH-OUT.</footer></body></html>;
}
