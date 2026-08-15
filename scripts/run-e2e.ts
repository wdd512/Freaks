import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const playwrightCli = path.join(root, "node_modules", "@playwright", "test", "cli.js");
const server = spawn(process.execPath, [nextCli, "dev"], { cwd: root, stdio: "inherit", detached: process.platform !== "win32" });

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/state");
      if (response.ok || response.status === 500) return;
    } catch { /* server is still booting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Next.js did not start within 60 seconds");
}

function stopServer(): void {
  if (!server.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* already stopped */ }
  }
}

let testExitCode = 1;
try {
  await waitForServer();
  const tests = spawn(process.execPath, [playwrightCli, "test"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, E2E_MANAGED_SERVER: "true" },
  });
  testExitCode = await new Promise<number>((resolve) => tests.on("exit", (exitCode) => resolve(exitCode ?? 1)));
} finally {
  stopServer();
}
process.exit(testExitCode);
