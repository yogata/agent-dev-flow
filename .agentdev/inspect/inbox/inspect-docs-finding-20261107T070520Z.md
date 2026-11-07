# inspect-docs finding 20261107T070520Z

## サマリ

- スキャン対象: docs全体（REQ 76件〔現行〕+ retired 19件 / Decision 61件〔accepted 52 + superseded 9 + 欠番 DEC-018〕/ Design 186件 / guides 14件 / docs・root README / 配布物 source〔src/common・src/opencode 244ファイル〕）
- 検出事項: 16件（high 2件 / medium 12件 / low 2件）
- カテゴリ別: REQ体系 5件・Design 6件・Decision/guides/README 4件・配布物整合性 1件
- 診断方式: STEP-2 を REQ体系・Design・Decision/guides/README の3診断担当へ並列委譲し親が fan-in。STEP-2-0 で docs-check 検査スクリプト群・README 索引突合・実行を機械候補として取り込み。STEP-3 は親が逐次実施
- 既知 defer 照合: 12系統のうち IDX-06・IDX-10 の2件が再評価条件発火で findings に昇格、残り10系統は defer 継続
- 実行環境ラベル: win32 / bun 1.3.6 / main HEAD 9e8c53e63 / delta window 2026-10-26〜2026-11-07 / timeout 発生なし

## 検出事項リスト

### FD-03: draft Design への現行権威指定（v5 採用規約機構）
- id: FD-03
- category: Design 意味診断（draft status の権威参照）
- target: `docs/designs/foundations/v5-adopted-conventions.md:3`（status: draft）← 参照元: `docs/designs/commands/case-auto.md:484-485`、`docs/designs/commands/case-run.md:374-375`、`docs/designs/commands/req-define.md:196`、`docs/designs/foundations/v4-operating-model.md` COVER 注記
- evidence: 2026-11-04 に追記された「採用規約の解決の構造…の正は v5 採用規約機構 Design『解決手順』…各節であり、本 Design は重複定義しない」等の文言が、status: draft の Design を単一の正として指定。参照先の各節は draft 内に実在（同ファイル :57「解決手順」、:81「移行期デフォルトとの接続」、:89「判定規則」）。accepted 複数 Design が draft 文書を正として指定する状態
- severity: medium
- confidence: medium
- source_of_truth: docs/designs/README.md status 規則（draft は case-close 昇格で accepted へ遷移）
- recommended_route: req-define再壁打ち候補（正規の確定経路〔case-close Design 確定フロー〕での accepted 昇格、または参照側への移行期注記追加）
- ng_classification: 要ヒューマンレビュー
- notes: Epic #3907/#3909 Wave の Definition 先行受入 → Design 昇格追従という進行中の遷移状態であり意図的順序の可能性が高い。昇格欠落の放置が実害化条件

### FD-04: draft Design への現行権威指定（検証用一時資材ライフサイクル）
- id: FD-04
- category: Design 意味診断（draft status の権威参照）
- target: `docs/designs/workflows/verification-resource-lifecycle.md:3`（status: draft）← 参照元: `docs/designs/commands/case-close.md:162`（「登録契約は検証用一時資材のライフサイクル Design」）、`docs/designs/workflows/v4-delegation-contracts.md:88`（「所有契約の正は…ライフサイクル Design が担い」）
- evidence: accepted の case-close Design と v4-delegation-contracts Design が、window 内新規作成（2026-11-05）の draft Design を登録契約・所有契約の正として指定。双方向参照は成立、被参照側が未確定状態。REQ-118 自体は現行 REQ（current 配置）として追加済み
- severity: medium
- confidence: medium
- source_of_truth: docs/requirements/REQ-118.md（current）、REQ-032-043〜046（実在確認済み）、docs/designs/README.md status 規則
- recommended_route: req-define再壁打ち候補（Epic #3928 wave 完了時の case-close 昇格経路で accepted 化。FD-02 の行登録とセット）
- ng_classification: 要ヒューマンレビュー
- notes: draft は正常なライフサイクル初期状態。「accepted 文書が draft を正と指定したまま昇格を待つ期間の長さ」が実害化条件

### FD-05: REQ-006-021 死ID引用の意味接続不明瞭（case-run・adapter）
- id: FD-05
- category: REQ 参照ID整合性（廃止行引用の可読性）
- target: `docs/designs/commands/case-run.md:409`、`docs/designs/skills/agentdev-case-run-execution-adapter.md:39`
- evidence: 「REQ-006-021 廃止に伴い PR URL フォールバック検索不使用」。REQ-006-021 は現行 REQ-006.md に存在しない（現行行は REQ-006-105〜109・111〜114 の9行のみ。2026-08-15 commit 9653d8d19 の REQ-006 分割で削除、retired/ にも不在）。削除時点の当該行内容は「case-open の deviation 分類と case-close 委譲廃止」であり PR URL 受領と内容接続しない。引用自体は歴史文脈明示（「廃止に伴い」）だが、削除根拠として示した行の内容から論理を復元できない
- severity: medium
- confidence: high（行不存在）/ medium（誤引用か意図的歴史痕か）
- source_of_truth: docs/requirements/REQ-006.md（現行9行）、REQ-031-029（docs/requirements/REQ-031.md:47。委譲結果受領の3点検査が現行の正）
- recommended_route: intake（現行根拠 REQ-031-029 への参照差し替え、または REQ-006-021 の移転先〔REQ-030-011〕とともに歴史痕である旨を明記。削除のみは変更経緯の追跡性を損なうため非推奨）
- ng_classification: pre-existing（2026-08-20 commit 5111aac36 由来、delta 外）
- notes: 同一ファイルの REQ-006-105〜108 引用群は現行実在行への有効引用で誤検出対象外

### FD-07: AG-00x 一時識別子の名前空間衝突（REQ本文中の参照が正規コーパス上で解決不能・誤解可能）
- id: FD-07
- category: REQ 参照ID整合性（曖昧識別子衝突）
- target: `docs/requirements/REQ-118.md:17-25`（AG-001〜008 の括弧参照・定義なし）、`docs/requirements/REQ-117.md:12,37,41`（AG-001〜015 自己定義）、`docs/decisions/DEC-057.md:49`、`docs/decisions/DEC-058.md:46`、`docs/decisions/DEC-059.md:60`、`docs/decisions/README.md:4,84,240,340`
- evidence: REQ-118.md:17「…登録を代替しないこと（AG-002）」— REQ-118 本文内に AG-00x の定義なし。同一番号が多系統で衝突: AG-002 は Case #3653〔DEC-057〕・Case #3654〔DEC-058〕・Case 20261027T034727JST〔REQ-117〕・REQ-118 の4系統の別意味が共存。AG-013 は DEC-059（Case #3725）と REQ-117:37（gate spec --input flag 契約変更の対象外）で別物。decisions/README.md:84「（AG-014）」も REQ-117 の AG-014（採番検証テスト）と衝突。AG-00x 使用規約を所有する正規文書は発見できず
- severity: high
- confidence: high（衝突の実在は grep 実証）
- source_of_truth: REQ-117:12（自己定義）、DEC-057/058/059 承認記録節、decisions/README
- recommended_route: req-define（Case スコープ一時識別子〔AG-00x 等〕の正規文書本文使用規約の REQ 化: 投影元宣言必須化・受理根拠節への限定・参照可読性の担保。REQ-118 には投影元宣言の追加または AG 参照の本文完結化）
- ng_classification: pre-existing（DEC-057/059 由来慣行）+ 今回修正対象候補（REQ-117/118 が新規参加し衝突拡大）
- notes: 既知 defer の REQ-111 対象外節 TS-012/B15（transient identifiers）と同系統の問題家族。req-define入力案: 「AG-00x 等 Case スコープ一時識別子の正規文書本文使用規約（投影元宣言必須化・受理根拠節への限定・参照可読性の担保）を REQ 化したい。現状 REQ-118 の AG-001〜008 は定義不在で、REQ-117/DEC-057/058/059/decisions-README の AG-00x と番号衝突している」

### FD-08: RA-005 判断参照の不解決継続（IDX-10 再評価条件発火 → 未解決確認）
- id: FD-08
- category: REQ 参照ID整合性（未解決参照・既知 defer の条件発火昇格）
- target: `docs/requirements/REQ-116.md:20`
- evidence: 「RA-005 判断（代替の構造的等価性は同等以上と認めない）」。現コーパスの RA-005 3意味: (1) `docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:118`（realization action 台帳「v4-standard-lifecycle の経路別所有境界と crosswalk の処遇記録」・TS-014 対応）、(2) `docs/designs/integrity/rules/IR-070-design-frontmatter-required-keys.md:22`（「RA-005 実被害形状」再現例識別）、(3) `docs/reports/req-053-textlint-corpus-correction.md:14`・wave5-final-verification.md:14（REQ-053 Wave 作業単位）。いずれも REQ-116:20 の判断内容と一致せず、REQ 域の永続文書から解決できない。再評価条件「RA-005-bearing designs 変更」が delta window で発火（v51・IR-070 変更済み）→ 再評価の結果、未解決のまま
- severity: medium
- confidence: high（3意味いずれとも整合せず）
- source_of_truth: v51 design RA 表（RA の正規出所候補の最有力）だが内容不一致
- recommended_route: req-define（REQ-116-002 の RA-005 参照を判断の正規出所へ更新、または参照を削除し判断根拠を本文完結化）
- ng_classification: pre-existing（既知 defer IDX-10 からの条件発火昇格）
- notes: req-define入力案: 「REQ-116-002 の『RA-005 判断』参照の解決（該当判断の正規出所特定と参照更新、または参照削除と根拠本文完結化）」。判断の原本が docs 管理外の親 Issue/Epic 記録（REQ-116:23 の「Epic #3803」系）に存在する可能性

### FD-09: Case スコープ達成義務を収容する REQ 型（実行義務 REQ・方針決定 REQ）の正規定義不在
- id: FD-09
- category: 文書分類一貫性（REQ 型定義の欠落）
- target: `docs/requirements/REQ-117.md:12,41`（型宣言と投影元宣言）、`docs/requirements/REQ-116.md:8-9`（「方針決定 REQ」自称の前例）、`docs/requirements/REQ-115.md:8-9`
- evidence: REQ-117.md:12「…15 作業単位（AG-001〜AG-015）の要求行として収容する」、:41「…は親 Case（一式識別子 20261027T034727JST）の要件doc を投影元とする」。一方 document-type-responsibilities.md「REQ と Design の配置境界」節に実行義務 REQ・方針決定 REQ 型の定義は存在せず、達成後の REQ ライフサイクル（retire 判定か恒久維持か）を所有する規約が見つからない。REQ-114〜118 が同型運用の前例（5件）
- severity: medium
- confidence: medium
- source_of_truth: docs/designs/responsibilities/document-type-responsibilities.md（分類判断ツリー・REQ配置境界）、REQ-001-067/068
- recommended_route: req-define（文書種別責務への REQ 型定義追記〔成立条件、covers 宣言様式、達成後の retire/維持判定〕。REQ 側の是正ではなく規約側の補完）
- ng_classification: 要ヒューマンレビュー（運用慣行が3例以上あり意図的設計の可能性が高い）
- notes: req-define入力案: 「実行義務 REQ・方針決定 REQ 等、Case スコープ達成義務を正規 REQ 空間へ収容する REQ 型の定義（成立条件、covers 宣言様式、達成後の retire/維持判定）を document-type-responsibilities へ追加したい。REQ-114〜118 が既に同型運用の前例」。型の定義が designs/foundations/document-model.md 側にある可能性は排除していない

### FD-10: REQ-117 要件列に実装パラメータ・内部アルゴリズム・script名を含む行（高特異性シグナル）
- id: FD-10
- category: MOVE（Design分離基準違反シグナル）
- target: `docs/requirements/REQ-117.md:25`（REQ-117-008）、`:28`（REQ-117-011）、`:30`（REQ-117-013）
- evidence: REQ-117-008「description を top 層からの削減で 600 chars 以下へ収め…集約合計 20300 以下」（行数上限・実装パラメータ）、REQ-117-011「prepare_definition_pr に…計測日不整合…を検出して…補正 commit を script 内で完結させる拡張 step」（script名・内部step）、REQ-117-013「record-comments.ts applySection の…before 末尾へ空行 1 行保証」（内部アルゴリズム）。document-type-responsibilities.md の「行数上限…Step 番号…内部アルゴリズム…のみを主たる文意とする場合 Design 等へ配置」基準に該当するシグナル。安定契約例外（REQ-001-068）には該当しない
- severity: medium
- confidence: medium
- source_of_truth: document-type-responsibilities.md の Design分離基準、REQ-001-067
- recommended_route: req-define（FD-09 の型定義に例外規定を設ける形で解消。REQ-117 個別の是正は型が承認されるまで保留）
- ng_classification: 要ヒューマンレビュー
- notes: REQ-117:12「各行は達成状態が判定可能な命題として書かれる」という自己宣言があり、数値は判定可能性のための受入基準として意図的に置かれた可能性が高い。実行義務 REQ の一時性で Design分離違反の深刻度は下がる。req-define入力案は FD-09 と共有（「実行義務 REQ 型の達成判定可能命題における数値・script名・内部step の記載可否境界を型定義に含める」）

### FD-11: v51 Design「検証時参照」範囲表記が REQ-111 現行行集合に追随していない
- id: FD-11
- category: DRIFT（design 側 REQ 行範囲表記の陳腐化）
- target: `docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:110`
- evidence: 同行「REQ-111 の受け入れ条件（REQ-111-001〜016）…を検証時参照として用いる」。REQ-111 は現行 001〜026・029〜035 まで拡張済み（027/028 は並行マージ由来の欠番）。同 Design の covers 宣言（:8）は REQ-111-021〜024・025/026・029〜035 まで拡張済みであり、covers と「検証時参照」範囲表記が不整合。REQ-111-030/032/033/035 は検証義務行だが範囲表記に含まれない。TS-001〜TS-014 には「削除済み一時成果物 RU-0002 出所」の履歴注記があるが、「REQ-111-001〜016」表記には凍結意図の注記がない
- severity: medium
- confidence: medium（covers 拡張済みである点で意図的凍結の可能性も残るが注記不在）
- source_of_truth: docs/requirements/REQ-111.md（現行行集合を正とする）
- recommended_route: intake（design 側表記の現行化または凍結注記の追加。REQ 変更ではなく付随的 Design 編集で処置可能）
- ng_classification: pre-existing（design 側追随漏れ）→ 今回修正対象候補（低 confidence）
- notes: req-define入力案（軽微・要件変更なしの付随編集）: 「v51 Design 検証時参照節の REQ-111-001〜016 範囲表記を現行行集合へ追随更新（または凍結意図の履歴注記追加）」

### FD-12: multi-host-operations.md Command 対応表の陳腐化（13件 → 実 18件）
- id: FD-12
- category: guides 意味診断（導線表の現行値乖離）
- target: `docs/guides/multi-host-operations.md:93`（影響波及: `docs/guides/consumer-project-setup.md:401`）
- evidence: 「全公開 command の対応表を次に示す（2026-10-02 時点、13件）」— 表（:95-109）は 13 行。実ファイルは 18 件（src/common/commands/agentdev/ 直下 .md 18。phase-tasks-create/update/artifacts-update/review/transition の 5 コマンドが欠落。extensions stats public_commands=18 と root README の 18 コマンド列挙と一致）。同 guide 自身の生成規律（:113-122、手順6「表の行数が列挙数と一致し…不一致があれば表を修正する」）に現状違反。consumer-project-setup.md:401「組合せと Command 対応表の現行値はマルチホスト運用ガイドが正とする」により本表が現行値の正と指定され、影響が他 guide に波及。phase-* 委譲先 skill（agentdev-workflow-phase-*）は実在し構造的除外理由もない。ファイルは phase-* 追加後の 2026-10-22（a0eaefba2）にも編集されているが表は更新されず
- severity: high
- confidence: high
- source_of_truth: src/common/commands/agentdev/ 実ファイル一覧（18件）、REQ-099-018（対応表生成・検証規律）、consumer-project-setup.md:401
- recommended_route: intake（対応表へ phase-* 5 行を追加し「18件」に更新。REQ-099-018 の検証手順を実行して差分を記録）
- ng_classification: pre-existing（phase-* 追加時に発生した陳腐化。ただし「現行値の正」指定のため今回修正対象候補）
- notes: 既知 defer GR-07（guide を「正」と表記する慣行）の対象記述の1つであり、本項はその対象における drift 実発として独立したシグナル。GR-07 自体の defer 条件（GUIDE-6 同時扱い）は不変。REQ-099 の適用範囲定義上 phase-* を対象外とする意図的判定の可能性は低い（guide 本文は「全公開 command」と明言）

### FD-13: artifacts-and-state.md 状態モデル制約の正が guide 層に閉じている（規範的権限との矛盾）
- id: FD-13
- category: guides 意味診断（案内層による規範内容の実質所有・SSoT 転倒）
- target: `docs/guides/artifacts-and-state.md:149-157`（宣言: `docs/guides/README.md:70`、導線: `docs/guides/intake-learning-backlog-flow.md:142`）
- evidence: 「以下の制約を AgentDevFlow の状態モデルに適用する」に続き「frontmatter や status フィールドによる状態管理は行わず」「AgentDevFlow は全体横断の状態遷移モデルを持たない」「入口表は…状態遷移エンジンではない」等の規範的制約を REQ/Design 引用なしで列挙。guides/README.md:70 が同 guide を「状態モデル制約…の正」と指定。一方 document-model.md:559「| guide | 人間向けナビゲーション（規範的権限なし） |」と定義。制約語句の REQ/Design 側所有者は grep で不発。document-type-responsibilities.md は command-selection.md 入口表について Design レベルで「一元所有」を指定しており、guide への所有指定自体の前例はあるが、本件の指定は guide 層内のみで行われている点が決定的な差異
- severity: medium
- confidence: high（矛盾の存在）/ medium（意図性の判定）
- source_of_truth: docs/designs/foundations/document-model.md:559（guide は規範的権限なし）、docs/designs/responsibilities/document-type-responsibilities.md:37（guide 責務境界の原本は document-model.md）、guides/README.md:4-5（案内層原則）
- recommended_route: req-define（裁定が必要: (a) 制約内容を REQ または foundations Design へ移管し guide は導線に降格、(b) document-model.md/document-type-responsibilities.md 側に artifacts-and-state.md の所有指定を Design レベルで明記〔command-selection.md 前例に揃える〕）
- ng_classification: 要ヒューマンレビュー
- notes: 既知 defer GR-07（guides/README.md が案内層ガイドを「正」と表記）と同系カテゴリの延伸（規範的権限の観点を追加）。制約が REQ-088 等に別表現で存在する可能性は排除していない。req-define入力案: 「artifacts-and-state.md の状態モデル制約節の所有層の裁定（REQ/Design 移管 vs Design レベルの所有指定明記）を判断したい。guide は規範的権限を持たないという document-model.md:559 の定義と運用が矛盾している」

### FD-14: Decision Map の supersedes 関係欠落クラスタ（IDX-06 再評価条件発火）
- id: FD-14
- category: README 索引診断（Decision Map 手動区間の関係網羅性非対称）
- target: `docs/decisions/README.md:228-268`（Decision Map 手動区間）
- evidence: Map は DEC-052→044（:267、部分置換）までの supersedes を掲載するが、frontmatter `relations: type: supersedes` を宣言する以下7件の関係が全て不在: DEC-048→DEC-036（判断方法の二分法〔決定(1)〕を判断方法3分類へ部分置換）、DEC-049→DEC-036（配備形態の部分置換）、DEC-054→DEC-037、DEC-055→DEC-033（Wave 規定の部分置換）、DEC-056→DEC-034、DEC-060→DEC-059、DEC-061→DEC-060。一方で Map は window 内（2026-10-26、commit 68f5492ad）に DEC-062 の relates-to 行（:268）を追加しており手動メンテは稼働中。既知 defer IDX-06 の再評価条件「map edited in window」が発火
- severity: medium
- confidence: high（欠落事実）/ medium（Map への掲載義務の解釈 — 範囲定義文 :226 は「現行 Decision と過去版 ADR の履歴上の関連」との字面）
- source_of_truth: 各 DEC frontmatter relations（DEC-048/049/054/055/056/060/061.md）、docs/decisions/README.md:226・:172（選択掲載方針はトピック別ビューのみに適用され Map には明記なし）
- recommended_route: intake（7関係の supersedes 行〔部分置換である旨を含む〕を Map へ追加。または Map の範囲定義文に「全 supersedes を網羅しない」方針と選択基準を明記。IDX-01/05 の generator 拡張検討と同一 Case への束ね效率あり）
- ng_classification: pre-existing（既知 defer IDX-06 からの条件発火昇格）
- notes: 部分置換（status: accepted 維持）を掲載する実質基準は DEC-051→041・DEC-052→044 の掲載済み事実から読み取れるが明文規則は未確認

### FD-15: guide 間の詳細複製による drift リスク（低優先・複数箇所）
- id: FD-15
- category: guides 意味診断（基準本文複製・SSoT アンカーなし）
- target: `docs/guides/intake-learning-backlog-flow.md:86-87`（Learning エントリ「13項目形式」の列挙。所有者は docs/designs/skills/agentdev-learning-capture.md Design）、`docs/guides/req-case-flow.md:97-108`（case-close「完了前検証」5項目・「Epic 自動クローズ」条件を SSoT アンカーなしで記載）、`docs/guides/intake-learning-backlog-flow.md:116-124`（RU 削除ルールが artifacts-and-state.md:109-122 成果物ライフサイクル表と二重記載・現状一致）
- evidence: guides/README.md:19「ガイドは基準への導線を提供し、基準本文を複製しない」に対し、所有 Design 変更時に guide が追随漏れする複製箇所が残る。乖離は未発生だが FD-12 が drift が実際に起きた前例
- severity: low
- confidence: medium
- source_of_truth: guides/README.md:19、docs/designs/skills/agentdev-learning-capture.md
- recommended_route: intake（各節に「正は〜」アンカーを付すか列挙を導線リンクへ置き換え。FD-12 修正時の同時対応を推奨）
- ng_classification: pre-existing（低優先度の今回修正対象候補）
- notes: フロー説明に必要な要約範囲の解釈（guide として許容される要約粒度の規則）は文書化されていない

## 推奨アクション

- req-define入力案: 6件（FD-03〔昇格判断〕・FD-04〔昇格判断〕・FD-07〔AG 使用規約 REQ 化〕・FD-08〔RA-005 参照解決〕・FD-09+FD-10〔実行義務 REQ 型定義〕・FD-13〔guide 所有層の裁定〕）
- docs-check（機械的是正）ルート: FD-01（IR-072 updated 進行 5ファイル）、FD-16（ID コメント置換）
- intake ルート: FD-02（README 行追加）、FD-05・FD-06（参照再根拠付け）、FD-11（v51 表記追随）、FD-12（対応表更新 + REQ-099-018 検証手順）、FD-14（Decision Map 7行追加 or 選択基準明記）、FD-15（アンカー付与）
- docs-check ルール強化候補（STEP-3-2）: (1) designs/README 横断 Design 一覧と workflows/ 直下実ファイルの突合（FD-02 パターンの未検出是正）、(2) guide 対応表の行数/列挙数突合の自動検査化（REQ-099-018 規律の機械化・FD-12 パターン）
- 要ヒューマンレビュー: FD-03・FD-04（draft 昇格の順序判断）、FD-09・FD-10（実行義務 REQ 型の承認）、FD-13（guide 所有層の裁定）

## 既知 defer 照合結果（fan-in step 5）

| 既知項目 | 結果 |
|---|---|
| RQ08/DS10 家族（REQ-111-013 vs DEC-058 vs crosswalk 用語緊張） | defer 継続（REQ-111 は delta で変更したが 013 本体と対象外節は不変、緊張源の DEC-058/crosswalk も不変。次回再評価条件: REQ-111-013 本文または DEC-058/crosswalk の変更時） |
| REQ-111 対象外節 TS-012/B15 | defer 継続（対象外節 :53 不変） |
| IDX-01（DEC-059 部分置換注記欠落） | defer 継続（ジェネレータが window 内で変更〔909668fe1〕したが注記機構は文書化済み契約どおり不変。index-auto-generation.md:203 の standalone supersede_note 解釈余地を観察記録 O2 へ） |
| IDX-05（DEC-060 同型） | defer 継続（同一機構・同一契約） |
| IDX-06（DEC-061 supersedes DEC-060 が Map 外） | 条件発火 → FD-14 として昇格（欠落は 7関係クラスタに拡大確認） |
| IDX-07/RQ17（REQ-114 の DEC-059 のみ引用） | defer 継続（REQ-114 不変。DEC-060:43 の適用宣言と inline 引用の乖離は継続中、次回 REQ-114 更新時に再燃見込み） |
| IDX-10（REQ-116 RA-005 参照） | 条件発火 → FD-08 として昇格（再評価の結果未解決） |
| IDX-11（REQ-110 TS-012 / RU-0242） | defer 継続（REQ-110 不変。RU-0242 の正規本文参照は REQ-110:75 のみ） |
| RQ10/RQ11（第一参照導線の ID 化不足） | defer 継続（要件エントリ表の変化は REQ-118 行の追従的追加のみ、既存行の形式・意味変化なし） |
| IDX-02（references 配下 Design 状態の可視性） | defer 継続（v4-v5-crosswalk と README 規則とも window 内不変） |
| DS14（workflow-skill-model REQ-111-013 edge 注記） | defer 継続（対象ファイル不変） |
| DS16（docs-check ルール候補〔検出閾値知見〕） | defer 継続（変更条件未発火） |
| GR07（guides/README が案内層ガイドを「正」と表記） | defer 継続（統合是正条件 GUIDE-6 同時扱い不変）。ただし対象記述の1つ〔multi-host 対応表〕で drift 実発 → FD-12、artifacts-and-state の正指定に規範的権限観点のカテゴリ延伸 → FD-13 |
| GR09（artifacts-and-state の .agentdev/phase/ 列挙不在） | defer 継続（列挙は不在のまま） |

## 観察記録（単発弱シグナル・finding としない）

- O1: REQ-111-027/028 および REQ-101-005 の行番号欠番は並行 Definition マージ（af44cd4d2/664cd8399「021-024 < 025-026 < 029-035 数値順に解消」）由来で REQ 本文に欠番記録なし（merge commit メッセージには記録あり）。行番号欠番の記録義務を定める正規規約は未発見、REQ-082 前例（:12 の移動元記録）と運用が一貫せず
- O2: docs/designs/integrity/index-auto-generation.md:203「supersede_note を持つ DEC 行は notes 記法として title 直後に展開」の句を standalone-supersede_note 行（DEC-059/060、superseded_by 宣言なし）にも適用すると読む解釈余地があり、現仕様と出力が不整合の可能性。IDX-01/05 の次回再裁定候補シグナル
- O3: `learning-capture`（スキル）という短縮名が command-selection.md:20・glossary.md:18・intake-learning-backlog-flow.md:72,79 の4箇所で使用（実スキルは agentdev-learning-capture。guide 内では一貫した慣用表記かつ glossary が注記済みだが命名規約との表記揺れは残る）
- O4: docs/README.md decision 表の DEC-059/060 行は :181/:182 に移動している（既知 defer IDX-01/05 の診断依頼アンカー :177/:180 からの行ズレ。anchor 更新の参考）
- O5: commit 6ed481996 による frontmatter updated 追随が FD-01 の5ファイルへ適用漏れした構図は、REQ-117-011 計測日収束 step の trigger 条件検討材料（実装側診断の参照用）
- O6: docs/decisions/README.md トピック別ビュー（:174-225）の掲載が DEC-046 までで v5 系（DEC-048〜062）がトピック導線に一つも無い。:172 の選択掲載方針により違反ではないが、v5 現在像への導線は docs/README.md「現在像への導線」節に依存している
- O7: 「後継経路の実現・採用まで現行の変更駆動経路が正であり…」の一文が root README・command-selection.md:43・artifacts-and-state.md:147 の3箇所に重複（glossary は REQ-111-013 参照で所持）。短く安定した文であり現状一致
- O8: REQ-118:11 の境界委譲宣言は REQ-032/REQ-018/REQ-007/REQ-101 を列挙するが REQ-008（一時成果物ライフサイクル）への言及なし。「一時資材」と「一時成果物」の読者混同可能性（実質重複はなし）

## 診断実施記録

- STEP-2 意味診断: REQ体系担当・Design担当・Decision/guides/README担当 の3診断担当へ書込み禁止型の非同期並列委譲（所要 10m53s / 12m30s / 11m41s、全担当完了・再委譲なし）。親が fan-in（回収確認・6観点網羅確認〔SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT すべて担当結果で扱われ欠落観点なし〕・横断矛盾判定〔source-of-truth priority で矛盾なし〕・重複排除・既知 defer 照合）を実施
- STEP-2-0 機械候補: docs-check 検査スクリプト群（check_integrity / check_command_format / check_extensions / check_distribution_boundary / check_autogen_freshness / check_content_corruption / check_knowledge_docs / check_design_frontmatter / check_templates / lint_skills / check_retired_artifact_residual / check_skill_rename_symmetry / check_executor_notation / check_delegation_contract_residual / check_workflow_preventive）を `bun run` で実行し NG/FAILURE を機械候補として取り込み。check_changed_docs は workflow 指定必須のため候補収集から除外。機械結果の要約: IR-072 新規 NG 5件（FD-01）、distribution boundary failure 1件（FD-16）、コマンド形式/拡張/内容破損/知識文書/Design frontmatter/テンプレート/autogen 鮮度/退役残存/rename 対称/executor 記法/委譲残骸/workflow preventive は全て 0違反、lint_skills の WARNING 8件は git 管理外第三者ローカル skill（explainer 等、IR-068 豁免・DEC-023 対象）のみ
- STEP-2-0 README 索引突合: requirements/README（REQ 76件、index↔実ファイル一致・retired 19件・欠番なし）、decisions/README（61 DEC・欠番 DEC-018 は :10 で宣言済み）、guides/README（13リンク全解決・14ファイル全て索引対象）、designs/README リンク（全解決・ただし FD-02 の行欠落はこの突合では捉えない逆方向不整合）、docs/README（212リンク全解決）、root README（18コマンド列挙 = 実18件、リンク全解決）
- STEP-3 配布物整合性: 構文健全性（content_corruption 430ファイル 0違反）・文意保持 0違反・ID 汚染 1件（FD-16）・エンコーディング（first-party 244ファイルで BOM 0・CRLF 0・混在 0。node_modules 内第三者 README の CRLF 混在は配布対象外）・投影鮮度（.opencode/commands/agentdev/ は src/common canonical と全ファイル同一）・責務整合（case-auto/case-run/case-close/case-open の Wave 実行制御 stage 3 単一所有・Epic 本文単一書き手〔POL-epic-tracking-single-writer〕・機械工程 script 呼出契約・close 受入 gate〔REQ-052-018・終了判定記録〕の記述が command 本体 ↔ Design ↔ skill 間で矛盾なし。v5 採用規約機構・検証用一時資材ライフサイクルの所有分離宣言〔「本 Design は重複定義しない」〕は一貫して徹底）
- 限界: 3担当は完全同一 corpus・同一深度の調査ではない（担当ごとに delta window 重点 + 機械シグナル screening）。Design 担当の covers 整合は REQ 行実在確認レベル、REQ 担当の 6観点は delta 重点 + screening の組合せ。docs-check の bun test 全件実行（QG-4 実行形態契約）は本診断の対象外（docs-check コマンド自体の gate）

## 対象外（Out of Scope）

- docs/reports/ 配下（STEP-1 スキャン対象外・歴史記録としての性質。REQ 担当が RA-005 の3意味確認で参照したのみ）
- src/common/skills/**・src/opencode/** の実装詳細（inspect-skills 系診断の対象。scripts 内部は FD-16 の配布参照境界観点のみ）
- docs/knowledge/ 配下の意味診断（check_knowledge_docs で構造違反 0。STEP-1 スキャン対象外）
- check_integrity 由来の baseline-known INFO 項目（IR-055・IR-064・IR-065・IR-067 の baseline-known、IR-053 豁免、第三者 skill lint 警告）— 既知豁免/baseline として変化なしのため今回の検出事項としない
- docs-check の bun test 全件実行と件数突合（docs-check コマンド自体の STEP-1 gate。本診断は機械候補収集のみに限定）
- .agentdev/ 配下の運用記録・状態（intake/learning/RU の処理は inspect-docs の禁止事項。STEP-3-3 で存在確認のみ）
- 前回までの inbox 16件の処理・再分類（親 orchestrator が所有）

## 処理記録（2026-11-07 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）

- promote 3件（FD-01・FD-02・FD-16。全件自律確定、HITL 対象なし・破壊的変更なし）→ `.agentdev/inspect/promoted/finding-20261107-docs-mechanical-fixes.md` へ原状保存・本ファイルから削除。根拠: FD-01 は IR-072 triage_action（updated を最終内容変更 commit 日〔author date〕へ機械的進行）の決定的適用で修正方向一意〔対象5ファイルの frontmatter updated 乖離を現物確認済み・commit 6ed481996 が同種是正の前例〕、FD-02 は designs/README.md「新規 Design 追加時の index 登録手順」への現行違反で登録内容様式も同規定が確定〔verification-resource-lifecycle 表記 0件を現物確認済み・行登録は昇格判断に依存しない〕、FD-16 は check_distribution_boundary 機械 failure 1件（baseline 未管理）の現行違反で修正方向の2択〔機能的記述への置換 or IR-059 系 baseline 登録〕を IDX-04 前例〔2026-10-27 promote〕に倣い promoted 成果物側に未決の実装判断として記載
- reject 1件（FD-06。対応不要のため即時削除・却下理由は当該 commit message 参照）: capture-boundaries.md:63,98 の REQ-006-021 参照は「case-close への委譲を廃止」が REQ-006-021 の元内容と正確に一致する変更経緯注記であり文脈が自然、現行の正（REQ-030-011）への追跡可能、検出側推奨も no-action（任意）のため対応不要確定。FD-05 対応時に本参照箇所（現状維持済み）を併せて確認する相互参照情報は FD-05 の defer 継続記録側へ引き継ぎ
- defer 12件（本ファイルに残置）: FD-03・FD-04〔draft Design 昇格判断は case-close Design 確定フローの正規経路で行う〕、FD-05〔修正方向〔参照差し替え or 歴史痕明記〕が未確定。FD-06 reject 済みの capture-boundaries.md:63,98〔現状維持が標準〕を対応時に併せて確認すること〕、FD-07・FD-09・FD-10・FD-13〔Case スコープ一時識別子使用規約・実行義務 REQ 型定義・guide 所有層裁定の恒久規範の新規確定を要し req-define 経路へ送付。FD-10 は FD-09 と同時〕、FD-08〔既知 defer IDX-10（20261026T190542Z）側の再評価条件発火・再評価の結果未解決のため IDX-10 と同時再評価条件を維持〕、FD-11〔v51 表記の現行化か凍結注記かの表現判断未確定・意図的凍結の可能性が注記不在のため解消されず〕、FD-12〔既知 defer GR12（20261017T102200Z）と同一対象表・同一論点〔REQ-099-018 組合せ記録確認の前提未了・同ガイドは delta window 内更新なしを現物確認済み〕で GR12 側 defer 前例を踏襲・同時再評価条件を維持〕、FD-14〔既知 defer DC01 族（20261017T102200Z・IDX-06 併合済み）への増分併合・同時再評価条件統合〕、FD-15〔乖離未発生の予防的改善で FD-12 と同時再評価条件〕
- 分類は Jev 先行評価（観測 20261107T072209Z-3811。FD-01 promote 1.0・FD-02 promote 0.95・FD-16 promote 1.0・FD-06 reject 0.96・他12件 defer 0.75〜1.0）＋ LLM 最終判断（全16項目で Jev 分類と一致。FD-06 のみ暫定分類 defer から Jev・検出側推奨〔no-action〕・参照の歴史的正確性確認により reject へ変更）により全件自律確定。STEP-5 adversarial-review は条件付き化発動条件（手動分類対象が存在し本質的争点が残る）を満たさないため生成せず（観測なし=契約どおり。promote 3件は v4-responsibility-boundaries「人間判断への引き上げ条件」1〜5すべてに非該当の正規契約からの決定的導出、defer 12件は採否未確定の保留判断として分類基準から導出、reject 1件は対応不要の確定）
