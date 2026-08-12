// WP-3 / DEC-014 decision 7 (Issue #2092): atomic no-clobber linearization
// for the release archive publish step.
//
// Stage A solves the same invariant via `fs.linkSync` in
// .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/
// archive-publish.ts. PowerShell 10 on .NET 10 does NOT surface
// `[System.IO.File]::CreateHardLink`, so the Stage B release script delegates
// the publish primitive to this trusted host Bun helper.
//
// Contract:
//   - argv: <staged> <final>
//   - Calls `fs.linkSync(staged, final)`. POSIX/Windows atomic; fails with
//     EEXIST if final already exists. NO copy fallback. NO rename fallback.
//     NO overwrite path.
//   - On success the staged path still exists (hard link shares the inode);
//     the caller's stage-cleanup removes it without affecting the final
//     path's bytes.
//   - Exit codes:
//       0  hard link created (publication succeeded)
//       3  collision (final path already exists; final untouched)
//       9  other error (missing source, missing args, IO failure, etc.)
//
// This helper is a trusted host primitive. It does NOT read environment
// variables for path overrides; paths arrive only via argv.

import * as fs from "fs";

function fail(code: number, message: string): never {
  process.stderr.write(`publish-hard-link: ${message}\n`);
  process.exit(code);
}

const argv = process.argv.slice(2);
if (argv.length !== 2) {
  fail(9, `expected exactly 2 args (<staged> <final>), got ${argv.length}`);
}
const [staged, final] = argv;

if (!fs.existsSync(staged)) {
  fail(9, `staged source not found: ${staged}`);
}

try {
  fs.linkSync(staged, final);
} catch (e) {
  const code =
    typeof e === "object" && e !== null && "code" in e &&
      typeof e.code === "string"
      ? e.code
      : undefined;
  const msg = e instanceof Error ? e.message : String(e);
  if (code === "EEXIST") {
    fail(3, `final path already exists (collision, untouched): ${final}`);
  }
  fail(9, `fs.linkSync failed: ${msg} (code=${code ?? "unknown"}) staged=${staged} final=${final}`);
}

process.stdout.write(`${final}\n`);
process.exit(0);
