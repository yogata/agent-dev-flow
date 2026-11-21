---
title: 所有関係と委譲・作業用 worktree 作成元と PR base・検証義務と検証手段の分離・単一 Issue の競合情報利用
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# 所有関係と委譲・作業用 worktree 作成元と PR base・検証義務と検証手段の分離・単一 Issue の競合情報利用

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、case-auto の orchestration による Workflow Skill load 時に本 Design が読み込まれる（DEC-010。第4段以降は command 定義の実行時投影ではなく直接読込）。
- workflow 実装本体は Workflow Skill（`agentdev-workflow-case-run`）が所有し、本 Design は内部手順、STEP 構成、reference 構成を複製しない。
- case-run の Workflow Skill は、単一 Issue 実行（single workflow）のみを所有する（REQ-031-015、DEC-041）。Wave 実行制御（Wave 構成の読み取り、fan-out・fan-in、子 Issue 並列起動）は [case-auto orchestration stage 3](../../case-auto/references/parallel-orchestration.md) が単一所有する。Wave 状態は永続化せず、[lifecycle-state-machine の階層合成](../../../workflows/lifecycle-state-machine.md) に従い子 Issue の状態から導出する（REQ-035-005）。Epic と scale の区別は [standard-lifecycle](../../../workflows/standard-lifecycle.md) を参照する。
- Workflow Skill の単独起動防止（soft guard）は、case-auto orchestration の委譲制御と Workflow Skill description の DO NOT USE FOR トリガーにより実効する。case-auto が case-run をインライン実行する場合も同一の Workflow Skill を正規情報源として読み込む。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 作業用 worktree 作成元と PR base（REQ-031-024 の実行詳細）

作業用 worktree の作成元と PR の base は main を参照する（REQ-031-024）。

## 検証義務と検証手段の分離と検証基準の実装由来生成禁止（REQ-017-022、RU-20261004-08）

実行担当サブエージェント委譲と証拠生成における受け入れ義務保存の実行時投影。

- 委譲 prompt は、完了条件ごとの検証義務（何を証明する必要があるか、どの範囲で成立する必要があるか、いかなる反例が存在すれば不合格か）を、具体的な検証手段（テスト、検索、実行等）と分離して実行担当へ渡す。テストまたは checker の成功だけでは、当該検査が検証義務を十分に観測していることを立証しない限り達成証拠としない。
- 実行担当が検査対象、期待結果、除外条件を実装結果だけから生成することを委譲契約上禁止する。一意に導出可能な対象集合等は決定的処理で導出し、意味判断が必要な部分は既存 ADF 判断アーキテクチャ（決定的処理、閉じた意味評価、開いた推論）に従う。「実装と同時に作成したテストが実装と同じ範囲を検査対象から漏らし green となる」シナリオを回帰試験で拒否する。
- 合意済み条件が要求する観測能力を、実装担当、委譲プロンプト生成側、Verifier のいずれも自律的に弱化しない。検証手段を変更する場合は元の検証義務に対して同等以上の観測能力と未証明範囲の不増を確認する。runtime・実ホスト・実経路での成立を要求する条件を、同等性未確認の静的構造検査、単体テスト、スタブ結果のみで達成扱いしない。
- 実行担当は、現在の完了条件を否定する反例を検出した場合に申告する。反例を intake、learning、後続 Issue、Findings 等へ分類しただけでは元条件の達成扱いとならないことを委譲契約へ明示する。

## 単一 Issue の競合情報利用

case-run は委譲された単一 Issue の重複解消方針（変更対象分割、重複許容時の担当とマージ順序）を参照し、検出不能を報告する（REQ-031-027）。構成時の変更対象重複の前置検出と競合リスク情報の引き継ぎは [case-ready](../../case-ready.md)、実行時の重複検出と並列可否判定は [case-auto の並列 orchestration](../../case-auto/references/parallel-orchestration.md) を参照する（REQ-035-012）。
