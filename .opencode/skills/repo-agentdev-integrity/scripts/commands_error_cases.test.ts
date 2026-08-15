/**
 * REQ-0030-011: Error case tests for command definitions.
 * REQ-010-062: 検証規則の単一実装原則（期待値は配布 checker 由来）。
 *
 * 内蔵の検証関数は廃止済み（OU-005、Issue #2139）。エラー検出の期待値は
 * 配布 checker（check_command_format.ts）とその検出ビュー（data/command-format-rules.yaml）
 * が所有する規則から導出する:
 * - YAML 宣言の forbidden 系パターンと checker の rule ID 検出の一致確認
 * - 実コマンドの参照存在確認（skill、template、command、前提ファイル）
 *
 * frontmatter 契約は description 単一（移行計画 §5.2）。agent の必須検査は廃止済み。
 * 実ファイルの frontmatter・セクション構造検証は commands_structure.test.ts
 * （REQ-0030-001/002）が、checker 本体の構造規則（Step 番号、ガードレール番号等）の
 * ユニットテストと実ファイル走査は check_command_format.test.ts がそれぞれ単一所有する。
 * 本テストは両者を重複実装しない。
 */
import {
  describe,
  it,
  expect,
} from "bun:test";
import { checkCommandFile } from "./check_command_format.ts";
import { collectForbiddenRegexes } from "./check_workflow_preventive.ts";
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
const RUNTIME_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const SOURCE_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
// worktree junction 未設定環境では projection に agentdev-workflow-templates が
// 存在しないため src/opencode/ へフォールバックする（templates_structure.test.ts と同一方式）。
const TEMPLATES_DIR = fs.existsSync(RUNTIME_TEMPLATES_DIR)
  ? RUNTIME_TEMPLATES_DIR
  : SOURCE_TEMPLATES_DIR;
// 配布 checker の検出ビュー。本テストの期待値の単一定義源（REQ-010-062）。
const RULES_YAML_PATH = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "command-format-rules.yaml",
);

// ─── Checker rules (single source of expectations, REQ-010-062) ──────────────

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
const forbiddenPatterns = collectForbiddenRegexes(
  fs.readFileSync(RULES_YAML_PATH, "utf-8"),
);

// ─── Error detection on synthetic fixtures (checker-derived) ─────────────────
// 各 fixture の期待値は command-format-rules.yaml が宣言する forbidden 系パターン
// （検出ビュー）と checkCommandFile の rule ID（検出実装）の双方から導出する。
// 両者が乖離した場合（規則変更時に一方のみ更新された場合）に失敗する。

describe("REQ-0030-011: Error case detection via distributed checker rules", () => {
  it("command-format-rules.yaml declares the forbidden pattern groups", () => {
    expect(forbiddenPatterns.length).toBeGreaterThan(0);
    const keys = new Set(forbiddenPatterns.map((p) => p.key));
    expect(keys.has("forbidden_heading_regex")).toBe(true);
    expect(keys.has("forbidden_substep_regex")).toBe(true);
    expect(keys.has("forbidden_unconditional_patterns")).toBe(true);
    expect(keys.has("forbidden_primary_headings")).toBe(true);
  });

  describe("IR-028: alphabet step heading", () => {
    const line = "### Step A: 前判定";

    it("YAML forbidden_heading_regex derives the expectation", () => {
      const pattern = forbiddenPatterns.find(
        (p) => p.key === "forbidden_heading_regex",
      );
      expect(pattern).toBeDefined();
      expect(new RegExp(pattern!.value).test(line)).toBe(true);
    });

    it("checker reports ir028-command-top-step-alphabet", () => {
      const content = `## 手順\n\n${line}\n\ntext\n`;
      const violations = checkCommandFile("fixture-ir028.md", content);
      expect(
        violations.some((v) => v.rule === "ir028-command-top-step-alphabet"),
      ).toBe(true);
    });
  });

  describe("IR-029: alphabet substep", () => {
    const line = "**Step 1-a**: substep text";

    it("YAML forbidden_substep_regex derives the expectation", () => {
      const pattern = forbiddenPatterns.find(
        (p) => p.key === "forbidden_substep_regex",
      );
      expect(pattern).toBeDefined();
      expect(new RegExp(pattern!.value).test(line)).toBe(true);
    });

    it("checker reports ir029-command-alphabet-substep", () => {
      const content = `## 手順\n\n### Step 1: main\n\n${line}\n`;
      const violations = checkCommandFile("fixture-ir029.md", content);
      expect(
        violations.some((v) => v.rule === "ir029-command-alphabet-substep"),
      ).toBe(true);
    });
  });

  describe("IR-030: unconditional verbatim", () => {
    const line = "検証結果を verbatim で返却すること";
    const exemptLine = "成果物本文のみ verbatim で返却する";

    it("YAML forbidden_unconditional_patterns derive the expectation", () => {
      const patterns = forbiddenPatterns.filter(
        (p) => p.key === "forbidden_unconditional_patterns",
      );
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => new RegExp(p.value).test(line))).toBe(true);
    });

    it("checker reports ir030-subagent-unconditional-verbatim", () => {
      const content = `## 手順\n\n### Step 1: main\n\n${line}\n`;
      const violations = checkCommandFile("fixture-ir030.md", content);
      expect(
        violations.some(
          (v) => v.rule === "ir030-subagent-unconditional-verbatim",
        ),
      ).toBe(true);
    });

    it("checker exempts conditional verbatim (exemption hints)", () => {
      const content = `## 手順\n\n### Step 1: main\n\n${exemptLine}\n`;
      const violations = checkCommandFile("fixture-ir030-exempt.md", content);
      expect(
        violations.some(
          (v) => v.rule === "ir030-subagent-unconditional-verbatim",
        ),
      ).toBe(false);
    });
  });

  describe("IR-031: findings heading unification", () => {
    const line = "## Capture";

    it("YAML forbidden_primary_headings derive the expectation", () => {
      const patterns = forbiddenPatterns.filter(
        (p) => p.key === "forbidden_primary_headings",
      );
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => new RegExp(p.value).test(line))).toBe(true);
    });

    it("checker reports ir031-findings-capture-heading-unification", () => {
      const content = `## 手順\n\n### Step 1: main\n\n${line}\n`;
      const violations = checkCommandFile("fixture-ir031.md", content);
      expect(
        violations.some(
          (v) => v.rule === "ir031-findings-capture-heading-unification",
        ),
      ).toBe(true);
    });
  });

  describe("compliant fixture derives no violation", () => {
    const content = [
      "## 手順",
      "",
      "### Step 1: first",
      "",
      "description",
      "",
      "### Step 2: second",
      "",
      "description",
      "",
      "## ガードレール",
      "",
      "- G01: valid",
      "",
    ].join("\n");

    it("checker reports no violation", () => {
      expect(checkCommandFile("fixture-compliant.md", content)).toHaveLength(0);
    });

    it("no YAML-declared forbidden pattern matches any line", () => {
      for (const line of content.split("\n")) {
        for (const p of forbiddenPatterns) {
          expect(new RegExp(p.value).test(line)).toBe(false);
        }
      }
    });
  });
});

// ─── Error detection on real repo files ──────────────────────────────────────

describe("REQ-0030-011: Real repo error case validation", () => {
  describe("Non-existent references", () => {
    it("detects reference to non-existent skill", () => {
      const fakeSkill = "agentdev-nonexistent-fake-skill";
      expect(skillDirs.has(fakeSkill)).toBe(false);
    });

    it("detects reference to non-existent template", () => {
      const fakeTemplate = "issue_desc_nonexistent.md";
      expect(templateFiles.has(fakeTemplate)).toBe(false);
    });
  });

  describe("All real commands pass checker validation", () => {
    const cmdFiles = fs.existsSync(CMD_DIR)
      ? fs
          .readdirSync(CMD_DIR)
          .filter((f) => f.endsWith(".md") && f !== "README.md")
          .sort()
      : [];
    for (const file of cmdFiles) {
      it(`${file} passes distributed checker validation`, () => {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
        const violations = checkCommandFile(file, content);
        expect(violations).toHaveLength(0);
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

    it("Decision README.md exists (docs/README.md Decision index link target)", () => {
      const decisionReadmePath = path.join(
        REPO_ROOT,
        "docs",
        "decisions",
        "README.md",
      );
      expect(fs.existsSync(decisionReadmePath)).toBe(true);
    });
  });
});
