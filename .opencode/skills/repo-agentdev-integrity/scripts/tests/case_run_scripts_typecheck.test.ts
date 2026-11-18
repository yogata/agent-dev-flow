//
// case-run scripts 配下の typecheck 組込み検査（REQ-117-007・REQ-115 後続実装）。
//
// 本体リポジトリの品質検査経路（integrity suite・bun test 分割①）から case-run
// scripts 配下の typecheck（tsc --noEmit）を実行し、緑（exit 0）を機械検証する。
// bun test 正規形（QG-4 3 cwd 分割実行）の実行経路・検査対象集合を変化させない
// （本テストは分割① integrity suite の対象であり、bun test 正規形の実行コマンド
// 形態契約は変更しない）。依存未解決環境では skip（整備手順を案内）。

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as path from "node:path";

const caseRunScriptsDir = path.resolve(
  import.meta.dir,
  "../../../src/common/skills/agentdev-workflow-case-run/scripts",
);

describe("REQ-117-007: case-run scripts typecheck gate 組込み", () => {
  test("case-run scripts 配下の tsc --noEmit が緑であること", () => {
    const hasDeps =
      existsSync(path.join(caseRunScriptsDir, "node_modules", "typescript")) &&
      existsSync(path.join(caseRunScriptsDir, "node_modules", "@types", "bun"));
    if (!hasDeps) {
      console.warn(
        "[REQ-117-007 skip] case-run scripts の依存（typescript・@types/bun）が未解決のため skip。正規整備手段: bun install --cwd src/common/skills/agentdev-workflow-case-run/scripts",
      );
      return;
    }
    const result = spawnSync("bun", ["run", "typecheck"], {
      cwd: caseRunScriptsDir,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error("[REQ-117-007 typecheck output]", result.stdout, result.stderr);
    }
    expect(result.status).toBe(0);
  });
});
