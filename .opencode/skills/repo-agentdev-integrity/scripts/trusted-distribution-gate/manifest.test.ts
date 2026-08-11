// Tests for the manifest builder.
//
// The manifest builder produces the five canonical manifest sets defined in
// the accepted package contract: source-runtime, source-bootstrap, link,
// archive, archive-installed. Each manifest entry records path + SHA-256 +
// size. The builder consumes the candidate tree's git tree entries and
// classifies each entry into the projection(s) it belongs to.

import { describe, expect, test } from "bun:test";
import {
  buildSourceRuntimeManifest,
  buildSourceBootstrapManifest,
  buildLinkManifest,
  buildArchiveManifest,
  buildArchiveInstalledManifest,
  manifestEntryEquals,
  isRequiredRuntimePath,
  isRequiredBootstrapPath,
  diffManifests,
  type ManifestEntryInput,
} from "./manifest.ts";

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
  test("rejects tests", () => {
    expect(isRequiredRuntimePath("src/opencode/skills/agentdev-foo/scripts/x.test.ts")).toBe(true);
    // NOTE: tests, fixtures, README, package.json, tsconfig, lockfiles, and
    // metadata MUST be included per MUST DO item 4. isRequiredRuntimePath
    // returns true for everything under the three source roots.
  });
});

describe("manifest / isRequiredBootstrapPath", () => {
  test("accepts the two consumer-facing bootstrap scripts", () => {
    expect(isRequiredBootstrapPath("scripts/install-consumer-opencode.ps1")).toBe(true);
    expect(isRequiredBootstrapPath("scripts/check-consumer-opencode.ps1")).toBe(true);
  });
  test("rejects unrelated scripts", () => {
    expect(isRequiredBootstrapPath("scripts/trusted-distribution-gate.ps1")).toBe(false);
    expect(isRequiredBootstrapPath("scripts/apply-mechanical-replacement.ps1")).toBe(false);
  });
});

describe("manifest / buildSourceRuntimeManifest", () => {
  test("includes only source-runtime entries", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
      entry("src/opencode/skills/japanese-tech-writing/SKILL.md", "c".repeat(64), 30),
      entry("README.md", "d".repeat(64), 40),
    ];
    const m = buildSourceRuntimeManifest(inputs);
    expect(m.projection).toBe("source-runtime");
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      "src/opencode/commands/agentdev/case-run.md",
      "src/opencode/skills/agentdev-foo/SKILL.md",
      "src/opencode/skills/japanese-tech-writing/SKILL.md",
    ]);
  });

  test("sorts entries by path", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "a".repeat(64), 1),
      entry("src/opencode/commands/agentdev/case-run.md", "b".repeat(64), 2),
    ];
    const m = buildSourceRuntimeManifest(inputs);
    expect(m.entries[0]?.path).toBe("src/opencode/commands/agentdev/case-run.md");
    expect(m.entries[1]?.path).toBe("src/opencode/skills/agentdev-foo/SKILL.md");
  });

  test("rejects duplicate paths in same projection", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "a".repeat(64), 1),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 2),
    ];
    expect(() => buildSourceRuntimeManifest(inputs)).toThrow();
  });

  test("rejects zero-target manifest (no entries)", () => {
    expect(() => buildSourceRuntimeManifest([])).toThrow();
  });

  test("rejects invalid sha256", () => {
    const inputs: ManifestEntryInput[] = [
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "short", 1),
    ];
    expect(() => buildSourceRuntimeManifest(inputs)).toThrow();
  });
});

describe("manifest / buildSourceBootstrapManifest", () => {
  test("includes the two bootstrap scripts", () => {
    const inputs: ManifestEntryInput[] = [
      entry("scripts/install-consumer-opencode.ps1", "a".repeat(64), 100),
      entry("scripts/check-consumer-opencode.ps1", "b".repeat(64), 100),
      entry("scripts/other.ps1", "c".repeat(64), 100),
    ];
    const m = buildSourceBootstrapManifest(inputs);
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      "scripts/check-consumer-opencode.ps1",
      "scripts/install-consumer-opencode.ps1",
    ]);
  });

  test("rejects when a required bootstrap script is missing", () => {
    const inputs: ManifestEntryInput[] = [
      entry("scripts/install-consumer-opencode.ps1", "a".repeat(64), 100),
    ];
    expect(() => buildSourceBootstrapManifest(inputs)).toThrow();
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
  test("archive = source-runtime + install-from-archive.ps1 + README-INSTALL.md", () => {
    const runtime = [
      entry("src/opencode/commands/agentdev/case-run.md", "a".repeat(64), 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", "b".repeat(64), 20),
    ];
    const extras: ManifestEntryInput[] = [
      entry("scripts/install-from-archive.ps1", "d".repeat(64), 40),
      entry("README-INSTALL.md", "e".repeat(64), 50),
    ];
    const m = buildArchiveManifest(runtime, extras);
    expect(m.entries.map((e) => e.path).sort()).toEqual([
      "README-INSTALL.md",
      "scripts/install-from-archive.ps1",
      "src/opencode/commands/agentdev/case-run.md",
      "src/opencode/skills/agentdev-foo/SKILL.md",
    ]);
  });

  test("rejects when install-from-archive.ps1 missing", () => {
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
