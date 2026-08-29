// ADF-COVERS(verification): REQ-010-071, REQ-053-012
/**
 * Regression tests for check_content_corruption.ts (REQ-010-071).
 *
 * Five fixture families required by REQ-010-068:
 *
 *  (1) normal     — a fully valid distributed-style document yields no findings
 *  (2) violations — each of the nine rule ids detects its minimal violation
 *  (3) boundaries — detection/non-detection edges (multi-line emphasis, glob
 *                   tokens, fences, tables, comment planes, frontmatter plane)
 *  (4) allowed    — the ALLOWED_USAGE enumeration suppresses a foreign-script
 *                   finding for the registered file only
 *  (5) reproduction — live-corpus corruption shapes found at introduction
 *                     (BEL replacing an id char, BEL replacing a prefix char,
 *                     h2->h4 jump, h1->h3 jump, unclosed code span in a table)
 */

import { describe, test, expect } from "bun:test";
import {
  checkContentCorruption,
  checkFile,
  ALLOWED_USAGE,
  type CorruptionReport,
  type CorruptionRuleId,
} from "./check_content_corruption.ts";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const ALL_RULE_IDS: readonly CorruptionRuleId[] = [
  "heading-hierarchy",
  "unclosed-code-block",
  "broken-link",
  "broken-code-span",
  "broken-emphasis",
  "control-char",
  "invalid-unicode",
  "foreign-script",
  "stale-reference",
];

function buildFixture(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-content-corr-"));
  fs.mkdirSync(path.join(root, ".git"), { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
  }
  return root;
}

function withFixture<T>(files: Record<string, string>, fn: (root: string) => T): T {
  const root = buildFixture(files);
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function idsOf(report: CorruptionReport): CorruptionRuleId[] {
  return report.findings.map((f) => f.rule_id);
}

function findingsOf(report: CorruptionReport, ruleId: CorruptionRuleId) {
  return report.findings.filter((f) => f.rule_id === ruleId);
}

const SKILL = "src/opencode/skills/agentdev-fixture/SKILL.md";

describe("正常例（REQ-010-068 normal case）", () => {
  test("a fully valid distributed-style document yields no findings", () => {
    const normal = [
      "---",
      "name: agentdev-fixture",
      "description: fixture",
      "---",
      "",
      "# タイトル",
      "",
      "## セクション",
      "",
      "本文。`コードスパン` と **強調** がある。日本語と English は正当。",
      "",
      "- リスト: `agentdev-x` 参照、glob は `src/opencode/**` と `**/*.md` 表記。",
      "- 正当リンク: [README](README.md)、外部 [docs](https://example.com)、アンカー [jump](#セクション)。",
      "",
      "```ts",
      "// fence 内は構造検査対象外",
      "const x = [not-a-link](missing.md);",
      "```",
      "",
      "```",
      "4連 fence の中に ``` を含めても閉じない。",
      "```",
      "",
      "<!-- 注記コメント [x](missing.md) -->",
      "",
      "### 子セクション",
      "",
      "| 列A | 列B |",
      "|---|---|",
      "| `単` | `独` |",
    ].join("\n");
    withFixture({ [SKILL]: normal, "src/opencode/skills/agentdev-fixture/README.md": "# Fixture README\n" }, (root) => {
      const report = checkContentCorruption(root);
      expect(report.ok).toBe(true);
      expect(report.findings).toEqual([]);
      expect(report.stats.scanned_files).toBe(2);
    });
  });
});

describe("違反例（REQ-010-068 violation cases）", () => {
  const violationCases: Array<{ rule: CorruptionRuleId; content: string }> = [
    {
      rule: "heading-hierarchy",
      content: "# タイトル\n\n### 飛び見出し\n",
    },
    {
      rule: "unclosed-code-block",
      content: "# タイトル\n\n```ts\nconst x = 1;\n",
    },
    {
      rule: "broken-link",
      content: "# タイトル\n\n[存在しない](missing-target.md) 参照。\n",
    },
    {
      rule: "broken-link",
      content: "# タイトル\n\n未閉鎖 [テキスト](no-close がある。\n",
    },
    {
      rule: "broken-code-span",
      content: "# タイトル\n\nこれは `閉じ忘れコード です。\n",
    },
    {
      rule: "broken-emphasis",
      content: "# タイトル\n\nこれは **閉じ忘れ強調 です。\n",
    },
    {
      rule: "control-char",
      content: "# タイトル\n\n制御文字 A\u0007B 混入。\n",
    },
    {
      rule: "invalid-unicode",
      content: "# タイトル\n\nBOM 本文混入 A﻿B。\n",
    },
    {
      rule: "foreign-script",
      content: "# タイトル\n\n異言語 привет 混入。\n",
    },
    {
      rule: "stale-reference",
      content: "# タイトル\n\n旧形式 ADR-001 参照。\n",
    },
  ];

  for (const { rule, content } of violationCases) {
    test(`detects ${rule}`, () => {
      withFixture({ [SKILL]: content }, (root) => {
        const report = checkContentCorruption(root);
        expect(report.ok).toBe(false);
        expect(findingsOf(report, rule).length).toBeGreaterThan(0);
      });
    });
  }

  test("stale-reference covers retired path links and legacy id forms", () => {
    withFixture(
      {
        [SKILL]:
          "# タイトル\n\n[retired](../../docs/requirements/retired/REQ-001.md)、ADR-012、REQ-0108-225 参照。\n",
      },
      (root) => {
        const report = checkContentCorruption(root);
        const stale = findingsOf(report, "stale-reference");
        expect(stale.length).toBe(3);
      },
    );
  });
});

describe("境界例（REQ-010-068 boundary cases）", () => {
  test("heading level step-up of one is not flagged", () => {
    withFixture(
      { [SKILL]: "# H1\n\n## H2\n\n### H3\n\n#### H4\n" },
      (root) => {
        const report = checkContentCorruption(root);
        expect(report.ok).toBe(true);
      },
    );
  });

  test("multi-line emphasis inside one paragraph is valid CommonMark", () => {
    withFixture(
      {
        [SKILL]: "# タイトル\n\n**この強調は\n複数行にまたがる\n正当な記法**です。\n",
      },
      (root) => {
        expect(idsOf(checkContentCorruption(root))).not.toContain("broken-emphasis");
      },
    );
  });

  test("glob token lines do not trigger broken-emphasis", () => {
    withFixture(
      {
        [SKILL]:
          "# タイトル\n\n- **STEP-S3-4 docs/** 変更なら targeted docs guard** を実行する\n\n`docs/**`、`**/*.md`、`/usr/**` を含む文。\n",
      },
      (root) => {
        expect(findingsOf(checkContentCorruption(root), "broken-emphasis")).toEqual([]);
      },
    );
  });

  test("syntax corruption inside a fence is not flagged (structural plane)", () => {
    withFixture(
      {
        [SKILL]:
          "# タイトル\n\n```\n[未閉鎖](broken\n**壊れ強調\n### ジャンプ見出し\n`未閉鎖スパン\n```\n",
      },
      (root) => {
        const report = checkContentCorruption(root);
        expect(idsOf(report)).toEqual([]);
      },
    );
  });

  test("character-plane checks still apply inside fences", () => {
    withFixture({ [SKILL]: "# タイトル\n\n```\nBEL\u0007混入\n```\n" }, (root) => {
      const report = checkContentCorruption(root);
      expect(findingsOf(report, "control-char").length).toBe(1);
    });
  });

  test("table rows never pair markers across rows", () => {
    withFixture(
      {
        [SKILL]:
          "# タイトル\n\n| A | B |\n|---|---|\n| 奇数 ` 開 |\n| 奇数 ` 開 |\n",
      },
      (root) => {
        // each table row has an odd backtick count on its own; row-local
        // checking must keep both detections (a paragraph merge would cancel
        // them into an even total)
        const report = checkContentCorruption(root);
        expect(findingsOf(report, "broken-code-span").length).toBe(2);
      },
    );
  });

  test("frontmatter is exempt from every plane", () => {
    withFixture(
      {
        [SKILL]:
          "---\nname: привет\u0007混入\n---\n\n# タイトル\n\n本文は正常。\n",
      },
      (root) => {
        expect(idsOf(checkContentCorruption(root))).toEqual([]);
      },
    );
  });

  test("HTML comment regions are exempt from structural checks", () => {
    withFixture(
      {
        [SKILL]:
          "# タイトル\n\n<!--\n[未閉鎖](broken\n#### h4ジャンプ\n-->\n\n本文は正常。\n",
      },
      (root) => {
        expect(idsOf(checkContentCorruption(root))).toEqual([]);
      },
    );
  });

  test("file-level unclosed fence detection reports odd marker count", () => {
    withFixture(
      {
        [SKILL]: "# タイトル\n\n```ts\nconst x = 1;\n```\n\n本文。\n\n~~~\n未閉鎖\n",
      },
      (root) => {
        const report = checkContentCorruption(root);
        const f = findingsOf(report, "unclosed-code-block");
        expect(f.length).toBe(1);
        expect(f[0].matched).toBe("3 fences");
      },
    );
  });

  test("checkFile reports findings with the checked file path", () => {
    withFixture({ [SKILL]: "# タイトル\n\n**壊れ\n" }, (root) => {
      const findings = checkFile(SKILL, root);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].file).toBe(path.join(root, ...SKILL.split("/")));
    });
  });
});

describe("許容例（REQ-010-068 allowed-usage enumeration）", () => {
  test("a registered allowed-usage entry suppresses only that file+rule", () => {
    const cyrillic = "# タイトル\n\nпривет 語彙。\n";
    withFixture(
      {
        [SKILL]: cyrillic,
        "src/opencode/skills/agentdev-other/SKILL.md": cyrillic,
      },
      (root) => {
        ALLOWED_USAGE.push({
          file: SKILL,
          rule_id: "foreign-script",
          rationale: "test fixture: intentional foreign-script vocabulary",
        });
        try {
          const report = checkContentCorruption(root);
          // "привет" is 6 characters, each reported individually
          expect(findingsOf(report, "foreign-script").length).toBe(6);
          expect(findingsOf(report, "foreign-script")[0].file).toContain("agentdev-other");
        } finally {
          ALLOWED_USAGE.length = 0;
        }
      },
    );
  });

  test("an unregistered file is still flagged", () => {
    withFixture(
      { [SKILL]: "# タイトル\n\nпривет 語彙。\n" },
      (root) => {
        const report = checkContentCorruption(root);
        expect(findingsOf(report, "foreign-script").length).toBe(6);
      },
    );
  });
});

describe("再現例（REQ-010-068 reproductions from the live corpus）", () => {
  test("BEL replacing an id char (intake-promote.md:70 at introduction)", () => {
    withFixture(
      { [SKILL]: "- intake 成果物の参照先は inbox/ を promoted/ に反映（\u0007ccepted/ は廃止済み）\n" },
      (root) => {
        const report = checkContentCorruption(root);
        expect(findingsOf(report, "control-char").length).toBe(1);
      },
    );
  });

  test("BEL replacing a prefix char (case-run-execution-adapter SKILL.md:38 at introduction)", () => {
    withFixture(
      { [SKILL]: "        実際に PR 作成操作（\u0007gentdev_gh pr_create）による PR 作成（PR URL を result に格納）\n" },
      (root) => {
        const report = checkContentCorruption(root);
        expect(findingsOf(report, "control-char").length).toBe(1);
      },
    );
  });

  test("h2 -> h4 heading jump (decision-file-manager SKILL.md:49 at introduction)", () => {
    withFixture(
      { [SKILL]: "# Decisionファイル管理\n\n## 自走時採番契約（採番と配置）\n\n#### 基準番号帯例外\n" },
      (root) => {
        const report = checkContentCorruption(root);
        const f = findingsOf(report, "heading-hierarchy");
        expect(f.length).toBe(1);
        expect(f[0].description).toContain("h2");
        expect(f[0].description).toContain("h4");
      },
    );
  });

  test("h1 -> h3 heading jump (capture-entry-template.md:7 at introduction)", () => {
    withFixture(
      { [SKILL]: "# 学びエントリの基準テンプレート\n\n### フィールド記述ガイドライン\n" },
      (root) => {
        expect(findingsOf(checkContentCorruption(root), "heading-hierarchy").length).toBe(1);
      },
    );
  });

  test("unclosed inline code span in a table row (req-structure-review.md:134 at introduction)", () => {
    withFixture(
      {
        [SKILL]:
          "| Markdown 構文破損 | frontmatter delimiter、コードフェンス、インラインコードの対応破綻、正規表現の truncate | `引数が数値のみ（`^\\d+---` 等の regex truncate |\n",
      },
      (root) => {
        const report = checkContentCorruption(root);
        expect(findingsOf(report, "broken-code-span").length).toBe(1);
      },
    );
  });
});
