---
draft_type: req_draft
topic_slug: textlint-prh-definition-pr-term
status: draft
created_at: 2026-10-13T12:55:00Z
source_rus:
  - RU-0209
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: textlint final gate の prh 用語統一違反（Definition PR から 設計PR への統一、REQ-083-003 の現行名称政策）を解消する。prh 辞書への用語登録は既に存在するため（2026-10-06 Issue #3500 登録済みを実測）、gate 違反 5 箇所の本文修正のみで gate を緑化する（gate 実行 2026-10-13、608 ファイル、hard 5 件を実測）。RU が列挙した 6 箇所のうち v51-phase-transition-and-coexistence-model.md L40 は既に修正済みであることを実測し、採否を記録した。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      prh 辞書（.agentdev/config/plugins/agentdev-textlint-guard-prh.yml）への用語登録追加は行わない。対象規則（expected: 設計PR / pattern: /Definition PR/）は既に L26-27 に存在し（2026-10-06 Issue #3500 登録、REQ-083-003・document-type-responsibilities.md 用語政策節を正とする語彙政策の機械辞書層）、辞書側の変更は不要である。
  - id: AG-002
    content: |
      gate 違反 5 箇所の本文を「Definition PR」から「設計PR」へ修正する（用語の置換のみで文意は変更しない）。対象: (1) docs/designs/foundations/references/v4-v5-crosswalk.md L79（セクション「後継経路（工程駆動実行）の処遇確定記録様式」）、(2) 同ファイル L86（セクション「集約サマリ」）、(3) docs/designs/workflows/v4-standard-lifecycle.md L34（セクション「公開 UX と内部 lifecycle の分離」）、(4) src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md L50、(5) 同ファイル L80。Design 文書 3 セクションは Definition 保存（ACT-DESIGN-001〜003）で修正し、配布 skill reference の 2 箇所は実現面修正（RA-001）で修正する。
  - id: AG-003
    content: |
      textlint final gate（bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .）の拒否対象違反（hard）が 0 件となり gate が合格する。prh 以外の文字品質違反クラスの hard も 0 件であることを同時に要求する（現行 5 件はすべて prh 由来を実測済み）。
  - id: AG-004
    content: |
      gate 非検出面に残る同語彙は本件の修正対象としない。実測された対象外: v4-v5-crosswalk.md L68・L69（テーブル行。現行 gate は散文 Str 節点のみ検出しテーブル行は非検出を実測）、REQ-061-044/046（REQ 要件行。bugfix 経路では REQ ファイルを修正せず、将来の語彙整理候補として記録）、agentdev-workflow-case-ready SKILL.md frontmatter description（frontmatter は prh 検出対象外を実測）、DEC-029・docs/reports/ 配下・docs/requirements/retired/（履歴記録。REQ-083-003 の旧表現書き換え禁止対象）。

conflict_resolutions:
  - id: CR-001
    conflict: 方針選択（prh 辞書への用語登録追加か、違反箇所の本文直接修正か。RU は実務上の組合せ必要性を指摘）
    resolution: |
      本文修正のみを採用する（辞書登録は既存のため組合せの辞書側は不要）。根拠: 辞書の実ファイル実測で対象規則が既に存在（L26-27、Issue #3500 登録）、かつ gate 実行（2026-10-13、608 ファイル）で hard 違反は prh 由来 5 件のみであり、gate 緑化に必要な残作業は本文側の未追随 5 箇所の修正のみと機械的に確定した。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_design:
      operation: update
      domain: foundations
      slug: v4-v5-crosswalk
    target_area: ## 後継経路（工程駆動実行）の処遇確定記録様式
    canonical_owner: v5-adopted-conventions
    source_items: [AG-002]
    content: |
      ## 後継経路（工程駆動実行）の処遇確定記録様式

      REQ-111、DEC-058 に基づく工程駆動実行の確定は、REQ-005-001/010/011 の再定義行に対し次の様式で記録する。

      - 確定契機: 後継経路の実現（テーマ初回形成、テーマ更新、正規成果物への反映、独立レビューの4操作と利用者判断による工程遷移の実装）、検証（実装着手時の有効な正規契約の外部的結果を基準とした合格、REQ-111-010）、正式採用（採用規約機構への採用登録）の3点が揃った時点を confirmed 遷移の契機とする
      - 前提: 設計PR の作成・マージだけでは、後継経路の実現確定、処遇の confirmed 遷移、旧経路の失効を意味しない（DEC-058、REQ-108-012）
      - 記録方法: 対象行（REQ-005-001、REQ-005-010、REQ-005-011）の意味処遇列は redefine のまま維持し、備考列へ confirmed 遷移の時点と根拠（検証証跡への参照）を追記する。対象行本文の書き換えは処遇実行（executed）時に行う
      - 移行期条項: confirmed 遷移後も、v4 経路の変更駆動能力群の外部的結果と検証義務（REQ-111-010）は処遇実行が完了するまで現行経路の記述どおり維持する。confirmed 遷移を旧経路の失効扱いにしない
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_design:
      operation: update
      domain: foundations
      slug: v4-v5-crosswalk
    target_area: ## 集約サマリ
    canonical_owner: v5-adopted-conventions
    source_items: [AG-002]
    content: |
      ## 集約サマリ

      - 優先行6項目（REQ-030-001、REQ-005-001、REQ-005-010、REQ-005-011、REQ-035-006、REQ-061周辺行）を棚卸し対象として記録した。keep 1 / keep・defer 1 / defer 1 / redefine 3
      - REQ-005-001/010/011 は REQ-111 と DEC-058 に基づく変更駆動・工程駆動の併存モデルへ再定義する。後継経路の実現・検証・正式採用が成立するまでは現行経路の権威を維持し、設計PR の作成・マージだけで処遇確定や旧経路の失効を扱わない（REQ-108-012）
      - v5 新規 REQ と現行要件行の宣言なし直接矛盾の検証では、競合候補は上記優先行に集約され、全て本 crosswalk の棚卸し対象記録または移行期権威行（REQ-108-012）により管理される。未管理矛盾 0 件（検証結果は当該 Case の PR 本文検証差分を参照）
      - 本 Design は棚卸し構造であり、優先行の実際の再定義・廃止実施と v5 実現確定後の現行公開経路の置換・廃止は対象外である
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/v4-standard-lifecycle.md
    target_design:
      operation: update
      domain: workflows
      slug: v4-standard-lifecycle
    target_area: ## 公開 UX と内部 lifecycle の分離
    canonical_owner: v4-standard-lifecycle
    source_items: [AG-002]
    content: |
      ## 公開 UX と内部 lifecycle の分離

      変更駆動の2中心フロー（req-define → case-auto、backlog-auto → req-define → case-auto）は変更駆動経路として維持する。工程駆動実行の公開経路（4操作と利用者判断による工程遷移）は独立した経路として併存し、case-auto の内部 lifecycle と区別する。

      - 変更駆動経路は既存の外部的な作業結果と検証義務を引き続き成立させる。工程駆動の操作や工程遷移を前置必須としない
      - 工程駆動の公開操作はテーマ初回形成、テーマ更新、正規成果物への反映、独立レビューであり、利用者判断による工程遷移とともに工程駆動実行へ分類する
      - case-open、case-ready、case-run、case-close、case-revise は変更駆動の case-auto が駆動する内部 lifecycle であり、利用者が手動で順次実行する公開 UX としない
      - 後継経路（工程駆動実行）の実現・検証・正式採用の確定契機と、その時点での REQ-005-001/010/011 の処遇確定（棚卸し対象から confirmed への遷移）の記録様式は v4-v5-crosswalk が所有する。本 Design の双経路併存記述と経路別所有境界は処遇確定まで弱めない。設計PR の作成・マージだけでは後継経路の実現確定や旧経路の失効を意味しない（REQ-108-012、REQ-111-013）

operation_units:
  - ou_id: OU-001
    source_ru: RU-0209
    target_req: null
    target_design: docs/designs/foundations/references/v4-v5-crosswalk.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0209
    target_req: null
    target_design: docs/designs/workflows/v4-standard-lifecycle.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . を実行する（本体リポジトリへの最終検査。依存実体 vendor/ は生成済みを実測）。
    pass_criteria: |
      拒否対象の違反が 0 件で gate が合格（exit 0）すること。出力末尾の合計行に hard 違反が計上されないこと。
    on_failure: |
      fix-and-reverify。本件起因（prh 用語・対象 5 箇所）の違反は修正して再検証する。本件非起因の違反が検出された場合は起因を切り分け、同一関心（用語統一）の場合は対象へ追加して再検証し、別起因の場合は当該担当へ分離する。
  - id: TS-002
    target_item: AG-002
    verification: |
      検索系検証。対象 3 ファイル（v4-v5-crosswalk.md、v4-standard-lifecycle.md、definition-pr-and-idempotency.md）の各対象セクション・対象行について rg で Definition PR を検索する。網羅範囲と修正対象列挙の一致: 検出器の正は textlint gate（散文 Str 節点）であり、修正対象列挙は gate が検出する 5 箇所（AG-002）と一致する。テーブル行・frontmatter・履歴領域は AG-004 どおり gate 非検出面または対象外として検索結果の照合対象から除外する。
    pass_criteria: |
      5 対象行から Definition PR が 0 件となり、設計PR への置換が存在すること。
    on_failure: |
      fix-and-reverify。置換漏れを修正して再検証する。

realization_actions:
  - id: RA-001
    concern: 配布 skill reference の用語置換（2 箇所）
    responsibility: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（配布物本体・実現面）の L50・L80。Definition 保存（Design 保存）経路の対象外であり case-run が修正する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md L50（「この限定した結果だけを理由に Definition PR を拒否しない」→「この限定した結果だけを理由に設計PR を拒否しない」）
      - 同ファイル L80（「docs 配下の日本語変更を含む Definition PR では」→「docs 配下の日本語変更を含む設計PRでは」）
    intent: 配布 skill reference の用語を REQ-083-003 の現行名称へ統一し、textlint final gate の hard 違反を解消する。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-002]

decision_judgments:
  - target: new:textlint-prh-definition-pr-term
    result: 不要
    applicable_criteria: Decision を作成してはならない条件（既存文書種別への適合・運用ルールの適用）、False Negative 防止基準（技術判断の有無の再確認済み）
    grounds: |
      用語統一は REQ-083-003 と document-type-responsibilities.md 用語政策で既に決定済みの政策の適用違反の是正であり、新しい技術的決定を含まない。prh 辞書登録も既存（Issue #3500）。False Negative 防止基準により技術判断の有無を再確認したが、辞書規則の設計（最長一致並び順等）は既存のまま変更しないため該当なし。既存 Decision との重複確認: Decision 候補なしのため確認対象なし。

review_dispositions:
  - id: RD-001
    source_ru: RU-0209
    source_item: 要件化の方向-方針選択（prh 辞書への用語登録追加）
    disposition: covered
    reason_code: already_satisfied
    reason: |
      対象規則は .agentdev/config/plugins/agentdev-textlint-guard-prh.yml L26-27 に既に登録済み（2026-10-06 Issue #3500）であり、既存資産が本項目を充足する。辞書側の変更は不要（CR-001）。
    evidence:
      path: .agentdev/config/plugins/agentdev-textlint-guard-prh.yml
      section: rules（expected: 設計PR / pattern: /Definition PR/）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0209
    source_item: Sources-v51-phase-transition-and-coexistence-model.md L40 の違反
    disposition: covered
    reason_code: already_satisfied
    reason: |
      実測（2026-10-13）の同箇所は既に「設計PR の作成・マージだけでは」と修正済みであり、gate 実行の hard 5 件に含まれない。修正済み状態を本件の受け入れ条件（gate 緑化）がそのまま検証する。
    evidence:
      path: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
      section: 双経路併存と移行（L40）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0209
    source_item: gate 非検出面の同語彙（crosswalk L68/L69 テーブル行、REQ-061 要件行、case-ready SKILL.md frontmatter、履歴領域）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      gate 検出面（散文 Str 節点）の外側であり gate 緑化に不要。REQ 要件行の語彙は bugfix 経路の REQ ファイル修正禁止に触れ、将来の語彙整理候補として AG-004 に記録する。履歴領域は REQ-083-003 の旧表現書き換え禁止対象。
    evidence:
      path: docs/designs/foundations/references/v4-v5-crosswalk.md
      section: L68-L69（テーブル行。gate 非検出を実測）
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_content_sha256: 0c2a3e43ee1018fd9eb045f654e42aa257324d433adf0d4f31230d13d3ad4fbf
    check_scope:
      heading: "## 後継経路（工程駆動実行）の処遇確定記録様式"
      start_line: 74
      end_line: 82
    execution_conditions:
      operation: replace
      edit_sha256: af325824cb67e0aef4077b1a33817a482d42bdb6202fb9a930bc153d6ed75c83
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: 2026-10-13T12:50:06.914Z
  - target_file: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_content_sha256: 0c2a3e43ee1018fd9eb045f654e42aa257324d433adf0d4f31230d13d3ad4fbf
    check_scope:
      heading: "## 集約サマリ"
      start_line: 83
      end_line: 89
    execution_conditions:
      operation: replace
      edit_sha256: 18c4aa14c1a5402f580d2e4b8f985b6e7325b211680200f58d7534d8dd75979d
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: 2026-10-13T12:50:07.016Z
  - target_file: docs/designs/workflows/v4-standard-lifecycle.md
    target_content_sha256: 457397550526adee1e4dac4fce6fc75ef04771eb4ac1a0846afcd4e639db266a
    check_scope:
      heading: "## 公開 UX と内部 lifecycle の分離"
      start_line: 27
      end_line: 35
    execution_conditions:
      operation: replace
      edit_sha256: a1f2f957364871d3ce10587d125e3192a010cf0933b8c2d3e5cbdeaccf1c04b8
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: 2026-10-13T12:50:07.120Z

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

bugfix・standard。Design 保存操作 3 件（case-ready が適用。v4-v5-crosswalk.md の2セクションと v4-standard-lifecycle.md の1セクション）と実現面修正 1 件（配布 skill reference の 2 箇所、case-run が実施）。辞書登録は既存充足のため対象外（RD-001）。gate 非検出面の残存は対象外として AG-004・RD-003 に記録し、将来の語彙整理候補（REQ-061 要件行等）を区別した。STEP-8 adversarial-review の所見: artifact_actions 経由（Definition 保存）と case-run 実現面修正の経路分離を反証の上維持、prh 置換後の表記（設計PR の）が既存使用例と整合することを確認。未解決のユーザー判断事項なし。
