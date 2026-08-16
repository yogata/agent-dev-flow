---
status: accepted
updated: 2026-07-26
---

# ルール所有権マトリックス

> **位置づけ**: 本ファイルは全ドメイン（foundations/responsibilities/quality/integrity/local/authoring）横断のルール所有権マトリックスである。
> `integrity/` 配下に配置するが `integrity` ドメイン専用ではなく、全ルールドメインの canonical REQ/SPEC 対応を示すメタファイルとして機能する。

## req-impact-map.md との関係

本ファイル（ルールドメイン → canonical REQ/SPEC）と `../responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）は逆方向の対応マップである。両者の整合性維持運用:

- 新規 IR 追加時: 両ファイルの対応行列を同期更新する
- IR の物理削除時（AG-008、REQ-028-008）: 両ファイルで対応行を削除し、交叉参照は `../responsibilities/req-impact-map.md` の Retired cross-references 節へ再配置する
- canonical owner 変更時: 両ファイルで参照先を更新する
- 新規 REQ 追加、廃止時: 本ファイルの対応行を追加、削除し、`req-impact-map.md` で影響先ルールドメインの整合を確認する

req-impact-map.md の配置移動は未確定事項とし、参照方向、利用頻度、更新責務を確認した後に別途判断する。本節では関係整理のみを扱い、`responsibilities/` 残置を維持する。

## ルールドメイン一覧

| # | Domain | Canonical REQ | Canonical SPEC | 補足 |
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
| 12 | Source/projection 分離 | REQ-002 (048-055) | system.md | `src/opencode/` 原本 + `.opencode/` 配置先 |
| 13 | Integrity 検査カテゴリ | REQ-010 (001-021) | integrity-contracts.md | 18 集合、strict/heuristic/observation |
| 14 | Finding 分類 | REQ-010 (017, 018) | integrity-contracts.md | 6 カテゴリ + 経路 |
| 15 | Frontmatter dev metadata 禁止 | REQ-010 (022-024, 095-098) | integrity-contracts.md | dev メタデータ禁止 |
| 16 | Retired REQ 管理 | REQ-010 (070-088) | integrity-contracts.md | 注記、参照区別 |
| 17 | Link 整合性 | REQ-010 (013) | integrity-contracts.md | Markdown リンク先存在確認 |
| 18 | Namespace legacy 残存 | REQ-010 (016) | integrity-contracts.md | 旧コマンド名、旧パス検出 |
| 19 | REQ/Decision 相互参照 | REQ-010 (005) | integrity-contracts.md | 双方向参照確認 |
| 20 | Authoring DoD | REQ-010 (060-064) | quality-specs.md | 行数、Steps、共通化、正規パス（`canonical path`） |
| 21 | Command Step 整数化 | REQ-003 (005, 007) | artifact-contracts.md | 最上位 Step は整数のみ。小数 Step を禁止 |
| 22 | Command サブステップ表記 | REQ-003 (006) | artifact-contracts.md | サブステップは N-M 形式のみ許容。英字サブステップを禁止 |
| 23 | Subagent verbatim 条件 | REQ-003 (013) | workflow-contracts.md | 成果物本文のみそのまま（verbatim）。一律 verbatim 制約を禁止 |
| 24 | Findings / Capture候補 見出し | REQ-003 (014, 020, 021) | workflow-contracts.md | current/source は新見出しへ統一。旧語検出用文字列は許容 |
| 25 | Delegation envelope 最小契約 | REQ-003 (017, 018) | workflow-contracts.md | `delegation_type`/`on_result` は必須 envelope ではないことを確認 |
| 26 | lightweight-delegation 位置付け | REQ-003 (015, 016) | workflow-contracts.md | 主要パターン（`primary pattern`）ではなく重ねる委譲として扱う |
| 27 | 語彙ポリシー横断検出 | REQ-004 (024-028), REQ-010 (236, 237) | integrity-contracts.md | 現行対象範囲の語彙ポリシー違反検出 |
| 28 | Cross-REQ 語彙矛盾 | REQ-010 (239) | integrity-contracts.md | 現行 REQ 間の語彙矛盾検出 |
| 29 | REQ 検証基準（必達要件） | REQ-010 | integrity-contracts.md | 規範語ではなく必達要件判定に基づく検証（v2:REQ-0115-044 から REQ-010 に移管） |
| 30 | Quality Gates | REQ-010 | quality-gates.md | QG-1〜QG-4 定義、機械化境界、実装マッピング（v2:REQ-0115 から REQ-010 に移管） |
| 31 | docs 日本語表現、文意整合 | v2:REQ-0140, REQ-010 (255-257) | integrity-rule-catalog.md (IR-045) | 英字混じり抽象用語、読取専用セマンティクスの検出。文書表記、文意品質ゲート（付帯品質ゲート）の機械検査担当 |
| 32 | local-case-file（ローカル Case ファイルスキーマ） | REQ-009 (016-020, 024, 025) | local-case-file.md | ローカル版 OpenCode の Case ファイル YAML 前書き、status enum、labels 値域、見出し一覧、マージ結果記録 |
| 33 | ローカル版 link mode 導入フロー、安全ゲート | REQ-009 (001-015) | runtime-package-boundary.md | link mode 接続手順、link target 確認、ジャンクション検出安全ゲート |
| 34 | local-transform（ローカル版変換資産） | REQ-009 (028, 029, 032) | runtime-package-boundary.md | **確定廃止**（PR#1195 で transform/ 完全削除、REQ-009-004/009/028 確定廃止昇格）。変換用プロンプト、レビュー用プロンプト、変換仕様の要件は全て廃止済み。link mode の現行契約は `runtime-package-boundary.md` が所有する |
| 35 | obsolete-spec-path（旧SPEC直下パス参照検出） | REQ-010 (280, 282) | integrity-rule-catalog.md (IR-057) | docs/specs/ 基盤SPEC ドメイン別体系化（REQ-001）以前の直下パス参照を検出。`obsolete-path-map.yaml` を対照表として IR-057 が検証。link mode 統一（REQ-009）に伴う廃止語彙を「単独検出語」（即 ng）と「近接条件つき検出語」（conditional）に分離し検出。例外条件: obsolete-path-map.yaml 自体、IR-057 ルール説明、retired 配下、テスト fixture、コードブロック内検査 fixture。v2:REQ-0158 は Issue #1713 で retire 完了（要件は REQ-010-280/282 へ統合） |
| 36 | project-extensions-integrity（extensions 機構整合性検査） | REQ-002 (001-003), REQ-010 (263) | integrity-rule-catalog.md (IR-056) | project extensions 機構（SPEC `../foundations/project-extensions.md`）の整合性検査。extension schema（5セクション構造）、kind/配置/id 対応、context.paths 実在、project-local skill 存在、旧 doc-inputs 残存検出、上書き意図検出、配布コード直接参照残存を検査。regression_test は `check_extensions.test.ts` が統合テストとして存在、正常系 ok=true 確認済み（Issue #1406 移行完了時）。旧機構から extensions 移行で再実装 |
| 37 | IR 存在条件モデル（DEC-013 適用） | REQ-028 (008, 009, 010, 012), REQ-010 (058) | integrity-contracts.md | DEC-013 AG-008/009 適用後の IR モデルを所有。`lifecycle_state`、`enforcement_mode`、`baseline_status` を現行 IR 属性から削除し、「現存 IR = 現行 = executable detector」へ統一。8項目存在条件、finding-baseline 分類（finding 側）、新規 IR 登録 gate (a)/(b)、一時移行検査 registry を正規所有する。catalog（[integrity-rule-catalog.md](integrity-rule-catalog.md)）は schema 定義のみ重複所有し、判定規則は本ドメインへ委譲する |

## IR 別関連マッピング（自動生成）

IR-* ファイル（`rules/IR-NNN-*.md`）の frontmatter / Field/Value 表から抽出した Related REQ / Related SPEC の対応表を `generate_indexes.ts` が自動生成する（SC-002 Phase C、IR-061）。
直接編集は行わない。各 IR の詳細は `rules/IR-NNN-*.md` を参照。

`../responsibilities/req-impact-map.md`（REQ → 影響する Rule IDs）と逆方向の参照関係を持つ。両者の整合性は docs-check IR-061 検査が検証する。

<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->
| IR ID | title | Related REQ | Related SPEC |
|-------|-------|-------------|--------------|
| IR-001 | 現行 REQ frontmatter id ↔ ファイル名 | REQ-010-001, REQ-001 | integrity-contracts.md |
| IR-002 | 現行 REQ 必須 frontmatter fields | REQ-010-001 | integrity-contracts.md |
| IR-003 | Active/廃止 REQ ID 重複 | REQ-010-082 | integrity-contracts.md |
| IR-004 | REQ index ↔ 現行 REQ 一致 | REQ-010-003 | integrity-contracts.md |
| IR-005 | Decision ↔ REQ 相互参照存在 | REQ-010-005 | integrity-contracts.md |
| IR-006 | Command frontmatter 許可フィールド | REQ-002-015, REQ-010-046, 095-099, 108, 124, 129 | integrity-contracts.md, artifact-contracts.md |
| IR-007 | Skill frontmatter name ↔ dir | REQ-010-092 | integrity-contracts.md |
| IR-008 | Skill references/ 存在 | REQ-010-110, 115-120, REQ-010-020 | integrity-contracts.md |
| IR-009 | 旧 namespace 残存 | REQ-010-016 | integrity-contracts.md |
| IR-010 | ADR status 正規化 | REQ-010-121 | integrity-contracts.md |
| IR-012 | Template 必須セクション | REQ-010 (workflow template 構造) | integrity-contracts.md |
| IR-013 | 完了報告種別実在 | REQ-010-089-091, REQ-010-020 | integrity-contracts.md |
| IR-014 | reference/ 残存検出 | REQ-002-013, 039, REQ-010-039, 040, 094 | artifact-responsibilities.md |
| IR-015 | 廃止 REQ 現行参照検出 | REQ-010-070-074, 136 | integrity-contracts.md |
| IR-016 | Source/projection 整合性 | REQ-002-048-052, REQ-010-143-144 | system.md |
| IR-018 | REQ 範囲表記鮮度 | REQ-010-140 | integrity-contracts.md |
| IR-020 | 基準既知（baseline-known）と新規 finding の区別 | REQ-010-145, 148 | integrity-contracts.md |
| IR-021 | 廃止済み skill 参照検出 | REQ-010-126-128 | integrity-contracts.md |
| IR-023 | Integrity artifact validator drift | REQ-010-147 | integrity-contracts.md |
| IR-024 | Command README ↔ 実体 | REQ-001-026, REQ-010-003 | integrity-contracts.md |
| IR-025 | 廃止 Decision path 規則 | REQ-001-047, REQ-001-048 | integrity-contracts.md, document-model.md |
| IR-027 | 廃止 ADR 現行根拠引用検出 | REQ-001-048, REQ-001-050 | integrity-contracts.md, document-model.md |
| IR-028 | Command 最上位 Step 整数化 | REQ-003-005, REQ-003-007, REQ-003-021 | artifact-contracts.md, workflow-contracts.md |
| IR-029 | Command 英字サブステップ禁止 | REQ-003-006, REQ-003-021 | artifact-contracts.md, workflow-contracts.md |
| IR-030 | Subagent verbatim 条件付き返却 | REQ-003-013, REQ-003-021 | workflow-contracts.md, artifact-contracts.md, artifact-responsibilities.md |
| IR-031 | Findings / Capture候補 見出し統一 | REQ-003-014, REQ-003-020, REQ-003-021 | workflow-contracts.md |
| IR-032 | delegation_type/on_result 必須 envelope 禁止 | REQ-003-017, REQ-003-018 | workflow-contracts.md, artifact-contracts.md |
| IR-033 | lightweight-delegation primary pattern 禁止 | REQ-003-015, REQ-003-016 | workflow-contracts.md, artifact-contracts.md |
| IR-034 | Skill 内部 section / protocol / Step 参照検出 | REQ-010-244 | integrity-contracts.md |
| IR-035 | Skill See Also 検出観点 | REQ-010-245 | integrity-contracts.md |
| IR-037 | retired-ADR-current-baseline-ref | REQ-010-250, REQ-001-048 | integrity-contracts.md, document-model.md |
| IR-038 | Decision-index-consistency | REQ-010-251, REQ-001-047, REQ-001-048 | integrity-contracts.md, document-model.md |
| IR-039 | index-req-title-consistency | REQ-010-003, REQ-001-063, REQ-001 | integrity-contracts.md |
| IR-040 | retired-req-authority-comment | REQ-001-063, REQ-010-070 | integrity-contracts.md, document-model.md |
| IR-041 | retired-req-broken-link | REQ-010-070, REQ-001-063 | integrity-contracts.md |
| IR-042 | hardcoded-req-count | REQ-010-140, REQ-001 | integrity-contracts.md |
| IR-043 | retired-readme-coverage | REQ-010-083, REQ-001 | integrity-contracts.md |
| IR-044 | REQ/SPEC 境界違反検出 | REQ-010-259, REQ-010-260, REQ-010-262, REQ-001-067, REQ-001-068, REQ-001-069, REQ-010-002, REQ-010-012, REQ-001-031 | integrity-contracts.md, document-model.md |
| IR-046 | consumer-generated リポジトリ種別誤検知防止 | REQ-009-007, REQ-009-011, REQ-009-014 | runtime-package-boundary.md |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成 | REQ-009-003, REQ-009-004, REQ-009-005, REQ-009 | runtime-package-boundary.md |
| IR-048 | generated_by 識別子整合性 | REQ-009-011, REQ-009-012, REQ-009-013 | runtime-package-boundary.md |
| IR-049 | Command file format violation | v2:REQ-0143, REQ-010 | command-file-format.md, integrity-contracts.md |
| IR-050 | load_skills command 誤指定検出 | REQ-010-261, v2:REQ-0140-027, REQ-010-010 | integrity-contracts.md, document-type-responsibilities.md |
| IR-051 | 実行主体の skill 表記誤認検出 | REQ-010-261, v2:REQ-0140-027, REQ-010-010 | integrity-contracts.md, document-type-responsibilities.md |
| IR-052 | 完了条件 grep パターン設計（REQ-010-011） | REQ-010-011 | integrity-contracts.md, quality-gates.md |
| IR-053 | gh 直接記述検出 | REQ-011 | integrity-rule-catalog.md, integrity-contracts.md, ../../skills/agentdev-gh-cli.md |
| IR-054 | draft SPEC 放置検出 | REQ-001-002, REQ-010-150, REQ-010-151 | integrity-rule-catalog.md, integrity-contracts.md |
| IR-055 | runtime-unresolved-reference（配布物内の導入先未解決参照検出） | REQ-002-079, REQ-002-080, REQ-002-081, REQ-010-056, REQ-010-263, REQ-010-264 | integrity-rule-catalog.md, integrity-contracts.md |
| IR-056 | project-extensions-integrity | REQ-002 | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| IR-057 | obsolete-spec-path-after-domain-split | REQ-010-280, REQ-010-282, REQ-001-006, REQ-009-004, REQ-010-265, REQ-010-024 | ../integrity/integrity-rule-catalog.md, obsolete-path-map.yaml, ../local/runtime-package-boundary.md |
| IR-058 | distribution-untracked-skill-reference | REQ-002-001, REQ-002-002, REQ-002-003 | ../integrity/integrity-rule-catalog.md, ../local/runtime-package-boundary.md |
| IR-059 | distribution-reference-boundary | REQ-029 | `distribution-boundary.md`, `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| IR-060 | forbidden Japanese word detection | v2:REQ-0140（v2:REQ-0140-033, v2:REQ-0140-035, v2:REQ-0140-036）, REQ-010（REQ-010-256 文意判断は docs-check 対象外、本ルールは完全一致検出に限定） | ../responsibilities/document-type-responsibilities.md（不自然表現検出分類 P0〜P4）, ../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md（forbidden 語リスト正）, integrity-rule-catalog.md |
| IR-061 | 索引類自動生成整合性 | - | - |
| IR-062 | skill/command パス参照実在 | REQ-028-012, REQ-010 | integrity-contracts.md, agentdev-skill-authoring.md, agentdev-command-authoring.md |
<!-- AUTOGEN:END -->

> **IR-019, IR-022, IR-026, IR-036 について（2026-08-11 移管）**: 4件の意味判断系 IR は docs-check 機械検出層から除外し、inspect/diagnostics 層（`/agentdev/inspect-docs`、`/agentdev/inspect-skills`、`agentdev-doc-writing` skill）へ移管した（REQ-028-007、DEC-006、Phase 3 §5.2）。詳細は `integrity-rule-catalog.md`「IR-019, IR-022, IR-026, IR-036: inspect-docs 移管」節を参照。

## 重複ルールの解消状況

以下のルールは複数 REQ 間で重複していたが、本マトリックスで原本所有者（`canonical owner`）を明確化した:

| 重複ルール | 旧参照箇所 | 原本所有者 | 状態 |
|-----------|-----------|----------------|------|
| Frontmatter 許可フィールド | REQ-002-044, REQ-010-046/098 | REQ-002-044 (primary) | ✅ |
| `references/` 正規化 | REQ-002-013/039, REQ-010-039/040/094 | REQ-002-013 (primary) | ✅ |
| Template 配置規約 | REQ-002-005/046, v2:REQ-0107-013/022, REQ-010-042/075 | REQ-002-005 (primary) | ✅ |
| Namespace 予約 | REQ-002-009/056, REQ-010-016 | REQ-002-009 (primary) | ✅ |
| Dev metadata 禁止 | REQ-002-015/020, REQ-010-022/095 | REQ-002-015 (primary) | ✅ |
