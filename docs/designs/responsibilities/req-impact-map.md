---
title: REQ 影響マップ
status: accepted
created: 2026-08-20
updated: "2026-11-18"
---

# REQ 影響マップ

> **位置づけと rule-ownership.md との関係**: 本ファイルは **REQ → 影響するルール/アーティファクト** の対応表である。
> `../integrity/rule-ownership.md`（**ルールドメイン → canonical REQ/Design**）と逆方向の対応マップであり、両者は補完関係にある。
> 配置の原本は本ファイル（`docs/designs/responsibilities/req-impact-map.md`）であり、`responsibilities/` 残置を現行配置として確定する。他文書（rule-ownership.md 等）は本行への参照導線として整合する。

## 同期更新が必要なケース

本ファイルの REQ → 影響する Rule IDs 対応（`req-impact-map-req-ir-crossref` AUTOGEN ブロック）は、IR 文書（`rules/IR-NNN-*.md`）の frontmatter / Field-Value 表の related_req から `generate_indexes.ts` が自動生成する（rule-ownership.md「対応表の機械検証への移行（B3-1）」と同一の生成経路。REQ-047-013、REQ-010-011）。

- 新規 IR 追加・削除・関連 REQ 変更時: IR 文書の related_req を更新すれば本ブロックは次回の `generate_indexes.ts` 実行で自動追随する。本ブロックの直接編集は行わない
- 手動の対応行列同期義務（新規 IR 追加時の本ファイル↔rule-ownership.md の双方向同期）は廃止した。rule-ownership.md 側の IR 別関連マッピング（`rule-ownership-ir-crossref`）も同一の IR 文書 frontmatter から生成される
- IR の物理削除時（AG-008、現行の IR 登録モデルは DEC-013）: IR 文書の物理削除に伴い両 AUTOGEN ブロックから自動除外される。交叉参照の履歴は本ファイルの `## Retired cross-references` 節へ再配置する（この節のみ人手管理を維持する）

各現行 REQ が影響する整合性ルールを記載するマップ（REQ-010-011）。REQ とルールの対応関係の正は IR 文書の related_req であり、本ブロックはその逆方向導出ビューである。

## 影響マトリックス（Impact Matrix）

<!-- AUTOGEN:BEGIN:id=req-impact-map-req-ir-crossref -->
| REQ | タイトル | 影響する Rule IDs |
|-----|---------|------------------|
| [REQ-001](../../requirements/REQ-001.md) | 文書体系と持続可能な基準構造 | IR-001, IR-024, IR-025, IR-027, IR-037, IR-038, IR-039, IR-040, IR-041, IR-042, IR-043, IR-044 |
| [REQ-002](../../requirements/REQ-002.md) | 配布成果物の責務境界 | IR-006, IR-056, IR-058 |
| [REQ-003](../../requirements/REQ-003.md) | 委譲時の判断・承認・副作用境界 | IR-030, IR-031, IR-032, IR-033 |
| [REQ-009](../../requirements/REQ-009.md) | 配布基盤と導入モデル | IR-048 |
| [REQ-010](../../requirements/REQ-010.md) | 自己監査コマンド（docs-check） | IR-001, IR-002, IR-003, IR-004, IR-005, IR-007, IR-010, IR-012, IR-015, IR-018, IR-024, IR-034, IR-035, IR-039, IR-044, IR-049, IR-050, IR-051, IR-052, IR-060, IR-062, IR-063, IR-064, IR-067, IR-068, IR-069, IR-070, IR-072, IR-073 |
| [REQ-011](../../requirements/REQ-011.md) | I/O境界と外部連携手段 | IR-053 |
| [REQ-018](../../requirements/REQ-018.md) | worktree 構造的制約とテスト fallback | IR-068 |
| [REQ-029](../../requirements/REQ-029.md) | 配布依存境界 | IR-055, IR-059 |
| [REQ-036](../../requirements/REQ-036.md) | 検出と診断コマンド群（inspect 系） | IR-008, IR-013, IR-060 |
| [REQ-039](../../requirements/REQ-039.md) | バックログ統合（backlog-review） | IR-006 |
| [REQ-047](../../requirements/REQ-047.md) | 規則所有権の一方向化 | IR-074 |
| [REQ-051](../../requirements/REQ-051.md) | ガードレール識別体系と機械検査の再編 | IR-063, IR-071 |
| [REQ-053](../../requirements/REQ-053.md) | 文書と配布物の文章品質契約 | IR-051, IR-060 |
<!-- AUTOGEN:END -->

## 要件行影響（Requirement-Line Impact）

特定要件行が影響するアーティファクト、スキル、コマンド（REQ-039-003）。
REQ 全体ではなく要件行粒度で境界基準、検出観点の影響を追跡する必要がある場合に使用する。
これらの要件行はすべて IR-044（REQ/Design 境界違反検出）を通じてカタログに紐づく。

従来の配布依存境界関連の旧行群（`REQ-002-021..026`、`032` 相当。現行 corpus には存在しない行）に紐づいていた影響エントリは MOVE 先（REQ-029-001..008）へ差し替え済みである。
REQ-002-027 は更新後の意味（実行時依存として使用するパスは導入先環境で解決可能）へ差し替えた。
旧配布物品質契約行（`REQ-002-028/029/035` 相当、現行 corpus には存在しない行。DEC-014 決定6）は RETIRE 扱いとし、それぞれの検査（構文健全性、責務整合、case-auto.md 段階解消）は既存品質契約（`integrity/docs-spec-rebuild-integrity.md`、`responsibilities/document-type-responsibilities.md`、`quality/req-health-metrics.md`）と Epic 完了条件へ集約した（REQ-007 行は新設しない）。
詳細は Retired cross-references 節へ追記する。

| 要件行 | 影響するアーティファクト / スキル / コマンド | 経由 |
|--------|-------------------------------------|------|
| REQ-001-067〜069 | document-model.md, `agentdev-req-analysis` skill, `agentdev-quality-gates` skill, docs-check command (IR-044 経由), inspect-docs command (REQ-039-003 経由) | IR-044 |
| REQ-004-031〜033 | `agentdev-req-analysis` skill, `agentdev-quality-gates` skill | IR-044 |
| REQ-039-003 | req-impact-map.md (本節), `agentdev-req-structure-diagnostics` skill | IR-044 |

## 再発トリアージ（Recurrence Triage）

再発検出事項検出時の対応ループ（baseline による既知/新規管理は撤廃済み。検出違反は全件を新規扱いで直接修正する）:

1. **検出**: 検出事項を全件新規として報告する（baseline による免除管理は行わない。REQ-010-074/079）
2. **分類**: 誤検知（false positive）か真の違反かを判定する
3. **再発判定**:
  - ルール、検出器の誤検知 → ルールを修正（false positive）
  - 真の再発 → 検出器を強化、または検出ルールを追加
  - 対象側の要因 → 対象ファイル側を直接修正する
4. **改善ループ**: ルールカタログ / 影響マップ / 例外を更新
5. **記録**: トリアージ結果を整合性レポートに記録

## IR → REQ 逆方向参照（ACT-SPEC-006）

本ファイル（REQ → 影響するルール/アーティファクト）と `../integrity/rule-ownership.md`（ルールドメイン → canonical REQ/Design）は逆方向の対応マップである（REQ-010-011）。
両者の整合性維持運用は前節「同期更新が必要なケース」に従う。

個別 IR（IR-NNN）の対応 REQ / Design は `../integrity/rule-ownership.md` の AUTOGEN ブロック（`rule-ownership-ir-crossref`）が IR-* ファイルの frontmatter / Field/Value 表から自動生成する（SC-002 Phase C、IR-061）。
本節は直接編集せず、`rule-ownership.md` の AUTOGEN ブロックを正とする。

DEC-013 AG-008 適用により file-backed tombstone（IR-011 型）を物理削除する。
廃止 IR の交叉参照は次節 `## Retired cross-references` へ再配置し、欠番管理は `../foundations/numbering-policy.md` が保持する。

## Retired cross-references

廃止 IR の交叉参照（v2:REQ-NNN 等）を再配置する節。
AG-008（retired REQ-028-008）に基づき、file-backed tombstone の物理削除時に交叉参照を本節へ移行する。
各エントリは廃止 IR ID、旧交叉参照、再配置日、後続 REQ 等のメタデータを持つ（Phase 3 §7.3、`docs/reports/integrity/audits/cross-cutting-integration-design-20260811.md`）。

### IR-011 削除に伴う交叉参照再配置

IR-011（Mapping table 全件記録、file-backed tombstone）の物理削除に伴い、交叉参照 `v2:REQ-0108-083`〜`v2:REQ-0108-088`（6件）を再配置する。
当該 v2 要件群は tag `v2.4.0` 時点の mapping-table 全件記録契約を担い、現行 v3（REQ-001〜REQ-028。ただし REQ-028 は retired）には該当しない。
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

### IR-047 削除に伴う交叉参照再配置

IR-047（src/opencode-local link origin dir structure）は、実行検出が配布境界 checker の lib 実装（`lib/distribution-boundary-rules.ts`、IR-046・IR-048 として統合）へ移行したため、tombstone とカタログ/所有表の AUTOGEN 導出エントリを削除した（PR #3347、OU-009、commit df187fd86）。
影響マトリクスの REQ-009 行と影響カテゴリの REQ-009 行から IR-047 を除去し、現行有効ルール（IR-016, IR-046, IR-048）のみを列挙する。
本節は REQ-001-013（廃止識別子への参照は移行表・履歴節・置換連鎖による履歴参照に限定）に基づく交叉参照の再配置である。

| 旧交叉参照 | 旧タイトル | 再配置元 | 再配置日 | 後継 |
|---|---|---|---|---|
| `IR-047` | src/opencode-local link origin dir structure | 影響マトリクス REQ-009 行・影響カテゴリ REQ-009 行（PR #3347 で tombstone 削除時に未更新の残存参照） | 2026-11-11 | なし（実行検出は IR-046・IR-048 の配布境界 checker lib 実装へ統合済み） |

### IR-023 削除に伴う交叉参照再配置

IR-023（Integrity artifact validator drift）は prose-only 規則であり、独立の機械検出を持ち得なかった（回帰試験名 `prevention_gates.test.ts` は不存在）。実際の drift 抑制は IR-074（checkIrRuleClassification、check_integrity.ts）が担う。各条項を IR-074 と integrity-contracts.md「3層検出構造の責務分担」節（REQ-010-008 の Design 対応）へ移管し、規則文書を物理削除した。

| 旧交叉参照 | 旧タイトル | 再配置元 | 再配置日 | 後継 |
|---|---|---|---|---|
| `IR-023` | Integrity artifact validator drift | integrity-rule-catalog.md ルールインデックス AUTOGEN（`catalog-ir-entries-pre-045`）・影響マトリクス REQ-010 行 AUTOGEN・rule-ownership.md「同期条件と独立所有の明示」節の現行機構引用記述・rule-ownership.md IR 別関連マッピング AUTOGEN | 2026-11-15 | IR-074（ir-rule-classification-traceability）+ integrity-contracts.md「3層検出構造の責務分担」節 |

### IR-020 削除に伴う交叉参照再配置

IR-020（基準既知（baseline-known）と新規 finding の区別）は独立の機械検出を持たず、検出器名義は IR-055（checkRuntimeUnresolvedReference）と共用であった。baseline 運用契約は Epic #4126 Phase 4（REQ-010-074/079）で撤廃され、その経緯と現行運用は integrity-contracts.md「baseline 分類・免除機構の撤廃」節と「IR-020 移管に伴う追記」節が所有する。規則文書は物理削除した。check_integrity.ts annotateIrIds の IR-020 名義は検出挙動不変の参照整理として除去し、IR-055 共用名義は維持した。

| 旧交叉参照 | 旧タイトル | 再配置元 | 再配置日 | 後継 |
|---|---|---|---|---|
| `IR-020` | 基準既知（baseline-known）と新規 finding の区別 | integrity-rule-catalog.md ルールインデックス AUTOGEN（`catalog-ir-entries-pre-045`）・影響マトリクス REQ-010 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts annotateIrIds の IR-020 名義 | 2026-11-15 | integrity-contracts.md「baseline 分類・免除機構の撤廃」節・「IR-020 移管に伴う追記」節 |

### IR-009/014/021/046/054/057/065/066 削除に伴う交叉参照再配置

IR-009（旧 namespace 残存）、IR-014（reference/ 残存検出）、IR-021（廃止済み skill 参照検出）、IR-046（consumer-generated リポジトリ種別誤検知防止）、IR-054（draft Design 放置検出）、IR-057（obsolete-spec-path-after-domain-split）、IR-065（obsolete-vocabulary-current-use）、IR-066（legacy-path-removed-name）の8ルールは、レガシー移行資産の完全削除（Epic #4126 Phase 4、OU-004）に伴いルールファイル・checker 実装・テストアサーションを物理削除した（DEC-064、REQ-010-003）。移行期の暫定統制であり、恒久維持義務を負わない。
宣言的データ（data/obsolete-path-map.yaml、data/obsolete-vocabulary-map.yaml、data/retired-artifact-registry.yaml）と実装側スクリプト（ir057_history_exemption.ts、check_retired_artifact_residual.ts）も同時に削除した。IR-055・IR-059 は baseline 運用のみ撤廃して検出器として存続する。影響マトリクスの各行は AUTOGEN 再生成により削除 IR を自動除外する。

| 旧交叉参照 | 旧タイトル | 再配置元 | 再配置日 | 後継 |
|---|---|---|---|---|
| `IR-009` | 旧 namespace 残存 | 影響マトリクス REQ-010/REQ-036 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkLegacyNamespace | 2026-11-18 | なし（レガシー移行資産の完全削除で暫定統制の義務消滅） |
| `IR-014` | reference/ 残存検出 | 影響マトリクス REQ-002/REQ-037 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkObsoleteReferenceDirs | 2026-11-18 | なし（SKILL frontmatter 検査の obsolete reference/ 判定も同時削除） |
| `IR-021` | 廃止済み skill 参照検出 | 影響マトリクス REQ-010 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkAbolishedSkillReferences | 2026-11-18 | なし（同上） |
| `IR-046` | consumer-generated リポジトリ種別誤検知防止 | 影響マトリクス REQ-009 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・lib/distribution-boundary-rules.ts checkIr046 | 2026-11-18 | なし（IR-047/048 は存続） |
| `IR-054` | draft Design 放置検出 | 影響マトリクス REQ-001 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkDraftSpecStaleness | 2026-11-18 | docs/designs/README.md status 列追跡 + case-close Design 確定工程 |
| `IR-057` | obsolete-spec-path-after-domain-split | 影響マトリクス REQ-001/REQ-009/REQ-036 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkObsoleteSpecPath・check_changed_docs.ts IR-057 validator | 2026-11-18 | なし（data/obsolete-path-map.yaml も同時削除） |
| `IR-065` | obsolete-vocabulary-current-use | 影響マトリクス REQ-010 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkObsoleteVocabulary | 2026-11-18 | なし（data/obsolete-vocabulary-map.yaml も同時削除。vocabulary-registry 対照表運用は存続） |
| `IR-066` | legacy-path-removed-name | 影響マトリクス REQ-010 行 AUTOGEN・rule-ownership.md IR 別関連マッピング AUTOGEN・check_integrity.ts checkObsoleteVocabulary / checkDocsDesignsLegacyPathDeclarations | 2026-11-18 | なし（同上） |
