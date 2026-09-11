---
draft_type: req_draft
topic_slug: raw-gh-cli-notation-normalization
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0006]
---

# draft-data

```yaml
# work_type: docs/designs と配布物 reference の表記正規化のみ
work_type: docs_chore

# scale: feature のみ判定対象。docs_chore のため未設定
scale: null

summary: 正規経路（Custom Tool agentdev_gh）以外に残存する生 gh CLI 表記のうち突合で現存した 3 箇所のうち、case-close.md L218 と qg-4-final-acceptance.md L121 の 2 箇所を Custom Tool agentdev_gh 操作契約の表記へ正規化する。case-run.md L322 は対象外リスト内の例外明示であり正規化対象外と判断した。IR-053 スキャン範囲の docs/designs 拡大は不採用と判断した。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/designs/commands/case-close.md L218（mergeable UNKNOWN ポーリング、REQ-006-028）の
      生 `gh pr view --json mergeable,mergeStateStatus` 表記を、Custom Tool agentdev_gh
      操作契約（REQ-011 系・custom-tool-contracts Design）の表記へ正規化する。
      意味内容（squash merge 前の mergeable 事前確認と UNKNOWN ポーリング）は変更しない。
  - id: AG-002
    content: |
      src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L121 の
      生 `gh pr view --json files` 表記を、Custom Tool agentdev_gh 操作契約の表記へ正規化する。
      正規化の実施は realization（配布 reference の表記置換）で行い、所有 Design
      （agentdev-quality-gates skill Design）側は QG-4 の I/O 操作表記契約の確認として対応する
      （case-close.md 側の files 突合記述は既に Custom Tool 表記であり置換対象ではない）。
      QG-4 検証内容（変更ファイル突合）自体は変更しない。
  - id: AG-003
    content: |
      docs/designs/commands/case-run.md L322（対象外リスト内の `gh issue list` 言及）は、
      case-run が実行しない操作の例外明示であり迂回手段の使用推奨を含まないため、
      正規化対象外（現状維持）とする。
  - id: AG-004
    content: |
      IR-053 スキャン範囲の docs/designs 拡大は不採用とする。
      docs/designs 配下は契約本文として Custom Tool 契約や IR 自身を記述する正当な文書群であり、
      IR-055 の正当使用例外（exemption）設計と同様、機械スキャン対象への追加は
      契約記述自体の false positive を誘発する。既知の残存箇所は人手整理対象として本 case で消化し、
      将来の新規残存は triage（baseline 系運用）経路で管理する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: mergeable UNKNOWN ポーリングを規定する行（L218 付近、REQ-006-028 関連記述）
    source_items: [AG-001]
    content: |
      mergeable UNKNOWN ポーリング（REQ-006-028）の表記を、生 gh CLI コマンド記述から
      Custom Tool agentdev_gh 操作契約経由の操作記述へ置換する。
      ポーリングの意味内容（squash merge 前の mergeable / mergeStateStatus 事前確認、
      UNKNOWN 時の最大60秒・10秒間隔ポーリング、上限超過時のマージ中止・構造化エラー停止）は
      現行どおり維持する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-quality-gates.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-quality-gates
    target_area: QG-4 final acceptance（変更ファイル突合検証）を規定するセクション
    source_items: [AG-002]
    content: |
      QG-4 final acceptance の変更ファイル突合検証における I/O 操作の表記契約を、
      Custom Tool agentdev_gh 操作契約（pr_changed_files 経由の取得）に準拠する旨を明記する。
      生 gh CLI コマンド表記（`gh pr view --json files`）は配布 reference
      （src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L121）に
      のみ現存するため、当該表記の置換は realization（RA-001）で実施し、
      所有 Design 側は表記契約の確認として対応する。
      検証内容（PR 変更ファイルの取得と files_checked / Issue 本文との突合）は現行どおり維持する。

conflict_resolutions:
  - id: CR-001
    conflict: case-run.md L322（対象外リスト内の gh CLI 言及）を正規化対象外とするか現状維持とするか
    resolution: |
      正規化対象外（現状維持）とする。根拠: この箇所は case-run が実行しない操作を列挙する
      対象外リスト内の記述であり、正規経路の例外を明示しているだけである。
      生表記の除去対象（迂回手段を含む通常手順記述）と性質が異なる。
      本根拠はファイル固有の例外ではなく一般原則であり、同一性格の禁止・対象外列挙内の言及
      （case-update.md L43/L68、case-close.md 対象外節の `gh issue list` 等）にも適用する。
  - id: CR-002
    conflict: IR-053 スキャン範囲の docs/designs 拡大の要否
    resolution: |
      不採用とする。根拠: docs/designs 配下は契約本文として Custom Tool 契約や IR 自身を
      記述する正当な文書群であり、IR-055 の exemption 設計と同型の false positive が予見される。
      既知残存は本 case で消化し、新規残存は triage（baseline 系）経路で管理する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0006
    target_req: null
    target_design: docs/designs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-close.md の置換後、当該行の直接パターン検索（`gh pr view` 系の生 gh CLI 表記の
      全文検索）で該当表記が 0 件であることを確認する。docs/designs は IR-053 のスキャン範囲外
      （affected_artifacts = src/opencode のみ）であるため、機械検査に代えて直接検索と、
      置換後表記と Custom Tool agentdev_gh 操作契約
      （docs/designs/responsibilities/custom-tool-contracts.md）の操作記述との突合で検証する。
      REQ-006-028 のポーリング仕様記述が変質していないことを確認する。
    pass_criteria: |
      case-close.md 当該行に生 gh CLI 表記が 0 件（直接パターン検索で確認）。
      置換後表記が操作契約と整合している。
      ポーリング仕様（60秒上限・10秒間隔・上限超過時停止）の記述が現行どおり維持されている。
    on_failure: |
      fix-and-reverify。表記不整合または仕様記述の変質を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      配布側ソース（qg-4-final-acceptance.md）の置換後、IR-053 スキャンを実行し該当箇所の
      検出が解消されていることを確認する。配布物内部 ID 契約検査も実行し、置換表記が
      配布依存境界違反（内部 concrete ID・docs 内部パスの新規導入）を生んでいないことを確認する。
    pass_criteria: |
      IR-053 スキャンで qg-4-final-acceptance.md 該当箇所の検出が 0 件。
      配布物内部 ID 契約検査の新規違反が 0 件。
    on_failure: |
      fix-and-reverify。置換表記を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      case-run.md L322 の現状維持判断を case-close.md / case-run.md 全体の IR-053 スキャン結果と
      突合し、対象外リスト内の言及が本 case の正規化対象から除外されていることを確認する。
    pass_criteria: |
      対象外リスト内の言及が除かれておらず、正規化対象外判断が conflict_resolutions に記録済み。
    on_failure: |
      record-in-findings。対象外リストの記述が将来の IR-053 検出対象に含まれた場合は
      triage 経路で管理する（本 case の処置対象外として記録）。

realization_actions:
  - id: RA-001
    concern: 配布側 reference（qg-4-final-acceptance.md）の生 gh CLI 表記正規化
    responsibility: |
      agentdev-quality-gates skill の配布 reference は該当 skill Design
      （docs/designs/skills/agentdev-quality-gates.md）と QG-4 契約
      （REQ-007 完了報告と成果物品質ゲート系・docs/designs/quality/quality-gates.md）が正規所有する。
      配布物本文の I/O 操作表記は REQ-011（I/O境界と外部連携手段）・
      custom-tool-contracts Design（Custom Tool 操作契約）に従う。
    ownership_hints:
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L121
      - docs/designs/skills/agentdev-quality-gates.md
      - docs/designs/responsibilities/custom-tool-contracts.md
    intent: |
      正規経路（Custom Tool agentdev_gh）を標準とする読者に迂回手段を含む記述として
      認識不整合を生んでいる現存表記を解消する。
    verification_refs: [TS-002]
    source_items: [AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0006
    source_item: requirements-direction-2
    disposition: covered
    reason_code: decided_in_req_define
    reason: |
      case-run.md L322 の取扱い判断（要件化の方向 2）は CR-001 として「正規化対象外（現状維持）」
      に確定。TS-003 で確認する。
    evidence:
      path: docs/designs/commands/case-run.md
      section: 対象外リスト（L322）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0006
    source_item: requirements-direction-3
    disposition: rejected
    reason_code: false_positive_risk
    reason: |
      IR-053 スキャン範囲の docs/designs 拡大（要件化の方向 3）は不採用（CR-002）。
      docs/designs 自身は契約記述文書群であり、IR-055 exemption 設計と同型の
      false positive を生む。triage 経路での管理に代替する。
    evidence:
      path: docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0003 / RU-0004 / RU-0005 / RU-0008 の draft が case-close.md を含む同一 Design ファイル群を更新する。case-open の Wave 構成で同時実行を避けるか、同一 Wave 内での競合解消を考慮すること
```

# summary

RU-0006（生 gh CLI 表記の正規化）を docs_chore として要件化した。case-close.md L218 と配布 reference（qg-4-final-acceptance.md L121）の 2 箇所を Custom Tool agentdev_gh 操作契約表記へ正規化し、case-run.md L322 は対象外リスト内の例外明示として正規化対象外、IR-053 スキャン範囲拡大は false positive リスクにより不採用と判断した。
