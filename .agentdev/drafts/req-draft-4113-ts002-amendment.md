---
draft_type: req_draft
topic_slug: 4113-ts002-amendment
status: draft
created_at: "2026-11-16T13:36:22Z"
source_rus: []
---

<!-- req_draft テンプレート（src/common/commands/agentdev/templates/req-define/req-draft.md）準拠。
Root Case #4113（open・正規状態 ready・maintenance）Definition の再合意変更 draft。
例外経路（case-revise → case-ready）の入力。
draft 内の TS-001〜TS-003 は本 draft の test_strategy 識別子であり、Root Case #4113 の完了条件 TS-001〜TS-004 とは別体系である。 -->

# draft-data

```yaml
work_type: docs_chore
# work_type 判定根拠: 変更対象は正規文書 docs/decisions/DEC-063.md の誤記訂正 2 箇所と Root Case #4113 完了条件 TS-002 の文言訂正のみで、動作・機能・配布物・実装コードの変更を伴わない。既存 accepted Decision の訂正であり新規 Decision 不要・feature 昇格条件にも該当しない
scale: standard
# scale 判定根拠: 単一 Decision の局所置換 2 箇所と完了条件 1 条の訂正。単一 Issue 相当の差分規模

summary: >-
  Root Case #4113（分割③ CI 日次定期実行の撤去と撤回判断の記録）完了条件 TS-002 の内在矛盾
  （撤回判断記録自身が cron を含むため全追跡ファイル 0 件が達成不能）を、2026-11-16 の利用者明示指示に基づき
  正規手順で訂正する draft。TS-002 は .github 配下の GitHub Actions 定期実行設定の不在確認へ訂正し、
  全追跡ファイル対象の git grep はヒットが撤回判断記録等の記述のみであることを確認する証跡へ位置づける。
  DEC-063 の背景節・影響節の虚偽主張（追跡対象全体で cron の出現や cron を含むファイルが当該 workflow のみ・0 件）を
  経緯の事実を維持した形で訂正する。削除対象 2 ファイルの削除方針と撤回判断記録（status: accepted・履歴記録）は
  保全する。具体的検証文言は監督判断で確定され、要件確認条件の文言を利用者が承認したとは記録しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

important_change_notice:
  notified_before_save: true
  notified_at: "2026-11-16T13:36:22Z"
  notified_content: >-
    既存正規成果物への重要変更（DEC-063 背景・影響 2 箇所の本文訂正と Root Case #4113 完了条件 TS-002 の文言訂正）について、
    変更する理由・変更内容・想定される影響・確定事項と監督判断事項をドラフト保存より前に実行出力へ通知した。
    追加通知: 2026-11-16 実測（git grep・main HEAD 395e698e0）で削除対象 workflow
    （.github/workflows/integrity-suite-split3-windows.yml）が現時点で main working tree に存在すること
    （削除は .worktrees/4113-refactor のステージ済み変更として保全）を確認し、訂正後 TS-002 の主検証
    （.github 配下の不在確認）は workflow 削除 merge 後に成立することを通知に含めた。
  adversarial_review: skip
  adversarial_review_reason: >-
    STEP-8 を skip した。入力は利用者の明示指示が確定済み（未決事項 0 件・未解決衝突 0 件）であり、
    本 draft は確定内容の構造化を目的とする。

agreed_items:
  - id: AG-001
    content: |
      TS-002 検証義務の訂正（Root Case #4113 完了条件・case-revise が Case Issue 本文へ適用する）。
      訂正前: 「TS-002: cron を含むファイルが 0 件（検証方法: grep -rn "cron" .github/ と git grep -n "cron" を実行。合格条件: 両検索のヒット 0件、検索コマンドと出力の証跡残存）」
      訂正後（確定文）: 「TS-002: .github 配下に GitHub Actions 定期実行設定（cron schedule）が存在しないこと。あわせて全追跡ファイル対象の git grep のヒットが撤回判断記録等の記述のみであることを確認する証跡を取得する（検証方法: grep -rn "cron" .github/ を実行し、.github/ 配下のヒット 0件〔GitHub Actions 定期実行設定の不在〕と検索コマンド・出力の証跡残存を確認する。全追跡ファイル対象の git grep -n "cron" は、ヒットが撤回判断記録（DEC-063）およびそのインデックス記述等の記述のみであることを確認する証跡として実行し、ヒット内容の確認記録を残す。追跡対象全体で cron を含むファイルが 0件であることの証明は検証義務に含めない）」
      採用根拠: 利用者の明示指示（2026-11-16: TS-002 の矛盾を正規手順で訂正・撤回記録は保全・.github の定期実行設定の不在を確認する方法へ）。
      変更しない内容: 削除対象 2 ファイル（.github/workflows/integrity-suite-split3-windows.yml・.github/integrity-split3-fail-baseline.json）の削除方針。本項目は検証条件の訂正のみを含む。
  - id: AG-002
    content: |
      DEC-063 背景節 41 行目の訂正。
      訂正前: 「- 削除時点の実測: 追跡対象ファイル全体で cron の出現は当該 workflow のみ（git grep 実測 2 行）。削除対象」
      訂正後: 「- 削除時点の実測: cron を含む GitHub Actions 定期実行設定は当該 workflow のみである（workflow 内 cron 出現は git grep 実測 2 行）。削除対象」
      訂正理由: 「追跡対象ファイル全体で cron の出現は当該 workflow のみ」は、撤回判断記録（DEC-063 自身の title・本文記述）と docs インデックスが cron という語を含む 2026-11-16 実測と矛盾する虚偽主張である。経緯の事実（定期実行設定を持つ workflow が当該 workflow のみ・workflow 内 cron 出現は 5 行目・23 行目の実測 2 行）は維持する。
      採用根拠: 利用者の明示指示（2026-11-16・撤回判断記録の保全を条件とした DEC-063 記述訂正）。
  - id: AG-003
    content: |
      DEC-063 影響節 76 行目の訂正。
      訂正前: 「- 削除後、追跡対象全体で cron を含むファイルは 0 件となる（git grep で証明）。」
      訂正後: 「- 削除後、.github 配下に cron を含む GitHub Actions 定期実行設定は存在しない（grep -rn "cron" .github/ で不在を確認）。全追跡ファイル対象の git grep のヒットは撤回判断記録（本 Decision）およびそのインデックス記述等に限られることを git grep で確認する。」
      訂正理由: 削除後も撤回判断記録（DEC-063 自身）と docs インデックスが cron という語を含むため「追跡対象全体で 0 件」は達成不能な虚偽主張である。訂正後文言は AG-001 の訂正後（確定文）と同一の意味内容とする。
      採用根拠: 利用者の明示指示（2026-11-16・撤回判断記録の保全を条件とした DEC-063 記述訂正）。
  - id: AG-004
    content: |
      採用根拠の区別記録。
      利用者が確定した内容（採用根拠: 利用者の明示指示・2026-11-16）: TS-002 の内在矛盾（撤回記録自身が cron を含むため全追跡ファイル 0 件は達成不能）を正規手順で訂正する。撤回判断記録（DEC-063・status: accepted・履歴記録）は保全する。検証方法を .github 配下の GitHub Actions 定期実行設定の不在確認へ変更する。削除対象 2 ファイルの削除方針は不変。
      監督判断で確定される内容（採用根拠: 監督判断。要件確認条件の文言を利用者が承認したとは記録しない）: TS-002 訂正後の具体的検証文言と DEC-063 訂正箇所の具体的訂正文言。本 draft はこれらを確定案として保持し、後続工程が適用する。

artifact_actions:
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-063.md
    target_area: 背景・影響（本 action の適用は下記 replace 指定 2 件を正とする。1 editing concern〔cron 検証主張の虚偽訂正〕として 2 箇所の局所修正を 1 action に統合）
    source_items: [AG-002, AG-003]
    content: |
      局所修正 2 件（assemble-draft-section.ts v0.2.0・書込みなし検査 ok 済み〔assembly_evidence 参照〕。適用は Definition 保存内部責務〔case-ready / case-revise〕が行う）。
      【replace 1・target_area: 背景・expected_old_count: 1】
      old_text: 「追跡対象ファイル全体で cron の出現は当該 workflow のみ（git grep 実測 2 行）」
      new_text: 「cron を含む GitHub Actions 定期実行設定は当該 workflow のみである（workflow 内 cron 出現は git grep 実測 2 行）」
      【replace 2・target_area: 影響・expected_old_count: 1】
      old_text: 「削除後、追跡対象全体で cron を含むファイルは 0 件となる（git grep で証明）。」
      new_text: 「削除後、.github 配下に cron を含む GitHub Actions 定期実行設定は存在しない（grep -rn "cron" .github/ で不在を確認）。全追跡ファイル対象の git grep のヒットは撤回判断記録（本 Decision）およびそのインデックス記述等に限られることを git grep で確認する。」
      適用制約: status: accepted・frontmatter・決定 1〜4・判断根拠・承認記録・その他節は一切変更しない（誤記訂正のみ）。title は変更しないため docs/README.md・docs/decisions/README.md の AUTOGEN インデックス再生成は不要。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      Root Case #4113 完了条件 TS-002「cron を含むファイルが 0 件」と DEC-063 影響節「削除後、追跡対象全体で cron を含むファイルは 0 件となる」は、撤回判断記録（DEC-063 自身の title・本文記述）と docs インデックス（docs/README.md・docs/decisions/README.md）が cron という語を含むため達成不能な内在矛盾を含む。
    resolution: >-
      検証義務を .github 配下の GitHub Actions 定期実行設定の不在確認へ訂正し、全追跡ファイル対象の git grep を「ヒットが撤回判断記録等の記述のみであること」の確認証跡へ位置づけ直す（AG-001）。DEC-063 背景節・影響節の虚偽主張を経緯の事実を維持した形で訂正する（AG-002・AG-003）。撤回判断記録の保全は不変。採用根拠: 利用者の明示指示（2026-11-16）。
      2026-11-16 実測（main HEAD 395e698e0・git grep -n "cron"・全追跡ファイル対象）: .github/workflows/integrity-suite-split3-windows.yml:5,23（削除対象・現時点で main working tree に存在し、削除は .worktrees/4113-refactor のステージ済み変更として保全）、docs/README.md:188、docs/decisions/DEC-063.md:3,10,41,76、docs/decisions/README.md:80,145。workflow 削除 merge 後の想定ヒット集合は撤回判断記録（DEC-063）と docs インデックス 2 件の記述のみである。

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req:
    target_design:
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      ACT-DEC-001 replace 1 の適用後、git grep -n -F "cron を含む GitHub Actions 定期実行設定は当該 workflow のみである（workflow 内 cron 出現は git grep 実測 2 行）" docs/decisions/DEC-063.md と、git grep -n -F "追跡対象ファイル全体で cron の出現は当該 workflow のみ（git grep 実測 2 行）" docs/decisions/DEC-063.md を実行する。
    pass_criteria: |
      訂正後文言 1 件・訂正前文言 0 件。DEC-063 の status: accepted・frontmatter・決定 1〜4・判断根拠・承認記録・その他節が一切変更されていない。
    on_failure: |
      fix-and-reverify: 適用条件（old_text 完全一致・expected_old_count 1）の不一致を原因特定し、訂正内容を再適用して同一検証を再実行する。他節の変化を伴う場合は適用を取りやめ draft 差戻し判断材料として記録する。
  - id: TS-002
    target_item: AG-003
    verification: |
      ACT-DEC-001 replace 2 の適用後、git grep -n -F "削除後、.github 配下に cron を含む GitHub Actions 定期実行設定は存在しない" docs/decisions/DEC-063.md と、git grep -n -F "追跡対象全体で cron を含むファイルは 0 件となる" docs/decisions/DEC-063.md を実行する。
    pass_criteria: |
      訂正後文言 1 件・訂正前文言 0 件。DEC-063 の status: accepted・frontmatter・決定 1〜4・判断根拠・承認記録・その他節が一切変更されていない。
    on_failure: |
      fix-and-reverify: 適用条件（old_text 完全一致・expected_old_count 1）の不一致を原因特定し、訂正内容を再適用して同一検証を再実行する。他節の変化を伴う場合は適用を取りやめ draft 差戻し判断材料として記録する。
  - id: TS-003
    target_item: AG-001
    verification: |
      case-revise による Case Issue #4113 本文更新後、agentdev_gh issue_read（number: 4113）の読み戻しで TS-002 完了条件本文を取得し、AG-001 の訂正後（確定文）と一致するか照合する。旧文言「TS-002: cron を含むファイルが 0 件」の主張が本文に残存しないことも確認する。
    pass_criteria: |
      TS-002 完了条件が AG-001 の訂正後（確定文）と一致し、他の完了条件（TS-001・TS-003・TS-004）が不変であること。
    on_failure: |
      fix-and-reverify: Issue 本文更新の適用条件（TS-002 セクションの部分文面一致）を原因特定し再適用する。

review_dispositions: []

assembly_evidence:
  - target_file: docs/decisions/DEC-063.md
    target_content_sha256: "59d5ee3fdf24fcb37ab4e05251f28633a5baeaf3165eef0a85f4661f67c3ffbf"
    check_scope: { heading: "## 背景", start_line: 28, end_line: 48 }
    execution_conditions: { operation: replace, edit_sha256: "caad2e04acdd4ab8d3799dae6743ca31688b4bc218c4f4ff779b156b933300a6", expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.2.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: target section only }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-16T13:34:04.069Z"
  - target_file: docs/decisions/DEC-063.md
    target_content_sha256: "59d5ee3fdf24fcb37ab4e05251f28633a5baeaf3165eef0a85f4661f67c3ffbf"
    check_scope: { heading: "## 影響", start_line: 69, end_line: 77 }
    execution_conditions: { operation: replace, edit_sha256: "9a3382b2c4e87aafc42eec79c0a218247b4b60e9c1c29e63ca0fbc9dacf48a4d", expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.2.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: target section only }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-16T13:34:04.147Z"

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
  consumer_route: case-revise
  notes: >-
    本 draft は例外経路（case-revise → case-ready）の入力である。対象: Root Case #4113（open・正規状態 ready・maintenance）・main HEAD 395e698e0。
    case-revise が (1) Case Issue #4113 本文の TS-002 完了条件を AG-001 の訂正後（確定文）へ適用 (2) ACT-DEC-001 の replace 2 件を Definition 保存内部責務で適用 の後、case-ready へ進む。
    削除対象 2 ファイルの削除方針と .worktrees/4113-refactor のステージ済み削除 2 ファイルは保全する（本 draft から一切変更しない）。
    新規 Issue・Epic・PR の作成は含まない。Issue 階層の決定は case-open / case-revise の責務であり本 draft では決定しない。
```

# summary

<!-- 【任意】 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

DEC-063 の背景節・影響節に記録された「追跡対象全体で cron 0件」系の主張は、撤回判断記録自身が cron という語を含むため達成不能であり、2026-11-16 の利用者指示により検証義務と Decision 記述の訂正へ正規化した。訂正後の主検証は .github 配下の定期実行設定不在確認であり、全追跡ファイル対象の git grep は撤回判断記録等の記述ヒット確認の証跡として位置づける。DEC-063 の局所修正 2 件は assemble-draft-section.ts v0.2.0 の書込みなし検査で旧文一致・置換・前後検査を通過済みである。
