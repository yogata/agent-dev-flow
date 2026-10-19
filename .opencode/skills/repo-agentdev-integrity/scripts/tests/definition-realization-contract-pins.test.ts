// ADF-COVERS(verification): REQ-031-036, REQ-052-016, REQ-052-017, REQ-032-040, REQ-032-041, REQ-004-064, REQ-004-065, REQ-062-010, REQ-115-001, REQ-115-002, REQ-115-003, REQ-116-001, REQ-116-002, REQ-116-003, REQ-116-004, REQ-116-005
//
// backlog 一式 20261019T231959JST（Case #3816）で確定した実現面契約の pin 検査。
// 配布物本文・references・REQ 本文の追記文言が恒久的に保持されることを、
// 内容検索（pin 型）で検証する。pin の文言変更は期待値追随を同一 PR で行う。

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..");

function read(...parts: string[]): string {
  return readFileSync(join(repoRoot, ...parts), "utf8");
}

describe("委譲指示規律の docs パス literal 参照禁止（REQ-031-036）", () => {
  const harness = read("src", "common", "skills", "agentdev-case-run-execution-adapter", "references", "harness-delegation.md");

  test("docs 配下パスの literal 参照禁止と抽象化参照への統一を規定する", () => {
    expect(harness).toContain("docs 配下パスの literal 参照禁止と抽象化参照への統一");
    expect(harness).toContain("既存本体と同一の抽象化参照");
    expect(harness).toContain("予防観点の引き渡し");
  });

  test("検出カテゴリの区別（配布依存境界 checker と実行時未解決参照 heuristic）を規定する", () => {
    expect(harness).toContain("検出カテゴリが異なる別規律");
    expect(harness).toContain("配布依存境界 checker");
    expect(harness).toContain("heuristic");
  });

  test("既存の canonical 参照規律行と sidecar 記録規律行を保持する", () => {
    expect(harness).toContain("canonical 参照は節名のみ");
    expect(harness).toContain("対応関係は traceability sidecar への記録");
  });
});

describe("issue-operation-recovery の障害局面規律（REQ-052-016、REQ-052-017）", () => {
  const recovery = read("src", "common", "skills", "agentdev-issue-management", "references", "issue-operation-recovery.md");

  test("tool 内部モジュールの書込み直接起動禁止を規定する（REQ-052-016）", () => {
    expect(recovery).toContain("tool 内部モジュールの書込み直接起動禁止");
    expect(recovery).toContain("診断手順の読み取り切り分けに限定");
    expect(recovery).toContain("書込み系の正規経路は Custom Tool");
  });

  test("plugin ホストプロセス固有環境差の分類行を保持する（REQ-052-017）", () => {
    expect(recovery).toContain("plugin ホストプロセス固有環境差");
    expect(recovery).toContain("恒常的に非ゼロ終了する場合");
    expect(recovery).toContain("恒常性の確認は、再試行と回復手段");
    expect(recovery).toContain("既存の3分類");
    expect(recovery).toContain("読み取り系の切り分けに限定");
  });

  test("既存の bash gh 例外手順と2段分離試験の判定基準を保持する", () => {
    expect(recovery).toContain("gh exit 66 恒常失敗時の bash gh 例外手順");
    expect(recovery).toContain("2 段分離試験");
    expect(recovery).toContain("bash 成功 + runner 経路失敗");
  });
});

describe("QG-4 規律の file-level split と race 再検証（REQ-032-040、REQ-032-041）", () => {
  const qg4 = read("src", "common", "skills", "agentdev-quality-gates", "references", "qg-4-final-acceptance.md");

  test("条件付き file-level split（2段構成）を規定する（REQ-032-040）", () => {
    expect(qg4).toContain("条件付き file-level split");
    expect(qg4).toContain("汎用分割");
    expect(qg4).toContain("対象ファイル単独実行の2段構成");
    expect(qg4).toContain("全実行への一律適用を要求せず");
  });

  test("bun バージョン更新時の終了コード race 再検証を規定する（REQ-032-041）", () => {
    expect(qg4).toContain("bun バージョン更新時の終了コード race 再検証");
    expect(qg4).toContain("再現有無を再検証し、検証結果と版を記録する");
  });

  test("既存の3 cwd 分割実行の正規形と機械受理基準を保持する", () => {
    expect(qg4).toContain("3 cwd 分割実行");
    expect(qg4).toContain("終了コード・版・検査範囲の保持");
  });
});

describe("ドラフト保存時永続化と oldText 転記規約（REQ-004-064、REQ-004-065、REQ-062-010）", () => {
  const draftGen = read("src", "common", "skills", "agentdev-workflow-req-define", "references", "draft-generation.md");
  const reqDefineCommand = read("src", "common", "commands", "agentdev", "req-define.md");
  const reqDefineSkill = read("src", "common", "skills", "agentdev-workflow-req-define", "SKILL.md");
  const revision = read("src", "common", "skills", "agentdev-workflow-case-revise", "references", "definition-revision.md");

  test("STEP-9 の明示パス commit（スイープ禁止・ステージ確認・Form Zero との対）を規定する（REQ-004-064）", () => {
    expect(draftGen).toContain("明示パス指定の commit で git 永続化");
    expect(draftGen).toContain("スイープ操作");
    expect(draftGen).toContain("共有 working tree のステージ確認");
    expect(draftGen).toContain("Form Zero の git rm と同一ステップの commit");
  });

  test("req-define command・SKILL の git 制約に保存時 commit の対象外を明記する（REQ-004-064）", () => {
    expect(reqDefineCommand).toContain("明示パス指定の commit（スイープ操作を行わない保存時永続化）はこの制約の対象外");
    expect(reqDefineSkill).toContain("明示パス指定の commit（スイープ操作を行わない保存時永続化。STEP-9 参照）はこの制約の対象外");
  });

  test("oldText の行特定装飾と部分文面の区別規約を規定する（REQ-004-065）", () => {
    expect(draftGen).toContain("oldText の転記規約（行特定装飾と置換対象部分文面の区別）");
    expect(draftGen).toContain("置換対象の部分文面のみを保持");
    expect(draftGen).toContain("expected_old_count");
  });

  test("case-revise の tracked 受入確認と生成責務の非新設を規定する（REQ-062-010）", () => {
    expect(revision).toContain("commit 済み（tracked）であることの受入確認");
    expect(revision).toContain("case-revise が draft を生成・編集する責務を新設するものではない");
  });
});

describe("方針決定 REQ の記録 pin（REQ-115、REQ-116）", () => {
  const req115 = read("docs", "requirements", "REQ-115.md");
  const req116 = read("docs", "requirements", "REQ-116.md");

  test("REQ-115 は型検査基盤導入方針の構成準拠・REQ-112 構造差・確認条件を記録する", () => {
    expect(req115).toContain("既存15スキルの package 構成パターン");
    expect(req115).toContain("REQ-112");
    expect(req115).toContain("bun test 正規形");
    expect(req115).toContain("noUnusedLocals");
  });

  test("REQ-116 は隔離検証リポジトリ方針の前提・再開先を記録する", () => {
    expect(req116).toContain("管理者事前準備");
    expect(req116).toContain("操作カタログの拡張");
    expect(req116).toContain("gh-write guard");
    expect(req116).toContain("case-close");
    expect(req116).toContain("req-define");
  });

  test("REQ-116-004 の用意前提知識文書が存在し、手順と責務を含む", () => {
    const knowledge = read("docs", "knowledge", "gh-isolated-verification-repository.md");
    expect(knowledge).toContain("構築手順と責務");
    expect(knowledge).toContain("運用手順と責務");
    expect(knowledge).toContain("クリーンアップ手順と責務");
    expect(knowledge).toContain("検証再開先");
  });
});
