/**
 * Subprocess tests for lint_skills.ts.
 *
 * The script resolves its scan target via findRepoRoot(import.meta.dir), which
 * walks up from the script file looking for .opencode/. By copying the script
 * into <temp>/_scripts/ and creating fixture skills under <temp>/.opencode/skills/,
 * findRepoRoot resolves to our temp directory and scans only fixture skills.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPTS_DIR = import.meta.dir;
const TEMP_BASE = path.join("C:", "WINDOWS", "TEMP", "opencode");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface JsonReport {
  timestamp: string;
  script: string;
  scanned: Record<string, number>;
  summary: { ok: number; ng: number; warning: number; info: number };
  results: Array<{
    category: string;
    check: string;
    level: string;
    message: string;
    file?: string;
    evidence?: string;
  }>;
}

interface SkillFixture {
  name: string;
  content: string | null; // null = no SKILL.md
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTempDir(): string {
  if (!fs.existsSync(TEMP_BASE)) {
    fs.mkdirSync(TEMP_BASE, { recursive: true });
  }
  return fs.mkdtempSync(path.join(TEMP_BASE, "lint-skills-test-"));
}

function setupTempEnv(
  fixtures: SkillFixture[],
): { tempDir: string; scriptPath: string } {
  const tempDir = createTempDir();

  // Copy scripts to <temp>/_scripts/ so findRepoRoot walks up to <temp>/
  const scriptsDir = path.join(tempDir, "_scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  for (const f of fs.readdirSync(SCRIPTS_DIR)) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      fs.copyFileSync(path.join(SCRIPTS_DIR, f), path.join(scriptsDir, f));
    }
  }
  fs.mkdirSync(path.join(scriptsDir, "lib"), { recursive: true });
  for (const f of fs.readdirSync(path.join(SCRIPTS_DIR, "lib"))) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      fs.copyFileSync(path.join(SCRIPTS_DIR, "lib", f), path.join(scriptsDir, "lib", f));
    }
  }
  const scriptPath = path.join(scriptsDir, "lint_skills.ts");

  // Create .opencode/skills/ tree
  const skillsDir = path.join(tempDir, ".opencode", "skills");
  fs.mkdirSync(skillsDir, { recursive: true });

  for (const fixture of fixtures) {
    const skillDir = path.join(skillsDir, fixture.name);
    fs.mkdirSync(skillDir, { recursive: true });
    if (fixture.content !== null) {
      fs.writeFileSync(path.join(skillDir, "SKILL.md"), fixture.content);
    }
  }

  return { tempDir, scriptPath };
}

interface SrcEnvOptions {
  skills: SkillFixture[];
  commands: string[];
  referenceFiles?: Record<string, string>; // skillName -> file content under references/
  baselineEntries?: unknown[];
}

// AG-005 (Issue #2179) fixture environment: distribution SoT layout with
// src/opencode/skills fixtures and src/opencode/commands/agentdev command
// stubs (workflow trigger binding source). The projection .opencode/skills
// stays empty so the main scan falls back to src (same sentinel rule as the
// worktree junction-absent case).
function setupSrcEnv(
  options: SrcEnvOptions,
): { tempDir: string; scriptPath: string } {
  const tempDir = createTempDir();

  const scriptsDir = path.join(tempDir, "_scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  for (const f of fs.readdirSync(SCRIPTS_DIR)) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      fs.copyFileSync(path.join(SCRIPTS_DIR, f), path.join(scriptsDir, f));
    }
  }
  fs.mkdirSync(path.join(scriptsDir, "lib"), { recursive: true });
  for (const f of fs.readdirSync(path.join(SCRIPTS_DIR, "lib"))) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      fs.copyFileSync(path.join(SCRIPTS_DIR, "lib", f), path.join(scriptsDir, "lib", f));
    }
  }
  const scriptPath = path.join(scriptsDir, "lint_skills.ts");

  fs.mkdirSync(path.join(tempDir, ".opencode", "skills"), { recursive: true });

  const srcSkillsDir = path.join(tempDir, "src", "opencode", "skills");
  for (const fixture of options.skills) {
    const skillDir = path.join(srcSkillsDir, fixture.name);
    fs.mkdirSync(skillDir, { recursive: true });
    if (fixture.content !== null) {
      fs.writeFileSync(path.join(skillDir, "SKILL.md"), fixture.content);
    }
  }
  for (const [skillName, contents] of Object.entries(options.referenceFiles ?? {})) {
    const refsDir = path.join(srcSkillsDir, skillName, "references");
    fs.mkdirSync(refsDir, { recursive: true });
    fs.writeFileSync(path.join(refsDir, "big.md"), contents);
  }

  const cmdDir = path.join(tempDir, "src", "opencode", "commands", "agentdev");
  fs.mkdirSync(cmdDir, { recursive: true });
  for (const cmd of options.commands) {
    fs.writeFileSync(path.join(cmdDir, `${cmd}.md`), `# ${cmd}\n`);
  }

  if (options.baselineEntries) {
    const baselineDir = path.join(
      tempDir,
      ".opencode",
      "skills",
      "repo-agentdev-integrity",
      "baselines",
    );
    fs.mkdirSync(baselineDir, { recursive: true });
    fs.writeFileSync(
      path.join(baselineDir, "lint-skills-baseline.json"),
      JSON.stringify(
        {
          version: 1,
          rule_id: "LINT-SKILLS-NG-BASELINE",
          generated_at: "2026-08-16",
          entries: options.baselineEntries,
        },
        null,
        2,
      ),
    );
  }

  return { tempDir, scriptPath };
}

async function runScript(
  scriptPath: string,
  args: string[] = [],
): Promise<RunResult> {
  const proc = Bun.spawn(["bun", "run", scriptPath, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr };
}

// ---------------------------------------------------------------------------
// Fixture content
// ---------------------------------------------------------------------------
// AG-002 (RU-0018 層2): USE FOR / DO NOT USE FOR triggers live in the
// frontmatter description only. Fixture bodies must NOT keep `## USE FOR`
// sections, otherwise the AG-005 double-keeping rule fires.

const VALID_SKILL_MD = `\
---
name: agentdev-test-valid
description: A valid test skill. USE FOR: testing the lint script. DO NOT USE FOR: production use.
---

## See Also
`;

const MISMATCH_SKILL_MD = `\
---
name: agentdev-wrong-name
description: A skill with mismatched name. USE FOR: testing name mismatches. DO NOT USE FOR: production use.
---

## See Also
`;

const NO_SECTIONS_SKILL_MD = `\
---
name: agentdev-test-nosections
description: A skill missing required sections
---

Some content without required section headings.

## See Also
`;

function makeBloatedMd(): string {
  const lines: string[] = [
    "---",
    "name: agentdev-test-bloated",
    "description: A bloated skill for testing. USE FOR: bloat detection. DO NOT USE FOR: production.",
    "---",
    "",
    "## See Also",
    "",
  ];
  while (lines.length <= 510) {
    lines.push(`Line ${lines.length}: padding content for bloat test.`);
  }
  return lines.join("\n");
}

const NO_PREFIX_SKILL_MD = `\
---
name: test-no-prefix
description: A skill without agentdev prefix. USE FOR: testing prefix detection. DO NOT USE FOR: production use.
---

## See Also
`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("lint_skills.ts", () => {
  const tempDirs: string[] = [];

  let validEnv: { tempDir: string; scriptPath: string };
  let issueEnv: { tempDir: string; scriptPath: string };

  beforeAll(() => {
    // Environment with a single valid skill → exit 0
    validEnv = setupTempEnv([
      { name: "agentdev-test-valid", content: VALID_SKILL_MD },
    ]);
    tempDirs.push(validEnv.tempDir);

    // Environment with problematic fixtures → exit 1
    issueEnv = setupTempEnv([
      { name: "agentdev-test-no-md", content: null },
      { name: "agentdev-test-mismatch", content: MISMATCH_SKILL_MD },
      { name: "agentdev-test-nosections", content: NO_SECTIONS_SKILL_MD },
      { name: "agentdev-test-bloated", content: makeBloatedMd() },
      { name: "test-no-prefix", content: NO_PREFIX_SKILL_MD },
    ]);
    tempDirs.push(issueEnv.tempDir);
  });

  afterAll(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // ----- Flag tests -------------------------------------------------------

  describe("--help flag", () => {
    it("exits with code 0", async () => {
      const result = await runScript(validEnv.scriptPath, ["--help"]);
      expect(result.exitCode).toBe(0);
    });

    it("outputs help text containing script name, USAGE, and flags", async () => {
      const result = await runScript(validEnv.scriptPath, ["--help"]);
      expect(result.stdout).toContain("lint_skills.ts");
      expect(result.stdout).toContain("USAGE");
      expect(result.stdout).toContain("--help");
      expect(result.stdout).toContain("--json");
      expect(result.stdout).toContain("--dry-run");
    });
  });

  describe("--dry-run flag", () => {
    it("exits with code 0", async () => {
      const result = await runScript(validEnv.scriptPath, ["--dry-run"]);
      expect(result.exitCode).toBe(0);
    });

    it("lists skills that would be checked", async () => {
      const result = await runScript(validEnv.scriptPath, ["--dry-run"]);
      expect(result.stdout).toContain("Skills to be checked");
      expect(result.stdout).toContain("agentdev-test-valid");
    });
  });

  describe("--json flag", () => {
    it("outputs valid JSON with expected structure", async () => {
      const result = await runScript(validEnv.scriptPath, ["--json"]);
      expect(result.exitCode).toBe(0);

      const report: JsonReport = JSON.parse(result.stdout);
      expect(report.script).toBe("lint_skills.ts");
      expect(report.summary).toBeDefined();
      expect(report.results).toBeInstanceOf(Array);
      expect(typeof report.summary.ok).toBe("number");
    });
  });

  // ----- Valid skill -------------------------------------------------------

  describe("valid skill directory", () => {
    it("produces all OK results and exits 0", async () => {
      const result = await runScript(validEnv.scriptPath, ["--json"]);
      expect(result.exitCode).toBe(0);

      const report: JsonReport = JSON.parse(result.stdout);
      const skillResults = report.results.filter(
        (r) =>
          r.file === "agentdev-test-valid" ||
          r.message.includes("agentdev-test-valid"),
      );
      expect(skillResults.length).toBeGreaterThan(0);

      for (const r of skillResults) {
        expect(r.level).toBe("ok");
      }
    });
  });

  // ----- Issue detection ---------------------------------------------------

  describe("missing SKILL.md", () => {
    it("detects NG for SKILL.md existence", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "SKILL.md existence" &&
          r.file === "agentdev-test-no-md",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("ng");
    });
  });

  describe("name mismatch between directory and frontmatter", () => {
    it("detects warning for directory vs frontmatter name", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "Directory naming vs frontmatter name" &&
          r.file === "agentdev-test-mismatch",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("warning");
      expect(found[0].message).toContain("does not match");
    });
  });

  describe("missing required sections", () => {
    it("detects warning for missing USE FOR trigger", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "USE FOR trigger" &&
          r.file === "agentdev-test-nosections",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("warning");
    });

    it("detects warning for missing DO NOT USE FOR trigger", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "DO NOT USE FOR trigger" &&
          r.file === "agentdev-test-nosections",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("warning");
    });
  });

  describe("bloated SKILL.md (>500 lines)", () => {
    it("detects warning for files exceeding 500 lines", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "SKILL.md bloat" &&
          r.file === "agentdev-test-bloated",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("warning");
      expect(found[0].message).toContain("exceeds 500");
    });
  });

  describe("skill without agentdev- prefix", () => {
    it("reports info level for unprefixed skill", async () => {
      const result = await runScript(issueEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) =>
          r.check === "agentdev- prefix" && r.file === "test-no-prefix",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("info");
      expect(found[0].message).toContain("does not use agentdev- prefix");
    });
  });

  // ----- src/ fallback (REQ-018-001: worktree junction 未設定環境) ------------

  describe("src/ fallback when projection lacks distributed skills", () => {
    let fallbackEnv: { tempDir: string; scriptPath: string };

    beforeAll(() => {
      // worktree 環境の模倣: projection に sentinel が無く（junction 未伝播）、
      // src/opencode/skills に配布スキルがある。scanner は src/ へ fallback する。
      fallbackEnv = setupTempEnv([
        { name: "agentdev-projection-only", content: VALID_SKILL_MD },
      ]);
      const srcSkillsDir = path.join(
        fallbackEnv.tempDir,
        "src",
        "opencode",
        "skills",
      );
      const srcSkillDir = path.join(srcSkillsDir, "agentdev-src-skill");
      fs.mkdirSync(srcSkillDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcSkillDir, "SKILL.md"),
        VALID_SKILL_MD.replace(/agentdev-test-valid/g, "agentdev-src-skill"),
      );
      tempDirs.push(fallbackEnv.tempDir);
    });

    it("scans src/opencode/skills when projection lacks the sentinel skill", async () => {
      const result = await runScript(fallbackEnv.scriptPath, ["--dry-run"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("agentdev-src-skill");
    });

    it("does not scan projection-only fixtures when src fallback is active", async () => {
      const result = await runScript(fallbackEnv.scriptPath, ["--dry-run"]);
      expect(result.stdout).not.toContain("agentdev-projection-only");
    });

    it("scans projection fixtures when neither sentinel nor src exists (fixture env)", async () => {
      const result = await runScript(validEnv.scriptPath, ["--dry-run"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("agentdev-test-valid");
    });
  });

  // ----- AG-005 (RU-0018 / Issue #2179): skill 記述基準 層1〜2 -----

  describe("AG-005 rule detection", () => {
    const INTERNAL_ID_SAMPLE = ["REQ", "101"].join("-");
    let agEnv: { tempDir: string; scriptPath: string };

    function skillMd(name: string, description: string, body = "## See Also\n"): string {
      return `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}`;
    }

    function bigMd(lineCount: number, toc: boolean): string {
      const lines: string[] = [];
      if (toc) {
        lines.push("## 目次", "", "- section one", "- section two", "");
      }
      lines.push("## section one", "");
      while (lines.length <= lineCount) {
        lines.push(`padding line ${lines.length}`);
      }
      return lines.join("\n");
    }

    beforeAll(() => {
      // 各 description は 600 未満に保ちつつ合計を 350*9=3150 超（avg>350）にして
      // aggregate budget warn を確実に発火させる。
      const pad = (n: number) => "p".repeat(n);
      agEnv = setupSrcEnv({
        skills: [
          {
            name: "agentdev-ag-ok",
            content: skillMd(
              "agentdev-ag-ok",
              `An ok skill. USE FOR: ag005 tests. DO NOT USE FOR: other purposes. ${pad(430)}`,
            ),
          },
          {
            name: "agentdev-ag-long600",
            content: skillMd(
              "agentdev-ag-long600",
              `Over 600 chars. USE FOR: tests. DO NOT USE FOR: other. ${pad(660)}`,
            ),
          },
          {
            name: "agentdev-ag-long1024",
            content: skillMd(
              "agentdev-ag-long1024",
              `Over 1024 chars. USE FOR: tests. DO NOT USE FOR: other. ${pad(1080)}`,
            ),
          },
          {
            name: "agentdev-ag-marker",
            content: skillMd(
              "agentdev-ag-marker",
              `Mentions soft guard in description. USE FOR: tests. DO NOT USE FOR: other. ${pad(430)}`,
            ),
          },
          {
            name: "agentdev-ag-id",
            content: skillMd(
              "agentdev-ag-id",
              `References internal ID ${INTERNAL_ID_SAMPLE} in description. USE FOR: tests. DO NOT USE FOR: other. ${pad(430)}`,
            ),
          },
          {
            name: "agentdev-ag-double",
            content: skillMd(
              "agentdev-ag-double",
              `Double keeping skill. USE FOR: tests. DO NOT USE FOR: other. ${pad(430)}`,
              "## USE FOR\n\n- duplicated in body\n\n## DO NOT USE FOR\n\n- duplicated\n",
            ),
          },
          {
            name: "agentdev-workflow-wfmissing",
            content: skillMd(
              "agentdev-workflow-wfmissing",
              `Workflow skill without the trigger item. USE FOR: tests. DO NOT USE FOR: standalone use. ${pad(430)}`,
            ),
          },
          {
            name: "agentdev-workflow-wfpresent",
            content: skillMd(
              "agentdev-workflow-wfpresent",
              `Workflow skill with the trigger item 単独起動（対応する /agentdev/* コマンド経由で利用すること）. USE FOR: tests. DO NOT USE FOR: standalone use. ${pad(400)}`,
            ),
          },
          {
            name: "agentdev-ag-toc",
            content: skillMd(
              "agentdev-ag-toc",
              `References owner skill. USE FOR: tests. DO NOT USE FOR: other. ${pad(430)}`,
            ),
          },
        ],
        commands: ["wfmissing", "wfpresent"],
        // agentdev-ag-toc gets two reference files: one without TOC (NG) and
        // one with a TOC heading (OK). setupSrcEnv maps one file per skill, so
        // the no-TOC file is registered here and the TOC file is written below.
        referenceFiles: {
          "agentdev-ag-toc": bigMd(310, false),
        },
      });
      const tocRefDir = path.join(
        agEnv.tempDir,
        "src",
        "opencode",
        "skills",
        "agentdev-ag-toc",
        "references",
      );
      fs.writeFileSync(path.join(tocRefDir, "with-toc.md"), bigMd(310, true));
    });

    it("detects description length 600 and 1024 as separate hard rules", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const over600 = report.results.filter(
        (r) => r.check === "description length 600" && r.level === "ng",
      );
      const over1024 = report.results.filter(
        (r) => r.check === "description length 1024" && r.level === "ng",
      );
      expect(over600.length).toBe(1);
      expect(over600[0].file).toBe("agentdev-ag-long600");
      expect(over600[0].evidence).toContain("chars");
      expect(over1024.length).toBe(1);
      expect(over1024[0].file).toBe("agentdev-ag-long1024");
      expect(over1024[0].evidence).toContain("chars");

      const okLen = report.results.filter(
        (r) => r.check === "description length 600" && r.level === "ok",
      );
      expect(okLen.length).toBe(7); // ok + marker + id + double + wfmissing + wfpresent + toc
    });

    it("detects soft guard marker word in description", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "description marker word",
      );
      expect(found.length).toBe(9); // 1 ng + 8 ok
      const ng = found.filter((r) => r.level === "ng");
      expect(ng.length).toBe(1);
      expect(ng[0].file).toBe("agentdev-ag-marker");
      expect(ng[0].evidence).toBe("soft guard");
    });

    it("detects internal ID in description", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "description internal ID",
      );
      const ng = found.filter((r) => r.level === "ng");
      expect(ng.length).toBe(1);
      expect(ng[0].file).toBe("agentdev-ag-id");
      expect(ng[0].evidence).toContain(INTERNAL_ID_SAMPLE);
    });

    it("detects USE FOR double keeping between description and body", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "USE FOR double keeping",
      );
      const ng = found.filter((r) => r.level === "ng");
      expect(ng.length).toBe(1);
      expect(ng[0].file).toBe("agentdev-ag-double");
      expect(ng[0].message).toContain("## USE FOR");
      expect(ng[0].message).toContain("## DO NOT USE FOR");
    });

    it("affirmatively checks the workflow trigger item for command-bound Workflow Skills only", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "workflow trigger item",
      );
      expect(found.length).toBe(2); // only wfmissing / wfpresent are command-bound
      const ng = found.filter((r) => r.level === "ng");
      expect(ng.length).toBe(1);
      expect(ng[0].file).toBe("agentdev-workflow-wfmissing");
      const okResult = found.find((r) => r.level === "ok");
      expect(okResult?.file).toBe("agentdev-workflow-wfpresent");
    });

    it("detects references over 300 lines without a TOC and accepts ones with a TOC", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "references TOC",
      );
      expect(found.length).toBe(2);
      const ng = found.filter((r) => r.level === "ng");
      expect(ng.length).toBe(1);
      expect(ng[0].file).toBe("agentdev-ag-toc/references/big.md");
      const okResult = found.find((r) => r.level === "ok");
      expect(okResult?.file).toBe("agentdev-ag-toc/references/with-toc.md");
    });

    it("records the aggregate budget warn and continues processing", async () => {
      const result = await runScript(agEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const found = report.results.filter(
        (r) => r.check === "description aggregate budget",
      );
      expect(found.length).toBe(1);
      expect(found[0].level).toBe("warning");
      expect(found[0].message).toContain("N=9");
      expect(found[0].message).toContain("350*9");
      expect(report.summary).toBeDefined();
      expect(result.exitCode).toBe(1);
    });

    it("emits ok results for a fully compliant environment", async () => {
      const cleanEnv = setupSrcEnv({
        skills: [
          {
            name: "agentdev-ag-clean",
            content: skillMd(
              "agentdev-ag-clean",
              "A clean skill. USE FOR: tests. DO NOT USE FOR: other.",
            ),
          },
        ],
        commands: [],
      });
      try {
        const result = await runScript(cleanEnv.scriptPath, ["--json"]);
        expect(result.exitCode).toBe(0);
        const report: JsonReport = JSON.parse(result.stdout);
        const ag005 = report.results.filter((r) => r.category === "AG-005");
        expect(ag005.length).toBeGreaterThan(0);
        for (const r of ag005) {
          expect(r.level).toBe("ok");
        }
      } finally {
        fs.rmSync(cleanEnv.tempDir, { recursive: true, force: true });
      }
    });
  });

  describe("AG-005 baseline demotion (grandfathering)", () => {
    let baselineEnv: { tempDir: string; scriptPath: string };

    const baselineFixtureSkill = `---\nname: agentdev-ag-baselined\ndescription: Over 600 chars baselined. USE FOR: tests. DO NOT USE FOR: other. ${"z".repeat(620)}\n---\n\n## See Also\n`;
    const baselineFixtureNewViolation = `---\nname: agentdev-ag-newviol\ndescription: Clean length. USE FOR: tests. DO NOT USE FOR: other.\n---\n\n## USE FOR\n\n- duplicated\n`;

    beforeAll(() => {
      baselineEnv = setupSrcEnv({
        skills: [
          { name: "agentdev-ag-baselined", content: baselineFixtureSkill },
          { name: "agentdev-ag-newviol", content: baselineFixtureNewViolation },
        ],
        commands: [],
        baselineEntries: [
          {
            check: "description length 600",
            file: "agentdev-ag-baselined",
            count: 1,
            provenance: "test-provenance",
            reason: "test fixture entry",
          },
        ],
      });
    });

    it("demotes baseline-known ng to info with a provenance tag and keeps new violations as ng", async () => {
      const result = await runScript(baselineEnv.scriptPath, ["--json"]);
      const report: JsonReport = JSON.parse(result.stdout);

      const baselined = report.results.filter(
        (r) =>
          r.check === "description length 600" &&
          r.file === "agentdev-ag-baselined",
      );
      expect(baselined.length).toBe(1);
      expect(baselined[0].level).toBe("info");
      expect(baselined[0].message).toContain(
        "[baseline-known provenance=test-provenance]",
      );

      const newViol = report.results.filter(
        (r) =>
          r.check === "USE FOR double keeping" &&
          r.file === "agentdev-ag-newviol",
      );
      expect(newViol.length).toBe(1);
      expect(newViol[0].level).toBe("ng");
      expect(result.exitCode).toBe(1);
    });

    it("exits 0 when every finding is baseline-known", async () => {
      const allBaselinedEnv = setupSrcEnv({
        skills: [
          { name: "agentdev-ag-baselined", content: baselineFixtureSkill },
        ],
        commands: [],
        baselineEntries: [
          {
            check: "description length 600",
            file: "agentdev-ag-baselined",
            count: 1,
            provenance: "test-provenance",
            reason: "test fixture entry",
          },
          {
            check: "description aggregate budget",
            file: null,
            count: 1,
            provenance: "test-provenance",
            reason: "test fixture entry (single 676-char description exceeds 350*1)",
          },
        ],
      });
      try {
        const result = await runScript(allBaselinedEnv.scriptPath, ["--json"]);
        expect(result.exitCode).toBe(0);
        const report: JsonReport = JSON.parse(result.stdout);
        expect(report.summary.ng).toBe(0);
        expect(report.summary.warning).toBe(0);
      } finally {
        fs.rmSync(allBaselinedEnv.tempDir, { recursive: true, force: true });
      }
    });

    it("keeps a same-check violation in a non-baselined file as ng (delta-aware)", async () => {
      // baseline covers only agentdev-ag-baselined for check "description
      // length 600"; a second 600-over file outside the baseline must stay ng
      // (delta-aware semantics mirror check_integrity.ts: grandfathering must
      // not hide NEW violations)
      const deltaEnv = setupSrcEnv({
        skills: [
          {
            name: "agentdev-ag-baselined",
            content: `---\nname: agentdev-ag-baselined\ndescription: A. USE FOR: t. DO NOT USE FOR: o. ${"z".repeat(620)}\n---\n\n## See Also\n`,
          },
          {
            name: "agentdev-ag-second",
            content: `---\nname: agentdev-ag-second\ndescription: B. USE FOR: t. DO NOT USE FOR: o. ${"w".repeat(640)}\n---\n\n## See Also\n`,
          },
        ],
        commands: [],
        baselineEntries: [
          {
            check: "description length 600",
            file: "agentdev-ag-baselined",
            count: 1,
            provenance: "test-provenance",
            reason: "per-file grandfather entry",
          },
        ],
      });
      try {
        const result = await runScript(deltaEnv.scriptPath, ["--json"]);
        expect(result.exitCode).toBe(1);
        const report: JsonReport = JSON.parse(result.stdout);
        const ng = report.results.filter(
          (r) => r.check === "description length 600" && r.level === "ng",
        );
        expect(ng.length).toBe(1);
        expect(ng[0].file).toBe("agentdev-ag-second");
        const info = report.results.filter(
          (r) => r.check === "description length 600" && r.level === "info",
        );
        expect(info.length).toBe(1);
        expect(info[0].file).toBe("agentdev-ag-baselined");
      } finally {
        fs.rmSync(deltaEnv.tempDir, { recursive: true, force: true });
      }
    });
  });
});
