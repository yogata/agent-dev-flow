// Tests for the git-blob-reader adapter.
//
// The adapter is the ONLY component that talks to git. It is side-EFFECT-ful
// (spawns git subprocesses) but the detector pipeline remains pure. The
// adapter must reject symlinks, gitlinks, unknown modes, and never execute
// candidate code.

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  parseGitLsTreeLine,
  parseLsTreeOutput,
  readBlob,
  listTreeEntries,
  type RawGitAdapter,
  GitAdapterError,
} from "./git-blob-reader.ts";
import { assertGitOid } from "./types.ts";

// Build a real local git fixture repo so the adapter exercises real git.
const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-trusted-distribution-gate",
);

beforeAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  // Init a fixture repo with one regular file and one symlink target.
  execSync("git init -q -b main", { cwd: TMP_ROOT });
  execSync('git config user.email "t@t"', { cwd: TMP_ROOT });
  execSync('git config user.name "t"', { cwd: TMP_ROOT });
  fs.writeFileSync(path.join(TMP_ROOT, "regular.md"), "# hi\n");
  fs.mkdirSync(path.join(TMP_ROOT, "sub"), { recursive: true });
  fs.writeFileSync(path.join(TMP_ROOT, "sub", "deep.md"), "deep\n");
  // Symlink: skip on Windows.
  if (process.platform !== "win32") {
    fs.symlinkSync("regular.md", path.join(TMP_ROOT, "link.md"));
  }
  execSync("git add -A", { cwd: TMP_ROOT });
  execSync('git commit -q -m "fixture"', { cwd: TMP_ROOT });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
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

  test("rejects symlink mode (120000)", () => {
    const line = "120000 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tlink.md";
    expect(() => parseGitLsTreeLine(line)).toThrow(GitAdapterError);
  });

  test("rejects gitlink mode (160000)", () => {
    const line = "160000 commit aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tsubmodule";
    expect(() => parseGitLsTreeLine(line)).toThrow(GitAdapterError);
  });

  test("rejects tree kind", () => {
    const line = "040000 tree aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tsubdir";
    expect(() => parseGitLsTreeLine(line)).toThrow(GitAdapterError);
  });

  test("rejects unknown mode", () => {
    const line = "100645 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tweird.md";
    expect(() => parseGitLsTreeLine(line)).toThrow(GitAdapterError);
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

  test("rejects symlink mode at runtime", () => {
    if (process.platform === "win32") return; // skip symlink test on Windows
    const oid = assertGitOid(headOid());
    const adapter = makeRealAdapter();
    expect(() => listTreeEntries(adapter, oid, "HEAD")).toThrow(GitAdapterError);
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
  };
}
