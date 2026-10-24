// 重要変更の通知と結果説明（REQ-108-014〜023）の構造照合。
//
// Design 節（docs/designs/commands/req-define.md、case-ready.md、case-run.md、
// case-auto.md、backlog-auto.md、docs/designs/workflows/v51-phase-driven-collaboration-model.md
// の「重要変更の通知と結果説明」節）が挙動契約の正であり、その実現面として各
// workflow skill・委譲契約に組込まれた通知手順の必須要素と境界規律を anchor 型で
// 照合する。恒常的な構造検証であり、test strategy TS-001〜TS-011 の公開入口からの
// 実行検証を代替しない。対応関係の正は repository top-level traceability/ sidecar
// が保持する。
//
// 各 test は次の要件行の構造要素を pin する:
// - REQ-108-014 重要変更の識別（意味と影響に基づく、機械判定禁止、軽微変更の区別）
// - REQ-108-015 通知内容（理由、内容、想定影響、確定/未確認事項、現在工程と過去工程の関係）
// - REQ-108-016 事前通知の順序担保（正規反映より前、実行記録、キュー登録扱いの禁止）
// - REQ-108-017 通知と承認の区別（自律継続、留保判断の保留、既存境界の非弱化）
// - REQ-108-018 実行中の追加通知（判明時点の報告、反映済みの区別）
// - REQ-108-019 通知の集約（変更単位への集約、重複抑制、新規影響の追加説明）
// - REQ-108-020 完了報告への反映（実施した重要事項、見込みと実績の違い、一部成功・失敗の区別）
// - REQ-108-021 変更駆動経路（backlog-auto の子通知の非消失、一気通貫の提示）
// - REQ-108-022 工程駆動経路（phase-artifacts-update、過去工程改訂の現在工程との関係）
// - REQ-108-023 責務構造の維持（意味判断の局所所有、既存照合・評価・再検証の非代替）

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// repoRoot 解決は main root と worktree の両方で動作する階層数非固定の探索とする
// （adoption-basis-verification-anchors.test.ts と同一の探索手順）。
function resolveRepoRoot(fromDir: string): string {
  let current = fromDir;
  for (;;) {
    if (existsSync(join(current, "AGENTS.md")) && existsSync(join(current, "src", "common"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`repoRoot not found from ${fromDir} (AGENTS.md + src/common traversal exhausted)`);
    }
    current = parent;
  }
}

const repoRoot = resolveRepoRoot(import.meta.dir);

function readSkill(rel: string): string {
  return readFileSync(
    join(repoRoot, "src", "common", "skills", ...rel.split("/")),
    "utf8",
  );
}

function readDoc(rel: string): string {
  return readFileSync(join(repoRoot, ...rel.split("/")), "utf8");
}

// 見出しから次の同レベル見出しまでの節本文を抽出する。
function sectionBetween(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const rest = text.slice(start + heading.length);
  const next = rest.indexOf("\n## ");
  return next === -1 ? rest : rest.slice(0, next);
}

const DESIGN_SOURCES: Array<{ path: string; heading: string }> = [
  { path: "docs/designs/commands/req-define.md", heading: "## 重要変更の通知と結果説明" },
  { path: "docs/designs/commands/case-ready.md", heading: "## 重要変更の通知と結果説明" },
  { path: "docs/designs/commands/case-run.md", heading: "## 重要変更の通知と結果説明" },
  { path: "docs/designs/commands/case-auto.md", heading: "## 重要変更の通知と結果説明" },
  { path: "docs/designs/commands/backlog-auto.md", heading: "## 重要変更の通知と結果説明" },
  {
    path: "docs/designs/workflows/v51-phase-driven-collaboration-model.md",
    heading: "## 重要変更の通知と結果説明（phase-artifacts-update）",
  },
];

describe("重要変更の通知と結果説明（REQ-108-014〜023）の組込み pin", () => {
  test("Design 挙動契約の正となる6文書の節が存在する", () => {
    for (const source of DESIGN_SOURCES) {
      const doc = readDoc(source.path);
      const sec = sectionBetween(doc, source.heading);
      expect(sec.length, `${source.path} の節が存在すること`).toBeGreaterThan(0);
    }
  });

  test("req-define はドラフト保存前の事前通知と通知と承認の区別を規定する（REQ-108-014〜018）", () => {
    const sec = sectionBetween(readSkill("agentdev-workflow-req-define/SKILL.md"), "## 重要変更の通知と結果説明");
    expect(sec.length).toBeGreaterThan(0);
    // REQ-108-014 識別（意味と影響、機械判定禁止、軽微変更の区別）
    expect(sec).toContain("変更の意味と影響に基づく req-define 自身の判断責務");
    expect(sec).toContain("ファイル数や変更行数のみから重要性を決定しない");
    expect(sec).toContain("軽微な変更として扱い、重要変更の通知対象としない");
    // REQ-108-015 通知内容
    expect(sec).toContain("変更する理由");
    expect(sec).toContain("何をどのように変更する予定か");
    expect(sec).toContain("想定される影響");
    expect(sec).toContain("確定している事項と未確認の事項");
    // REQ-108-016 順序担保
    expect(sec).toContain("STEP-9 ドラフト保存より前に");
    expect(sec).toContain("ドラフト保存より後の初回提示を事前通知として扱わない");
    expect(sec).toContain("ドラフト保存の実行より先に通知を出力した事実");
    // REQ-108-017 通知と承認の区別
    expect(sec).toContain("通知と承認を区別する");
    expect(sec).toContain("通知しただけで承認済みと扱わず");
    // 追加通知と重複抑制（REQ-108-018）
    expect(sec).toContain("追加通知");
    expect(sec).toContain("同じ内容の重複通知を繰り返さない");
  });

  test("case-ready は Definition 保存前の事前通知と順序の実行記録を規定する（REQ-108-014〜018）", () => {
    const sec = sectionBetween(readSkill("agentdev-workflow-case-ready/SKILL.md"), "## 重要変更の通知と結果説明");
    expect(sec.length).toBeGreaterThan(0);
    // REQ-108-014 識別
    expect(sec).toContain("変更の意味と影響に基づく case-ready 自身の判断責務");
    expect(sec).toContain("変更ファイル数や変更行数のみから重要性を決定しない");
    // REQ-108-015 通知内容
    expect(sec).toContain("変更する理由");
    expect(sec).toContain("想定される影響");
    // REQ-108-016 順序担保と実行記録
    expect(sec).toContain("保存の実行より前に");
    expect(sec).toContain("Root Case Issue のコメント（タイムスタンプ付き）へ記録する");
    expect(sec).toContain("キュー登録だけの状態");
    expect(sec).toContain("事前通知として扱わない");
    // REQ-108-017 通知と承認の区別
    expect(sec).toContain("通知と承認を区別し");
    expect(sec).toContain("通知しただけで承認済みと扱わず");
    expect(sec).toContain("既存の HITL 分岐に従う");
    // 追加通知と反映済みの区別（REQ-108-018）
    expect(sec).toContain("反映済みである事実を区別して通知する");
    // 完了報告への反映（REQ-108-020）
    expect(sec).toContain("見込みと実績の違い");
  });

  test("phase-artifacts-update は正規成果物反映前の事前通知と過去工程改訂の影響通知を規定する（REQ-108-015、016、022、023）", () => {
    const sec = sectionBetween(
      readSkill("agentdev-workflow-phase-artifacts-update/SKILL.md"),
      "## 重要変更の通知と結果説明",
    );
    expect(sec.length).toBeGreaterThan(0);
    // REQ-108-014 識別
    expect(sec).toContain("変更の意味と影響に基づく本スキル自身の判断責務");
    // REQ-108-015 通知内容
    expect(sec).toContain("変更する理由");
    expect(sec).toContain("確定している事項と未確認の事項");
    // REQ-108-016 順序担保
    expect(sec).toContain("反映の実行（工程5）より前に");
    expect(sec).toContain("反映実行後の初回提示を事前通知として扱わない");
    expect(sec).toContain("反映の実行より先に通知を出力した事実");
    // REQ-108-022 工程駆動経路（現在工程との関係、後続影響）
    expect(sec).toContain("現在工程との関係と想定される後続影響を通知に含める");
    expect(sec).toContain("現在工程を巻き戻さない規則を維持し、通知で代替しない");
    // REQ-108-017 通知と承認の区別（採用判断と反映作業の既存境界）
    expect(sec).toContain("採用判断（利用者の明示判断）と反映作業（委譲された裁量）の既存境界を変更せず");
    // 完了報告への反映（REQ-108-020）
    expect(sec).toContain("見込みとの違い、残る影響");
  });

  test("case-run は委譲契約への識別と報告の組込みと完了報告の成立状況区別を規定する（REQ-108-017〜020）", () => {
    const sec = sectionBetween(readSkill("agentdev-workflow-case-run/SKILL.md"), "## 重要変更の通知と結果説明");
    expect(sec.length).toBeGreaterThan(0);
    // 委譲契約への組込み（REQ-108-017、018）
    expect(sec).toContain("委譲契約に重要変更の識別と報告を含める");
    // 正規反映前の提示と反映済みの区別（REQ-108-016、018）
    expect(sec).toContain("正規反映の前に利用者へ提示する");
    expect(sec).toContain("事後説明を事前通知として扱わない");
    // REQ-108-020 完了報告への反映
    expect(sec).toContain("実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める");
    expect(sec).toContain("事前通知したが実施しなかった変更を実施済みと報告せず");
    expect(sec).toContain("一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する");
    // REQ-108-017 通知と承認の区別
    expect(sec).toContain("追加承認なしで継続");
    expect(sec).toContain("通知のみを理由とする新たな一律停止を設けない");
    // 既存照合・評価・再検証の非代替（REQ-108-023）
    expect(sec).toContain("通知で代替しない");
  });

  test("execution-adapter は委譲先での重要変更の識別と報告を規定する（REQ-108-014、017、018、023）", () => {
    const skill = readSkill("agentdev-case-run-execution-adapter/SKILL.md");
    expect(skill).toContain("**重要変更の識別と報告**");
    // REQ-108-014 識別（機械判定禁止）
    expect(skill).toContain("変更ファイル数やキーワードだけの機械判定に置き換えない");
    // REQ-108-018 判明時点の報告と反映済みの区別
    expect(skill).toContain("判明した時点でその内容と影響とともに取りまとめへ報告する");
    expect(skill).toContain("反映済みである事実を区別して説明する");
    // REQ-108-017 通知と承認の区別
    expect(skill).toContain("報告後に追加承認なしで実行を継続する");
    expect(skill).toContain("result 契約の `blocked` として判断事項を報告する");
    // REQ-108-023 既存照合・評価・再検証の非代替
    expect(skill).toContain("通知で代替しない");
  });

  test("orchestration は委譲 protocol への指示組込みと並列実行下の通知非消失を規定する（REQ-108-018、019）", () => {
    const sec = sectionBetween(
      readSkill("agentdev-workflow-orchestration/SKILL.md"),
      "## 重要変更の通知と結果説明（委譲 protocol 接続）",
    );
    expect(sec.length).toBeGreaterThan(0);
    expect(sec).toContain("重要変更の識別と報告を指示する項目を含める");
    expect(sec).toContain("正規反映の前に利用者へ表示する経路を維持する");
    // REQ-108-019 集約
    expect(sec).toContain("同一の意味を持つ変更単位で通知を集約する");
  });

  test("case-auto は結果集約での通知非消失と意味判断の局所所有を規定する（REQ-108-018〜021、023）", () => {
    const sec = sectionBetween(readSkill("agentdev-workflow-case-auto/SKILL.md"), "## 重要変更の通知と結果説明");
    expect(sec.length).toBeGreaterThan(0);
    // REQ-108-019 集約と重複抑制
    expect(sec).toContain("失わずに利用者へ提示");
    expect(sec).toContain("利用者が理解する変更単位へ通知を集約し");
    expect(sec).toContain("重複通知を繰り返さない");
    expect(sec).toContain("重複通知と区別して追加説明する");
    // REQ-108-023 意味判断の局所所有
    expect(sec).toContain("全変更の意味判断を行わず");
    expect(sec).toContain("判断の局所所有を維持");
    // REQ-108-020 完了報告への反映
    expect(sec).toContain("実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める");
    expect(sec).toContain("一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する");
    // REQ-108-017 通知と承認の区別
    expect(sec).toContain("通知と承認を区別し");
    expect(sec).toContain("一律停止を設けない");
  });

  test("backlog-auto は一気通貫実行での子通知の非消失と完了報告への反映を規定する（REQ-108-018〜021）", () => {
    const sec = sectionBetween(readSkill("agentdev-workflow-backlog-auto/SKILL.md"), "## 重要変更の通知と結果説明");
    expect(sec.length).toBeGreaterThan(0);
    // REQ-108-021 変更駆動経路（子通知の非消失）
    expect(sec).toContain("親側の実行・結果報告によって失われず、利用者に提示されることを維持する");
    // REQ-108-019 集約と重複抑制
    expect(sec).toContain("利用者が理解する変更単位に集約し");
    expect(sec).toContain("重複通知を繰り返さない");
    // REQ-108-020 完了報告への反映
    expect(sec).toContain("実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める");
    expect(sec).toContain("一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する");
    // 中断・失敗・再開時の通知と結果報告
    expect(sec).toContain("中断・失敗・再開時には");
    // 既存の利用者判断境界の維持
    expect(sec).toContain("通知で代替しない");
    expect(sec).toContain("通知のみを理由とする新たな一律停止を設けない");
  });

  test("case-close は完了報告への重要変更の成立状況反映を規定する（REQ-108-020）", () => {
    const sec = sectionBetween(
      readSkill("agentdev-workflow-case-close/SKILL.md"),
      "## 重要変更の通知と結果説明（完了報告接続）",
    );
    expect(sec.length).toBeGreaterThan(0);
    expect(sec).toContain("実際の成立状況を反映");
    expect(sec).toContain("実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める");
    expect(sec).toContain("事前通知したが実施されなかった変更を実施済みと判定・記録せず");
    expect(sec).toContain("一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して記録する");
    // 既存の承認権限・安全境界・完了阻止条件の非弱化（REQ-108-017）
    expect(sec).toContain("通知で代替しない");
    expect(sec).toContain("弱めない");
  });
});
