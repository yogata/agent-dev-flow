// Anchor test for the case-revise Definition revision boundary
// (TS-008, Issue #2810). Pins the distribution artifacts to the canonical
// requirements:
//   - the case-revise command (public interface / dispatch only):
//     src/opencode/commands/agentdev/case-revise.md
//   - the case-revise workflow skill (workflow implementation body):
//     src/opencode/skills/agentdev-workflow-case-revise/ (SKILL.md + references)
//   - the case-revise templates:
//     src/opencode/skills/agentdev-workflow-templates/templates/case-revise/
//   - the requirements:
//     docs/requirements/REQ-062.md (all requirement rows)
//     docs/requirements/retired/REQ-033.md (retired successor routing)
//   - the idempotency key section of the definition-readiness Design:
//     docs/designs/workflows/definition-readiness.md
// as a permanent regression guard:
//   - every REQ row of the case-revise execution contract REQ is anchored to
//     a distribution artifact clause that specifies the behavior
//   - Amendment PR idempotency: no duplicate generation for the same
//     re-agreed change, reuse of an existing Amendment PR
//   - completed Issue protection: no rollback of completed Issues confirmed
//     as unaffected
//   - the idempotency enumeration agreement between the REQ rows and the
//     definition-readiness Design (TS-008)

// ADF-COVERS(verification): REQ-062-001, REQ-062-002, REQ-062-003, REQ-062-004, REQ-062-005, REQ-062-006, REQ-062-007, REQ-062-008

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const COMMAND_REL = "src/opencode/commands/agentdev/case-revise.md";
const SKILL_REL = "src/opencode/skills/agentdev-workflow-case-revise/SKILL.md";
const REF_REV_REL =
  "src/opencode/skills/agentdev-workflow-case-revise/references/definition-revision.md";
const REF_IMPACT_REL =
  "src/opencode/skills/agentdev-workflow-case-revise/references/impact-reassessment.md";
const REF_HANDOFF_REL =
  "src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md";
const TPL_PR_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/case-revise/amendment-pr.md";
const TPL_REPORT_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/case-revise/root-case-report.md";
const REQ_062_REL = "docs/requirements/REQ-062.md";
const REQ_033_RET_REL = "docs/requirements/retired/REQ-033.md";
const DEF_READINESS_REL = "docs/designs/workflows/definition-readiness.md";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

/** Extract the markdown body following a heading, until the next heading of the same level. */
function extractHeadingSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const level = heading.match(/^#+/)?.[0].length ?? 0;
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start === -1) return "";
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (new RegExp(`^#{1,${level}}\\s`).test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

/** REQ row -> distribution artifact clause pairs (anchor matrix). */
const ROW_ANCHORS: Array<[string, string, RegExp]> = [
  ["REQ-062-001", SKILL_REL, /再合意済みの Definition 変更の既存 Case への反映/],
  ["REQ-062-002", REF_REV_REL, /新しい要求、Decision、対象範囲を生成しない/],
  ["REQ-062-003", REF_REV_REL, /実変更なし（差分が空）: Amendment PR を作成せず/],
  ["REQ-062-004", REF_IMPACT_REL, /影響なしと確認できた完了済み Issue は巻き戻さず/],
  ["REQ-062-005", REF_REV_REL, /重複生成しない/],
  ["REQ-062-006", REF_HANDOFF_REL, /execution contract \/ execution structure 再確定は case-ready を経由する/],
  ["REQ-062-007", REF_HANDOFF_REL, /作成時のテンプレート構造と必須セクションを維持する/],
  ["REQ-062-008", SKILL_REL, /中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束する/],
];

describe("distribution artifacts exist", () => {
  const files = [
    COMMAND_REL,
    SKILL_REL,
    REF_REV_REL,
    REF_IMPACT_REL,
    REF_HANDOFF_REL,
    TPL_PR_REL,
    TPL_REPORT_REL,
  ];

  for (const rel of files) {
    test(`exists: ${rel}`, () => {
      expect(() => read(rel)).not.toThrow();
    });
  }
});

describe("case-revise command is public interface and dispatch only", () => {
  const doc = read(COMMAND_REL);

  test("dispatches to the workflow skill", () => {
    expect(doc).toContain("`agentdev-workflow-case-revise`");
    expect(doc).toMatch(/workflow 実装本体を `agentdev-workflow-case-revise` スキルへ委譲する/);
  });

  test("does not own semantic judgment (req-define owns it)", () => {
    expect(doc).toMatch(/新しい要求、Decision、対象範囲を自身では決定せず/);
    expect(doc).toMatch(/意味判断は req-define が所有する/);
  });
});

describe("case-revise workflow skill structure", () => {
  const doc = read(SKILL_REL);

  test("owns revision acceptance, no-change detection, Amendment PR idempotency, impact reassessment, handoff as STEPs", () => {
    for (const step of [
      "再合意内容の受入確認",
      "実変更判定と冪等検索",
      "Definition Amendment PR 作成",
      "影響再評価",
      "Issue 本文更新と case-ready 引き継ぎ",
    ]) {
      expect(doc).toContain(step);
    }
  });

  test("declares the idempotency branch (reuse, no duplicates)", () => {
    expect(doc).toMatch(/同じ再合意内容に対応する既存 Definition Amendment PR を検出した場合は再利用し、STEP-3 を省略して STEP-4 へ進む（重複生成しない）/);
  });

  test("declares the no-change branch (no empty Amendment PR)", () => {
    expect(doc).toMatch(/実変更なし時は case-ready 引き継ぎへ/);
    expect(doc).toMatch(/空の Amendment PR を作る経路は存在しない/);
  });

  test("adds no case-revise-specific case state", () => {
    expect(doc).toMatch(/case-revise 専用の Case 状態は追加しない/);
  });
});

describe("Definition revision scenarios", () => {
  const doc = read(REF_REV_REL);

  test("(a) un-agreed change is rejected back to req-define", () => {
    expect(doc).toMatch(/再合意済みでない変更の反映要求は受け付けず、req-define へ差し戻して停止する/);
  });

  test("(b) re-agreed change is projected verbatim (no reinterpretation)", () => {
    expect(doc).toMatch(/req_draft を再解釈・再設計せず、合意済み内容をそのまま後続 STEP へ投影する/);
  });

  test("(c) existing Amendment PR is reused before creating a new one", () => {
    expect(doc).toMatch(/既存 PR を再利用し、STEP-3 を省略して STEP-4 へ進む（重複生成しない）/);
    expect(doc).toMatch(/作成前に既存 PR の再検索を実行し、検出時は新規作成を取りやめて再利用へ切り替える/);
  });
});

describe("Impact reassessment protects completed Issues (REQ-062-004)", () => {
  const doc = read(REF_IMPACT_REL);

  test("completed Issues are included in impact evaluation, not excluded", () => {
    expect(doc).toMatch(/完了済み Issue を含めて影響有無を判定する/);
  });

  test("only affected Issues are re-evaluation targets", () => {
    expect(doc).toMatch(/影響があると判定した Issue のみを再評価対象としてマーキングする/);
  });

  test("unaffected completed Issues are kept (no rollback)", () => {
    expect(doc).toMatch(/影響なしと確認できた完了済み Issue は巻き戻さず、完了状態のまま維持する/);
  });

  test("candidate absence is not proof of no-impact", () => {
    expect(doc).toMatch(/候補の不在を影響なしの証明として扱わない/);
  });
});

describe("Idempotency key enumeration agreement (TS-008)", () => {
  const designDoc = read(DEF_READINESS_REL);
  const designSection = extractHeadingSection(designDoc, "## 冪等キー");

  test("definition-readiness Design owns the idempotency key section", () => {
    expect(designSection).not.toBe("");
  });

  test("Amendment PR is covered by the Design idempotency key enumeration", () => {
    // REQ-062-005 forbids duplicate generation of the same re-agreed
    // Amendment PR. The Design enumeration that owns the duplicate
    // detection keys must name the Amendment PR.
    expect(designSection).toContain("Amendment PR");
  });

  test("Design lifecycle pins the Amendment PR creation condition and no-rollback", () => {
    const lifecycle = extractHeadingSection(designDoc, "## Definition PR lifecycle");
    expect(lifecycle).toMatch(/Definition Amendment PR: case-revise が再合議済みの実変更がある場合のみ作成する/);
    expect(lifecycle).toMatch(/merge を巻き戻さず、canonical Definition を基準に再開する/);
  });

  test("skill pins the reuse list and forbids duplicates (same re-agreed change)", () => {
    expect(read(SKILL_REL)).toMatch(/同じ再合意内容に対応する既存 Definition Amendment PR を重複生成しない/);
  });

  test("resume protocol reuses interrupted artifacts without rollback", () => {
    expect(read(SKILL_REL)).toMatch(/中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束する/);
  });
});

describe("REQ-033 retired state agrees with REQ-062-008 (history kept in Git only)", () => {
  const retired = read(REQ_033_RET_REL);

  test("REQ-033 is retired with a successor routing note", () => {
    expect(retired).toMatch(/^status: retired$/m);
    expect(retired).toMatch(/req-define → case-revise → case-ready 経路/);
    expect(retired).toMatch(/\/agentdev\/issue/);
    expect(retired).toMatch(/agentdev_gh\.issue_update/);
  });

  test("retirement note forbids deprecated aliases (Git history only)", () => {
    expect(retired).toMatch(/deprecated alias、旧経路、移行用呼称は残さず、履歴は Git 履歴のみで保持する/);
  });

  test("distribution artifacts keep no deprecated alias of case-update", () => {
    expect(read(COMMAND_REL)).not.toMatch(/case-update/);
    expect(read(SKILL_REL)).not.toMatch(/case-update/);
  });
});

describe("case-revise templates carry required sections", () => {
  const prDoc = read(TPL_PR_REL);

  test("amendment-pr template holds the required sections", () => {
    for (const section of [
      "## 概要",
      "## 実行識別情報",
      "## Definition 変更内容",
      "## 影響再評価",
      "## Findings / Capture候補",
    ]) {
      expect(prDoc).toContain(section);
    }
  });

  test("amendment-pr template records no-impact confirmation", () => {
    expect(prDoc).toContain("影響なし確認済み（完了済み Issue の維持）");
  });

  test("report template records Amendment PR idempotency outcomes", () => {
    const report = read(TPL_REPORT_REL);
    expect(report).toMatch(/作成: #\{pr_N\} \/ 再利用（既存 PR: #\{pr_N\}）\/ 不作成（実変更なし、case-ready へ引き継ぎ）\}/);
    expect(report).toContain("影響なし確認済みの完了済み Issue は維持");
    expect(report).toContain("case-ready");
  });
});

describe("requirement anchors (canonical REQ files)", () => {
  const doc062 = read(REQ_062_REL);

  test("all REQ-062 rows exist in the canonical requirement file", () => {
    for (let i = 1; i <= 8; i++) {
      const id = `REQ-062-${String(i).padStart(3, "0")}`;
      expect(doc062.split(/\r?\n/).some((l) => l.startsWith(`| ${id} |`))).toBe(true);
    }
  });

  test("REQ-062-005 forbids duplicate Amendment PR generation", () => {
    const row = doc062.split(/\r?\n/).find((l) => l.startsWith("| REQ-062-005 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("既存 Definition Amendment PR を重複生成しない");
  });

  test("REQ-062-004 protects unaffected completed Issues", () => {
    const row = doc062.split(/\r?\n/).find((l) => l.startsWith("| REQ-062-004 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("影響がある Issue のみを再評価対象とし");
    expect(row!).toContain("巻き戻さない");
  });
});

describe("row anchor matrix (REQ rows -> distribution artifact clauses)", () => {
  for (const [reqId, rel, pattern] of ROW_ANCHORS) {
    test(`${reqId} is anchored in ${path.basename(rel)}`, () => {
      expect(read(rel)).toMatch(pattern);
    });
  }
});
