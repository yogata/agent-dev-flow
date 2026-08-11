// Tests for the protected-paths module.
//
// Trust-root files (launcher/checker/packager + their transitive imports +
// the trusted installation mapping) must not be modified, deleted, or added
// to between base_oid and candidate_oid. Any such change is a trust
// violation and the launcher must fail closed.

import { describe, expect, test } from "bun:test";
import {
  TRUST_ROOT_DIRECT_PATHS,
  listAllProtectedPaths,
  isProtectedPath,
  type ProtectedPathSet,
} from "./protected-paths.ts";

describe("protected-paths / TRUST_ROOT_DIRECT_PATHS", () => {
  test("includes the trusted launcher entry script", () => {
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(
      "scripts/trusted-distribution-gate.ps1",
    );
  });

  test("includes the trust-root module directory", () => {
    const dir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/";
    const matched = TRUST_ROOT_DIRECT_PATHS.filter((p) => p.startsWith(dir));
    expect(matched.length).toBeGreaterThan(0);
  });

  test("includes the trusted installation scripts", () => {
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/install-consumer-opencode.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/check-consumer-opencode.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/install-from-archive.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/package-release-archive.ps1");
  });
});

describe("protected-paths / listAllProtectedPaths", () => {
  test("returns the direct paths", () => {
    const set: ProtectedPathSet = {
      direct_paths: TRUST_ROOT_DIRECT_PATHS,
      import_paths: [],
    };
    const all = listAllProtectedPaths(set);
    expect(all).toContain("scripts/trusted-distribution-gate.ps1");
  });

  test("includes transitive import paths when provided", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["a.ts"],
      import_paths: ["b.ts", "c.ts"],
    };
    const all = listAllProtectedPaths(set);
    expect([...all].sort()).toEqual(["a.ts", "b.ts", "c.ts"]);
  });

  test("deduplicates overlapping direct/import paths", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["a.ts", "b.ts"],
      import_paths: ["b.ts", "c.ts"],
    };
    const all = listAllProtectedPaths(set);
    expect([...all].sort()).toEqual(["a.ts", "b.ts", "c.ts"]);
  });
});

describe("protected-paths / isProtectedPath", () => {
  test("returns true for a direct trust-root file", () => {
    const set: ProtectedPathSet = {
      direct_paths: TRUST_ROOT_DIRECT_PATHS,
      import_paths: [],
    };
    expect(isProtectedPath("scripts/trusted-distribution-gate.ps1", set)).toBe(true);
  });

  test("returns false for an unrelated source file", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["scripts/trusted-distribution-gate.ps1"],
      import_paths: [],
    };
    expect(isProtectedPath("src/opencode/commands/agentdev/case-run.md", set)).toBe(false);
  });

  test("returns true for a transitive import path", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["launcher.ts"],
      import_paths: ["types.ts"],
    };
    expect(isProtectedPath("types.ts", set)).toBe(true);
  });

  test("matches with forward slashes regardless of input slash style", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["scripts/foo.ps1"],
      import_paths: [],
    };
    expect(isProtectedPath("scripts\\foo.ps1", set)).toBe(true);
  });

  test("rejects path traversal attempts", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["scripts/foo.ps1"],
      import_paths: [],
    };
    expect(isProtectedPath("../scripts/foo.ps1", set)).toBe(false);
    expect(isProtectedPath("scripts/../scripts/foo.ps1", set)).toBe(false);
  });
});
