---
title: case-update SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# case-update SPEC

## 目的

既存 Case（Issue）の本文更新、コメント追加、または REQ ファイル更新を行う。
レビュー NG コメント対応を含む。

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

- Step 1: Issue番号解決（ユーザー入力またはセッション内会話から取得）。`gh issue list` / `gh issue status` 等は禁止（G03）
- Step 2: 現在の Issue 状態を取得、フェーズ判定（`agentdev-workflow-routing`、`agentdev-workflow-lifecycle`）
- Step 3: 更新内容に応じて分岐:
  - `--body`（Issue 本文更新）。Issue 作成時と同じテンプレート構造を維持（G06）。`--body-file` 使用（G08）、`agentdev-gh-cli` VERIFY（G09）
  - `--comment`（コメント追加）。テンプレート【必須】セクション確認（G07）、`--body-file` 使用、VERIFY
  - `--req`（REQ ファイル更新（APPEND/UPDATE 対応）、git commit/push）
  - `--review-ng`（レビュー NG コメント）。**必ず QG-3 の乖離検出結果を引用**（G05）
- Step 4: 完了報告

## 参照する横断 SPEC

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

## See Also

- [case-run.md](case-run.md), [case-close.md](case-close.md)（関連コマンド）
- `agentdev-workflow-routing` skill（フェーズ判定、次コマンド推論）
- `agentdev-workflow-lifecycle` skill（work_type 分岐判定）
- `agentdev-gh-cli` skill（gh CLI 安全使用）
- `agentdev-quality-gates` skill（QG-3（`--review-ng` 時引用））
- REQ-0133（case-update / Issue更新）
