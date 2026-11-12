---
description: docs全体の意味整合性を検出し、検出事項を .agentdev/inspect/inbox/ へ出力する
---

# inspect-docs

docs全体（REQ/Decision/Design/guides）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力するコマンドである。
検査対象を直接修正しない診断を行い、REQ 構造診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて Design、Decision、guides、README の意味診断を含む。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断のみを実行する。
許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示（検出事項、根拠、source-of-truth 判定、推奨経路）
- `.agentdev/inspect/inbox/` への検出事項出力
- 副作用は検出事項ファイルの生成のみ（Issue/PR作成、worktree作成、intake/learning/RU処理は後述のガードレール対象外）

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/` への検出事項ファイル）
  - 検出事項リスト（観点、対象、根拠、source-of-truth 判定、推奨経路）

## inspect-* コマンド選択 routing

変更ファイル種別に基づく inspect-* コマンドの選択表と振り分け規律（本コマンドと inspect-skills の配布物検出対象の重複の扱いを含む）は、`agentdev-workflow-lifecycle` スキル「共通報告・Decision・自律確定規約」節「inspect-* コマンド選択 routing」を正本として参照する。

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-docs` スキルへ委譲する（責務3層分化と1:N分割原則、検出コマンド実行契約要件）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
エラー処理（スキャン対象ディレクトリ不存在時は該当カテゴリを空扱い警告、ファイル読込失敗時はスキップ警告）も同スキルが所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）は source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）に従って矛盾を判定する

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- GitHub Issue/PR を作成、更新しない
- worktree/ブランチを作成しない
- intake/learning/RU の処理を行わない


