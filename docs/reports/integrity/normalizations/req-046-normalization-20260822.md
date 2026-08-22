---
id: NORMALIZATION-REQ-046
title: "REQ-046 横断正規化 実行記録"
status: accepted
created: 2026-08-22
normalization_for: REQ-046 / Issue #2371
parent_epic: "#2369 (REQ-045〜047 Epic)"
input_audit: docs/reports/integrity/audits/req-045-consistency-audit-20260822.md
base_ref: 41e6ad18 (origin/main)
---

# REQ-046 横断正規化 実行記録

> **位置づけ**: 本ファイルは Issue #2371（Wave 2、OU-002）の実行成果物である。REQ-046-010 が要求する各修正単位の記録（修正前、正規化後、既存検査結果、対象固有検査結果、差分レビュー結果）と、REQ-046-009 の blocked 報告を保持する。入力は Wave 1 監査レポート（AUDIT-REQ-045-CONSISTENCY）の検出事項 F-001〜F-028、blocked B-01〜B-06 である。

## 1. 実行概要

- 修正単位（クラスタ）: 15（F-001〜F-008、F-014、F-016、F-018、F-019、F-022、F-024、F-025）
- 修正ファイル数: 63（うち配布物 src/opencode/** 39、docs/designs/** 12、.opencode/** 5、.agentdev/extensions/** 7、検査コード 1、テスト削除 1）
- blocked 報告（修正せず報告のみ）: B-01〜B-06、F-011/F-012/F-013、F-015、F-017
- ガードレール番号の変更: なし（B-01/B-02 blocked のため再採番を実施しない。REQ-046-005 の変換対照表は「変更対象なし」のため作成不要）
- 歴史的識別子（v2:ADR-*、v2:REQ-*）の変更: 0 件（git diff で確認、REQ-046-002・TS-004 準拠）

## 2. 修正単位記録（REQ-046-010）

各修正単位について、修正前・正規化後・既存検査結果（Wave 1 監査マトリクス §8 および監査時点の機械検査）・対象固有検査結果（本 Issue での変更後検査）・差分レビュー結果を記録する。

### C-01（F-001、PC-01）: 17 コマンドの孤立（ADR）注記

- **修正前**: 「…project extension（`.agentdev/extensions/skills/agentdev-workflow-*.yaml`、kind: workflow-extension）を読み込む（ADR）。」（17 ファイル同一パターン）
- **正規化後**: 「…を読み込む。」（孤立注記を削除）
- **置換先選定の根拠**: 監査修正候補は「Design 参照へ置換」または「根拠参照が不要なら削除」の2択。Design パス（`docs/designs/foundations/project-extensions.md`）を配布物へ新規記述すると IR-055 heuristic 違反（docs/designs/ 参照、consumer 環境で解決不能）を新規に生じる。また直近の行に「詳細な読み込み契約は `agentdev-project-extensions` skill 参照」（skill 名による現行参照）が既存するため根拠参照は喪失しない。よって削除が正規契約から一意に導ける選択である。
- **既存検査結果**: 監査マトリクス fail（F-001、17 ファイル）。check_command_format.ts OK。
- **対象固有検査結果**: check_command_format.ts OK（変更後再実行）、IR-055 新規違反 0（check_integrity.ts 変更後実行）。
- **差分レビュー結果**: 当初 Design パス参照へ置換したが、IR-055 heuristic 違反（DEC-003/DEC-017 と同型の新規具体参照問題）を review で検出し、注記削除へ路線修正した。17 ファイルとも同一パターンで意味変更なし。

### C-02（F-002、PC-01）: 15 スキルファイルの方針参照（ADR）注記（+ 監査取りこぼし 1 ファイル）

- **修正前**: 「本スキルは以下の方針に従う（ADR）。」（13 SKILL.md）、「soft-contract（ADR）」（architecture-advisory L49）、「case-close(#epic) のみが書き込む（ADR）」（epic-tracker L44、regex-and-merge-conflict.md L177）、「意思決定（ADR）」「決定の経緯は ADR に属する」（spec-writing-quality.md L7/L13）
- **正規化後**: 方針注記・単一書き手注記は（ADR）を削除（各 SKILL.md 冒頭の「原本（SSoT）」節が Design を正規原本として既に宣言しており根拠参照は既存）。soft-contract は DEC-009 系の正規語彙のため注記削除。意思決定（ADR）→ 意思決定（Decision）、決定の経緯は ADR に属する → Decision に属する（DEC-009 語彙正規化）。
- **監査取りこぼしの追加**: `agentdev-doc-diagnostics/SKILL.md` L22 に同一パターン（「本スキルは以下の方針に従う（ADR）。」）が残存していた（監査マトリクスは pass 判定）。REQ-046-001 の不変条件（対象範囲に残存しないこと）実現のため同一正規化を適用した。監査網羅性の取りこぼしとして PR Findings に記録する。
- **置換先選定の根拠**: skill の 参照方針ルール3（「スキル本文・references に `docs/designs/**` 内部パスを直接記述しない」）により Design パス記述はスキル自身の契約に違反する。監査修正候補の「Design 参照」は不可、「削除」が一意。
- **既存検査結果**: 監査マトリクス fail（F-002、15 ファイル）。
- **対象固有検査結果**: `rg '（ADR）' src/opencode docs .opencode .agentdev` の残存 0（監査レポート本文内の言及のみ）。lint_skills.ts・bun test 全件 pass。
- **差分レビュー結果**: architecture-advisory L49 は一時「soft-contract（DEC-003）」へ置換したが、配布物への具体 DEC-NNN 新規記述は IR-055 strict 違反となるため注記削除へ修正した。doc-writing 系 reference の「ADR に属する」（L13、監査パターン外の現在概念残存）は REQ-046-001 達成のため同時正規化した。

### C-03（F-003、PC-02）: 廃止スキル `agentdev-spec-compliance` への現行参照（5 ファイル + 監査取りこぼし 1 箇所）

- **修正前**: レビューNG フローの入力・委譲先として `agentdev-spec-compliance` の乖離報告を参照（workflow-routing 2 reference、review_ng テンプレート、learning 2 reference 計 9 箇所）
- **正規化後**: 「QG-3（実装乖離ゲート、`agentdev-quality-gates`）の乖離報告」等へ置換。報告項目（影響度、対象、内容、推奨アクション、理由）は QG-3 の報告フォーマット（qg-3-implementation-deviation.md）が全て包含し、QG-3 reference が case-update --review-ng を「QG-3 結果の消費先」と明記しているため、置換先は正規契約から一意。
- **監査取りこぼしの追加**: repo-agentdev-integrity SKILL.md L28（`spec-bug`/`impl-bug`/`scope-creep` の最終分類 → `agentdev-spec-compliance`）にも同一不整合が残存。QG-3（分類と推奨アクションの提示）と case-update（最終判断）への置換で正規化した。
- **個別判断**: learning-pipeline disposition-and-artifact-schema.md L62 は実在しない `agentdev-spec-compliance/templates/` の列挙から当該項目を削除（他2項目は実在）。learning-capture example.md L135 は学びエントリの例示内の検知方法記述であるため現行委譲先（QG-3 乖離検出）へ置換。
- **既存検査結果**: 監査マトリクス fail（F-003、5 ファイル）。
- **対象固有検査結果**: `rg 'agentdev-spec-compliance' src/opencode docs .opencode .agentdev` の残存は検出語彙配列（check_integrity.ts、検出基盤許容）と歴史許容（quality-gates.md L22「旧」明示）のみ。bun test 全件 pass。
- **差分レビュー結果**: テンプレート（issue_comment_review_ng.md）の引用形式も QG-3 へ更新。意味変更なし（入力源の現行化のみ）。

### C-04（F-004、PC-02）: `agentdev-adr-guidelines` への実参照残存（2 ファイル）

- **修正前**: docs-check G08「`agentdev-adr-guidelines`（manual reference）の ADR 構造定義を参照して ADR フィールド検査」、repo-agentdev-integrity SKILL.md の意味的妥当性判定・ADR 要否判断の委譲先
- **正規化後**: G08 は「`agentdev-decision-guidelines`（manual reference）および Decision lifecycle Design（`docs/designs/foundations/decision-lifecycle.md`）の Decision 構造定義を参照して Decision フィールド検査」。委譲先は `agentdev-decision-guidelines`（DEC-009 決定14 の移行先、実在確認済み）へ、種別語は Decision へ。Decision 構造定義の正規所有者（DEC-009 決定5: decision-lifecycle.md）を併記。
- **既存検査結果**: 監査マトリクス fail（F-004、2 ファイル）。
- **対象固有検査結果**: `rg 'agentdev-adr-guidelines'` の残存は語彙対照表（廃止済み注記付き・IR-021 検出語彙）、ng-baseline.json（過去検出記録）、監査レポート・Decision 本文（歴史記録）のみ。docs-check が参照する check_integrity.ts は無変更で pass。
- **差分レビュー結果**: docs-check.md は repo-local ファイルのため docs/designs パス参照は可（IR-055 対象は配布物のみ）。意味変更なし。

### C-05（F-005、PC-02）: 語彙レジストリの旧スキル語彙列挙

- **修正前**: load_skills 指定可能識別子表に `agentdev-adr-file-manager`、`agentdev-adr-guidelines`、`agentdev-doc-map` を注記なしで列挙
- **正規化後**: 上記 3 語を実在スキル表から削除し、「旧スキル名対照（vocabulary）」表へ後継語彙付き（`agentdev-decision-file-manager`、`agentdev-decision-guidelines`、後継 skill なし docs/designs/README.md 索引へ移行）で移行。廃止済み注記の様式は同表 L135 の既存先行例（`agentdev-workflow-reporting` 行）に準拠。
- **既存検査結果**: 監査マトリクス fail（F-005）。
- **対象固有検査結果**: 実在スキル表に実在しない語彙は 0。IR-021 検出語彙として対照表に保持されるため検出基盤は維持。bun test pass。
- **差分レビュー結果**: 語彙表の網羅性（現行約50スキル中26語のみ列挙）は監査未指摘の既存状態であり本 Issue の対象外。PR Findings に intake 候補として記録する。

### C-06（F-006、PC-02）: 成果物責任表の `agentdev-doc-map` 参照

- **修正前**: 「探索順（`agentdev-doc-map`）」（L56 対象外列）、「`agentdev-doc-map`（探索順）」（L62 重複なし確認）
- **正規化後**: 「探索順（`docs/designs/README.md` 索引）」（監査修正候補の現行参照）。doc-map 廃止（REQ-013）後の探索順の現行入口は Design 索引である。
- **既存検査結果**: 監査マトリクス fail（F-006、req-impact-map.md と同居）。`.agentdev/intake/inbox/` に同内容の intake item が既存（本 Issue は intake を直接変更しないため PR で対応関係を明示）。
- **対象固有検査結果**: `rg 'agentdev-doc-map' docs/designs` の残存 0。
- **差分レビュー結果**: L56・L62 の両箇所（監査は L62 を該当箇所としたが L56 にも同一文字列が存在）を同一正規化。意味変更なし。

### C-07（F-007、PC-02/PC-09）: 機械置換規則表の `agentdev-artifact-graph` 残存セル

- **修正前**: 「| agentdev-artifact-graph SKILL.md（問い合わせプロファイル表の探索方向列） | 1 | N/A プレースホルダ | 置換対象（残存） |」、経緯記述（L99）
- **正規化後**: 行頭に「旧」を付し「当該スキルは廃止済み」と明示、扱いを「解消済み（スキル実体の廃止に伴い解消）」へ更新。残存セル集計を 4→3 へ更新。経緯記述は歴史注記化（「旧 src/opencode 側 1 セル（旧 `agentdev-artifact-graph` スキル）…廃止に伴い解消済み」）。
- **既存検査結果**: 監査マトリクス fail（F-007）。
- **対象固有検査結果**: 「置換対象（残存）」の旧スキル行は 0。em-dash 関係の機械検査（bun test）pass。
- **差分レビュー結果**: 一時「DEC-017 決定3により廃止済み」と具体 Decision ID を記述したが配布物への DEC-NNN 新規記述は IR-055 strict 違反となるため「当該スキルは廃止済み」へ修正した。残存 3 セル（inspect-promote Design、project-extensions Design）は機械是正の適用段階対象であり本 Issue 対象外（監査未指摘）。

### C-08（F-008、PC-03）: extension 定義の DOC-MAP 参照残存（6 yaml、9 箇所）

- **修正前**: 「REQ/ADR/Design/guides/DOC-MAP の責務マトリックス…」種別列挙（4 yaml）、「docs/DOC-MAP.md 経由で〜探索してよい」discovery エントリ（5 yaml）
- **正規化後**: 種別列挙は「REQ/Decision/Design/guides の責務マトリックス…（document-model Design）」へ現行化（paths は当初から document-model.md を正しく指す）。DOC-MAP discovery エントリは、docs/designs/README.md 経由の同等 discovery エントリが既存する 4 yaml（req-define、case-close、design-save、inspect-docs）では重複解消のため当該エントリを削除、同等エントリがない req-save.yaml は「docs/designs/README.md 経由で関連 Design と Decision を探索してよい」へ経路置換。req-save must-1 の「REQ/ADR/Design」列挙も「REQ/Decision/Design」へ現行化。
- **既存検査結果**: 監査マトリクス fail（F-008、6 ファイル）。
- **対象固有検査結果**: check_extensions.ts strict failure 0（変更後再実行）。extension の context.rules.checks スキーマは無影響。
- **差分レビュー結果**: エントリ削除はスキーマ上独立（id 一意性は維持）。許可される探索経路から実在しない経路を除去するのみで、実在経路（docs/designs/README.md）の許可は全 yaml で維持される。

### C-09（F-014、PC-06）: obsolete-path-map の存在しない新パスエントリ

- **修正前**: old `docs/specs/spec-health-metrics.md` / `docs/specs/quality/spec-health-metrics.md` → new `docs/designs/quality/spec-health-metrics.md`（2 エントリ）
- **正規化後**: new を実在する `docs/designs/quality/design-health-metrics.md` へ修正（old 側は検出語彙として維持）。
- **既存検査結果**: 監査マトリクス fail（F-014）。
- **対象固有検査結果**: new パスの実在確認（Test-Path）OK。check_integrity.ts pass（obsolete-path 検出は無影響）。
- **差分レビュー結果**: old 側の変更なし（検出対象語彙の保持）。機械的修正。

### C-10（F-016、PC-06）: extension id の旧 SPEC 語彙

- **修正前**: `.agentdev/extensions/skills/agentdev-inspect-skills.yaml` L11 `- id: agentdev-gh-cli-spec`
- **正規化後**: `- id: agentdev-gh-cli-design`（paths は当初から `agentdev-gh-cli.md` Design を正しく指す）。
- **既存検査結果**: 監査マトリクス fail（F-016）。
- **対象固有検査結果**: check_extensions.ts pass。`rg 'gh-cli-spec'` 残存 0。
- **差分レビュー結果**: id は意味的ラベルであり参照・表示への影響なし。

### C-11（F-018、PC-07）: retired REQ-028 への参照残存（10 Design）

- **修正前**: REQ-028（retired、後継 REQ-010・DEC-013 による Design 移管済み）を正規根拠・一次参照として引用（rule-ownership、integrity-rule-catalog、integrity-contracts 約20箇所、document-model、checker-execution-contracts、req-impact-map、doc-diagnostics Design、IR-044/055/062 ルールファイル）
- **正規化後**: 全ての引用を行単位で歴史注記化（「retired REQ-028-NNN」「retired REQ-028-NNN から移管」「由来」表記）。監査修正候補の「REQ-010 への参照更新」は行レベル引用（REQ-028-008 等）の帰属先として REQ-010 を充てると誤帰属（意味変更）となるため採用せず、移管実態（内容は Design 自身へ移管済み）に忠実な歴史注記化を採用した。IR-055/IR-062 の related_req フィールド（AUTOGEN 生成元）は現行の関連 REQ（REQ-002-079〜081、REQ-010）のみへ整理し、rule-ownership AUTOGEN 表を再生成で反映。
- **既存検査結果**: check_integrity.ts の retired-req-primary-ref / retired-req-as-current WARNING 11 件（監査 F-018 根拠と同一）。
- **対象固有検査結果**: 変更後 check_integrity.ts で当該 WARNING 0 件（歴史文脈許容は維持）。AUTOGEN 再生成後も IR-061 整合 OK。
- **差分レビュー結果**: 歴史注記の許容語彙（retired/移管/由来的）は check_integrity.ts の isHistoricalReferenceContext（RETIREMENT_CONTEXT_RE）が定義する正規許容条件に合致。docs/designs/README.md（vocabulary-registry 行）と authoring/vocabulary-registry.md の REQ-028-007 言及は監査・検出器ともに不整合とされておらず対象外。

### C-12（F-019、PC-08）: AUTOGEN ブロックの鮮度不全

- **修正前**: req-health-metrics.md の req-metrics-measurement-example ブロックが実 REQ ファイルと不一致（current 39 行 vs expected 42 行）
- **正規化後**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` により再生成。REQ-010 の行数更新（16→21）、REQ-045/046/047 行の追加、計測日の更新を含む。
- **既存検査結果**: check_integrity.ts index-generation-consistency NG（IR-061、F-026 構成要素）。
- **対象固有検査結果**: 変更後 check_integrity.ts で当該 NG 0 件。再実行で冪等（no changes）。
- **差分レビュー結果**: 再生成差分を全行精査し、当該ブロックの派生内容以外への波及なし（他 AUTOGEN ブロック・他ファイルは無変更）。

### C-13（F-022、PC-09）: generate_indexes.ts の ADR 生成経路（出力先不在）

- **修正前**: `docs/adr/README.md` への AUTOGEN 生成経路（AdrInfo、extractAdrInfo、collectAdrFiles、collectRetiredAdrFiles、ADR_*_BLOCK_ID 7 定数、generateAdr* 4 関数）を出力先不在のまま保持。main flow は docs/adr/README.md への書込を持たない（関数は検査専用とコメントされていたが check_integrity.ts は decision-*/req-* 系のみ import し未参照）。ADR 収集関数の唯一の残存消費者は docs/DOC-MAP.md 在庫生成ブランチ（こちらも出力先不在、REQ-013 で廃止済み）。
- **正規化後**: ADR 収集・生成関数・ブロック ID を削除。依存する DOC-MAP 在庫生成ブランチ（generateDocMapInventory、DOCMAP_INVENTORY_BLOCK_ID、countDesignFiles、docMapPath 解決）も併せて削除（ADR 収集の削除が強制する同根の死蔵経路。DEC-009 決定12「旧 current ADR 契約を通常経路で生成しない」準拠）。ヘルプテキストの該当行を更新。削除関数専用の fixture 回帰テスト regression_adr_id_width.test.ts を削除（保護対象の挙動が消滅）。
- **既存検査結果**: 監査マトリクス fail（F-022）。監査の B2 条件（削除が死蔵経路の除去に留まること）を事前確認: check_integrity.ts は ADR 系を import しない、generate_indexes.test.ts に ADR/DOC-MAP 系テストなし、regression_adr_id_width.test.ts は fixture ベースで実経路非依存。
- **対象固有検査結果**: bun test 2235 pass / 0 fail（全 94 ファイル）。generate_indexes.ts 再実行で冪等。decision-* / req-* 系生成（docs/decisions/README.md、docs/requirements/README.md）は無影響（import 先確認済み）。
- **差分レビュー結果**: check_integrity.ts の ADR 互換検査経路（IR-025/037/038 由来の docs/decisions 検査、docs/adr 走査）は B-05 blocked の対象であり本 Issue では削除していない（ファイル無変更）。sanitizeTableCell（Decision/REQ 生成と共有）は維持。

### C-14（F-024、PC-10）: baseline 未登録の repo-* 参照（project-extensions scripts README）

- **修正前**: 「repo-local deterministic checker（`.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts`）は…。配布側実装から repo-local 成果物への依存は持たない。」（IR-055 strict 新規違反 3 件: repo-local ×2、repo-agentdev-integrity ×1）
- **正規化後**: 「自己ホストリポジトリの deterministic checker（`check_extensions.ts`）は本ディレクトリの `lib/extension_state.ts` を相対 import で参照する。配布側実装は自己ホストリポジトリ固有の成果物に依存しない。」（repo-* 語彙と repo-local パスを抽象化。相対 import が実在する旨の記述は維持）
- **既存検査結果**: check_integrity.ts IR-055 delta NG 3 件（F-026 構成要素）。
- **対象固有検査結果**: 変更後 check_integrity.ts で当該 NG 0 件。extension_state.test.ts pass。
- **差分レビュー結果**: 意味（配布側実装は共有 lib のみに依存し repo-local 成果物に依存しない）は不変。

### C-15（F-025、PC-10）: baseline 未登録の docs/designs/ 参照（traceability SKILL.md）

- **修正前**: 検証対応要否カタログの所在を「`docs/designs/foundations/references/verification-scope-catalog.md`」と配布物本文に記述（IR-055 heuristic delta WARNING）
- **正規化後**: 「自己ホストリポジトリ内の `verification-scope-catalog.md`」と修飾し、不在時挙動の説明に「（consumer 環境を含む）」を追加。docs/designs パスの記述は IR-055 が行レベル免除を持たないため除去が唯一の解消手段（baseline 登録は intake 判断であり本 Issue では実施しない）。
- **既存検査結果**: check_integrity.ts IR-055 delta heuristic WARNING 1 件（F-026 構成要素）。
- **対象固有検査結果**: 変更後 check_integrity.ts で当該 WARNING 0 件。安全側既定（カタログ不在時は全要件行を検証対応必須）の記述は維持・強化。
- **差分レビュー結果**: check スクリプトの既定パス解決（コード側）は無影響。SKILL.md の説明は実行契約と整合。

## 3. blocked 報告（REQ-046-009: 修正せず報告）

| 項目 | 対応 blocked | 根拠（一意に導けない / 意味変更を伴う / 対象外宣言） |
|---|---|---|
| F-009 Gxx 採番規則（開始番号・連番・欠番） | B-01 | 採番規則（連番必須 vs 欠番許容）を規定する正規契約が存在しない。規則確定は設計判断を要する（Wave 2 実施前に確定が必要と監査が明記）。現行17コマンド中14ファイルが非 G01 開始または欠番を持ち、再採番は公開 command の番号体系変更を伴うため独断で実施しない。 |
| F-010 Gxx・工程ラベル参照の修飾・番号空間 | B-02 | 番号空間の所在（command 単位かスキル横断か）と参照修飾形式が規定されない。Design 確定が必要。 |
| F-011 command-file-format.md 内部矛盾（工程表 vs `### Step N` 必須） | B-03 | 同一 Design 内で両説が併記され、どちらを正とすべきかを文書内から確定できない。正規形確定は設計判断。 |
| F-012 `**EN.**` 規定の存続 | （B-03 前提） | F-011 の正規形確定に依存（監査 §9 Design 修正群の明記どおり）。単独では処置を一意に導けない。 |
| F-013 検出規則（IR-028/029）の工程表非対応 | （B-03 前提） | 同上。B-03 の正規形確定後に規約・代表例・検出規則の一体更新が必要。 |
| F-020 workflow-status-prohibition 過検出候補 | B-04 | 検出意図（禁止対象の語組み合わせ）の確認と除外条件の確定が検査設計判断。対象3ファイルは正規契約と適合のためファイル側は修正しない。変更後も NG 3 件が残存し baseline 承認待ち（intake 経由）。 |
| F-023 check_integrity.ts の ADR 互換検査経路 | B-05 | IR-025/037/038 が正当化する範囲の確定が検査設計判断。check_integrity.ts は本 Issue で無変更。 |
| F-028 proposed DEC-017 の現行基盤引用 | B-06 | DEC-017 の受理判断（status 昇格）または引用表現の調整はユーザー/意思決定工程。docs/designs/README.md は無変更。変更後も WARNING 1 件が残存し判断待ち。 |
| F-015 REQ-010-059 の旧ファイル名表記 | Issue Execution Contract | 修正方法（`design-health-metrics.md` への表記更新）自体は一意に導けるが、Issue #2371 Execution Contract が「本 Issue では REQ ファイル自体を変更しない」と宣言しているため実施しない。REQ-046-008 観点の未達として後続（case-update --req または #2372 以降）へ引き継ぐ。 |
| F-017 guides の旧 SPEC パス broken link 5 件 | 監査対象外 | 対象外領域（docs/guides/**）の参考記録であり、監査 §9 Wave 2 バッチ列挙に含まれない。変更後も NG 5 件が残存し intake 候補として PR に記録する。 |
| F-026 baseline 未管理 NG 25 件（集計） | 分解済み | 分解先のうち F-019（AUTOGEN）、F-024、F-025 を解消（25→9）。残る 9 件（F-017×5、F-020×3、F-028×1）は上記 blocked/対象外。baseline 承認登録は intake 経由の判断。 |

## 4. REQ-046-005 変換対照表の取扱い

ガードレール番号の変更を実施しなかったため（B-01/B-02 blocked）、変換対照表の作成対象は存在しない。REQ-046-005 は「ガードレール番号の変更に伴い」の条件付き要件であり、変更なき場合は保持すべき対照表もない。参考として、REQ-046-004 の検証可能側面の現状を以下に記録する（2026-08-22、17 コマンド抽出・突合スクリプトによる）。

- 定義の重複: 0 件
- 同一 command 内の不存在参照: 0 件
- 非 G01 開始または欠番: 14 ファイル（B-01 blocked のため再採番せず報告のみ）

## 5. 検査結果総括

| 検査 | 実施タイミング | 結果 |
|---|---|---|
| check_integrity.ts | 変更前 baseline / 変更後 | new unmanaged NG 25 → 9（残りは F-017×5、F-020×3 の NG と F-028×1 の WARNING。すべて blocked/対象外報告済み）。新規違反の混入なし（一時混入した DEC-003/DEC-017 具体参照は差分レビューで検出し修正済み） |
| check_extensions.ts | 変更後 | exit 0、strict failure 0 |
| check_command_format.ts | 変更後 | OK |
| check_distribution_boundary.ts --profile source | 変更後 | exit 0、failures 0 |
| bun test（repo-agentdev-integrity scripts 全 94 ファイル） | 変更後 | 2235 pass / 0 fail |
| check_changed_docs.ts --workflow case-run --base-ref origin/main | commit 後（PR 作成前） | PR 本文に記録 |
| generate_indexes.ts 再実行 | 変更後 | 冪等（no changes） |

## 6. 残存リスクと引継ぎ

- Wave 1 監査の取りこぼし（本 Issue で追加修正した doc-diagnostics/SKILL.md L22、repo SKILL.md L28）は監査網羅性の限界を示す。監査観点V1/V4 パターンの再スイープを #2372（回帰検査）の整備候補とする。
- vocabulary-registry の実在スキル表の網羅性（約50スキル中26語）は監査未指摘。intake 候補として PR に記録する。
- check_integrity.ts L8467 の整合 OK メッセージ中の `spec-health-metrics` 表記は blocked ファイル（B-05）内の残存のため本 Issue では修正していない。
