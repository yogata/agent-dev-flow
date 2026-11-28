---
draft_type: req_draft
topic_slug: issue-4230-antigravity-completion-condition-withdrawal
status: draft
created_at: "2026-11-28"
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  Epic #4227 の Wave 2 の子 Issue #4230（実行単位 OU-002、要件単位 RU-0307）について、利用者の判断（Issue #4230 の判断変更記録、質問6：案1）により Antigravity の実機確認を完了条件から外した再合意を記録する。完了条件 C1・C3・C4 は Codex について確認する条件へ置き換え、「検証に失敗した場合の扱い」の Antigravity の実機確認に関する箇条書きは、Antigravity の実機確認を Issue #4230 の合格判定に含めない内容へ置き換える。Antigravity は停止として動く設計と契約試験までを本期間の保証範囲とし、REQ-099-030・REQ-099-031 の Antigravity 分の未達は追跡Issue #4236 で管理する。REQ・Decision・Design の保存操作と実現面の変更はない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      対象は、Root Case である Epic #4227 の Wave 2 に属する子 Issue #4230（実行単位 OU-002、要件単位 RU-0307、対象 PR は PR #4235）の Definition 変更である。Antigravity の実機確認の未達は追跡Issue #4236 が管理する。本 draft は新規の要件定義ではなく、利用者が Issue #4230 の判断変更記録（コメント 7230496644）で確定した再合意内容を req-define の合意記録へ投影したものである。合意の内容は、同記録が転記した質問6 案1の原文「完了条件を変更する。Antigravity の実機確認を #4230 の完了条件から外し、Antigravity は停止として動く設計と契約試験までを本期間の保証範囲とする。実機確認は追跡Issueとして起票し、REQ-099-030・REQ-099-031 の Antigravity 分の未達はそこで管理する。#4230 は Codex 側の結果で完了判定して merge する。手順は req-define での再合意 → case-revise → case-ready → case-close。」であり、利用者の回答は「質問6：案1」である。採用の根拠はこの利用者の明示判断に限る。
  - id: AG-002
    content: |
      完了条件 C1 は、Antigravity 側の実機での確認を要求する部分を撤回し、Codex について確認する条件とする。Issue #4230 本文の C1 を次の文へ置き換える。「agentdev_gh の全操作が Codex で共通の操作契約により動き、操作前の承認と書込み後の読み戻しが維持されること（RU-0307 AC-1、REQ-099-023・REQ-099-035・REQ-011-001・REQ-011-005・REQ-052-012。検証方法: 操作カタログの全操作を Codex で呼び出す。読み戻しだけが失敗する状態も試す。agentdev_gh を参照する配布スキルを Codex で読み込む）」撤回するのは、条件本文の「Codex と Antigravity のそれぞれで」のうち Antigravity 側、検証方法の「両ホストで呼び出す」のうち Antigravity 側、および「新ホストで読み込む」のうち Antigravity 側である。括弧内の RU・REQ の参照は撤回しない。
  - id: AG-003
    content: |
      完了条件 C3 は Antigravity 側を撤回し、Codex のホストについて確認する条件とする。Issue #4230 本文の C3 を次の文へ置き換える。「Codex のホストで、Release を含む全公開ワークフローと必要な内部工程を完走できること（RU-0307 AC-1、REQ-099-030・REQ-099-024・REQ-099-025。検証方法: 全公開ワークフローと必要な内部工程を通しで実行し、工程ごとに完走、未完走、未実施を記録する。OpenCode を選ばない導入でも実行する）」撤回するのは、条件本文の「Codex と Antigravity の各ホストで」のうち Antigravity 側と、検証方法の「Antigravity は利用者の確認として記録し、実行担当は代行しない。」である。括弧内の RU・REQ の参照は撤回しない。REQ-099-030 の Antigravity 分は未達のままであり、AG-006 のとおり追跡Issue #4236 で管理する。
  - id: AG-004
    content: |
      完了条件 C4 は Antigravity 側を撤回し、Codex のホストについて確認する条件とする。Issue #4230 本文の C4 を次の文へ置き換える。「Codex のホストで、Release の草稿作成、読み戻し、利用者の明示承認後の公開、公開結果の読み戻しが確認できること（RU-0307 AC-2、REQ-099-031。検証方法: Release の草稿作成から公開結果の読み戻しまでを通しで実行する）」撤回するのは、条件本文の「Codex と Antigravity の各ホストで」のうち Antigravity 側である。括弧内の RU・REQ の参照は撤回しない。REQ-099-031 の Antigravity 分は未達のままであり、AG-006 のとおり追跡Issue #4236 で管理する。
  - id: AG-005
    content: |
      「検証に失敗した場合の扱い」の Antigravity の実機確認に関する箇条書きは、Antigravity の実機確認を Issue #4230 の合格判定に含める部分を撤回し、Issue #4230 本文の当該箇条書きを次の文へ置き換える。「Antigravity の実機確認を利用者が行っていない場合は確認待ちとして記録し、実証済みとしない。Antigravity の実機確認は本 Issue の合格判定に含めない。Antigravity は停止として動く設計と契約試験までを本期間の保証範囲とする。実機確認は追跡Issue #4236 で管理し、REQ-099-030・REQ-099-031 の Antigravity 分の未達はそこで管理する。本 Issue は Codex 側の結果で完了判定して merge する。」撤回するのは「未確認の工程は未実施として合格に含めない。」である。「確認待ちとして記録し、実証済みとしない。」の部分は、未確認の Antigravity の能力を実証済みとしないこと（REQ-099-024）を本文で支える記録の規則であり、撤回しない。同節の他の箇条書き（完了条件に失敗した場合の再検証、対象外の作業の扱い）は変更しない。
  - id: AG-006
    content: |
      本合意で変更しないものは次のとおりである。(1) 未確認の Antigravity の能力を実証済みとしないこと（REQ-099-024）。(2) REQ-099-030・REQ-099-031 の要件本文。Antigravity 分の未達は未達のままであり、追跡Issue #4236 で管理する（起票済み）。本 draft は追跡Issue #4236 を参照するのみで、同 Issue の起票と本文の変更を合意内容に含めない。(3) 完了条件 C2・C5〜C10、「再判断しない合意済み事項」、「実現面の変更方針」。(4) Epic #4227 の完了条件。Issue #4230 本文の更新範囲は AG-002〜AG-005 の置換対象（完了条件 C1・C3・C4 と「検証に失敗した場合の扱い」の当該箇条書き）に限り、目的、対象範囲・対象外、実現方針、関連 Decision・Design などそれ以外の記述は変更しない。
  - id: AG-007
    content: |
      本合意に伴う REQ・Decision・Design の保存操作はない。判断変更記録は Issue #4230 の本文の撤回対象だけを挙げており、正規成果物の変更を求めていない。変更するのは Issue #4230 の完了条件と合格判定の扱いであり、REQ-099-030・REQ-099-031 の要件本文は保持する。Design（docs/designs/foundations/multi-host-canonical-model.md の「Codex・Antigravity の GitHub 接続と保証範囲」節と「新ホスト対応の検証」節）と DEC-071 は、未確認の能力を実証済みとせず Antigravity の実機検証は利用者が行うこと、新ホストの対応をホスト単位で判定することを定めており、本合意と矛盾しない。REQ 操作の照合分類は「変更不要（REQ操作なし）」であり、artifact_actions と operation_units は空とする。Decision の対象はない。技術的決定を含まない仕様変更であり、利用者の合意事項の記録であるためである。実現面の変更もない（「実現面の変更方針」は撤回しない）。Issue の階層と実行構成は、Root Case が Epic #4227、対象が子 Issue #4230（Wave 2、OU-002）である現状のまま識別情報として引き継ぎ、本 draft から新規の Issue や Epic は起こさない。

artifact_actions: []

conflict_resolutions:
  - id: CR-001
    conflict: |
      Issue #4230 の完了条件 C1・C3・C4 と「検証に失敗した場合の扱い」は Antigravity 側の実機確認を合格判定に含める。Antigravity 側を実施しない限り Issue #4230 は完了できず、PR #4235 は merge できない（Issue #4230 のコメント 7229917000「理由・根拠」）。
    resolution: |
      利用者の判断（質問6：案1。Issue #4230 のコメント 7229917000 に選択肢、コメント 7230496644 に回答の受領を記録）により、完了条件を変更する。Antigravity の実機確認を Issue #4230 の完了条件から外し、Antigravity は停止として動く設計と契約試験までを本期間の保証範囲とする。実機確認は追跡Issue #4236 で管理し、Issue #4230 は Codex 側の結果で完了判定して merge する。後続コマンドはこの内容を利用者へ再確認しない。
  - id: CR-002
    conflict: |
      Issue #4230 を完了させることと、未確認の Antigravity の能力を実証済みとしないこと（REQ-099-024）を両立させる必要がある。
    resolution: |
      実証済みとしない規定は撤回しない。REQ-099-030・REQ-099-031 の Antigravity 分は未達のままとし、追跡Issue #4236 で管理する（Issue #4230 のコメント 7230496644「理由・根拠」と「撤回しないもの」）。後続コマンドはこの内容を利用者へ再確認しない。

operation_units: []

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-revise の受入確認で、本 draft の合意内容（AG-001〜AG-007）を Issue #4230 の判断変更記録（コメント 7230496644）と照合する。あわせて Custom Tool agentdev_gh の issue_read で Issue #4230 と Epic #4227 の本文を読み、識別情報を確かめる。Issue #4230 の本文が「親Epic: #4227」と「実行単位は OU-002（要件単位 RU-0307）で、Wave 2 に実行する」を含むこと、Epic #4227 の実行構成が Issue #4230 を Wave 2 の子 Issue として挙げることを確認する。
    pass_criteria: |
      合意内容が判断変更記録の質問6 案1、撤回対象、撤回しないものの各項目と一致すること。Root Case が Epic #4227、対象 Issue が Issue #4230、実行単位が OU-002、要件単位が RU-0307、追跡Issue が Issue #4236 であることが Issue 本文と一致すること。
    on_failure: |
      fix-and-reverify。合意内容が記録と一致しない場合や識別情報が一致しない場合は、case-revise は受入せず req-define へ差し戻す。draft を修正した後で受入確認を再実行する。実装の修正や作業範囲外の記録ではなく draft の修正を選んだのは、不一致の原因が合意記録の投影側にあるからである。
  - id: TS-002
    target_item: AG-002
    verification: |
      case-revise が Issue #4230 の本文を更新した後、Custom Tool agentdev_gh の issue_read で本文を読み戻し、完了条件 C1 の全文を AG-002 の置換文と照合する。
    pass_criteria: |
      C1 が AG-002 の置換文と一致すること。C1 の条件本文と検証方法のいずれにも Antigravity を確認対象とする語が残っていないこと。括弧内の参照（RU-0307 AC-1、REQ-099-023・REQ-099-035・REQ-011-001・REQ-011-005・REQ-052-012）が維持されていること。
    on_failure: |
      fix-and-reverify。不一致や Antigravity 側の記述の残存を検出した場合は、case-revise の Issue 本文更新を修正し、読み戻しを再実行する。完了条件は合意済みの置換文と一致すべきであり、その不一致は作業範囲外の記録ではなく修正の対象であるためである。
  - id: TS-003
    target_item: AG-003
    verification: |
      読み戻した Issue #4230 の本文で、完了条件 C3 の全文を AG-003 の置換文と照合する。
    pass_criteria: |
      C3 が AG-003 の置換文と一致すること。検証方法の「Antigravity は利用者の確認として記録し、実行担当は代行しない。」が残っていないこと。括弧内の参照（RU-0307 AC-1、REQ-099-030・REQ-099-024・REQ-099-025）が維持されていること。
    on_failure: |
      fix-and-reverify。不一致や Antigravity 側の記述の残存を検出した場合は、case-revise の Issue 本文更新を修正し、読み戻しを再実行する。完了条件は合意済みの置換文と一致すべきであり、その不一致は作業範囲外の記録ではなく修正の対象であるためである。
  - id: TS-004
    target_item: AG-004
    verification: |
      読み戻した Issue #4230 の本文で、完了条件 C4 の全文を AG-004 の置換文と照合する。
    pass_criteria: |
      C4 が AG-004 の置換文と一致すること。括弧内の参照（RU-0307 AC-2、REQ-099-031）が維持されていること。
    on_failure: |
      fix-and-reverify。不一致を検出した場合は、case-revise の Issue 本文更新を修正し、読み戻しを再実行する。完了条件は合意済みの置換文と一致すべきであり、その不一致は作業範囲外の記録ではなく修正の対象であるためである。
  - id: TS-005
    target_item: AG-005
    verification: |
      読み戻した Issue #4230 の本文で、「検証に失敗した場合の扱い」の Antigravity の実機確認に関する箇条書きを AG-005 の置換文と照合する。
    pass_criteria: |
      当該箇条書きが AG-005 の置換文と一致すること。「未確認の工程は未実施として合格に含めない。」が残っていないこと。「確認待ちとして記録し、実証済みとしない。」が維持されていること。追跡Issue #4236 と REQ-099-030・REQ-099-031 の Antigravity 分の未達の管理先が本文に記されていること。同節の他の箇条書きが変更されていないこと。
    on_failure: |
      fix-and-reverify。不一致を検出した場合は、case-revise の Issue 本文更新を修正し、読み戻しを再実行する。合格判定の扱いは合意済みの置換文と一致すべきであり、その不一致は作業範囲外の記録ではなく修正の対象であるためである。
  - id: TS-006
    target_item: AG-006
    verification: |
      読み戻した Issue #4230 の本文を、case-revise が更新前に issue_read で取得した本文と比較する。完了条件 C2・C5〜C10、「再判断しない合意済み事項」、「実現面の変更方針」、目的、対象範囲・対象外、実現方針、関連 Decision・Design が更新前と一致することを確認する。あわせて issue_read で追跡Issue #4236 を読み、Antigravity の実機確認の未達を管理対象とし、REQ-099-030・REQ-099-031 を参照していることを確認する。
    pass_criteria: |
      上記の記述が更新前と一致すること。追跡Issue #4236 が Antigravity の実機確認の未達を管理対象として記載し、REQ-099-030・REQ-099-031 を参照していること。
    on_failure: |
      fix-and-reverify。Issue #4230 の本文に過不足がある場合は case-revise の Issue 本文更新を修正し、読み戻しを再実行する。追跡Issue #4236 に管理対象の記載がない場合は Findings に記録する。本 draft は追跡Issue の起票や編集を合意内容に含めないため、case-revise は追跡Issue を新規に作成しない。
  - id: TS-007
    target_item: AG-007
    verification: |
      case-revise の実変更判定で、canonical Definition（docs の REQ・Decision・Design と Issue / Epic 構造）と本 draft の差分を比較する。artifact_actions と operation_units が空であることに基づき、docs 永続文書に差分が生じないこと、設計修正PR が作成されないこと、新規の Issue・Epic が起票されないことを確認する。
    pass_criteria: |
      docs/requirements、docs/decisions、docs/designs に差分がないこと。definition-amend ブランチの設計修正PR が作成されないこと。本 draft に由来する新規の Issue・Epic・追跡Issue がないこと。
    on_failure: |
      差分または設計修正PR の作成を検出した場合は case-revise を停止し、req-define へ差し戻す。原因を修正した後で実変更判定を再実行する。正規成果物の保存を伴う解釈の相違は Definition の意味判断であり、実装の修正や作業範囲外の記録では処理できないためである。

realization_actions: []

review_dispositions:
  - id: RD-001
    source_item: issue-4230-comment-7229917000-q6-alt2
    disposition: rejected
    reason_code: superseded_by
    reason: |
      質問6 の案2（完了条件を維持し、Antigravity の実機確認を利用者が行うまで Issue #4230 を停止し、PR #4235 を merge しない）は、利用者が案1を選んだ（「質問6：案1」）ため採用しない。根拠は Issue #4230 のコメント 7229917000（質問6 の選択肢）とコメント 7230496644（利用者の回答の受領）である。
    evidence:
      path: null
      section: "Issue #4230 コメント 7229917000・7230496644"
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: issue-4230-comment-7229917000-q7-alt1
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      質問7（隔離検証リポジトリで Release を1件公開することへの承認）は Issue #4230 の C4 を確認するための操作の承認であり、完了条件・検証条件・正規成果物を変更しない。Definition の構成要素ではないため、本 draft の合意内容には含めない。承認の記録は Issue #4230 のコメント 7230496644 が保持する。
    evidence:
      path: null
      section: "Issue #4230 コメント 7229917000・7230496644"
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: issue-4230-comment-7230496644-retained-req-099-024
    disposition: covered
    reason_code: already_satisfied
    reason: |
      「未確認の Antigravity の能力を実証済みとしないこと」は既存の要件行 REQ-099-024 が保持しており、保存操作は不要である。Issue #4230 本文の「検証に失敗した場合の扱い」では「確認待ちとして記録し、実証済みとしない。」の部分を維持する（AG-005）。
    evidence:
      path: docs/requirements/REQ-099.md
      section: REQ-099-024
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_item: issue-4230-comment-7230496644-retained-req-099-030
    disposition: covered
    reason_code: already_satisfied
    reason: |
      REQ-099-030 の要件本文は撤回しない。既存行をそのまま保持し、保存操作は不要である。Codex 分は変更後の Issue #4230 の完了条件 C3 で確認し、Antigravity 分は未達のままで追跡Issue #4236 で管理する（AG-003、AG-006）。
    evidence:
      path: docs/requirements/REQ-099.md
      section: REQ-099-030
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_item: issue-4230-comment-7230496644-retained-req-099-031
    disposition: covered
    reason_code: already_satisfied
    reason: |
      REQ-099-031 の要件本文は撤回しない。既存行をそのまま保持し、保存操作は不要である。Codex 分は変更後の Issue #4230 の完了条件 C4 で確認し、Antigravity 分は未達のままで追跡Issue #4236 で管理する（AG-004、AG-006）。
    evidence:
      path: docs/requirements/REQ-099.md
      section: REQ-099-031
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
```

# summary

- 対象: Root Case である Epic #4227 の Wave 2 の子 Issue #4230（実行単位 OU-002、要件単位 RU-0307、PR #4235）。Antigravity の実機確認の未達は追跡Issue #4236 が管理する。
- 合意内容: 完了条件 C1・C3・C4 の Antigravity 側と、「検証に失敗した場合の扱い」の Antigravity の実機確認を合格判定に含める部分を撤回する。置換文は draft-data の AG-002〜AG-005 に記す。採用根拠は Issue #4230 の判断変更記録（コメント 7230496644）における利用者の判断（質問6：案1）である。
- 変更しないもの: REQ-099-030・REQ-099-031 の要件本文、未確認の Antigravity の能力を実証済みとしないこと（REQ-099-024）、完了条件 C2・C5〜C10、「再判断しない合意済み事項」、「実現面の変更方針」、Epic #4227 の完了条件（AG-006）。
- 正規成果物への保存操作なし: REQ・Decision・Design の保存操作と実現面の変更はない（AG-007。artifact_actions、operation_units、realization_actions は空）。反映は case-revise による Issue #4230 本文の更新で行う。
- 次のコマンド: /agentdev/case-auto（対象は Issue #4230。例外経路 case-revise → case-ready で反映する）。

## 変更誘発境界リスク分析（5観点）

変更差分は Issue #4230 の本文（完了条件 C1・C3・C4 と「検証に失敗した場合の扱い」の箇条書き1件）に限る。

| 観点 | 確認結果 | test strategy |
|---|---|---|
| dependency boundary（依存境界） | モジュール、参照方向、依存先の公開 API の変化はない。REQ-099-030・REQ-099-031 の Antigravity 分の未達の管理先が Issue #4230 から追跡Issue #4236 へ移るため、追跡Issue が当該要件行を参照していることを確認する | TS-006 |
| client/server boundary | API 契約、入出力形式、I/O 境界接続の変化はない。case-specific risk なし | なし |
| execution boundary（実行境界） | Issue #4230 の完了判定が Antigravity 側の実機確認に依存しない判定へ変わる。更新後の本文に Antigravity 側の確認を完了判定へ含める記述が残ると、判定が停止するか、Antigravity を実証済みとして扱う恐れがある | TS-002〜TS-005 |
| build/runtime boundary | 検証構成、実行時パッケージ構成の変化はない。case-specific risk なし | なし |
| environment propagation boundary | link/junction 投影、環境変数、OS 依存の変化はない。case-specific risk なし | なし |
