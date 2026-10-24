import { spawn } from "node:child_process";
const children = [["--prefix", "server", "run", "dev"], ["run", "dev"]].map((args) =>
  spawn("npm", args, { stdio: "inherit" }),
);
function stop() {
  children.forEach((child) => child.kill("SIGTERM"));
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) =>
  child.on("exit", (code) => {
    if (code) {
      stop();
      process.exitCode = code;
    }
  }),
);
