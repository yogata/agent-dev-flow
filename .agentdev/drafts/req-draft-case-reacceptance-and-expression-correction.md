---
draft_type: req_draft
topic_slug: case-reacceptance-and-expression-correction
status: draft
created_at: 2026-10-14T09:02:11+09:00
source_rus: []
---

# draft-data

```yaml
work_type: maintenance
scale: standard
summary: >-
  停止中の4 Root Case（#3674/#3676/#3681/#3683）の受け入れ条件・Definition を 2026-10-14 利用者レビュー確定方向へ再合意し、
  各 Case を case-revise 経路で再開可能にする。あわせて #3683 CR-003 で処遇確定済みの表現是正 6 行（4 ファイル）の書換を
  bugfix 実行単位（OU-006・新規 Case）として要件化する。5案を単一 draft として管理し（利用者確定 Q1）、共通制約
  （QG-4 例外運用ではなく正式な要件変更・新規検証機構不作成・既存実装・証拠・PR・Issue 状態の保持・再実行なし）を本 draft に
  単一記録源として持たせる。work_type はバッチの主要性格（既存 Case の受け入れ条件・REQ 体系の再合意）により maintenance と判定
  （案5は OU 単位で bugfix 性格を保持。bugfix+Decision 必須時の feature 昇格条件にも非該当〔Decision 対象なし〕）。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      #3674（ENGINE_TREE 検査の REQ ID 誤捕捉をテスト資産の非配布領域移動で解消する）の完了条件3を、bun test 全体 fail 0 件の
      絶対条件から baseline 対照による本変更効果の確認へ再合意する。再合意後の完了条件3:『本変更の効果が baseline 対照で確認される
      （検証方法: repo root を cwd とする bun test 全体実行〔REQ-060 の実行形態〕を行い、fail 全件に QG-4「fail 由来分類」
      （変更由来 / pre-existing / 実行形態由来 / 不明）を付与する。pre-existing 分類は baseline での同一 fail 再現確認で裏付ける。
      新規の検証機構は作らない。合格条件: ①ENGINE_TREE 誤捕捉の解消 — ENGINE_TREE 検査を含む workflow_body_contract.test.ts
      全テスト pass、②移動テストの検証内容維持 — 移動後 definition-traceability-gate.test.ts が変更なしの検証内容・fixture で pass、
      ③本変更起因の新規 fail 0 — 変更由来 fail 0 件かつ由来不明 fail 0 件（機械受理基準の記録を伴う）。由来不明 fail は未達扱いとする。
      baseline 既存 fail 79 件の修復は本 Case の完了条件から除外し、別単位で追跡する〔停止記録 6152686604 のとおり〕）』。
      完了条件1・2 は case-close 合格済み（[x]）のまま維持し再実行しない。QG-4 契約の例外運用ではなく正式な受け入れ条件変更として扱う。
      既存実装（PR #3697・worktree .worktrees/3674-impl・branch fix/issue-3674）は保持し、再合意後は case-revise 経路で反映して
      case-close を再開する。
  - id: AG-002
    content: >-
      #3676（旧語彙 opencode-local の正規形記述とリリース検査対象を現行配置へ是正する）の停止要因である REQ-050-014 の
      design 対応欠落を、所有 Design への最小補完で解消する。実態確認（2026-10-14）の結果、既存 Design
      （runtime-package-boundary.md 等）に「旧公開入口3本を現役導線として残さない」契約は存在しない（Design 内容自体が不足）ため、
      runtime-package-boundary.md「## scripts 公開入口と内部配置」節の箇条書きへ当該契約1項を追記し、あわせて
      ADF-COVERS(design): REQ-050-014 宣言を追加する。検査の緩和は行わない（traceability check --req REQ-050-014 が
      exit 0・全検査 pass となることを Design 追記で実現する）。実装・検証済み部分（scripts-layout 15 pass・旧語彙残存の合意分類確認・
      worktree .worktrees/3676-impl の保持差分）は保持し case-run 再開へ接続する。再合意後は case-revise 経路
      （Design 追記を含む Definition 変更 → Definition Amendment PR）で反映する。
  - id: AG-003
    content: >-
      #3681（local ツール package の tsconfig 二重管理を参照共有へ統合し typecheck を品質ゲートへ組み込む方針を決定する）における
      REQ-112 自体の矛盾（REQ-112-001/002 の受け入れ条件が実装後の状態を要求する一方、REQ-112-003 がその実装を対象外とする）を
      解消する。(a) REQ-112 を方針決定要件へ整合させる: REQ-112-001/002 の受け入れ条件・検証を「方針が REQ-112 と
      runtime-package-boundary.md Design の両文書へ矛盾なく記録されていること（記録突合）」へ変更し、REQ-112-003 は対象外明記を
      受け入れ条件とするため維持する。適用範囲へ実装義務の分離注記と v5 検討事項1行（方針決定要件と実装要件の区別表現の一般化は
      機構再設計を伴うため v5 検討事項として記録し、本 REQ では機構を再設計しない）を追記する。(b) 実装を要求する部分
      （tsconfig extends 統合・typecheck の品質検査経路組込み・緑化実証）は後続要件を新規 REQ として分離し実装義務を保持する
      （前提の誤 import 修正は #3673 で完了済み）。(c) #3681 の完了条件4を verify-only 完結へ整合させる: 方針記録実体
      （REQ-112.md・runtime-package-boundary.md Design 節）への implementation 対応と、記録突合
      （check_changed_docs・traceability check）の verification 対応を case-run で作成し、missing-implementation・
      missing-verification を解消する。
  - id: AG-004
    content: >-
      #3683（check_distribution_boundary 残存 failures の処遇区分契約を配布依存境界 Design へ追記する）の完了条件を
      対象文書の検証へ再合意する。再合意後の完了条件:『distribution-boundary.md への処遇区分契約セクション追加が対象文書の検証で
      合格する（検証方法: ①check_changed_docs（--workflow docs-check --files docs/designs/integrity/distribution-boundary.md
      --fail-level strict）を実行、②対象要件行 REQ-029-001〜008・010・011 の traceability check を実行、③対照実行による
      新規違反 0 の機械比較、④CR-003/CR-004 確定内容〔表現是正 6 件・baseline 追加 0 件・誤参照 0 件、判定差整理は処遇区分のみ
      運用・機構統合なし〕と Design 反映内容の突合。合格条件: ①違反 0 件、②全項目 pass、③本 Case 起因の検出悪化 0 件、④突合一致。
      repo 全体 docs-check のエラー 0 件は本 Case の完了条件から除外する。全体検査の結果は記録として保持し、未解消を合格と
      読み替えない。残存 strict findings〔ReqFreshness 11・AUTOGEN 計測日 1・lint 3・distribution 8〕は別単位で追跡する）』。
      Design 変更の再適用は行わない（PR #3693 で確定済み）。再合意後は case-revise 経路（実変更なしのため Amendment PR なし）で
      case-close を再開する。
  - id: AG-005
    content: >-
      #3683 の CR-003 で処遇確定済みの表現是正 6 行（4 ファイル）の書換を実行単位として要件化する（bugfix・実現面のみ・
      REQ 保存なし。#3674 と同形式）。修正対象はファイル・matched ID・行内容スニペットで特定し、行番号は参考値とする
      （#3683 記録時の :50/:52/:55 は現在 :51/:53/:56 へドリフト。実測 2026-10-14 main HEAD 6e5207b7 で
      check_distribution_boundary source profile 8 failures = 6 行・4 ファイル〔2 行が複数 ID 検出で二重計上〕）。
      対象: (1) src/common/skills/agentdev-phase-theme-collaboration/scripts/README.md — THEME-001 参照行（"theme: THEME-001"。
      参考値 :86）と REQ-060 参照行（"# repo root 起 cwd で実行（REQ-060 の実行形態）"。参考値 :100）の2行、
      (2) src/common/skills/agentdev-workflow-case-auto/SKILL.md — REQ-108 参照行（再開プロトコル記述。参考値 :129）、
      (3) src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md — REQ-021-024 等を含む行
      （"後続段階へ引き継ぐ対応"。参考値 :51）、REQ-061-023・REQ-021-024 を含む行（"case-ready readiness との接続"。
      参考値 :53）、IR-072 を含む行（"計測日収束"。参考値 :56）の3行。処遇は表現是正区分（出典参照の除去または一般化表現への書換。
      配布物本文の記述規則に従う）。網羅範囲は #3683 が記録した修正対象列挙と一致させ、See Also 等の参照行は検出対象外とする
      （TS-002 記録どおり）。出典情報の保持先は producer 側 traceability/ 配下 sidecar とし、配布物本文へ出典番号を投影しない。
      是正完了後、baseline 残置は concrete-id ベースライン再取得手順で解消する。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-112.md
    target_area: "## 要件（REQ-112-001/002 行置換）・## 適用範囲（末尾追記）"
    source_items: [AG-003]
    content: |
      REQ-112-001 行を次へ置換する:
      | REQ-112-001 | local ツール package とルート package の tsconfig 二重管理の統合方針を記録すること。統合は Local 側の tsconfig.json をルート側へ extends で参照し、差分を include 等の Local 固有設定へ限定する（二重管理しない） | 統合方針が REQ-112 と runtime-package-boundary.md Design の両文書へ矛盾なく記録されていること | REQ・Design 記録突合 |

      REQ-112-002 行を次へ置換する:
      | REQ-112-002 | local package の typecheck の品質検査経路への組込み方針を記録すること。組込みタイミングは Local package 内の誤 import 修正完了後で検査緑化を前提とし、REQ-009-016 の配布除外は変更しない | 組込み方針が REQ-112 と runtime-package-boundary.md Design の両文書へ矛盾なく記録されていること | REQ・Design 記録突合 |

      REQ-112-003 行は維持する（対象外明記を受け入れ条件とするため変更なし）。
      「## 適用範囲」節末尾へ次を追記する:
      - 実装義務は後続要件（tsconfig extends 統合の実装・typecheck の品質検査経路組込み・緑化実証を受け入れ条件とする新規 REQ）へ分離して保持する。方針決定要件と実装要件の区別表現の一般化は機構再設計を伴うため v5 検討事項として記録する（本 REQ では機構を再設計しない）
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:local-package-tsconfig-integration
    source_items: [AG-003]
    content: |
      ---
      id: REQ-113※決定的採番スクリプト（alloc-req-number.ts）の確定値で置換する（REQ-113 は本 draft 時点の予定値）
      title: "local package tsconfig 統合・typecheck 組込みの実装"
      created: "2026-10-14"
      updated: "2026-10-14"
      ---

      ## 目的

      REQ-112 で決定した tsconfig 参照共有と typecheck の品質検査経路組込みの方針を実装義務として実現する。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | REQ-113-001 | local ツール package の tsconfig.json をルート側 package の tsconfig.json への extends 参照へ統合し、差分を include 等の Local 固有設定へ限定すること | 同一内容の tsconfig.json が並列に存在しないこと | 実ファイル突合 |
      | REQ-113-002 | local package の typecheck を本体リポジトリの品質検査経路へ組み込むこと（REQ-112-002 の方針に基づく） | 組込み後の品質検査経路の実行で local package の typecheck が緑になること（緑化実証） | 品質検査経路の実行 |

      ## 適用範囲

      - **対象**: src/common/tools/agentdev-gh/（ルート package と local package）の tsconfig 構造と品質検査経路
      - **対象外**: 配布・同期契約（REQ-009-016）の変更、他 local ツール package への横展開（判断材料は REQ-112 が記録）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "## scripts 公開入口と内部配置"
    source_items: [AG-002]
    content: |
      「## scripts 公開入口と内部配置」節の箇条書き末尾（"- 具体的な内部ファイル分割は、公開契約と依存境界を変えない範囲で実装時に調整できる" の直後、"### supervisor-bridge の配置と境界（REQ-091 design 被覆の本文）" の直前）へ次の1項を追記する:
      - 旧公開入口3本（`scripts/install-consumer-opencode.ps1`、`scripts/check-consumer-opencode.ps1`、`scripts/sync-self-opencode.ps1`）を現役導線として残さない。歴史的説明を除き、旧公開入口名を利用者へ実行させる記述を現行の README・Guide・REQ・Design・Decision・実行手順に残さない。現行文書群の是正と残存例の分類は REQ-050-014 が所有する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: frontmatter 直後の ADF-COVERS 宣言ブロック
    source_items: [AG-002]
    content: |
      frontmatter 直後の ADF-COVERS 宣言ブロックへ（"<!-- ADF-COVERS(design): REQ-112-001, REQ-112-002, REQ-112-003（local ツール package の tsconfig 参照共有と typecheck 検査契約節が design 実体） -->" 行の直後へ）次の1行を追記する:
      <!-- ADF-COVERS(design): REQ-050-014（scripts 公開入口と内部配置節の旧公開入口3本現役導線禁止条項が design 実体） -->

      備考: 本追記位置は見出しスコープの前方（frontmatter 直後）のため固定組立スクリプト（assemble-draft-section.ts）の契約範囲外。
      ドライランで決定的拒否記録を取得済み（reason: old_text occurrence count did not match expected_old_count）。適用時は
      アンカー行の一意性（1 件）と新宣言行の非存在（挿入前 0 件）を手動決定的検証の上、アンカー行直後に挿入する
      （2026-10-14 実測: アンカー行 1 件・新宣言行 0 件を確認済み）。
conflict_resolutions:
  - id: CR-001
    conflict: >-
      #3674 完了条件3「bun test 全体 fail 0 件」の絶対条件と、baseline（f6a842da）時点の既存 fail 79 件が残存する実態の衝突
      （本 Case の変更単独では suite 全体 fail 0 件が達成不能）。
    resolution: >-
      suite 全体 fail 0 件の維持ではなく、baseline 対照による本変更効果の確認（QG-4 既存 fail 由来分類による変更由来 0・由来不明 0 判定）
      へ Definition を再合意変更する。baseline 既存 fail 79 件の修復は本 Case の完了条件から除外し別単位で追跡する。
      根拠: 2026-10-14 利用者レビュー確定。QG-4 契約の例外運用ではなく正式な受け入れ条件変更として扱う。
  - id: CR-002
    conflict: >-
      #3676 の traceability check missing-design（REQ-050-014）の解消方法の未確定（対応宣言のみ不足か、Design 内容自体の不足か）。
    resolution: >-
      実態確認（2026-10-14）の結果、既存 Design に「旧公開入口3本を現役導線として残さない」契約は存在せず、Design 内容自体の不足と
      判定した。所有 Design（runtime-package-boundary.md）への最小補完（契約1項追記 + ADF-COVERS(design) 宣言追加）を正規経路で
      確定する。検査の緩和は不採用（traceability check exit 0 を Design 追記で実現）。根拠: 2026-10-14 利用者レビュー確定。
  - id: CR-003
    conflict: >-
      REQ-112-001/002 の受け入れ条件が実装後の状態（並列 tsconfig 非存在・品質検査経路で緑）を要求する一方、REQ-112-003 が当該実装を
      対象外とする REQ-112 自体の矛盾（traceability check で missing-implementation 3行・missing-verification 3行）。
    resolution: >-
      REQ-112 を方針決定要件へ整合させ（受け入れ条件を方針の記録突合へ変更）、実装義務は後続要件（新規 REQ）へ分離して保持する。
      #3681 の完了条件4も verify-only 完結へ整合させる。「将来実装が確定した要件」と「今回完遂する要件」の区別表現の一般化は
      機構再設計を伴うため v5 検討事項として REQ-112 適用範囲へ記録する（機構の再設計はしない）。
      根拠: 2026-10-14 利用者レビュー確定。
  - id: CR-004
    conflict: >-
      #3683 完了条件「repo 全体 docs-check エラー 0 件」と、本 Case 対象外の残存 strict findings
      （ReqFreshness 11・AUTOGEN 計測日 1・lint 3・distribution 8）により全体合格が構造上不能な実態の衝突。
    resolution: >-
      完了条件を対象文書の検証（check_changed_docs strict・対象要件行 traceability check・対照実行による新規違反 0・
      CR-003/CR-004 確定内容との突合一致）へ再合意する。repo 全体 docs-check のエラー 0 件は完了条件から除外し、全体検査の結果は
      記録として保持して未解決を合格と読み替えない。残存 strict findings は別単位で追跡する。
      根拠: 2026-10-14 利用者レビュー確定。
operation_units:
  - ou_id: OU-001
    target_req: null
    target_design: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: "案1。Root Case #3674 の完了条件3再合意（Definition 変更＝Issue 本文完了条件3 の書換。REQ/Design ファイル変更なし）"
  - ou_id: OU-002
    target_req: null
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    note: "案2。Root Case #3676 の Definition 変更（Design 最小補完 + ADF-COVERS 宣言追加）"
  - ou_id: OU-003
    target_req: REQ-112
    target_design: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    note: "案3(a)(c)。Root Case #3681 の Definition 変更（REQ-112 を方針決定要件へ整合・完了条件4 verify-only 化）"
  - ou_id: OU-004
    target_req: new:local-package-tsconfig-integration
    target_design: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    note: 案3(b)。後続要件の新規 REQ 作成（#3681 Definition の一部として case-revise が保存。実装は後続実行要求として別 Case で発生）
  - ou_id: OU-005
    target_req: null
    target_design: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    note: "案4。Root Case #3683 の完了条件再合意（Definition 変更＝Issue 本文完了条件の書換。実変更なし・Amendment PR なし）"
  - ou_id: OU-006
    target_req: null
    target_design: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    note: 案5。表現是正 6 行（4 ファイル）書換の新規 Case（bugfix・実現面のみ・RA-001 参照）
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      repo root を cwd とする bun test 全体実行（REQ-060 の実行形態）を行い、fail 全件に QG-4「fail 由来分類」
      （変更由来 / pre-existing / 実行形態由来 / 不明）を付与する。pre-existing 分類は baseline（f6a842da）での同一 fail
      再現確認で裏付ける。新規の検証機構は作らない。
    pass_criteria: |
      ①ENGINE_TREE 検査を含む workflow_body_contract.test.ts 全テスト pass、②移動後 definition-traceability-gate.test.ts が
      変更なしの検証内容・fixture で pass、③変更由来 fail 0 件かつ由来不明 fail 0 件（正規ランナー構成確認・正規形実行記録・
      環境ラベル・件数突合・fail 全件由来分類の機械受理基準記録を伴う）。
    on_failure: |
      fix-and-reverify。変更由来 fail を検出した場合は実装を修正して再検証する。由来不明 fail は未達扱いとし合格の根拠にしない。
      baseline 既存 fail 79 件は pre-existing 分類として本判定の対象外とする（修復は別単位で追跡）。
  - id: TS-002
    target_item: AG-002
    verification: |
      bun ./src/common/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-050-014 を実行する。
    pass_criteria: |
      exit code 0・全検査 pass（missing-design の解消）。
    on_failure: |
      fix-and-reverify。Design 補完・宣言の適用内容を修正して再検証する。検査の緩和は行わない。
  - id: TS-003
    target_item: AG-002
    verification: |
      check_changed_docs（--workflow design-save --files docs/designs/local/runtime-package-boundary.md）を実行する。
    pass_criteria: |
      変更 docs 検査の違反 0 件。
    on_failure: |
      fix-and-reverify。Design 追記内容を修正して再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |
      docs/requirements/REQ-112.md と docs/designs/local/runtime-package-boundary.md「## local ツール package の tsconfig 参照共有と
      typecheck 検査契約」節を突合し、①extends 参照・差分の Local 固有設定への限定、②組込みタイミング（誤 import 修正完了後・
      検査緑化前提）、③REQ-009-016 配布除外の維持、の3点が両文書で一致することを確認する。
    pass_criteria: |
      3点が両文書で一致し、矛盾が 0 件であること。
    on_failure: |
      fix-and-reverify。REQ または Design の記録を修正して再突合する。
  - id: TS-005
    target_item: AG-003
    verification: |
      implementation・verification 対応宣言の作成後に、traceability check --req REQ-112-001,REQ-112-002,REQ-112-003 を実行する。
    pass_criteria: |
      missing-implementation・missing-verification が解消され、方針記録実体（REQ-112.md・runtime-package-boundary.md Design 節）への
      implementation 対応と、記録突合（check_changed_docs・traceability check）の verification 対応が存在すること。
    on_failure: |
      fix-and-reverify。対応宣言の内容を修正して再検証する。対応を捏造しない。
  - id: TS-006
    target_item: AG-003
    verification: |
      新規 REQ ファイルを対象に check_changed_docs を実行し、generate_indexes 再実行後に docs/requirements/README.md・
      docs/README.md の索引追従を確認する。
    pass_criteria: |
      変更 docs 検査の違反 0 件・新規 REQ が索引へ掲載されていること。
    on_failure: |
      fix-and-reverify。REQ 記載・索引を修正して再検証する。
  - id: TS-007
    target_item: AG-004
    verification: |
      ①check_changed_docs（--workflow docs-check --files docs/designs/integrity/distribution-boundary.md --fail-level strict）を実行、
      ②traceability check --req REQ-029-001,REQ-029-002,REQ-029-003,REQ-029-004,REQ-029-005,REQ-029-006,REQ-029-007,REQ-029-008,REQ-029-010,REQ-029-011
      を実行、③対照実行による新規違反 0 の機械比較、④CR-003/CR-004 確定内容（#3683 Definition・HITL 確定記録〔Issue #3683 実現方針・
      停止記録 6155280852〕: 表現是正 6 件・baseline 追加 0 件・誤参照 0 件、判定差整理は処遇区分のみ運用・機構統合なし）と
      Design 反映内容（distribution-boundary.md「### 検査機構間の baseline 運用の整合と residual 参照の処遇区分」節）の突合。
    pass_criteria: |
      ①違反 0 件、②全項目 pass、③本 Case 起因の検出悪化 0 件、④突合一致。
    on_failure: |
      fix-and-reverify（本 Case 対象内の不備は修正して再検証する）。本 Case 対象外の残存 strict findings は
      record-in-findings: repo 全体 docs-check の結果は記録として保持し、未解消を合格と読み替えない。
  - id: TS-008
    target_item: AG-005
    verification: |
      修正対象 6 行（4 ファイル）の書換結果を確認する。対象行に含まれる旧 concrete-id 表現（THEME-001・REQ-060・REQ-108・
      REQ-021-024・REQ-061-023・IR-072）の残存を検索（rg 等）で確認し、See Also 等の参照行は検出対象外として扱う。
    pass_criteria: |
      対象 6 行の出典参照が一般化表現へ書換済みであり、網羅範囲が修正対象列挙（AG-005）と一致していること。
    on_failure: |
      fix-and-reverify。書換漏れ・書換過剰を修正して再検証する。
  - id: TS-009
    target_item: AG-005
    verification: |
      check_distribution_boundary（source profile）を実行する。是正完了後、baseline 残置は concrete-id ベースライン再取得手順
      （distribution-boundary Design 記載）で解消する。
    pass_criteria: |
      source profile の failures 0 件（是正・baseline 再取得後）。
    on_failure: |
      fix-and-reverify。残存検出を是正して再実行する。
  - id: TS-010
    target_item: AG-005
    verification: |
      check_distribution_boundary（link profile）を実行し、投影追随を確認する。
    pass_criteria: |
      link profile の failures 0 件。
    on_failure: |
      fix-and-reverify。投影追随の残存を是正して再実行する。
  - id: TS-011
    target_item: AG-005
    verification: |
      producer 側 traceability/ 配下 sidecar に 6 行分の出典情報（一般化前の concrete-id と出典の対応）が保持されていることを確認する。
    pass_criteria: |
      出典情報が sidecar へ保持され、配布物本文へ出典番号を投影していないこと。
    on_failure: |
      fix-and-reverify。sidecar の出典情報を補完して再確認する。
realization_actions:
  - id: RA-001
    concern: 配布物本文 6 行の表現是正と出典情報の producer 側保持
    responsibility: >-
      配布物本文の記述規則（一般化表現・concrete ID 非記載）に従い、対象 6 行（4 ファイル）の出典参照を一般化表現へ書き換える。
      書換により失う出典情報（THEME-001・REQ-060・REQ-108・REQ-021-024・REQ-061-023・IR-072 の出典対応）は producer 側
      traceability/ 配下 sidecar へ保持する。See Also 等の参照行は検出対象外とし変更しない。是正完了後、baseline 残置は
      concrete-id ベースライン再取得手順で解消する。
    ownership_hints:
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/README.md（2 行）
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md（1 行）
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（3 行）
      - traceability/ 配下 sidecar（出典情報の保持先）
      - check_distribution_boundary・concrete-id baseline 再取得手順（docs/designs/integrity/distribution-boundary.md）
    intent: >-
      consumer 解決不能性の解消（表現是正区分の実行）と check_distribution_boundary 残存 8 failures の是正・baseline 収束。
      #3683 CR-003 の処遇確定を実行単位へ落とす。
    verification_refs: [TS-008, TS-009, TS-010, TS-011]
    source_items: [AG-005]
review_dispositions: []
assembly_evidence:
  - target_file: docs/requirements/REQ-112.md
    target_content_sha256: 31b2d06d84b5cc79bf35a201aed4e23c55d5bd8d9ec9e7351d0b853a0e5173e6
    check_scope: {heading: "## 要件", start_line: 13, end_line: 21}
    execution_conditions: {operation: replace, edit_sha256: 45cb799c42827e19c4c6632e169a1626e0c599049bcee810946114e8c104b036, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: "0.1.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-13T23:57:22.300Z"
    note: ACT-REQ-001 行001置換（OU-003）
  - target_file: docs/requirements/REQ-112.md
    target_content_sha256: 31b2d06d84b5cc79bf35a201aed4e23c55d5bd8d9ec9e7351d0b853a0e5173e6
    check_scope: {heading: "## 要件", start_line: 13, end_line: 21}
    execution_conditions: {operation: replace, edit_sha256: d65c9f103bcea4a35fd254d38628936c252b539f49d0aa09072de731e5f98bd0, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: "0.1.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-13T23:57:22.470Z"
    note: ACT-REQ-001 行002置換（OU-003）
  - target_file: docs/requirements/REQ-112.md
    target_content_sha256: 31b2d06d84b5cc79bf35a201aed4e23c55d5bd8d9ec9e7351d0b853a0e5173e6
    check_scope: {heading: "## 適用範囲", start_line: 22, end_line: 27}
    execution_conditions: {operation: append, edit_sha256: 52c13137356a171962043b1faf900f576fa303380bb895418b2fc6e5bd09c0af, expected_old_count: null}
    checker: {name: assemble-draft-section, version: "0.1.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 2, all_ok: true}, post: {count: 2, all_ok: true}}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 0}
    executed_at: "2026-10-13T23:57:22.635Z"
    note: ACT-REQ-001 適用範囲追記（OU-003）
  - target_file: docs/designs/local/runtime-package-boundary.md
    target_content_sha256: feaa60259c055df1a89ed70e3b30edfd223bbf12f6b9dc8b141e931254b4c08a
    check_scope: {heading: "## scripts 公開入口と内部配置", start_line: 269, end_line: 296}
    execution_conditions: {operation: replace, edit_sha256: 9e553688d41d4ddd1dbcba34d4536428cd470c9ff01c421ff1397b833a9809fc, expected_old_count: 1}
    checker: {name: assemble-draft-section, version: "0.1.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: "target section only"}
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 0}
    executed_at: "2026-10-13T23:58:13.501Z"
    note: ACT-DESIGN-001 箇条書き追記（OU-002。挿入点は末尾文脈アンカー方式＝old_text に次見出し行を含めて +1 行挿入）
case_open_hints:
  epic_needed: false
  root_cases:
    - {ou: OU-001, root_case: "#3674", route: "case-revise（Definition 変更: Issue 完了条件3 書換）→ case-ready → case-close 再開（PR #3697 マージ判断。worktree .worktrees/3674-impl・branch fix/issue-3674 温存）"}
    - {ou: OU-002, root_case: "#3676", route: "case-revise（Definition 変更: Design 補完 → Definition Amendment PR）→ case-ready → case-run 再開（worktree .worktrees/3676-impl 保持差分の再確認 → traceability check 再実行 → commit/push/PR 作成）→ case-close"}
    - {ou: OU-003, root_case: "#3681", route: "case-revise（REQ-112 update → Amendment PR）→ case-ready → case-run（implementation・verification 対応宣言作成・verify-only）→ case-close"}
    - {ou: OU-004, root_case: "#3681（Definition の一部）", route: "REQ ファイル作成は #3681 の case-revise が実施（採番は決定的採番スクリプト）。実装は後続実行要求として別 Case で発生"}
    - {ou: OU-005, root_case: "#3683", route: "case-revise（Issue 完了条件書換・実変更なし → Amendment PR なし）→ case-ready → case-close 再開"}
    - {ou: OU-006, root_case: "新規", route: "case-open（新規 Root Case・bugfix・実現面のみ）→ 標準 lifecycle（RA-001 実行）"}
  common_constraints: >-
    本変更は QG-4 契約の例外運用ではなく、正式な要件・受け入れ条件の変更として扱う。新規の共通検証機構・管理制度は作らない。
    既存の実装・証拠・PR・Issue 状態は保持し、再実行しない（合意根拠: 2026-10-14 利用者レビュー確定）。
  batch_note: >-
    5案（AG-001〜AG-005）を単一 draft として管理（利用者確定 Q1）。案3は REQ 操作 2 件（OU-003/OU-004）へ展開。
    baseline 既存 fail 79 件の修復と #3683 残存 strict findings（ReqFreshness 11・AUTOGEN 計測日 1・lint 3・distribution 8）は
    本 draft の対象外とし、req-define 完了報告後に追跡案件として起票する（利用者確定 Q3）。
```

# summary

停止中4 Root Case（#3674/#3676/#3681/#3683）の受け入れ条件再合意と、#3683 CR-003 由来の表現是正 6 行 bugfix を単一 draft として要件化した。
合意文面は 2026-10-14 利用者レビューで全案確定済み（修正なし）。Jev 先行評価 2 観測（既存REQ照合・Design 分離）と adversarial-review
（findings: accepted 2・rejected 1）を実施し、局所修正 4 件は固定組立スクリプトで検査証拠付きで確定、ADF-COVERS 宣言追記は
決定的拒否記録と手動検証（アンカー行 1 件・新宣言行 0 件）をもって judgment-diff として記録した。
