---
name: agentdev-req-analysis
description: Provides requirement analysis methods with quality criteria and ADR threshold judgment. USE FOR: analyzing requirements, defining acceptance criteria, or evaluating requirement completeness. DO NOT USE FOR: creating requirement files, managing file operations, architecture decision evaluation, or implementation planning.
---

# 要件分析スキル

要件分析のための**知識ベース**。
分析観点、品質基準、定義を提供し、壁打ちフェーズでの壁打ち品質を担保する。

- **このスキル（知識）**: 分析観点、品質基準、定義
- **適用先**: 要件定義プロセス全般（壁打ち、Issue作成、実装検証）

---

## 原本（SSoT）

本スキルの原本仕様は `agentdev-req-analysis` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-req-analysis.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- RU（採用済み成果物）、セッションコンテキスト、明示入力ファイル

## 出力

- 要件doc候補（draft）: 目的、要件テーブル、適用範囲、SPEC候補セクション、`draft-meta`（spec-candidates, split-forecast 含む）
- 壁打ち出力: Confirmed / Inferred / Unknown / User Decision / Out of Scope の5分類と根拠

## 副作用

- なし（知識ベース）。REQ/ADR ファイル操作は `agentdev-req-file-manager`、`agentdev-adr-file-manager` が担当する

## 責任境界

- **扱う**: 分析観点、品質基準、壁打ちメソドロジー、REQ/SPEC 境界判定基準、ADR 閾値判定ブリッジ
- **扱わない**:
  - REQファイルの採番、CREATE/APPEND/UPDATE、frontmatter更新、README更新（→ `agentdev-req-file-manager`）
  - 実装計画、タスク分割、コード変更方針の確定（→ `/agentdev/case-run` の work plan）
  - ADRファイルの作成、更新（→ `agentdev-adr-file-manager`）。ADR閾値に達する判断候補の抽出は行うが、ファイル操作は扱わない

## 常に守る不変条件

- 要件doc（目的/要件/適用範囲）に反映できるのは Confirmed のみ。Inferred/ Unknown は混入しない
- 要件成立に必要な Unknown が残存する場合、壁打ちを終了しない
- 状態要件と反映作業を分離する（現行 REQ の要件行に作業手段語を混入させない）
- SPEC 等に配置すべき要件行候補を REQ 要件行に残留させず、SPEC候補セクションへ分離する
- 主たる文意は肯定文で記述する（-066 準拠）。否定文は境界条件、例外、補足として併記する

## 主要な判断順序

1. 入力データの性質に応じた分析フレームで全体構造を先行提示（論点漏れ、手戻り防止）
2. 未決分岐を依存順（目的 → 対象 → 対象外 → 責務境界 → 粒度 → 永続化 → 判定基準）に解消
3. evidence-first で証拠ベース解決を優先し、ユーザー質問は最後（1問1論点）
4. 回答を5種（Confirmed/ Inferred/ Unknown/ User Decision/ Out of Scope）に分類し、Confirmed のみ要件docへ射影
5. 状態要件に REQ/SPEC 境界判定を適用し、SPEC候補を `draft-meta.spec-candidates` へ分離
6. REQ 健全性メトリクスで SPLIT 予兆を計測し `draft-meta.split-forecast` に記録

## reference選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 要件展開の観点、完了条件、境界条件、必達要件記述、状態要件/反映作業分離、REQ/SPEC 境界判定基準、チェックボックス品質基準、ADR 閾値判定ブリッジ、分析フレーム選択、両面分析規定が必要な場合 | [references/analysis-viewpoints.md](references/analysis-viewpoints.md) |
| 壁打ちメソドロジー詳細（未決分岐の抽出と整理、質問運用ルール、回答分類と反映、Unknown 取扱い、既存メソドロジー再構造化、既存REQ/ADR の定量的照合、サブエージェント調査委譲スコープ絞り込み、APPEND precedent 利用）が必要な場合 | [references/wall-methodology.md](references/wall-methodology.md) |
| req-define 詳細ゲート（分類ゲート、SPEC候補抽出、文書分類妥当性検証、SPLIT 予兆計算、ADR 禁止ゲート、複数RU処理、Epic規模記録）を実行する場合 | [references/req-define-detailed-gates.md](references/req-define-detailed-gates.md) |
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
- **補助セクション（任意）**: `SPEC候補`（req-define が分離した SPEC 相当行と想定配置先 SPEC を記載。req-save が REQ ファイル保存時に除去し、spec-save が消費する）

## See Also

- **agentdev-req-file-manager**: REQファイルの作成、追記、更新、分割操作とバリデーション
- **agentdev-adr-guidelines**: ADR作成の必要性判定基準、ライフサイクル定義
- **agentdev-workflow-lifecycle**: agentdev-*ワークフロー統括ハブ（フェーズ定義、SSoT遷移、パターン判定）
