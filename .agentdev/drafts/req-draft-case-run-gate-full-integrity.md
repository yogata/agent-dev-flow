---
draft_type: req_draft
topic_slug: case-run-gate-full-integrity
status: saved
created_at: 2026-09-11
source_rus: [RU-0008]
design_actions_consumed: true
---

# draft-data

```yaml
# work_type: case-run 品質ゲート表の拡張（Design）と検査側 worktree fallback 実装を伴う既存挙動の改善
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

summary: Issue 2758 で case-run のゲート表に full check_integrity が含まれず reference-path-existence 4 件が case-close 最終 gate で初めて検出された（blocked）遅延検出に対し、① case-run の品質ゲート実施表へ full check_integrity を追加し、② worktree 環境で docs/designs 側リンク検査を前段で発火させる方式として検査側の src/opencode 直参照 fallback を採用した。junction 作成の自動化は worktree 作成工程変更を伴うため不採用（REQ-018 の SoT fallback 規約準拠）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-run の品質ゲート実施表へ full check_integrity を追加する。
      背景: Issue 2758 の reference-path-existence 4 件（perspective-registry.md:20-21 の
      diagnostic-categories.md 参照リンク切れ）が case-run では検出されず、case-close の
      最終 gate（QG-4）で初めて検出され blocked となった（PR 2765 / Epic 2755 W2）。
      未検出理由は、① case-run の gate 実施表に full check_integrity が含まれない、
      ② worktree では .opencode/skills/* が gitignore のため junction が存在せず
      当該検査が発火しない（PR 2763 blocker コメント 5614864691 由来）。
      ゲート表追加により integrity 検出を case-run に前段化する（REQ-031 / REQ-007 の
      ゲート契約の Design レベル補強）。
  - id: AG-002
    content: |
      worktree 環境で docs/designs 側リンク検査（IR-062 reference-path-existence 等、
      .opencode/skills junction を前提とする検査）を前段で発火させる方式として、
      検査側の src/opencode 直参照 fallback を採用する。worktree の .opencode/skills/*
      junction が未伝播の場合、検査対象パスを source パス（SoT パス = 検査 root
      （--root 指定の対象 worktree）直下の src/opencode/ 配下。同一チェックアウト内の
      SoT パス）へ fallback して検査を実行する。メインリポジトリ作業コピー側の
      src/opencode へ解決することは誤解決（誤リポジトリ検査。REQ-031-025 と同種）として
      禁止する。REQ-018 の「junction を前提とする構造系テストは source パス
      （SoT パス）への fallback で実行される」規約の適用拡大であり、
      worktree 作成工程（junction 作成の自動化）は変更しない。
      fallback を使用した検査では、実行環境（worktree / main、junction 伝播状態）を
      環境ラベルとして検証記録に明記する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_design:
      operation: update
      domain: commands
      slug: case-run
    target_area: case-run gate 意味論（前置 gate と最終 gate）・前置 gate 群・case-run が使用する検査ツールを規定する各セクション（検査ツール節の check_integrity 不使用規定を含む）
    source_items: [AG-001]
    content: |
      case-run の gate 実施へ full check_integrity（整合性検査スクリプト群の全体実行）を追加する。
      docs 変更を含む case では、commit 前に check_integrity を full 実行し、
      base 既知違反と新規違反を分離して新規違反 0 件を確認する。
      これにより integrity 由来の違反（reference-path-existence 等）の検出を
      case-run に前段化し、case-close 最終 gate での初検出・blocked を防ぐ。
      更新にあたり、検査ツール節の現行規定「case-run は check_integrity.ts（全体監査）を
      使用しない（全体監査は /repo/docs-check の責務）」を、docs 変更を含む case での
      条件付き full 実行（base 既知違反と新規違反の分離、新規違反 0 件確認）へ明示的に
      書き換える。targeted docs guard（PR 単位の targeted 検査）は維持する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/integrity/checker-execution-contracts.md
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: worktree 環境での checker 実行・パス解決を扱うセクション（checker 実行契約）
    source_items: [AG-002]
    content: |
      worktree 環境で .opencode/skills/* junction を前提とする検査
      （docs/designs 側リンク検査、IR-062 reference-path-existence を含む）を実行する場合、
      junction 未伝播時に検査対象パスを source パス（SoT パス = 検査 root（--root 指定の
      対象 worktree）直下の src/opencode/ 配下。同一チェックアウト内）へ直参照 fallback して
      検査を実行する。メインリポジトリ作業コピー側への解決は誤解決（誤リポジトリ検査）として
      禁止する。
      - fallback 判定は junction（または投影ディレクトリ）の不在を検出した時点で行う
      - fallback で実行可能な検査は実行し、実行不能な既知 skip は環境差
        （REQ-018-004 の環境差扱い）として区別記録する
      - fallback を使用した検査では、実行環境（worktree / main、junction 伝播状態）を
        環境ラベルとして検証記録に明記する（REQ-018 の環境ラベル契約に従う）
      - 本 fallback は REQ-018「junction を前提とする構造系テストは source パス
        （SoT パス）への fallback で実行される」規約の checker への適用であり、
        worktree 作成工程（junction 自動化）を変更しない

conflict_resolutions:
  - id: CR-001
    conflict: worktree 環境で docs/designs 側リンク検査を発火させる方式（junction 作成の自動化 vs 検査側 fallback）
    resolution: |
      検査側の src/opencode 直参照 fallback を採用する。根拠:
      ① REQ-018 が既に「junction 前提の構造系テストは SoT パス fallback」を規約化しており
      既存契約の適用拡大で契約整合的である、
      ② junction 自動化は worktree 作成工程への変更を伴い REQ-018 の構造的制約（gitignore による
      junction 未伝播）に触れる広範な影響がある、
      ③ fallback 方式は検査コード内で完結し、worktree 利用者の操作を変更しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: null
    target_design: docs/designs/commands/case-run.md（主）、docs/designs/integrity/checker-execution-contracts.md（副）
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
      case-run.md の更新後、full check_integrity が case-run の gate 実施内容に記載されていること、
      docs 変更を含む case での commit 前 full 実行と新規違反 0 件確認が記載されていること、
      および検査ツール節の check_integrity 不使用の旧規定が新規定へ明示的に書き換えられて
      いること（更新後の同一 Design 内に自己矛盾が残存しないこと）を確認する。
      REQ-007（完了報告と成果物品質ゲート）・REQ-031（case-run 実行契約）の
      既存ゲート契約と矛盾していないことを突合する。
    pass_criteria: |
      gate 実施内容に full check_integrity が存在し、前段化の実行条件が明記されている。
      check_integrity 不使用の旧規定が残存せず、同一 Design 内の自己矛盾が解消されている。
      既存 REQ 契約との矛盾が 0 件。
    on_failure: |
      fix-and-reverify。記載漏れ・契約矛盾を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      検査側 fallback 実装後、worktree 環境で full check_integrity を実行し、
      (1) junction 未伝播でも docs/designs 側リンク検査（IR-062）が発火すること、
      (2) fallback 使用時に環境ラベルが検証記録へ記録されること、を確認する。
      既知の reference-path-existence 違反（perspective-registry.md:20-21 相当）を
      test fixture で再現し、worktree 前段で検出できることを確認する。
    pass_criteria: |
      worktree 環境で IR-062 リンク検査が発火し、既知リンク切れを case-run 前段で検出する。
      環境ラベルが記録されている。fallback 時の検査対象パスが SoT（src/opencode）で
      誤解決（誤リポジトリ検査）していない（REQ-031-025 の検査対象 root 解決契約と整合）。
    on_failure: |
      fix-and-reverify。fallback 判定条件・パス解決を修正して再検証する。
      検査対象 root の誤解決は検査見逃しとして扱う（REQ-031-025 / REQ-010-076 契約に従い
      確認なく合格扱いとしない）。

realization_actions:
  - id: RA-001
    concern: worktree 環境での checker（.opencode/skills junction 前提検査）の src/opencode 直参照 fallback 実装
    responsibility: |
      docs-check 系検査スクリプト群（check_integrity.ts 等）の実行契約は
      docs/designs/integrity/checker-execution-contracts.md と REQ-010（自己監査コマンド）が
      正規所有する。検査スクリプト実体は repo-agentdev-integrity skill 配下
      （.opencode/skills/repo-agentdev-integrity/scripts/）とその配布ソースにある。
      worktree 構造的制約と fallback 規約は REQ-018 が正規所有する。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - docs/designs/integrity/checker-execution-contracts.md
      - REQ-018（worktree 構造的制約とテスト fallback）
      - docs/designs/skills/agentdev-git-worktree-test-fallback.md
    intent: |
      worktree で junction 未伝播により検査が発火しない遅延検出の根因を、
      検査側の SoT fallback で解消し、integrity 違反を case-run に前段化する。
    verification_refs: [TS-002]
    source_items: [AG-002]

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0003 / RU-0004 / RU-0005 / RU-0006 の draft が case-run.md / case-close.md を含む同一 Design ファイル群を更新する。case-open の Wave 構成で同時実行を避けるか、同一 Wave 内での競合解消を考慮すること
```

# summary

RU-0008（case-run の品質ゲート表への full check_integrity 追加）を maintenance として要件化した。ゲート表拡張による integrity 検出の case-run 前段化と、worktree junction 未伝播対策として検査側 src/opencode 直参照 fallback を採用（REQ-018 準拠、junction 自動化は不採用）した。既知リンク切れの worktree 前段検出を TS-002 で検証する。
