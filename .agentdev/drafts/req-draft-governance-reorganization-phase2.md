---
draft_type: req_draft
topic_slug: governance-reorganization-phase2
status: saved
spec_actions_consumed: true
created_at: 2026-07-19T00:00:00+09:00
source_rus: []
---

<!-- 本ドラフトは AgentDevFlow 基準体系・統治境界の統合再編計画 第2フェーズ（再編実施）の
   要件定義ドラフトである。第1フェーズ監査台帳
   (.agentdev/drafts/audit-ledger-governance-system-audit.md) を主たる参照入力とする。
   req-define 壁打ちプロセスを経ていない初期案であり、auto_ready は false。
   ユーザー壁打ちにより未解決事項を確定した後に req-save/spec-save/case-open へ進む。 -->

# draft-data

```yaml
# work_type: 再編実施は既存REQ/ADR/SPEC の UPDATE と新規SPEC 起票が中心。
# 新規機能追加ではないため maintenance とする（Phase1 Issue #1596 メタ情報準拠）。
work_type: maintenance

# scale: maintenance は scale 設定なし（req-define SPEC 参照）
# ただし作業規模は large 相当（CR-005）。operation_units で5OUに分解し Epic 構成で進行管理。

summary: |
  AgentDevFlow 基準体系・統治境界の統合再編計画 第2フェーズ（再編実施）。
  第1フェーズ監査台帳（audit-ledger-governance-system-audit.md）を入力とし、
  監査台帳 AG-002〜AG-004 で三軸分類した17カテゴリ（A〜Q）の処置方針
  （KEEP/MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）を候補から確定へ昇格して実行し、
  未決事項 U-001〜U-015 を解消し、索引不整合 F-001〜F-006 を修正し、
  SC-001〜SC-003 の新規SPEC を起票し、既存REQ/ADR/SPEC の UPDATE を行う。
  第1フェーズ4硬制約のうち後半2件（監査前の一括退役禁止、未決事項確定不可）は
  本フェーズで解除し、前半2件（新規REQ/ADR原則追加不可、公開command動作不改）は
  恒久制約として継続する。AG-006' 自動化候補8件のうち、個別 IR 依存で SPEC 本文変更を
  伴わない REFERENCE 強化と SKILL.md Wave 1 重複除去は本フェーズで対応し、
  新規 script 開発を要する GENERATE 機構はフェーズ3（後続作業）に切り出す。
  フェーズ2完了定義は AG-001〜AG-009 全完了、フェーズ3は case_open_hints.next_phase_instructions
  で別ドラフトとして起票する。

# auto_gate: 2026-07-19 壁打ち合意完了。5 件の unresolved_questions を解消し auto_ready を true へ昇格。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: フェーズ2で合意すべき項目。AG-001〜AG-009。
# 各 AG は必要十分な長文で記述（REQ-0138-008）。
agreed_items:
  - id: AG-001
    content: |
      第1フェーズ4硬制約の適用範囲を本フェーズ用に更新する。前半2件
      （新規REQ/ADR原則追加不可、公開command動作不改）は本フェーズでも継続し、
      新規原則のREQ/ADR追加、および標準command・標準skill・Project Extensions・
      repo-local ツール群（src/opencode/commands/agentdev/*.md,
      src/opencode/skills/agentdev-*/SKILL.md, .agentdev/extensions/**/*,
      .opencode/commands/repo/*.md, .opencode/skills/repo-agentdev-integrity/**）
      の動作変更を行わない。後半2件（監査前の一括退役禁止、未決事項確定不可）は
      本フェーズで解除し、監査台帳 AG-002〜AG-004 が「候補」として記録した処置方針
      （KEEP/MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）および未決事項 U-001〜U-015 を
      確定して実行する。これにより Phase1 CR-001「第1トラック（監査）を one-time
      ライフサイクルに分離し、再編フェーズは別セッションで実施」という計画フェーズ
      分割を完結させる。

  - id: AG-002
    content: |
      監査台帳 AG-002〜AG-004 が三軸分類（適用範囲
      standard/repository-local/one-time × 検出観点
      SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT × 処置方針
      KEEP/MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）で記録した17カテゴリ（A〜Q）の
      監査単位すべてについて、処置方針を「候補」から「確定」へ昇格させ、
      物理的編集を実行する。同一ファイル内で複数処置方針が混在する場合
      （計画 Section 6「混在許容」）はファイル単位で代表方針を確定し、副次方針を
      備考に記録する。各処置の実行形態は、MERGE は統合先ファイルへの集約と
      統合元ファイルの退役、REFERENCE は重複箇所からの参照化、DERIVE は SSoT 側への
      集約と派生側の生成物化宣言、GENERATE は実ファイル frontmatter からの再生成機構
      実装（AG-008 でフェーズ3切り出しを判断）、RETIRE は退役宣言と README 等の索引更新、
      KEEP は現状維持と台帳からの言及解除、である。

  - id: AG-003
    content: |
      監査台帳 U-001〜U-015 の未決事項15件をすべて確定し実行する。
      うち5件（U-001〜U-005）は索引不整合 F-001〜F-005 に対応し ADR README の修正で
      即時解決可能、1件（U-006）は REQ-0102 SPLIT（Phase1 CR-004）に対応し AG-004 で
      処理、2件（U-007、U-010）は workflow-contracts および local-generation の物理統合
      可否の構造判断、2件（U-008、U-013）は自動化範囲確定で AG-008 で処理、2件（U-009、
      U-012）は SKILL.md 重複查読 Wave 1/2/3 の段階処理で AG-008 またはフェーズ3で処理、
      3件（U-011、U-014、U-015）は責務分割基準の整備と照合作業。
      各未決事項の解決結果は監査台帳 U-001〜U-015 欄に書き戻すか、当該REQ/ADR/SPEC
      への UPDATE を通じて反映する。

  - id: AG-004
    content: |
      REQ-0102 の肥大化（79要件行）を解消するための SPLIT を実施する（Phase1 CR-004）。
      SPLIT 先は REQ-0138（構造化 req_draft 契約）、REQ-0140（文書品質ゲート）、
      REQ-0144/0145（docs-check 運用）、REQ-0154/0155/0156（ドキュメント運用）、
      REQ-0160（project-extensions）、REQ-0162（harness 境界）、REQ-0163（subagent 委譲
      プロトコル）等、既存REQへの要件行再配置を基本とし、REQ-0102 は要件定義プロセス
      phases 横断の基本契約に縮小する。SPLIT 完了後、REQ-0102 は親REQとして分割先REQ群
      への参照を「関連情報」セクションに保持する。新規REQのCREATEは AG-001 制約
      （Phase1 前半1件目継続）により不可、既存REQへのAPPEND/UPDATE および REQ-0102
      自身のUPDATE で対応する。本 SPLIT は受け入れ条件 #7「REQ-0102 79要件行の肥大化
      未解消」を直接解消する。

  - id: AG-005
    content: |
      既存REQ/ADR/SPEC に対する UPDATE を実行する。新規ADRのCREATEは不可
      （Phase1 CR-003）、新規REQのCREATEも不可（Phase1 前半1件目制約継続）、
      既存REQ/ADRへのAPPEND/UPDATE および既存SPECへのUPDATE で対応する。主なUPDATE
      対象は、(a) REQ-0102 SPLIT に伴う関連REQ群の要件行再配置（AG-004）、(b) ADR-0114/
      0125/0127/0128 等の再構成による現在の実行・委譲境界の読み取り可能性向上
      （受け入れ条件 #11）、(c) REQ-0162-009/010 等の分離候補の処理と concrete ID
      216件残の段階的除去、(d) 責務統合に伴う SPEC 本文の集約（workflow-contracts 物理統合、
      responsibilities 系統合、responsibility-boundary-purification 語彙揺れ修正）。
      各 UPDATE は req-save/spec-save command を経由して行う。REQ-0108/0109 の
      docs-check/inspect-docs 分離宣言、REQ-0154-001 の DOC-MAP 宣言等、既に計画目標状態に
      合致している部分は維持する。

  - id: AG-006
    content: |
      SC-001〜SC-003 の新規SPECを起票する。SC-001 は採番管理SPEC
      （docs/specs/foundations/numbering-policy.md 相当）でREQ/ADR/IR 欠番の統一運用を
      定義し F-003（REQ-0157）/F-004（IR-045）を根絶する。SC-002 は索引類自動生成SPEC
      （docs/specs/integrity/index-auto-generation.md 相当）で実ファイル frontmatter から
      README・索引類を再生成する機構を定義し F-001/002/005 を根絶する。SC-003 は
      監査台帳ライフサイクルSPEC（docs/specs/local/audit-ledger-lifecycle.md 相当）で
      one-time 成果物の廃棄条件を一般化する。これらに加え、intake inbox に滞留する
      責務境界語彙揺れ（intake-2026-07-19-responsibility-boundary-purification-vocab-drift-
      inline-control.md）、concrete ID 216件残（REQ-0162-010 段階的除去）、IR-055 heuristic
      集計仕様、audit-ledger-index-inconsistencies（F-001〜F-006 まとめ）の各SPEC候補も
      起票または対応SPECへのUPDATE で処理する。

  - id: AG-007
    content: |
      索引不整合 F-001〜F-006 をすべて解消する。F-001（ADR README キャプション「24件」vs
      実測25件）は SC-002 GENERATE 化または手動修正で「25件」に修正、F-002（accepted
      リストの ADR-0137 欠落）は ADR-0137 を accepted リストへ追加、F-003（REQ-0157 純粋
      未使用番号）は SC-001 採番管理SPEC で扱いを確定、F-004（IR-045 欠番）も SC-001 で
      確定、F-005（トピック別ビューの ADR-0137 欠落）はワークフロー分類へ追加、F-006
      （REQ-0102 79要件行の肥大化）は AG-004 の SPLIT で解消。F-001/002/005 は即時修正可能
      であり AG-002 処置方針確定後ただちに実行する。本項目は受け入れ条件 #13
      「F-001/002/005 未解消」を直接解消する。

  - id: AG-008
    content: |
      第1フェーズ監査台帳 AG-006（自動化・導出化候補8件）について、フェーズ2で実装する範囲と
      フェーズ3（後続作業）に切り出す範囲を 2026-07-19 壁打ち合意により確定する。候補8件は、
      (1) 整合性ルールカタログの GENERATE 化、(2) ADR README 件数・一覧の GENERATE 化、
      (3) REQ README 件数・一覧の GENERATE 化、(4) rule-ownership マトリクスの GENERATE 化、
      (5) req-health-metrics/spec-health-metrics 数値項目の GENERATE 化、
      (6) doc-writing 查読観点の REFERENCE 強化、(7) SKILL.md 概要節・機能節の重複
      DERIVE/GENERATE 化（Wave 1/2/3）、(8) DOC-MAP の一部記載 GENERATE 化。
      【フェーズ2対象】正規所有者、物理配置、参照関係、重複記述を是正する作業であり、
      新規 script 開発、文書の生成物への変更、継続的な自動同期機構の追加、docs-check/CI/検証器
      への新規組み込みを伴わないもの。対象: (6) doc-writing REFERENCE 強化、(7) SKILL.md Wave 1
      手作業による重複除去。(8) DOC-MAP は DECLARE 完了済みとして新規作業対象から除外し、
      フェーズ2完了時の確認項目としてのみ扱う。
      【フェーズ3対象】生成、導出、自動同期、継続検証の仕組みを追加するもの。
      対象: (1) catalog GENERATE 化、(2) ADR README GENERATE 化、(3) REQ README GENERATE 化、
      (4) rule-ownership matrix GENERATE 化、(5) health-metrics GENERATE 化、
      (7) SKILL.md を SPEC から DERIVE/GENERATE する仕組み。SKILL.md Wave 2/3 は DERIVE/GENERATE
      機構の導入対象とする場合のみフェーズ3とし、手作業による重複除去のみを行う場合は別再編作業
      として扱う（CR-003 合意）。本項目は受け入れ条件 #14「自動化候補未実装」を部分的に解消し、
      残をフェーズ3に委譲する。

  - id: AG-009
    content: |
      監査台帳（.agentdev/drafts/audit-ledger-governance-system-audit.md）のライフサイクルを
      2026-07-19 壁打ち合意により確定する。one-time 監査成果物をフェーズ横断の進捗管理台帳として
      恒久化しない。ライフサイクル5ステップ: (1) フェーズ2中は監査台帳を参照入力として保持、
      (2) フェーズ2で判断が確定した時点で新規追記を停止し参照専用とする、(3) フェーズ3対象を
      自足したフェーズ3用入力へ転記（背景、対象候補、正規所有者、自動化後の状態、対象外、
      受け入れ条件を含む）、(4) フェーズ3用入力への移管漏れがないことを確認、(5) 移管確認を
      フェーズ2の完了条件とし、その完了時に監査台帳を削除する。フェーズ3用入力が未作成または
      自足していない状態ではフェーズ2を完了扱いとせず、監査台帳も削除しない（CR-004 合意）。
      SC-003 監査台帳ライフサイクルSPEC はこの運用を一般化し、将来の one-time 監査成果物の
      ライフサイクルモデルを定義する。本項目は受け入れ条件 #17「一時検査に終了条件が存在する」
      を補完する。

# artifact_actions: フェーズ2で実施すべき成果物操作。新規CREATEは SPEC（AG-001制約上許容）のみ。
# REQ/ADR は UPDATE/APPEND のみ。target_area は operation: update/spec-update の場合必須。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0102.md
    source_items: [AG-004]
    content: |
      REQ-0102 の肥大化解消。現在79要件行のうち、REQ-0138/0140/0144/0145/0154/0155/
      0156/0160/0162/0163 等、他REQへ再配置可能な要件行を当該REQへのAPPEND または移動で
      処理し、REQ-0102 は要件定義プロセス phases 横断の基本契約に縮小する。SPLIT 完了後、
      REQ-0102 は分割先REQ群への参照を「関連情報」セクションに保持する。
      新規REQはCREATE不可（AG-001 制約）、既存REQへのAPPEND/UPDATE で対応。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0162.md
    source_items: [AG-005]
    content: |
      REQ-0162-009/010 等の分離候補を処理。本体固有規則と標準REQの分離を完了し、
      harness 境界浄化を完結する。concrete ID 216件残（intake-2026-07-19-concrete-id-
      path-remaining-216-ng-10-warn.md 参照）について段階的除去計画を要件行に組み込む。

  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-0114.md
    source_items: [AG-005]
    content: |
      ADR-0114 の再構成（2026-07-19 壁打ち合意）。新規ADRのCREATEは不可（Phase1 CR-003）。
      status は accepted を維持し、superseded への変更は行わない。
      【維持する内容】
      - case-run のオーケストレーション責務と実装実行責務の分離
      - worktree、PR、結果契約、Findings / Capture の境界
      - 実装実行を別の実行主体へ委譲する原則
      【更新する内容】
      - 外部実行バックエンドとドライバーサブエージェントを「現在の規範的な実行方式」として
        記述している箇所の整理
      - 3状態の結果契約を4状態（completed-pr / blocked / failed / delegation-unavailable）へ更新
      - 単独 case-run 実行と case-auto 内での case-run インライン実行の関係を明示
      - ADR-0128、ADR-0136、ADR-0137 との関係を Decision Map・Supersedes・Relates-to 節に反映
      背景としての過去経緯は残してよいが、決定と結果の節は現在の責務境界を表す記述にする。

  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: docs/adr/ADR-0125.md
    source_items: [AG-005]
    content: |
      ADR-0125 の再構成（2026-07-19 壁打ち合意）。status は accepted 維持、superseded 変更なし。
      【維持する内容】
      - 同一 Wave 内の独立子 Issue を最大5件まで並列実行すること
      - 直列指定対象は逐次実行すること
      - Wave 境界では全対象の完了を待つこと
      - 部分失敗時に他の独立実行を継続すること
      【更新する内容】
      - case-auto が子 Issue ごとに case-run を委譲するという旧実行方式の記述を削除
      - case-run が単一 Issue のみを処理するという記述を削除
      - Epic Issue 本文の更新主体に関する旧責務の記述を削除
      - ADR-0137（case-run インライン実行の標準動作化）、ADR-0138（Phase 制御・固定並列数）
        による現在の Phase 2 制御、固定並列数、インライン実行との関係を反映

  - id: ACT-ADR-003
    artifact: adr
    operation: update
    target: docs/adr/ADR-0127.md
    source_items: [AG-005]
    content: |
      ADR-0127 の再構成（2026-07-19 壁打ち合意）。status は accepted 維持、superseded 変更なし。
      case-run は4構成工程（req-save、spec-save、case-open、case-close）の委譲モデルから除外し、
      インライン実行を標準動作として記述する。
      【維持する内容】
      - req-save、spec-save、case-open、case-close を独立コンテキストへ委譲する判断
      - case-auto が構成工程の内部処理を抱え込まないこと
      【更新する内容】
      - case-run を委譲対象に含めている記述を削除
      - case-run のインライン実行を例外的フォールバックとしている記述を削除
      - case-auto が Epic 状態更新や子 Issue 実行を直接所有する旧記述を削除
      - docs/specs/foundations/workflow-contracts.md を現行契約先としている参照を
        docs/specs/workflows/workflow-contracts.md（Q5 合意による物理統合後）へ更新
      - ADR-0137 によって case-run インライン実行が標準動作になったことを反映
      - ADR-0138 による Phase 制御の所有範囲を反映

  - id: ACT-ADR-004
    artifact: adr
    operation: update
    target: docs/adr/ADR-0128.md
    source_items: [AG-005]
    content: |
      ADR-0128 の再構成（2026-07-19 壁打ち合意）。status は accepted 維持、superseded 変更なし。
      単独 case-run と case-auto 経由 case-run の2形態を読み分けられるようにする。
      【維持する内容】
      - 単独実行された case-run が実行担当へ委譲すること
      - 単一 Issue または単一 Wave を対象とすること
      - case-close が Wave 境界のマージ、クローズを担うこと
      - 4状態の結果契約（completed-pr / blocked / failed / delegation-unavailable）
      【更新する内容】
      - load_skills、特定の起動方式、固定 timeout などのハーネス固有記述を削除
      - case-auto から case-run を委譲することを前提とした説明を削除
      - Epic / Wave オーケストレーションを全面的に case-run / case-close へ移管したとする記述を削除
      - ADR-0137 のインライン実行と ADR-0138 の Phase 制御を反映した呼び出し形態の区別
      【2形態の読み分け】
      - 単独 case-run: case-run が実行担当へ委譲する
      - case-auto 経由: case-auto が case-run の準備、結果処理をインライン実行し、
        実行担当へ直接委譲する（委譲起点の折りたたみ）

  - id: ACT-ADR-005
    artifact: adr
    operation: update
    target: docs/adr/README.md
    source_items: [AG-005]
    content: |
      docs/adr/README.md の Decision Map 更新（2026-07-19 壁打ち合意、Q4 に伴う編集対象）。
      以下の relates-to / supersedes 関係を反映し、現在と矛盾する記述を更新する。
      - ADR-0137 → ADR-0127: case-run を構成工程委譲の対象から除外
      - ADR-0137 → ADR-0128: case-auto 経由時の委譲起点を折りたたむ
      - ADR-0137 → ADR-0136: 多重委譲を要求しない形でハーネス境界を維持
      - ADR-0138 → ADR-0125: Wave 内固定並列数と実行制御主体を具体化
      - ADR-0125、0127、0128 の既存説明のうち現在と矛盾する記述を更新
      4 ADR の status は accepted を維持し、superseded への変更は行わない。

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: foundations
      slug: numbering-policy
    source_items: [AG-006, AG-007]
    content: |
      SC-001 採番管理SPEC。REQ/ADR/IR の欠番運用を統一し、採番ミス・意図的予約・欠番維持
      の判断基準を定義する。F-003（REQ-0157）、F-004（IR-045）を根絶する。
      既存の alloc-req-number.ts / alloc-adr-number.ts / alloc-composite-id.ts
      （agentdev-req-file-manager scripts）と協調し、欠番埋め禁止を SPEC 本文で宣言する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: integrity
      slug: index-auto-generation
    source_items: [AG-006, AG-007]
    content: |
      SC-002 索引類自動生成SPEC。docs/adr/README.md、docs/requirements/README.md、
      docs/README.md、docs/DOC-MAP.md の件数・一覧を実ファイルの frontmatter から再生成
      する機構を定義する。F-001（ADR README キャプション）、F-002（accepted リスト）、
      F-005（トピック別ビュー）を根絶する。AG-006' 候補2/3/8 の SPEC 化。

  - id: ACT-SPEC-003
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: local
      slug: audit-ledger-lifecycle
    source_items: [AG-006, AG-009]
    content: |
      SC-003 監査台帳ライフサイクルSPEC。one-time 監査成果物のライフサイクル
      （生成・参照・フェーズ参照化・廃棄）を一般化し、将来の監査フェーズ運用のモデルを
      定義する。Phase1 監査台帳の廃棄条件（CR-004: フェーズ3完了時）を一般化する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: "## 正規所有者と参照関係"
    source_items: [AG-002, AG-005]
    content: |
      workflow-contracts の物理統合（2026-07-19 壁打ち合意、U-007 確定）。
      docs/specs/foundations/workflow-contracts.md を削除する。同ファイルに実質的な契約本文は
      既に残っておらず、移管先一覧のみが存在するため、「残存主張の新版への統合」作業は不要。
      正規所有者は docs/specs/workflows/ 配下の各 SPEC に一本化する。空 stub、リダイレクト専用
      SPEC、accepted 状態の互換索引は残さない。active 文書から旧パスへの参照を更新する。必要な
      旧パス対応は既存の obsolete path 管理へ記録する。retired 文書内の履歴参照は変更対象外とする。
      旧ファイル削除自体は case-run フェーズで実施する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: responsibility-boundary-purification
    target_area: "## 語彙"
    source_items: [AG-002, AG-005]
    content: |
      responsibility-boundary-purification.md の語彙揺れ修正
      （intake-2026-07-19-responsibility-boundary-purification-vocab-drift-inline-control.md
       参照）を反映。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    source_items: [AG-005]
    content: |
      IR-055 heuristic 集計仕様（intake-2026-07-19-check-integrity-ir055-heuristic-
      aggregation.md 参照）を catalog に反映。

# conflict_resolutions: Phase1 CR-001〜008 を踏襲しつつ、Phase2 固有の判断を記録。
# 後続コマンドは本欄に記録済みの衝突についてユーザーへ再確認しない（REQ-0138-014）。
conflict_resolutions:
  - id: CR-001
    conflict: 第1フェーズ4硬制約の後半2件（監査前の一括退役禁止、未決事項確定不可）を
      本フェーズで解除するか
    resolution: 解除する。第1フェーズが one-time ライフサイクルで「候補抽出まで」に留めた
      のに対し、第2フェーズは「処置の確定と実行」を担う Phase1 CR-001 計画フェーズ分割の
      完結が目的。ただし前半2件（新規REQ/ADR原則追加不可、公開command動作不改）は恒久制約
      として継続する。

  - id: CR-002
    conflict: REQ-0102 SPLIT を本フェーズで実施するか、別Issue に切り出すか
    resolution: 本フェーズで実施する。Phase1 CR-004 で「再編フェーズの req-define で判断」
      と委譲されており、AG-004 として組み込む。ただし作業規模が大きいため operation_units
      で OU-001 として独立 Issue 化し、依存関係を明示する。

  - id: CR-003
    conflict: AG-006' 自動化候補8件をフェーズ2に含めるか、フェーズ3に切り出すか
    resolution: 2026-07-19 壁打ち合意。切り分け基準を以下のとおり確定する。
      【フェーズ2】正規所有者、物理配置、参照関係、重複記述を是正する作業であり、新規 script 開発、
      文書の生成物への変更、継続的な自動同期機構の追加、docs-check/CI/検証器への新規組み込みを
      伴わないもの。対象: (6) doc-writing REFERENCE 強化、(7) SKILL.md Wave 1 手作業による重複除去。
      (8) DOC-MAP は DECLARE 完了済みとして作業対象から除外し、フェーズ2完了時の確認項目として
      のみ扱う。
      【フェーズ3】生成、導出、自動同期、継続検証の仕組みを追加するもの。対象: (1) catalog
      GENERATE 化、(2) ADR README GENERATE 化、(3) REQ README GENERATE 化、(4) rule-ownership
      matrix GENERATE 化、(5) health-metrics GENERATE 化、(7) SKILL.md を SPEC から DERIVE/GENERATE
      する仕組み。SKILL.md Wave 2/3 は DERIVE/GENERATE 機構の導入対象とする場合のみフェーズ3とし、
      手作業による重複除去のみを行う場合は別再編作業として扱う。

  - id: CR-004
    conflict: 監査台帳の廃棄タイミング、フェーズ2完了時かフェーズ3完了時か
    resolution: 2026-07-19 壁打ち合意。フェーズ2完了時に削除する。one-time 監査成果物をフェーズ
      横断の進捗管理台帳として恒久化しない。ライフサイクル5ステップ: (1) フェーズ2中は監査台帳を
      参照入力として保持、(2) フェーズ2で判断が確定した時点で新規追記を停止し参照専用とする、
      (3) フェーズ3対象を自足したフェーズ3用入力へ転記（背景、対象候補、正規所有者、自動化後の
      状態、対象外、受け入れ条件を含む）、(4) フェーズ3用入力への移管漏れがないことを確認、
      (5) 移管確認をフェーズ2の完了条件とし、その完了時に監査台帳を削除する。フェーズ3用入力が
      未作成または自足していない状態ではフェーズ2を完了扱いとせず、監査台帳も削除しない。
      SC-003 でこの運用を一般化する。

  - id: CR-005
    conflict: フェーズ2のスケール、standard か large か
    resolution: large 相当。AG-001〜AG-009 の作業範囲は REQ/ADR/SPEC 17カテゴリ・
      U-001〜U-015 15件・F-001〜F-006 6件・SC-001〜SC-003 3件の新規SPEC・REQ-0102 SPLIT・
      4 ADR の再構成に及び、standard の範囲を超える。ただし work_type=maintenance では
      scale 設定なし（req-define SPEC）。operation_units で5OUに分解し、Epic 構成で進行管理
      する。

# operation_units: OU-001〜OU-005。scale=large 相当だが work_type=maintenance なので
# scale フィールドは standard を基本、OU-001 のみ REQ-0102 SPLIT で large 相当。
operation_units:
  - ou_id: OU-001
    target_req: REQ-0102
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    target_spec:
      operation: create
      domain: foundations
      slug: numbering-policy
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    target_spec:
      operation: create
      domain: integrity
      slug: index-auto-generation
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    target_spec:
      operation: create
      domain: local
      slug: audit-ledger-lifecycle
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-005
    target_req: REQ-0162
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    # target: ADR-0114/0125/0127/0128 + docs/adr/README.md（ACT-ADR-001〜005）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

  - ou_id: OU-007
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}

  - ou_id: OU-008
    # target: docs/adr/README.md（F-001/002/005 即時修正、U-003/004/005 解消）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}

  - ou_id: OU-009
    # target: src/opencode/skills/agentdev-doc-writing/SKILL.md + src/opencode/skills/agentdev-*/SKILL.md Wave 1
    # AG-008 フェーズ2対象。AG-001 公開動作不改制約の範囲内（REFERENCE 強化と手作業重複除去のみ）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}

  - ou_id: OU-010
    # target: フェーズ3用入力（新規作成）+ U-001〜U-015 横断解消残の最終確認
    # AG-009 監査台帳ライフサイクル完了条件（フェーズ3用入力への移管確認）
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004, OU-005, OU-006, OU-007, OU-008, OU-009]
    recommended_order: 10
    issue_policy: single
    result: {}

# test_strategy: AG-001〜AG-009 の検証。on_failure は必須（REQ-0138 テスト戦略3要素）。
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      監査台帳 AG-002〜AG-004 が記録した17カテゴリ（A〜Q）すべてについて、処置方針が
      「候補」から「確定」に昇格し、物理的編集が実行されていることを確認する。
      各カテゴリの代表方針と副次方針が監査台帳または後続SPECに記録されていることを確認する。
    pass_criteria: |
      (a) 17カテゴリすべてに処置方針確定結果が記録されている
      (b) KEEP 以外の処置方針（MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）については、
          物理的編集が実行されている（GENERATE はフェーズ3切り出しを含む）
      (c) 監査台帳の各カテゴリ欄に確定日付と実行結果が書き戻されている
    on_failure: |
      fix-and-reverify。処置漏れは即時実行し、監査台帳への書き戻しを再検証する。

  - id: TS-002
    target_item: AG-003
    verification: |
      監査台帳 U-001〜U-015 の未決事項15件すべてについて、解決結果が確定し実行されて
      いることを確認する。
    pass_criteria: |
      (a) U-001〜U-015 すべてに解決結果が記録されている
      (b) 各解決結果に対応する物理的編集（REQ/ADR/SPEC UPDATE またはファイル作成）が
          実行されている
      (c) 解決結果が第1フェーズ監査台帳の U-001〜U-015 欄に書き戻されている
    on_failure: |
      fix-and-reverify。未解決事項が残る場合、当該OUを再実行し、解決結果を再記録する。

  - id: TS-003
    target_item: AG-006
    verification: |
      SC-001（docs/specs/foundations/numbering-policy.md）、SC-002
      （docs/specs/integrity/index-auto-generation.md）、SC-003
      （docs/specs/local/audit-ledger-lifecycle.md）の3ファイルが作成され、それぞれの
      SPEC 内容が F-003/004、F-001/002/005、監査台帳ライフサイクルの根絶条件を満たすこと
      を確認する。
    pass_criteria: |
      (a) 3ファイルが所定のパスに作成されている
      (b) 各SPECの内容が対応する不整合の根絶に寄与する
      (c) docs/specs/README.md のインデックスに3SPECが追加されている
    on_failure: |
      fix-and-reverify。SPEC 内容の不備は spec-save で修正し、インデックス不備は README を
      更新する。

  - id: TS-004
    target_item: AG-007
    verification: |
      索引不整合 F-001〜F-006 の6件すべてについて、解消されていることを確認する。
      F-001 は ADR README キャプション、F-002 は accepted リスト、F-003 は REQ-0157、
      F-004 は IR-045、F-005 はトピック別ビュー、F-006 は REQ-0102 肥大化の各項目について、
      実ファイル状態を検証する。
    pass_criteria: |
      (a) F-001〜F-006 の6件すべてが解消されている
      (b) ADR README は実ファイル（25件 accepted）と一致する
      (c) REQ-0157 と IR-045 は SC-001 で扱いが確定している
      (d) REQ-0102 は AG-004 SPLIT 完了により要件行数が削減されている
    on_failure: |
      fix-and-reverify。未解消項目は即時修正し、実ファイルとの整合を再検証する。

  - id: TS-005
    target_item: AG-008
    verification: |
      AG-006' 自動化候補8件について、フェーズ2対象とフェーズ3切り出しの分類が 2026-07-19 壁打ち
      合意の新基準（CR-003）で確定していることを確認する。フェーズ2対象分（候補6 doc-writing
      REFERENCE 強化、候補7 SKILL.md Wave 1 手作業重複除去）が実行されていることを確認する。
      候補8 DOC-MAP は DECLARE 完了済みとしてフェーズ2完了時確認項目で扱われていることを確認する。
      フェーズ3対象分（候補1〜5 各 GENERATE 化、候補7 SKILL.md DERIVE/GENERATE 機構）が
      フェーズ3用入力（OU-010 で転記）に含まれていることを確認する。
    pass_criteria: |
      (a) 8件の分類結果が監査台帳 AG-006 または後続SPECに記録されている
      (b) フェーズ2対象分（候補6, 7 Wave 1）が実行されている
      (c) 候補8 DOC-MAP が DECLARE 完了済み扱いでフェーズ2完了時確認項目に記載されている
      (d) フェーズ3対象分がフェーズ3用入力に転記されている（OU-010 完了）
    on_failure: |
      fix-and-reverify。分類未確定項目は CR-003 新基準で再判断し、起票漏れは即時作成する。

  - id: TS-006
    target_item: AG-009
    verification: |
      監査台帳（.agentdev/drafts/audit-ledger-governance-system-audit.md）のライフサイクルが
      SC-003 で定義された運用（フェーズ2完了時削除・5ステップモデル）に従っていることを確認する。
      フェーズ3用入力への移管（背景、対象候補、正規所有者、自動化後の状態、対象外、受け入れ条件）
      が完了していることを確認する。フェーズ2完了時に監査台帳が削除されていることを確認する。
    pass_criteria: |
      (a) 監査台帳のライフサイクルが SC-003 で定義された5ステップモデルに合致する
      (b) フェーズ3用入力が作成され、自足している（背景/対象候補/正規所有者/自動化後の状態/対象外/受け入れ条件を含む）
      (c) フェーズ3用入力への移管漏れがないことが確認されている
      (d) フェーズ2完了時（OU-010 完了時）に監査台帳が削除されている
    on_failure: |
      fix-and-reverify。フェーズ3用入力の自足性に欠ける場合は再転記し、移管漏れを再確認する。
      監査台帳削除は移管確認完了後に行う。

  - id: TS-007
    target_item: AG-001
    verification: |
      第1フェーズ4硬制約の適用範囲が本フェーズ用に更新されていることを確認する。
      前半2件（新規REQ/ADR原則追加不可、公開command動作不改）が継続されていること、
      後半2件（監査前の一括退役禁止、未決事項確定不可）が解除されていることを確認する。
    pass_criteria: |
      (a) 新規REQ/ADR が CREATE されていない（既存REQ/ADRへのAPPEND/UPDATE のみ）
      (b) 標準command・標準skill・Project Extensions・repo-local ツール群が編集されていない
      (c) 監査台帳 AG-002〜AG-004 の処置方針が候補から確定に昇格している
      (d) U-001〜U-015 が確定・実行されている
    on_failure: |
      fix-and-reverify。制約違反がある場合、当該編集をリバートし、制約適合する編集を
      再実行する。

case_open_hints:
  epic_needed: true
  decomposition:
    - ou_id: OU-001
      description: REQ-0102 SPLIT（AG-004）
      depends_on: []
      recommended_order: 1
    - ou_id: OU-002
      description: SC-001 採番管理SPEC（AG-006, AG-007）
      depends_on: []
      recommended_order: 2
    - ou_id: OU-003
      description: SC-002 索引類自動生成SPEC（AG-006, AG-007）
      depends_on: []
      recommended_order: 3
    - ou_id: OU-004
      description: SC-003 監査台帳ライフサイクルSPEC（AG-006, AG-009）
      depends_on: []
      recommended_order: 4
    - ou_id: OU-005
      description: REQ-0162 UPDATE（AG-005）
      depends_on: [OU-001]
      recommended_order: 5
    - ou_id: OU-006
      description: ADR-0114/0125/0127/0128 再構成 + Decision Map（AG-005、ACT-ADR-001〜005）
      depends_on: []
      recommended_order: 6
    - ou_id: OU-007
      description: workflow-contracts 物理統合（AG-002, AG-005、ACT-SPEC-004）
      depends_on: []
      recommended_order: 7
    - ou_id: OU-008
      description: ADR README 整合性修正 F-001/002/005（AG-007、U-003/004/005 解消）
      depends_on: []
      recommended_order: 8
    - ou_id: OU-009
      description: doc-writing REFERENCE 強化 + SKILL.md Wave 1 手作業重複除去（AG-008）
      depends_on: []
      recommended_order: 9
    - ou_id: OU-010
      description: U-001〜U-015 横断解消残の最終確認 + フェーズ3用入力転記（AG-009、CR-004 完了条件）
      depends_on: [OU-001, OU-002, OU-003, OU-004, OU-005, OU-006, OU-007, OU-008, OU-009]
      recommended_order: 10
  wave_hints:
    - wave: 1
      ous: [OU-001, OU-002, OU-003, OU-004]
      reason: フェーズ2の骨子。新規SPEC 3件と REQ-0102 SPLIT は他 OU の前提となる。
    - wave: 2
      ous: [OU-005, OU-006, OU-007, OU-008]
      reason: 既存REQ/ADR/SPEC のUPDATE、workflow-contracts 物理統合、F-001/002/005 修正。Wave 1 完了後に実施。
    - wave: 3
      ous: [OU-009, OU-010]
      reason: doc-writing REFERENCE 強化 + SKILL.md Wave 1 と U-001〜U-015 横断解消残・フェーズ3用入力転記。Wave 2 完了後に実施。
  next_phase_instructions:
    - フェーズ2完了条件（OU-010 完了）を満たした後、フェーズ3として
      req-draft-governance-reorganization-phase3.md を作成し、別セッションで req-define を起動する。
    - フェーズ3用入力は OU-010 で転記した自足した入力（背景、対象候補、正規所有者、自動化後の状態、
      対象外、受け入れ条件を含む）を使用する。
    - フェーズ3は AG-006' 候補1〜5（catalog/README/matrix/metrics GENERATE 化）および
      候補7 SKILL.md DERIVE/GENERATE 機構（Wave 2/3 を含む）を対象とする。
    - フェーズ3は work_type=maintenance、scale=large を想定（Phase1 CR-001 適用、
      単一Epicトラック回避）。
    - 監査台帳はフェーズ2完了時（OU-010 完了時）に削除（CR-004、AG-009）。SC-003 運用に従う。
```

# summary

本ドラフトは AgentDevFlow 基準体系・統治境界の統合再編計画 第2フェーズ（再編実施）の
要件定義ドラフトである。第1フェーズ監査台帳
（.agentdev/drafts/audit-ledger-governance-system-audit.md）を主たる参照入力とし、
同台帳が記録した17カテゴリの処置方針（候補）を確定して実行し、未決事項 U-001〜U-015 を
解消し、索引不整合 F-001〜F-006 を修正し、SC-001〜SC-003 の新規SPEC を起票する。

第1フェーズ4硬制約のうち後半2件（一括退役禁止、未決事項確定不可）を本フェーズで解除し、
前半2件（新規REQ/ADR原則追加不可、公開command動作不改）は継続する。AG-006' 自動化候補
8件のうち、個別 IR 依存で SPEC 本文変更を伴わない REFERENCE 強化と SKILL.md Wave 1
重複除去は本フェーズで対応し、新規 script 開発を要する GENERATE 機構はフェーズ3
（後続作業）に切り出す。

本ドラフトは 2026-07-19 壁打ち合意により、フェーズ2/3 切り出し基準（CR-003 新基準）、
監査台帳廃棄タイミング（CR-004 フェーズ2完了時削除）、SKILL.md Wave 1 所属（フェーズ2）、
ADR-0114/0125/0127/0128 再構成編集範囲（Q4）、workflow-contracts 物理統合（U-007 旧ファイル削除）
を確定した。auto_ready: true に昇格し、req-save/spec-save/case-open/case-run/case-close へ進む。

<!-- 参照入力:
  - .agentdev/drafts/audit-ledger-governance-system-audit.md（第1フェーズ監査台帳）
  - .agentdev/intake/inbox/intake-2026-07-19-spec-candidate-*.md（SC-001〜003 候補）
  - .agentdev/intake/inbox/intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md
  - .agentdev/intake/inbox/intake-2026-07-19-responsibility-boundary-purification-vocab-drift-inline-control.md
  - .agentdev/intake/inbox/intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md
  - .agentdev/intake/inbox/intake-2026-07-19-check-integrity-ir055-heuristic-aggregation.md
  - .agentdev/learning/inbox.md（2026-07-19 学び CR-001/002、AG-006 候補裏付け）
-->
