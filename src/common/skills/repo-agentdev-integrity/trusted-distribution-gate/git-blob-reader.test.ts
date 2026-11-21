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
  makeProductionAdapter,
  readBlobsBatched,
  type RawGitAdapter,
  GitAdapterError,
} from "./git-blob-reader.ts";
import { PathSafetyError, assertGitOid, type RepoPath } from "./types.ts";
import { loadAndClassify, type LoadedBlob } from "./blob-loader.ts";
import { checkBlobPresent, readBlob as readBlobBatch, parseBatchedResponse } from "./git-blob-batch.ts";
import { makeFixtureRepo, disposeRepo, headOid as fixtureHeadOid, makeTmpDir } from "./launcher-fixture.ts";

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "trust-gbr-"));

beforeAll(() => {
  execSync("git init -q -b main", { cwd: TMP_ROOT });
  fs.writeFileSync(path.join(TMP_ROOT, ".gitattributes"), "* text=auto eol=lf\n", "utf-8");
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

// =============================================================================
// Blob loader — consolidated from blob-loader.test.ts.
// =============================================================================

const BL_FAKE_OID = assertGitOid("0".repeat(40));

function blEntry(path: string): Parameters<typeof loadAndClassify>[2][number] {
  return { mode: "100644", object_kind: "blob", oid: BL_FAKE_OID, path };
}

function blAdapter(blobs: Record<string, Uint8Array>): RawGitAdapter {
  return {
    cwd: "/fake",
    spawnGit(args: readonly string[]): Buffer {
      const last = args[args.length - 1] ?? "";
      const colon = last.indexOf(":");
      const path = colon >= 0 ? last.substring(colon + 1) : last;
      const bytes = blobs[path];
      if (!bytes) {
        throw new Error(`cat-file: path not found: ${path}`);
      }
      return Buffer.from(bytes);
    },
    spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
      const cmd = args[1];
      const lines = input.toString("utf-8").split("\n").filter((l) => l.length > 0);
      if (cmd === "--batch-check") {
        const out: string[] = [];
        for (const line of lines) {
          const colon = line.indexOf(":");
          const p = colon >= 0 ? line.substring(colon + 1) : line;
          const bytes = blobs[p];
          if (bytes) {
            out.push(`${line.substring(0, colon)} blob ${bytes.length}`);
          } else {
            out.push(`${line} missing`);
          }
        }
        return Buffer.from(out.join("\n") + "\n", "utf-8");
      }
      const chunks: Buffer[] = [];
      for (const line of lines) {
        const colon = line.indexOf(":");
        const p = colon >= 0 ? line.substring(colon + 1) : line;
        const bytes = blobs[p];
        if (bytes) {
          chunks.push(Buffer.from(`${line.substring(0, colon)} blob ${bytes.length}\n`, "utf-8"));
          chunks.push(Buffer.from(bytes));
          chunks.push(Buffer.from("\n"));
        } else {
          chunks.push(Buffer.from(`${line} missing\n`));
        }
      }
      return Buffer.concat(chunks);
    },
  };
}

describe("blob-loader / loadAndClassify", () => {
  test("loads text blobs with UTF-8 content and runtime subset", () => {
    const adapter = blAdapter({
      "src/common/commands/agentdev/case-run.md": new TextEncoder().encode("# case-run\n"),
    });
    const r = loadAndClassify(adapter, BL_FAKE_OID, [blEntry("src/common/commands/agentdev/case-run.md")]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs).toHaveLength(1);
    const b: LoadedBlob = r.blobs[0]!;
    expect(b.text).toBe("# case-run\n");
    expect(b.subset).toBe("runtime");
  });

  test("skips entries outside known projections", () => {
    const adapter = blAdapter({ "README.md": new TextEncoder().encode("# readme\n") });
    const r = loadAndClassify(adapter, BL_FAKE_OID, [blEntry("README.md")]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs).toHaveLength(0);
  });

  test("accepts allowlisted binary .lock entry (text stays null)", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02]);
    const adapter = blAdapter({ "src/common/skills/agentdev-foo/scripts/bun.lock": bytes });
    const r = loadAndClassify(adapter, BL_FAKE_OID, [blEntry("src/common/skills/agentdev-foo/scripts/bun.lock")]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs[0]?.text).toBeNull();
  });

  test("rejects NUL byte in shipped runtime .md (EncodingViolation)", () => {
    const bytes = new Uint8Array([0x23, 0x00, 0x61]);
    const adapter = blAdapter({ "src/common/skills/agentdev-foo/SKILL.md": bytes });
    const r = loadAndClassify(adapter, BL_FAKE_OID, [blEntry("src/common/skills/agentdev-foo/SKILL.md")]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6);
  });

  test("rejects unknown binary extension in shipped projection", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const adapter = blAdapter({ "src/common/skills/agentdev-foo/assets/data.bin": bytes });
    const r = loadAndClassify(adapter, BL_FAKE_OID, [blEntry("src/common/skills/agentdev-foo/assets/data.bin")]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6);
  });
});

// =============================================================================
// Batched reads — consolidated from batched-reads.test.ts (representative
// cases) and launcher-blockers.test.ts (typed failure routing).
// =============================================================================

function asRepoPath(p: string): RepoPath {
  return p as RepoPath;
}

function adapterReturning(rawResponse: Buffer): RawGitAdapter {
  return {
    cwd: "/fake",
    spawnGit(): Buffer {
      throw new Error("unexpected spawnGit");
    },
    spawnGitWithInput(): Buffer {
      return rawResponse;
    },
  };
}

describe("git-blob-reader / batched reads integration", () => {
  test("readBlobsBatched returns all present blobs in ONE subprocess", () => {
    const repo = makeFixtureRepo();
    try {
      const head = fixtureHeadOid(repo);
      const adapter = makeProductionAdapter(asRepoPath(repo));
      const entries = listTreeEntries(adapter, assertGitOid(head), "candidate");
      const interesting = entries
        .map((e) => e.path)
        .filter((p) => p.startsWith("src/common/") || p.startsWith("scripts/install-"))
        .slice(0, 5);
      expect(interesting.length).toBeGreaterThan(0);
      const requests = interesting.map((p) => `${head}:${p}`);
      const result = readBlobsBatched(adapter, requests);
      expect(result.found.size + result.missing.length).toBe(requests.length);
      expect(result.found.size).toBeGreaterThan(0);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("adapter failure (bad repo root) raises GitAdapterError, not silent missing", () => {
    const notARepo = makeTmpDir("trust-not-a-repo-");
    try {
      const adapter = makeProductionAdapter(asRepoPath(notARepo));
      const fakeOid = assertGitOid("0".repeat(40));
      expect(() => readBlobsBatched(adapter, [`${fakeOid}:foo.md`])).toThrow();
    } finally {
      try { fs.rmSync(notARepo, { recursive: true, force: true }); } catch { void 0; }
    }
  }, 60000);
});

describe("git-blob-batch / strict protocol validation", () => {
  const REQ = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";

  test("explicit valid missing response is recorded in missing", () => {
    const buf = Buffer.from(`${REQ} missing\n`);
    const r = readBlobsBatched(adapterReturning(buf), [REQ]);
    expect(r.missing).toEqual([REQ]);
    expect(r.found.size).toBe(0);
  });

  test("explicit valid blob response is recorded in found", () => {
    const body = Buffer.from("# hi\n");
    const header = `deadbeefcafe00000000000000000000000000ff blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    const r = readBlobsBatched(adapterReturning(buf), [REQ]);
    expect(r.found.size).toBe(1);
    expect(r.missing).toEqual([]);
  });

  test("truncated header (no newline) throws GitAdapterError", () => {
    const buf = Buffer.from("deadbeefcafe00000000000000000000000000ff blob 5");
    expect(() => readBlobsBatched(adapterReturning(buf), [REQ])).toThrow(GitAdapterError);
  });

  test("wrong object kind (commit instead of blob) throws GitAdapterError", () => {
    const buf = Buffer.from("deadbeefcafe00000000000000000000000000ff commit 5\nabcde\n");
    expect(() => readBlobsBatched(adapterReturning(buf), [REQ])).toThrow(GitAdapterError);
  });

  test("checkBlobPresent distinguishes present and missing with strict echo", () => {
    const oid = assertGitOid("a".repeat(40));
    const present = Buffer.from(`${oid} blob 5\n`);
    expect(checkBlobPresent(adapterReturning(present), oid, "docs/foo.md").kind).toBe("present");
    const missing = Buffer.from(`${oid}:docs/absent.md missing\n`);
    expect(checkBlobPresent(adapterReturning(missing), oid, "docs/absent.md").kind).toBe("missing");
    const mismatch = Buffer.from(`not-a-valid-oid blob 5\n`);
    expect(checkBlobPresent(adapterReturning(mismatch), oid, "docs/foo.md").kind).toBe("error");
  });

  test("parseBatchedResponse accepts a valid 64-char SHA-256 resolved OID", () => {
    const req = `${"a".repeat(40)}:a.md`;
    const body = Buffer.from("# hi\n");
    const header = `${"b".repeat(64)} blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    const r = parseBatchedResponse(buf, [req]);
    expect(r.found.size).toBe(1);
  });

  test("readBlobBatch throws GitAdapterError when adapter lacks spawnGitWithInput", () => {
    const brokenAdapter = {
      cwd: "/fake",
      spawnGit(): Buffer {
        throw new Error("should not be called");
      },
    } as unknown as RawGitAdapter;
    expect(() => readBlobBatch(brokenAdapter, assertGitOid("a".repeat(40)), "lbl", "a.md")).toThrow(GitAdapterError);
  });
});
