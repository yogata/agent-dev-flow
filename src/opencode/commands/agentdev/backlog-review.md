---
description: 採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する。docs/knowledge/ 知識文書保存等の backlog 自体の処置を確定する
---

# Backlog レビュー

`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、source type に依存しない共通モデルで分析、統合してユーザーに判定を提示し、承認後に RU を生成する。
本コマンドが確定するのは、RU 化、docs/knowledge/ への知識文書保存、重複・陳腐化した知識の削除、保留等の backlog 自体の処置である。REQ / Decision / Design 反映、ガードレール移管、Project Extension 接続、通常の Issue による修正等の具体的実現先へのルーティングは learning 由来を含めて行わず、システム変更を必要とするものは RU として後続の `/agentdev/req-define` へ渡す。

**このコマンドはユーザー承認後に RU を生成する。ユーザー承認は RU 作成承認を兼ねる。**

## 入力

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの採用済み成果物）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの採用済み成果物）
- `.agentdev/inspect/promoted/*.md`（inspect パイプラインからの採用済み成果物）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- `docs/knowledge/` 配下の知識文書（利用者承認後に直接保存する正規昇華経路。書き込みは git 永続化対象の副作用。REQ-{NNNN}、REQ-{NNNN}-{NNN}）
- 成功した採用済み成果物の削除（RU 生成成功分、docs/knowledge/ 知識文書保存成功分を含む）
- backlog 自体の処置の報告（docs/knowledge/ 知識文書保存、重複・陳腐化した知識の削除、保留を完了報告に処置別に記録）

## RU フォーマット

RU-*.md の構造（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）は `agentdev-backlog-integration` を正とする。
`tentative_classification` は document-model Design（extension 経由）の文書7分類モデル（REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外）のいずれかを記録する（REQ）。

## session由来RU 生成形式（参照）

`source_type: chat` かつ `generated_by: session` のRU（session由来RU）の生成形式は、一時成果物ライフサイクル要件と artifact-contracts Design「RU アーティファクト契約（session由来RU）」セクションを正規原本とする。本コマンドは frontmatter 必須フィールド、二段階承認、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番、`tentative_classification` の各要件を同 Design へ委譲し、再定義しない

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-backlog-review` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- RU は分析・統合の結果として生成し、採用済み成果物の単純コピー（パススルー）とは区別する
- depends_on には RU-ID のみを指定する（採用済み成果物パスは使用しない）
- 矛盾検出時はユーザーの指示を待って解決する（自動解決は行わない）

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- REQ ファイルの保存は行わない（`req-save` が担当）
- GitHub Issue の作成は行わない（`case-open` が担当）
- docs/knowledge/ への知識文書の新規、更新、置換、削除は利用者承認なしに行わない（REQ-{NNNN}-{NNN}）
- `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/deferred.md` は更新しない
- ADF リポジトリ外の project-local 資産（Project Extension の接続定義）を直接書き換えない（書き込み先の実行前提を明示した指示の出力で代替する）
- RU 生成に失敗した成果物は削除しない
- 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する（REQ）（`POL-destructive-change-explicit-approval`）



