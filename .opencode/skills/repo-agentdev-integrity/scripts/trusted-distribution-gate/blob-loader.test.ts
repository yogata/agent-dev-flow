// Tests for the blob loader.
//
// Covers: text classification pass-through, binary allowlist (positive and
// negative), and fail-closed behavior for invalid UTF-8 / NUL / unknown
// binary in shipped projection entries (parent defect #4).

import { describe, expect, test } from "bun:test";
import { loadAndClassify, type LoadedBlob } from "./blob-loader.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import type { GitTreeEntry, GitOid } from "./types.ts";
import { assertGitOid } from "./types.ts";

const FAKE_OID: GitOid = assertGitOid("0".repeat(40));

function makeEntry(path: string): GitTreeEntry {
  return {
    mode: "100644",
    object_kind: "blob",
    oid: FAKE_OID,
    path,
  };
}

function makeAdapter(blobs: Record<string, Uint8Array>): RawGitAdapter {
  return {
    cwd: "/fake",
    spawnGit(args: readonly string[]): Buffer {
      const last = args[args.length - 1] ?? "";
      // `git ls-tree ...` not used by loadAndClassify directly.
      // `git cat-file blob <oid>:<path>` — extract path after colon.
      const colon = last.indexOf(":");
      const path = colon >= 0 ? last.substring(colon + 1) : last;
      const bytes = blobs[path];
      if (!bytes) {
        throw new Error(`cat-file: path not found: ${path}`);
      }
      return Buffer.from(bytes);
    },
    spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
      // Support both `cat-file --batch` and `--batch-check`.
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
      // --batch: emit header + body + newline for present; missing line otherwise.
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

describe("blob-loader / loadAndClassify text", () => {
  test("loads text blobs with UTF-8 content", () => {
    const adapter = makeAdapter({
      "src/opencode/commands/agentdev/case-run.md": new TextEncoder().encode("# case-run\n"),
    });
    const r = loadAndClassify(adapter, FAKE_OID, [makeEntry("src/opencode/commands/agentdev/case-run.md")]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs).toHaveLength(1);
    const b: LoadedBlob = r.blobs[0]!;
    expect(b.text).toBe("# case-run\n");
    expect(b.subset).toBe("runtime");
  });

  test("skips entries outside known projections", () => {
    const adapter = makeAdapter({
      "README.md": new TextEncoder().encode("# readme\n"),
    });
    const r = loadAndClassify(adapter, FAKE_OID, [makeEntry("README.md")]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs).toHaveLength(0);
  });
});

describe("blob-loader / binary allowlist", () => {
  test("accepts allowlisted .lock binary", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02]); // NUL → binary
    const adapter = makeAdapter({
      "src/opencode/skills/agentdev-foo/scripts/bun.lock": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("src/opencode/skills/agentdev-foo/scripts/bun.lock"),
    ]);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.blobs[0]?.text).toBeNull();
  });

  test("accepts allowlisted .png binary", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00]); // PNG header + NUL
    const adapter = makeAdapter({
      "src/opencode/skills/agentdev-foo/assets/logo.png": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("src/opencode/skills/agentdev-foo/assets/logo.png"),
    ]);
    expect(r.kind).toBe("ok");
  });
});

describe("blob-loader / fail-closed on binary (parent defect #4)", () => {
  test("rejects NUL byte in .md shipped runtime entry", () => {
    const bytes = new Uint8Array([0x23, 0x00, 0x61]); // '#' NUL 'a'
    const adapter = makeAdapter({
      "src/opencode/skills/agentdev-foo/SKILL.md": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("src/opencode/skills/agentdev-foo/SKILL.md"),
    ]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6); // EncodingViolation
  });

  test("rejects invalid UTF-8 in .ps1 bootstrap entry", () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd]);
    const adapter = makeAdapter({
      "scripts/install-consumer-opencode.ps1": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("scripts/install-consumer-opencode.ps1"),
    ]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6); // EncodingViolation
  });

  test("rejects unknown binary extension in shipped projection", () => {
    // .bin is not on the allowlist; even if content is intentional, the
    // launcher must fail closed (unclassified new binary kind).
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const adapter = makeAdapter({
      "src/opencode/skills/agentdev-foo/assets/data.bin": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("src/opencode/skills/agentdev-foo/assets/data.bin"),
    ]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6); // EncodingViolation
  });

  test("rejects NUL byte in archive extra README-INSTALL.md", () => {
    const bytes = new Uint8Array([0x00, 0x41]);
    const adapter = makeAdapter({
      "README-INSTALL.md": bytes,
    });
    const r = loadAndClassify(adapter, FAKE_OID, [
      makeEntry("README-INSTALL.md"),
    ]);
    expect(r.kind).toBe("error");
    if (r.kind !== "error") return;
    expect(r.code).toBe(6); // EncodingViolation
  });
});
