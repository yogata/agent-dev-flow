// Anchor test for the case-ready Definition acceptance boundary
// (TS-003, TS-008, TS-010, Issue #2809). Pins the distribution artifacts to
// the canonical requirements:
//   - the case-ready command (public interface / dispatch only):
//     src/opencode/commands/agentdev/case-ready.md
//   - the case-ready workflow skill (workflow implementation body):
//     src/opencode/skills/agentdev-workflow-case-ready/ (SKILL.md + references)
//   - the case-ready templates:
//     src/opencode/skills/agentdev-workflow-templates/templates/case-ready/
//   - the requirements:
//     docs/requirements/REQ-061.md (all requirement rows)
//     docs/requirements/REQ-035.md (Root/Child SSoT separation, Standard
//     single execution unit)
//   - the idempotency key section of the definition-readiness Design:
//     docs/designs/workflows/definition-readiness.md
// as a permanent regression guard:
//   - every REQ row of the case-ready execution contract REQ is anchored to
//     a distribution artifact clause that specifies the behavior
//   - Definition acceptance scenarios: no-extra-approval merge, no empty
//     Definition PR path, HITL stop, CI failure keeps the existing PR
//   - idempotency key enumeration agreement between the REQ rows and the
//     definition-readiness Design

// ADF-COVERS(verification): REQ-061-001, REQ-061-002, REQ-061-003, REQ-061-004, REQ-061-005, REQ-061-006, REQ-061-007, REQ-061-008, REQ-061-009, REQ-061-010, REQ-061-011, REQ-061-012, REQ-061-013, REQ-061-014, REQ-061-015, REQ-061-016, REQ-061-017, REQ-061-018, REQ-061-019, REQ-061-020, REQ-061-021, REQ-061-022, REQ-061-023, REQ-061-024, REQ-061-025, REQ-061-026, REQ-061-027, REQ-061-028
// ADF-COVERS(verification): REQ-035-013, REQ-035-014, REQ-035-015

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const COMMAND_REL = "src/opencode/commands/agentdev/case-ready.md";
const SKILL_REL = "src/opencode/skills/agentdev-workflow-case-ready/SKILL.md";
const REF_DEF_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md";
const REF_DEC_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/decision-acceptance.md";
const REF_EC_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/execution-contract.md";
const REF_STRUCT_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/execution-structure.md";
const REF_READY_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md";
const TPL_ROOT_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/case-ready/root-case.md";
const TPL_REPORT_REL =
  "src/opencode/skills/agentdev-workflow-templates/templates/case-ready/root-case-report.md";
const REQ_061_REL = "docs/requirements/REQ-061.md";
const REQ_035_REL = "docs/requirements/REQ-035.md";
const CASE_READY_DESIGN_REL = "docs/designs/commands/case-ready.md";

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
  ["REQ-061-001", REF_DEF_REL, /忠実性確認|忠実な投影であることを確認/],
  ["REQ-061-002", REF_DEF_REL, /追加の人間承認を要求せず/],
  ["REQ-061-003", REF_DEF_REL, /HITL 停止条件/],
  ["REQ-061-004", REF_DEF_REL, /canonical Definition を再取得|merge を巻き戻さな/],
  ["REQ-061-005", REF_DEC_REL, /accepted への状態遷移を実行/],
  ["REQ-061-006", REF_EC_REL, /execution contract として Root Case 本文へ確定/],
  ["REQ-061-007", REF_STRUCT_REL, /Standard \/ Epic 確定|Root Case 自身を単一 execution unit とする/],
  ["REQ-061-008", REF_STRUCT_REL, /連結成分（必須依存のみをエッジとする）/],
  ["REQ-061-009", REF_STRUCT_REL, /単独根（1 operation_unit だけの連結成分）は Epic 化せず/],
  ["REQ-061-010", REF_STRUCT_REL, /Epic サイズ上限と Wave 同時実行上限/],
  ["REQ-061-011", REF_STRUCT_REL, /無関係な operation_unit 群を単一 Epic へ機械的に集約しない/],
  ["REQ-061-012", REF_STRUCT_REL, /構成推論の根拠を記録/],
  ["REQ-061-013", REF_STRUCT_REL, /実行方法（並列、直列）を技術的依存関係に基づいて明記/],
  ["REQ-061-014", REF_STRUCT_REL, /スコープ重複を検知/],
  ["REQ-061-015", REF_STRUCT_REL, /識別子中心とし/],
  ["REQ-061-016", REF_STRUCT_REL, /最新状態を再確認/],
  ["REQ-061-017", REF_EC_REL, /Markdown 行構造（LF、セクション間空行、インデント）を保持/],
  ["REQ-061-018", REF_STRUCT_REL, /構成検証（上限、依存維持、全割当）/],
  ["REQ-061-019", REF_STRUCT_REL, /重複をファイル単位で前置検出/],
  ["REQ-061-020", REF_DEC_REL, /関連REQ宣言（related_reqs）に含まれ、かつ status が proposed/],
  ["REQ-061-021", REF_DEC_REL, /受理可否を評価/],
  ["REQ-061-022", REF_DEC_REL, /重複する状態遷移や承認記録を生成しない/],
  ["REQ-061-023", REF_READY_REL, /未分類がないことを確認|ready へ遷移させず/],
  ["REQ-061-024", REF_READY_REL, /実行準備条件を満たした場合のみ Root Case を ready に遷移/],
  ["REQ-061-025", REF_READY_REL, /blocked、failed、中断した場合は draft \/ RU を保持する/],
  ["REQ-061-026", REF_READY_REL, /main ブランチの作業ディレクトリとリモートの同期を確認/],
  ["REQ-061-027", REF_READY_REL, /merge 済み Definition（Definition PR）を再利用/],
  ["REQ-061-028", REF_DEF_REL, /ready へ遷移せず、既存 PR を保持/],
];

describe("distribution artifacts exist", () => {
  const files = [
    COMMAND_REL,
    SKILL_REL,
    REF_DEF_REL,
    REF_DEC_REL,
    REF_EC_REL,
    REF_STRUCT_REL,
    REF_READY_REL,
    TPL_ROOT_REL,
    TPL_REPORT_REL,
  ];

  for (const rel of files) {
    test(`exists: ${rel}`, () => {
      expect(() => read(rel)).not.toThrow();
    });
  }
});

describe("case-ready command is public interface and dispatch only", () => {
  const doc = read(COMMAND_REL);

  test("dispatches to the workflow skill", () => {
    expect(doc).toContain("`agentdev-workflow-case-ready`");
    expect(doc).toMatch(/workflow 実装本体を `agentdev-workflow-case-ready` スキルへ委譲する/);
  });

  test("workflow skill declares the 3-layer separation contract", () => {
    expect(read(SKILL_REL)).toMatch(/公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち/);
  });
});

describe("case-ready workflow skill structure", () => {
  const doc = read(SKILL_REL);

  test("owns Definition acceptance, EC finalization, Standard/Epic, gate, ready, cleanup, idempotency as STEPs", () => {
    for (const step of [
      "Definition PR 受入",
      "canonical 再取得",
      "Decision 受理評価",
      "execution contract 確定",
      "実行構造確定",
      "検証ゲートと ready 遷移",
      "draft / RU 削除と同期確認",
    ]) {
      expect(doc).toContain(step);
    }
  });

  test("declares the idempotency branch (reuse, no duplicates)", () => {
    expect(doc).toMatch(/merge 済み Definition、既存 Child Issue、既存 Wave \/ 依存構造、Decision 受理記録を再利用/);
  });

  test("keeps saving bodies delegated to Capability Skills", () => {
    expect(doc).toMatch(/保存実体は Capability Skill へ委譲する/);
  });
});

describe("Definition acceptance scenarios (TS-003)", () => {
  const doc = read(REF_DEF_REL);

  test("(a) agreed projection: merges without extra approval", () => {
    expect(doc).toMatch(/新しい意味判断を必要としない（上記3検査が pass し、合意済み意味内容からの逸脱がない）場合、追加の人間承認を要求せず/);
  });

  test("(b) no Definition PR (no-change case): proceeds without creating an empty PR", () => {
    expect(doc).toMatch(/空の Definition PR を作成する経路は存在しない/);
    expect(doc).toMatch(/現行 main の状態を canonical Definition として採用/);
  });

  test("(c) new semantic judgment required: HITL stop with the existing PR kept", () => {
    expect(doc).toMatch(/停止し、既存 PR を保持したままユーザー判断を求める/);
  });

  test("(d) CI failure: no ready transition, existing PR kept, re-runnable", () => {
    expect(doc).toMatch(/CI \/ 品質検査失敗時は ready へ遷移せず、既存 PR を保持したまま停止する/);
    expect(doc).toMatch(/修復後に case-ready を再実行する（既存 PR を再利用する）/);
  });

  test("post-merge refetch never reverts the merge", () => {
    expect(doc).toMatch(/merge を巻き戻さず canonical Definition を基準として後続 STEP へ進む/);
  });
});

describe("Idempotency key enumeration agreement (TS-008)", () => {
  const readyDoc = read(REF_READY_REL);
  const designDoc = read(CASE_READY_DESIGN_REL);
  const designSection = extractHeadingSection(designDoc, "## 冪等性");

  test("case-ready Design owns the idempotency section", () => {
    expect(designSection).not.toBe("");
  });

  test("REQ enumeration (reuse targets) is covered by the Design enumeration", () => {
    // REQ-061-027 enumerates: Root Case, Definition PR, Child Issue,
    // Wave / 依存構造, Decision 受理記録. The successor case-ready Design
    // idempotency section enumerates the reuse targets in v4 wording.
    for (const key of [
      "merge 済み Definition",
      "既存 Child Issue",
      "既存 Wave / 依存構造",
      "Decision 受理記録",
    ]) {
      expect(designSection).toContain(key);
    }
  });

  test("skill cleanup reference pins the reuse list and forbids duplicates", () => {
    for (const key of [
      "merge 済み Definition（Definition PR）を再利用",
      "既存 Child Issue を再利用",
      "既存 Wave / 依存構造を再利用",
      "Decision の受理記録（accepted 遷移済み）を再利用",
    ]) {
      expect(readyDoc).toContain(key);
    }
    expect(readyDoc).toMatch(/merge を巻き戻さない/);
  });

  test("resume protocol re-anchors to merged canonical Definition", () => {
    const skillDoc = read(SKILL_REL);
    expect(skillDoc).toMatch(/merge を巻き戻さず、canonical Definition（merge 済み main の docs 永続文書）を基準として再開する/);
  });
});

describe("SSoT separation (TS-010)", () => {
  const structDoc = read(REF_STRUCT_REL);

  test("REQ-035-013..015 exist in the canonical requirement", () => {
    const doc = read(REQ_035_REL);
    const r13 = doc.split(/\r?\n/).find((l) => l.startsWith("| REQ-035-013 |"));
    const r14 = doc.split(/\r?\n/).find((l) => l.startsWith("| REQ-035-014 |"));
    const r15 = doc.split(/\r?\n/).find((l) => l.startsWith("| REQ-035-015 |"));
    expect(r13).toBeDefined();
    expect(r13!).toContain("orchestration SSoT");
    expect(r13!).toContain("execution SSoT");
    expect(r14).toBeDefined();
    expect(r14!).toContain("単独で対象範囲");
    expect(r15).toBeDefined();
    expect(r15!).toContain("儀式的な Child Issue を作成しない");
  });

  test("distribution artifact declares Root orchestration / Child execution SSoT", () => {
    expect(structDoc).toMatch(/Root Case を Case 全体、Definition 参照、対象範囲、全体制約、Issue 分解、Wave \/ 依存関係、全体進捗の orchestration SSoT/);
    expect(structDoc).toMatch(/各 Child Issue を各 case-run が消費する execution contract の execution SSoT/);
    expect(structDoc).toMatch(/親 Root Case の自由記述に依存せず/);
  });

  test("Standard creates no ceremonial child issue", () => {
    expect(structDoc).toMatch(/Child Issue を作成しない（儀式的な Child Issue を作る経路は存在しない）/);
  });

  test("child issues are self-contained", () => {
    expect(structDoc).toMatch(/単独自足の execution contract 要件を満たす/);
  });
});

describe("case-ready templates carry required sections", () => {
  const rootDoc = read(TPL_ROOT_REL);

  test("root-case template holds the required sections", () => {
    for (const section of [
      "## 概要",
      "## 実行識別情報",
      "## 対象 REQ",
      "## Definition Package",
      "## Execution Contract",
      "## Case 状態と次工程",
      "## レビュー判断",
    ]) {
      expect(rootDoc).toContain(section);
    }
  });

  test("root-case template Execution Contract section enumerates the settled elements", () => {
    const ec = extractHeadingSection(rootDoc, "## Execution Contract");
    for (const key of [
      "対象範囲",
      "変更対象成果物",
      "関連 REQ / Decision / Design",
      "完了条件",
      "テスト戦略",
      "必須品質統制",
      "scope-affecting impact candidate",
      "review 発動契約",
      "work_type / scale / Issue structure",
    ]) {
      expect(ec).toContain(key);
    }
  });

  test("report template records the Definition PR outcome and the gate", () => {
    const report = read(TPL_REPORT_REL);
    expect(report).toMatch(/Definition PR: \{merge 済み: #\{pr_N\}/);
    expect(report).toMatch(/不存在（実変更なし）\}/);
    expect(report).toMatch(/検証対応要否の最終ゲート/);
    expect(report).toContain("case-run");
  });
});

describe("requirement anchors (canonical REQ files)", () => {
  const doc061 = read(REQ_061_REL);

  test("all REQ-061 rows exist in the canonical requirement file", () => {
    for (let i = 1; i <= 28; i++) {
      const id = `REQ-061-${String(i).padStart(3, "0")}`;
      expect(doc061.split(/\r?\n/).some((l) => l.startsWith(`| ${id} |`))).toBe(true);
    }
  });

  test("REQ-061-027 enumerates the no-duplicate generation targets", () => {
    const row = doc061.split(/\r?\n/).find((l) => l.startsWith("| REQ-061-027 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("Root Case、Definition PR、Child Issue、Wave / 依存関係、Decision の受理記録を重複生成しない");
  });

  test("REQ-061-028 requires no ready transition on CI failure", () => {
    const row = doc061.split(/\r?\n/).find((l) => l.startsWith("| REQ-061-028 |"));
    expect(row).toBeDefined();
    expect(row!).toContain("ready へ遷移せず");
    expect(row!).toContain("既存 PR を保持");
  });
});

describe("row anchor matrix (REQ rows -> distribution artifact clauses)", () => {
  for (const [reqId, rel, pattern] of ROW_ANCHORS) {
    test(`${reqId} is anchored in ${path.basename(rel)}`, () => {
      expect(read(rel)).toMatch(pattern);
    });
  }
});
