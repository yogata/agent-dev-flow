---
draft_type: req_draft
topic_slug: ru0034-numbering-policy-exception
status: draft
created_at: 2026-09-16T11:41:36+09:00
source_rus:
  - RU-0034
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  RU-0034（inspect F-02）を、REQ-087 の新規 CREATE、numbering-policy Design update 2節、README 欠番明記とギャップ検査追加の realization_actions として要件化した。REQ-082 採番（2026-09-15 ユーザー裁定）に伴う最大番号+1 規則の例外規定と既知欠番 063〜081 の記録を Design 側に追随させ、欠番無記録を機械検出する REQ 番号ギャップ検査を REQ-087 が所有する。REQ-082 本文側の「ユーザー裁定により採番」記録は正とし、REQ 側の是正は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      最大番号+1 採番規則に対するユーザー裁定による番号指定の例外規定を numbering-policy の採番規則に記録する。例外は分割・付け替えに伴う採番のみの付け替えに適用し、REQ 本文の該当行にユーザー裁定の記録を伴うことを条件とする（既知事例: REQ-082 採番、2026-09-15 ユーザー裁定により 062 の次を 082 と指定）。指定番号が既知欠番と重複する場合も欠番を消費せず、欠番は意図的予約として維持する。決定的採番スクリプトによる新規採番は既定経路であり続ける。
  - id: AG-002
    content: >-
      REQ-063〜REQ-081 の 19 連番を numbering-policy の既知の欠番に意図的予約欠番として記録し、requirements/README.md と docs/README.md で欠番として明記する。README の明記は AUTOGEN 自動生成ブロック外の本文記述として行い、docs/README の「番号には欠番が存在する」汎用記述を 063〜081 の具体明記へ補強する。
  - id: AG-003
    content: >-
      REQ 番号ギャップ検査（max+1 採番規則と README 欠番明記の突合）を新規検査クラスとして検査体系へ追加し、欠番無記録を機械検出できるようにする。検査クラス追加は REQ-010-068 の回帰テスト義務に従い、REQ-010-070 の検査体系追加の原則と整合させる。REQ-010-070 の入力条件は過去監査（v1〜v4）再走査に限定されるため、inspect-docs 診断由来の本検査の所有を REQ-087 が担う。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:ru0034-numbering-policy-exception
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ---
      id: REQ-087
      title: 採番例外の記録と REQ 番号ギャップ検査
      created: "2026-09-16"
      updated: "2026-09-16"
      ---

      # REQ-087 採番例外の記録と REQ 番号ギャップ検査

      ## 目的

      REQ 採番体系の記録整合を所有する。最大番号+1 採番規則に対するユーザー裁定による番号指定の例外規定、既知欠番（REQ-063〜REQ-081）の明記、および欠番無記録を機械検出する REQ 番号ギャップ検査の実行契約を定義する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-087-001 | 最大番号+1 採番規則に対するユーザー裁定による番号指定の例外規定が numbering-policy の採番規則に存在し、例外適用事例（REQ-082 採番）と整合すること。例外採番は REQ 本文の該当行にユーザー裁定の記録を伴うこと |
      | REQ-087-002 | REQ 番号の既知欠番（REQ-063〜REQ-081 を含む）は numbering-policy の既知欠番記録と requirements/README・docs/README の欠番明記と整合し、欠番の無記録は機械検査で検出されること |
      | REQ-087-003 | REQ 番号ギャップ検査（max+1 採番規則と README 欠番明記の突合）が新規検査クラスとして検査体系へ追加され、REQ-010-068 の回帰テスト義務に従うこと |

      ## 適用範囲

      - **対象**: REQ 識別子採番の例外規定、REQ 既知欠番の記録整合、REQ 番号ギャップ検査
      - **対象外**: REQ/Decision/IR の採番規則本体（numbering-policy 正規所有）、決定的採番スクリプトの I/O 契約（agentdev-req-file-manager SKILL 正規所有）、対論型レビュー審議契約（REQ-082 正規所有）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/numbering-policy.md
    target_design:
      operation: update
      domain: foundations
      slug: numbering-policy
    target_area: 採番規則（新規採番）
    source_items: [AG-001]
    content: |
      「### 新規採番」節へ例外規定を追記する。分割・付け替えに伴う採番のみの付け替えでは、ユーザー裁定による番号指定を例外として許容する。例外採番は REQ 本文の該当行にユーザー裁定の記録を伴い、指定番号が既知欠番と重複する場合も欠番を消費せず、欠番は意図的予約として維持する（REQ-082 採番の前例: 2026-09-15 ユーザー裁定）。決定的採番スクリプトによる新規採番は既定経路であり続ける。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/numbering-policy.md
    target_design:
      operation: update
      domain: foundations
      slug: numbering-policy
    target_area: 欠番の扱い（既知の欠番）
    source_items: [AG-002]
    content: |
      「#### 既知の欠番」節へ REQ の既知欠番を記録する。REQ-063〜REQ-081 の 19 連番は、REQ-082 採番（2026-09-15 ユーザー裁定）に伴う意図的予約欠番である。requirements/README.md と docs/README.md で「欠番」として明記し、実体不在と整合する。

conflict_resolutions:
  - id: CR-001
    conflict: 擬似採番 REQ-087 を CREATE 用として使用する。
    resolution: 擬似採番であり、case-open が決定的採番（alloc-req-number.ts）により最終的な REQ 番号を確定する。共有予約枠（REQ-083〜096）から本バッチの CREATE 3件（ru0021=REQ-083、ru0027=REQ-085、ru0034=REQ-087）を割当てている。REQ-084 と REQ-086 は本バッチで不使用の空き枠として返却する（決定的採番が実際の採番を行うため再利用可）。
  - id: CR-002
    conflict: RU-0034 の tentative_classification は「挹動Design」だが、文書7分類モデル（document-model.md 正本）に該当する区分表記が存在しない。
    resolution: 「挹動Design」は誤記と判断する。本 RU の変更本体は numbering-policy（文書Design）への記録追加が中心である。ただし RA-002 が REQ 番号ギャップ検査の新規検査クラス実装と回帰テスト fixture 追加を含むため、RU frontmatter の work_type（docs_chore）から maintenance へ変更する（checker コード修正を含む ru0026 と同基準。docs 更新責務は全 work_type 共通であるため文書中心部分の扱いは不変）。
  - id: CR-003
    conflict: REQ-082 本文に「2026-09-15 のユーザー裁定により分離移動…採番のみ付け替え」の記録が既に存在し、REQ 側の記録と Design 側の未追随が不一致を生じている。
    resolution: 現行 REQ 優先の基準構造に従い、REQ-082 本文の記録を正として維持し、REQ 側の本文是正は行わない。本件は Design 側（numbering-policy）と README 索引の未追随解消に限定する。
  - id: CR-004
    conflict: REQ 番号ギャップ検査を REQ-010-070（採用した新規機械検査クラスの検査体系追加）で所有できるかどうか。
    resolution: REQ-010-070 の入力条件は過去監査（v1〜v4）再走査結果の受けであり、inspect-docs 診断由来の本検査を直接所有しないため、検査の所有を REQ-087 が担い、REQ-010-068（回帰テスト義務）と REQ-010-070（検査体系追加の原則）に従う。REQ-010 への APPEND は行わない。
  - id: CR-005
    conflict: README の欠番明記を AUTOGEN 自動生成ブロック（req-active-table 等の索引表）内で行うかどうか。
    resolution: AUTOGEN ブロックは index-auto-generation.md 正規所有の自動生成領域であるため、欠番明記は AUTOGEN ブロック外の本文記述として行い、自動生成表とは分離して維持する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0034
    target_req: REQ-087
    target_design: docs/designs/foundations/numbering-policy.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      numbering-policy.md の「### 新規採番」節を読み、ユーザー裁定による番号指定の例外規定が存在すること、例外の適用条件（採番のみの付け替え、REQ 本文へのユーザー裁定の記録）が明記されていること、REQ-082 採番の前例と記述が整合することを確認する。
    pass_criteria: >-
      例外規定の記述が存在し、既知事例（REQ-082、063〜081 を意図的予約欠番とした経緯）と矛盾せず、決定的採番スクリプトが既定経路であり続ける旨の記述が保持されている。
    on_failure: >-
      fix-and-reverify を選択する。記述の修正後に同様の読解確認を再実行でき、Design 記述の欠落は放置できないため。
  - id: TS-002
    target_item: AG-002
    verification: >-
      numbering-policy.md の「#### 既知の欠番」節、requirements/README.md、docs/README.md を突合し、063〜081 の欠番明記が3箇所すべてに存在し、AUTOGEN ブロック外の本文記述であることを確認する。
    pass_criteria: >-
      3箇所すべてで 063〜081 が意図的予約欠番として明記され、docs/README の「番号には欠番が存在する」汎用記述と整合し、AUTOGEN 自動生成領域を編集していない。
    on_failure: >-
      fix-and-reverify を選択する。明記の追記または位置の修正後に突合を再実行でき、欠番無記録は検査導入後に機械検出の対象となる不備であるため。
  - id: TS-003
    target_item: AG-003
    verification: >-
      REQ 番号ギャップ検査の新規検査クラスを実行する。欠番無記録を模した違反例（欠番 063〜081 の README 明記を除去した状態）、正常例（明記済み現行状態）、境界例（AUTOGEN ブロック内の表記）を REQ-010-068 準拠の回帰テスト fixture として実行する。
    pass_criteria: >-
      違反例が検出され、現行状態（明記済み）が合格し、AUTOGEN 領域の誤検出が発生しない。回帰テストが検査クラスの追加とともに存在する。
    on_failure: >-
      fix-and-reverify を選択する。checker または fixture の修正後に再検証でき、検査の欠落は REQ-087-002 の不履行を残すため。

realization_actions:
  - id: RA-001
    concern: requirements/README.md と docs/README.md への 063〜081 意図的予約欠番の明記
    responsibility: numbering-policy の欠番明記義務（「欠番は各 README、索引類で『欠番』として明記」）の履行として、2つの README の本文（AUTOGEN 自動生成ブロック外）に 063〜081 の意図的予約欠番を明記する。
    ownership_hints:
      - docs/requirements/README.md（AUTOGEN req-active-table 外の本文。基準構造セクション付近）
      - docs/README.md（REQ 一覧表前の本文。「番号には欠番が存在する」汎用記述を補強）
      - docs/designs/integrity/index-auto-generation.md（AUTOGEN ブロックの正規所有。自動生成領域は編集しない）
      - docs/designs/foundations/numbering-policy.md（欠番明記義務の正規所有 Design）
    intent: Design と README 索引の記録整合により、欠番の実体不在を索引面でも説明可能にする。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: REQ 番号ギャップ検査の検査クラス追加（docs-check route）
    responsibility: max+1 採番規則と README 欠番明記の突合を新規検査クラスとして checker へ追加し、REQ-010-068 の回帰テスト義務に従う。REQ-010-070 の検査体系追加原則と整合させる。
    ownership_hints:
      - checker 実装: check_integrity.ts 系（docs-check 実行基盤、REQ-010 正規所有）
      - 新規 IR ルールファイル候補: docs/designs/integrity/rules/IR-*.md（integrity-rule-catalog.md へのカタログ登録、rule-ownership.md への所有登録を伴う）
      - 基盤 Design: docs/designs/integrity/checker-execution-contracts.md（検査クラス追加の基盤規則）、docs/designs/integrity/integrity-rule-catalog.md
      - 所有 REQ 行: REQ-010-068（回帰テスト義務）、REQ-010-070（検査体系追加の原則）
      - 突合先規則: docs/designs/foundations/numbering-policy.md（新規採番・既知の欠番）
    intent: 欠番無記録を機械検出し、今後の欠番発生時の README 明記漏れを再発防止する。
    verification_refs: [TS-003]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0034
    source_item: F-02-signal-ab
    disposition: covered
    reason_code: converted_to_design_update_and_new_req
    reason: max+1 からの逸脱に対する例外規定の不在と裁定採番の扱い規定の不在を、numbering-policy への例外規定追記（ACT-DESIGN-001）と REQ-087-001（REQ-087）で消化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0034.md
      section: Sources
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0034
    source_item: F-02-signal-c
    disposition: covered
    reason_code: converted_to_design_update_and_realization_action
    reason: 063〜081 欠番の明記欠落を、numbering-policy の既知の欠番への記録追記（ACT-DESIGN-002）と README 2件の明記（RA-001）で消化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0034.md
      section: Sources
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0034
    source_item: F-02-acceptance-check
    disposition: covered
    reason_code: converted_to_new_req_and_realization_action
    reason: REQ 番号ギャップ検査（route 候補 #2）を独立 route とせず、REQ-087-003（REQ-087）と RA-002 の検査クラス追加で本要件の受け入れ条件として消化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0034.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints:
    - RU-0033 と docs/designs/integrity/integrity-rule-catalog.md・rule-ownership.md・check_integrity.ts 系を共有編集するため、同一 Wave への並列配置を避けて直列化する。
result: {}
```

# summary

変更誘発境界リスクは、dependency（numbering-policy と index-auto-generation.md の自動生成領域との分離、REQ-082 前例との整合を確認済み）、client-server（決定的採番スクリプトを既定経路とし、例外を文書記録として Design に保持する分離を確認済み）、execution（README 明記を検査追加に前置する順序（検査の誤検出回避）を確認済み）、build-runtime（新規検査クラスの回帰テスト義務 REQ-010-068 と IR ルール化候補の配置（integrity/rules/、カタログ・所有登録を伴う）を確認済み）、environment-propagation（README と numbering-policy はリポジトリ内部文書であり配布物へ投影されないことを確認済み）の5観点すべてを確認した。採番例外・欠番明記・ギャップ検査は REQ 採番体系の記録整合という単一の関心群であり、REQ-087 新規 CREATE 3行と numbering-policy update 2節で構成し、SPLIT 要否: 不要。
