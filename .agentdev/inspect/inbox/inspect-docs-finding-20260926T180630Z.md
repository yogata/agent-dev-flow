# inspect-docs finding 20260926T180630Z

## サマリ

- スキャン対象: REQ 55件（retired 14件）／ Decision 43件（superseded 9件）／ Design 177件／ guides 13件／ README（root・docs・decisions・guides・requirements・designs）／ 配布物（.opencode/commands/agentdev/ 15件・.opencode/skills/agentdev-* 50件、src/ 投影）
- 診断体制: STEP-2 意味診断を 3 診断担当（REQ 体系／Design／Decision・guides・README）へ並列委譲し、親が fan-in 統合。STEP-3 配布物整合性検査は親が逐次実行
- 検出件数: 31件（NEW）。severity 内訳: high 0件／ medium 11件／ low 20件
- 機械的検査は全面クリーン: check_integrity NG 0（Warning 11件は本 finding に取り込み）、content corruption 0 違反、BOM/CRLF 混在 0、AUTOGEN 鮮度 0、Design frontmatter 0、README 索引とコマンド実在一致
- 既知 defer・baseline 項目との重複は排除済み（「KNOWN（継続確認）」節参照）

## 審議記録（2026-09-27 backlog-auto stage 2 inspect-promote）

- 処理結果: promote 17 / defer 14 / reject 1（総 32 件。サマリ記載の 31 件は集計不一致で実 32 件）
- promote 済み: RQ-01,02,03,05,06,07,10,11,12 / DS-01,02,04 / DC-01,03,05 / GD-01 / DB-01 → promoted/ へ保存・本ファイルから削除
- reject: DB-02（20260925 F-24 と完全重複・新情報ゼロ。F-24 が追跡継続）
- defer 継続: 下記 14 件（次サイクル再評価）

## 検出事項リスト（defer 残置分）

### REQ 体系（defer 残置 7件）

#### RQ-04: 「横断整合の恒常契約」の所有宣言に対する受け皿要件行が REQ-015 に存在しない
- **category**: 現行/廃止/世代境界（世代間で孤立した要件）
- **target**: docs/requirements/REQ-015.md:18（目的）、docs/requirements/REQ-014.md:12
- **evidence**: 両目的節が「横断整合の恒常契約は REQ-015 が所有する」と宣言するが、REQ-015 の要件行 001〜012 は review 挿入境界と停止伝播のみで該当行なし。対象外節（:46）は「横断整合確認（廃止済み REQ-016・完了時点検証として記録）」と退ける。retired REQ-016-008/009/010（横断是正義務・historical 記録・意味不変）に対応する現行側の行が確認できない
- **severity**: medium / **confidence**: medium
- **source_of_truth**: retired/REQ-016.md:39-43（移行先宣言「REQ-015 の既存契約が所有する」）
- **recommended_route**: intake（req-define 再壁打ち候補）
- **ng_classification**: pre-existing
- **notes**: 要ヒューマンレビュー。REQ-014-011（所有者マトリックス行）が部分的に代替する可能性があり、「既存契約」の解釈次第で重大度変動

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

### Design（defer 残置 1件）

#### DS-03: v4-traceability-model.md が物理削除済み v3 Design を「移行期間」現在形で参照
- **category**: 生成・ライフサイクル・ドリフト（dangling 参照）
- **target**: docs/designs/foundations/v4-traceability-model.md:15, :109-125
- **evidence**: 「物理削除と権威移行の実行は crosswalk 第7段（OU-002）が担う」「移行までの間は両 Design の…宣言が重複する（移行期間の許容状態）」と未来形で記述。foundations/traceability-model.md は実在せず、crosswalk-inventory.md:86 は第7段実行済み（2026-09-19）を記録。移行期間は終了済みで :15/:111/:125 は dangling 参照
- **severity**: low / **confidence**: medium
- **source_of_truth**: docs/designs/foundations/references/crosswalk-inventory.md:86
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 移行規則の記録として意図的残置の可能性はあるが、「移行までの間は」の現在進行形記述は読者に未完了と誤認させる

### Decision / guides / README（defer 残置 6件）

#### DC-02: DEC-015 の superseded_by が主後継 DEC-036 のみで補完後継 DEC-038/039 の逆方向参照がない
- **category**: 横断契約矛盾（多後継時の双方向参照整合の部分欠落）
- **target**: docs/decisions/DEC-015.md:5、docs/decisions/DEC-038.md:18-19、docs/decisions/DEC-039.md:12-13
- **evidence**: DEC-038/039 は frontmatter で DEC-015 を supersedes（補完後継）と宣言するが、DEC-015 側は DEC-036 しか指さない。Decision Map（decisions/README.md:206-207）は両方を記録済み
- **severity**: low / **confidence**: medium
- **source_of_truth**: decision-lifecycle.md:77。ただし多後継時の superseded_by 記録方式（主後継のみか全後継か）は規範が明文でない
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 「主後継のみ記録」慣行の可能性あり違反確定不能。DEC-039.md:50 の本文「DEC-015…本体は v3 として有効のまま保持する」も DEC-015 superseded 済みの現状では文言が陳腐化

#### DC-04: superseded Decision への類推・位置づけ参照の追加事例（既知 F-21 と同型）
- **category**: superseded Decision 参照（既知 F-21 の同型追加事例）
- **target**: docs/decisions/DEC-031.md:12-14（relates-to DEC-002）、docs/decisions/DEC-032.md:28、docs/decisions/DEC-039.md:50（「v3 として有効のまま保持」文言）
- **evidence**: DEC-031 は accepted の現行 Decision として superseded 済み DEC-002（v4 の意味は DEC-036 が再定義済み、DEC-002.md:55-57）を位置づけ参照。DEC-032/039 の「v3 として有効のまま保持」は DEC-036 による置換実行（2026-09-20）後に陳腐化
- **severity**: low / **confidence**: low〜medium
- **source_of_truth**: DEC-002 の supersede 記録、DEC-036 relations、v3-v4-crosswalk の段階的移行条項
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: crosswalk の「処遇実行段階までは v3 を正とする」条項で意図的に維持された文言の可能性があり違反確定不能（F-21 と同様の boundary case）

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
