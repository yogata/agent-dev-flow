# inspect-docs promoted 20260920T105602Z

> inspect-promote（2026-09-20 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の採用済み成果物。
> 新規検出事項 2件（F-1/F-2）と、defer 再評価条件の充足による統合昇格 3件（F-11(20260901)/F-04(20260907)/REQ57-1(20260917)）を採用した。
> 対論型レビュー（in-context 審議: 対称的相互反証・戦略メタ反証・convergence audit）を実施し、全件自律確定（HITL 不要、unresolved 0件。判定根拠は各検出事項の検証記録参照）。
> 同時処分: GUIDE-8(0914)/F-27(0901)/F-34(0901) は reject（解消確認・対象消滅。却下理由は当該 commit message 参照）。F-10/F-12(0901)・F-04/F-05/GUIDE-6/DESIGN-3(0914) は defer 継続（inbox 残置）。

## 検出事項リスト（promote 採用分）

### F-1: REQ-057（docs corpus 整合・現行化バッチ）の RETIRE 評価条件が充足された

- **id**: REQ57-RETIRE-1
- **category**: RETIRE（REQ structure review 6観点・移行完了状態の恒久 REQ 化。既存 defer F-11(0901)/F-04(0907)/REQ57-1(0917) 系統の再評価条件変化）
- **target**: `docs/requirements/REQ-057.md`（要件テーブル全体、REQ-057-001〜036）
- **evidence**:
  - F-04(0907) の再評価条件「Epic #2506/#2633 系 case-close」が充足: Epic #2504（REQ-057 Epic A、子 #2506〜#2513 の8件）closed・全 completed、Epic #2505（REQ-057 Epic B、子 #2514〜#2521 の8件）closed・全 completed、Epic #2633（learning 由来配布物反映、子 #2634〜#2642 の9件）closed・全 completed、#2506 単体も closed（完了条件チェックボックス全て [x]）
  - さらに v4.0.0-rc.1 cutover（`4136b838`、312 files 統合）と self-hosting pilot migration（#3040、Evidence レポート `docs/reports/pilot/v4-rc1-pilot-migration-20260920.md`）が完了しており、REQ-057 が対象とした一回きり整合バッチの実行環境は終息済み
  - REQ-057 の要件行（REQ-057-001〜036）は現行 corpus に残存したまま（REQ-057-031 の provenance・commit hash 記載等、REQ57-1(0917) 指摘箇所も原状）
- **severity**: medium
- **confidence**: high（Issue 状態・マージ commit の機械的確認。REQ ファイル単位近似ではなく Case 完了状態の取得源に基づく）
- **source_of_truth**: REQ-001 の廃止候補類型「移行完了状態」。現行 REQ > Decision > Design の矛盾ではなく、REQ 体系の構造判断（RETIRE 審査の実施要求）
- **recommended_route**: `backlog-review`。既存 defer F-11(20260901)・F-04(20260907)・REQ57-1(20260917) を統合し、REQ-057 の RETIRE 審査（同型群 REQ-016/REQ-045/REQ-046 との一括整理候補を含む）を実施する
- **ng_classification**: pre-existing（defer 継続案件の再評価条件変化。現時点で不正状態ではない）
- **検証記録（inspect-promote 2026-09-20）**: Epic #2504/#2505/#2633 の state closed・全子 completed・完了条件チェックボックス [x] を agentdev_gh issue_read で直接確認。REQ-057.md の要件行残存（REQ-057-031/036 は L46/L51 に原状）を grep で確認
- **notes**: RETIRE 判断時は行単位の恒常契約の移管先確認を含むこと（REQ-057-022 の「delegation-contracts 経路」行内言及は `docs/designs/workflows/v4-delegation-contracts.md:19` の旧称対応注記が歴史言及として許容する対象。REQ-057-028/030/034 の traceability sidecar 移行契約は後続 REQ への移管候補）
- **req-define入力案**: 「REQ-057（docs corpus 整合・現行化バッチ）の RETIRE と、恒常契約行（traceability sidecar 移行等）の後続 REQ への移管」

### F-2: DEC-008 副次 Design 列挙が旧パス `workflows/delegation-contracts.md` のまま残存

- **id**: DEC8-DRIFT-1
- **category**: 横断契約矛盾（DRIFT: v4 cutover 由来の現行化漏れ）
- **target**: `docs/decisions/DEC-008.md:55`
- **evidence**:
  - 「副次 Design: docs/designs/commands/case-auto.md、docs/designs/workflows/delegation-contracts.md、docs/designs/workflows/v4-lifecycle-state-machine.md…」— `workflows/delegation-contracts.md` は第8段（2026-09-20）で `workflows/v4-delegation-contracts.md` へ集約 supersede 済み（旧ファイルは物理削除）
  - Decision 全 39 ファイルの機械走査で、v4 接頭辞なしの旧パス `workflows/delegation-contracts.md` を現行参照（関連 Design 列挙）として保持するのは本行のみ（他は crosswalk-inventory の移行記録・reports の歴史記録で対象外）
- **severity**: low
- **confidence**: high（旧パス列挙は機械的に一意判定可能）
- **source_of_truth**: 現行 Design 配置（`docs/designs/workflows/v4-delegation-contracts.md`、status: accepted、created 2026-09-20）。Design 配置を正とし、Decision 側の旧パス記述を検出事項とする
- **recommended_route**: `backlog-review`。パスを `workflows/v4-delegation-contracts.md` へ更新（軽微な docs 整理。docs-check route 化は不要: 単発の更新漏れ）
- **ng_classification**: 今回修正対象（v4 cutover `4136b838`・第8段の更新漏れ）
- **検証記録（inspect-promote 2026-09-20）**: DEC-008.md:55 の旧パス残存を grep で確認、`docs/designs/workflows/v4-delegation-contracts.md` の実在を確認
- **notes**: `v4-delegation-contracts.md:19` の旧称対応注記は REQ-057-022 等の行内言及を歴史言及として許容するが、DEC-008 の「関連する決定」節は現行の関連性を示す参照として機能するため更新が望ましい。文書品質の局所的破綻のため severity low。

### F-11（20260901 defer からの統合昇格）: REQ-016 は一回きりの統合検証を恒久 REQ 化した「移行完了状態」（RETIRE 候補）

- **category**: RETIRE
- **target**: docs/requirements/REQ-016.md:18-27（REQ-016-001〜010）
- **evidence**: REQ-016-001〜006 が全て「7呼出元と case-auto 停止伝播の統合後、…」等の完了時点検証条件。REQ-016-008/009 は是正手順（作業手段）
- **severity**: low / **confidence**: medium
- **source_of_truth**: REQ-001-052 廃止候補類型「移行完了状態」に該当。REQ-046 と同型の成立経緯だが検証工程の性質が強い
- **recommended_route**: 意味診断検出事項
- **統合昇格の根拠（inspect-promote 2026-09-20）**: F-1 の recommended_route が同型群 REQ-016/REQ-045/REQ-046 との一括整理候補として本 defer の統合を明示指定。REQ-057 RETIRE 審査の実施機会が到来したことに伴い、同型群の廃止候補性判断を同一審査へ回す。REQ-016.md の実在と要件行残存を確認済み。RETIRE 採否そのものは backlog-review・req-define の判断として未確定
- **出典**: `.agentdev/inspect/inbox/inspect-docs-finding-20260901T120043Z.md`（2026-09-20 処分時に inbox から昇格）

### F-04（20260907 defer からの統合昇格）: REQ-057（docs corpus 整合バッチ）の完了後 RETIRE 候補性

- **category**: RETIRE 候補（移行完了状態の恒久 REQ 化）
- **target**: docs/requirements/REQ-057.md（要件テーブル全体）
- **evidence**: REQ-057 は「docs corpus 整合・現行化バッチ」として OU 単位の一回きり整合作業を要件行化した構造（REQ-057-001〜028、最終 036 まで拡張）。REQ-045（網羅監査）・REQ-046（横断正規化後の不変条件）も F-11 が指摘する同型群
- **severity**: low / **confidence**: medium（単体では将来判断の予告。統合後は F-1 の条件充足 evidence を共有）
- **source_of_truth**: REQ-001 の廃止候補類型（移行完了状態）を基準にした構造観察
- **recommended_route**: F-1 へ統合（REQ-057 の RETIRE 審査）
- **統合昇格の根拠（inspect-promote 2026-09-20）**: 本 defer の再評価条件「Epic #2506/#2633 系 case-close」が充足（Epic #2504/#2505/#2633 全 closed を agentdev_gh で直接確認）。F-1 が本系統の統合を明示指定
- **出典**: `.agentdev/inspect/inbox/inspect-docs-finding-20260907T012032Z.md`（2026-09-20 処分時に inbox から昇格。同ファイルの残余検出事項なしにつきファイル削除）

### REQ57-1（20260917 defer からの統合昇格）: REQ-057-031/036 に作業履歴・書式詳細が混入している MOVE 候補

- **category**: 文書分類一貫性（MOVE 候補、REQ 要件行への Design 分離基準シグナル）
- **target**: `docs/requirements/REQ-057.md:46,51`（REQ-057-031、REQ-057-036）
- **evidence**:
  - `REQ-057-031` は要件の主目的（現行根拠文脈の旧行番号引用を0件にすること）に加え、「導入時点 318 件」「provenance issue-2383-ir067-initial-baseline」「診断基線 commit 92c8d28b」を記載する。provenance 名・commit hash は作業履歴／実装時点の内部証跡であり、REQ 要件行の主契約からは Design または Report へ分離できる候補である
  - `REQ-057-036` は Design status 昇格時の記録要求に加え、標準形式の見出し名「対応記録」、必須項目（昇格日、評価契約根拠、対応 Case/PR、REQ 整合確認結果）、見送り記録との排他を要件行へ列挙する。これは report format / template variant の詳細を含む
  - `docs/designs/authoring/command-file-format.md:16-18`、`src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md:69-76` は執筆・保存側の責務を既に保持する。REQ-057-036 の存在自体は必要な成果契約だが、書式詳細の正規所有境界は要確認である
- **severity**: low / **confidence**: low
- **source_of_truth**: 現行 `REQ-001` の文書種別責務・Design Separation Criteria と、関連する Design/Skill を基準とする。REQ-057 は docs corpus 整合バッチという特殊な一時性を持つため、単純な違反確定ではなく文脈審査を要する
- **recommended_route**: F-1 へ統合（REQ-057 の RETIRE 審査の一部として、書式の必達成果だけを REQ に残すか、詳細を Design/保存手順へ移すかを判断）
- **統合昇格の根拠（inspect-promote 2026-09-20）**: 本 defer の再評価条件「REQ-057 完了時の RETIRE 審査」が到来（F-1 の条件充足 evidence 参照）。REQ-057-031/036 の原状（L46/L51）を grep で確認
- **出典**: `.agentdev/inspect/inbox/inspect-docs-finding-20260917T223426Z.md`（2026-09-20 処分時に inbox から昇格。同ファイルの残余検出事項なしにつきファイル削除）

## 統合審査の指示（backlog-review 向け）

- **RETIRE 審査系統（F-1 主軸）**: F-1 + F-11(0901) + F-04(0907) + REQ57-1(0917) を単一 RU へ統合することを推奨する。対象は REQ-057 本体の RETIRE 審査（行単位の恒常契約移管確認を含む）と、同型群 REQ-016/REQ-045/REQ-046 の一括整理候補の評価。req-define入力案は F-1 の記載を参照
- **独立修正系統（F-2）**: DEC-008:55 のパス更新（1行）は独立した軽微 docs 修正として別 RU 化可能（req-define → case-auto 経由）

## 出典

- 新規検出事項（F-1/F-2・解消確認 R-1〜R-3・観察 OBS-1）: `.agentdev/inspect/inbox/inspect-docs-finding-20260920T105602Z.md`（2026-09-20 処分時に削除。git 履歴 commit `87d7c6a8` 参照）
- 統合昇格 3件: 各検出事項の出典欄参照
- 診断実行: `/agentdev/inspect-docs`（backlog-auto stage 1）2026-09-20
- 後続: `/agentdev/backlog-review` による RU 生成
