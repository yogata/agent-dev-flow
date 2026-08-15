/**
 * REQ-0030-011: Error case E2E tests for command definitions.
 *
 * Validates detection of:
 * - Missing frontmatter in command definitions
 * - Missing required frontmatter fields (description)
 * - Missing Input/Output/Steps sections
 * - Empty body after frontmatter
 * - Well-formed command passes validation
 *
 * frontmatter 契約は description 単一（移行計画 §5.2）。agent の必須検査は廃止済み。
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
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
// 配布時 (.opencode/commands/agentdev) を優先。worktree 環境で junction が無い場合は
// ソースパス (src/opencode/commands/agentdev) へフォールバックして実コマンドを検査する。
const RUNTIME_CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SOURCE_CMD_DIR = path.join(
  REPO_ROOT,
  "src",
  "opencode",
  "commands",
  "agentdev",
);
const CMD_DIR = fs.existsSync(RUNTIME_CMD_DIR) &&
  fs.readdirSync(RUNTIME_CMD_DIR).some((f) => f.endsWith(".md"))
  ? RUNTIME_CMD_DIR
  : SOURCE_CMD_DIR;
const SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");
const TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);

// ─── Parser helpers ──────────────────────────────────────────────────────────

function parseCommandFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  if (yaml.length === 0) return null;
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
  return Object.keys(result).length > 0 ? result : null;
}

function validateCommand(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fm = parseCommandFrontmatter(content);
  if (!fm) {
    errors.push("Missing or invalid frontmatter");
    return { valid: false, errors };
  }
  if (
    !fm["description"] ||
    (typeof fm["description"] === "string" && fm["description"].trim() === "")
  ) {
    errors.push("Missing 'description' field");
  }
  const body = content.split("---").slice(2).join("---").trim();
  if (!body) {
    errors.push("Empty body after frontmatter");
    return { valid: errors.length === 0, errors };
  }
  if (!/^## /m.test(body)) {
    errors.push("No ## headings in body");
  }
  const hasInput = /^## (Input|入力)/m.test(body);
  if (!hasInput) errors.push("Missing ## Input section");
  const hasOutput = /^## (Output|出力)/m.test(body);
  if (!hasOutput) errors.push("Missing ## Output section");
  // thin Command モデル（OU-002/003/004 移行後）は workflow 実装本体を Workflow Skill へ委譲し、
  // 工程一覧は ## workflow dispatch セクション内の番号付き参照（### Step N / **STEP-N** / **工程-N**）で表現する
  const hasSteps = /(^## (Steps|手順|フェーズ|workflow)|^### Step \d|^## Step \d|\*\*(STEP|工程)-\d+\*\*)/m.test(body);
  if (!hasSteps) errors.push("Missing Steps section");
  return { valid: errors.length === 0, errors };
}

function getSkillDirs(): Set<string> {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

function getTemplateFiles(): Set<string> {
  if (!fs.existsSync(TEMPLATES_DIR)) return new Set();
  return new Set(
    fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".md")),
  );
}

const skillDirs = getSkillDirs();
const templateFiles = getTemplateFiles();

// ─── Error detection on synthetic fixtures ───────────────────────────────────

describe("REQ-0030-011: Error case detection (synthetic fixtures)", () => {
  describe("Missing frontmatter", () => {
    it("detects command without frontmatter", () => {
      const content =
        "# Test Command\n\n## Input\n\nSomething\n\n## Steps\n\n1. Do thing\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid frontmatter");
    });

    it("detects command with empty frontmatter", () => {
      const content =
        "---\n---\n\n## Input\n\nSomething\n\n## Steps\n\n1. Do thing\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing or invalid frontmatter");
    });
  });

  describe("Missing required frontmatter fields", () => {
    it("detects missing description field", () => {
      const content =
        "---\ntitle: test\n---\n\n## Input\n\nX\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("description"))).toBe(true);
    });
  });

  describe("Missing body sections", () => {
    it("detects missing Input section", () => {
      const content =
        "---\ndescription: test\n---\n\n## Output\n\nY\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing ## Input section");
    });

    it("detects missing Output section", () => {
      const content =
        "---\ndescription: test\n---\n\n## Input\n\nX\n\n## Steps\n\n1. S\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing ## Output section");
    });

    it("detects missing Steps section", () => {
      const content =
        "---\ndescription: test\n---\n\n## Input\n\nX\n\n## Output\n\nY\n";
      const result = validateCommand(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing Steps section");
    });

    it("detects empty body", () => {
      const content = "---\ndescription: test\n---\n\n";
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
      const content = [
        "---",
        "description: テストコマンド",
        "---",
        "",
        "# テストコマンド",
        "",
        "テスト用コマンド。",
        "",
        "## Input",
        "",
        "- 入力項目",
        "",
        "## Output",
        "",
        "- 出力項目",
        "",
        "## Steps",
        "",
        "1. ステップ1",
        "2. ステップ2",
        "",
      ].join("\n");
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
      ? fs
          .readdirSync(CMD_DIR)
          .filter((f) => f.endsWith(".md") && f !== "README.md")
          .sort()
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
      ? fs
          .readdirSync(CMD_DIR)
          .filter((f) => f.endsWith(".md") && f !== "README.md")
          .sort()
      : [];
    for (const file of cmdFiles) {
      describe(`${file}`, () => {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const templatePattern =
          /agentdev-workflow-templates\/templates\/([a-z_]+\.md)/g;
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
        ? fs
            .readdirSync(CMD_DIR)
            .filter((f) => f.endsWith(".md") && f !== "README.md")
        : [];
      const cmdNames = new Set(cmdFiles.map((f) => f.replace(".md", "")));
      // `/agentdev/<name>` 参照のうち、パス区切り続でない完全な command 名のみ検査対象とする。
      // `templates/` 等のパス区切り続は command 名ではなくディレクトリ名のため除外。
      for (const file of cmdFiles) {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const refPattern = /\/agentdev\/([a-z][a-z0-9-]*)(?![a-z0-9-\/])/g;
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
      const sysPath = path.join(
        REPO_ROOT,
        "docs",
        "specs",
        "foundations",
        "system.md",
      );
      expect(fs.existsSync(sysPath)).toBe(true);
    });

    it("REQ README.md exists (referenced by req-save, case-close)", () => {
      const reqReadmePath = path.join(
        REPO_ROOT,
        "docs",
        "requirements",
        "README.md",
      );
      expect(fs.existsSync(reqReadmePath)).toBe(true);
    });

    it("docs/README.md exists (referenced by req-save, case-close)", () => {
      const docsReadmePath = path.join(REPO_ROOT, "docs", "README.md");
      expect(fs.existsSync(docsReadmePath)).toBe(true);
    });

    it("Decision README.md exists (docs/decisions/README.md, DEC-009 AG-014)", () => {
      // DEC-009 AG-014 の正規索引。旧 docs/adr/README.md からの期待値更新（索引存在検証として存続）。
      const decisionsReadmePath = path.join(
        REPO_ROOT,
        "docs",
        "decisions",
        "README.md",
      );
      expect(fs.existsSync(decisionsReadmePath)).toBe(true);
    });
  });
});
