---
draft_type: req_draft
topic_slug: governance-reorganization-phase3-impl
status: saved
created_at: 2026-07-20T00:00:00+09:00
source_rus: []
consumed_artifacts:
  - ACT-REQ-001
  - ACT-REQ-002
  - ACT-REQ-003
  - ACT-REQ-004
  - ACT-SPEC-001
  - ACT-SPEC-002
  - ACT-SPEC-003
  - ACT-SPEC-004
  - ACT-SPEC-005
  - ACT-SPEC-006
---

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  ガバナンス体系統合再編フェーズ3（自動化機構実装）。SC-002 SPEC が定めた
  索引類自動生成機構の Phase C〜E（生成スクリプト実装・docs-check 組込・全索引展開）を
  実装し、第1フェーズ監査 AG-006 候補1〜5、7 Wave 2/3、8 の自動化移行を完了する。
  TypeScript + Bun で生成スクリプト（repo-agentdev-integrity/scripts/generate_indexes.ts）を
  新設し、docs-check は G01 原則を維持して検証のみを担う。Phase D は CI を新設せず
  docs-check 実行時の整合性検証（新規 IR-061）で代替し、SC-002 SPEC を当該解釈へ UPDATE する。
  AG-001 制約（新規 REQ/ADR CREATE 不可）を維持し、REQ-0101/0103 は SPLIT 予兆のため
  APPEND を避けて健全 REQ（0108/0140/0144/0145）へ分散する。Wave 1-5 構成で段階実施。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      TypeScript + Bun で生成スクリプトを新設する。
      配置先: .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
      docs-check 既存資産（cli_utils.ts の parseFrontmatter, readText, listFiles, collectSpecMarkdownRecursively 等）を再利用する。
      実行ランナーは docs-check と同じく Bun とし、require/import 混在構文を許容する。
      自動生成マーカーは HTML コメント形式（<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->）を採用し、Markdown 表示と lint に影響しない形式とする。
  - id: AG-002
    content: |
      docs-check の G01 原則（検査対象 artifact を直接修正しない）は維持する。
      生成スクリプトは docs-check から独立した別ファイルとし、検査対象ファイル（README/catalog/rule-ownership/metrics/DOC-MAP）を上書きする。
      docs-check は検証のみを担い、許可出力（.agentdev/integrity/reports/, .agentdev/intake/inbox/）の範囲は変更しない。
  - id: AG-003
    content: |
      docs-check に新規 IR（IR-061: index generation consistency）を追加し、
      自動生成マーカーで囲まれた領域が実ファイル frontmatter と整合していることを検証する。
      対象: SC-002 適用対象の索引類（docs/README.md, docs/adr/README.md, docs/requirements/README.md,
      docs/requirements/mapping-table.md, docs/specs/README.md, docs/DOC-MAP.md,
      docs/specs/integrity/integrity-rule-catalog.md, docs/specs/integrity/rule-ownership.md,
      docs/specs/quality/req-health-metrics.md, docs/specs/quality/spec-health-metrics.md）。
      severity は strict、再現可能な機械的パターンマッチングで判定する。
  - id: AG-004
    content: |
      Phase D（CI 組込）は CI（GitHub Actions 等）を新設せず、SC-002 SPEC を UPDATE して
      「docs-check 実行時の整合性検証」と読み替える。
      AC-3-2（Phase D 完了条件）は「docs-check 実行で IR-061 が不整合を自動検出できること」へ soft 化する。
      SC-002 SPEC は元々 Phase D を「docs-check または CI に生成検証を組込む」と記載しており、
      docs-check による代替は SPEC の解釈適用範囲内とする。
  - id: AG-005
    content: |
      Wave 1-5 構成（壁打ちメモ案踏襲、Phase1 CR-001 単一Epicトラック回避）。
      Wave 1: 候補1（catalog）+ 候補4（rule-ownership）。IR-* 依存、整合性ドメイン完結。
      Wave 2: 候補2（ADR README）+ 候補3（REQ README）+ 候補8（DOC-MAP）。索引類一括、SC-002 Phase C 主軸。
      Wave 3: 候補5（metrics）。品質ドメイン完結。
      Wave 4: 候補7 Wave 2/3（SKILL.md DERIVE 機構）。
      Wave 5: SC-002 Phase E（全索引展開残）+ フェーズ3完了判定。監査台帳ライフサイクル（SC-003）の完了条件確認。
  - id: AG-006
    content: |
      AG-001 制約（新規 REQ/ADR CREATE 不可、既存 REQ/ADR への APPEND/UPDATE と新規 SPEC CREATE のみ許可）を維持する。
      REQ-0101（63行、SPLIT シグナル合計2）と REQ-0103（90行、SPLIT シグナル合計3）は SPLIT 予兆のため APPEND を避け、
      健全 REQ（REQ-0108/0140/0144/0145、いずれも SPLIT シグナル 0〜1）へ分散する。
      SPLIT 自体は別フェーズまたは inspect/backlog 経由で検討する。
  - id: AG-007
    content: |
      候補1（integrity-rule-catalog GENERATE 化）。
      対象: docs/specs/integrity/integrity-rule-catalog.md の IR エントリ一覧（IR-001〜IR-059、IR-045 欠番）。
      生成元: docs/specs/integrity/rules/IR-*.md の frontmatter（id, title, status, domain 等）。
      生成方法: スクリプトが IR-* を走査し、catalog エントリを再生成。catalog のスキーマ定義セクションは人手編集領域として残置。
      APPEND 先: REQ-0108（docs-check 拡張）。SC-002 SPEC の適用対象拡張（候補1 を含める）。
      新規 IR-061 で catalog 整合性検証を含める。
  - id: AG-008
    content: |
      候補2（ADR README GENERATE 化）。
      対象: docs/adr/README.md の各自動生成対象領域（現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビュー）。
      生成元: docs/adr/ADR-*.md の frontmatter（id, title, status, created）と本文「関連する決定」セクション。
      件数表明「承認済みステータス（accepted）の ADR-01XX 25件」は実測から自動生成する（F-001 根絶）。
      APPEND 先: REQ-0108。既存 IR-038 連動。SC-002 Phase C 適用。
  - id: AG-009
    content: |
      候補3（REQ README GENERATE 化）。
      対象: docs/requirements/README.md の現行要件一覧表、廃止済み要件一覧表、件数表明。
      生成元: docs/requirements/REQ-*.md の frontmatter（id, title）。
      件数表明「54件（REQ-0111, 0115-0118, 0120-0122 は廃止）」は実測から自動生成する。
      APPEND 先: REQ-0108。既存 IR-004/039/042 連動。
  - id: AG-010
    content: |
      候補4（rule-ownership GENERATE 化）。
      対象: docs/specs/integrity/rule-ownership.md のルールドメイン一覧表（37エントリ）。
      生成元: docs/specs/integrity/rules/IR-*.md の所有者情報 + 各 SPEC の canonical owner 宣言。
      生成方法: スクリプトが IR-* と各 SPEC を突合し、ルールドメイン → canonical REQ/SPEC の対応マトリクスを再生成。
      responsibilities/req-impact-map.md（REQ → 影響するルール）との双方向参照整合を維持する。
      APPEND 先: REQ-0145（docs-check 検出設計改善）。SC-002 SPEC の適用対象拡張。新規 IR-061 で rule-ownership 整合性検証。
  - id: AG-011
    content: |
      候補5（req-health-metrics / spec-health-metrics 数値項目 GENERATE 化）。
      対象: docs/specs/quality/req-health-metrics.md の「現行 REQ の計測例（参照値）」テーブル、
      および docs/specs/quality/spec-health-metrics.md に同等の計測例テーブルを新設して再生成対象とする。
      生成元: docs/requirements/REQ-*.md, docs/specs/**/*.md の実ファイル、docs-check 検証レポート。
      生成方法: metrics 計算スクリプトが要件行数、関心分類数、アーティファクト種別数、SPEC 行数、status 放置期間、ドメイン分類適合を集計し再生成。
      APPEND 先: REQ-0144（docs-check 運用是正）。SPEC UPDATE: req-health-metrics.md, spec-health-metrics.md（GENERATE 機構の明記）。
  - id: AG-012
    content: |
      候補7 Wave 2/3（SKILL.md DERIVE 機構）。
      対象: src/opencode/skills/agentdev-*/SKILL.md（28ファイル）の概要節と機能節の重複部分。
      生成元: docs/specs/skills/agentdev-*.md（28ファイル、1:1 対応）の契約記述。
      生成方法: REQ-0140-032 基準の Wave 段階的查読（Wave 1 は フェーズ2 #1610 で実施済）に基づき、
      Wave 2（中優先度）、Wave 3（低優先度）の重複部分を SPEC から DERIVE した生成物に変更する。
      U-012（extension と SKILL.md の記載重複）の解消も含める。
      APPEND 先: REQ-0140（文書品質ゲート）。SPEC UPDATE: document-type-responsibilities.md（Wave 2/3 対象ファイル一覧、優先度判定基準）。
  - id: AG-013
    content: |
      候補8（DOC-MAP GENERATE 化）。
      対象: docs/DOC-MAP.md の件数・一覧表（現行 REQ 一覧、ADR/SPEC/Guides 索引）。
      生成元: docs/requirements/REQ-*.md, docs/specs/**/*.md, docs/adr/ADR-*.md の配置。
      生成方法: スクリプトが実ファイル配置から DOC-MAP の件数・一覧を再生成する。
      DOC-MAP は ADR-0110 に基づく補助索引としての位置づけを維持し、件数・一覧は実ファイルから GENERATE する。
      APPEND 先: REQ-0108。既存 IR-017 連動。SC-002 Phase C 適用。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0108
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-007, AG-008, AG-009, AG-013]
    content: |
      | REQ-0108-{NNN} | docs-check は検査対象を直接修正しない原則（G01）を維持しつつ、生成スクリプト（.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts）と連携して索引類の自動生成と整合性検証を行うこと。生成スクリプトは docs-check から独立した別ファイルであり、docs-check は生成機能を持たず整合性検証のみを担うこと（AG-001/002） |
      | REQ-0108-{NNN} | docs-check の検査カテゴリに「索引類自動生成整合性」を追加し、新規 IR（IR-061: index generation consistency）で生成状態と実ファイルの整合性を検証すること。対象は SC-002 SPEC が定める索引類（docs/README.md, docs/adr/README.md, docs/requirements/README.md, docs/requirements/mapping-table.md, docs/specs/README.md, docs/DOC-MAP.md, docs/specs/integrity/integrity-rule-catalog.md, docs/specs/integrity/rule-ownership.md, docs/specs/quality/req-health-metrics.md, docs/specs/quality/spec-health-metrics.md）（AG-003） |
      | REQ-0108-{NNN} | docs-check の Phase D（CI 組込）は CI（GitHub Actions 等）を新設せず、docs-check 実行時の整合性検証（IR-061）で代替すること。SC-002 SPEC の Phase D 定義は「docs-check 実行時の整合性検証」へ読み替えること（AG-004） |
      | REQ-0108-{NNN} | docs-check は候補1（integrity-rule-catalog）の IR エントリ一覧が docs/specs/integrity/rules/IR-*.md の frontmatter と整合していることを検証すること。catalog のスキーマ定義セクションは人手編集領域として検証対象外とすること（AG-007） |
      | REQ-0108-{NNN} | docs-check は候補2（ADR README）の現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビューが docs/adr/ADR-*.md の frontmatter と本文「関連する決定」と整合していることを検証すること（AG-008、IR-038 連動） |
      | REQ-0108-{NNN} | docs-check は候補3（REQ README）の現行要件一覧表、廃止済み要件一覧表、件数表明が docs/requirements/REQ-*.md の frontmatter と整合していることを検証すること（AG-009、IR-004/039/042 連動） |
      | REQ-0108-{NNN} | docs-check は候補8（DOC-MAP）の件数・一覧表が docs/requirements/REQ-*.md, docs/specs/**/*.md, docs/adr/ADR-*.md の実ファイル配置と整合していることを検証すること（AG-013、IR-017 連動） |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0145
    source_items: [AG-010]
    content: |
      | REQ-0145-{NNN} | docs-check の検出設計に候補4（rule-ownership.md）の整合性検証を追加すること。生成スクリプトが docs/specs/integrity/rule-ownership.md のルールドメイン一覧を IR-* frontmatter と各 SPEC の canonical owner 宣言から再生成し、docs-check が新規 IR-061 で整合性を検証すること（AG-010） |
      | REQ-0145-{NNN} | rule-ownership.md の GENERATE 化に伴い、responsibilities/req-impact-map.md（REQ → 影響するルール）との双方向参照整合を維持すること。生成スクリプトは両ファイルの整合性を保つよう拡張すること（AG-010） |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0144
    source_items: [AG-011]
    content: |
      | REQ-0144-{NNN} | docs-check 運用是正に候補5（metrics 数値項目 GENERATE 化）を追加すること。生成スクリプトが docs/specs/quality/req-health-metrics.md と docs/specs/quality/spec-health-metrics.md の計測例テーブルを、実ファイルの要件行数、関心分類数、アーティファクト種別数、SPEC 行数、status 放置期間、ドメイン分類適合から再生成すること（AG-011） |
      | REQ-0144-{NNN} | metrics 計算スクリプトは定期実行を前提とし、各 SPEC の計測例テーブルを実ファイルの最新状態に追従させること。計測結果と実ファイルの不整合は docs-check（IR-061）で検出すること（AG-011） |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-0140
    source_items: [AG-012]
    content: |
      | REQ-0140-{NNN} | agentdev-doc-writing は REQ-0140-032 基準に基づく SKILL.md 重複查読の Wave 2（中優先度）、Wave 3（低優先度）を実施すること。各 src/opencode/skills/agentdev-*/SKILL.md の概要節と機能節の重複部分を docs/specs/skills/agentdev-*.md から DERIVE した形式に変更すること（AG-012） |
      | REQ-0140-{NNN} | SKILL.md DERIVE 機構は U-012（extension と SKILL.md の記載重複）の解消を含めること。extension は標準 SKILL.md を前提として補完する関係を明確化すること（AG-012） |
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity/index-auto-generation.md
    target_area: "## 適用範囲"
    source_items: [AG-007, AG-010]
    content: |
      ## 適用範囲

      - **対象**: 以下の索引類に含まれる件数、一覧、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表の各自動生成対象領域
        - `docs/README.md`（ドキュメント入口。REQ 件数表明、SPEC 一覧、ADR/ガイド/DOC-MAP 参照リンク）
        - `docs/requirements/README.md`（REQ 一覧、廃止済み REQ 一覧）
        - `docs/adr/README.md`（現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビュー）
        - `docs/specs/README.md`（command SPEC、skill SPEC、横断 SPEC、基盤 SPEC 一覧）
        - `docs/DOC-MAP.md`（探索経路インデックス）
        - `docs/requirements/mapping-table.md`（REQ 移行表）
        - `docs/specs/integrity/integrity-rule-catalog.md`（IR エントリ一覧。IR-* frontmatter から catalog エントリを再生成。スキーマ定義セクションは人手編集領域として残置）
        - `docs/specs/integrity/rule-ownership.md`（ルールドメイン → canonical REQ/SPEC の対応マトリクス。IR-* と各 SPEC の canonical owner 宣言から再生成）
        - `docs/specs/quality/req-health-metrics.md`（現行 REQ の計測例テーブル）
        - `docs/specs/quality/spec-health-metrics.md`（SPEC 計測例テーブル）
      - **対象外**: 各 SPEC、REQ、ADR の本文（自動生成対象は索引類のみ）
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity/index-auto-generation.md
    target_area: "## 段階導入"
    source_items: [AG-001, AG-002, AG-004]
    content: |
      ## 段階導入

      本 SPEC が定義する機構は以下の段階で導入する。各段階の実施可否、タイミングは別途計画で確定する。

      1. **Phase A（F-001/002/005 即時修正）**: 既知の不整合を人手修正で解消する（PR #1599 完了）
      2. **Phase B（要件 SPEC 化）**: 本 SPEC を新設し、機構の契約を確定する（完了）
      3. **Phase C（生成スクリプト実装）**: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` を新設し、主要な索引類から適用する。スクリプトは TypeScript + Bun 実行を前提とし、自動生成マーカー（HTML コメント形式 `<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）で囲まれた領域を上書きする。docs-check 既存資産（cli_utils.ts, check_integrity.ts の parseFrontmatter, readText, listFiles 等）を再利用する
      4. **Phase D（docs-check 組込）**: docs-check に新規 IR（IR-061: index generation consistency）を追加し、docs-check 実行時に自動生成の妥当性を検証する。CI（GitHub Actions 等）は導入せず、docs-check の定期実行で運用する。docs-check は G01 原則（検査対象を直接修正しない）を維持し、生成スクリプトは docs-check から独立して動作する
      5. **Phase E（全索引展開）**: 対象索引すべてへ自動生成を展開する

      Phase C 以降は case-run 工程で実施する。本 SPEC は Phase B の成果物である。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/quality/req-health-metrics.md
    target_area: "## 機械化境界"
    source_items: [AG-011]
    content: |
      ## 機械化境界

      本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

      - **req-define Step 3/10-2**: ドラフト段階で SPLIT シグナルを計算し `draft-meta.split-forecast` に記録（REQ-0136-011）
      - **agentdev-req-structure-diagnostics スキル**: 既存 REQ の健全性診断で本 SPEC の閾値を適用
      - **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC の「現行 REQ の計測例（参照値）」テーブルを実ファイルから再生成する（AG-006 候補5、SC-002 Phase C）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

      本 SPEC 自体は計測ロジックを実装しない。
      閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/quality/spec-health-metrics.md
    target_area: "## 機械化境界"
    source_items: [AG-011]
    content: |
      ## 機械化境界

      本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

      - **inspect-docs / inspect-skills**: 定期診断で本 SPEC の閾値を適用
      - **case-close**: draft → accepted 昇格時に放置期間をリセット
      - **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC に基づく SPEC 計測例テーブルを実ファイルから再生成する（AG-006 候補5、SC-002 Phase C）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

      本 SPEC 自体は計測ロジックを実装しない。
      閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "## SKILL.md 概要節と機能節の重複查読（REQ-0140-031/032）"
    source_items: [AG-012]
    content: |
      ## SKILL.md 概要節と機能節の重複查読（REQ-0140-031/032）

      ### Wave 構成と対象ファイル一覧

      agentdev-doc-writing は REQ-0140-032 基準に基づき、src/opencode/skills/agentdev-*/SKILL.md（28ファイル）の概要節と機能節の重複を段階的に查読する。各 SKILL.md は docs/specs/skills/agentdev-*.md（1:1 対応）を SSoT とし、重複部分を SPEC から DERIVE した生成物に変更する。

      #### Wave 1（高優先度、フェーズ2 #1610 で実施済）
      - agentdev-doc-writing（REFERENCE 強化 + 高優先度重複除去）

      #### Wave 2（中優先度、フェーズ3対象）
      - 中核スキル群: agentdev-req-analysis, agentdev-req-file-manager, agentdev-adr-file-manager, agentdev-adr-guidelines, agentdev-workflow-orchestration, agentdev-workflow-routing, agentdev-workflow-lifecycle
      - 概要節と機能節の重複が明確に存在し、SPEC への DERIVE による解消が効果的なスキルを優先
      - DERIVE 対象: 各 SKILL.md の機能一覧、責務宣言、入出力等の SPEC と重複する記述

      #### Wave 3（低優先度、フェーズ3対象）
      - 補助スキル群: agentdev-doc-map, agentdev-case-run-execution-adapter, agentdev-issue-management, agentdev-epic-tracker, agentdev-gh-cli, agentdev-git-worktree, agentdev-intake-pipeline, agentdev-learning-capture, agentdev-learning-pipeline, agentdev-quality-gates, agentdev-inspect-skills, agentdev-command-authoring, agentdev-command-creator, agentdev-conventional-commits, agentdev-skill-authoring, agentdev-backlog-integration, agentdev-project-extensions, agentdev-req-structure-diagnostics
      - 重複度合いが低い、または SPEC との対応が限定的なスキル
      - U-012（extension と SKILL.md の記載重複）の解消を含める

      #### 優先度判定基準
      - 重複度合い（概要節と機能節の文字重複率）
      - 文書の影響度（配布対象、利用頻度）
      - SPEC との対応関係の明確さ（1:1 対応が取れているか）
      - DERIVE 機構導入の効果（重複解消による保守性向上の大きさ）
  - id: ACT-SPEC-006
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: integrity
      slug: rules/IR-061-index-generation-consistency
    source_items: [AG-003]
    content: |
      ---
      id: IR-061
      title: 索引類自動生成整合性
      status: accepted
      domain: integrity
      category: index-consistency
      severity: strict
      detection_method: pattern-matching
      false_positive_risk: low
      baseline_status: new
      ---

      # IR-061: 索引類自動生成整合性

      ## 検出対象

      SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）が定める索引類自動生成対象の各ファイルについて、自動生成マーカー（`<!-- AUTOGEN:BEGIN:id=xxx -->` と `<!-- AUTOGEN:END -->`）で囲まれた領域が実ファイル frontmatter と整合していることを検証する。

      対象ファイル:
      - `docs/README.md`
      - `docs/adr/README.md`
      - `docs/requirements/README.md`
      - `docs/requirements/mapping-table.md`
      - `docs/specs/README.md`
      - `docs/DOC-MAP.md`
      - `docs/specs/integrity/integrity-rule-catalog.md`
      - `docs/specs/integrity/rule-ownership.md`
      - `docs/specs/quality/req-health-metrics.md`
      - `docs/specs/quality/spec-health-metrics.md`

      ## 検出方法

      1. 各対象ファイルから自動生成マーカーで囲まれた領域を抽出
      2. 対応する生成元ファイル（frontmatter、本文セクション）から期待される内容を算出
      3. 抽出結果と算出結果を比較し、差分があれば NG として報告

      ## severity

      strict（再現可能な機械的パターンマッチングで判定可能）

      ## exemption

      - 自動生成マーカーが存在しないファイルは検証対象外（Phase C 適用前のファイル）
      - 自動生成マーカー外の人手編集領域は検証対象外

      ## 関連

      - SC-002 SPEC: `docs/specs/integrity/index-auto-generation.md`
      - 生成スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
      - 関連 REQ: REQ-0108（docs-check）
      - 関連 IR: IR-004（REQ index）、IR-017（DOC-MAP）、IR-038（ADR index）、IR-039（index REQ title）、IR-042（hardcoded req count）

conflict_resolutions:
  - id: CR-001
    conflict: |
      SC-002 SPEC は Phase D を「CI 組込」と明記していたが、.github/workflows/ ディレクトリが存在せず、CI 前提での運用が即座に困難。本来の目的は「不整合の自動検出」であり、CI の形に拘る必要はない。
    resolution: |
      CI は新設せず、SC-002 SPEC を UPDATE して Phase D を「docs-check 実行時の整合性検証（IR-061）」と読み替える。SC-002 SPEC は元々 Phase D を「docs-check または CI」と記載しており、docs-check による代替は SPEC の解釈適用範囲内。AC-3-2 は soft 化して「docs-check 実行で IR-061 が不整合を自動検出できること」とする。
  - id: CR-002
    conflict: |
      AG-001 制約（新規 REQ/ADR CREATE 不可）に基づき各候補を既存 REQ へ APPEND しようとしたところ、REQ-0101（63行、SPLIT シグナル合計2）と REQ-0103（90行、SPLIT シグナル合計3）が SPLIT 予兆を示し、これらへの APPEND は req-health-metrics SPEC 基準で推奨されない（Step 4-2）。
    resolution: |
      REQ-0101/0103 への APPEND を避け、健全 REQ（REQ-0108/0140/0144/0145、いずれも SPLIT シグナル 0〜1）へ分散する。SPLIT 自体は別フェーズまたは inspect/backlog 経由で検討する。本判定は req-health-metrics SPEC（要件行数 51〜80 → +1、81以上 → +2、関心分類数 2以上 → +1、アーティファクト種別数 3以上 → +1）に基づく。
  - id: CR-003
    conflict: |
      SC-002 SPEC の「対象外」に `integrity-rule-catalog.md` が明記されており（候補1として別途検討）、候補1を進めるには SPEC の対象拡張が必要。
    resolution: |
      SC-002 SPEC を UPDATE して catalog を適用対象に含める（ACT-SPEC-001）。同様に rule-ownership.md も対象拡張に含める（候補4）。これにより候補1と候補4の GENERATE 化が SC-002 SPEC の適用範囲内で処理できる。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0108
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-0145
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_req: REQ-0144
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    target_req: REQ-0140
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    target_spec: docs/specs/integrity/index-auto-generation.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-006
    target_spec: docs/specs/quality/req-health-metrics.md
    operation: spec-update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-007
    target_spec: docs/specs/quality/spec-health-metrics.md
    operation: spec-update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-008
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-009
    target_spec:
      operation: create
      domain: integrity
      slug: rules/IR-061-index-generation-consistency
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` が存在すること。
      `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts --help` を実行し、usage が表示され exit code 0 で終了すること。
    pass_criteria: |
      スクリプトファイルが存在し、--help 実行で使用方法が表示され、exit code 0 で終了する。
    on_failure: |
      fix-and-reverify。実装不良の場合はスクリプトを修正して再検証。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs-check（`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`）を実行し、検査対象ファイル（docs/, src/opencode/）が変更されないこと。生成スクリプトと docs-check が別ファイルであることをファイルパスで確認。
    pass_criteria: |
      docs-check 実行後、検査対象ファイルに変更がない（git status で差分なし）。生成スクリプトが docs-check ディレクトリ外、または別ファイルとして存在する。
    on_failure: |
      fix-and-reverify。docs-check が検査対象を修正している場合は G01 原則違反として実装を修正。
  - id: TS-003
    target_item: AG-003
    verification: |
      `docs/specs/integrity/rules/IR-061-index-generation-consistency.md` が存在すること。
      docs-check 実行で IR-061 検査が走ることをレポートで確認。
    pass_criteria: |
      IR-061 ファイルが存在し、docs-check 実行ログの検査カテゴリに「索引類自動生成整合性」が表示される。
    on_failure: |
      fix-and-reverify。IR ファイルまたは docs-check のカテゴリマップが未実装の場合は追加して再検証。
  - id: TS-004
    target_item: AG-004
    verification: |
      `docs/specs/integrity/index-auto-generation.md` の Phase D セクションを読み、「docs-check 組込」と「CI は導入せず docs-check の定期実行で運用」が記述されていることを確認。
      `.github/workflows/` ディレクトリが存在しないことを確認（CI 新設していないことの証拠）。
    pass_criteria: |
      SC-002 SPEC の Phase D 記述が「docs-check 実行時の整合性検証（IR-061）」になっている。`.github/workflows/` が存在しない。
    on_failure: |
      fix-and-reverify。SC-002 SPEC の UPDATE が未反映の場合は spec-save を再実行。
  - id: TS-005
    target_item: AG-005
    verification: |
      draft の operation_units セクションを読み、OU-001〜OU-009 が存在し、recommended_order が Wave 1-5 構成に整合していることを確認。
    pass_criteria: |
      9 OU が存在し、recommended_order が Wave 1（order 1-2）、Wave 2（order 2）、Wave 3（order 3）、Wave 4（order 4）、Wave 5（完了判定）に対応している。
    on_failure: |
      fix-and-reverify。OU 構成が Wave と整合しない場合は draft を修正。
  - id: TS-006
    target_item: AG-006
    verification: |
      draft の artifact_actions を確認し、operation が append/update/spec-create/spec-update のみで、create（新規 REQ/ADR CREATE）を含まないことを確認。
      target_req が REQ-0108/0140/0144/0145 のみで、REQ-0101/0103 が含まれないことを確認。
    pass_criteria: |
      artifact_actions に operation: create（req/adr）が存在しない。target_req が REQ-0101/0103 を含まない。
    on_failure: |
      fix-and-reverify。AG-001 制約違反の場合は該当 action を健全 REQ へ振り替え。
  - id: TS-007
    target_item: AG-007
    verification: |
      `docs/specs/integrity/integrity-rule-catalog.md` を読み、自動生成マーカー（`<!-- AUTOGEN:BEGIN -->`）が存在することを確認。
      生成スクリプトを実行し、catalog エントリ一覧が `docs/specs/integrity/rules/IR-*.md` の frontmatter と一致することを確認。
    pass_criteria: |
      catalog に自動生成マーカーが存在し、生成スクリプト実行後に IR-* の frontmatter と一致するエントリ一覧が出力される。
    on_failure: |
      fix-and-reverify。catalog の自動生成マーカー追加、またはスクリプトの catalog 生成ロジックを修正。
  - id: TS-008
    target_item: AG-008
    verification: |
      `docs/adr/README.md` を読み、各自動生成対象領域（現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビュー）に自動生成マーカーが存在することを確認。
      生成スクリプトを実行し、各ビューが `docs/adr/ADR-*.md` の frontmatter と一致することを確認。
    pass_criteria: |
      各ビューに自動生成マーカーが存在し、件数表明「承認済みステータス（accepted）の ADR-01XX N件」の N が実測と一致する。
    on_failure: |
      fix-and-reverify。README の自動生成マーカー追加、またはスクリプトの ADR README 生成ロジックを修正。
  - id: TS-009
    target_item: AG-009
    verification: |
      `docs/requirements/README.md` を読み、現行要件一覧表、廃止済み要件一覧表、件数表明に自動生成マーカーが存在することを確認。
      生成スクリプトを実行し、各一覧が `docs/requirements/REQ-*.md` の frontmatter と一致することを確認。
    pass_criteria: |
      各一覧に自動生成マーカーが存在し、件数表明「N件」の N が実測と一致する。
    on_failure: |
      fix-and-reverify。README の自動生成マーカー追加、またはスクリプトの REQ README 生成ロジックを修正。
  - id: TS-010
    target_item: AG-010
    verification: |
      `docs/specs/integrity/rule-ownership.md` を読み、ルールドメイン一覧表に自動生成マーカーが存在することを確認。
      生成スクリプトを実行し、ルールドメイン一覧が IR-* frontmatter と各 SPEC の canonical owner 宣言と一致することを確認。
      `docs/specs/responsibilities/req-impact-map.md` との双方向参照整合を確認。
    pass_criteria: |
      ルールドメイン一覧に自動生成マーカーが存在し、生成結果が IR-* と各 SPEC と一致する。req-impact-map.md との双方向参照が整合する。
    on_failure: |
      fix-and-reverify。rule-ownership.md の自動生成マーカー追加、またはスクリプトの突合ロジックを修正。
  - id: TS-011
    target_item: AG-011
    verification: |
      `docs/specs/quality/req-health-metrics.md` と `docs/specs/quality/spec-health-metrics.md` の計測例テーブルを読み、自動生成マーカーが存在することを確認。
      生成スクリプトを実行し、計測例テーブルの数値が実ファイルの集計結果と一致することを確認。
    pass_criteria: |
      各 SPEC に計測例テーブルの自動生成マーカーが存在し、生成結果が実ファイル集計と一致する。
    on_failure: |
      fix-and-reverify。SPEC の自動生成マーカー追加、またはスクリプトの metrics 計算ロジックを修正。
  - id: TS-012
    target_item: AG-012
    verification: |
      Wave 2/3 対象 SKILL.md（中核スキル群 + 補助スキル群）を読み、概要節と機能節の重複部分が SPEC から DERIVE された形式（SPEC 参照または自動生成マーカー）に変更されていることを確認。
      `docs/specs/skills/agentdev-*.md` と対応する SKILL.md の内容整合を確認。
    pass_criteria: |
      Wave 2/3 対象の全 SKILL.md（中核7 + 補助18 = 25ファイル、doc-writing は Wave 1 完了済のため除外）の重複部分が SPEC から DERIVE されている。U-012（extension と SKILL.md の重複）が解消されている。
    on_failure: |
      fix-and-reverify。DERIVE 未実施の SKILL.md がある場合は個別に DERIVE 処理を追加。U-012 が未解消の場合は extension 側の調整を実施。
  - id: TS-013
    target_item: AG-013
    verification: |
      `docs/DOC-MAP.md` を読み、件数・一覧表に自動生成マーカーが存在することを確認。
      生成スクリプトを実行し、DOC-MAP の件数・一覧が `docs/requirements/REQ-*.md`, `docs/specs/**/*.md`, `docs/adr/ADR-*.md` の実ファイル配置と一致することを確認。
    pass_criteria: |
      DOC-MAP に自動生成マーカーが存在し、件数・一覧が実ファイル配置と一致する。
    on_failure: |
      fix-and-reverify。DOC-MAP の自動生成マーカー追加、またはスクリプトの DOC-MAP 生成ロジックを修正。

case_open_hints:
  epic_needed: true
  decomposition: |
    フェーズ3は Wave 1-5 構成（Phase1 CR-001 単一Epicトラック回避）。各 Wave を子 Issue として展開可能。
    Wave 1: OU-001（REQ-0108 APPEND 一部）+ OU-002（REQ-0145 APPEND）+ OU-005（SC-002 SPEC UPDATE 一部）+ OU-009（IR-061 CREATE）
    Wave 2: OU-001（REQ-0108 APPEND 残）+ OU-005（SC-002 SPEC UPDATE 残）
    Wave 3: OU-003（REQ-0144 APPEND）+ OU-006（req-health-metrics UPDATE）+ OU-007（spec-health-metrics UPDATE）
    Wave 4: OU-004（REQ-0140 APPEND）+ OU-008（document-type-responsibilities UPDATE）
    Wave 5: フェーズ3完了判定、SC-003 監査台帳ライフサイクル完了条件確認
  wave_hints:
    - "Wave 1: 候補1+4（catalog/rule-ownership、IR-* 依存、整合性ドメイン完結）"
    - "Wave 2: 候補2+3+8（ADR README/REQ README/DOC-MAP、索引類一括、SC-002 Phase C 主軸）"
    - "Wave 3: 候補5（metrics、品質ドメイン完結）"
    - "Wave 4: 候補7 W2/3（SKILL.md DERIVE 機構、doc-writing 責務）"
    - "Wave 5: SC-002 Phase E（全索引展開残）+ フェーズ3完了判定"
```

# summary

## 壁打ち経緯と主要判断

本ドラフトはフェーズ2（Epic #1601）で完了した SC-001/002/003 SPEC 群を前提とし、SC-002 が定めた Phase C〜E を実装するフェーズ3の要件定義。入力は `.agentdev/drafts/req-draft-governance-reorganization-phase3.md`（フェーズ2で作成された壁打ちメモ、参照専用）。

主要な合意事項:

- **技術スタック**: TypeScript + Bun（docs-check 既存資産との親和性）。生成スクリプトは `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` として新設。
- **docs-check と生成の分離**: docs-check の G01 原則（検査対象を直接修正しない）は維持。生成スクリプトは docs-check から独立。
- **Phase D の読み替え**: CI（GitHub Actions 等）は新設せず、SC-002 SPEC を UPDATE して「docs-check 実行時の整合性検証（IR-061）」で代替。
- **Wave 構成**: メモ案 Wave 1-5 を踏襲。
- **AG-001 制約維持**: 新規 REQ/ADR CREATE 不可。REQ-0101/0103 は SPLIT 予兆のため APPEND を避け、健全 REQ（0108/0140/0144/0145）へ分散。

## ADR判断

新規 ADR は不要。理由:
- 全て既存 SPEC（SC-002, req-health-metrics, spec-health-metrics, document-type-responsibilities）の UPDATE または新規 IR CREATE の範囲内で処理可能
- ADR-0124（soft-contract）、ADR-0135（project extensions）の適用範囲内
- 責務境界変更なし（docs-check と生成スクリプトの分離は既存 G01 原則の適用）
- Phase D の読み替えは SC-002 SPEC の解釈適用範囲内（元々「docs-check または CI」と記載）

## スコープ外

- REQ-0101/0103 の SPLIT（別フェーズまたは inspect/backlog 経由で検討）
- CI（GitHub Actions）の導入（本ドラフトでは見送り、docs-check 実行時検証で代替）
- フェーズ2で実施済みの候補6（doc-writing REFERENCE 強化）、候補7 Wave 1（SKILL.md 高優先度重複除去）

## 完了条件（フェーズ3完了判定）

- AC-1: 候補1〜5 の GENERATE 機構が実装完了（ACT-REQ-001〜004, ACT-SPEC-001〜004, ACT-SPEC-006）
- AC-2: 候補7 Wave 2/3 の SKILL.md DERIVE 機構が実装完了（ACT-REQ-004, ACT-SPEC-005）
- AC-3: SC-002 Phase C〜E 完了（生成スクリプト、docs-check 組込、全索引展開）
- AC-4: F-001/002/005 が構造的に根絶（IR-061 で不整合検出）
- AC-5: AG-001 制約遵守（新規 REQ/ADR CREATE なし）
- AC-6: 監査台帳ライフサイクル完了（SC-003、AG-006 候補1〜8 処理状況確定）

