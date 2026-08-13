// Direct regression tests for scripts/publish-hard-link.ts.
//
// Pins the contract required by Issue #2092 Stage B (digest-binding revision):
//   - argv protocol: <staged> <final> <expectedSha256> (3 args, no env overrides).
//   - happy path: staged digest matches, hard-link created, final digest
//     matches, exit 0; contents reachable via both names; removing staged
//     does NOT affect final (same inode).
//   - collision: EEXIST surfaces as exit 3; final untouched; staged intact.
//   - missing source: exit 9.
//   - wrong arg count: exit 9.
//   - invalid digest format: exit 9.
//   - staged digest mismatch: exit 9, NO linkSync attempted, NO final
//     created. This is the byte-binding primitive that detects any
//     candidate-controlled or external mutation of $stagedZip between
//     the host's Get-FileHash computation and the helper's read.
//   - NO copy/rename fallback in the helper text.

import { describe, expect, test } from "bun:test";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const HELPER = path.join(REPO_ROOT, "scripts", "publish-hard-link.ts");

interface Run {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

function sha256Hex(p: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function run(staged: string, final: string): Run {
  return runRaw([staged, final, sha256Hex(staged)]);
}

function runRaw(args: string[]): Run {
  const r = spawnSync("bun", ["run", HELPER, ...args], { encoding: "utf-8" });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "publish-hl-"));
}

describe("publish-hard-link.ts / happy path", () => {
  test("creates final as a hard link; final survives staged unlink", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    const final = path.join(dir, "final.zip");
    const payload = Buffer.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0]); // PK\x05\x06 EOCD stub
    fs.writeFileSync(staged, payload);

    const r = run(staged, final);
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe(final);

    expect(fs.existsSync(final)).toBe(true);
    expect(fs.readFileSync(final)).toEqual(payload);

    // Hard-link invariant: removing the staged path leaves final intact
    // (both names referenced the same inode).
    fs.unlinkSync(staged);
    expect(fs.existsSync(final)).toBe(true);
    expect(fs.readFileSync(final)).toEqual(payload);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / collision", () => {
  test("pre-existing final -> exit 3, final bytes unchanged, no overwrite", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    const final = path.join(dir, "final.zip");
    fs.writeFileSync(staged, Buffer.from("NEW"));
    fs.writeFileSync(final, Buffer.from("PRE-EXISTING-SENTINEL"));

    const r = run(staged, final);
    expect(r.exitCode).toBe(3);
    expect(fs.readFileSync(final, "utf-8")).toBe("PRE-EXISTING-SENTINEL");
    // Staged file is left intact on collision; caller cleans up.
    expect(fs.existsSync(staged)).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / missing staged source", () => {
  test("exit 9 when staged does not exist", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "missing.zip");
    const final = path.join(dir, "final.zip");
    // Digest cannot be read from a non-existent file; pass a syntactically
    // valid placeholder and expect the helper to fail on the missing-source
    // check before any digest comparison.
    const r = runRaw([staged, final, "0".repeat(64)]);
    expect(r.exitCode).toBe(9);
    expect(fs.existsSync(final)).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / argument contract", () => {
  test("zero args -> exit 9", () => {
    const r = runRaw([]);
    expect(r.exitCode).toBe(9);
    expect(r.stderr).toMatch(/expected exactly 3 args/i);
  });

  test("one arg -> exit 9", () => {
    const r = runRaw(["only-one"]);
    expect(r.exitCode).toBe(9);
  });

  test("legacy two args -> exit 9 (digest arg is mandatory)", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    fs.writeFileSync(staged, Buffer.from("X"));
    const r = runRaw([staged, path.join(dir, "final.zip")]);
    expect(r.exitCode).toBe(9);
    expect(r.stderr).toMatch(/expected exactly 3 args/i);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / digest protocol (Issue #2092 Stage B byte binding)", () => {
  test("invalid digest format -> exit 9, no linkSync, no final", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    fs.writeFileSync(staged, Buffer.from("X"));
    const r = runRaw([staged, path.join(dir, "final.zip"), "not-a-valid-hash"]);
    expect(r.exitCode).toBe(9);
    expect(r.stderr).toMatch(/64 hex chars/i);
    expect(fs.existsSync(path.join(dir, "final.zip"))).toBe(false);
    // Staged file is left intact for caller cleanup.
    expect(fs.existsSync(staged)).toBe(true);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("staged digest mismatch -> exit 9, NO linkSync attempted, NO final created", () => {
    // This is the byte-binding primitive. If anything (candidate code,
    // external process, OS race) mutates $stagedZip after the host
    // computed the digest, the helper MUST refuse to publish and exit 9
    // before any linkSync side-effect.
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    const final = path.join(dir, "final.zip");
    fs.writeFileSync(staged, Buffer.from("CANDIDATE-MUTATED-BYTES"));
    // A digest that does NOT match the staged bytes (all-zero placeholder).
    const wrongDigest = "0".repeat(64);

    const r = runRaw([staged, final, wrongDigest]);
    expect(r.exitCode).toBe(9);
    expect(r.stderr).toMatch(/staged digest mismatch/i);
    // CRITICAL: linkSync MUST NOT have run, so no final path is created.
    expect(fs.existsSync(final)).toBe(false);
    // Staged file is left intact on digest mismatch; caller cleans up.
    expect(fs.existsSync(staged)).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("staged digest match -> linkSync -> final digest verified -> exit 0", () => {
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    const final = path.join(dir, "final.zip");
    const payload = Buffer.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0]);
    fs.writeFileSync(staged, payload);
    // Digest computed independently of the helper to prove the helper
    // reads the same bytes and verifies them.
    const digest = crypto.createHash("sha256").update(payload).digest("hex");

    const r = runRaw([staged, final, digest]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe(final);
    expect(fs.readFileSync(final)).toEqual(payload);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("digest format is case-insensitive (PowerShell Get-FileHash returns uppercase)", () => {
    // The release script uses PowerShell Get-FileHash which emits uppercase
    // hex. The helper must accept either case.
    const dir = tmpDir();
    const staged = path.join(dir, "staged.zip");
    const final = path.join(dir, "final.zip");
    fs.writeFileSync(staged, Buffer.from("UPPER-CASE-INPUT"));
    const upperDigest = sha256Hex(staged).toUpperCase();

    const r = runRaw([staged, final, upperDigest]);
    expect(r.exitCode).toBe(0);
    expect(fs.existsSync(final)).toBe(true);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / no fallback primitive", () => {
  test("helper body contains no copy/rename/Move-Item fallback", () => {
    const txt = fs.readFileSync(HELPER, "utf-8");
    // The ONLY link primitive allowed in the helper is fs.linkSync.
    expect(txt).toMatch(/fs\.linkSync\(/);
    expect(txt).not.toMatch(/\bcopyFileSync\b/);
    expect(txt).not.toMatch(/\brenameSync\b/);
    expect(txt).not.toMatch(/\bMove-Item\b/);
    expect(txt).not.toMatch(/\bunzipSync\b/);
  });
});
