# inspect-docs finding 20260922T102316Z

> 本ファイルは /agentdev/backlog-auto（stage 1）として実行した inspect-docs workflow（2026-09-22、run2 revert `fea22bf4` 後の v4.0.3 clean baseline から再実行）の検出事項である。後続の分類（promote / defer / reject）は /agentdev/inspect-promote の責務であり、本ファイルは分類を行わない。

## サマリ

- スキャン対象: 現行 REQ 53件（+README）、retired REQ 14件、Decision 39件（+README）、Design 175件（+README）、guides 12件、ルート README・docs/README、配布物 221ファイル（src/opencode/commands+skills、.opencode/commands+skills の agentdev-* 系。node_modules・repo-local は対象外）
- 各カテゴリの検出件数: 新規検出事項 0件 / run2 由来検出事項の残存再掲 1件（DIST-1、内容同一・未修正）/ 既知 defer 残置の原状継続確認 5件 / クリーン判定 各観点
- high severity の件数: 0件

## 検出事項リスト

### DIST-1: pr_desc.md の verify-only 根拠欄に Design 名への壊れた相対リンク 2件（run2 からの残存・未修正）

- **category**: 配布物統合性（文意保持・壊れた参照表現/リンク切れ。docs-spec-rebuild-integrity Design 5パターン準拠）
- **target**: src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md:39
- **evidence**: 前回（20260922T051848Z）と同一の壊れたリンクが残存: `[case-run.md](../../../../../case-run Design)「verify-only 根拠欄の記入規則」`、`[case-close.md](../../../../../case-close Design)「verification-only PR の files_checked 空確認」`。リンクターゲット `../../../../../case-run Design`・`../../../../../case-close Design` は実在ファイルに解決しない（スペースを含む非パス文字列）。正しい参照先は `docs/designs/commands/case-run.md`・`docs/designs/commands/case-close.md`。run2 検出以降の当該行は変更なし（git diff cd193ff6..HEAD で当該ファイル非変更を確認）
- **severity**: medium（HTML comment 内の案内文の参照切れで、PR 本文出力への直接影響はないが配布物テンプレートの参照破綻）
- **confidence**: high（機械的に一意判定: ターゲット非実在）
- **source_of_truth**: docs-spec-rebuild-integrity Design（配布物の文意保持・壊れた参照表現検査）を正とし、テンプレート側の壊れたリンクを検出事項とする
- **recommended_route**: 修正（case-run Design / case-close Design の正しい相対パスへの張替え、またはリンクでない Design 名言及への変更）。inspect-promote → backlog-review
- **ng_classification**: pre-existing（run2 20260922T051848Z DIST-1 で検出済み・未修正の残存。導入自体は 2026-09-19 `3801398d`。run2 の分類は「今回修正対象」だったが、run3 基準 `fea22bf4` 以降の変更では導入・残存していないため本診断では pre-existing として記録。最終分類は inspect-promote の責務）
- **notes**: run2（20260922T051848Z）由来の同一検出事項。タスク指示に従い、内容同一であることを明記して再掲載する（新規検出ではない）

## 既知 defer 残置分の原状継続確認（重複のため新規起票せず）

前回までの inspect-promote で defer 確定済みの検出事項のうち、本診断で対象行の実読・grep 突合により原状継続を確認したもの。採否の意味判断条件に変化がないため新規起票せず、既存 inbox 残置ファイルの契約（defer 継続・次回再評価）に従う。

| defer ID | 対象 | 本診断での確認 |
|---|---|---|
| F-04 (20260914) | REQ-038-006 内部アルゴリズム（2フェーズ読込）混入（MOVE） | 原状（docs/requirements/REQ-038.md:25、内容不変） |
| F-05 (20260914) | REQ-050-016 SPLIT 候補＋予算数値残留 | 原状（docs/requirements/REQ-050.md:36、「350 字 × 50 件相当」残存） |
| F-10 (20260901) | 検証実行結果非保存の REQ-012/REQ-021 二重規定（DUPLICATE 軽度） | 原状（REQ-012.md:32 REQ-012-035、REQ-021.md:28 REQ-021-019） |
| F-12 (20260901) | REQ-008-059 テーブル外見出し＋fixture 列挙（MOVE） | 原状（docs/requirements/REQ-008.md:78-85） |
| GUIDE-6 (20260914) | artifacts-and-state.md 状態モデル制約節の frontmatter status 一般化（横断契約矛盾） | 原状（docs/guides/artifacts-and-state.md L145-153、当該節への変更なし） |

## クリーン判定（問題なしと確認した観点）

- **REQ 参照ID整合性**: クリーン（現行 53件・retired 14件の id↔ファイル名不一致 0件、二重存在 0件。裸4桁参照は意図的例示 4件のみ: REQ-0164「存在しないこと」例示 3件（agentdev-req-analysis.md:102/109、agentdev-workflow-templates.md:124）、REQ-0011 4桁混在テスト入力例示 1件（agentdev-req-file-manager.md:74）。いずれも false positive）
- **第一参照導線**: クリーン（requirements/README.md 現行表 53件・retired 表 14件が実ファイルと完全一致、docs/README.md 件数記述「53件/14件」一致、Decision 索引 39件一致。ルート README・docs/README・guides/README のリンク切れ 0件）
- **現行/廃止/世代境界**: クリーン（retired 14件が廃止表と一致、現行/廃止の二重存在 0件。requirements/README「過去版との関係」の `v2:REQ-01XX` 規約に整合し、`v2:` プレフィックス付き旧4桁参照は正規形式。docs/reports/ 配下の旧番号参照は履歴領域で対象外）
- **Design 意味診断 / Design 状態乖離 DRIFT**: クリーン（draft Design 0件、accepted 174件、status なし 2件は run2 同様に references データ（crosswalk-inventory.md）と README で DRIFT 対象外・異常なし。run2 以降の Design 変更は req-health-metrics.md のみ（REQ-090 行数 10→11 への追随更新、REQ-090-011 追加と整合し妥当））
- **Decision 意味診断 / Decision 状態乖離 DRIFT**: クリーン（proposed 0件、accepted 32件 + superseded 7件 = 39件で README・docs/README 記述と完全一致。DEC-018 欠番整合）
- **REQ structure review（6観点）**: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT とも新規検出 0件（既知 defer F-04/F-05/F-10/F-12 の原状確認のみ。run2 以降の REQ 本文変更は REQ-090-011 追加のみで、既存要件行は不変）
- **文書分類一貫性（Design分離基準違反）**: 新規 violation なし。REQ-090-011 の schema field 名言及（`questions[].score.criteria`）は外部 gateway 接続契約の要約＋詳細値例示であり、REQ-090 の主題自体が adapter 接続契約であるため安定契約例外候補（観察メモ止まり。主文意は criteria 構成・テスト義務・実呼出し検証義務の契約）
- **guides 意味診断**: クリーン（run2 以降 guides 配下の変更なし。GUIDE-6 原状のほか新規なし、履歴混入なし）
- **README 索引診断**: クリーン（ルート README・docs/README の導線範囲超過なし）
- **横断契約矛盾**: クリーン（REQ-090-011 追加に対する追随更新は req-health-metrics.md の REQ-090 行数更新と custom-tool-contracts.md の ADF-COVERS(design) への REQ-090-011 追加で、いずれも REQ-090-011 内容と整合。不整合なし）
- **配布物 構文健全性**: クリーン（221ファイル全走査: UTF-8 BOM 0、CRLF/LF 混在 0、フェンス対応破損 0、frontmatter 重複検出 4件はすべてコードフェンス内の frontmatter 形式例示による誤検出、見出し重複検出 2件もコードフェンス内エラーメッセージ例示（git-error-messages.md）と意図的な例示コレクション構造（learning-capture example.md）による誤検出、存在しない command 参照 0件）
- **配布物 ID 汚染**: クリーン（src 配布物 agentdev-* 系で REQ-\d{4}/ADR-\d{4}/SPEC/IR パターン 0件。`.opencode/skills/repo-agentdev-integrity/` の REQ-01XX 系参照は repo-local skill（配布対象外）であり検査対象外）
- **配布物 文意保持**: 壊れた括弧 0（機械検出の大量ヒットはプレースホルダ変数を含む括弧の code span 除去由来の誤検出のみ）、壊れた参照表現は DIST-1 のみ、主語/目的語欠落文 0。相対リンク実在検査の検出はテンプレート変数プレースホルダ（`{pr_url}`、`URL`）のみで false positive
- **配布物 責務整合**: クリーン（run2 以降の配布物 Markdown 変更なし。case-open/run/close/auto の責務境界は run2 時点から不変）

## 推奨アクション

- DIST-1: run2 finding（20260922T051848Z）と同一内容のため、重複処理（本ファイルを reject し run2 分に集約するか、本ファイルで分類続行するか）を inspect-promote で判断。修正内容自体は run2 の recommended_route と同一（正しい Design パスへの張替え、またはリンクでない Design 名言及への変更）
- 既知 defer 残置 5件（F-04/F-05/F-10/F-12/GUIDE-6）: 変化なし。既存 inbox ファイルの defer 継続契約に従う

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | 配布物相対リンクのターゲット実在検査（アンカーのみ・プレースホルダ例示・テンプレート変数を除外し、スペースを含む非パス文字列ターゲットのリンクを検査対象に含める） | 本診断の DIST-1。スペースを含むリンクターゲット（`[x](path with space)` 形式）は通常のパス解決検査から漏れるため明示対象化が有効。20260922T051848Z route テーブル #1 と同型の意味層検査 | ○（docs-spec-rebuild-integrity Design の意味層検査として割当済み領域。IR 新設は Design の責務分担判断を要する） |

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- `.opencode/skills/repo-agentdev-integrity/` 配下の旧 IR 参照・相対リンク切れ 4件（agentdev-* prefix 外の repo-local skill、隣接検出としてのみ記録。run2 同様）
- vendored node_modules 配下
- `.agentdev/backlog/req-units/RU-0120.md` の `depends_on: [RU-0119]` が現行 req-units に存在しない事実（RU の依存整合判断は backlog-review の depends_on 依存解決の責務。本診断は未処理 RU の存在報告のみ）
- Command/Skill 参照妥当性・Skill 構造診断（inspect-skills の独立対象）
- アンカーリンク（`#...`）の slug 妥当性（機械判定の信頼性不足、前回診断同様に対象外）
- REQ-090-011 の schema field 名言及（観察メモ: 主文意は gateway 接続契約の要約で Design分離基準違反シグナルは安定契約例外候補）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 4件（checker-known-gap-registry、draft-artifact-actions-row-structure、gh-tool-repo-resolution-failure、jev-ts001-ts010-real-env-verification）。run2 時点の 3件から 1件増加。intake-promote 待ち
- `.agentdev/learning/inbox.md`: 未整理エントリ 4件（78行。run2 時点から増加）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 2件（RU-0120「Jev 有効性評価（Issue B）」、RU-0121「LLM 判断から Jev への置換（Issue C）」、未 commit）。req-define 待ち
- `.agentdev/inspect/inbox/`: 既存 3ファイル（20260901/20260914 は defer 確定済みの意図的残置、20260922T051848Z は run2 診断記録）+ 本ファイル
- `.agentdev/intake/promoted/`・`learning/promoted/`・`inspect/promoted/`・`.agentdev/drafts/`: 空

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）run3、2026-09-22。基準コミット `fea22bf4`（run2 .agentdev state 変更 revert 後の clean baseline）
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（frontmatter/status 集計、3桁/4桁 REQ 参照解決、索引突合、相対リンク実在、エンコーディング/構文/ID パターン、command 参照実在）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
