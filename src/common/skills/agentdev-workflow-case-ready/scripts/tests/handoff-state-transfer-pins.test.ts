// ---------------------------------------------------------------------------
// case-ready の後続工程への状態引渡しの pin。case-auto Design
// 「工程・投入境界のハンドオフ」節（case-ready 後の再開は削除された
// draft/RU に依存しない）の規範が本 skill 配下 SKILL.md に実装されている
// ことを anchor 型 pin で確認する。対応関係の正は repository top-level の
// traceability sidecar（本ファイルは配布物のため concrete ID を直書きせず
// 節名参照のみ）。
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

function readSkill(): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-case-ready",
      "SKILL.md",
    ),
    "utf-8",
  );
}

describe("後続工程への状態引渡しの pin", () => {
  test("SKILL.md の再開プロトコルに状態引渡し（draft/RU 削除後も Issue と canonical 成果物上で再開成立）が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("- 後続工程への状態引渡し:");
    expect(skill).toContain("後続工程（case-run）と新規セッションからの再開に必要な正規状態（Root Case 本文の execution contract、Epic Issue 本文の実行構成、Child Issue、Wave / 依存構造）は Issue と canonical 成果物上で成立する");
    expect(skill).toContain("STEP-7 の draft / RU 削除後に後続の実行または再開が削除された draft/RU に依存せず成立することを、本工程の状態引渡しとして担保する");
    expect(skill).toContain("case-auto Design「工程・投入境界のハンドオフ」節");
  });

  test("draft/RU 削除と ready 遷移の既存規律は維持されている", () => {
    const skill = readSkill();
    expect(skill).toContain("| STEP-7 | draft / RU 削除と同期確認 |");
    expect(skill).toContain("draft / RU の削除（成功時のみ。blocked、failed、中断時は保持）");
  });
});
