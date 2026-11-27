// ---------------------------------------------------------------------------
// 工程・投入境界のハンドオフ、直接実行の基準、起動間隔待機の組み込みの pin。
// case-auto Design「工程・投入境界のハンドオフ」節と委譲契約 Design
// 「親セッション向け委譲結果サマリ」節の規範が本 skill 配下 SKILL.md と
// 公開 command 定義に実装されていることを anchor 型 pin で確認する。
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

test("同じ Root への復旧を公開 workflow の再開手順から参照する", () => {
  const skill = readSkill();
  expect(skill).toContain("同じ Root でこの再開入口を使う");
  const recovery = fs.readFileSync(
    path.join(REPO_ROOT, "src", "common", "skills", "agentdev-workflow-orchestration",
      "references", "case-auto-recovery.md"),
    "utf-8",
  );
  expect(recovery).toContain("実行単位ごとに作成済みの子 Issue");
  expect(recovery).toContain("対象 Case・base・head で作成済みの実装PR");
  expect(recovery).toContain("対象 PR のマージ状態と取り込みコミット");
  expect(recovery).toContain("不足が確定した処理だけを再試行する");
  expect(recovery).toContain("読取不能、複数候補、不一致が残る場合");
  expect(recovery).toContain("マージ済みで記録が未反映なら記録・終了処理を継続する");
});

function readSkill(): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-case-auto",
      "SKILL.md",
    ),
    "utf-8",
  );
}

function readCommand(): string {
  return fs.readFileSync(
    path.join(REPO_ROOT, "src", "common", "commands", "agentdev", "case-auto.md"),
    "utf-8",
  );
}

describe("工程・投入境界のハンドオフの pin", () => {
  test("SKILL.md にハンドオフ節（引き渡し要素と新規セッション再開）が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("### 工程・投入境界のハンドオフ");
    expect(skill).toContain("起動時対象の安定識別子、Root Case、関連 Issue/PR 番号、適用可能な `.agentdev/` 状態ファイルと git 側の参照、再開入口を引き渡す");
    expect(skill).toContain("新規セッションは当該正規状態から最早の未収束 stage を再構成し、完了済み対象を再実行せず、稼働中のタスクを二重起動しない");
    expect(skill).toContain("case-ready 後の再開は削除された draft/RU に依存しない（Issue と Epic だけで再開成立）");
    expect(skill).toContain("実行中や未確認を収束と扱わず、ハンドオフを完了報告に置換しない");
    expect(skill).toContain("ハンドオフは終了済みの証拠でも、新しい工程状態の正本でもない");
    expect(skill).toContain("「親セッション向け委譲結果サマリ」を用いる");
  });

  test("公開 command 定義に工程・投入境界のハンドオフ節が投影されている", () => {
    const command = readCommand();
    expect(command).toContain("## 工程・投入境界のハンドオフ");
    expect(command).toContain("起動時対象の安定識別子、Root Case、関連 Issue/PR 番号、適用可能な `.agentdev/` 状態ファイルと git 側の参照、再開入口を引き渡す");
    expect(command).toContain("完了済み対象を再実行せず、稼働中のタスクを二重起動しない。case-ready 後の再開は削除された draft/RU に依存しない");
    expect(command).toContain("固定バッチの全件完了待ち、同時一括起動、同期逐次フォールバックに切り替えない");
  });
});

describe("直接実行の基準の pin", () => {
  test("SKILL.md 共通制約に直接実行の基準と必須委譲の非適用が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("**直接実行の基準**");
    expect(skill).toContain("単一ファイルの小規模確認または一〜二回のコマンドで完結する調査・検査は、新規サブエージェントを起動せず case-auto 自身が直接実行する");
    expect(skill).toContain("既存契約で必須の委譲・独立検証（工程委譲、実装実行委譲、品質ゲート等）にはこの基準を適用せず、必須委譲を省略しない");
    expect(skill).toContain("「親セッション向け委譲結果サマリ」節");
  });

  test("公開 command 定義に直接実行の基準が投影されている", () => {
    const command = readCommand();
    expect(command).toContain("単一ファイルの小規模確認または一〜二回のコマンドで完結する調査・検査は新規サブエージェントを起動せず直接実行し、既存契約で必須の委譲・独立検証にはこの基準を適用しない");
  });
});

describe("起動間隔待機の組み込みの pin", () => {
  test("SKILL.md の stage 3 runtime 制御に待機の専用往復ターン禁止が明文化されている", () => {
    const skill = readSkill();
    expect(skill).toContain("起動間隔の待機は起動だけの専用往復ターンとして発生させず");
    expect(skill).toContain("前後の他処理（result 受領と状態管理、空き枠補充候補の収集、次対象の準備等）と同一ターン内に組み合わせて消化するか、実行側の最小待機手段へ統合する");
    expect(skill).toContain("「起動方式（委譲）」節");
  });

  test("既存の起動間隔と並列性の規律は維持されている", () => {
    const skill = readSkill();
    expect(skill).toContain("並列起動時は委譲起動ごとに10秒の起動間隔を置き");
    expect(skill).toContain("同一Tool一括ブロックでの複数起動発行は行わない");
    expect(skill).toContain("起動間隔は stage 1（case-open / case-revise 委譲）・stage 2（case-ready 委譲）・stage 4（case-close 委譲）の並列委譲起動にも同一に適用する");
    expect(skill).toContain("空き枠補充");
    expect(skill).toContain("最初に起動した全 task の完了を待つ固定 batch 方式を取らず");
  });
});
