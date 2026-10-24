import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { env } from "../src/config/env.js";
const dir = new URL("../backups/", import.meta.url);
await mkdir(dir, { recursive: true, mode: 0o700 });
const archive = new URL(
  `rangvanaat-${new Date().toISOString().replace(/[:.]/g, "-")}.gz`,
  dir,
);
const child = spawn(
  "mongodump",
  [
    "--uri",
    env.MONGO_URI,
    "--archive=" + decodeURIComponent(archive.pathname),
    "--gzip",
  ],
  { stdio: "inherit" },
);
child.on("error", () => {
  console.error(
    "Install MongoDB Database Tools (mongodump) before running backups",
  );
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code || 0;
  if (!code)
    console.log(
      "Backup created in server/backups. Copy to encrypted off-site storage.",
    );
});
