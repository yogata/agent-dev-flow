# inspect-docs finding 20261008T025952Z

- 実行日時: 2026-10-08T11:35〜12:00 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer 照合・主要候補の親による file:line 再検証を実施、担当間矛盾なし、対象領域分離により重複候補なし）
- 前回診断: 20261006T151122Z（defer 残置分。10-07 実施の inspect-promote で promote 8件・defer 3件処理済み）。今回の対象差分は 10/7〜10/8 の正規コミット群（Case #3530 adf-v4-canonical-convergence: REQ-103 新設と 11 Design の design 宣言追随・RA-001〜RA-005 ・Case #3525 REQ-061-047/048・DEC-052 新設・Wave-3 完了訂正ほか。docs 65ファイル・配布物 48ファイル変更）
- 機械的検査（docs-check 検査スクリプト群）: check_integrity 0 new unmanaged NG・check_command_format OK・check_extensions OK・check_distribution_boundary OK（407ファイル 0 hits）・check_templates OK・check_autogen_freshness 0 件・lint_skills NG 2件 + WARNING 1件（F-26〜F-28）

## 検出事項リスト

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。
NG 分類: false positive / pre-existing / 今回修正対象（docs-spec-rebuild-integrity NG 分類表に従う）。

### REQ 体系

#### F-01: REQ-103 AC 判定対象数の内部不整合（AC-25 vs AC-26）
- category: 整合性（REQ 内部参照整合）
- target: `docs/requirements/REQ-103.md:49`、`REQ-103.md:53`、`REQ-103.md:82`
- evidence: REQ-103-031（:49）は「受け入れ条件対応節に定義のある AC-01 から AC-25 までを…個別に判定し」と宣言する一方、受け入れ条件対応節前置き（:53）は「受け入れ条件 AC-01〜AC-26 を個別に判定する」と宣言し、対応表（:82）は AC-26（= REQ-103-031（判定規則）／TS-017）を実際に定義する。判定対象集合の定義が REQ 内で 2 通りに矛盾し、完了判定の集計閉包（25 か 26 か）が一意に確定しない（親による file:line 再検証済み）
- severity: high / confidence: high
- source_of_truth: 現行 REQ-103-031 自身（「fail または blocked が残る場合に完了と報告しないこと」の適用範囲が自己矛盾）
- recommended_route: 表現是正候補（どちらかに統一。AC-26 が判定規則そのものを指す自己言及除外の意図なら :53 の「AC-01〜AC-26」が誤り、AC-26 を判定対象に含めるなら :49 の「AC-25 まで」が誤り）
- ng_classification: 今回修正対象（af12b454 新設 REQ-103 内の問題。REQ-103 は Case #3530 の AC 判定完遂済みの扱いのため、完了訂正経路も含む判断）

#### F-02: REQ-103 への作業記録・作業経緯の混入
- category: 分類違反（MOVE/表現是正。document-model REQ 内容契約・cleanup 対象カテゴリ）
- target: `docs/requirements/REQ-103.md:53`（RU-0181）、`REQ-103.md:104`（session-supervisor 取り下げ経緯）、`REQ-103.md:46`（REQ-103-028 baseline tag 具体値）
- evidence: (1) :53「RU-0181 および要件ドラフトの消費後も…一意に再構成できる」— RU 番号（一時成果物由来の作業記録識別子）が REQ 本文に残存（REQ-008-002「一時成果物は永続文書の根拠として扱わない」と緊張）。(2) :104「ユーザーの最新指示により並行作業は取り下げ。本要件の全面再評価の評価対象からは除外しない」— 作業経緯・指揮系統の記述が適用範囲節に混入。(3) REQ-103-028 の baseline tag 具体値 `baseline-v4-canonical-convergence-20261007` は移行結果・リリース証跡寄り（ただし差分検証可能性の契約としての側面あり）（親による :53/:104 再検証済み）
- severity: low〜medium / confidence: medium（(1)(2) は high 寄り、(3) は low）
- source_of_truth: document-model.md（REQ 内容契約、cleanup 対象カテゴリ、移管候補）、REQ-008-002
- recommended_route: 表現是正候補（RU-0181 は「当該 Definition の受け入れ条件対応節」への置換、:104 は対象外節の現在像として再表現）
- ng_classification: 今回修正対象（REQ-103 新設）

#### F-03: REQ-103 の恒久判断契約と REQ-096 正規所有領域の重複（SPLIT/DUPLICATE 統合論点）
- category: SPLIT + DUPLICATE（REQ 担当 F-5/F-6 を同根として統合）
- target: `docs/requirements/REQ-103.md:20-31`（REQ-103-002〜013）対 `docs/requirements/REQ-096.md:20,21,24,26,29`
- evidence: REQ-103 内に (a) 恒久性のある判断アーキテクチャ契約（002 判断方法3分類、004 閉じた意味評価の閉包、007 LLM 推論の使用限定、008/009/011 評価器障害時 fallback 禁止・未確定扱い・再開、012 人間留保事項、013 soft contract 定義）と (b) 一回限りの全面再評価作業契約（016/017/028/029/030/031）が同居。(a) は REQ-096（ADF判断アーキテクチャの正規所有者）・DEC-052 とほぼ同文で重複（代表対: REQ-103-004 ≒ REQ-096-002、REQ-103-012 ≒ REQ-096-005、REQ-103-003 ≒ REQ-096-007、REQ-103-002 ≒ REQ-096-001/003/010 の要約）。REQ-090-002/003/004 が「REQ-103-008〜011 に従う」と恒久依存しており、REQ-103 が将来 retire された場合（REQ-045 と同型の一回限り契約構造）に恒久契約の所有先を失う構造リスク
- severity: medium / confidence: medium
- source_of_truth: 現行 REQ（REQ-096 title・REQ-090 目的節「正規所有者は REQ-096」）+ document-model 記述単位判定の原則
- recommended_route: 構造整理候補（req-define 壁打ち向き。REQ-096 系への吸収、REQ-103-016 再評価基準としての「再宣言」であることの明示限定、または REQ-103 完了後の寿命計画明示のいずれか）
- ng_classification: 今回修正対象相当（今回新設だが設計判断事項であり記述バグではない）

#### F-04: REQ-008-059 が要件テーブル外の見出し形式で存在（fixture・内部アルゴリズム残留を含む）
- category: 整合性（行 ID 解決不能）+ DRIFT（ファイル内フォーマット乖離）+ 分類違反（MOVE）
- target: `docs/requirements/REQ-008.md:80-88`
- evidence: 要件テーブルは `| REQ-008-058 |`（:75）の次が `| REQ-008-060 |`（:76）に飛び、REQ-008-059 だけが `### REQ-008-059: 未確定内容の auto_ready 抑止` 見出し＋散文で記述される。行 ID の機械解決が不能（本次診断の走査でも NOT FOUND として検出）。本文は「決定的マーカー検査（"TBD"、"TODO"、"未定"、"後続工程で確定"、"case-run で確定" 等の代表 fixture）」「auto_gate.stop_reasons へ記録」等のテストデータ詳細・内部アルゴリズム・field 名が主たる文意（親による再検証済み）
- severity: medium / confidence: high（形式不整合の事実は確定的）
- source_of_truth: 現行 REQ の要件テーブル形式慣行、document-model.md 分離基準（テストデータ詳細・内部アルゴリズム→Design）
- recommended_route: 構造整理候補（テーブル行形式への復帰 + fixture/field 名部分の Design 分離）
- ng_classification: pre-existing（最終更新 2026-09-29、今回 delta 外）

#### F-05: REQ-090 の schema/enum/credential 具体名シグナル群
- category: 分類違反（MOVE。統合1件）
- target: `docs/requirements/REQ-090.md:18`（REQ-090-001: API `/ai/run`、model ID `typesafe/jev`、credential `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN`）、`:26`（REQ-090-011: `questions[].score.criteria`）、`:30`（REQ-090-015: 差異理由 enum 4値）、`:31`（REQ-090-016: 失敗分類 enum 5値）、`:41`（REQ-090-026: 観測識別子 field 名）
- evidence: schema field 残留・enum 値一覧残留・実装パラメータ残留の 3 種シグナルが同一 REQ 内に複数行で出現。REQ-090-006（:23）は「観測 filename、個別 field 名…は実装設計時の自由度」と宣言する一方、015/016 は分類 enum を固定しておりファイル内で立場が不均質。credential env 名は外部契約（REQ-090-002）として安定契約例外の余地あり
- severity: medium / confidence: medium
- source_of_truth: document-model.md Design 分離基準（REQ-001-067 移管候補）
- recommended_route: 構造整理候補（観察メモから開始。REQ-090 は Jev 実証の観測契約であり Design 移管には DEC-044/052 系の合意が絡む）
- ng_classification: pre-existing（今回 delta は REQ-090-002〜004 のみ変更）

#### F-06: REQ-061-047/048 の回帰条件・構成アルゴリズム・field 名列挙
- category: 分類違反（MOVE）
- target: `docs/requirements/REQ-061.md:66-67`
- evidence: REQ-061-047「トポロジカルレベル割当として決定的に導出する」（構成アルゴリズム指定。REQ-061-038 が上位で決定性を規定済みで冗長寄り）、REQ-061-048「依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成が機械検査で fail となる回帰条件を検証に含める」（回帰テスト条件残留）+「観測識別子（workflow、evaluationKind、questionId）の互換性を維持」（field 名列挙、REQ-090-026 と同一契約の参照表現で安定契約例外候補）
- severity: low / confidence: low-medium
- source_of_truth: document-model.md 移管候補、安定契約の例外（fail-closed 検査の定義として機能する側面）
- recommended_route: 観察メモ（Wave 決定性契約の維持前提で表現精緻化候補）
- ng_classification: 今回修正対象候補（ef269148 新設行）だが契約意図は検証可能性の保証

#### F-07: REQ-030-024 の内部適用方式と content 全文適用の曖昧さ
- category: 分類違反（MOVE）+ 表現是正
- target: `docs/requirements/REQ-030.md:43`
- evidence: 「artifact_actions の update 系操作…は、対象セクション・対象行の全文を含む完全な content で適用すること」— REQ-008-030 は「UPDATE で対象成果物全体の全文を複製することは要求しない」と緩和しており、「完全な content」の範囲（変更後範囲の全文か対象成果物全体の全文か）が文面上曖昧。sidecar 両方向一致検査の内部適用手順は実装方式寄り
- severity: low / confidence: low
- source_of_truth: REQ-008-030〜033（content 完全確定義務の正規所有側）、document-model cleanup 対象カテゴリ2
- recommended_route: 観察メモ（曖昧解消自体が表現是正候補）
- ng_classification: 今回修正対象候補（本 delta で追加された行）だが契約意図は実行安全

### Design

#### F-08: ADF-COVERS(design) 宣言と本文対応節の不一致（4 Design）
- category: Design間矛盾（トレーサビリティ宣言と本文の不一致）
- target: (1a) `docs/designs/foundations/v4-operating-model.md:8`（REQ-103-020/021）、(1b) `docs/designs/foundations/v4-migration-and-release.md:8`（REQ-103-026）、(1c) `docs/designs/responsibilities/artifact-contracts.md:8`（REQ-103-024/025）、(1d) `docs/designs/foundations/document-model.md:12`（REQ-103-023）
- evidence: REQ-103 の 11 Design のうち 4 Design が `ADF-COVERS(design)` 宣言のみで本文に対応節・参照を欠く（(1a) は親による grep 再検証済み: REQ-103-020/021 は :8 の宣言行にのみ出現）。他の Design（v4-quality-gate-model、v4-runtime-execution-model、v4-durable-state-and-recovery、v4-responsibility-boundaries 等）は専用節で対応しており、本文に REQ 行を明示するのが本 Wave の確立パターン。(1a) は REQ-103-020 の design 対応が v3-v4-crosswalk.md:28 にも見える二重宣言の疑い、REQ-103-021 は IR-040/041 の verification カバーが担う
- severity: (1a)(1b) medium / (1c)(1d) low / confidence: (1a) medium-high、(1b)(1c) medium、(1d) low
- source_of_truth: REQ-103 受け入れ条件対応表、artifact-responsibilities.md ADF-COVERS 配置先カタログ「正規所有 Design の該当節」
- recommended_route: inspect 経由で対応節の追記または宣言の削減（(1a) は所有者重複解消を含む）
- ng_classification: 今回修正対象（af12b454 由来の宣言）

#### F-09: 旧責務分類語彙・DEC-036 権威参照の残存
- category: 陳腐化参照（語彙移行の追随漏れ）
- target: `docs/designs/authoring/command-file-format.md:40`
- evidence: 「責務分類（semantic 担当 / deterministic 委譲先 / 知識提供）は DEC-036 の分類と…」— (a) DEC-036 決定(1) の二分法は DEC-048 が部分置換済み、(b) v4-responsibility-boundaries.md:169「旧語彙…を正典参照として残存させない」、(c) skills/ 配下 13 Design は RA-004（4e3a680a）で後継節参照へ移行済み。本行のみ旧語彙 3 区分を再掲し後継参照がない（親による再検証済み）
- severity: medium / confidence: high
- source_of_truth: DEC-048（部分置換）、v4-responsibility-boundaries.md:156-171「v4 責務分類語彙の後継」節、RA-004
- recommended_route: 表現是正候補（DEC-048＋後継節参照へ付け替え、括弧内旧語彙列挙の除去）
- ng_classification: pre-existing（行自体は旧来）ただし RA-004 語彙移行完了直後の追随漏れとして今回修正対象とする判断も正当

#### F-10: 「Definition Amendment PR」裸表記と用語政策の緊張
- category: Design間矛盾（語彙整合）
- target: `docs/designs/responsibilities/document-type-responsibilities.md:330`（用語政策）対 `docs/designs/commands/case-revise.md:25,32,36`、`docs/designs/foundations/system.md:172-177`、`docs/designs/workflows/v4-lifecycle-state-machine.md:49,61,69`、`docs/designs/skills/agentdev-git-worktree.md:27`
- evidence: 用語政策（:330）と prh 辞書は「Definition Amendment PR」→「設計修正PR」への置換を登録済み（親により prh 辞書・政策文を再検証済み）。一方 delta 内 RA-010（c587d672）は 4 Design 本文の「Amendment PR」を「Definition Amendment PR」へ機械置換し、完全形が裸のまま残る。正式名称裸使用は政策の基本形禁止（:316）とも緊張し、lint 恒常指摘源になる
- severity: low-medium / confidence: medium
- source_of_truth: document-type-responsibilities.md:316/330（用語政策・prh 正）、REQ-062-003、REQ-083-003
- recommended_route: 表現是正候補（「設計修正PR（Definition Amendment PR）」併記形または「設計修正PR」へ統一）
- ng_classification: 今回修正対象（delta 内 RA-010 由来の中間形残存）

#### F-11: Wave 進行の現在形記述・後継 Decision 非言及
- category: 陳腐化参照
- target: `docs/designs/foundations/v4-responsibility-boundaries.md:133-136`
- evidence: 「処遇判定…は Wave 2-5 が実行する」（完了後も未実施の現在形）、「DEC-044 決定3 の後継 Decision は Wave 2-1」（後継 Decision は既に DEC-052 として存在するが非言及）
- severity: low / confidence: medium
- source_of_truth: DEC-052、REQ-103-029（有限完了）
- recommended_route: 表現是正候補（DEC-052 参照の確定 + 完了形への訂正）
- ng_classification: 今回修正対象（Wave 2-1/2-5 完了後に未追随）

#### F-12: v3-v4-crosswalk verification スコープ列挙の欠落
- category: Design間矛盾（割当漏れの疑い）
- target: `docs/designs/foundations/v3-v4-crosswalk.md:64`
- evidence: 「REQ-103-001〜007、010〜013、026〜031 の verification も…」— REQ-103-014/015（TS-009）と 023/024/025（TS-013/TS-014）が列挙から欠落。018/019/020/021/022 は各 Design・IR に割当済みだが 014/015/023〜025 の design レベル検証所有記述が docs/designs/ に見つからない（Wave-3 横断整合の実施記録は Report 側）
- severity: low / confidence: low-medium
- source_of_truth: REQ-103 受け入れ条件対応表（AC-13/14=TS-009、AC-20/21=TS-013/TS-014）
- recommended_route: 観察メモ（Report 側判定記録との突合で実害の有無を判断。列挙精度のみなら記録のみ）
- ng_classification: 今回修正対象の可能性（b84b623e/546b27db 由来）だが実害不確定

#### F-13: 廃止済み v3 Design への現在形言及
- category: 陳腐化参照
- target: `docs/designs/quality/v4-quality-gate-model.md:93`
- evidence: 「v3 quality/quality-gates.md は本 Design により supersede される。」— 当該 v3 ファイルは現存せず（実体削除済み）、「supersede される」の未完了現在形が陳腐化
- severity: low / confidence: medium
- source_of_truth: crosswalk-inventory.md（supersede 実行済み行）
- recommended_route: 表現是正候補（「supersede した（吸収完了）」への時制訂正）
- ng_classification: pre-existing

#### F-14: 行番号参照のずれ
- category: 陳腐化参照
- target: `docs/designs/authoring/vocabulary-registry.md:73`
- evidence: 「v4-standard-lifecycle L13-21 への意味参照リンク行」— 現行の当該節は L14-23（1-2 行のずれ）
- severity: low / confidence: medium
- source_of_truth: v4-standard-lifecycle.md:14-23
- recommended_route: 表現是正候補（行番号参照を節名参照へ置換。行番号参照は陳腐化しやすい）
- ng_classification: pre-existing

#### F-15: v4 系 8 Design の「後続 Sequence」boilerplate（将来計画混入・低）
- category: 将来計画混入
- target: `v4-operating-model.md:14`、`v4-responsibility-boundaries.md:14`、`v4-runtime-execution-model.md:12`、`v4-durable-state-and-recovery.md:14`、`v4-quality-gate-model.md:15`、`v4-standard-lifecycle.md:12`、`v4-lifecycle-state-machine.md:13`、`v4-traceability-model.md:13`
- evidence: 「既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。」— REQ-103 全面収束完了後の現時点で無期限の「後続 Sequence」宣言が現行仕様文として残存。REQ-103-029 と緊張
- severity: low / confidence: low-medium
- source_of_truth: REQ-103-029、v3-v4-crosswalk 処遇実行原則
- recommended_route: 観察メモ（一斉文言修正は肥大。収束完了後の文言への更新は別課題化候補）
- ng_classification: pre-existing

### Decision・guides・README

#### F-16: DEC-052 部分置換反映の非対称（docs/README.md 注記欠落 + DEC-044 superseded_by 欠落）
- category: 索引不一致（部分置換記録様式との不整合）
- target: `docs/README.md:146`（DEC-044 行）、`docs/decisions/DEC-044.md:8-9`
- evidence: docs/README.md の DEC 表では部分置換済み accepted DEC 行に注記を付与する慣行が一貫（DEC-028:130、DEC-036:138、DEC-040:142、DEC-041:143〔本 delta 窓で追加〕、DEC-043:145、DEC-045:147）だが DEC-044 行のみ DEC-052 による部分置換注記がない（親による再検証済み）。また frontmatter も同一形態の部分置換済み accepted DEC（DEC-028/036/045/041）がすべて `superseded_by` を持つなか DEC-044 のみ `supersede_note` のみ。同一窓の DEC-041 側は整備済みで DEC-044 側が未整備
- severity: medium / confidence: high（注記不在は機械確認済み）/ 規範要求性は medium
- source_of_truth: decision-lifecycle.md「部分置換の記録様式」+ DEC-028/036/040/045/041 の前例、DEC-044.md:8 supersede_note
- recommended_route: 表現是正候補（docs/README.md:146 へ注記追加、DEC-044 frontmatter へ `superseded_by: DEC-052` 追加の要否は RA 判定）
- ng_classification: 今回修正対象（delta 窓 d052d6fd の反映漏れ）

#### F-17: command-selection.md の case-open 出力表記が REQ-030・req-case-flow.md と不整合
- category: 索引不一致（guides 間不整合・追随漏れ）
- target: `docs/guides/command-selection.md:13`
- evidence: 「REQ ファイルまたは要件docがある | /agentdev/case-auto（内部 lifecycle の case-open 段階） | GitHub Issue」— req-case-flow.md:36（本 delta 窓で更新）は case-open 出力「GitHub Issue（Root Case）、Definition Package、設計PR（実変更がある場合のみ）」、正（REQ-030.md:3,12,21-22）も同じ（親による再検証済み）。隣接行 :12 は「Root Case、Definition Package と実行構造」と表記揺れ
- severity: low-medium / confidence: medium-high
- source_of_truth: REQ-030-002/003/010、req-case-flow.md:36
- recommended_route: 表現是正候補（:13 の出力列を REQ-030 整合表記へ更新）
- ng_classification: 今回修正対象（delta 窓の追随漏れ）

#### F-18: docs/README.md の Design 索引が実在 Design 5 件を欠落（選択掲載基準不在の drift）
- category: 索引不一致（README 索引 内容過多・不足の構造論点）
- target: `docs/README.md` Design 各節（:162-233）
- evidence: 実在かつ designs/README.md（正）に registered な Design のうち `foundations/multi-host-canonical-model.md`、`quality/textlint-quality-runtime.md`、`integrity/prose-quality-sentinel-checks.md`、`workflows/issue-title-policy.md`、`workflows/issue-lifecycle-records.md` の 5 件が docs/README.md 一覧にない（親による双方向 grep 再検証済み: 5 件とも readme=0）。いずれも比較的最近の追加で追随停止の drift 徴候。逆方向（記載→実在）は全リンク解決済み
- severity: medium / confidence: high（事実）/ medium（違反性）
- source_of_truth: docs/README.md:181「完全一覧は Design インデックスを正とする」・designs/README.md
- recommended_route: (a) 5 件の追随追記、または (b) 分割誘導（docs/README.md の Design ドメイン別一覧を廃止し designs/README.md へ完全委譲。「主要 Design」選択掲載の基準が文書化されておらず drift を構造的に防げないため (b) を推奨）
- ng_classification: pre-existing（蓄積 drift。本 delta 窓の REQ-099/REQ-103 周辺で拡大）
- docs-check route 候補: docs/README.md Design 記載と designs/README.md の双方向差分検査（AUTOGEN 対象拡張または新規 IR）

#### F-19: DEC-013 frontmatter 除去に伴う本文・索引説明の未同期
- category: 索引不一致（frontmatter と本文・索引の同期漏れ）
- target: `docs/decisions/DEC-013.md:56`（および :43）、`docs/decisions/README.md:265`
- evidence: delta 窓（aafcfa16 RA-005）で frontmatter related_reqs が `[REQ-028, REQ-010]`→`[REQ-010]` に変更されたが、(1) 本文「関連情報」は「根拠要件: REQ-028（…）」を retired 表記・retired/ パスなしのまま残留（親による再検証済み）、(2) decisions/README.md:265 説明列も「関連 REQ-028 の後継は本 DEC-013」を REQ 列リンク削除後も残留。他行（DEC-007/017/022/030）は retired REQ を `(retired)` リンク付きで併記する慣行で、DEC-013 行のみ「言及あり・リンクなし」の非対称
- severity: low / confidence: high（不整合の事実）/ medium（処遇意図）
- source_of_truth: DEC-013 frontmatter（updated 2026-10-08）、numbering-policy.md:82-88
- recommended_route: 表現是正候補（:56 を retired/ パス付き「RETIRE 済み」明示へ、README:265 説明列も整序）
- ng_classification: 今回修正対象（delta 窓内の同期漏れ）

#### F-20: DEC-022 本文言及残存と retired REQ 取り扱いの非対称
- category: 索引不一致（軽微）
- target: `docs/decisions/DEC-022.md:73`（本文「REQ-046/010/045/047/029 の更新」）、`DEC-022.md:7`（frontmatter）
- evidence: 同窓で REQ-045（retired）を frontmatter から除去したが、(1) 本文「結果、影響」に REQ-045 言及が残留、(2) 同じ retired の REQ-046 は frontmatter と索引行に (retired) 併記のまま保持。retired REQ の保持/除去基準が同一 frontmatter 内で不揃い
- severity: low / confidence: medium
- source_of_truth: retired REQ の related_reqs 保持基準（未文書）
- recommended_route: 観察メモ（保持基準を決め DEC-013/DEC-022 双方へ適用。本文の結果・影響は歴史記述として許容の判断も可能）
- ng_classification: 本文言及は pre-existing、frontmatter REQ-046 保持は pre-existing（REQ-045 除去との非対称のみ今回窓の境界事象）

#### F-21: docs/README.md DEC 表の supersede 注記全文埋め込み（README 内容過多）
- category: README 索引 内容過多
- target: `docs/README.md:101-155`（特に :130 DEC-028、:138 DEC-036、:147 DEC-045）
- evidence: 索引テーブルのタイトル列に部分置換の規範的詳細（どの決定を誰が置換し何を維持するか、status 維持宣言、後継 Design の節名まで）を全文埋め込み（DEC-036 行は索引 1 行として約 400 字超）。同一情報の正は各 DEC frontmatter と decisions/README.md Decision Map
- severity: low-medium / confidence: medium
- source_of_truth: REQ-001 文書責務、guides/README.md:19 導線原則、decisions/README.md:73
- recommended_route: 分割誘導候補（「タイトル＋superseded フラグ」程度へ縮約し詳細への導線リンクへ差替。AUTOGEN 生成元調整を伴うため RA 判定推奨）
- ng_classification: pre-existing（delta 窓の DEC-041 注記追加で増大傾向）

#### F-22: decisions/README.md に DEC-018 欠番の明記なし
- category: 索引不一致（軽微）
- target: `docs/decisions/README.md`（全般）
- evidence: DEC-018 は実証 Case 撤回で物理削除済みの欠番（reports/experiment-case-withdrawal-inventory.md、v3-v4-crosswalk.md:53）。numbering-policy.md:56「欠番は各 README、索引類で『欠番』として明記し」だが decisions/README.md に言及なし
- severity: low / confidence: low-medium
- source_of_truth: numbering-policy.md:56（ただし同「既知の欠番」節は REQ 欠番のみ列挙し DEC 欠番レジストリを持たない）
- recommended_route: 観察メモ（明記要否の判定。REQ 欠番の README 明記例に倣うなら追記）
- ng_classification: pre-existing

#### F-23: artifacts-and-state.md の状態モデル制約が出典非明示
- category: guides 範囲超過（弱）
- target: `docs/guides/artifacts-and-state.md:147-155`
- evidence: 「REQ / Design の状態管理は Issue ラベル、GitHub Project で行う」「frontmatter や status フィールドによる状態管理は行わず…」等の規範的制約を列挙するが節内に REQ/Decision の出典参照がない
- severity: low / confidence: low
- source_of_truth: 正は REQ-049/REQ-008 系（推定）
- recommended_route: 観察メモ（出典参照の付加または節の所有者明記）
- ng_classification: pre-existing

#### F-24: intake-learning-backlog-flow.md の 13項目形式が出典非明示
- category: guides 範囲超過（弱）
- target: `docs/guides/intake-learning-backlog-flow.md:86-87`
- evidence: 「13項目形式で記録する。問題事象、…タグ」と学習エントリ形式を列挙するが所有者への参照がない（REQ-038 は形式を所有せず Design/SKILL 側へ委譲）
- severity: low / confidence: medium
- source_of_truth: learning-pipeline 系 Design/SKILL（推定）
- recommended_route: 観察メモ（形式規定の正への参照付加）
- ng_classification: pre-existing

#### F-25: multi-host-operations.md の日付付き実績スナップショット埋め込み
- category: 履歴混入（軽微・構造的緩和済み）
- target: `docs/guides/multi-host-operations.md:24-31, 93`
- evidence: 「Wave 2 接続実装を統合した main（2026-10-02 時点）」「全公開 command の対応表（2026-10-02 時点、13件）」等の日付付き検証実績スナップショットを案内ガイドに埋め込み。ただし :113-124 で再生成手順を自前定義しており汚染は構造的に緩和済み
- severity: low / confidence: low-medium
- source_of_truth: guides 案内層原則
- recommended_route: 観察メモ（MOVE 候補: 実測状態を knowledge 側へ置き guide は導線化）
- ng_classification: pre-existing

### 配布物（STEP-3-1 機械検査由来、lint_skills 検出）

#### F-26: agentdev-epic-tracker SKILL.md description が上限超過
- category: 配布物構造（description 長上限違反、RU-0018 層1）
- target: `src/common/skills/agentdev-epic-tracker/SKILL.md:3`（description 610 文字 > 個別上限 600）
- evidence: lint_skills NG「description is 610 chars, exceeding the individual limit 600 (検証不通過, RU-0018 層1)」。前回診断時点（6d3c9134）から不変（親による確認済み）
- severity: low-medium / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層1）
- recommended_route: description 縮約（136 文字程度の削減）
- ng_classification: pre-existing

#### F-27: agentdev-issue-management references が行数上限超過・目次なし
- category: 配布物構造（references TOC 規則違反、RU-0018 層2）
- target: `src/common/skills/agentdev-issue-management/references/issue-operation-safety.md`（346 行 > 300、目次なし）
- evidence: lint_skills NG「references file exceeds 300 lines (346) without a table of contents (RU-0018 層2)」
- severity: low-medium / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層2）
- recommended_route: 目次追加または分割
- ng_classification: pre-existing

#### F-28: SKILL description 総量の集計予算超過（傾向管理）
- category: 配布物構造（aggregate budget WARNING）
- target: `.opencode/skills/agentdev-*/SKILL.md` 50 ファイル（総量 18600 文字、平均 372 > 予算 350×50=17500）
- evidence: lint_skills WARNING「aggregate description budget exceeded: total 18600 chars across N=50 (avg 372) > 350*50=17500 (warn, 傾向管理, RU-0018 層1)」
- severity: low / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層1 傾向管理）
- recommended_route: 観察メモ（新規・更新 skill の description 縮約傾向管理。F-26 の是正も寄与）
- ng_classification: pre-existing

## docs-check route 判定（STEP-3-2）

- F-01: REQ 内 AC 範囲記述（「AC-01 から AC-NN まで」型）と AC 表定義の一致機械検査 — 新規 IR 候補（検査対象は限定、誤検出には AC 表前置きとの比較を実装）
- F-16: docs/README.md DEC 表の部分置換注記有無と Decision Map（supersedes 关係）の整合検査 — 新規 IR または check_integrity 拡張候補
- F-18: docs/README.md Design 記載と designs/README.md の双方向差分検査 — AUTOGEN 対象拡張（readme-design-summary の自動生成）または新規 IR 候補
- F-26〜F-28: 既存 lint_skills が所有（検出済み。是正対象）

## 観察メモ（対応不要・false positive 寄り）

- 旧行番号帯参照（自己説明付き）: `docs/requirements/REQ-003.md:56`（REQ-003-055/056、後継 REQ-096 明示）、`docs/requirements/REQ-082.md:12`（REQ-003-030〜054、当時の行番号帯と文脈明示）、`docs/requirements/retired/REQ-013.md:28`（REQ-006-040 dangling、:47 に履歴注記済み）— いずれも移管記録・履歴説明として正当。IR-067（旧行番号引用）の機械検査拡張時に要確認
- retired REQ 参照はすべて廃止注記付きで現行 authority 参照なし（REQ-014/015→REQ-016、REQ-003→REQ-016、REQ-010/036→REQ-028、REQ-095/102→旧 REQ-093、いずれも明示済み）
- Wave 構成ルール三段整合（REQ-061-010/038/047/048 ⇔ REQ-035-016/017 ⇔ REQ-034-012 系）は矛盾なし
- REQ-103 と 11 Design の design 宣言のうち専用節を備える 7 Design（v4-quality-gate-model、v4-runtime-execution-model、v4-durable-state-and-recovery、v4-responsibility-boundaries、v4-standard-lifecycle、vocabulary-registry、v3-v4-crosswalk、custom-tool-contracts の所有分担）は相互に単一所有を明示し重複なし（F-08 の 4 件を除く）
- git-error-messages.md 等 code fence 内テンプレート文言の見出し重複は誤検出（配布物構造異常なし。BOM・CRLF/LF 混在・未閉鎖 code fence とも 0 件）

## 既知 defer 項目の状況（前回 20261006T151122Z 残置分）

| 項目 | 状況 | 証拠 |
|---|---|---|
| F-07: IR-063:44 retired REQ-046-006 を「現行要件行」と呼ぶ表現 | 変化なし（defer 維持） | delta で当該行は未変更。再評価条件（誤解実害の観測、retired-req-primary-ref 機械検査実装）未発火 |
| F-10: authoring/ 将来拡張余地の重複言及 | 変化なし（defer 維持） | designs/README.md:249・command-file-format.md:17 とも文言変更なし。方針決定の条件未発火。ただし F-09（同ファイル :40 の旧語彙残存）は別論点として今回新規検出 |
| F-11: docs/README.md 要件欠番説明の内容過多 | 変化なし（defer 維持） | numbering-policy.md:64-70 と docs/README.md:23-26 の構図は不変（REQ-087/092/093 は retired 実体ありで欠番ではなく廃止扱い、整合） |
| GR-05: supervisor-credential-bridge.md:115 実測記録埋め込み | 変化なし（defer 維持） | 実測記録本文は残留（節再構成ありだが本質不変）。MOVE/REFERENCE 候補の性質不変 |
