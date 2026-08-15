export function gameLog(event: string, data: Record<string, unknown>): void {
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), event, ...data }));
}
