// ADF-COVERS(verification): REQ-101-017, REQ-101-018, REQ-101-019
/**
 * Structure verification for the agreement-change reflection and evidence
 * freshness route built into the case-revise workflow skill references
 * (REQ-101-017 / REQ-101-018 / REQ-101-019).
 *
 * REQ-101-017 requires the five-way distinction between 変更の記録 (record),
 * 影響対象への変更到達 (reaching affected targets), 下流消費成果物への反映
 * (reflection into downstream consumed artifacts), 消費担当による最新条件の
 * 受領 (acknowledgment of the latest conditions by the consuming worker),
 * and 反映後成果物の読み戻し確認 (read-back confirmation of the reflected
 * artifacts), plus the suppression of new dispatch or final acceptance under
 * the old contract while an important-condition change is unreflected.
 *
 * REQ-101-018 requires per-impact-scope freshness confirmation of existing
 * evidence, checked items, N/A verdicts, and pass verdicts; no reuse of
 * affected verdicts as acceptance grounds until re-evaluated; and no blanket
 * stop or discard of unaffected work or evidence.
 *
 * REQ-101-019 requires traceable retention of which contract conditions and
 * which state of the target artifact each piece of evidence was obtained
 * against, using existing commits, contract change records, and artifact
 * references.
 *
 * This test pins the structural presence of those route elements in the
 * distributed reference bodies (src/common/skills/**). End-to-end scenario
 * execution on the real execution base is owned by the Wave-3 Epic-wide
 * final verification obligation.
 */

import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;
function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);

function readRepoFile(relParts: string[]): string {
  const abs = path.join(REPO_ROOT, ...relParts);
  return fs.readFileSync(abs, "utf-8");
}

describe("合意変更の 5 段階区別管理（definition-revision.md）", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "definition-revision.md",
  ]);

  it("5 段階区別管理の節を持つ", () => {
    expect(content).toContain("## 合意変更の 5 段階区別管理");
  });

  it("5 段階（記録・変更到達・反映・受領・読み戻し確認）を区別して扱う", () => {
    expect(content).toContain("「変更の記録」「影響対象への変更到達」「下流消費成果物への反映」「消費担当による最新条件の受領」「反映後成果物の読み戻し確認」の 5 段階を区別して扱う");
  });

  it("5 段階を担い手・実施位置付きで区別する", () => {
    expect(content).toContain("| 影響対象への変更到達 |");
    expect(content).toContain("| 下流消費成果物への反映 |");
    expect(content).toContain("| 消費担当による最新条件の受領 |");
    expect(content).toContain("| 反映後成果物の読み戻し確認 |");
  });

  it("各段階が他の段階の完了をもって代替されない", () => {
    expect(content).toContain("各段階は他の段階の完了をもって代替しない");
    expect(content).toContain("到達・反映・読み戻し確認が未完了であれば合意変更の反映は完了していない");
  });

  it("未完了段階が残る場合は case-ready 引き継ぎへ進まない", () => {
    expect(content).toContain("5 段階の未完了段階が残る場合は case-ready 引き継ぎへ進まず");
  });
});

describe("証拠・既判定の鮮度確認（impact-reassessment.md）", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "impact-reassessment.md",
  ]);

  it("影響範囲単位の鮮度確認節を持つ", () => {
    expect(content).toContain("## 証拠・既判定の鮮度確認（影響範囲単位）");
  });

  it("合意変更・評価範囲変更・検証対象成果物の内容・リビジョン変更を適用契機に含む", () => {
    expect(content).toContain(
      "合意変更、評価範囲の変更、または検証対象成果物の内容・リビジョンの変更により、既存の証拠、チェック済み項目、N/A 判定、pass 判定が引き続き有効かを影響範囲単位で確認する",
    );
  });

  it("影響する既判定は再評価が完了するまで受け入れ根拠へ再利用しない", () => {
    expect(content).toContain("再評価が完了するまで受け入れ根拠（QG 判定、完了条件評価、merge 判断等）へ再利用しない");
  });

  it("影響しない証拠・判定を一律に停止・破棄しない", () => {
    expect(content).toContain("一律に停止・破棄せず、影響しない証拠の取り直しを要求しない");
  });

  it("実行中・完了済みの作業の処置判断は進行状態別判断に従う", () => {
    expect(content).toContain(
      "実行中・完了済みの作業の継続・停止・修正・再検証の必要性は「影響対象ごとの処置判断（継続・停止・再実行）」の進行状態別判断に従う",
    );
  });

  it("鮮度確認の結果を完了報告に含める", () => {
    expect(content).toContain("鮮度確認の結果（有効と確認した証拠・判定、再評価対象とした証拠・判定）を完了報告に含める");
  });
});

describe("証拠の追跡可能性保持（impact-reassessment.md）", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "impact-reassessment.md",
  ]);

  it("証拠の追跡可能性保持節を持つ", () => {
    expect(content).toContain("## 証拠の追跡可能性保持");
  });

  it("証拠がどの契約条件と対象成果物のどの状態に対して得られたかを追跡可能に保持する", () => {
    expect(content).toContain(
      "証拠がどの契約条件と対象成果物のどの状態に対して得られたかを追跡可能に保持する",
    );
  });

  it("追跡は既存のコミット・契約変更記録・成果物への参照で行う", () => {
    expect(content).toContain("対象成果物の状態はコミット（commit hash、ブランチ、対象成果物のリビジョン）で");
    expect(content).toContain("契約条件は契約変更記録（Definition Amendment PR、判断変更の記録コメント、Case 関連 Issue 本文の更新履歴）で");
    expect(content).toContain("証拠自体は成果物への参照（検証記録・テスト・ログのパスと取得時の対象状態）で追跡可能にする");
  });

  it("証拠台帳や追加の管理ファイルを新たに導入しない", () => {
    expect(content).toContain("証拠台帳、専用のメタデータ形式、追加の管理ファイルを新たに導入しない");
  });
});

describe("反映後成果物の読み戻し確認と旧契約抑止（handoff-and-update.md）", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "handoff-and-update.md",
  ]);

  it("読み戻し確認と旧契約抑止の節を持つ", () => {
    expect(content).toContain("## 反映後成果物の読み戻し確認と旧契約抑止");
  });

  it("更新の投入と読み戻し確認を区別し、読み戻しの結果で反映を判定する", () => {
    expect(content).toContain("更新の投入と読み戻し確認を同一の操作として扱わず、読み戻しの結果で反映を判定する");
  });

  it("Amendment PR 受入後の canonical Definition を読み戻す", () => {
    expect(content).toContain("受入後の canonical Definition（merge 済み main の REQ / Decision / Design）を読み戻し、再合意内容が正本文書へ反映されていることを確認する");
  });

  it("重要条件の変更が未反映の間は旧契約による新規 dispatch と最終受け入れを行わない", () => {
    expect(content).toContain("重要条件の変更が影響対象へ未反映である間は、当該 Definition を契約条件とする新規実行の dispatch と最終受け入れを開始しない");
  });

  it("case-ready 引き継ぎは引き渡し・報告確認・読み戻し確認完了を条件とする", () => {
    expect(content).toContain(
      "case-ready 引き継ぎは、最新条件の引き渡し、適用方針報告の確認、読み戻し確認が完了し、未反映の重要条件がないことを確認した後に行う",
    );
  });

  it("読み戻しで不備を検出した場合は反映済みと扱わず再試行する", () => {
    expect(content).toContain("読み戻し確認で不備を検出した場合は当該更新を反映済みと扱わず、不足分を再試行した後に読み戻しをやり直す");
  });

  it("完了報告に鮮度確認結果と証拠の追跡可能性を含める", () => {
    expect(content).toContain("証拠・既判定の鮮度確認の結果（有効と確認した証拠・判定、再評価対象とした証拠・判定）");
    expect(content).toContain("証拠と契約変更記録・対象成果物状態の対応（commit、PR、成果物への参照）の追跡可能性");
    expect(content).toContain("反映後成果物の読み戻し確認の結果");
  });
});
