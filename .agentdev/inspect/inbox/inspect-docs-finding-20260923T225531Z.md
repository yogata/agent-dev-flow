# inspect-docs finding 20260923T225531Z

> 本ファイルは inspect-docs workflow（/agentdev/backlog-auto stage 1、2026-09-24 JST 実行）の検出事項である。後続の分類（promote / defer / reject）は /agentdev/inspect-promote の責務。
> 前回 stage 1 診断（20260923T050218Z）の検出事項 3件（README-1 / REQ-1 / GUIDE-1）は同日 promote 採用後に修正済みであることを本診断で再確認した（docs/README.md Decision 索引 DEC-041 同期済み、REQ-001 検証履歴コメント除去済み `grep "verified:"` 0件、req-case-flow.md 3フェーズ表が「準備・委譲・クリーンアップ」へ同期済み）。本ファイルでの再起票はしない。

## サマリ

- スキャン対象: docs/requirements/（現行 55 + retired 14 + README）、docs/decisions/（DEC 40 + README）、docs/designs/（175 md + README + 8 サブディレクトリ）、docs/guides/（13 md）、README.md（ルート + docs/README.md）、配布物（src/opencode/commands/agentdev/ + templates、src/opencode/skills/agentdev-*/ 実体。`.opencode/skills/agentdev-*` は symlink 投影）
- 新規検出事項: 2件（IR-055 関連参照のファントム REQ 行 1、superseded DEC-002 裸権威引用 1）
- high severity: 0件
- 既知 defer 継続事項の原状確認: 5件（F-04 / F-05 / GUIDE-6 / F-10 / F-12。新規起票せず）

## 検出事項リスト

### [REQ 構造] REQ-2: IR-055 の related_req アンカーが実在しない REQ 行 ID（REQ-002-079/080/081）を参照し、IR-067 の免除組合せで機械検出されない

- **category**: REQ 参照ID整合性（ファントム行参照）/ 検出盲点
- **target**: docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md（description「REQ-002-079/080/081 で既に要件化された」および related_req フィールド）、docs/designs/integrity/rule-ownership.md:165（IR-055 行の根拠 REQ 列、AUTOGEN ブロック L115-181 内の派生表）
- **evidence**: 現行 docs/requirements/REQ-002.md は REQ-002-048 までを採番し、REQ-002-079 / 080 / 081 の行は存在しない（REQ-002.md 全文 `grep -c` 0件、全 55 現行 REQ + retired 14 ファイルを走査する行 ID レジストリ突合でも行定義 0件。`git log -S "REQ-002-079" -- docs/requirements/REQ-002.md` も 0 件で、当該行 ID は少なくとも直近履歴の REQ-002 テーブルには存在しない）。一方 IR-055 ルールファイルの description・related_req、および rule-ownership.md L165 の IR-055 行はこの 3 行 ID を「配布物は導入先で解決可能な参照のみを含む」原則の要件化根拠として引用する。rule-ownership.md L165 は AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=rule-ownership-ir-crossref -->` L115 〜 `<!-- AUTOGEN:END -->` L181）内の派生表であり、IR-067（referenced-req-row-existence）は rules/IR-*.md 免除（`isIntegrityRuleDescriptionFile`）と AUTOGEN 行マスク（`buildAutogenLineMask`）の両方で当該箇所を検出対象外とするため、機械検査からも漏れる。ng-baseline（2026-09-17 消費後）に当該エントリは存在しない（同ファイルの REQ-002-044 ファントムは同日消費 c29f93dd で修正済みだが、IR-055 由来の 3 行 ID は当時から未修正のまま）
- **severity**: medium / **confidence**: high（ファントム参照の事実は全 REQ ファイル走査と現物 grep で一意に確認。原則の現行アンカー候補は REQ-002-027「配布成果物が実行時依存として使用するパスは、導入先環境で解決可能であること」等が近接するが、対応関係の確定は req-define 側の判断）
- **source_of_truth**: REQ-002（実在行集合）・REQ-010-069（IR-067 検出契約）を正とし、実在しない行 ID への根拠参照を検出事項とする
- **recommended_route**: IR-055 ルールファイルの related_req・description の参照先を実在 REQ 行へ再アンカー（req-define で対応行を確定）し、rule-ownership.md の AUTOGEN 派生表を再生成 → /agentdev/inspect-promote → /agentdev/backlog-review。IR-055 baseline 運用（2026-09-24 commit 610fafd5 で run3 分を登録済み）は本件の参照先確定に影響しないが、baseline の要件根拠記述が当該 3 行 ID に依存する点は後続 Case での確認を推奨
- **ng_classification**: pre-existing（IR-055 新設 commit 5111aac3 2026-08-20 由来の参照が、REQ-002 再構築後も更新されず残置。2026-09-01 以降の inspect サイクルで未検出。rules/IR-*.md 免除と AUTOGEN 免除の組合せにより docs-check でも検出されない盲点）
- **notes**: 前回までの診断（20260914・20260923 とも「dangling 参照 0件」判定）との差は、rules/ 配下 IR ルールファイルの related_req を免除慣行で除外し、AUTOGEN 派生表を機械生成領域として扱ったことに起因すると推定する。本検出は「免除領域の生成元（IR frontmatter）側でファントムが蓄積する」という検出構造上の盲点を含むため、docs-check route 候補 #1（下表）を併記する

### [文書種別] DESIGN-4: superseded DEC-002 が現行 Design 本文で権威引用として残留（DEC-036 supersede 後の参照未更新）

- **category**: Decision 状態乖離 DRIFT / 廃止成果物参照残置
- **target**: 4箇所 — docs/designs/foundations/document-model.md:375、docs/designs/authoring/vocabulary-registry.md:28、docs/designs/local/runtime-package-boundary.md:271、docs/designs/workflows/workflow-skill-model.md:102
- **evidence**: DEC-002（OpenCode ソース・プロジェクション分離）は 2026-09-20 第11段実行で DEC-036 により superseded（docs/decisions/DEC-036.md frontmatter relations「supersedes: DEC-002、reason: OpenCode ソース・プロジェクション分離の v4 再定義（配備形態として adapter 境界へ統合）を本 Decision の Harness/Backend adapter 境界が所有する」、docs/designs/foundations/references/crosswalk-inventory.md の executed 記録、docs/README.md:82 の superseded 7件列挙に DEC-002 含む）。一方、上記 4箇所は source・projection 原則の現行根拠として `（DEC-002）` を裸権威引用し、superseded 注記も後継 Decision 参照もない。document-model.md と vocabulary-registry.md はファイル内に DEC-036 言及が 0件。runtime-package-boundary.md は L458 で DEC-036（v4 Harness/Backend adapter 境界）に言及しつつ L271 では DEC-002 引用のまま。workflow-skill-model.md:102 は「（REQ-002-007、DEC-002）」と現行 REQ 行と併記
- **判定の境界**: docs/designs/foundations/harness-separation-model.md:150 の「関連」節 bullet（DEC-002 を関係宣言として列挙）は relates-to 宣言として適正と判断し対象外とする。docs/decisions/ 配下の superseded 同士の参照（supersedes / target / 履歴・crosswalk 記録）も適正。docs/requirements REQ 側の superseded DEC 言及は前回 20260923 診断どおり注記付き意図的記述のみで本件とは別
- **severity**: low / **confidence**: medium（引用先 Decision の状態乖離は事実だが、DEC-036 が原則の現行所有とみなす解釈と、DEC-002 起源の原則として歴史的出典引用を許容する解釈の余地が残る。修正様式（参照更新か注記追記か）は意味判断）
- **source_of_truth**: DEC-036（accepted、supersedes DEC-002）> DEC-002（superseded）の source-of-truth priority に従い、現行規範の根拠引用を乖離候補と判定する
- **recommended_route**: 4箇所の `（DEC-002）` 権威引用を DEC-036 参照への更新または superseded 注記の付記へ同期（案: 「（DEC-002、現行は DEC-036）」等の縮約注記）→ /agentdev/inspect-promote → /agentdev/backlog-review
- **ng_classification**: pre-existing（DEC-002 supersession 実行 2026-09-20（第11段）由来。2026-09-22 / 09-23 の inspect サイクルの superseded 参照スキャンは REQ 側の注記付き記述確認にとどまり、Design 側の裸権威引用は未検出のまま残置）
- **notes**: 原則自体（原本 `src/opencode/`、投影 `.opencode/`）は現行も有効（REQ-002-007/008、workflow-skill-model 本文）であり、本指摘は参照先 Decision の状態乖離のみ。req-define入力案「superseded DEC-002 を権威引用する Design 4箇所を DEC-036 ベースの参照へ同期する」

## 既知 defer 継続事項（原状継続を確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-04 (0914) | REQ-038-006 に内部アルゴリズム（2フェーズ読込）が要件行の主内容に混入（MOVE） | 原状継続（docs/requirements/REQ-038.md:25 に「インデックススキャンと候補絞り込みによる2フェーズ読込」「全面読みフォールバック」残存を現物行読取で確認） |
| F-05 (0914) | REQ-050-016 が REQ-050 適用範囲外関心かつ実装パラメータ（350 字 × 50 件相当）を含む（SPLIT） | 原状継続（docs/requirements/REQ-050.md:36 に「350 字 × 50 件相当」「lint_skills 検査契約（warning 発出）」残存を現物行読取で確認） |
| GUIDE-6 (0914) | artifacts-and-state.md 状態モデル制約節の「frontmatter や status フィールドによる状態管理は行わず」が Design/Decision の frontmatter status 管理と冲突（要文脈判断） | 原状継続（docs/guides/artifacts-and-state.md L145-153 の状態モデル制約節を現物読取で確認。L148「REQ / Design の状態管理は Issue ラベル、GitHub Project で行う」・L150 該当表現とも変化なし） |
| F-10 (0901) | 検証実行結果を TIM に保存しない規範が REQ-012/REQ-021 に二重規定（DUPLICATE 軽度） | 原状継続（docs/requirements/REQ-012.md:32 REQ-012-035・docs/requirements/REQ-021.md:28 REQ-021-019 とも現物行読取で確認。行番号は 2026-09-21 以降の審議記録と一致） |
| F-12 (0901) | REQ-008-059 が要件テーブル外の見出しセクションとして定義され fixture 列挙を含む（MOVE） | 原状継続（docs/requirements/REQ-008.md L80「### REQ-008-059: 未確定内容の auto_ready 抑止」見出しセクション、"TBD"/"TODO"/"未定" 等 fixture 列挙と auto_gate.stop_reasons 記録契約の残留を現物読取で確認） |

## 推奨アクション

- REQ-2: IR-055 の related_req 再アンカー（実在 REQ 行の確定を伴うため req-define 経由候補。promote または defer は inspect-promote の判断）
- DESIGN-4: DEC-002 権威引用 4箇所の同期（low・pre-existing。注記追加と参照更新の様式判断を含むため HITL 判断候補）

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | IR ルールファイル frontmatter related_req の実在性検査: `docs/designs/integrity/rules/IR-*.md` の related_req ID 集合に対して REQ 行実在突合を行う（IR-067 の rules/ 免除・AUTOGEN 免除は検出対象を生成元側で検査する構造で補完） | REQ-2。related_req 抽出は frontmatter 形式が安定しており機械化可能。related_design 等の他フィールドへの拡張余地あり | ○（新規 IR 候補。IR-055 自身の検出契約と冗長しない範囲で） |
| 2 | superseded Decision 裸権威引用検出: superseded DEC 集合を frontmatter から抽出し、docs Design 本文の `（DEC-NNN）` 形式出現のうち superseded 注記・後継参照を伴わないものを heuristic 検出 | DESIGN-4。DEC status 抽出とパターン突合は機械可能、注記有無の文脈判定に意味境界あり（harness-separation-model.md:150 の関係宣言を除外する必要） | △（半機械。除外条件の設計を要する） |

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: 上記 REQ-2（rule-ownership / IR-055 由来）を除き、docs 全体の REQ 行参照 dangling は 0件（全 55 現行 + 14 retired REQ の行 ID レジストリ × docs/・README・配布物の REQ-NNN-NNN 出现全件突合）。docs/requirements/README.md L98-100 の REQ-063〜081（意図的予約欠番）・REQ-084〜086（返却枠）・REQ-089（J2 shadow 廃止識別子）は欠番レジストリ記録どおりの意図的記述。DEC-018 は DEC-018 物理削除の証跡記録（crosswalk・reports）内のみで適正
- ADF-COVERS 宣言: docs/ + README + 配布物の全 ADF-COVERS(implementation) 宣言 45 箇所超について、参照先 REQ ファイル実在と行 ID 実在の突合で不整合 0件
- 第一参照導線: ルート README の ADF-COVERS（REQ-050-014、REQ-005-010）とも実在行。requirements/README（現行 55件）× docs/README（現行 REQ: 55件、現行 Decision: DEC-001 から DEC-041 の40件）× 実ファイル数（55 + retired 14 / DEC 40）完全一致
- 現行/廃止/世代境界: retired 14件と README 廃止表の突合一致。superseded DEC（DEC-002/005/007/015/017/029/030、accepted 33 / superseded 7 / proposed 0）は decisions/README の baseline table・ステータスビュー・frontmatter 全件一致（mismatch 0）
- 6観点: SPLIT / MERGE / RETIRE / DUPLICATE の新規指摘 0件（REQ-091・REQ-092 は目的・適用範囲で所有境界を明示し重複なし）。REQ-092 の MOVE/DRIFT 候補も確認せず（3行とも運用文書への明記義務の要件化として成立）
- 文書分類一貫性（新設 REQ）: REQ-091（supervisor-credential-bridge、2026-09-23 新設）・REQ-092（issue_list 運用規律、2026-09-24 新設）とも、要件テーブル内に内部アルゴリズム・fixture・regex・テスト構造の残留なし。REQ-091 が要求する導入ガイド（docs/guides/supervisor-credential-bridge.md、guides/README.md:44・docs/README.md:241 索引反映済み）と知識文書（docs/knowledge/supervisor-bridge-credential-supply.md、knowledge README 列挙済み）は実在し DRIFT なし
- Design 意味診断: Design frontmatter status は accepted 174 / draft 0 / 欠落 1（crosswalk-inventory.md、references/ 配下で IR-070 exempt 規定該当の既知判定を踏襲）。draft Design の放置 0件。DEC-041 由来 Wave 記述の同期（case-run Design・workflow-case-run SKILL）は前回確認どおり維持
- guides 意味診断: 履歴混入（更新履歴節）0件（diagnostics-and-maintenance.md の「履歴」ヒットは廃止 Decision 履歴参照の扱いを規定する規約本文で誤検出）。navigation 層の範囲超過 0件。req-case-flow.md の case-run 3フェーズ表は正規フェーズ名（準備・委譲・クリーンアップ）へ同期済み
- README 索引診断: ルート README の配布コマンド一覧 13/13 実在突合一致、command files ↔ README 相互突合差分 0、リンク解決 ✓
- 配布物 構文健全性: UTF-8 BOM 0、CRLF/LF 混在 0（authored 分。node_modules 配下 @types/bun README 4件の混在は vendored 依存で false positive、前回分類踏襲）、frontmatter 重複 0（frontmatter 閉止後の `---` 水平線 6件は構文上正常）、Markdown 構文破損 0、制御文字 0、存在しない command 参照 0（`/agentdev/templates` は templates ディレクトリ実在パス参照で regex 過剰捕捉の false positive、前回分類踏襲）。見出し重複は正規構造（節反復）のみ
- 配布物 プロジェクション整合: src/opencode/commands/agentdev ↔ .opencode/commands/agentdev の内容差分 0（diff -rq）。`.opencode/skills/agentdev-*` は symlink 投影で broken link 0
- 配布物 文意保持・責務整合: inspect-docs command Design と本 workflow 実行手順の契約一致を含め、前回までの一致判定に変化を起こす変更なし

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 7件（2026-09-23 jev-observation-write-target-resolves-main、2026-09-24 agentdev-gh-issue-list-search-page-limit〔未コミット新規〕、2026-09-24 agentdev-jev-observation-loss、2026-09-24 case-close-3084-checker-header-comment-stale-wording、2026-09-24 case-close-3085-ir055-remaining-warnings、2026-09-24 case-ready-3089-pr-branch-stacking、2026-09-24 req-031-001-phase-name-desync）。intake-promote 待ち
- `.agentdev/intake/promoted/`: 空
- `.agentdev/learning/inbox.md`: 未整理エントリ存在（310行）。learning-promote 待ち
- `.agentdev/learning/deferred.md`・`evaluation-report.md`: 存在
- `.agentdev/backlog/req-units/`: RU 2件（RU-0120、RU-0121）。req-define 待ち
- `.agentdev/drafts/`: 空
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901/20260914、分類確定済みの意図的残置）+ 本ファイル
- `.agentdev/inspect/promoted/`: 空
- `.agentdev/jev-observations/`: 31 JSON（REQ-090-006 の設計どおり永続管理対象。処理待ちではない）

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤 `agentdev-textlint-guard` 管轄）
- 検出事項の分類・採用（inspect-promote の責務）、intake/learning/RU の処理（後段 workflow の責務）
- GitHub Issue/PR、worktree、branch の作成（ガードレール）
- 未コミットの intake item・`.local/` の内容診断（存在報告のみ）

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-24 JST。対象: docs 4種別 + README 群 + 配布物（REQ 55+14 全行レジストリ突合、DEC 40 frontmatter 突合、Design 175 md status 走査、guides 13 md、配布物 authored md 全件機械走査、ADF-COVERS 全件突合）
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（行 ID レジストリ、frontmatter 抽出、BOM/CRLF/制御文字、frontmatter fence、command 参照突合、見出し重複、git log -S による採番履歴確認）・`git show` による前回 finding（20260923T050218Z）の参照
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
