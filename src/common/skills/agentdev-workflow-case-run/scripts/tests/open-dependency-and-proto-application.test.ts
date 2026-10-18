// 未決依存と明示許可試作の区別の実行経路適用（REQ-108-013）の構造照合。
//
// 実行契約に投影された「未決判断に依存する部分（保留）と依存しない部分（実行継続）」の
// 区別、および「明示的に許可された試作を正式採用・正規成果物の確定・本番適用と区別する」
// 記録が、case-open（実行契約の構成要素）、case-run（前置ゲート・最終ゲート）、
// execution-adapter（委譲プロンプト）、workflow-templates（記録欄の要否確認）の各
// workflow skill 定義へ適用されていることを検証する。anchor 型の核心トークン照合であり、
// 対応関係の正は repository top-level traceability/ sidecar が保持する。
//
// 試作の正式採用への昇格防止（未決事項の自動解決禁止）と、未決事項の存在だけを理由とする
// 依存しない作業の停止禁止（過剰停止防止）を、各適用箇所で保持していることを pin する。

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
const caseRunDelegation = readSkill("agentdev-workflow-case-run/references/delegation-and-result.md");
const adapterSkill = readSkill("agentdev-case-run-execution-adapter/SKILL.md");
const adapterHarness = readSkill("agentdev-case-run-execution-adapter/references/harness-delegation.md");
const templatesSkill = readSkill("agentdev-workflow-templates/SKILL.md");

// 未決判断に依存する部分は保留し、依存しない部分は継続する（過剰停止防止の核心トークン）
const HOLD_AND_CONTINUE_TOKENS = [
  "未決判断に依存する",
  "保留",
  "依存しない作業を停止しない",
];

// 明示許可試作を正式採用と区別する（昇格防止の核心トークン）
const PROTO_SEPARATION_TOKENS = [
  "明示的に許可した試作",
  "正式採用・正規成果物の確定・本番適用と区別",
  "試作の実施、成果物の存在、試験の成功を当該候補の正式採用や未決事項の解決として扱わない",
];

describe("未決依存の保留と実行継続の区別（実行経路適用）", () => {
  test("case-open は実行契約候補の構成で未決依存の保留と区別記録を保持する", () => {
    expect(caseOpenSkill).toContain("意味的な依存関係に基づいて判断し");
    expect(caseOpenSkill).toContain("未決判断に依存する");
    expect(caseOpenSkill).toContain("保留");
    expect(caseOpenSkill).toContain("不足している判断と対象範囲を明示");
    expect(caseOpenSkill).toContain("未決事項の存在だけを理由に依存しない作業を実行契約候補から除外しない");
    expect(caseOpenSkill).toContain("新たな管理機構を設けない");
  });

  test("case-run 共通制約は前置 gate と委譲での保留/実行区別を保持する", () => {
    expect(caseRunSkill).toContain("未決依存の保留と実行継続の区別");
    expect(caseRunSkill).toContain("依存する部分を保留し");
    expect(caseRunSkill).toContain("未決事項の存在だけを理由に依存しない作業を停止しない");
  });

  test("case-run STEP-S2 消費境界は前置として保留部分を委譲プロンプトへ引き渡す", () => {
    expect(caseRunSingle).toContain("未決依存の保留と実行継続の区別（前置）");
    expect(caseRunSingle).toContain("委譲プロンプトへ引き渡す");
    expect(caseRunSingle).toContain("保留は完了条件の達成判定対象から当該部分を分離");
  });

  test("adapter 委譲先は保留部分を実装対象から分離し依存しない部分を継続する", () => {
    expect(adapterSkill).toContain("依存する部分を保留し");
    expect(adapterSkill).toContain("依存しない部分は他の実行条件を満たす限り実装を継続する");
    expect(adapterSkill).toContain("未決事項の存在だけを理由に依存しない作業を停止しない");
  });

  test("委譲プロンプト構築は保留/実行可能の区別と試作許可状態を構造化文脈へ反映する", () => {
    expect(adapterHarness).toContain("open_items");
    expect(adapterHarness).toContain("resolved_context");
    expect(adapterHarness).toContain("依存しない部分を継続する");
    expect(adapterHarness).toContain("正式採用・正規成果物の確定・本番適用へ昇格させない");
  });
});

describe("明示許可試作の区別（正式採用への昇格防止）", () => {
  test("case-open は実行契約へ試作の明示記録を保持する", () => {
    for (const token of PROTO_SEPARATION_TOKENS) {
      expect(caseOpenSkill).toContain(token);
    }
  });

  test("case-run 共通制約は試作の区別と非昇格を保持する", () => {
    for (const token of PROTO_SEPARATION_TOKENS) {
      expect(caseRunSkill).toContain(token);
    }
  });

  test("case-run STEP-S5 最終受け入れ確認は試作の昇格防止を保持する", () => {
    expect(caseRunDelegation).toContain("試作の正式採用への昇格防止（最終受け入れ確認）");
    expect(caseRunDelegation).toContain("試作の成果物が正式採用・正規成果物の確定・本番適用として扱われていないこと");
    expect(caseRunDelegation).toContain("未決事項を自動解決しない");
    expect(caseRunDelegation).toContain("保留された部分は、試作の成功を根拠に達成済みとして消費しない");
  });

  test("adapter 委譲先は試作の区別と非昇格を保持する", () => {
    for (const token of PROTO_SEPARATION_TOKENS) {
      expect(adapterSkill).toContain(token);
    }
  });
});

describe("テンプレート記録欄の要否確認（専用欄の非新設）", () => {
  test("workflow-templates は未決依存・試作記録を既存欄で表現する規約を保持する", () => {
    expect(templatesSkill).toContain("専用セクションを新設せず既存欄で表現する");
    expect(templatesSkill).toContain("対象範囲・対象外");
    expect(templatesSkill).toContain("完了条件");
  });
});
