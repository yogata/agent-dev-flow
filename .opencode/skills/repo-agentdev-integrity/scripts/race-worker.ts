// Test-only worker for two-process concurrent hard-link race tests.
//
// Contract:
//   - argv: <ready-file> <go-file> <staged-zip> <final-zip>
//   - Writes "READY" to <ready-file> when ready to call publish-hard-link
//   - Polls for <go-file> existence before calling publish-hard-link
//   - Computes SHA-256 of <staged-zip> and passes it as the digest argv
//     so the helper's 3-arg digest-binding protocol is exercised.
//   - Calls bun run <staged-zip> <final-zip> <digest> via
//     scripts/publish-hard-link.ts
//   - Exits with publish-hard-link's exit code (0 = success, 3 = collision, 9 = other)
//   - No prose assertions; only primitive exit codes
//
// Usage: This worker is spawned by test suites to prove the hard-link
// primitive's atomic behavior under true concurrency.

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

const argv = process.argv.slice(2);
if (argv.length !== 4) {
  process.stderr.write(`race-worker: expected 4 args (<ready-file> <go-file> <staged-zip> <final-zip>), got ${argv.length}\n`);
  process.exit(1);
}
const readyFile = argv[0];
const goFile = argv[1];
const stagedZip = argv[2];
const finalZip = argv[3];
// argv.length check above guarantees all four are present; the guard
// exists to satisfy noUncheckedIndexedAccess narrowing.
if (readyFile === undefined || goFile === undefined || stagedZip === undefined || finalZip === undefined) {
  process.stderr.write("race-worker: unreachable: argv element undefined despite length check\n");
  process.exit(1);
}

// Signal ready state
try {
  fs.writeFileSync(readyFile, "READY", { encoding: "utf-8" });
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`race-worker: failed to write ready file: ${msg}\n`);
  process.exit(1);
}

// Barrier: wait for go file with bounded polling
const deadline = Date.now() + 30000; // 30 second timeout
while (!fs.existsSync(goFile) && Date.now() < deadline) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
}

if (!fs.existsSync(goFile)) {
  process.stderr.write("race-worker: timeout waiting for go file\n");
  process.exit(1);
}

// Compute staged digest immediately before invocation so the helper's
// byte-binding verification has a matching anchor.
const digest = crypto.createHash("sha256").update(fs.readFileSync(stagedZip)).digest("hex");

// Call the real publish-hard-link helper
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");
const PUBLISHER = path.join(REPO_ROOT, "scripts", "publish-hard-link.ts");

const r = spawnSync("bun", ["run", PUBLISHER, stagedZip, finalZip, digest], {
  encoding: "utf-8",
});

// Forward exit code exactly
process.exit(r.status ?? 1);
