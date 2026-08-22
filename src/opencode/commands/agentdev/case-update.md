---
description: 既存Caseの本文更新、コメント追加、またはREQファイル更新を行う
---

# Case更新

既存Caseの本文更新、コメント追加、またはREQファイル更新を行う。
主にレビューNG時の対応に使用。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-update`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-update.yaml`、kind: workflow-extension）を読み込む。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body`/ `--comment`/ `--req`/ `--review-ng`）

## 出力

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル または レビューNGコメント

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-update` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。
同スキルが4 STEP の control plane として制御構造を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 Issue番号解決 | Issue番号またはセッション内会話 | 解決済み Issue 番号・更新種別 | 番号がユーザー入力またはセッション内会話から解決されていること |
| STEP-2 現在のIssue状態取得 | 番号解決済み | Issue 現在本文・状態 | 更新前後の内容比較の前提が取得できていること |
| STEP-3 更新内容に応じて分岐 | 状態取得済み | 更新された Issue本文 / 追加コメント / 更新REQファイル / レビューNGコメント | `--body` 時は Issue 作成時と同じテンプレート構造、【必須】セクション完備であること。`--review-ng` 時は QG 乖離検出結果の引用を含むこと |
| STEP-4 完了報告 | 更新済み | 完了報告（更新種別に応じたテンプレート選択） | `templates/case-update/` 配下のテンプレート準拠であること |

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-update` が所有する。
同 Workflow Skill は `/agentdev/case-update` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 現在のフェーズを維持する（フェーズの変更は行わない）
- 責務は REQ 更新、レビューNG時のコメント追加、Issue本文更新に限定する（CI/CD 修正・自律修正ループは case-run の責務）
- Issue番号の解決はユーザー入力またはセッション内会話から行う（open issue 一覧取得による解決は行わない）
- SSoT の整合性を維持する（Issue本文と要件docの不整合を防ぐ）。`--review-ng` 時は QG-3（`agentdev-quality-gates`）の乖離検出結果を引用する
- `--body` 更新時は Issue 作成時と同じテンプレート構造を維持し、【必須】セクションを完備させる。コメント/レビューNGコメントはテンプレートの【必須】セクションを確認してから投稿する
- gh CLI 出力の読み取りは `agentdev-gh-cli` の安全な読み取り手順に従う。work_type 分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G08: GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲する（gh コマンド直接記述は禁止）
