---
name: agentdev-workflow-case-update
description: "case-update command の workflow 実装本体。既存 Case の本文更新（--body）、コメント追加（--comment）、REQ ファイル更新（--req）、レビューNG専用フロー（--review-ng）の4分岐と Issue 番号解決、現在状態取得、完了報告の制御を所有する。USE FOR: case-update 実行時の workflow 制御（更新種別分岐・テンプレート構造維持・APPEND vs UPDATE 判定）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-update workflow スキル

case-update command の workflow 実装本体。
既存Caseの本文更新、コメント追加、REQファイル更新、レビューNG時対応の制御構造を所有する。
主にレビューNG時の対応で使用される。
CI/CD修正、自律修正ループは管轄外（case-run の責務）である。

case-update command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 入力

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body` / `--comment` / `--req` / `--review-ng`）

## 出力

- 更新されたIssue本文、追加されたコメント、更新されたREQファイル、レビューNGコメントのいずれか

## 副作用

- Issue 本文更新、Issue コメント追加（Custom Tool `agentdev_gh` 経由）
- REQ ファイル更新と commit+push（`--req` 時、`agentdev-git-worktree` の並列実行安全ステージング準拠）
- フェーズは変更しない（現在のフェーズを維持、command 不変条件）

## 制御平面（STEP 一覧）

case-update workflow は次の4 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`docs/designs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、永続状態（Issue 本文・コメントの現状、REQ ファイル、git 状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Issue番号解決 | case-update 起動 | Issue番号確定 | [references/update-flows.md](references/update-flows.md) |
| STEP-2 | 現在のIssue状態取得 | Issue番号確定 | 現在フェーズ判定 | [references/update-flows.md](references/update-flows.md) |
| STEP-3 | 更新内容分岐・実行 | 現在状態取得済み | 更新実行（--body / --comment / --req / --review-ng 別） | [references/update-flows.md](references/update-flows.md) |
| STEP-4 | 完了報告 | 更新実行完了 | 種別別完了報告 | [references/update-flows.md](references/update-flows.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3（4分岐）→ STEP-4
- **更新種別推論**: 種別指定がない場合、ユーザー入力、直前のレビュー結果、対象Issue/REQ、会話文脈から推論する。推論不能時のみユーザーに指定を求めて停止する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: Issue 本文・コメントの現状（更新済み否かの判定）、REQ ファイルの git 状態（commit 済み否か）
- 更新の重複適用は、更新後の Issue 本文/コメント読戻しと REQ ファイルの git log で検出して回避する

### 終了条件（termination）

- 正常終了: STEP-4 の完了報告出力まで
- 停止終了: Issue番号解決不能（ユーザー指定待ち）、更新種別推論不能（ユーザー指定待ち）
- フェーズ変更は行わない。CI/CD修正、自律修正ループは実施しない（case-run の管轄）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-workflow-routing`: Issue番号解決、--body/--comment/--req/--review-ng 各フロー詳細、レビュー拒否タイプ分類
- `agentdev-workflow-lifecycle`: 現在フェーズ判定、work_type 分岐の参照
- `agentdev-workflow-templates`: テンプレート選定、コメント/レビューNGコメントの【必須】セクション検査
- Custom Tool `agentdev_gh`: Issue 本文更新、Issue コメント追加の操作（VERIFY は Tool 内部の読み戻し検証）
- `agentdev-quality-gates`: QG-3 乖離検出結果の引用（--review-ng 時）
- `agentdev-git-worktree`: `--req` 時の並列実行安全ステージング
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## 共通制約

- **フェーズ維持**: フェーズは変更しない（現在のフェーズを維持）
- **管轄外**: CI/CD修正、自律修正ループは case-update の管轄外（case-run の責務）。REQ更新、レビューNG時のコメント追加、Issue本文更新のみを責務とする
- **SSoT 整合**: Issue本文と要件docの不整合を防ぐ（command 不変条件）
- **テンプレート構造維持**: `--body` 更新時は Issue 作成時と同じテンプレート構造を維持し、【必須】セクションの欠落がないことを確認してから投稿する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-update command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
