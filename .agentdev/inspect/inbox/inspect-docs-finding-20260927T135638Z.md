# inspect-docs finding 20260927T135638Z

## サマリ

- スキャン対象: REQ 56件（retired 14件）／ Decision 45件（DEC-018 欠番、accepted 36 / superseded 9）／ Design 177件（draft 0件）／ guides 13件／ README（root・docs・各索引）／ 配布物（src/opencode/commands/agentdev/ 13件 + skills 50系統 + templates、.opencode/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委託し、親が fan-in 統合（REQ 体系担当は初回 Aborted 後の再委託で完了）。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 新規 23件（重複排除後）。severity 内訳: high 4件／ medium 14件／ low 5件。既知 defer との重複 8件を除外（GD-02、F-25、RQ-15、F-17、RQ-13、F-23、F-19、DC-07 は KNOWN 節へ増分記載）
- 機械的検査: check_integrity NG 0 / Warning 0（baseline-known Info 126 は管理済み）、command_format / extensions / templates / autogen_freshness / design_frontmatter / knowledge_docs 0 違反、lint_skills WARNING 1件（description aggregate budget、RU-0018 層1 既知）、BOM 0、CRLF/LF 混在 0、**check_distribution_boundary exit 1（concrete_id 16ヒット）**、check_content_corruption 1件（本 finding DB-02 に分類）
- 主要新規テーマ: ①配布物参照境界違反（concrete-id 16件、pre-existing）②存在しない `agentdev-doc-writing` スキルの移譲先記述（4ファイル）③DEC-045/046 追加に伴う docs 意味鮮度の取り残し（docs/README 散文・DEC-040 本文注記）④req-impact-map の監査パス・IR 参照陳腐化
- **処理記録**: 2026-09-27 inspect-promote で promote 18件を promoted/ へ分離、defer 5件残置（本ファイル）。各 defer 事項に再評価条件を付記

**処理記録追記**（2026-10-13 inspect-promote、backlog-auto stage 2、--auto なし）: RQ-17 は 20260926T180630Z 側 RQ-17（同一対象 REQ-090-004・REQ-090.md:19）が 20261008T025952Z F-05/F-06 cleanup anchor 成果物へ統合済みであり、REQ-090-004 行自体も消滅（現行 REQ-090.md:19 は REQ-090-002、grep で「本 Case 内で確定する」記述の実在なし）のため、重複・解消により本ファイルから削除（却下理由は commit message に記録）。RQ-20/DS-13/DC-10/RM-01 は再評価条件未充足のため defer 継続（自律確定）

**処理記録追記**（2026-10-15 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）: RQ-20/DS-13/DC-10/RM-01 は再評価条件未充足のため defer 継続（自律確定）: 対象ファイル（retired status 値・designs/README.md・decisions/README.md Decision Map・root README クイックスタート）は delta 窓（2026-10-12 以降）で対象記述不変

**処理記録追記**（2026-10-16 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）: RQ-20/DS-13/DC-10 は再評価条件未充足のため defer 継続（自律確定）: 対象ファイル（retired status 値・designs/README.md・decisions/README.md Decision Map）は 38bc58c7..636b1e2b の delta 外で不変。RM-01 の再評価条件「root README 編集時（次サイクル reject 候補）」は発火（ffa59eac で root README:15 に一気通貫説明追記）したが、指摘対象の動作説明詳細は編集後も存続・拡張しており解消未了のため defer 継続（自律確定。adversarial-review 2 stream 収束）

**処理記録追記**（2026-10-19 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）: RQ-20/DS-13/DC-10/RM-01 は再評価条件未充足のため defer 継続（自律確定）: root README 最小クイックスタートの動作説明詳細は存続を現物確認（RM-01）。相互注記: DS-13 の再評価条件は 20261019 IDX-02（references 配下 Design 状態の索引非可視。defer 確定、同日分類）と同一索引規則領域のため、DS-13 再評価時に IDX-02 を併せて判定すること。DC-10 は DC-07（20260926）と同時再評価のまま

## 検出事項リスト（defer 残置 5件）

### REQ 体系（defer 2件）

#### RQ-20: retired/ 内 14件の status 値が retired / migrated で混在し使い分け基準が未文書化
- **category**: RETIRE（廃止側メタデータの不統一）
- **target**: docs/requirements/retired/（status: retired = REQ-020/033/040/042/043、status: migrated = REQ-013/016/022/023/024/025/026/028/057）
- **evidence**: retired/REQ-020.md:4 は「status: retired」ながら :11「後継: REQ-012」と移行先明示。retired/REQ-013.md:6 は「status: migrated」で同様に後継明示。後継の有無と status 値が対応しない。retired/README は不在
- **severity**: low / **confidence**: medium
- **source_of_truth**: requirements/README.md 廃止表（実体配置が正。status 値の意味規定は不在）
- **recommended_route**: intake（status 値の統一、または 2 値の意味を requirements/README.md 基準構造節に 1 行定義）
- **ng_classification**: pre-existing
- **notes**: 機能影響なしの表記揺れ。非文書化慣行の可能性あり
- **再評価条件**: REQ 構造整備時（requirements/README 基準構造節への値域定義タイミング）

### Design（defer 1件）

#### DS-13: Design インデックスの references/ 独立行が自規則と不整合
- **category**: 分類政策（索引登録規則の不整合）
- **target**: docs/designs/README.md（foundations/ 表・workflows/ 表）
- **evidence**: 登録手順節は「`references/` サブディレクトリの Design … は親 Design 行の備考欄で言及し、独立行としては登録しない」と規定。しかし foundations/ 表に `foundations/references/concrete-abstraction.md` の独立行、workflows/ 表に `workflows/references/execution-unit-construction.md` の独立行が存在。同規則を守っている行もある（v3-v4-crosswalk 行、perspective-registry 等）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: インデックス自体の規則文（機械検査は未登録ファイル検出のみで独立行の可否は見ない）
- **recommended_route**: intake（2 行の親行への統合、または規則文に経過措置を明記）
- **ng_classification**: pre-existing
- **notes**: Wave 3 再構築以前の行の祖父条項の可能性
- **再評価条件**: Design 索引規則の経過措置判断の機会

### Decision（defer 1件）

#### DC-10: Decision Map に DEC-044→DEC-043/040・DEC-046→DEC-040 の後継行が欠落（DC-07 増分）
- **category**: Decision 現行性（索引不整合・既知 DC-07 の増分事実）
- **target**: docs/decisions/README.md:176-211（手動管理の Decision Map）
- **evidence**: Map は DEC-006 supersedes DEC-005 等の現行間 supersedes を掲載するが、DEC-044→DEC-043（全体置換）・DEC-044→DEC-040（決定4 部分置換）・DEC-046→DEC-040（決定2 置換）の行がない。project-docs-and-specs.md:37 は「後継関係は Decision Map を参照」と案内。DC-07（20260926 defer「Decision Map が v4 期の frontmatter relations を大部分未反映」）の継続・増分（DEC-046 追加で欠落が拡大）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: 各 DEC frontmatter（superseded_by / supersede_note）
- **recommended_route**: DC-07 の defer 継続（本件は DC-07 の増分事実として次回 inspect-promote で同時再評価）
- **ng_classification**: pre-existing（DEC-044 分）/ 今回修正対象（DEC-046 分）
- **notes**: 新規独立検出とせず DC-07 との関連を明示
- **再評価条件**: DC-07（20260926 defer）と同時の Decision Map 一括反映時

### guides / README（defer 1件）

#### RM-01: root README「最小クイックスタート」の動作説明詳細
- **category**: README 索引過多
- **target**: README.md:15-17
- **evidence**: case-auto 内部 lifecycle の駆動・「Definition の保存・確定と実行構造の確定もその内部責務として実行する」・例外経路（case-revise → case-ready）解決の動作説明。REQ-034/REQ-062 契約の再掲であり、索引・クイックスタートとしては詳細。全 34 行中 3 行で程度は軽微
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-034 / REQ-062
- **recommended_route**: intake（quickstart.md への集約とリンク化を検討）
- **ng_classification**: pre-existing
- **notes**: 入口要約として許容範囲の可能性あり
- **再評価条件**: root README 編集時（次サイクル reject 候補）

## KNOWN（継続確認・既知 defer への増分情報）

- **GD-02（20260926 defer）への増分**: intake-learning-backlog-flow.md:139「状態モデルの共通制約の正は [成果物、状態モデル] を参照する」が guides 層の相互権威主張（artifacts-and-state.md を「正」指定）をさらに強化する参照元として確認された。GD-02 の再評価時に参照元リストへ追加されるべき
- **RQ-13（20260926 defer「説明なき行欠番の集約」）への増分事例**: REQ-003-025/027（REQ-003.md:44-46 の 024→026→028 間欠、REQ-082 分離移動とは別理由で説明なし）、REQ-090-008（REQ-090.md:22-23 の 007→009）。RQ-13 の集約対象として次回再評価に含めるべき
- **継続確認の既知 defer（本サイクルで新規検出なし・再指摘なし）**: RQ-04, RQ-08, RQ-09, RQ-14, RQ-15, RQ-16, DS-03, DC-02, DC-04, DC-06, DC-07, GD-02, GD-03（20260926）、F-04〜F-25 系（20260925）、F-10/F-12（20260901）、F-04/F-05/GUIDE-6（20260914）

## docs-check route 候補（STEP-3-2）

- RQ-20（retired status 値の混在）: retired/*.md の status 値域チェック（2値許容の明確化後、値域外検出）は docs-check 機械検査候補

- 2026-10-27 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: RQ-20/DS-13/DC-10/RM-01 は再評価条件未充足のため defer 継続（自律確定）: stage 1 診断（20261026T190542Z）の既知項目照合で対象変化の報告なし。DS-13 は IDX-02〔20261019T143944Z〕との同時再評価条件を維持（親子状態表示契約の判断未了・status 遷移なし）、DC-10 は DC-07/DC01 族の同時再評価条件のまま
