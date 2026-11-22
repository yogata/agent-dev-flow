// ---------------------------------------------------------------------------
// 起動間隔と待機往復削減の手順 pin。委譲契約 Design「親セッション向け委譲結果
// サマリ」節と case-auto Design「工程・投入境界のハンドオフ」節、runtime
// 実行モデル Design「runtime 制御ループ」節〔起動間隔・並列数制御〕の規範が
// 本 skill 配下 reference に実装されていることを anchor 型 pin で確認する。
// 対応関係の正は repository top-level の traceability sidecar（本ファイルは
// 配布物のため concrete ID を直書きせず節名参照のみ）。
// ---------------------------------------------------------------------------

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);

function readHarnessDelegation(): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-case-run-execution-adapter",
      "references",
      "harness-delegation.md",
    ),
    "utf-8",
  );
}

describe("並列委譲の起動間隔と待機往復削減の pin", () => {
  const doc = readHarnessDelegation();

  test("起動バースト抑止の起動間隔（10秒）が維持されている", () => {
    expect(doc).toContain("委譲起動ごとに10秒の起動間隔を置く");
  });

  test("起動間隔の待機は専用往復ターンとして発生させず、同一ターン組み合わせまたは実行側最小待機へ統合する", () => {
    expect(doc).toContain("起動間隔の待機は起動だけの専用往復ターンとして発生させない");
    expect(doc).toContain("同一ターン内に組み合わせて待機を消化するか、実行側の最小待機手段（スクリプト側待機）へ統合する");
    expect(doc).toContain("待機単独の往復を削減しても、起動間隔・並列性・共有枠およびスロット型補充の現行規律は維持する");
  });

  test("旧規定の別ターン待機コマンド例示（sleep 10）は残存しない", () => {
    expect(doc).not.toContain("bash: sleep 10");
    expect(doc).not.toContain("待機コマンド（例:");
  });

  test("1ブロック1委譲起動と既存の安全境界が維持されている", () => {
    expect(doc).toContain("同一のTool呼び出し一括ブロックで複数の委譲起動を発行しない（1ブロック1委譲起動）");
    expect(doc).toContain("固定バッチの全件完了待ち、同時一括起動、同期逐次フォールバックへの切替は行わない");
    expect(doc).toContain("case-auto Design「工程・投入境界のハンドオフ」節");
  });
});
