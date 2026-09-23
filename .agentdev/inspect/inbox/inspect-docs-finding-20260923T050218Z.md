# inspect-docs finding 20260923T050218Z

> 2026-09-23 inspect-promote 処分記録（/agentdev/backlog-auto stage 2 inspect レーン経由、--auto なし、in-context 対論型レビュー）: README-1/REQ-1 は promote・採用済み（自律確定。`.agentdev/inspect/promoted/inspect-docs-promoted-20260923T050218Z.md` へ保存）。GUIDE-1 はユーザー判断事項として HITL 移送（inbox 残置、判断確定まで本ファイル保持）。
>
> - README-1: promote 自律確定（実在 DEC 40件×索引記述39件の機械突合、decisions/README.md 側は同期済み、docs/README.md 単独の取込み漏れ。promote 判定に本質的競合なし。反証2件を棄却）
> - REQ-1: promote 自律確定（REQ-001.md:83 の検証履歴コメント残留を現物行確認、REQ-001-003・document-model Design・REQ-012-035 の保持禁止規定を確認、除去方向は一意。cleanup モデル RETIRE 適用候補。反証2件を棄却）
> - GUIDE-1: HITL 移送（case-run 3フェーズ表記の不一致は事実確認済みだが、L84 の正規 delegation 文により「概要表現として許容 / 現行構成へ同期 / 対応不要」の採否解釈が収束せず unresolved。審議詳細は promoted ファイル冒頭を参照）
>
> Jev 先行評価（vercel-ai-gateway / typesafe-ai/jev、20260923T054728Z-4f4a）: 暫定分類妥当性 true（p=0.84、confidence 0.83）、defer 継続確信度 高い確信。LLM 判断と一致。

## サマリ

- スキャン対象: docs/requirements/（現行 53 + retired 14 + README）、docs/decisions/（DEC 40 + README）、docs/designs/（176 md）、docs/guides/（12 md）、README.md（ルート + docs/README.md）、配布物（.opencode/commands/agentdev/ 34 md、skills は src/opencode/skills/ 実体 178 md〔node_modules 除く〕）
- 新規検出事項: 3件（README 索引乖離 1、REQ 内検証証跡残留 1、guides 表記乖離 1）
- high severity: 0件
- 既知 defer 継続事項の原状確認: 5件（新規起票せず）

## 検出事項リスト

### README-1: docs/README.md の Decision 索引が DEC-041 を未反映（索引乖離 DRIFT）

- **category**: README 索引診断 / Decision 状態乖離 DRIFT
- **target**: docs/README.md Decision 節（「現行 Decision は DEC-001 から DEC-040 の39件である」の記述と Decision 一覧表）
- **evidence**: 実在 DEC ファイルは 40件。DEC-041（Wave 構成純度と実行並列上限の単一所有）は commit e1415a88（2026-09-23、docs(decisions): DEC-041 を受理評価により accepted へ遷移）で accepted となり、docs/decisions/README.md 側は baseline table・ステータス別ビュー（accepted）・関連 REQ 表すべてへ反映済み。docs/decisions/README.md の「現行の承認済み Decision は33件」は DEC-041 を含む実体 frontmatter 突合と完全一致（accepted 33 / superseded 7 / proposed 0）。一方 docs/README.md のみ「DEC-001 から DEC-040 の39件」の記述が残存し、Decision 一覧表に DEC-041 行が存在しない（実在 DEC 全件との突合で DEC-041 のみ欠落を機械確認）
- **severity**: medium / **confidence**: high（実在ファイル×索引記述の機械的突合で一意に判定）
- **source_of_truth**: 実体 Decision ファイル（frontmatter `status: accepted`）と docs/decisions/README.md（分類ビュー、DEC-041 反映済み）を正とし、docs/README.md の索引記述を乖離と判定
- **recommended_route**: docs/README.md の Decision 節記述と一覧表への DEC-041 追加 → /agentdev/inspect-promote → /agentdev/backlog-review
- **ng_classification**: 今回修正対象（DEC-041 accepted 遷移当日（2026-09-23）の時点で索引が未更新。decisions/README.md は同期済みのため、docs/README.md 単独の取込み漏れ）
- **notes**: docs/README.md の Decision 一覧は AUTOGEN ブロック外の手動管理区間であり、今回のように accepted 遷移と同時に取込み漏れが発生し得る。docs-check route 候補 #1（下記）の適用対象

### REQ-1: REQ-001 本文に検証履歴 HTML コメントが残留（検証証跡カテゴリ）

- **category**: 文書分類一貫性 / cleanup 対象カテゴリ（検証証跡の残留）
- **target**: docs/requirements/REQ-001.md:83（要件テーブル外、REQ-001-069 直後）
- **evidence**: `<!-- verified: case-run #1813 - REQ-001-056..060 acceptance criteria + TS-001/TS-003/TS-004 PASS, Design consistency confirmed (document-model.md, agentdev-decision-guidelines.md) -->`。REQ 本文の要件テーブル外に case-run #1813 の検証作業履歴がコメントとして残留。commit 7bdfe281（2026-07-27、[#1813] REQ-001 APPEND の内容検証完了）由来。document-model Design は「検証実行結果を Design に保持しない」を規定し、検証証跡の正規配置は traceability sidecar / Issue 記録側（REQ-012-035「個々の検証実行結果を TIM に保持しないこと」の精神と同型）
- **severity**: low / **confidence**: high（機械的残留であり、要件行・基準記述でないことは明確）
- **source_of_truth**: REQ-001（基準構造の記載範囲）・document-model Design（検証証跡の保持禁止）を正
- **recommended_route**: cleanup（RETIRE 候補: 当該 HTML コメントの除去。証跡は Issue #1813 側に残存）→ /agentdev/inspect-promote → /agentdev/backlog-review
- **ng_classification**: pre-existing（2026-07-27 の commit 7bdfe281 由来、少なくとも 2026-09-01 以降の inspect サイクルで未検出のまま残置）
- **notes**: HTML コメントで視覚的非表示のため実害は小。docs-check route 候補 #2（下記）の適用対象

### GUIDE-1: req-case-flow.md の case-run「3フェーズ構成」表記が正規フェーズ名と不一致

- **category**: guides 意味診断 / 横断契約矛盾（軽微）
- **target**: docs/guides/req-case-flow.md:63（「3フェーズ構成でべき等な再開ポイントを提供する」）、:71-75（3フェーズ構成表: 準備〔Issue 読取り、worktree 作成、Plan 策定〕/ 実装 / 提出）
- **evidence**: case-run の正規 3フェーズは「準備・委譲・クリーンアップ」（`agentdev-workflow-case-run` SKILL L41「準備・委譲・クリーンアップの3フェーズを順次実行する」、STEP-S1〜S6 構成）。ガイド表の「Plan 策定」は case-run 本体 STEP に存在せず、実装方針の形成は adapter 委譲内へ移転済み（REQ-015-010「case-run 本体は実装方針を生成・審査せず…agentdev-case-run-execution-adapter の委譲契約内」）
- **severity**: low / **confidence**: medium（ガイド表を委譲内サブエージェント作業の概要と読む解釈が可能。同ファイル L84 に「現行の case-run STEP 構成…の正は、REQ-031（case-run 実行契約）と `agentdev-workflow-orchestration` スキルが所有する」の正規 delegation 文あり。要ヒューマンレビュー）
- **source_of_truth**: REQ-031（case-run 実行契約）・`agentdev-workflow-case-run` SKILL（準備・委譲・クリーンアップ）を正とし、ガイドのフェーズ名・工程内容の不一致を検出事項とする
- **recommended_route**: ガイドの 3フェーズ構成表を現行構成（準備・委譲・クリーンアップ）へ同期（案内層として委譲内作業との対応を注記）→ /agentdev/inspect-promote → /agentdev/backlog-review
- **ng_classification**: pre-existing（v4 single workflow 収斂（commit 86adcab2 前後）以降の表記）

## 既知 defer 継続事項（原状継続を確認、新規起票せず）

| defer ID | 内容 | 本診断での確認 |
|---|---|---|
| F-04 (0907) | REQ-038-006 に内部アルゴリズム（2フェーズ読込）混入（MOVE） | 原状継続（REQ-038.md:25 に「インデックススキャンと候補絞り込みによる2フェーズ読込」残存を現物行読取で確認） |
| F-05 (0907) | REQ-050-016 が REQ-050 適用範囲外関心かつ実装パラメータを含む（SPLIT） | 原状継続（REQ-050.md:36 に「350 字 × 50 件相当」残存を現物行読取で確認） |
| F-10 (0901) | 検証実行結果非保存が REQ-012/021 に二重規定（DUPLICATE 軽度） | 原状継続（REQ-012.md:32 REQ-012-035・REQ-021.md:28 REQ-021-019 とも現存。行番号は前回審議記録と一致） |
| F-12 (0901) | REQ-008-059 が要件テーブル外見出しセクション＋fixture 列挙（MOVE） | 原状継続（REQ-008.md L78-85 付近に「### REQ-008-059: 未確定内容の auto_ready 抑止」セクション、"TBD"/"TODO"/"未定" 等 fixture 残存を現物読取で確認） |
| GUIDE-6 (0907) | artifacts-and-state.md 状態モデル制約節の frontmatter/status 一般化表現 | 原状継続（L146-152 の状態モデル制約節、「frontmatter や status フィールドによる状態管理は行わず」残存を現物読取で確認） |

## 推奨アクション

- README-1: docs/README.md Decision 節の同期（機械的突合で確定した乖離。promote 候補）
- REQ-1: HTML コメント除去（low・pre-existing。promote または defer 候補。cleanup モデル RETIRE 適用可否の判断は inspect-promote へ移送）
- GUIDE-1: 3フェーズ表記の同期（low・medium confidence。解釈の余地を notes に記録済み。HITL 判断候補）

## docs-check route 候補（STEP-3-2、診断記録）

| # | 候補ルール | 根拠観察 | 適合性 |
|---|---|---|---|
| 1 | docs/README.md Decision 一覧×実在 DEC ファイル突合: 一覧表記載 DEC 集合と `docs/decisions/DEC-*.md` 実在集合の差分を検出（件数文言「DEC-001 から DEC-0NN のN件」の突合を含む） | README-1。完全機械化可能、偽陽性ゼロ | ◎（新規 IR 候補） |
| 2 | REQ 本文内検証履歴コメント検出: `docs/requirements/REQ-*.md` 本文の `<!-- verified:` 等の検証作業履歴コメントを決定的パターンで検出 | REQ-1。決定的・偽陽性低 | ○（新規 IR 候補） |
| 3 | guides 実行モデル記述×workflow SKILL 正規フェーズ名突合 | GUIDE-1。フェーズ名抽出は可能だが主体（本体 vs 委譲内）の意味突合を伴う | △（半機械。要調整） |

## クリーン判定（問題なしと確認した観点）

- REQ 参照ID整合性: dangling 参照 0件。検出された REQ-063〜081/084〜086/096（意図的予約欠番の言及）、REQ-089（J2 shadow 廃止識別子の言及）、REQ-999（IR-069 の例示）はすべて意図的な記述（docs/README.md・requirements/README.md・REQ-087・REQ-090・numbering-policy・IR-069・DEC-040 現物確認済み）
- REQ 現行/廃止カウント: requirements/README（現行53/廃止14）×docs/README（現行53/廃止14）×実ファイル数（現行53/retired 14）完全一致
- 第一参照導線: ルート README の ADF-COVERS 宣言（REQ-050-014、REQ-005-010）実在行確認済み
- retired REQ 参照の現行判断的参照: 0件（`v2:REQ-*` 履歴参照は適正。docs/designs/skills/agentdev-adversarial-review.md の REQ-016 参照は「横断整合検証状態（履歴記録・廃止済み REQ-016）」見出し＋履歴注記（retired 化 2026-09-20、現行契約は REQ-015、Issue #3044）完備で適正。REQ-028 行参照は IR-057 適用等の移行判断記述で適正）
- Decision 索引（decisions/README.md）: accepted 33（DEC-041 含む）/ superseded 7 / proposed 0、frontmatter status 全件突合一致、baseline table・ステータス別ビュー・関連 REQ 表の突合一致（欠落 0）
- superseded Decision の現行判断的参照: 未管理参照 0件（REQ-002:16、REQ-012:16/65、REQ-021:13/50 はすべて superseded 注記付きの意図的記述）
- Design frontmatter status: accepted 174 / draft 0 / 欠落 2件（README.md と foundations/references/crosswalk-inventory.md。IR-070 対象範囲判定の exempt 規定〔Design インデックス、references/ 配下〕に該当し適正）。draft Design の放置 0件（時間ベース draft 放置検出の指摘対象なし）
- DEC-041 由来の Wave 記述 DRIFT: 0件（docs/designs/commands/case-run.md・`agentdev-workflow-case-run` SKILL とも「Wave 実行制御は case-auto orchestration stage 3 が単一所有（REQ-031-015、DEC-041）」へ同期済み。`agentdev-workflow-case-auto` SKILL も stage 3 共有 active Issue task 枠（上限5）を単一所有として一貫）
- Design 将来計画混入: 0件（document-model.md の hit は「将来案は Design に保持しない」という規則記述自体で false positive）
- guides 旧語混入: 0件（design-save / docs-review / inspect-extensions / req-save / backlog-save / case-update / artifact-graph の現行的記述なし）。guides 内の内部 lifecycle コマンド直接参照（文脈語なし）: 0件
- guides コマンド選択表: 13 公開コマンド×実在 command ファイル突合一致、内部 lifecycle は case-auto 経由表記（GUIDE-8 reject 時の修正が維持されていることを確認）
- README リンク実在: ルート README・docs/README・designs/README・guides/README・src/opencode/commands/agentdev/README の相対リンク全件解決
- 配布物 構文健全性: frontmatter 重複 0、frontmatter 未閉鎖/先頭空行 0、Markdown 構文破損 0、UTF-8 BOM 0、CRLF/LF 混在 0（commands 34 md + skills 実体 178 md〔node_modules 除く〕計 212 md 機械走査）。node_modules 配下の hit は vendored 依存で false positive（前回分類踏襲）
- 配布物 存在しない command 参照: 実害 0件（commands/agentdev/README.md の case-open 等は「廃止コマンドの移行案内」の意図的記述。`/agentdev/templates/` は templates ディレクトリ実在パス参照で regex 過剰捕捉の false positive）
- 配布物 文意保持: 括弧不対応 0、バッククォート奇数 0、空リンク 0、破損相対リンク 0（epic-tracker SKILL の `](URL)` は placeholder 例示で false positive、前回分類踏襲）
- 配布物 プロジェクション整合: src/opencode/commands/agentdev ↔ .opencode/commands/agentdev 内容差分 0・欠落 0・未投影 0。skills 投影（symlink）missing 0 / orphan 0
- 配布物 責務整合: inspect-docs command Design（docs/designs/commands/inspect-docs.md）の目的・入出力・副作用・ガードレール・commit message 契約が本 workflow 実行手順と完全一致。case-auto/case-run 責務境界記述は command Design・SKILL 間で一致
- コマンド定義×実在突合: 実在 13 公開コマンド、README コマンド一覧 13/13 一致

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 1件（intake-ir055-baseline-update-run3.md）。intake-promote 待ち
- `.agentdev/intake/promoted/`: 1件（intake-jev-ts001-ts010-real-env-verification.md）。backlog-review 待ち
- `.agentdev/learning/inbox.md`: 未整理エントリ存在（76行）。learning-promote 待ち
- `.agentdev/backlog/req-units/`: RU 2件（RU-0120、RU-0121）。req-define 待ち
- `.agentdev/inspect/inbox/`: 既存 defer 2ファイル（20260901/20260914、分類確定済みの意図的残置）
- `.agentdev/drafts/`: 空

## 対象外（Out of Scope）

- docs 表層品質（textlint 共通基盤管轄）
- 配布物のエンコーディング・プロジェクション等の決定的検査の本体（docs-check / repo-agentdev-integrity checker が所有。本診断は探索手段としての機械走査のみ）
- `.opencode/skills/repo-agentdev-integrity/`（agentdev- プレフィックス外の repo-local skill。隣接検出: references/vocabulary-registry.md に廃止語彙マッピング文脈の旧コマンド名言及あり、references/remediation-routing.md に `/agentdev/docs-review` 言及あり。語彙登録の意図的記録と推定されるため意味判断は要確認事項として記録するに留める）
- 検出事項の分類・採用（inspect-promote の責務）
- intake/learning/RU の処理（後段 workflow の責務）

## 参照

- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-23。対象: docs 4種別 + README 群 + 配布物（commands 34 md、skills 実体 178 md 機械走査、Design 176 md status 走査、REQ 67 ファイル・Decision 40 ファイル突合、guides 12 md 精読）
- 探索手段: README 索引・正規成果物の直接読取・node による機械的走査（カウント突合、frontmatter status 抽出、dangling ID、BOM/CRLF、link 実在、括弧/バッククォート対応、command 参照突合、プロジェクション差分）
- 実行経緯（呼出失敗の明示）: STEP-2 意味診断の探索を 4 系統のサブエージェント並行委譲で試行したが、全系統が task timeout（5分）で失敗した。adversarial-review の caller-integration 契約（呼出失敗時の silent skip 禁止・失敗の明示記録）に準じ、上記のとおり呼出失敗として本記録に明示し、親プロセス直轄の機械走査＋シグナル精読（同期逐次）で再実行して本結果を得た
- 後続: /agentdev/inspect-promote での分類（promote / defer / reject）
