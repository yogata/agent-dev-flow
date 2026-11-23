---
draft_type: req_draft
topic_slug: codex-antigravity-distribution-support
status: draft
created_at: "2026-11-23T13:04:37Z"
source_rus: [RU-0306]
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  共通原本を維持し、配布側に Codex と Antigravity のドキュメント管理、コマンド、スキルの接続を追加する。
  新ホストの導入は利用者が選んだ導入先リポジトリに限定し、既存の入口条件を維持する。
  案Aの GitHub 操作案内と worktree 終了時の品質ゲートを定義し、新ホストの動作保証範囲と利用者確認を区別する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      対象1。Codex・Antigravity の両方について、ドキュメント管理・コマンド・スキルを配布する。
      src/common/ のホスト非依存の共通正本とホスト別接続を分離し、業務手順をホスト別に独立編集しない。
  - id: AG-002
    content: >-
      対象2。導入先は利用者がリポジトリごとに選ぶ。ホーム全域には導入しない（対象外2）。
  - id: AG-003
    content: >-
      対象3。agent-dev-flow 本体への新ホスト導入を含めない（対象外2）。助手提案に由来し、監督が提示した現行のスコープ境界であり、利用者自身の個別判断ではない。
  - id: AG-004
    content: >-
      対象4。Antigravity 仕様は公開情報に基づく検討と明記する。本件の実行担当は実機検証を行わず、動作確認は利用者が行う（対象外6）。
  - id: AG-005
    content: >-
      対象5。各新ホストの既存 GitHub プラグインを使う方針とし、agentdev_gh の MCP サーバー化および独自の MCP 化は行わない（対象外3）。
  - id: AG-006
    content: >-
      対象6。src/common/skills/ 配下で agentdev_gh を参照する配布スキル17件（repo-local の repo-agentdev-integrity を除く）は新ホストでの動作保証の対象外とし、Issue や PR を出す処理は OpenCode で行う（対象外4）。
  - id: AG-007
    content: >-
      対象7。案Aでは、17スキルの本文中で agentdev_gh と記述している操作を各新ホストの GitHub プラグイン操作で代える説明を、1つのスキルに集約する。
      この説明は17スキルの動作保証を意味しない。未確認のプラグイン能力を実証済みとは記述しない（対象外6）。
  - id: AG-008
    content: >-
      対象8。textlint の書込み前 hook は新ホストへ移さず、案Aでは worktree を閉じるとき src/opencode/plugins/agentdev-textlint-guard/gate.ts を使う導線を定義する（対象外5）。
  - id: AG-009
    content: >-
      対象9。まず各ホストの既存能力を使い、不足と判断したものだけを agent-dev-flow 側から取り込む。
      ホストに同等機能があるのに取り込んだ場合は、能力が不足すると判断した理由を記録する。独自の MCP 化は行わない。
  - id: AG-010
    content: >-
      対象10。対応スキルに書かれていないものも含め、既存コマンドの入力契約、編集範囲その他の入口のガードを、新ホストの公開入口でも失わない。
  - id: AG-011
    content: >-
      対象11。現行の .opencode/ 参照を棚卸しし、調査結果と対処を定義に反映する。OpenCode 併用を変更不能の要件にしない。
      Issue/PR を出す処理の担当を OpenCode に限定することと、全機能に OpenCode 併用を要求することは区別する。
  - id: AG-012
    content: >-
      対象12。監督が決定し利用者に提示した扱い（個別の承認文言なし、異論なし）。
      (a) gh の書き込みを止める guard は、新ホストの GitHub プラグインが fallback で使う gh pr create も止めてしまうため移設しない。この理由をプラグイン能力の実証とは扱わない。
      (b) 配布領域を守る guard は ADF 自身の配布物を守るもののため移設しない。
      (c) agentdev_third_party は配布スキルに利用実績がないため移設しない（RU 実測では repo-local の投影 manifest 1ファイルだけが参照）。以上は対象外8。
      (d) コマンドは Senpi と同じくスキル名で起動し、業務名（req-define、case-auto 等）と引数の意味を保つ。
  - id: AG-013
    content: >-
      AC-7。配布境界検査、整合性チェック等のリポジトリ標準検証を実施する。利用者による動作確認は確認項目を明記し、実施者と証拠を標準検証から区別する。
  - id: AG-014
    content: >-
      AC-8。RU の対象外8項目すべてを守る。特に別案件（Issue #4218、PR #4219）とその由来作業、および feature/issue-4214 と .worktrees/4214-feature を変更・消費しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-001, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013]
    application_note: 既存要件表の末尾へ連続行として追記する。見出しに対する汎用 Markdown 追記のプレビューに入る空行は、要件表には挿入しない。
    content: |
      | REQ-099-021 | Codex と Antigravity に文書管理、コマンド、スキルを配布し、ホスト別接続から同じ業務契約を参照できること |
      | REQ-099-022 | 新ホストのコマンドはスキル名で起動し、既存の業務名、引数の意味、入力契約、編集範囲その他の入口条件を維持すること |
      | REQ-099-023 | 新ホストの GitHub プラグイン操作案内を1つのスキルに集約し、agentdev_gh を参照する配布スキル（対象基準版の17件。repo-local を除く）を新ホストでの動作保証から除外すること。Issue/PR を出す処理は OpenCode で行い、ADF 独自の MCP 接続および agentdev_gh の MCP サーバー化は行わないこと |
      | REQ-099-024 | Antigravity 向けの仕様検討は公開情報に基づき、実行担当は実機検証を行わず、利用者が動作を確認すること。未確認のプラグイン能力や公開仕様からの推定を実証済みと表示しないこと |
      | REQ-099-025 | 新ホストでは書込み前の文章検査 hook を導入せず、案Aの worktree 終了時に既存の文章品質ゲートを利用できること |
      | REQ-099-026 | 新ホストの既存能力を優先し、不足と判断した機能だけを ADF 側から取り込むこと。同等の機能がホストにある場合は不足と判断した理由を記録すること |
      | REQ-099-027 | 既存 OpenCode 参照の調査結果と対処を記録し、個別に担当を限定した処理を除き、OpenCode の併用を新ホストの固定要件にしないこと |
      | REQ-099-028 | 新ホストには既存の gh 書込み禁止 guard、ADF 本体の配布領域 guard、agentdev_third_party を移設しないこと。既存ホストの接続契約と適用範囲を維持すること |
      | REQ-099-029 | 新ホストの配布対応は配布境界検査、整合性チェック等のリポジトリ標準検証を満たし、利用者が行う動作確認の項目と期待結果を明示すること |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-099-010 | installer の単一公開入口と check／dry-run／apply の3モードを維持し、OpenCodeのみ、Senpiのみ、両方への既存の配置選択を保持すること。導入先では Codex と Antigravity を利用者がリポジトリごとに選択できること。新ホストのホーム全域への導入、および本体リポジトリへの導入は対象外とする。配置対象選択の詳細（新規導入・既存導入更新の選択肢と既定、self-sync の投影整合）は multi-host-canonical-model.md と runtime-package-boundary.md が所有する |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-002, AG-003]
    content: |
      | REQ-009-040 | 同期、インストール手段は引数なしで起動した場合、対話ウィザードにより実行モードを問うこと（install は環境も問う）。install は既存の配置対象選択（OpenCode のみ、Senpi のみ、両方）と明示指定を維持し、Codex と Antigravity についても導入先リポジトリ単位で利用者が選択・明示指定できること。新ホストをホーム全域および本体リポジトリへ導入しないこと |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-099.md
    target_area: 目的
    source_items: [AG-001, AG-004, AG-006, AG-012]
    content: |
      本要件は Codex・Antigravity の文書管理、コマンド、スキルの配布接続も所有する。両ホストに共通の接続・保証要件として記述した OpenCode・Senpi の既存契約は維持し、Codex・Antigravity の接続と保証の範囲は新ホスト向けの要件行で別に定める。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:codex-antigravity-distribution-support
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |
      ---
      related_reqs: [REQ-099, REQ-009]
      relations:
        - type: supersedes
          target: DEC-049
          reason: 決定(3) の配置選択肢の範囲のみを部分置換する。その他の決定と既存ホストの契約は維持する。
      ---

      # Codex・Antigravity の限定配布とホスト既存能力の優先

      ## 背景

      共通原本の単一性を保ちながら Codex と Antigravity に配布を広げる。既存ホストと同じ実行能力を前提にすると、未確認の操作を保証範囲に含めることになる。

      ## 決定

      - 新ホストには共通原本から文書管理、コマンド、スキルを接続し、利用者が導入先リポジトリ単位で配置を選ぶ。ホーム全域および本体リポジトリには導入しない。
      - 新ホストは既存能力を優先し、不足する機能だけを取り込む。案Aでは既存 GitHub プラグインへの操作対応を案内し、ADF の Issue/PR 作成は OpenCode の既存経路に残す。agentdev_gh の MCP 化、独自 MCP 化、新ホストでの17スキルの動作保証、既存ホスト同等のバックエンド接続は今回の追加に含めない。
      - 既存のコマンド入口条件と業務契約を保つ。新ホストに既存の gh 書込み禁止 guard、配布領域 guard、agentdev_third_party、textlint の書込み前 hook を移設せず、案Aは worktree 終了時に既存の品質ゲートを使う。

      ## 結果、影響

      導入モード、既存導入の選択維持、既存ホストのバックエンド契約、共通原本とホスト別接続の分離、OpenCode の参照ホストとしての位置づけを維持する。
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-049.md
    target_area: frontmatter
    source_items: [AG-001, AG-002, AG-003]
    content: |
      supersede_note: 新設 Decision「Codex・Antigravity の限定配布とホスト既存能力の優先」（ACT-DEC-001 の正式採番 ID を参照）により、決定(3) の配置選択肢の範囲を部分置換する。決定(3) の単一公開入口、実行モード、既存ホストの選択と既定、ならびに決定(1)(2)(4)(5) は維持する。
    application_note: 採番済みの正式 ID を使って注記を保存する。既存本文、既存 relations と status accepted を維持し、superseded_by は追加しない。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: ホスト接続領域の配置契約（src/opencode/、src/senpi/）
    placement: tail
    source_items: [AG-001, AG-009, AG-010, AG-011, AG-012]
    content: |
      ### Codex・Antigravity の配布接続

      - Codex・Antigravity のホスト接続領域は文書管理、コマンド、スキルの公開接続を所有する。ホスト非依存の業務・安全・品質の原本は src/common/ に保ち、両ホストの業務正本を複製しない。
      - Senpi と同様にスキル名を入口とし、呼出し対応表で業務名と引数を共通コマンド契約に写す。対応スキルに重複していない入力契約、編集範囲等も入口で適用する。
      - 配布実行面の .opencode/ 参照を用途・適用ホスト別に記録する。ホスト固有の参照は接続に閉じ、共通実行に必要な参照は共通原本または選択ホストの接続先へ解決する。既存 OpenCode 専用参照は必要な範囲に限って維持する。
      - 既存能力と要求される契約の対応をホスト別に記録する。ADF から取り込んだ機能は対応根拠を明示し、ホストに同等機能がある場合は不足と判断した理由を添える。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: 投影モデルと installer 対象選択
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## 投影モデルと installer 対象選択

      投影の形態は junction 投影（`src/common/skills/agentdev-*` → `.opencode/skills/agentdev-*`）と copy 投影（repo-local 正本の実ファイルコピー）の2系統がある。copy 投影は repo-local・配布対象外の正本（repo-agentdev-integrity 等、`repo-*` carve-out 対象）に適用し、正本と投影の両方を git 管理する。copy 投影の整合は IR-016（ファイル集合・内容一致）と IR-068（skill-projection-manifest.yaml の copy_projections 登録突合）が検査する（DEC-065 決定3、REQ-002-020 の限定例外）。

      - installer（scripts/install.ps1、scripts/self-sync.ps1）は単一公開入口と check/dry-run/apply を維持する。OpenCode のみ、Senpi のみ、両方の既存選択と、新規導入時の両方推奨、既存導入の選択維持と明示指定による変更を保つ。Codex・Antigravity は、利用者が選んだ導入先リポジトリに選択したホストのみ投影する。ホーム全域への投影と本体への新ホスト投影は行わない。新ホスト間および既存ホストとの管理境界を分離する。
      - 共通原本への投影は同一 ADF 版に整合させる。ホスト別の管理範囲を分離し、片方の更新・除去は他方を壊さない。repo-local 資産（third-party Skill 配置、.agentdev/extensions/**）とユーザー設定（AGENTS.md の harness 選定記述等）を書込み対象から保護する。再実行は冪等とし、不要な登録を増やさない。
      - CLI 未導入でも配置可能とし、配置検査と実行環境の診断を区別する。OmO 版は診断・互換確認にのみ使用する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: バックエンド×ホスト接続構成
    placement: tail
    source_items: [AG-004, AG-005, AG-006, AG-007, AG-008, AG-011, AG-012]
    content: |
      ### Codex・Antigravity の案Aと適用範囲

      - OpenCode・Senpi 向けの Tool 契約、バックエンド構成、既存 guard と検証水準を維持する。新ホストに同じ接続・動作保証を与えない。
      - 案Aは、agentdev_gh を参照する配布17スキル（repo-local の repo-agentdev-integrity を除く）に対し、本文中の操作を各ホストの既存 GitHub プラグイン操作で代える説明を1スキルに集約する。17スキルの動作は保証せず、ADF の Issue/PR 作成は OpenCode に引き渡す。説明は ADF の操作契約を置き換える実装ではない。agentdev_gh の MCP サーバー化と独自 MCP 化を行わない。未確認の能力は実証済みとせず、Antigravity の仕様検討は公開情報に限定する。
      - 新ホストへ textlint の書込み前 hook、gh 書込み禁止 guard、ADF の配布領域 guard、agentdev_third_party を移さない。案Aでは worktree を閉じるときに既存の src/opencode/plugins/agentdev-textlint-guard/gate.ts を対象 worktree に対して使う。失敗を成功として扱わない。この導線と Issue/PR 作成経路は、全機能に対する OpenCode 併用前提にはしない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: 関連
    placement: before_anchor
    source_items: [AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-010, AG-012, AG-013, AG-014]
    execution_scope_constraints:
      - "別案件（Issue #4218、PR #4219）とその由来作業を変更・消費しない（対象外1）。"
      - feature/issue-4214、.worktrees/4214-feature とその並行作業を変更・消費しない（対象外7）。
    content: |
      ## 新ホスト対応の検証

      - 新ホストの配布原本・投影を既存の配布境界検査と標準整合性チェックの対象とし、公開入口は既存の業務名・引数・全ガードを維持していることを照合する。
      - 適用先向け案内に、ホスト別の導入選択、文書管理、スキル名による入口と引数、入口条件、案Aの案内と終了時品質ゲートを利用者が確認する手順と期待結果を記載する。Antigravity は実行担当による実機検証を行わず、利用者が確認する。公開資料、静的検証、利用者による動作確認の証拠を区別する。
      - 検証範囲は、導入先リポジトリの選択と、案Aで定める新ホストの保証・非移設の境界に従う。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/local/install-script-usability.md
    target_design: {operation: update, domain: local, slug: install-script-usability}
    target_area: 対話ウィザード
    placement: tail
    source_items: [AG-002, AG-003]
    content: |
      ### 導入先での Codex・Antigravity の選択

      OpenCode のみ、Senpi のみ、両方の選択と既定は既存ホスト用に維持する。導入先の対話選択と明示指定では Codex・Antigravity も選択対象とし、選択したリポジトリ内だけに投影する。ホーム全域と本体リポジトリは新ホストの導入先にしない。配置検査と各ホストの動作確認は区別する。

conflict_resolutions:
  - id: CR-001
    conflict: 既存の配置選択が OpenCode・Senpi に限られ、接続と保証を単純に4ホストへ広げると RU の新ホスト限定条件と衝突する。
    resolution: 既存ホストの契約を維持し、新ホスト用の配置選択・保証範囲を別に定める。DEC-049 の構造と I/O 境界は維持し、配置選択肢の範囲を後継 Decision で部分置換する。
  - id: CR-002
    conflict: 案Aの GitHub 操作案内を新ホストによる Issue/PR 作成や17スキルの保証と読み違える可能性がある。
    resolution: 案内を1スキルに集約し、ADF の Issue/PR 作成は OpenCode の既存経路に限る。新ホストの17スキル保証は対象外とし、OpenCode の全般併用を固定しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0306
    target_req: REQ-099
    target_design: docs/designs/foundations/multi-host-canonical-model.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0306
    target_req: REQ-009
    target_design: docs/designs/local/install-script-usability.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: AC-1。Codex・Antigravity の配布原本と各投影で、ドキュメント管理・コマンド・スキルを各々突き合わせ、共通の業務正本への参照とホスト固有接続の配置を確認する。
    pass_criteria: 両ホストそれぞれで3種の配布対応を確認でき、ホスト別に独立編集される業務正本がない。
    on_failure: fix-and-reverify。欠けた配布対象または誤った所有・接続を修正し、両ホストの配布投影を再検証する。
  - id: TS-002
    target_item: AG-002
    verification: AC-1。異なる選択をした隔離済みの導入先リポジトリ2つで、対象選択と予定・実際の配置先を調べ、ホーム全域に対する更新有無と既存ホストの選択を差分で照合する。Antigravity クライアントは起動せず、導入処理と配置の検証に限る。
    pass_criteria: 各リポジトリで選択した新ホストだけに配置され、他方のリポジトリ、ホーム全域の設定、未選択のホストに波及しない。既存導入の選択は維持され、明示指定すると変更できる。既存の冪等性と CLI 未導入時の配置・診断の区別も維持される。
    on_failure: fix-and-reverify。選択解決または投影範囲を修正し、異なる選択で再検証する。
  - id: TS-003
    target_item: AG-003
    verification: AC-1。導入対象外となる本体リポジトリの判定と配置計画を、副作用のない方法で確認する。
    pass_criteria: 本体には新ホストの実行時投影が作成されず、本体への新ホスト導入も案内されない。配布原本の追加は本体への導入に数えない。
    on_failure: fix-and-reverify。本体向け新規投影を除外し、対象判定を再検証する。
  - id: TS-004
    target_item: AG-004
    verification: AC-3。Antigravity の仕様記述と公開典拠、および実行記録と利用者向け動作確認の案内を照合する。
    pass_criteria: 公開情報に基づく検討と明記され、実行担当の実機検証は0件で、動作確認の担当は利用者と明記される。公開資料の記載を実機確認結果と同一視しない。
    on_failure: fix-and-reverify。出典・確認主体・確認レベルの記載を訂正する。実機を動かした場合は違反として記録し、実機検証を続けず静的な確認経路を再検証する。
  - id: TS-005
    target_item: AG-005
    verification: AC-2。新ホストの配布物、設定と導入導線を確認し、GitHub 操作案内の接続対象を照合する。
    pass_criteria: 案内先は各ホスト既存の GitHub プラグインであり、agentdev_gh の MCP サーバー化と独自 MCP 化がいずれも0件。
    on_failure: fix-and-reverify。独自の MCP 接続を除き、既存プラグインを案内する構成と境界を再検証する。
  - id: TS-006
    target_item: AG-006
    verification: AC-2。RU 基準の src/common/skills/ における agentdev_gh 参照を第一階層のスキル単位で照合し、案内の保証範囲と Issue/PR の作成経路を比較する。
    pass_criteria: repo-agentdev-integrity を除く基準の17スキルすべてを新ホストでの動作保証対象外と明記し、Issue/PR を出す経路を OpenCode に限定している。
    on_failure: fix-and-reverify。17件の範囲または担当ホストの案内・接続を修正し、差分と経路を再検証する。
  - id: TS-007
    target_item: AG-007
    verification: AC-2・AC-3。17スキル本文の agentdev_gh 参照を案Aの操作対応説明と照合し、説明の所有スキル数と各記述の裏付けを確認する。
    pass_criteria: 操作を代える説明の正本は1スキルで、両ホストを区別して参照できる。未確認の能力を実証済みとする記述は0件で、説明を17スキルの動作保証に読み替えていない。
    on_failure: fix-and-reverify。説明の分散、対応の漏れ、または未確認能力の断定を修正し、再照合する。
  - id: TS-008
    target_item: AG-008
    verification: AC-5。新ホストの投影構成と案Aの作業終了時の案内を静的に照合する。ホストを起動せず、既存ゲートを隔離 worktree で実行し、合格と不合格の入力を照合する。
    pass_criteria: textlint の書込み前 hook は新ホストに投影されず、案Aで worktree を閉じるときに既存 gate.ts が対象 worktree を検査し、不合格を成功扱いしない。
    on_failure: fix-and-reverify。前置 hook の混入または終了時の導線を修正し、ゲートの両結果を再検証する。
  - id: TS-009
    target_item: AG-009
    verification: AC-10。両ホストの能力比較と、ADF 側から取り込んだ機能の一覧を照合する。ホストに同等機能がある各取り込みについて、不足と判断した根拠と対象契約を調べる。
    pass_criteria: 既存能力が優先され、同等機能がある取り込みで不足の具体的理由が記録されていないものは0件。能力比較と取り込みの有無を追跡できる。
    on_failure: fix-and-reverify。根拠がない取り込みを除くか具体的な不足の根拠を確認・記録し、比較表と実物を再照合する。
  - id: TS-010
    target_item: AG-010
    verification: AC-4。共通正本にある既存の公開コマンド本文を入口単位で読み、対応スキルに重複しない条件も含めて新ホストの入口と対応表で突合する。通常入力と、入力契約違反・範囲外編集を代表とする入口拒否を静的・隔離手段で確認する。
    pass_criteria: 入力契約、編集範囲その他の既存入口条件に対応の欠落がなく、違反例では既存契約どおり副作用前に拒否され、正当な入力は対応する業務契約へ到達する。Antigravity は実機証明として扱わない。
    on_failure: fix-and-reverify。共通の入口条件への接続を修正し、全体の条件突合と違反例を再検証する。
  - id: TS-011
    target_item: AG-011
    verification: AC-6。対象となる配布実行面の .opencode/ 参照を棚卸しし、ファイル・用途・適用ホスト・対処を追う。残置理由と新ホストに継承される依存を照合する。
    pass_criteria: 各参照について維持、ホスト接続へ分離、置換のいずれかの対処と理由が明らかで、新ホストの全機能に OpenCode 併用を固定する依存・要件がない。明示した Issue/PR 作成と終了時ゲートの境界は維持される。
    on_failure: fix-and-reverify。見落としまたは不必要なホスト依存を修正し、参照の棚卸しと新ホスト投影を再照合する。
  - id: TS-012
    target_item: AG-012
    verification: AC-9。両ホストの実際の配布目録、登録と配置を確認し、gh 書込み guard、配布領域 guard、agentdev_third_party の混入を調べる。Senpi の方式と公開入口の呼出し対応表、引数の展開結果を比較する。
    pass_criteria: 計3機構の新ホストへの移設・登録が0件で、既存ホストの契約は維持される。req-define、case-auto 等の対応コマンドはスキル名で起動し、業務名と引数の意味が保存される。
    on_failure: fix-and-reverify。対象外機構を配布から除き、起動または引数解釈のずれを修正して再検証する。
  - id: TS-013
    target_item: AG-013
    verification: >-
      AC-7。配布境界検査（repo-agentdev-integrity の check_distribution_boundary.ts、source と該当する導入済み投影の profile）と標準の整合性チェック（同 SKILL の scripts/cli.ts）を実行し、新ホストの投影を走査した範囲と結果を対象版とともに記録する。
      利用者向けに、選択導入、文書管理、スキル名での起動と引数、入口条件、案Aの案内と終了時ゲートの確認項目をホスト別に列挙する。
    pass_criteria: 標準の必須検査が全件合格し、利用者が確認する操作と期待結果が追跡できる。利用者確認の未実施と標準検査の合格を別に記録し、未実施を動作保証に数えない。
    on_failure: fix-and-reverify。標準検査の不合格を修正して再実行する。利用者向け確認項目の欠落を補い、利用者が不一致を確認した場合は合格と記録せず修正後の再確認を案内する。
  - id: TS-014
    target_item: AG-014
    verification: AC-8。RU の対象外8項目を配布差分、導入計画、設計・案内および検証実績と1項目ずつ照合する。別案件 draft・由来作業と feature/issue-4214・当該 worktree は変更対象・消費対象に含まれていないことを、本件の変更・実行記録から確認する。
    pass_criteria: 対象外1〜8の違反が0件。別案件 draft と由来作業および並行ブランチ・worktree に本件による変更・消費がない。
    on_failure: fix-and-reverify。本件に帰属する違反を除去し、他セッションの変更には手を加えず、8項目すべてを再照合する。

realization_actions:
  - id: RA-001
    concern: 新ホストの配布接続と入口契約
    responsibility: ホスト接続はドキュメント管理・公開入口・スキルの配布対応を所有し、共通正本は業務と入口の契約を所有する。
    ownership_hints: ["src/codex/・src/antigravity/ 相当の新ホスト接続", "src/common/commands/agentdev/", "src/common/skills/", "src/opencode/・src/senpi/ は参照実装"]
    intent: スキル名による入口から共通の業務名、引数、ガードへつなぐ。共通配布物の .opencode/ 依存を棚卸しして対処し、既存ホストの機能や入口ガードを緩めない。
    verification_refs: [TS-001, TS-009, TS-010, TS-011, TS-012]
    source_items: [AG-001, AG-009, AG-010, AG-011, AG-012]
  - id: RA-002
    concern: 案Aと新ホストの保証・品質境界
    responsibility: 新ホスト接続側に案Aの案内を置き、OpenCode は Issue/PR 作成と既存品質ゲートの担当を維持する。
    ownership_hints: ["新ホスト向けに同一原本から配布する案Aスキル1件", "src/common/tools/agentdev-gh/ は既存契約の維持", "src/opencode/plugins/agentdev-textlint-guard/gate.ts は終了時品質ゲートの既存実体", "multi-host-operations と consumer-project-setup は利用者向け導線"]
    intent: プラグインの既存能力を案内しつつ未確認の能力に保証を与えず、3機構と書込み前 hook を新ホストに移さない。案Aの終了時ゲートと利用者の確認手順を実際の配布導線に接続する。
    verification_refs: [TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-012, TS-013]
    source_items: [AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-012, AG-013]
  - id: RA-003
    concern: 導入先リポジトリ単位の投影
    responsibility: 導入基盤は利用者の選択を導入先の配置へ写し、配布の収集と境界検査は選択対象の配布物の完結性と分離を保証する。
    ownership_hints: ["scripts/install.ps1 と scripts/consumer/install-sync-common.ps1", "release archive の既存配布収集", "consumer-project-setup", "repo-agentdev-integrity の配布依存境界検査・標準整合性チェック"]
    intent: Codex・Antigravity の選択導入を追加し、ホーム全域・本体・未選択ホストに投影しない。既存導入の選択、配布境界と検査の分離を保つ。
    verification_refs: [TS-001, TS-002, TS-003, TS-012, TS-013, TS-014]
    source_items: [AG-001, AG-002, AG-003, AG-012, AG-013, AG-014]

source_summary:
  source_ru: .agentdev/backlog/req-units/RU-0306.md
  source_session: "session:2026-11-23-codex-antigravity-distribution-support"
  hermes_session: local-ac58a70039ebc72f3b7f06f601e28cda4f7bfe4645714ef45c70d881901a0c3d
  ru_saved_commit: "40518de731faf91a264e53320d0228396b9c8a4d"
  ru_saved_commit_basis: 監督が指定した RU 保存コミット。確定作業時の main HEAD と一致した。
  ru_observation_baseline: a59d4c05bc41dff05bf90e656af44575e5767dff
  supervisor_recheck_commit: "713324fd6"
  agreement_confirmed_at: "2026-11-23T11:59:12Z"
  generated_at: "2026-11-23T12:37:05Z"
  ru_file_mtime: "2026-11-23T12:37:35Z"
  adoption_basis: >-
    利用者が回答で確定したのは対象1、4〜9と対象2のリポジトリごとの選択。対象2のホーム全域への非導入と対象3、11、12は監督が決めて提示し、異論なし。
    対象10は監督の調査により加え、RU 作成時点では利用者へ個別提示していない。
    OpenCode 併用前提と本体非導入は元は助手提案で、利用者自身の判断ではない。前者は固定せず、後者は採用済みスコープ境界として扱う。
  approval_record: >-
    第1承認は利用者の「OK,合意する」。第2承認は同じ発言の RU 作成・ADF に従った実装指示を、監督が RU 採番・保存・commit・push の許可と解釈したもの（利用者が上書き可能）。
    RU 生成後に次工程を起動しない指示と、本 draft の確定後に止める指示は監督による。実装承認は維持し、監督が定義案を照合してから後続を起動する。
  source_record: >-
    合意時刻は Hermes state.db の利用者メッセージの記録時刻、生成時刻は生成担当の保存直前の実測、ファイル更新時刻は監督の実測。
    RU 保存前に採番履歴・必須 frontmatter・本文8節・時刻順序を確認し、監督が由来、案Aの定義、対象12・対象外8・AC-9、対象9・AC-10、AC-2 表記、合意時刻と基準版を訂正した。
    生成時の基準 HEAD と監督の再実測との差は別案件 draft のみであり、RU のアンカーと実測は変わらない。詳細は RU の Source Summary を参照。
    agentdev_handoff は本体リポジトリでは通常入力として扱う（REQ-005-022）。RU は参照専用で既存RUへの依存はない。
important_change_notice: >-
  draft 保存前に、既存マルチホスト要件・導入要件を新ホストの導入範囲、入口ガード、GitHub の保証境界について変更する理由と影響、
  既存 OpenCode・Senpi 契約の維持、Antigravity 実機動作とプラグイン能力の未確認範囲、feature / large の判定と2関心への分解方針を通知した。
  決定と接続範囲の照合後、既存の配置選択の一部を対象とする後継 Decision の追加方針を確定保存前に追加通知した。

review_dispositions: []
assembly_evidence:
  - target_file: docs/requirements/REQ-099.md
    target_content_sha256: &req099 cf3b4c9c7ea79790f41c39aec8ee2320a0892084f7dd4cb5a1700233ffa25d79
    check_scope: &req099_scope {heading: "## 要件", start_line: 12, end_line: 36}
    execution_conditions: {operation: append, edit_sha256: d836aa8c6cf1c92ee885d8b8052cc93c4457c45a1a243907a39f5106c8548fa0, expected_old_count: null}
    checker: &assembler {name: assemble-draft-section, version: "0.2.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references: &assembly_refs {heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: target section only}
    checks_summary: &append_checks {pre: {count: 2, all_ok: true}, post: {count: 2, all_ok: true}}
    diff_compact: {changed_lines_count: 10, added: 10, removed: 0}
    executed_at: "2026-11-23T13:25:28.721Z"
  - target_file: docs/requirements/REQ-099.md
    target_content_sha256: *req099
    check_scope: *req099_scope
    execution_conditions: {operation: replace, edit_sha256: 074b0a70118ff866d9b36b6e9389bc7174b4adae4d476d3a455cb7b74e78024e, expected_old_count: 1}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: &replace_checks {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: &one_line_replace {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-23T13:25:28.804Z"
  - target_file: docs/requirements/REQ-009.md
    target_content_sha256: fc1c9c1a063225b1578f633fa21276cd4ea70d0748b846555b033079074e2f1f
    check_scope: {heading: "## 要件", start_line: 18, end_line: 76}
    execution_conditions: {operation: replace, edit_sha256: 32f945a97a4da4a0a48573efc45ad21f8f489608aa9357c440dd04aaff0182e0, expected_old_count: 1}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *replace_checks
    diff_compact: *one_line_replace
    executed_at: "2026-11-23T13:13:02.949Z"
  - target_file: docs/requirements/REQ-099.md
    target_content_sha256: *req099
    check_scope: {heading: "## 目的", start_line: 8, end_line: 11}
    execution_conditions: {operation: append, edit_sha256: a8ae3cb98552c259ee3b8c6b15a190972cfb04b865f8f107182c000ba1294d2a, expected_old_count: null}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *append_checks
    diff_compact: {changed_lines_count: 2, added: 2, removed: 0}
    executed_at: "2026-11-23T13:25:28.890Z"
  - target_file: docs/designs/foundations/multi-host-canonical-model.md
    target_content_sha256: &multi_host 2ce15200ad4062d072f166cc967a04ac66f174377f1ba4ba6de0d4fa38cdd7c9
    check_scope: {heading: "## ホスト接続領域の配置契約（src/opencode/、src/senpi/）", start_line: 24, end_line: 29}
    execution_conditions: {operation: append, edit_sha256: ecfada57c673076c6b15eb90906d62f40e47523c92b5eee6ca9058dd36306b7c, expected_old_count: null}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *append_checks
    diff_compact: {changed_lines_count: 7, added: 7, removed: 0}
    executed_at: "2026-11-23T13:13:03.023Z"
  - target_file: docs/designs/foundations/multi-host-canonical-model.md
    target_content_sha256: *multi_host
    check_scope: {heading: "## 投影モデルと installer 対象選択", start_line: 30, end_line: 37}
    execution_conditions: {operation: replace, edit_sha256: d057a1c5a58f8f68d94b4a3fb60a0fea9b47c548cee17699dc9af3cf0210e378, expected_old_count: 1}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *replace_checks
    diff_compact: *one_line_replace
    executed_at: "2026-11-23T13:25:43.922Z"
  - target_file: docs/designs/foundations/multi-host-canonical-model.md
    target_content_sha256: *multi_host
    check_scope: {heading: "## バックエンド×ホスト接続構成", start_line: 38, end_line: 48}
    execution_conditions: {operation: append, edit_sha256: ed90b8f1acf4a717ee4ce064eee33fa43fde3e12098a918ddc41dedc3d9ad942, expected_old_count: null}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *append_checks
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: "2026-11-23T13:13:03.174Z"
  - target_file: docs/designs/foundations/multi-host-canonical-model.md
    target_content_sha256: *multi_host
    check_scope: {heading: "## 関連", start_line: 66, end_line: 73}
    execution_conditions: {operation: append, edit_sha256: a0212f7fd101d1473d49b02084bc397a0bc3f184dc6f06e37c322a5ddd6a46e4, expected_old_count: null}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *append_checks
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: "2026-11-23T21:59:07.897Z"
  - target_file: docs/designs/local/install-script-usability.md
    target_content_sha256: 2cc45caa6c11eb7d2585e31ac1ce1e414d48c779e8f8c5ebbd5a4132300e6dea
    check_scope: {heading: "## 対話ウィザード", start_line: 19, end_line: 65}
    execution_conditions: {operation: append, edit_sha256: 9c91027b047d16edab5698abbc2d46e0b1aaeeeceedc543bace336b89162f10c, expected_old_count: null}
    checker: *assembler
    result_affecting_references: *assembly_refs
    checks_summary: *append_checks
    diff_compact: {changed_lines_count: 4, added: 4, removed: 0}
    executed_at: "2026-11-23T13:13:03.322Z"
case_open_hints:
  epic_needed: true
  decomposition: OU-001 はホスト接続・入口・保証の契約、OU-002 は導入先の選択・投影の契約。導入投影は対象となる接続の配置契約を必要とする。最終の Issue 階層は後続工程が決める。
  wave_hints: []

acceptance_trace:
  AC-1: {actions: [ACT-REQ-001, ACT-REQ-002, ACT-REQ-003, ACT-REQ-004, ACT-DEC-001, ACT-DEC-002, ACT-DESIGN-001, ACT-DESIGN-002, ACT-DESIGN-005], tests: [TS-001, TS-002, TS-003]}
  AC-2: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-003], tests: [TS-005, TS-006, TS-007]}
  AC-3: {actions: [ACT-REQ-001, ACT-DESIGN-003, ACT-DESIGN-004], tests: [TS-004, TS-007]}
  AC-4: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-004], tests: [TS-010]}
  AC-5: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-003], tests: [TS-008]}
  AC-6: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-003], tests: [TS-011]}
  AC-7: {actions: [ACT-REQ-001, ACT-DESIGN-004], tests: [TS-013]}
  AC-8: {actions: [ACT-DESIGN-004], tests: [TS-014]}
  AC-9: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-003], tests: [TS-012]}
  AC-10: {actions: [ACT-REQ-001, ACT-DEC-001, ACT-DESIGN-001], tests: [TS-009]}

boundary_risks:
  dependency: {risk: 共通原本からホスト固有参照が漏れる, tests: [TS-001, TS-011]}
  client_server: {risk: プラグインと ADF の操作境界が混同される, tests: [TS-005, TS-006, TS-007]}
  execution: {risk: スキル起動で引数・ガード・品質ゲートが失われる, tests: [TS-008, TS-010, TS-012]}
  build_runtime: {risk: 配布収集と実際の投影の検査範囲がずれる, tests: [TS-001, TS-013]}
  environment_propagation: {risk: 導入先の選択がホーム・本体・他のホストへ伝播する, tests: [TS-002, TS-003, TS-014]}

definition_evidence:
  existing_design_coverage: {REQ-099-010: ACT-DESIGN-002, REQ-009-040: ACT-DESIGN-002}
  requirement_table_projection: ACT-REQ-001 の9行は要件表専用の追記として、既存末尾行に続く二列の連続行になることをメモリ上で照合した。
  append_anchor_check: >-
    append 系6件（ACT-REQ-001、ACT-REQ-004、ACT-DESIGN-001、ACT-DESIGN-003、ACT-DESIGN-004、ACT-DESIGN-005）の target_area は、いずれも対象文書に一意に存在する見出しであることを組立検査で確認した。
    ACT-DESIGN-004 は placement: before_anchor により「## 関連」の直前に本文5行が挿入され、挿入後も末尾の H2 は「## 関連」のままとなることをメモリ上で照合した。同 action の組立証拠の check_scope は anchor である「## 関連」節を示す。
  github_skill_inventory: >-
    共通スキル領域を第一階層で集計し、agentdev_gh 参照は18ディレクトリ、うち repo-agentdev-integrity を除く配布スキルは17と再確認した。
    各スキル本文の用途別の調査・操作対応は TS-006 と TS-007 で照合する。
  opencode_reference_inventory: >-
    共通スキル領域（repo-local 除外）で .opencode/ 参照を含む Markdown 60ファイル、TypeScript 3ファイルを確認した。
    コマンドや導入基盤を含む変更対象全体について、共通利用に必要な資産解決と OpenCode 固有の接続を区別する。参照の一括削除や OpenCode 併用の固定は行わず、用途別の扱いは ACT-DESIGN-001、実物の照合は TS-011 に従う。
  runtime_limit: この draft の検証は要件・文書・静的調査に限る。Codex・Antigravity や GitHub プラグインの実行結果は得ていない。
  adversarial_review: >-
    独立2系統で RU との一致と ACT 適用を再検討した。置換節全文、明示指定の維持、Decision 部分置換関係、Case 限定制約の配置、17件の基準版の明示、REQ の適用範囲、出典の区別を反映した。追加の利用者判断はない。
    ACT-DESIGN-004 の追記位置と対象外1の識別子を修正した後は、変更部分を独立2系統で再検討し、収束監査で未解決の指摘がないことを確認した。
    前提: Issue #4218 と PR #4219 は対象外1の別案件を指す（監督の指定による）。
```
