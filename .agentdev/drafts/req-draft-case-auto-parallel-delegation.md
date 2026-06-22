---
draft_type: req_draft
topic_slug: case-auto-parallel-delegation
status: saved
spec_saved: true
created_at: 2026-06-22T01:50:00+09:00
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-auto に独立単位の固定上限付き並列委譲（最大5件）を導入する。
  独立 OU（depends_on 空・L0 相当）が複数存在する場合、case-open が自動的に
  Epic Issue 化して Wave 1 に全 OU を配置し、Standard/Epic 二系統を単一 Wave
  実行モデルに統一する。各工程（case-open / case-run / req-save / spec-save）は
  「並列対象」（子Issue 作成・ファイル変更案作成・検査）と「集約対象」（採番・
  index 更新・draft 更新・commit・push・Epic 本文更新）を分離し、並列対象を最大
  5件で処理する。集約対象は親コマンドが直列実行する。並列単位の成功・失敗は
  親コマンドが集約し最終判定に反映する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-auto は独立 OU または同一 Wave 内子Issue を最大5件まで並列委譲できる。
      現状の case-auto.md L113-118「Step 8-1 逐次OU処理ループ」と L80「OU 逐次処理」
      は独立 OU を直列で縛っており過度に保守的。REQ-0114-055「依存関係があるだけでは
      Epic 化しない」は依存ある場合の制約であり、独立 OU の並列実行を禁じない。
      REQ-0137 の並列実行安全 git 操作規律（worktree 隔離・明示パスステージ）が
      並列委譲を支える既存インフラ。
  - id: AG-002
    content: |
      case-open は複数の独立 OU（depends_on 空・L0 相当）を検出した場合、自動的に
      Epic Issue 化し Wave 1 に全 OU を配置する。これにより Standard flow は「真に
      単一 OU のみ」に縮退し、Standard/Epic 二系統を単一 Wave 実行モデルに統一する。
      REQ-0132-002/011/014 の既存要件（技術的依存関係に基づく Wave 構成）の範囲内。
  - id: AG-003
    content: |
      case-open は子Issue 本文案作成・検査・Issue 作成を最大5件まで並列化できる。
      現状 case-open.md L87「OU 単位・順次処理」は子Issue 作成と Epic 本文
      ステータス追跡テーブル更新を混同している。G04「全子Issue 作成完了後に
      テーブル更新（部分更新禁止）」はテーブル更新の集約を求めるのみで、作成自体の
      順次性は求めていない。作成フェーズ（並列）とテーブル更新フェーズ（集約・直列）
      の分離が現仕様に欠落している。
  - id: AG-004
    content: |
      case-run は同一 Wave 内の子Issue 処理を最大5件まで並列化できる。
      REQ-0130-010/026 および ADR-0128 で既に Epic Wave 並列委譲（最大5件）が
      規定済み。今回の独立 OU 自動 Epic 化（AG-002）により、Standard flow 起因の
      複数 OU もこの既存モデルに乗る。case-run 側の新規変更は不要で、入力としての
      Epic Issue が増えるのみ。
  - id: AG-005
    content: |
      req-save / spec-save は複数ファイルの変更案作成・検査を並列化できる。
      現状 req-save-procedure.md L23「各ペアを順次処理」は採番・ファイル作成・
      インデックス更新を1ループに混在させていることが誤り。3 フェーズ分離
      （(1) 採番バッチ・直列、(2) ファイル作成・並列可能、(3) インデックス更新・
      commit/push・直列）に再構築する。spec-save の複数 SPEC action も異なる
      target は独立（L0 相当）のため並列可能。
  - id: AG-006
    content: |
      採番・index 更新・draft 更新・commit・push・Epic 本文更新は親コマンドが
      直列で集約する。これらは一意性（G05 REQ 連番・Epic status table 単一書き手
      G24）・アトミック性（git commit）の本質的制約により直列必須。並列委譲の
      完了を待ってから親が実行する。
  - id: AG-007
    content: |
      並列単位の成功・失敗は親コマンドが集約し、最終判定に反映する。一部失敗時は
      REQ-0114-049（停止時報告）に従い、完了単位・進行中・未実行・再開コマンドを
      報告する。全並列単位が blocked/failed の場合は集約失敗として停止する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0114
    target_area: REQ-0114-053 改訂 + 新規 REQ-0114-087〜093 追加
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      # REQ-0114-053 を以下に改訂
      REQ-0114-053 | case-auto は 1 OU を close まで完了した後に次の OU へ進むこと。
      ただし depends_on が空の独立 OU（L0 相当）が複数存在する場合は、最大5件まで
      並列委譲で処理できる（REQ-0114-087 参照）

      # 新規要件を追加
      REQ-0114-087 | case-auto は独立 OU または同一 Wave 内子Issue を最大5件まで
      並列委譲できること（Epic Wave Model の最大5件上限に準拠）
      REQ-0114-088 | case-open は複数の独立 OU（depends_on 空・L0 相当）を検出した
      場合、自動的に Epic Issue 化し Wave 1 に全 OU を配置すること
      REQ-0114-089 | case-open は子Issue 本文案作成・検査・Issue 作成を最大5件まで
      並列化できること（Epic Issue 作成・Wave 1 配置・Epic 本文ステータス追跡
      テーブル更新は直列集約）
      REQ-0114-090 | req-save は複数 REQ/ADR ファイルの変更案作成・検査を並列化
      できること（採番・index 更新・draft 更新・commit・push は直列集約）
      REQ-0114-091 | spec-save は複数 SPEC ファイルの変更案作成・検査を並列化
      できること（採番・index 更新・draft 更新・commit・push は直列集約）
      REQ-0114-092 | 並列委譲された単位の成功・失敗は親コマンドが集約し、
      最終判定に反映すること
      REQ-0114-093 | 直列集約対象（採番・index 更新・draft 更新・commit・push・
      Epic 本文更新）は並列委譲の完了を待ってから親コマンドが実行すること

      # 適用範囲セクションに以下を追加
      - 独立 OU の並列委譲（最大5件）
      - 複数独立 OU の自動 Epic 化・Wave 1 配置
      - 各工程の並列対象と集約対象の分離

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/workflows/epic-wave-model.md
    target_area: Wave スケジューリング・独立 OU の自動 Epic 化
    source_items: [AG-001, AG-002]
    content: |
      Wave スケジューリングセクションに「独立 OU の自動 Epic 化」を追記。
      case-open は複数独立 OU（depends_on 空・L0 相当）を検出した場合、自動的に
      Epic Issue 化し Wave 1 に全 OU を配置する。これは Standard flow と Epic flow
      の二系統を単一 Wave 実行モデルに統一するための拡張。
      Epic Wave Model の最大5件上限（L93, L123）を独立 OU の並列委譲にも適用。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/workflows/delegation-contracts.md
    target_area: 並列委譲契約
    source_items: [AG-001, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      サブエージェント委譲契約に「並列委譲」と「集約（直列）」の分離を追記。
      各工程の並列対象（子Issue 作成・ファイル変更案作成・検査）と集約対象
      （採番・index 更新・draft 更新・commit・push・Epic 本文更新）を明記。
      並列上限は最大5件（Epic Wave Model 準拠）。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/commands/case-auto.md
    target_area: Step 4-1・Step 8-1 の並列委譲対応
    source_items: [AG-001, AG-002, AG-006, AG-007]
    content: |
      case-auto SPEC の Step 8-1（逐次OU処理ループ）を改訂し、独立 OU の並列委譲
      を許可。Step 4-1（Wave 反復制御）は独立 OU 自動 Epic 化後もそのまま適用。
      並列委譲と直列集約の境界を明記。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/commands/case-open.md
    target_area: 子Issue 作成の並列化・独立 OU 自動 Epic 化
    source_items: [AG-002, AG-003]
    content: |
      case-open SPEC の子Issue 作成フローを改訂。作成フェーズ（並列・最大5件）と
      Epic 本文ステータス追跡テーブル更新フェーズ（集約・直列）を分離。
      複数独立 OU 検出時の自動 Epic 化・Wave 1 配置を明記。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/commands/case-run.md
    target_area: Standard flow 起因の Epic Wave 実行
    source_items: [AG-004]
    content: |
      case-run SPEC に、独立 OU 自動 Epic 化に伴る Standard flow 起因の Epic Wave
      実行を明記。case-run 側の新規機能追加は不要で、入力としての Epic Issue が
      増えるのみ。REQ-0130-010/026 の既存 Epic Wave 並列委譲（最大5件）をそのまま
      適用。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/commands/req-save.md
    target_area: フェーズ分離・ファイル作成並列化
    source_items: [AG-005, AG-006]
    content: |
      req-save SPEC のファイル操作を3フェーズに再構築。
      フェーズ1（直列）: 採番バッチ（最大番号+N を一括確保・G05 一意性維持）
      フェーズ2（並列・最大5件）: 各 REQ/ADR ファイル作成・変更（独立パス）
      フェーズ3（直列）: インデックス（README.md）への順序挿入・draft status 更新・
      commit/push（G07 commit 前 status 更新を維持）

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/commands/spec-save.md
    target_area: 複数 SPEC action 並列化
    source_items: [AG-005, AG-006]
    content: |
      spec-save SPEC の複数 SPEC action 処理を改訂。異なる target パスの SPEC
      create/update は L0（完全独立）のため並列可能（最大5件）。同一 SPEC ファイルへ
      の複数 action のみ順序依存のため直列サブセットとして分離。最終的な commit/push
      は REQ-0137 の明示パス指定で一括実行。

conflict_resolutions:
  - id: CR-001
    conflict: |
      OU 間並列化は REQ-0137 L19/L43 で「並列実行のスケジューリング機構・ロック
      実装そのものは本 REQ の対象外」と明記されており、新規機構導入が必要に見える。
    resolution: |
      本提案は「並列委譲」のみであり task() run_in_background=true の既存機能で
      実現する。スケジューリング機構・ロック実装は導入しない。REQ-0137 の対象外
      宣言には触発されず、REQ-0137 が整備した worktree 隔離・明示パスステージの
      既存インフラを活用するのみ。よって REQ-0137 の改修は不要。
  - id: CR-002
    conflict: |
      REQ-0114-055「OU 間依存は queue dependency。依存関係があるだけでは Epic 化
      しない」と独立 OU の自動 Epic 化が矛盾する可能性。
    resolution: |
      REQ-0114-055 は依存**ある**場合の制約（依存があるだけでは Epic 化しない）。
      今回の独立 OU 自動 Epic 化は依存**ない**場合（L0 相当）を対象としており、
      REQ-0114-055 と矛盾しない。独立 OU を Epic 化しないと Wave 1 並列実行の
      枠組みに乗せられず、結果的に Standard flow の逐次処理に縛られるため、
      独立 OU の自動 Epic 化は Wave モデルを活かすための必須拡張。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    target_spec: docs/specs/workflows/epic-wave-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

case-auto の独立単位に対する固定上限付き並列委譲（最大5件）を導入する。独立 OU は case-open が自動的に Epic Issue 化して Wave 1 に配置し、Standard/Epic 二系統を単一 Wave 実行モデルに統一。各工程は並列対象（子Issue 作成・ファイル変更案作成・検査）と集約対象（採番・index・draft・commit・push・Epic 本文）を分離する。

SPLIT シグナル +3（REQ-0114 77行→84行・ライフサイクル段階混在）だが、case-auto の中核機能の一貫性を優先しユーザー合意のもと APPEND で進行。SPLIT 自体は別課題（inspect-docs 等での計画的実施）とする。
