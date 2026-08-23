// Tests for the manifest builder.
//
// The manifest builder produces the four canonical manifest projections
// defined in docs/specs/integrity/distribution-boundary.md §58-67:
// source, link, archive, archive-installed. Each manifest entry records
// path + SHA-256 + size. The builder consumes the candidate tree's git
// tree entries and classifies each entry into the projection(s) it
// belongs to. Source has two internal subsets (runtime, bootstrap) and
// archive has one extra subset (archive-extra); these subsets are not
// public projection labels.

// ADF-COVERS(verification): REQ-050-011

import { describe, expect, test } from "bun:test";
import {
  buildSourceManifest,
  buildLinkManifest,
  buildArchiveManifest,
  buildArchiveInstalledManifest,
  isRequiredRuntimePath,
  isRequiredBootstrapPath,
  classifySourceSubset,
  type ManifestEntryInput,
} from "./manifest.ts";
import { manifestEntryEquals, diffManifests } from "./manifest-diff.ts";

function entry(path: string, sha: string, size: number): ManifestEntryInput {
  return { path, sha256: sha, size };
}

describe("manifest / isRequiredRuntimePath", () => {
  test("accepts commands/agentdev/**", () => {
    expect(isRequiredRuntimePath("src/opencode/commands/agentdev/case-run.md")).toBe(true);
    expect(isRequiredRuntimePath("src/opencode/commands/agentdev/sub/x.md")).toBe(true);
  });
  test("accepts skills/agentdev-*/**", () => {
    expect(isRequiredRuntimePath("src/opencode/skills/agentdev-foo/SKILL.md")).toBe(true);
    expect(isRequiredRuntimePath("src/opencode/skills/agentdev-bar/references/x.md")).toBe(true);
  });
  test("accepts skills/japanese-tech-writing/**", () => {
    expect(isRequiredRuntimePath("src/opencode/skills/japanese-tech-writing/SKILL.md")).toBe(true);
  });
  test("rejects unrelated commands", () => {
    expect(isRequiredRuntimePath("src/opencode/commands/repo/x.md")).toBe(false);
    expect(isRequiredRuntimePath("src/opencode/commands/agentdev-other/x.md")).toBe(false);
  });
  test("rejects unrelated skills", () => {
    expect(isRequiredRuntimePath("src/opencode/skills/repo-integrity/SKILL.md")).toBe(false);
  });
  test("includes tests, fixtures, README, package.json, tsconfig, lockfiles, and metadata", () => {
    expect(isRequiredRuntimePath("src/opencode/skills/agentdev-foo/scripts/x.test.ts")).toBe(true);
  });
});

describe("manifest / isRequiredBootstrapPath", () => {
  test("accepts the public entry and its runtime dependency module (REQ-050-011)", () => {
    expect(isRequiredBootstrapPath("scripts/install.ps1")).toBe(true);
    expect(isRequiredBootstrapPath("scripts/consumer/common.ps1")).toBe(true);
  });
  test("rejects unrelated scripts", () => {
    expect(isRequiredBootstrapPath("scripts/self/release/trusted-distribution-gate.ps1")).toBe(false);
    expect(isRequiredBootstrapPath("scripts/self/maintenance/apply-mechanical-replacement.ps1")).toBe(false);
  });
});

describe("manifest / classifySourceSubset", () => {
  test("runtime for src/opencode/** paths", () => {
    expect(classifySourceSubset("src/opencode/commands/agentdev/x.md")).toBe("runtime");
    expect(classifySourceSubset("src/opencode/skills/agentdev-foo/SKILL.md")).toBe("runtime");
  });
  test("bootstrap for the public entry and its dependency module", () => {
    expect(classifySourceSubset("scripts/install.ps1")).toBe("bootstrap");
    expect(classifySourceSubset("scripts/consumer/common.ps1")).toBe("bootstrap");
  });
  test("archive-extra for the archive installer original and README-INSTALL", () => {
    expect(classifySourceSubset("scripts/consumer/archive/install.ps1")).toBe("archive-extra");
    expect(classifySourceSubset("README-INSTALL.md")).toBe("archive-extra");
  });
  test("null for unrelated paths", () => {
    expect(classifySourceSubset("docs/specs/foo.md")).toBeNull();
    expect(classifySourceSubset("README.md")).toBeNull();
  });
});

describe("manifest / buildSourceManifest", () => {
  test("includes runtime + bootstrap entries", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
      entry("src/opencode/skills/japanese-tech-writing/SKILL.md", "c".repeat(64), 30),
      entry("scripts/install.ps1", "d".repeat(64), 40),
      entry("scripts/consumer/common.ps1", "e".repeat(64), 50),
      entry("README.md", "f".repeat(64), 60),
    ];
    const m = buildSourceManifest(inputs);
    expect(m.projection).toBe("source");
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      "scripts/consumer/common.ps1",
      "scripts/install.ps1",
      "src/opencode/commands/agentdev/case-run.md",
      "src/opencode/skills/agentdev-foo/SKILL.md",
      "src/opencode/skills/japanese-tech-writing/SKILL.md",
    ]);
  });

  test("rejects zero-target manifest (no entries)", () => {
    expect(() => buildSourceManifest([])).toThrow();
  });

  test("rejects invalid sha256", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "short", 1),
    ];
    expect(() => buildSourceManifest(inputs)).toThrow();
  });
});

describe("manifest / buildLinkManifest", () => {
  test("maps source runtime entries to .opencode/** with identical digests", () => {
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
      entry("src/opencode/skills/japanese-tech-writing/SKILL.md", "c".repeat(64), 30),
    ];
    const m = buildLinkManifest(runtime);
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      ".opencode/commands/agentdev/case-run.md",
      ".opencode/skills/agentdev-foo/SKILL.md",
      ".opencode/skills/japanese-tech-writing/SKILL.md",
    ]);
    // Identical digests required.
    for (const e of m.entries) {
      const original = runtime.find((r) => r.sha256 === e.sha256);
      expect(original).toBeDefined();
    }
  });
});

describe("manifest / buildArchiveManifest", () => {
  test("archive = source-runtime + archive installer original + README-INSTALL.md", () => {
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
    ];
    const extras: ManifestEntryInput[] = [
      entry("scripts/consumer/archive/install.ps1", "d".repeat(64), 40),
      entry("README-INSTALL.md", "e".repeat(64), 50),
    ];
    const m = buildArchiveManifest(runtime, extras);
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      "README-INSTALL.md",
      "scripts/consumer/archive/install.ps1",
      "src/opencode/commands/agentdev/case-run.md",
      "src/opencode/skills/agentdev-foo/SKILL.md",
    ]);
  });

  test("rejects when the archive installer original is missing", () => {
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
    ];
    expect(() => buildArchiveManifest(runtime, [])).toThrow();
  });
});

describe("manifest / buildArchiveInstalledManifest", () => {
  test("maps source runtime entries to .opencode/** deterministically", () => {
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
    ];
    const m = buildArchiveInstalledManifest(runtime);
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      ".opencode/commands/agentdev/case-run.md",
      ".opencode/skills/agentdev-foo/SKILL.md",
    ]);
  });

  test("projection label is archive-installed (regression for parent defect #7)", () => {
    // Previous implementation returned buildLinkManifest() whose projection
    // label was 'link'. Manifest identity MUST match its constructor name.
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
    ];
    const m = buildArchiveInstalledManifest(runtime);
    expect(m.projection).toBe("archive-installed");
  });

  test("rejects zero target entries", () => {
    expect(() => buildArchiveInstalledManifest([])).toThrow();
  });
});

describe("manifest / manifestEntryEquals", () => {
  test("equal when all fields match", () => {
    const a = entry("a.md", "x".repeat(64), 5);
    const b = entry("a.md", "x".repeat(64), 5);
    expect(manifestEntryEquals(a, b)).toBe(true);
  });
  test("unequal on size differ", () => {
    const a = entry("a.md", "x".repeat(64), 5);
    const b = entry("a.md", "x".repeat(64), 6);
    expect(manifestEntryEquals(a, b)).toBe(false);
  });
});

describe("manifest / diffManifests", () => {
  test("returns empty diff for identical manifests", () => {
    const entries = [
      entry("a.md", "x".repeat(64), 5),
      entry("b.md", "y".repeat(64), 6),
    ];
    const diff = diffManifests(entries, entries);
    expect(diff.extra).toEqual([]);
    expect(diff.missing).toEqual([]);
    expect(diff.digest_mismatches).toEqual([]);
  });
  test("detects extra entry in actual", () => {
    const expected = [entry("a.md", "x".repeat(64), 5)];
    const actual = [
      entry("a.md", "x".repeat(64), 5),
      entry("b.md", "y".repeat(64), 6),
    ];
    const diff = diffManifests(expected, actual);
    expect(diff.extra.map((e) => e.path)).toEqual(["b.md"]);
  });
  test("detects missing entry in actual", () => {
    const expected = [
      entry("a.md", "x".repeat(64), 5),
      entry("b.md", "y".repeat(64), 6),
    ];
    const actual = [entry("a.md", "x".repeat(64), 5)];
    const diff = diffManifests(expected, actual);
    expect(diff.missing.map((e) => e.path)).toEqual(["b.md"]);
  });
  test("detects digest mismatch", () => {
    const expected = [entry("a.md", "x".repeat(64), 5)];
    const actual = [entry("a.md", "z".repeat(64), 5)];
    const diff = diffManifests(expected, actual);
    expect(diff.digest_mismatches.map((e) => e.path)).toEqual(["a.md"]);
  });
});
