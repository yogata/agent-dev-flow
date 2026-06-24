---
draft_type: req_draft
topic_slug: ir044-req-correction
status: saved
created_at: 2026-06-24T00:00:00+09:00
source_rus: [RU-0010]
---

# draft-data

```yaml
work_type: docs_chore

summary: >
  IR-044（req-spec-boundary-violation、check_integrity.ts Category: CanonicalConflict、WARNING）が検出した真陽性2件を是正する。REQ-0114-082は要件意図（実行開始時刻・完了報告生成時刻の記録）のみを残し、Step番号参照（Step 1 / Step 8）を除去する。REQ-0144-008は要件意図（fixtureは最新check_integrity.tsルールに追従する）のみを残し、件数表現（既存5件赤 / valid fixture 7件 NG）を除去する。除去したSPEC詳細はそれぞれ所定の配置先（case-auto command reference / test docs）へ移管し、対象2行のIR-044 WARNINGが0件になることをcheck_integrity.tsで確認する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-0114-082の要件行は、case-autoが実行開始時刻および完了報告生成時刻を記録するという振る舞い要件のみを記述する。Step番号（Step 1 / Step 8）による工程位置参照を含まない。
  - id: AG-002
    content: >
      REQ-0144-008の要件行は、scripts/tests/check_integrity.test.ts の fixture が最新の check_integrity.ts ルールに追従するという維持要件のみを記述する。検出された件数（既存5件赤 / valid fixture 7件 NG）を含まない。
  - id: AG-003
    content: >
      REQ-0114-082から除去したStep番号参照（Step 1 入力解決 / Step 8 完了報告生成）は、case-auto command reference（または該当SPEC）に工程手順情報として配置される。REQ-0144-008から除去した件数は、test docs / SPEC級資料に配置される。両者ともREQ本文には復帰させない。
  - id: AG-004
    content: >
      修正後に check_integrity.ts を実行した結果、REQ-0114-082 および REQ-0144-008 の2行に対する IR-044 WARNING は0件となる。これは REQ-0101-068（REQ要件行へのSPEC詳細混入禁止）の遵守状態を機械的に確認できることを意味する。
  - id: AG-005
    content: >
      REQ-0144-009（copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在する）は、行文言「仕組みが存在する」を根拠に振る舞い要件（偽陽性）と確定し、本ドラフトの対象外とする。検出ロジック改良は RU-0011 が担い、本ドラフトと並列実行可能である。

artifact_actions:
  - artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    change: >
      REQ-0114-082 の要件行から「（Step 1 入力解決の開始時点）」「（Step 8）」のStep番号参照を除去し、「case-auto は実行開始時刻および完了報告生成時刻を記録すること」の要件意図のみを残す。frontmatter の updated を修正日に更新する。併せて、除去したStep番号と工程対応（Step 1 = 入力解決、Step 8 = 完了報告生成）を case-auto command reference または該当SPECへ移管する。
  - artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    change: >
      REQ-0144-008 の要件行から「（既存5件赤 + valid fixture 7件 NG の解消）」の件数表現を除去し、「scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従すること」の要件意図のみを残す。frontmatter の updated を修正日に更新する。併せて、除去した件数情報（既存5件赤 / valid fixture 7件 NG）を test docs / SPEC級資料へ移管する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0010
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0114
        - REQ-0144
      artifact_action_to_req:
        ACT-REQ-001: REQ-0114
        ACT-REQ-002: REQ-0144
      source_ru_to_operation:
        RU-0010:
          - REQ-0114-082: UPDATE (SPEC 詳細 Step 番号参照を除去、振る舞い要件のみ残存)
          - REQ-0144-008: UPDATE (SPEC 詳細 件数表現を除去、振る舞い要件のみ残存)
      case_open_input:
        work_type: docs_chore
        saved_docs:
          - docs/requirements/REQ-0114.md
          - docs/requirements/REQ-0144.md
        note: REQ/SPEC 責務分離是正。SPEC 詳細の移管先（case-auto command reference / test docs）は別 Issue 化対象

case_open_hints:
  epic_needed: false
```

# summary

IR-044（req-spec-boundary-violation）は `check_integrity.ts` がREQ要件行にSPEC詳細が混入した状態をWARNINGとして検出する。PR #1036 適用でWARNINGが12件から4件に減少した残りのうち、真陽性2件を本ドラフトで是正する。

対象2行はいずれも要件意図（満たすべき状態）とSPEC詳細（Step番号・件数）が混在していた事例である。是正方針はREQ-0101-067/068（REQ/SPEC責務分離）に従い、REQ要件行には振る舞い・状態のみを残し、SPEC詳細は所定の配置先へ移管する。

- REQ-0114-082（`docs/requirements/REQ-0114.md:91`）: 除去対象は「（Step 1 入力解決の開始時点）」「（Step 8）」。要件意図は「実行開始時刻・完了報告生成時刻の記録」のみ。Step番号は case-auto command reference へ移管する。
- REQ-0144-008（`docs/requirements/REQ-0144.md:26`）: 除去対象は「（既存5件赤 + valid fixture 7件 NG の解消）」。要件意図は「fixtureは最新check_integrity.tsルールに追従する」のみ。件数は test docs / SPEC級資料へ移管する。

修正後は `check_integrity.ts` を実行し、対象2行のIR-044 WARNING が0件になることを確認する。これは QG-4 最終受入および REQ 安定性に直結する。

なお、同バンドルのREQ-0144-009は行文言「仕組みが存在する」を根拠に振る舞い要件（偽陽性）と確定し、検出ロジック改良を担うRU-0011へ分離済みである。両RUは作業主体が独立するため並列実行可能である。
