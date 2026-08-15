export function assertNever(value: never, context: string): never {
  throw new Error(`Unsupported V1 ${context}: ${String(value)}`);
}

