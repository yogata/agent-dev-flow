# inspect-docs finding 20261006T151122Z

- 実行日時: 2026-10-07T00:11 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer 照合・前回 intake 捕捉分の消費状況確認を実施、担当間矛盾なし、対象領域分離により重複候補なし）
- 前回診断: 20261004T162140Z（defer 残置分。10-05 実施の inspect-promote で promote 8件・defer 1件〔GR-11〕処理済み）。今回の対象差分は 10/5〜10/6 の正規コミット群（DEC-051 承認・d754ceec スロット型キュー移行・ce6bd072 IR-072 Design 拡張・19d3a4ab REQ-095-002 訂正・Case #3448〜#3506 系ほか）

## サマリ

- スキャン対象: docs/requirements/ 61現行 + retired 18 / docs/decisions/ 50 DEC（DEC-018 欠番）+ README / docs/designs/ 180 / docs/guides/ 14 + README / ルート README.md / 配布物（src/common commands 13 + skills 50、投影 .opencode 側）
- 機械的検査（STEP-2-0 候補収集）: check_integrity（source profile）exit 0（新規 unmanaged NG 0、Warning 1 = crosswalk REQ-087 retired-req-primary-ref〔F-04 として意味確認済み〕）、AUTOGEN 鮮度 0、command 形式 OK、extensions 0、配布境界 0、Design frontmatter 形式 0、knowledge 構造 0、決定的破損 0、配布物 BOM 0 / CRLF-LF 混在 0（40ファイル LF 統一）、存在しない command 参照 0（root README 13 コマンド実在と完全一致）
- 検出事項（新規）: 11件
  - REQ 体系: 3件 / Design: 4件 / Decision・guides・README: 4件
  - severity: high 2件 / medium 5件 / low 4件
  - 推奨 route: docs 修正（REQ/DEC/index 更新）6件 / req-define 再壁打ち 1件 / docs-check route 候補 2件 / 軽微候補 2件
- 再検出（前回 intake 捕捉も未解消）: 3件（F-01、F-02、F-04）— 前回 intake item 2026-10-04-retired-req087-092-093-wave3-remaining-refs-cleanup は 10-05 の intake-promote で処理されたが RU 化対象外（RU-0001〜0014 に REQ-093/087 系を含まず）のまま実体残存。追跡可能な処理待ち成果物が存在しないため新規起票とする（採否は inspect-promote）
- 既知 defer 状況更新: 1件（GR-05 残存確認）

## 検出事項リスト（新規）

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。

### REQ 体系（3件）

#### F-01: REQ-095 が retired REQ-093 を廃止注記なしに現行所有者として参照（DRIFT + 現行/廃止境界）
- category: REQ 現行/廃止/世代境界（6観点 DRIFT）
- target: `docs/requirements/REQ-095.md:27`
- evidence: 「REQ-093 が所有する起動環境障害の予防・診断・回復」（対象外節）。REQ-093 は retired（`retired/REQ-093.md:4 status: migrated`、同 :9-11「全操作の診断範囲と安全条件は REQ-052 が所有する」）。REQ-095 updated 2026-10-06 は廃止（2026-10-03、343d4661）後の編集であるにもかかわらず廃止注記なし。移管先は REQ-052-014/015
- severity: high / confidence: high（retired ID 直接参照・廃止注記欠落・移管先不整合の3シグナル）
- source_of_truth: retired/REQ-093.md:9-11、requirements/README.md:100
- recommended_route: docs 修正（REQ-052 参照への付け替えまたは「旧 REQ-092 から分離済み」型の廃止注記追加）
- ng_classification: pre-existing（廃止時由来の残置。前回 intake item 捕捉後 RU 化されず残存）
- 再検出注記: 前回 intake item 2026-10-04-retired-req087-092-093-wave3-remaining-refs-cleanup（処理済み・消滅）

#### F-02: REQ-102 が retired REQ-093 を廃止注記なしに参照（DRIFT）
- category: REQ 現行/廃止/世代境界（6観点 DRIFT）
- target: `docs/requirements/REQ-102.md:24`
- evidence: 「agentdev_gh（Custom Tool）の起動環境障害（REQ-093）」（対象外節）。retired ID 参照に廃止注記なく参照導線が廃止済み REQ に向いている。判断の主文意（対象外）自体は成立するが参照先は REQ-052 が正
- severity: medium / confidence: high
- source_of_truth: retired/REQ-093.md:9-11
- recommended_route: docs 修正（F-01 と一括で REQ-052 へ付け替え）
- ng_classification: pre-existing（F-01 と同時処理推奨）
- 再検出注記: F-01 と同一 intake item 由来

#### F-03: REQ-014 と REQ-015 の「原則実行」「スキップ条件」規範の二重記述（DUPLICATE）
- category: REQ structure review 6観点 DUPLICATE
- target: `docs/requirements/REQ-014.md:32-33`（REQ-014-013/014）↔ `docs/requirements/REQ-015.md:25-26`（REQ-015-002/003）
- evidence: (a) REQ-014-013「adversarial-review を原則実行し、ユーザー明示指定を通常発動の必須条件としないこと（default-on）」と REQ-015-002「対象7コマンドでは adversarial-review を原則実行すること」が同一規範。(b) REQ-014-014「スキップ条件は各呼出元の…正規所有者で明示的かつ判定可能に定め」 と REQ-015-003「各呼出元の正規所有者が定義したスキップ条件に該当する場合…省略して従来フローを継続できること」が同一規範。(c) REQ-014-011（正規所有者マトリックス・重複規範禁止）との緊張
- severity: medium / confidence: medium（「共通契約 vs caller 適用」の意図的二段構成の可能性を排除できず。command Design 側対応行は Design スコープのため未照合）
- source_of_truth: 現行 REQ-014・REQ-015（REQ 同士の矛盾は req-define 再合意が必要）
- recommended_route: req-define 再壁打ち（正規所有行の単一化: 一方を規範宣言、他方を参照行へ）
- ng_classification: pre-existing（REQ-014/015 は 2026-08-09 作成の既存構造）

### Design（4件）

#### F-04: crosswalk-inventory REQ-087 行の retired 反映漏れ（機械検査 Warning の意味確認結果・妥当）
- category: 廃止 REQ 由来記述残置（living tracking 不整合）
- target: `docs/designs/foundations/references/crosswalk-inventory.md:62`
- evidence: 「| REQ-087 | keep | ― | ― | executed | 採番例外記録は維持。… |」— REQ-087 は 2026-10-04 retired（94a9f43a、status: migrated、移管先 REQ-001-070/REQ-010-070/numbering-policy Design）。retired 化コミットは本ファイルを更新せず、以降の更新（9fbbbc4a）も未是正。同一表内 REQ-016（:24）・REQ-057（:54）は「keep → retired」追随更新済みで前例あり
- severity: medium / confidence: high
- source_of_truth: 現行 REQ-001-070・REQ-010-070 > numbering-policy.md:69 > retired/REQ-087.md
- recommended_route: docs 修正（L62 を「keep → retired」へ追随更新、L24/L54 前例準拠）。「移行判定時点」限定表記と retired 維持記録の防御要素により high とはしない
- ng_classification: pre-existing（再検出: 前回 intake item 捕捉後 RU 化されず残存）

#### F-05: crosswalk-inventory REQ-046 行も同型の retired 反映漏れ（機械検査未検出）
- category: 廃止 REQ 由来記述残置（living tracking 不整合）
- target: `docs/designs/foundations/references/crosswalk-inventory.md:43`
- evidence: 「| REQ-046 | keep | ― | 13 | executed | 移行不変条件。第13段で retire 予約（v4 移行完了後に廃止判定）…」— REQ-046 は 2026-09-30 retired（status: migrated、後継なし、恒常不変条件は REQ-010-065〜067 が継続所有）。retire 予約消化済みだが「keep」のまま。機械検査は REQ-087 のみ検出し REQ-046 を検出していない
- severity: medium / confidence: high（retired 参照の機械的事実 + retired 本体確認済み）
- source_of_truth: 現行 REQ-010-065〜067 > retired/REQ-046.md
- recommended_route: docs 修正（F-04 と同一表で併合処理）。併せて機械検査が REQ-046 を検出しなかった理由（baseline 未登録か検出範囲か）の確認を docs-check route 候補へ
- ng_classification: pre-existing

#### F-06: 実装済み script の「将来追加」表記残置
- category: 将来計画の混入（実装済み対象の将来表記陳腐化）
- target: `docs/designs/skills/agentdev-design-file-manager.md:29`
- evidence: 「Design 固有 script（`search-target-area.ts` 等、将来追加）の選択と呼出契約」— search-target-area.ts は `src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts` に実在済み。Design は 2026-10-05（ce6bd072）更新済みで表記放置
- severity: low / confidence: high（実在確認は機械的）
- source_of_truth: 現行実装（共通原本実体）
- recommended_route: docs 修正候補（「将来追加」→現行記述へ是正）
- ng_classification: pre-existing

#### F-07: IR-063 の retired REQ-046-006 を「現行要件行」と呼ぶ曖昧表現
- category: 廃止 REQ 由来記述残置の境界ケース（履歴説明節内の表現）
- target: `docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md:44`
- evidence: 「旧検査の識別子引用（REQ-046-006、REQ-010-064）は置換済みの現行要件行を指す」— REQ-046 は 2026-09-30 retired。retired REQ 行を「現行要件行」と称する表現は誤解を生み得る。ただし本節は前身検査廃止の履歴説明であり、IR-063 自身の検査契約の所有は :40 で明記済み。文意は「旧識別子の参照先が現行行へ置換済み」とも読める
- severity: low / confidence: medium（文意複数解釈、要ヒューマンレビュー）
- source_of_truth: 現行 REQ-010-065〜067（REQ-046 不変条件の継続所有者）
- recommended_route: 観察メモ・表現是正候補（「REQ-046-006（retired）」明示 or 参照先置換の明確化）
- ng_classification: pre-existing

### Decision・guides・README（4件）

#### F-08: DEC-041 に部分置換（DEC-051）の superseded_by / supersede_note 欠落
- category: Decision 意味診断（承認済み Decision の現行判断根拠の明示・部分置換の可視性）
- target: `docs/decisions/DEC-041.md`
- evidence: DEC-051.md:9-11 relations「supersedes DEC-041（決定5: Wave 収束と依存充足の二条件 gate を依存充足ゲート単独条件へ置換）」に対し、DEC-041.md:32 の決定5「次 Wave の開始は両方の成立を条件とする」が置換注記なしで現行契約の形で残存。frontmatter（:8-18）に superseded_by/supersede_note なし、updated は 2026-09-23 のまま。確立済み様式（DEC-036.md:8-9、DEC-045.md:5-12、DEC-040.md:5-6、DEC-043.md:5-6 はすべて保持）と乖離。特に DEC-050.md:42 承認記録は「DEC-045 への superseded_by / supersede_note 部分置換関係記録」を受理確認事項化した一方、DEC-051.md:42 承認記録に DEC-041 への同記録確認なし。索引波及: decisions/README.md:57・docs/README.md:143 の DEC-041 行は注記なし
- severity: high / confidence: high（様式先例・承認記録の非対称・索引レンダリングの3点から確定）
- source_of_truth: 承認済み DEC-051（relations 宣言）> 部分置換記録様式の先例（DEC-036/045/050 承認記録）
- リスク: DEC-041 決定5 の Wave 収束二条件 gate が現行根拠として読まれ、DEC-051 の依存充足ゲート単独条件と矛盾した解釈（Wave 収束待ち復活）を生じる
- recommended_route: docs 修正（DEC-041.md へ superseded_by: DEC-051 + supersede_note〔決定5のみ置換、決定1〜4維持〕追記し Decision 索引 AUTOGEN 再生成。DEC-050 承認時と同一経路）
- ng_classification: pre-existing（DEC-051 承認時の記録漏れ）

#### F-09: decisions/README.md Decision Map の後継関係行欠落
- category: Decision 意味診断（後継関係の可視性）
- target: `docs/decisions/README.md:203-241`（Decision Map）
- evidence: Map は DEC-033 supersedes DEC-029（:236）、DEC-036 supersedes DEC-015/DEC-002（:237-238）等の現行 DEC 間 supersedes を掲載する一方、DEC-044 supersedes DEC-040/DEC-043（完全置換）と DEC-051 supersedes DEC-041（部分置換、F-08 と同根）の行が存在しない。完全置換の DEC-044→DEC-043 欠落は DEC-033→DEC-029 掲載と非対称
- severity: low / confidence: medium（Map は AUTOGEN マーカー外の手動セクションであり掲載基準が別途定義されている可能性 → 候補提示に留める）
- source_of_truth: 各 DEC frontmatter relations（DEC-051.md:9-11、DEC-043.md:5、DEC-040.md:5-6）
- recommended_route: docs 修正候補（Decision Map への後継行追記、または Map 掲載基準の明示）
- ng_classification: pre-existing

#### F-10: authoring/ 将来拡張余地の重複言及
- category: 将来計画の混入（軽微・重複）
- target: `docs/designs/README.md:249`、`docs/designs/authoring/command-file-format.md:17`
- evidence: 両者が「authoring/ は REQ/Design/SKILL/guide 執筆規約の集約先として将来拡張余地あり（即時統合・authoring/ 削除は行わない）」と同一の将来拡張余地を記述
- severity: low / confidence: medium
- source_of_truth: document-model Design の分離基準（将来案は Design の非所有、ただし現状説明への接続語として許容範囲）
- recommended_route: 観察メモ（単一化候補）
- ng_classification: pre-existing

#### F-11: docs/README.md 要件欠番説明の内容過多候補
- category: README 索引 内容過多検出
- target: `docs/README.md`（要件節・欠番説明段落）
- evidence: 「REQ-063〜REQ-081 は…意図的予約欠番」「REQ-089 は J2 shadow 実験（commit 43bf2ec3 で採番後、52c7bc10 で完全 revert）由来の廃止識別子」— 個別欠番の由来履歴（commit 番号・日付・裁定経緯）を索引が詳述。採番ポリシーの正は numbering-policy.md であり同段落から参照済み
- severity: low / confidence: medium（numbering-policy 側に同等記述があるかの確認が事前条件。REQ-089 再利用禁止の告知として索引に存在価値もある）
- source_of_truth: designs/foundations/numbering-policy.md
- recommended_route: 候補提示のみ（「REQ-063〜081・084〜086・089 は意図的予約欠番（詳細は採番管理参照）」への収縮候補。numbering-policy.md との重複確認後）
- ng_classification: pre-existing

## 既知 defer 項目の状況更新（前回 20261004T162140Z の defer 残置分）

| 項目 | 状況 | 証拠 |
|---|---|---|
| GR-05: supervisor-credential-bridge.md 実測記録埋め込み | 残存 | supervisor-credential-bridge.md:115（docs/knowledge/supervisor-bridge-credential-supply.md 側に同一実測の履歴があり複製に相当。cleanup モデル MOVE/REFERENCE 候補は継続） |

## 6観点網羅確認（REQ 体系担当 fan-in 後）

- SPLIT: 候補なし（観察: REQ-090 の関心の広がり〔Tool 契約+6系統 Workflow 適用+観測 state+監査、単一機能に集約され一貫〕、REQ-011 の関心幅〔目的節で「外部連携境界の v4 接続」と一貫叙述〕）
- MERGE: 候補なし（REQ-014/015 は分割理由を REQ-014.md:11-12 で明示。関連して DUPLICATE の F-03 あり）
- MOVE: 問題候補なし（主たる文意が HOW である現行要件行は検出されず。安定契約例外候補の観察メモ: REQ-090-001 provider パラメータ列挙〔Cloudflare 唯一が REQ-090-021/022 で契約化され外部契約の例示〕、REQ-095-001 受理フィールド括弧列挙〔主文意は参照義務〕、REQ-034-031 enum+「Phase 0」語彙〔主文意は4状態報告区分〕、REQ-094:34 glob〔適用範囲定義〕）
- DUPLICATE: 問題候補 1件（F-03）。観察: REQ-015-004〜008 の command 別挿入位置列挙と REQ-015 目的節の「各 command Design が正典として所有」との並存（Design 側照合は Design スコープのため確定判断せず）
- RETIRE: 候補なし（requirements/README.md 現行 61 行 = 実ファイル 61 件 1:1 完全一致、現行案内から参照されない現行 REQ なし、現行/廃止二重存在なし、欠番規定〔063-081・084-086・089〕と実ファイル整合）
- DRIFT: 問題候補 2件（F-01、F-02）。REQ-090 は DEC-046 反映済み（REQ-090-021〜023）、REQ-090→REQ-096 閉包条件参照導線は成立（REQ-096.md:14,:30）

## docs-check route 候補（STEP-3-2）

- retired REQ の crosswalk-inventory 処遇行と retired 実体の突合検査（F-05 の機械検査化。check_integrity の retired-req-primary-ref が REQ-087 のみ検出し REQ-046 を検出しなかった検出範囲/baseline ギャップの解消）
- DEC frontmatter supersedes relations の被置換側 supersede_note 反映チェック（F-08 の機械検査化。置換側 relations と被置換側注記の対称性検査）
- 既存 REQ/Decision 整合のうち今回意味確認で妥当確認済みの baseline Warning（crosswalk REQ-087）は F-04 が解消時に baseline 整理を要する可能性（exemption/baseline 登録状態の確認）

## 未処理成果物の確認（存在報告のみ、処理は後段 workflow の責務）

- `.agentdev/intake/inbox/`: 7件（2026-10-05×5、2026-10-06×2）
- `.agentdev/learning/inbox.md`: 未処理エントリ残存（80KB、10-06 23:44 更新）
- `.agentdev/inspect/inbox/`: 既存 9件（前回診断分の defer 残置含む）+ 本ファイル
- `.agentdev/backlog/req-units/`: 0件
- 各 promoted/（intake / learning / inspect）: 0件
- `.agentdev/drafts/`: ディレクトリなし（未処理ドラフトなし）

## 推奨アクション

- 新規 11件は inspect-promote の分類対象（promote / defer / reject）。F-01・F-02・F-04 は docs 修正で完結する軽微是正（REQ-052 への付け替え・「keep → retired」追随更新）、F-08 は DEC-041 への注記追記 + 索引再生成
- F-03 は req-define 再壁打ち route（正規所有行の単一化）
- 既知 defer 残存群（前回 31項目のうち残存 21 + GR-11 + GR-05）は原状継続（本診断では状況更新のみ）

## 対象外（Out of Scope）

- 機械的検査クリーン項目（check_integrity baseline 管理分、AUTOGEN、command 形式、extensions、配布境界、Design frontmatter 形式、knowledge 構造、決定的破損、BOM・改行コード、command 参照実在、配布物構文）の再報告
- baseline-known phantom citations（REQ-010-053..057、REQ-002-028）の再起票（不変確認済み。REQ-003-030 は DEC 内から消滅、REQ-082.md:12 の正当な移行説明のみ残存、新規問題なし）
- intake / learning / RU の処理（intake-promote、learning-promote、backlog-review の責務）
- 配布物（command/skill）本文の詳細診断（inspect-skills の責務。STEP-3-1 の構文・エンコーディング・参照検査は実施済みでクリーン）
- 文章表層品質（textlint 共通基盤の責務）
- 診断担当が候補化しなかった観察メモ（SPLIT/MOVE の安定契約例外候補、guides/README.md:65「正」呼称と artifacts-and-state.md:147-155 の規範所有者の不確実性〔GR-06/GR-07 既知 defer 系として継続〕、REQ-099-018 の guide 記録委譲の実在確認〔REQ 側領域〕、charter.md の DEC-001 要約精度の語句突合）

## 参照

- 診断担当: REQ 体系 / Design / Decision・guides・README の3並列委譲（読取専用、file:line 根拠付き戻り値、親が fan-in 統合）
- 機械的検査スクリプト: repo-agentdev-integrity（check_integrity --profile source、check_autogen_freshness、check_command_format、check_extensions、check_distribution_boundary、check_design_frontmatter、check_knowledge_docs、check_content_corruption、配布物 BOM/CRLF・command 参照実在の node 直接検査）
- source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides
