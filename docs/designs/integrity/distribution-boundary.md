---
title: "配布依存境界"
status: accepted
created: "2026-08-11"
updated: "2026-08-20"
---
<!-- ADF-COVERS(implementation): REQ-002-027 -->
<!-- ADF-COVERS(implementation): REQ-009-045 -->
<!-- ADF-COVERS(implementation): REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-004, REQ-029-005, REQ-029-006, REQ-029-007, REQ-029-008 -->

# 配布依存境界 Design

> **正規所有宣言**: 本 Design は REQ-029 が宣言する意味境界を検証するための意味モデル、分類、検出パイプライン、projection 契約、gate 契約に加え、ユーザーが確定した安定実装契約を一括して正規所有する。
> 関数署名と実装コードは実装詳細として本 Design に含めない。

## 目的

配布依存境界の検証モデルを確立し、producer 内部依存と consumer 解決可能依存の区別、配布テキスト成果物の対象定義、決定的判定と未分類扱い、generic と template 許容、ベースラインと個別承認例外の区別、誤検出抑制、検査エラー意味、各 projection の検査契約、事前書き込み gate と最終 gate の契約、archive 公開前検査、安定実装契約を正規所有する（REQ-029、REQ-010-060、DEC-014）。

## producer と distribution の意味モデル

producer は配布成果物を生成・管理する AgentDevFlow 本体を指す。
distribution は consumer 環境へ配布されるテキスト成果物の集合を指す。
配布成果物は consumer 環境で自己完結して実行されるため、producer 内部の構成体、内部文書、harness 実行制御の詳細に依存して成立してはならない（REQ-029-001）。

依存分類値は次の通り。

- consumer-resolvable（許容）: consumer 環境で runtime 解決可能な参照。
- generic-or-template（許容）: producer 内部へ解決しない汎用参照または template 参照（REQ-029-004）。
- producer-internal（不許容）: consumer 環境に不在の producer 内部成果物への具体参照。
- unclassified（gate-not-passed）: 検査時点で分類不能。検査エラーと同等に gate-not-passed 扱いとする。

## 配布テキスト成果物の対象モデル

境界は Markdown 本文に限定しない（REQ-029-002）。
配布対象のテキスト成果物（command 定義、skill 定義、template、script ソース、附属するテキスト形式の設定や README）すべてへ適用する。
テキストと判定可能な成果物とバイナリと判定される成果物を決定的に区別し、判定不能なエントリは unclassified として gate-not-passed 扱いとする。

## 候補抽出から決定までのパイプライン

検出パイプラインは次の 4 段階で構成する。
各段階で副作用を発生させない。

1. 候補抽出: 配布テキスト成果物から依存候補を抽出する。
2. 解決: 候補を consumer 環境の仮定で解決試行する。
3. 分類: 解決結果に基づき consumer-resolvable、generic-or-template、producer-internal、unclassified のいずれかへ分類する。
4. 決定: 分類結果に基づき gate 合格または gate-not-passed を決定する。

## generic と template 許容

REQ-029-004 が許容する generic および template 参照は、producer 内部へ解決しないことを条件に許容する。
ルールレベルで許容集合を定義し、個別承認例外（individual accepted exception）とは区別する。

## ベースラインと個別承認例外の区別

ベースライン（baseline）は既知の検出事項集合を管理する運用機構であり、ルールレベルの許容（generic と template）とは別物である。
個別承認例外は特定の検出事項に対して個別に付与された承認であり、ルール一般を書き換えない。
誤検出抑制（false-positive suppression）は検出器の挙動であり、承認例外とは区別する。

## 共有 detector と adapter の契約

共有 detector は副作用なし（side-effect-free）とし、複数経路から同一入力に対し同一判定を返す（DEC-014）。
adapter は detector の判定を書き込み前に反映する fail-fast な経路である。
両者の契約は本 Design が正規所有し、実装詳細は Epic が所有する。

## 検査エラーの意味

検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗などの検査エラーはすべて gate-not-passed として扱う。
clean として通過させない（DEC-014 決定5）。

## projection の分離

次の 4 projection を分離して検査する。

- source projection: src/opencode/ など原本領域。
- link projection: 通常の consumer リンクインストールで展開される配置先。
- archive projection: release として具体化された配布アーカイブ。
- archive-installed projection: archive を展開し install した状態。

いずれかの projection で違反が残存する場合、全体を通過扱いにしない。

## 事前書き込み gate と最終 gate の契約

事前書き込み gate は執筆・編集経路で動作する fail-fast adapter であり、書き込み前に検出結果を反映する。
最終 gate は REQ-010-060 が宣言する ADF 所有の保存・完了・release 経路での最終保証である。
adapter を利用者または編集経路がバイパスしても、最終 gate で停止する。
事前 gate を通過しても最終 gate を省略しない。

## archive 公開前検査

archive は公開前に検査する。
違反が残存する場合は最終 archive と成功経路を残さない（DEC-014 決定7、REQ-009-045）。

## 安定実装契約

ユーザーが本 Design 候補へ配置を確定した安定実装契約。
Epic 実装はこれに従う。
関数署名、実装コード、内部データ表現は実装詳細として本節に含めない。

- 共有 module: 副作用なし（side-effect-free）の canonical detector module は repo-agentdev-integrity 配下が所有する。想定モジュールパスは `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`。既存の checker はこの共有 module への adapter となる。
- repo-local plugin: plugin パスは `.opencode/plugins/distribution-boundary-guard.ts`。
- 事前書き込み gate: OpenCode の `tool.execute.before` フック（サポート対象は `edit`、`write`、`apply_patch`）で構成する。adapter は prospective content を評価し、違反または検査エラー時に書き込みを block する。
- archive 公開前検査の呼び出し点: `scripts/package-release-archive.ps1` が最終公開前に一時 archive を検証する。
- archive-installed 検証の配置: 一時的な consumer/archive-install パスを用いて archive-installed projection を検証する。`check-consumer-opencode.ps1` へ新たな責務を追加しない。
- trusted-distribution-gate CLI（`trusted-distribution-gate/cli.ts`）の引数構文解析は `node:util.parseArgs` へ移行する。オプション間依存（`--profile release` 時の `--archive` 必須等）の意味検証は ADF 側に残留し、CLI の終了コード・stdout・stderr 契約は変更しない。移行契約の詳細は checker 共通実行契約 Design「再帰ファイル探索と CLI 引数解析の標準API移行」が定める。

## 関連 Design と実装詳細の帰属

- 検出シグナル、正規表現、exemption 条件、severity、gate 実行経路の詳細: IR-059 と integrity-rule-catalog.md、rule-ownership.md、req-impact-map.md の同期更新で整理する。
- 各 projection の技術詳細（link 構成、install 手順、archive レイアウト）: runtime-package-boundary.md、integrity-contracts.md の各 UPDATE で反映する。
- 関数署名、実装コード、内部データ表現: Epic 実装詳細。本 Design は安定実装契約（モジュールパス、plugin パス、フック種別、archive 検査呼び出し点）のみを正規所有する。
