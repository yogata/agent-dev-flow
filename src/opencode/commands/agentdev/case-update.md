---
description: 既存Caseの本文更新、コメント追加、またはREQファイル更新を行う
---

# Case更新

既存Caseの本文更新、コメント追加、またはREQファイル更新を行う。
主にレビューNG時の対応に使用。

## 入力

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body`/ `--comment`/ `--req`/ `--review-ng`）

## 出力

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル または レビューNGコメント

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-update` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 現在のフェーズを維持する（フェーズの変更は行わない）
- 責務は REQ 更新、レビューNG時のコメント追加、Issue本文更新に限定する（CI/CD 修正・自律修正ループは case-run の責務）
- Issue番号の解決はユーザー入力またはセッション内会話から行う（open issue 一覧取得による解決は行わない）
- SSoT の整合性を維持する（Issue本文と要件docの不整合を防ぐ）。`--review-ng` 時は QG-3（`agentdev-quality-gates`）の乖離検出結果を引用する
- `--body` 更新時は Issue 作成時と同じテンプレート構造を維持し、【必須】セクションを完備させる。コメント/レビューNGコメントはテンプレートの【必須】セクションを確認してから投稿する。完了報告は更新種別に応じ `templates/case-update/` 配下のテンプレートに従う
- gh CLI 出力の読み取りは `agentdev-gh-cli` の安全な読み取り手順に従う。work_type 分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲する（gh コマンド直接記述は禁止）（`POL-gh-io-delegation`）
