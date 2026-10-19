// 記録契機（停止、判断変更、検証証拠）と記録コメントテンプレートの対応、
// 投稿前 fail-closed 検証、Case Issue 本文の進行状況・結果セクション構築の検査。
// 廃止記録契機（着手、引き渡し、再開）のテンプレート実体と生成経路の不存在も検査する。
// 記録様式の正は workflows/issue-lifecycle-records Design（Case Issue 工程記録モデル）。

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildProgressSection,
  buildResultSection,
  extractSectionBody,
  KIND_REQUIRED_SECTIONS,
  RECORD_KIND_LABELS,
  RECORD_KINDS,
  recordTemplatePath,
  validateProgressDate,
  validateProgressSection,
  validateRecordComment,
  applySection,
} from "../record-comments.ts";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..", "..");
const caseRunSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-run", "SKILL.md"), "utf8");
const caseCloseSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-close", "SKILL.md"), "utf8");
const adapterSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-case-run-execution-adapter", "SKILL.md"), "utf8");
const templatesSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-templates", "SKILL.md"), "utf8");

function templateBody(kind: (typeof RECORD_KINDS)[number]): string {
  return readFileSync(recordTemplatePath(kind), "utf8");
}

describe("記録契機3種と記録コメントテンプレートの対応", () => {
  test("記録契機は停止、判断変更、検証証拠の3種を保持する", () => {
    expect([...RECORD_KINDS]).toEqual(["hold", "decision_change", "completion"]);
    expect(Object.values(RECORD_KIND_LABELS)).toEqual(["停止", "判断変更", "検証証拠"]);
  });

  test("廃止記録契機（着手、引き渡し、再開）は記録契機に含まれない", () => {
    expect(RECORD_KINDS).not.toContain("start");
    expect(RECORD_KINDS).not.toContain("handoff");
    expect(RECORD_KINDS).not.toContain("resume");
  });

  test("各記録契機に対応するテンプレート実体が存在し、記録種別を表示する", () => {
    for (const kind of RECORD_KINDS) {
      const body = templateBody(kind);
      expect(body).toContain(`# 工程記録（${RECORD_KIND_LABELS[kind]}）`);
      expect(extractSectionBody(body, "記録種別")).toBe(RECORD_KIND_LABELS[kind]);
    }
  });

  test("廃止記録契機のテンプレート実体は存在しない", () => {
    for (const kind of ["start", "handoff", "resume"] as const) {
      expect(() => templateBody(kind)).toThrow();
    }
  });

  test("種別別必須項目が契約どおり割り当てられている", () => {
    expect(KIND_REQUIRED_SECTIONS.hold).toEqual(["再開条件"]);
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
      "## 理由・根拠",
      "",
      "外部副作用の承認待ち",
      "",
      "## 次の行動",
      "",
      "承認後に再試行判断",
      "",
      "## 関連合意・成果物",
      "",
      "Issue #42 の停止コメント",
      "",
      "## 再開条件",
      "",
      "外部副作用の承認取得",
      "",
    ].join("\n");
    expect(validateRecordComment("hold", holdBody)).toEqual({ ok: true, violations: [] });

    const decisionBody = [
      "# 工程記録（判断変更）",
      "",
      "## 記録種別",
      "",
      "判断変更",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "実現方針の一部を撤回",
      "",
      "## 次の行動",
      "",
      "新方針での実装継続",
      "",
      "## 撤回対象",
      "",
      "旧方針の該当行",
      "",
    ].join("\n");
    expect(validateRecordComment("decision_change", decisionBody)).toEqual({ ok: true, violations: [] });

    const verificationBody = [
      "# 工程記録（検証証拠）",
      "",
      "## 記録種別",
      "",
      "検証証拠",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "検証のみで完了する Issue の検証を実施",
      "",
      "## 次の行動",
      "",
      "なし",
      "",
      "## 判定根拠",
      "",
      "検証結果が完了条件を満たす（検証記録: PR 本文）",
      "",
    ].join("\n");
    expect(validateRecordComment("completion", verificationBody)).toEqual({ ok: true, violations: [] });
  });

  test("記録種別がテンプレート種別と不一致の本文は検証不備になる", () => {
    const mismatchBody = [
      "# 工程記録（停止）",
      "",
      "## 記録種別",
      "",
      "判断変更",
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
      "外部副作用の承認取得",
      "",
    ].join("\n");
    const result = validateRecordComment("hold", mismatchBody);
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("記録種別");
  });

  test("非該当項目の省略（理由・根拠、関連合意・成果物）は検証不備にしない", () => {
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
      "外部副作用の承認取得",
      "",
    ].join("\n");
    expect(validateRecordComment("hold", holdBody)).toEqual({ ok: true, violations: [] });
  });

  test("検証証拠の判定根拠が空の場合は検証不備になる", () => {
    const noBasis = [
      "# 工程記録（検証証拠）",
      "",
      "## 記録種別",
      "",
      "検証証拠",
      "",
      "## 対象工程",
      "",
      "case-run",
      "",
      "## 事実・結果",
      "",
      "検証を実施",
      "",
      "## 次の行動",
      "",
      "なし",
      "",
      "## 判定根拠",
      "",
      "該当なし",
      "",
    ].join("\n");
    const result = validateRecordComment("completion", noBasis);
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("判定根拠");
  });
});

describe("進行状況日時欄の境界表現様式（書式例外）", () => {
  test("実測値（日付前置の時刻文字列）と N/A を受理する", () => {
    expect(validateProgressDate("2026-10-04 05:25 JST")).toMatchObject({ ok: true, kind: "measured" });
    expect(validateProgressDate("2026-10-04T05:25:00+09:00")).toMatchObject({ ok: true, kind: "measured" });
    expect(validateProgressDate("N/A")).toMatchObject({ ok: true, kind: "not-set" });
  });

  test("境界表現（観測事実に基づく上限・下限の併記）を受理する", () => {
    expect(validateProgressDate("未観測（下限: 2026-10-20 05:25 JST、上限: 2026-10-20 09:25 JST）")).toMatchObject({ ok: true, kind: "bounded" });
    expect(validateProgressDate("未観測（下限: 2026-10-20T05:25:00+09:00、上限: 2026-10-20T09:25:00+09:00）")).toMatchObject({ ok: true, kind: "bounded" });
    expect(validateProgressDate("未観測（下限: 2026-10-20 05:25 JST）")).toMatchObject({ ok: true, kind: "bounded" });
    expect(validateProgressDate("未観測（上限: 2026-10-20 09:25 JST）")).toMatchObject({ ok: true, kind: "bounded" });
  });

  test("観測事実を伴わない推定値を拒否する", () => {
    const estimated = validateProgressDate("2026-10-20 頃");
    expect(estimated.ok).toBe(false);
    expect(estimated.violations.join("\n")).toContain("推定");

    expect(validateProgressDate("着手時刻を初回 commit から推定して記載").ok).toBe(false);
    expect(validateProgressDate("約2026-10-20 05:25").ok).toBe(false);
  });

  test("様式不一致の自由文を拒否する", () => {
    const freeText = validateProgressDate("着手時に設定する");
    expect(freeText.ok).toBe(false);
    expect(freeText.violations.join("\n")).toContain("いずれの様式でもない");
  });

  test("境界表現の下限・上限が実測時刻形式でない場合は拒否する", () => {
    expect(validateProgressDate("未観測（下限: 未定、上限: 2026-10-20 09:25 JST）").ok).toBe(false);
    expect(validateProgressDate("未観測（下限: 2026-10-20 05:25 JST、上限: なし）").ok).toBe(false);
    expect(validateProgressDate("未観測（下限: 過去のどこか）").ok).toBe(false);
  });

  test("validateProgressSection は開始・終了日時の様式を検証し、違反欄を特定する", () => {
    expect(validateProgressSection({ startDate: "2026-10-20 05:25 JST", endDate: "N/A" })).toEqual({ ok: true, violations: [] });
    expect(validateProgressSection({
      startDate: "未観測（下限: 2026-10-20 05:25 JST、上限: 2026-10-20 09:25 JST）",
      endDate: "N/A",
    })).toEqual({ ok: true, violations: [] });
    const failed = validateProgressSection({ startDate: "2026-10-20 頃", endDate: "着手時に設定" });
    expect(failed.ok).toBe(false);
    expect(failed.violations.join("\n")).toContain("開始日時");
    expect(failed.violations.join("\n")).toContain("終了日時");
  });

  test("buildProgressSection は境界表現を含む日時欄を様式どおり出力する", () => {
    const section = buildProgressSection({
      canonicalState: "ready",
      startDate: "未観測（下限: 2026-10-20 05:25 JST、上限: 2026-10-20 09:25 JST）",
      endDate: "N/A",
    });
    expect(section).toContain("- 開始日時: 未観測（下限: 2026-10-20 05:25 JST、上限: 2026-10-20 09:25 JST）");
    expect(section).toContain("- 終了日時: N/A");
  });
});

describe("本文進行状況・結果セクションの構築と適用", () => {
  test("進行状況セクション（Root Case）は正規状態と開始・終了日時のみを含む", () => {
    const section = buildProgressSection({
      canonicalState: "running",
      startDate: "2026-10-04 05:25 JST",
      endDate: "N/A",
    });
    expect(section).toContain("## 進行状況");
    expect(section).toContain("- 正規状態: running");
    expect(section).toContain("- 開始日時: 2026-10-04 05:25 JST");
    expect(section).toContain("- 終了日時: N/A");
    expect(section).not.toContain("- 工程:");
    expect(section).not.toContain("- 進行状態:");
    expect(section).not.toContain("- 担当役割:");
    expect(section).not.toContain("- 次の行動:");
    expect(section).not.toContain("- 最新記録参照:");
    expect(section).not.toContain("- 停止・待機理由:");
  });

  test("進行状況セクション（Child）は開始・終了日時のみで正規状態行を持たない", () => {
    const section = buildProgressSection({
      startDate: "2026-10-04 05:25 JST",
      endDate: "N/A",
    });
    expect(section).toContain("## 進行状況");
    expect(section).toContain("- 開始日時: 2026-10-04 05:25 JST");
    expect(section).toContain("- 終了日時: N/A");
    expect(section).not.toContain("- 正規状態:");
  });

  test("正規状態は7値トークンをそのまま出力する（status.yaml と単一トークン体系、終端=closed）", () => {
    const states = ["open", "ready", "running", "blocked", "review", "closed", "cancelled"] as const;
    for (const state of states) {
      const section = buildProgressSection({ canonicalState: state, startDate: "x", endDate: "y" });
      expect(section).toContain(`- 正規状態: ${state}`);
    }
    const completed = buildProgressSection({ canonicalState: "closed", startDate: "x", endDate: "y" });
    expect(completed).toContain("- 正規状態: closed");
    expect(completed).not.toContain("完了（closed）");
  });

  test("結果セクションは成果物と残件の扱いを含む（完了・中止確定時のみ作成。終了状態は重複保存しない）", () => {
    const section = buildResultSection({
      deliverables: "PR #100",
      remainingItems: "なし",
    });
    expect(section).toContain("## 結果");
    expect(section).toContain("- 成果物: PR #100");
    expect(section).toContain("- 残件の扱い: なし");
    expect(section).not.toContain("最終判定");
    expect(section).not.toContain("正規状態");
  });

  test("applySection は同名セクションを置換し、既存セクションを保持する", () => {
    const existing = [
      "# Issue",
      "",
      "## 進行状況",
      "",
      "- 正規状態: open",
      "- 開始日時: N/A",
      "- 終了日時: N/A",
      "",
      "## 作業ログ",
      "",
      "備考",
      "",
    ].join("\n");
    const next = applySection(existing, buildProgressSection({
      canonicalState: "running",
      startDate: "2026-10-04 05:25 JST",
      endDate: "N/A",
    }));
    expect(next).toContain("- 開始日時: 2026-10-04 05:25 JST");
    expect(next.match(/## 進行状況/g)?.length).toBe(1);
    expect(next).toContain("## 作業ログ");
    expect(next).not.toContain("開始日時: N/A\n");
  });

  test("applySection は同名セクション不在時、本文末尾へ追加する", () => {
    const existing = [
      "# Issue",
      "",
      "## 目的",
      "",
      "内容",
      "",
      "## 作業ログ",
      "",
      "備考",
      "",
    ].join("\n");
    const next = applySection(existing, buildProgressSection({
      canonicalState: "running",
      startDate: "2026-10-04 05:25 JST",
      endDate: "N/A",
    }));
    expect(next).toContain("## 進行状況");
    const idxProgress = next.indexOf("## 進行状況");
    expect(idxProgress).toBeGreaterThan(next.indexOf("## 作業ログ"));
    expect(next.trimEnd().endsWith("- 終了日時: N/A")).toBe(true);
  });

  test("applySection は文書末尾セクション置換で後続する HTML コメント群を消費しない", () => {
    const trailingComments = [
      "<!-- case-open 記録 2026-10-16: Root Case 起票 -->",
      "<!-- case-ready 記録 2026-10-16: 設計PR 受入 -->",
    ];
    const existing = [
      "# Issue",
      "",
      "## 進行状況",
      "",
      "- 正規状態: open",
      "- 開始日時: N/A",
      "- 終了日時: N/A",
      "",
      ...trailingComments,
      "",
    ].join("\n");
    const next = applySection(existing, buildProgressSection({
      canonicalState: "ready",
      startDate: "2026-10-16 10:00 JST",
      endDate: "N/A",
    }));
    expect(next).toContain("- 開始日時: 2026-10-16 10:00 JST");
    for (const comment of trailingComments) {
      expect(next).toContain(comment);
    }
    expect(next.match(/## 進行状況/g)?.length).toBe(1);
  });

  test("applySection は未閉鎖コメント断片を後続領域とみなさずセクション内容として置換する", () => {
    const existing = [
      "# Issue",
      "",
      "## 進行状況",
      "",
      "- 正規状態: open",
      "",
      "断片コメントの開始のみ <!--",
    ].join("\n");
    const next = applySection(existing, buildProgressSection({
      canonicalState: "running",
      startDate: "2026-10-04 05:25 JST",
      endDate: "N/A",
    }));
    expect(next).toContain("- 開始日時: 2026-10-04 05:25 JST");
    expect(next).not.toContain("断片コメントの開始のみ");
  });
});

describe("工程記録の取りまとめ反映の規定（SKILL.md 構造照合）", () => {
  test("case-run SKILL.md は記録契機の縮小（着手・引き渡し・再開の廃止）と進行状況の新様式を規定する", () => {
    expect(caseRunSkill).toContain("停止");
    expect(caseRunSkill).toContain("判断変更");
    expect(caseRunSkill).toContain("進行状況");
    expect(caseRunSkill).toContain("着手");
    expect(caseRunSkill).toContain("廃止");
    expect(caseRunSkill).not.toContain("現在地");
  });

  test("case-close SKILL.md は完了確定と結果セクション更新を規定する", () => {
    expect(caseCloseSkill).toContain("結果");
    expect(caseCloseSkill).toContain("完了条件");
  });

  test("adapter SKILL.md は実行担当の報告契約（事実・結果、停止、変更影響）を規定する", () => {
    expect(adapterSkill).toContain("blocked");
    expect(adapterSkill).toContain("failed");
    expect(adapterSkill).toContain("PR 本文");
  });

  test("workflow-templates SKILL.md は記録契機3種とテンプレートの対応と選定ルールを規定する", () => {
    expect(templatesSkill).toContain("issue_comment_record_hold.md");
    expect(templatesSkill).toContain("issue_comment_record_decision_change.md");
    expect(templatesSkill).toContain("issue_comment_record_completion.md");
    expect(templatesSkill).toContain("着手・引き渡し・再開");
    expect(templatesSkill).not.toContain("issue_comment_record_start.md");
    expect(templatesSkill).not.toContain("issue_comment_record_handoff.md");
    expect(templatesSkill).not.toContain("issue_comment_record_resume.md");
  });
});
