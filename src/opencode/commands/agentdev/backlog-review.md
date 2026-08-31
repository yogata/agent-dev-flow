---
description: 採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する
---

# Backlog レビュー

`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、分析、統合してユーザーに判定を提示し、承認後に直接 RU を生成する。

**このコマンドはユーザー承認後に RU を生成する。ユーザー承認は RU 作成承認を兼ねる。**

## 入力

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの採用済み成果物）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの採用済み成果物）
- `.agentdev/inspect/promoted/*.md`（inspect パイプラインからの採用済み成果物）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除
- learning 由来分類結果の昇華先ルーティング結果（昇華、Issue 修正、削除、保留を完了報告に処置別に記録）

## RU フォーマット

RU-*.md の構造（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）は `agentdev-backlog-integration` を正とする。
`tentative_classification` は document-model Design（extension 経由）の文書7分類モデル（REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外）のいずれかを記録する（REQ）。

## session由来RU 生成形式（参照）

`source_type: chat` かつ `generated_by: session` のRU（session由来RU）の生成形式は、一時成果物ライフサイクル要件と artifact-contracts Design「RU アーティファクト契約（session由来RU）」セクションを正規原本とする。本コマンドは frontmatter 必須フィールド、二段階承認、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番、`tentative_classification` の各要件を同 Design へ委譲し、再定義しない

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-backlog-review` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- RU は分析・統合の結果として生成し、採用済み成果物の単純コピー（パススルー）とは区別する
- depends_on には RU-ID のみを指定する（採用済み成果物パスは使用しない）
- 矛盾検出時はユーザーの指示を待って解決する（自動解決は行わない）

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- REQ ファイルの保存は行わない（`req-save` が担当）
- GitHub Issue の作成は行わない（`case-open` が担当）
- `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/deferred.md` は更新しない
- ADF リポジトリ外の project-local 資産（project-local Capability Skill の判断知識、Project Extension の接続定義）を直接書き換えない（書き込み先の実行前提を明示した指示の出力で代替する）
- RU 生成に失敗した成果物は削除しない
- 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する（REQ）（`POL-destructive-change-explicit-approval`）



