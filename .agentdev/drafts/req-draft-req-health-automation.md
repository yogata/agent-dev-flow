---
id: REQ-0136
title: "REQ/SPEC/ADR 適正運用の自動化（3層ゲート + 新ワークフロー）"
created: "2026-06-18"
updated: "2026-06-18"
---

## 目的

AgentDevFlow リポジトリの REQ/SPEC/ADR を継続的に適正運用する仕組みを、3層（事前予防・実行時検証・事後監視）すべてで自動化する。あわせてワークフローを req-define → req-save → spec-save（新設）→ case-* に修正し、REQ/SPEC 責務分離を徹底する。詳細はワークプラン `.sisyphus/plans/req-health-automation.md` を参照。

## 要件

| ID | 要件 | 対応RU |
|---|---|---|
| REQ-0136-001 | check_integrity.ts は `--gate` / `--paths` / `--reqs` 引数を持ち、3層ゲート切り替えと対象ファイル絞り込みを支援すること。既存の引数なし呼び出しは後方互換性を維持すること | RU-1 |
| REQ-0136-002 | integrity-rule-catalog.md と req-impact-map.md をパースし、TypeScript から機械利用可能なデータ構造に変換するパーサが提供されること | RU-1 |
| REQ-0136-003 | REQ 健全性メトリクス（要件行数・関心対象数・artifact種別数）の定量閾値を SPEC として定義すること | RU-1 |
| REQ-0136-004 | `.githooks/pre-commit` が変更ファイル種別に応じた Delta Guard を自動起動し、strict 違反時は commit を block すること | RU-2 |
| REQ-0136-005 | `.githooks/pre-push` が変更された REQ/ADR の影響範囲（直接・間接関連REQ + 直接関連SPEC）を含む Impact Guard を自動起動し、strict 違反時は push を block すること | RU-2 |
| REQ-0136-006 | check_integrity.ts が IR-044（REQ/SPEC 境界違反検出）を実装し、9つの SPEC分離基準違反シグナルを検出すること。安定契約例外（REQ-0101-069）は検出対象外とすること | RU-2 |
| REQ-0136-007 | Full Audit が月1回の定期実行 + トリガーイベント（integrity-rule-catalog 変更時・ADR 追加時・REQ retire 時）で自動実行されること | RU-2 |
| REQ-0136-008 | git hooks の setup スクリプト（Windows/Unix 両対応）が提供され、チーム成员が容易に hook を有効化・無効化できること | RU-2 |
| REQ-0136-009 | doc_requirement.md テンプレートに SPEC候補セクション（補助セクション）が追加され、REQ 必須セクション（目的/要件/適用範囲）は維持されること | RU-3 |
| REQ-0136-010 | req-define が Step 4-2/4-3 の判定結果をもとに SPEC 候補をドラフト内の SPEC候補セクションに自動分離し、各候補に想定配置先 SPEC をメタデータとして記録すること | RU-3 |
| REQ-0136-011 | req-define が既存REQ の肥大化シグナル（要件行数・関心対象数・artifact種別数）を計測し、SPLIT 予兆を早期検知してユーザーに提案すること | RU-3 |
| REQ-0136-012 | `/agentdev/spec-save` コマンドが新設され、req-define で分離された SPEC 候補を SPEC ファイルに保存・確定すること。SPEC status（draft / accepted）を管理すること | RU-4 |
| REQ-0136-013 | operation_units の operation type に `spec-create` / `spec-update` が追加され、`target_spec` フィールドにより SPEC 操作も OU として管理されること。既存 operation type（create/append/update）は維持すること | RU-4 |
| REQ-0136-014 | case-auto のワークフローが req-save → spec-save → case-open → case-run → case-close の順で実行すること。draft-meta の spec-candidates が空の場合は spec-save をスキップすること。旧形式 draft は後方互換性を維持すること | RU-4 |
| REQ-0136-015 | case-run で実装時に発見された SPEC 詳細が PR 本文の `## SPEC確定候補` セクションに記録され、case-close で SPEC 確定チェックが強化されること | RU-4 |
| REQ-0136-016 | inspect-promote が高確信度 finding（SPEC分離基準違反の high-specificity signal 等）を自動 promote し、HITL を経ずに intake/backlog パイプラインへ流入させること。自動 promote 実行ログを記録し、誤検知の revoke 手順を整備すること | RU-5 |
| REQ-0136-017 | 既存REQ の SPEC 混入が IR-044 導入後に洗い出され、ユーザー承認を得た上で SPEC ファイルへ移行されること | RU-5 |
| REQ-0136-018 | 今回の変更に伴い、関連ドキュメント（ガイド・SKILL.md・README・DOC-MAP）が更新されること | RU-6 |
| REQ-0136-019 | REQ-0108 の3層ゲート達成状況が Update Notes に記録されること | RU-6 |

## 適用範囲

- **対象**: AgentDevFlow 本体（リポジトリ全体）
  - `check_integrity.ts`, `cli_utils.ts`（RU-1, RU-2）
  - `.githooks/`, setup スクリプト（RU-2）
  - `req-define.md`, `req-save.md`, `case-auto.md`, `case-run.md`, `case-close.md`, `inspect-promote.md`（RU-3, RU-4, RU-5）
  - `spec-save.md`（RU-4 で新設）
  - `doc_requirement.md` テンプレート（RU-3）
  - 各種 SPEC（`req-health-metrics.md`, `patterns.md`, `workflow-contracts.md` 等）
  - 各種ガイド・SKILL.md・README・DOC-MAP（RU-6）
  - 新規 ADR-0123「SPEC lifecycle と spec-save の導入」
- **対象外**: AgentDevFlow を導入する consumer リポジトリ側の独自運用（consumer 側は `.githooks/setup` を参考にする）

## SPEC候補

- **新規 SPEC `docs/specs/req-health-metrics.md`**: REQ 健全性メトリクス（要件行数 > 50 → SPLIT +1 等）
- **既存 SPEC `docs/specs/patterns.md` 拡張**: REQ セクション構成に SPEC候補セクションを追加
- **既存 SPEC `docs/specs/workflow-contracts.md` 拡張**: case-auto ワークフローに spec-save 挿入を規定
- **既存 SPEC `docs/specs/integrity-rule-catalog.md` 拡張**: IR-044 実装に伴う検出パターンの具体化（必要に応じて）

## 関連情報

- **関連 REQ**: REQ-0101, REQ-0102, REQ-0103, REQ-0104, REQ-0108, REQ-0114, REQ-0126, REQ-0127, REQ-0130, REQ-0131
- **関連 ADR**: ADR-0103（文書種別責務境界）、**新規 ADR-0123**（SPEC lifecycle と spec-save の導入）
- **関連 SPEC**: integrity-rule-catalog.md, req-impact-map.md, integrity-contracts.md, document-model.md, patterns.md, workflow-contracts.md
- **ワークプラン**: `.sisyphus/plans/req-health-automation.md`

## Update Notes

| 日付 | 対象 | 変更内容 |
|------|------|----------|
| 2026-06-18 | REQ-0136 | 初版作成（req-define で生成。ワークプラン `.sisyphus/plans/req-health-automation.md` に基づく） |

## operation_units

### OU-01: RU-1 基盤整備
- **ou_id**: OU-01
- **source_ru**: RU-1
- **target_req**: REQ-0108, REQ-0101
- **operation**: append
- **scale**: standard
- **depends_on**: (none)
- **recommended_order**: 1
- **issue_policy**: single
- **result**: (空・req-save が書き戻す)

### OU-02: RU-2 3層ゲート実装
- **ou_id**: OU-02
- **source_ru**: RU-2
- **target_req**: REQ-0108, REQ-0101
- **operation**: append
- **scale**: large
- **depends_on**: [OU-01]
- **recommended_order**: 2
- **issue_policy**: single
- **result**: (空)

### OU-03: RU-3 req-define 強化
- **ou_id**: OU-03
- **source_ru**: RU-3
- **target_req**: REQ-0102
- **operation**: update, append
- **scale**: standard
- **depends_on**: [OU-01]
- **recommended_order**: 3
- **issue_policy**: single
- **result**: (空)

### OU-04: RU-4 spec-save 新設 + case-* 強化
- **ou_id**: OU-04
- **source_ru**: RU-4
- **target_req**: REQ-0136 (CREATE: spec-save 新コマンド要件), REQ-0102, REQ-0103, REQ-0114, REQ-0130, REQ-0131
- **operation**: create, append, update
- **scale**: large
- **depends_on**: [OU-03]
- **recommended_order**: 4
- **issue_policy**: single
- **result**: (空)

### OU-05: RU-5 finding 自動化 + クリーンアップ
- **ou_id**: OU-05
- **source_ru**: RU-5
- **target_req**: REQ-0126, REQ-0127, REQ-0108, REQ-0101
- **operation**: append, update
- **scale**: standard
- **depends_on**: [OU-02, OU-04]
- **recommended_order**: 5
- **issue_policy**: single
- **result**: (空)

### OU-06: RU-6 ドキュメント + 達成状況記録
- **ou_id**: OU-06
- **source_ru**: RU-6
- **target_req**: REQ-0101, REQ-0108
- **operation**: update
- **scale**: standard
- **depends_on**: [OU-05]
- **recommended_order**: 6
- **issue_policy**: single
- **result**: (空)

### OU-07: 新規 ADR-0123 作成
- **ou_id**: OU-07
- **source_ru**: RU-4
- **target_req**: (ADR)
- **operation**: create
- **target_spec**: docs/adr/ADR-0123.md
- **scale**: standard
- **depends_on**: [OU-04]
- **recommended_order**: 4
- **issue_policy**: single
- **result**: (空)

## execution_groups

### EG-01: Wave 1 - 基盤整備
- **id**: EG-01
- **type**: wave
- **purpose**: 3層ゲート・SPEC分離の基盤となる check_integrity.ts 拡張と SPEC 定義
- **included_ou**: [OU-01]
- **rationale**: 後続すべての RU が依存するため最初に実行

### EG-02: Wave 2 - 3層ゲート + req-define 強化（並行）
- **id**: EG-02
- **type**: parallel-wave
- **purpose**: 3層ゲートの実装と req-define 強化を並行実行
- **included_ou**: [OU-02, OU-03]
- **rationale**: 両者は OU-01 のみに依存し、互いに独立のため並行可能

### EG-03: Wave 3 - 新ワークフロー導入
- **id**: EG-03
- **type**: wave
- **purpose**: spec-save 新設、case-* 強化、新規 ADR-0123 作成による新ワークフロー導入
- **included_ou**: [OU-04, OU-07]
- **rationale**: OU-03 の SPEC 分離機能に依存

### EG-04: Wave 4 - finding 自動化 + クリーンアップ
- **id**: EG-04
- **type**: wave
- **purpose**: finding 自動 promote と既存REQ クリーンアップ
- **included_ou**: [OU-05]
- **rationale**: OU-02 (IR-044) と OU-04 (SPEC確定) に依存

### EG-05: Wave 5 - ドキュメント + 達成状況記録
- **id**: EG-05
- **type**: wave
- **purpose**: 全ドキュメント整備と REQ-0108 達成状況記録
- **included_ou**: [OU-06]
- **rationale**: 最終 wave。全 RU 完了後に実行

## ADR

### ADR-0123: SPEC lifecycle と spec-save の導入（proposed）
- **status**: proposed（req-save で正式作成）
- **context**: 新ワークフロー req-define → req-save → spec-save → case-* への移行。従来 req-save は SPEC 編集禁止（G02）で SPEC 分離経路が不在だった
- **decision**: 
  - SPEC lifecycle（draft / accepted）を導入し、新規コマンド `/agentdev/spec-save` で管理
  - case-auto ワークフローに spec-save を挿入
  - case-run で発見された SPEC 詳細は PR 本文の `## SPEC確定候補` セクションに記録し、case-close で確定
- **related_req**: REQ-0136-012, REQ-0136-014, REQ-0136-015
- **related_adr**: ADR-0103（文書種別責務境界）と整合（SPEC は現在仕様の基準という ADR-0103 の方針を維持しつつ、lifecycle を追加）

## draft-meta

- **work_type**: feature
- **req-operation**: multi (create, append, update)
- **target-req**: 
  - CREATE: REQ-0136（新規包括REQ）, ADR-0123（新規ADR）
  - APPEND: REQ-0101, REQ-0102, REQ-0108, REQ-0114, REQ-0126, REQ-0127, REQ-0130, REQ-0131
  - UPDATE: REQ-0101, REQ-0102, REQ-0104, REQ-0108, REQ-0114, REQ-0130, REQ-0131
- **adr-required**: true (ADR-0123)
- **topic-slug**: req-health-automation
- **scale**: large (Epic)
- **status**: saved
- **spec-candidates**:
  - docs/specs/req-health-metrics.md (new)
  - docs/specs/patterns.md (update)
  - docs/specs/workflow-contracts.md (update)
  - docs/specs/integrity-rule-catalog.md (update, 必要に応じて)
- **split-forecast**: 0（関心は単一: REQ/SPEC/ADR 適正運用の自動化。ただし影響範囲が広く、operation_units で6 RU に分割管理）
- **epic-detection**: false（6 RU は case-auto で1ワークフロー実行、Epic Issue ではなく単一ケースとして扱う）
