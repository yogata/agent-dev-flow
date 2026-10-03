// 工程記録の取りまとめ反映経路（記録契機6種・記録コメント基本項目と種別別必須項目・
// 本文現在地・結果セクション構築）の回帰検証。
//
// TS-001 担当分（文書面・機能面）: 記録契機6種のテンプレート対応、完了=判定根拠、
// 本文結果セクション（成果物、最終判定と根拠、残件の扱い）の構築。
// TS-003 担当分: blocked 停止→再開シナリオの記録経路接続（停止コメントの再開条件、
// 再開コメントの最新条件参照）。
// 実基盤での実経路確認（実 Issue での着手コメント投稿・本文更新）は Wave 1 マージ後の
// 横断確認 Issue が実施する。本テストは経路組み込みの実装と実行可能な検証を対象とする。

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  KIND_REQUIRED_SECTIONS,
  PROGRESS_STATES,
  RECORD_KINDS,
  RECORD_KIND_LABELS,
  applySection,
  buildCurrentLocationSection,
  buildResultSection,
  extractSectionBody,
  mapRecordKindToProgressState,
  recordTemplatePath,
  validateRecordComment,
} from "../record-comments.ts";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..", "..");
const caseRunSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-run", "SKILL.md"), "utf8");
const caseCloseSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-close", "SKILL.md"), "utf8");
const adapterSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-case-run-execution-adapter", "SKILL.md"), "utf8");
const templatesSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-templates", "SKILL.md"), "utf8");

function templateBody(kind: (typeof RECORD_KINDS)[number]): string {
  return readFileSync(recordTemplatePath(kind), "utf8");
}

describe("記録契機6種と記録コメントテンプレートの対応", () => {
  test("記録契機は着手、引き渡し、停止、再開、判断変更、完了の6種を保持する", () => {
    expect([...RECORD_KINDS]).toEqual([
      "start",
      "handoff",
      "hold",
      "resume",
      "decision_change",
      "completion",
    ]);
    expect(Object.values(RECORD_KIND_LABELS)).toEqual([
      "着手",
      "引き渡し",
      "停止",
      "再開",
      "判断変更",
      "完了",
    ]);
  });

  test("各記録契機に対応するテンプレート実体が存在し、記録種別を表示する", () => {
    for (const kind of RECORD_KINDS) {
      const body = templateBody(kind);
      expect(body).toContain(`# 工程記録（${RECORD_KIND_LABELS[kind]}）`);
      expect(extractSectionBody(body, "記録種別")).toBe(RECORD_KIND_LABELS[kind]);
    }
  });

  test("種別別必須項目が契約どおり割り当てられている", () => {
    expect(KIND_REQUIRED_SECTIONS.start).toEqual([]);
    expect(KIND_REQUIRED_SECTIONS.handoff).toEqual(["残作業と受取役割"]);
    expect(KIND_REQUIRED_SECTIONS.hold).toEqual(["再開条件"]);
    expect(KIND_REQUIRED_SECTIONS.resume).toEqual(["最新条件参照"]);
    expect(KIND_REQUIRED_SECTIONS.decision_change).toEqual(["撤回対象"]);
    expect(KIND_REQUIRED_SECTIONS.completion).toEqual(["判定根拠"]);
  });

  test("各テンプレートは基本項目（記録種別、対象工程、事実・結果、理由・根拠、次の行動、関連合意・成果物）を持つ", () => {
    const baseSections = [
      "記録種別",
      "対象工程",
      "事実・結果",
      "理由・根拠",
      "次の行動",
      "関連合意・成果物",
    ];
    for (const kind of RECORD_KINDS) {
      const body = templateBody(kind);
      for (const section of baseSections) {
        expect(extractSectionBody(body, section)).not.toBeNull();
      }
    }
  });

  test("種別別必須セクションは必須マーカー付きで宣言されている", () => {
    for (const kind of RECORD_KINDS) {
      const body = templateBody(kind);
      for (const section of KIND_REQUIRED_SECTIONS[kind]) {
        const markerIndex = body.indexOf(`## ${section}\n<!-- 【必須】 -->`);
        expect(markerIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("記録コメントの必須項目検証（投稿前 fail-closed）", () => {
  test("種別別必須項目が空または「該当なし」の本文は検証不備になる", () => {
    const holdWithoutResumeCondition = [
      "# 工程記録（停止）",
      "",
      "## 記録種別",
      "",
      "停止",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "blocked を受領",
      "",
      "## 次の行動",
      "",
      "再開判断",
      "",
      "## 再開条件",
      "",
      "該当なし",
      "",
    ].join("\n");
    const result = validateRecordComment("hold", holdWithoutResumeCondition);
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("再開条件");
  });

  test("種別別必須項目が記録された本文は検証を通過する", () => {
    const holdBody = [
      "# 工程記録（停止）",
      "",
      "## 記録種別",
      "",
      "停止",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "blocked を受領",
      "",
      "## 次の行動",
      "",
      "再開判断",
      "",
      "## 再開条件",
      "",
      "ユーザー判断の合意後に再委譲する",
      "",
    ].join("\n");
    expect(validateRecordComment("hold", holdBody)).toEqual({ ok: true, violations: [] });
  });

  test("記録種別がテンプレート種別と不一致の本文は検証不備になる", () => {
    const body = [
      "## 記録種別",
      "",
      "着手",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "完了",
      "",
      "## 次の行動",
      "",
      "なし",
      "",
      "## 判定根拠",
      "",
      "QG-4 合格",
      "",
    ].join("\n");
    const result = validateRecordComment("completion", body);
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("完了");
  });

  test("非該当項目の省略（理由・根拠、関連合意・成果物）は検証不備にしない", () => {
    const startBody = [
      "## 記録種別",
      "",
      "着手",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "実装着手を報告",
      "",
      "## 次の行動",
      "",
      "実装継続",
      "",
    ].join("\n");
    expect(validateRecordComment("start", startBody)).toEqual({ ok: true, violations: [] });
  });

  test("完了の判定根拠が空の場合は検証不備になる", () => {
    const body = [
      "## 記録種別",
      "",
      "完了",
      "",
      "## 対象工程",
      "",
      "case-close",
      "",
      "## 事実・結果",
      "",
      "完了",
      "",
      "## 次の行動",
      "",
      "なし",
      "",
      "## 判定根拠",
      "",
      "",
    ].join("\n");
    const result = validateRecordComment("completion", body);
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("判定根拠");
  });
});

describe("blocked 停止→再開シナリオの記録経路接続（TS-003 担当分）", () => {
  test("停止コメント（再開条件つき）の検証を通過し、現在地は待機になる", () => {
    const holdBody = [
      "## 記録種別",
      "",
      "停止",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "blocker を受領して停止",
      "",
      "## 次の行動",
      "",
      "再開判断",
      "",
      "## 再開条件",
      "",
      "再合意済み Definition の受領後",
      "",
    ].join("\n");
    expect(validateRecordComment("hold", holdBody).ok).toBe(true);
    expect(mapRecordKindToProgressState("hold")).toBe("待機");
  });

  test("再開コメントは最新条件参照を必須とし、現在地は実行中に復帰する", () => {
    const resumeWithoutLatest = [
      "## 記録種別",
      "",
      "再開",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "再開条件を充足して再委譲",
      "",
      "## 次の行動",
      "",
      "作業再開",
      "",
    ].join("\n");
    expect(validateRecordComment("resume", resumeWithoutLatest).ok).toBe(false);

    const resumeBody = `${resumeWithoutLatest}## 最新条件参照\n\n再合意済み Definition（Amendment PR #NNN）\n\n`;
    expect(validateRecordComment("resume", resumeBody).ok).toBe(true);
    expect(mapRecordKindToProgressState("resume")).toBe("実行中");
  });
});

describe("本文現在地・結果セクションの構築と適用", () => {
  test("現在地セクションは工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照を含む", () => {
    const section = buildCurrentLocationSection({
      phase: "case-run（委譲実行）",
      progressState: "待機",
      nextAction: "再開判断",
      ownerRole: "取りまとめ（case-run）",
      holdReason: "blocker 受領",
      latestRecordRef: "工程記録（停止）コメント",
    });
    expect(section).toContain("## 現在地");
    expect(section).toContain("- 工程: case-run（委譲実行）");
    expect(section).toContain("- 進行状態: 待機");
    expect(section).toContain("- 次の行動: 再開判断");
    expect(section).toContain("- 担当役割: 取りまとめ（case-run）");
    expect(section).toContain("- 停止・待機理由: blocker 受領");
    expect(section).toContain("- 最新記録参照: 工程記録（停止）コメント");
  });

  test("進行状態写像は記録契機から4値へ導出される", () => {
    expect([...PROGRESS_STATES]).toEqual(["未着手", "実行中", "待機", "終了"]);
    expect(mapRecordKindToProgressState("start")).toBe("実行中");
    expect(mapRecordKindToProgressState("handoff")).toBe("実行中");
    expect(mapRecordKindToProgressState("hold")).toBe("待機");
    expect(mapRecordKindToProgressState("resume")).toBe("実行中");
    expect(mapRecordKindToProgressState("decision_change")).toBe("実行中");
    expect(mapRecordKindToProgressState("completion")).toBe("終了");
  });

  test("結果セクションは成果物、最終判定と根拠、残件の扱いを含む（完了契機）", () => {
    const section = buildResultSection({
      deliverables: "PR #NNN",
      finalJudgmentAndBasis: "完了条件全項目を達成（QG-4 判定根拠は完了記録コメント参照）",
      remainingItems: "なし",
    });
    expect(section).toContain("## 結果");
    expect(section).toContain("- 成果物: PR #NNN");
    expect(section).toContain("- 最終判定と根拠: ");
    expect(section).toContain("- 残件の扱い: なし");
  });

  test("applySection は同名セクションを置換し、既存セクションを保持する", () => {
    const existing = [
      "## 完了条件",
      "",
      "- [x] 項目A",
      "",
      "## 現在地",
      "",
      "- 工程: case-run",
      "- 進行状態: 実行中",
      "",
      "## 補足情報",
      "",
      "- 備考",
      "",
    ].join("\n");
    const updated = applySection(existing, buildCurrentLocationSection({
      phase: "case-close",
      progressState: "終了",
      nextAction: "なし",
      ownerRole: "判定主体（case-close）",
    }));
    expect(updated).toContain("- 進行状態: 終了");
    expect(updated).not.toContain("- 進行状態: 実行中");
    expect(updated).toContain("## 完了条件");
    expect(updated).toContain("## 補足情報");
  });

  test("applySection は同名セクション不在時、補足情報セクションの直前に追加する", () => {
    const existing = [
      "## 完了条件",
      "",
      "- [x] 項目A",
      "",
      "## 補足情報",
      "",
      "- 備考",
      "",
    ].join("\n");
    const updated = applySection(existing, buildResultSection({
      deliverables: "PR #NNN",
      finalJudgmentAndBasis: "達成",
      remainingItems: "なし",
    }));
    const resultIndex = updated.indexOf("## 結果");
    const supplementIndex = updated.indexOf("## 補足情報");
    expect(resultIndex).toBeGreaterThan(0);
    expect(supplementIndex).toBeGreaterThan(resultIndex);
    expect(updated).toContain("## 完了条件");
  });
});

describe("工程記録の取りまとめ反映の規定（SKILL.md 構造照合）", () => {
  test("case-run SKILL.md は記録契機、委譲要求と実着手の区別、途中報告の反映を規定する", () => {
    expect(caseRunSkill).toContain("## 工程記録の取りまとめ反映（記録契機）");
    expect(caseRunSkill).toContain("委譲要求と実着手の区別");
    expect(caseRunSkill).toContain("工程終了を待たない途中報告");
    expect(caseRunSkill).toContain("scripts/record-comments.ts");
    expect(caseRunSkill).toContain("issue_update");
  });

  test("case-close SKILL.md は完了記録と本文結果セクション更新を規定する", () => {
    expect(caseCloseSkill).toContain("工程記録の完了契機反映");
    expect(caseCloseSkill).toContain("判定根拠必須");
    expect(caseCloseSkill).toContain("成果物、最終判定と根拠、残件の扱い");
    expect(caseCloseSkill).toContain("scripts/record-comments.ts");
  });

  test("adapter SKILL.md は実行担当の報告契約（事実・結果、停止、変更影響）と途中報告を規定する", () => {
    expect(adapterSkill).toContain("## 実行担当の報告契約（記録契機向け）");
    expect(adapterSkill).toContain("委譲要求と実着手の区別");
    expect(adapterSkill).toContain("工程終了を待たない途中報告");
    expect(adapterSkill).toContain("result 契約（4状態）の最終確定値を代替せず");
  });

  test("workflow-templates SKILL.md は記録契機とテンプレートの対応と選定ルールを規定する", () => {
    expect(templatesSkill).toContain("issue_comment_record_start.md");
    expect(templatesSkill).toContain("issue_comment_record_handoff.md");
    expect(templatesSkill).toContain("issue_comment_record_hold.md");
    expect(templatesSkill).toContain("issue_comment_record_resume.md");
    expect(templatesSkill).toContain("issue_comment_record_decision_change.md");
    expect(templatesSkill).toContain("issue_comment_record_completion.md");
    expect(templatesSkill).toContain("委譲要求（委譲起動）は実着手と同一視せず");
    expect(templatesSkill).toContain("scripts/record-comments.ts");
  });
});
