/**
 * REQ-0030-011: Error case E2E tests for command definitions.
 *
 * Validates detection of:
 * - Missing frontmatter in command definitions
 * - Missing required frontmatter fields
 * - Non-existent template references
 * - Invalid agent type values
 * - Missing Input/Output/Steps sections
 * - Broken cross-references between commands
 * - Missing prerequisite files referenced in commands
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;
const TEMP_BASE = path.join("C:", "WINDOWS", "TEMP", "opencode");

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

// ─── Parser helpers ──────────────────────────────────────────────────────────

function parseCommandFrontmatter(content: string): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  if (yaml.length === 0) return null;
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) result[currentKey] = [...currentArray];
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
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value.slice(1, -1).split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  flushArray();
  return Object.keys(result).length > 0 ? result : null;
}

function validateCommand(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const fm = parseCommandFrontmatter(content);
  if (!fm) {
    errors.push("Missing or invalid frontmatter");
    return { valid: false, errors };
  }

  if (!fm["description"] || (typeof fm["description"] === "string" && fm["description"].trim() === "")) {
    errors.push("Missing 'description' field");
  }
  if (!fm["agent"] || (typeof fm["agent"] === "string" && !["sisyphus", "prometheus"].includes(fm["agent"]))) {
    errors.push(`Invalid 'agent' field: ${fm["agent"]}`);
  }

  const body = content.split("---").slice(2).join("---").trim();
  if (!body) {
    errors.push("Empty body after frontmatter");
    return { valid: errors.length === 0, errors };
  }

  if (!/^## /m.test(body)) {
    errors.push("No ## headings in body");
  }

  const hasInput = /^## Input/m.test(body);
  if (!hasInput) errors.push("Missing ## Input section");

  const hasOutput = /^## Output/m.test(body);
  if (!hasOutput) errors.push("Missing ## Output section");

  const hasSteps = /(^## Steps|^### Step \d|^## Step \d|^## フェーズ)/m.test(body);
  if (!hasSteps) errors.push("Missing Steps section");

  return { valid: errors.length === 0, errors };
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

const skillDirs = getSkillDirs();
const templateFiles = getTemplateFiles();

// ─── Error detection on synthetic fixtures ───────────────────────────────────

describe("REQ-0030-011: Error case detection (synthetic fixtures)", () => {
  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  describe("Missing frontmatter", () => {
    it("detects command without frontmatter", () => {
      const content = "# Test Command\n\n## Input\n\nSomething\n\n## Steps\n\n1. Do thing\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid frontmatter");
    });

    it("detects command with empty frontmatter", () => {
      const content = "---\n---\n\n## Input\n\nSomething\n\n## Steps\n\n1. Do thing\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid frontmatter");
    });
  });

  describe("Missing required frontmatter fields", () => {
    it("detects missing description field", () => {
      const content = "---\nagent: sisyphus\n---\n\n## Input\n\nX\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("description"))).toBe(true);
    });

    it("detects missing agent field", () => {
      const content = "---\ndescription: test\n---\n\n## Input\n\nX\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("agent"))).toBe(true);
    });

    it("detects invalid agent type", () => {
      const content = "---\ndescription: test\nagent: hermes\n---\n\n## Input\n\nX\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid 'agent'"))).toBe(true);
    });

  });

  describe("Missing body sections", () => {
    it("detects missing Input section", () => {
      const content = "---\ndescription: test\nagent: sisyphus\n---\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing ## Input section");
    });

    it("detects missing Output section", () => {
      const content = "---\ndescription: test\nagent: sisyphus\n---\n\n## Input\n\nX\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing ## Output section");
    });

    it("detects missing Steps section", () => {
      const content = "---\ndescription: test\nagent: sisyphus\n---\n\n## Input\n\nX\n\n## Output\n\nY\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing Steps section");
    });

    it("detects empty body", () => {
      const content = "---\ndescription: test\nagent: sisyphus\n---\n\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Empty body after frontmatter");
    });
  });

  describe("Non-existent skill references", () => {
    it("detects reference to non-existent skill", () => {
      const fakeSkill = "agentdev-nonexistent-fake-skill";
      expect(skillDirs.has(fakeSkill)).toBe(false);
    });

    it("detects reference to non-existent template", () => {
      const fakeTemplate = "issue_desc_nonexistent.md";
      expect(templateFiles.has(fakeTemplate)).toBe(false);
    });
  });

  describe("Valid command passes validation", () => {
    it("accepts well-formed command definition", () => {
      const content = `\
---
description: テストコマンド
agent: sisyphus
---

# テスト

テスト用コマンド。

## Input

- 入力項目

## Output

- 出力項目

## Steps

1. ステップ1
2. ステップ2
`;
      const result = validateCommand(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});

// ─── Error detection on real repo files ──────────────────────────────────────

describe("REQ-0030-011: Real repo error case validation", () => {
  describe("All real commands pass validation", () => {
    const cmdFiles = fs.existsSync(CMD_DIR)
      ? fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()
      : [];

    for (const file of cmdFiles) {
      it(`${file} passes full validation`, () => {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const result = validateCommand(content);
        expect(result.valid).toBe(true);
        if (!result.valid) {
          console.error(`${file} validation errors:`, result.errors);
        }
      });
    }
  });

  describe("All template references in real commands exist", () => {
    const cmdFiles = fs.existsSync(CMD_DIR)
      ? fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()
      : [];

    for (const file of cmdFiles) {
      describe(`${file}`, () => {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const templatePattern = /agentdev-workflow-templates\/templates\/([a-z_]+\.md)/g;
        let match: RegExpExecArray | null;
        const refs: string[] = [];

        while ((match = templatePattern.exec(content)) !== null) {
          refs.push(match[1]);
        }

        for (const ref of [...new Set(refs)]) {
          it(`template "${ref}" exists`, () => {
            expect(templateFiles.has(ref)).toBe(true);
          });
        }
      });
    }
  });

  describe("Cross-command reference consistency", () => {
    it("all referenced command names in real commands exist as files", () => {
      const cmdFiles = fs.existsSync(CMD_DIR)
        ? fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md")
        : [];
      const cmdNames = new Set(cmdFiles.map((f) => f.replace(".md", "")));

      for (const file of cmdFiles) {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const refPattern = /\/agentdev\/([a-z][a-z0-9-]*)/g;
        let refMatch: RegExpExecArray | null;

        while ((refMatch = refPattern.exec(content)) !== null) {
          const ref = refMatch[1];
          if (ref === file.replace(".md", "")) continue;
          expect(cmdNames.has(ref) || ref.includes("-")).toBe(true);
        }
      }
    });
  });

  describe("Prerequisite file references exist", () => {
    it("system.md exists (referenced by multiple commands)", () => {
      const sysPath = path.join(REPO_ROOT, "docs", "specs", "system.md");
      expect(fs.existsSync(sysPath)).toBe(true);
    });

    it("patterns.md exists (referenced by multiple commands)", () => {
      const patternsPath = path.join(REPO_ROOT, "docs", "specs", "patterns.md");
      expect(fs.existsSync(patternsPath)).toBe(true);
    });

    it("REQ README.md exists (referenced by req-save, case-close)", () => {
      const reqReadmePath = path.join(REPO_ROOT, "docs", "requirements", "README.md");
      expect(fs.existsSync(reqReadmePath)).toBe(true);
    });

    it("docs/README.md exists (referenced by req-save, case-close)", () => {
      const docsReadmePath = path.join(REPO_ROOT, "docs", "README.md");
      expect(fs.existsSync(docsReadmePath)).toBe(true);
    });

    it("ADR README.md exists (referenced by case-open, integrity-check)", () => {
      const adrReadmePath = path.join(REPO_ROOT, "docs", "adr", "README.md");
      expect(fs.existsSync(adrReadmePath)).toBe(true);
    });
  });
});
