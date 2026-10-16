# inspect-docs finding 20261013T090730Z

## サマリ

- スキャン対象: 現行 REQ 69件、retired REQ 19件、Decision 58件（accepted 48件）、Design 184件、guides 14件、README 群、knowledge 32ファイル、Command 18件、Skill 57件、Template 13件。
- 検出事項: 19件（このほか、対象なし確認・観察メモ・既知 finding の差分記録を含む）。
- high severity: 0件。medium 7件（RQ08, RQ09, DS09, DS10, DS11, DS12, DB01）。
- 診断焦点: 2026-10-11T03:31+09:00 以降の delta（REQ-110/111・DEC-057/058 新規、phase 系 5コマンド・6スキル実装、v51 Design 2件 accept、case 系 Design/Skill・guides/README 更新）。
- 推奨経路: 表現是正候補、修正候補、追跡Issue育成、docs-check ルール候補。既知 finding の disposition は変更しない。

## 診断基準と被覆

STEP-2 の意味診断は REQ 体系・Design・Decision/guides/README の3診断担当へ並列委譲し、親が fan-in した。各担当は corpus 全体の構造確認に加え、上記 delta 窓を重点調査した。親は配布物整合性検査（STEP-3）を repo root から機械検査・自前確認で実行した。全担当の完全同一 corpus・同一深度の調査とはみなさない。Design 担当の case-open/case-close delta は REQ 行実在・covers 整合の軽量確認まで、distribution-boundary.md の REQ-029-007/008 は検証モデルレベルの被覆確認までであることを明記する。

REQ の6観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）を fan-in で確認した。担当間の矛盾は source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）で評価した。複数の ADF-COVERS edge だけでは責務重複と判定せず、本文上の所有範囲と正規 policy を確認した。

同一対象の重複報告（REQ 担当 F1-3 / Decision 担当 F1 → DS11、REQ 担当 F2-1/F5-1 / Decision 担当 F2/F3 → RQ08、REQ 担当 F3-DR1 / Decision 担当 F5 → GR08）は fan-in で統合した。

## 機械検査証拠の採用判断

| 証拠 | 判定 | 根拠 |
|---|---|---|
| check_integrity（repo root、source profile） | 採用 | NG 22 + Warning 1、うち新規未管理 23（delta、exit code driver）。内訳: Command 5（expanded-readme-sync: phase 5コマンドが system.md に不在）、SkillProjection 12（phase 系 6スキルが manifest・projection に不在）、RuntimeReference NG 3（REQ-106 short-form）+ WARNING 1（docs/designs/ 参照）、ReqFreshness 2（Design frontmatter updated 不整合）。baseline 既知・exempt は INFO 扱い。 |
| check_command_format | 採用 | exit 0、「OK」。 |
| check_extensions（repo root） | 採用 | ok: true、failures 0。workflow_extensions 17、capability_extensions 12、public_skills 58、workflow_skills 23、capability_skills 35。 |
| check_distribution_boundary（repo root） | 採用 | scanned 481、failures 11（concrete-id / unclassified-entry）。2026-10-11 実行時（scanned 444、failures 0）以降に全て導入された delta。scripts cwd 実行は zero-targets で不採用（前回 MECH01 と同一事象のため repo root で再実行し手順是正済み）。 |
| check_templates | 採用 | Template 14件、全検査カテゴリ NG 0。 |
| check_autogen_freshness | 採用 | 索引 6件、鮮度違反 0。 |
| lint_skills | 採用 | AG-005 NG 3件（adopted-conventions 827、artifact-semantics 701、workflow-case-auto 638文字）。既知 LINT01（2026-10-11 finding）と同一のため disposition はそちらに委譲。aggregate budget WARNING 1件。 |
| check_content_corruption | 採用 | heading / code block / link / Unicode 等すべて違反 0。 |
| check_skill_rename_symmetry | 採用 | skills 58、designs 33、違反 0。 |
| README コマンド索引の実在確認（親実施） | 採用 | root README 索引 18コマンドすべてが src/common/commands/agentdev/ に実在。コマンドリファレンス表（18件）とも完全一致。 |
| BOM / CRLF-LF 混在確認（親実施） | 採用 | src/common 配布物 md に BOM 付きファイルなし、単一ファイル内改行コード混在なし。 |

## 処理記録（2026-10-13 inspect-promote、backlog-auto stage 2）

- promote 7件（DS09・DS11・DS12〔20261011 DS08 を統合〕・DS13・DS15・GR08・DB01）→ `.agentdev/inspect/promoted/finding-20261013-*.md` へ保存・本ファイルから削除
- reject 0件
- defer 12件（本ファイルに残置）: RQ08〜RQ14・DS10・DS14・DS16・GR07・GR09
- 分類は Jev 先行評価（観測 20261013T094827Z-5dc0・発動判定 20261013T095052Z-700e）＋ adversarial-review 2 stream（分類妥当性・証拠適合）convergence 後に全件自律確定（HITL 対象なし・破壊的変更なし）
- Jev 乖離の処置: RQ10/RQ11 は promote 暫定から defer へ変更（既知 RQ03 と同 category「第一参照導線の ID 化不足」の処分一貫性）、DS10 は promote 暫定から defer へ変更（REQ-111-011 実体の所有設計判断未了〔本文追加 vs scope 注記〕。Jev defer 0.97 と一致）、DS16 は reject 暫定から defer へ変更（docs-check ルール候補〔検出閾値検討〕の知見として deferred 保持）
- 2026-10-15 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: RQ08〜RQ14・DS10/DS14/DS16・GR07/GR09 は再評価条件未充足のため defer 継続（自律確定）: 20261015T093252Z の既知 defer 照合と同結果（RQ08 crosswalk :80 は 85680dab で frontmatter のみ変更で不変、DS10 covers と本文欠落状態維持、DS14 REQ-111-013 edge 注記なしのまま、DS16 維持、GR07 は第3例〔DEC-059.md:17、6b63ba24 由来〕をカテゴリ延伸として記録、GR09 の .agentdev/phase/ 列挙は不在のまま）
- 2026-10-16 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: RQ08〜RQ14・DS10/DS14/DS16・GR07/GR09 は再評価条件未充足のため defer 継続（自律確定）: 対象ファイル（REQ-111/REQ-110/REQ-035/REQ-030・REQ-061 既存行/REQ-041/v51 Design 2件/v4-standard-lifecycle/DEC-057/DEC-058/crosswalk/artifacts-and-state.md）は 38bc58c7..636b1e2b の delta 外で対象記述不変（REQ-061・REQ-030 は新規行追加のみで既存行不変を差分確認）

## 検出事項リスト

### RQ08
- category: 横断（REQ-005 改訂の確定時制をめぐる時間軸問題。REQ 担当 F2-1/F5-1・Decision 担当 F2/F3 の統合）
- target: `docs/requirements/REQ-111.md:28`（REQ-111-013）、`docs/decisions/DEC-058.md:40,46`、`docs/designs/foundations/references/v4-v5-crosswalk.md:68-70,78-80`、`docs/requirements/REQ-005.md:17,25,26`
- evidence: REQ-111-013 は「REQ-005-001/010/011 の改訂は後継経路の実現・採用と同じ変更セットで確定すること」と定める。DEC-058:40 は「REQ-005-001/010/011 の改訂と v4-v5-crosswalk の処遇記録更新は同一変更セットで行う」、:46 は「受理は後継経路の実現・検証・正式採用の確定を意味せず」とする。crosswalk:80 は「対象行本文の書き換えは処遇実行（executed）時に行う」と規定する一方、REQ-005-001/010/011 の本文は #3656 で既に工程駆動併存記述へ書き換え済み（REQ-005 updated 2026-10-13）であり、crosswalk 該当行は処遇 redefine のまま備考列に confirmed 遷移の時点・根拠の追記がない。同一 crosswalk の優先行備考（:68-70「Definition の同一変更セットで新しい記述を保存する」）は既改訂を正当化し :80 と文面上衝突する。さらに REQ-111-013 の「採用」と DEC-058/crosswalk の「正式採用（採用規約機構への採用登録）」の対応関係が文面上確定せず、改訂の正当な確定時点の読みが読者ごとに分かれ得る。
- severity: medium
- confidence: medium（「対象行本文」「採用」の語義に解釈余地。実現・検証の完了が別証跡で記録済みの可能性）
- source_of_truth: DEC-058（accepted）、REQ-111-013、v4-v5-crosswalk 記録様式、REQ-108-012
- recommended_route: 表現是正候補 + 追跡Issue育成。同根のため REQ-111-013・DEC-058・crosswalk:76-81 の用語（確定/confirmed/executed、採用/正式採用）を一括で調停する。
- ng_classification: 今回修正対象候補（REQ-111・DEC-058・crosswalk・REQ-005 改訂はいずれも今回 delta）。
- notes: source-of-truth priority では DEC-058（accepted）側の実施（同一変更セットでの改訂）が正であり、crosswalk:80 の executed 時書き換え規定が Design 側是正対象。confirmed 遷移の有無の確定を含むため追跡Issue育成を併記。

### RQ09
- category: REQ 体系（Case 実行状態識別子の残留・番号空間衝突）
- target: `docs/requirements/REQ-111.md:33`
- evidence: 対象外節に「B15／TS-012 の GitHub・Local 両版実経路検証、新4操作への Local 適用義務、既存 REQ-009/109 の証明義務は維持する」。B15（Child Issue 相当）・TS-012（当該 Case の検証シナリオ番号と解される）は Case 実行状態の識別子で、恒久 REQ 文書に残留している。REQ-103 は TS-001〜TS-017 を REQ 内で自前定義しており（REQ-103.md:59-84、TS-012 は :76-77 の AC-18/19 検証義務）、REQ-111 側の未定義 TS-012 は REQ-103 の TS-012 と番号空間が衝突する曖昧参照になる。
- severity: medium
- confidence: high（識別子残留・番号衝突の事実）/ medium（移行期限定注記として許容する判断余地）
- source_of_truth: document-type-responsibilities.md:72（作業履歴は Design 等へ配置）、REQ-103.md:76-77
- recommended_route: 修正候補（Case 非依存の一般表現へ書き換え）または表現是正候補（残す場合は REQ-103 の TS-012 との非同一性を明示）。
- ng_classification: 今回修正対象候補（REQ-111 は今回 delta の新規ファイル）。
- notes: 対象外節であり要件行でないため doc-type 規則の直接適用外。移行期の証明義務保持宣言としての意図の可能性。

### RQ10
- category: REQ 体系（第一参照導線の ID 化不足。新規 REQ ファイル全体の相互参照不在）
- target: `docs/requirements/REQ-110.md`（全体）
- evidence: REQ-110 は REQ-106/107・DEC-057・REQ-104-008 への ID 参照をファイル内に一切持たない。DEC-057.md:37 が「REQ-106/107 の差分・追跡義務を再定義しない」「採用規約の4状態解決は REQ-104-008 へ追加する」と再利用関係を宣言しているが、REQ-110 側からは接続できない。REQ-110-008「変更駆動経路で確定した正規成果物と有効な合意を工程駆動経路でも参照して利用できること」も無 ID のまま REQ-106（差分・影響評価）の一般義務と意味接続する。
- severity: low
- confidence: high
- source_of_truth: DEC-057.md:37、REQ-106、REQ-104-008
- recommended_route: 表現是正候補（REQ-110-008 への REQ-106 参照追加、または DEC-057 関係の REQ 内明示）。
- ng_classification: 今回修正対象候補（REQ-110 は今回 delta の新規ファイル）。
- notes: 機械検査は既存参照の解決性を検査するため参照不在は検出対象外。既知 RQ03（記述内 ID 化不足）とは対象・次元が異なる新規候補。

### RQ11
- category: REQ 体系（第一参照導線の ID 化不足。既知 RQ03 と同 category の別対象）
- target: `docs/requirements/REQ-035.md:38`
- evidence: REQ-035-021「…調整決定の記録とコンフリクト解消（Level 1 rebase）への引継ぎを既存の case-close 契約と整合して行うこと」。case-close 実行契約の正は REQ-032 だが ID 参照がない。
- severity: low
- confidence: high
- source_of_truth: REQ-032（case-close 実行契約）
- recommended_route: 表現是正候補（REQ-032 への ID 参照追加）。
- ng_classification: 今回修正対象候補（今回 delta の新設行）。
- notes: 既知 RQ03 の disposition は変更しない。本行は今回 delta の新設行。

### RQ12
- category: REQ 体系（内部アルゴリズム規定の REQ 残留候補）
- target: `docs/requirements/REQ-110.md:30`（REQ-110-015）
- evidence: 「入力サイズに対する線形走査（時間計算量 O(n)、n は戻り入力のサイズ）で処理し、採用・不採用の記録は明示採用件数に比例する証跡量で出力し」。document-type-responsibilities.md:72 は内部アルゴリズムを Design 相当内容として列挙する。一方 DEC-057.md:33 は「外部AI戻り入力の非機能受け入れ条件（線形走査 O(n)・採用件数比例の証跡量・fail-closed）を採用する」と Decision で明示採択しており NFR 受け入れ条件の性格も併せ持つ。行末の「この適用対象の前提…を要件docに記録すること」は自己言及指示で表現上是正余地。
- severity: low
- confidence: medium
- source_of_truth: document-type-responsibilities.md:72、DEC-057.md:33（accepted）
- recommended_route: 表現是正候補（「線形時間で処理できること」等の受け入れ条件表現への寄せ。DEC-057 と同時整理が現実解）または docs-check ルール候補。
- ng_classification: 今回修正対象候補（今回 delta の新設行）。
- notes: 規則は「Design 相当内容のみを主たる文意とする場合」が適用条件であり、fail-closed 受け入れ条件が主文意なら違反とまでは断定できない。

### RQ13
- category: REQ 体系（DUPLICATE: 段階別同文ペアの注記不足 + 検査 I/O 詳細の Design 分離候補）
- target: `docs/requirements/REQ-030.md:44-45`（REQ-030-025/026）、`docs/requirements/REQ-061.md:68-69`（REQ-061-049/050）
- evidence: 「（受入）検査の標準出力・標準エラー・終了コード・対象版・実行条件を一回の実行から保存し…」「既知の検査入力を既存入力型と下位検査の契約から固定生成し…」が case-open 用と case-ready 用でほぼ同文。同 REQ 家族の既存段階別ペア（REQ-030-012 ↔ REQ-061-029）は REQ-030-013/REQ-061-031 のように段階間の委譲・非重複注記を持つが、本2ペアには相互参照も段階分担注記もない。標準出力・標準エラー・終了コードという検査実行の I/O 詳細を REQ 行が規定する点も Design 分離基準の混入候補だが、REQ-030-017（merge-base・diff --stat・git status を REQ 行に明記）等の既存先行様式があり、証跡義務の受け入れ条件として読める。
- severity: low
- confidence: medium（段階別 instantiation として許容される可能性が高い。既知観察 RQ11/RQ12 の REQ-008-030/REQ-030-024 パターンと同型）
- source_of_truth: REQ-030-013、REQ-061-031（既存ペアの注記様式）、document-type-responsibilities.md:72、REQ-030-017（既存様式）
- recommended_route: 表現是正候補（段階間関係注記の追加）。Design 分離面は docs-check ルール候補（証跡義務系 REQ 行の分離基準判定基準の明確化）。
- ng_classification: 今回修正対象候補（今回 delta の新設行）。
- notes: DUPLICATE の確定ではなく注記不足の候補報告に留める。

### RQ14
- category: REQ 体系（DUPLICATE: 同一 REQ 内での主題再規定）
- target: `docs/requirements/REQ-041.md:39`（REQ-041-017）vs 同 27-28行（REQ-041-005/006）
- evidence: REQ-041-005「昇格3系統相互に先行依存を設けず、安全に並行可能な処理を独立して進行させる」・REQ-041-006「競合する Git 操作…を直列化する」に対し、REQ-041-017 は「実際に並列に進め、起動記録と活動区間により成立を確認できること。競合する操作のみを排他し…系統全体を直列化しないこと」と同一主題を強化再規定する。「起動記録と活動区間により成立を確認できること」は検証手段の指定であり Design 相当内容の混入余地がある。
- severity: low
- confidence: medium
- source_of_truth: REQ-041-005/006、DEC-042（case-auto 実並列維持の同趣旨決定）
- recommended_route: 表現是正候補（005/006 との関係明示または統合注記）。
- ng_classification: 今回修正対象候補（今回 delta の新設行）。
- notes: DEC-042 の backlog-auto 版として意図された強化行の可能性。

### DS10
- category: Design（covers 宣言行と本文実体の乖離: REQ-111-011 の本文不在）
- target: `docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:8,44-50,54-63`
- evidence: :8 が REQ-111-011 を covers する。REQ-111-011 は「4操作と工程遷移は GitHub 版と Local 版の両方の正規利用経路から実行できること。Local 版で実装作業を伴う場合は、ローカル記録と実 Git 取り込み結果を独立して突合でき、成功報告だけでは確定しないこと」を定める。本文では :46「入口は両版の正規利用経路へ接続する」が独立レビューにのみ両版言及があり、工程遷移・4操作の両版実行と Local 突合の本文規定が存在しない。RA/TS 表の TS-012（REQ-111 対象外節で「GitHub・Local 両版実経路検証」と言及）への委譲のみ。
- severity: medium
- confidence: medium
- source_of_truth: REQ-111-011
- recommended_route: 表現是正候補。Local 版突合と両版実行の本文規定を追加するか、covers に scope 注記（検証義務は TS-012 参照）を付す。
- ng_classification: 今回修正対象候補（v51 Design は今回 delta の新規 accept）。
- notes: 既知 DS01〜DS04 と同型の「宣言・本文不一致」だが対象 REQ 行が新規のため別件。

### DS14
- category: Design（covers 宣言の scope 注記欠落）
- target: `docs/designs/workflows/v4-standard-lifecycle.md:10`
- evidence: :10 の implementation covers は REQ-108-001〜012 に「（v5 有限実行・責務再編の構成実体は…RA-007 が後続 OU で所有する。現行実行契約の正は REQ-108-012 が維持する）」の scope 注記を付すが、同じ行に追加された REQ-111-013 は注記なしで連結される。REQ-111-013 の implementation 実体（REQ-005 行改訂・crosswalk 処遇記録）は crosswalk:9 が implementation covers を持っており、本ファイルが所有する REQ-111-013 の implementation 実体が本文のどこにあるか特定できない。
- severity: low
- confidence: low（「現行実行契約の正の維持記述」自体を実体と解する可能性）
- source_of_truth: agentdev-traceability covers 宣言契約、v4-v5-crosswalk.md:9,74-81
- recommended_route: 表現是正候補。REQ-111-013 edge に scope 注記を付すか、実体所在を明示。
- ng_classification: 今回修正対象候補（REQ-111-013 edge は今回 delta で追加）。
- notes: 既知 DS02/DS03（REQ-108 covers）と同ファイル・同様式だが対象 REQ が REQ-111-013 で新規差分。

### DS16
- category: Design（REQ 要件行の近接言い換え。観察、代替とは断定しない）
- target: `docs/designs/workflows/v51-phase-driven-collaboration-model.md:17,54`
- evidence: :17「規約の状態は採用宣言あり、宣言なしで実効運用あり、どちらもなし、宣言があるが読取不能の4状態に分ける。既存規約がある場合はそれを適用し…」は REQ-104-008（REQ-104.md:25）の4状態・優先規則の近接言い換え。:54 の O(n)・証跡量・fail-closed 規定も REQ-110-015 の言い換えを含む。ただし両 Design とも ID 参照・covers 宣言と併存し、REQ 本文の置換・独占ではない。判定表（RA/TS 対応表、実行主体表）は Design 帰属として分離されている。
- severity: low
- confidence: medium
- source_of_truth: REQ-104-008、REQ-110-015、designs/README.md の REQ/Design 責務定義
- recommended_route: docs-check ルール候補（Design 本文の REQ 行近接言い換え検出の閾値検討）。即時修正は不要。
- ng_classification: 今回修正対象候補（v51 Design は今回 delta）。
- notes: REQ-110-015 が非機能条件を REQ 側に持つ構造自体は現行方針に従う。Design 分離（判定表・アルゴリズム帰属）は守られている。

### GR07
- category: Decision（宣言様式: 新種宣言の導入・先例なし）
- target: `docs/decisions/DEC-057.md:23`、`docs/decisions/DEC-058.md:26`
- evidence: 両ファイルは本文先頭に `<!-- ADF-COVERS(decision): REQ-... -->` を持つ。docs/decisions/ 配下で HTML コメントの ADF-COVERS 宣言を持つ Decision は他になく（DEC-030 の一致は本文中の用語言及のみ）、Decision→REQ の関連宣言の正規経路は frontmatter `related_reqs`（patterns.md:175-183「TIM の ADF-COVERS 宣言・covers 関係とは独立に管理される」）。宣言型 `decision` も既知の `(implementation)` / `(design)` にない新種。
- severity: low
- confidence: medium（規約違反とは断定できず、v5.1 wave で意図導入された新慣行の可能性）
- source_of_truth: patterns.md「Decision frontmatter 関連REQ宣言（related_reqs）規約」、v4-traceability-model の covers 宣言契約
- recommended_route: docs-check ルール候補（Decision 成果物の inline ADF-COVERS 宣言の取扱を規約へ明文化）または表現是正候補（related_reqs へ集約）。
- ng_classification: 今回修正対象候補（DEC-057/058 は今回 delta）。
- notes: REQ-059（Decision と REQ の関連宣言管理）との関係は追跡対象。

### GR09
- category: guides（内部整合: 追加案内と状態記述の不一致）
- target: `docs/guides/artifacts-and-state.md:56-62,105,163`（対比: :147）
- evidence: :147 で工程駆動実行の経路を案内しつつ、同ファイルの `.agentdev/` ツリー（:56-62）とドメイン状態の列挙（:105「Intake / Learning / Backlog / 整合性の永続データを管理する」、:163 同旨）に `.agentdev/phase/`（identity.yaml、themes.md、pending.md、received/）が現れない。`.agentdev/README.md` の状態表は phase/ を永続 domain state として掲載済み。
- severity: low
- confidence: medium（ツリーが部分列挙の可能性、保存構造の正は v51-phase-driven-collaboration-model Design が所有する点）
- source_of_truth: .agentdev/README.md 状態表、DEC-057（保存構造は Design 所有）、REQ-110-001/014
- recommended_route: 表現是正候補（phase/ を列挙に加えるか、案内範囲の限定を明記）。
- ng_classification: 今回修正対象候補（:147 の案内は今回 delta で追加）。
- notes: drafts/・inspect/・issues/・jev-observations/ の欠落は pre-existing で本件とは分離。

## 6観点 fan-in 結果

| 観点 | 結果 |
|---|---|
| SPLIT | 対象なし。REQ-110（テーマ正本・外部検討・正規成果物反映 = 4操作のうち3操作）と REQ-111（独立レビュー・工程遷移・双経路併存）は操作単位で境界が分かれ、適用範囲・対象外に重複宣言がない。 |
| MERGE | 対象なし。REQ-110-004/005/008 と REQ-106/107 の意味接続は DEC-057.md:37 の非再定義宣言により責務重複と判定しない（接続の REQ 内参照不在は RQ10 で処理）。REQ-050 との重複も確認の結果なし。 |
| MOVE | 対象なし。delta 5件（REQ-030-025/026、REQ-061-049/050、REQ-041-017、REQ-035-021）は全て新設行（git 実差分確認済み）。 |
| DUPLICATE | RQ13（REQ-030-025/026 ↔ REQ-061-049/050 同文ペア、注記不足）、RQ14（REQ-041-017 の主題再規定）。DS16（v51 Design による REQ 行近接言い換え、観察）。 |
| RETIRE | 対象なし。REQ-110/111 追加により失効した既存行を特定できず。REQ-005-001/010/011 は redefine（維持）、REQ-108-011/012 は REQ-111-013 から参照され現行。phase-plan は現行 REQ 行の所有対象として存在しない。 |
| DRIFT | RQ08（確定時制語義）、DS11（実装状態表現の不統一）、DS13（Design frontmatter 日付）、GR08（新語彙の glossary 未登録）、GR09（.agentdev/phase/ 列挙欠落）。 |

横断矛盾判定では REQ-111-013・DEC-058・crosswalk:80・REQ-005 既改訂の時間軸問題（RQ08）を最優先で評価し、source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）では DEC-058 側の実施が正であり crosswalk:80 が Design 側是正対象と判定した。担当間の判定矛盾は検出されず、同一対象の重複報告（3組）は統合済み。

## 既知 defer / false-positive 照合

既存の disposition は変更せず、今回確認できた状態のみを記録する。

| 既知 finding | 今回の状態 |
|---|---|
| RQ03（REQ-009.md:25、REQ-088.md:23 第一参照導線の ID 化不足） | 対象行は delta で不変。再報告なし。同 category の新規対象を RQ11 としてのみ報告。 |
| RQ04（REQ-006.md:38 superseded DEC-029 無注記参照） | 対象行不変。再報告なし。 |
| RQ07（REQ-061.md:52 missing-design 用語残存） | 対象行不変。再報告なし。 |
| DS01〜DS08 | いずれも対象箇所は今回 delta で意味変化なし（v4-standard-lifecycle の Wave 語彙 :24,73 も不変）。再報告なし。DS08（system.md Inventory の third-party-sync 欠落）とは別件として DS12（phase 5コマンド欠落・件数不整合）を報告。 |
| GR02（docs/README.md:8、docs/guides/README.md:18 の v5 導線欠落） | 対象行変化なし。差分として、root README・command-selection.md に工程駆動案内が追加された一方で両入口 README の現在像導線は v4 のまま、v5 基盤に加え v5.1（REQ-110/111、DEC-057/058）と工程駆動経路の導線欠落が継続・拡大した事実のみ記録する（再報告せず、disposition は既知のまま）。 |
| GR03〜GR06 | 対象節無変更。GR04 と同型の工程駆動節（command-selection.md:32-43）が追加されたが file-level ADF-COVERS（:3 に REQ-111-009/013）があるため別 finding としない。GR05 の旧参照切れ（src/opencode-local/README.md）は delta で解消（改善を記録）。GR06 の Decision Map は DEC-052→DEC-044 のまま、DEC-057/058 は relates-to のため新規未掲載行なし。 |
| LINT01（配布 Skill description 上限超過 3件） | lint_skills 再実行で同一3件（827/701/638文字）を再検出。未処分のため disposition は inspect-promote に委譲（本 finding では重複報告しない）。aggregate budget WARNING（20742 > 20300）は傾向管理として付記。 |
| MECH01（機械検査の母集団無効） | 今回は repo root から実行し有効結果を取得（check_distribution_boundary scanned 481、check_extensions ok）。scripts cwd 実行の zero-targets は再発防止のため本 finding の機械検査証拠表に手順是正済みと記録。 |

## 対象なし確認（観点別）

- Decision 意味診断: DEC-057/058 の frontmatter status は accepted で、docs/README.md・decisions/README.md（accepted 48件計上）に反映済み。DEC-057 の covers 先 REQ-110-001〜015・REQ-104-008 は実在し内容一致（採用規約4状態解決 ↔ REQ-104-008）。relations 先（DEC-053〜057）は全て accepted。delta で追加された superseded Decision への無注記参照は対象なし。
- guides 意味診断: command-selection.md の工程駆動節（:32-43）は REQ-005-010、DEC-058、REQ-111-002/009 と一致（単独起動可・前置禁止・別経路併存）。consumer-project-setup.md のローカル版記述は glossary・.agentdev/README.md と同一パス（src/common/tools/agentdev-gh/local/）で整合。
- README 索引診断: root README の工程駆動追記は索引・導線の範囲内で内容過多の対象なし。ADF-COVERS（:1 に REQ-111-013）を宣言し traceability を持つ。索引18コマンドとコマンドリファレンス表18コマンドは完全一致。
- 配布物構文健全性・文意保持: check_command_format・check_templates・check_content_corruption・check_skill_rename_symmetry すべて違反 0。コマンド参照実在・BOM/CRLF 整合も親確認で問題なし。
- 横断（guides/README と REQ-111 併存規定）: guides/README.md 自体は delta 変更なく、REQ-111 の併存規定と矛盾しない（工程駆動に触れないため矛盾は生じず、欠落は既知 GR02 に集約）。quickstart.md・req-case-flow.md も変更駆動を標準として案内し REQ-111-013 と整合。
- 未処理 artifact 確認: intake inbox 7件、learning inbox.md 未処理エントリ 20件、inspect inbox 検出事項（本ファイル含む）はいずれも本 backlog-auto cycle の stage 2（昇格3系統）の入力。drafts なし。blocked 2件（case-auto-20261008、issue-3494）は旧記録で新規異常なし。

## 観察メモ（finding としない）

- DEC-058.md:32 の Context 節「v4-v5 crosswalk は REQ-005-001/010/011 を優先棚卸し行（処遇 defer）として記録している」は決定時点のスナップショットであり、現行 crosswalk は同3行を redefine で記録済み。履歴記述として成立するが初読時に矛盾と誤読し得る（Design 担当 FD09 から参考送り）。
- `.agentdev/README.md` の phase 行「操作の実装は後続 Wave で導入」は実装追加（2026-10-13）後は陳腐化する（DS11 の附随観察）。
- v4-standard-lifecycle の Wave 語彙（:24,73、既知 DS06/GR01 対象）は今回 delta で不変。
