---
draft_type: req_draft
topic_slug: docs-japanese-quality-history-document-correction-scope
status: draft
created_at: "2026-10-21T12:55:00+09:00"
source_rus: [RU-0243]
---

# draft-data

```yaml
work_type: maintenance
scale: standard
summary: |
  文章品質是正における歴史文書（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書）の修正範囲を読みを誤らせる確定誤記（誤字・別字形・表記の乱れ）に限定し、言い回しの改善を歴史文書の対象外とすることを合意した。REQ-053-039 の機械検査対象外の定義は変更せず、置換・廃止済み決定文書への適用は REQ-094-010 の確認対象に基づく是正の運用として位置づける。整備は REQ-094 への要件行追加（REQ-094-013）1件で行い、新規 REQ は作成しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      文章品質の是正（REQ-094 および REQ-001-017〜019 の適用）において、歴史文書（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書〔status: superseded 等〕）は、読みを誤らせる確定誤記（誤字・別字形・表記の乱れ）のみを修正対象とし、言い回しの改善の対象としない。理由は、過去の記録の本文を広く書き換えると当時の記録としての正確性を損なう恐れがあるためである。REQ-094-010 が確認対象に歴史文書を含めることと REQ-053-039 が是正対象としないことの間の運用を、確定誤記に限定して明確にする。
  - id: AG-002
    content: |
      確定誤記の判定は、正しい表現が一意に定まり文脈によって意味が変わらない誤りを基準とする（REQ-094-009 が定める固定置換の安全基準に準拠する）。複数の自然な表現候補からの選択や文章構造の修正を要するものは言い回しとして扱い、歴史文書の修正対象から除外する。確定誤記の修正も、REQ-094-006/007（識別子・正式名称の維持）と REQ-094-011（文章修正の前後で意味が変化しない）の維持規定に従う。
  - id: AG-003
    content: |
      本合意の整備は REQ-094 への要件行の追加（REQ-094-013）として行い、新規 REQ は作成しない。REQ-053-039 の機械検査対象外の定義（対象: retired、reports）は変更しない。置換・廃止済みの決定文書に対する本合意の適用は REQ-094-010 の是正の運用であり、REQ-053-039 の歴史記録の定義を広げるものではない。意味保全は REQ-094-011、語彙管理と再発防止は REQ-094-008/009/012、最終検証は REQ-053-016/021/032 が既に所有しており、是正の進行方法（段階分割、並列実行）は要件に該当しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-094.md
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-094-013 | 文章品質の是正（本要件および REQ-001-017〜019 の適用）において、歴史文書（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書〔status: superseded 等〕）に対して修正を行う対象は、読みを誤らせる確定誤記（誤字・別字形・表記の乱れ）に限ること。確定誤記の判定は、正しい表現が一意に定まり文脈によって意味が変わらない誤りを基準とし（REQ-094-009 が定める固定置換の安全基準に準拠する）、複数の自然な表現候補からの選択や文章構造の修正を要するものは言い回しとして修正対象から除外すること。確定誤記の修正も REQ-094-006/007/011 の維持規定に従うこと。置換・廃止済みの決定文書に対する本行の適用は REQ-094-010 の確認対象に基づく是正の運用として行い、REQ-053-039 が定める歴史記録（対象: docs/requirements/retired/ 配下と docs/reports/ 配下）の機械検査対象外の定義を変更しないこと |

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-094-010（docs/ 配下および src/ 配下のすべての Markdown を確認対象とし、過去記録・retired 文書・Report を含む）と REQ-053-039（歴史記録〔docs/requirements/retired/ 配下と docs/reports/ 配下〕を文章表層品質検査の対象外とし是正対象としない）の間で、歴史文書を文章品質の観点でどこまで是正するかが未定義であった。
    resolution: |
      2026-10-21 の利用者選択（RU-0243 合意済み内容）により、歴史文書の修正対象を読みを誤らせる確定誤記に限定し、言い回しの改善を対象外とする運用を確定した。REQ-053-039 の所有する文章表層品質検査（機械検査）の対象外定義は現行維持とし、REQ-094-010 の確認対象に基づく是正の運用は独立に適用する。architecture-advisory の助言（2026-10-21）は、REQ-094（是正基準・適用運用）と REQ-053（機械検査除外）の責務区分が REQ-094-010 の前例で既に確立しており、本追加による規範的矛盾・責務境界変更・Decision 要否のいずれもないことを確認した（ブロッカー・ユーザー確認事項なし）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0243
    target_req: REQ-094
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-run 適用後、docs/requirements/REQ-094.md を全文読み取り、要件テーブルに REQ-094-013 行が存在すること、および同行に歴史文書の3分類（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書〔status: superseded 等〕）、確定誤記（誤字・別字形・表記の乱れ）への限定、言い回しの除外、REQ-053-039 定義不変更の各要素が含まれることを確認する。
    pass_criteria: |
      REQ-094-013 行が要件テーブルの末尾（REQ-094-012 行の直後）に隣接して存在し、2列構造（ID、要件）を維持していること。3分類・確定誤記限定・言い回し除外・判定基準・維持規定従属・REQ-053-039 不変更の全要素が過不足なく規定されていること。
    on_failure: |
      fix-and-reverify。要件行の記載漏れ・規定漏れ、または表から分離した配置（空行を挟む挿入等）は定義の不完全または構造破損のため、修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      適用後の変更差分において、docs/requirements/REQ-053.md の要件テーブル行（| REQ-053-039 | で始まる行）と docs/requirements/REQ-094.md の維持規定行（| REQ-094-006 |、| REQ-094-007 |、| REQ-094-011 | で始まる行）が変更前と同一本文であることを、変更ファイル一覧と各行の本文照合で確認する。REQ-053-039 等への参照文言の追記（REQ-094-013 行内の言及を含む）は検出対象外とする。
    pass_criteria: |
      REQ-053-039、REQ-094-006、REQ-094-007、REQ-094-011 の各行が変更前と同一本文であること。
    on_failure: |
      fix-and-reverify。維持規定の意図しない変更は合意違反のため、当該変更を差し戻して再適用する。
  - id: TS-003
    target_item: AG-003
    verification: |
      適用後の変更ファイル一覧を確認し、変更が docs/requirements/REQ-094.md のみであること（要件テーブルへの REQ-094-013 行の追加および frontmatter の updated 日付の更新に限る）、docs/requirements/ 配下に新規 REQ ファイルが作成されていないことを確認する。
    pass_criteria: |
      変更対象が docs/requirements/REQ-094.md のみであり、新規 REQ ファイルが存在しないこと。
    on_failure: |
      fix-and-reverify。想定外の新規作成・他ファイル変更は整備方法の合意（REQ-094 への追記のみ）に反するため、当該変更を撤去して再適用する。

realization_actions:
  - id: RA-001
    concern: 歴史文書是正の適用範囲規定の REQ-094 要件テーブルへの追加（他の実現面変更なしの確定）
    responsibility: |
      REQ-094（ADF の Markdown 日本語表現および用語選択基準）が文章品質是正の基準と適用範囲を正規所有する。機械検査の対象外定義は REQ-053-039 と checker 実行契約 Design（検出対象除外規定）が正規所有し、本変更では変更しない。
    ownership_hints:
      - docs/requirements/REQ-094.md（要件テーブルへの行追加。正規所有）
      - docs/requirements/REQ-053.md（REQ-053-039。変更禁止の維持規定）
      - docs/designs/integrity/checker-execution-contracts.md（検出対象除外規定。参照のみ、変更なし）
    intent: |
      REQ-094-010 と REQ-053-039 の間で未定義だった歴史文書の是正適用の境目を、確定誤記に限定して確定する。REQ-053-039 の機械検査対象外の定義は現行維持とする。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0243
    source_item: docs-japanese-quality-history-document-correction-scope
    disposition: covered
    reason_code: incorporated
    reason: |
      RU-0243（logical_key: docs-japanese-quality-history-document-correction-scope、2026-10-21 合意）の合意内容を AG-001〜AG-003 および ACT-REQ-001（REQ-094-013 行追加）へ反映した。RU 本文は4セクション構成（目的・合意済み内容・背景・整備方法）であり、session由来RU の必須8セクションに対して対象・対象外・正規所有者とアンカー・依存関係・要件化の方向・決定的受け入れ条件・Source Summary は本文内の実質記載から対応する。助言由来で要件本文と分離した留意点（置換・廃止済み決定文書は機械検査対象外ではなく言い回し系指摘が残存し得る運用上の併存）は req-define の完了報告に記録する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0243.md
      section: 合意済み内容
      checked_at_commit: null
    related_removed_items: []

# 組立スクリプト（assemble-draft-section 0.2.0、append 操作）の節末尾配置は表直前の空行を挟むため、
# 物理的な表内挿入（REQ-094-012 行への隣接）は case-ready の req-file-manager APPEND（要件テーブルへの
# 行挿入）が行う。TS-001 の合格基準が隣接を検証する。
assembly_evidence:
  - target_file: docs/requirements/REQ-094.md
    target_content_sha256: fd77974470033fd6d4b592ee593f2b50256f835d8f4d36862af3f29e0bc36b8f
    check_scope:
      heading: "## 要件"
      start_line: 14
      end_line: 30
    execution_conditions:
      operation: append
      edit_sha256: fe5227f4d39337aaadd6923af7af678af6375b8e9075ad61c505626c29cac64e
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 0
    executed_at: "2026-10-21T03:52:40.480Z"

case_open_hints:
  epic_needed: false
```

# summary

歴史文書（retired 配下・reports 配下・置換・廃止済み決定文書）の文章品質是正を読みを誤らせる確定誤記に限定し、言い回しの改善を対象外とする。REQ-053-039 の機械検査対象外の定義は現行維持。変更は REQ-094-013 行の追加1件。
