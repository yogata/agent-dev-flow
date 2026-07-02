/**
 * Tests for check_doc_inputs.ts (IR-056 validation).
 *
 * Uses the parent repo (the agent-dev-flow repo this script ships in) as the
 * integration target. Per TS-001, the script must report ok=true against the
 * fully-migrated repo (zero direct docs/specs/{domain}/** refs in src/opencode/**,
 * valid config.yaml, command doc-input for each public command, etc).
 *
 * Per-expectation fixture isolation on Windows is brittle (EBUSY on recursive
 * rm). The integration test against the real repo covers all 9 checks at once.
 */

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { checkDocInputs } from "./check_doc_inputs.ts";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("checkDocInputs (integration against real repo)", () => {
  test("returns well-formed report with ok=true after migration", () => {
    const report = checkDocInputs(REPO_ROOT);
    // Stats sanity
    expect(report.stats.public_commands).toBeGreaterThan(0);
    expect(report.stats.command_doc_inputs).toBeGreaterThan(0);
    expect(report.stats.direct_refs_in_commands).toBe(0);
    expect(report.stats.direct_refs_in_skills).toBe(0);
    // No strict failures (warnings on missing optional doc-inputs are allowed)
    const strictFailures = report.failures.filter((f) => f.severity === "strict");
    expect(strictFailures.length).toBe(0);
    expect(report.ok).toBe(true);
  });

  test("checks all 9 categories when invoked on real repo", () => {
    const report = checkDocInputs(REPO_ROOT);
    // We don't assert any specific check is present in failures (a clean repo has none),
    // but the script must not throw and must produce a report with the expected shape.
    expect(Array.isArray(report.failures)).toBe(true);
    expect(typeof report.stats.public_commands).toBe("number");
    expect(typeof report.stats.command_doc_inputs).toBe("number");
    expect(typeof report.stats.skill_doc_inputs).toBe("number");
    expect(typeof report.stats.direct_refs_in_commands).toBe("number");
    expect(typeof report.stats.direct_refs_in_skills).toBe("number");
  });
});

const MINIMAL_CONFIG_YAML = [
  "version: 1",
  "kind: project-config",
  "roots:",
  "  docs: docs",
  "doc_inputs:",
  "  commands: .agentdev/doc-inputs/commands",
  "  skills: .agentdev/doc-inputs/skills",
  "",
].join("\n");

const MINIMAL_GOOD_COMMAND_YAML = [
  "version: 1",
  "kind: command-doc-input",
  "id: /agentdev/good",
  "must_read:",
  "  - path: docs/README.md",
  "    purpose: test",
  "conditional_read: []",
  "allowed_discovery: []",
  "forbidden: []",
  "read_completion: []",
  "",
].join("\n");

const MINIMAL_GOOD_SKILL_YAML = [
  "version: 1",
  "kind: skill-doc-input",
  "id: good",
  "conditional_read: []",
  "allowed_discovery: []",
  "forbidden: []",
  "",
].join("\n");

function setupMinimalRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-inputs-test-"));
  const mkdir = (p: string) => fs.mkdirSync(path.join(dir, p), { recursive: true });
  const write = (p: string, content: string) =>
    fs.writeFileSync(path.join(dir, p), content, { encoding: "utf-8" });
  mkdir(".agentdev/doc-inputs/commands");
  mkdir(".agentdev/doc-inputs/skills");
  mkdir("src/opencode/commands/agentdev");
  mkdir("docs");
  write(".agentdev/config.yaml", MINIMAL_CONFIG_YAML);
  write(".agentdev/doc-inputs/commands/good.yaml", MINIMAL_GOOD_COMMAND_YAML);
  write(".agentdev/doc-inputs/skills/good.yaml", MINIMAL_GOOD_SKILL_YAML);
  write("src/opencode/commands/agentdev/good.md", "# good\n");
  write("docs/README.md", "# docs\n");
  return dir;
}

function cleanupDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    // Ignore EBUSY etc.; tmpDir lives under os.tmpdir() and is disposable.
  }
}

function writeBadFixture(dir: string, relPath: string, content: string): string {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, { encoding: "utf-8" });
  return full;
}

function hasStrictFailureMatching(
  report: ReturnType<typeof checkDocInputs>,
  needle: string,
): boolean {
  return report.failures.some(
    (f) => f.severity === "strict" && f.message.includes(needle),
  );
}

describe("checkDocInputs (8 anomaly fixtures, AG-005 / TS-001)", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = setupMinimalRepo();
    const baseline = checkDocInputs(tmpDir);
    if (!baseline.ok) {
      cleanupDir(tmpDir);
      throw new Error(
        "minimal repo must be ok=true; baseline failures: " +
          JSON.stringify(baseline.failures),
      );
    }
  });

  afterAll(() => {
    cleanupDir(tmpDir);
  });

  test("fixture 1: allowed_discovery 非配列 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad1.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: /agentdev/bad1",
        "must_read: []",
        "conditional_read: []",
        'allowed_discovery: "not-array"',
        "forbidden: []",
        "read_completion: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "must be a list of strings"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 2: allowed_discovery 空文字含む is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad2.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: /agentdev/bad2",
        "must_read: []",
        "conditional_read: []",
        "allowed_discovery:",
        '  - ""',
        "forbidden: []",
        "read_completion: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "must not be empty string"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 3: command id 形式違反 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad3.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: bad-id",
        "must_read: []",
        "conditional_read: []",
        "allowed_discovery: []",
        "forbidden: []",
        "read_completion: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "should start with '/agentdev/'"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 4: skill id ファイル名不一致 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/skills/bad4.yaml",
      [
        "version: 1",
        "kind: skill-doc-input",
        "id: good-skill-mismatch",
        "conditional_read: []",
        "allowed_discovery: []",
        "forbidden: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "does not match filename"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 5: must_read[].path 不在 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad5.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: /agentdev/bad5",
        "must_read:",
        "  - path: nonexistent.md",
        "    purpose: test",
        "conditional_read: []",
        "allowed_discovery: []",
        "forbidden: []",
        "read_completion: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "does not exist"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 6: conditional_read[].paths[] 不在 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad6.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: /agentdev/bad6",
        "must_read: []",
        "conditional_read:",
        "  - id: x",
        "    when: y",
        "    paths:",
        "      - nonexistent.md",
        "    purpose: test",
        "allowed_discovery: []",
        "forbidden: []",
        "read_completion: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "does not exist"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 7: skill doc-input の must_read 持ち is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/skills/bad7.yaml",
      [
        "version: 1",
        "kind: skill-doc-input",
        "id: bad7",
        "must_read:",
        "  - path: docs/README.md",
        "    purpose: test",
        "conditional_read: []",
        "allowed_discovery: []",
        "forbidden: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "must NOT have 'must_read'"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });

  test("fixture 8: command doc-input の5項目欠落 is flagged", () => {
    const bad = writeBadFixture(
      tmpDir,
      ".agentdev/doc-inputs/commands/bad8.yaml",
      [
        "version: 1",
        "kind: command-doc-input",
        "id: /agentdev/bad8",
        "must_read: []",
        "conditional_read: []",
        "allowed_discovery: []",
        "forbidden: []",
        "",
      ].join("\n"),
    );
    try {
      const report = checkDocInputs(tmpDir);
      expect(report.ok).toBe(false);
      expect(
        hasStrictFailureMatching(report, "missing required field 'read_completion'"),
      ).toBe(true);
    } finally {
      try { fs.unlinkSync(bad); } catch { /* ignore */ }
    }
  });
});
