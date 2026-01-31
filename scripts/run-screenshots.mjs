import { spawn } from "node:child_process";

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const port = process.env.PORT ?? "3100";

  const server = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "start", "-w", "@clawdslist/web", "--", "-p", port],
    {
      stdio: "inherit",
      env: { ...process.env },
    }
  );

  // crude but reliable for MVP (Next prints after it boots)
  await wait(2500);

  const shots = spawn(
    process.platform === "win32" ? "node.exe" : "node",
    ["scripts/take-screenshots.mjs"],
    {
      stdio: "inherit",
      env: { ...process.env, SCREENSHOT_BASE_URL: `http://localhost:${port}` },
    }
  );

  const exitCode = await new Promise((resolve) => {
    shots.on("exit", (code) => resolve(code ?? 1));
  });

  server.kill("SIGTERM");

  if (exitCode !== 0) process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

