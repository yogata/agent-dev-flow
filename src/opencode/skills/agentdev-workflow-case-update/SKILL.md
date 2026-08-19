---
name: agentdev-workflow-case-update
description: "case-update command の workflow 実装本体。既存 Case の本文更新（--body）、コメント追加（--comment）、REQ ファイル更新（--req）、レビューNG専用フロー（--review-ng）の4分岐と Issue 番号解決、現在状態取得、完了報告の制御を所有する。USE FOR: case-update 実行時の workflow 制御（更新種別分岐・テンプレート構造維持・APPEND vs UPDATE 判定）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-update workflow スキル

case-update command の workflow 実装本体。
既存Caseの本文更新、コメント追加、REQファイル更新、レビューNG時対応の制御構造を所有する。
主にレビューNG時の対応で使用される。
CI/CD修正、自律修正ループは管轄外（case-run の責務）である。

case-update command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-update.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-update command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body` / `--comment` / `--req` / `--review-ng`）

## 出力

- 更新されたIssue本文、追加されたコメント、更新されたREQファイル、レビューNGコメントのいずれか

## 副作用

- Issue 本文更新、Issue コメント追加（`agentdev-gh-cli` 経由）
- REQ ファイル更新と commit+push（`--req` 時、`agentdev-git-worktree` の並列実行安全ステージング準拠）
- フェーズは変更しない（現在のフェーズを維持、command 不変条件）

## Control Plane（STEP 一覧）

case-update workflow は次の4 STEP で構成する。
各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。
会話コンテキストに依存せず、durable state（Issue 本文・コメントの現状、REQ ファイル、git 状態）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Issue番号解決 | case-update 起動 | Issue番号確定 | [references/update-flows.md](references/update-flows.md) |
| STEP-2 | 現在のIssue状態取得 | Issue番号確定 | 現在フェーズ判定 | [references/update-flows.md](references/update-flows.md) |
| STEP-3 | 更新内容分岐・実行 | 現在状態取得済み | 更新実行（--body / --comment / --req / --review-ng 別） | [references/update-flows.md](references/update-flows.md) |
| STEP-4 | 完了報告 | 更新実行完了 | 種別別完了報告 | [references/update-flows.md](references/update-flows.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3（4分岐）→ STEP-4
- **更新種別推論**: 種別指定がない場合、ユーザー入力、直前のレビュー結果、対象Issue/REQ、会話文脈から推論する。推論不能時のみユーザーに指定を求めて停止する

### resume protocol

- 再開点は durable state から再構成する: Issue 本文・コメントの現状（更新済み否かの判定）、REQ ファイルの git 状態（commit 済み否か）
- 更新の重複適用は、更新後の Issue 本文/コメント読戻しと REQ ファイルの git log で検出して回避する

### termination

- 正常終了: STEP-4 の完了報告出力まで
- 停止終了: Issue番号解決不能（ユーザー指定待ち）、更新種別推論不能（ユーザー指定待ち）
- フェーズ変更は行わない。CI/CD修正、自律修正ループは実施しない（case-run の管轄）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-workflow-routing`: Issue番号解決、--body/--comment/--req/--review-ng 各フロー詳細、レビュー拒否タイプ分類
- `agentdev-workflow-lifecycle`: 現在フェーズ判定、work_type 分岐の参照
- `agentdev-workflow-templates`: テンプレート選定、コメント/レビューNGコメントの【必須】セクション検査
- `agentdev-gh-cli`: Issue 本文更新、Issue コメント追加の I/O 手続きと VERIFY
- `agentdev-quality-gates`: QG-{N} 乖離検出結果の引用（--review-ng 時）
- `agentdev-git-worktree`: `--req` 時の並列実行安全ステージング
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-update.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-update/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、case-update command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **フェーズ維持**: フェーズは変更しない（現在のフェーズを維持）
- **管轄外**: CI/CD修正、自律修正ループは case-update の管轄外（case-run の責務）。REQ更新、レビューNG時のコメント追加、Issue本文更新のみを責務とする
- **SSoT 整合**: Issue本文と要件docの不整合を防ぐ（command 不変条件）
- **テンプレート構造維持**: `--body` 更新時は Issue 作成時と同じテンプレート構造を維持し、【必須】セクションの欠落がないことを確認してから投稿する

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-update command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
