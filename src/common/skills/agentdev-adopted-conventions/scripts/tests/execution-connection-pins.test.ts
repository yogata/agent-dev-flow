// 採用した工程構成に基づく単独工程・一気通貫実行・中断再開の実行接続の構造照合。
//
// v51 Design（docs/designs/workflows/v51-phase-transition-and-coexistence-model.md）
// 「有限作業と実装接続」節が実行接続の design 宣言の正であり、その実現面として
// case-auto workflow 実装本体（v5 有限実行モード節のモード契約）、case-run workflow
// 実装本体（単独工程からの実装・検証接続節）、req-define command（要件確定のみの
// 単独工程条項）、case-auto command（実行モード指定）に組込まれた実行境界の必須要素を
// anchor 型で照合する。恒常的な構造検証であり、test strategy の正規利用経路での
// 代表事例実行検証を代替しない。対応関係の正は repository top-level traceability/
// sidecar が保持する。
//
// pin する構造要素（機能名で列挙）:
// - 単独工程の独立完了（要件確定のみ・設計確定のみ・確定済み設計からの実装・検証のみの
//   3種列挙、採用規約の解決結果を実行基準として参照、必要な成果物と検証の成立確認による
//   完了判定、後続実装・Issue・PR の一律要求禁止、未採用参照工程を判定基準へ含めない）
// - 一気通貫実行（不要な工程・独立文書・Issue の強制禁止、採用された必要な要求・制約・
//   検証義務の維持、連続実行した事実だけでの完了扱い禁止、各段階の検証証拠に基づく判定）
// - 中断・再開（採用した工程構成に基づく実行への適用明示、採用済み・未決・試作・成立済み
//   作業の4区分維持、成立済み作業の不当な重複実行禁止）
// - 変更駆動能力群の維持と横断検証義務（8能力群の維持前提、意味を引き継ぐ経路成立前の
//   既存能力失効禁止、代表事例割当、未検証のままの全体合格禁止）
// - 実装・検証のみの単独工程接続（正規情報の再所有禁止、再形成の一律要求禁止、実行事実
//   だけでの完了根拠禁止、4区分の再構成）
// - 要件確定のみの入口接続（要件doc 確定で完了、case-auto 起動は利用者判断）
// - design 宣言との所在整合（実行接続の実装所在の反映確認記述）

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// repoRoot 解決は main root と worktree の両方で動作する階層数非固定の探索とする
// （重要変更通知の構造照合テストと同一の探索手順）。
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

function readCommand(rel: string): string {
  return readFileSync(
    join(repoRoot, "src", "common", "commands", "agentdev", rel),
    "utf8",
  );
}

// 見出しから次の同レベル見出しまでの節本文を抽出する。
function sectionBetween(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const rest = text.slice(start + heading.length);
  const nextHeading = rest.search(/^#{1,6} /m);
  return nextHeading === -1 ? rest : rest.slice(0, nextHeading);
}

// 条項（- **xxx**: 形式の箇条書き開始行）から次の条項までの本文を抽出する。
function clauseBetween(text: string, marker: string): string {
  const start = text.indexOf(marker);
  if (start === -1) return "";
  const rest = text.slice(start + marker.length);
  const next = rest.search(/\n- \*\*[^*]+\*\*/);
  return next === -1 ? rest : rest.slice(0, next);
}

const caseAutoSkill = readSkill("agentdev-workflow-case-auto/SKILL.md");
const v5ModeSection = sectionBetween(caseAutoSkill, "## v5 有限実行モード");
const modeContractSection = sectionBetween(caseAutoSkill, "### モード契約");
const caseRunSkill = readSkill("agentdev-workflow-case-run/SKILL.md");
const reqDefineCommand = readCommand("req-define.md");
const caseAutoCommand = readCommand("case-auto.md");
const v51Design = readDoc("docs/designs/workflows/v51-phase-transition-and-coexistence-model.md");
const v51ConnectionSection = sectionBetween(v51Design, "## 有限作業と実装接続");

describe("単独工程の独立完了の実行接続（case-auto workflow 実装本体）", () => {
  test("v5 有限実行モード節に単独工程の独立完了条項が存在する", () => {
    expect(modeContractSection).toContain("**単独工程の独立完了**");
  });

  test("3種の単独工程（要件確定のみ・設計確定のみ・確定済み設計からの実装・検証のみ）を列挙する", () => {
    const clause = clauseBetween(modeContractSection, "**単独工程の独立完了**");
    expect(clause).toContain("要件確定のみ・設計確定のみ・確定済み設計からの実装・検証のみ");
  });

  test("採用規約の解決結果を実行基準として参照する", () => {
    const clause = clauseBetween(modeContractSection, "**単独工程の独立完了**");
    expect(clause).toContain("採用規約の解決の公開操作契約");
    expect(clause).toContain("実行基準");
  });

  test("完了判定は必要な成果物と検証の成立確認に基づく", () => {
    const clause = clauseBetween(modeContractSection, "**単独工程の独立完了**");
    expect(clause).toContain("対象作業に必要な成果物と検証の成立を確認して独立完了");
  });

  test("後続実装・Issue・PR の一律要求を禁止する", () => {
    const clause = clauseBetween(modeContractSection, "**単独工程の独立完了**");
    expect(clause).toContain("後続実装・Issue・PR の一律要求と要件定義への無条件復帰を実行経路に組み込まない");
    expect(clause).toContain("設計確定のみの作業に後続実装を要求しない");
  });

  test("未採用の参照工程を完了判定基準へ含めない", () => {
    const clause = clauseBetween(modeContractSection, "**単独工程の独立完了**");
    expect(clause).toContain("未採用の参照工程を単独工程の完了判定基準へ含めない");
  });
});

describe("一気通貫実行と完了判定の実行接続（case-auto workflow 実装本体）", () => {
  test("小規模連続実行モードが不要な工程・独立文書・Issue を強制しない", () => {
    const clause = clauseBetween(modeContractSection, "**v5 小規模連続実行モード**");
    expect(clause).toContain("不要な工程・独立文書・Issue を強制せず");
    expect(clause).toContain("採用された必要な要求・制約・検証義務を維持");
  });

  test("連続実行した事実だけでは未成立の検証を完了扱いとしない", () => {
    const clause = clauseBetween(modeContractSection, "**v5 小規模連続実行モード**");
    expect(clause).toContain("連続実行した事実だけでは未成立の検証を完了扱いとせず");
    expect(clause).toContain("各段階の検証証拠に基づいて完了を判定");
  });
});

describe("中断・再開の実行接続（case-auto workflow 実装本体）", () => {
  test("再開条項が採用した工程構成に基づく実行（単独工程・連続実行）に適用されることを明示する", () => {
    const clause = clauseBetween(modeContractSection, "**再開**");
    expect(clause).toContain("採用した工程構成に基づく実行（単独工程・連続実行）の双方に適用");
  });

  test("4区分（採用済み・未決・試作・成立済み作業）の区別を維持する", () => {
    const clause = clauseBetween(modeContractSection, "**再開**");
    expect(clause).toContain("採用済み事項・未決事項・試作・成立済み作業を含む状態から再開しても4区分の区別を維持");
  });

  test("成立済み作業を不当に重複実行しない", () => {
    const clause = clauseBetween(modeContractSection, "**再開**");
    expect(clause).toContain("成立済み作業を不当に重複実行せず");
  });
});

describe("変更駆動能力群の維持と横断検証義務（case-auto workflow 実装本体）", () => {
  test("変更駆動能力群の維持条項が存在し8能力群を列挙する", () => {
    const clause = clauseBetween(modeContractSection, "**変更駆動能力群の維持と横断検証義務**");
    expect(clause).toContain("自然言語の要求・不具合報告・エラーログからの直接入力");
    expect(clause).toContain("RU からの要件化");
    expect(clause).toContain("Intake・Learning・Backlog から要件化・実行への接続");
    expect(clause).toContain("既存合意に基づく正規改訂");
    expect(clause).toContain("実変更・検証証拠・安全境界の確認");
    expect(clause).toContain("中断・失敗・再開");
    expect(clause).toContain("重要変更の識別・事前通知・追加通知・結果説明");
  });

  test("意味を引き継ぐ経路成立前の既存能力失効を禁止する", () => {
    const clause = clauseBetween(modeContractSection, "**変更駆動能力群の維持と横断検証義務**");
    expect(clause).toContain("意味を引き継ぐ経路が成立する前に既存能力を失効させない");
  });

  test("代表事例割当と未検証のままの全体合格を禁止する", () => {
    const clause = clauseBetween(modeContractSection, "**変更駆動能力群の維持と横断検証義務**");
    expect(clause).toContain("必要な代表事例の割当で行い");
    expect(clause).toContain("対象となる能力・操作・環境が未検証のまま全体を合格としない");
    expect(clause).toContain("すべての組合せを機械的に重複実行する必要はなく");
  });
});

describe("実装・検証のみの単独工程接続（case-run workflow 実装本体）", () => {
  test("単独工程からの実装・検証接続節が存在する", () => {
    expect(caseRunSkill).toContain("## 単独工程からの実装・検証接続");
  });

  test("正規情報を再所有せず再形成を一律に要求しない", () => {
    const clause = sectionBetween(caseRunSkill, "## 単独工程からの実装・検証接続");
    expect(clause).toContain("実行境界が要求・設計の正規情報を再所有せず");
    expect(clause).toContain("要件確定・設計確定の再形成を一律に要求しない");
  });

  test("実行した事実だけを完了の根拠にしない", () => {
    const clause = sectionBetween(caseRunSkill, "## 単独工程からの実装・検証接続");
    expect(clause).toContain("実行した事実だけを完了の根拠にしない");
  });

  test("4区分を正規情報から再構成し重複実行しない", () => {
    const clause = sectionBetween(caseRunSkill, "## 単独工程からの実装・検証接続");
    expect(clause).toContain("採用済み・未決・試作・成立済み作業の4区分を正規情報から再構成");
    expect(clause).toContain("成立済み作業を不当に重複実行しない");
  });
});

describe("要件確定のみの入口接続（req-define command）", () => {
  test("要件確定のみの単独工程条項が存在する", () => {
    expect(reqDefineCommand).toContain("要件確定のみの単独工程の独立完了");
  });

  test("要件doc 確定で完了し後続実装・Issue・PR を一律に要求しない", () => {
    const clause = clauseBetween(reqDefineCommand, "利用者が要件確定のみを求めた場合");
    expect(clause).toContain("後続実装・Issue・PR を一律に要求しない");
    expect(clause).toContain("case-auto 起動は利用者の判断で行う");
  });
});

describe("実行モード指定の参照（case-auto command）", () => {
  test("実行モード指定に単独工程の独立完了・一気通貫実行・中断再開の実行境界を含める", () => {
    const clause = clauseBetween(caseAutoCommand, "- 実行モード指定");
    expect(clause).toContain("要件確定のみ・設計確定のみ・確定済み設計からの実装・検証のみの各単独工程の独立完了");
    expect(clause).toContain("小規模案件の一気通貫実行");
    expect(clause).toContain("中断・再開の実行境界");
  });

  test("モード契約の正が workflow 実装本体であることを参照する", () => {
    const clause = clauseBetween(caseAutoCommand, "- 実行モード指定");
    expect(clause).toContain("agentdev-workflow-case-auto");
    expect(clause).toContain("v5 有限実行モード」節）が所有する");
  });
});

describe("design 宣言との所在整合（v51 Design）", () => {
  test("有限作業と実装接続節に実行接続の実装所在の反映確認記述が存在する", () => {
    expect(v51ConnectionSection).toContain("実行接続の実装所在");
    expect(v51ConnectionSection).toContain("agentdev-workflow-case-auto");
    expect(v51ConnectionSection).toContain("agentdev-workflow-case-run");
    expect(v51ConnectionSection).toContain("req-define command");
  });

  test("実装所在を重複定義しないことを宣言する", () => {
    expect(v51ConnectionSection).toContain("本 Design は実装所在を重複定義しない");
  });
});
