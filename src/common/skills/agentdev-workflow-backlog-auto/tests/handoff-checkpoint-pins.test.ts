// ---------------------------------------------------------------------------
// 工程・投入境界のチェックポイントとハンドオフ、冪等再開の pin。
// backlog-auto Design「工程境界チェックポイント」節の規範が本 skill 配下
// SKILL.md と公開 command 定義に実装されていることを anchor 型 pin で確認する。
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

function readSkill(): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-backlog-auto",
      "SKILL.md",
    ),
    "utf-8",
  );
}

function readCommand(): string {
  return fs.readFileSync(
    path.join(REPO_ROOT, "src", "common", "commands", "agentdev", "backlog-auto.md"),
    "utf-8",
  );
}

describe("工程境界チェックポイントとハンドオフの pin", () => {
  test("SKILL.md に各工程境界のハンドオフ出力と構成要素が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("### 工程・投入境界のチェックポイントとハンドオフ");
    expect(skill).toContain("inspect/promote 収束後（STEP-3/4）、backlog-review/RU 生成後（STEP-5）、req-define 完了後（STEP-8）、case-auto バッチ投入後（STEP-9）の各工程境界で、成立した永続状態に対応するハンドオフを出力できる");
    expect(skill).toContain("入力集合または一式識別子、成立を裏付ける既存ファイルと set-state（作成済みの場合）、git の参照、関連 Issue/PR 番号、既存の再開入口を含める");
    expect(skill).toContain("「親セッション向け委譲結果サマリ」から必要な範囲だけ参照する");
  });

  test("SKILL.md に新規セッションからの冪等継続とチェックポイントの非正本性が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("新規セッションでは既存の証拠と正規状態を突合し、未完了部分のみを冪等に継続する");
    expect(skill).toContain("昇格の合流、承認、一式完了判定、リリース条件を保ち、通常の一回起動に手動コマンド入力を追加しない");
    expect(skill).toContain("チェックポイントは終了済みの証拠でも、新しい工程状態の正本でもない");
  });

  test("公開 command 定義に工程境界チェックポイント節が投影されている", () => {
    const command = readCommand();
    expect(command).toContain("## 工程境界チェックポイント");
    expect(command).toContain("各工程境界で、成立した永続状態に対応するハンドオフを出力できる");
    expect(command).toContain("入力集合または一式識別子、成立を裏付ける既存ファイルと set-state（作成済みの場合）、git の参照、関連 Issue/PR 番号、既存の再開入口を含める");
    expect(command).toContain("未完了部分のみを冪等に継続する");
    expect(command).toContain("チェックポイントは終了済みの証拠でも、新しい工程状態の正本でもない");
    expect(command).toContain("「工程・投入境界のチェックポイントとハンドオフ」節");
  });

  test("既存の再開プロトコルと一式再開経路は維持されている", () => {
    const skill = readSkill();
    expect(skill).toContain("STEP-7〜11 の中断時は set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する");
    expect(skill).toContain("完了済み工程を重複実行せず、未完了工程を完了済みと誤認しない。確定不能な工程は未完了として扱う");
  });
});
