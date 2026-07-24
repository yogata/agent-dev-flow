---
status: accepted
updated: 2026-07-24
---

# 品質ゲート

AgentDevFlow 主ワークフロー（req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open → case-run → case-close）に配置される品質ゲート QG-1〜QG-4 を定義する（REQ-0108）。
各ゲートの判定基準、機械化境界、実装マッピングを示す。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリの設計文書であり、実行時配布対象ではない（ADR-0103, ADR-0104）。
> 実行時コマンドは本 SPEC に依存せず、`agentdev-quality-gates` スキルの参照ファイルを実行時参照先とする。

## 適用範囲

- **対象**: AgentDevFlow **主ワークフローのみ**。req-define / req-save / case-open / case-run / case-close（および case-auto）を横断する 4 ゲート。
- **対象外**: inspect-* / intake-* / learning-* / backlog-* / case-update は実行時参照対象ではない。これらの補助ワークフローには QG-1〜QG-4 を適用しない。
- **置換関係**: 本 SPEC は旧 `agentdev-spec-compliance` スキルの乖離検出機能を QG-3 として再編成したものである。品質メトリクス収集（型チェック/Lint/ビルド/テスト）は各コマンドのローカル検証ステップ（case-run Step 11-1 等）に委譲する。

## ゲート一覧

| Gate | 名称 | 配置コマンド | 対象成果物 | 判定結果 |
|------|------|-------------|-----------|---------|
| QG-1 | Definition Integrity Gate | req-define / req-save | 要件 doc draft / REQ、ADR ファイル | pass / warn / fail |
| QG-2 | Acceptance Criteria Coverage Gate | case-open | Issue 本文（完了条件） | pass / warn / fail |
| QG-3 | Implementation Deviation Gate | case-run | git diff（実装差分） | pass / warn / fail（乖離分類付き） |
| QG-4 | Final Acceptance Gate | case-close | PR / CI / Issue チェックボックス | pass / fail |

各 Gate の詳細な判定基準、検査観点は `agentdev-quality-gates` スキルの参照ファイルを原本とする。

## QG-1: Definition Integrity Gate

### 目的

要件定義フェーズ（req-define / req-save）で生成される成果物の構造的完全性を担保する。
曖昧な要件、測定不能なチェックボックス、分類不適合をフェーズ内で検出する。

### 配置

- **req-define**: 要件 doc draft 生成時（Step 6〜9）。REQ/SPEC 分類、ADR ゲート、チェックボックス測可能性を検証。
- **req-save**: REQ/ADR ファイル保存時（Step 3〜4）。保存前の最終構造検証。

### pass / warn / fail 基準

- **pass**: 全検査観点を満たす。チェックボックスは測定可能かつ一意、REQ/SPEC 分類が適切、ADR 判定が記録済み。
- **warn**: 構造は保たれているが、改善推奨事項がある（例: チェックボックスの粒度が粗い）。進行可能。
- **fail**: 構造的欠陥がある（例: 必須セクション欠落、REQ にすべき内容が SPEC に混入）。req-define へ差し戻し。

### 詳細

判定基準、検査観点の詳細は `agentdev-quality-gates` スキルの `references/qg-1-definition-integrity.md` を参照。

#### test_strategy 3要素完全性検査

各 test strategy 項目が verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に保持することを検証する。
いずれかが欠落する項目を検出した場合、fail とする。
この検査は req-define / req-save が適用する。

## QG-2: Acceptance Criteria Coverage Gate

### 目的

case-open で Issue を作成する前に、Issue の完了条件が対象 REQ/ADR/SPEC の必達要件を網羅していることを確認する。
受け入れ基準の漏れをフェーズ内で検出する。

### 配置

- **case-open**: Issue 本文生成時（Step 1, Step 5/15）。REQ 必達要件 → 完了条件チェックボックスへの mapping を検証。

### pass / warn / fail 基準

- **pass**: 全 REQ 必達要件が完了条件チェックボックスに対応づけられている。
- **warn**: 対応づけはあるが、表現が曖昧または一部必達要件の網羅性に疑義がある。Issue 作成可能（警告併記）。
- **fail**: 必達要件の完了条件への対応が欠落している。Issue 作成前に req-define 差し戻しを推奨。

### 詳細

判定基準、検査観点の詳細は `agentdev-quality-gates` スキルの `references/qg-2-acceptance-criteria-coverage.md` を参照。

## QG-3: Implementation Deviation Gate

### 目的

case-run で PR 作成前に、実装が Issue / REQ / ADR / SPEC / work plan から乖離していないことを確認する。
乖離を分類し、推奨アクションを提示する。

### 配置

- **case-run**: 提出フェーズ（Step 8）。git diff を対象に乖離検出を実行。

### 乖離分類

| 分類 | 意味 | 影響度 |
|------|------|--------|
| no-deviation | 乖離なし | - |
| impl-bug | 要件定義は正しいが実装が仕様を満たさない | 重大 / 軽微 |
| spec-bug | 要件定義と実装の間に論理的矛盾がある | 重大 |
| scope-creep | 実装が要件定義の範囲を超えている | 軽微 |

### pass / warn / fail 基準

- **pass**: no-deviation。実装は Issue/REQ/ADR/SPEC/work plan に整合。
- **warn**: 軽微乖離のみ（scope-creep 等）。そのまま進行可能（乖離内容を実装記録に併記）。
- **fail**: 重大乖離あり（impl-bug / spec-bug）。ユーザー指示待機（自動修正禁止）。重大乖離 ≥2 件で壁打ちフェーズ全体への差し戻しを推奨。

### 責務境界

QG-3 は**乖離の分類と推奨アクションの提示**に限定する。
REQ ファイルの更新判断、更新実行は行わない。
REQ 更新の最終判断は `case-update` がユーザー承認済み入力をもって行う。
docs 全体の意味レビューは `/agentdev/inspect-docs` の責務であり、QG-3 の代替ではない。

### 詳細

判定基準、検査観点、乖離タイプ定義の詳細は `agentdev-quality-gates` スキルの `references/qg-3-implementation-deviation.md` を参照。

## QG-4: Final Acceptance Gate

### 目的

case-close で PR マージ前に、最終受け入れ状態を確認する。
Issue 完了条件チェックボックスの全達成、CI 通過、ドキュメント整合性を検証する。

### 配置

- **case-close**: 前提確認（Step 2）、docs 検証（Step 3, 3-1）。PR / CI / Issue チェックボックスを対象に完了証拠を確認。

### pass / fail 基準

- **pass**: 完了条件チェックボックスが全て `[x]`、CI 通過、docs 整合性確認済み。マージ可能。
- **fail**: 未達チェックボックスが残る、CI 失敗、docs 不整合あり。構造化エラーで停止。

### 完了条件チェックボックス評価

QG-4 は Issue 本文の完了条件セクションのチェックボックスを品質ゲートとして評価する。
未達項目は case-run への差し戻し（G08）、または intake への逃がし禁止（G16）として扱う。

verify-only PR（実装差分0件、検証のみ）の場合、QG-4 の完了条件評価は PR 本文の verify-only 根拠欄（実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果）を証拠ソースとして認める。verify-only PR は実装差分を含まないため、根拠欄の記載で完了条件を評価する。

PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。

### 詳細

判定基準、検査観点の詳細は `agentdev-quality-gates` スキルの `references/qg-4-final-acceptance.md` を参照。

#### test strategy 処理完了確認

全 test strategy 項目が合格済みまたは Findings 記録済みであることを確認する。
未処理の test strategy 項目が残る場合、完了扱いとしない。

## 機械化境界（Mechanization Boundaries）

各ゲートで、何を機械化できるか、何を推論に委ねるか、何をサブエージェントに委譲するかを明確にする。

| 領域 | 内容 | 実現手段 |
|------|------|---------|
| 機械的検証 | ファイル存在、frontmatter 形式、チェックボックス構文（`- [ ]` / `- [x]`）、テーブル列数、リンク先存在 | ツール呼び出し（Grep / Glob / LSP）で決定的に判定 |
| 推論ベース検証 | チェックボックスの測可能性、REQ/SPEC 分類妥当性、完了条件の網羅性、乖離の重大度判定、ドキュメント意味整合 | エージェントの推論（ナレッジベース参照ファイルが基準を提供） |
| サブエージェント委譲 | 探索結果、分類候補、根拠の抽出 | 親エージェントが判断を確定（委譲接続点: サブエージェントは候補のみ返す） |
| ユーザー判断 | 乖離時の修正方針、REQ 更新承認、scope-creep 承認 | エージェントは推奨アクションを提示し、ユーザーが決定（自動修正禁止） |

### 重要事項

- **ユーザー判断の原則**: QG-3/QG-4 の fail 判定時、エージェントは推奨アクションを提示しユーザーが決定する。自動的な差し戻し、修正は行わない。
- **推論基準の明文化**: 推論ベース検証の基準は `agentdev-quality-gates` スキルの参照ファイルに文書化し、属人的推論に依存しない。

## Command / Skill 実装マッピング

各ゲートと参照先コマンド、スキルの対応を示す。

| Gate | 配置コマンド | 参照スキル（実行時） | SPEC |
|------|-------------|---------------------|------|
| QG-1 | req-define.md, req-save.md | `agentdev-quality-gates` (qg-1-definition-integrity) | quality-gates.md |
| QG-2 | case-open.md | `agentdev-quality-gates` (qg-2-acceptance-criteria-coverage) | quality-gates.md |
| QG-3 | case-run.md | `agentdev-quality-gates` (qg-3-implementation-deviation) | quality-gates.md |
| QG-4 | case-close.md | `agentdev-quality-gates` (qg-4-final-acceptance) | quality-gates.md |
| - | case-auto.md | 構成コマンドから QG を継承（再実装しない） | quality-gates.md |
| - | case-update.md | QG 直接参照なし（review-ng 時は QG-3 結果を引用） | - |

### case-auto の継承

case-auto は構成コマンド（req-save / case-open / case-run / case-close）から QG を継承し、工程間制御のみを担う（case-auto G07, G09）。

## 関連項目（See Also）

- [agentdev-quality-gates](../../src/opencode/skills/agentdev-quality-gates/SKILL.md)（QG-1〜QG-4 の判定基準、検査観点を提供する実行時ナレッジベース）
- [quality-specs.md](quality-specs.md)（品質基準（行数上限、執筆完了基準 等））
- [document-model.md](../foundations/document-model.md)（REQ/ADR/SPEC/guides の責務マトリックス、文書分類ポリシー）
