// Starts the API (port 3000) and the website (Vite, port 5173) with one command:
//   npm run dev:all
// The website opens in your browser once it is ready. Press Ctrl+C to stop both.
// MySQL must already be running (XAMPP Control Panel -> Start next to MySQL).
import { spawn, spawnSync } from "node:child_process";

const services = [
  { name: "api", command: "npm run dev:api", color: "\x1b[36m" },
  { name: "web", command: "npm run dev -- --open", color: "\x1b[35m" },
];
const reset = "\x1b[0m";
const isWindows = process.platform === "win32";
const children = [];
let shuttingDown = false;

function prefixLines(service, stream, output) {
  let buffer = "";
  const label = `${service.color}[${service.name}]${reset}`;
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) output.write(`${label} ${line}\n`);
  });
  stream.on("end", () => {
    if (buffer) output.write(`${label} ${buffer}\n`);
  });
}

function stopAll() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    try {
      if (isWindows) {
        // Kill the whole process tree (the shell plus npm plus node).
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        process.kill(-child.pid, "SIGTERM"); // the child's own process group
      }
    } catch {
      // already stopped
    }
  }
}

console.log("Starting SWink: API on http://localhost:3000, website on http://localhost:5173");
console.log("Make sure MySQL is started in XAMPP. Press Ctrl+C to stop everything.\n");

for (const service of services) {
  const child = spawn(service.command, {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    detached: !isWindows,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  children.push(child);
  prefixLines(service, child.stdout, process.stdout);
  prefixLines(service, child.stderr, process.stderr);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(
      `\n[${service.name}] stopped unexpectedly (${signal ?? `exit code ${code}`}). Stopping everything.`,
    );
    process.exitCode = code || 1;
    stopAll();
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, stopAll);
}
