---
title: `agentdev-quality-gates` Design
status: accepted
created: 2026-06-21
updated: 2026-09-02
---
<!-- ADF-COVERS(implementation): REQ-007-001, REQ-007-003, REQ-007-004, REQ-007-005 -->

# `agentdev-quality-gates` Design

## 目的

AgentDevFlow 主ワークフローの品質ゲート QG-1〜QG-4 の判定基準、検査観点を提供する参照専用スキル。

## 適用対象

- QG-1（Definition Integrity Gate）: req-define / req-save での要件定義の構造的完全性検証
- QG-2（Acceptance Criteria Coverage Gate）: case-open での完了条件の必達要件網羅性検証
- QG-3（Implementation Deviation Gate）: case-run での実装乖離検出、分類
- QG-4（Final Acceptance Gate）: case-close での最終受け入れ確認

主ワークフロー（req-define / req-save / design-save / case-open / case-run / case-close）のみ適用。
design-save は独自 QG を持たず QG-1、QG-4 で担保される。

## 提供する判断、操作

- 各 Gate の pass / warn / fail / partial 判定基準
- 乖離分類（QG-3）: no-deviation / impl-bug / spec-bug / scope-creep
- evidence-first 原則
- Gate 結果フォーマット
- 各 Gate の検査観点

## 参照する references

- `references/common-gate-contract.md`（全 Gate 共通契約）
- `references/qg-1-definition-integrity.md`
- `references/qg-2-acceptance-criteria-coverage.md`
- `references/qg-3-implementation-deviation.md`
- `references/qg-4-final-acceptance.md`

## 現在の動作

- 参照専用（read-only）knowledge base
- ファイル編集、Issue 作成、PR 作成、マージ、テスト実行は行わない
- 自動ループバック禁止（QG-3 / QG-4 fail 時は推奨アクション提示、ユーザー決定）

## QG-2 拡張: artifact-specific quality control 投影検証（新規セクション）

QG-2 は REQ-017 execution contract 確定を支援するため、次の検証を追加する。

### 検証項目

(a) 変更予定成果物から導出される全ての必須品質能力が test strategy へ反映されていること。
    対応表は artifact-quality-control-routing Design を正とする。
(b) 各 test strategy 項目が3要素（verification、pass_criteria、on_failure）を持つこと
    （REQ-008-048 の維持）。
(c) 完了条件が成果状態であり、必須能力の呼出自体が完了状態とされていないこと
    （AG-002、REQ-017-003）。

### 適用範囲

- 新規 Issue 作成時（case-open Step 1、Step 5、Step 15 で実行）
- case-update による新契約更新時
- legacy Issue（必須セクション不存在）には適用しない

### 既存 QG-2 との関係

既存の QG-2 完了条件網羅性検証（REQ 必達要件 → 完了条件 mapping）に加え、
artifact-specific quality control の投影検証を追加する。
既存の7観点は維持する。

## full integrity suite 合格基準（QG-4）における bun test 実行形態契約

QG-4 の full integrity suite 実行における bun test の実行形態は、3 cwd 分割正規形とする。
正規形の詳細定義は `agentdev-quality-gates` スキルの references/qg-4-final-acceptance.md「bun test フル suite 正規形（実行形態契約）」が所有し、本 Design は品質統制側の契約を所有する:

- ① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テスト（plugins・発行系等）の3分割実行とし、各実行の cwd はリポジトリルート（worktree root または main root）に統一する
- 実行手順には `./` prefix 付きの対象ディレクトリ明示指定を必須ステップとする
- 分割② の実行前に、`bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` による依存パッケージ前置を行う（node_modules は gitignore 対象のため worktree へ未伝播）
- 実行結果の「Ran N tests across M files」の N/M 件数突合を必須ステップとする。直前実績と比較して件数が急減していないかの妥当性を検証する（固定値の期待値化は行わない）
- cwd 依存テストが混在するスイートは、カレントディレクトリトリビアな実行（`bun test` 単体等）で代替しない運用注記を付す
- QG-4 の適用正規形は tools/plugins テストを含む完全形である（B拡張）。plugins・発行系等の repo ルート直下テスト（分割③）を full suite の受理対象から除外しない

QG-4 機械受理基準: フル suite の受理判断は、次の受理由件の記録が PR 本文に機械的に検証可能な形で存在することを満たす場合のみ pass とする。受理由件は記録の存在と形式で判定し、判定者による内容の裁量判断を含まない:

1. 正規形実行の記録: 3 cwd 分割それぞれの起動コマンド（`./` prefix 付き、cwd はリポジトリルート）の実行記録
2. 環境ラベルの記録: 実行環境、junction 伝播状態、依存パッケージ状態の3要素
3. 件数突合の記録: 各分割実行の「Ran N tests across M files」件数
4. fail 全件の由来分類: fail が 0 件、または全 fail に由来分類（既知欠陥、環境依存、当該変更起因）が付与され、由来不明が 0 件
5. baseline 基準の明示: 由来判定が remediation 開始前の baseline commit 基準で行われたこと

integrity suite のコマンド数期待値は、公開コマンド列挙からの導出（動的化）により実コマンド数と整合させ、固定期待値による恒常 fail を発生させない。期待値の導出には最小件数下限の検証を併設し、漏れ検出の意味を損なわない（REQ-057-011）。期待値の導出手段の実装は integrity suite 側の責務である。

QG-4 の識別子中心評価の構造は維持する（固定値期待値化による脆化を行わない）。
case-close / docs-check の full suite 実行手順と PR 本文テンプレート（Test Strategy 結果欄）への記録欄追加は case 実施側の適用とする。

## 対象外

- テストの実行、型チェック、Lint、ビルド（各コマンドのローカル検証ステップ責務）
- ファイル編集、REQ 更新、Issue チェックボックス更新（各コマンド責務）
- Issue / PR / コメントの作成（各コマンド責務）
- コマンド固有の手順（Steps / Guardrails）の置き換え
- docs 全体の意味レビュー（inspect-docs 責務）
- 適用範囲外ワークフロー（inspect-* / intake-* / learning-* / backlog-* / case-update）

## 検証観点

- 各 Gate 固有の判定基準への適合
- evidence-first 原則の遵守
- 乖離分類（QG-3）の正確性
- Design status 昇格（draft → accepted）と QG-4 の連携

## See Also

- [quality-gates.md](../quality/quality-gates.md)（Design 定義）
- [commands/req-define.md](../commands/req-define.md), [commands/req-save.md](../commands/req-save.md), [commands/case-open.md](../commands/case-open.md), [commands/case-run.md](../commands/case-run.md), [commands/case-close.md](../commands/case-close.md)（適用先）
- REQ-001（REQ/Design 責務分離の徹底）

