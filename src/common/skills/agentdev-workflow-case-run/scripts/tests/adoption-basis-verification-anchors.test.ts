// 採用根拠照合の実行境界適用（REQ-110-033）の構造照合。
//
// 「正式な採用の根拠を、利用者の明示判断または有効な正規決定という既存の採用基準に
// 照合して扱う」こと、および「作業継続指示・エージェント提案・形式受理を採用根拠と
// しない」ことの規律が、case-open（実行対象構成の採用根拠照合）、case-run（STEP-S2
// 採用根拠照合と前置ゲート）、execution-adapter（context 再確認と structured_context）、
// req-define（合意反映時の採用根拠照合）の各 workflow skill 定義へ適用されていること
// を検証する。anchor 型の核心トークン照合であり、対応関係の正は repository top-level
// traceability/ sidecar が保持する。
//
// 遮断対象（採用根拠としない3系統）と、明示採用範囲を超える一括確定の禁止・一意に
// 解決できない部分の保留を、各適用箇所で保持していることを pin する。

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// repoRoot 解決は main root と worktree の両方で動作する階層数非固定の探索とする
// （process-conformance.test.ts と同一の探索手順）。
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

const caseOpenSkill = readSkill("agentdev-workflow-case-open/SKILL.md");
const caseRunSkill = readSkill("agentdev-workflow-case-run/SKILL.md");
const caseRunSingle = readSkill("agentdev-workflow-case-run/references/single.md");
const adapterSkill = readSkill("agentdev-case-run-execution-adapter/SKILL.md");
const adapterHarness = readSkill("agentdev-case-run-execution-adapter/references/harness-delegation.md");
const reqDefineSkill = readSkill("agentdev-workflow-req-define/SKILL.md");
const reqDefineDialogue = readSkill("agentdev-workflow-req-define/references/input-and-dialogue.md");

// 正式な採用の根拠を既存の採用基準へ照合する（REQ-110-033 の核心文）
const ADOPTION_BASIS_TOKENS = [
  "利用者の明示判断または有効な正規決定という既存の採用基準に照合",
  "採用根拠",
];

// 作業継続指示・エージェント提案・形式受理を採用根拠としない（遮断対象の3系統）
const REJECTION_TOKENS = [
  "作業の継続指示",
  "エージェントによる提案や具体化の存在",
  "形式的に受理された採用指定",
  "採用根拠として扱わない",
];

// 明示採用範囲を超える一括確定の禁止と、一意に解決できない部分の保留
const HOLD_TOKENS = [
  "一括して確定せず",
  "保留",
];

describe("採用根拠照合の実行境界適用（各 workflow skill）", () => {
  test("case-open は実行対象構成の採用根拠照合を保持する", () => {
    expect(caseOpenSkill).toContain("実行対象構成の採用根拠照合");
    for (const token of ADOPTION_BASIS_TOKENS) {
      expect(caseOpenSkill).toContain(token);
    }
    for (const token of REJECTION_TOKENS) {
      expect(caseOpenSkill).toContain(token);
    }
    expect(caseOpenSkill).toContain("既存の停止終了経路");
    expect(caseOpenSkill).toContain("req-define への差し戻し経路に接続する");
  });

  test("case-run STEP-S2 は採用根拠照合を前置ゲートで実施する", () => {
    expect(caseRunSkill).toContain("採用根拠照合（依拠する正規成果物の採用根拠を既存の採用基準へ照合）");
    expect(caseRunSingle).toContain("前置ゲートでの採用根拠照合");
    expect(caseRunSingle).toContain("前置 gate 群に新たな gate を追加しない");
    expect(caseRunSingle).toContain("blocked 正規再開経路");
  });

  test("adapter 委譲先は採用根拠不足を blocker または blocked として扱う", () => {
    for (const token of ADOPTION_BASIS_TOKENS) {
      expect(adapterSkill).toContain(token);
    }
    for (const token of REJECTION_TOKENS) {
      expect(adapterSkill).toContain(token);
    }
    expect(adapterSkill).toContain("自律補完せず blocker 処理");
    expect(adapterSkill).toContain("正規成果物の実読取で採用根拠を照合してから消費する");
  });

  test("req-define は合意反映時の採用根拠照合を保持する", () => {
    expect(reqDefineSkill).toContain("合意反映時の採用根拠照合");
    expect(reqDefineSkill).toContain("未解決質問として保留");
    expect(reqDefineDialogue).toContain("合意反映時の採用根拠照合");
    for (const token of REJECTION_TOKENS) {
      expect(reqDefineDialogue).toContain(token);
    }
    expect(reqDefineDialogue).toContain("未解決質問として保留し対話で確認");
  });
});

describe("structured_context への採用根拠識別情報の記載規律", () => {
  test("adapter harness-delegation は resolved_context の採用根拠識別情報を規定する", () => {
    expect(adapterHarness).toContain("採用根拠の識別情報");
    expect(adapterHarness).toContain("利用者の明示判断または有効な正規決定の別とその参照先");
    expect(adapterHarness).toContain("採用根拠の識別情報として記載しない");
    expect(adapterHarness).toContain("受領側で正式採用済みと扱う根拠にならない");
  });
});

describe("明示採用範囲を超える一括確定の禁止（保留の維持）", () => {
  test("case-open・case-run・adapter・req-define は一括確定禁止と保留を保持する", () => {
    for (const doc of [caseOpenSkill, caseRunSingle, adapterSkill, reqDefineDialogue]) {
      for (const token of HOLD_TOKENS) {
        expect(doc).toContain(token);
      }
    }
  });
});
