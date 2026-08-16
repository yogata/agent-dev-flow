---
description: 採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する
---

# Backlog レビュー

`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、分析、統合してユーザーに判定を提示し、承認後に直接 RU を生成する。

**このコマンドはユーザー承認後に RU を生成する。
ユーザー承認は RU 作成承認を兼ねる。
**

## 入力

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの採用済み成果物）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの採用済み成果物）
- `.agentdev/inspect/promoted/*.md`（inspect パイプラインからの採用済み成果物）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-backlog-review`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-review.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## RU フォーマット

RU-*.md の構造（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）は `agentdev-backlog-integration` を正とする。`tentative_classification` は document-model SPEC（extension 経由）の文書7分類モデル（REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外）のいずれかを記録する（REQ）。

## session由来RU 生成形式（参照）

`source_type: chat` かつ `generated_by: session` のRU（session由来RU）の生成形式は、一時成果物ライフサイクル要件と artifact-contracts SPEC「RU アーティファクト契約（session由来RU）」セクションを正規原本とする。本コマンドは frontmatter 必須フィールド、二段階承認、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番、`tentative_classification` の各要件を同 SPEC へ委譲し、再定義しない

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-backlog-review` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが8 STEP の control plane として制御構造を所有する。各 STEP は resume point を持ち、durable state（promoted/ 残存成果物、`.agentdev/backlog/req-units/` の RU-*.md 実ファイルと frontmatter）から再開点を再構成する（DEC-{N}）。

- **STEP-1** 実行前同期・成果物検出
- **STEP-2** 分析・暫定分類付与
- **STEP-3** 統合・分割判定・depends_on 依存解決
- **STEP-4** review（経路E）
- **STEP-5** HITL
- **STEP-6** 矛盾検出・追加判断
- **STEP-7** RU 生成・成功成果物削除
- **STEP-8** Git 永続化・完了報告

## ガードレール

- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: 採用済み成果物の単純コピー（パススルー）を生成しない
- G04: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/deferred.md` を更新しない
- G05: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G06: RU 生成に失敗した成果物は削除しない
- G07: depends_on に採用済み成果物パスを指定しない。RU-ID のみ許容
- G08: 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する（REQ）



