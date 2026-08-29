---
draft_type: req_draft
topic_slug: distribution-boundary-guard-packaging
status: saved
design_applied: true
created_at: 2026-08-30T08:16:18+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
# work_type: feature — REQ-002 契約行追加（REQ UPDATE）と Design 更新を伴うため REQ-005-007/008 により feature。STEP-7 で確定
work_type: feature

# scale: feature のみ standard / large
scale: standard

summary: distribution-boundary-guard を src/opencode/plugins/agentdev-distribution-boundary-guard/ 配下の独立 Plugin パッケージへ正規化し、Plugin 名を agentdev-distribution-boundary-guard へ統一する。旧正本配置の除去、投影・配布機構対応（consumer 配布系全経路を repo-local 除外機構で対象外、self-sync の自己ホスト投影は対象）、REQ-002 への repo-local Plugin 正本配置契約行追加、旧名称・旧配置を参照する docs・設定の整合を含む。checker 側（repo-agentdev-integrity skill 配下の check_distribution_boundary.ts）は対象外。architecture advisory（oracle）の妥当性確認と adversarial-review は完了済み。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: distribution-boundary-guard を src/opencode/plugins/agentdev-distribution-boundary-guard/ 配下の独立 Plugin パッケージとして正規化する。実行入口（plugin.ts）、Plugin 専用の補助実装（lib/）、Plugin 専用テスト（tests/）、Plugin 固有のパッケージ設定・依存関係設定・ビルド・テスト設定（package.json、tsconfig.json、bun.lock 等）を同一 Plugin 管理境界内に収容する。Plugin 内部のファイル分割は既存機能の責務を保持したうえで当該 Plugin ディレクトリ内へ収容する。既存の3 Plugin（agentdev-gh-tool、agentdev-gh-write-guard、agentdev-third-party-tool）と同一のディレクトリ構造パターンに従う。
  - id: AG-002
    content: 継続管理対象の Plugin 名を agentdev-distribution-boundary-guard に統一する。旧名称 distribution-boundary-guard が独立した Plugin 名として残らない。統一対象には Plugin id（OpenCode plugin 識別子、現行 id: "distribution-boundary-guard"）とブロックメッセージ接頭辞（formatBlockMessage header、現行 "distribution-boundary-guard: ..."）を含む名称表現を含める。検出・拒否の挙動（block するか否か、検出対象）は不変とする。
  - id: AG-003
    content: .opencode/plugins/ はインストールや自己同期によって生成・反映される利用側配置先とし、agentdev-distribution-boundary-guard の継続管理対象を直接所有しない。旧正本配置（.opencode/plugins/ 直下の plugin 本体 .opencode/plugins/distribution-boundary-guard.ts、共有 lib/ への .opencode/plugins/lib/distribution-boundary-guard-*.ts 4件、共有 tests/ への .opencode/plugins/tests/distribution-boundary-guard.test.ts の分散配置）を除去し、旧配置と新配置の双方が正本として残る状態を作らない。.opencode/plugins/ 配下の当該 Plugin 関連ファイルを直接編集することを正規の保守経路としない。
  - id: AG-004
    content: 投影・配布機構を、新しいソース配置（src/opencode/plugins/agentdev-distribution-boundary-guard/）に対応させる。consumer 配布系の全経路（scripts/install.ps1、scripts/consumer/ 配下の archive installer、scripts/self/release/package-release-archive.ps1）に対し repo-local 配布除外機構を導入し、当該 Plugin を consumer への配布から対象外とする（UQ-001 A案、ユーザー合意済み。archive 経路の包含は architecture advisory D1 による範囲確定）。自己ホストの投影は対象とし、self-sync.ps1 は agentdev-* 動的列挙により変更なしで自動対応する（junction 生成、depth-1 loader shim（.opencode/plugins/agentdev-distribution-boundary-guard.ts）生成、shim 検証を含む）。除外機構の実現方式の詳細は Design 委譲（REQ-052-010）とする。
  - id: AG-005
    content: 旧名称・旧配置を参照する設定、文書、テスト、スクリプト等の有効な参照を新しい名称・配置へ整合させる。docs/designs/integrity/rule-ownership.md（配布境界行の repo-local plugin パス記述）、docs/designs/integrity/distribution-boundary.md（repo-local plugin パス記述）を含む。checker 側（.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts + 同 skill scripts/lib/distribution-boundary*.ts）は Plugin とは別の決定的処理であり、名称統一の対象外とする（UQ-003、ユーザー合意済み）。
  - id: AG-006
    content: 本変更は Custom Tool ではないため、src/opencode/tools/ に対応する Custom Tool を新設しない。distribution-boundary-guard が検出・拒否する対象そのもの、境界判定規則・検出条件、fail-closed 等の既存の失敗時動作は一切変更しない。OpenCode Plugin 以外の機構への置き換えも行わない。
  - id: AG-007
    content: 配置・名称変更後も、既存の境界検出・拒否の正常系テストと異常系テストが従来どおり成功し、Plugin 内部で検査不能または異常発生時の既存の失敗時動作が配置変更によって変化しないことを維持する。
  - id: AG-008
    content: REQ-002 に、repo-local Plugin/Hook の正本配置と命名に関する契約行を追加する（REQ UPDATE、operation: append）。repo-local Plugin/Hook の正本は src/opencode/plugins/<agentdev-name>/ 配下の独立 Plugin パッケージとして管理し、Plugin 名は agentdev-* 命名に従うこと。repo-local Plugin/Hook は consumer への配布対象外とし、自己ホストの投影（.opencode/plugins/ への junction と depth-1 loader shim 生成）は許容すること。分岐の技術的根拠（depth-1 loader shim の投影生成物性、gitignore 投影除外パターンとの整合）と配布除外機構の実現方式の詳細は Design が所有すること。
  - id: AG-009
    content: 旧正本配置（.opencode/plugins/ 直下の distribution-boundary-guard.ts、lib/distribution-boundary-guard-*.ts 4件、tests/distribution-boundary-guard.test.ts、package.json、tsconfig.json、bun.lock、node_modules）を実装タスク内で除去する。self-sync.ps1 は orphan junction のみ自動掃除し実ファイルは掃除しないため、並存禁止の確認を必須とする（旧 depth-1 ファイル残留は OpenCode の二重 plugin ロードによる検出二重走行を引き起こす）。除去漏れの機械検出のため、旧名称・旧パスを obsolete-vocabulary-map.yaml（IR-066 legacy-path-removed-name 機構）へ登録する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-002
    source_items: [AG-008]
    content: |
      REQ-002 の要項表末尾（REQ-002-042 の次）に契約行を追加する。契約行 ID は req-save の採番時に確定する（候補: REQ-002-043）:

      | REQ-002-043（候補） | repo-local Plugin/Hook の正本は src/opencode/plugins/<agentdev-name>/ 配下の独立 Plugin パッケージとして管理し、Plugin 名は agentdev-* 命名に従うこと。repo-local Plugin/Hook は consumer への配布対象外とし、自己ホストの投影（.opencode/plugins/ への junction と depth-1 loader shim 生成）は許容すること。分岐の技術的根拠と配布除外機構の実現方式の詳細は Design が所有すること |

      追加根拠（design 併記情報）: REQ-002-020 は repo-local 専用 skill 限定の規定であり plugin を拘束しない。plugin は depth-1 loader shim を投影生成物として必要とし、新名は .gitignore の .opencode/plugins/agentdev-* 投影除外パターンに合致するため、.opencode/plugins/ 直下での git 管理が成立しない（self-sync apply の「Path exists and is not a junction」停止）。REQ-002-007（配布成果物の原本は src/opencode/ 配下）は配布成果物限定のため repo-local Plugin の src 配下配置には適用されず、本契約行で明文化する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target_area: 安定実装契約（repo-local plugin パス記述を含むセクション）
    source_items: [AG-005, AG-009]
    content: |
      repo-local plugin のパス記述を更新する:
      - 「repo-local plugin: plugin パスは .opencode/plugins/distribution-boundary-guard.ts」→「repo-local plugin: 正本は src/opencode/plugins/agentdev-distribution-boundary-guard/ 配下（package.json に repo-local 配布除外の判定根拠を含む）。利用側は self-sync 投影（.opencode/plugins/agentdev-distribution-boundary-guard/ junction + depth-1 loader shim agentdev-distribution-boundary-guard.ts）」
      - 想定モジュールパス（canonical detector .opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts）への plugin からの相対 import が、移動後に src 配下から .opencode 配下への逆向き参照になることを記録する（REQ-018 テスト fallback 観点）
      - 旧名称・旧パス（distribution-boundary-guard、.opencode/plugins/distribution-boundary-guard.ts）を obsolete-vocabulary-map.yaml（IR-066）へ登録し、並存禁止を機械検出可能にする方針を記載する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: rule-ownership
    target_area: 対象規則表の配布境界行
    source_items: [AG-005]
    content: |
      配布境界行の実装詳細列に含まれる「.opencode/plugins/distribution-boundary-guard」を「src/opencode/plugins/agentdev-distribution-boundary-guard/」へ更新する。check_distribution_boundary.ts + lib/distribution-boundary-*.ts（checker 側）の記述は対象外のため変更しない（scripts 側 checker は UQ-003 により対象外、ユーザー合意済み）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: 配布種別の投影経路に関するセクション
    source_items: [AG-004]
    content: |
      repo-local Plugin の配布・投影に関する以下を記載する:
      - repo-local Plugin の正本配置原則（src/opencode/plugins/<agentdev-name>/ 配下）と、consumer 配布系全経路（scripts/install.ps1、scripts/consumer/ 配下の archive installer、scripts/self/release/package-release-archive.ps1）における repo-local 配布除外の同期義務（3ファイルの列挙条件同期）
      - self-sync.ps1 は除外しない（自己ホスト投影維持）という非対称の理由
      - 除外機構の実現方式（明示的除外リスト等）と、REQ-002-011 の repo-* prefix 方式を plugin に採用しない理由（shim 名が repo-*.ts になり stale shim 検出フィルタ等の波及修正が増える）
      - 将来 repo-local Plugin が複数化した時点でマーカー方式（package.json マーカーフィールド等）へ拡張する条件

conflict_resolutions:
  - id: CR-001
    conflict: RU 合意（正規ソースを src/opencode/plugins/ 配下に置き、投影機構を通じて利用側へ反映）と REQ-052-006（ADF の原本・投影構造にのみ依存する検査は repo-local とする=配布対象としない）の解釈が衝突する可能性がある。現状の install.ps1 / self-sync.ps1 は src/opencode/plugins/agentdev-* を動的列挙してすべて投影するため、移動後の Plugin は consumer にも配布される。
    resolution: UQ-001 A案（ユーザー合意済み）。consumer 配布から除外し、自己ホスト投影（self-sync）のみ対象にする。install.ps1 側に repo-local 除外機構を導入する。REQ-052-006 は維持し、契約行の追加（AG-008）で repo-local Plugin の正本配置を明文化する。
  - id: CR-002
    conflict: checker 側（.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts + 同 skill scripts/lib/distribution-boundary*.ts）を Plugin 命名統一の対象に含めるかどうか。rule-ownership.md の配布境界行は checker 実装と repo-local plugin の双方を所有マトリックスに含む。
    resolution: 対象外とする（UQ-003、ユーザー合意済み）。RU の対象範囲は「当該 Plugin 専用の〜」に限定され、checker 側は別の決定的処理（Script 種別、REQ-002-040）である。docs 側の参照更新は AG-005 で扱う。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-002
    target_design:
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/plugins/agentdev-distribution-boundary-guard/ 配下のファイル構成を確認する。
      plugin.ts（実行入口）、lib/（補助実装4件相当）、tests/（plugin 専用テスト）、package.json（name: agentdev-distribution-boundary-guard、@types/node を含む devDependencies）、tsconfig.json（types: ["bun", "node"]）、bun.lock が同一 Plugin 管理境界内に存在し、既存3 Plugin（agentdev-gh-tool、agentdev-gh-write-guard、agentdev-third-party-tool）と同一パターンであることを確認する。
    pass_criteria: |
      上記全ファイル・ディレクトリが同ディレクトリ配下に存在し、既存 Plugin の検出・拒否ロジック（parser、evaluators、paths、reconstruction 相当）が責務を保持したまま収容されている。
    on_failure: |
      fix-and-reverify — 欠落ファイルを既存ソースから移動・収容し、パッケージ構成を再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      リポジトリ全体から旧Plugin名 distribution-boundary-guard および旧パス（.opencode/plugins/distribution-boundary-guard.ts、.opencode/plugins/lib/distribution-boundary-guard-*.ts、.opencode/plugins/tests/distribution-boundary-guard.test.ts）への有効な参照を検索する。docs/reports/ 配下の過去監査スナップショットは歴史記録のため対象外。Plugin id と formatBlockMessage 接頭辞を含む名称表現の統一を確認する。
    pass_criteria: |
      現行の設定、文書、テスト、スクリプトに有効な旧名称・旧パス参照が残っていない。docs-check（obsolete-vocabulary-map.yaml 登録後）で旧名称違反の検出がゼロ件。
    on_failure: |
      fix-and-reverify — 残留した参照を新名称・新パスへ更新し、再検証する。
  - id: TS-003
    target_item: AG-007
    verification: |
      src/opencode/plugins/agentdev-distribution-boundary-guard/ を cwd として bun test を実行する。正常系（正規の書き込みが許可される）と異常系（配布境界違反の書き込みが拒否される）のテストが含まれることを確認する。
    pass_criteria: |
      全テストが成功し、配置・名称変更前と同一の検出・拒否結果を返す。
    on_failure: |
      fix-and-reverify — import パス等の移行漏れを修正して再実行する。plugin ロジックの変更は行わない。
  - id: TS-004
    target_item: AG-006
    verification: |
      Plugin 内部で検査不能または異常が発生した場合の既存の失敗時動作（fail-closed）が配置変更前後で変化しないことを、plugin テストまたは手動検証で確認する。
    pass_criteria: |
      検査不能・異常時に対象副作用を実行せず失敗する既存の動作が維持される。
    on_failure: |
      fix-and-reverify — 動作が変化した原因を特定し、配置移動のみで解消できる形に修正する。plugin ロジックの変更は本要件の対象外である。
  - id: TS-005
    target_item: AG-004
    verification: |
      3経路を検証する:
      (a) self-sync.ps1 実行後、.opencode/plugins/agentdev-distribution-boundary-guard/ junction と depth-1 loader shim（.opencode/plugins/agentdev-distribution-boundary-guard.ts）が生成され、当該 Plugin が利用可能であること
      (b) scripts/self/release/package-release-archive.ps1 の staging 内容に当該 Plugin が含まれないこと
      (c) scripts/install.ps1 の junction targets 列挙に当該 Plugin が含まれず、archive installer からも投影されないこと
    pass_criteria: |
      (a) 自己ホスト投影が成功する。(b)(c) consumer 配布系の全経路で当該 Plugin が対象外であり、install.ps1 check モードで誤残 shim の orphan 検出が機能する。
    on_failure: |
      fix-and-reverify — 除外機構・列挙条件を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      src/opencode/tools/ 配下に本変更専用の Custom Tool が追加されていないことを確認する。
    pass_criteria: |
      本変更に起因する Custom Tool の新設が存在しない。
    on_failure: |
      fix-and-reverify — 不要な Tool を削除して再検証する。
  - id: TS-007
    target_item: AG-005
    verification: |
      docs/designs/integrity/rule-ownership.md（配布境界行の実装詳細列）と docs/designs/integrity/distribution-boundary.md（安定実装契約の repo-local plugin パス記述）が、新配置・新名称へ更新されていることを確認する。
    pass_criteria: |
      現行 docs に旧パス・旧名称の plugin 記述が残っておらず、新配置の記述と install/self-sync/archive の配布除外方針が整合している。
    on_failure: |
      fix-and-reverify — 該当 docs を更新して再検証する。

# review_dispositions: RU-0001 の受け入れ条件（acc-1〜acc-15）の採否記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: acc-1
    disposition: covered
    reason_code: covered_by_ag
    reason: 正規ソースの新配置への存在は AG-001（パッケージ正規化）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: acc-2
    disposition: covered
    reason_code: covered_by_ag
    reason: 実行入口の同ディレクトリ管理は AG-001（plugin.ts 収容）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: acc-3
    disposition: covered
    reason_code: covered_by_ag
    reason: 補助実装の共有 lib/ からの分離は AG-001（lib/ 収容）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: acc-4
    disposition: covered
    reason_code: covered_by_ag
    reason: 専用テストの共有 tests/ からの分離は AG-001（tests/ 収容）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: acc-5
    disposition: covered
    reason_code: covered_by_ag
    reason: パッケージ設定・テスト実行設定の管理境界内完結は AG-001（package.json、tsconfig.json、bun.lock 収容）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0001
    source_item: acc-6
    disposition: covered
    reason_code: covered_by_ag
    reason: 命名統一と旧名称廃止は AG-002（Plugin id・メッセージ接頭辞を含む統一）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0001
    source_item: acc-7
    disposition: covered
    reason_code: covered_by_ag
    reason: 投影機構による利用側構成の生成・更新は AG-004（self-sync 投影 + consumer 配布系除外）でカバー。archive 経路の除外は architecture advisory D1 による範囲確定。受け入れ条件7の「インストール」を consumer install と読む場合、A案では当該 Plugin は consumer 側へ投影されないが、consumer の「正規ソース」集合には配布対象外の repo-local Plugin は含まれないため条件7と整合する（自己同期による自己ホスト投影が条件7の対象）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0001
    source_item: acc-8
    disposition: covered
    reason_code: covered_by_ag
    reason: 利用側配置先の直接編集を正規保守経路としないことは AG-003（.opencode/plugins/ を投影先と定義）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0001
    source_item: acc-9
    disposition: covered
    reason_code: covered_by_ag
    reason: 旧配置と新配置の並存禁止は AG-003（旧正本配置の除去）と AG-009（手動除去 + IR-066 機械検出）でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0001
    source_item: acc-10
    disposition: covered
    reason_code: covered_by_ag
    reason: 正常系テストの成功維持は AG-007 と TS-003 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0001
    source_item: acc-11
    disposition: covered
    reason_code: covered_by_ag
    reason: 異常系テスト（境界違反拒否）の成功維持は AG-007 と TS-003 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0001
    source_item: acc-12
    disposition: covered
    reason_code: covered_by_ag
    reason: 失敗時動作（fail-closed）の不変は AG-006（動作不変宣言）と AG-007、TS-004 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0001
    source_item: acc-13
    disposition: covered
    reason_code: covered_by_ag
    reason: 旧名称・旧配置参照の整合は AG-005（docs・設定・テスト・スクリプトの更新）と TS-002、TS-007 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0001
    source_item: acc-14
    disposition: covered
    reason_code: covered_by_ag
    reason: Custom Tool 不新設は AG-006 と TS-006 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0001
    source_item: acc-15
    disposition: covered
    reason_code: covered_by_ag
    reason: 既存の外部動作・検出対象の不変は AG-006 と AG-007、TS-003、TS-004 でカバー。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

RU-0001（session由来RU、distribution-boundary-guard の Plugin パッケージ化と agentdev 命名統一）を入力として壁打ちを実施した。

## 確定済み

- 正規化先構造: `src/opencode/plugins/agentdev-distribution-boundary-guard/`（plugin.ts + lib/ + tests/ + package.json + tsconfig.json + bun.lock）。既存3 Plugin と同一パターン。
- 前工程引き継ぎ判定: 不要（self-hosting リポジトリで本体成果物の改修対象）。
- 実証Case判定: なし（通常Case、main 統合）。
- work_type: feature（REQ-002 UPDATE と Design 更新を伴うため REQ-005-007/008 により feature）、scale: standard。
- UQ-001: A案合意 — consumer 配布から除外、self-sync の自己ホスト投影は対象、REQ-052-006 維持。
- UQ-002: A案合意 — REQ-002 に契約行追加（REQ-002-043 候補）、詳細は Design 委譲。
- UQ-003: 対象外合意 — scripts 側 checker は対象外。
- Decision 判断: 不要（`agentdev-decision-guidelines` 作成不可条件 #4「命名規約、directory規約」に該当、REQ-052-006 既存契約の維持）。architecture advisory（oracle）も妥当と確認。

## architecture advisory（oracle 助言）の分類結果

- 確定事項（反映済み）: REQ-002-020 は skill 限定で plugin と矛盾せず、REQ-002 契約行追加のみで解消（既存契約修正不要）。Decision 不要判定は妥当。self-sync.ps1 は無変更で動作（agentdev-* 動的列挙が新パッケージを自動検出）。
- 技術的根拠（採用）: 新名は .gitignore の `.opencode/plugins/agentdev-*` 投影除外パターンに合致するため `.opencode/plugins/` 直下での git 管理が成立しない（唯一の整合的解が src 配下への原本移動 + junction 投影）。現状の git 管理成立は旧名がパターンに合致しない偶然。
- 範囲確定（D1）: consumer 配布系は install.ps1 のみならず、**archive 経路（package-release-archive.ps1、scripts/consumer/ 配下の archive installer）にも同梱・投影される**ため、除外機構を consumer 配布系全経路へ導入する（UQ-001 A案の趣旨の履行）。
- 採用した検証対応（D2・B2）: 旧正本配置の除去は手動（self-sync は実ファイルを自動掃除しない）→ AG-009 として明記、IR-066 obsolete-vocabulary-map.yaml 登録で機械検出。plugin id・formatBlockMessage 接頭辞も名称統一対象（AG-002）。@types/node + types: ["bun", "node"] の差異維持（TS-001）。detector import の src→.opencode 逆向き参照を Design に記録（ACT-DESIGN-001）。
- Design 委譲（C1 採用）: 除外機構の実現方式（明示的除外リスト等）は要件行に書かず Design（runtime-package-boundary.md、distribution-boundary.md、rule-ownership.md）へ委譲。

## 保存対象

- REQ-002 への契約行追加（append、REQ-002-043 候補）
- Design 更新3件: docs/designs/integrity/distribution-boundary.md、docs/designs/integrity/rule-ownership.md、docs/designs/local/runtime-package-boundary.md
- 実装対象（case-open → Issue 化）: Plugin パッケージ移動・命名統一・投影/配布機構対応・旧配置除去・docs 更新・テスト移行
