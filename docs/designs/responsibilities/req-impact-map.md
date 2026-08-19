---
title: REQ 影響マップ
status: accepted
created: 2026-08-20
updated: 2026-06-28
---

# REQ 影響マップ

> **位置づけと rule-ownership.md との関係**: 本ファイルは **REQ → 影響するルール/アーティファクト** の対応表である。
> `../integrity/rule-ownership.md`（**ルールドメイン → canonical REQ/SPEC**）と逆方向の対応マップであり、両者は補完関係にある。
> 配置は `responsibilities/` 残置とする（移動は参照方向、利用頻度、更新責務を確認した後に別途判断）。

### 同期更新が必要なケース

本ファイルと `rule-ownership.md` は逆方向の対応表であるため、以下の場合に両ファイルの同期更新が必要:

- 新規 IR 追加時: 両ファイルの対応行列を同期更新する
- IR の物理削除時（AG-008、REQ-028-008）: 両ファイルで対応行を削除し、本ファイルの `## Retired cross-references` 節へ交叉参照を再配置する
- canonical owner 変更時: 両ファイルで参照先を更新する
- 新規 REQ 追加、廃止時: 本ファイルの対応行を追加、削除し、影響先ルールドメインと rule-ownership.md の整合を確認する

各現行 REQ が影響する整合性ルールとアーティファクトを記載するマップ（REQ-010-011）。
10 以上の現行 REQ をカバーする。

## 影響マトリックス（Impact Matrix）

| REQ | タイトル | 影響する Rule IDs | 影響する Artifact |
|-----|---------|------------------|------------------|
| REQ-001 | 文書、REQ 管理基準 | IR-001, IR-002, IR-003, IR-004, IR-017, IR-018, IR-022 | REQ, REQ index |
| REQ-002 | Artifact 責任分界 | IR-006, IR-008, IR-014, IR-016, IR-024 | commands, skills, templates, SPEC |
| REQ-010 | Integrity/Validation/Tests | IR-001~IR-024 (全件) | 全アーティファクト |
| v2:REQ-0107 | Reporting/Writing Quality | IR-013, IR-019 | templates, guides |
| REQ-005 | Workflow/Command Protocol | IR-006, IR-024 | commands |
| REQ-008 | RU lifecycle / Requirement Unit 管理 | IR-016 | ドメイン状態 |
| REQ-006 | Case 実行オーケストレーション / Epic、Wave | IR-006, IR-013, IR-016 | commands, templates |
| REQ-036 | REQ 再構成運用 | IR-004, IR-011, IR-015 | REQ, 廃止 REQ |
| REQ-001 | ADR status 正規化 | IR-005, IR-010 | ADR, ADR index |
| v2:REQ-0113 | Skill References SPEC 分離 | IR-008, IR-014 | skills, skill references |
| REQ-006 | case-auto 最大自走モード | IR-006, IR-016 | commands |
| REQ-003 | コマンド、スキル、サブエージェント責務分界の再基準化 | IR-006, IR-008, IR-014, IR-024 | commands, skills |
| REQ-005 | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 | IR-006, IR-008, IR-014 | commands, skills |
| REQ-036 | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | IR-006, IR-024 | commands |
| REQ-036 | inspect-skills / Command/Skill 参照妥当性検出 | IR-008, IR-014 | commands, skills |
| REQ-036 | inspect-promote / 検出事項分類、昇格 | IR-016 | ドメイン状態 |
| REQ-037 | Intake command 群 (capture / from-github / promote) | IR-016 | ドメイン状態 |
| REQ-038 | Learning-promote | IR-016 | ドメイン状態 |
| REQ-039 | Backlog-review | IR-016 | ドメイン状態 |
| REQ-006 | case-run / 実装パイプライン | IR-006, IR-013, IR-016 | commands, templates |
| REQ-006 | case-close / 完了処理 | IR-006, IR-013, IR-016 | commands, templates |
| REQ-006 | case-open / Issue 作成 | IR-006 | commands |
| REQ-006 | case-update / Issue 更新 | IR-006 | commands |
| v2:REQ-0110 | Git worktree cleanup 信頼性 |（(infrastructure)）| - |
| REQ-004 | 要件定義、保存 | IR-001, IR-002 | REQ |
| REQ-009 | 配布基盤: source/projection、sync、repo type、consumer install | IR-006, IR-016, IR-046 | commands, skills, ドメイン状態 |
| REQ-008 | Drafts 配置、Draft Type Registry | IR-016 | ドメイン状態 |
| REQ-001 | REQ/SPEC 責務分離の徹底と新ワークフロー（design-save 新設、req-define 強化） | IR-008, IR-044 | REQ, SPEC, commands |
| v2:REQ-0137 | 並列実行安全 git 操作規律 |（(infrastructure)）| - |
| REQ-008 | 構造化 req_draft 契約 | IR-016 | ドメイン状態 |
| REQ-003 | 外部エージェント統合契約 | IR-006, IR-024 | commands, skills |
| v2:REQ-0140 | 文書品質ゲート | IR-013, IR-045 | docs, SPEC, document-type-responsibilities.md |
| REQ-009 | ローカル版 OpenCode 導入方式とローカル Case ファイル運用 | IR-016, IR-046, IR-047, IR-048 | src/opencode-local/, .opencode/commands/agentdev/, .opencode/skills/agentdev-*/, .agentdev/cases/, SPEC, guides |
| REQ-002 | 配布物ID除去後の文意保持、構文健全性、責務整合 | IR-016 | docs, SPEC, docs-spec-rebuild-integrity.md |
| v2:REQ-0143 | Command 定義ファイルフォーマット標準化 | IR-049 | commands, command-file-format.md |
| REQ-010 | docs-check/integrity 運用是正 | IR-016, IR-052 | integrity scripts, docs-check, SPEC |
| REQ-010 | docs-check/integrity 検出設計改善 | IR-044, IR-050, IR-051, IR-052 | integrity-rule-catalog.md, integrity scripts |
| REQ-003 | 実行契約、委譲、プロセス設計 | IR-006, IR-032, IR-033 | commands, SPEC |
| REQ-003 | 文書化規律、HITL境界 | IR-013, IR-019, IR-035 | docs, commands, skills, guides |
| REQ-006 | RU群バッチ処理と複数 execution_unit 並列実行 | IR-006, IR-016 | commands |

## 要件行影響（Requirement-Line Impact）

特定要件行が影響するアーティファクト、スキル、コマンド（REQ-039-003）。
REQ 全体ではなく要件行粒度で境界基準、検出観点の影響を追跡する必要がある場合に使用する。
これらの要件行はすべて IR-044（REQ/SPEC 境界違反検出）を通じてカタログに紐づく。

従来 REQ-002-021、022、023、024、025、026、032 に紐づいていた配布依存境界の影響エントリは MOVE 先（REQ-029-001..008）へ差し替え済みである。
REQ-002-027 は更新後の意味（実行時依存として使用するパスは導入先環境で解決可能）へ差し替えた。
REQ-002-028、029、035 は RETIRE 扱いとし、それぞれの検査（構文健全性、責務整合、case-auto.md 段階解消）は既存品質契約（`integrity/docs-spec-rebuild-integrity.md`、`responsibilities/document-type-responsibilities.md`、`quality/req-health-metrics.md`）と Epic 完了条件へ集約した（REQ-007 行は新設しない）。
詳細は Retired cross-references 節へ追記する。

| 要件行 | 影響するアーティファクト / スキル / コマンド | 経由 |
|--------|-------------------------------------|------|
| REQ-001-067〜069 | document-model.md, `agentdev-req-analysis` skill, `agentdev-quality-gates` skill, docs-check command (IR-044 経由), inspect-docs command (REQ-039-003 経由) | IR-044 |
| REQ-004-031〜033 | `agentdev-req-analysis` skill, `agentdev-quality-gates` skill | IR-044 |
| REQ-039-003 | req-impact-map.md (本節), `agentdev-req-structure-diagnostics` skill | IR-044 |

## 影響カテゴリ（Impact Categories）

### 高影響（5+ ルール）
- **REQ-010**: 全整合性ルールに影響 (IR-001~IR-024)
- **REQ-001**: REQ 管理基準として広範囲に影響 (7 ルール)
- **REQ-002**: アーティファクト配置規約として広範囲に影響 (5 ルール)

### 中影響（3-4 ルール）
- **REQ-036**: REQ 再構成運用 (3 ルール)
- **REQ-003**: コマンド、スキル、サブエージェント責務分界 (4 ルール)
- **REQ-005**: Command protocol (2 ルール)
- **REQ-006**: Case 実行オーケストレーション (3 ルール)
- **v2:REQ-0107**: Reporting (2 ルール)
- **REQ-009**: ローカル版 OpenCode 導入方式とローカル Case ファイル運用 (4 ルール: IR-016, IR-046, IR-047, IR-048)
- **REQ-010**: docs-check/integrity 検出設計改善 (4 ルール: IR-044, IR-050, IR-051, IR-052)
- **REQ-003**: 実行契約、委譲、プロセス設計 (3 ルール: IR-006, IR-032, IR-033)
- **REQ-003**: 文書化規律、HITL境界 (3 ルール: IR-013, IR-019, IR-035)

### 低影響（1-2 ルール）
- **REQ-004**, **REQ-008**, **REQ-001**, **v2:REQ-0113**, **REQ-006**, **REQ-005**, **REQ-036**, **REQ-036**, **REQ-036**, **REQ-037**, **REQ-038**, **REQ-039**, **REQ-006**, **REQ-006**, **REQ-006**, **REQ-006**, **REQ-009**, **REQ-008**, **REQ-001**, **REQ-008**, **REQ-003**, **v2:REQ-0140**, **REQ-002**, **v2:REQ-0143**, **REQ-010**, **REQ-006**

### 直接影響なし
- **v2:REQ-0110**: Git worktree cleanup 信頼性（インフラストラクチャ層）
- **v2:REQ-0137**: 並列実行安全 git 操作規律（インフラストラクチャ層）

## 再発トリアージ（Recurrence Triage）

再発検出事項検出時の対応ループ:

1. **検出**: 検出事項が基準既知（baseline-known）に存在するか確認
2. **分類**: known (基準済み) vs new
3. **再発判定**: known 検出事項が再度検出された場合:
  - ルール、検出器の誤検知 → ルールを修正（false positive）
  - 真の再発 → 検出器を強化、または検出ルールを追加
  - 基準判定ミス → 基準（baseline）を更新
4. **改善ループ**: ルールカタログ / 基準 / 影響マップ / 例外を更新
5. **記録**: トリアージ結果を整合性レポートに記録

## IR → REQ 逆方向参照（ACT-SPEC-006、REQ-028-008）

本ファイル（REQ → 影響するルール/アーティファクト）と `../integrity/rule-ownership.md`（ルールドメイン → canonical REQ/SPEC）は逆方向の対応マップである（REQ-010-011）。
両者の整合性維持運用は前節「同期更新が必要なケース」に従う。

個別 IR（IR-NNN）の対応 REQ / SPEC は `../integrity/rule-ownership.md` の AUTOGEN ブロック（`rule-ownership-ir-crossref`）が IR-* ファイルの frontmatter / Field/Value 表から自動生成する（SC-002 Phase C、IR-061）。
本節は直接編集せず、`rule-ownership.md` の AUTOGEN ブロックを正とする。

DEC-013 AG-008 適用により file-backed tombstone（IR-011 型）を物理削除する。
廃止 IR の交叉参照は次節 `## Retired cross-references` へ再配置し、欠番管理は `../foundations/numbering-policy.md` が保持する。

## Retired cross-references

廃止 IR の交叉参照（v2:REQ-NNN 等）を再配置する節。
AG-008（REQ-028-008）に基づき、file-backed tombstone の物理削除時に交叉参照を本節へ移行する。
各エントリは廃止 IR ID、旧交叉参照、再配置日、後続 REQ 等のメタデータを持つ（Phase 3 §7.3、`docs/designs/integrity/audits/cross-cutting-integration-design-20260811.md`）。

### IR-011 削除に伴う交叉参照再配置

IR-011（Mapping table 全件記録、file-backed tombstone）の物理削除に伴い、交叉参照 `v2:REQ-0108-083`〜`v2:REQ-0108-088`（6件）を再配置する。
当該 v2 要件群は tag `v2.4.0` 時点の mapping-table 全件記録契約を担い、現行 v3（REQ-001〜REQ-028）には該当しない。
後続要件は存在しない（mapping-table 廃止済み、tombstone 廃止済み）。
欠番管理は `../foundations/numbering-policy.md` の既知の欠番表が保持する。

| 旧交叉参照 | 旧タイトル（tag v2.4.0） | 再配置元 | 再配置日 | 後続 REQ |
|---|---|---|---|---|
| `v2:REQ-0108-083` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし（mapping-table 廃止済み） |
| `v2:REQ-0108-084` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし |
| `v2:REQ-0108-085` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし |
| `v2:REQ-0108-086` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし |
| `v2:REQ-0108-087` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし |
| `v2:REQ-0108-088` | mapping-table 全件記録契約（v2） | IR-011 file-backed tombstone | 2026-08-11 | なし |

> 旧タイトルの復元は tag `v2.4.0` で確認可能。
> Phase 4 では交叉参照の保存と再配置を責務とし、旧タイトル詳細の復元は別途歴史参照作業とする。
