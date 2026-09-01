---
title: `agentdev-req-analysis` Design
status: accepted
created: 2026-06-21
updated: 2026-09-01
---
<!-- ADF-COVERS(implementation): REQ-001-048, REQ-001-049, REQ-001-050, REQ-004-007, REQ-004-008, REQ-004-009, REQ-004-024, REQ-004-025, REQ-004-026, REQ-004-027, REQ-004-028, REQ-004-029, REQ-004-030, REQ-004-031, REQ-004-032, REQ-004-033, REQ-004-050, REQ-004-051, REQ-004-052 -->

# `agentdev-req-analysis` Design

## 目的

要件分析のための知識ベースとして分析観点、品質基準、定義を提供し、壁打ちフェーズでの壁打ち品質を担保する。

## 適用対象

- 要件定義プロセス全般（壁打ち、Issue 作成、実装検証）
- 要件分析、完了条件定義、要件網羅性評価時
- req-define Step 4（要件展開）、Step 4-2（分類ゲート）、Step 4-3（文書分類妥当性検証）、Step 10（要件doc確認）

## 提供する判断、操作

- ユーザーストーリー、完了条件、境界条件の展開
- 状態要件と反映作業の分類基準（分類ゲート）
- REQ/Design 境界判定基準（REQ-001-067〜068）
- 壁打ちメソドロジー（未決分岐解消、回答分類: Confirmed / Inferred / Unknown / User Decision / Out of Scope）
- ADR 閾値判定ブリッジ
- 複数 RU 入力受付、統合/分離判定、操作単位ごとの出力生成
- Epic 規模検出、Wave 候補、依存関係の記録
- チェックボックス品質基準（測定可能、一意、実装可能）
- 信頼境界を扱う対象の非機能受け入れ条件観点（REQ-004-050〜053）

## 信頼境界を扱う対象の非機能受け入れ条件観点

要件展開工程で work_type に関わらず適用する、非機能受け入れ条件の条件付き確認の分析観点（REQ-004-050〜053）。

- 適用対象トリガー3条件の判定基準: 対象が次のいずれかに該当するか否かを文書上で機械的に判定できる形で判定する。
  1. 信頼できない入力の構文解析、検証、解釈（パーサ、レクサ、デシリアライザ等）
  2. 権限、配布、trust 境界の enforcement
  3. 外部ネットワーク経路、アーカイブ展開等の外部攻撃面を持つ処理
- 3確認事項の導出観点: 適用対象と判定した場合、処理量の上限（時間計算量、処理ステップ数、または走査量の上限）、出力の上限（出力件数、証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）を受け入れ条件として確定するまで壁打ちで深掘りする。
- 回答形式の検証可能性要求: 上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれかを要求し、形式不定の回答や形式的な記述を許容しない。数値上限の記述は既存の test strategy 数値閾値ガイド（`agentdev-workflow-templates` Design「test strategy 記述ガイドライン」）および本 Design「pass_criteria 記述基準」の規範に従う。
- 適用対象とした場合はその前提を要件docに記録する（適用外の場合の記録は強制しない）。主発動点は要件展開工程であり、adversarial-review の動的レビュー戦略の検出観点は第二の網として助言に留める（adversarial-review Design「動的レビュー戦略」節参照）。

## プロジェクト知識の参照観点

要件分析・壁打ちでは、docs/knowledge/ 配下のプロジェクト知識（REQ-056）を判断材料として参照できる。
利用可能なハーネスの探索能力を通じて関連知識を検索し、知識の適用条件が分析対象に一致する場合のみ判断材料へ加える。
知識が不在の場合、または適用条件が一致しない場合は ADF core の一般規則のみで分析を実行する（分析を省略しない、REQ-054-002）。
知識の存在を理由に REQ/Decision/Design への確認を省略しない。

## 参照する references

- `@.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md`（REQ テンプレート）

## 現在の動作

- Confirmed のみを要件 doc へ反映
- Inferred / Unknown / User Decision / Out of Scope は要件 doc 外で提示
- 要件行は「変更後に満たすべき振る舞い、制約、状態」のみ記述
- 実装指示は要件行に混入させない
- 委譲接点: サブエージェントは分類候補、根拠のみを返し、親エージェントが確定事項として記録

## 対象外

- REQ ファイルの採番、CREATE/APPEND/UPDATE、frontmatter 更新、README 更新（`agentdev-req-file-manager` 担当）
- 実装計画、タスク分割、コード変更方針の確定
- Decision ファイルの作成、更新（`agentdev-decision-file-manager` 担当）

## 検証観点

- チェックボックス品質: 測定可能、一意、実装可能であるか
- 曖昧な表現を具体化できているか
- 全ステークホルダー視点で合意形成できているか
- 要件行が必達要件として記述されているか
- Design 分離基準（REQ-001-067）違反の残留検出

## pass_criteria 記述基準

test strategy の pass_criteria 記述時、REQ content と pass_criteria 表現の食い違いが QG-4 最終評価で問題化することを防ぐための記述基準（AG-007）。
req-define は test_strategy 策定時に本基準を適用する。

### 意味的等価許容

REQ content が pipeline stage（draft、Issue 本文、PR 本文等）によって表現を変える場合、pass_criteria は意味的等価性で判定する。
文字列一致を機械的に要求しない。

- pass_criteria は対象 REQ content の核心（対象、状態、振る舞い）を過不足なく表現する
- 文字列表現の差異（見出し表記、助詞、句読点、句の順序）は意味的等価性を妨げない
- 識別子（REQ ID、ファイルパス、セクション名）は一致を必須とする

QG-4 は意味的等価性で pass_criteria 充足を判定する。

### 「存在しないこと」と「変更されていないこと」の使い分け

pass_criteria が「存在」「変更」を検証する場合、対象に応じて表現を使い分ける。

| pass_criteria 表現 | 適用対象 | 検証方法 |
|---|---|---|
| 「存在しないこと」 | 新規作成禁止（例: REQ-0164 が存在しないこと、新規ファイルが存在しないこと） | 当該識別子、ファイルが存在しないことを確認（`glob`、`grep` で0件、`test -f` で偽） |
| 「変更されていないこと」 | 既存 REQ、既存ファイルの変更がないこと | 当該ファイルに diff がないことを確認（`git diff --quiet` で終了コード0） |

誤用例:

- ❌「REQ-001 が存在しないこと」（REQ-001 は既存のため、検証が常に偽となり有意でない。「変更されていないこと」を使用する）
- ❌「新規ファイル X が変更されていないこと」（存在しないファイルは diff 対象にならない。「存在しないこと」を使用する）
- ✅「REQ-0164 が存在しないこと」（新規作成禁止の検証として有意）
- ✅「REQ-001 が変更されていないこと」（既存 REQ の diff がないことの検証として有意）

### 共通 pass_criteria と正規所有

複数 REQ にまたがる共通 pass_criteria リスク、REQ 個別期待値推奨、変更対象外 REQ 検証の正しい表現、存在確認の使用条件の運用基準は [agentdev-workflow-templates.md](agentdev-workflow-templates.md)「test strategy 記述ガイドライン」を正規所有とする。
本 Design は意味的等価許容、存在確認と diff 確認の使い分けに限定する。

## See Also

- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)
- [agentdev-req-structure-diagnostics.md](agentdev-req-structure-diagnostics.md)
- [agentdoc-architecture-advisory.md](agentdev-architecture-advisory.md)
- [agentdev-decision-guidelines.md](agentdev-decision-guidelines.md)
- [commands/req-define.md](../commands/req-define.md)
- REQ-004（要件定義、保存）

