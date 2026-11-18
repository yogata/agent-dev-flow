// Test-only worker for true two-process publication race.
//
// Usage: bun concurrent-publish.test-worker.ts <outputRoot> <finalName> <readyFile> <goFile> <resultFile>
//
// Each worker:
//   1. Prepares a staged archive under outputRoot
//   2. Writes "READY" to readyFile
//   3. Polls for goFile existence (GO barrier)
//   4. Calls publishStagedArchive targeting <outputRoot>/<finalName>
//   5. Writes result to resultFile
//   6. Exits 0 (success) or 3 (EEXIST loser)

import * as fs from "fs";
import * as path from "path";
import { prepareStagedArchive, publishStagedArchive } from "./archive-publish.ts";

const args = process.argv.slice(2);
const outputRoot = args[0]!;
const finalName = args[1]!;
const readyFile = args[2]!;
const goFile = args[3]!;
const resultFile = args[4]!;

const blobContent = new TextEncoder().encode("# staged blob\n");
const stage = prepareStagedArchive(
  [{ archivePath: "a.md", bytes: blobContent }],
  outputRoot,
);

fs.writeFileSync(readyFile, "READY");

const deadline = Date.now() + 30000;
while (!fs.existsSync(goFile) && Date.now() < deadline) {
  // spin-wait for GO signal
}

if (!fs.existsSync(goFile)) {
  fs.writeFileSync(resultFile, "TIMEOUT");
  process.exit(99);
}

try {
  publishStagedArchive(stage, path.join(outputRoot, finalName), outputRoot);
  fs.writeFileSync(resultFile, "OK");
  process.exit(0);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  try { stage.cleanup(); } catch (cleanupErr) { void cleanupErr; }
  fs.writeFileSync(resultFile, `FAIL:${msg}`);
  process.exit(3);
}
