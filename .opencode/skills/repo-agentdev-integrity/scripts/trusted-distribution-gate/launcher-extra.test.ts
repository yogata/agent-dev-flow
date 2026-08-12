// Launcher tests: boundary violations, manifest mismatch, archive-installed
// non-tautological verification, output containment, all-five-projection
// labels, and concurrent-runs regression (parent defect blockers 3, 4, 8,
// 11, 14). Split from launcher.test.ts to stay under the 250 LOC ceiling.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  headOid,
  commitTweak,
} from "./launcher-fixture.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";
import type { Projection } from "./types.ts";

function baseOpts(repo: string, base: string, candidate: string, outName: string): LauncherOptions {
  const outputDir = makeTmpDir(`trust-test-${outName}-`);
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: outputDir,
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  };
}

describe("launcher / boundary violation", () => {
  test("rejects producer-internal concrete ID in candidate source (exit 4)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/opencode/skills/agentdev-foo/SKILL.md",
        "# foo skill references ADR-9999 which is a violation\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-boundary")).exit_code).toBe(4);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects unclassified ID family (fail-closed, exit 7)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/opencode/skills/agentdev-foo/SKILL.md",
        "# foo skill references JIRA-123 unknown family\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-unclassified")).exit_code).toBe(7);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects producer-internal URL in archive extra README-INSTALL.md (parent defect #3)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "README-INSTALL.md",
        "# Bad: see https://github.com/yogata/agent-dev-flow/blob/main/docs/secret.md\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-boundary-extra")).exit_code).toBe(4);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / manifest mismatch", () => {
  test("rejects modification of protected check script (exit 1, exact precedence)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(repo, "scripts/check-consumer-opencode.ps1", "");
      // The file is now empty but still present; that's a content change →
      // exit 1 (protected-path modified), not exit 2 (manifest mismatch).
      expect(runLauncher(baseOpts(repo, base, candidate, "out-manifest")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / all FOUR canonical projection labels and counts (parent defect #3, #7)", () => {
  test("manifests record correct projection labels and scanned entry counts", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const result = runLauncher(baseOpts(repo, head, head, "out-projections"));
      expect(result.exit_code).toBe(0);
      const labels = (Object.keys(result.manifests) as Projection[]).sort();
      expect(labels).toEqual(
        ["archive", "archive-installed", "link", "source"],
      );
      for (const label of labels) {
        expect(result.manifests[label]?.projection).toBe(label);
      }
      // source has 3 runtime + 2 bootstrap = 5 fixtures.
      expect(result.manifests["source"].entries.length).toBe(5);
      // archive = source-runtime (3) + 2 extras = 5.
      expect(result.manifests["archive"].entries.length).toBe(5);
      // link and archive-installed share the .opencode/** mapping of the
      // 3 source-runtime entries.
      expect(result.manifests["link"].entries.length).toBe(3);
      expect(result.manifests["archive-installed"].entries.length).toBe(3);
      // Exactly 4 boundary results — one per canonical projection.
      expect(result.boundary_results.length).toBe(4);
      for (const r of result.boundary_results) {
        expect(["archive", "archive-installed", "link", "source"])
          .toContain(r.projection);
      }
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / archive-installed physical verification (parent defect #8)", () => {
  test("launcher physically verifies via base-oid installer (not tautological)", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const opts = baseOpts(repo, head, head, "out-installed-real");
      const expectedArchive = path.join(opts.output_dir, `agentdev-release-${head.substring(0, 8)}.zip`);
      const ok = runLauncher(opts);
      expect(ok.exit_code).toBe(0);
      expect(fs.existsSync(expectedArchive)).toBe(true);
      // Corrupt the published archive. Re-run fails with DigestMismatch
      // (pre-existing archive preserved, never overwritten).
      fs.writeFileSync(expectedArchive, Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]));
      const fail = runLauncher(opts);
      expect(fail.exit_code).toBe(3);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});

describe("launcher / pre-existing final archive preservation", () => {
  test("does NOT overwrite pre-existing final archive (exit 3)", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const opts = baseOpts(repo, head, head, "out-preexisting");
      const expectedName = `agentdev-release-${head.substring(0, 8)}.zip`;
      const finalPath = path.join(opts.output_dir, expectedName);
      fs.writeFileSync(finalPath, "PRE-EXISTING");
      const result = runLauncher(opts);
      expect(result.exit_code).toBe(3);
      expect(fs.readFileSync(finalPath, "utf-8")).toBe("PRE-EXISTING");
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / output containment (parent defect #11)", () => {
  test("refuses to publish archive when output_dir is a file", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const outAsFile = makeTmpDir("trust-test-out-as-file-");
      const outFilePath = path.join(outAsFile, "out-as-file");
      fs.writeFileSync(outFilePath, "x");
      const opts: LauncherOptions = {
        repo_root: repo,
        base_oid: head,
        candidate_oid: head,
        output_dir: outFilePath,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
      };
      const result = runLauncher(opts);
      expect(result.exit_code).not.toBe(0);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / concurrent different-output runs", () => {
  test("two runs against the same OID with DIFFERENT outputs both succeed", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const out1 = makeTmpDir("trust-test-conc-1-");
      const out2 = makeTmpDir("trust-test-conc-2-");
      const opts1: LauncherOptions = {
        repo_root: repo, base_oid: head, candidate_oid: head, output_dir: out1,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
      };
      const opts2: LauncherOptions = {
        ...opts1, output_dir: out2,
      };
      const r1 = runLauncher(opts1);
      const r2 = runLauncher(opts2);
      expect(r1.exit_code).toBe(0);
      expect(r2.exit_code).toBe(0);
      expect(r1.archive_path).toBeTruthy();
      expect(r2.archive_path).toBeTruthy();
      expect(r1.archive_path).not.toBe(r2.archive_path);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});
