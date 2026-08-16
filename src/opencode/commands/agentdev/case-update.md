---
description: 既存Caseの本文更新、コメント追加、またはREQファイル更新を行う
---

# Case更新

既存Caseの本文更新、コメント追加、またはREQファイル更新を行う。
主にレビューNG時の対応に使用。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-update`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-update.yaml`、kind: workflow-extension）を読み込む（ADR）。

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

本コマンドは workflow 実装本体を `agentdev-workflow-case-update` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。同スキルが4 STEP の control plane として制御構造を所有する。

- **STEP-1** Issue番号解決
- **STEP-2** 現在のIssue状態取得
- **STEP-3** 更新内容に応じて分岐（`--body` / `--comment` / `--req` / `--review-ng`）
- **STEP-4** 完了報告（更新種別に応じた `templates/case-update/` 配下のテンプレートを選択）

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-update` が所有する。同 Workflow Skill は `/agentdev/case-update` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

### フェーズ制約
- G01: フェーズは変更なし（現在のフェーズを維持）
- G02: CI/CD修正、自律修正ループは case-update の管轄外とする（case-run の責務）。case-update はREQ更新、レビューNG時のコメント追加、Issue本文更新のみを責務とする

### 実行制約
- G03: Issue番号の解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等で open issue 一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能

### 品質ゲート
- G04: SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- G05: `--review-ng` 時は必ず QG-{N}（`agentdev-quality-gates`）の乖離検出結果を引用すること
- G06: `--body` 更新時はIssue作成時と同じテンプレート構造を維持すること。【必須】セクションが欠落しないよう確認すること
- G07: コメント/レビューNGコメントのテンプレート【必須】セクションが全て含まれていることを確認してから投稿すること

### 委譲、参照制約
- G08: GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲（gh コマンド直接記述禁止、REQ）
- G09: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G10: work_type分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G11: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
