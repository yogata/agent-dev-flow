// Tests for the git-blob-reader adapter.
//
// The adapter is the ONLY component that talks to git. It is side-EFFECT-ful
// (spawns git subprocesses) but the detector pipeline remains pure. The
// adapter must reject symlinks, gitlinks, unknown modes, and never execute
// candidate code.

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync, execSync } from "child_process";
import {
  parseGitLsTreeLine,
  parseLsTreeOutput,
  readBlob,
  listTreeEntries,
  type RawGitAdapter,
  GitAdapterError,
} from "./git-blob-reader.ts";
import { PathSafetyError, assertGitOid } from "./types.ts";

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "trust-gbr-"));

beforeAll(() => {
  execSync("git init -q -b main", { cwd: TMP_ROOT });
  execSync('git config user.email "t@t"', { cwd: TMP_ROOT });
  execSync('git config user.name "t"', { cwd: TMP_ROOT });
  fs.writeFileSync(path.join(TMP_ROOT, "regular.md"), "# hi\n");
  fs.mkdirSync(path.join(TMP_ROOT, "sub"), { recursive: true });
  fs.writeFileSync(path.join(TMP_ROOT, "sub", "deep.md"), "deep\n");
  if (process.platform !== "win32") {
    fs.symlinkSync("regular.md", path.join(TMP_ROOT, "link.md"));
  }
  execSync("git add -A", { cwd: TMP_ROOT });
  execSync('git commit -q -m "fixture"', { cwd: TMP_ROOT });
});

afterAll(() => {
  try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch (e) { void e; }
});

function headOid(): string {
  return execSync("git rev-parse HEAD", { cwd: TMP_ROOT }).toString().trim();
}

describe("git-blob-reader / parseGitLsTreeLine", () => {
  test("parses a regular blob line", () => {
    const line = "100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tpath/to/file.md";
    const e = parseGitLsTreeLine(line);
    expect(e).not.toBeNull();
    expect(e?.mode).toBe("100644");
    expect(e?.object_kind).toBe("blob");
    expect(e?.oid).toBe(assertGitOid("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
    expect(e?.path).toBe("path/to/file.md");
  });

  test("parses an executable blob line", () => {
    const line = "100755 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\trun.sh";
    const e = parseGitLsTreeLine(line);
    expect(e?.mode).toBe("100755");
  });

  test("rejects symlink mode (120000) as PathSafetyError (parent defect #10)", () => {
    const line = "120000 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tlink.md";
    expect(() => parseGitLsTreeLine(line)).toThrow(PathSafetyError);
  });

  test("rejects gitlink mode (160000) as PathSafetyError (parent defect #10)", () => {
    const line = "160000 commit aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tsubmodule";
    expect(() => parseGitLsTreeLine(line)).toThrow(PathSafetyError);
  });

  test("rejects tree kind as PathSafetyError (parent defect #10)", () => {
    const line = "040000 tree aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tsubdir";
    expect(() => parseGitLsTreeLine(line)).toThrow(PathSafetyError);
  });

  test("rejects unknown mode as PathSafetyError (parent defect #10)", () => {
    const line = "100645 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tweird.md";
    expect(() => parseGitLsTreeLine(line)).toThrow(PathSafetyError);
  });

  test("rejects malformed line (no tab)", () => {
    const line = "100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa no-tab";
    expect(() => parseGitLsTreeLine(line)).toThrow(GitAdapterError);
  });
});

describe("git-blob-reader / parseLsTreeOutput", () => {
  test("parses NUL-separated lines", () => {
    const out = [
      "100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\ta.md",
      "100644 blob bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\tb.md",
    ].join("\0");
    const entries = parseLsTreeOutput(out);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.path).toBe("a.md");
    expect(entries[1]?.path).toBe("b.md");
  });

  test("skips empty trailing entry", () => {
    const out = "100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\ta.md\0";
    const entries = parseLsTreeOutput(out);
    expect(entries).toHaveLength(1);
  });

  test("rejects duplicate paths", () => {
    const out = [
      "100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\ta.md",
      "100644 blob bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\ta.md",
    ].join("\0");
    expect(() => parseLsTreeOutput(out)).toThrow(GitAdapterError);
  });
});

describe("git-blob-reader / listTreeEntries (real git)", () => {
  test("lists regular files only", () => {
    const oid = assertGitOid(headOid());
    const adapter = makeRealAdapter();
    const entries = listTreeEntries(adapter, oid, "HEAD");
    const paths = entries.map((e) => e.path).sort();
    expect(paths).toContain("regular.md");
    expect(paths).toContain("sub/deep.md");
  });

  test("rejects symlink mode at runtime (PathSafetyError, parent defect #10)", () => {
    if (process.platform === "win32") return; // skip symlink test on Windows
    const oid = assertGitOid(headOid());
    const adapter = makeRealAdapter();
    expect(() => listTreeEntries(adapter, oid, "HEAD")).toThrow(PathSafetyError);
  });
});

describe("git-blob-reader / readBlob (real git)", () => {
  test("reads file bytes", () => {
    const oid = assertGitOid(headOid());
    const adapter = makeRealAdapter();
    const bytes = readBlob(adapter, oid, "HEAD", "regular.md");
    expect(new TextDecoder().decode(bytes)).toBe("# hi\n");
  });

  test("throws on missing path", () => {
    const oid = assertGitOid(headOid());
    const adapter = makeRealAdapter();
    expect(() => readBlob(adapter, oid, "HEAD", "missing.md")).toThrow();
  });
});

function makeRealAdapter(): RawGitAdapter {
  return {
    cwd: TMP_ROOT,
    spawnGit(args: readonly string[]): Buffer {
      return execSync(`git ${args.join(" ")}`, { cwd: TMP_ROOT }) as Buffer;
    },
    spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
      return execFileSync("git", [...args], {
        cwd: TMP_ROOT,
        input,
        maxBuffer: 256 * 1024 * 1024,
      }) as Buffer;
    },
  };
}
