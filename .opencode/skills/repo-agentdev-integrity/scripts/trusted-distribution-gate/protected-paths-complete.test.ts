// Regression: protected-path enumeration MUST cover every non-test runtime
// module under the trust-root directory and MUST NOT cover Stage B canonical
// scripts (install-from-archive.ps1, package-release-archive.ps1).
//
// This test fails closed when a new runtime module is added without being
// reflected in the auto-enumeration. It also enforces the Stage A/B boundary:
// Stage A protects its own runtime closure plus the trusted launcher /
// consumer install-check scripts; Stage B owns the archive packaging scripts
// and may modify them without re-triggering Stage A protected-path violation.
//
// Parent defect blockers #2, #3.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  DEFAULT_PROTECTED_PATH_SET,
  TRUST_ROOT_DIR_REL,
  listAllProtectedPaths,
} from "./protected-paths.ts";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..", "..");
const TRUST_ROOT_ABS = path.join(REPO_ROOT, TRUST_ROOT_DIR_REL);

function listRuntimeModulesOnDisk(): Set<string> {
  const out = new Set<string>();
  for (const ent of fs.readdirSync(TRUST_ROOT_ABS, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".ts")) continue;
    if (ent.name.endsWith(".test.ts")) continue;
    if (ent.name.endsWith(".test-worker.ts")) continue;
    if (ent.name.endsWith(".d.ts")) continue;
    out.add(ent.name);
  }
  return out;
}

describe("protected-paths / runtime-module coverage (parent defect #2)", () => {
  test("every non-test .ts module on disk is protected", () => {
    const onDisk = listRuntimeModulesOnDisk();
    const protectedSet = new Set(
      listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET)
        .filter((p) => p.startsWith(".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/"))
        .map((p) => path.basename(p)),
    );
    const missing: string[] = [];
    for (const f of onDisk) {
      if (!protectedSet.has(f)) missing.push(f);
    }
    expect(missing).toEqual([]);
  });

  test("archive-zip and bootstrap-report are protected", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).toContain(
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/archive-zip.ts",
    );
    expect(all).toContain(
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/bootstrap-report.ts",
    );
  });

  test("no test file is protected", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    const tests = all.filter((p) => p.endsWith(".test.ts"));
    expect(tests).toEqual([]);
  });
});

describe("protected-paths / Stage A/B boundary (parent defect #3)", () => {
  test("does NOT protect scripts/install-from-archive.ps1 (Stage B owns)", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).not.toContain("scripts/install-from-archive.ps1");
  });

  test("does NOT protect scripts/package-release-archive.ps1 (Stage B owns)", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).not.toContain("scripts/package-release-archive.ps1");
  });

  test("protects trusted launcher entry", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).toContain("scripts/trusted-distribution-gate.ps1");
  });

  test("protects trusted consumer install/check scripts", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).toContain("scripts/install-consumer-opencode.ps1");
    expect(all).toContain("scripts/check-consumer-opencode.ps1");
  });
});
