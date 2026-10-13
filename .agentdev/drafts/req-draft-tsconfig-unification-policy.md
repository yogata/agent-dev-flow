---
draft_type: req_draft
topic_slug: tsconfig-unification-policy
status: draft
created_at: 2026-10-13T12:40:00Z
source_rus:
  - RU-0206
---

# draft-data

```yaml
# 方針決定の産出（tsconfig 二重管理統合・typecheck gate 組込み）。実装は対象外
work_type: maintenance

scale: standard

summary: local ツール package と agentdev-gh ルート package の tsconfig 二重管理について、統合（extends 参照共有）と local package の typecheck 品質ゲート組込み（誤 import 修正完了後をタイミング）の方針を証拠ベースで確定し、REQ 新設と runtime-package-boundary Design への契約追記として記録する。gate 組込み実装・tsconfig 構造の実際の変更は対象外。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ①tsconfig 二重管理の統合・参照共有の可否決定: 統合する。
      実測根拠: src/common/tools/agentdev-gh/tsconfig.json（ルート package）と
      src/common/tools/agentdev-gh/local/tsconfig.json（Local 実装 package）は
      compilerOptions 全項目と include を含む完全同一内容の二重管理である（実ファイル突合、2026-10-13）。
      方式: Local 側の tsconfig.json はルート側へ extends で参照し、差分は
      include 等の Local 固有設定へ限定する。同一内容の tsconfig を並列維持する形態を採用しない。
  - id: AG-002
    content: |
      ②typecheck を local package の品質ゲートへ組み込む是非とタイミングの決定: 組み込む。
      Local ツール package には typecheck script（tsc --noEmit）が既存である（package.json 実測）。
      タイミング: Local package 内の誤 import 修正（RU-0205、Batch B 別 draft）完了後とし、
      検査が緑（pass）になる状態を前提条件とする（RU 本文の前提留意どおり、
      方針決定自体は RU-0205 の完了を前提としないため depends_on は設定しない）。
      REQ-009-016 の Local 版の同期・インストール配布対象からの除外は変更せず、
      本件は本体リポジトリ内の検査実行の追加である。
  - id: AG-003
    content: |
      対象外の明示（RU 本文どおり）: gate 組込みの実装自体、tsconfig 構造の実際の変更は
      本方針決定の対象外である。方針決定後に別要求として発生する。
      本 RU の完了条件は決定の記録（REQ 新設と Design 反映）までである。
  - id: AG-004
    content: |
      Decision 判断記録（STEP-5、agentdev-decision-guidelines・agentdev-architecture-advisory 契約適用）:
      Decision 番号指定 new:{topic-slug} による Decision 作成は不採用とする。
      重複確認: 既存 accepted Decision（DEC-001〜DEC-058）に tsconfig 二重管理・typecheck gate 組込みの
      決定は存在しない（Decision インデックス実査）。
      禁止ゲート判定: tsconfig 参照共有方式は既存 Design（docs/designs/local/runtime-package-boundary.md、
      local package 境界の正規所有）の適用範囲に収まる（作成不可条件10: 既存文書種別への適合）。
      typecheck gate 組込みは品質検査運用の変更であり運用ルール系の REQ/Design 更新で処理する。
      逆転の困難さ（tsconfig 構成は容易に変更可能）とアーキテクチャ上の重要性（影響は local ツール
      package に限定）から Decision 評価基準3基準のいずれにも該当しない。
      architecture-advisory 4 ラベル構造（in-context 適用）:
      確定事項 = 統合方針（extends 参照共有）と typecheck 組込み方針（修正完了後タイミング）、
      推定事項 = なし（証拠から一意導出）、
      ユーザー確認事項 = なし（ユーザー指示 (b) により証拠ベース自律完結）、
      ブロッカー = なし。
  - id: AG-005
    content: |
      REQ 新設時の検証対応 3 段確認（STEP-4 規約）の結果:
      (1) 要件行の命題: 「方針決定が記録されること」は達成状態が判定可能な文として記述できる。
      (2) 実装実体の所在: REQ ファイル（新規採番）と runtime-package-boundary.md の新規セクション。
      (3) 検証手段: docs-check（README 索引・frontmatter 整合性）と Design 反映内容の突合。
      verification 対応は docs-check が恒常検証手段として割当可能であり、
      traceability/policy.yaml への optional 登録は不要と判断した（判断結果の記録）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:tsconfig-unification-policy
    source_items: [AG-001, AG-002, AG-003, AG-005]
    content: |
      # local package tsconfig 二重管理統合・typecheck gate 組込みの方針決定

      ## 目的

      local ツール package（src/common/tools/<name>/local/）とルート package（src/common/tools/<name>/）の
      tsconfig 二重管理の統合方針、および local package の typecheck を品質ゲートへ組み込む是非とタイミングを
      決定として記録し、後続実装要求の判断根拠を提供する。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | （採番は Definition 保存時に決定的スクリプトで実施） | local ツール package とルート package の tsconfig 二重管理を統合し、Local 側はルート側へ extends で参照して差分を Local 固有設定へ限定すること（二重管理しない） | 同一内容の tsconfig.json が並列に存在しないこと | 実ファイル突合 |
      | （同上） | local package の typecheck を本体リポジトリの品質検査経路へ組み込むこと。組込みタイミングは Local package 内の誤 import 修正完了後とする | 品質検査経路に local package typecheck が含まれ、検査が緑になること | 品質検査経路の実行 |
      | （同上） | gate 組込みの実装自体と tsconfig 構造の実際の変更は本方針決定の対象外であること（方針決定後に別要求として発生） | 方針決定の記録が対象外を明記すること | 要件doc確認 |

      ## 適用範囲

      - 対象: src/common/tools/agentdev-gh/（ルート package と local package）のビルド・検査契約。方針の横展開（他 local ツール package への適用）は後続実装要求の判断材料として記録する
      - 対象外: gate 組込みの実装自体、tsconfig 構造の実際の変更、配布・同期契約（REQ-009-016）の変更
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/local/runtime-package-boundary.md
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "## local ツール package の tsconfig 参照共有と typecheck 検査契約"
    placement: tail
    anchor: "## v4 adapter 境界への接続"
    canonical_owner: REQ-009
    source_items: [AG-001, AG-002]
    content: |
      ## local ツール package の tsconfig 参照共有と typecheck 検査契約

      ルート package（`src/common/tools/<name>/`）と Local 実装 package（`src/common/tools/<name>/local/`）の `tsconfig.json` を並列に二重管理しない。Local 側の `tsconfig.json` はルート側へ `extends` で参照し、差分は `include` 等の Local 固有設定へ限定する。

      Local ツール package の `typecheck` script（`tsc --noEmit`）を本体リポジトリの品質検査経路へ組み込む。組込みのタイミングは、Local package 内の誤 import 修正完了後とし、検査が緑（pass）になる状態を前提条件とする。この契約は Local 版の同期・インストール配布対象からの除外（REQ-009-016）を変更せず、本体リポジトリ内の検査実行の追加である。

conflict_resolutions:
  - id: CR-001
    conflict: "agentdev_handoff: true の RU に対する前工程からの引き継ぎ判定（STEP-2 規約では agentdev-workflow-lifecycle に従い引き継ぎ用 RU 入力として整理し停止し得る）"
    resolution: "本リポジトリは AgentDevFlow 自己ホスティングであり、AgentDevFlow 本体の改修要求が通常入力である。ユーザー指示 (a) により本リポジトリ（自己ホスティング）では agentdev_handoff: true の RU を通常入力として扱い、前工程引き継ぎ停止を発動しない。4 RU 共通の方針として確定"

operation_units:
  - ou_id: OU-001
    source_ru: RU-0206
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0206
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Definition 保存（case-ready）後、docs-check を実行し、新規 REQ の README 索引登録と
      frontmatter 整合性を確認する。あわせて runtime-package-boundary.md の新規セクション
      （tsconfig 参照共有と typecheck 検査契約）が anchor「## v4 adapter 境界への接続」セクション末尾に
      配置されていることをファイル読取で確認する。
    pass_criteria: |
      docs-check がエラー 0 件で完了し、runtime-package-boundary.md に新規セクション
      「## local ツール package の tsconfig 参照共有と typecheck 検査契約」が1件存在すること。
    on_failure: |
      fix-and-reverify: REQ/Design の記述を修正して docs-check と配置確認を再実行する。
      記述の不備ではなく保存操作の不備の場合は Definition 保存をやり直す。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ の方針決定記述と runtime-package-boundary.md の反映契約を突合し、
      ①extends 参照共有方式、②typecheck 組込みタイミング（誤 import 修正完了後）、
      ③REQ-009-016 の配布除外は変更しない旨の3点が両文書で矛盾なく記述されていることを確認する。
    pass_criteria: |
      両文書の方針記述に矛盾がなく、 REQ-009-016 除外契約の変更が含まれないこと。
    on_failure: |
      fix-and-reverify: 矛盾する記述を修正し突合を再実行する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0206
    source_item: RU-0206.対象外（gate 組込みの実装自体）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      RU 本文が対象外として明示している（方針決定後に別要求として発生）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0206.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0206
    source_item: RU-0206.depends_on（RU-0205 への依存）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      方針決定自体は RU-0205 の完了を前提としないため依存を設定しない（RU 本文の前提留意どおり）。
      gate 緑化の前提整理は AG-002 に記録済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0206.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/local/runtime-package-boundary.md
    target_content_sha256: 7c36d4ed8a094c4afed2df8eef0fc8bbdbefdd9d5ad237d2c9b90de4e08fbc8d
    check_scope:
      heading: "## v4 adapter 境界への接続"
      start_line: 485
      end_line: 488
    execution_conditions:
      operation: append
      edit_sha256: 887272f27a462d60337469a7c2479d4d30ac5bc7689dc6ce7406d75e1431e759
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 6
      added: 6
      removed: 0
    executed_at: 2026-10-13T12:39:22.871Z

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

tsconfig 二重管理（ルート package と local package の完全同一内容、実測）について、統合方針（Local 側 extends 参照共有）と typecheck 品質ゲート組込み方針（誤 import 修正〔RU-0205〕完了後をタイミング）を証拠ベースで確定した。
Decision は既存 Design（runtime-package-boundary.md）適用範囲への収まりと逆転容易性から作成せず、Design 反映を正とした。
gate 組込み実装・tsconfig 構造の実際の変更は本 draft の対象外であり、方針決定後に別要求として発生する。
