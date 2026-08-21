---
title: case-update Design
status: accepted
created: 2026-06-21
updated: 2026-08-15
---
<!-- ADF-COVERS(implementation): REQ-033-001, REQ-033-002, REQ-033-003, REQ-033-004, REQ-033-005 -->
<!-- ADF-COVERS(implementation): REQ-033-001, REQ-033-003, REQ-033-004, REQ-033-005 -->

# case-update Design

## 目的

既存 Case（Issue）の本文更新、コメント追加、または REQ ファイル更新を行う。
レビュー NG コメント対応を含む。

## 承認・HITL 境界

- ユーザー指示完結型であり、コマンド自身の承認点を持たない（更新対象、更新内容はユーザー指示による）。
- レビュー NG コメント（`--review-ng`）は QG-3 乖離検出結果（既に提示済みの判断材料）を引用するものであり、新規の HITL を発生させない。

## 入力

- Issue番号（ユーザー入力またはセッション内会話からのみ取得）
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別フラグ: `--body` / `--comment` / `--req` / `--review-ng`

## 出力

- 更新された Issue 本文 または 追加されたコメント または 更新された REQ ファイル または レビュー NG コメント

## 副作用

- GitHub API: Issue 本文更新（`--body-file` 使用、`agentdev-gh-cli` VERIFY）、コメント追加（`--body-file`）
- REQ ファイル更新: `docs/requirements/**` 編集、git commit/push（明示パスステージング）
- フェーズ変更: なし（現在のフェーズを維持）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-update`）が正規情報源である。

- Issue番号解決: ユーザー入力またはセッション内会話から取得。`gh issue list` / `gh issue status` 等は禁止（G03）
- 現在状態取得: Issue 状態を取得し、フェーズ判定（`agentdev-workflow-routing`、`agentdev-workflow-lifecycle`）
- 更新種別ごとの分岐:
  - `--body`（Issue 本文更新）。Issue 作成時と同じテンプレート構造を維持（G06）。`--body-file` 使用（G08）、`agentdev-gh-cli` VERIFY（G09）
  - `--comment`（コメント追加）。テンプレート【必須】セクション確認（G07）、`--body-file` 使用、VERIFY
  - `--req`（REQ ファイル更新（APPEND/UPDATE 対応）、git commit/push）
  - `--review-ng`（レビュー NG コメント）。**必ず QG-3 の乖離検出結果を引用**（G05）
- 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/case-update.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（制御構造、STEP 遷移、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-update`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（連携（review-ng 時の QG-3 引用））
- [quality-gates.md](../quality/quality-gates.md)（QG-3 乖離検出結果（`--review-ng` 時に引用））

## 対象外

- CI/CD 修正、自律修正ループ（G02、case-run の責務）
- `gh issue list` / `gh issue status` 等による Issue番号取得（G03）
- SSoT 整合性の破壊（G04）
- `--review-ng` 時の QG-3 乖離検出結果引用省略（G05）
- `--body` 更新時の Issue 作成時テンプレート構造維持省略（G06）
- コメント / レビュー NG コメント テンプレート【必須】セクション確認省略（G07）
- `--body` 直接指定（G08、`--body-file` 使用必須）
- `agentdev-gh-cli` 安全読み取り手順省略（G09）
- work_type 分岐判定基準、固有ルールの独自保持（G10、`agentdev-workflow-lifecycle` 参照）

## 検証観点

- フェーズ維持（G01）: 現在のフェーズを変更しない
- 出力制約（G11）: 成果物本文（Issue 本文、コメント、commit message）は verbatim で返す

## 停止状態

- Issue番号が解決できない場合（G03 の範囲外の手段は使用せず、エラーとして報告して停止する）。
- テンプレート必須セクションの欠落を検出した場合（G06、G07。投稿前に停止し補完を求める）。
- gh CLI / git 操作の失敗時（`agentdev-gh-cli` のエラー取扱いに従い、自動リトライ範囲を超えたら停止して報告する）。

## See Also

- [case-run.md](case-run.md), [case-close.md](case-close.md)（関連コマンド）
- `agentdev-workflow-case-update` skill（workflow 実装本体）
- `agentdev-workflow-routing` skill（フェーズ判定、次コマンド推論）
- `agentdev-workflow-lifecycle` skill（work_type 分岐判定）
- `agentdev-gh-cli` skill（gh CLI 安全使用）
- `agentdev-quality-gates` skill（QG-3（`--review-ng` 時引用））
- REQ-006（case-update / Issue更新）

