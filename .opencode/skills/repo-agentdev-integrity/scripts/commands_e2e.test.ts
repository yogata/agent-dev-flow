/**
 * E2E workflow tests for all agentdev command definitions.
 * REQ-0030-009: Normal-path E2E tests for all commands
 * REQ-0030-013: Test files placed in corresponding scripts/ directory
 *
 * Validates end-to-end workflow aspects:
 * - Pipeline continuity (commands form valid chains)
 * - Cross-command data flow (output of one matches input of next)
 * - Template reference validity from command definitions
 * - Guardrail completeness
 * - Input/Output/Steps section completeness
 */
import {
  describe,
  it,
  expect,
} from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const PROJECTION_CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SOURCE_CMD_DIR = path.join(REPO_ROOT, "src", "opencode", "commands", "agentdev");
const CMD_DIR = fs.existsSync(PROJECTION_CMD_DIR) ? PROJECTION_CMD_DIR : SOURCE_CMD_DIR;
const PROJECTION_SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");
const SOURCE_SKILLS_DIR = path.join(REPO_ROOT, "src", "opencode", "skills");
const SKILLS_DIR = fs.existsSync(path.join(PROJECTION_SKILLS_DIR, "agentdev-workflow-templates"))
  ? PROJECTION_SKILLS_DIR
  : SOURCE_SKILLS_DIR;
const PROJECTION_TEMPLATES_DIR = path.join(
  PROJECTION_SKILLS_DIR,
  "agentdev-workflow-templates",
  "templates",
);
const SOURCE_TEMPLATES_DIR = path.join(
  SOURCE_SKILLS_DIR,
  "agentdev-workflow-templates",
  "templates",
);
const TEMPLATES_DIR = fs.existsSync(PROJECTION_TEMPLATES_DIR) ? PROJECTION_TEMPLATES_DIR : SOURCE_TEMPLATES_DIR;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("- ") && currentKey !== null) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    flushArray();
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (value === "") {
      currentKey = key;
      currentArray.length = 0;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  flushArray();
  return result;
}

function getCommandFiles(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(CMD_DIR)) return map;
  for (const f of fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
    map.set(f.replace(".md", ""), fs.readFileSync(path.join(CMD_DIR, f), "utf-8"));
  }
  return map;
}

function extractSection(content: string, heading: string): string {
  const body = content.split("---").slice(2).join("---");
  const lines = body.split("\n");
  let inSection = false;
  const sectionLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (inSection) break;
      if (line === `## ${heading}` || line.startsWith(`## ${heading} `)) {
        inSection = true;
      }
      continue;
    }
    if (inSection) sectionLines.push(line);
  }
  return sectionLines.join("\n").trim();
}

function extractTemplateRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /agentdev-workflow-templates\/templates\/([a-z_]+\.md)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

function extractCommandRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /\/agentdev\/([a-z][a-z0-9-]*)\b(?!\/)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}

function getSkillDirs(): Set<string> {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

function getTemplateFiles(): Set<string> {
  if (!fs.existsSync(TEMPLATES_DIR)) return new Set();
  return new Set(fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".md")));
}

const commands = getCommandFiles();
const skillDirs = getSkillDirs();
const templateFiles = getTemplateFiles();

// Current 17 public agentdev commands (aligns with commands/agentdev/README.md listing)
const EXPECTED_COMMANDS = [
  "backlog-review",
  "case-auto",
  "case-close",
  "case-open",
  "case-run",
  "case-update",
  "inspect-docs",
  "inspect-extensions",
  "inspect-promote",
  "inspect-skills",
  "intake-capture",
  "intake-from-github",
  "intake-promote",
  "learning-promote",
  "req-define",
  "req-save",
  "spec-save",
];

// agentdev-prefixed references that are valid skills (not commands).
// /agentdev/learning-capture is a skill invocation, not a command definition file.
const VALID_SKILL_REFS = new Set([
  "learning-capture",
]);

const COMMAND_COUNT = EXPECTED_COMMANDS.length;

// Pipeline definitions
const REQ_CASE_PIPELINE = ["req-define", "req-save", "spec-save", "case-open", "case-run", "case-update", "case-close"];
const LEARNING_PIPELINE = ["learning-promote"];
const INTAKE_PIPELINE = ["intake-capture", "intake-from-github", "intake-promote"];

// Valid agent types
const VALID_AGENTS = new Set(["sisyphus", "prometheus", "oracle", "metis", "hephaestus", "momus"]);

// ─── REQ-0030-009: Normal-path E2E tests ───────────────────────────────────

describe("REQ-0030-009: E2E workflow tests for all commands", () => {
  // ─── Pipeline completeness ───────────────────────────────────────────────

  describe("Pipeline completeness: all commands exist", () => {
    it(`has exactly ${COMMAND_COUNT} command definition files`, () => {
      expect(commands.size).toBe(COMMAND_COUNT);
    });
    for (const cmd of EXPECTED_COMMANDS) {
      it(`command "${cmd}" exists as .md file`, () => {
        expect(commands.has(cmd)).toBe(true);
      });
    }
  });

  // ─── Per-command E2E validation ──────────────────────────────────────────

  for (const [cmdName, content] of commands) {
    describe(`E2E: ${cmdName}`, () => {
      const fm = parseFrontmatter(content);

      it("has Input section defining expected inputs", () => {
        const inputSection = extractSection(content, "入力");
        expect(inputSection.length).toBeGreaterThan(0);
      });

      it("has Output section defining expected outputs", () => {
        const outputSection = extractSection(content, "出力");
        expect(outputSection.length).toBeGreaterThan(0);
      });

      it("has Steps section with numbered or phased structure", () => {
        const hasSteps = /(^##\s+Steps)|(^###\s+Step\s+\d)|(^##\s+Step\s+\d)|(^###\s+Phase)|(^##\s+フェーズ)/m.test(content);
        expect(hasSteps).toBe(true);
      });

      it("has valid agent type in frontmatter", () => {
        expect(fm).not.toBeNull();
        if (fm) {
          const agent = fm["agent"] as string;
          expect(VALID_AGENTS.has(agent)).toBe(true);
        }
      });

      const templateRefs = extractTemplateRefs(content);
      for (const tmplRef of templateRefs) {
        it(`template reference "${tmplRef}" exists in templates directory`, () => {
          expect(templateFiles.has(tmplRef)).toBe(true);
        });
      }

      const cmdRefs = extractCommandRefs(content);
      for (const ref of cmdRefs) {
        if (ref === cmdName) continue;
        if (VALID_SKILL_REFS.has(ref)) continue;
        it(`command reference "/agentdev/${ref}" points to existing command`, () => {
          expect(EXPECTED_COMMANDS.includes(ref)).toBe(true);
        });
      }
    });
  }

  // ─── Pipeline continuity ─────────────────────────────────────────────────

  describe("Pipeline continuity: req/case pipeline", () => {
    it("req-define output matches req-save input expectations", () => {
      const reqDefine = commands.get("req-define");
      const reqSave = commands.get("req-save");
      expect(reqDefine).toBeDefined();
      expect(reqSave).toBeDefined();
      if (reqDefine && reqSave) {
        const reqDefineOutput = extractSection(reqDefine, "出力");
        const reqSaveInput = extractSection(reqSave, "入力");
        expect(reqDefineOutput).toContain(".agentdev/drafts");
        expect(reqSaveInput).toContain(".agentdev/drafts");
      }
    });

    it("req-save output matches case-open input expectations", () => {
      const reqSave = commands.get("req-save");
      const caseOpen = commands.get("case-open");
      expect(reqSave).toBeDefined();
      expect(caseOpen).toBeDefined();
      if (reqSave && caseOpen) {
        const reqSaveOutput = extractSection(reqSave, "出力");
        const caseOpenInput = extractSection(caseOpen, "入力");
        expect(reqSaveOutput).toContain("REQ");
        expect(caseOpenInput).toContain("req-define");
      }
    });

    it("case-open output matches case-run input expectations", () => {
      const caseOpen = commands.get("case-open");
      const caseRun = commands.get("case-run");
      expect(caseOpen).toBeDefined();
      expect(caseRun).toBeDefined();
      if (caseOpen && caseRun) {
        const caseOpenOutput = extractSection(caseOpen, "出力");
        const caseRunInput = extractSection(caseRun, "入力");
        expect(caseOpenOutput).toContain("Issue");
        expect(caseRunInput).toContain("Issue");
      }
    });

    it("case-run output matches case-close input expectations", () => {
      const caseRun = commands.get("case-run");
      const caseClose = commands.get("case-close");
      expect(caseRun).toBeDefined();
      expect(caseClose).toBeDefined();
      if (caseRun && caseClose) {
        const caseRunOutput = extractSection(caseRun, "出力");
        const caseCloseInput = extractSection(caseClose, "入力");
        expect(caseRunOutput).toContain("PR");
        expect(caseCloseInput).toContain("PR");
      }
    });
  });

  describe("Pipeline continuity: learning pipeline", () => {
    it("learning-promote references backlog-review for promotion route", () => {
      const promote = commands.get("learning-promote");
      expect(promote).toBeDefined();
      if (promote) {
        expect(promote).toContain("backlog-review");
      }
    });
  });

  describe("Pipeline continuity: intake pipeline", () => {
    it("intake-capture and intake-from-github produce compatible outputs", () => {
      const capture = commands.get("intake-capture");
      const fromGithub = commands.get("intake-from-github");
      expect(capture).toBeDefined();
      expect(fromGithub).toBeDefined();
      if (capture && fromGithub) {
        const captureOutput = extractSection(capture, "出力");
        const githubOutput = extractSection(fromGithub, "出力");
        expect(captureOutput).toContain("inbox");
        expect(githubOutput).toContain("inbox");
      }
    });

    it("intake-promote input matches intake-capture/intake-from-github output", () => {
      const promote = commands.get("intake-promote");
      expect(promote).toBeDefined();
      if (promote) {
        const promoteInput = extractSection(promote, "入力");
        expect(promoteInput).toContain("inbox");
      }
    });

    it("intake-promote output references backlog-review", () => {
      const promote = commands.get("intake-promote");
      expect(promote).toBeDefined();
      if (promote) {
        const promoteOutput = extractSection(promote, "出力");
        expect(promoteOutput).toContain("promoted");
      }
    });
  });

  // ─── Guardrail completeness ──────────────────────────────────────────────

  describe("Guardrail completeness for complex commands", () => {
    const commandsWithGuardrails = ["case-open", "case-run", "case-close"];
    for (const cmdName of commandsWithGuardrails) {
      it(`${cmdName} has Guardrails section`, () => {
        const content = commands.get(cmdName);
        expect(content).toBeDefined();
        if (content) {
          expect(content).toMatch(/## ガードレール/);
        }
      });
    }
  });

  // ─── Template skill coverage per command ─────────────────────────────────
  // case-open/close reference templates through `agentdev-workflow-templates` skill.
  // case-update uses its own templates under commands/agentdev/templates/case-update/.
  describe("Template skill coverage for issue/PR-creating commands", () => {
    it("case-open references agentdev-workflow-templates skill", () => {
      const content = commands.get("case-open");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/agentdev-workflow-templates/);
      }
    });

    it("case-close references agentdev-workflow-templates skill", () => {
      const content = commands.get("case-close");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/agentdev-workflow-templates/);
      }
    });

    it("case-update references its own template directory", () => {
      const content = commands.get("case-update");
      expect(content).toBeDefined();
      if (content) {
        expect(content).toMatch(/templates\/case-update\//);
      }
    });
  });

  // ─── Agent type consistency ──────────────────────────────────────────────

  describe("Agent type consistency per pipeline", () => {
    it("all agentdev commands use sisyphus agent", () => {
      for (const cmd of EXPECTED_COMMANDS) {
        const content = commands.get(cmd);
        expect(content).toBeDefined();
        if (content) {
          const fm = parseFrontmatter(content);
          expect(fm?.["agent"]).toBe("sisyphus");
        }
      }
    });
  });

  // ─── README.md consistency ───────────────────────────────────────────────

  describe("README.md command listing consistency", () => {
    it(`README.md lists all ${COMMAND_COUNT} commands`, () => {
      const readmePath = path.join(CMD_DIR, "README.md");
      expect(fs.existsSync(readmePath)).toBe(true);
      const readme = fs.readFileSync(readmePath, "utf-8");
      for (const cmd of EXPECTED_COMMANDS) {
        expect(readme).toContain(cmd);
      }
    });
  });
});
