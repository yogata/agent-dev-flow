---
draft_type: req_draft
topic_slug: vocabulary-policy
status: draft
created_at: 2026-10-08T16:20:00+09:00
source_rus: [RU-0182, RU-0183, RU-0184]
---

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: |
  用語政策の適用境界確定（prh 4 区分・辞書規則矛盾解消）、DEC-036 旧責務分類語彙残存の是正、
  REQ-031/REQ-034 の Wave 重複検出語彙の統一（pin テスト同時更新・fail-closed 維持）、
  および textlint hard violation 40 件の解消（docs・src 配布物・baseline を含む全数処置）を一括して合意した。
  RU-0184 の RU-0182 依存は本 draft 内で解消する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      prh 用語置換の適用境界を用語政策の一部として確定する。適用区分は 4 区分とする:
      (1) 識別子（RU-ID・REQ-ID・AC-ID・ACT-ID 等の固有識別子）は置換対象外、
      (2) テスト期待値（pin・固定値比較の期待文字列）は置換対象外、
      (3) 要件行（REQ テーブル行の文言）は現行契約変更手続き経由でのみ変更する、
      (4) 散文（説明文・経緯・参照行）は用語政策の置換対象とする。
      本境界を docs/designs/responsibilities/document-type-responsibilities.md の用語政策節へ追記し、
      正規の判断根拠として所有する。
  - id: AG-002
    content: |
      prh 辞書の規則矛盾を解消する。完全形への誘導規則と、完全形そのものを置換対象とする規則が同時に存在する
      自己参照状態（REQ-062-003 を根拠参照する規則と、当該完全形を置換する規則の競合）を、
      誘導規則を正とし置換規則側を適用対象外（識別子・テスト期待値）へ分離することで解消する。
      辞書の修正は src/opencode/plugins/agentdev-textlint-guard 配下の prh ルール定義に対して実施する。
  - id: AG-003
    content: |
      DEC-036 旧責務分類語彙（semantic 担当 / deterministic 委譲先 / 知識提供）の残存 2 箇所を
      v4-responsibility-boundaries Design の後継語彙（意味判断担当 / 決定的処理委譲先 / 知識提供）へ置換する。
      対象は docs/designs/authoring/command-file-format.md:40（Design 文書・adversarial-review で実パス確認済み。
      src/opencode/commands 配下の references/command-file-format.md は存在しない）と
      docs/requirements/REQ-027.md 本文行（## 目的 節）。REQ-027 の要件テーブル行（REQ-027-001〜003）は
      旧語彙を含まないため変更しない。正当な残存対象（処置対象外）は v3-v4-crosswalk.md:25-29
      （REQ-103-020 による歴史語彙保持）と v4-responsibility-boundaries.md:159-161（語彙対応表）の 2 箇所とする。
  - id: AG-004
    content: |
      REQ-031-027 を REQ-034-043 と同一の宣言ベース語彙へ統一する。旧語彙「変更対象ファイル重複」を
      「主な変更対象（子 Issue が実行単位として所有する宣言）重複」へ更新し、変更対象集合が取得不能な場合は
      比較を省略せず検出不能として報告する fail-closed 契約を維持する。
      REQ-031 を参照するテスト等の期待値への影響を確認する（実在する REQ-031 参照テストは
      scripts/self/release/case-run-resume-route.test.ts のみで、REQ-031-027 の行文言を pin するテストは
      現状存在しないことを adversarial-review で確認済み。REQ-031-027 文言変更の影響を受ける参照
      〔traceability policy・Design 本文引用〕の有無を case 実行時に確認し、存在する場合は同時更新する）。
  - id: AG-005
    content: |
      textlint gate の hard violation 40 件（対象 566 ファイル・内訳 prh 用語系約 25 件+文字品質系 15 件）を解消する。
      処置は docs 13 行・src 配布物 7 ファイル 16 行・textlint baseline 12 件を含む全数処置とする
      （docs のみの政策適用は lint 再不合格を生むため）。baseline 12 件は 2 種区分に従って処置する:
      Definition PR 系 7 件・Amendment 系 4 件は用語政策確定（AG-001/AG-002）に従い本文修正で解消し、
      実装 PR 系 1 件は該当文言の是正対象有無を確認して解消または baseline 更新とする。
      prh 系 25 件の解消は AG-001〜AG-003 の政策・語彙確定に依存するため、本 draft 内で先行確定した上で
      同一実行単位で処理する。Epic 完了条件「全統制 exit 0」の阻害要因を除去する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-027.md
    target_area: "## 目的"
    source_items: [AG-003]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件・assemble-draft-section 検証 2026-10-08）:
      旧文: Capability Skill の責務分類は workflow-skill-model Design の機械分類規則と DEC-036 の分類（semantic 担当 / deterministic 委譲先 / 知識提供）に従う。
      新文: Capability Skill の責務分類は workflow-skill-model Design の機械分類規則と v4-responsibility-boundaries Design の分類（意味判断担当 / 決定的処理委譲先 / 知識提供）に従う。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-031.md
    target_area: "## 要件"
    source_items: [AG-004]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件・assemble-draft-section 検証 2026-10-08）。
      REQ-031-027 行の一部を次のとおり更新する:
      旧文: 同一 Wave 内の変更対象ファイル重複の実行時検出は case-auto の stage 3 実行制御が所有し、変更対象集合が取得不能な場合は比較を省略せず検出不能として報告する責務を維持すること
      新文: 同一 Wave 内の主な変更対象（子 Issue が実行単位として所有する宣言）重複の実行時検出は case-auto の stage 3 実行制御が所有し、変更対象集合が取得不能な場合は比較を省略せず検出不能として報告する責務を維持すること
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: "## 用語政策"
    source_items: [AG-001, AG-002]
    content: |
      ### prh 用語置換の適用境界

      prh 辞書による用語置換の適用境界は次の 4 区分とする。

      - 識別子（RU-ID・REQ-ID・AC-ID・ACT-ID 等の固有識別子）: 置換対象外
      - テスト期待値（pin・固定値比較の期待文字列）: 置換対象外
      - 要件行（REQ テーブル行の文言）: 現行契約変更手続き経由でのみ変更する
      - 散文（説明文・経緯・参照行）: 用語政策の置換対象

      完全形への誘導規則と完全形そのものを置換対象とする規則が競合する場合（REQ-062-003 根拠参照との競合を含む）、
      誘導規則を正とし、置換規則側を適用対象外区分（識別子・テスト期待値）へ分離して解消する。
      適用境界の判定を要する境界事例は本節を正規の判断根拠として扱う。

  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: "## Command 構造"
    source_items: [AG-003]
    content: |
      置換（:40・adversarial-review Stream B により実パスと実文を確認）:
      旧文: workflow dispatch 先および委譲先 skill の責務分類（semantic 担当 / deterministic 委譲先 / 知識提供）は DEC-036 の分類と `../workflows/workflow-skill-model.md` の機械分類規則に従う。
      新文: workflow dispatch 先および委譲先 skill の責務分類（意味判断担当 / 決定的処理委譲先 / 知識提供）は `../foundations/v4-responsibility-boundaries.md` の分類と `../workflows/workflow-skill-model.md` の機械分類規則に従う。

conflict_resolutions:
  - id: CR-001
    conflict: prh 系 25 件の解消は用語政策（RU-0182）の判断に依存し、政策と gate 実体の所有が異なる（RU-0184 depends_on RU-0182）。
    resolution: 両 RU を同一 draft（本 draft）で処理し、政策確定（AG-001〜AG-003）を先行させた同一実行単位内で解消する。draft 分割上の依存残存は残さない。
  - id: CR-002
    conflict: REQ-027.md 本文行の旧語彙参照を REQ 変更とするか文書修正とするか（RU-0182 判断軸 2 の必須論点）。
    resolution: 本文行（要件テーブル行の外）の置換は文書修正として扱い、要件テーブル行（REQ-027-001〜003）は変更しない。壁打ち Q1 でユーザー確定済み。
  - id: CR-003
    conflict: baseline 12 件の扱い（一括解除か区分処置か）。
    resolution: baseline 12 件を Definition PR 系 7・Amendment 系 4・実装 PR 系 1 の 2 種区分に従い処置する（intake 成果物の内訳確定を採用）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0182
    target_req: REQ-027
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0183
    target_req: REQ-031
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0182
    target_design: { operation: update, domain: responsibilities, slug: document-type-responsibilities }
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0182
    target_design: { operation: update, domain: authoring, slug: command-file-format }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0184
    target_req: null
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-005]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/designs/responsibilities/document-type-responsibilities.md の用語政策節に prh 適用境界 4 区分が追記されていることを確認する。
      追記後、用語政策節を用語境界の判断根拠として参照する文言が存在することを確認する。
    pass_criteria: 用語政策節への追記が完了し、4 区分（識別子・テスト期待値・要件行・散文）がすべて明記されていること。
    on_failure: fix-and-reverify（追記内容の欠落・誤記は実装側で修正して再検証する。設計判断の変更を要する場合は本要件に差し戻す）。
  - id: TS-002
    target_item: AG-002
    verification: |
      prh 辞書（src/opencode/plugins/agentdev-textlint-guard 配下の prh ルール定義）について、
      完全形への誘導規則と当該完全形を置換する規則が競合しないことを規則定義の静的確認で検証する。
      辞書修正後、bun gate.ts（--root に repo root を指定）を実行し誤検知の発生有無を確認する。
    pass_criteria: 規則の競合が解消され、既存の正しい検知（残すべき置換指摘）が消失しないこと。
    on_failure: fix-and-reverify（規則分離の実装不備は修正して再検証する）。
  - id: TS-003
    target_item: AG-003
    verification: |
      rg で "semantic 担当" "deterministic 委譲先" を docs/ と src/ から検索し、処置対象 2 箇所
      （docs/designs/authoring/command-file-format.md:40・REQ-027.md 本文行）が解消済みであることを確認する。
      正当な残存対象 2 箇所（v3-v4-crosswalk.md:25-29 の歴史語彙保持〔保持語彙は「semantic Skill」「deterministic
      code/tool」表記〕・v4-responsibility-boundaries.md:159-161 の語彙対応表）が残存していることを確認する
      （検証の網羅範囲と修正対象列挙の一致・REQ-008-062）。
    pass_criteria: 処置対象 2 箇所の旧語彙が解消され、正当な残存対象 2 箇所以外への過剰置換が発生していないこと。
    on_failure: fix-and-reverify（置換漏れ・過剰置換は修正して再検証する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-031-027 の文言が REQ-034-043 と同一の宣言ベース語彙になっていることを確認する。
      REQ-031 を参照する箇所（scripts/self/release/case-run-resume-route.test.ts・traceability policy・Design 本文引用）
      を検索し、REQ-031-027 文言変更の影響を受ける期待値・引用が存在する場合は同時更新されていることを確認する。
      変更対象集合が取得不能な場合に比較を省略しない fail-closed 表現が維持されていることを確認する。
    pass_criteria: 参照箇所の影響確認が完了し、影響がある場合の同時更新が実施され、fail-closed 表現が維持されていること。
    on_failure: fix-and-reverify（置き去りがあれば修正して再検証する。テスト不存在は本要件の不達とはしない）。
  - id: TS-005
    target_item: AG-005
    verification: |
      cd src/opencode/plugins/agentdev-textlint-guard && bun gate.ts --root <repo-root> を実行する。
      hard violation が 0 件（exit 0）であることを確認する。実行後に plugin カレントへ生成された
      .agentdev/cache があれば削除する。docs・src 配布物・baseline の全数処置が完了していることを
      各修正対象の diff で確認する。
    pass_criteria: textlint gate が exit 0（hard 0 件）で完了すること。
    on_failure: fix-and-reverify（残存 violation は修正して再検証する。用語政策の適用境界に関わる判断が必要な場合は本要件に差し戻す）。

realization_actions:
  - id: RA-001
    concern: prh 辞書の規則矛盾解消
    responsibility: prh ルール定義の保守（誘導規則と置換規則の分離）
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard 配下の prh ルール定義ファイル
      - 用語政策の正規所有: docs/designs/responsibilities/document-type-responsibilities.md 用語政策節（本 draft ACT-DESIGN-001 で拡張）
    intent: 完全形誘導規則を正として置換規則の適用対象外区分を分離し、誤検知と検知漏れを同時に解消する
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: REQ-027 本文行の DEC-036 旧語彙是正
    responsibility: REQ 本文の語彙維持（command-file-format.md 側は ACT-DESIGN-002 へ移動済み）
    ownership_hints:
      - docs/requirements/REQ-027.md ## 目的 節本文行
    intent: 旧責務分類語彙を v4-responsibility-boundaries 後継語彙へ置換し、docs と Design の語彙一致を担保する
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-003
    concern: textlint hard 40 件の全数解消（docs 13 行・src 16 行・baseline 12 件）
    responsibility: 文書品質 gate の通過状態維持
    ownership_hints:
      - docs/ 配下の prh 指摘 13 行
      - src 配布物 7 ファイル 16 行
      - textlint baseline 定義（Definition PR 系 7・Amendment 系 4・実装 PR 系 1 の区分処置）
      - 文字品質系 15 件の指摘所在
    intent: 用語政策確定（AG-001〜003）に基づき全数処置し、Epic 完了条件「全統制 exit 0」の阻害要因を除去する
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-004
    concern: REQ-031 参照箇所の影響確認と同時更新
    responsibility: REQ 参照テスト・引用の期待値同期
    ownership_hints:
      - scripts/self/release/case-run-resume-route.test.ts（REQ-031 参照の実在テスト）
      - REQ-031-027 を引用する traceability policy・Design 本文（検索で特定）
    intent: REQ-031-027 の語彙更新に伴う参照箇所の置き去り防止
    verification_refs: [TS-004]
    source_items: [AG-004]

case_open_hints:
  epic_needed: false
  wave_hints:
    - "OU-004（textlint 40 件解消）は OU-001〜003（政策・語彙確定）の後に実行する依順（RU-0184→RU-0182 依存の draft 内解消）"
    - "RU-0192（lint_skills NG・draft-docs-consistency）とは機構が異なるため統合しないが、docs gate と配布物 lint の全統制という文脈で相互参照を保持する"
    - "RU-0193 C8（検証差分 textlint 行の hard findings 集合 JSON 退避・draft-verification-infra）と同時 Wave 処理が望ましい（集合突合の基盤様式との接続）"
```

# summary

RU-0182（用語政策適用境界+DEC-036 旧語彙）・RU-0183（REQ-031/034 語彙統一）・RU-0184（textlint hard 40 件）の 3 RU を統合し、語彙・用語政策の確定から lint 是正までを一括して要件化した。RU-0184 の RU-0182 依存は draft 内で解消した。置換系 2 件（REQ-027 本文行・REQ-031-027）は assemble-draft-section による組立検査済み。
