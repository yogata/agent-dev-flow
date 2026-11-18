//
// Local ツール package（agentdev-gh/local）の typecheck 組込み検査（REQ-113-002）。
//
// 本体リポジトリの品質検査経路（integrity suite・bun test 分割①）から Local
// package の typecheck（tsc --noEmit）を実行し、緑（exit 0）を機械検証する。
// 依存解決前提: 対象 package 配下の node_modules（typescript・@types/bun）が
// 未整備の場合は本検査を skip とする（依存整備手順は QG-4 契約の正規整備手段
// に従い、検査本体の責務としない）。依存整備済み環境では fail で停まる。

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as path from "node:path";

const localPackageDir = path.resolve(
  import.meta.dir,
  "../../../src/common/tools/agentdev-gh/local",
);

describe("REQ-113-002: local package typecheck の品質検査経路組込み", () => {
  test("agentdev-gh/local の tsc --noEmit が緑であること", () => {
    const hasDeps =
      existsSync(path.join(localPackageDir, "node_modules", "typescript")) &&
      existsSync(path.join(localPackageDir, "node_modules", "@types", "bun"));
    if (!hasDeps) {
      console.warn(
        "[REQ-113-002 skip] local package の依存（typescript・@types/bun）が未解決のため skip。正規整備手段: bun install --cwd src/common/tools/agentdev-gh/local",
      );
      return;
    }
    const result = spawnSync("bun", ["run", "typecheck"], {
      cwd: localPackageDir,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.error("[REQ-113-002 typecheck output]", result.stdout, result.stderr);
    }
    expect(result.status).toBe(0);
  });
});
