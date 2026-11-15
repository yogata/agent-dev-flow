---
draft_type: req_draft
topic_slug: ou006-distribution-reference-resolution
status: draft
created_at: "2026-11-15T14:36:03+09:00"
source_rus: [RU-0279]
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >
  RU-0279（Epic #4054 利用者レビュー①・OU-006）として受理した不具合の是正要件である。
  PR #4065（RU-0277/C-11）で adversarial-review-integration.md の3複製を1正本+2参照へ再構成した際、
  相互参照のパス表記が上流リポジトリ専用の src/common/skills/... 形式となり、
  配布・導入環境（.opencode/skills/agentdev-* junction 構成）で正本参照が解決できなくなっていた。
  正本1件（adapter）と参照2件（case-open・req-define）の相互参照7箇所を、配布セット内の前例と同一の
  投影形式（.opencode/skills/agentdev-*）へ是正し、配布先・上流の両レイアウトで参照解決を成立させる。
  REQ操作なし（REQ-002-027 の既存行で要求が成立、direct_case 構成）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      是正対象と形式。2つの参照ファイル（src/common/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md
      の2箇所〔5行・10行〕、src/common/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md
      の3箇所〔6行・13行・31行〕）が正本を指す
      src/common/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md 形式の記述を、
      配布セット内の前例形式（adapter SKILL.md 180行の .opencode/skills/agentdev-git-worktree/references/...、
      artifact-validation SKILL.md 65-71行の .opencode/skills/agentdev-artifact-validation/scripts/... と同一の
      .opencode/skills/agentdev-* 形式）へ是正する。この形式は配布先（install.ps1 の junction 構成:
      .opencode/skills/agentdev-* → .agentdev-plugin/src/common/skills/agentdev-*）と上流自己ホスト
      （.opencode/skills/agentdev-* → src/common/skills/agentdev-* junction）の両レイアウトで同一の記述により解決する。
  - id: AG-002
    content: |
      正本側逆参照の同時是正（調査で確認した同一欠陥クラス）。正本
      （src/common/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md）の
      6行・136行が caller 参照ファイル2件を src/common/skills/agentdev-workflow-case-open/... ・
      src/common/skills/agentdev-workflow-req-define/... 形式で指しており、配布先で参照ファイルと同一に解決できない。
      RU-0279 の対象「正本・参照・設計（adversarial-review Design『caller integration 共通契約』節）の記述整合の維持」
      および受け入れ条件2・3（同一の記述で両レイアウト成立）に従い、正本の逆参照2箇所も同一の投影形式へ是正する。
      正本の内容変更と3ファイルの再分割は行わない（PR #4065 の構成は維持。Design はパス形式を規定しておらず編集不要）。
  - id: AG-003
    content: |
      修正前再現記録と是正後の両レイアウト解決確認。着手前に、配布先と同等のレイアウト
      （install.ps1 による一時導入先、または junction 構成を等価に再現した検査環境）で、
      2ファイルの正本参照パスが実ファイルとして解決できないことを記録する。
      是正後、同一の配布レイアウトで正本参照が解決できること（参照先の実在を機械確認）、
      および上流リポジトリ（自己ホスト）のレイアウトでも同一の記述で参照が解決することを確認する。
      worktree では projection 側 junction が未伝播であり得ることは既知の環境差であり
      （参照先解決ポリシーの環境フォールバック）、本要件の両レイアウト確認はメインツリー基準とする。
  - id: AG-004
    content: |
      配布側試験・check_integrity 系の回帰なし。是正によって配布側試験・check_integrity 系が
      新たに不合格にならないこと。既知の integrity suite pre-existing 3件（relied-diff T6 後続消費経路、
      cli-e2e PowerShell entry の -BootstrapMode archive、-SeedMode alias）は RU-0280 由来の別案件として
      本合格基準の妨げとしない（差分評価で扱う）。
  - id: AG-005
    content: |
      E4-1 配布依存境界 gate の非検出事実の記録と強化要否評価。E4-1 gate が今回の参照形式差を検出しなかった事実
      （Epic #4054 完了記録コメント 6884658730 検証差分表: 7 PR HEAD・source profile・全7件 exit 0・failures 0）を
      是正記録（PR 本文・完了記録）に含める。検出強化の要否は実装側で評価し、必要な場合は別候補として明示する
      （強化実装そのものは本件の対象外）。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0279
    target_req: null       # REQ操作なし（REQ-002-027 の既存行で要求が成立、direct_case 構成）
    operation: update      # 実現面（配布スキル参照ファイル3件のパス表記）の更新。REQ/Decision/Design の保存操作は伴わない
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      配布先と同等のレイアウト（install.ps1 による一時導入先、または junction 構成を等価に再現した検査環境）を用意し、
      是正前の2参照ファイルの正本参照パス（src/common/skills/... 形式）を実ファイルとして解決試行した結果を
      着手前に記録する。
    pass_criteria: |
      2ファイルの正本参照（計5箇所）が配布レイアウトで解決できないことが実測として記録されていること。
    on_failure: |
      fix-and-reverify。再現が成立しない（参照が解決できる）場合は欠陥の前提を再評価し、壁打ちに差し戻す。
  - id: TS-002
    target_item: AG-001
    verification: |
      是正後、TS-001 と同一の配布レイアウトで、2参照ファイル内の正本参照（是正後形式）の参照先実在を
      パスの実ファイル存在確認により機械確認する。
    pass_criteria: |
      参照ファイルから正本への全参照（5箇所）が実在ファイルとして解決できること。
    on_failure: |
      fix-and-reverify。是正したパス表記を修正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      上流リポジトリ（自己ホスト）のメインツリーで、是正後の記述（.opencode/skills/agentdev-* 形式）の
      参照先（正本・参照の相互参照7箇所）が実在することを機械確認する。
    pass_criteria: |
      配布レイアウトと同一の記述で上流メインツリーでも全参照が解決すること（両レイアウト成立）。
    on_failure: |
      fix-and-reverify。両レイアウトで解決できる形式へ修正して再確認する。
  - id: TS-004
    target_item: AG-002
    verification: |
      対象3ファイル（正本1・参照2）に対し、src/common/skills/agentdev- を含む参照記述の残存を機械検索（rg）する。
      検索範囲は修正対象3ファイルに限定する（他ファイルの script 実行コマンド等の運用記述、開発管理成果物
      （scripts/README、試験コード）は修正対象外であり検出対象から除外する）。
    pass_criteria: |
      対象3ファイル内に旧形式（src/common/skills/agentdev-...）の相互参照残存が0件であること。
    on_failure: |
      fix-and-reverify。残存を全て是正後に再検索して0件を確認する。
  - id: TS-005
    target_item: AG-004
    verification: |
      是正後、textlint 関連の配布側試験と check_integrity 系（配布依存境界 gate を含む）を実行する。
    pass_criteria: |
      本変更に起因する新規不合格が0件であること。既知 pre-existing 3件は別案件（RU-0280 系）として
      差分評価で扱い、本合格基準の妨げとしないこと。
    on_failure: |
      fix-and-reverify。本変更起因の不合格は是正して再検証する。
  - id: TS-006
    target_item: AG-005
    verification: |
      是正記録（PR 本文・完了記録）に、E4-1 gate が今回の形式差を検出しなかった事実
      （7 PR HEAD・source profile・exit 0・failures 0）と、検出強化の要否評価の結果
      （要否の判断と、必要な場合の別候補明示）が記載されていることを確認する。
    pass_criteria: |
      非検出の事実と評価結果の両方が是正記録に記載されていること。
    on_failure: |
      fix-and-reverify。記載漏れは補記して再確認する。

realization_actions:
  - id: RA-001
    concern: 配布スキル参照ファイル群の相互参照パスが配布先レイアウトで解決不能である不具合の実現面是正
    responsibility: >
      src/common/skills 配下の adversarial-review-integration 3ファイル（正本1・参照2）に記述された相互参照パス表記を、
      両レイアウトで解決できる投影形式（.opencode/skills/agentdev-*）へ置き換える。
      意味内容（正本・参照の分工、Design を正とする関係）は変更しない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/references/adversarial-review-integration.md（参照・是正2箇所）"
      - "src/common/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md（参照・是正3箇所）"
      - "src/common/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md（正本・逆参照是正2箇所）"
      - "規定要件行: docs/requirements/REQ-002.md REQ-002-027（配布成果物の実行時依存パスは導入先環境で解決可能であること）"
      - "配布レイアウト仕様: scripts/install.ps1（.opencode/skills/agentdev-* → .agentdev-plugin/src/common/skills/agentdev-* junction）"
      - "投影検出データ: .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml（スキル単位の列挙であり本是正で変更なし）"
      - "前例: src/common/skills/agentdev-case-run-execution-adapter/SKILL.md 180行、src/common/skills/agentdev-artifact-validation/SKILL.md 65-71行"
      - "設計: docs/designs/skills/agentdev-adversarial-review.md「adversarial-review caller integration 共通契約」節（パス形式を規定せず、本是正で編集不要）"
    intent: >
      PR #4065（RU-0277/C-11、Epic #4054 OU-006）で3複製を1正本+2参照へ再構成した際に参照形式が上流専用パスとなり、
      配布・導入環境で正本参照が解決できなくなっていた（Epic #4054 利用者レビュー①）。
      REQ-002-027 への適合を回復する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005]
    source_items: [AG-001, AG-002, AG-003, AG-004]
  - id: RA-002
    concern: E4-1 配布依存境界 gate が参照形式差を検出しなかった事実の記録と強化要否評価
    responsibility: >
      是正記録（PR 本文・完了記録）への事実記載と、検出強化の要否評価（必要なら別候補として明示）。
      強化の実装は行わない。
    ownership_hints:
      - "E4-1 gate の設計: docs/designs/integrity/distribution-boundary.md"
      - "非検出事実の一次記録: Epic #4054 完了記録コメント 6884658730 検証差分表（7 PR HEAD・source profile・全7件 exit 0・failures 0）"
    intent: >
      同種の配布依存境界違反が gate を素通りした事実を是正記録に残し、将来の検出強化判断の材料とする。
    verification_refs: [TS-006]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0279
    source_item: "対象外/E4-1配布依存境界gate検出強化の実装"
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0279 が対象外と明示（本 RU では事実の記録まで。強化の要否評価は実装側で行い、
      必要なら別候補として明示）。AG-005・RA-002 が記録と評価までを本 Case の対象として保持する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0279.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0279
    source_item: "対象外/既知欠陥3件（integrity suite pre-existing fail）の修正"
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0279 が対象外と明示。RU-0280 は完了記録への追記（3件を別案件として位置づける記録）までであり、
      3件の修正実施自体はいずれの Case でも実施しない（必要に応じて別案件）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0280.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
  notes: >
    direct_case 構成（artifact_actions 空）。RU-0280 由来の記録是正 Case（Epic #4054 完了記録への追記）とは
    並行可能（depends_on なし、 RU-0279 と RU-0280 は相互独立）。
```

# summary

- 操作分類: REQ操作なし。REQ-002-027（配布成果物の実行時依存パスは導入先環境で解決可能であること）の既存行で要求が成立するため、REQ/Decision/Design の保存操作を伴わない direct_case 構成。
- adversarial-review（STEP-8）skip 判定: 軽量是正・Decision 判断対象なし・内容が RU・既存要件行・配布セット内前例からの機械的導出のため、req-define 固有 skip 条件に該当と判定した。代替自己反証として「RU の対象列挙は2ファイル限定に読める」点を検討し、対象4の記述整合維持と受け入れ条件2・3の「同一の記述で両レイアウト成立」が正本逆参照（2箇所）の是正を含む前提でしか成立しないことから AG-002 に組み込み、本提示で利用者確認可能とした。
- 変更誘発境界リスク分析（5観点）の確認記録: dependency boundary（参照先は変わらず意味保存。REQ-002-017 との緊張は PR #4065 構成維持で確定済み）、client/server boundary（該当なし）、execution boundary（実行時の読み手にとって解決経路のみ変化。TS-002/003 で担保）、build/runtime boundary（projection manifest はスキル単位自動追随で変更なし。TS-005 で担保）、environment propagation boundary（worktree の junction 未伝播は既知の環境差で参照先解決ポリシーのフォールバック対象。AG-003 にメインツリー基準と明記）。
- 対象外（参考）: 3ファイル以外の配布物に残る src/common/skills 形式の記述（script 実行コマンド等の運用記述）の全域是正は本件では扱わない。必要な場合は別候補として扱う。
