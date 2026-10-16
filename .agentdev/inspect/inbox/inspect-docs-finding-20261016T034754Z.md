# inspect-docs finding 20261016T034754Z

## サマリ

- スキャン対象: 現行 REQ 72件、retired REQ 19件、Decision 58件（accepted 49 / superseded 9 / proposed 0）、Design 184件、guides 14件、knowledge 35件、README 群（docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/README.md、docs/guides/README.md、root README.md）、Command 18件、Skill 58件（配布・src 正本）。
- 検出事項: 8件。high 0件、medium 2件（DS26, DS27）、low 6件（DS28〜DS33）。
- 診断焦点: 2026-10-15T09:32:52Z（38bc58c7）以降の delta（22 commits。ffa59eac = PR #3727 backlog-auto 一気通貫実行の接続手順と検証用模擬〔Case #3725〕、647451be = REQ 8行追加〔REQ-010-081/082/083、REQ-017-024、REQ-030-028/029、REQ-061-051、REQ-095-004〕と Design 対応、bb848836 = backlog-auto Design の section pointer 化、guides 4件、traceability sidecar 5件、learning capture 5c78cbf1）。全体スキャンも並行実施。
- 推奨経路: 表現是正候補（REQ 行短縮・用語置換・番号再採番）、要ヒューマンレビュー。既知 finding のうち DB02・DS21・GR10 が本 delta 内で解消済みであることを確認。

## 診断基準と被覆

STEP-2 の意味診断は REQ 体系・Design・Decision/guides/README/knowledge の3診断担当へ非同期並列委譲し、親が fan-in した（回収確認: 3担当すべて完了。6観点網羅確認: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT すべてが担当結果で被覆。横断矛盾判定: source-of-truth priority で担当間の判定矛盾なし。重複排除: 同一対象の REQ 担当候補〔C1〜C5〕と Design 担当候補〔D1〜D5〕を統合。既知 defer / false positive 照合実施）。各担当は delta 窓を重点全文読解し、残り corpus を構造スキャン。親は Design/Decision 状態乖離 DRIFT（doc-diagnostics 直接判定カテゴリ）と配布物整合性検査（STEP-3）を逐次で実行した。機械検査は repo root から実行し全て有効結果を取得（MECH01 手順の再維持）。

## 機械検査証拠の採用判断

| 証拠 | 判定 | 根拠 |
|---|---|---|
| check_integrity（repo root、source profile） | 採用 | NG 0 / warning 0 / info 132。scanned: REQ 72、Skill 63、Command 18、Guides 14、Specs 184、RetiredREQ 19、Runtime 83。全 info は baseline-known・exempted・tolerated または OK 観察 |
| check_distribution_boundary（repo root） | 採用 | ok / scanned 482 / hits 0 / failures 0（前回 424 → delta 由来の配布物新規ファイルで増加） |
| check_command_format | 採用 | OK |
| check_templates | 採用 | 全検査カテゴリ OK |
| check_autogen_freshness | 採用 | 索引 6件、鮮度違反 0 |
| check_content_corruption | 採用 | known-corruption-literal 0、stale-reference 0 含む全違反 0 |
| check_skill_rename_symmetry | 採用 | renames 0、path/frontmatter 違反 0 |
| lint_skills | 採用 | AG-005 NG 0。warning 1件（aggregate budget 20517 > 20300、前回 20362 から増加、傾向管理継続）+ prefix INFO 5件（explainer 等の個人 skill、既知） |
| check_extensions | 採用 | failures 0、schema/malformed 0 |
| BOM / CRLF-LF 混在確認（親実施） | 採用 | 配布物 md 271件中 BOM 付き 0件。混在 4件は node_modules 配下 third-party（@types/bun README ×4）のみで配布物対象外 |
| README コマンド索引の実在確認（親実施） | 採用 | root README 索引 18コマンド ↔ 実在 18、command README 定義リンク 18 ↔ 実在 18、完全一致 |

## 処理記録

- 生成時点: 2026-10-16T03:47:54Z（UTC）、main @ 5c78cbf1。
- 本 finding は backlog-auto stage 1（Case #3725 系 E2E 検証後の inspect 系統 [inspect-docs]）として生成。inspect-promote（stage 2）が分類・採否を判断する。
- git 永続化（commit/push）は本 run の実行契約上実施しない（後続工程の責務）。
- 既存 11 finding ファイルは変更・再分類・削除していない（本 run は新規 1 ファイルの追加のみ）。
- 2026-10-16 実施（backlog-auto stage 2 inspect 系統、--auto なし）分類確定: promote 1件（DS33。機械的に一意な表層欠陥〔「16.」重複・番号ずれ〕で修正方向一意のため、promoted/finding-20261016-issue-tracking-design-list-renumber.md へ保存・本ファイルから削除）/ defer 7件（DS26〜DS32。安定契約例外候補・no-action 成立解釈・既知 RQ13〔20261013T090730Z〕家族 defer 方針との処分一貫性により採否未確定。再評価条件: DS26/DS27 は RQ13 再評価時および REQ-061/REQ-010 次回更新時、DS28/DS29 は REQ-010 次回更新時、DS30 は issue-tracking Design・REQ-095 次回更新時、DS31 は case-ready Design・REQ-017 次回更新時、DS32 は REQ-030 次回更新時）。分類は Jev 先行評価（観測 20261016T041350Z-3c9e）＋ adversarial-review 2 stream（証拠系・権限系）convergence 後に全件自律確定（HITL 対象なし）

## 検出事項リスト

### DS26
- category: REQ/Design（新規 REQ 行と Design 対応節の同文重複。Design 分離基準違反〔MOVE: schema field 残留 + report format 残留〕+ DUPLICATE の複合）
- target: `docs/requirements/REQ-061.md:70`（REQ-061-051）、`docs/designs/commands/case-ready.md:95`
- evidence: REQ-061-051 は engine 報告 JSON の内部スキーマフィールド名 `condition_a.warnings` / `detection_unavailable` を列挙し「要約の構造を報告 JSON 契約に合わせ」と報告構造を指定する。case-ready.md:95 が同一規定を圧縮複製し、design 追加情報はほぼない。
- severity: medium
- confidence: medium（報告 JSON 契約への整合は外部接続面の安定契約例外候補。フィールド名列挙自体は高特異性シグナル）
- source_of_truth: REQ-061-051（現行 REQ）
- recommended_route: 表現是正候補（REQ 行を「受入検査の要約生成を engine 報告 JSON 契約に整合させること」程度へ短縮し、フィールド名列挙と報告構造指定を case-ready Design へ集約）または追跡Issue育成。既知 RQ13（REQ-061-048 の観測識別子列挙、defer）と同系パターンの新規発生であり、RQ13 defer 方針に揃えるか本次処置するかの判断を要する。
- ng_classification: 要ヒューマンレビュー（新規行由来だが既知 defer〔RQ13〕との処置整合判断を含む）。
- notes: REQ 担当 C1 と Design 担当 D4(:95) の統合。req-define入力案: REQ-061-051 本文の短縮（詳細の Design 集約）。

### DS27
- category: REQ/Design（新規 REQ 行と Design 対応節の同文重複。Design 分離基準違反〔MOVE: 運用手順詳細残留〕+ DUPLICATE の複合）
- target: `docs/requirements/REQ-010.md:54`（REQ-010-081）、`docs/designs/integrity/integrity-contracts.md:273-275`
- evidence: REQ-010-081 は是正チケット扱い・一括是正候補・check_integrity 補正 commit contingency という運用手順詳細を REQ 行に同梱する。integrity-contracts.md「frontmatter updated 鮮度債務の検出時運用（REQ-010-081）」節（:273-275）がほぼ同文で重複し、REQ 行改訂時の二重管理を生む。
- severity: medium
- confidence: medium（docs-check の検出時運用契約を REQ で宣言する意図の余地）
- source_of_truth: REQ-010-081（現行 REQ）
- recommended_route: 表現是正候補（contingency 手順詳細を integrity-contracts.md 節へ集約し、REQ 行は「鮮度検査の緩和・迂回と updated の乖離恒久化を行わないこと」の契約部に短縮）または追跡Issue育成。
- ng_classification: 要ヒューマンレビュー（新規行由来。Design 対応節との二重管理の解消方向判断を含む）。
- notes: REQ 担当 C2 と Design 担当 D2 の統合。REQ-010 既存行（REQ-010-079 等も濃い）との文体水準差は小さい。

### DS28
- category: REQ 体系（Design 分離基準違反〔内部アルゴリズム残留〕+ 時点情報の REQ 本文混入）
- target: `docs/requirements/REQ-010.md:56`（REQ-010-083）
- evidence: (a)「（既知混入形の確定一致）」の検出アルゴリズム詳細言及。content-corruption-checker.md「known-corruption-literal」節が列挙管理・検出平面・差分化記録まで正所有する。(b)「差分化を確認済みであること」は検証状態の時点情報であり、常時契約を記述すべき REQ 本文に不適合。REQ-010-009（checker 個別ルール等の詳細は Design/skill/script 所有）とも緊張する。
- severity: medium
- confidence: medium
- source_of_truth: REQ-010-083（現行 REQ）、content-corruption-checker.md known-corruption-literal 節
- recommended_route: 表現是正候補（「確認済み」の時点表現を除去し「既存検出平面（content-corruption checker）と差分化された検査クラスを持ち、検出詳細は content-corruption checker Design が所有すること」等へ短縮）。
- ng_classification: 今回修正対象（新規行の本文表現）。
- notes: 「確認済み」が REQ-053-012（決定的検査クラス）への位置づけ確認の意味なら現状維持も解釈可能。付随観察: REQ-010-083 は traceability sidecar・policy.yaml のいずれにも未登録（REQ-010-081/082 は即時登録済みとの対比）。REQ-061-023 により verification 対応作成は case-run/case-close（REQ-021-018）所有のため即違反ではないが、次回 Case 実行での追随確認対象。

### DS29
- category: REQ/Design（新規 REQ 行と Design 対応の同文重複。Design 分離基準違反〔report format 残留〕+ DUPLICATE）
- target: `docs/requirements/REQ-010.md:55`（REQ-010-082）、`docs/designs/integrity/checker-execution-contracts.md:166`
- evidence: lint_skills の summary 報告形式指定（NG/warning 区別）+ 括弧書き運用詳細（集約予算の漸進回収、環境差記録）が REQ 行にあり、checker-execution-contracts.md:166 が同文所有する。design 追加情報は「checker 出力（lint_skills 等を含む）」の語のみ。
- severity: low
- confidence: low（REQ-010-006〔severity 分類〕・REQ-010-074〔報告と終了コード〕が同系の報告契約を REQ で所有する前例があり、REQ-010 の文体水準内との解釈が成立）
- source_of_truth: REQ-010-082（現行 REQ）
- recommended_route: 表現是正候補（REQ 行の括弧書き運用詳細を Design へ集約）。要ヒューマンレビュー（前例ありの文体水準判断）。
- ng_classification: 今回修正対象（新規行）。

### DS30
- category: Design（covers 宣言に対応する Design 本文の REQ 行ほぼ逐語複製。DUPLICATE）
- target: `docs/designs/skills/agentdev-issue-tracking.md:47`、`docs/requirements/REQ-095.md:23`（REQ-095-004）
- evidence: Design 本文「labels は Tool 契約上の必須フィールドであり、起票時は空配列以上を渡す。付与するラベル値の選択は任意である（…）。起票時の既定付与は設けず、呼出側が都度判断する」は REQ-095-004 行と主語部を除き同一文面。design 追加情報なし。
- severity: low
- confidence: medium（covers(design) 宣言と整合する意図的記述の可能性）
- source_of_truth: REQ-095-004（現行 REQ）
- recommended_route: 表現是正候補（REQ 参照付き要約〔POINTS-TO〕化）または no-action（運用文書としての同文維持も成立）。要ヒューマンレビュー。
- ng_classification: 今次修正対象（delta の新規 Design 対応）。

### DS31
- category: Design（covers 宣言に対応する Design 本文の REQ 行ほぼ同一規定複製。DUPLICATE）
- target: `docs/designs/commands/case-ready.md:75`、`docs/requirements/REQ-017.md:52`（REQ-017-024）
- evidence: :75 は REQ-017-024（case-open / case-ready / case-run の書込み前 workflow extension rules 前置規律）と主語の局所化（case-ready 分）以外同一規定。
- severity: low
- confidence: medium（横断 REQ 行の自コマンド適用面の明示という covers(design) の目的の可能性）
- source_of_truth: REQ-017-024（現行 REQ）
- recommended_route: no-action 候補（自コマンド適用面の明示として許容）または表現是正候補（REQ 参照化寄せ）。要ヒューマンレビュー。
- ng_classification: 今次修正対象（delta の新規 Design 対応）。

### DS32
- category: REQ 体系（Design 分離基準違反〔実装概念語彙・手順詳細残留〕。弱い候補）
- target: `docs/requirements/REQ-030.md:48`（REQ-030-029）
- evidence: 実装概念語彙「stage paths」と「事後突合 + 明示パス指定補正 commit」の contingency 手順詳細が REQ 行に同梱。case-open.md:84 が対応文を所有。
- severity: low
- confidence: low（REQ-030-015 が同系の工程契約前例。「標準 contingency として扱い証跡を記録」部分は運用契約側面が強く、工程契約としての REQ 同梱は許容の可能性）
- source_of_truth: REQ-030-029（現行 REQ）
- recommended_route: 表現是正候補（「stage paths」を機能レベル語彙へ置換する軽微修正）または観察継続。要ヒューマンレビュー。
- ng_classification: 今次修正対象（新規行）。

## 6観点 fan-in 結果

| 観点 | 結果 |
|---|---|
| SPLIT | 対象なし（新規 8 REQ 行は単一関心。Design 3層構造違反〔横断/個別の越境配置〕なし。delta の新規節はすべて適切な層に配置） |
| MERGE | 対象なし（新規 candidate なし。既知 RQ03 は unchanged） |
| MOVE | DS26〜DS29、DS32（新規 REQ 行の Design 分離基準違反系）。RQ13/RQ14 defer 方針との処置整合は promote 判断 |
| DUPLICATE | DS26〜DS27、DS29〜DS31（新 covers の REQ↔Design 同文重複系）。DS33 は表層 |
| RETIRE | 対象なし（retired 19 ID は README 廃止表と一致・境界合格。REQ 参照の不実参照 0 件〔BAD_ROW_REF 6件は移管記録由来の正当な歴史言及で偽陽性確定〕） |
| DRIFT | 対象なし（Design 状態乖離 DRIFT: implementation covers を持つ draft は v4-v5-crosswalk〔REQ-111-013〕のみで、v5 工程駆動経路の採用確定が未了のため乖離条件に該当しない〔前回同様。v5-adopted-conventions は design covers のみで対象外〕。Decision 状態乖離 DRIFT: proposed 0件。REQ↔実体: 新規 8 行は REQ 実在・Design 対応実体・sidecar 宣言の3点整合） |

## 既知 defer / false-positive 照合

既存の disposition は変更せず、今回確認できた状態のみを記録する。

| 既知 finding | 今回の状態 |
|---|---|
| DB02（backlog-auto 配布物 ↔ Design 乖離） | **解消済み**: ffa59eac で command 配布物（description:2、:5-8、:18、:30、:55-61）と SKILL.md（description:3、STEP-8〜11、停止経路・リリース保留経路）に REQ-114 stage 4-7 が反映。旧ガードレール衝突文（「req-define、case-ready、GitHub Issue / PR 作成を自動起動しない」）は :73「一気通貫実行の接続工程として workflow 委譲経由でのみ起動」へ書き換え済み（親 grep 実測） |
| DS21（backlog-auto Design 対象外重複） | **解消済み**: bb848836 で commands/backlog-auto.md:78・:94 が REQ-114 対象外節（REQ-114.md:35-42 実在確認済み）への参照に置換。skills 側対象外節（:118-122）は整理サイクル workflow 部分（REQ-114 適用範囲外）で参照化不要と判定 |
| GR10（guides/root README の REQ-114 一気通貫経路欠落） | **解消済み**: quickstart.md:4、command-selection.md:31（入口表新行）・:82（補足）、glossary.md:21、root README.md:15 すべてに反映 + intake-learning-backlog-flow.md:102-103 にも追加。5箇所の全解消 |
| DS17（REQ-114-013 design body 実体なし） | unchanged（gap 維持）。ただし本 delta で実装・検証側実体が成立: traceability/agentdev-workflow-backlog-auto.yaml:31-36（applied-projects 3形態 manifest.json）・:58（end-to-end-contract.test.ts）。Design 本文実体は依然不在。実体追加または covers 範囲縮小の判断は未解決のまま |
| DS19（REQ-114-005/012/015 partial gap） | unchanged（gap 解消なし）。skills Design :113-116 が上段個別節群への参照へ縮約されたが、REQ-114-005（再スコープ）・REQ-114-012（RU 0 件時リリース不作成）・REQ-114-015 の対応節は依然不在。「再スコープ」「RU 0 件」の語は Design 本文 0 件（grep 実測） |
| DS22（covers 包含重複） | unchanged（defer 継続）。skills Design :7（REQ-041-003..006,009..015）⊂ :8（REQ-041-002..016）のまま。case-close.md は delta 差分 0 |
| GR02（docs/README.md:8・guides/README.md:18 v5/v5.1 導線 gap） | unchanged（defer 継続）。両ファイルは delta 外 |
| GR08（用語集新語未登録） | unchanged（defer 継続）+ 使用拡大。「一気通貫実行」「パッチリリース」の glossary 独立エントリなし・vocabulary-registry.md 未登録のまま、guides 5箇所で使用拡大（定義の拠所は REQ-114.md:10 目的節）。GR08 処置（defer）は変更なし |
| GR11（docs/README.md:28 手動件数複製） | unchanged（現行一致維持。実数 72/19 と AUTOGEN・手動文が一致。pre-existing のまま） |
| RQ03〜RQ14、RQ16、RQ17 | 全件 unchanged（対象ファイルの delta 外確定。REQ-061/REQ-030 は新規行追加のみで既存行は無変更を差分確認。REQ-114.md は delta 前後で 15 行のまま不変〔機械確認済み〕） |
| DS01-08、DS10、DS14、DS16 | 全件 unchanged（対象ファイル delta 外、covers 行変更なし。DS10 は :46 表が REQ-111-011 前半に対応するが後半〔独立突合・成功報告単独確定禁止〕の実体は grep 不検出で gap 維持） |
| LINT01（配布 Skill description 上限超過） | 解消済みのまま維持（再発なし）。lint_skills AG-005 NG 0。aggregate budget warning（20517 > 20300）は傾向管理として継続観察 |
| MECH01（機械検査の母集団無効） | 今回も repo root から実行し全検査で有効結果（check_distribution_boundary scanned 482、check_integrity NG 0）。補足: distribution_boundary_cli への --src src 付き再実行は zero-targets で無効結果のため不採用（実行方法誤り。--help 副作用の最初の実行が有効） |

## 対象なし確認（観点別）

- Decision 意味診断: proposed 0件。frontmatter status ↔ decisions/README.md 分類ビュー完全一致（accepted 49 / superseded 9〔002・005・007・015・017・029・030・040・043〕/ proposed 0 / deprecated 0 = 58 ファイル）。superseded の無注記引用 0件（supervisor-credential-bridge.md:115・117・138 は DEC-040 を「superseded・現行正は DEC-046」注記付き履歴参照。docs/README.md Decision 表は 9件すべて注記付き）。差分 guides 内の DEC 引用は全て accepted。
- guides 意味診断: 差分 4 guides は navigation layer 範囲内。規範の発明なし・履歴混入なし・実装手順の発明なし。実行主体分類の誤認なし（learning-capture は「（スキル）」表記を維持: command-selection.md:20、glossary.md:18、intake-learning-backlog-flow.md:72）。追加文は REQ-114-001/-003/-012/-014 と DEC-059 の記述の案内層反映であり「利用者判断境界は維持」の限定付き。
- README 索引診断: docs/README.md REQ 表 72件 ↔ 実ファイル完全一致（AUTOGEN・手動文とも一致）。Decision 表 58行 = 58 ファイル。decisions/README.md 集計（承認済み 49・提案中 0）↔ frontmatter 実測一致。guides README 13 + README = 14 ファイル完全一致。knowledge README「35件」= 35 リンク = 35 ファイル完全一致。root README コマンド索引 18 ↔ 実在 18 完全一致（親実施）。content overload なし。
- knowledge 診断（REQ-056 準拠）: 35 ファイル維持（delta で新規なし）、README 突合完全一致、kebab-case 維持。
- 配布物構文健全性・文意保持・責務整合: 機械検査 8種・BOM/CRLF・README コマンド索引すべて違反 0（親確認）。DB02 解消により責務整合の既知乖離は解消。
- 未処理 artifact 確認: intake inbox 5件（2026-10-16 付け、backlog-auto stage 2 の入力）、learning inbox 134行（同系統入力）、inspect inbox 11件（defer 残置含む。本 finding 追加後 12件）、inspect/promoted 1件（finding-20261015-case-close-release-support-candidate.md、backlog-review 入力待ち）はいずれも本 backlog-auto cycle の stage 2 以降の入力。drafts 0、req-units 0、ローカル Issue なし。blocked・旧記録の新規異常なし。

## 観察メモ（finding としない）

- REQ-010.md:44 行順異常: REQ-010-080 が 070 → **080** → 071 → … の昇順崩れで配置（既存行、delta 非由来）。構造的整形のみの 1シグナル、契約内容の問題なし。
- quickstart.md:4・glossary.md:21 は REQ-114-001 の列挙（要件定義・実行・検証・統合・完了判定・リリース）から「検証・統合」を省略したサマリ。矛盾ではなく案内層の要約許容範囲内。
- DEC-050.md:38 の本文「関係」節が frontmatter（:5）と同値の related_reqs を再記載。矛盾なし、形式上の重複のみ。
- REQ-095.md:12（目的節 history-style 文言）、REQ-011.md:20・REQ-047.md:15・REQ-035.md:43（DEC-036 参照注記揺れ）、REQ-110.md:41（検証節 O(n)）: いずれも unchanged、継続観察。
- BAD_ROW_REF 6件（REQ-003-055/056・REQ-003-030×2・REQ-006-040×2）: REQ-003.md:56・REQ-082.md:12 は移管・廃止を明示した移管記録、REQ-006-040 は retired/REQ-013.md 内の歴史参照。偽陽性確定。
- covers なし Design 8件（authoring/command-file-format、commands/third-party-sync、foundations/design-principles、foundations/references/concrete-abstraction、integrity/autogen-freshness-gate、integrity/backticks-identifier-threshold、integrity/docs-spec-rebuild-integrity、integrity/references 配下 2件）: REQ 直結宣言なしの構造、違反ではなく記録事項。
- traceability/agentdev-workflow-backlog-auto.yaml（新規 sidecar、リポジトリ直下配置）の宣言 REQ-114-001〜015 は REQ-114.md の 15行すべてと一致（実在確認済み）。欠番・不実宣言なし。

## docs-check ルール候補（STEP-3-2）

| 候補 | 起源 finding |
|---|---|
| 新 covers の REQ↔Design 対応における REQ 行のほぼ逐語複製（design 追加情報なしパターン）の機械検出 | DS30（ほぼ逐語・追加情報なし）を起点に DS26〜DS31 の同文重複系へ適用拡張 |
| Markdown 番号リスト重複（同一番号の連続出現）検出 | DS33 |
| REQ 行内の時点表現（「〜確認済みであること」等の検証状態記述）検出 | DS28 |

## 推奨アクション

- DS26〜DS32: いずれも REQ 行改訂（短縮・用語置換）または Design 側 POINTS-TO 化の表現是正候補。既知 RQ13/RQ14 の defer 方針と本次処置の整合判断は inspect-promote（stage 2）の責務。DS28 は時点表現除去の軽微修正ですぐ直せる。
- DS33: 番号再採番の表現是正候補。
- REQ-010-083 の traceability sidecar・policy.yaml 未登録: verification 対応作成は case-run/case-close（REQ-061-023・REQ-021-018）所有のため、次回 Case 実行での追随確認。
- DB02・DS21・GR10: 解消済みのため stage 2 で「解消記録」として disposition する候補。
- GR02・GR08・DS17・DS19・DS22: 既知 defer 継続。DS17/DS19 は REQ-114 design covers 4行（005/012/013/015）の Design 本文実体追加または covers 範囲縮小の判断が未解決のまま継続。

## 対象外（Out of Scope）

- 文章表層品質（LLM 表現、空虚語、英語混じり表現の辞書検査）: 共通 textlint 基盤（`agentdev-textlint-guard`）の管轄。
- 配布物の構文健全性5パターン（frontmatter 重複、見出し重複、Markdown 構文破損、存在しない command 参照、エンコーディング不整合）: 機械検査で違反 0 を確認済み（本 finding の機械検査証拠表参照）。
- 配布物の Command/Skill 構造診断・実行主体分類の配布物側検査: `agentdev-inspect-skills` の診断対象。
- Design 状態乖離 DRIFT の時間ベース draft 放置検出: 判定基準を分離済み（diagnostic-categories.md 判定分離準拠）。
- traceability の coverage 完全性分析: `agentdev-traceability` 領域（本 finding は sidecar 宣言 REQ 行の存在確認と未登録候補の収集のみ）。
- REQ/Decision/Design の状態変更・修正・保存: 診断専用のため実施しない。
- GitHub Issue/PR 操作: 実施しない（agentdev_gh 不使用）。
- git commit/push: 本 run の実行契約上実施しない（後続工程の責務）。
