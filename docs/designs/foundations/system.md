---
title: システム仕様
status: accepted
created: 2026-08-20
updated: 2026-11-21
---
<!-- ADF-COVERS(implementation): REQ-001-033 -->
<!-- ADF-COVERS(implementation): REQ-002-009, REQ-002-010, REQ-002-012 -->
<!-- ADF-COVERS(implementation): REQ-034-007 -->
<!-- ADF-COVERS(design): REQ-032-029, REQ-009-052 -->

<!-- ADF-COVERS(implementation): REQ-123-003（REQ-123-003 のスリム化編集の実装実体。ハブ化と重複排除・移管済み必須仕様の削除。REQ-123.md 冒頭 inline ADF-COVERS(design) 宣言と REQ-116 型 covers 宣言構成） -->
# システム仕様

本 Design は AgentDevFlow のシステム全体像を、コマンドカタログ、主要コンポーネント境界、不変条件サマリー、基礎設計書へのナビゲーションとして提供するハブである。
個別の詳細仕様は各専門 Design が正規所有し、本 Design は重複記述しない。

## システム全体像

AgentDevFlow は requirements-driven lifecycle に従う開発ワークフロープラグインである。
目的・適用範囲・標準語彙・プロセス/実装分離原則、三層責務モデル（ADF Runtime / ADF Standard Operating Model / Project Model）、Project Contract の論理ビュー、情報寿命モデル、中核文書モデルは [operating-model.md](operating-model.md) が正規所有する。

実行経路は次のとおりである。

- **要求入口**: 手動入口 `/agentdev/req-define`（要件の壁打ち対話と構造化 draft-data の生成。実装コード生成は行わない）、要求蓄積入口 `/agentdev/backlog-auto`（inspect-docs → 昇格3系統〔learning-promote / intake-promote / inspect-promote〕→ backlog-review で RU 生成まで一巡。生成された RU は req-define → case-auto へ接続される）
- **標準実行**: `/agentdev/case-auto` が内部 lifecycle（case-open → case-ready → case-run → case-close、例外経路 case-revise → case-ready）を自走しマージまで完了する
- **工程駆動実行**: テーマ初回形成・テーマ更新、正規成果物への反映、独立レビュー、利用者判断による工程遷移からなる変更駆動経路と併存する別経路（[phase-driven-collaboration-model.md](../workflows/phase-driven-collaboration-model.md)、[phase-transition-and-coexistence-model.md](../workflows/phase-transition-and-coexistence-model.md)）

ライフサイクルの語彙（work_type / scale / Epic / Wave の直交性、標準ライフサイクル、継続コラボレーションループ）は [standard-lifecycle.md](../workflows/standard-lifecycle.md) と [collaboration-loop.md](../workflows/collaboration-loop.md) が定義する。
durable state enum と runtime 実行状態の二層モデル、階層合成は [lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md) が定義する。

## 主要コンポーネント境界

case 系内部 lifecycle は、case-auto orchestration が駆動する5段階と例外経路で構成される。

| 段階 | 責務 | 正規 Design |
|---|---|---|
| case-open | 要件doc（draft-data）から Root Case Issue と Definition Package を確立（execution contract、Epic 構成判定を含む） | [commands/case-open.md](../commands/case-open.md) |
| case-ready | 設計PR 受入、Decision 受理、execution contract と実行構造（Standard/Epic 構成）の確定、ready 遷移 | [commands/case-ready.md](../commands/case-ready.md) |
| case-run | 単一 Issue 実行の収斂（実行担当サブエージェントへの委譲1件、result 4状態処理、前置/最終 gate） | [commands/case-run.md](../commands/case-run.md) |
| case-close | PR merge と完了判定（QG-4）、docs 検証、Design 確定、Capture 回収、Epic Wave クローズ | [commands/case-close.md](../commands/case-close.md) |
| case-revise（例外経路） | 再合意済み Definition 変更の受入確認と設計修正PR、case-ready への引き継ぎ | [commands/case-revise.md](../commands/case-revise.md) |

backlog 系は stage 構成（stage 1 inspect-docs / stage 2 昇格3系統 / stage 3 backlog-review）を [skills/agentdev-workflow-backlog-auto.md](../skills/agentdev-workflow-backlog-auto.md) が、昇格3系統の各 workflow 本体を intake-promote・learning-promote・inspect-promote の各 Design（[commands/](../commands/) 配下）が正規所有する。

## コマンドカタログ

AgentDevFlow（`/agentdev/*` コマンド体系）は req/case、intake、learning、backlog、inspect、課題管理、third-party、phase の各パイプラインで構成され、開発ワークフローを提供する。
コマンドの構成、系統、主入力、主出力を次のカタログ表に統合する。各コマンドの目的と責務は専用 Design および Workflow Architecture Inventory に記述する。
実行エージェントの選定、起動方法は harness の責務であり、本 Design の対象外（v2:ADR-0136）。

| コマンド/スキル | 系統 | 主入力 | 主出力 | 詳細 |
|---|---|---|---|---|
| `/agentdev/req-define` | req/case | セッション会話 / RU | 要件doc（draft） | [commands/req-define.md](../commands/req-define.md) |
| case-open（内部 lifecycle 段階） | case-auto 駆動 | 要件doc | GitHub Issue（連結成分ベースの Standard/Epic 構成生成を含む） | [commands/case-open.md](../commands/case-open.md) |
| case-ready（内部 lifecycle 段階） | case-auto 駆動 | Root Case Issue | ready 状態の Root Case + 実行構造（REQ/Decision/Design ファイル保存を含む） | [commands/case-ready.md](../commands/case-ready.md) |
| case-revise（内部 lifecycle 例外経路段階） | case-auto 例外経路解決駆動 | 再合意済み Definition 差分（draft） | 設計修正PR + case-ready 引き継ぎ | [commands/case-revise.md](../commands/case-revise.md) |
| case-run（内部 lifecycle 段階） | case-auto インライン実行 | Issue | 実装済みブランチ + PR | [commands/case-run.md](../commands/case-run.md) |
| case-close（内部 lifecycle 段階） | case-auto 駆動 | Issue + PR | マージ済み + クローズ済み（QG-4 完了ゲート付き） | [commands/case-close.md](../commands/case-close.md) |
| `/agentdev/case-auto` | req/case（標準実行コマンド） | 要件doc / Issue番号 | マージ済み + クローズ済み（blocked 部分停止あり） | [commands/case-auto.md](../commands/case-auto.md) |
| intake-promote（内部 workflow） | backlog-auto stage 2 駆動 | inbox item | `promoted/` 成果物 | [commands/intake-promote.md](../commands/intake-promote.md) |
| `agentdev-learning-capture`（スキル） | learning（キャプチャ層） | エージェント主体での学び検知 | `.agentdev/learning/inbox/` | [skills/agentdev-learning-capture.md](../skills/agentdev-learning-capture.md) |
| learning-promote（内部 workflow） | backlog-auto stage 2 駆動 | `inbox/` + `deferred/` | `promoted/` 成果物 | [commands/learning-promote.md](../commands/learning-promote.md) |
| backlog-review（内部 workflow） | backlog-auto stage 3 駆動 | `promoted/` 成果物 | `RU-*.md` | [commands/backlog-review.md](../commands/backlog-review.md) |
| `/agentdev/backlog-auto` | backlog | なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md` | [commands/backlog-auto.md](../commands/backlog-auto.md) |
| inspect-docs（内部 workflow） | backlog-auto stage 1 駆動 | docs 全体スキャン | 検出事項 | [commands/inspect-docs.md](../commands/inspect-docs.md) |
| inspect-promote（内部 workflow） | backlog-auto stage 2 駆動 | 検出事項 | 採用済み成果物 | [commands/inspect-promote.md](../commands/inspect-promote.md) |
| `/agentdev/phase-tasks-create` | phase（工程駆動） | 自然言語による形成指示（工程目的、対象範囲、既知制約） | テーマ初回形成の結果（テーマ識別と一覧、参考候補と既知の必須事項の区別） | [workflows/phase-driven-collaboration-model.md](../workflows/phase-driven-collaboration-model.md) |
| `/agentdev/phase-tasks-update` | phase（工程駆動） | 自然言語による更新指示（追加・具体化・分割・統合・廃止） | テーマ更新の結果（変更理由、旧新対応、未決事項の引継ぎ） | [workflows/phase-driven-collaboration-model.md](../workflows/phase-driven-collaboration-model.md) |
| `/agentdev/phase-artifacts-update` | phase（工程駆動） | 自然言語による反映指示と採用内容（外部検討の戻り入力または利用者が直接採用した内容） | 反映の結果（反映・作成した項目と反映先、衝突・未確認・保存失敗の区別、記録の保存先〔外部戻り入力存在時は受領記録、直接採用時は採否記録〕） | [workflows/phase-driven-collaboration-model.md](../workflows/phase-driven-collaboration-model.md) |
| `/agentdev/phase-review` | phase（工程駆動） | 自然言語によるレビュー・全体像の指示 | 4区分（確定違反・証拠不足・推測・未採用改善候補）に分けた所見と工程全体像（セッション内出力） | [workflows/phase-transition-and-coexistence-model.md](../workflows/phase-transition-and-coexistence-model.md) |
| `/agentdev/phase-transition` | phase（工程駆動） | 自然言語による遷移の指示 | 遷移の記録結果（記録先、後続工程の解決結果、前工程の過去工程化の伝達） | [workflows/phase-transition-and-coexistence-model.md](../workflows/phase-transition-and-coexistence-model.md) |

`/repo/docs-check` は AgentDevFlow 本体リポジトリの自己監査コマンドである（REQ-001、REQ-010-001）。`/repo/*` コマンド体系の配布対象リポジトリ内コマンドであり、AgentDevFlow の配布コマンドではないため、カタログ表の対象外とする。

### 品質ゲート

品質ゲート（QG-1〜QG-4）は [quality-gate-model.md](../quality/quality-gate-model.md) で定義する。Gate は lifecycle 遷移点から再導出され、判定値と遷移接続は同 Design の定めるところに従う。
case-run（内部 lifecycle 段階）が QG-1〜QG-3（ローカル検証、CI 検証、乖離検出）、case-close（内部 lifecycle 段階）が QG-4（最終完了判定ゲート）を担う。
詳細は同 Design および [skills/agentdev-quality-gates.md](../skills/agentdev-quality-gates.md) を参照。

## Workflow Architecture Inventory

各コマンドの分析カタログ（公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・Harness/Capability 依存・内部 workflow 構成の11分析軸）は、契約面を各 command Design、実装面を各 Workflow Skill Design が正規所有する。

- public contract（入出力契約、副作用、HITL 境界、停止状態）→ command Design が正規文書、command 定義はその実行時投影。両者不一致時は command Design を正とする
- workflow implementation（STEP、resume、並列性、durable state contract）→ Workflow Skill（`src/common/skills/agentdev-workflow-*/SKILL.md`。Design 登録は [../README.md](../README.md) の skill Design 一覧を参照）
- 決定的処理・意味判断・Harness adapter・Project Extensions の責務分類 → [responsibility-boundaries.md](responsibility-boundaries.md)

| コマンド / 内部 lifecycle 段階 | command Design |
|---|---|
| req-define | [commands/req-define.md](../commands/req-define.md) |
| case-open | [commands/case-open.md](../commands/case-open.md) |
| case-ready | [commands/case-ready.md](../commands/case-ready.md) |
| case-revise | [commands/case-revise.md](../commands/case-revise.md) |
| case-run | [commands/case-run.md](../commands/case-run.md) |
| case-close | [commands/case-close.md](../commands/case-close.md) |
| case-auto | [commands/case-auto.md](../commands/case-auto.md) |
| intake-promote | [commands/intake-promote.md](../commands/intake-promote.md) |
| learning-promote | [commands/learning-promote.md](../commands/learning-promote.md) |
| backlog-review | [commands/backlog-review.md](../commands/backlog-review.md) |
| backlog-auto | [commands/backlog-auto.md](../commands/backlog-auto.md) |
| inspect-docs | [commands/inspect-docs.md](../commands/inspect-docs.md) |
| inspect-promote | [commands/inspect-promote.md](../commands/inspect-promote.md) |

## 不変条件サマリー

システムの実行を貫く不変条件と、その正規所有者は次のとおりである。

| 不変条件 | 要旨 | 正規所有 Design |
|---|---|---|
| 中核5要素の維持 | requirements-driven lifecycle・要求の意味の保持・判断権限の分離・永続状態と実行安全・証拠連鎖。維持できない場合は停止し新規判断事項を提示する | [operating-model.md](operating-model.md)「Operating Model の中核と維持条件」 |
| 判断権限の分離 | 判断方法3分類（決定的処理・閉じた意味評価・開いた推論）と確定権限3分類（正規契約からの導出・委譲された裁量・人間に留保された判断）。人間判断への引き上げ条件は8要素で判定する | [responsibility-boundaries.md](responsibility-boundaries.md)「ADF判断アーキテクチャ詳細基準」 |
| authority 格子と実行安全 | 副作用4分類に対象×操作×寿命の格子で権限判定、5直列化単位の局所直列化、冪等経路、書き込み経路の fail-closed 適用範囲 | [runtime-execution-model.md](runtime-execution-model.md) |
| durable state の単一権威 | 5分類と配置表で各論理状態の権威を1つに限定、状態と証跡の分離、導出可能情報は保存しない、部分失敗は権威順調整と冪等再実行 | [durable-state-and-recovery.md](durable-state-and-recovery.md) |
| 参照優先順位 | 文書間に矛盾がある場合、現行 REQ > 承認済み Decision > Design > guides の順で解決する（REQ-001-020） | [document-model.md](document-model.md)「信頼できる情報源の優先順位」 |

## 基礎設計書へのナビゲーション

| 関心 | 正規 Design |
|---|---|
| 目的・三層責務・Project Contract・情報寿命・中核文書モデル | [operating-model.md](operating-model.md) |
| 実装責務境界（判断方法・確定権限・HITL・Harness adapter・Project Extensions） | [responsibility-boundaries.md](responsibility-boundaries.md) |
| runtime 実行（authority・直列化・冪等・fail-closed） | [runtime-execution-model.md](runtime-execution-model.md) |
| durable state と再構成・恢復 | [durable-state-and-recovery.md](durable-state-and-recovery.md) |
| 文書種別の基準境界・ライフサイクル・ディレクトリ配置規範・正本と投影 | [document-model.md](document-model.md) |
| 共通フォーマット規約（frontmatter・ID 体系・命名規則・URL 参照形式） | [patterns.md](patterns.md) |
| 品質モデル（Quality/Verification/Evidence/Gate） | [quality-gate-model.md](../quality/quality-gate-model.md) |
| 整合性契約・ルールカタログ・checker 実行契約 | [integrity-contracts.md](../integrity/integrity-contracts.md)、[integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)、[checker-execution-contracts.md](../integrity/checker-execution-contracts.md) |
| 配布依存境界（検証モデル・projection 分離・gate 契約・安定実装契約） | [distribution-boundary.md](../integrity/distribution-boundary.md) |
| 実行時パッケージ境界（物理構造・同梱許可/禁止パス規則・インストール境界契約） | [runtime-package-boundary.md](../local/runtime-package-boundary.md) |
| Traceability モデル | [traceability-model.md](traceability-model.md) |
| マルチホスト原本モデル・harness 分離・Project Extensions | [multi-host-canonical-model.md](multi-host-canonical-model.md)、[harness-separation-model.md](harness-separation-model.md)、[project-extensions.md](project-extensions.md) |

## 適用範囲宣言

`docs/designs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは Design ファイルに依存しない（REQ-001）。

## See Also

- [README.md](../README.md)（Design インデックス（3 層構造））
- [workflows/](../workflows/)（横断ワークフロー契約）
- [commands/](../commands/)（command Design）
- [skills/](../skills/)（skill Design）
