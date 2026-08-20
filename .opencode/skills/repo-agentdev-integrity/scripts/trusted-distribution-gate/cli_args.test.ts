// CLI argument acceptance data for cli.ts, fixed before the node:util.parseArgs
// migration (Issue #2354 / OU-003, REQ-044-003). Expectations pin the current
// hand-written switch parser; the migrated parser must reproduce them exactly.
// Spawns `bun cli.ts` directly (no PowerShell entry) and asserts exit code and
// stderr/stdout contracts.

import { describe, expect, test } from "bun:test";
import { join } from "path";

const CLI = join(import.meta.dir, "cli.ts");

function runCli(args: readonly string[]): { stdout: string; stderr: string; code: number } {
  const r = Bun.spawnSync(["bun", CLI, ...args]);
  return {
    stdout: r.stdout.toString(),
    stderr: r.stderr.toString(),
    code: r.exitCode,
  };
}

describe("cli.ts argument acceptance data (pre-migration fix, OU-003)", () => {
  test("--help prints usage to stdout and exits 0", () => {
    const r = runCli(["--help"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("usage: bun cli.ts");
  });

  test("-h is the short form of --help", () => {
    const r = runCli(["-h"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("usage: bun cli.ts");
  });

  test("no args reports missing required argument(s) with exit 8", () => {
    const r = runCli([]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("unknown long option is rejected with exit 8", () => {
    const r = runCli(["--bogus"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --bogus");
  });

  test("unknown short option is rejected with exit 8", () => {
    const r = runCli(["-x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: -x");
  });

  test("short option cluster is rejected as the original arg with exit 8", () => {
    const r = runCli(["-hx"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: -hx");
  });

  test("positional argument is rejected as unknown with exit 8", () => {
    const r = runCli(["foo"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: foo");
  });

  test("--option=value form is rejected as unknown with exit 8", () => {
    const r = runCli(["--base-oid=x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --base-oid=x");
  });

  // bun's own CLI strips a leading `--` from the script argv, so a bare `--`
  // is observable only in a non-leading position.
  test("mid-position -- is rejected as unknown with exit 8", () => {
    const r = runCli(["--candidate-oid", "c", "--"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --");
  });

  test("--help wins when it appears before an unknown arg", () => {
    const r = runCli(["--help", "--bogus"]);
    expect(r.code).toBe(0);
  });

  test("unknown arg wins when it appears before --help", () => {
    const r = runCli(["--bogus", "--help"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --bogus");
  });

  test("--base-oid without a value (trailing) is treated as missing required (exit 8)", () => {
    const r = runCli([
      "--candidate-oid", "c",
      "--repo-root", "r",
      "--output-dir", "o",
      "--repository-identity", "i",
      "--base-oid",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("--base-oid consumes the next option name as its value, rejecting the orphaned value (exit 8)", () => {
    const r = runCli([
      "--base-oid",
      "--candidate-oid", "c",
      "--repo-root", "r",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: c");
  });

  test("empty string --base-oid is treated as missing required (exit 8)", () => {
    const r = runCli([
      "--base-oid", "",
      "--candidate-oid", "c",
      "--repo-root", "r",
      "--output-dir", "o",
      "--repository-identity", "i",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("-- consumed as an option value leaves the next arg rejected (exit 8)", () => {
    const r = runCli(["--repo-root", "--", "x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: x");
  });

  test("--bootstrap-report with a value but no --repo-root reports the report-mode requirement (exit 8)", () => {
    const r = runCli(["--bootstrap-report", "oid"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain(
      "cli.ts: --bootstrap-report requires --base-oid and --repo-root",
    );
  });
});
