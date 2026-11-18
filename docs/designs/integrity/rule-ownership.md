---
title: ルール所有権マトリックス
status: accepted
created: 2026-08-20
updated: "2026-11-18"
---

<!-- ADF-COVERS(design): REQ-047-013 -->

# ルール所有権マトリックス

> **位置づけ**: 本ファイルは全ドメイン（foundations/responsibilities/quality/integrity/local/authoring）横断のルール所有権マトリックスである。
> `integrity/` 配下に配置するが `integrity` ドメイン専用ではなく、全ルールドメインの canonical REQ/Design 対応を示すメタファイルとして機能する。

## req-impact-map.md との関係

本ファイル（ルールドメイン → canonical REQ/Design）と `../responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）は逆方向の対応マップである。両者の整合性維持運用:

- IR 別関連マッピング（本ファイルの `rule-ownership-ir-crossref` AUTOGEN ブロック）と req-impact-map の REQ → 影響する Rule IDs（`req-impact-map-req-ir-crossref` AUTOGEN ブロック）は、いずれも IR 文書の frontmatter / Field-Value 表の related_req から `generate_indexes.ts` が自動生成する。新規 IR 追加時は IR 文書の related_req を更新すれば両ブロックが自動追随し、対応行列の手動同期義務はない（「対応表の機械検証への移行（B3-1）」節、REQ-047-013）
- IR の物理削除時（AG-008、retired REQ-028-008）: IR 文書の物理削除に伴い両 AUTOGEN ブロックから自動除外される。交叉参照は `../responsibilities/req-impact-map.md` の Retired cross-references 節へ再配置する（人手管理を維持する節）
- canonical owner 変更時: 対応する IR 文書の related_req / related_design を更新し、次回の `generate_indexes.ts` 実行で両ブロックへ反映する
- 新規 REQ 追加、廃止時: REQ README 系の AUTOGEN（docs/requirements/README.md 等）と req-impact-map の導出ビューが実ファイル状態から自動更新される。影響先ルールドメインと rule-ownership.md の整合は IR-061 検査が機械検証する

req-impact-map.md の配置の原本は `../responsibilities/req-impact-map.md` 冒頭の配置記述であり、本ファイルはそこへの参照導線を保持する。`responsibilities/` 残置を現行配置として維持する。
本節では関係整理のみを扱い、配置判断の原本を当該ファイルへ集約する。

## 配布物対応宣言（ADF-COVERS）の配置規則

対応関係の正規保存方式は、repository top-level の producer/project-side `traceability/` 配下の component / package 単位 sidecar である。ADF-COVERS（implementation / verification）は、producer-only artifact に対応関係を inline 保持する場合の表現形式とし、consumer distribution closure に含まれる成果物では使用しない。配布物（`src/common/commands/agentdev/**`、`src/common/skills/agentdev-*/**` 等の実行時配布 .md）には対応宣言を記述せず、当該成果物の対応関係は sidecar で保持する。docs 配下の正規成果物（command Design、skill Design 等のリポジトリ内部設計文書）と repo-local 実装（`.opencode/skills/repo-*` の scripts 等の配布対象外ファイル）は producer-only artifact であり、inline 宣言を保持できる。inline 宣言と sidecar は同じ論理的な対応関係へ正規化され、coverage / impact / check から同一に扱われる。本配置規則により、配布物の concrete ID 排除（配布境界 baseline）と producer-side traceability metadata の非混入（distribution purity）を両立する。

## 意味判断・決定的処理の分類注記（DEC-048）

各ルールドメインの正規所有者の所在は、判断方法3分類（決定的処理・閉じた意味評価・開いた推論。正典: DEC-048、`../foundations/responsibility-boundaries.md`「v4 責務分類語彙の後継」節）に従って読む。判定基準・運用規則の意味契約は Design または Skill の知識（意味判断側）が、checker 実体・採番・整合検査・機械分類（check_extensions.ts deriveSkillClassification 等）の決定的処理は script / repo-local checker が所有する。v4 分類軸を検査する新規 checker は現段階で作らない（第13段 full validation で再評価する）。

## ルールドメイン一覧

| # | Domain | Canonical REQ | Canonical Design | 補足 |
|---|--------|--------------|----------------|------|
| 1 | Command frontmatter | REQ-002 (015, 044) | artifact-contracts.md | description 単一 |
| 2 | Skill frontmatter | REQ-002 (012, 013) | artifact-contracts.md | name + description |
| 3 | Command 行数上限 | REQ-002 (022-024) | quality-specs.md | 100 行目標、150 行上限、200 行以内 |
| 4 | Skill 行数上限 | REQ-002 (037) | quality-specs.md | 200 行超で分割候補報告 |
| 5 | Template 配置 | REQ-002 (005, 046) | artifact-contracts.md | command-local template 配置規約 |
| 6 | Script 配置 | REQ-002 (006, 014) | artifact-contracts.md | skill scripts/ 配下 |
| 7 | Namespace 予約 | REQ-002 (009, 056) | system.md | agentdev / agentdev-* 予約 |
| 8 | References 正規化 | REQ-002 (013, 039) | - | `references/` が正規、`reference/` は廃止 |
| 9 | Progressive disclosure | REQ-002 (035, 036) | - | SKILL.md 入口 + `references/` 詳細 |
| 10 | 完了報告フォーマット | REQ-002 (046), v2:REQ-0107 (013, 022) | artifact-contracts.md | 種別（`variant`）別管理 |
| 11 | 共通処理集約 | REQ-002 (040-043) | - | Git 同期等の共通化 |
| 12 | Source/projection 分離 | REQ-002 (048-055) | system.md | `src/common/` 共通原本 + `.opencode/` 配置先（配備形態は DEC-049） |
| 13 | Integrity 検査カテゴリ | REQ-010 (001-012), REQ-036 (001-009) | integrity-contracts.md | 18 集合、strict/heuristic/observation |
| 14 | Finding 分類 | REQ-036 (005, 006) | integrity-contracts.md | 6 カテゴリ + 経路 |
| 15 | Frontmatter dev metadata 禁止 | REQ-036 (010-012) | integrity-contracts.md | dev メタデータ禁止 |
| 16 | Retired REQ 管理 | REQ-010 | integrity-contracts.md | 注記、参照区別 |
| 17 | Link 整合性 | REQ-036 (001) | integrity-contracts.md | Markdown リンク先存在確認 |
| 18 | Namespace legacy 残存 | REQ-036 (004) | integrity-contracts.md | 旧コマンド名、旧パス検出 |
| 19 | REQ/Decision 相互参照 | REQ-010 (005) | integrity-contracts.md | 双方向参照確認 |
| 20 | Authoring DoD | REQ-010 (060, 062-063), REQ-038 (005) | quality-specs.md | 行数、Steps、共通化、正規パス（`canonical path`） |
| 23 | Subagent verbatim 条件 | REQ-003 (013) | responsibility-boundaries.md | 成果物本文のみそのまま（verbatim）。一律 verbatim 制約を禁止 |
| 24 | Findings / Capture候補 見出し | REQ-003 (014, 020, 021) | responsibility-boundaries.md | current/source は新見出しへ統一。旧語検出用文字列は許容 |
| 25 | Delegation envelope 最小契約 | REQ-003 (017, 018) | responsibility-boundaries.md | `delegation_type`/`on_result` は必須 envelope ではないことを確認 |
| 26 | lightweight-delegation 位置付け | REQ-003 (015, 016) | responsibility-boundaries.md | 主要パターン（`primary pattern`）ではなく重ねる委譲として扱う |
| 27 | 語彙ポリシー横断検出 | REQ-004 (024-028) | integrity-contracts.md | 現行対象範囲の語彙ポリシー違反検出 |
| 28 | Cross-REQ 語彙矛盾 | REQ-010 | integrity-contracts.md | 現行 REQ 間の語彙矛盾検出 |
| 29 | REQ 検証基準（必達要件） | REQ-010 | integrity-contracts.md | 規範語ではなく必達要件判定に基づく検証（v2:REQ-0115-044 から REQ-010 に移管） |
| 30 | Quality Gates | REQ-010 | quality-gate-model.md | QG-1〜QG-4 定義、機械化境界、実装マッピング（v2:REQ-0115 から REQ-010 に移管） |
| 31 | docs 日本語表現、文意整合 | v2:REQ-0140, REQ-010 (003), REQ-036 (023) | integrity-rule-catalog.md (IR-045) | 英字混じり抽象用語、読取専用セマンティクスの検出。文書表記、文意品質ゲート（付帯品質ゲート）の機械検査担当 |
| 32 | local-case-file（ローカルIssue共通スキーマ） | REQ-009 (016-020, 024, 025) | local-case-file.md | ローカル版 OpenCode のローカルIssue YAML 前書き、role 条件付き status enum、labels 値域、見出し一覧、マージ結果記録 |
| 33 | ローカル版 link mode 導入フロー、安全ゲート | REQ-009 (001-015) | runtime-package-boundary.md | link mode 接続手順、link target 確認、ジャンクション検出安全ゲート |
| 34 | local-transform（ローカル版変換資産） | REQ-009 (028, 029, 032) | runtime-package-boundary.md | **確定廃止**（PR#1195 で transform/ 完全削除、REQ-009-004/009/028 確定廃止昇格）。変換用プロンプト、レビュー用プロンプト、変換仕様の要件は全て廃止済み。link mode の現行契約は `runtime-package-boundary.md` が所有する |
| 36 | project-extensions-integrity（extensions 機構整合性検査） | REQ-002 (001-003) | integrity-rule-catalog.md (IR-056) | project extensions 機構（Design `../foundations/project-extensions.md`）の整合性検査。extension スキーマ（5セクション構造）、kind/配置/id 対応、context.paths 実在、project-local skill 存在、旧 doc-inputs 残存検出、上書き意図検出、配布コード直接参照残存を検査。regression_test は `check_extensions.test.ts` が統合テストとして存在、正常系 ok=true 確認済み（Issue #1406 移行完了時）。旧機構から extensions 移行で再実装 |
| 37 | IR 存在条件モデル（DEC-013 適用） | REQ-028 (008, 009, 010, 012; retired、恒常行は DEC-013 が移管受入れ), REQ-036 (022) | integrity-contracts.md | DEC-013 AG-008/009 適用後の IR モデルを所有。`lifecycle_state`、`enforcement_mode`、`baseline_status` を現行 IR 属性から削除し、「現存 IR = 現行 = executable detector」へ統一。8項目存在条件、finding-baseline 分類（finding 側）、新規 IR 登録 gate (a)/(b)、一時移行検査 registry を正規所有する。catalog（[integrity-rule-catalog.md](integrity-rule-catalog.md)）はスキーマ定義のみ重複所有し、判定規則は本ドメインへ委譲する |
| 38 | skill 記述基準（層1〜2）機械検査（AG-005 規則群） | REQ-002, REQ-027 | agentdev-skill-authoring.md, integrity-rule-catalog.md（AG-005 規則群） | `lint_skills.ts` が検出する層1〜2記述基準検査（hard 6規則 + warn 1規則、RU-0018 / PR #2184）。検出規則の登録は integrity-rule-catalog「AG-005 規則群」節、正典は skill authoring Design（command-file-format Design は DEC-065 により廃止済み）。検出違反は baseline による免除管理を行わず（REQ-010-082）、対象側の直接修正で解消する |
| 39 | common-policy-identifier-invariant（ガードレール識別体系検査） | REQ-051 (005, 006), REQ-010 (064, 068) | integrity-rule-catalog.md (IR-063) | 配布物の共通ポリシー意味識別子（`POL-`）の未定義参照・重複定義・registry 外定義、廃止済み Gxx 表記の残存検出（Issue #2429、REQ-051）。旧 Gxx 連番検査（起点番号固定・欠番なし・重複なし、Issue #2372）は連番制度廃止に伴い置換済み。識別子の定義実体は `agentdev-command-authoring` の共通ポリシー意味識別子 registry が保持 |
| 40 | unresolved-placeholder（未解決プレースホルダー検査） | REQ-010 (065, 068) | integrity-rule-catalog.md (IR-064) | 実行時配布対象の TODO 系マーカー（strict）と ID プレースホルダー裸出力（heuristic）。テンプレート・code span・括弧内等の許容条件付き（Issue #2372）。検出違反は免除せず対象側の直接修正で解消する |

## 対象規則の所有権一方向化マトリクス（REQ-047）

REQ-047 が定める対象規則（command format、ガードレール番号、廃止語彙と旧パス、配布境界、同種の integrity 検査定義）ごとに、正規契約から機械検査までの情報流を一方向とし、各成果物の位置づけ（正規契約、派生定義、実装詳細、検証資産）を固定する。
正規契約が契約の意味を決定し、派生定義・実装詳細・検証資産は正規契約から一方向に派生する。
複数候補が並立する場合は「契約の意味を決定する成果物を一つ」とし、他を派生定義・実装詳細・検証資産のいずれかに位置付ける（REQ-047-002）。

| 対象規則 | 正規契約（意味の所有者） | 派生定義（機械判定可能な定義） | 実装詳細（checker） | 検証資産（test） |
|---|---|---|---|---|
| ガードレール識別体系 | REQ-051-005/006、REQ-010-064/068（検出要件行）+ [IR-063](rules/IR-063-common-policy-identifier-invariant.md)（検出契約。共通ポリシーの意味識別子） | なし（検出は checker 内の抽出パターン。data yaml を持たない） | `check_integrity.ts`（checkCommonPolicyIdentifierInvariant） | `check_integrity.test.ts` IR-063 describe |
| 配布境界 | REQ-029 + DEC-014 + [distribution-boundary.md](distribution-boundary.md)（検証モデル）+ [runtime-package-boundary.md](../local/runtime-package-boundary.md)（リポジトリ種別・命名規約） | `data/distribution-targets.yaml`（検出定義データ。現行 checker〔IR-047/048〕は本 yaml を fail-closed 読込して検出に使用する。同期条件は下表） | `check_distribution_boundary.ts` + `lib/distribution-boundary-*.ts`、`src/opencode/plugins/agentdev-distribution-boundary-guard/` | `check_distribution_boundary.test.ts`、`distribution_boundary_routing_contract.test.ts`、boundary 系 test 群 |
| 同種の integrity 検査定義（IR 体系一般） | [integrity-contracts.md](integrity-contracts.md)（strict/heuristic/observation 分類と検査カテゴリ）+ [integrity-rule-catalog.md](integrity-rule-catalog.md)（スキーマ）+ `rules/IR-NNN-*.md`（個別検出契約） | 各 data yaml（検出用ビュー） | `check_integrity.ts` ほか checker 群 | 各 checker 対応の `*.test.ts` と回帰テスト群 |

### 同期条件と独立所有の明示（REQ-047-003）

検査定義（data yaml）と checker が同一規則に関わる箇所の同期条件と、独立して所有する情報の理由を次に明示する。

| 箇所 | 独立所有の理由 | 同期条件 | 機械検証 |
|---|---|---|---|
| distribution-targets.yaml ↔ `lib/distribution-boundary-rules.ts` | 検出定義データ（IR-047 の allowed サブディレクトリ、IR-048 の marker prefix）は yaml が canonical source であり（REQ-047-009）、lib 実装の `loadDistributionTargets` が fail-closed 読込して IR-047/048 検出に使用する。検出の実行と finding 出力契約（rule 名・description 文言）は lib 実装が所有する | 検出規則変更は同一 PR で yaml・lib 実装・IR-047/048 ルールファイルを更新する。yaml 読込は `loadDistributionTargets` の単一読込点として統合済み。yaml の廃止または読込経路変更は配布境界 checker の内部構成変更を伴うため追加判断とする | `check_distribution_boundary.test.ts` の `loadDistributionTargets: canonical yaml loading (REQ-047-009)` describe が canonical yaml 読込と yaml 欠損時の fail-closed を検証 |

正規契約変更時の派生検査の陳腐化検出は、上表の機械検証に加え、既存の IR-061（AUTOGEN ブロック鮮度）と各 checker の回帰テスト（REQ-010-068）が担う。
新規の生成機構やルールエンジンは導入しない（REQ-047-007）。

### 対応表の機械検証への移行（B3-1）

- 一方向化マトリクスの実装詳細（checker）・検証資産（test）の列は、IR 規則文書への機械検査可能なパス記載と checker 出力の規則識別子から機械検証できる（REQ-047-011〜013）。規則追加・変更時に本マトリクスの手動同期を必要としない
- req-impact-map.md の逆方向対応（REQ から規則への対応）は、IR 文書の frontmatter（Related REQ）から AUTOGEN で導出する（「IR 別関連マッピング（自動生成）」と同一の生成経路）。新規 IR 追加時の対応表手動同期義務を廃止する
- ルールドメイン一覧は意味グルーピングの案内として残置でき、規則追加ごとの同期対象からは除外する
- 対応表の縮小・廃止に伴う代替の管理表を新設しない。既存の generate_indexes.ts と IR frontmatter スキーマの拡張で対応する

## IR 別関連マッピング（自動生成）

IR-* ファイル（`rules/IR-NNN-*.md`）の frontmatter / Field/Value 表から抽出した Related REQ / Related Design の対応表を `generate_indexes.ts` が自動生成する（SC-002 Phase C、IR-061）。
直接編集は行わない。
各 IR の詳細は `rules/IR-NNN-*.md` を参照。

`../responsibilities/req-impact-map.md`（REQ → 影響する Rule IDs）と逆方向の参照関係を持つ。
両者の整合性は docs-check IR-061 検査が検証する。

<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->
| IR ID | title | Related REQ | Related Design |
|-------|-------|-------------|--------------|
| IR-001 | 現行 REQ frontmatter id ↔ ファイル名 | REQ-010-001, REQ-001 | integrity-contracts.md |
| IR-002 | 現行 REQ 必須 frontmatter fields | REQ-010-001 | integrity-contracts.md |
| IR-003 | Active/廃止 REQ ID 重複 | REQ-010 | integrity-contracts.md |
| IR-004 | REQ index ↔ 現行 REQ 一致 | REQ-010-003 | integrity-contracts.md |
| IR-007 | Skill frontmatter name ↔ dir | REQ-010 | integrity-contracts.md |
| IR-008 | Skill references/ 存在 | REQ-036-008 | integrity-contracts.md |
| IR-013 | 完了報告種別実在 | REQ-036-008 | integrity-contracts.md |
| IR-016 | Source/projection 整合性 | REQ-002-048-052 | system.md |
| IR-024 | Command README ↔ 実体 | REQ-001-026, REQ-010-003 | integrity-contracts.md |
| IR-044 | REQ/Design 境界違反検出 | REQ-001-002, REQ-001-003, REQ-001-067, REQ-001-068, REQ-010-002, REQ-010-012, REQ-001-049 | integrity-contracts.md, document-model.md |
| IR-053 | gh 直接記述検出 | REQ-011 | integrity-rule-catalog.md, integrity-contracts.md, ../../responsibilities/custom-tool-contracts.md |
| IR-055 | runtime-unresolved-reference（配布物内の導入先未解決参照検出） | REQ-029-003 | integrity-rule-catalog.md, integrity-contracts.md |
| IR-056 | project-extensions-integrity | REQ-002 | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| IR-058 | distribution-untracked-skill-reference | REQ-002-001, REQ-002-002, REQ-002-003 | ../integrity/integrity-rule-catalog.md, ../local/runtime-package-boundary.md |
| IR-059 | distribution-reference-boundary | REQ-029 | `distribution-boundary.md`, `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| IR-061 | 索引類自動生成整合性 | - | - |
| IR-062 | skill/command パス参照実在 | REQ-010 | integrity-contracts.md, agentdev-skill-authoring.md, agentdev-command-authoring.md |
| IR-063 | common-policy-identifier-invariant | REQ-051-005, REQ-051-006, REQ-010-064, REQ-010-068 | ../integrity-rule-catalog.md, ../../authoring/command-file-format.md |
| IR-064 | unresolved-placeholder | REQ-010-065, REQ-010-068 | ../integrity-rule-catalog.md |
| IR-067 | referenced-req-row-existence | REQ-010-069, REQ-010-065, REQ-010-068 | ../integrity-rule-catalog.md, ../checker-execution-contracts.md |
| IR-068 | skill-projection-manifest | REQ-010-068, REQ-018-002 | ../../local/runtime-package-boundary.md, ../checker-execution-contracts.md, ../integrity-rule-catalog.md |
| IR-069 | req-number-gap-recorded | REQ-010-068, REQ-010-070 | ../integrity-rule-catalog.md, ../../foundations/numbering-policy.md, ../checker-execution-contracts.md |
| IR-070 | design-frontmatter-required-keys | REQ-010-062, REQ-010-068 | ../checker-execution-contracts.md, ../integrity-rule-catalog.md, ../../foundations/patterns.md |
| IR-071 | integrity-rule-related-req-existence | REQ-051-009 | ../integrity-rule-catalog.md, ../checker-execution-contracts.md |
| IR-075 | ir-file-size | - | - |
<!-- AUTOGEN:END -->

> **IR-019, IR-022, IR-026, IR-036 について（2026-08-11 移管）**: 4件の意味判断系 IR は docs-check 機械検出層から除外し、inspect/diagnostics 層（`/agentdev/inspect-docs`、`/agentdev/inspect-skills`）へ移管した（文意品質の意味診断は docs 横断診断・inspect 系診断が、文章表層品質は textlint 共通基盤が担う。retired REQ-028-007、DEC-006、Phase 3 §5.2）。
> 詳細は `integrity-rule-catalog.md`「IR-019, IR-022, IR-026, IR-036: inspect-docs 移管」節を参照。

## 重複ルールの解消状況

以下のルールは複数 REQ 間で重複していたが、本マトリックスで原本所有者（`canonical owner`）を明確化した:

| 重複ルール | 旧参照箇所 | 原本所有者 | 状態 |
|-----------|-----------|----------------|------|
| Frontmatter 許可フィールド | REQ-002-044, REQ-039-002 | REQ-002-044 (primary) | ✅ |
| `references/` 正規化 | REQ-002-013/039, REQ-037-006/007 | REQ-002-013 (primary) | ✅ |
| Template 配置規約 | REQ-002-005/046, v2:REQ-0107-013/022, REQ-038-002 | REQ-002-005 (primary) | ✅ |
| Namespace 予約 | REQ-002-009/056, REQ-036-004 | REQ-002-009 (primary) | ✅ |
| Dev metadata 禁止 | REQ-002-015/020, REQ-036-010 | REQ-002-015 (primary) | ✅ |
