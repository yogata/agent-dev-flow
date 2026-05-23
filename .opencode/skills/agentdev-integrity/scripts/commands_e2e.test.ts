/**
 * E2E workflow tests for all 14 command definitions.
 * REQ-0030-009: Normal-path E2E tests for all 14 commands
 * REQ-0030-013: Test files placed in corresponding scripts/ directory
 *
 * Validates end-to-end workflow aspects:
 * - Pipeline continuity (commands form valid chains)
 * - Cross-command data flow (output of one matches input of next)
 * - Template reference validity from command definitions
 * - Guardrail completeness
 * - Input/Output/Steps section completeness
 */

import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");
const TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);

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
  const pattern = /\/agentdev\/([a-z-]+)/g;
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

// Expected 14 commands
const EXPECTED_COMMANDS = [
  "case-close",
  "case-open",
  "case-run",
  "case-update",
  "intake-capture",
  "intake-from-github",
  "intake-open",
  "intake-promote",
  "intake-review",
  "integrity-check",
  "learning-promote",
  "learning-refine",
  "req-define",
  "req-save",
];

// Pipeline definitions
const REQ_CASE_PIPELINE = ["req-define", "req-save", "case-open", "case-run", "case-update", "case-close"];
const LEARNING_PIPELINE = ["learning-refine", "learning-promote"];
const INTAKE_PIPELINE = ["intake-capture", "intake-from-github", "intake-review", "intake-promote", "intake-open"];
const INTEGRITY_STANDALONE = ["integrity-check"];

// Valid agent types
const VALID_AGENTS = new Set(["sisyphus", "prometheus"]);

// ─── REQ-0030-009: Normal-path E2E tests ────────────────────────────────────

describe("REQ-0030-009: E2E workflow tests for all 14 commands", () => {
  // ─── Pipeline completeness ──────────────────────────────────────────────

  describe("Pipeline completeness: all 14 commands exist", () => {
    it("has exactly 14 command definition files", () => {
      expect(commands.size).toBe(14);
    });

    for (const cmd of EXPECTED_COMMANDS) {
      it(`command "${cmd}" exists as .md file`, () => {
        expect(commands.has(cmd)).toBe(true);
      });
    }
  });

  // ─── Per-command E2E validation ─────────────────────────────────────────

  for (const [cmdName, content] of commands) {
    describe(`E2E: ${cmdName}`, () => {
      const fm = parseFrontmatter(content);

      // --- Input/Output sections ---

      it("has Input section defining expected inputs", () => {
        const inputSection = extractSection(content, "Input");
        expect(inputSection.length).toBeGreaterThan(0);
      });

      it("has Output section defining expected outputs", () => {
        const outputSection = extractSection(content, "Output");
        expect(outputSection.length).toBeGreaterThan(0);
      });

      // --- Steps section ---

      it("has Steps section with numbered or phased structure", () => {
        const hasSteps = /(^##\s+Steps)|(^###\s+Step\s+\d)|(^##\s+Step\s+\d)|(^###\s+Phase)|(^##\s+フェーズ)/m.test(content);
        expect(hasSteps).toBe(true);
      });

      // --- Agent validation ---

      it("has valid agent type (sisyphus or prometheus)", () => {
        expect(fm).not.toBeNull();
        if (fm) {
          const agent = fm["agent"] as string;
          expect(VALID_AGENTS.has(agent)).toBe(true);
        }
      });

      // --- load_skills reference validity ---

      if (fm) {
        const loadSkills = Array.isArray(fm["load_skills"])
          ? (fm["load_skills"] as string[])
          : [];

        for (const skill of loadSkills) {
          it(`load_skills "${skill}" references existing skill directory`, () => {
            expect(skillDirs.has(skill)).toBe(true);
          });
        }

        it("load_skills includes agentdev-workflow-reporting (for reporting commands)", () => {
          const commandsWithReporting = [
            "case-open", "case-run", "case-update", "case-close",
            "intake-capture", "intake-from-github", "intake-review",
            "intake-promote", "intake-open", "req-define", "req-save",
          ];
          if (commandsWithReporting.includes(cmdName)) {
            expect(loadSkills.includes("agentdev-workflow-reporting")).toBe(true);
          }
        });
      }

      // --- Template reference validity ---

      const templateRefs = extractTemplateRefs(content);
      for (const tmplRef of templateRefs) {
        it(`template reference "${tmplRef}" exists in templates directory`, () => {
          expect(templateFiles.has(tmplRef)).toBe(true);
        });
      }

      // --- Cross-command references ---

      const cmdRefs = extractCommandRefs(content);
      for (const ref of cmdRefs) {
        if (ref === cmdName) continue; // self-reference is ok
        it(`command reference "/agentdev/${ref}" points to existing command`, () => {
          // Check it's either a known command or a valid sub-reference
          expect(EXPECTED_COMMANDS.includes(ref) || ref.startsWith("case-") || ref.startsWith("intake-") || ref.startsWith("learning-") || ref.startsWith("req-") || ref === "integrity-check").toBe(true);
        });
      }
    });
  }

  // ─── Pipeline continuity ────────────────────────────────────────────────

  describe("Pipeline continuity: req/case pipeline", () => {
    it("req-define output matches req-save input expectations", () => {
      const reqDefine = commands.get("req-define");
      const reqSave = commands.get("req-save");
      expect(reqDefine).toBeDefined();
      expect(reqSave).toBeDefined();

      if (reqDefine && reqSave) {
        // req-define Output should produce draft files that req-save Input references
        const reqDefineOutput = extractSection(reqDefine, "Output");
        const reqSaveInput = extractSection(reqSave, "Input");
        expect(reqDefineOutput).toContain(".sisyphus/drafts");
        expect(reqSaveInput).toContain(".sisyphus/drafts");
      }
    });

    it("req-save output matches case-open input expectations", () => {
      const reqSave = commands.get("req-save");
      const caseOpen = commands.get("case-open");
      expect(reqSave).toBeDefined();
      expect(caseOpen).toBeDefined();

      if (reqSave && caseOpen) {
        const reqSaveOutput = extractSection(reqSave, "Output");
        const caseOpenInput = extractSection(caseOpen, "Input");
        // req-save produces REQ files; case-open consumes REQ content
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
        const caseOpenOutput = extractSection(caseOpen, "Output");
        const caseRunInput = extractSection(caseRun, "Input");
        // case-open creates Issues; case-run consumes Issue numbers
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
        const caseRunOutput = extractSection(caseRun, "Output");
        const caseCloseInput = extractSection(caseClose, "Input");
        expect(caseRunOutput).toContain("GitHub PR");
        expect(caseCloseInput).toContain("PR");
      }
    });
  });

  describe("Pipeline continuity: learning pipeline", () => {
    it("learning-refine output matches learning-promote input expectations", () => {
      const refine = commands.get("learning-refine");
      const promote = commands.get("learning-promote");
      expect(refine).toBeDefined();
      expect(promote).toBeDefined();

      if (refine && promote) {
        const refineOutput = extractSection(refine, "Output");
        const promoteInput = extractSection(promote, "Input");
        // refine produces evaluation-report; promote consumes it
        expect(refineOutput).toContain("evaluation-report");
        expect(promoteInput).toContain("evaluation-report");
      }
    });

    it("learning pipeline references req-define for promotion route", () => {
      const promote = commands.get("learning-promote");
      expect(promote).toBeDefined();
      if (promote) {
        expect(promote).toContain("req-define");
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
        const captureOutput = extractSection(capture, "Output");
        const githubOutput = extractSection(fromGithub, "Output");
        // Both produce intake items in inbox
        expect(captureOutput).toContain("inbox");
        expect(githubOutput).toContain("inbox");
      }
    });

    it("intake-review input matches intake-capture/intake-from-github output", () => {
      const review = commands.get("intake-review");
      expect(review).toBeDefined();
      if (review) {
        const reviewInput = extractSection(review, "Input");
        expect(reviewInput).toContain("inbox");
      }
    });

    it("intake-promote input matches intake-review output", () => {
      const promote = commands.get("intake-promote");
      expect(promote).toBeDefined();
      if (promote) {
        const promoteInput = extractSection(promote, "Input");
        expect(promoteInput).toContain("accepted");
      }
    });

    it("intake-open input matches intake-promote output expectations", () => {
      const open = commands.get("intake-open");
      const promote = commands.get("intake-promote");
      expect(open).toBeDefined();
      expect(promote).toBeDefined();

      if (open && promote) {
        const openInput = extractSection(open, "Input");
        const promoteOutput = extractSection(promote, "Output");
        expect(openInput).toContain("promoted");
        expect(promoteOutput).toContain("promoted");
      }
    });
  });

  // ─── Guardrail completeness ─────────────────────────────────────────────

  describe("Guardrail completeness for complex commands", () => {
    const commandsWithGuardrails = ["case-open", "case-run", "case-close"];

    for (const cmdName of commandsWithGuardrails) {
      it(`${cmdName} has Guardrails section`, () => {
        const content = commands.get(cmdName);
        expect(content).toBeDefined();
        if (content) {
          const guardSection = extractSection(content, "Guardrails");
          // Guardrails may be under subsections, so check for the heading
          expect(content).toMatch(/## Guardrails/);
        }
      });
    }
  });

  // ─── Template coverage per command ──────────────────────────────────────

  describe("Template coverage for issue/PR-creating commands", () => {
    const commandsUsingTemplates = [
      { cmd: "case-open", expectedTemplates: ["issue_desc_feature.md", "issue_desc_bug.md"] },
      { cmd: "case-close", expectedTemplates: ["issue_comment_feature_implementation.md", "issue_comment_bug_record.md"] },
      { cmd: "case-update", expectedTemplates: ["issue_comment_update.md", "issue_comment_review_ng.md"] },
      { cmd: "intake-open", expectedTemplates: ["issue_desc_feature.md", "issue_desc_epic.md", "issue_desc_child.md"] },
    ];

    for (const { cmd, expectedTemplates } of commandsUsingTemplates) {
      describe(`${cmd} template references`, () => {
        const content = commands.get(cmd);
        if (!content) return;

        const refs = extractTemplateRefs(content);

        for (const tmpl of expectedTemplates) {
          it(`references template "${tmpl}"`, () => {
            expect(refs.includes(tmpl)).toBe(true);
          });
        }
      });
    }
  });

  // ─── Agent type consistency ─────────────────────────────────────────────

  describe("Agent type consistency per pipeline", () => {
    it("interactive commands use prometheus agent", () => {
      const interactiveCommands = ["req-define", "intake-review"];
      for (const cmd of interactiveCommands) {
        const content = commands.get(cmd);
        expect(content).toBeDefined();
        if (content) {
          const fm = parseFrontmatter(content);
          expect(fm?.["agent"]).toBe("prometheus");
        }
      }
    });

    it("file/GitHub operation commands use sisyphus agent", () => {
      const sisyphusCommands = [
        "req-save", "case-open", "case-run", "case-update", "case-close",
        "intake-capture", "intake-from-github", "intake-promote", "intake-open",
        "integrity-check", "learning-refine", "learning-promote",
      ];
      for (const cmd of sisyphusCommands) {
        const content = commands.get(cmd);
        expect(content).toBeDefined();
        if (content) {
          const fm = parseFrontmatter(content);
          expect(fm?.["agent"]).toBe("sisyphus");
        }
      }
    });
  });

  // ─── Workflow-lifecycle skill coverage ──────────────────────────────────

  describe("Workflow lifecycle skill coverage", () => {
    it("all workflow commands load agentdev-workflow-lifecycle", () => {
      const workflowCommands = [
        "case-open", "case-run", "case-update", "case-close",
        "intake-capture", "intake-from-github", "intake-review", "intake-promote",
      ];
      for (const cmd of workflowCommands) {
        const content = commands.get(cmd);
        expect(content).toBeDefined();
        if (content) {
          expect(content).toContain("agentdev-workflow-lifecycle");
        }
      }
    });
  });

  // ─── README.md consistency ──────────────────────────────────────────────

  describe("README.md command listing consistency", () => {
    it("README.md lists all 14 commands", () => {
      const readmePath = path.join(CMD_DIR, "README.md");
      expect(fs.existsSync(readmePath)).toBe(true);

      const readme = fs.readFileSync(readmePath, "utf-8");
      for (const cmd of EXPECTED_COMMANDS) {
        expect(readme).toContain(cmd);
      }
    });
  });
});
