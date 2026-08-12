// Direct regression tests for scripts/publish-hard-link.ts.
//
// Pins the contract required by Issue #2092 Stage B:
//   - happy path: hard-link creates final path, contents reachable via both
//     names, removing staged does NOT affect final (same inode).
//   - collision: EEXIST surfaces as exit 3; final untouched.
//   - missing source: exit 9.
//   - wrong arg count: exit 9.
//   - NO copy/rename fallback in the helper text.

import { describe, expect, test } from "bun:test";
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

function run(staged: string, final: string): Run {
  const r = spawnSync("bun", ["run", HELPER, staged, final], {
    encoding: "utf-8",
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
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
    const r = run(staged, final);
    expect(r.exitCode).toBe(9);
    expect(fs.existsSync(final)).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("publish-hard-link.ts / argument contract", () => {
  test("zero args -> exit 9", () => {
    const r = runRaw([]);
    expect(r.exitCode).toBe(9);
    expect(r.stderr).toMatch(/expected exactly 2 args/i);
  });

  test("one arg -> exit 9", () => {
    const r = runRaw(["only-one"]);
    expect(r.exitCode).toBe(9);
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
