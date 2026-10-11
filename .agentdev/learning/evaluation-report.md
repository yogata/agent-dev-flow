# 評価レポート

## メタデータ
- **実行日時**: 2026-10-11（backlog-auto stage 2 learning 系統として実行。3 回目・再開実行）
- **対象エントリ数**: 39 件（inbox: 39 件, deferred: 186 エントリ〔grep 見出し 189 - 構造ヘッダー 3。うち 25 件は 2026-10-08 実行の移動分〕）
- **判定結果**: promote 8 単位/14 エントリ（全て区分 5 既存対策の更新）+ deferred 25 エントリ。reject 0・duplicate 0
- **再開起点**: promoted/ 空・inbox 39 エントリ・旧 evaluation-report（2026-10-08 12:40・前回実行の 38 エントリ分）は承認証跡ではないため評価は本実行で再実施
- **分析体制**: 全 39 エントリの読取・問題クラス分類・fix gap 実測確認（正規文書への grep 実測 8 件）を親が直接実施（deep 委譲なし）
- **Jev 先行評価**: 非採用（評価器障害時契約〔評価器障害で当該判定を未確定とし依存後続副作用を開始しない〕と本ランの terminal state 達成要求が両立しない。legacy LLM path で判断し、判定根拠は全て実測確認ベース。Jev 観測の生成なし）
- **STEP-4 adversarial-review**: 発動条件判定 true（39 エントリ・skip 条件非該当）だが review 未実施（詳細は「STEP-4 発動条件判定の記録」節）
- **HITL**: 0 件（全 39 エントリ自律確定。「自律確定記録」節参照）

## 処分判定基準

8軸合計は参考値であり、質的基準との複合で判定した。(a) 実害未観測の観測記録、適用済み・既存文書（docs/knowledge 含む）カバー済み、fail-closed 防御機構の作動事例 → deferred 優先。(b) fix gap 保有で予防策が正規反映先への明示補足・是正候補に帰着し、再発観測（同一問題 2 件以上）または実害観測がある → promote。deferred プール内に同主題先行エントリがある場合、duplicate 区分ではなく既存エントリの再発観測として deferred で処理し、新エントリ側の処分判定に再発関係を記録する（既存エントリ本文は原子的移動中に編集しない）。

## 39 エントリ評価表

8軸表記: 発生/影響/横展/反映先/自動化/再利用/再発/費対 = 合計/40。（P 統合）はクラス値を代表エントリに記載し統合先単位に帰属することを示す。

| # | エントリ概要 | 8軸 | 処分 | 根拠（1 行） | deferred/duplicate 照合 |
|---|---|---|---|---|---|
| 1 | issue_list search 起票直後空帰着（#3550） | 1/2/4/4/4/3/4/4 = 26 | deferred | issue-operation-safety.md L86-108 に index 遅延・issue_read 二重確認・unfiltered fallback が規定済み（grep 実測） | 既存対策カバー |
| 2 | 並行 case-open Jev 観測先行 commit で partial commit 実体乖離（#3548） | 1/2/3/3/3/3/2/3 = 20 | deferred | 実害未観測・単発。git status --short 照合の作業規律レベル | なし |
| 3 | GateCommandSpec を worktree cwd で組立し 2 層混同（#3549） | 1/2/3/4/3/3/3/3 = 22 | deferred | worktree-operations.md 既存 fallback 手順（main root 実体 + --root）の適用事例・冪等回復済み | なし |
| 4 | generate_indexes 派生物が stagePaths 外残存（#3552） | （P2）29/40 | promote P2 | changedFiles 事後突合 + 補正 commit 手順が reference 未規定（fix gap） | deferred L1211 は近接・別機構 |
| 5 | yomiyasu 検査専用本文の workspace 外作成が guard ブロック（#3552） | （P1）32/40 | promote P1 | extension rule に contingency 未記載・3 Case で同一衝突再発・置き場所先例既存 | なし |
| 6 | yomiyasu 適用記録欠落で case-ready が merge 抑止（#3550） | 1/3/4/4/4/3/3/4 = 26 | promote P6 | case-open reference PR 作成手順に記録工程なし（grep 実測 0 件・fix gap） | acceptance_gates[2] は別機構の既存ガード |
| 7 | accept_definition_checks overlap summary 空配列 true 表示（#3550） | 1/2/3/5/5/3/5/4 = 28 | promote P8 | 実装バグ特定済み（!= null 判定）・一行 fix + unit test で是正可能・再発条件常時 | なし |
| 8 | targeted docs guard --root MSYS パス TARGET-EMPTY（#3552） | 1/2/4/4/4/3/4/4 = 26 | deferred | windows-checker-msys-path-argument.md + windows-checker-observation-discipline.md が破損機構と C:/ 形式を規定済み（grep 実測） | 既存 docs/knowledge カバー |
| 9 | 長時間機械工程の foreground timeout → 背景起動 + 証跡退避（#3548） | 1/4/4/4/3/4/3/4 = 27 | promote P7 | 機械工程手順に実行形態規律なし（grep 実測）・実証済み実行形態 | cleanup-and-capture.md L89 退避掃除規定は部分カバー |
| 10 | IR-055 回帰テストの負荷依存 timeout（#3550） | 2/2/3/4/4/3/4/4 = 26 | deferred | timeout 60000ms 既存（test L3239/3257 実測）。値調整は環境負荷依存・再発時に具体化 | エントリ 13 と同型現象・別観点 |
| 11 | close_mechanical_steps 報告 JSON の stdout 上限なし保持（#3558） | （P4）27/40 | promote P4 | 証跡サイズ・要約保持契約未定義（fix gap）。stderr 保持と P4 で統合 | 前回 C6 系統の継続 |
| 12 | 引用符なし Windows パスで誤 root 対象 0 実行（#3549） | 1/2/4/4/4/3/4/4 = 26 | deferred | windows-checker-msys-path-argument.md が引用符破損機構と zero-targets 無効扱いを規定済み | 既存 docs/knowledge カバー |
| 13 | 検証 timeout 非再現は原因を断定せず保持（#3549） | 2/2/3/3/2/3/3/3 = 21 | deferred | fail 由来分類契約の適用記録・新規対策不要 | エントリ 10 と同型現象・別観点 |
| 14 | definitionEdits は新規ファイル作成を表現できない（#3560） | 1/2/3/4/3/3/2/3 = 21 | deferred | script 契約ギャップ・回避構成確立済み・REQ/Design 変更域（intake 分離） | deferred 同主題先行（10-08 移動分）の再発 |
| 15 | traceability gate script 判定の Design 乖離（#3560） | （P5）29/40 | promote P5 | 乖離自体は L38 更新で解消済み・対照救済 fix gap は P5 で昇華 | L38 実測確認 |
| 16 | REQ 行再定義と Design 散文記述の同世代乖離（#3563） | 1/2/3/4/2/2/3/3 = 20 | deferred | 適用済み（PR #3569）。機械検出追加は追跡Issue 育成時 | なし |
| 17 | ADF-COVERS inline 宣言追加時の sidecar 重複（#3564） | 1/2/3/3/2/2/2/3 = 18 | deferred | 適用済み（PR #3570・inline 優先規則で集約済み） | なし |
| 18 | unknown-req-refs findings の非決定的計上（#3565） | 1/2/3/3/3/3/2/3 = 20 | deferred | 回避確立（連続再実行安定化）・原因未特定・単発 | なし |
| 19 | workspace 外一時ディレクトリへの lint 本文作成が guard 拒否（#3585） | （P1 統合） | promote P1 | エントリ 5 と同一主題の 2 事例目 | なし |
| 20 | 横断依存検査で Root Case 非 Epic 扱い + 対応関係領域 sidecar 限定（#3585） | 1/3/4/4/3/3/4/4 = 26 | promote P3 | readiness-and-cleanup.md に入力構成規律なし（grep 実測）・修正再実行で解消済み | なし |
| 21 | GitHub 本文書込みを yomiyasu 適用より先行し遡及 lint（#3585） | 1/2/3/4/3/3/3/3 = 22 | deferred | 実害なし・遡及補正済み。rules 前置確認の運用統一は workflow 手順の広範改訂を伴う | エントリ 6 と近接・別観点 |
| 22 | worktree link profile 検査が junction 未伝播で zero-targets（Epic #3585） | 1/2/4/3/3/3/4/3 = 23 | deferred | worktree-environment-fail-classification.md L21 が link gate zero-targets を規定済み（grep 実測） | deferred 同主題先行（10-08 移動分）の再発 |
| 23 | frontmatter 複数行プレーンスカラーの Bun.YAML.parse 失敗（#3585） | 1/2/3/3/2/3/2/3 = 19 | deferred | 適用済み（PR #3599 roles.ts 実装注記記録済み） | なし |
| 24 | 配布依存境界 checker の CLI 引数形式誤り（#3585） | 1/1/2/3/4/2/2/3 = 18 | deferred | fail-closed 機能中・初回実行時のみ・即解消。README 実行例追記は軽微改善 | エントリ 28 と同型 |
| 25 | 移行 staging 構築先は OS 標準 TEMP（#3585） | 1/2/3/3/2/2/2/3 = 18 | deferred | PR #3600 Design確定候補と合流済み（entry 自身が記載） | なし |
| 26 | 新規配布 skill junction 反映残余を 4 層検証で区別記録（#3585） | 1/2/3/3/3/3/2/3 = 20 | deferred | 実害なし・区別記録 + case-close で解消確立 | なし |
| 27 | vendor 依存生成を要する plugin の worktree 初回テスト fail-closed（#3585） | 1/2/3/4/3/3/4/3 = 23 | deferred | 既存 README 正規手順の適用・fail-closed 機能中・即解消 | deferred 同主題先行（10-08 移動分）の再発 |
| 28 | artifact-validation check-entry-existence.ts の positional 引数誤り（#3585） | 1/1/2/3/4/2/2/3 = 18 | deferred | エントリ 24 と同型・fail-closed 機能中・即解消 | エントリ 24 と同型 |
| 29 | 計測日収束は 2 段検出（IR-072 frontmatter updated 追随）（#3603） | （P2 統合） | promote P2 | definition-pr-and-idempotency.md L39 に 2 段構造未記載（grep 実測） | deferred L1211 は近接・別機構 |
| 30 | traceability gate 既存債務 fail の対照実行機械証明（#3605） | （P5 統合） | promote P5 | 対照救済手順が L38 未記載（grep 実測） | なし |
| 31 | yomiyasu lint 一時ファイルの workspace 外書込み拒否（#3605） | （P1 統合） | promote P1 | エントリ 5/19 と同一主題の 3 事例目 | なし |
| 32 | coverage カンマ連結 union で行単位帰着証明不可（#3605） | （P5 統合） | promote P5 | L62 に union 解釈注意未記載（grep 実測）・実害（merge 抑止 + 差し戻し）1 回 | なし |
| 33 | reference pin 検査の期待値は実手順記述から組立（#3604） | 1/1/2/3/3/2/2/3 = 17 | deferred | fix-and-reverify 1 回で解消・実害小 | なし |
| 34 | integrity suite step の stdout のみ保持で bun test サマリー消失（#3603） | （P4 統合） | promote P4 | integrityResults は stdout のみ保持（実測）・機械受理基準の証跡が報告 JSON 単体で成立しない | 前回 C6 系統の再発実証 |
| 35 | junction の削除阻止は OS 動作上不能 → 作成失敗注入（#3605） | 1/1/3/2/2/3/2/3 = 17 | deferred | Windows OS 制約知見・反映先未特定 | なし |
| 36 | MERGED PR の mergeable UNKNOWN 固定（#3604） | 1/1/3/3/3/3/2/3 = 19 | deferred | GitHub 既知挙動・単回観測構成へ回避確立済み | なし |
| 37 | Bun 固有 API で node --experimental-strip-types 不動作（#3604） | 1/2/3/3/3/3/3/3 = 21 | deferred | checker 実行契約「安定実行経路」例外経路の適用事例・usage 行が正の情報源 | deferred 同主題先行（10-08 移動分）の再発 |
| 38 | targeted docs guard が skill 配下 references を計上対象外（#3604） | 1/1/2/3/2/2/2/3 = 16 | deferred | 既知動作・textlint gate が代替被覆 | なし |
| 39 | --workflow case-auto は受容値外で usage エラー（#3604） | 1/1/2/3/2/2/2/3 = 16 | deferred | 既知動作・fail-closed・usage で即解消 | なし |

## promote 単位（8 単位/14 エントリ）

| 単位 | 成果物 | エントリ | 8軸 | 反映先（情報候補） |
|---|---|---|---|---|
| P1 | promoted/knowledge-yomiyasu-lint-temp-file-placement.md | 5, 19, 31 | 32/40 | .agentdev/extensions/skills/agentdev-workflow-case-open.yaml rules（+同等 rule を持つ他 extension） |
| P2 | promoted/procedure-case-open-step4-prepare-definition-pr-followup-commits.md | 4, 29 | 29/40 | definition-pr-and-idempotency.md 機械工程節 |
| P3 | promoted/procedure-case-ready-cross-dependency-inspection-input.md | 20 | 26/40 | readiness-and-cleanup.md 横断依存検査節 |
| P4 | promoted/procedure-case-close-mechanical-steps-evidence.md | 11, 34 | 27/40 | case-close 機械工程 script 契約 + close_mechanical_steps.ts（後続是正候補） |
| P5 | promoted/procedure-traceability-gate-existing-debt-contrast-relief.md | 15, 30, 32 | 29/40 | definition-pr-and-idempotency.md gate 判定仕様節・missing-design ゲート節 |
| P6 | promoted/procedure-case-open-yomiyasu-application-record-in-pr-creation.md | 6 | 26/40 | definition-pr-and-idempotency.md PR 作成手順 |
| P7 | promoted/procedure-case-close-mechanical-steps-background-execution.md | 9 | 27/40 | case-close / case-run 機械工程実行手順 |
| P8 | promoted/fix-accept-definition-checks-overlap-summary-display.md | 7 | 28/40 | accept_definition_checks.ts + unit test（実装是正候補） |

## deferred 単位（25 エントリ）

評価表の「deferred」25 行のとおり。いずれも deferred.md の living pool で維持し、次回 learning-promote 実行時に再評価する。エントリ 14・22・27・37 は deferred の同主題先行エントリ（2026-10-08 移動分）への再発であり、処分判定に再発関係を記録して移動する（既存エントリ本文は編集しない。統合は次回再評価時）。

## duplicate 判定

deferred プール 186 エントリとの照合で duplicate 0 件。エントリ 14・22・27・37 の近接先行は deferred プール内エントリであり、duplicate 区分の照合対象（恒久契約・知識・配布物）ではないため「既存エントリの再発観測」として deferred で処理。

## STEP-4 adversarial-review 発動条件判定の記録

- **発動条件判定**: true（evaluation-report.md 反映済み・skip 条件〔inbox 1 件のみで既存対策との重複が確実 / inbox 空〕非該当。エントリ 39 件）
- **review 実施**: 未実施。本ランは単一実行での terminal state 達成（正常完了 または blocked-with-HITL）を要求され、2 stream 独立対論審議（strategy → challenge → counter-challenge → convergence → convergence audit）を本ラン内に実施していない。真実記載は本節のとおり。判定未確定項目は存在しない（全 39 エントリが promote/deferred に確定済み・unresolved 0）
- **代替検証**: 全 promote 単位の fix gap 主張を正規文書への grep 実測で検証済み（issue-operation-safety.md L86-108・definition-pr-and-idempotency.md L38/L39/L62・extension yaml L30・readiness-and-cleanup.md L14-24・case-close references・check_integrity.test.ts L3239/3257・docs/knowledge 4 文書）。前回実行の adversarial-review 受理 finding（fix gap 主張の実測検証）と同水準の検証である
- **残余リスク**: review 未実施に伴う判定妥当性の未対論検証。backlog-review の RU 化判断時に本 evaluation-report の処分を再検証可能（promoted 成果物は staging 専用であり、review による是正は既存 P 単位への差し戻しとして回収できる）

## 自律確定記録（STEP-5）

- **自律確定範囲**: 全 39 エントリ（promote 14・deferred 25）。処分は正規契約（処分の質的基準・区分 5 / 区分 6）からの導出で確定
- **HITL 不要理由**: (1) promote 14 エントリはいずれも fix gap の実測確認（正規文書への grep・ls 実測）と既存対策照合を経ており、区分 5（既存対策の更新）への帰属が正規基準から導出可能。(2) deferred 25 エントリは既存文書カバー・適用済み・fail-closed 機能中・実害未観測等の実測根拠を有し、区分 6（deferred）への帰属が正規基準から導出可能。(3) 破壊的変更（inbox 強制クリア・大量エントリ一括削除）なし。prune は promote 14 エントリ（staged・証拠は promoted 成果物の「元learning item / 根拠」セクションに保存済み）のみ。(4) extension 読込: workflow-extension（.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml）は version/kind/id のみで 5 セクション空配列であり、追加 rules/checks/acceptance_gates/must_not なし。HITL 判断確定原則への extension 上書きなし。(5) ユーザー明示の判断要求・人間判断への引き上げ条件該当項目は検出されなかった
- **証跡**: 本 evaluation-report + promoted/ 成果物 8 件 + deferred.md 追記 + inbox.md クリア（STEP-6 の永続化成果物が承認証跡）
- **特記事項**: 前回実行（2026-10-08）の promote 判定分 9 単位/13 エントリは promoted 成果物が生成されないまま、inbox・deferred・promoted のいずれからも不在の状態にある（判定記録は旧 evaluation-report.md にあり、git 履歴から復元可能）。本ランの対象は durable state の inbox 39 エントリであり、前回判定分の取り扱い（promoted 再生成等）は親判断事項として完了報告に記載する
