// Launcher tests: core happy path + input contract + protected-path
// rejection (parent defect blockers 9, 10, 12).

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  TMP_ROOT,
  ensureTmpRoot,
  cleanupTmpRoot,
  makeFixtureRepo,
  headOid,
  commitTweak,
  deleteAndCommit,
} from "./launcher-fixture.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";

beforeAll(ensureTmpRoot);
afterAll(cleanupTmpRoot);

function baseOpts(repo: string, base: string, candidate: string, outName: string): LauncherOptions {
  const outputDir = path.join(TMP_ROOT, outName);
  fs.mkdirSync(outputDir, { recursive: true });
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: outputDir,
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  };
}

describe("launcher / runLauncher happy path", () => {
  test("returns Ok exit code on a clean candidate", () => {
    const repo = makeFixtureRepo();
    const head = headOid(repo);
    const result = runLauncher(baseOpts(repo, head, head, "out-ok"));
    expect(result.exit_code).toBe(0);
    expect(result.archive_path).toBeTruthy();
    expect(fs.existsSync(result.archive_path ?? "")).toBe(true);
    expect(result.manifests["source-runtime"].entries.length).toBeGreaterThan(0);
    expect(result.manifests["archive"].entries.length).toBeGreaterThan(0);
  }, 60000);
});

describe("launcher / runLauncher input contract", () => {
  test("rejects non-hex OID with exit 8 (InputContract)", () => {
    const repo = makeFixtureRepo();
    const head = headOid(repo);
    const opts: LauncherOptions = {
      ...baseOpts(repo, head, "not-a-real-oid", "out-contract"),
    };
    expect(runLauncher(opts).exit_code).toBe(8);
  });

  test("rejects empty repository identity with exit 8", () => {
    const repo = makeFixtureRepo();
    const head = headOid(repo);
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: head,
      candidate_oid: head,
      output_dir: path.join(TMP_ROOT, "out-empty-id"),
      repository_identity: { owner_slash_name: "", default_branch: "main" },
    };
    fs.mkdirSync(opts.output_dir, { recursive: true });
    expect(runLauncher(opts).exit_code).toBe(8);
  });
});

describe("launcher / runLauncher protected-path rejection", () => {
  test("rejects modification of trust-root launcher file (exit 1)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher.ts",
      "// TAMPERED\n",
    );
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot")).exit_code).toBe(1);
  }, 60000);

  test("rejects modification of trusted entry script (exit 1)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(repo, "scripts/trusted-distribution-gate.ps1", "# TAMPERED\n");
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-entry")).exit_code).toBe(1);
  }, 60000);

  test("rejects modification of helper protected-check.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-check.ts",
      "// TAMPERED\n",
    );
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-helper")).exit_code).toBe(1);
  }, 60000);

  test("rejects modification of helper blob-loader.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/blob-loader.ts",
      "// TAMPERED\n",
    );
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-blob")).exit_code).toBe(1);
  }, 60000);

  test("rejects modification of helper boundary-runner.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/boundary-runner.ts",
      "// TAMPERED\n",
    );
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-runner")).exit_code).toBe(1);
  }, 60000);

  test("rejects deletion of trusted installation mapping script (exit 1)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = deleteAndCommit(repo, "scripts/install-consumer-opencode.ps1");
    expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-del")).exit_code).toBe(1);
  }, 60000);
});
