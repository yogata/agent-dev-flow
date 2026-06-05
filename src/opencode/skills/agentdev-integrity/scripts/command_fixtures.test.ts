/**
 * REQ-0030-010: Test fixture validation for command E2E tests.
 *
 * Validates:
 * - Sample REQ file fixture produces expected parsed fields
 * - Sample issue body fixture matches template structure
 * - Sample draft fixture has valid draft-meta
 * - Sample intake item fixture has correct structure
 * - Real templates have valid variable placeholders
 * - Real REQ files have expected structure
 * - Real command definitions produce valid parsed output
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
const TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const REQ_DIR = path.join(REPO_ROOT, "docs", "requirements");

// ─── Fixture creation helpers ────────────────────────────────────────────────

function createTempDir(): string {
  if (!fs.existsSync(TEMP_BASE)) fs.mkdirSync(TEMP_BASE, { recursive: true });
  return fs.mkdtempSync(path.join(TEMP_BASE, "e2e-fixtures-test-"));
}

const SAMPLE_REQ_MD = `\
---
id: REQ-9999
title: "テスト用要件"
created: "2026-01-01"
updated: "2026-01-01"
tags: [test, fixture]
---

## 目的

テストフィクスチャ検証用のダミー要件。

## 要件

| ID | 要件 |
|---|---|
| REQ-9999-001 | テスト要件1（SHALL） |
| REQ-9999-002 | テスト要件2（SHALL） |

## 適用範囲

- **対象**: テストフィクスチャ
- **対象外**: 本番環境
`;

const SAMPLE_DRAFT_MD = `\
# テストドラフト

## draft-meta
- topic-slug: test-feature
- pattern: B
- scale: standard
- status: draft

## 目的

テスト用ドラフト。

## 完了条件

- [ ] テストが通る
`;

const SAMPLE_INTAKE_ITEM_MD = `\
# テスト用 intake item

## 観測
テスト観測内容。

## 今回扱わない理由
他の優先度が高い。

## 影響
軽微。

## レビューで決めること
採用可否。

## 根拠（任意）
テスト用データ。
`;

const SAMPLE_ISSUE_BODY_FEATURE = `\
## 概要
<!-- 【必須】 -->

テスト機能の概要

## 課題
<!-- 【必須】 -->

テスト課題

## 提案内容
<!-- 【必須】 -->

テスト提案

## 完了条件
<!-- 【必須】 -->

- [ ] テスト完了条件1
- [ ] テスト完了条件2

## テスト戦略
<!-- 【必須】 -->

- [ ] ユニットテスト: テスト対象
- [ ] E2Eテスト: テスト対象
`;

const SAMPLE_ISSUE_BODY_BUG = `\
## 概要
<!-- 【必須】 -->

テストバグの概要

## 再現手順
<!-- 【必須】 -->

1. 手順1
2. 手順2

## 期待される動作
<!-- 【必須】 -->

期待される動作

## 完了条件
<!-- 【必須】 -->

- [ ] バグが修正されている
`;

// ─── REQ-0030-010: Fixture validation ────────────────────────────────────────

describe("REQ-0030-010: Test fixture existence and content validity", () => {
  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // ─── REQ file fixture validation ──────────────────────────────────────

  describe("REQ file fixture", () => {
    it("parses REQ frontmatter fields correctly", () => {
      const parts = SAMPLE_REQ_MD.split("---");
      expect(parts.length).toBeGreaterThanOrEqual(3);
      const yaml = parts[1].trim();
      expect(yaml).toContain("id: REQ-9999");
      expect(yaml).toContain("title:");
      expect(yaml).toContain("created:");
      expect(yaml).toContain("updated:");
      expect(yaml).toContain("tags:");
    });

    it("contains required sections", () => {
      expect(SAMPLE_REQ_MD).toContain("## 目的");
      expect(SAMPLE_REQ_MD).toContain("## 要件");
      expect(SAMPLE_REQ_MD).toContain("## 適用範囲");
    });

    it("contains requirement table with IDs", () => {
      expect(SAMPLE_REQ_MD).toContain("REQ-9999-001");
      expect(SAMPLE_REQ_MD).toContain("REQ-9999-002");
    });

    it("writes and reads back correctly (UTF-8 round-trip)", () => {
      const tempDir = createTempDir();
      tempDirs.push(tempDir);
      const filePath = path.join(tempDir, "REQ-9999.md");

      fs.writeFileSync(filePath, SAMPLE_REQ_MD, "utf-8");
      const readBack = fs.readFileSync(filePath, "utf-8");
      expect(readBack).toBe(SAMPLE_REQ_MD);
    });
  });

  // ─── Draft fixture validation ─────────────────────────────────────────

  describe("Draft fixture", () => {
    it("contains draft-meta section", () => {
      expect(SAMPLE_DRAFT_MD).toContain("## draft-meta");
    });

    it("draft-meta has required fields", () => {
      const metaMatch = SAMPLE_DRAFT_MD.match(/## draft-meta\s*\n([\s\S]*?)(?=\n## |$)/);
      expect(metaMatch).not.toBeNull();
      const meta = metaMatch![1];
      expect(meta).toContain("topic-slug:");
      expect(meta).toContain("pattern:");
      expect(meta).toContain("scale:");
      expect(meta).toContain("status:");
    });

    it("draft-meta pattern is valid (A/B/C/D)", () => {
      const patternMatch = SAMPLE_DRAFT_MD.match(/pattern:\s*([A-D])/);
      expect(patternMatch).not.toBeNull();
      expect(["A", "B", "C", "D"]).toContain(patternMatch![1]);
    });

    it("draft-meta scale is valid (standard/large)", () => {
      const scaleMatch = SAMPLE_DRAFT_MD.match(/scale:\s*(\S+)/);
      expect(scaleMatch).not.toBeNull();
      expect(["standard", "large"]).toContain(scaleMatch![1]);
    });

    it("has completion checkboxes", () => {
      expect(SAMPLE_DRAFT_MD).toMatch(/- \[ \]/);
    });
  });

  // ─── Intake item fixture validation ───────────────────────────────────

  describe("Intake item fixture", () => {
    it("has observation section", () => {
      expect(SAMPLE_INTAKE_ITEM_MD).toContain("## 観測");
    });

    it("has reason-not-now section", () => {
      expect(SAMPLE_INTAKE_ITEM_MD).toContain("## 今回扱わない理由");
    });

    it("has impact section", () => {
      expect(SAMPLE_INTAKE_ITEM_MD).toContain("## 影響");
    });

    it("has review-decision section", () => {
      expect(SAMPLE_INTAKE_ITEM_MD).toContain("## レビューで決めること");
    });

    it("does not have frontmatter (per REQ-0017-033)", () => {
      expect(SAMPLE_INTAKE_ITEM_MD.startsWith("---")).toBe(false);
    });
  });

  // ─── Issue body fixture validation ────────────────────────────────────

  describe("Issue body fixture (feature)", () => {
    it("has all required markers", () => {
      const markers = SAMPLE_ISSUE_BODY_FEATURE.match(/<!--\s*【必須】\s*-->/g);
      expect(markers).not.toBeNull();
      expect(markers!.length).toBeGreaterThanOrEqual(4);
    });

    it("has completion checkboxes in 完了条件 section", () => {
      expect(SAMPLE_ISSUE_BODY_FEATURE).toContain("## 完了条件");
      expect(SAMPLE_ISSUE_BODY_FEATURE).toMatch(/- \[ \] テスト完了条件/);
    });

    it("matches template structure (issue_desc_feature.md)", () => {
      const templatePath = path.join(TEMPLATES_DIR, "issue_desc_feature.md");
      if (!fs.existsSync(templatePath)) return;

      const template = fs.readFileSync(templatePath, "utf-8");
      const templateRequiredHeadings = template.match(/## [^\n]+(?=\s*\n<!--\s*【必須】)/g) || [];

      for (const heading of templateRequiredHeadings) {
        expect(SAMPLE_ISSUE_BODY_FEATURE).toContain(heading.trim());
      }
    });
  });

  describe("Issue body fixture (bug)", () => {
    it("has all required markers", () => {
      const markers = SAMPLE_ISSUE_BODY_BUG.match(/<!--\s*【必須】\s*-->/g);
      expect(markers).not.toBeNull();
      expect(markers!.length).toBeGreaterThanOrEqual(3);
    });

    it("has 再現手順 section", () => {
      expect(SAMPLE_ISSUE_BODY_BUG).toContain("## 再現手順");
    });
  });

  // ─── Real REQ files validation ────────────────────────────────────────

  describe("Real REQ files structure", () => {
    it("REQ directory exists and contains files", () => {
      expect(fs.existsSync(REQ_DIR)).toBe(true);
      const files = fs.readdirSync(REQ_DIR).filter((f) => f.startsWith("REQ-") && f.endsWith(".md"));
      expect(files.length).toBeGreaterThan(0);
    });

    it("each REQ file has required frontmatter fields", () => {
      const files = fs.readdirSync(REQ_DIR)
        .filter((f) => f.startsWith("REQ-") && f.endsWith(".md"))
        .sort();

      for (const file of files) {
        const content = fs.readFileSync(path.join(REQ_DIR, file), "utf-8");
        const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        expect(fmMatch).not.toBeNull();

        const fm = fmMatch![1];
        expect(fm).toContain("id:");
        expect(fm).toContain("title:");
        expect(fm).toContain("created:");
      }
    });

    it("each REQ file has required sections", () => {
      const files = fs.readdirSync(REQ_DIR)
        .filter((f) => f.startsWith("REQ-") && f.endsWith(".md"))
        .sort();

      for (const file of files) {
        const content = fs.readFileSync(path.join(REQ_DIR, file), "utf-8");
        expect(content).toContain("## 目的");
        expect(content).toContain("## 要件");
      }
    });
  });

  // ─── Real templates validation ────────────────────────────────────────

  describe("Real templates have valid structure", () => {
    it("templates directory exists", () => {
      expect(fs.existsSync(TEMPLATES_DIR)).toBe(true);
    });

    it("issue templates have variable placeholders or fixed structure", () => {
      const issueTemplates = ["issue_desc_feature.md", "issue_desc_bug.md"];
      for (const tmpl of issueTemplates) {
        const tmplPath = path.join(TEMPLATES_DIR, tmpl);
        if (!fs.existsSync(tmplPath)) continue;

        const content = fs.readFileSync(tmplPath, "utf-8");
        // Templates should have some structure markers
        expect(content).toContain("<!-- 【必須】 -->");
      }
    });

    it("comment templates have content structure", () => {
      const commentTemplates = [
        "issue_comment_bug_analysis.md",
        "issue_comment_bug_record.md",
        "issue_comment_feature_technical.md",
        "issue_comment_feature_implementation.md",
        "issue_comment_update.md",
        "issue_comment_review_ng.md",
      ];
      for (const tmpl of commentTemplates) {
        const tmplPath = path.join(TEMPLATES_DIR, tmpl);
        if (!fs.existsSync(tmplPath)) continue;

        const content = fs.readFileSync(tmplPath, "utf-8");
        expect(content.trim().length).toBeGreaterThan(0);
      }
    });

    it("pr_desc template exists and has content", () => {
      const tmplPath = path.join(TEMPLATES_DIR, "pr_desc.md");
      expect(fs.existsSync(tmplPath)).toBe(true);

      const content = fs.readFileSync(tmplPath, "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });

  // ─── Command definition parse validation ──────────────────────────────

  describe("Command definitions produce valid parsed output", () => {
    const cmdFiles = fs.existsSync(CMD_DIR)
      ? fs.readdirSync(CMD_DIR).filter((f) => f.endsWith(".md") && f !== "README.md").sort()
      : [];

    for (const file of cmdFiles) {
      describe(`parsed output: ${file}`, () => {
        const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");

        it("frontmatter produces non-null parse result", () => {
          const parts = content.split("---");
          expect(parts.length).toBeGreaterThanOrEqual(3);
          const fm = parts[1].trim();
          expect(fm.length).toBeGreaterThan(0);
        });

        it("body has at least one ## heading after frontmatter", () => {
          const body = content.split("---").slice(2).join("---").trim();
          const headings = body.match(/^## /gm);
          expect(headings).not.toBeNull();
          expect(headings!.length).toBeGreaterThan(0);
        });

        it("body contains at least one numbered step reference", () => {
          const body = content.split("---").slice(2).join("---");
          const hasNumberedStep = /(^|\n)\s*\d+\.\s/.test(body) || /Step\s+\d/.test(body);
          expect(hasNumberedStep).toBe(true);
        });
      });
    }
  });
});
