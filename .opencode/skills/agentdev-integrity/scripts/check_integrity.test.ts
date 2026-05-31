import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `integrity-test-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runScript(cwd: string, args: string[]): RunResult {
  const scriptPath = join(
    cwd, ".opencode", "skills", "agentdev-integrity", "scripts", "check_integrity.ts"
  );
  const proc = Bun.spawnSync(["bun", "run", scriptPath, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout?.toString("utf-8") ?? "",
    stderr: proc.stderr?.toString("utf-8") ?? "",
  };
}

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(p.split(/[\\/]/g).slice(0, -1).join("/")!);
  writeFileSync(p, content, "utf-8");
}

function copyScripts(fixtureRoot: string): void {
  const dest = join(fixtureRoot, ".opencode", "skills", "agentdev-integrity", "scripts");
  mkdirp(dest);
  copyFileSync(SCRIPT_FILE, join(dest, "check_integrity.ts"));
  copyFileSync(CLI_UTILS_FILE, join(dest, "cli_utils.ts"));
}

function buildValidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(join(reqDir, "REQ-0001.md"), [
    "---",
    "id: REQ-0001",
    "title: Valid requirement",
    "created: 2025-01-01",
    "updated: 2025-01-02",
    "tags:",
    "  - test",
    "---",
    "",
    "## Body",
    "",
    "See ADR-0001 for context.",
    "",
  ].join("\n"), "utf-8");

  writeFileSync(join(reqDir, "README.md"), [
    "# Requirements",
    "",
    "| ID | Title |",
    "|----|-------|",
    "| REQ-0001 | Valid requirement |",
    "",
  ].join("\n"), "utf-8");

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  writeFileSync(join(adrDir, "ADR-0001.md"), [
    "---",
    "id: ADR-0001",
    "title: Valid ADR",
    "---",
    "",
    "Relates to REQ-0001.",
    "",
  ].join("\n"), "utf-8");

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(join(specsDir, "system.md"), "# System\n\ntest-cmd\n", "utf-8");
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");

  const allSkills = [
    "agentdev-test-skill",
    "agentdev-workflow-reporting",
    "agentdev-conventional-commits",
    "agentdev-req-file-manager",
    "agentdev-adr-file-manager",
    "agentdev-no-ai-slop-writing",
    "agentdev-gh-cli",
  ];
  for (const name of allSkills) {
    const dir = join(root, ".opencode", "skills", name);
    mkdirp(dir);
    writeFileSync(join(dir, "SKILL.md"), `# ${name}\n`, "utf-8");
  }

  const reportingRefDir = join(root, ".opencode", "skills", "agentdev-workflow-reporting", "references");
  mkdirp(reportingRefDir);
  writeFileSync(join(reportingRefDir, "completion-reports.md"), [
    "# 完了報告フォーマット",
    "",
    "## test-cmd 完了時",
    "",
    "```",
    "✅ test-cmd 完了",
    "```",
    "",
  ].join("\n"), "utf-8");

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(join(cmdDir, "test-cmd.md"), [
    "---",
    "description: Test command",
    "agent: test-agent",
    "implementation_pattern: file-pipeline",
    "load_skills:",
    "  - agentdev-workflow-reporting",
    "  - agentdev-conventional-commits",
    "  - agentdev-req-file-manager",
    "  - agentdev-adr-file-manager",
    "  - agentdev-no-ai-slop-writing",
    "  - agentdev-gh-cli",
    "---",
    "",
    "Test command body.",
    "",
  ].join("\n"), "utf-8");

  writeFileSync(join(cmdDir, "README.md"), [
    "# Commands",
    "",
    "| Command | Description | Agent | Skills |",
    "|---------|-------------|-------|--------|",
    "| `agentdev/test-cmd` | Test command | test-agent | agentdev-workflow-reporting |",
    "",
  ].join("\n"), "utf-8");
}

function buildInvalidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(join(reqDir, "REQ-0002.md"), [
    "---",
    "id: REQ-9999",
    "title: Mismatched id",
    "created: 2025-01-01",
    "updated: 2025-01-02",
    "tags:",
    "  - test",
    "---",
    "",
    "Body.",
    "",
  ].join("\n"), "utf-8");

  writeFileSync(join(reqDir, "REQ-0003.md"), [
    "---",
    "id: REQ-0003",
    "title: Missing fields",
    "created: 2025-01-01",
    "---",
    "",
    "Body.",
    "",
  ].join("\n"), "utf-8");

  // README.md: lists REQ-0002 (OK) and phantom REQ-0099 (no file)
  writeFileSync(join(reqDir, "README.md"), [
    "# Requirements",
    "",
    "| ID | Title |",
    "|----|-------|",
    "| REQ-0002 | Mismatched id |",
    "| REQ-0099 | Phantom entry |",
    "",
  ].join("\n"), "utf-8");

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  writeFileSync(join(adrDir, "ADR-0001.md"), [
    "---",
    "id: ADR-0001",
    "title: Cross-ref to missing REQ",
    "---",
    "",
    "Relates to REQ-0099.",
    "",
  ].join("\n"), "utf-8");

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);

  const skill1 = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skill1);
  writeFileSync(join(skill1, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  const skill2 = join(root, ".opencode", "skills", "bad-skill");
  mkdirp(skill2);
  writeFileSync(join(skill2, "SKILL.md"), "# bad-skill\n", "utf-8");

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(join(cmdDir, "test-cmd.md"), [
    "---",
    "description: Test command",
    "agent: test-agent",
    "load_skills:",
    "  - agentdev-nonexistent",
    "---",
    "",
    "Body.",
    "",
  ].join("\n"), "utf-8");

  writeFileSync(join(cmdDir, "bad-cmd.md"), [
    "---",
    "description: Bad command",
    "---",
    "",
    "Missing agent and load_skills.",
    "",
  ].join("\n"), "utf-8");

  writeFileSync(join(cmdDir, "README.md"), [
    "# Commands",
    "",
    "| Command | Description | Agent | Skills |",
    "|---------|-------------|-------|--------|",
    "| `agentdev/test-cmd` | Test command | test-agent | agentdev-nonexistent |",
    "",
  ].join("\n"), "utf-8");
}

const VALID_ROOT = join(TEMP_ROOT, "valid");
const INVALID_ROOT = join(TEMP_ROOT, "invalid");

beforeAll(() => {
  mkdirp(VALID_ROOT);
  mkdirp(INVALID_ROOT);

  buildValidFixture(VALID_ROOT);
  buildInvalidFixture(INVALID_ROOT);

  copyScripts(VALID_ROOT);
  copyScripts(INVALID_ROOT);
});

afterAll(() => {
  if (existsSync(TEMP_ROOT)) {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  }
});

describe("check_integrity.ts --help", () => {
  it("exits with code 0 and shows help text", () => {
    const r = runScript(VALID_ROOT, ["--help"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("check_integrity.ts");
    expect(r.stdout).toContain("USAGE");
    expect(r.stdout).toContain("--json");
    expect(r.stdout).toContain("--dry-run");
  });
});

describe("check_integrity.ts --dry-run", () => {
  it("exits with code 0 and shows what would be checked", () => {
    const r = runScript(VALID_ROOT, ["--dry-run"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("Dry run");
    expect(r.stdout).toContain("REQ files");
    expect(r.stdout).toContain("ADR files");
    expect(r.stdout).toContain("Skills");
    expect(r.stdout).toContain("Commands");
  });
});

describe("check_integrity.ts --json output schema", () => {
  it("produces valid JSON with expected top-level keys", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed).toHaveProperty("timestamp");
    expect(parsed).toHaveProperty("script");
    expect(parsed).toHaveProperty("scanned");
    expect(parsed).toHaveProperty("summary");
    expect(parsed).toHaveProperty("results");
    expect(parsed.script).toBe("check_integrity.ts");
    expect(typeof parsed.summary.ok).toBe("number");
    expect(typeof parsed.summary.ng).toBe("number");
    expect(typeof parsed.summary.warning).toBe("number");
    expect(typeof parsed.summary.info).toBe("number");
    expect(Array.isArray(parsed.results)).toBe(true);
  });
});

describe("valid fixture (all checks pass or info-only)", () => {
  it("exits with code 0", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    expect(r.exitCode).toBe(0);
  });

  it("has zero ng results", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBe(0);
  });

  it("REQ frontmatter-filename check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "frontmatter-filename"
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ required-fields check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "required-fields"
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ readme-index-sync check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "readme-index-sync"
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("ADR cross-reference check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ADR" && res.check === "adr-req-crossref"
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("specs existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specResults = parsed.results.filter(
      (res: { category: string }) => res.category === "Specs"
    );
    expect(specResults.length).toBeGreaterThanOrEqual(1);
    for (const sr of specResults) {
      expect(sr.level).toBe("ok");
    }
  });
});

describe("invalid fixture detects violations", () => {
  it("exits with code 1 (NG)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    expect(r.exitCode).toBe(1);
  });

  it("has at least one ng result", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBeGreaterThan(0);
  });

  it("detects REQ id/filename mismatch (REQ-0002 has id REQ-9999)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const mismatch = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "frontmatter-filename" &&
        res.message.includes("REQ-9999") &&
        res.message.includes("REQ-0002")
    );
    expect(mismatch).toBeDefined();
    expect(mismatch.level).toBe("ng");
  });

  it("detects missing required fields (REQ-0003)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const missingFields = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "required-fields" &&
        (res.message.includes("REQ-0003") || (res.file ?? "").includes("REQ-0003"))
    );
    expect(missingFields).toBeDefined();
    expect(missingFields.level).toBe("ng");
  });

  it("detects phantom README index entry (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const phantom = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" &&
        res.message.includes("REQ-0099")
    );
    expect(phantom).toBeDefined();
    expect(phantom.level).toBe("ng");
  });

  it("detects REQ file missing from README index", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const missing = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" &&
        res.message.includes("REQ-0003") &&
        res.message.includes("missing from README")
    );
    expect(missing).toBeDefined();
    expect(missing.level).toBe("ng");
  });

  it("detects ADR referencing non-existent REQ (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badRef = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "adr-req-crossref" &&
        res.message.includes("REQ-0099")
    );
    expect(badRef).toBeDefined();
    expect(badRef.level).toBe("ng");
  });

  it("detects missing spec files", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "Specs" && res.level === "ng"
    );
    expect(specNg.length).toBeGreaterThan(0);
  });

  it("detects load_skills referencing non-existent skill", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badSkill = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "load-skills-existence" &&
        res.message.includes("agentdev-nonexistent")
    );
    expect(badSkill).toBeDefined();
    expect(badSkill.level).toBe("ng");
  });

  it("detects command missing required frontmatter fields", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badCmd = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "command-inventory" &&
        (res.message.includes("bad-cmd") || (res.file ?? "").includes("bad-cmd"))
    );
    expect(badCmd).toBeDefined();
    expect(badCmd.level).toBe("ng");
  });
});

describe("legacy data path and terminology detection (6j/6k)", () => {
  const LEGACY_ROOT = join(TEMP_ROOT, "legacy");

  beforeAll(() => {
    mkdirp(LEGACY_ROOT);
    buildValidFixture(LEGACY_ROOT);
    copyScripts(LEGACY_ROOT);
  });

  it("detects docs/tips/ (old data path)", () => {
    const skillDir = join(LEGACY_ROOT, ".opencode", "skills", "agentdev-test-skill");
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "# agentdev-test-skill\n\nSee docs/tips/ for reference.\n",
      "utf-8"
    );
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("docs/tips/")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });

  it("detects tips プール (old terminology)", () => {
    const skillDir = join(LEGACY_ROOT, ".opencode", "skills", "agentdev-test-skill");
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "# agentdev-test-skill\n\n生きている tips プール\n",
      "utf-8"
    );
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("tips プール")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });

  it("detects refactor時prune (old terminology)", () => {
    const skillDir = join(LEGACY_ROOT, ".opencode", "skills", "agentdev-test-skill");
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "# agentdev-test-skill\n\nrefactor時prune（任意）\n",
      "utf-8"
    );
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("refactor時prune")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });

  it("detects elevate時prune (old terminology)", () => {
    const skillDir = join(LEGACY_ROOT, ".opencode", "skills", "agentdev-test-skill");
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "# agentdev-test-skill\n\nelevate時prune（必須）\n",
      "utf-8"
    );
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("elevate時prune")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });

  it("does NOT false-positive on legitimate refactor in conventional commits table", () => {
    const skillDir = join(LEGACY_ROOT, ".opencode", "skills", "agentdev-test-skill");
    writeFileSync(
      join(skillDir, "SKILL.md"),
      "# agentdev-test-skill\n\n| refactor | PATCH | refactor: 関数整理 |\n\nNo legacy terms here.\n",
      "utf-8"
    );
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const falseHit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("old terminology")
    );
    expect(falseHit).toBeUndefined();
  });

  it("does NOT false-positive on docs/tips/ mentioned in integrity-check.md", () => {
    const r = runScript(LEGACY_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const integrityHit = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "legacy-namespace" &&
        res.message.includes("docs/tips/") &&
        (res.file ?? "").includes("integrity-check")
    );
    expect(integrityHit).toBeUndefined();
  });
});

// ─── New tests for REQ-0108 checks ────────────────────────────────────────

describe("checkLinkIntegrity: broken file links", () => {
  const LINK_ROOT = join(TEMP_ROOT, "link");

  beforeAll(() => {
    mkdirp(LINK_ROOT);
    buildValidFixture(LINK_ROOT);

    const reqDir = join(LINK_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Link test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "See [guide](../guides/nonexistent.md) for details.",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(LINK_ROOT);
  });

  it("detects broken file link", () => {
    const r = runScript(LINK_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-file-link" &&
        res.message.includes("nonexistent.md")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
    expect(hit.evidence).toContain("nonexistent.md");
    expect(hit.expected).toContain("must exist");
  });
});

describe("checkLinkIntegrity: broken section anchor", () => {
  const ANCHOR_ROOT = join(TEMP_ROOT, "anchor");

  beforeAll(() => {
    mkdirp(ANCHOR_ROOT);
    buildValidFixture(ANCHOR_ROOT);

    const specsDir = join(ANCHOR_ROOT, "docs", "specs");
    writeFileSync(
      join(specsDir, "system.md"),
      "# System\n\ntest-cmd\n\n## Overview\n",
      "utf-8"
    );

    const reqDir = join(ANCHOR_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Anchor test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "See [system](../specs/system.md#missing-section) for details.",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(ANCHOR_ROOT);
  });

  it("detects broken section anchor", () => {
    const r = runScript(ANCHOR_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-section-anchor"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("checkLinkIntegrity: missing REQ/ADR references", () => {
  const REF_ROOT = join(TEMP_ROOT, "ref");

  beforeAll(() => {
    mkdirp(REF_ROOT);
    buildValidFixture(REF_ROOT);

    const reqDir = join(REF_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Ref test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "See REQ-0099 and ADR-0099 for details.",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(REF_ROOT);
  });

  it("detects missing REQ reference", () => {
    const r = runScript(REF_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-req-ref" &&
        res.message.includes("REQ-0099")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });

  it("detects missing ADR reference", () => {
    const r = runScript(REF_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-adr-ref" &&
        res.message.includes("ADR-0099")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("checkLifecycleBoundary: active/retired ID duplication", () => {
  const LIFECYCLE_ROOT = join(TEMP_ROOT, "lifecycle");

  beforeAll(() => {
    mkdirp(LIFECYCLE_ROOT);
    buildValidFixture(LIFECYCLE_ROOT);

    const retiredDir = join(LIFECYCLE_ROOT, "docs", "requirements", "retired");
    mkdirp(retiredDir);
    writeFileSync(
      join(retiredDir, "REQ-0001.md"),
      "---\nid: REQ-0001\ntitle: Retired duplicate\n---\n\nRetired content.\n",
      "utf-8"
    );

    copyScripts(LIFECYCLE_ROOT);
  });

  it("detects active/retired ID duplication", () => {
    const r = runScript(LIFECYCLE_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "active-retired-duplication" &&
        res.message.includes("REQ-0001")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

// ─── Implementation pattern check tests (REQ-0108-022~024) ────────────────

describe("E1: checkImplementationPattern — all valid", () => {
  const ROOT = join(TEMP_ROOT, "e1-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("passes when all commands have valid implementation_pattern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "implementation-pattern"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("E2: checkImplementationPattern — missing implementation_pattern", () => {
  const ROOT = join(TEMP_ROOT, "e2-missing");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    // Override test-cmd.md to NOT have implementation_pattern
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("detects missing implementation_pattern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "implementation-pattern" &&
        res.message.includes("implementation_pattern が定義されていない")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("E3: checkImplementationPattern — unknown pattern", () => {
  const ROOT = join(TEMP_ROOT, "e3-unknown");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: unknown-pattern",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("detects unknown implementation_pattern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "implementation-pattern" &&
        res.message.includes("未知のパターン")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("E4: checkImplementationPattern — valid secondary_pattern", () => {
  const ROOT = join(TEMP_ROOT, "e4-secondary-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: read-only-diagnostic",
      "secondary_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("passes when secondary_pattern is valid", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "implementation-pattern"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("E5: checkImplementationPattern — unknown secondary_pattern", () => {
  const ROOT = join(TEMP_ROOT, "e5-secondary-ng");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: read-only-diagnostic",
      "secondary_pattern: bogus",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("detects unknown secondary_pattern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "implementation-pattern" &&
        res.message.includes("secondary_pattern")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("E6: checkPatternProhibitions — no violations", () => {
  const ROOT = join(TEMP_ROOT, "e6-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("passes when no pattern prohibition violations", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "pattern-prohibitions"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("E7: checkPatternProhibitions — capture-only with prohibited skill", () => {
  const ROOT = join(TEMP_ROOT, "e7-violation");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: capture-only",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "  - agentdev-workflow-orchestration",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("detects prohibited skill in capture-only command", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "pattern-prohibitions" &&
        res.message.includes("禁止 skill")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("E8: checkPatternProhibitions — manager-orchestrator on non-case-run", () => {
  const ROOT = join(TEMP_ROOT, "e8-mgr");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "other-cmd.md"), [
      "---",
      "description: Other command",
      "agent: test-agent",
      "implementation_pattern: manager-orchestrator",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "  - agentdev-workflow-orchestration",
      "---",
      "",
      "Other command body.",
      "",
    ].join("\n"), "utf-8");
    // Also update README to include other-cmd
    writeFileSync(join(cmdDir, "README.md"), [
      "# Commands",
      "",
      "| Command | Description | Agent | Skills |",
      "|---------|-------------|-------|--------|",
      "| `agentdev/test-cmd` | Test command | test-agent | agentdev-test-skill |",
      "| `agentdev/other-cmd` | Other command | test-agent | agentdev-test-skill |",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("detects manager-orchestrator on non-case-run file", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "pattern-prohibitions" &&
        res.message.includes("manager-orchestrator")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("E9: checkLoadSkillsConsistency — all consistent", () => {
  const ROOT = join(TEMP_ROOT, "e9-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("passes when all commands have consistent load_skills", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "load-skills-consistency"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("E10: checkLoadSkillsConsistency — missing workflow-reporting", () => {
  const ROOT = join(TEMP_ROOT, "e10-missing");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"), "utf-8");
    copyScripts(ROOT);
  });

  it("warns when agentdev-workflow-reporting is missing from load_skills", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "load-skills-consistency" &&
        res.message.includes("agentdev-workflow-reporting")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
  });
});

describe("checkLifecycleBoundary: retired in active index", () => {
  const RETIRED_INDEX_ROOT = join(TEMP_ROOT, "retired-index");

  beforeAll(() => {
    mkdirp(RETIRED_INDEX_ROOT);
    buildValidFixture(RETIRED_INDEX_ROOT);

    const retiredDir = join(RETIRED_INDEX_ROOT, "docs", "requirements", "retired");
    mkdirp(retiredDir);
    writeFileSync(
      join(retiredDir, "REQ-0050.md"),
      "---\nid: REQ-0050\ntitle: Retired only\n---\n\nRetired content.\n",
      "utf-8"
    );

    const reqDir = join(RETIRED_INDEX_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "README.md"),
      [
        "# Requirements",
        "",
        "Retired: [retired](retired/)",
        "",
        "| ID | Title |",
        "|----|-------|",
        "| REQ-0001 | Valid requirement |",
        "| REQ-0050 | Retired only |",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(RETIRED_INDEX_ROOT);
  });

  it("detects retired ID in active README index", () => {
    const r = runScript(RETIRED_INDEX_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "retired-in-active-index" &&
        res.message.includes("REQ-0050")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("checkCanonicalBoundary: DOC-MAP with excessive requirements", () => {
  const CANONICAL_ROOT = join(TEMP_ROOT, "canonical");

  beforeAll(() => {
    mkdirp(CANONICAL_ROOT);
    buildValidFixture(CANONICAL_ROOT);

    writeFileSync(
      join(CANONICAL_ROOT, "docs", "DOC-MAP.md"),
      [
        "# DOC-MAP",
        "",
        "The system SHALL do X. The system MUST do Y.",
        "Component A SHALL handle Z. Component B MUST provide W.",
        "The gateway SHALL route traffic. The database MUST persist data.",
        "Additional requirement here.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(CANONICAL_ROOT);
  });

  it("detects DOC-MAP with too many requirement keywords", () => {
    const r = runScript(CANONICAL_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "docmap-requirements"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
    expect(hit.route).toBe("req-define");
  });
});

describe("checkCanonicalBoundary: guide with requirement tables", () => {
  const GUIDE_REQ_ROOT = join(TEMP_ROOT, "guide-req");

  beforeAll(() => {
    mkdirp(GUIDE_REQ_ROOT);
    buildValidFixture(GUIDE_REQ_ROOT);

    const guidesDir = join(GUIDE_REQ_ROOT, "docs", "guides");
    mkdirp(guidesDir);
    writeFileSync(
      join(guidesDir, "workflow-overview.md"),
      [
        "# Workflow Overview",
        "",
        "This guide describes the workflow.",
        "",
        "| ID | 要件 | Status |",
        "|----|------|--------|",
        "| REQ-0001 | Something | Done |",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(GUIDE_REQ_ROOT);
  });

  it("detects guide with requirement-like table", () => {
    const r = runScript(GUIDE_REQ_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "guide-req-table"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
    expect(hit.route).toBe("req-define");
  });
});

describe("checkExpandedLegacyNamespace: docs/* files", () => {
  const EXPANDED_NS_ROOT = join(TEMP_ROOT, "expanded-ns");

  beforeAll(() => {
    mkdirp(EXPANDED_NS_ROOT);
    buildValidFixture(EXPANDED_NS_ROOT);

    writeFileSync(
      join(EXPANDED_NS_ROOT, "docs", "DOC-MAP.md"),
      "# DOC-MAP\n\nSee .opencode/commands/issue/ for details.\n",
      "utf-8"
    );

    copyScripts(EXPANDED_NS_ROOT);
  });

  it("detects legacy pattern in DOC-MAP.md", () => {
    const r = runScript(EXPANDED_NS_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "expanded-legacy-namespace" &&
        res.message.includes("commands/issue/")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("determineRoute: route determination logic", () => {
  it("routes single broken-reference to intake", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("broken-reference", 1)).toBe("intake");
  });

  it("routes 3+ broken-reference to intake+learning", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("broken-reference", 3)).toBe("intake+learning");
    expect(dr("broken-reference", 10)).toBe("intake+learning");
  });

  it("routes obsolete-structure to intake", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("obsolete-structure", 1)).toBe("intake");
  });

  it("routes canonical-conflict to req-define", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("canonical-conflict", 1)).toBe("req-define");
  });

  it("routes single document-drift to intake", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("document-drift", 1)).toBe("intake");
  });

  it("routes 3+ document-drift to intake+learning", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("document-drift", 3)).toBe("intake+learning");
  });

  it("routes workflow-gap to req-define", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("workflow-gap", 1)).toBe("req-define");
  });

  it("routes integrity-rule-gap to req-define", () => {
    const { determineRoute: dr } = require("./cli_utils.ts") as typeof import("./cli_utils.ts");
    expect(dr("integrity-rule-gap", 1)).toBe("req-define");
  });
});

describe("report file output", () => {
  const REPORT_ROOT = join(TEMP_ROOT, "report");

  beforeAll(() => {
    mkdirp(REPORT_ROOT);
    buildValidFixture(REPORT_ROOT);
    copyScripts(REPORT_ROOT);
  });

  it("writes report file to .agentdev/integrity/reports/", () => {
    const r = runScript(REPORT_ROOT, ["--json"]);
    expect(r.exitCode).toBe(0);
    const reportsDir = join(REPORT_ROOT, ".agentdev", "integrity", "reports");
    expect(existsSync(reportsDir)).toBe(true);
    const reportFiles = require("fs").readdirSync(reportsDir) as string[];
    const mdReport = reportFiles.find((f: string) => f.endsWith("-integrity-report.md"));
    expect(mdReport).toBeDefined();
    const content = readFileSync(join(reportsDir, mdReport), "utf-8");
    expect(content).toContain("check_integrity.ts Report");
    expect(content).toContain("サマリ");
  });

  it("avoids overwriting existing report files", () => {
    const r1 = runScript(REPORT_ROOT, ["--json"]);
    expect(r1.exitCode).toBe(0);
    const reportsDir = join(REPORT_ROOT, ".agentdev", "integrity", "reports");
    const filesAfterFirst = (require("fs").readdirSync(reportsDir) as string[]).filter(
      (f: string) => f.endsWith("-integrity-report.md") || f.includes("-integrity-report-")
    );
    expect(filesAfterFirst.length).toBeGreaterThanOrEqual(1);

    const r2 = runScript(REPORT_ROOT, ["--json"]);
    const filesAfterSecond = (require("fs").readdirSync(reportsDir) as string[]).filter(
      (f: string) => f.endsWith("-integrity-report.md") || f.includes("-integrity-report-")
    );
    expect(filesAfterSecond.length).toBeGreaterThan(filesAfterFirst.length);
  });
});

describe("JSON output with new fields", () => {
  const JSON_ROOT = join(TEMP_ROOT, "json-new");

  beforeAll(() => {
    mkdirp(JSON_ROOT);
    buildValidFixture(JSON_ROOT);

    const reqDir = join(JSON_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: JSON test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "See REQ-0099 for details.",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(JSON_ROOT);
  });

  it("includes evidence and route in JSON results", () => {
    const r = runScript(JSON_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidenceResults = parsed.results.filter(
      (res: { evidence?: string }) => res.evidence !== undefined
    );
    expect(evidenceResults.length).toBeGreaterThan(0);
    for (const res of evidenceResults) {
      expect(typeof res.evidence).toBe("string");
      if (res.route) {
        expect(["intake", "intake+learning", "req-define", "learning", "none"]).toContain(res.route);
      }
    }
  });
});

describe("inventory sync: ADR README index", () => {
  const ADR_SYNC_ROOT = join(TEMP_ROOT, "adr-sync");

  beforeAll(() => {
    mkdirp(ADR_SYNC_ROOT);
    buildValidFixture(ADR_SYNC_ROOT);

    const adrDir = join(ADR_SYNC_ROOT, "docs", "adr");
    writeFileSync(
      join(adrDir, "README.md"),
      [
        "# ADRs",
        "",
        "| ADR | Title |",
        "|-----|-------|",
        "| ADR-0001 | Valid ADR |",
        "| ADR-0099 | Phantom |",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(ADR_SYNC_ROOT);
  });

  it("detects phantom ADR in README index", () => {
    const r = runScript(ADR_SYNC_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "adr-readme-index" &&
        res.message.includes("ADR-0099")
    );
    expect(hit.level).toBe("ng");
  });
});

// ─── Variant structure check tests (REQ-0107-024~027) ─────────────────────

const VARIANT_VALID_FIELDS = [
  "完了コマンド: /agentdev/test-cmd",
  "対象: {対象}",
  "結果: {結果}",
  "検証結果: {検証結果}",
  "git 永続化: commit: {hash}, push: {status}",
  "次のコマンド: /agentdev/case-open",
];

function buildVariantFixture(root: string): void {
  buildValidFixture(root);

  const reportingRefDir = join(root, ".opencode", "skills", "agentdev-workflow-reporting", "references");

  writeFileSync(
    join(reportingRefDir, "completion-reports.md"),
    [
      "# 完了報告フォーマット",
      "",
      "## Variant Registry",
      "",
      "| Command | Variant | File | Condition |",
      "|---------|---------|------|-----------|",
      "| test-cmd | standard | completion-reports/test-cmd/standard.md | Default |",
      "| test-cmd | epic | completion-reports/test-cmd/epic.md | Epic |",
      "",
      "## 必須フィールド定義",
      "",
      "完了コマンド, 対象, 結果, 検証結果, git 永続化, 次のコマンド",
      "",
    ].join("\n"),
    "utf-8"
  );

  const variantDir = join(reportingRefDir, "completion-reports", "test-cmd");
  mkdirp(variantDir);

  writeFileSync(
    join(variantDir, "standard.md"),
    ["✅ test-cmd 完了", "", ...VARIANT_VALID_FIELDS, ""].join("\n"),
    "utf-8"
  );

  writeFileSync(
    join(variantDir, "epic.md"),
    ["✅ test-cmd 完了 (Epic)", "", ...VARIANT_VALID_FIELDS, ""].join("\n"),
    "utf-8"
  );
}

describe("D1: checkVariantExistence — all variants present", () => {
  const D1_OK_ROOT = join(TEMP_ROOT, "d1-ok");

  beforeAll(() => {
    mkdirp(D1_OK_ROOT);
    buildVariantFixture(D1_OK_ROOT);
    copyScripts(D1_OK_ROOT);
  });

  it("exits with code 0 when all variants exist", () => {
    const r = runScript(D1_OK_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; level: string }) =>
        res.check === "variant-existence" && res.level === "ok"
    );
    expect(hit).toBeDefined();
  });
});

describe("D1: checkVariantExistence — missing variant file", () => {
  const D1_MISS_ROOT = join(TEMP_ROOT, "d1-miss");

  beforeAll(() => {
    mkdirp(D1_MISS_ROOT);
    buildVariantFixture(D1_MISS_ROOT);

    const variantDir = join(
      D1_MISS_ROOT, ".opencode", "skills", "agentdev-workflow-reporting",
      "references", "completion-reports", "test-cmd"
    );
    rmSync(join(variantDir, "epic.md"), { force: true });

    copyScripts(D1_MISS_ROOT);
  });

  it("detects missing variant file", () => {
    const r = runScript(D1_MISS_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "variant-existence" &&
        res.message.includes("epic.md")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("D1: checkVariantExistence — missing command directory", () => {
  const D1_NODIR_ROOT = join(TEMP_ROOT, "d1-nodir");

  beforeAll(() => {
    mkdirp(D1_NODIR_ROOT);
    buildVariantFixture(D1_NODIR_ROOT);

    const variantDir = join(
      D1_NODIR_ROOT, ".opencode", "skills", "agentdev-workflow-reporting",
      "references", "completion-reports", "test-cmd"
    );
    rmSync(variantDir, { recursive: true, force: true });

    copyScripts(D1_NODIR_ROOT);
  });

  it("detects missing command directory", () => {
    const r = runScript(D1_NODIR_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "variant-existence" &&
        res.message.includes("test-cmd") &&
        res.message.includes("directory")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("D2: checkInlineCompletionBodyInCommands — no violations", () => {
  const D2_OK_ROOT = join(TEMP_ROOT, "d2-ok");

  beforeAll(() => {
    mkdirp(D2_OK_ROOT);
    buildVariantFixture(D2_OK_ROOT);

    writeFileSync(
      join(D2_OK_ROOT, ".opencode", "commands", "agentdev", "test-cmd.md"),
      [
        "---",
        "description: Test command",
        "agent: test-agent",
        "load_skills:",
        "  - agentdev-test-skill",
        "  - agentdev-workflow-reporting",
        "---",
        "",
        "完了報告 → agentdev-workflow-reporting の完了報告variantに従って出力",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(D2_OK_ROOT);
  });

  it("passes when command only references variant", () => {
    const r = runScript(D2_OK_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "inline-completion-body"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("D2: checkInlineCompletionBodyInCommands — detects inline body", () => {
  const D2_NG_ROOT = join(TEMP_ROOT, "d2-ng");

  beforeAll(() => {
    mkdirp(D2_NG_ROOT);
    buildVariantFixture(D2_NG_ROOT);

    writeFileSync(
      join(D2_NG_ROOT, ".opencode", "commands", "agentdev", "test-cmd.md"),
      [
        "---",
        "description: Test command",
        "agent: test-agent",
        "load_skills:",
        "  - agentdev-test-skill",
        "  - agentdev-workflow-reporting",
        "---",
        "",
        "## 完了報告",
        "",
        "```",
        "✅ test-cmd 完了",
        "完了コマンド: /agentdev/test-cmd",
        "```",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(D2_NG_ROOT);
  });

  it("detects inline completion report body text", () => {
    const r = runScript(D2_NG_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "inline-completion-body"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("D2: checkInlineCompletionBodyInCommands — error template allowed", () => {
  const D2_ERR_ROOT = join(TEMP_ROOT, "d2-err");

  beforeAll(() => {
    mkdirp(D2_ERR_ROOT);
    buildVariantFixture(D2_ERR_ROOT);

    writeFileSync(
      join(D2_ERR_ROOT, ".opencode", "commands", "agentdev", "test-cmd.md"),
      [
        "---",
        "description: Test command",
        "agent: test-agent",
        "load_skills:",
        "  - agentdev-test-skill",
        "  - agentdev-workflow-reporting",
        "---",
        "",
        "## Error Handling",
        "",
        "```",
        "❌ エラー: 処理に失敗しました",
        "```",
        "",
        "## 完了報告",
        "",
        "```",
        "エラー発生時の✅出力内容（Error テンプレート）",
        "```",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(D2_ERR_ROOT);
  });

  it("allows error format templates in command definitions", () => {
    const r = runScript(D2_ERR_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "inline-completion-body" && res.level === "ng"
    );
    expect(hits.length).toBe(0);
  });
});

describe("D3: checkVariantRequiredFields — all 6 fields present", () => {
  const D3_OK_ROOT = join(TEMP_ROOT, "d3-ok");

  beforeAll(() => {
    mkdirp(D3_OK_ROOT);
    buildVariantFixture(D3_OK_ROOT);
    copyScripts(D3_OK_ROOT);
  });

  it("passes when all 6 required fields are present", () => {
    const r = runScript(D3_OK_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "variant-required-fields"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("D3: checkVariantRequiredFields — missing field", () => {
  const D3_NG_ROOT = join(TEMP_ROOT, "d3-ng");

  beforeAll(() => {
    mkdirp(D3_NG_ROOT);
    buildVariantFixture(D3_NG_ROOT);

    const variantDir = join(
      D3_NG_ROOT, ".opencode", "skills", "agentdev-workflow-reporting",
      "references", "completion-reports", "test-cmd"
    );
    writeFileSync(
      join(variantDir, "standard.md"),
      [
        "✅ test-cmd 完了",
        "",
        "完了コマンド: /agentdev/test-cmd",
        "対象: {対象}",
        "結果: {結果}",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(D3_NG_ROOT);
  });

  it("detects missing required fields", () => {
    const r = runScript(D3_NG_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "variant-required-fields" &&
        res.message.includes("検証結果")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("D4: checkFragmentPatterns — self-contained variant", () => {
  const D4_OK_ROOT = join(TEMP_ROOT, "d4-ok");

  beforeAll(() => {
    mkdirp(D4_OK_ROOT);
    buildVariantFixture(D4_OK_ROOT);
    copyScripts(D4_OK_ROOT);
  });

  it("passes for self-contained variants", () => {
    const r = runScript(D4_OK_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "fragment-patterns"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("D4: checkFragmentPatterns — fragment pattern detected", () => {
  const D4_NG_ROOT = join(TEMP_ROOT, "d4-ng");

  beforeAll(() => {
    mkdirp(D4_NG_ROOT);
    buildVariantFixture(D4_NG_ROOT);

    const variantDir = join(
      D4_NG_ROOT, ".opencode", "skills", "agentdev-workflow-reporting",
      "references", "completion-reports", "test-cmd"
    );
    writeFileSync(
      join(variantDir, "standard.md"),
      [
        "✅ test-cmd 完了",
        "",
        ...VARIANT_VALID_FIELDS,
        "",
        "完了報告に以下を追加:",
        "- 追加情報",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(D4_NG_ROOT);
  });

  it("detects fragment composition pattern", () => {
    const r = runScript(D4_NG_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "fragment-patterns" &&
        res.message.includes("完了報告に以下を追加")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

// ─── Implementation Pattern Diagnostics (REQ-0108-026~038) ────────────────

function buildCommandMapFixture(root: string, commands: { name: string; pattern: string; secondary?: string; loadSkills?: string[] }[]): void {
  buildValidFixture(root);

  const cmdDir = join(root, ".opencode", "commands", "agentdev");

  const rows: string[] = [];
  for (const cmd of commands) {
    const ls = cmd.loadSkills || ["agentdev-workflow-reporting"];
    writeFileSync(join(cmdDir, `${cmd.name}.md`), [
      "---",
      "description: Test",
      "agent: test-agent",
      `implementation_pattern: ${cmd.pattern}`,
      ...(cmd.secondary ? [`secondary_pattern: ${cmd.secondary}`] : []),
      "load_skills:",
      ...ls.map((s) => `  - ${s}`),
      "---",
      "",
      `${cmd.name} body.`,
      "",
    ].join("\n"), "utf-8");

    const secondary = cmd.secondary ? cmd.secondary : "—";
    rows.push(`| \`/agentdev/${cmd.name}\` | ${cmd.pattern} | ${secondary} |`);
  }

  writeFileSync(join(cmdDir, "README.md"), [
    "# Commands",
    "",
    "| Command | Description | Agent | Skills |",
    "|---------|-------------|-------|--------|",
    ...commands.map((cmd) => `| \`agentdev/${cmd.name}\` | Test | test-agent | agentdev-workflow-reporting |`),
    "",
  ].join("\n"), "utf-8");

  const refDir = join(root, ".opencode", "skills", "agentdev-workflow-lifecycle", "references");
  mkdirp(refDir);

  writeFileSync(join(refDir, "command-map.md"), [
    "# コマンド関連マップ",
    "",
    "## Implementation Pattern Taxonomy",
    "",
    "### Command ↔ Pattern Correspondence",
    "",
    "| コマンド | Primary Pattern | Secondary Pattern |",
    "|---------|----------------|-------------------|",
    ...rows,
    "",
    "### Pattern ごとの禁止 load_skills",
    "",
    "| Pattern | 禁止される load_skills |",
    "|---------|---------------------|",
    "| capture-only | `agentdev-workflow-orchestration`, `agentdev-workflow-routing` |",
    "| read-only-diagnostic | `agentdev-workflow-orchestration`, `agentdev-git-worktree` |",
    "| wall-session | `agentdev-workflow-orchestration`, `agentdev-workflow-routing`, `agentdev-gh-cli`, `agentdev-git-worktree`, `agentdev-conventional-commits` |",
    "| file-pipeline | （なし） |",
    "| manager-orchestrator | （なし） |",
    "",
  ].join("\n"), "utf-8");
}

describe("G1: checkCommandMapConsistency — valid", () => {
  const ROOT = join(TEMP_ROOT, "g1-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildCommandMapFixture(ROOT, [
      { name: "test-cmd", pattern: "file-pipeline", loadSkills: ["agentdev-workflow-reporting", "agentdev-conventional-commits", "agentdev-req-file-manager", "agentdev-adr-file-manager", "agentdev-no-ai-slop-writing", "agentdev-gh-cli"] },
    ]);
    copyScripts(ROOT);
  });

  it("passes when command-map matches frontmatter", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "command-map-consistency"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("G1: checkCommandMapConsistency — pattern mismatch", () => {
  const ROOT = join(TEMP_ROOT, "g1-mismatch");

  beforeAll(() => {
    mkdirp(ROOT);
    buildCommandMapFixture(ROOT, [
      { name: "test-cmd", pattern: "file-pipeline", loadSkills: ["agentdev-workflow-reporting", "agentdev-conventional-commits", "agentdev-req-file-manager", "agentdev-adr-file-manager", "agentdev-no-ai-slop-writing", "agentdev-gh-cli"] },
    ]);

    const cmdFile = join(ROOT, ".opencode", "commands", "agentdev", "test-cmd.md");
    writeFileSync(cmdFile, [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    copyScripts(ROOT);
  });

  it("detects frontmatter vs command-map primary pattern mismatch", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "command-map-consistency" &&
        res.message.includes("frontmatter has") &&
        res.message.includes("command-map.md says")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("G1: checkCommandMapConsistency — missing command file", () => {
  const ROOT = join(TEMP_ROOT, "g1-missing");

  beforeAll(() => {
    mkdirp(ROOT);
    buildCommandMapFixture(ROOT, [
      { name: "test-cmd", pattern: "file-pipeline", loadSkills: ["agentdev-workflow-reporting", "agentdev-conventional-commits", "agentdev-req-file-manager", "agentdev-adr-file-manager", "agentdev-no-ai-slop-writing", "agentdev-gh-cli"] },
      { name: "ghost-cmd", pattern: "wall-session" },
    ]);

    const ghostFile = join(ROOT, ".opencode", "commands", "agentdev", "ghost-cmd.md");
    if (existsSync(ghostFile)) rmSync(ghostFile, { force: true });

    copyScripts(ROOT);
  });

  it("detects command in command-map but no file", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "command-map-consistency" &&
        res.message.includes("ghost-cmd") &&
        res.message.includes("no corresponding command file")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("G2: secondary pattern consistency", () => {
  const ROOT = join(TEMP_ROOT, "g2-secondary");

  beforeAll(() => {
    mkdirp(ROOT);
    buildCommandMapFixture(ROOT, [
      { name: "test-cmd", pattern: "read-only-diagnostic", secondary: "wall-session", loadSkills: ["agentdev-workflow-reporting", "agentdev-integrity"] },
    ]);

    const cmdFile = join(ROOT, ".opencode", "commands", "agentdev", "test-cmd.md");
    writeFileSync(cmdFile, [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: read-only-diagnostic",
      "load_skills:",
      "  - agentdev-workflow-reporting",
      "  - agentdev-integrity",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    copyScripts(ROOT);
  });

  it("detects missing secondary_pattern in frontmatter when command-map has one", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "command-map-consistency" &&
        res.message.includes("secondary") &&
        res.message.includes("frontmatter has none")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("G2: secondary pattern prohibition union", () => {
  const ROOT = join(TEMP_ROOT, "g2-union");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: file-pipeline",
      "secondary_pattern: read-only-diagnostic",
      "load_skills:",
      "  - agentdev-workflow-reporting",
      "  - agentdev-conventional-commits",
      "  - agentdev-req-file-manager",
      "  - agentdev-adr-file-manager",
      "  - agentdev-no-ai-slop-writing",
      "  - agentdev-gh-cli",
      "  - agentdev-git-worktree",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-git-worktree");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-git-worktree\n", "utf-8");

    copyScripts(ROOT);
  });

  it("detects skill prohibited by secondary pattern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "pattern-prohibitions" &&
        res.message.includes("agentdev-git-worktree")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ng");
  });
});

describe("G3: checkExcessLoadSkills — no excess", () => {
  const ROOT = join(TEMP_ROOT, "g3-excess-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    copyScripts(ROOT);
  });

  it("passes when all skills match expected concerns", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "excess-load-skills"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("G3: checkExcessLoadSkills — excess skill detected", () => {
  const ROOT = join(TEMP_ROOT, "g3-excess-ng");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    copyScripts(ROOT);
  });

  it("warns about skill not matching any expected concern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "excess-load-skills" &&
        res.message.includes("agentdev-test-skill")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
    expect(hit.message).toContain("[recommendation: load_skills-remove-candidate]");
  });
});

describe("G3: checkMissingLoadSkills — no missing", () => {
  const ROOT = join(TEMP_ROOT, "g3-missing-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    copyScripts(ROOT);
  });

  it("passes when all expected concerns are covered", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "missing-load-skills"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("G3: checkMissingLoadSkills — missing concern", () => {
  const ROOT = join(TEMP_ROOT, "g3-missing-ng");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: read-only-diagnostic",
      "load_skills:",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-integrity");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-integrity\n", "utf-8");

    copyScripts(ROOT);
  });

  it("warns about missing expected concern", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "missing-load-skills" &&
        res.message.includes("integrity")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
    expect(hit.message).toContain("[recommendation: load_skills-add-candidate]");
  });
});

describe("G4: checkUseForConsistency — no violations", () => {
  const ROOT = join(TEMP_ROOT, "g4-ok");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);
    copyScripts(ROOT);
  });

  it("passes when no USE FOR inconsistencies", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) => res.check === "use-for-consistency"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
  });
});

describe("G4: checkUseForConsistency — DO NOT USE FOR violation", () => {
  const ROOT = join(TEMP_ROOT, "g4-donotuse");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-workflow-reporting");
    writeFileSync(join(skillDir, "SKILL.md"), [
      "# agentdev-workflow-reporting",
      "",
      "## DO NOT USE FOR",
      "",
      "- test-cmd",
      "",
    ].join("\n"), "utf-8");

    copyScripts(ROOT);
  });

  it("warns when command referenced in DO NOT USE FOR", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "use-for-consistency" &&
        res.message.includes("DO NOT USE FOR") &&
        res.message.includes("test-cmd")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("warning");
    expect(hit.message).toContain("[recommendation: skill-use-for-update-candidate]");
  });
});

describe("G4: checkUseForConsistency — doc-map not referenced", () => {
  const ROOT = join(TEMP_ROOT, "g4-docmap");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-doc-map");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-doc-map\n", "utf-8");

    copyScripts(ROOT);
  });

  it("reports info when agentdev-doc-map is not referenced", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "use-for-consistency" &&
        res.message.includes("agentdev-doc-map")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("info");
    expect(hit.message).toContain("[recommendation: no-action]");
  });
});

describe("G5: checkUnusedSkillsCategorized — authoring-only", () => {
  const ROOT = join(TEMP_ROOT, "g5-authoring");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-command-authoring");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-command-authoring\n", "utf-8");

    copyScripts(ROOT);
  });

  it("classifies agentdev-command-authoring as authoring-only", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "unused-skills-categorized" &&
        res.message.includes("agentdev-command-authoring") &&
        res.message.includes("authoring-only")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("info");
    expect(hit.message).toContain("[recommendation: no-action]");
  });
});

describe("G5: checkUnusedSkillsCategorized — deprecated-candidate", () => {
  const ROOT = join(TEMP_ROOT, "g5-deprecated");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-old-skill");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-old-skill\n\nDeprecated skill.\n", "utf-8");

    copyScripts(ROOT);
  });

  it("classifies skill with 'deprecated' in SKILL.md as deprecated-candidate", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "unused-skills-categorized" &&
        res.message.includes("agentdev-old-skill") &&
        res.message.includes("deprecated-candidate")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("info");
  });
});

describe("G5: checkUnusedSkillsCategorized — runtime-unused default", () => {
  const ROOT = join(TEMP_ROOT, "g5-runtime");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const skillDir = join(ROOT, ".opencode", "skills", "agentdev-mystery-skill");
    mkdirp(skillDir);
    writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-mystery-skill\n", "utf-8");

    copyScripts(ROOT);
  });

  it("classifies unknown unused skill as runtime-unused", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "unused-skills-categorized" &&
        res.message.includes("agentdev-mystery-skill") &&
        res.message.includes("runtime-unused")
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("info");
  });
});

describe("G6: Phase 3 candidate in messages", () => {
  const ROOT = join(TEMP_ROOT, "g6-phase3");

  beforeAll(() => {
    mkdirp(ROOT);
    buildValidFixture(ROOT);

    const cmdDir = join(ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: test-agent",
      "implementation_pattern: wall-session",
      "load_skills:",
      "  - agentdev-test-skill",
      "  - agentdev-workflow-reporting",
      "---",
      "",
      "test-cmd body.",
      "",
    ].join("\n"), "utf-8");

    copyScripts(ROOT);
  });

  it("excess-load-skills includes phase3 candidate type in message", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "excess-load-skills" &&
        res.message.includes("load_skills-remove-candidate")
    );
    expect(hit).toBeDefined();
    expect(hit.message).toMatch(/\[recommendation: .+\]/);
  });

  it("missing-load-skills includes phase3 candidate type in message", () => {
    const r = runScript(ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "missing-load-skills" &&
        res.message.includes("load_skills-add-candidate")
    );
    expect(hit).toBeDefined();
    expect(hit.message).toMatch(/\[recommendation: .+\]/);
  });
});

// ─── False-positive regression tests (Issue #504 / REQ-0108-041,042,043,045) ─

describe("F1: extractReadmeTableReqIds — markdown link format [REQ-NNNN](REQ-NNNN.md)", () => {
  const F1_ROOT = join(TEMP_ROOT, "f1-link-req");

  beforeAll(() => {
    mkdirp(F1_ROOT);
    buildValidFixture(F1_ROOT);

    const reqDir = join(F1_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "README.md"),
      [
        "# Requirements",
        "",
        "| REQ ID | Title |",
        "|--------|-------|",
        "| [REQ-0001](REQ-0001.md) | Valid requirement |",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(F1_ROOT);
  });

  it("extracts REQ IDs from [REQ-NNNN](...) link format and does not report missing", () => {
    const r = runScript(F1_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const missingHit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" &&
        res.message.includes("REQ-0001") &&
        res.message.includes("missing from README")
    );
    expect(missingHit).toBeUndefined();
  });

  it("reports OK for readme-index-sync", () => {
    const r = runScript(F1_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const okHit = parsed.results.find(
      (res: { check: string; level: string }) =>
        res.check === "readme-index-sync" && res.level === "ok"
    );
    expect(okHit).toBeDefined();
  });
});

describe("F2: checkCompletionReportTemplates — variant directory on disk accepted", () => {
  const F2_ROOT = join(TEMP_ROOT, "f2-variant-dir");

  beforeAll(() => {
    mkdirp(F2_ROOT);
    buildValidFixture(F2_ROOT);

    const reportingRefDir = join(F2_ROOT, ".opencode", "skills", "agentdev-workflow-reporting", "reference");
    mkdirp(reportingRefDir);

    writeFileSync(
      join(reportingRefDir, "completion-reports.md"),
      [
        "# 完了報告フォーマット",
        "",
        "## Variant Registry",
        "",
        "| Command | Variant | File |",
        "|---------|---------|------|",
        "| other-cmd | standard | completion-reports/other-cmd/standard.md |",
        "",
      ].join("\n"),
      "utf-8"
    );

    const variantDir = join(reportingRefDir, "completion-reports", "other-cmd");
    mkdirp(variantDir);
    writeFileSync(join(variantDir, "standard.md"), "✅ other-cmd 完了\n", "utf-8");

    const testCmdVariantDir = join(reportingRefDir, "completion-reports", "test-cmd");
    mkdirp(testCmdVariantDir);
    writeFileSync(join(testCmdVariantDir, "standard.md"), "✅ test-cmd 完了\n", "utf-8");

    const cmdDir = join(F2_ROOT, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "other-cmd.md"), [
      "---",
      "description: Other command",
      "agent: test-agent",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-workflow-reporting",
      "  - agentdev-conventional-commits",
      "  - agentdev-req-file-manager",
      "  - agentdev-adr-file-manager",
      "  - agentdev-no-ai-slop-writing",
      "  - agentdev-gh-cli",
      "---",
      "",
      "Other command body.",
      "",
    ].join("\n"), "utf-8");

    writeFileSync(join(cmdDir, "README.md"), [
      "# Commands",
      "",
      "| Command | Description | Agent | Skills |",
      "|---------|-------------|-------|--------|",
      "| `agentdev/test-cmd` | Test | test-agent | agentdev-workflow-reporting |",
      "| `agentdev/other-cmd` | Other | test-agent | agentdev-workflow-reporting |",
      "",
    ].join("\n"), "utf-8");

    copyScripts(F2_ROOT);
  });

  it("accepts command with variant directory on disk even without registry entry for test-cmd", () => {
    const r = runScript(F2_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const templateHit = parsed.results.find(
      (res: { check: string; level: string }) =>
        res.check === "template-section-existence" && res.level === "ok"
    );
    expect(templateHit).toBeDefined();
  });

  it("does not report NG for test-cmd missing from registry", () => {
    const r = runScript(F2_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngHit = parsed.results.find(
      (res: { check: string; message: string; level: string }) =>
        res.check === "template-section-existence" &&
        res.message.includes("test-cmd") &&
        res.level === "ng"
    );
    expect(ngHit).toBeUndefined();
  });
});

describe("F3: retired-req-as-current — mapping-table.md excluded", () => {
  const F3_ROOT = join(TEMP_ROOT, "f3-mapping-table");

  beforeAll(() => {
    mkdirp(F3_ROOT);
    buildValidFixture(F3_ROOT);

    const reqDir = join(F3_ROOT, "docs", "requirements");
    const retiredDir = join(reqDir, "retired");
    mkdirp(retiredDir);

    writeFileSync(
      join(retiredDir, "REQ-0050.md"),
      "---\nid: REQ-0050\ntitle: Retired REQ\n---\n\nRetired content.\n",
      "utf-8"
    );

    writeFileSync(
      join(reqDir, "mapping-table.md"),
      [
        "# Migration Table",
        "",
        "| Old REQ | Status |",
        "|---------|--------|",
        "| REQ-0050 | retired-no-successor |",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(F3_ROOT);
  });

  it("does not warn about retired REQ in mapping-table.md (LinkIntegrity)", () => {
    const r = runScript(F3_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "retired-req-as-current" &&
        (res.file ?? "").includes("mapping-table")
    );
    expect(hit).toBeUndefined();
  });

  it("does not warn about retired REQ in mapping-table.md (LifecycleBoundary)", () => {
    const r = runScript(F3_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "retired-req-primary-ref" &&
        (res.file ?? "").includes("mapping-table")
    );
    expect(hit).toBeUndefined();
  });
});

describe("F4: parseMarkdownLinks — [URL] placeholder excluded", () => {
  const F4_ROOT = join(TEMP_ROOT, "f4-url-placeholder");

  beforeAll(() => {
    mkdirp(F4_ROOT);
    buildValidFixture(F4_ROOT);

    const reqDir = join(F4_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Placeholder test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "Status: ✅ 完了 ([PR#N](URL))",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );

    copyScripts(F4_ROOT);
  });

  it("does not report [text](URL) as broken file link", () => {
    const r = runScript(F4_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-file-link" &&
        res.message.includes("URL")
    );
    expect(hit).toBeUndefined();
  });

  it("still detects real broken links", () => {
    const reqDir = join(F4_ROOT, "docs", "requirements");
    writeFileSync(
      join(reqDir, "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Real broken link test",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "tags:",
        "  - test",
        "---",
        "",
        "## Body",
        "",
        "Status: ✅ 完了 ([PR#N](URL))",
        "See [guide](../guides/nonexistent.md) for details.",
        "See ADR-0001 for context.",
        "",
      ].join("\n"),
      "utf-8"
    );
    copyScripts(F4_ROOT);

    const r = runScript(F4_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const urlHit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-file-link" &&
        res.message.includes("URL")
    );
    const realHit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "broken-file-link" &&
        res.message.includes("nonexistent.md")
    );
    expect(urlHit).toBeUndefined();
    expect(realHit).toBeDefined();
    expect(realHit.level).toBe("ng");
  });
});

// ─── Obsolete reference/ directory regression tests (REQ-0108-039, 040) ──

describe("obsolete reference/ directory detection", () => {
  const OBSOLETE_ROOT = join(TEMP_BASE, `${RUN_ID}-obsolete-ref`);

  beforeAll(() => {
    buildValidFixture(OBSOLETE_ROOT);
    const skillsDir = join(OBSOLETE_ROOT, ".opencode", "skills");
    const skillDir = join(skillsDir, "agentdev-test-skill");
    mkdirp(join(skillDir, "reference"));
    writeFileSync(join(skillDir, "reference", "old-file.md"), "# Old reference\n", "utf-8");
    copyScripts(OBSOLETE_ROOT);
  });

  afterAll(() => {
    rmSync(OBSOLETE_ROOT, { recursive: true, force: true });
  });

  it("detects obsolete reference/ directory and reports NG", () => {
    const r = runScript(OBSOLETE_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "obsolete-reference-dir" &&
        res.level === "ng"
    );
    expect(hit).toBeDefined();
    expect(hit.message).toContain("reference/");
    expect(hit.message).toContain("references/");
  });
});

describe("canonical references/ directory is not flagged", () => {
  const CANONICAL_ROOT = join(TEMP_BASE, `${RUN_ID}-canonical-refs`);

  beforeAll(() => {
    buildValidFixture(CANONICAL_ROOT);
    const skillsDir = join(CANONICAL_ROOT, ".opencode", "skills");

    const reportingRefDir = join(skillsDir, "agentdev-workflow-reporting", "reference");
    if (existsSync(reportingRefDir)) rmSync(reportingRefDir, { recursive: true, force: true });
    const reportingRefsDir = join(skillsDir, "agentdev-workflow-reporting", "references");
    mkdirp(reportingRefsDir);
    writeFileSync(join(reportingRefsDir, "completion-reports.md"), "# 完了報告\n", "utf-8");

    const skillDir = join(skillsDir, "agentdev-test-skill");
    mkdirp(join(skillDir, "references"));
    writeFileSync(join(skillDir, "references", "valid-file.md"), "# Valid reference\n", "utf-8");
    copyScripts(CANONICAL_ROOT);
  });

  afterAll(() => {
    rmSync(CANONICAL_ROOT, { recursive: true, force: true });
  });

  it("reports OK when only canonical references/ exists", () => {
    const r = runScript(CANONICAL_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hit = parsed.results.find(
      (res: { check: string }) =>
        res.check === "obsolete-reference-dir"
    );
    expect(hit).toBeDefined();
    expect(hit.level).toBe("ok");
    expect(hit.message).toContain("references/");
  });
});

describe("mixed reference/ and references/ reports obsolete only", () => {
  const MIXED_ROOT = join(TEMP_BASE, `${RUN_ID}-mixed-refs`);

  beforeAll(() => {
    buildValidFixture(MIXED_ROOT);
    const skillsDir = join(MIXED_ROOT, ".opencode", "skills");

    const skillA = join(skillsDir, "agentdev-test-skill");
    mkdirp(join(skillA, "reference"));
    writeFileSync(join(skillA, "reference", "old.md"), "# old\n", "utf-8");

    const skillB = join(skillsDir, "agentdev-workflow-reporting");
    mkdirp(join(skillB, "references"));
    writeFileSync(join(skillB, "references", "new.md"), "# new\n", "utf-8");

    copyScripts(MIXED_ROOT);
  });

  afterAll(() => {
    rmSync(MIXED_ROOT, { recursive: true, force: true });
  });

  it("flags reference/ as NG and references/ does not cause NG", () => {
    const r = runScript(MIXED_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const obsoleteHits = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "obsolete-reference-dir" && res.level === "ng"
    );
    expect(obsoleteHits.length).toBeGreaterThanOrEqual(1);
    for (const hit of obsoleteHits) {
      expect(hit.message).toContain("reference/");
    }
  });
});
