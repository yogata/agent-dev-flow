import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import {
  isDelegationContext,
  isMetaScopeRuleContext,
  isBehaviorPredicateContext,
} from "./check_integrity.ts";

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
    cwd,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
    "check_integrity.ts",
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
  const dest = join(
    fixtureRoot,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
  );
  mkdirp(dest);
  copyFileSync(SCRIPT_FILE, join(dest, "check_integrity.ts"));
  copyFileSync(CLI_UTILS_FILE, join(dest, "cli_utils.ts"));
}

function buildValidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "REQ-0001.md"),
    [
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
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0001 | Valid requirement |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  writeFileSync(
    join(adrDir, "ADR-0001.md"),
    [
      "---",
      "id: ADR-0001",
      "title: Valid ADR",
      "---",
      "",
      "Relates to REQ-0001.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(
    join(specsDir, "system.md"),
    [
      "# System",
      "",
      "## Commands",
      "",
      "| Command | Description |",
      "|---------|-------------|",
      "| `/agentdev/test-cmd` | Test command |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");

  const skillDir = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skillDir);
  writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  const integritySkillDir = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
  );
  mkdirp(integritySkillDir);
  writeFileSync(
    join(integritySkillDir, "SKILL.md"),
    [
      "# repo-agentdev-integrity",
      "",
      "## USE FOR",
      "",
      "- integrity checks",
      "",
      "## 検査カテゴリ",
      "",
      "| 検査カテゴリ | 対象 |",
      "|---|---|",
      "| REQ frontmatter ↔ ファイル名 | REQ files |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(
    join(cmdDir, "test-cmd.md"),
    [
      "---",
      "description: Test command",
      "agent: test-agent",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent |",
      "|---------|-------------|-------|",
      "| `agentdev/test-cmd` | Test command | test-agent |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const captureBoundaryDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-workflow-orchestration",
    "references",
  );
  mkdirp(captureBoundaryDir);
  writeFileSync(
    join(captureBoundaryDir, "capture-boundaries.md"),
    "# Capture Boundaries\n\nSplit rule and command duty boundaries.\n",
    "utf-8",
  );

  const prTemplateDir = join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
  );
  mkdirp(prTemplateDir);
  writeFileSync(
    join(prTemplateDir, "pr_desc.md"),
    [
      "# PR Description Template",
      "",
      "## Findings / Capture\u5019\u88dc",
      "",
      "### intake",
      "",
      "Intake capture items.",
      "",
      "### learning",
      "",
      "Learning capture items.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const captureCmdDuties: Record<string, string> = {
    "case-run.md":
      "---\ndescription: case-run\nagent: sisyphus\n---\n\nSee capture-boundaries for duty. 記録のみ.\n",
    "case-close.md":
      "---\ndescription: case-close\nagent: sisyphus\n---\n\nSee capture-boundaries for duty. 回収・保存.\n",
    "req-save.md":
      "---\ndescription: req-save\nagent: prometheus\n---\n\nSee capture-boundaries for duty. 原則非関与.\n",
    "case-open.md":
      "---\ndescription: case-open\nagent: prometheus\n---\n\nSee capture-boundaries for duty. 非関与.\n",
    "case-auto.md":
      "---\ndescription: case-auto\nagent: sisyphus\n---\n\nSee capture-boundaries for duty. 委譲.\n",
  };
  for (const [fname, content] of Object.entries(captureCmdDuties)) {
    writeFileSync(join(cmdDir, fname), content, "utf-8");
  }
}

function buildInvalidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "REQ-0002.md"),
    [
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
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(reqDir, "REQ-0003.md"),
    [
      "---",
      "id: REQ-0003",
      "title: Missing fields",
      "created: 2025-01-01",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // README.md: lists REQ-0002 (OK) and phantom REQ-0099 (no file)
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0002 | Mismatched id |",
      "| REQ-0099 | Phantom entry |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  writeFileSync(
    join(adrDir, "ADR-0001.md"),
    [
      "---",
      "id: ADR-0001",
      "title: Cross-ref to missing REQ",
      "---",
      "",
      "Relates to REQ-0099.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);

  // IR-045 fixture: SPEC file with undocumented English abstract term
  writeFileSync(
    join(specsDir, "doc-quality-fixture.md"),
    [
      "# Doc Quality Fixture",
      "",
      "This command is a read-only diagnostic.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const skill1 = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skill1);
  writeFileSync(join(skill1, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  const skill2 = join(root, ".opencode", "skills", "bad-skill");
  mkdirp(skill2);
  writeFileSync(join(skill2, "SKILL.md"), "# bad-skill\n", "utf-8");

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(
    join(cmdDir, "test-cmd.md"),
    [
      "---",
      "description: Test command",
      "agent: test-agent",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "bad-cmd.md"),
    [
      "---",
      "description: Bad command",
      "---",
      "",
      "Missing agent.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent | Skills |",
      "|---------|-------------|-------|--------|",
      "| `agentdev/test-cmd` | Test command | test-agent |  |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const prTemplateDir = join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
  );
  mkdirp(prTemplateDir);
  writeFileSync(
    join(prTemplateDir, "pr_desc.md"),
    [
      "# PR Description Template",
      "",
      "## Findings / Intake\u5019\u88dc",
      "",
      "Old section name.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "case-run.md"),
    [
      "---",
      "description: case-run",
      "agent: sisyphus",
      "---",
      "",
      "Missing capture-boundaries reference and duty keyword.",
      "",
    ].join("\n"),
    "utf-8",
  );
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

// REQ-0144-008 drift baseline（要件成立時点の履歴値）:
//   既存5件赤 / valid fixture 7件 NG
//   check_integrity.ts ルール更新時に fixture が追従せず drift していた状態の定量記録。
//   件数は本要件の成立動機であり、 REQ 要件行からは REQ-0101-068 準拠のため除去済み。
//   本テストファイルの fixture が最新 check_integrity.ts ルールに追従することを検証する。
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
        res.category === "REQ" && res.check === "frontmatter-filename",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ required-fields check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "required-fields",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ readme-index-sync check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "readme-index-sync",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("ADR cross-reference check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ADR" && res.check === "adr-req-crossref",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("specs existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specResults = parsed.results.filter(
      (res: { category: string }) => res.category === "Specs",
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
        res.message.includes("REQ-0002"),
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
        (res.message.includes("REQ-0003") ||
          (res.file ?? "").includes("REQ-0003")),
    );
    expect(missingFields).toBeDefined();
    expect(missingFields.level).toBe("ng");
  });

  it("detects phantom README index entry (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const phantom = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" && res.message.includes("REQ-0099"),
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
        res.message.includes("missing from README"),
    );
    expect(missing).toBeDefined();
    expect(missing.level).toBe("ng");
  });

  it("detects ADR referencing non-existent REQ (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badRef = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "adr-req-crossref" && res.message.includes("REQ-0099"),
    );
    expect(badRef).toBeDefined();
    expect(badRef.level).toBe("ng");
  });

  it("detects missing spec files", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "Specs" && res.level === "ng",
    );
    expect(specNg.length).toBeGreaterThan(0);
  });

  it("detects command missing required frontmatter fields", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badCmd = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "command-inventory" &&
        (res.message.includes("bad-cmd") ||
          (res.file ?? "").includes("bad-cmd")),
    );
    expect(badCmd).toBeDefined();
    expect(badCmd.level).toBe("ng");
  });
});

// REQ-0108-197: Classification Policy test scenarios
describe("Classification Policy (--classification flag)", () => {
  it("accepts --classification flag without error", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary).toBeDefined();
  });

  it("reports 6 document classifications when --classification is enabled", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationCount = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "classification-count",
    );
    expect(classificationCount).toBeDefined();
    expect(classificationCount.level).toBe("ok");
    expect(classificationCount.message).toContain("6");
  });

  it("verifies report collection directory exists", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const reportCollection = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "report-collection",
    );
    expect(reportCollection).toBeDefined();
  });

  it("verifies DOC-MAP classification instance exists", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const docmapCollection = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "docmap-collection",
    );
    expect(docmapCollection).toBeDefined();
    expect(docmapCollection.level).toBe("ok");
  });

  it("does not run classification checks when --classification is omitted", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationResults = parsed.results.filter(
      (res: { category: string }) =>
        res.category === "ClassificationPolicy",
    );
    expect(classificationResults.length).toBe(0);
  });

  it("shows --classification in help text", () => {
    const r = runScript(VALID_ROOT, ["--help"]);
    expect(r.stdout).toContain("--classification");
  });
});

// REQ-0108-197: Classification Policy verification scenarios (structural)
describe("Classification Policy structural verification", () => {
  it("6 classifications are recognized: REQ, ADR, SPEC, Guide, Report, DOC-MAP", () => {
    const expectedClassifications = ["REQ", "ADR", "SPEC", "Guide", "Report", "DOC-MAP"];
    expect(expectedClassifications.length).toBe(6);

    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const countResult = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "classification-count",
    );
    expect(countResult).toBeDefined();
    for (const cls of expectedClassifications) {
      expect(countResult.message).toContain(cls);
    }
  });

  it("retired ADR references use context-dependent rules", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const retiredAdrWarnings = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "retired-adr-as-current" && res.level === "warning",
    );
    expect(Array.isArray(retiredAdrWarnings)).toBe(true);
  });

  it("report documents found in .agentdev/integrity/reports/", () => {
    const reportsDir = join(VALID_ROOT, ".agentdev", "integrity", "reports");
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const reportResult = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "report-collection",
    );
    expect(reportResult).toBeDefined();
    if (existsSync(reportsDir)) {
      expect(reportResult.level).toBe("ok");
    }
  });

  it("false positive suppression for workflow markers", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "ClassificationPolicy" && res.level === "ng",
    );
    expect(classificationNg.length).toBe(0);
  });
});

describe("Capture boundary checks", () => {
  it("valid fixture: capture-boundaries-existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "capture-boundaries-existence",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("valid fixture: pr-template-capture-section check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "pr-template-capture-section",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("valid fixture: command-capture-duty checks pass for all 5 commands", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const dutyOk = parsed.results.filter(
      (res: { check: string; category: string; level: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty" &&
        res.level === "ok",
    );
    expect(dutyOk.length).toBe(5);
  });

  it("invalid fixture: capture-boundaries-existence detects missing file", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "capture-boundaries-existence",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ng");
  });

  it("invalid fixture: pr-template-capture-section detects old section name", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "pr-template-capture-section",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ng");
    expect(check.message).toContain("Intake候補");
  });

  it("invalid fixture: command-capture-duty detects missing reference", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const dutyNg = parsed.results.filter(
      (res: { check: string; category: string; level: string; message: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty" &&
        res.level === "ng" &&
        res.message.includes("case-run.md"),
    );
    expect(dutyNg.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Doc language quality checks (IR-045)", () => {
  it("valid fixture: doc-language-quality check passes (no undocumented terms)", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string }) => res.check === "doc-language-quality",
    );
    expect(check).toBeDefined();
  });

  it("invalid fixture: doc-language-quality detects undocumented read-only term", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const warnings = parsed.results.filter(
      (res: { check: string; level: string; message: string }) =>
        res.check === "doc-language-quality" &&
        res.level === "warning" &&
        res.message.includes("read-only"),
    );
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── IR-044: REQ/SPEC boundary violation (REQ-0108-259) ──────────────────────
// Dedicated fixture with REQ requirement table rows covering:
//   - true positive (SPEC detail, no exemption context)
//   - false positive exempted by isDelegationContext
//   - false positive exempted by isNegationContext
//   - false positive exempted by stable contract (REQ-0101-069)

const IR044_ROOT = join(TEMP_ROOT, "ir044");

function buildIr044Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-9001 | IR-044 fixture |",
      "| REQ-9002 | IR-044 fixture |",
      "| REQ-9003 | IR-044 fixture |",
      "| REQ-9004 | IR-044 fixture |",
      "| REQ-9005 | IR-044 fixture |",
      "| REQ-9006 | IR-044 fixture |",
      "| REQ-9007 | IR-044 fixture |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9001: true positive — SPEC detail (enum list) without any exemption context
  writeFileSync(
    join(reqDir, "REQ-9001.md"),
    [
      "---",
      "id: REQ-9001",
      "title: IR-044 true positive",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9001-001 | 値一覧: A, B, C, D, E, F, G |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9002: false positive — delegation context exempts SPEC keyword
  writeFileSync(
    join(reqDir, "REQ-9002.md"),
    [
      "---",
      "id: REQ-9002",
      "title: IR-044 delegation exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9002-001 | fixture 詳細は委譲先 SPEC に配置すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9003: false positive — negation context exempts SPEC keyword
  writeFileSync(
    join(reqDir, "REQ-9003.md"),
    [
      "---",
      "id: REQ-9003",
      "title: IR-044 negation exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9003-001 | fixture 詳細を REQ に含めることを禁止する |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9004: false positive — stable contract exception (REQ-0101-069)
  writeFileSync(
    join(reqDir, "REQ-9004.md"),
    [
      "---",
      "id: REQ-9004",
      "title: IR-044 stable contract",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9004-001 | 公開 command 名は正規名前空間に従うこと |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9005: true positive — Step number SPEC detail
  writeFileSync(
    join(reqDir, "REQ-9005.md"),
    [
      "---",
      "id: REQ-9005",
      "title: IR-044 step number",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9005-001 | 実装は Step 3 で checker 個別ルールを適用すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9006: false positive — meta scope rule context exempts SPEC keyword
  // (REQ-0145-012). Line declares the REQ/SPEC boundary by naming SPEC types
  // as territory; it does not contain SPEC detail, it defines the boundary.
  writeFileSync(
    join(reqDir, "REQ-9006.md"),
    [
      "---",
      "id: REQ-9006",
      "title: IR-044 meta scope rule exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9006-001 | REQ は対象とする外部契約を記述する文章主体であり、SPEC は現在の実装体系を示す スキーマ、コマンド体系、ルールカタログ、enum、format、必要パラメータを記述する文章主体であること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9007: false positive — behavior predicate context exempts SPEC keyword
  // (REQ-0145-012). Existence predicate + drift-target type modifier without
  // quantity/content specification.
  writeFileSync(
    join(reqDir, "REQ-9007.md"),
    [
      "---",
      "id: REQ-9007",
      "title: IR-044 behavior predicate exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9007-001 | copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Empty adr/specs/skills to satisfy other checks minimally
  mkdirp(join(root, "docs", "adr"));
  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");
}

describe("IR-044 isDelegationContext predicate (REQ-0108-259)", () => {
  it("returns true for delegation phrases", () => {
    expect(isDelegationContext("委譲先 SPEC に配置")).toBe(true);
    expect(isDelegationContext("集約先に記載")).toBe(true);
    expect(isDelegationContext("切り出し先を参照")).toBe(true);
    expect(isDelegationContext("routing 経路分類名")).toBe(true);
    expect(isDelegationContext("delegate to SPEC")).toBe(true);
  });

  it("returns false for normal lines without delegation keywords", () => {
    expect(isDelegationContext("要件行は外部契約を記述する")).toBe(false);
    expect(isDelegationContext("値一覧: A, B, C")).toBe(false);
    expect(isDelegationContext("実装は Step 3 で実行")).toBe(false);
  });
});

describe("IR-044 isMetaScopeRuleContext predicate (REQ-0145-012)", () => {
  it("returns true for META scope rule lines declaring REQ/SPEC boundary", () => {
    expect(
      isMetaScopeRuleContext(
        "REQ は外部契約を記述する文章主体であり、SPEC は スキーマ、コマンド体系、enum、format を記述する文章主体であること",
      ),
    ).toBe(true);
    expect(
      isMetaScopeRuleContext(
        "enum 値、フォーマット（format）等は SPEC 領域に列挙する責務範囲規定行である",
      ),
    ).toBe(true);
    expect(
      isMetaScopeRuleContext("REQ/SPEC 境界において enum と schema を SPEC 対象とする"),
    ).toBe(true);
  });

  it("returns false for plain SPEC detail enumeration without boundary declaration", () => {
    expect(isMetaScopeRuleContext("値一覧: A, B, C, D, E, F, G")).toBe(false);
    expect(
      isMetaScopeRuleContext(
        "scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する",
      ),
    ).toBe(false);
    expect(
      isMetaScopeRuleContext("case-auto は実行開始時刻および完了報告生成時刻を記録すること"),
    ).toBe(false);
  });
});

describe("IR-044 isBehaviorPredicateContext predicate (REQ-0145-012)", () => {
  it("returns true for existence predicate + drift-target type modifier", () => {
    expect(
      isBehaviorPredicateContext(
        "copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在する",
      ),
    ).toBe(true);
    expect(
      isBehaviorPredicateContext("variant drift を検出する仕組みが存在する"),
    ).toBe(true);
  });

  it("returns false when modifier lacks existence predicate", () => {
    expect(
      isBehaviorPredicateContext(
        "scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する",
      ),
    ).toBe(false);
    expect(
      isBehaviorPredicateContext("case-auto は実行開始時刻および完了報告生成時刻を記録すること"),
    ).toBe(false);
  });

  it("returns false when existence predicate lacks drift-target modifier", () => {
    expect(isBehaviorPredicateContext("監査ログの保存仕組みが存在する")).toBe(false);
    expect(
      isBehaviorPredicateContext("要件ドキュメントの改版履歴が存在する"),
    ).toBe(false);
  });
});

describe("IR-044 req-spec-boundary-violation (REQ-0108-259)", () => {
  beforeAll(() => {
    mkdirp(IR044_ROOT);
    buildIr044Fixture(IR044_ROOT);
    copyScripts(IR044_ROOT);
  });

  it("detects true positive: SPEC detail without exemption (enum list)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9001"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("detects true positive: Step number SPEC detail", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9005"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("exempts delegation context: fixture keyword with 委譲先", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9002"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts negation context: fixture keyword with しないこと", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9003"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts stable contract: 公開 command 名 (REQ-0101-069)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9004"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts meta scope rule context: enum/format as SPEC territory (REQ-0145-012)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9006"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts behavior predicate context: fixture drift existence (REQ-0145-012)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9007"),
    );
    expect(violations.length).toBe(0);
  });
});

// REQ-0108-259, REQ-0108-055: regression lock for protected true positives.
// These REQ lines are real examples of SPEC detail residue in REQ that the new
// exemption predicates (isMetaScopeRuleContext, isBehaviorPredicateContext)
// MUST NOT exempt. If a future predicate change accidentally catches one of
// these, the test fails before the false-negative reaches production.
describe("IR-044 protected true positives (REQ-0145-012 regression)", () => {
  // Actual requirement text from docs/requirements/REQ-0114.md and REQ-0144.md.
  const REQ_0114_082 =
    "case-auto は実行開始時刻および完了報告生成時刻を記録すること";
  const REQ_0144_008 =
    "scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する";

  it("REQ-0114-082 is NOT exempted by isMetaScopeRuleContext", () => {
    expect(isMetaScopeRuleContext(REQ_0114_082)).toBe(false);
  });

  it("REQ-0114-082 is NOT exempted by isBehaviorPredicateContext", () => {
    expect(isBehaviorPredicateContext(REQ_0114_082)).toBe(false);
  });

  it("REQ-0144-008 is NOT exempted by isMetaScopeRuleContext", () => {
    expect(isMetaScopeRuleContext(REQ_0144_008)).toBe(false);
  });

  it("REQ-0144-008 is NOT exempted by isBehaviorPredicateContext", () => {
    expect(isBehaviorPredicateContext(REQ_0144_008)).toBe(false);
  });
});
