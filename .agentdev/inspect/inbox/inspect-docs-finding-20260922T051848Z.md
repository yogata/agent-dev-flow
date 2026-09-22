# inspect-docs finding 20260922T051848Z

> 本ファイルは /agentdev/backlog-auto（stage 1）として実行した inspect-docs workflow（2026-09-22、Jev-enabled 再実行。前回 run1 は Jev not_configured のため revert commit `2afaf833` で取り消し済み）の検出事項である。後続の分類（promote / defer / reject）は /agentdev/inspect-promote の責務であり、本ファイルは分類を行わない。

## サマリ

- スキャン対象: 現行 REQ 53件（+README）、retired REQ 14件、Decision 39件（+README）、Design 175件（+README）、guides 12件、ルート README・docs/README、配布物 290ファイル（src/opencode/commands+skills 243、.opencode/commands+skills 47）
- 各カテゴリの検出件数: 新規検出事項 1件（配布物統合性）/ 既知 defer 残置の原状継続確認 5件 / クリーン判定 各観点
- high severity の件数: 0件

## 検出事項リスト

### DIST-1: pr_desc.md の verify-only 根拠欄に Design 名への壊れた相対リンク 2件

- **category**: 配布物統合性（文意保持・壊れた参照表現/リンク切れ。docs-spec-rebuild-integrity Design 5パターン準拠）
- **target**: src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md:39
- **evidence**: `[case-run.md](../../../../../case-run Design)「verify-only 根拠欄の記入規則」、[case-close.md](../../../../../case-close Design)「verification-only PR の files_checked 空確認」— リンクターゲット `../../../../../case-run Design`・`../../../../../case-close Design` は実在ファイルに解決しない（スペースを含む非パス文字列）。正しい参照先は `docs/designs/commands/case-run.md`・`docs/designs/commands/case-close.md`。2026-09-14 実施の前回全数走査（相対リンク クリーン）以降の導入
- **severity**: medium（HTML comment 内の案内文の参照切れで、PR 本文出力への直接影響はないが配布物テンプレートの参照破綻）
- **confidence**: high（機械的に一意判定: ターゲット非実在）
- **source_of_truth**: docs-spec-rebuild-integrity Design（配布物の文意保持・壊れた参照表現検査）を正とし、テンプレート側の壊れたリンクを検出事項とする
- **recommended_route**: 修正（case-run Design / case-close Design の正しい相対パスへの張替え、またはリンクでない Design 名言及への変更）。inspect-promote → backlog-review
- **ng_classification**: 今回修正対象（2026-09-19 `3801398d` 追加行。Case #2979 OU-002「4 Design 名 v4 後継張替え」で導入）
- **notes**: 同 commit の「Design 名後継張替え」は他の参照先では正常適用済み（grep で同型壊れリンクは本2件のみ確認）

## 既知 defer 残置分の原状継続確認（重複のため新規起票せず）

前回までの inspect-promote で defer 確定済みの検出事項のうち、本診断で対象行の実読・grep 突合により原状継続を確認したもの。採否の意味判断条件に変化がないため新規起票せず、既存 inbox 残置ファイルの契約（defer 継続・次回再評価）に従う。

| defer ID | 対象 | 本診断での確認 |
|---|---|---|
| F-04 (20260914) | REQ-038-006 内部アルゴリズム（2フェーズ読込）混入（MOVE） | 原状（docs/requirements/REQ-038.md:25、内容不変） |
| F-05 (20260914) | REQ-050-016 SPLIT 候補＋予算数値残留 | 原状（docs/requirements/REQ-050.md:36、「350 字 × 50 件相当」残存） |
| F-10 (20260901) | 検証実行結果非保存の REQ-012/REQ-021 二重規定（DUPLICATE 軽度） | 原状（REQ-012.md:32 REQ-012-035、REQ-021.md:28 REQ-021-019） |
| F-12 (20260901) | REQ-008-059 テーブル外見出し＋fixture 列挙（MOVE） | 原状（docs/requirements/REQ-008.md:78-85） |
| GUIDE-6 (20260914) | artifacts-and-state.md 状態モデル制約節の frontmatter status 一般化（横断契約矛盾） | 原状（docs/guides/artifacts-and-state.md L144-153、#3047 の guides 変更は当該節と無関係） |

## クリーン判定（問題なしと確認した観点）

- **REQ 参照ID整合性**: クリーン（現行 53件・retired 14件の id↔ファイル名不一致 0件、二重存在 0件。非 v2 の裸4桁参照 6件はすべて IR-067 baseline 管理下の旧4桁帯メタ参照・検出パターン自体の定義・意図的「存在しないこと」例示であり false positive。IR-067（docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md）の 0141 未満除外規則と整合）
- **第一参照導線**: クリーン（requirements/README.md AUTOGEN 53件+retired 14件が実ファイルと完全一致、docs/README.md 要件表・件数記述「53件/14件」一致。リンク切れ 0件（ルート README 9、docs/README 170、guides/README 11、requirements/README 67、decisions/README 172、guides 12ファイル全走査））
- **現行/廃止/世代境界**: クリーン（2026-09-20 RETIRE の REQ-016・REQ-057 の新規廃止を含め、retired 14件が廃止表と一致。活性文書の REQ-016/REQ-057 参照はすべて「廃止済み」「履歴記録」前置き付きで適正（REQ-014.md:12/49、REQ-015.md:18/46、agentdev-adversarial-review.md:344-349、IR-067）。DEC-030（superseded）frontmatter related_reqs の REQ-057 は履歴保持、DEC-022 L92 は承認記録の履歴参照で対象外）
- **Design 意味診断 / Design 状態乖離 DRIFT**: クリーン（draft Design 0件、accepted 174件、status なし 1件は親 Design 所有の references データ（crosswalk-inventory.md、designs/README.md に文書化済み）で DRIFT 対象外・異常なし）
- **Decision 意味診断 / Decision 状態乖離 DRIFT**: クリーン（proposed 0件、accepted 32件 + superseded 7件（DEC-002/005/007/015/017/029/030）= 39件で README・docs/README 記述と完全一致。DEC-018 欠番整合）
- **REQ structure review（6観点）**: SPLIT/MERGE/DUPLICATE/RETIRE/DRIFT とも新規検出 0件（既知 defer F-04/F-05/F-10/F-12 の原状確認のみ）。53現行 REQ の要件テーブル行への Design分離基準違反シグナル横断走査で 25ヒットのうち新規 violation なし（REQ-050 公開入口名・REQ-036 inspect 契約・REQ-048 分析分類等はすべて安定契約例外または当該 REQ の主題そのもの。REQ-090-001/004/007 のパス・件数言及は隠蔽対象の引用・Case 内確定事項の検証条件であり主文意は契約、1シグナル未満のため観察メモ止まり）
- **guides 意味診断**: クリーン（v4.0.0 用語整合 4ファイル（glossary、diagnostics-and-maintenance、req-case-flow、troubleshooting）の変更は範囲内。履歴混入なし。GUIDE-6 原状のほか新規なし）
- **README 索引診断**: クリーン（ルート README・docs/README の導線範囲超過なし。designs/README.md 62リンク解決）
- **横断契約矛盾**: クリーン（REQ-090/DEC-040（Jev Stage 1）の新設系統について、custom-tool-contracts.md「Jev 先行評価」節・.agentdev/README.md 状態表・6系統 Workflow skill の逐次経路追記が REQ-090-001〜010 と一致。execution-unit-construction.md の case-open 残存表現は REQ-090-007 のとおり解消済み（case-open 言及 0件、See Also が case-ready Design を指す）、designs/README.md 該当行も「case-ready Design（運用主体）」へ更新済み）
- **配布物 構文健全性**: クリーン（290ファイル全走査: UTF-8 BOM 0、CRLF/LF 混在 0（vendored node_modules の @types/bun README 5件は対象外）、frontmatter 重複 0（6件の `---` 多出現ファイルは HR 区切りのみで誤検出）、フェンス対応破損 0、意図せぬ H1/H2 重複 0、存在しない command 参照 0（README 廃止コマンド移行案内の5参照は文書化済みの意図的案内））
- **配布物 ID 汚染**: クリーン（src 配布物で REQ-\d{4}/ADR-\d{4}/SPEC/IR パターン 0件。`.opencode/skills/repo-agentdev-integrity/` の REQ-0108 系参照は agentdev-* prefix 外の repo-local skill（配布対象外）であり検査対象外）
- **配布物 文意保持**: 壊れた括弧 0（検出 3件は検査パターン自体の例示定義で false positive）、壊れた参照表現は DIST-1 のみ、主語/目的語欠落文 0
- **配布物 責務整合**: クリーン（case-open/run/close/auto の責務境界は command 本体・workflow skill 間で一致。Jev 追加6系統の逐次経路は REQ-090-010 の責務境界（Tool=機械処理、判断=Workflow/Capability Skill）を遵守）

## 推奨アクション

- DIST-1: inspect-promote で分類の上、正しい Design パスへの張替え修正を推奨（内容は検出事項の recommended_route 参照）。req-define を要しない軽微修正だが、処分判断は inspect-promote の責務
- 既知 defer 残置 5件（F-04/F-05/F-10/F-12/GUIDE-6）: 変化なし。既存 inbox ファイルの defer 継続契約に従う

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | 配布物相対リンクのターゲット実在検査（アンカーのみ・プレースホルダ例示・`(URL)` 等を除外） | 本診断の DIST-1。機械的に一意判定可能（前回 20260914 は全数クリーン、今回は `3801398d` で 2件混入を捕捉）。20260914 route テーブル #3 と同型の意味層検査 | ○（docs-spec-rebuild-integrity Design の意味層検査として割当済み領域。IR 新設は Design の責務分担判断を要する） |

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- `.opencode/skills/repo-agentdev-integrity/` 配下の旧 IR 参照・相対リンク切れ（agentdev-* prefix 外の repo-local skill、隣接検出としてのみ記録）
- vendored node_modules 配下（@types/bun README の CRLF 混在 5件）
- Command/Skill 参照妥当性・Skill 構造診断（inspect-skills の独立対象）
- アンカーリンク（`#...`）の slug 妥当性（機械判定の信頼性不足、前回診断同様に対象外）
- REQ-090-004/007 の Case 内確定事項・検証条件言及（観察メモ: 主文意は契約で Design分離基準違反シグナル 1未満）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 3件（checker-known-gap-registry、draft-artifact-actions-row-structure、jev-ts001-ts010-real-env-verification）。intake-promote 待ち
- `.agentdev/learning/inbox.md`: 未整理エントリあり（24行）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 2件（RU-0120、RU-0121。前段 backlog-review 生成・未 commit）。req-define 待ち
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901/20260914、分類確定済みの意図的残置）+ 本ファイル
- `.agentdev/intake/promoted/`・`learning/promoted/`・`inspect/promoted/`・`.agentdev/drafts/`: 空

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-22（Jev-enabled 再実行、run1 revert `2afaf833` の後）
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（frontmatter/status、索引突合、REQ 参照解決、エンコーディング/構文/ID パターン、相対リンク実在、Design分離基準違反シグナル走査）
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
