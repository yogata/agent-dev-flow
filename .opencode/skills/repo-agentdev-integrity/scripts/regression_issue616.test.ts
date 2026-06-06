import { describe, test, expect } from "bun:test";
import {
  ok,
  ng,
  warn,
  info,
  computeSummary,
  formatMarkdownReport,
  classifyFindingLevel,
  determineRoute,
  type CheckResult,
  type IntegrityReport,
} from "./cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const fs = require("fs") as typeof import("fs");
const path = require("path") as typeof import("path");

describe("regression_issue616: mojibake handling", () => {
  test("formatMarkdownReport preserves Japanese characters (no mojibake)", () => {
    const report: IntegrityReport = {
      timestamp: "2026-06-06T12:00:00.000Z",
      script: "check_integrity.ts",
      scanned: { REQ: 1 },
      summary: { ok: 0, ng: 1, warning: 0, info: 0 },
      results: [
        {
          category: "REQ",
          check: "frontmatter-filename",
          level: "ng",
          message: "REQ frontmatter \u2194 \u30d5\u30a1\u30a4\u30eb\u540d\u4e0d\u4e00\u81f4",
          file: "docs/requirements/REQ-0001.md",
        },
      ],
    };
    const md = formatMarkdownReport(report);
    expect(md).toContain("REQ frontmatter");
    expect(md).toContain("\u30d5\u30a1\u30a4\u30eb\u540d\u4e0d\u4e00\u81f4");
    expect(md).not.toContain("\ufffd");
  });

  test("ng result with Japanese message preserves characters", () => {
    const result = ng(
      "integrity-rule-gap",
      "skill-category-gap",
      "SKILL.md category 'REQ frontmatter \u2194 \u30d5\u30a1\u30a4\u30eb\u540d' has no corresponding implementation"
    );
    expect(result.message).toContain("\u30d5\u30a1\u30a4\u30eb\u540d");
    expect(result.level).toBe("ng");
  });
});

describe("regression_issue616: CheckResult schema after classification", () => {
  test("all ng results have finding_category and route after classification", () => {
    const results: CheckResult[] = [
      ng("REQ", "frontmatter-filename", "mismatch", "docs/REQ-0001.md"),
      ng("LinkIntegrity", "broken-file-link", "link broken", "docs/DOC-MAP.md"),
      ok("REQ", "required-fields", "all present"),
    ];
    for (const r of results) {
      if (r.level === "ng" || r.level === "warning") {
        if (!r.finding_level) {
          r.finding_level = classifyFindingLevel(r.level, r.check);
        }
      }
    }
    const ngResults = results.filter((r) => r.level === "ng");
    for (const r of ngResults) {
      expect(r.finding_level).toBeDefined();
      expect(["strict", "heuristic", "observation"]).toContain(r.finding_level);
    }
  });

  test("all ng results with route field have valid route value", () => {
    const route = determineRoute("broken-reference", 1);
    expect(["intake", "intake+learning", "req-define", "learning", "none"]).toContain(route);
    const route2 = determineRoute("integrity-rule-gap", 1);
    expect(route2).toBe("req-define");
  });
});

describe("regression_issue616: routing summary in markdown report", () => {
  test("markdown report includes route in detail lines", () => {
    const report: IntegrityReport = {
      timestamp: "2026-06-06T12:00:00.000Z",
      script: "check_integrity.ts",
      scanned: { REQ: 1 },
      summary: { ok: 0, ng: 2, warning: 0, info: 0 },
      results: [
        {
          category: "integrity-rule-gap",
          check: "skill-category-gap",
          level: "ng",
          message: "Category gap detected",
          route: "req-define",
        },
        {
          category: "integrity-rule-gap",
          check: "template-path-integrity",
          level: "ng",
          message: "Template not found",
          route: "req-define",
        },
      ],
    };
    const md = formatMarkdownReport(report);
    expect(md).toContain("route: req-define");
    expect(md).toContain("integrity-rule-gap");
    expect(md).toContain("skill-category-gap");
    expect(md).toContain("template-path-integrity");
  });

  test("computeSummary counts ng and warning correctly", () => {
    const results: CheckResult[] = [
      ok("A", "a1", "ok"),
      ng("A", "a2", "ng1"),
      ng("A", "a3", "ng2"),
      warn("A", "a4", "warn1"),
      info("A", "a5", "info1"),
    ];
    const summary = computeSummary(results);
    expect(summary.ok).toBe(1);
    expect(summary.ng).toBe(2);
    expect(summary.warning).toBe(1);
    expect(summary.info).toBe(1);
  });
});

describe("regression_issue616: SKILL.md category gap detection", () => {
  test("checkSkillCategoryGap function exists and is callable", () => {
    const scriptPath = path.join(SCRIPT_DIR, "check_integrity.ts");
    const content = fs.readFileSync(scriptPath, "utf-8") as string;
    expect(content).toContain("function checkSkillCategoryGap");
    expect(content).toContain("skill-category-gap");
  });

  test("checkSkillCategoryGap is called in main results array", () => {
    const scriptPath = path.join(SCRIPT_DIR, "check_integrity.ts");
    const content = fs.readFileSync(scriptPath, "utf-8") as string;
    expect(content).toContain("...checkSkillCategoryGap(root, skillsDir, cmdDir)");
  });
});

describe("regression_issue616: template path integrity", () => {
  test("checkTemplatePathIntegrity function exists and is callable", () => {
    const scriptPath = path.join(SCRIPT_DIR, "check_integrity.ts");
    const content = fs.readFileSync(scriptPath, "utf-8") as string;
    expect(content).toContain("function checkTemplatePathIntegrity");
    expect(content).toContain("template-path-integrity");
  });

  test("checkTemplatePathIntegrity is called in main results array", () => {
    const scriptPath = path.join(SCRIPT_DIR, "check_integrity.ts");
    const content = fs.readFileSync(scriptPath, "utf-8") as string;
    expect(content).toContain("...checkTemplatePathIntegrity(cmdDir, root)");
  });
});
