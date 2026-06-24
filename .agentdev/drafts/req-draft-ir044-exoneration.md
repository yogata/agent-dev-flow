---
draft_type: req_draft
topic_slug: ir044-exoneration
status: saved
created_at: 2026-06-24T00:00:00+09:00
source_rus: [RU-0011]
---

# draft-data

```yaml
work_type: feature
scale: standard

spec_actions_consumed:
  status: consumed
  consumed_at: 2026-06-24
  consumed_actions: [ACT-SPEC-001]

summary: >
  check_integrity.ts の IR-044 req-spec-boundary-violation 検出に exoneration 条件を追加し、
  META 規則行（REQ-0101-067 の REQ/SPEC スコープ定義行）と振る舞い要件行（REQ-0144-009
  「仕組みが存在する」等の存在・状態記述）の偽陽性2件を免除する。META 規則行 exemption は
  REQ-0108-259 の既存 exemption 範囲（委譲/集約/切り出し/存在確認文脈）に含まれない新区分のため、
  REQ-0145（docs-check/integrity 検出設計改善）へ根拠要件を APPEND する。振る舞い要件行 exemption は
  REQ-0108-259「存在確認文脈」の実装精緻化に位置付け、integrity-rule-catalog.md の IR-044 exemption 条件節へ
  2条件を追記する。真陽性（REQ-0114-082, REQ-0144-008）を保護する回帰テストを追加する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      check_integrity.ts の IR-044 検出は、REQ/SPEC 境界を定義する META 規則行
      （REQ-0101-067 等、enum/format 等 SPEC 対象を列挙して責務範囲を規定する行）を exemption 対象とする。
      当該行は SPEC 詳細の記述ではなく責務範囲の規定であり、IR-044 の検出対象から除外する。
  - id: AG-002
    content: >
      check_integrity.ts の IR-044 検出は、振る舞い要件行（存在・状態を述べる行。例: REQ-0144-009
      「仕組みが存在する」）を exemption 対象とする。REQ-0108-259「存在確認文脈」の実装精緻化であり、
      「fixture」等の修飾語が種別を示す文脈（件数・内容を規定しない修飾）を免除する。
  - id: AG-003
    content: >
      integrity-rule-catalog.md の IR-044 exemption 条件節に、META 規則行 exemption と振る舞い要件行
      exemption の2条件を追記する。代表キーワード、典型例、判定表、境界ケースを併記し、true positive
      保護の回帰テスト項目を明記する。
  - id: AG-004
    content: >
      REQ-0114-082 および REQ-0144-008（真陽性）が新 exoneration 条件により誤って免除されないことを
      回帰テストで検証する（REQ-0108-259, REQ-0108-055 準拠）。
  - id: AG-005
    content: >
      docs-check 実行時、REQ-0101-067 行および REQ-0144-009 行に対する IR-044 WARNING が 0 件になること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0145.md
    target_area: 要件テーブル（IR-044 META 規則行 exemption）
    source_items: [AG-001]
    content: |
      REQ-0145 の要件テーブルへ IR-044 META 規則行 exemption の要件を追加する。

      追加エントリ:
      | REQ-0145-012 | IR-044 は REQ/SPEC 境界を定義する META 規則行（enum/format 等 SPEC 対象を列挙して責務範囲を規定する行。例: REQ-0101-067）を exemption 対象とすること。当該行は SPEC 詳細の記述ではなく責務範囲の規定であり、検出対象から除外する（false positive 抑制）。詳細な exemption 条件は SPEC（integrity-rule-catalog.md）に配置し、true positive が誤って免除されないことを回帰テストで検証すること（REQ-0108-259 準拠） |

      備考: 振る舞い要件行 exemption（AG-002）は REQ-0108-259「存在確認文脈」の実装精緻化に位置付け、
      REQ-0145 への新規追加ではなく SPEC 更新で対応する。REQ-0108-259 が既に exemption 原則を宣言しており、
      実装の未カバーを SPEC で明示化すれば足りる。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity-rule-catalog.md
    target_area: IR-044 exemption 条件節
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      integrity-rule-catalog.md の「IR-044 exemption 条件」節へ以下を追記する。

      (1) META 規則行 exemption（新規）: REQ/SPEC 境界を定義する行（REQ-0101-067 等）で
      enum/format 等 SPEC 対象を列挙して責務範囲を規定する行を免除。代表キーワード、典型例、
      判定表エントリを追加。当該行は SPEC 詳細の記述ではなく責務範囲の規定であるため検出対象外。

      (2) 振る舞い要件行 exemption（REQ-0108-259 存在確認文脈の実装明示化）: 存在・状態述語
      （「仕組みが存在する」等）と種別修飾語（「fixture」等、件数・内容を規定しない修飾語）を免除。
      代表キーワード、典型例、判定表エントリを追加。

      (3) 回帰テスト: REQ-0114-082, REQ-0144-008（真陽性）が新 exoneration 条件で免除されないことを
      検証するテスト項目を明記。境界ケース（exemption 適用外: SPEC 詳細そのものを列挙する行）も併記。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: REQ-0145
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0145]
      mapping:
        ACT-REQ-001: REQ-0145 (REQ-0145-012 APPEND)
        ACT-SPEC-001: SKIP (spec-save 対象、req-save 非処理)
      source_ru_to_ou:
        RU-0011: OU-001
      case_open_input:
        req_refs: [REQ-0145-012]
        spec_pending: ACT-SPEC-001

case_open_hints:
  epic_needed: false
```

# summary

check_integrity.ts の IR-044 検出ロジックに exoneration 条件を追加し、PR #1036 適用後に残存する偽陽性2件を免除する。偽陽性の根拠は RU-0011 Sources に行文言引用で確定済みである。

(1) REQ-0101-067（docs/requirements/REQ-0101.md:70）は REQ/SPEC 境界を定義する META 規則行であり、enum/format を SPEC 領域として列挙して責務範囲を規定する。IR-044 が「enum value list」キーワードを機械検出で誤捕していた。本行は SPEC 詳細の記述ではなく責務範囲の規定であるため、新規 exemption 区分（META 規則行 exemption）として扱う。REQ-0108-259 の既存 exemption 範囲（委譲/集約/切り出し/存在確認文脈）に含まれないため、REQ-0145（検出設計改善）へ根拠要件（REQ-0145-012）を APPEND する。

(2) REQ-0144-009（docs/requirements/REQ-0144.md:27）「仕組みが存在する」は振る舞い要件（存在・状態）。「fixture」は drift 対象種別を示す修飾語であり、件数・内容を規定しない。IR-044 が「fixture detail」キーワードを機械検出で誤捕していた。本行は REQ-0108-259「存在確認文脈」の対象であり、新規 REQ ではなく SPEC（integrity-rule-catalog.md）の exemption 条件明示化で対応する。

integrity-rule-catalog.md の IR-044 exemption 条件節へ 2 条件を追記し、代表キーワード、典型例、判定表、境界ケースを併記する。REQ-0114-082・REQ-0144-008（真陽性）が新 exoneration で免除されないことを回帰テストで保護する（REQ-0108-259, REQ-0108-055 準拠）。

RU-0010（REQ 是正）と並列実行可能。RU-0010 は REQ-0144-009 等 REQ 側の修正を作業主体とし、本 draft は check_integrity.ts 改良と SPEC 追記を作業主体とする。REQ-0145-001 監査が REQ-0144-009 を真陽性と分類した点と衝突するが、行文言「仕組みが存在する」の引用を優先し偽陽性に確定した（RU-0011 統合理由）。

check_integrity.ts の実装変更、回帰テスト追加は case-open 実装作業となる。REQ-0145 への APPEND と integrity-rule-catalog.md の SPEC 更新は req-save / spec-save 工程、check_integrity.ts と回帰テストは case-run 工程で対応する。
