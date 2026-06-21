---
draft_type: req_draft
topic_slug: doc-system-restructure
status: saved
created_at: 2026-06-21T17:30:00+09:00
spec_actions_consumed: true
spec_actions_consumed_at: 2026-06-21T18:00:00+09:00
---

<!-- req_draft: AgentDevFlow 文書体系再構築
     このドラフトは本チャットでの合意に基づき req-define ワークフローで生成された。
     後続工程の原本は # draft-data 内の YAML ブロックである(REQ-0138-001, ADR-0124)。 -->

# draft-data

```yaml
work_type: feature
scale: large

summary: |
  AgentDevFlow 本体の文書体系を持続開発に耐える形へ再構築する。
  全16コマンド・全27スキルに専用 SPEC を新設し、grab-bag 化した workflow-contracts.md・system.md を関心別に分割する。
  REQ から HOW を除去して SPEC へ移管し、配布物(commands/skills)から内部 ID(REQ/ADR/IR)を完全に削除する。
  docs 運用スキル群に再発防止の原則を反映する。10 OU / 10 Issue の単一 Epic 構成。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      目的は AgentDevFlow 本体の文書体系を持続的な設計・開発・保守に耐える形へ再構築すること。
      REQ は WHAT、ADR は WHY、SPEC は HOW / 現在動作を担う。
      配布物である commands / skills には AgentDevFlow 内部 ID を記述しない。
      AgentDevFlow 内部の設計・実装トレーサビリティは docs 配下の SPEC と関連索引で保持する。

  - id: AG-002
    content: REQ は WHAT(振る舞い・制約・状態)のみを記述する。HOW(実装詳細・API シグネチャ・プロンプト文字列・スキル名直参照・CLI コマンド詳細・ファイルパス・【廃止】履歴行)は REQ に書かない。

  - id: AG-003
    content: ADR は WHY(判断根拠)を記述する。ADR の対象は「コマンド・スキル自体の方針に関わる大きな判断」であり、レポジトリ全体方針はその一例である。

  - id: AG-004
    content: SPEC は HOW(現在の動作)を記述する。対象範囲は問わず、レポジトリ全体・複数コマンド横断・単一コマンド・パラメータ一覧のいずれも SPEC として認める。

  - id: AG-005
    content: 全16の /agentdev/* コマンドに専用 SPEC を作成する(docs/specs/commands/<command-name>.md)。/repo/docs-check は repo-local・配布対象外のため対象外。

  - id: AG-006
    content: 全27の agentdev-* 配布スキルに専用 SPEC を作成する(docs/specs/skills/<skill-name>.md)。repo-agentdev-integrity は repo-local・配布対象外のため対象外。

  - id: AG-007
    content: SPEC は commands / skills / workflows の3層ディレクトリに配置する。

  - id: AG-008
    content: 横断 SPEC(workflows/)は共通契約のみを持ち、個別 command / skill の現在動作を持たない。横断 SPEC は個別 SPEC の代替ではない。

  - id: AG-009
    content: 配布物(src/opencode/commands/、src/opencode/skills/)に REQ-XXXX、ADR-XXXX、SPEC-ID、IR-XXX 等の内部 ID を書かない。実行時に必要な判断・手順は ID なしで自己完結させる。

  - id: AG-010
    content: Epic は10 OU / 10 Issue 構成とし、case-open の子Issue上限10件(G05)に収める。

  - id: AG-011
    content: 最終 OU(OU-10)で docs 運用スキル群(Stream1)に再発防止を反映する。対象は agentdev-req-structure-diagnostics、agentdev-doc-writing、agentdev-req-file-manager、agentdev-adr-file-manager 等。

  - id: AG-012
    content: 既存の workflow-contracts.md(989行・11関心事)と system.md(245行・8関心事)は grab-bag 解消のため分割する。個別動作は command SPEC / skill SPEC へ移管し、横断契約のみを workflows/ 配下に残す。

  - id: AG-013
    content: ADR-0111(superseded by ADR-0112)と ADR-0113(deprecated by inspect 改名)は整理する。

  - id: AG-014
    content: コマンド・スキル自体の機能は変更しない。ID 参照削除と文脈再語りのみを行う。

  - id: AG-015
    content: REQ から除去する HOW(API シグネチャ・プロンプト文字列・【廃止】履歴行・スキル名直参照・CLI コマンド詳細・ファイルパス)は SPEC または skill references へ移管する。移管不能な履歴・作業記録は REQ 要件行に残さない。

artifact_actions:
  # ===== OU-01: SPEC 基盤(テンプレート・索引) =====
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: docs/specs/commands/_template.md
    source_items: [AG-005, AG-007]
    content: |
      command SPEC テンプレート。最小構成: 目的 / 入力 / 出力 / 副作用 / 現在の動作 /
      参照する横断SPEC / 対象外 / 検証観点

  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target: docs/specs/skills/_template.md
    source_items: [AG-006, AG-007]
    content: |
      skill SPEC テンプレート。最小構成: 目的 / 適用対象 / 提供する判断・操作 /
      参照する references / 現在の動作 / 対象外 / 検証観点

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/DOC-MAP.md
    source_items: [AG-007]
    content: |
      DOC-MAP を新 SPEC 構成(commands/ skills/ workflows/ の3層)に更新。
      新ディレクトリの探索経路を反映。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/README.md
    source_items: [AG-007, AG-008]
    content: |
      SPEC index を新構成に更新。横断 SPEC が個別 SPEC の代替ではないことを明記。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/README.md
    source_items: [AG-007]
    content: docs README の SPEC セクションを新構成に更新。

  # ===== OU-02: 横断 SPEC 分割 =====
  - id: ACT-SPEC-010
    artifact: spec
    operation: create
    target: docs/specs/workflows/workflow-contracts.md
    source_items: [AG-008, AG-012]
    content: |
      ワークフロー全体像・共通フェーズ・共通状態・artifact lifecycle のみを記述。
      個別 command / skill の現在動作は持たない。旧 docs/specs/workflow-contracts.md から横断契約部分を抽出・再構成。

  - id: ACT-SPEC-011
    artifact: spec
    operation: create
    target: docs/specs/workflows/delegation-contracts.md
    source_items: [AG-008, AG-012]
    content: |
      サブエージェント委譲契約の横断記述。委譲時最小契約・委譲種別・委譲制約・manager-orchestrator と軽量委譲の分離を含む。

  - id: ACT-SPEC-012
    artifact: spec
    operation: create
    target: docs/specs/workflows/capture-boundaries.md
    source_items: [AG-008, AG-012]
    content: |
      キャプチャ境界。intake / learning 境界・Split Rule・PR 本文永続チャネル・REQ 再構成 intake を含む。

  - id: ACT-SPEC-013
    artifact: spec
    operation: create
    target: docs/specs/workflows/epic-wave-model.md
    source_items: [AG-008, AG-012]
    content: |
      Epic / Wave / Issue 実行モデル。OU / Epic / Wave / Issue 階層・子 Issue 実行状態 enum・
      Wave スケジューリング・Epic 統率者契約・case-run Epic Wave 実行モデル・case-close Epic Wave クローズモデルを含む。

  - id: ACT-SPEC-014
    artifact: spec
    operation: create
    target: docs/specs/workflows/backlog-artifact-lifecycle.md
    source_items: [AG-008, AG-012]
    content: |
      RU / 採用済み成果物 / draft のライフサイクル。バックログドラフトプロトコル・検出事項プロトコル・
      artifact_actions ベース工程分岐・REQ ファイル整合性検査・DOC-MAP 影響規則・REQ 再構成検出を含む。

  - id: ACT-SPEC-015
    artifact: spec
    operation: update
    target: docs/specs/workflow-contracts.md
    source_items: [AG-012]
    content: |
      旧 workflow-contracts.md(989行)を縮小。個別動作を各 command / skill SPEC および workflows/ 配下に移管。
      残す場合は横断契約のみとし、内容が workflows/ 配下の各 SPEC と重複しないよう調整。
      廃止する場合は DOC-MAP・README から参照を削除。

  - id: ACT-SPEC-016
    artifact: spec
    operation: update
    target: docs/specs/system.md
    source_items: [AG-012]
    content: |
      旧 system.md(245行)を縮小。コマンドシステム概要のみを残し、個別動作(Epic フロー・自律修正ループ・
      達成判定プロトコル・Capture・ID 体系・REQ 基準構造・分類ゲート)を各 SPEC へ移管。

  # ===== OU-03: command SPEC(req / intake / learning 系・7件) =====
  - id: ACT-SPEC-020
    artifact: spec
    operation: create
    target: docs/specs/commands/req-define.md
    source_items: [AG-005]
    content: |
      req-define の現在動作。壁打ちプロセス・Step 0-11 ワークフロー・ADR 判断ゲート・
      SPEC 候補分離・QG-1 定義完全性ゲート・構造化 draft-data 生成。

  - id: ACT-SPEC-021
    artifact: spec
    operation: create
    target: docs/specs/commands/req-save.md
    source_items: [AG-005]
    content: req-save の現在動作。draft-data 消費・REQ/ADR ファイル保存・artifact_actions 処理・分類ゲート。

  - id: ACT-SPEC-022
    artifact: spec
    operation: create
    target: docs/specs/commands/spec-save.md
    source_items: [AG-005]
    content: spec-save の現在動作。SPEC 候補消費・docs/specs/ への保存・SPEC lifecycle(draft/accepted)。

  - id: ACT-SPEC-023
    artifact: spec
    operation: create
    target: docs/specs/commands/intake-capture.md
    source_items: [AG-005]
    content: intake-capture の現在動作。手動気づきの .agentdev/intake/inbox/ への記録・git 永続化。

  - id: ACT-SPEC-024
    artifact: spec
    operation: create
    target: docs/specs/commands/intake-from-github.md
    source_items: [AG-005]
    content: intake-from-github の現在動作。GitHub Issue/PR/コメントから改善候補抽出・inbox/ へ保存。

  - id: ACT-SPEC-025
    artifact: spec
    operation: create
    target: docs/specs/commands/intake-promote.md
    source_items: [AG-005]
    content: intake-promote の現在動作。inbox item のレビュー・HITL 確認・採用済み成果物生成。

  - id: ACT-SPEC-026
    artifact: spec
    operation: create
    target: docs/specs/commands/learning-promote.md
    source_items: [AG-005]
    content: learning-promote の現在動作。inbox.md + archive/ から promoted/ への昇華・8軸評価・HITL 確定。

  # ===== OU-04: command SPEC(case 系・5件) =====
  - id: ACT-SPEC-030
    artifact: spec
    operation: create
    target: docs/specs/commands/case-open.md
    source_items: [AG-005]
    content: |
      case-open の現在動作。Issue 本文生成・Epic flow・自律構成生成(Epic/Wave/Issue 構造)・
      OU 選択ゲート・QG-2 完了条件網羅性検証・RU 削除・draft 削除。

  - id: ACT-SPEC-031
    artifact: spec
    operation: create
    target: docs/specs/commands/case-run.md
    source_items: [AG-005]
    content: |
      case-run の現在動作。3フェーズ構成(準備・実装・提出)・サブエージェント委譲(task() + ulw-loop)・
      自律修正ループ・QG-3・Epic Wave 実行モデル・PR 本文の SPEC 確定候補・Findings 記録。

  - id: ACT-SPEC-032
    artifact: spec
    operation: create
    target: docs/specs/commands/case-close.md
    source_items: [AG-005]
    content: |
      case-close の現在動作。達成判定プロトコル・QG-4 最終完了ゲート・PR merge(squash・リトライ)・
      Issue close・capture 回収・Epic Wave クローズモデル・branch/worktree cleanup。

  - id: ACT-SPEC-033
    artifact: spec
    operation: create
    target: docs/specs/commands/case-auto.md
    source_items: [AG-005]
    content: |
      case-auto の現在動作。最大自走モード・OU 逐次処理・artifact_actions 工程分岐・
      Wave 反復制御・停止条件・クリーンアップ検証ゲート。

  - id: ACT-SPEC-034
    artifact: spec
    operation: create
    target: docs/specs/commands/case-update.md
    source_items: [AG-005]
    content: case-update の現在動作。Issue 本文更新・コメント追加・REQ ファイル更新・レビュー NG 対応。

  # ===== OU-05: command SPEC(inspect / backlog 系・4件) =====
  - id: ACT-SPEC-040
    artifact: spec
    operation: create
    target: docs/specs/commands/inspect-docs.md
    source_items: [AG-005]
    content: inspect-docs の現在動作。docs 全体の意味整合レビュー・REQ 再構成診断・検出事項(findings)生成。

  - id: ACT-SPEC-041
    artifact: spec
    operation: create
    target: docs/specs/commands/inspect-skills.md
    source_items: [AG-005]
    content: inspect-skills の現在動作。Command/Skill 参照妥当性検出・構造検証・finding 生成・推奨 route 提示。

  - id: ACT-SPEC-042
    artifact: spec
    operation: create
    target: docs/specs/commands/inspect-promote.md
    source_items: [AG-005]
    content: inspect-promote の現在動作。検出事項の分類(promote/defer/reject)・HITL 承認・採用済み成果物生成・自動 promote。

  - id: ACT-SPEC-043
    artifact: spec
    operation: create
    target: docs/specs/commands/backlog-review.md
    source_items: [AG-005]
    content: backlog-review の現在動作。採用済み成果物の分析・統合・矛盾検出・RU 生成・git 永続化。

  # ===== OU-06: skill SPEC(docs/req/adr/workflow 中核・12件) =====
  - id: ACT-SPEC-050
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-doc-writing.md
    source_items: [AG-006]
    content: agentdev-doc-writing の現在動作。文書品質静的査読・修正提案・REQ/ADR/SPEC 責務分離検証・AI-slop 検出。

  - id: ACT-SPEC-051
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-req-analysis.md
    source_items: [AG-006]
    content: agentdev-req-analysis の現在動作。要件分析・REQ/SPEC 境界判定・分類ゲート・SPLIT 予兆計測。

  - id: ACT-SPEC-052
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-req-file-manager.md
    source_items: [AG-006]
    content: agentdev-req-file-manager の現在動作。REQ ファイル構造・命名・frontmatter・照合方法論。

  - id: ACT-SPEC-053
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-req-structure-diagnostics.md
    source_items: [AG-006]
    content: agentdev-req-structure-diagnostics の現在動作。REQ 構造検査・HOW 混入検出・健全性メトリクス。

  - id: ACT-SPEC-054
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-doc-map.md
    source_items: [AG-006]
    content: agentdev-doc-map の現在動作。DOC-MAP 索引の管理・更新・整合性確認。

  - id: ACT-SPEC-055
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-adr-file-manager.md
    source_items: [AG-006]
    content: agentdev-adr-file-manager の現在動作。ADR ファイル構造・採番・status 管理・retired 移動。

  - id: ACT-SPEC-056
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-adr-guidelines.md
    source_items: [AG-006]
    content: agentdev-adr-guidelines の現在動作。ADR 記述基準・主題妥当性判定・作業手段 ADR 拒否ゲート。

  - id: ACT-SPEC-057
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-architecture-advisory.md
    source_items: [AG-006]
    content: agentdev-architecture-advisory の現在動作。oracle による設計助言・ADR 要否確認・req-define 統合。

  - id: ACT-SPEC-058
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-workflow-orchestration.md
    source_items: [AG-006]
    content: agentdev-workflow-orchestration の現在動作。Epic 進行管理・capture 境界・self-healing and errors。

  - id: ACT-SPEC-059
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-workflow-routing.md
    source_items: [AG-006]
    content: agentdev-workflow-routing の現在動作。Issue 番号解決・フェーズ判定・work_type ルーティング。

  - id: ACT-SPEC-060
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-workflow-lifecycle.md
    source_items: [AG-006]
    content: agentdev-workflow-lifecycle の現在動作。work_type 判定・scale 昇格・ラベル付与・宣言的ワークフロー定義。

  - id: ACT-SPEC-061
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-workflow-templates.md
    source_items: [AG-006]
    content: agentdev-workflow-templates の現在動作。Issue/PR テンプレート選定・コメントテンプレート・SPEC 確定候補セクション。

  # ===== OU-07: skill SPEC(case/intake/learning/補助・15件) =====
  - id: ACT-SPEC-070
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-case-run-execution-adapter.md
    source_items: [AG-006]
    content: agentdev-case-run-execution-adapter の現在動作。oh-my-openagent 統合・task() 起動・result 契約・起動失敗時事後処理。

  - id: ACT-SPEC-071
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-issue-management.md
    source_items: [AG-006]
    content: agentdev-issue-management の現在動作。Issue 本文生成・テンプレート充足・子 Issue 作成・Epic 本文更新・issue-operation-safety。

  - id: ACT-SPEC-072
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-epic-tracker.md
    source_items: [AG-006]
    content: agentdev-epic-tracker の現在動作。Epic ステータス追跡テーブル・子 Issue 実行状態 enum 更新。

  - id: ACT-SPEC-073
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-gh-cli.md
    source_items: [AG-006]
    content: agentdev-gh-cli の現在動作。gh CLI 安全使用・WRITE/READ/VERIFY 操作・文字化け防止・リンク正規化。

  - id: ACT-SPEC-074
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-git-worktree.md
    source_items: [AG-006]
    content: agentdev-git-worktree の現在動作。worktree 作成・cleanup・並列実行安全ステージング・origin/main 鮮度確認。

  - id: ACT-SPEC-075
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-intake-pipeline.md
    source_items: [AG-006]
    content: agentdev-intake-pipeline の現在動作。intake 系コマンドの共通手順・git 永続化・inbox/promoted 運用。

  - id: ACT-SPEC-076
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-learning-capture.md
    source_items: [AG-006]
    content: agentdev-learning-capture の現在動作。学び検知・13項目形式・実観測ベース蓄積・inbox.md エントリ生成。

  - id: ACT-SPEC-077
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-learning-pipeline.md
    source_items: [AG-006]
    content: agentdev-learning-pipeline の現在動作。learning-promote の共通手順・8軸評価・promoted/ 運用・ADR 候補分類。

  - id: ACT-SPEC-078
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-quality-gates.md
    source_items: [AG-006]
    content: agentdev-quality-gates の現在動作。QG-1〜QG-4 定義・機械化境界・実装マッピング・各ゲートの検査観点。

  - id: ACT-SPEC-079
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-inspect-skills.md
    source_items: [AG-006]
    content: agentdev-inspect-skills の現在動作。Command/Skill 参照妥当性検出の詳細手順・finding 形式・推奨 route。

  - id: ACT-SPEC-080
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-command-authoring.md
    source_items: [AG-006]
    content: agentdev-command-authoring の現在動作。command 作成基準・薄型構造・frontmatter 規約・委譲定義。

  - id: ACT-SPEC-081
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-command-creator.md
    source_items: [AG-006]
    content: agentdev-command-creator の現在動作。command 新規作成ウィザード・テンプレート選定・スキャフォールド。

  - id: ACT-SPEC-082
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-conventional-commits.md
    source_items: [AG-006]
    content: agentdev-conventional-commits の現在動作。コミットメッセージ規約・スタイル検出・semantic/plain 判定。

  - id: ACT-SPEC-083
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-skill-authoring.md
    source_items: [AG-006]
    content: agentdev-skill-authoring の現在動作。skill 作成基準・SKILL.md 構造・references 管理・See Also 規約。

  - id: ACT-SPEC-084
    artifact: spec
    operation: create
    target: docs/specs/skills/agentdev-backlog-integration.md
    source_items: [AG-006]
    content: agentdev-backlog-integration の現在動作。採用済み成果物の統合・分割判定・矛盾検出・RU 生成ルール・depends_on。

  # ===== OU-08: REQ HOW 除去 =====
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0130
    source_items: [AG-002, AG-015]
    content: |
      REQ-0130(case-run)から HOW 除去:
      - REQ-0130-016/017: task() API シグネチャ・ulw-loop プロンプト文字列 → docs/specs/commands/case-run.md へ移管
      - REQ-0130-018/019: Sisyphus-Junior 内部仕様 → case-run SPEC へ移管
      - REQ-0130-020/021/022/024: 【廃止】履歴行 → 削除
      - REQ-0130-023/025: スキル名直参照 → WHAT( origin/main 鮮度確認・起動失敗時の安全処理)のみ残す
      - REQ-0130-026/027: API シグネチャ → WHAT( Epic Wave 並列実行・べき等再実行)のみ残す

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-002, AG-015]
    content: |
      REQ-0114(case-auto)から HOW 除去:
      - REQ-0114-045〜050: 【廃止】履歴行 → 削除
      - REQ-0114-006: task() API シグネチャ → WHAT のみ残す
      - REQ-0114-029: スキル名直参照 → WHAT のみ残す
      - ファイルパス詳細 → docs/specs/commands/case-auto.md へ移管

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0102
    source_items: [AG-002, AG-015]
    content: |
      REQ-0102(req-define/save)から HOW 除去:
      - ファイルパス詳細(glob docs/requirements/REQ-*.md 等) → docs/specs/commands/req-define.md, req-save.md へ移管
      - スキル名直参照(agentdev-workflow-lifecycle, agentdev-adr-file-manager 等) → 各 skill SPEC へ移管
      - プロンプト文字列(max+1, 欠番埋め禁止 等) → 各 skill SPEC へ移管

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0131
    source_items: [AG-002, AG-015]
    content: |
      REQ-0131(case-close)から HOW 除去:
      - CLI コマンド詳細(git status --porcelain 等) → docs/specs/commands/case-close.md へ移管
      - ファイルパス詳細 → case-close SPEC へ移管

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0124
    source_items: [AG-002, AG-015]
    content: |
      REQ-0124(inspect-docs)から HOW 除去:
      - 履歴参照(REQ-0115-041/042、旧名参照) → 削除または inspect-docs SPEC の判断経緯へ
      - 旧名称参照(docs-review, skill-review 等) → 削除

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-0127
    source_items: [AG-002, AG-015]
    content: |
      REQ-0127(intake 系)から HOW 除去:
      - ファイルパス詳細(.agentdev/intake/ 等) → 各 command SPEC へ移管
      - スキル名直参照(capture-boundaries.md, agentdev-workflow-orchestration) → 各 SPEC へ移管

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-0133
    source_items: [AG-002, AG-015]
    content: |
      REQ-0133(case-update)から HOW 除去:
      - CLI コマンド詳細(gh issue list/status) → docs/specs/commands/case-update.md へ移管
      - スキル名直参照(agentdev-spec-compliance) → skill SPEC へ移管

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: REQ-0136
    source_items: [AG-002, AG-015]
    content: |
      REQ-0136(spec-save)から HOW 除去:
      - ファイルパス詳細(docs/specs/req-health-metrics.md, docs/specs/workflow-contracts.md) → 各 SPEC へ移管

  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: REQ-0128
    source_items: [AG-002, AG-015]
    content: REQ-0128(learning-promote)からファイルパス詳細を除去し learning-promote SPEC へ移管。

  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: REQ-0129
    source_items: [AG-002, AG-015]
    content: REQ-0129(backlog-review)からファイルパス詳細を除去し backlog-review SPEC へ移管。

  # ===== OU-10: ADR 整理 =====
  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: ADR-0111
    source_items: [AG-013]
    content: |
      ADR-0111 の status を superseded に正式設定。ADR-0112 へ統合済みであることを明記。
      docs/adr/README.md の該当箇所を更新。

  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: ADR-0113
    source_items: [AG-013]
    content: |
      ADR-0113 の status を deprecated に正式設定。inspect 改名(diagnostics → inspect)による廃止であることを明記。
      docs/adr/README.md の該当箇所を更新。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    target_spec: docs/specs/commands/_template.md
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    target_spec: docs/specs/workflows/workflow-contracts.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    target_spec: docs/specs/commands/req-define.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    target_spec: docs/specs/commands/case-open.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-005
    target_spec: docs/specs/commands/inspect-docs.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    target_spec: docs/specs/skills/agentdev-doc-writing.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result: {}

  - ou_id: OU-007
    target_spec: docs/specs/skills/agentdev-case-run-execution-adapter.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}

  - ou_id: OU-008
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: [OU-002, OU-003, OU-004, OU-005, OU-006, OU-007]
    recommended_order: 8
    issue_policy: single
    result: {}

  - ou_id: OU-009
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: [OU-008]
    recommended_order: 9
    issue_policy: single
    result: {}

  - ou_id: OU-010
    target_req: REQ-0101
    operation: update
    scale: standard
    depends_on: [OU-008, OU-009]
    recommended_order: 10
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: true
  epic_title: "AgentDevFlow 文書体系再構築: 全 command/skill 専用 SPEC 化と内部 ID 除去"
  epic_labels: [doc-system, restructure]
  decomposition: |
    10 Issue 構成。作業順序:
    1. SPEC 構成・命名・テンプレート確定、DOC-MAP 更新
    2. 横断 SPEC 分割: workflow/system 系
    3. command SPEC 作成: req/intake/learning 系(7件)
    4. command SPEC 作成: case 系(5件)
    5. command SPEC 作成: inspect/backlog 系(4件)
    6. skill SPEC 作成: docs/req/adr/workflow 中核(12件)
    7. skill SPEC 作成: case/intake/learning/補助(15件)
    8. REQ HOW 除去と SPEC 移管
    9. 配布物の内部 ID 除去: commands + skills
    10. ADR 整理、Stream1 改善、横断検査
  wave_hints:
    - wave: 1
      issues: [OU-001]
      note: SPEC 基盤確定(全後続 OU の前提)
    - wave: 2
      issues: [OU-002, OU-006, OU-007]
      note: 横断 SPEC 分割 + skill SPEC 作成(並列・3件)
    - wave: 3
      issues: [OU-003, OU-004, OU-005]
      note: command SPEC 作成(並列・3件・OU-002 完了後)
    - wave: 4
      issues: [OU-008, OU-009]
      note: REQ HOW 除去 + 配布物 ID 除去(並列・2件)
    - wave: 5
      issues: [OU-010]
      note: ADR 整理・Stream1 改善・横断検査
```

# summary

## 目的

AgentDevFlow 本体の文書体系を、持続的な設計・開発・保守に耐える形へ再構築する。

REQ は WHAT、ADR は WHY、SPEC は HOW / 現在動作を担う。配布物である commands / skills には AgentDevFlow 内部 ID を記述しない。AgentDevFlow 内部の設計・実装トレーサビリティは、docs 配下の SPEC と関連索引で保持する。

## 確定方針

| 対象 | 方針 |
|---|---|
| REQ | WHAT のみを書く |
| ADR | WHY を書く |
| SPEC | HOW / 現在動作を書く |
| command SPEC | 全16の /agentdev/* コマンドに専用 SPEC を作る(/repo/docs-check は対象外) |
| skill SPEC | 全27の agentdev-* スキルに専用 SPEC を作る(repo-agentdev-integrity は対象外) |
| SPEC 構造 | docs/specs/commands/、docs/specs/skills/、docs/specs/workflows/ |
| 横断 SPEC | 共通契約のみ。個別 command / skill の現在動作を持たない |
| 配布物 | commands / skills に REQ-XXXX、ADR-XXXX、SPEC-ID、IR-XXX 等の内部 ID を書かない |
| Epic 構成 | 10 OU / 10 Issue |
| Stream1 | 最終 OU で docs 運用スキル群に再発防止を反映 |

## OU 構成

| OU | Issue | 主題 | 対象数 |
|---|---|---|---|
| OU-001 | 1 | SPEC 構成・命名・テンプレート確定、DOC-MAP 更新 | テンプレート3 + 索引3 |
| OU-002 | 2 | 横断 SPEC 分割: workflow/system 系 | 横断 SPEC 5 + 旧 SPEC 縮小2 |
| OU-003 | 3 | command SPEC 作成: req/intake/learning 系 | 7 コマンド |
| OU-004 | 4 | command SPEC 作成: case 系 | 5 コマンド |
| OU-005 | 5 | command SPEC 作成: inspect/backlog 系 | 4 コマンド |
| OU-006 | 6 | skill SPEC 作成: docs/req/adr/workflow 中核 | 12 スキル |
| OU-007 | 7 | skill SPEC 作成: case/intake/learning/補助 | 15 スキル |
| OU-008 | 8 | REQ HOW 除去と SPEC 移管 | 対象 REQ 約10件 |
| OU-009 | 9 | 配布物の内部 ID 除去: commands + skills | 16 コマンド + 13 スキル(参照含有) |
| OU-010 | 10 | ADR 整理、Stream1 改善、横断検査 | ADR 2件 + スキル4件以上 + repo-local 横断検査 |

## Wave 構成

- Wave 1: OU-001(1件) — SPEC 基盤
- Wave 2: OU-002, OU-006, OU-007(3件・並列) — 横断分割 + skill SPEC
- Wave 3: OU-003, OU-004, OU-005(3件・並列) — command SPEC
- Wave 4: OU-008, OU-009(2件・並列) — REQ HOW 除去 + ID 除去
- Wave 5: OU-010(1件) — 最終整理

## 対象外

- AgentDevFlow 利用者プロジェクトの SPEC 構成の既定
- 利用者プロジェクトによる AgentDevFlow 本体の拡張
- commands / skills 内への内部 ID 参照の残置
- /repo/docs-check の専用 command SPEC 作成(repo-local・配布対象外)
- repo-agentdev-integrity の専用 skill SPEC 作成(repo-local・配布対象外)
- コマンド・スキル自体の機能変更
- 実装順序の細分化を REQ に固定すること
- 保存・commit・push(本ドラフト保存後、別承認が必要)
