---
name: agentdev-req-analysis
description: Provides requirement analysis methods with quality criteria and ADR threshold judgment. USE FOR: analyzing requirements, defining acceptance criteria, evaluating requirement completeness. DO NOT USE FOR: creating requirement files, architecture decision evaluation, implementation planning.
---

# 要件分析スキル

要件分析のための**知識ベース**である。
分析観点、品質基準、定義を提供し、壁打ちフェーズでの壁打ち品質を担保する。

- **このスキル（知識）**: 分析観点、品質基準、定義
- **適用先**: 要件定義プロセス全般（壁打ち、Issue作成、実装検証）

---

## 入力

- RU（採用済み成果物）、セッションコンテキスト、明示入力ファイル

## 出力

- 要件doc候補（draft）: 目的、要件テーブル、適用範囲、Design候補セクション、`draft-meta`（spec-candidates, split-forecast 含む）
- 壁打ち出力: Confirmed / Inferred / Unknown / User Decision / Out of Scope の5分類と根拠

## 副作用

- なし（知識ベース）。REQ/Decision ファイル操作は `agentdev-req-file-manager`、`agentdev-decision-file-manager` が担当する

## 責任境界

- **扱う**: 分析観点、品質基準、壁打ちメソドロジー、REQ/Design 境界判定基準、Decision 閾値判定ブリッジ、変更誘発境界リスク分析（5観点境界からの case-specific risk 導出、リスク導出規則の参照契約と不在時挙動、test strategy への投影）、検証手段の質基準（production-equivalent verification の一般原則と test strategy 設計時点への適用、完了時点の証跡契約を正規所有する要件群との時点分担）、プロジェクト知識の参照観点（docs/knowledge/ 配下の知識を判断材料へ加える適用条件判定と知識不在時の分析続行）
- **扱わない**:
  - REQファイルの採番、CREATE/APPEND/UPDATE、frontmatter更新、README更新（→ `agentdev-req-file-manager`）
  - 実装計画、タスク分割、コード変更方針の確定（→ `/agentdev/case-run` の work plan）
  - Decisionファイルの作成、更新（→ `agentdev-decision-file-manager`）。Decision閾値に達する判断候補の抽出は行うが、ファイル操作は扱わない

## 常に守る不変条件

- 要件doc（目的/要件/適用範囲）に反映できるのは Confirmed のみ。Inferred/ Unknown は混入しない
- 要件成立に必要な Unknown が残存する場合、壁打ちを終了しない
- 状態要件と反映作業を分離する（現行 REQ の要件行に作業手段語を混入させない）
- Design 等に配置すべき要件行候補を REQ 要件行に残留させず、Design候補セクションへ分離する
- 主たる文意は肯定文で記述する（文書品質契約の肯定文規定に準拠）。否定文は境界条件、例外、補足として併記する

## 主要な判断順序

1. 入力データの性質に応じた分析フレームで全体構造を先行提示（論点漏れ、手戻り防止）
2. 未決分岐を依存順（目的 → 対象 → 対象外 → 責務境界 → 粒度 → 永続化 → 判定基準）に解消
3. evidence-first で証拠ベース解決を優先し、ユーザー質問は最後（1問1論点）
4. 回答を5種（Confirmed/ Inferred/ Unknown/ User Decision/ Out of Scope）に分類し、Confirmed のみ要件docへ射影
5. 状態要件に REQ/Design 境界判定を適用し、Design候補を `draft-meta.spec-candidates` へ分離
6. REQ 健全性メトリクスで SPLIT 予兆を計測し `draft-meta.split-forecast` に記録
7. 変更誘発境界リスク分析により5観点境界から case-specific risk を導出し、test strategy 定義の入力として提示する
8. test strategy 定義時に検証手段の質基準（production-equivalent verification）を適用し、検証手段が対象リスクに関係する実行・依存・環境境界を十分再現することを確認する

## プロジェクト知識の参照観点

要件分析・壁打ちでは、docs/knowledge/ 配下のプロジェクト知識（プロジェクト固有の再利用可能な判断材料）を判断材料として参照できる。
参照は docs/knowledge/ を正規知識領域とし、利用可能なハーネスの探索能力を通じて関連知識を検索する。Project Knowledge の所有と workflow 利用の要件が正規所有する利用契約に従い、知識の探索のために ADF 独自の検索機構を追加しない。
知識の適用条件が分析対象に一致する場合のみ、判断材料へ加える。
知識が不在の場合、または適用条件が一致しない場合は ADF core の一般規則のみで分析を実行する。分析を省略しない（変更誘発境界リスク分析の要件が正規所有する知識不在時の分析省略禁止に従う）。
知識の存在を理由に REQ/Decision/Design への確認を省略しない。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 要件展開の観点、完了条件、境界条件、必達要件記述、状態要件/反映作業分離、REQ/Design 境界判定基準、チェックボックス品質基準、ADR 閾値判定ブリッジ、分析フレーム選択、両面分析規定、変更誘発境界リスク分析、検証手段の質基準が必要な場合 | [references/analysis-viewpoints.md](references/analysis-viewpoints.md) |
| 壁打ちメソドロジー詳細（未決分岐の抽出と整理、質問運用ルール、回答分類と反映、Unknown 取扱い、既存メソドロジー再構造化、既存REQ/ADR の定量的照合、サブエージェント調査委譲スコープ絞り込み、APPEND precedent 利用）が必要な場合 | [references/wall-methodology.md](references/wall-methodology.md) |
| req-define 詳細ゲート（分類ゲート、Design候補抽出、文書分類妥当性検証、SPLIT 予兆計算、ADR 禁止ゲート、複数RU処理、Epic規模記録）を実行する場合 | [references/req-define-detailed-gates.md](references/req-define-detailed-gates.md) |
| req-define Step1 セッションコンテキスト検知手順が必要な場合 | [references/session-context-detection.md](references/session-context-detection.md) |
| サブエージェント調査委譲スコープ絞り込みの詳細（キーワード抽出、glob/grep 前処理、priority targets 構築）が必要な場合 | [references/investigation-scope-refinement.md](references/investigation-scope-refinement.md) |
| test strategy の数値閾値記述ガイドが必要な場合 | [references/test-strategy-numeric-threshold-guide.md](references/test-strategy-numeric-threshold-guide.md) |
| pass_criteria 記述ガイドが必要な場合 | [references/pass-criteria-writing-guide.md](references/pass-criteria-writing-guide.md) |
| verification log 記述形式が必要な場合 | [references/verification-log.md](references/verification-log.md) |

## 所有 template の入口

要件定義テンプレート: @.opencode/skills/`agentdev-req-file-manager`/templates/doc_requirement.md

テンプレート構成:
- **frontmatter**: `id`, `title`, `created`, `updated`
- **必須セクション**: `目的`, `要件`（テーブル形式）, `適用範囲`（対象/対象外）
- **補助セクション（任意）**: `Design候補`（req-define が分離した Design 相当行と想定配置先 Design を記載。req-save が REQ ファイル保存時に除去し、design-save が消費する）

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Capability Skill として、req-define / case-run 等の Workflow Skill が所有する STEP から呼び出される（`<workflows/workflow-skill-model>` Design）。
本スキル自身は STEP を所有しない。

### 呼出元 STEP と Input Resolution

呼出元 STEP は本スキルへの入力（RU、セッションコンテキスト、明示入力ファイル）を Input Resolution（`<workflows/input-resolution-and-durable-state>` Design）に従って解決する。
優先順位: (1) SSoT 再構成（docs/ 配下の永続文書）、(2) identifier 保持（RU-ID、REQ-ID、Issue番号）、(3) 最小 scalar、(4) runtime artifact（要件doc draft、検出事項等、REQ-{NNNN} lifecycle）。

本スキルの出力（要件doc候補、壁打ち出力）は runtime artifact に分類され、呼出元 STEP の result evidence および次 STEP の Input Resolution 入力として扱われる。
STEP reference 8 要素は `<workflows/step-reference-contract>` Design 参照。

## See Also

- **agentdev-req-file-manager**: REQファイルの作成、追記、更新、分割操作とバリデーション
- **agentdev-decision-guidelines**: Decision作成の必要性判定基準、ライフサイクル定義
- **agentdev-workflow-lifecycle**: agentdev-*ワークフロー統括ハブ（フェーズ定義、SSoT遷移、パターン判定）
