---
draft_type: req_draft
topic_slug: RU-0016
status: saved
created_at: 2026-08-10T02:12:00+09:00
source_rus: [RU-0016]
---

# req-define draft: RU-0016

- source RU: `.agentdev/backlog/req-units/RU-0016.md`
- logical_key: `adr-to-decision-canonical-artifact-migration`
- agreement_confirmed_at: 2026-08-10T01:36:00+09:00
- generated_at: 2026-08-10 (req-define)

## 分析サマリ

| 項目 | 判定 | 根拠 |
|---|---|---|
| tentative_classification 解決 | **不適切→ feature** | RU 記載の「横断契約SPEC」は単一 SPEC に還元できない。REQ/Decision/SPEC/Skill/Command/Template/Script/検証基盤の横断変更であり feature が正しい |
| work_type | **feature** | 正規成果物モデルの新規導入と既存体系の横断移行。bugfix でも maintenance でもない |
| scale | **large (L)** | 5 OU、25 AC、54+ ファイル影響、766 件の ADR 参照分布 |
| 主対象 REQ | **REQ-001** | 「文書体系と持続可能な基準構造」。判断記録を抽象的に要件化（REQ-001-004）し、056〜060 で ADR を具体参照 |
| SPLIT 予兆 | **+1（要件行数のみ）、no-action** | 現行 60 行→変更後 64 行（51〜80 範囲＝+1）。関心分類数・アーティファクト種別数は Document System 単一関心内で健全。RU Source Summary が新規 REQ 作成を明示的に否定 |
| Decision 要否 | **必須（CREATE DEC-009）** | 正規成果物モデル変更、ID 方式変更、ディレクトリ構造変更、ID 不変原則のスコープ例外設定。アーキテクチャ意味決定の全条件を満たす |

## CREATE/APPEND/UPDATE 判定

### REQ 操作（12件）

| ID | action | target | 対象行 | 根拠 AG |
|---|---|---|---|---|
| ACT-REQ-001 | UPDATE | REQ-001 | 056, 058, 059, 060（ADR→Decision）、行78 verified comment | AG-009, AG-007 |
| ACT-REQ-002 | APPEND | REQ-001 | 061〜064（新規4行） | AG-004, AG-005, AG-006, AG-017 |
| ACT-REQ-003 | UPDATE | REQ-002 | REQ-002-026（`docs/adr/**`→`docs/decisions/**`） | AG-002, AG-015 |
| ACT-REQ-004 | UPDATE | REQ-004 | 002, 013, 042, 043, 044, 045（ADR 判断ステップ・採番・保存・参照置換の契約）、関連 ADR（ADR-003→DEC-003） | AG-007, AG-012 |
| ACT-REQ-005 | UPDATE | REQ-012 | REQ-012-002（`docs/adr`→`docs/decisions`）、REQ-012-003（node_types デフォルト `adr`→`decision`）、関連 ADR | AG-002, AG-007, AG-015 |
| ACT-REQ-006 | UPDATE | REQ-013 | REQ-013-017（パス更新）、関連 ADR | AG-002, AG-007 |
| ACT-REQ-007 | UPDATE | REQ-020 | 関連 ADR（ADR-007→DEC-007） | AG-007 |
| ACT-REQ-008 | UPDATE | REQ-003 | REQ-003-008（docs/adr 参照） | AG-015 |
| ACT-REQ-009 | UPDATE | REQ-006 | REQ-006-040（case-close ADR 確認）、025/112/114（ADR 参照） | AG-012, AG-015 |
| ACT-REQ-010 | UPDATE | REQ-008 | REQ-008-058（operation enum ADR）、045/046（ADR 参照） | AG-012 |
| ACT-REQ-011 | UPDATE | REQ-015 | REQ-015-004/010（ADR 参照） | AG-015 |
| ACT-REQ-012 | UPDATE | REQ-017 | REQ-017-008（case-open/case-run ADR 拘束条件）、001（ADR 参照） | AG-012 |

### 新規 REQ-001 要件行（APPEND対象）

| 行ID | 要件 | 根拠 |
|---|---|---|
| REQ-001-061 | Decision と REQ は管理特性（重複排除、粒度管理）を分離すること。Decision は判断文脈の違い、再確認、後続判断との関係に意味があるため、意味的に近い複数 Decision の存在だけを理由として重複違反または自動統合対象としないこと | AG-004 |
| REQ-001-062 | Decision 間の意味的関係（関連、置換、再確認）を追跡可能とすること。具体的なフィールド名、enum、serialization 形式は SPEC の責務とする | AG-005 |
| REQ-001-063 | Decision の SPLIT / MERGE は固定件数のみで判断せず、意味的健全性（無関係な判断の混在、責務領域の過度な混在、判断境界の不明瞭化、accepted Decision 間の矛盾、関係付けされていない実質的な再確認・置換候補）を評価対象とすること | AG-006 |
| REQ-001-064 | Decision の健全性評価を REQ の重複・分割モデルと分離し、Decision 固有の意味境界・関係・矛盾を評価できること。類似性だけを根拠とする自動 MERGE を行わないこと | AG-017 |

### Decision 操作（1件）

| ID | action | target | 概要 | 根拠 |
|---|---|---|---|---|
| ACT-DEC-001 | CREATE | DEC-009 | ADR→Decision 正規成果物モデル移行の判断記録。OU-001 完了後（Decision モデル確立後）に生成。ADR-001〜008 の 1:1 移行（DEC-001〜008）に続く最初の新規 Decision | AG-001〜AG-017 全体 |

### SPEC 操作（6件）

| ID | action | target | 概要 | 根拠 AG |
|---|---|---|---|---|
| ACT-SPEC-001 | UPDATE | document-model.md | ADR 参照箇所（40+箇所）の分類後個別更新（CR-005 の8分類に従う）。責務マトリックス、ライフサイクル、編集制約、7分類モデル、歴史的 v2:ADR-* は維持。Decision 関係モデル、粒度管理、健全性モデル追加 | AG-001〜006, AG-009, AG-012, AG-014, AG-017 |
| ACT-SPEC-002 | UPDATE | document-type-responsibilities.md | 分類判断ツリー、実行主体分類、用語政策の ADR→Decision | AG-001, AG-003, AG-013 |
| ACT-SPEC-003 | UPDATE | patterns.md + numbering-policy.md | ADR-NNN → DEC-NNN（3桁ゼロ埋め）ID 形式、frontmatter ID 形式。numbering-policy.md は ADR 採番規則、`alloc-adr-number.ts`、`docs/adr/` パス、`agentdev-adr-file-manager` 参照を正規所有 | AG-002 |
| ACT-SPEC-004 | UPDATE | artifact-contracts.md | artifact type `adr` → `decision`、script 所有権表（`agentdev-adr-file-manager` → `agentdev-decision-file-manager`）、`ACT-ADR-NNN` ID 形式、`artifact: adr` enum、REQ/ADR 操作参照の全面更新 | AG-012 |
| ACT-SPEC-005 | CREATE | Decision lifecycle SPEC（docs/specs/foundations/ または quality/） | Decision 関係モデル（field, enum, serialization）、粒度管理規則、健全性評価モデル | AG-005, AG-006, AG-017 |
| ACT-SPEC-006 | UPDATE | req-draft template / req-save 関連 SPEC | artifact_actions における `artifact: adr` → `artifact: decision` | AG-012 |

## SPLIT 予兆計算（REQ-001）

| メトリクス | 現行 | 変更後 | 閾値 | シグナル |
|---|---|---|---|---|
| 要件行数 | 60 | 64 | 51〜80 = +1 | +1 |
| 関心分類数 | — | — | 0〜1 = +0 | +0（Document System 単一関心） |
| アーティファクト種別数 | — | — | 1〜2 = +0 | +0（REQ/SPEC 隣接責務） |
| **合計** | | | | **+1（no-action / APPEND 許可）** |

RU Source Summary が「新規REQ体系の追加ではなく、Decision の意味差分を REQ-001 へ反映し…一貫して再投影すること」と明示。SPLIT 不要。

## 衝突解決

| ID | 衝突 | 解決 |
|---|---|---|
| CR-001 | REQ-001-008（識別子不変原則）vs AG-008（ADR→DEC 移行例外） | AG-008 は番号部維持・意味変更なしの正規文書種別移行に限定されたスコープ例外。移行後の DEC-NNN は通常の ID 不変原則に従う |
| CR-002 | REQ-001-056〜060（ADR 具体参照）vs Decision モデル | UPDATE により ADR → Decision へ文言更新。意味的不変性（accepted 判断記録の性質）は維持 |
| CR-003 | ADR-003（req_draft ソフトコントラクト、`artifact: adr` 使用）vs Decision artifact type | ADR-003 は DEC-003 へ 1:1 移行。req-draft template の artifact action 型を `decision` へ更新 |
| CR-004 | 既存 `v2:ADR-*` 歴史参照 vs Decision モデル | AG-010 が `v2:ADR-*` を名称・ID とも変更せず維持することを明示。`v2:DEC-*` は生成しない |
| CR-005 | 文字列一括置換の風険（766件の参照） | AG-016 が無条件全文字列置換を禁止。8 分類（current contract/reference, historical v2:ADR-*, Issue/PR 履歴, Git history, 実装識別子, prose, false positive）へ分類後に個別変更 |
| CR-006 | Artifact Graph node_type `adr`→`decision` スキーマ変更（776 nodes が依存） | build_graph.ts パース処理、augmentation 設定、graph query consumers を同期更新し再生成。派生索引の自己修復性を考慮し severity 低。OU-004 で実施 |

## draft-data

```yaml
# draft-data for RU-0016
# req-define → req-save → case-open consumer

work_type: feature
scale: large
summary: >-
  ADR 文書種別を Decision へ正規移行する横断モデル変更。
  現行 ADR-001〜008 を DEC-001〜008 へ1対1移行（番号部維持）し、
  REQ/SPEC/Skill/Command/Template/Script/検証基盤/Artifact Graph を
  Decision モデルへ一貫統一する。
  v2:ADR-* 履歴参照は維持し、文字列一括置換は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    summary: 正規文書種別名 Decision。単数 Decision、複数集合は Decisions
  - id: AG-002
    summary: "配置 docs/decisions/、ID DEC-NNN（3桁ゼロ埋め）、artifact type decision"
  - id: AG-003
    summary: Decision 責務は継続的判断と理由の保持。状態要求・仕様詳細・作業手順は非所有
  - id: AG-004
    summary: REQ と Decision の管理特性分離（重複排除・粒度管理の機械適用禁止）
  - id: AG-005
    summary: Decision 関係モデル（関連・置換・再確認）の追跡可能性。具体形式は SPEC 責務
  - id: AG-006
    summary: Decision 粒度管理は固定件数ではなく意味的健全性で評価
  - id: AG-007
    summary: 現行 ADR-NNN を番号部維持で DEC-NNN ぞ1対1移行
  - id: AG-008
    summary: ID 不変原則のスコープ例外（今回の正規文書種別移行のみ ADR-NNN→DEC-NNN 許容）
  - id: AG-009
    summary: accepted 判断記録の意味的不変性。体系移行に必要な変更と意味変更を分離
  - id: AG-010
    summary: 過去版 v2:ADR-* は維持。v2:DEC-* 生成禁止
  - id: AG-011
    summary: 旧 current ADR 契約の退役。docs/adr/、current ADR-NNN、artifact: adr を通常経路で生成しない
  - id: AG-012
    summary: Decision 保存経路の確立（req-define〜case-auto 全経路を Decision 化）
  - id: AG-013
    summary: "Skill 移行: agentdev-decision-file-manager, agentdev-decision-guidelines"
  - id: AG-014
    summary: docs/decisions/README.md を正規索引とする。分類ビューであり SSoT ではない
  - id: AG-015
    summary: 横断移行対象は docs/adr/** に限定せず全領域。実行時 HEAD の inventory を正とする
  - id: AG-016
    summary: 文字列一括置換禁止。8 分類後に個別変更
  - id: AG-017
    summary: Decision health model を REQ 重複・分割モデルと分離

artifact_actions:
  # REQ operations (12)
  - id: ACT-REQ-001
    action: UPDATE
    target: REQ-001
    lines: [056, 058, 059, 060]
    detail: "accepted ADR→accepted Decision, 後継 ADR→後継 Decision。verified comment 行78 の agentdev-adr-guidelines.md→agentdev-decision-guidelines.md"
    source_items: [AG-007, AG-009]
  - id: ACT-REQ-002
    action: APPEND
    target: REQ-001
    lines: [061, 062, 063, 064]
    detail: "Decision 管理特性分離(061), 関係モデル追跡可能性(062), 粒度管理の意味的健全性(063), 健全性評価の REQ との分離(064)"
    source_items: [AG-004, AG-005, AG-006, AG-017]
  - id: ACT-REQ-003
    action: UPDATE
    target: REQ-002
    lines: [026]
    detail: "docs/adr/** → docs/decisions/**"
    source_items: [AG-002, AG-015]
  - id: ACT-REQ-004
    action: UPDATE
    target: REQ-004
    lines: [002, 013, 042, 043, 044, 045]
    detail: "ADR 判断ステップ(042)、ADR 採番(043)、ADR 保存(044)、ADR 参照置換(045)、ADR 判断基準(002)、ADR 関連(013)、関連 ADR: ADR-003 → DEC-003"
    source_items: [AG-007, AG-012]
  - id: ACT-REQ-005
    action: UPDATE
    target: REQ-012
    lines: [002, 003]
    detail: "indexed_paths docs/adr→docs/decisions(002), node_types デフォルト adr→decision(003)。関連 ADR: ADR-002→DEC-002, ADR-007→DEC-007"
    source_items: [AG-002, AG-007, AG-015]
  - id: ACT-REQ-006
    action: UPDATE
    target: REQ-013
    lines: [017]
    detail: "docs/adr/README.md→docs/decisions/README.md, docs/adr/ADR-006.md→docs/decisions/DEC-006.md。関連 ADR: ADR-007→DEC-007"
    source_items: [AG-002, AG-007]
  - id: ACT-REQ-007
    action: UPDATE
    target: REQ-020
    detail: "関連 ADR: ADR-007 → DEC-007"
    source_items: [AG-007]
  - id: ACT-REQ-008
    action: UPDATE
    target: REQ-003
    lines: [008]
    detail: "docs/adr 参照の docs/decisions へ更新"
    source_items: [AG-015]
  - id: ACT-REQ-009
    action: UPDATE
    target: REQ-006
    lines: [025, 040, 112, 114]
    detail: "case-close での ADR 確認(040)、ADR 参照(025/112/114) を Decision へ更新"
    source_items: [AG-012, AG-015]
  - id: ACT-REQ-010
    action: UPDATE
    target: REQ-008
    lines: [045, 046, 058]
    detail: "operation enum の ADR→Decision(058)、ADR 参照(045/046)"
    source_items: [AG-012]
  - id: ACT-REQ-011
    action: UPDATE
    target: REQ-015
    lines: [004, 010]
    detail: "ADR 参照(004/010) を Decision へ更新"
    source_items: [AG-015]
  - id: ACT-REQ-012
    action: UPDATE
    target: REQ-017
    lines: [001, 008]
    detail: "case-open/case-run の ADR 拘束条件(008)、ADR 参照(001) を Decision へ更新"
    source_items: [AG-012]
  # Decision operations (1)
  - id: ACT-DEC-001
    action: CREATE
    target: DEC-009
    status: proposed
    detail: >-
      ADR→Decision 正規成果物モデル移行の判断記録。
      OU-001 完了後（Decision モデル確立後）に生成。
      17 AG items を判断根拠として記録。
      ADR-001〜008 の DEC-001〜008 への 1:1 移行に続く最初の新規 Decision。
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015, AG-016, AG-017]
  # SPEC operations (6)
  - id: ACT-SPEC-001
    action: UPDATE
    target: docs/specs/foundations/document-model.md
    detail: "ADR 参照箇所（40+箇所）の分類後個別更新（CR-005 の8分類に従う）。責務マトリックス、ライフサイクル、編集制約、7分類モデル、歴史的 v2:ADR-* は維持。Decision 関係モデル、粒度管理、健全性モデル追加"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-009, AG-012, AG-014, AG-017]
  - id: ACT-SPEC-002
    action: UPDATE
    target: docs/specs/responsibilities/document-type-responsibilities.md
    detail: "分類判断ツリー、実行主体分類、用語政策の ADR→Decision"
    source_items: [AG-001, AG-003, AG-013]
  - id: ACT-SPEC-003
    action: UPDATE
    target: docs/specs/foundations/patterns.md, docs/specs/foundations/numbering-policy.md
    detail: "ADR-NNN → DEC-NNN（3桁ゼロ埋め）ID 形式、frontmatter ID 形式。numbering-policy.md は ADR 採番規則、alloc-adr-number.ts、docs/adr/ パス、agentdev-adr-file-manager 参照を正規所有し独立 UPDATE 対象"
    source_items: [AG-002]
  - id: ACT-SPEC-004
    action: UPDATE
    target: docs/specs/responsibilities/artifact-contracts.md
    detail: "artifact type adr→decision、script 所有権表（agentdev-adr-file-manager→agentdev-decision-file-manager）、ACT-ADR-NNN ID 形式→ACT-DEC-NNN、artifact: adr enum→decision、REQ/ADR 操作参照の全面更新"
    source_items: [AG-012]
  - id: ACT-SPEC-005
    action: CREATE
    target: docs/specs/foundations/decision-lifecycle.md
    detail: "Decision 関係モデル（relates-to/supersedes/reaffirms enum, frontmatter schema, serialization）、粒度管理規則、健全性評価モデル"
    source_items: [AG-005, AG-006, AG-017]
  - id: ACT-SPEC-006
    action: UPDATE
    target: req-define/req-save 関連テンプレート・SPEC
    detail: "artifact_actions における artifact: adr → artifact: decision"
    source_items: [AG-012]

conflict_resolutions:
  - id: CR-001
    conflict: REQ-001-008 識別子不変原則 vs AG-008 移行例外
    resolution: >-
      AG-008 は正規文書種別そのものの移行に限定されたスコープ例外。
      番号部維持、意味変更なし。移行後 DEC-NNN は通常の ID 不変原則に従う。
      Decision（DEC-009）に例外の根拠を記録する。
  - id: CR-002
    conflict: REQ-001-056..060 ADR 具体参照 vs Decision モデル
    resolution: >-
      UPDATE により ADR → Decision へ文言更新。
      accepted 判断記録の意味的不変性、後継判断要件、直接更新6件、意味変更六件の
      全ての意味を維持したまま文書種別名を更新する。
  - id: CR-003
    conflict: ADR-003 req_draft ソフトコントラクト（artifact: adr）vs Decision artifact type
    resolution: >-
      ADR-003 は DEC-003 ぞ 1:1 移行。
      req-draft template の artifact action 型を decision へ更新。
      ソフトコントラクト原則（LLM 推論消費、厳格 schema なし）は維持。
  - id: CR-004
    conflict: 既存 v2:ADR-* 歴史参照（193件、42ファイル）vs Decision モデル
    resolution: >-
      AG-010 が v2:ADR-* を維持することを明示。
      v2:DEC-* は生成しない。
      Decision index は現行 Decision と過去版 ADR を明確に区別して表示。
  - id: CR-005
    conflict: 766件の ADR 参照の一括置換リスク
    resolution: >-
      AG-016 が無条件全文字列置換を禁止。
      8 分類（current contract, current reference, historical v2:ADR-*,
      Issue/PR 履歴, Git history, 実装識別子, prose, false positive）
      へ分類後に個別変更。OU-005 で残骸検査を実施。
  - id: CR-006
    conflict: Artifact Graph node_type `adr` → `decision` スキーマ変更（776 nodes が `adr` node_type に依存）
    resolution: >-
      REQ-012-003 の node_types デフォルト変更に伴い、Artifact Graph 全体の再生成が必要。
      build_graph.ts のパース処理、.agentdev/artifact-graph.yaml の augmentation 設定、
      graph query consumers を同期更新する。派生索引の自己修復性を考慮し severity は低い。
      OU-004 で実施。

operation_units:
  - id: OU-001
    name: Decision 文書モデル・契約確立
    depends_on: []
    parallelizable: false
    target_artifacts:
      - REQ-001 (UPDATE 056-060, APPEND 061-064)
      - document-model.md (UPDATE)
      - document-type-responsibilities.md (UPDATE)
      - patterns.md (UPDATE)
      - decision-lifecycle.md (CREATE)
    summary: >-
      Decision の意味、REQ/SPEC との責務境界、ID/配置契約を先に確定する。
      DEC-009（移行判断 Decision）を生成する。
      ブートストラップ注意: OU-001 完了時点では Decision 保存経路（OU-002）が未確立のため、
      DEC-009 は手動作成（frontmatter 記述後に docs/decisions/DEC-009.md へ直接保存）とする。
      OU-002 完了後に agentdev-decision-file-manager 経路で検証・補正する。
    estimated_issues: 5-6
    result:
      saved_req_docs: [REQ-001]
      applied_artifact_actions: [ACT-REQ-001, ACT-REQ-002]
      skipped_artifact_actions:
        - id: document-model.md
          reason: SPEC 編集は spec-save 責務
        - id: document-type-responsibilities.md
          reason: SPEC 編集は spec-save 責務
        - id: patterns.md
          reason: SPEC 編集は spec-save 責務
        - id: decision-lifecycle.md
          reason: SPEC 編集は spec-save 責務
        - id: ACT-DEC-001
          reason: Decision bootstrap は case-run OU-001 完了後に生成
  - id: OU-002
    name: Decision 保存・配布経路移行
    depends_on: [OU-001]
    parallelizable: false
    target_artifacts:
      - req-define command (UPDATE)
      - req-save command (UPDATE)
      - agentdev-decision-file-manager skill (CREATE/RENAME from adr-file-manager)
      - agentdev-decision-guidelines skill (CREATE/RENAME from adr-guidelines)
      - req-draft template (UPDATE artifact action)
      - Decision 採番 script
      - artifact-contracts.md (UPDATE)
    summary: 新規 Decision を生成・保存できる通常経路を完成させる。
    estimated_issues: 4-5
  - id: OU-003
    name: 現行 ADR 成果物移行
    depends_on: [OU-001, OU-002]
    parallelizable: false
    target_artifacts:
      - docs/decisions/ (CREATE, migrate from docs/adr/)
      - DEC-001〜DEC-008 (1:1 migration from ADR-001〜008)
      - docs/decisions/README.md (CREATE, migrate from docs/adr/README.md)
      - current inbound/outbound references (UPDATE)
      - docs/README.md (UPDATE ADR section → Decision section)
    summary: 既存 current ADR を DEC-NNN ぞ 1:1 移行する。
    estimated_issues: 3-4
  - id: OU-004
    name: 横断 consumer・検証基盤移行
    depends_on: [OU-001]
    parallelizable: true
    parallel_note: OU-003 と変更競合しない単位は並行準備可能。最終確定は OU-003 後。
    target_artifacts:
      - case-open/case-run/case-close/case-auto commands (UPDATE)
      - Guides (UPDATE)
      - .agentdev/extensions/** (UPDATE)
      - integrity rules IR-*.md (UPDATE)
      - validators / checkers (UPDATE)
      - Artifact Graph (UPDATE node/relation/path, build_graph.ts パース処理, .agentdev/artifact-graph.yaml augmentation 設定)
      - tests / fixtures / snapshots (UPDATE)
      - generated indexes (UPDATE)
      - REQ-002, REQ-003, REQ-004, REQ-006, REQ-008, REQ-012, REQ-013, REQ-015, REQ-017, REQ-020 (UPDATE references)
    summary: Decision の consumer、検査、探索を全て新モデルへ統一する。
    estimated_issues: 8-12
    result:
      saved_req_docs: [REQ-002, REQ-003, REQ-004, REQ-006, REQ-008, REQ-012, REQ-013, REQ-015, REQ-017, REQ-020]
      applied_artifact_actions: [ACT-REQ-003, ACT-REQ-004, ACT-REQ-005, ACT-REQ-006, ACT-REQ-007, ACT-REQ-008, ACT-REQ-009, ACT-REQ-010, ACT-REQ-011, ACT-REQ-012]
      skipped_artifact_actions:
        - id: case-open/case-run/case-close/case-auto commands
          reason: command 編集は case-run 責務
        - id: Guides
          reason: case-run 責務
        - id: .agentdev/extensions/**
          reason: case-run 責務
        - id: integrity rules IR-*.md
          reason: case-run 責務
        - id: validators / checkers
          reason: case-run 責務
        - id: Artifact Graph
          reason: case-run 責務
        - id: tests / fixtures / snapshots
          reason: case-run 責務
        - id: generated indexes
          reason: case-run 責務
  - id: OU-005
    name: Legacy residue・E2E 検証
    depends_on: [OU-002, OU-003, OU-004]
    parallelizable: false
    target_artifacts:
      - repository 全体
    summary: 旧 current ADR 契約の残存と Decision 経路の回帰を検証する。
    estimated_issues: 2-3

test_strategy:
  acceptance_criteria_count: 25
  verification_methods_count: 17
  e2e_scenarios:
    - id: E2E-001
      name: Decision あり E2E
      flow: req-define → req-save → case-open → case-run
      verifies: [AC-020, VT-013]
    - id: E2E-002
      name: Decision なし E2E
      flow: req-define → req-save（Decision 不作成）→ case-open → case-run
      verifies: [AC-021, VT-014]
  deterministic_checks:
    - docs-check
    - integrity check
    - skill lint
    - frontmatter / ID check
    - link check
    - Artifact Graph check
  inventory_basis: 実装開始時の default branch HEAD（WA-001）

review_dispositions:
  spec_bug:
    next_command: req-define（再定義）
    scope: Decision モデルの意味、関係、粒度、健全性の欠陥
  impl_bug:
    next_command: case-run（修正）
    scope: 移行の実装欠陥（パス、ID、参照の不整合）
  scope_creep:
    next_command: case-close（スコープ外は別 RU）
    scope: In Scope を超える変更、v2:ADR-* の変更、Git history rewrite

case_open_hints:
  epic_title: "ADR → Decision 正規成果物モデル移行"
  epic_labels: [feature, large, cross-cutting]
  wave_structure:
    - wave: 1
      units: [OU-001]
      note: 契約確立が全工程の前提。物理 rename より先に実施。
    - wave: 2
      units: [OU-002]
      note: 保存経路の完成。OU-001 完了後。
    - wave: 3
      units: [OU-003, OU-004]
      note: OU-003（成果物移行）と OU-004（consumer移行）は並行準備可能。OU-003 完了後に OU-004 最終確定。
    - wave: 4
      units: [OU-005]
      note: E2E 検証と残骸検査。全 OU 完了後。
  estimated_total_issues: 22-30
  execution_order_constraint: 物理 rename を契約変更より先に実行しない（RU 推奨実行順序）

# req-save 実行結果（OU-001 REQ 部分、OU-004 REQ 部分のみ保存。SPEC/Decision/Skill/Command は各 OU 完了時に保存）
req_save_result:
  saved_at: 2026-08-10
  saved_req_docs:
    - REQ-001
    - REQ-002
    - REQ-003
    - REQ-004
    - REQ-006
    - REQ-008
    - REQ-012
    - REQ-013
    - REQ-015
    - REQ-017
    - REQ-020
  artifact_action_to_req_doc:
    ACT-REQ-001: REQ-001
    ACT-REQ-002: REQ-001
    ACT-REQ-003: REQ-002
    ACT-REQ-004: REQ-004
    ACT-REQ-005: REQ-012
    ACT-REQ-006: REQ-013
    ACT-REQ-007: REQ-020
    ACT-REQ-008: REQ-003
    ACT-REQ-009: REQ-006
    ACT-REQ-010: REQ-008
    ACT-REQ-011: REQ-015
    ACT-REQ-012: REQ-017
  skipped_actions:
    - id: ACT-DEC-001
      reason: Decision bootstrap は OU-001 完了後の case-run で生成。req-save では Decision 保存経路が未確立のため対象外
    - id: ACT-SPEC-001..006
      reason: SPEC 操作は spec-save コマンドの責務
  source_ru_to_req_ops:
    RU-0016: [ACT-REQ-001, ACT-REQ-002, ACT-REQ-003, ACT-REQ-004, ACT-REQ-005, ACT-REQ-006, ACT-REQ-007, ACT-REQ-008, ACT-REQ-009, ACT-REQ-010, ACT-REQ-011, ACT-REQ-012]
  case_open_consumable: true
```

## draft-meta

```yaml
spec_candidates:
  - requirement: Decision ID 形式（DEC-NNN、3桁ゼロ埋め）
    current_location: AG-002
    suggested_spec: patterns.md / numbering-policy
    reason: 具体的 ID 形式は SPEC 責務
  - requirement: Decision artifact type（decision）
    current_location: AG-002
    suggested_spec: artifact-contracts.md
    reason: 具体的 artifact type enum 値は SPEC 責務
  - requirement: Decision 関係モデル（relates-to, supersedes, reaffirms）
    current_location: AG-005
    suggested_spec: decision-lifecycle.md（新規 CREATE）
    reason: フィールド名、enum、serialization 形式は SPEC 責務
  - requirement: Decision 粒度管理の具体的評価基準
    current_location: AG-006
    suggested_spec: decision-lifecycle.md（新規 CREATE）
    reason: 評価シグナルの重み付け、閾値は SPEC 責務
  - requirement: Decision health model の具体的評価項目
    current_location: AG-017
    suggested_spec: decision-lifecycle.md（新規 CREATE）
    reason: 評価対象の具体化、自動判定境界は SPEC 責務。AG-017 が Decision 健全性を REQ 重複・分割モデルと分離することを要件とするため、req-health-metrics.md 拡張は AG-017 矛盾
  - requirement: Skill 正規名称（agentdev-decision-file-manager, agentdev-decision-guidelines）
    current_location: AG-013
    suggested_spec: artifact-contracts.md / 各 Skill SKILL.md
    reason: 配布物名称は配布物契約の責務
  - requirement: Decision index の具体的ビュー構成
    current_location: AG-014
    suggested_spec: document-model.md / decision-lifecycle.md
    reason: index 構成詳細は SPEC 責務
  - requirement: Decision 保存経路の具体的フロー
    current_location: AG-012
    suggested_spec: req-define/req-save command SPEC
    reason: command 振る舞い詳細は SPEC 責務

split_forecast:
  target_req: REQ-001
  current_lines: 60
  after_change_lines: 64
  signals:
    line_count: +1
    concern_classification: +0
    artifact_type: +0
    spec_separation_violation: +0
  total_signal: 1
  recommended_action: no-action / APPEND
  rationale: >-
    REQ-001 は「文書体系と持続可能な基準構造」の単一関心。
    Decision 管理特性（061-064）は文書体系の構成要素であり、関心ズレではない。
    RU Source Summary が新規 REQ 作成を明示的に否定。
    64 行は 51-80 範囲（+1）で APPEND 許容範囲内。
```
