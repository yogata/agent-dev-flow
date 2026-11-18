---
title: 所有関係と委譲・作業用 worktree 作成元と PR base・検証義務と検証手段の分離・v3 epic-wave-model 吸収
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# 所有関係と委譲・作業用 worktree 作成元と PR base・検証義務と検証手段の分離・v3 epic-wave-model 吸収

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、case-auto の orchestration による Workflow Skill load 時に本 Design が読み込まれる（DEC-010。第4段以降は command 定義の実行時投影ではなく直接読込）。
- workflow 実装本体は Workflow Skill（`agentdev-workflow-case-run`）が所有し、本 Design は内部手順、STEP 構成、reference 構成を複製しない。
- case-run の Workflow Skill は、単一 Issue 実行（single workflow）のみを所有する（REQ-031-015、DEC-041）。かつて single workflow と epic-wave workflow の2 workflow 構成に分離されていた構造は、Epic Wave 実行モード（case-run #epic）の実行契約廃止により single workflow へ収斂した。旧 epic-wave workflow が所有していた実行契約差異6軸（target cardinality、parallelism、fan-out・fan-in、child task recovery、partial result、Wave-level completion）の実行契約は case-auto orchestration stage 3 へ移転済みであり、Workflow Skill は保持しない（`<workflows/workflow-skill-model>` Design「1:N 分割基準の適用実例（case-run）」参照）。
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

## v3 epic-wave-model Design からの吸収

v3 epic-wave-model Design が所有していた case-run Epic Wave 実行モデル、Epic 検出ルール、Wave 解析プロトコルのうち case-run 実行側の運用契約は本 Design の規定へ吸収された。Epic Wave 実行モード（case-run #epic）の実行契約は廃止され、Wave 実行制御は case-auto の orchestration stage 3 が単一所有する（REQ-031-015、DEC-041）。REQ-035-012（同一 Wave 内の子 Issue 間の変更対象ファイル重複の前置検出を Wave 構成時の情報収集として維持し、検出結果を実行・統合時の競合リスク情報として用いる。コンフリクト解消モデルと execution_unit 間並列可否の判定軸の維持、mergeable 作成時状態のみで Wave の安全性を判断しないこと）の implementation 側の正規所有者は本 Design である（sidecar `traceability/agentdev-workflow-case-run.yaml`）。構成判断側の重複前置検出契約は case-ready Design「v3 epic-wave-model Design からの吸収」節が所有する。旧 Design は削除済みであり、対応関係の記録は Git 履歴で担保する（REQ-103-020）。

- Epic 検出ルール: Epic 入力の受理は case-auto 経由の正規呼出へ限定され、case-run 自身は常に単一 Issue を処理する。Epic は複数 execution unit の協調管理が必要な変更であり、規模（scale）から独立した概念である
- Wave 解析プロトコル: Wave 構成の読み取りと現在 Wave の子 Issue 状態判定（pending/completed/blocked/failed/delegation-unavailable から実行可能な Wave を判定）は case-auto の orchestration stage 3 が所有する。Wave 状態は永続化せず子 Issue 状態から導出する（REQ-035-005、lifecycle-state-machine 階層合成）。case-run は委譲された単一 Issue の重複解消方針の参照と検出不能報告の責務を維持する（REQ-031-027）
