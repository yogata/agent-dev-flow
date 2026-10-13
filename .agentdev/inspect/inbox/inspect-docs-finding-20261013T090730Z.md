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

### DS09
- category: Design（一時成果物 RU への現在形参照・所有宣言。参照解決不能リスク）
- target: `docs/designs/workflows/v51-phase-driven-collaboration-model.md:70`、`docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:54,60`
- evidence: v51-phase-driven:70「工程駆動ルートの経路別所有境界とDesignのdraftからacceptedへの昇格は、RU-0002 が所有する v4-standard-lifecycle 更新と整合させる」。v51-phase-transition:54「RU-0002 の B01〜B16 と B16 能力群対応表、および TS-001〜TS-014 を検証時参照として用いる」、:60「RU-0001からの統合接続」。一方で `.agentdev/backlog/req-units/` は空（実確認）、REQ-008-010 により RU-0001/RU-0002 は case-ready 成功後の削除済み正当状態。accepted Design が削除済み一時成果物を現在形の所有者・検証時参照として指し、リポジトリ内で解決できない。
- severity: medium
- confidence: high（RU 不在・削除契約は事実）/ medium（Case Issue #3654 等への内容退避の意図の可能性）
- source_of_truth: REQ-008-010、REQ-008-011、v4-standard-lifecycle:69-71（RU-0002 由来の更新は既に本体へ反映済み）
- recommended_route: 表現是正候補。所有・参照先を永続成果物（v4-standard-lifecycle 本体、v4-v5-crosswalk、Decision 承認記録）へ付け替え、RU は出所の履歴注記に留める。
- ng_classification: 今回修正対象候補（v51 Design 2件は今回 delta の新規 accept）。
- notes: 同型の参照は checker-execution-contracts.md:22（RU-0004/RU-0007、背景説明で影響小）、design-health-metrics.md:55（RU-0001 AG-002、pre-existing の出所注記型）にも存在。横断是正として育成する価値がある。

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

### DS11
- category: 横断（実装済み機能の移行期表現の不統一。REQ 担当 F1-3・Decision 担当 F1・Design 担当 FD03 の統合）
- target: `docs/guides/artifacts-and-state.md:147`、`docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:14,50`、対比: `README.md:19,47`、`docs/guides/command-selection.md:42`、`src/common/commands/agentdev/README.md:14,22-26`、`.agentdev/README.md` phase 行
- evidence: artifacts-and-state.md:147 は工程駆動実行を「（将来実装予定）」と記す。v51-phase-transition:14「公開操作の最終名、保存方式、具体的なスキル構成は…後続設計が確定する」、:50「具体的な公開名と保存実装は後続の実現設計で確定する」と未来形で記す。一方、同一 delta 窓内の commit ed0dc04d・69573879（2026-10-13）で phase-tasks-create/update、phase-artifacts-update、phase-review、phase-transition の5コマンドと workflow skill 5件が実装済みであり、root README 索引・コマンドリファレンス・command-selection.md:42（「各操作は単独で起動でき」現在形）・v51-phase-driven:25-28（最終名を現在形で定義）は限定なしで現行として案内する。同一経路の実装状態の現在性が導線間で割れている。
- severity: medium
- confidence: high（表現不整合は確認済み）/ medium（「将来実装予定」が Local 版適用（REQ-111-011）や正式採用など別の限定を意図する可能性）
- source_of_truth: REQ-111-011、REQ-111-013、DEC-058、root README 索引（18コマンド）、実装ファイル群
- recommended_route: 表現是正候補（「将来実装予定」「後続設計で確定」の意図する限定内容を明記し、全ミラー箇所で表記を統一）。
- ng_classification: 今回修正対象候補（当該記述は今回 delta で追加）。
- notes: `.agentdev/README.md` phase 行「操作の実装は後続 Wave で導入」も実装済み後は陳腐化する（附随観察）。実装済み範囲の GitHub 版 / Local 版の断定は REQ-111-011 の検証義務の状態次第で保留。

### DS12
- category: Design（システム仕様の現行性欠落。機械検査 NG 裏付け・expanded-readme-sync）
- target: `docs/designs/foundations/system.md:104,119-139`
- evidence: :104 が「公開 Command（13件）」と宣言する一方、src/common/commands/agentdev/ には phase-tasks-create / phase-tasks-update / phase-artifacts-update / phase-review / phase-transition の5配布コマンドが実在し（commit 69573879、2026-10-13）、root README の索引は18コマンド。system.md 全文中の `phase-` 記述は0件（grep 実証）、「工程駆動」の言及も foundations/ 配下では crosswalk のみで system.md に皆無。一覧表（:121-139）は12公開コマンド+内部5段階で、5 phase 行が不在かつ件数宣言13件が実態18件と不整合。
- severity: medium
- confidence: high
- source_of_truth: src/common/commands/agentdev/ 実在ファイル群、root README 配布コマンド索引（18件）、REQ-111-011（両版正規利用経路）
- recommended_route: 修正候補。system.md の Inventory 一覧表へ5コマンド行を追加し件数宣言を現行化する（工程駆動の節追加要否は owner 判断）。
- ng_classification: 今回修正対象候補（phase 5コマンド追加に対する system.md 未更新は今回 delta）。
- notes: 既知 DS08（third-party-sync 行の欠落、12対13）とは別件。本件は phase 5コマンド欠落と件数13対18の不整合。docs-check の expanded-readme-sync が検出済み。附随観察: phase 5コマンドには docs/designs/commands/ 配下の command Design も存在しない（glob 実証）。v51-phase-transition:14,50 の「後続設計で確定」との絡みで Design 未整備の現状が恒久化されないよう DS11 の処置と連動させること。

### DS13
- category: Design（機械検査NG裏付け: req-updated-freshness・IR-072、2件）
- target: `docs/designs/local/local-case-file.md:5`、`docs/designs/responsibilities/custom-tool-contracts.md:5`
- evidence: local-case-file.md は frontmatter `updated: 2026-10-04` に対し最終内容変更が 5958fe7e「ローカル版マージ取り込み保証の実装」2026-10-13（:143-147 のマージ結果節が該当差分）。custom-tool-contracts.md は frontmatter `updated: 2026-10-07` に対し最終内容変更が 321ebf3e「engine 入力契約の pr_merge commitHash 伝播」2026-10-13（:48 の pr_merge 入力契約が該当差分）。いずれも IR-072 違反。
- severity: low
- confidence: high
- source_of_truth: IR-072（docs/designs/integrity/rules/IR-072-req-updated-freshness.md）、git log
- recommended_route: 修正候補。両 frontmatter updated を 2026-10-13 へ進行。
- ng_classification: 今回修正対象候補（内容変更は今回 delta）。
- notes: 機械検査 ReqFreshness NG 2件の裏付け。本文内容と REQ 行の整合は別途問題なし（custom-tool-contracts の内容面は DS15 で別報）。

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

### DS15
- category: Design（両版等価性の例外列挙漏れ）
- target: `docs/designs/responsibilities/custom-tool-contracts.md:48,70-71`
- evidence: :48 が「pr_merge はローカル版の取り込み確認情報として commitHash…を受理する。ローカル版では必須として検証し（実在確認）、GitHub 版では受理してマージ動作には使用しない」と版差異を宣言する。一方 :70 は「両版は操作名、入力構造…失敗の意味を同値とする」、:71 の例外明示リストは「ローカル版追跡Issueの通常ラベル非許容」「ローカル版 case の再オープン拒否」「isDraft の値差異」の3件のみで、commitHash の検証・不使用差異が列挙されていない。受理動作の版差異は :71 が列挙を求める種別（受理条件差）に該当する。
- severity: low
- confidence: medium
- source_of_truth: REQ-011-024（物理写像差異の宣言。custom-tool-contracts:60 が宣言義務の先例として適用）、REQ-111-011（commitHash 機構の源と推定）
- recommended_route: 表現是正候補。:71 の例外明示リストへ commitHash 受理差異を追記。
- ng_classification: 今回修正対象候補（:48 の契約は今回 delta で追加）。
- notes: REQ-011 には pr_merge 固有の要件行がなく（REQ-011-030/031/032 は pr_read/pr_create/pr_update）、commitHash 契約の REQ 源が REQ-111-011 であることの明示が無い点も附随観察。

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

### GR08
- category: guides（語彙整備: 新規コマンド・用語の案内欠落。REQ 担当 F3-DR1・Decision 担当 F5 の統合）
- target: `docs/guides/glossary.md:7-28`（コマンド表）および用語各節、`docs/designs/authoring/vocabulary-registry.md`
- evidence: 他の公開コマンド13件は全て「コマンド」表に掲載される一方、delta で追加された phase 系5コマンドの掲載がない。「工程駆動実行」「変更駆動」「検討テーマ」「テーマ正本」「外部AI検討」「工程遷移」「後継経路」等の REQ-110/111・DEC-057/058 で導入された中核用語も glossary・vocabulary-registry の双方に未登録（grep 0件確認）。delta 内で glossary は更新済み（ローカル版パス修正）だが工程駆動系は未追加。
- severity: low
- confidence: high（欠落は事実）/ medium（glossary・語彙レジストリに網羅義務の明文はない）
- source_of_truth: REQ-110/111、DEC-057/058、src/common/commands/agentdev/README.md:22-26、REQ-094（用語選択基準）
- recommended_route: 表現是正候補（コマンド表への5コマンド追記と主要用語の追加を検討）。網羅検査は docs-check ルール候補（新 REQ 主要語彙と glossary の差分検査）。
- ng_classification: 今回修正対象候補（欠落は今回 delta 由来）。
- notes: glossary は選択掲載スタイルであり、必須欠落とは断定しない。

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

### DB01
- category: 配布物整合性（delta 由来の配布境界違反群。repo root 実行の機械検査に基づく）
- target: `src/common/skills/agentdev-phase-theme-collaboration/SKILL.md:96`、`src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md:27,83`、`src/common/skills/agentdev-phase-theme-collaboration/scripts/README.md:86,100`、`src/common/skills/agentdev-workflow-case-auto/SKILL.md:129`、`src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md:50,52,55`、`.opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml`、`.opencode/skills/` 投影
- evidence: (1) SkillProjection 12 NG: phase 系6スキル（agentdev-phase-theme-collaboration、agentdev-workflow-phase-artifacts-update、agentdev-workflow-phase-review、agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-transition）が skill-projection-manifest.yaml に未登録かつ .opencode/skills/ 投影に不在（ls 実証。規定対処は `scripts/install.ps1 -Mode apply` による junction 再構築）。(2) RuntimeReference NG 3: REQ-106 short-form 参照が phase-theme-collaboration:96、workflow-phase-artifacts-update:27,83 に存在（consumer 環境で解決不能、IR-055 strict）。(3) check_distribution_boundary（repo root、scanned 481）11 failures: 上記 REQ-106×3 に加え、REQ-108-006（case-auto:129）、REQ-021-015/018・REQ-061-023・REQ-021-024（case-open definition-pr:50,52）、IR-072（case-open definition-pr:55）、REQ-060・THEME-001（phase-theme-collaboration scripts/README:86,100）。2026-10-11 実行時は failures 0 であり全て今回 delta で導入。
- severity: medium
- confidence: high（機械検査の有効実行結果と ls・grep による実証）
- source_of_truth: IR-068（skill-projection-manifest）、IR-055（REQ-NNNN 参照禁止）、IR-053 系（distribution reference boundary）、REQ-009-016 系（配布境界）
- recommended_route: 修正候補（phase 6スキルの manifest 追記と junction 再構築、REQ-106 short-form 参照の自己完結表現への書き換え）。case-open/case-auto の行参照・IR-072 参照は境界規則上の除外運用（baseline 追加）か表現是正かの処遇判断を追跡Issue育成で確定する。
- ng_classification: 今回修正対象候補（いずれも 2026-10-11 以降の delta）。
- notes: lint_skills AG-005 NG 3件（description 超過）は既知 LINT01 と同一のため本 finding では処分変更しない。check_integrity は case-open 系を baseline 管理（approved additions）としており、check_distribution_boundary との判定差の整理も追跡課題に含める。

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
