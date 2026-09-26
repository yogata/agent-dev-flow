# inspect-docs finding 20260926T180630Z

## サマリ

- スキャン対象: REQ 55件（retired 14件）／ Decision 43件（superseded 9件）／ Design 177件／ guides 13件／ README（root・docs・decisions・guides・requirements・designs）／ 配布物（.opencode/commands/agentdev/ 15件・.opencode/skills/agentdev-* 50件、src/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委譲し、親が fan-in 統合。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 31件（NEW）。severity 内訳: high 0件／ medium 11件／ low 20件
- 機械的検査は全面クリーン: check_integrity NG 0（Warning 11件は本 finding に取り込み）、content corruption 0 違反、BOM/CRLF 混在 0、AUTOGEN 鮮度 0、Design frontmatter 0、README 索引とコマンド実在一致
- 既知 defer・baseline 項目との重複は排除済み（「KNOWN（継続確認）」節参照）

## 検出事項リスト

### REQ 体系（16件）

#### RQ-01: REQ-003 が廃止済み REQ-016 を現行所有者として無注記で列挙
- **category**: REQ参照ID整合性（廃止REQの現行参照）／現行廃止境界
- **target**: docs/requirements/REQ-003.md:12, :67
- **evidence**: 「caller 統合契約は REQ-014/015/016 が所有する」。REQ-016 は 2026-09-20 RETIRE 済み。REQ-014.md:12 と REQ-015.md:18 は「廃止済み REQ-016」と注記するが、REQ-003（updated: 2026-08-19、RETIRE 前のまま）は無注記
- **severity**: medium / **confidence**: high
- **source_of_truth**: retired/REQ-016.md:39-43（移行先宣言）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-02: REQ-014 の「REQ-082-006〜040」範囲引用がファントム（行空間は 001〜025）
- **category**: REQ参照ID整合性（ファントム範囲引用）
- **target**: docs/requirements/REQ-014.md:14, :50
- **evidence**: REQ-082 の行空間は REQ-082-001〜025 で終端。026〜040 は存在しない。範囲表記（〜）のため機械検査（行 ID 直接照合）は非検出
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs/requirements/REQ-082.md:21-45（最終行 REQ-082-025）
- **recommended_route**: intake（docs-check route 候補: 範囲表記を展開する行 ID 存在検査）
- **ng_classification**: pre-existing
- **notes**: baseline ファントム（REQ-003-030 等）とは別件

#### RQ-03: REQ-014-015 が審議ロジックの単一所有を移動後の旧所有者 REQ-003 へ案内
- **category**: 第一参照導線（移動後の旧所有者参照）
- **target**: docs/requirements/REQ-014.md:34（REQ-014-015）
- **evidence**: 「成立条件の導出、指摘の重要性判定、本質的争点への整理、収束判定のロジックは adversarial-review 側（REQ-003、…）が単一所有」。当該ロジックは 2026-09-15 に REQ-082 へ分離移動済みで、REQ-014 自身の目的節（:13-14）は REQ-082 を指しており文書内不一致
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs/requirements/REQ-082.md:12,14（目的）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-04: 「横断整合の恒常契約」の所有宣言に対する受け皿要件行が REQ-015 に存在しない
- **category**: 現行/廃止/世代境界（世代間で孤立した要件）
- **target**: docs/requirements/REQ-015.md:18（目的）、docs/requirements/REQ-014.md:12
- **evidence**: 両目的節が「横断整合の恒常契約は REQ-015 が所有する」と宣言するが、REQ-015 の要件行 001〜012 は review 挿入境界と停止伝播のみで該当行なし。対象外節（:46）は「横断整合確認（廃止済み REQ-016・完了時点検証として記録）」と退ける。retired REQ-016-008/009/010（横断是正義務・historical 記録・意味不変）に対応する現行側の行が確認できない
- **severity**: medium / **confidence**: medium
- **source_of_truth**: retired/REQ-016.md:39-43（移行先宣言「REQ-015 の既存契約が所有する」）
- **recommended_route**: intake（req-define 再壁打ち候補）
- **ng_classification**: pre-existing
- **notes**: 要ヒューマンレビュー。REQ-014-011（所有者マトリックス行）が部分的に代替する可能性があり、「既存契約」の解釈次第で重大度変動

#### RQ-05: REQ-035 対象外節が superseded DEC-015 をタイトル引用（無注記）
- **category**: Decision 引用（superseded 無注記参照）
- **target**: docs/requirements/REQ-035.md:40
- **evidence**: 対象外節で Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」（= DEC-015、superseded by DEC-036）を注記なしで引用。REQ-002 側の同一引用（REQ-002.md:47）は目的節 :16 で「既知の参照」と自己記録済みだが REQ-035 側には何もない
- **severity**: low / **confidence**: medium
- **source_of_truth**: docs/decisions/README.md（DEC-015 superseded by DEC-036）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-06: REQ-015 の updated メタデータと本文記述の時間矛盾
- **category**: メタデータ整合
- **target**: docs/requirements/REQ-015.md:5
- **evidence**: frontmatter `updated: "2026-08-24"` に対し本文 :18 が 2026-09-20 の REQ-016 RETIRE 事象を記録（本文編集が updated 以降）
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-010（メタデータ整合の原則的根拠）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-07: REQ-034-007/008/009 の行レベル重複定義
- **category**: DUPLICATE（行レベル）
- **target**: docs/requirements/REQ-034.md:25-27（REQ-034-007/008/009）
- **evidence**: 007 と 009 が「case-open/case-ready/case-close を Workflow Skill の委譲契約で委譲・load 指定・実装本体複製禁止」を重複定義。008 と 009 は「内部 lifecycle 段階の public contract の正規文書は Command Design…両者不一致時は Command Design を正とする」を逐語重複
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-002-039（同一規範の複数正本禁止）、REQ-002-041（重複解消）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-08: REQ-034-008/009 の「Command Design を正とする」条項が正典優先順位と緊張
- **category**: DRIFT（横断契約矛盾候補）
- **target**: docs/requirements/REQ-034.md:26-27（REQ-034-008/009）
- **evidence**: 「両者不一致時は Command Design を正とする」。REQ-001-020 と REQ-036-030 は「現行 REQ > 承認済み Decision > Design > guides」優先順位を正典化。起源は docs/designs/foundations/system.md:106（Workflow Architecture Inventory）
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-001-020、REQ-036-030
- **recommended_route**: intake（req-define 再壁打ち候補）
- **ng_classification**: pre-existing
- **notes**: 要ヒューマンレビュー。REQ-002-034 型の所有委譲と解し得るが、例外である旨の根拠宣告が REQ 側にない点が問題

#### RQ-09: REQ-034-025 の god-row（約 1,500 字の単一行）
- **category**: SPLIT（行粒度）
- **target**: docs/requirements/REQ-034.md:43（REQ-034-025）
- **evidence**: orchestration stage 定義・直列化要因・収束定義・再構成・局所直列化・例外列挙が 1 行に約 1,500 字で埋め込み。検証可能性と保守性が行単位で低下
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-044（分割予兆の定量検知）、REQ-001-048（要件行の妥当性）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 行長への明文上限なし。内容自体は主題内

#### RQ-10: 一回限りの Case 完了条件・作業記録が恒続要件行として残存
- **category**: RETIRE 相当（作業完了条件の残存）
- **target**: docs/requirements/REQ-090.md:24-25（REQ-090-007/008）、docs/requirements/REQ-091.md（REQ-091-006）、docs/requirements/REQ-090.md:42（適用範囲）
- **evidence**: REQ-090-007「特定 Design ファイル 6箇所の修正完了状態」、REQ-090-008「Jev 実装開始直前の最新 main に v4.0.2 tag が存在すること」、REQ-091-006「当該 Case の完了報告への検証結果包含」、適用範囲「REQ-089 欠番に伴う採番整合（欠番記録3ファイル、採番スクリプトの最小修正、新規 REQ は REQ-090）」。恒常状態として検証不能な作業履歴
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-001-002（作業手順は対象外）、REQ-001-065（事実記録は Report）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-11: 現行本文への履歴記述残存（集約）
- **category**: DRIFT（履歴記述残存）
- **target**: docs/requirements/REQ-002.md:11（編集指示文「…を加える」の残存・最も明確）、REQ-002.md:16、REQ-006.md:21（履歴文脈段落）、REQ-009.md:44（REQ-009-044 括弧内移行記録）、REQ-017.md（REQ-017-002 括弧内移行記録）
- **evidence**: REQ-001-014 は現行本文の「過去前提・移行経緯・再編工程」を禁止し、REQ-001-015 は履歴を版管理等へ分離。REQ-002:11 は実行済み編集指示文であり擁護困難
- **severity**: low / **confidence**: high（REQ-002:11）／ medium（他）
- **source_of_truth**: REQ-001-014/015
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: REQ-001-013 は廃止参照の「履歴節」を許容するため、ナビ用途のものは擁護可能。REQ-082.md:14 は既知 defer（20260925 F-04）のため本集約から除外

#### RQ-12: 構造 DRIFT（形式の不統一、集約）
- **category**: DRIFT（構造形式）
- **target**: docs/requirements/REQ-082.md:8 / REQ-087.md:8 / REQ-091.md:8（frontmatter 直下の H1 重複）、docs/requirements/REQ-092.md:9,20,30（テンプレートコメント `<!-- 【必須】 -->` 残存）
- **evidence**: 他 52 ファイルは `## 目的` 開始で H1 なし。REQ-092 はテンプレートの必須マーカーを消去せず保存
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-046（標準構成）
- **recommended_route**: intake
- **ng_classification**: pre-existing（H1）／今回修正対象（REQ-092 テンプレートコメントは 2026-09-26 追加ファイル由来）
- **notes**: REQ-008-059 の表行でなくセクション化（REQ-008.md:80-88）は既知 defer（20260901 F-12＝20260925 F-05）のため除外するが、本診断で「baseline ファントム REQ-008-059 の実因はセクション形式化」という説明が確定した点を記録する

#### RQ-13: 説明なき行欠番の集約（構造観察）
- **category**: 構造観察（INFO）
- **target**: REQ-001（029,036,037,045）、REQ-003（025,027）、REQ-006（110）、REQ-011（004）、REQ-046（004,005）
- **evidence**: 大口欠番（REQ-002 021-029/032、REQ-003 030-054、REQ-010 013-061）は Design/DEC 側で説明済みだが、上記の単発欠番は根拠が git 履歴のみ。行単位の廃止台帳がコーパスに存在せず、baseline ファントム引用の温床構造
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-013（文書級の規定のみ。行級の対応物なし）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### RQ-14: REQ-053-041 に Windows 編集運用手順（作業手順・実装手段）が要件行として存在
- **category**: 文書分類一貫性（Design 分離基準違反: 作業手順の要件行化）
- **target**: docs/requirements/REQ-053.md:57（REQ-053-041）
- **evidence**: 「PowerShell 標準 cmdlet やリダイレクトによる一括読み書きを避け、edit、node readFileSync/writeFileSync…を用いること」。同一内容は AGENTS.md と docs/knowledge/windows-powershell-bulk-io-corruption.md が正本的に保持しており、文章品質契約（REQ-053）の主題とも無関係な実装手段指定
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-001-002（作業手順は対象外）、REQ-056（知識層）
- **recommended_route**: intake（MOVE/RETIRE 候補。知識層への重複正本でもある）
- **ng_classification**: pre-existing

#### RQ-15: REQ-090-011 に実装詳細（gateway スキーマ経路・検証手順）が要件行化
- **category**: 文書分類一貫性（Design 分離基準違反: 実装詳細）
- **target**: docs/requirements/REQ-090.md:26（REQ-090-011）
- **evidence**: gateway スキーマ経路 `questions[].score.criteria`、adapter 単体テストの内容指定、マージ前の実 gateway 実呼出 1 回という手順詳細を要件化。同 REQ-090-006 は「filename、個別 field 名、snapshot 物理表現は実装設計時の自由度」と Design 委譲しており基準が逆行
- **severity**: medium / **confidence**: medium
- **source_of_truth**: REQ-001-067、REQ-090-006
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 安定契約例外候補（score 形式の意味契約担保という擁護も可能。手順詳細部分は明確に Design 側）

#### RQ-16: REQ-008-051〜054 の frontmatter 字段要件行固定が対象外節の Design 委譲と境界揺れ
- **category**: 文書分類一貫性（Design 分離基準の境界揺れ）
- **target**: docs/requirements/REQ-008.md:（REQ-008-051〜054）
- **evidence**: RU frontmatter 必須4フィールド、ISO 8601、generated_at >= agreement_confirmed_at、sources[].type/chat 規則を字段単位で要件化。対象外節（REQ-008.md:105）は「frontmatter、フィールド名、値一覧の詳細スキーマ（Design）」と委譲。二段階承認の意味契約（052）は要件性が高いが、フィールド名・形式の指定は委譲領域と重複
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-008.md:105、REQ-001-067
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 安定契約例外候補。意味契約と物理 schema の線引きは corpus 全体でも曖昧

### Design（4件）

#### DS-01: agentdev-traceability Design が superseded DEC-017 を現行根拠として引用
- **category**: 権威の逆転（superseded Decision の現行根拠化）
- **target**: docs/designs/skills/agentdev-traceability.md:15
- **evidence**: 「正規成果物を直接走査し、対応関係をその場で解決する（REQ-012、DEC-017。前身機能の廃止と移行の経緯は DEC-017 が記録する）」。DEC-017 は DEC-037 により superseded 済み。ファイル内に superseded 注記・DEC-037 への誘導がなく（DEC-037 は 0 件）、designs/README.md:114 の当該 skill 行は「（REQ-012、DEC-037）」と本文と索引の権威指定も不一致
- **severity**: medium / **confidence**: high
- **source_of_truth**: DEC-037、docs/designs/foundations/v4-traceability-model.md（直接走査は「DEC-017 決定2 の維持」として DEC-037 配下で搬送）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### DS-02: system.md（コマンド体系定義）から /agentdev/issue が完全に欠落
- **category**: 網羅欠落（生成・ライフサイクル・ドリフト）
- **target**: docs/designs/foundations/system.md（コマンド表 :28-66、IO 一覧 :112-134、個別節 :133-369）
- **evidence**: system.md 全体で `agentdev/issue` は 0 件（`issue` 言及も :186 の skill 依存リストのみ）。実コマンド .opencode/commands/agentdev/issue.md と accepted の commands/issue.md（REQ-049、updated 2026-09-19）が存在し、system.md は 2026-09-24 更新。他の 12 公開コマンド・内部 lifecycle 5 段階・/repo/docs-check は全て掲載され、パイプライン外の third-party-sync（:357）も掲載済み
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-049（追跡Issue管理機構）、docs/designs/commands/issue.md、プロジェクト README のコマンド列挙
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 意図的スコープ除外を示す記述（適用範囲宣言 :416-420 等）は発見できず。除外意図の文書化欠如自体が問題

#### DS-03: v4-traceability-model.md が物理削除済み v3 Design を「移行期間」現在形で参照
- **category**: 生成・ライフサイクル・ドリフト（dangling 参照）
- **target**: docs/designs/foundations/v4-traceability-model.md:15, :109-125
- **evidence**: 「物理削除と権威移行の実行は crosswalk 第7段（OU-002）が担う」「移行までの間は両 Design の…宣言が重複する（移行期間の許容状態）」と未来形で記述。foundations/traceability-model.md は実在せず、crosswalk-inventory.md:86 は第7段実行済み（2026-09-19）を記録。移行期間は終了済みで :15/:111/:125 は dangling 参照
- **severity**: low / **confidence**: medium
- **source_of_truth**: docs/designs/foundations/references/crosswalk-inventory.md:86
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 移行規則の記録として意図的残置の可能性はあるが、「移行までの間は」の現在進行形記述は読者に未完了と誤認させる

#### DS-04: harness-separation-model.md の DEC-002 引用が兄弟 4 ファイルと異なり後継注記を欠く
- **category**: superseded Decision 引用の注記不一致（check_integrity WARNING 7件の意味検証結果）
- **target**: docs/designs/foundations/harness-separation-model.md:150
- **evidence**: 「DEC-002（OpenCode ソース・プロジェクション分離）: 本 Design の harness 非依存原則を原本とプロジェクションの分離によって物理層で担保する。」と現在形で記述し superseded/後継注記がない。vocabulary-registry.md:28、document-model.md:375、runtime-package-boundary.md:271、workflow-skill-model.md:102 はすべて「この原則は DEC-002 由来、現行の責務体制は DEC-036」と明記
- **severity**: low / **confidence**: high
- **source_of_truth**: DEC-036（本文 :109/:115 は DEC-036 を権威として認識済み）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: check_integrity の accepted-adr-only-citation WARNING 7件のうち 6件（上記兄弟4件＋v3-v4-crosswalk.md:53-54 の DEC-005/007）は「由来＋現行権威明記」または移行記録として正当と判定。本件のみ修正価値あり

### Decision / guides / README（9件）

#### DC-01: DEC-007↔DEC-017 置換チェーンが frontmatter で双方向宣言されていない
- **category**: 横断契約矛盾（supersede チェーンの宣言不整合）
- **target**: docs/decisions/DEC-007.md:1-8（superseded_by frontmatter なし）、docs/decisions/DEC-017.md:1-9,52（frontmatter relations なし、supersedes 宣言は本文のみ）
- **evidence**: 他の 8 件の superseded Decision（002/005/015/029/030/040/043）はすべて frontmatter `superseded_by` を持つが、DEC-007 は本文冒頭の「置換注記」（:10-15）のみ。後継の DEC-017 も frontmatter relations を持たず、supersedes→DEC-007 は本文（:52）のみ
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs/designs/foundations/decision-lifecycle.md:46, :76-77（「superseded_by frontmatter で後継を指す」「frontmatter が SSoT」「双方向からの参照整合」）
- **recommended_route**: intake（docs-check route 候補: frontmatter supersedes/superseded_by 双方向整合検査）
- **ng_classification**: pre-existing
- **notes**: 情報自体は双方の本文に欠落なし。frontmatter 集約検査を素通りする前例となる点が実害

#### DC-02: DEC-015 の superseded_by が主後継 DEC-036 のみで補完後継 DEC-038/039 の逆方向参照がない
- **category**: 横断契約矛盾（多後継時の双方向参照整合の部分欠落）
- **target**: docs/decisions/DEC-015.md:5、docs/decisions/DEC-038.md:18-19、docs/decisions/DEC-039.md:12-13
- **evidence**: DEC-038/039 は frontmatter で DEC-015 を supersedes（補完後継）と宣言するが、DEC-015 側は DEC-036 しか指さない。Decision Map（decisions/README.md:206-207）は両方を記録済み
- **severity**: low / **confidence**: medium
- **source_of_truth**: decision-lifecycle.md:77。ただし多後継時の superseded_by 記録方式（主後継のみか全後継か）は規範が明文でない
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 「主後継のみ記録」慣行の可能性あり違反確定不能。DEC-039.md:50 の本文「DEC-015…本体は v3 として有効のまま保持する」も DEC-015 superseded 済みの現状では文言が陳腐化

#### DC-03: DEC-040 部分置換（決定4のみ置換・決定1〜3維持）と全体 status superseded の意味乖離が本文で無説明
- **category**: 意味整合（superseded＝履歴扱いの原則と部分維持の両立）
- **target**: docs/decisions/DEC-040.md:4-5、docs/decisions/README.md:56, :124
- **evidence**: DEC-044 は「決定4 観測基盤の部分置換。決定1〜3は本 Decision が維持する」（DEC-044.md:13-14,60,87）と宣言。docs/README.md の DEC-040 行は注記するが、DEC-040 本文には注記がなく、decisions/README の表・ビューも無注記。本文置換注記を持つのは DEC-002/007/029 のみで最新の 040/043 は持たない
- **severity**: low〜medium / **confidence**: medium
- **source_of_truth**: DEC-044 frontmatter（SSoT）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 「superseded＝歴史」と解釈した読者が現行有効な決定1〜3（6系統への適用等）を誤って破棄するリスク

#### DC-04: superseded Decision への類推・位置づけ参照の追加事例（既知 F-21 と同型）
- **category**: superseded Decision 参照（既知 F-21 の同型追加事例）
- **target**: docs/decisions/DEC-031.md:12-14（relates-to DEC-002）、docs/decisions/DEC-032.md:28、docs/decisions/DEC-039.md:50（「v3 として有効のまま保持」文言）
- **evidence**: DEC-031 は accepted の現行 Decision として superseded 済み DEC-002（v4 の意味は DEC-036 が再定義済み、DEC-002.md:55-57）を位置づけ参照。DEC-032/039 の「v3 として有効のまま保持」は DEC-036 による置換実行（2026-09-20）後に陳腐化
- **severity**: low / **confidence**: low〜medium
- **source_of_truth**: DEC-002 の supersede 記録、DEC-036 relations、v3-v4-crosswalk の段階的移行条項
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: crosswalk の「処遇実行段階までは v3 を正とする」条項で意図的に維持された文言の可能性があり違反確定不能（F-21 と同様の boundary case）

#### DC-05: DEC-013.md:14 の ID 表記「（DEC-013..057）」が解釈不能
- **category**: 表記・参照正確性
- **target**: docs/decisions/DEC-013.md:14
- **evidence**: 「lifecycle_state × enforcement_mode の 2 軸 5 状態（DEC-013..057）」。DEC-013〜057 という Decision 範囲は意味をなさず、README の関連 REQ 記述から REQ-010-053..057 の誤記と推定
- **severity**: low / **confidence**: medium
- **source_of_truth**: docs/decisions/README.md:226（「REQ-010-053..057 RETIRE」）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### DC-06: DEC-006 の後継宣言が frontmatter relations でなく legacy トップレベル supersedes キー
- **category**: 宣言形式の不統一
- **target**: docs/decisions/DEC-006.md:5
- **evidence**: `supersedes: DEC-005`（トップレベルキー）。decision-lifecycle.md:35「関係は…frontmatter relations フィールドで宣言する」と不整合。DEC-006 は relations 仕様より前の作成で grandfathered とみられる
- **severity**: low / **confidence**: medium
- **source_of_truth**: decision-lifecycle.md:35, :49-77
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 経緯上の例外。改造コスト対効果は低い

#### DC-07: Decision Map が v4 期の frontmatter relations を大部分未反映
- **category**: 索引の意味鮮度
- **target**: docs/decisions/README.md:170-207（Decision Map 表、非 AUTOGEN）
- **evidence**: frontmatter で宣言された relates-to のうち DEC-031→DEC-002、DEC-032→DEC-015、DEC-034→DEC-001、DEC-038→DEC-032/020/011、DEC-039→032/004/036/020、DEC-040→036/038/027/019、DEC-041/042/043/044 の各 relates-to が Map に行を持たない（DEC-012→DEC-036 など v4 由来の行はあるため、スコープ規定は不明）
- **severity**: low / **confidence**: low
- **source_of_truth**: 各 Decision frontmatter relations（SSoT）、AG-014（README は分類ビュー）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 「履歴上の関連」に絞った curate されたビューの可能性あり、欠落＝違反と確定できない

#### GD-01: req-case-flow.md が内部 lifecycle 段階を「コマンド」と現在形で定義
- **category**: 履歴混在（旧 UX 記述の残存）
- **target**: docs/guides/req-case-flow.md:32（case-open「…を作成するコマンド」）、:42、:52、:62、:91
- **evidence**: 同ファイル 3 行目・127 行目と quickstart.md:30-32、glossary.md:10-14 は「内部 lifecycle 段階であり公開コマンドではない（DEC-033）」と明記する一方、各段階の節冒頭定義文は「〜コマンド」と旧 UX の語彙のまま
- **severity**: low〜medium / **confidence**: high
- **source_of_truth**: DEC-033（内部状態遷移の手動順次実行を公開 UX の標準としない）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 節見出しとしての便宜的呼称という解釈も可能だが、案内層の定義文としては誤導

#### GD-02: artifacts-and-state.md の状態モデル制約節が v4 状態機械 Design と衝突しかねない旧記述を現在形で維持し、guides 索引が当該ガイドを「正」と指定
- **category**: クロスレイヤ矛盾（guides vs accepted Design）＋ 案内層スコープ超過
- **target**: docs/guides/artifacts-and-state.md:141-153、docs/guides/README.md:52
- **evidence**: 「AgentDevFlow は全体横断の状態遷移モデルを持たない」「frontmatter や status フィールドによる状態管理は行わず」が現在形で記述される一方、accepted の docs/designs/workflows/v4-lifecycle-state-machine.md は二層状態モデルを定義し durable state enum に「Design status、Decision status、RU/draft lifecycle 等の永続状態」を明示的に含める。また guides/README.md:52 は当該ガイドを「状態モデル制約、`.agentdev/` の位置づけの正」と指定するが、同 :4-8 は自ら「基準は各 REQ/Decision/Design」「案内層」と宣言しており自己矛盾
- **severity**: medium / **confidence**: medium
- **source_of_truth**: v4-lifecycle-state-machine.md（accepted）、guides/README.md:4-8
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 要ヒューマンレビュー。v4 Design 側の段階移行条項によりガイド記述が現行権威下である可能性があるが、ガイドは crosswalk の処遇対象に明示されておらず、「正」指定との組合せで読者誘導リスクが増す

#### GD-03: intake-learning-backlog-flow.md の規範的規則記述に基準参照が付かない
- **category**: guides 導線超過（既知 F-25 と同カテゴリの別ファイル事例）
- **target**: docs/guides/intake-learning-backlog-flow.md:53-54（「inbox 元ファイルは即時削除とする。監査証跡は commit message で確保する」）、:106（「パススルーは不可」）、:113-121（RU 削除ルール表）
- **evidence**: REQ-037/REQ-038/REQ-008 系の契約要約が断言形で並び、多くに行単位の基準参照がない（:132 REQ-049、:117-121 の一部を除く）
- **severity**: low / **confidence**: low
- **source_of_truth**: REQ-037/REQ-038（intake/learning 契約）、guides/README.md:4-5（基準優先）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 要約許容範囲かは F-25（command-selection.md、defer 継続中）と同様の判断余地

### 配布物（STEP-3、2件）

#### DB-01: 配布 skill reference 中の gh CLI 直接呼出記述（IR-053）
- **category**: 配布物統合性（gh-direct-invocation、check_integrity WARNING 取り込み）
- **target**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md:67、src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:58
- **evidence**: Direct gh CLI invocation 'gh issue list' detected — route via the agentdev_gh Custom Tool（IR-053、v2:REQ-0152-001）
- **severity**: medium / **confidence**: high
- **source_of_truth**: IR-053（gh 直接呼出禁止、agentdev_gh Tool 経由）
- **recommended_route**: intake
- **ng_classification**: pre-existing

#### DB-02: 配布 skill reference 中の docs/designs・docs/guides 参照（IR-055 delta）
- **category**: 配布物統合性（runtime-unresolved-reference、check_integrity WARNING 取り込み）
- **target**: src/opencode/skills/agentdev-workflow-inspect-docs/references/scan-and-doc-diagnostics.md:56-57
- **evidence**: New heuristic violation: docs/designs/ reference 'docs/designs/' detected / docs/guides/ reference 'docs/guides/' detected（IR-055 delta from baseline）
- **severity**: low / **confidence**: high
- **source_of_truth**: IR-055（配布物の具体 docs パス参照禁止）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 当該行は診断対象の列挙（スキャン対象カテゴリ定義）であり、意図的記述の可能性はあるが baseline delta として検出されている

## KNOWN（継続確認）

- baseline ファントム引用（check_integrity INFO baseline-known、本次再報告なし）: REQ-002-021、REQ-002-028、REQ-006-021、REQ-010-053。REQ-008-059 はセクション形式化が実因と判明（RQ-12 notes）。REQ-003-030 は REQ-082:14 の移動出典記述に由来
- 既存 defer（inspect-promote 審議待ち、本次再報告なし）: 20260901 F-10/F-12、20260914 F-04/F-05/GUIDE-6、20260925 F-04（REQ-082:14）〜F-25 各件
- KNOWN の変化: DEC-018 欠番（20260925 F-19）は main tree の docs/designs/foundations/v3-v4-crosswalk.md:52 に「DEC-018 欠番」言及が確認された（部分的緩和）するも、decisions/README の欠番説明・retired-table は空のまま

## 推奨アクション

- 全 31 件は `inspect-promote`（`/agentdev/inspect-promote`）での分類・採用判断に委譲する（source_type: inspect）
- RQ-04（横断整合の受け皿不在）、RQ-08（Design 優先例外と正典優先順位）、GD-02（状態モデル制約の「正」指定）は req-define 再壁打ち候補（要ヒューマンレビュー）
- docs-check route 候補（機械検査への落とし込み）: (1) 範囲表記（REQ-NNN-NNN〜NNN）を展開する行 ID 存在検査（RQ-02）、(2) frontmatter supersedes/superseded_by 双方向整合検査（DC-01）、(3) system.md 等のコマンド体系定義と実在コマンドの網羅突合（DS-02）
- クリーン判定（問題なしと確認した観点）: 文書級 MERGE/RETIRE/SPLIT は該当なし（行レベルは RQ-07/RQ-09 で検出）。superseded DEC 引用 7 件中 6 件は正当（DS-04 参照）。配布物の stale command 参照・エンコーディング不整合・Markdown 構文破損は 0 件。root README のワークフロー記述は現行と一致

## 対象外（Out of Scope）

- 文章表層品質（LLM 表現、空虚語、英語混じり等）: 共通 textlint 基盤（agentdev-textlint-guard）の担当領域
- 機械的検査（check_integrity、check_content_corruption、check_design_frontmatter、check_autogen_freshness、BOM/CRLF）が合格済みの領域の再検査
- 既に defer された検出事項の再審査（inspect-promote の責務）
- REQ-008-059（20260901 F-12＝20260925 F-05 として defer 継続中）、REQ-082:14（20260925 F-04 として defer 継続中）の再報告
