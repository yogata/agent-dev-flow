# inspect-docs finding 20260920T105602Z

> 診断実行: `/agentdev/inspect-docs`（backlog-auto stage 1）2026-09-20。対象は v4.0.0-rc.1 cutover 後の main（HEAD `d632c126`、v4 コードパス）であり、cutover 後初の inspect-docs である。
> 実行環境: main repo（worktree なし・branch main）。read-only-diagnostic 型（検査対象の変更なし）。

## サマリ

- スキャン対象: 現行 REQ 55ファイル（id 実在 54 + README）/ retired REQ 12 / Decision 39 / Design 175（accepted 173・draft 0・no-status 2 は索引と inventory 参照）/ guides 12 / reports 40 / README / 配布物（commands 34・skills 実体 209 md、agentdev-* projection junction 経由）/ `.agentdev/extensions` 28 / `.opencode` projection
- 機械検査 baseline 対比（@`d632c126` 実測）: **全項目 baseline 不変・新規違反 0**
  - check_integrity: ok 791 / ng 54（全て LinkIntegrity broken-file-link）/ warning 8 / info 109 = baseline 完全一致（NG baseline 適用後の delta は ng 54 + warning 8 = 62 で構成不変）
  - traceability: missing-design 942 / missing-implementation 111 / missing-verification 0 / policy-invalid 0 = baseline「942/111/0/0」完全一致（pass 7 / fail 2・exit 2 は既知状態）
  - autogen 鮮度違反 0 / distribution failures 0 / extensions failures 0（migration 0・schema violation 0・malformed 0）/ lint_skills NG 1〔agentdev-workflow-case-open description 629>600〕+ WARNING 1〔aggregate budget〕= baseline 一致 / check_command_format OK / check_templates 全カテゴリ 0 違反 / check_content_corruption violations 0 / check_knowledge_docs exit 0
- 検出事項: **2件**（新規 2・high severity 0・medium 1・low 1）+ 解消確認 3件 + defer 状態変化の観察 1件
- 既存 4 件（20260901/09-07/09-14/09-17）の inbox 残置分は本工程では触れない（stage 2 inspect-promote 責務）

## 検出事項リスト

### F-1: REQ-057（docs corpus 整合・現行化バッチ）の RETIRE 評価条件が充足された

- **id**: REQ57-RETIRE-1
- **category**: RETIRE（REQ structure review 6観点・移行完了状態の恒久 REQ 化。既存 defer F-11(0901)/F-04(0907)/REQ57-1(0917) 系統の再評価条件変化）
- **target**: `docs/requirements/REQ-057.md`（要件テーブル全体、REQ-057-001〜036）
- **evidence**:
  - F-04(0907) の再評価条件「Epic #2506/#2633 系 case-close」が充足: Epic #2504（REQ-057 Epic A、子 #2506〜#2513 の8件）closed・全 completed、Epic #2505（REQ-057 Epic B、子 #2514〜#2521 の8件）closed・全 completed、Epic #2633（learning 由来配布物反映、子 #2634〜#2642 の9件）closed・全 completed、#2506 単体も closed（完了条件チェックボックス全て [x]）
  - さらに v4.0.0-rc.1 cutover（`4136b838`、312 files 統合）と self-hosting pilot migration（#3040、Evidence レポート `docs/reports/pilot/v4-rc1-pilot-migration-20260920.md`）が完了しており、REQ-057 が対象とした一回きり整合バッチの実行環境は終息済み
  - REQ-057 の要件行（REQ-057-001〜036）は現行 corpus に残存したまま（REQ-057-031 の provenance・commit hash 記載等、REQ57-1(0917) 指摘箇所も原状）
- **severity**: medium
- **confidence**: high（Issue 状態・マージ commit の機械的確認。REQ ファイル単位近似ではなく Case 完了状態の取得源に基づく）
- **source_of_truth**: REQ-001 の廃止候補類型「移行完了状態」。現行 REQ > Decision > Design の矛盾ではなく、REQ 体系の構造判断（RETIRE 審査の実施要求）
- **recommended_route**: `inspect-promote` → `backlog-review`。既存 defer F-11(20260901)・F-04(20260907)・REQ57-1(20260917) を統合し、REQ-057 の RETIRE 審査（同型群 REQ-016/REQ-045/REQ-046 との一括整理候補を含む）を実施する
- **ng_classification**: pre-existing（defer 継続案件の再評価条件変化。現時点で不正状態ではない）
- **notes**: RETIRE 判断時は行単位の恒常契約の移管先確認を含むこと（REQ-057-022 の「delegation-contracts 経路」行内言及は `docs/designs/workflows/v4-delegation-contracts.md:19` の旧称対応注記が歴史言及として許容する対象。REQ-057-028/030/034 の traceability sidecar 移行契約は後続 REQ への移管候補）。

### F-2: DEC-008 副次 Design 列挙が旧パス `workflows/delegation-contracts.md` のまま残存

- **id**: DEC8-DRIFT-1
- **category**: 横断契約矛盾（DRIFT: v4 cutover 由来の現行化漏れ）
- **target**: `docs/decisions/DEC-008.md:55`
- **evidence**:
  - 「副次 Design: docs/designs/commands/case-auto.md、docs/designs/workflows/delegation-contracts.md、docs/designs/workflows/v4-lifecycle-state-machine.md…」— `workflows/delegation-contracts.md` は第8段（2026-09-20）で `workflows/v4-delegation-contracts.md` へ集約 supersede 済み（旧ファイルは物理削除）
  - Decision 全 39 ファイルの機械走査で、v4 接頭辞なしの旧パス `workflows/delegation-contracts.md` を現行参照（関連 Design 列挙）として保持するのは本行のみ（他は crosswalk-inventory の移行記録・reports の歴史記録で対象外）
- **severity**: low
- **confidence**: high（旧パス列挙は機械的に一意判定可能）
- **source_of_truth**: 現行 Design 配置（`docs/designs/workflows/v4-delegation-contracts.md`、status: accepted、created 2026-09-20）。Design 配置を正とし、Decision 側の旧パス記述を検出事項とする
- **recommended_route**: `inspect-promote` → `backlog-review`。パスを `workflows/v4-delegation-contracts.md` へ更新（軽微な docs 整理）
- **ng_classification**: 今回修正対象（v4 cutover `4136b838`・第8段の更新漏れ）
- **notes**: `v4-delegation-contracts.md:19` の旧称対応注記は REQ-057-022 等の行内言及を歴史言及として許容するが、DEC-008 の「関連する決定」節は現行の関連性を示す参照として機能するため更新が望ましい。文書品質の局所的破綻のため severity low。

## 解消確認（既存 defer 検出事項の変化。stage 2 での分類情報）

### R-1: GUIDE-8（20260914）は v4 形式へ更新済み

- `docs/guides/command-selection.md` 入口表が全面更新され、L13 は「`/agentdev/case-auto`（内部 lifecycle の case-open 段階）」表記（`docs/guides/command-selection.md:13`）。旧 `/agentdev/case-open` 直接コマンド参照・旧責務表現は消滅。L12/L13 の状態行の近似は残るが選択補助として機能し、指摘の本体（旧コマンド参照・#2808 当時の旧責務出力）は解消。stage 2 で reject（解消確認）候補。

### R-2: F-27（20260901）は正本集約により解消

- `docs/guides/artifacts-and-state.md` から参照方向ルール（「Decision → Issue の逆参照は不可」「文書間矛盾時は REQ を優先」）の記述が削除され、L17 が「参照ルールの正は project-docs-and-specs.md を参照する」へ変更。参照方向ルールは `docs/guides/project-docs-and-specs.md:88-89` に集約され、guides 間の正本分岐は解消。stage 2 で reject（解消確認）候補。

### R-3: F-34（20260901）は対象ファイルの消滅により解消

- 検出対象 `agentdev-doc-writing` スキルが v4 で削除され、`src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md` は不存在（実在確認済み）。source_note 参照先不在の指摘は対象自体の消滅により意味を失った。stage 2 で reject（対象消滅）候補。

## defer 状態変化の観察（OBS-1: F-05 (20260914) 再評価条件）

- lint_skills description 長: 2026-09-18 の learning 記録時点では NG 2件（case-ready 743 chars・case-revise 663 chars）+ aggregate budget warning だったが、今回実測では NG 1件（agentdev-workflow-case-open 629 chars）のみ。case-ready/case-revise は短縮済み。
- aggregate budget warning は継続（total 17886 chars / N=49 / avg 365 > 350×49=17150）。
- 再評価条件とされた learning 成果物 `design-candidate-autogen-staleness-prevention` は `.agentdev/` 全域・`docs/knowledge/` ともに不在（backlog-review での RU 化・消費済みと推定。RU・promoted は空）。恒久対策は `docs/designs/integrity/index-auto-generation.md`・`check_autogen_freshness`（鮮度違反 0）として稼働中。
- REQ-050-016 の行は原状（`docs/requirements/REQ-050.md:36`、「350 字 × 50 件相当」の内部数値も残存。現行スキル数 49 との軽微なずれを含む）。SPLIT 採否の意味判断は不変のため **F-05 は defer 継続**。本観察は次回再評価の入力情報。

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 3 item（2026-09-18 checker-execution-contracts frontmatter updated key 欠落、2026-09-20 DEC-012 relations/decision-map 反映タイミング、2026-09-20 Decision 承認記録の stale proposed 表現）
- `.agentdev/intake/promoted/`: 1 item（2026-09-16 req-017-020-harness-delegation-followup、backlog-review 待ち）
- `.agentdev/learning/inbox.md`: 未整理エントリ 23 件（learning-promote 待ち）
- `.agentdev/inspect/inbox/`: 既存 4 ファイル（20260901/09-07/09-14/09-17、分類確定済み defer 残置・stage 2 待ち）
- `.agentdev/backlog/req-units/`: 空、`.agentdev/drafts/`: 空、`.agentdev/learning/promoted/`: 空

## 推奨アクション

- F-1（REQ-057 RETIRE）: inspect-promote で採用を検討し、backlog-review で F-11(0901)/F-04(0907)/REQ57-1(0917) を統合した RETIRE 審査へ昇格する。REQ-016/045/046 の同型群整理を同時に検討できる。req-define入力案: 「REQ-057（docs corpus 整合・現行化バッチ）の RETIRE と、恒常契約行（traceability sidecar 移行等）の後続 REQ への移管」
- F-2（DEC-008 旧パス）: 軽微な docs 修正として req-define → case-auto 経由で対応可能（1行パス更新）。docs-check route 化は不要（単発の更新漏れ）
- R-1〜R-3: stage 2 inspect-promote での reject（解消/対象消滅）判断材料
- OBS-1: F-05 の defer 継続。次回再評価時に本観察（lint NG 1件化・learning 成果物の消費）を参照

## 対象外（Out of Scope）

- 既存 4 件の inbox 残置分の処分（stage 2 inspect-promote 責務）
- docs 表層品質（textlint 共通基盤管轄）
- Command/Skill 参照妥当性・Skill 構造の詳細診断（`/agentdev/inspect-skills` の独立対象）
- vendored `node_modules` 配下（`.opencode/skills/*/scripts/node_modules/`、git 管理対象外。@types/bun README 4件の CRLF/LF 混在は 20260907 対象外判定どおり除外）
- 配布コマンド README「廃止コマンドの移行案内」節の旧コマンド名（case-open 等 5 件）: 意図的な移行案内セクションであり、docs-spec-rebuild-integrity Design の「存在しない command 参照」検出の対象（README listing と command 本文の相互参照）には該当しない（listing テーブル 13 コマンドは全て実在、配布 skills 内の旧コマンド参照は zero hit を確認済み）
- frontmatter 例示・エラーテンプレート内見出し等のコードブロック内 `---`/見出し（`agentdev-command-authoring/SKILL.md`、`agentdev-skill-authoring/references/development-workflow.md`、`templates/common/git-error-messages.md`、`agentdev-learning-capture/references/example.md` の各例示は false positive と確認済み）
- REQ-057-031/036 の作業履歴・書式詳細（REQ57-1(0917) defer 残置どおり、F-1 の RETIRE 審査に統合して再評価）
- `docs/reports/` 配下の監査レポートに含まれる旧パス記載（凍結監査記録。20260907 対象外判定どおり）

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: check_integrity REQ frontmatter-filename 110 ok / ng 0、ReferencePath 457 ok、traceability unknown-req-refs pass
- 第一参照導線: requirements/README・docs/README・designs/README・decisions/README の AUTOGEN 索引と実体が一致（autogen 鮮度違反 0・IR-039/IR-061/IR-038 ok）
- 現行/廃止/世代境界: retired 12 件の二重存在なし・retired README カバレッジ ok（IR-003/IR-043）。活性文書中の retired REQ ID 言及は全て履歴文脈（関連 REQ 行の廃止明記・retired テーブル・DEC related_reqs）
- v4 移行由来の旧 Design 名参照（第5/8/9段の物理削除分）: 活性 docs 中の `epic-wave-model.md`/`backlog-artifact-lifecycle.md`/`delegation-contracts.md` 言及は crosswalk-inventory の移行記録（全データ行 executed・131 行）と reports の歴史記録、および現行 `v4-delegation-contracts.md` の部分一致のみ。DEC-008:55（F-2）のみ例外
- Design 状態乖離 DRIFT: draft Design 0 件（accepted 173・no-status 2 は designs/README.md 索引と crosswalk-inventory 参照）→ 検出なし
- Decision 状態乖離 DRIFT: proposed Decision 0 件 → 検出なし
- REQ 要件行の Design 分離基準シグナル横断スキャン: 新規違反なし（REQ-001-032/067 は政策行、REQ-008-048 は契約構成要素の定義、REQ-057-031 は既知 defer）
- 配布物構文健全性（5パターン）: frontmatter 重複 0（コード例示除く）・見出し重複 0（テンプレート内文字列除く）・Markdown 構文破損 0（フェンス奇数ファイル 0）・存在しない command 参照 0（listing 突合）・エンコーディング不整合 0（BOM 0・CRLF/LF 混在 0、node_modules 除外）
- 配布物 ID 汚染: REQ-/ADR-/SPEC-/IR- 系 ID のコードブロック外出現 0（src 配布物 209 md 走査）
- 配布物 文意保持: 壊れた括弧・参照残骸 0（診断パターン例示行・node_modules は false positive 確認済み）
- 配布物 責務整合: 2入口モデル（req-define・backlog-auto 要求入口 → case-auto 標準実行、case-* 内部 lifecycle 化）の記述が README・commands README・guides・commands Design・skills 間で一致（GUIDE-8 も解消確認）
- MERGE/DUPLICATE/SPLIT: 前回判定を覆す新規シグナルなし（F-05 (0914) は OBS-1 どおり defer 継続、F-10 原状）
- crosswalk-inventory: 全データ行 executed（ヘッダ行を除き executed 未満行 0）

## 参照

- 診断実行: `/agentdev/backlog-auto`（stage 1）2026-09-20
- 権威情報源: `agentdev-workflow-inspect-docs`（STEP-1〜4）、`agentdev-req-structure-diagnostics`、`agentdev-doc-diagnostics`（finding-output-contract・diagnostic-categories・diagnostic-routing）、document-model Design・docs-spec-rebuild-integrity Design（extension 経由）
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（配布物エンコーディング/構文/ID パターン/コマンド参照突合、Design/Decision frontmatter status 収集、retired ID・旧 Design 名横断検索、フェンス対応、crosswalk 全行確認）、GitHub Issue 状態読取（agentdev_gh）
- baseline 対比: CONTEXT 記載の @`d632c126` 実測値と今回実測の全項目一致を確認（差分 0）
- 後続: `/agentdev/inspect-promote` での分類（promote / defer / reject）
