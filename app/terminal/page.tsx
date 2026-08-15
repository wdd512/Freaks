import { TerminalClient } from "@/components/terminal/TerminalClient";

export const dynamic="force-dynamic";
export default async function TerminalPage({searchParams}:{searchParams:Promise<{tokenId?:string}>}){const query=await searchParams;return <main className="shell"><TerminalClient initialTokenId={query.tokenId?Number(query.tokenId):undefined}/></main>}
