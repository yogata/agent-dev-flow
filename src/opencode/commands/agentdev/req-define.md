---
description: 要件を整理、定義する（機能追加、バグ修正共通）
---

# 要件定義

機能追加またはバグ修正の要件を整理、定義する。
壁打ちフェーズで使用。

**draft-data 入力・出力**: 本コマンドは構造化 `draft-data`（`# draft-data` fenced YAML block）を扱う。
対話の進行は永続状態（durable state。入力ファイル、draft 下書き、`status` frontmatter）から再構成され、会話コンテキストのみを再開の根拠（resume source）としない。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- 実証Issue（`req-define <実証Issue>` 形式の明示指定時。当該実証の正式化を主たる入力とし、評価契約、最終評価結果、参照証拠を取り込む）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て参照専用入力
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力として扱い、未確認事項・採否未確定事項は要件本文と分離する（inspect ライフサイクルに従う）
- **promoted の参照経路**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は backlog-review による RU 化を経由して参照する

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-req-define` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 本コマンドは要件の整理・定義（壁打ち）を扱い、成果物は要件doc（draft）に限定する。実装コードの作成は case-run の責務である
- docs/ の参照は、明示入力ファイル・`docs/requirements/**` の参照・Decision 判断に必要な限定探索の3経路に限定する
- inbox.md、deferred.md、採用済み成果物（promoted）は backlog-review による RU 化を経由して参照する
- 関連ドキュメントはコマンドが特定し、ユーザーへの個別ファイル列挙の依頼は省く
- チェックボックスは測定可能で一意にする（`agentdev-req-analysis` 品質基準）
- 要件doc 構造は req-draft.md テンプレート（構造化 `draft-data` 形式）に従う
- Decision 閾値以上の判断は `agentdev-decision-guidelines` で判定する。Decision 要否確認ゲートでは `agentdev-architecture-advisory` の助言を親エージェントが分類して採用し、未確認事項は要件本文と分離して扱う
- work_type・Scale 判定は `agentdev-workflow-lifecycle` の基準に従う
- draft は `operation_units` セクションを出力する（単一REQ操作も1件の OU として出力）。`depends_on` は必須依存のみ記録し、Issue 階層・Epic/Wave 構成の決定は case-open が担う
- 実証Caseとして確定した後は評価ブランチ利用を別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出する
- 評価契約と test strategy は分離する。test strategy は実証手段・計測手段・実証環境が正常に動作したかを扱い、評価契約は評価対象から得られた結果と採否を扱う
- 本コマンドは実証Caseでも Git 副作用を持たない（評価ブランチ・worktree 準備の実行主体・手順は command Design が所有する）。評価ブランチ作成だけの新しい公開コマンドを追加しない
- Design 分離基準に該当する要件行は `artifact_actions`（`artifact: design`）へ分離する（安定契約例外は除く）。test strategy 項目は verification（検証手順）・pass_criteria（合格基準）・on_failure（不合格時の処置）の3要素を欠落なく持ち、欠落項目は保存前に QG fail として扱う
- 実現面の変更方針（正規所有責務、変更すべき実現面、変更意図、検証との対応）は、実現面の変更がある場合に `realization_actions` セクションへ構造化して出力する。`realization_actions` は `artifact_actions` と分離した独立構造であり、成果物種別を固定 enum としないドメイン中立契約とする（REQ-008-060、DEC-026）

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- ファイル編集スコープは `.agentdev/drafts/**` のみ（他パスへの作成・編集は禁止）
- ユーザーが明示した入力ファイルは参照専用とし、変更・削除を行わない。`.agentdev/backlog/req-units/RU-*.md` の削除は case-open 成功後に実施する
- `git` コマンドは実行しない
