---
draft_type: req_draft
topic_slug: distribution-reference-generalization
status: saved
created_at: 2026-09-11
source_rus: [RU-0001]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — 規則は運用確立済み（PR #2745/#2748/#2760/#2761）であり本 draft は RU 承認済み方向の明文化・是正のみ。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: 配布物（src/opencode 配下配布物含む）の残存是正と Design 規則明文化を伴う既存挙動の是正
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

# summary: 配布物本文・コメント・reference に残る内部 concrete ID / docs 内部パス参照（IR-055 反復原因）について、規則の Design への明文化と既存残存箇所 11 件以上の段階的概念語化、worktree-operations.md L146 参照解消と IR-055 baseline 該当エントリ除去を同一要件単位として確定した。
summary: 配布依存境界 Design へ「対応関係は宣言行へ集約、本文は節名・一般名詞で記述、docs 内部パスを配布物へ残さない」規則を明文化し、既存配布物 10 ファイルの残存内部 ID・パス表記を段階的概念語化する。あわせて worktree-operations.md L146 の docs/designs パス参照を解消し IR-055 baseline の該当エントリを除去する。受け入れ条件は配布依存境界・IR-055・traceability 検査の新規違反 0 件。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      配布依存境界系契約（docs/designs/integrity/distribution-boundary.md）へ配布物内部参照の回避規則を明文化する。
      規則の内容は、① REQ/Design ID 等の対応関係は ADF-COVERS 宣言行へ集約し、配布物本文は設計契約名や節名等の一般化表現で記述する、
      ② 配布物本文・コメント・reference に本体内部 concrete ID（REQ-NNN-NNN、IR-NNN、DEC-NNN）を残さない、
      ③ docs/ 内部パス参照を配布物へ残さない（「Design一覧」等の一般名詞で置換）。
      規則そのものは PR #2745/#2748/#2760/#2761 で運用確立済みであり、正規文書への明文化が本項目の本体である。
  - id: AG-002
    content: |
      src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L146 の
      docs/designs/local/runtime-package-boundary.md 参照（IR-055 既知 delta として baseline 登録済み）を
      表現解消する。package rename 時の bun.lock 確認手順への参照は「runtime-package-boundary Design の
      本体リポジトリ sync 節」等の節名ベース表現へ置換し、docs 内部パス表記を残さない。
      是正後に IR-055 baseline の該当エントリを併せて除去する。
  - id: AG-003
    content: |
      既存配布物 10 ファイルに残存する本体内部 ID（REQ-NNN-NNN、IR-NNN）・docs/designs/ パス表記を
      段階的に概念語化する。対象範囲は distribution-artifact-existing-findings-remediation-candidates #1
      の残存箇所リスト（11 件以上が baseline 既知 delta 登録済み）。一括必須ではなく段階的解消を許容するが、
      本 case の完了時点で AG-002 対象分と合わせて新規検出が 0 件であること（baseline 残存は段階解消対象として
      明示的に記録して残す運用を維持）。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/distribution-boundary.md
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target_area: 配布物本文の記述規則（内部 ID・パス参照の回避）を定義する既存セクション。該当セクションが存在しない場合は配布依存境界の記述規則に関するセクションへの追加
    source_items: [AG-001]
    content: |
      配布物（配布 command / skill / template / script）の本文・コメント・reference における
      内部参照の記述規則を以下のとおり明文化する。
      - 対応関係（REQ/Decision ID との対応）は ADF-COVERS 宣言行へ集約する。配布物本文に concrete ID を直接記載しない
      - 配布物本文は設計契約名、Design 節名、内容説明などの一般化表現で記述する
      - docs/ 内部パス参照（docs/designs/、docs/requirements/ 等のパス表記）を配布物へ残さない。
        導入先で解決できない参照は「Design一覧」等の一般名詞表現へ置換する
      - 本規則は REQ-029（配布依存境界）および IR-055 の enforcement に接続し、
        違反は配布依存境界検査・IR-055 検査で検出する
    status: saved

conflict_resolutions:
  - id: CR-001
    conflict: 配布物 10 ファイルの概念語化を本 case で一括完了するか段階解消とするか
    resolution: |
      段階的解消を許容する（RU-0001 の要件化の方向「段階的に概念語化する」を継承）。
      根拠: 残存箇所は baseline 既知 delta として triage 管理されており、新規違反 0 件の受け入れ条件を
      満たした上で baseline 残存を段階的に消化する運用（IR-055 triage_action の baseline 運用）と整合する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: null
    target_design: docs/designs/integrity/distribution-boundary.md
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
      配布依存境界検査（check_distribution_boundary.ts）と IR-055 検査、traceability 検査を
      AG-001 の Design 変更後に実行し、本変更起因の新規違反が 0 件であることを確認する。
      base 既知違反と変更起因の新規違反を分離して突合する。
    pass_criteria: |
      check_distribution_boundary / IR-055 / traceability の各検査で新規違反 0 件。
      distribution-boundary.md に 3 規則（宣言行集約、一般化表現、内部パス非残存）が明記されていること。
    on_failure: |
      fix-and-reverify。Design 記述の不備（規則の曖昧さ、既存規則との矛盾）を修正して再検証する。
      検査器側の改変で違反を隠蔽しない。
  - id: TS-002
    target_item: AG-002
    verification: |
      worktree-operations.md L146 の置換後表記を確認した上で IR-055 検査を実行し、
      該当箇所の検出が解消されていることを確認する。その後 IR-055 baseline の該当エントリが
      除去されたことを baseline ファイル（または exemption 登録箇所）で突合する。
    pass_criteria: |
      worktree-operations.md から docs 内部パス表記が消失し、IR-055 検査が該当箇所を検出しない。
      baseline の該当エントリが除去済みである。
    on_failure: |
      fix-and-reverify。表記置換の漏れまたは baseline 除去漏れを修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      概念語化実施後に IR-055 検査と配布依存境界検査を実行し、本変更起因の新規違反が 0 件であることを確認する。
      段階解消として残置する baseline 既知違反が、解消済み箇所と誤って混在していないか
      baseline リストと突合する。
    pass_criteria: |
      新規違反 0 件。baseline には段階解消対象のみが残り、解消済み箇所のエントリは除去されている。
    on_failure: |
      fix-and-reverify。解消済み箇所の baseline エントリ残存を是正する。
      baseline 残置分は intake / backlog 経由の段階解消対象として記録する（record-in-findings は
      新規違反に対しては採用しない）。

realization_actions:
  - id: RA-001
    concern: worktree-operations.md の docs 内部パス参照解消と IR-055 baseline エントリ除去
    responsibility: |
      配布物本文の内部参照回避は REQ-029（配布依存境界）・REQ-002（配布成果物の責務境界）が正規所有する。
      worktree-operations.md は agentdev-git-worktree skill 配布物であり、配布依存境界規約の適用対象。
      IR-055 baseline 管理は IR-055 runtime-unresolved-reference の triage 運用（REQ-010-007 系）が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L146
      - IR-055 baseline 登録箇所（docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md の baseline 運用参照先）
      - docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md
    intent: |
      配布物へ残存する docs 内部パス参照（consumer で解決不能）を解消し、IR-055 反復原因の該当箇所を閉じる。
      baseline エントリの併せて除去により、解消済み違反の再突合ノイズを除去する。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: 既存配布物 10 ファイルの残存内部 ID・パス表記の段階的概念語化
    responsibility: |
      配布依存境界規約（REQ-029）の enforcement 対象として distribution-boundary Design が規則を所有する。
      個別配布物の修正は配布物の正規所有者（各 command/skill Design）と配布依存境界契約の整合で実施する。
    ownership_hints:
      - distribution-artifact-existing-findings-remediation-candidates #1 の残存箇所リスト（intake promoted 成果物参照）
      - IR-055 baseline 既知 delta 登録箇所
      - docs/designs/integrity/distribution-boundary.md
    intent: |
      運用で確立済みの回避規則（宣言行集約・一般名詞化）を既存残存箇所へ適用し、
      反復原因（consumer で解決不能な内部参照）の残存を段階的に閉じる。
    verification_refs: [TS-003]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: requirements-direction-1
    disposition: covered
    reason_code: scope_confirmed
    reason: |
      規則明文化（要件化の方向 1）は ACT-DESIGN-001 として Design 更新対象に確定。
    evidence:
      path: docs/designs/integrity/distribution-boundary.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: requirements-direction-2
    disposition: covered
    reason_code: scope_confirmed
    reason: |
      worktree-operations.md L146 解消と IR-055 baseline エントリ除去（要件化の方向 2）は
      RA-001 として実現面変更方針に確定。TS-002 で検証する。
    evidence:
      path: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
      section: L146
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: requirements-direction-3
    disposition: partially_covered
    reason_code: staged_remediation
    reason: |
      配布物 10 ファイルの概念語化（要件化の方向 3）は段階的解消として受理。
      本 case で新規違反 0 件（TS-003）を達成するが、baseline 残存分は intake / backlog 経由の
      段階解消対象として後続へ残す（一括完了は要求しない）。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: requirements-direction-4
    disposition: covered
    reason_code: scope_confirmed
    reason: |
      受け入れ条件（配布依存境界・IR-055・traceability 検査の新規違反 0 件）は
      TS-001/TS-002/TS-003 の pass_criteria として投影済み。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0003（distribution-change-immediate-checks）が同一関心領域（配布物検査運用）の draft。同時実行時の commit 順序注意のみで技術的依存はない
```

# summary

RU-0001（配布物内部参照の一般化・是正）を 1 つの maintenance case として要件化した。Design（distribution-boundary.md）への規則明文化、worktree-operations.md L146 解消と IR-055 baseline エントリ除去、既存配布物 10 ファイルの段階的概念語化の 3 系統で構成する。受け入れ条件は配布依存境界・IR-055・traceability 検査の新規違反 0 件。
