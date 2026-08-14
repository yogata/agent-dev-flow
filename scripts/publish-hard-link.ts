// WP-3 / DEC-014 decision 7 (Issue #2092): atomic no-clobber linearization
// for the release archive publish step. Digest-binding revision: the
// helper verifies the staged ZIP's SHA-256 against a host-computed digest
// BEFORE the atomic linkSync AND verifies the final path's SHA-256 AFTER
// linkSync, so the bytes the host validated are provably the bytes that
// get published.
//
// Stage A solves the same invariant via `fs.linkSync` in
// .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/
// archive-publish.ts. PowerShell 10 on .NET 10 does NOT surface
// `[System.IO.File]::CreateHardLink`, so the Stage B release script delegates
// the publish primitive to this trusted host Bun helper.
//
// Contract:
//   - argv: <staged> <final> <expectedSha256>
//   - Verifies staged file exists.
//   - Verifies expectedSha256 is exactly 64 lowercase-or-uppercase hex chars.
//   - Reads staged bytes, computes SHA-256, asserts equality with the
//     expected digest (case-insensitive). This is the byte-binding
//     verification: any candidate-controlled or external mutation of the
//     staged path between the host's Get-FileHash and the helper's read
//     is detected here, BEFORE any linkSync side-effect.
//   - Calls `fs.linkSync(staged, final)`. POSIX/Windows atomic; fails with
//     EEXIST if final already exists. NO copy fallback. NO rename fallback.
//     NO overwrite path.
//   - Reads final bytes, computes SHA-256, asserts equality with the same
//     expected digest. This is defense in depth: it proves the hard link
//     published the exact validated bytes (final shares the staged inode,
//     so the digests are equal unless an OS-level fault occurred between
//     linkSync and the final read). On mismatch the helper unlinks the
//     final path it just created (linkSync created it on this invocation;
//     no pre-existing final could have reached this point because
//     linkSync would have failed EEXIST) and exits 9.
//   - On success the staged path still exists (hard link shares the inode);
//     the caller's stage-cleanup removes it without affecting the final
//     path's bytes.
//   - Exit codes:
//       0  hard link created (publication succeeded; both digests verified)
//       3  collision (final path already exists; final untouched)
//       9  other error (bad args, bad digest format, missing source,
//          staged digest mismatch, IO failure, post-link final digest
//          mismatch after best-effort cleanup)
//
// This helper is a trusted host primitive. It does NOT read environment
// variables for path or digest overrides; both arrive only via argv.

import * as crypto from "crypto";
import * as fs from "fs";

function fail(code: number, message: string): never {
  process.stderr.write(`publish-hard-link: ${message}\n`);
  process.exit(code);
}

const argv = process.argv.slice(2);
if (argv.length !== 3) {
  fail(9, `expected exactly 3 args (<staged> <final> <expectedSha256>), got ${argv.length}`);
}
const staged = argv[0];
const final = argv[1];
const expectedHex = argv[2];
// argv.length check above guarantees all three are present; the guard
// exists to satisfy noUncheckedIndexedAccess narrowing.
if (staged === undefined || final === undefined || expectedHex === undefined) {
  fail(9, "unreachable: argv element undefined despite length check");
}

const expected = expectedHex.toLowerCase();
if (!/^[0-9a-f]{64}$/.test(expected)) {
  fail(9, `expectedSha256 must be 64 hex chars, got: ${expectedHex}`);
}

if (!fs.existsSync(staged)) {
  fail(9, `staged source not found: ${staged}`);
}

// Byte-binding verification #1: staged digest must match host-computed
// digest. Any mutation of the staged path after the host's Get-FileHash is
// detected here, before any publish side-effect.
const stagedDigest = crypto.createHash("sha256").update(fs.readFileSync(staged)).digest("hex");
if (stagedDigest !== expected) {
  fail(
    9,
    `staged digest mismatch: expected ${expected}, got ${stagedDigest}; refusing to publish`,
  );
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

// Byte-binding verification #2: final digest must match the same expected
// digest. The hard link makes the final name share the staged inode, so
// this is a defense-in-depth check that catches OS-level faults between
// linkSync and the final read. If it fails, the final path was created by
// THIS helper invocation (linkSync would have failed EEXIST on a
// pre-existing final), so unlinking it is safe and recovers cleanly.
const finalDigest = crypto.createHash("sha256").update(fs.readFileSync(final)).digest("hex");
if (finalDigest !== expected) {
  try {
    fs.unlinkSync(final);
  } catch (cleanupErr) {
    const cleanupMsg = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
    fail(
      9,
      `final digest mismatch after linkSync: expected ${expected}, got ${finalDigest}; cleanup unlink FAILED: ${cleanupMsg}. MANUAL REMOVAL REQUIRED: ${final}`,
    );
  }
  fail(
    9,
    `final digest mismatch after linkSync: expected ${expected}, got ${finalDigest}; final path removed`,
  );
}

process.stdout.write(`${final}\n`);
process.exit(0);
