---
draft_type: req_draft
topic: inspect-migration-completion
status: draft
created_at: 2026-06-15
target_req: REQ-0124
---

# REQ-0124: docs-review/skill-review/diagnostics-* → inspect-* 完全直接移行

## 目的

ADR-0113 で決定された `docs-review`/`skill-review` → `diagnostics-*` への移行と、RU-20260615-01 で合意された `diagnostics-*` → `inspect-*` への全面改名を統合し、`diagnostics-*` を経過名称としてスキップして `inspect-*` を最終到達点とする単一の完全移行を完了する。これにより REQ-0103-145「完全削除: ドキュメント記述 + 実体ファイル」と RU-20260615-01「diagnostics 系 workflow family の inspect への全面改名」を同時に履行する。

`diagnostics` は語として重く（診断・分析・原因特定・改善提案まで含むように見える）、`diagnostic`/`diagnostics` の単複揺れが発生する。`inspect` は「検出」に焦点を絞った軽量で一貫した命名であり、コマンド・ディレクトリ・skill・source_type・finding term・filename prefix を全域で統一する。本要件は3層の改名（docs-review/skill-review → diagnostics-* → inspect-*）を1段階に圧縮し、中間状態の不整合を残さない。

## 要件

| ID | 要件 |
|---|---|
| REQ-0124-001 | AgentDevFlow のコマンド体系に `/agentdev/inspect-docs`, `/agentdev/inspect-skills`, `/agentdev/inspect-promote` を含み、`/agentdev/docs-review`, `/agentdev/skill-review`, `/agentdev/diagnostics-docs`, `/agentdev/diagnostics-skills`, `/agentdev/diagnostics-promote` を含まないこと（REQ-0103-145 + RU-20260615-01 の完了） |
| REQ-0124-002 | `agentdev-inspect-skills` スキルの `name:` フィールドがディレクトリ名と一致し `agentdev-inspect-skills` であること（dir-name ↔ frontmatter-name 整合、REQ-0103-012 準拠） |
| REQ-0124-003 | `inspect-docs`, `inspect-skills`, `inspect-promote` コマンドの完了テンプレートがそれぞれ新名称を表示すること。`templates/docs-review/` を残置しないこと |
| REQ-0124-004 | 全 finding が `.agentdev/inspect/inbox/` に出力され、`.agentdev/drafts/skill-review-finding-*`, `.agentdev/drafts/diagnostics-skills-finding-*`, `.agentdev/diagnostics/inbox/` を出力先として使用しないこと（inspect lifecycle への完全統一） |
| REQ-0124-005 | 標準 draft type を `req_draft` の1種のみとし、`skill_review_finding` を含まないこと（draft type 廃止・inspect lifecycle 統合） |
| REQ-0124-006 | `docs/specs/artifact-contracts.md` の draft type registry から `skill_review_finding` を削除し、inspect lifecycle（`.agentdev/inspect/` inbox/promoted/archive, promote/defer/reject）への参照に置換すること |
| REQ-0124-007 | REQ-0103-106（`/agentdev/skill-review` command 提供要件）を削除すること。REQ-0103-142 と REQ-0103-145 で superseded されているため |
| REQ-0124-008 | REQ-0103-141/142 の「現行 `/agentdev/docs-review` の診断観点を引き継ぐこと」継承 clause を削除し、`inspect-docs` と `inspect-skills` を独立したコマンドとして定義すること |
| REQ-0124-009 | REQ-0103-132 を「標準 draft type は `req_draft` の1種」に更新し、REQ-0103-134/135/138/139 を inspect lifecycle（`.agentdev/inspect/inbox/`）への参照に置換すること |
| REQ-0124-010 | REQ-0103-140-151 の diagnostics 系記述（`.agentdev/diagnostics/`, `diagnostics-docs/skills/promote`, `diagnostics-commands`, `diagnostic finding`）を inspect 系（`.agentdev/inspect/`, `inspect-docs/skills/promote`, `inspect-commands`, `inspect finding`）に全面更新すること。但し REQ-0103-145 自体と changelog 行は履歴として保持すること |
| REQ-0124-011 | `diagnostics-docs.md`, `diagnostics-skills.md`, `diagnostics-promote.md` コマンドファイルを `inspect-docs.md`, `inspect-skills.md`, `inspect-promote.md` に改名し、本文の `diagnostics`/`diagnostic` 参照を `inspect` に更新すること |
| REQ-0124-012 | `.agentdev/diagnostics/` ドメインディレクトリ（`inbox/`, `promoted/`, `archive/rejected/`）を `.agentdev/inspect/` に改名すること |
| REQ-0124-013 | `diagnostics finding` と `diagnostic finding` の文言を `inspect finding` に統一すること |
| REQ-0124-014 | `source_type: inspect`（および `sources[].type: inspect`）を定義すること。`source_type: diagnostics` は未実装のため、直接 `inspect` として実装すること |
| REQ-0124-015 | finding file 名規則を `inspect-docs-finding-*`, `inspect-skills-finding-*` に改名すること（`diagnostics-docs-finding-*`, `diagnostics-skills-finding-*`, `skill-review-finding-*` から） |
| REQ-0124-016 | `agentdev-diagnostics-skills` スキルディレクトリを `agentdev-inspect-skills` に改名し、SKILL.md の `name`, title, 本文を `inspect` 系に完全改稿すること |
| REQ-0124-017 | ADR-0113・REQ-0103 changelog・REQ-0109 changelog・REQ-0115 changelog・REQ-0123 Requirement Source・`.agentdev/intake/archive/`・`docs/requirements/retired/`・`docs/requirements/mapping-table.md`・RU-20260615-01 の旧名称（`docs-review`/`skill-review`/`diagnostics-*`）言及を履歴として保持し、編集しないこと |
| REQ-0124-018 | `req-restructure-review`（`docs-review` の更に旧名）・`backlog-review`（別コマンド）・`req-structure-diagnostics`（別スキル、`diagnostics` を含むが inspect 対象外）への言及を誤って改名しないこと（スコープ境界） |
| REQ-0124-019 | 改名完了後、`bun run .opencode/skills/repo-agentdev-integrity/scripts/{lint_skills,check_templates,check_integrity}.ts` の3整合性スクリプトが全て exit 0 すること |

## 適用範囲

- **対象**:
  - `src/opencode/commands/agentdev/`（`diagnostics-{docs,skills,promote}.md` → `inspect-{docs,skills,promote}.md` 改名、`docs-review/` template → `inspect-docs/`、`integrity-check/standard.md`, `case-run.md`, `case-close.md`, `req-define.md`, `backlog-review.md`, `README.md` の参照更新）
  - `src/opencode/skills/`（`agentdev-diagnostics-skills/` → `agentdev-inspect-skills/`、`agentdev-{req-file-manager,req-analysis,workflow-routing,workflow-lifecycle,spec-compliance,req-structure-diagnostics}/` の references/SKILL.md 参照更新）
  - `src/opencode/commands/agentdev/templates/`（`docs-review/` → `inspect-docs/`、`integrity-check/standard.md`）
  - `.agentdev/`（`diagnostics/` → `inspect/`、drafts/ の finding file 名規則）
  - `docs/specs/`（`artifact-contracts.md` draft type registry 改修、`workflow-contracts.md`, `system.md`, `integrity-contracts.md`, `document-model.md` の diagnostics → inspect 更新）
  - `docs/requirements/`（`REQ-0103` 外科的 per-line 編集、`REQ-0108`, `REQ-0109`, `REQ-0115`, `REQ-0116`, `REQ-0123`, `README.md` 本文更新・changelog 保持）
  - `docs/guides/`（`command-selection.md`, `diagnostics-and-maintenance.md`, `troubleshooting.md`, `glossary.md`, `project-docs-and-specs.md`, `README.md`）
  - `docs/DOC-MAP.md`, `docs/README.md`
- **対象外**:
  - `docs/adr/ADR-0113.md`（docs-review/skill-review → diagnostics-* 移行決定の履歴記録、保持）
  - REQ-0103/0109/0115/0123 の changelog 行・Requirement Source（履歴保持）
  - REQ-0103-145 自体（削除指示要件、保持）
  - `.agentdev/intake/archive/`（アーカイブ済み）
  - `docs/requirements/retired/`, `docs/requirements/mapping-table.md`（retired 履歴マッピング）
  - `.agentdev/backlog/req-units/RU-20260615-01.md`（RU 本体、要件化入力として保持）
  - `.opencode/`（gitignore、コンシューマー側投射先。`scripts/install-consumer-opencode.ps1` で再同期）
  - `req-restructure-review`（`docs-review` の更に旧名、別物）
  - `backlog-review`（別コマンド）
  - `req-structure-diagnostics`（`diagnostics` を含むが別スキル、inspect 対象外）

## Requirement Source

- **RU-20260615-01**（`.agentdev/backlog/req-units/RU-20260615-01.md`）: diagnostics 系 workflow family の inspect への全面改名提案。合意済み。canonical name マッピング（inspect-docs/skills/promote, .agentdev/inspect/, inspect finding, source_type: inspect, agentdev-inspect-skills）を提供
- **ユーザー指示（前セッション）**: 「docs-review, skill-reviewが例外無く全て削除されているかを確認して」→「削除ではなく diagnostics-* への更新を行う」→ RU-20260615-01 追加を受け「REQ-0124 を取り下げ・inspect-* 直接移行へ再設計」
- **Q1-Q4 のユーザー判断（前セッション、diagnostics-* → inspect-* に読み替え適用）**:
  - Q1: finding 出力場所の完全統一（`.agentdev/drafts/` → `.agentdev/inspect/inbox/`）
  - Q2: REQ-0103-141/142 の継承 clause 削除
  - Q3: REQ-0103-106 削除（superseded）
  - Q4: `skill_review_finding` draft type 廃止 → inspect lifecycle 統合
- **既存アーティファクト（read-only 参照）**:
  - `docs/adr/ADR-0113.md`（docs-review/skill-review → diagnostics-* 移行決定、履歴）
  - `docs/requirements/REQ-0103.md:145`（完全削除指示）
  - `docs/requirements/REQ-0103.md:140-151`（diagnostics domain state・lifecycle、→ inspect 系に更新対象）
  - `.sisyphus/plans/rename-diagnostics-docs-skills.md`（前セッションの実行計画、diagnostics-* → inspect-* に読み替えて参考）

## ADR判断

- **ADR required**: false
- **rationale**: ユーザー判断「ADR なし・REQ-0124 のみ」。RU-20260615-01 で「合意した」と明記済みであり、コマンド改名の決定は RU + REQ-0124 で記録する。ADR-0113（docs-review/skill-review → diagnostics-* 決定）は履歴としてそのまま残し、diagnostics-* → inspect-* への修正は REQ-0124 + REQ-0103-140-151 の更新で扱う。新規 ADR は作成しない。

## 関連ドキュメント更新候補（反映作業）

> 以下は「反映作業」（改名・更新・削除・参照修正）であり、独立要件行ではなく後続 case-run での実行対象。

### src/ 実体（runtime artifacts）
- `src/opencode/commands/agentdev/diagnostics-{docs,skills,promote}.md` → `inspect-{docs,skills,promote}.md`（ファイル改名 + 本文全面更新）
- `src/opencode/commands/agentdev/templates/docs-review/` → `inspect-docs/`（ディレクトリ改名）
- `src/opencode/commands/agentdev/templates/integrity-check/standard.md`
- `src/opencode/commands/agentdev/{case-run,case-close,req-define,backlog-review}.md`
- `src/opencode/commands/agentdev/README.md`（コマンド一覧・次アクション）
- `src/opencode/skills/agentdev-diagnostics-skills/` → `agentdev-inspect-skills/`（ディレクトリ改名 + SKILL.md 完全改稿）
- `src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md`
- `src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md`
- `src/opencode/skills/agentdev-workflow-routing/references/case-update-procedure.md`
- `src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md`
- `src/opencode/skills/agentdev-spec-compliance/SKILL.md`
- `src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md`

### .agentdev/ ドメイン状態
- `.agentdev/diagnostics/` → `.agentdev/inspect/`（ディレクトリ改名: inbox/, promoted/, archive/rejected/）
- `.agentdev/drafts/`（finding file 名規則の更新）
- `.agentdev/README.md`（ドメイン状態テーブル・ディレクトリ構成の diagnostics → inspect）

### docs/specs/
- `docs/specs/artifact-contracts.md`（draft type registry 改修・skill_review_finding 削除・inspect lifecycle 参照化）
- `docs/specs/workflow-contracts.md`（コマンド表・diagnostics → inspect）
- `docs/specs/system.md`（diagnostics ワークフロー → inspect ワークフロー）
- `docs/specs/integrity-contracts.md`（read-only 診断契約・diagnostics → inspect）
- `docs/specs/document-model.md`（分類ルール・diagnostics → inspect）

### docs/requirements/（外科的編集）
- `docs/requirements/REQ-0103.md`（機械的置換禁止・per-line: 106削除、141/142 clause削除、132 を req_draft の1種に、134/135/138/139 を inspect lifecycle 参照化、140-151 diagnostics 系 → inspect 系、095 の docs-review診断 → inspect-docs診断）
- `docs/requirements/REQ-0108.md`（現行要件本文 6 箇所）
- `docs/requirements/REQ-0109.md`（本文更新・changelog 保持、27-35 行の diagnostics-docs → inspect-docs、74-75 行 changelog は保持）
- `docs/requirements/REQ-0115.md`（本文更新・changelog 保持、23-59 行の diagnostics-docs → inspect-docs、78 行 changelog は保持）
- `docs/requirements/REQ-0116.md`（mapping 言及）
- `docs/requirements/REQ-0123.md`（目的・REQ-0123-014・対象ファイル）
- `docs/requirements/README.md`（REQ-0124 追加・REQ-0109/0115 紹介文の diagnostics → inspect）

### docs/guides/ + 索引
- `docs/guides/command-selection.md`, `diagnostics-and-maintenance.md`（→ `inspect-and-maintenance.md` 改名候補・別途判断）, `troubleshooting.md`, `glossary.md`, `project-docs-and-specs.md`, `README.md`
- `docs/DOC-MAP.md`, `docs/README.md`

## draft-meta

| 項目 | 値 |
|---|---|
| work_type | feature |
| req-operation | CREATE |
| target-req | REQ-0124 |
| create-rationale | REQ-0103-145 完全削除 + RU-20260615-01 diagnostics-* → inspect-* 改名を統合。diagnostics-* 経由をスキップし docs-review/skill-review → inspect-* の直接移行とする。複数 REQ（0103/0108/0109/0115/0116/0123）にまたがる横断作業 + diagnostics-* 全面改名を束ねる独立 REQ が必要。 |
| adr-required | false |
| adr-rationale | ユーザー判断「ADR なし」。RU-20260615-01 で合意済み。ADR-0113 は履歴として保持、diagnostics-* → inspect-* は REQ-0124 + REQ-0103-140-151 更新で記録。 |
| topic-slug | inspect-migration-completion |
| scale | large（Epic 規模・docs-review/skill-review 残骸99件 + diagnostics-* 系73箇所の統合改名） |
| status | saved |

## decomposition

> scale=large のため、case-open の単一 REQ Epic flow で子Issue 分解する。docs-review/skill-review 残骸処理 + diagnostics-* → inspect-* 改名を統合した5 Wave 構成で実行する。各 Wave は直列依存（推奨順序 1→2→3→4→FINAL）。

| Wave | 内容 | 前提 | 子Issue候補 |
|---|---|---|---|
| Wave 1 | 投射メカニクス確認・agentdev-inspect-skills SKILL.md 完全改稿・diagnostics-* → inspect-* コマンドファイル改名（docs/skills/promote）・templates 改名（docs-review → inspect-docs）・command refs 更新（case-run/case-close/req-define/backlog-review/README） | なし | Child Issue 1 |
| Wave 2 | .agentdev/diagnostics/ → inspect/ ディレクトリ改名・スキル references（6ファイル）+ SPEC（5ファイル・artifact-contracts draft type 廃止 + diagnostics → inspect 全面更新） | Wave 1 | Child Issue 2 |
| Wave 3 | REQ 外科的編集（REQ-0103 機械的置換禁止・106削除・141/142 clause削除・132-139 draft type廃止・140-151 diagnostics → inspect・REQ-0108/0109/0115/0116/0123 + README） | Wave 2 | Child Issue 3 |
| Wave 4 | ガイド（6ファイル）+ 索引（DOC-MAP・docs/README・.agentdev/README） | Wave 3 | Child Issue 4 |
| Wave FINAL | 4並列検証（Plan compliance audit・Code quality・Real manual QA・Scope fidelity）+ ユーザー explicit okay | Wave 4 | Child Issue 5 |

- **子Issue数**: 5（case-open G05/G15 の最大10制限内）
- **依存関係**: 全 Wave が直列依存
- **前セッション計画の再利用**: `.sisyphus/plans/rename-diagnostics-docs-skills.md`（19タスク+4検証）を diagnostics-* → inspect-* に読み替え + diagnostics-promote/.agentdev/diagnostics/source_type 系の追加タスクを統合して work plan を再構築

## operation_units

| ou_id | source_ru | target_req | operation | scale | depends_on | recommended_order | issue_policy | result |
|---|---|---|---|---|---|---|---|---|
| OU-01 | RU-20260615-01 + session-context | REQ-0124 | CREATE | large | - | 1 | single-issue | REQ-0124 created at docs/requirements/REQ-0124.md; scale=large; decomposition セクション参照（5 Wave・5子Issue） |

- **OU-01**: REQ-0124 新規 CREATE。本要件は単一 REQ の新規作成であり、REQ 操作単位では1 OU。実装は scale=large で、decomposition セクションの5 Wave 構成で実行する。case-open で Epic Issue + 5 子Issue（Wave 単位）を作成する。

## execution_groups

| id | type | purpose | included_ou | rationale |
|---|---|---|---|---|
| EG-01 | epic | docs-review/skill-review/diagnostics-* → inspect-* の完全直接移行を完了し REQ-0103-145 と RU-20260615-01 を履行する | OU-01 | scale=large で単一 REQ Epic flow。5 Wave 構成（decomposition セクション参照）で子Issue を分解する。全 Wave が直列依存のため、単一 Epic Issue で管理する。|

> execution_groups は提案である。Issue 発行は case-open の責務範囲（REQ-0102-038）。本要件では単一 Epic（1 Epic Issue + 5 子Issue）を推奨する。
