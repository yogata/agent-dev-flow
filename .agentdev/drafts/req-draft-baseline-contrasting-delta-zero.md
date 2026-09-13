---
draft_type: req_draft
topic_slug: baseline-contrasting-delta-zero
status: saved
created_at: 2026-09-14T05:32:09+09:00
source_rus:
  - RU-0004
---

<!-- req_draft 確定版（STEP-6/7 反映、STEP-8 adversarial-review 実施済み・findings 反映済み、STEP-9 保存）。status: draft は後続工程（req-save/design-save/case-open）参照用。 -->

# draft-data

```yaml
work_type: maintenance

scale:

summary: baseline 未整備環境（worktree、新環境等）では NG baseline 保持型 gate/checker が既存違反を新規違反と区別できず failure 化するため、同一 detector・同一引数を remediation 開始前 baseline commit と変更 HEAD で同一環境再実行し同一 signature を確認して新規違反 delta 0 を実証して合格扱いとする判定手順（対照実行）を検証契約として標準化する。REQ-007 への APPEND（REQ-007-010）、Design は integrity-contracts.md（判定手順本体）と checker-execution-contracts.md（実行契約）へ追記し、distribution-boundary.md はクロスリファレンスのみ。baseline 整備自体（IR-059）と checker 実装変更は対象外。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: baseline 未整備環境での gate 実行時、NG baseline 保持型 checker が既存違反を新規違反と区別できず failure 化する問題に対し、対照実行（同一 detector・同一引数を remediation 開始前の baseline commit（main HEAD、PR 変更未適用）と変更 HEAD（worktree）で同一環境再実行し、同一 signature を確認して新規違反 delta 0 を実証して合格扱いとする）の判定手順を検証契約として標準化する。baseline policy（baseline 超過分のみ gate 失敗）に準拠する。本判定は baseline 未整備環境に限定し（判定基準: 検出事項が NG baseline に未登録、または NG baseline ファイル自体の不在）、baseline 整備済み環境では通常の baseline 比較を用いる。case 2787 の2系統（(a) check_distribution_boundary.ts --profile source の baseline 不在時 delta 計算不能による既存 violation の ok: false 報告、(b) worktree self-sync 適用後の走査対象切替による既知 NG の新規 unmanaged NG 顕在化）を契機として確立済みの手順の契約化である
  - id: AG-002
    content: 判定根拠（baseline policy 準拠）を記録形式に含める。対照実行による合格判定の記録形式として、対照実行の実施記録（detector、引数、両 HEAD の識別子）、同一 signature 確認結果と delta 0 実証の証跡、実行環境ラベル（両実行が同一環境であることの根拠）、baseline policy 準拠の判定根拠を契約化し、検証記録から対照実行の実施と delta 0 実証を追跡可能にする。REQ-007-008 の検証環境記録・由来分類証跡と矛盾しない
  - id: AG-003
    content: 対照実行は detached worktree を使う（stash 往復リスク回避の既存規約に従う）。既存手順: agentdev-git-worktree references/worktree-operations.md「detached worktree による baseline 比較（標準手順）」。worktree-operations.md の baseline 比較手順と矛盾しない
  - id: AG-004
    content: delta 0 実証は同一環境での再実行に基づく（異なる環境間の結果比較で代替しない）。環境ラベル（worktree/main、junction 伝播状態、依存パッケージ状態）が一致しない実行間の結果比較は delta 0 の証拠として採用しない
  - id: AG-005
    content: 対象外: baseline ファイルの整備自体（IR-059 baseline 整備は別課題）、checker 実装の変更。対照実行手順の恒久化は baseline 整備の代替を意図するものではない

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-007.md
    source_items: [AG-001, AG-002, AG-004]
    content: |
      REQ-007 要件テーブルへ次の行を追加する:
      | REQ-007-010 | NG baseline 保持型 gate/checker を baseline 未整備環境（検出事項が NG baseline に未登録、または NG baseline ファイル自体が不在の環境）で実行した場合、対照実行（同一 detector・同一引数を remediation 開始前の baseline commit と変更 HEAD で同一環境にて再実行し、検出 signature の同一性を確認）により新規違反 delta 0 を実証したときは合格の根拠とできること。判定根拠（baseline policy 準拠、対照実行条件、検証環境記録）を合格記録に含めること。baseline 未整備環境以外では本判定を行わないこと |

      適用範囲の「対象」へ「baseline 未整備環境での対照実行による合格判定」を追記する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/integrity/integrity-contracts.md
    target_area:
      anchor: "### NG baseline エントリの現行維持"
      placement: after_anchor
    source_items: [AG-001, AG-002, AG-004, AG-005]
    content: |
      ### baseline 未整備環境での対照実行による合格判定

      NG baseline 保持型 checker を baseline 未整備環境で実行した場合は、次の対照実行手順により合格判定できる。baseline 未整備環境の判定基準は、検出事項が NG baseline に未登録であること、または NG baseline ファイル自体が不在であることとする。

      1. 対照実行: 同一 detector・同一引数を、remediation 開始前の baseline commit（main HEAD、PR 変更未適用）と変更 HEAD（worktree）で同一環境にて再実行する
      2. 同一 signature 確認: 両実行の検出事項について signature（同一 detector が同一検出対象へ産出する検出識別子。具体定義は各 detector の検出契約が所有する）単位の一致を確認する
      3. delta 0 実証: 変更 HEAD の検出事項が baseline commit 側検出事項の部分集合であること（新規違反 delta 0）を実証する
      4. 判定: baseline policy（baseline 超過分のみ gate 失敗）に準拠し、新規違反 delta 0 を実証した場合は合格扱いとする

      判定根拠の記録形式:

      - 対照実行の実施記録（detector、引数、両 HEAD の識別子）
      - 同一 signature 確認結果と delta 0 実証の証跡
      - 実行環境ラベル（checker 実行契約の環境ラベル契約に従う。両実行が同一環境であることの根拠）
      - baseline policy 準拠の判定根拠

      制約:

      - delta 0 実証は同一環境での再実行に基づく。異なる環境間の結果比較で代替しない。環境ラベル（worktree/main、junction 伝播状態、依存パッケージ状態）が一致しない実行間の比較は delta 0 の証拠として採用しない
      - 対照実行の main HEAD 側実行は detached worktree を使う（stash 往復リスク回避の既存規約。worktree 汎用手順の baseline 比較手順に従う）
      - 本判定は baseline 未整備環境に限定する。baseline 整備済み環境では通常の baseline 比較を用い、本手順を適用しない
      - baseline ファイルの整備自体（IR-059 baseline 整備）は別課題であり、本手順はその代替を恒久化するものではない
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area:
      anchor: "### worktree 環境での checker 実行 fallback"
      placement: after_anchor
    source_items: [AG-003, AG-004]
    content: |
      ### baseline 未整備環境での対照実行の実行契約

      baseline 未整備環境での gate 実行に伴う対照実行（同一 detector・同一引数を baseline commit と変更 HEAD で同一環境再実行）の判定手順と記録形式は、NG baseline 運用手順（integrity-contracts.md「baseline 未整備環境での対照実行による合格判定」）が正規所有する。本 Design は実行面の次の事項のみを所有する。

      - 対照実行の両系統（baseline commit 側・変更 HEAD 側）の実行は、本 Design の checker 共通実行契約と worktree 検査対象 checker の起動契約（host 側起点、repoRoot 明示指定、読取専用）に従う
      - 両系統の実行には環境ラベルを必ず付す。環境ラベルが一致しない実行間の結果比較は delta 0 の証拠として採用しない（同一環境再実行の要求）
      - baseline commit 側の実行は detached worktree（worktree 汎用手順の baseline 比較手順）で行い、作業中 worktree の stash 往復を行わない
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/integrity/distribution-boundary.md
    target_area:
      anchor: "### concrete-id ベースライン再取得手順"
      placement: after_anchor
    source_items: [AG-001]
    content: |
      baseline 未整備環境で concrete-id 検出を伴う gate を実行する場合の対照実行による合格判定（新規違反 delta 0 実証）の判定手順は、NG baseline 運用手順（integrity-contracts.md）が正規所有する。本 Design は判定手順を複製せず、参照に留める。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0004 の反映先記述（distribution-boundary.md の baseline policy 節）と docs 実態の乖離。distribution-boundary.md に baseline policy 節は存在せず、NG baseline 運用の正規所有は integrity-contracts.md「NG baseline 運用手順」節、checker 実行契約・環境ラベル契約は checker-execution-contracts.md が所有
    resolution: ユーザー確定（UQ-002）。Design 反映先を integrity-contracts.md（判定手順本体）+ checker-execution-contracts.md（実行契約）へ修正し、distribution-boundary.md はクロスリファレンス追記のみとする。正規所有宣言に基づく機械的解決
  - id: CR-002
    conflict: DEC-014 決定5（検査エラーはすべて gate-not-passed として扱う。clean として通過させない）と対照実行による合格判定の関係
    resolution: 非衝突。対照実行は baseline 不在による delta 計算不能（検査エラー）を判定可能にする実行手段の補完であり、検査エラーや違反を clean 扱いにするものではない。delta 0 が実証できない場合は fail のまま（gate-not-passed 維持）。REQ-007-006「未登録の既知欠陥と由来不明の fail を合格の根拠にしない」とも整合する（対照実行証跡により fail の由来が「既知欠陥（baseline commit 由来）」へ分類され、由来不明ではなくなる）

operation_units:
  - ou_id: OU-001
    source_ru: RU-0004
    target_req: REQ-007
    target_design: docs/designs/integrity/integrity-contracts.md
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
      integrity-contracts.md「NG baseline 運用手順」節配下に (1) 対照実行の定義（同一 detector・同一引数、baseline commit と変更 HEAD、同一環境再実行）、(2) 同一 signature 確認、(3) 新規違反 delta 0 実証による合格扱い、(4) baseline policy 準拠、(5) baseline 未整備環境への限定条件の5要素が追記されていることを確認する。参照先セクション・節見出しの実在（integrity-contracts.md、worktree-operations.md）を含む。同時に、checker-execution-contracts.md への追記が実行面（起動契約、環境ラベル、detached worktree）に限定され、判定手順本体を重複所有していないことを確認する
    pass_criteria: |
      5要素が全て追記されている。判定手順が baseline 未整備環境に限定されている。3 Design 間の役割分担（本体: integrity-contracts、実行: checker-execution-contracts、参照: distribution-boundary）が明確で、所有権の曖昧化する重複記載がない
    on_failure: |
      fix-and-reverify。契約文書の追記漏れ・誤記・重複所有は保存工程で修正して再検証する（文書変更が主のため修正コストは低く、再検証で確実に解消できる）
  - id: TS-002
    target_item: AG-002
    verification: |
      追記された判定手順に判定根拠の記録形式（対照実行の実施記録、同一 signature 確認結果と delta 0 実証の証跡、実行環境ラベル、baseline policy 準拠の根拠）が含まれることを確認する。REQ-007-008（検証環境と fail 全件の由来分類証跡を含める）および checker 実行契約の環境ラベル契約と矛盾しないことを確認する
    pass_criteria: |
      記録形式が判定手順と一体で規定され、REQ-007-008 および環境ラベル契約と矛盾しない。検証記録から対照実行の実施と delta 0 実証が追跡可能な形式である
    on_failure: |
      fix-and-reverify。記録形式の欠落・矛盾は保存工程で修正して再検証する
  - id: TS-003
    target_item: AG-003
    verification: |
      追記内容（integrity-contracts.md、checker-execution-contracts.md 両方）が worktree 汎用手順（worktree-operations.md「detached worktree による baseline 比較（標準手順）」）と矛盾しないことを確認する。stash ではなく detached worktree を使う旨が既存規約と一致していること
    pass_criteria: |
      対照実行の baseline 側実行が detached worktree を使用し、worktree-operations.md の手順と重複・矛盾なく整合している。stash 往復を要求しない
    on_failure: |
      fix-and-reverify。既存規約との不整合は保存工程で修正して再検証する
  - id: TS-004
    target_item: AG-004
    verification: |
      追記された判定手順に (1) delta 0 実証は同一環境での再実行に基づく旨、(2) 環境ラベルが一致しない実行間の比較を delta 0 の証拠として採用しない旨、が含まれることを確認する。環境ラベルの項目（worktree/main、junction 伝播状態、依存パッケージ状態）が checker 実行契約の環境ラベル契約と一致していることを確認する
    pass_criteria: |
      同一環境再実行の要求と環境ラベル一致要求が判定手順と実行契約の双方に整合して含まれる。異なる環境間の結果比較による代替を明示的に禁止している
    on_failure: |
      fix-and-reverify。環境差による無効な delta 比較を許容する記述は保存工程で修正して再検証する
  - id: TS-005
    target_item: AG-005
    verification: |
      baseline 整備自体（IR-059 別課題）と checker 実装変更が対象外として Design 追記内容に明示されていることを確認する。対照実行手順が baseline 整備の代替を恒久化するものではない旨が含まれることを確認する
    pass_criteria: |
      対象外の明示と代替恒久化ではない旨が Design 追記内容に含まれる
    on_failure: |
      fix-and-reverify。対象外の明示漏れは保存工程で追記して再検証する

realization_actions: []

review_dispositions:
  - id: RD-001
    source_ru: RU-0004
    source_item: 判定手順の契約化（要件化の方向 1〜5、受け入れ条件）
    disposition: covered
    reason_code: contract_standardization
    reason: |
      RU-0004 の要件化の方向 5項目と受け入れ条件（判定手順の文書化、判定根拠の記録形式含有、detached worktree 既存手順との非矛盾）は AG-001〜AG-005 として全て取り込む。baseline 整備（IR-059）と checker 実装変更は RU 自身が対象外として明示しており範囲外として扱う
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 要件化の方向 / 受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

RU-0004（learning 由来、backlog-review 生成、case 2787 で実証済みの手順の契約化）を入力として要件定義した。ユーザー確定済みの反映先: REQ-007 へ APPEND（REQ-007-010 新設）、Design は integrity-contracts.md（判定手順本体、NG baseline 運用手順節配下）と checker-execution-contracts.md（実行契約）へ追記、distribution-boundary.md はクロスリファレンスのみ（CR-001）。

work_type: maintenance（既存検証契約への判定手順追記という保守的拡張）。Decision 不要（CR-002 に DEC-014 決定5 との非衝突根拠を記録）。変更誘発境界リスク分析（dependency / execution / environment propagation の3観点で risk 導出、client/server・build/runtime は該当なし）は TS-001/004/005 へ投影済み。

adversarial-review 実施済み（2 stream: gate 厳格性 / 契約整合性。convergence audit 収束）。accepted findings 3件を反映: (1) 「baseline 保持型」→「NG baseline 保持型」への用語統一と baseline 未整備環境の判定基準明記（濫用経路の閉鎖）、(2) signature の最小限の意味規定と detector 契約への委譲明記、(3) distribution-boundary.md 文面の指示明確化。撤回: 純減の扱い（REQ-007-009 と整合）、同一引数の検証（記録形式で担保済み）。

前世代 RU-0004 の反映痕跡に注意: checker-execution-contracts.md 冒頭（RU-0004 と RU-0007 の連携注記）と「対象外」節（extractYamlField、ユーザー決定 2026-09-04）の RU-0004 言及は前世代 RU のものであり、本世代 RU-0004（generated_at: 2026-09-13）とは別物。Design 反映時に混同しないこと。
