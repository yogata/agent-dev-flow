# 評価レポート

## メタデータ

- **実行日時**: 2026-09-27 23:11
- **対象エントリ数**: 144件（inbox: 23件, deferred: 121件〔うちインデックススキャン後の候補読込: 52件〕）
- **問題クラス数**: 6（クラスタ）＋ 未分類 11（単独）＝ 17 判定単位
- **正規化適用**: 23件（inbox 全件が新13フィールド形式。旧5フィールド形式からのマッピング適用は 0件。1件〔「agentdev-traceability coverage.ts --req へ要件行IDカンマ連結を渡すと空結果が静かに返る」〕は「問題事象」フィールド欠落のため空文字正規化、検知方法・根本原因から判定可能なため解析継続）
- **実行範囲**: STEP-1〜STEP-3（分析）。STEP-4 以降（adversarial-review・HITL 確定・採用済み成果物生成・inbox→deferred 移動・prune・git 永続化）は呼出元 orchestration の責務
- **Jev 先行評価**: 未実行（not_configured ではなく、実行判断によるスキップ。理由: 観測メタデータ sourceRevision（必須）の正確な確定に git コマンドが必要だが、本実行は git コマンド不使用制約下にある。従来経路で判定完了）

## 問題クラス一覧

### 問題クラス1: agentdev_gh のハーネスプロセス環境 gh spawn 故障（gh exit 66 全操作失敗）

- **根本原因**: harness プロセス（OpenCode サーバ）起動環境の AGENTDEV_GH_REPO 未設定＋harness プロセス内 spawnSync('gh') の無出力故障（bash 実行では再現しないプロセス環境差）。回復はハーネス再起動（ユーザー環境アクション）
- **再発条件**: AGENTDEV_GH_REPO 未設定の launcher で harness を起動し、harness プロセス環境で gh 実行解決・spawnSync が壊れている場合の全 agentdev_gh 呼出
- **予防策**: パイプライン開始時・再開時の最初の委譲前に agentdev_gh 軽量読取1操作の死活確認。障害検知時は「手動 gh 正常性確認 → durable checkpoint（確定済み判定の全部を固定）→ blocked 報告（回復はハーネス再起動を明記）」の順で固定

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（adversarial-review 修正: rubric「同一問題クラス内のエントリ数」は inbox 内件数が基準であり、deferred 既知事象 2件の加算は過大計上） |
| 影響度 | 4/5 | Root Case 作成を含む case-open 2件が並行 blocked 停止・40分超滞留 |
| 横展開性 | 4/5 | agentdev_gh 依存の全 workflow（case-open/ready/run/close・issue 等）で発生し得る |
| 反映先明確度 | 4/5 | consumer-project-setup.md・issue-operation-safety.md・checkpoint 手順を明記済み |
| 自動化適性 | 4/5 | 前置死活確認1操作は機械的に組み込み容易 |
| プロジェクト固有知識再利用性 | 4/5 | harness 環境障害の切り分け・checkpoint 運用は固有かつ高価値 |
| 再発可能性 | 4/5 | 実測2回（2026-09-25・2026-09-27）で再起動後の環境条件依存 |
| 費用対効果 | 4/5 | 死活確認1操作で子委譲の大規模な全損を回避できる |
| **加重合計** | **30/40** | |

- **推奨処分案**: duplicate — deferred.md の同一既知事象2件（「agentdev_gh は harness 起動環境でリポジトリ解決が壊れていると全操作が fail-closed 不能になる〔AGENTDEV_GH_REPO 起動環境設定が対処〕」2026-09-24、「agentdev_gh がハーネスプロセス内で gh exited with 66（無出力）で全系操作失敗 — learning 固有の残余知見」2026-09-25）が同等内容を十分カバー。inbox 側は同一性を明示参照した上での観測統合であり、残余 delta（checkpoint resume 手順・全操作拡大実測）も deferred 2026-09-25 エントリの残余知見（死活確認・durable checkpoint・無出力非零終了の切り分け）に含まれる

#### STEP-3 処分判定・既存対策照合

- **処分区分**: duplicate
- **既存対策照合**: あり（match）。該当 deferred エントリ: 上記2件。症状（全操作 fail・無出力・bash 再現不能・安定持続）、回復経路（ハーネス再起動）、予防策（死活確認・durable checkpoint・blocked 報告）が一致。inbox 側の該当 deferred エントリ有無: **あり**
- **昇華可能性**: なし（既存 deferred が十分カバー・duplicate 判定のため採用済み成果物非生成）
- **HITL 推奨**: 自律確定可能（duplicate は既存 deferred エントリとの突合で処置が一意に定まる）

#### エントリ一覧

- （日付なし）agentdev_gh 全操作で gh exit 66 が持続し Root Case 作成が blocked 停止した [inbox]
- （日付なし）gh exit 66 持続障害の並行再発観測で deferred.md 既知事象との同一性を特定し checkpoint resume を整備した [inbox]

### 問題クラス2: GitHub search/issue_list の population 列挙制約（title トークン依存・search index 遅延）

- **根本原因**: agentdev_gh issue_list の search は GitHub search/issues の in:title トークン照合であり (a) title に検索トークンを含まない Issue は検出不能（論理 role 単位の網羅列挙は物理ラベル写像内部化により直接指定不可）、(b) 作成直後の Issue は search index 反映遅延の時間窓で検出不能。0件帰着は ok: true で返り、不存在と失敗・遅延を区別できない
- **再発条件**: population 全体列挙（冪等検出・横断依存検査）および作成直後の Issue/PR の search 再検出
- **予防策**: search 0件帰着時は issue_read 直参照または gh issue list 読取補完で不存在を二重確認。population 列挙は search なし・state 単位の列挙を実測手段とし、search トークン方式は重複排除・特定用途に限定

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3169・#3175 で別々に観測） |
| 影響度 | 3/5 | 検出源の欠落は読取専用 contingency で補完・検査継続は維持 |
| 横展開性 | 5/5 | GitHub search API の一般特性。search 依存の全操作に波及 |
| 反映先明確度 | 4/5 | issue-operation-safety.md known-issues・REQ-092/093 系整備を明記 |
| 自動化適性 | 4/5 | 二重確認手順は機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Tool 契約と GitHub API 特性の接合知識 |
| 再発可能性 | 4/5 | title 非依存 Issue と作成直後再検出は運用上頻発 |
| 費用対効果 | 4/5 | 補完検出手順の明文化のみで効果大 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 既存対策の更新（5）— REQ-092（issue_list search 規律）が存在するが、index 遅延と title トークン選択性の population 列挙への影響が未取込（fix gap）。REQ-093-001 known-issues 節整備と issue-operation-safety.md の補記として昇華可能

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・fix gap。REQ-092 の search 規律は既存だが、index 遅延の実観測（0件帰着の解釈問題）と title トークン選択性の実観測（role: case でも取りこぼし）は未反映。該当 deferred エントリ有無: **なし**（近縁: 「case-run が PR 作成後に完了報告を残さず中断すると case-close が PR を検出できない」は PR 番号 SSoT 記録欠落系で別問題クラス）
- **昇華可能性**: 高（問題・根拠・望ましい状態・反映先が明確。採用済み成果物候補記述を生成可能）
- **HITL 推奨**: ユーザー判断必要（promote による昇華・反映先確定の承認対象）

#### エントリ一覧

- （日付なし）agentdev_gh issue_list は role: case 指定でも物理ラベル依存で未クローズ Case 群を網羅列挙できず… [inbox]
- （日付なし）GitHub search API の index 遅延で issue_list が作成直後の Issue を 0件帰着させる [inbox]

### 問題クラス3: 配布依存境界 gate 突合の見かけ差分解釈（番号ラベル・パス表現差）

- **根本原因**: base 差分突合の突合キーに行ラベル（手順番号付き見出し）やパス表現（worktree 物理パス / junction 論理パス）が含まれるため、手順挿入による番号シフト・profile 間のパス表現差が「新規違反」と区別できない見かけ差分として現れる
- **再発条件**: 配布依存境界 gate の base 差分突合を、番号付き手順書編集 Case または source/link 複数 profile の結果突合で実施する場合
- **予防策**: 突合手順に「件数突合＋detail 文言の番号ラベル込み対称差確認」「カテゴリ・行・スニペット一致＋パス prefix 正規化後の比較」を明文化。checker 側の正規化済みパス出力オプション追加を検討

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3161・#3169） |
| 影響度 | 3/5 | 誤判定リスクはあるが検証自体は完結済み |
| 横展開性 | 3/5 | 配布境界 gate 突合に限定される |
| 反映先明確度 | 4/5 | case-run/case-close の gate 手順・checker 出力正規化候補を明記 |
| 自動化適性 | 4/5 | 正規化比較は機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | baseline 突合系の解釈手順として再利用価値あり |
| 再発可能性 | 3/5 | 番号ズレ・profile 突合は特定条件下で発生 |
| 費用対効果 | 4/5 | 手順明文化のみで解消 |
| **加重合計** | **27/40** | |

- **推奨処分案**: project knowledge（4）候補 — 突合手順の正規化ルールの知識化。deferred（6）維持も可（出現2件・中スコア）

#### STEP-3 処分判定・既存対策照合

- **処分区分**: project knowledge（4）候補（deferred 維持の選択肢あり・境界）
- **既存対策照合**: 直接の既存対策なし・同系近縁あり。該当 deferred エントリ有無: **なし**（近縁: 「2026-08-09 command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約」「委譲メタデータの baseline 数値は参考値であり完了判定は再検索の実測で行う」「NG baseline の bucket key は語彙置換で陳腐化する」— baseline 突合の見かけ差分系の一般知見だが、配布境界 gate の detail 文言突合に特化したものは無い）
- **昇華可能性**: 中（知見は自足的だが反映先の選択に幅がある）
- **HITL 推奨**: ユーザー判断必要（promote か deferred 維持かの価値判断）

#### エントリ一覧

- （日付なし）配布依存境界 gate の base 差分突合は detail 文言の番号ラベル込み比較で差分の実質を判定する [inbox]
- （日付なし）配布境界ベースライン突合で --profile source と --profile link のパス表記差を正規化比較で解消した [inbox]

### 問題クラス4: 共有主リポジトリ並行操作下の git 前置状態確認欠落

- **根本原因**: 共有主リポジトリの git 状態は並行プロセス（他セッションの branch 切替・先行セッションの revert 中断残骸）で変化し得るが、各工程の前置確認に「長形式 git status の operation in progress 表示確認」「commit 前 current branch 確認」が含まれず、porcelain 短形式では中間状態が表面化しない
- **再発条件**: 共有主リポジトリで並行 Case 実行・先行セッション中断後に、別工程が git 操作（branch 作成・main 永続化 commit）を開始する場合
- **予防策**: worktree・branch 作成を伴う workflow の前置確認に「長形式 git status で operation in progress 表示確認」を含める。永続化 commit 前に git branch --show-current で current branch を確認し、main 以外なら主ツリーでの commit を行わず worktree 経由（main checkout）へ切替

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（revert 残骸・commit 誤配置） |
| 影響度 | 4/5 | commit 誤配置の修復（reset・cherry-pick）と revert 残骸解除を要した |
| 横展開性 | 4/5 | main 永続化を行う全工程（case-ready/close・capture 永続化） |
| 反映先明確度 | 5/5 | worktree-operations.md・readiness-and-cleanup.md を明記 |
| 自動化適性 | 4/5 | 前置ガードは機械的確認として組み込み容易 |
| プロジェクト固有知識再利用性 | 5/5 | 並行実行時の git 安全運用は本プロジェクトの核心的運用知識 |
| 再発可能性 | 4/5 | 並行 Case 実行は常態化している |
| 費用対効果 | 5/5 | 前置確認のみで重大な履歴汚染を防止 |
| **加重合計** | **33/40** | |

- **推奨処分案**: 既存対策の更新（5）— worktree-operations.md（書込み guard 運用指針・前置状態確認）と case-ready readiness-and-cleanup.md（STEP-7 前置ガード）への補記。既存の並列実行安全指針に対する guardrail insufficiency の解消

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・guardrail insufficiency。agentdev-git-worktree worktree-operations.md に書込み guard 運用指針が存在するが、前置状態確認手順に operation in progress 表示確認・current branch 確認は未明文化。近縁 deferred: 「2026-09-14 case 2805: サブエージェント bash の Windows パス結合不具合」（commit 前の git status --porcelain 確認を前置手順として維持、と共通予防策）あり。該当 deferred エントリ有無: **なし**（近縁あり）
- **昇華可能性**: 高（スコア最高。問題・根拠・反映先が明確）
- **HITL 推奨**: ユーザー判断必要（promote 昇華の承認対象）

#### エントリ一覧

- （日付なし）main リポジトリに revert 進行中の中断残骸を検出し Definition branch 作成前に git revert --abort で復旧した [inbox]
- （日付なし）並行 case-open による主リポジトリ branch 切替下で case-ready STEP-7 の永続化 commit が並行 Definition branch へ誤配置される [inbox]

### 問題クラス5: agentdev-traceability coverage CLI の --req 複数行カンマ指定の静かな空結果

- **根本原因**: coverage.ts 実装が --req 値をカンマ split せず入力文字列全体を単一 reqId として扱い、README 文言（「要件行IDの個別カンマ指定のみを受理」）と実装が不一致。emptyResult は「該当なしの証明」と「入力形式不一致」を区別せず終了コード 0 で返る
- **再発条件**: coverage / impact / check（共通 argv 解析 cli_utils.ts）の --req へ複数要件行をカンマ連結で渡し、空結果を該当なしと誤読する場合
- **予防策**: 実装へのカンマ split 追加、または README 文言の実装実態（単一 reqId のみ）への修正。どちらかを coverage 3 CLI で統一。複数行指定の初回は単体実行で cross-check

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3171・#3183 で同不具合を別々に観測） |
| 影響度 | 2/5 | 単体実行への切替で解消・検証結果への影響なし |
| 横展開性 | 4/5 | coverage / impact / check 3 CLI に共通 |
| 反映先明確度 | 5/5 | scripts README・coverage.ts・実行手順を明記 |
| 自動化適性 | 4/5 | split 追加または文言修正は容易 |
| プロジェクト固有知識再利用性 | 4/5 | CLI 契約と手順文書の突合知識 |
| 再発可能性 | 4/5 | README を信頼した複数指定は自然に起こる |
| 費用対効果 | 5/5 | 小修正で解消 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 既存対策の更新（5）— README 文言と実装の整合修正（または実装 split 追加）の候補記述。既存一般規範（「手順文書への CLI オプション記載は実装の argv 解析と突合する」）の doc/README 側への適用漏れ類型

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・fix gap。deferred に一般規範「手順文書への CLI オプション記載は実装の argv 解析と突合する」（#cli-contract）が存在し、本件はその doc README 側の適用漏れ。該当 deferred エントリ有無: **なし**（一般規範の近縁あり）
- **昇華可能性**: 高（問題・根拠・反映先が明確・2観測で再現性確認済み）
- **HITL 推奨**: ユーザー判断必要（promote 昇華の承認対象）

#### エントリ一覧

- （日付なし）agentdev-traceability coverage.ts の --req 複数行カンマ指定は実測で emptyResult を返し… [inbox]
- （日付なし）agentdev-traceability coverage.ts --req へ要件行IDカンマ連結を渡すと空結果が静かに返る… [inbox]（「問題事象」フィールド欠落・正規化適用）

### 問題クラス6: worktree 検証環境の projection・依存伝播前提（.opencode projection 不完全・node_modules 未伝播）

- **根本原因**: worktree の .opencode projection は commands / skills のみ junction 伝播し plugins / tools は不在。bun test は指定パスが実在しない場合にエラーにせず残りの対象のみ実行する（無言欠落）。worktree root に package.json が存在せず node_modules も未伝播のため、依存は package ディレクトリ単位で導入が必要
- **再発条件**: junction 未伝播の worktree で bun test 3分割正規形・tsc --noEmit を依存整備・補完なしで実行する場合
- **予防策**: worktree での正規形実行契約に projection 伝播前提と補完手順（main root からの読取専用実行または src 配下直指定）、typecheck 手順に「package 単位 bun install の前置」を明記。実施範囲を環境ラベル（junction 伝播状態・依存パッケージ状態）へ明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3183 で同時観測） |
| 影響度 | 3/5 | 補完実行で解消・ただし無言欠落の見逃しリスクは検証完全性に直結 |
| 横展開性 | 4/5 | worktree で bun test / tsc を実行する全 Case・他 worktree 利用環境 |
| 反映先明確度 | 5/5 | qg-4-final-acceptance.md・worktree-operations.md を明記 |
| 自動化適性 | 3/5 | 前置 bun install は自動化可・projection 補完は手順依存 |
| プロジェクト固有知識再利用性 | 5/5 | worktree 環境差の核心的知見 |
| 再発可能性 | 4/5 | worktree 検証は常態 |
| 費用対効果 | 4/5 | 環境ラベル明記と前置手順で効果的 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 既存対策の更新（5）— agentdev-quality-gates qg-4-final-acceptance.md（bun test 正規形の worktree 実行注記）と agentdev-git-worktree worktree-operations.md（実行環境前提・bun install 前置）への補記

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・guardrail insufficiency。worktree-operations.md に bun test 実行環境前提の記述があるが projection 伝播前提・typecheck 前置は未明文化。近縁 deferred: 「worktree 内 checker 直接実行は junction 伝播なしで完結した」（checker は worktree 内実体で動作する実証）、「bun install を実行する配下ディレクトリには配下 .gitignore が必要」、「bun run による .ts 直接実行は package.json なし環境で Module not found」。該当 deferred エントリ有無: **なし**（近縁複数あり）
- **昇華可能性**: 高（問題・根拠・反映先が明確）
- **HITL 推奨**: ユーザー判断必要（promote 昇華の承認対象）

#### エントリ一覧

- （日付なし）Windows + bun 環境で worktree の .opencode projection が commands / skills のみ伝播し… [inbox]
- （日付なし）worktree root には package.json が存在せず bun install を worktree root で実行しても… [inbox]

### 未分類

クラスタ形成相手が inbox 内に存在しない単独エントリ。各エントリの個別判定を記載する。

#### （単独1）agentdev_gh issue_update 契約は role フィールドを受理しない（issue_create 専用）

- **根本原因**: role は issue_create 専用の入力フィールドであり issue_update は受理しない。Tool 公開説明の表現が全 tracking 操作で受理できると誤解させる
- **8軸スコア**: 発生1・影響2・横展開4・反映先5・自動化3・固有4・再発3・費対4 ＝ **26/40**
- **処分区分**: 既存対策の更新（5）— agentdev-issue-management issue-operation-safety.md（tracking 軸操作の 3 規則節）への規則明記（「issue_update は role を受理しない。labels は省略時追跡軸維持」）
- **既存対策照合**: あり・fix gap（issue-operation-safety.md 存在・role 不受理の規則未記載）。近縁 deferred: 「2026-09-15 case 2805 Epic: body 更新のみの issue_update 後に Issue state が closed へ変化した」（issue_update 副作用系で根本原因は別）。該当 deferred エントリ有無: **なし**
- **昇華可能性**: 中〜高（1規則追記の軽微な fix gap だが反映先は明確）
- **HITL 推奨**: ユーザー判断必要（promote と deferred 維持の境界スコア）

#### （単独2）配布物 references の規範参照を REQ ID 直書きで書くと IR-055 strict 違反になる

- **根本原因**: REQ ID 直書きは runtime 未解決参照として配布依存境界の検査対象になる（宣言の裏付けのない具体 ID 参照）
- **8軸スコア**: 発生1・影響2・横展開4・反映先4・自動化2・固有4・再発3・費対4 ＝ **24/40**
- **処分区分**: 既存対策の更新（5）または deferred（6）— agentdev-skill-authoring（配布物 skill reference 執筆基準）への「宣言フィールド名・概念名で記述する」指針追加が反映候補
- **既存対策照合**: あり・guardrail insufficiency（skill-authoring 執筆基準に REQ ID 直書き回避の指針は未明文化）。近縁 deferred: 「プレースホルダ除去時の IR-055 baseline delta 再検証必須」（IR-055 顕在化メカニズムの別面）。該当 deferred エントリ有無: **なし**
- **昇華可能性**: 中（執筆指針の追加として軽微）
- **HITL 推奨**: ユーザー判断必要（promote か deferred かの境界）

#### （単独3）check_integrity.test.ts の IR-055 delta テストが baseline commit 時点でも fail

- **根本原因**: 本変更非由来の pre-existing 不整合。delta baseline とテスト期待値の乖離（関連 intake 2026-09-27-integrity-delta-baseline-commit-persistence.md と同系統の疑い）
- **8軸スコア**: 発生1・影響2・横展開3・反映先2・自動化1・固有3・再発4・費対2 ＝ **18/40**
- **処分区分**: deferred（6）— 調査候補の記録であり、intake 側で同系統が管理中。情報断片的
- **既存対策照合**: あり（intake 2026-09-27-integrity-delta-baseline-commit-persistence.md が同系統調査候補を管理）。該当 deferred エントリ有無: **なし**（関連 intake あり）
- **昇華可能性**: なし（調査未了・断片的。living pool 維持）
- **HITL 推奨**: 自律確定可能（deferred 維持が一意に定まる）

#### （単独4）bun:test で可変 export 配列を fixture push → finally で length = 0 クリアするパターンは後続テストを破壊する

- **根本原因**: length = 0 クリアは「実装の初期状態が空配列」を暗黙前提とする。実装が初期エントリを持つ時点で先行テストが全要素消去状態を後続テストへ引き渡す
- **8軸スコア**: 発生1・影響3・横展開4・反映先3・自動化2・固有4・再発3・費対3 ＝ **23/40**
- **処分区分**: deferred（6）— 出現1件。テスト fixture パターンの知識化（originalLength 保存型 復元）は出現蓄積時に再評価
- **既存対策照合**: なし（テストパターン規約の既存整備なし）。近縁 deferred: 並列テスト tmpdir 隔離・spawn timeout flaky（テスト安定性系だが別メカニズム）。該当 deferred エントリ有無: **なし**
- **昇華可能性**: 低〜中（修正済み・指針化の価値はあるが単発）
- **HITL 推奨**: 自律確定可能（deferred 維持）

#### （単独5）REQ 行追加を伴う Definition 変更では AUTOGEN 派生物（REQ 行数メトリクス・Decision 索引）が必ず陳腐化する

- **根本原因**: REQ 行追加と Decision 新規作成は AUTOGEN ブロックの入力源を変えるが、definition-pr-and-idempotency.md の branch HEAD 実測手順は再生成実行を明示しておらず、変更作業と再生成の順序が手順上明文化されていない
- **8軸スコア**: 発生1・影響4・横展開4・反映先4・自動化4・固有4・再発4・費対5 ＝ **30/40**
- **処分区分**: 既存対策の更新（5）— definition-pr-and-idempotency.md（STEP-4 変更手順に「REQ 行・Decision 変更後、check 実測前に generate_indexes.ts 再生成」を明文化）への補記。docs/knowledge/ 知識化判定も可
- **既存対策照合**: あり・近縁 deferred 複数。「Phase 0（req-save/spec-save）起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる」（2026-08-18・ユーザー承認で deferred 維持確定済み・次回再評価最優先候補）、「docs_chore の REQ 行 APPEND では traceability の missing-verification が必ず残る」（generate_indexes 再生成の既知帰結に言及）、「autogen-index-regeneration-diff 拡張check の指定ツール generate_indexes.ts が adr rename 未追随で EXIT_ERROR」、「AUTOGEN 鮮度 gate の計測日ブロックは日付境界で発火」。いずれも同一問題クラス（AUTOGEN 再生成漏れ防止）の観測で、本件は case-open STEP-4 手順側の delta。該当 deferred エントリ有無: **なし**（同一クラスの deferred 近縁4件あり）
- **昇華可能性**: 高（影響大・再発頻度高・反映先明確・deferred 最優先再評価候補との統合判断あり）
- **HITL 推奨**: ユーザー判断必要（promote 昇華＋deferred 既存4件との統合判断）

#### （単独6）session 由来 RU の frontmatter が REQ-008-051 必須フィールド規律から逸脱する

- **根本原因**: producer 側（session 内 RU 生成手順）が REQ-008-051 必須フィールド規律に従わない。RU 生成入口に frontmatter 必須フィールド検証ゲートが存在しない
- **8軸スコア**: 発生1・影響2・横展開3・反映先3・自動化3・固有3・再発3・費対3 ＝ **21/40**
- **処分区分**: deferred（6）— 本 Case 対象外合意済み（RD-002 not_applicable）。RU 生成手順改善は backlog-review/req-define 域で断片的
- **既存対策照合**: 近縁あり・guardrail insufficiency。近縁 deferred: 「RU-0004 が git 未コミットのまま Form Zero で削除され evidence 保存前提が欠落」（session 由来 RU の生成時コミット候補・検証経路不在という同型構造）。該当 deferred エントリ有無: **なし**（近縁あり）
- **昇華可能性**: 低（断片的・合意済み対象外）
- **HITL 推奨**: 自律確定可能（deferred 維持）

#### （単独7）LSP 診断 timeout 時は tsc --noEmit を同等の型検証証跡として取得する

- **根本原因**: 大規模 TypeScript パッケージでは LSP 初期化・診断が harness の短い timeout 内に収まらず、LSP 応答が常態的に遅延する環境がある
- **8軸スコア**: 発生1・影響2・横展開3・反映先3・自動化4・固有3・再発3・費対4 ＝ **23/40**
- **処分区分**: deferred（6）— QA 手順へのフォールバック1行明文化レベル。出現1件
- **既存対策照合**: なし。該当 deferred エントリ有無: **なし**
- **昇華可能性**: 低〜中（運用手順の軽微な補記）
- **HITL 推奨**: 自律確定可能（deferred 維持）

#### （単独8）構造検証強化の「入口だけ直して経路に残る」逆流を code review 自己反証で検出した

- **根本原因**: 構造検証強化系の変更で入口 validation のみを対象とし、同一制約が要求される別書込み経路（観測永続化経路）への波及確認が漏れた。制約対象値の流れの全経路を追跡しない単点レビュー
- **8軸スコア**: 発生1・影響3・横展開4・反映先3・自動化2・固有4・再発3・費対3 ＝ **23/40**
- **処分区分**: deferred（6）— review 観点（「入口・経路・保存先の3層で同一制約の到達を確認」）の知見。出現1件
- **既存対策照合**: 近縁あり。近縁 deferred: 「限定的検査による『配布物参照境界達成』報告が包括的検査で覆る」「PR #1122 の『X-6 = 0 件』宣言が再 grep 確認不備で 5 件残存していた」（限定的確認で完了判断→包括的確認で覆る類型の同族）。該当 deferred エントリ有無: **なし**（同族近縁あり）
- **昇華可能性**: 低〜中
- **HITL 推奨**: 自律確定可能（deferred 維持）

#### （単独9）case-open Definition PR 作成前 missing-design ゲートで draft 非宣言の design 宣言追随が確定する（新規 REQ 行）

- **根本原因**: 新規 REQ 行は増分ベースの missing-design ゲートで design 宣言を必須とするが、req-define の draft 契約に新規行の design 対応有無の投影がなく、draft に Design 変更がない Case では case-open 到達時に宣言追随が未確定になり得る
- **8軸スコア**: 発生1・影響3・横展開4・反映先4・自動化3・固有4・再発4・費対4 ＝ **27/40**
- **処分区分**: 既存対策の更新（5）— (1) req-define 要件展開時の design 対応投影（REQ-021-029 の design 版検討）(2) case-open STEP-4 の missing-design ゲート fail 時の宣言先選定指針（既存 sidecar design セクションへの追加を標準解決とする）
- **既存対策照合**: あり・guardrail insufficiency。近縁 deferred: 「docs_chore の REQ 行 APPEND では traceability の missing-verification（unclassified）が必ず残る」（verification 側の対称問題・カタログ登録同時確定の運用）、「トレーサビリティ対応宣言の網羅性は欠落の規模を定量化して記録」。該当 deferred エントリ有無: **なし**（対称問題の近縁あり）
- **昇華可能性**: 中〜高（規定手順内で解消済みだが予防策の投影は未整備）
- **HITL 推奨**: ユーザー判断必要（promote 昇華の承認対象）

#### （単独10）Windows 環境で git clone --depth の file:// transport が動作せず git init + fetch --depth=1 の等価手順で shallow 再現する

- **根本原因**: Windows 版 git（2.53.0.windows.3）の file:// transport における upload-pack 経由のローカル clone/fetch 失敗（環境制約・git 本体の不具合詳細は未特定）
- **8軸スコア**: 発生1・影響2・横展開2・反映先5・自動化3・固有5・再発4・費対4 ＝ **26/40**
- **処分区分**: 既存対策の更新（5）— docs/knowledge/qg4-baseline-detached-worktree-reproduction.md（shallow 再現手順）への Windows 環境注記（等価手順 git init + fetch --depth=1）の補記
- **既存対策照合**: あり・fix gap。対象 knowledge 文書が既存し、clone --depth 規定手順に対する Windows 等価手順の注記が欠落。近縁 deferred: 「Windows 環境でスクリプトの network 系コマンド不使用をダミー git.cmd で実行時証明する検証技法」（Windows git 検証系の別面）。該当 deferred エントリ有無: **なし**
- **昇華可能性**: 中〜高（knowledge 文書への軽微な補記だが Windows 環境では実質必須）
- **HITL 推奨**: ユーザー判断必要（knowledge 文書更新は backlog-review 承認経由）

#### （単独11）Cloudflare /ai/run の model-in-path 形式は Workers AI @cf/ モデル専用 — 第三者モデルは body で渡す

- **根本原因**: model-in-path 継続形式は Workers AI @cf/ モデル専用で第三者モデルに path ルートが存在しない。評価 SDK が暗黙に担っていた request schema 知識が fetch 直呼び出しへ置換した時点で消失した
- **8軸スコア**: 発生1・影響3・横展開4・反映先3・自動化2・固有4・再発3・費対4 ＝ **24/40**
- **処分区分**: project knowledge（4）候補 — SDK 置換系変更の実装手順に「置換対象 SDK が担っていた契約の列挙」「公式 schema の取得確認」を実装前工程として組み込む知識
- **既存対策照合**: なし。該当 deferred エントリ有無: **なし**（Cloudflare・SDK 置換系の既存エントリは皆無）
- **昇華可能性**: 中（知見は自足的・解消済みだが SDK 置換系 Case での再発予防価値あり）
- **HITL 推奨**: ユーザー判断必要（promote か deferred かの境界）

## STEP-3 処分判定サマリ

| 判定単位 | スコア | 処分区分候補 | 既存対策照合 | 昇華可能性 | HITL 推奨 |
|---|---|---|---|---|---|
| 問題クラス1（gh spawn 故障） | 30/40 | duplicate | あり・match（deferred 2026-09-24 / 2026-09-25） | なし | 自律確定可能 |
| 問題クラス2（search population） | 30/40 | 既存対策の更新（5） | あり・fix gap（REQ-092/093 系） | 高 | ユーザー判断必要 |
| 問題クラス3（突合見かけ差分） | 27/40 | project knowledge（4）候補 | 直接なし・近縁あり | 中 | ユーザー判断必要 |
| 問題クラス4（git 前置確認） | 33/40 | 既存対策の更新（5） | あり・guardrail insufficiency | 高 | ユーザー判断必要 |
| 問題クラス5（coverage --req） | 30/40 | 既存対策の更新（5） | あり・fix gap | 高 | ユーザー判断必要 |
| 問題クラス6（worktree projection） | 30/40 | 既存対策の更新（5） | あり・guardrail insufficiency | 高 | ユーザー判断必要 |
| 単独1（issue_update role） | 26/40 | 既存対策の更新（5） | あり・fix gap | 中〜高 | ユーザー判断必要 |
| 単独2（IR-055 直書き） | 24/40 | 既存対策の更新（5）/ deferred | あり・guardrail insufficiency | 中 | ユーザー判断必要 |
| 単独3（delta baseline 乖離） | 18/40 | deferred（6） | あり（関連 intake） | なし | 自律確定可能 |
| 単独4（fixture 復元） | 23/40 | deferred（6） | なし | 低〜中 | 自律確定可能 |
| 単独5（AUTOGEN 再生成） | 30/40 | 既存対策の更新（5） | あり・近縁 deferred 4件 | 高 | ユーザー判断必要 |
| 単独6（RU frontmatter） | 21/40 | deferred（6） | 近縁あり | 低 | 自律確定可能 |
| 単独7（LSP timeout 代替） | 23/40 | deferred（6） | なし | 低〜中 | 自律確定可能 |
| 単独8（入口のみ修正） | 23/40 | deferred（6） | 同族近縁あり | 低〜中 | 自律確定可能 |
| 単独9（design 宣言追随） | 27/40 | 既存対策の更新（5） | あり・guardrail insufficiency | 中〜高 | ユーザー判断必要 |
| 単独10（clone --depth Windows） | 26/40 | 既存対策の更新（5） | あり・fix gap（knowledge 文書） | 中〜高 | ユーザー判断必要 |
| 単独11（Cloudflare schema） | 24/40 | project knowledge（4）候補 | なし | 中 | ユーザー判断必要 |

- **内訳**: promote 候補 10（問題クラス2〜6、単独1・2・5・9・10・11 のうち knowledge/既存対策更新に分類した10単位）、deferred 候補 5（単独3・4・6・7・8）＋境界1（単独2）、duplicate 1（問題クラス1）、rejected 0
- **該当 deferred エントリ有無の集計**: duplicate 該当 1単位（問題クラス1 → deferred 2026-09-24 / 2026-09-25 の2件）、直接該当なし 16単位（うち近縁あり 7単位）

## promote 時 prune 結果

- **対象エントリ数**: 0件（STEP-4 以降は orchestration 責務のため本実行では未実施）
- **prune実施**: なし
- **備考**: deferred.md 内の prune 対象特定基準（3ヶ月以上経過・低影響・曖昧な再発条件等の全充足）に合致する候補の本格的な特定は prune 実行時に実施すべき。本実行の候補読込範囲では、2026-06 系の単発 deferred（gloss 形式規則・direct scope 乖離・Epic 分解重複等）に低スコア候補が含まれるが、削除禁止エントリ（判断基準・技術知識・プロジェクト固有知識を含む）の除外条件に抵触する可能性が高く、慎重な個別判定が必要

## 全体傾向

- **高頻出・高影響の問題クラス**: agentdev_gh 関連が最も濃密（問題クラス1・2、単独1）。ハーネス環境障害（duplicate で既存管理済み）と search/population 列挙制約（既存対策の更新）に分化。共有主リポジトリの並行 git 操作安全性（問題クラス4・スコア33で最高）も継続的なリスク源
- **横展開性が高い問題クラス**: GitHub search API 特性（問題クラス2・5/5）、AUTOGEN 再生成漏れ（単独5）、SDK 置換時の schema 知識消失（単独11）
- **自動化適性が高い問題クラス**: 前置死活確認（問題クラス1）、git 前置ガード（問題クラス4）、AUTOGEN 再生成（単独5）— いずれも「手順への前置チェック1操作の追加」で機械化可能
- **全体的な観察所見**: inbox 23件は Case #3166〜#3183（2026-09-27 前後）での capture 集中。「検証環境（worktree・Windows・bun）と Custom Tool / CLI（agentdev_gh・traceability coverage・配布境界 checker）の実行前提差」に起因する知見が過半を占める。恒久契約（REQ/Decision）への昇華候補はゼロで、promote 候補は既存 reference 手順文書・knowledge 文書への補記型（既存対策の更新 / project knowledge）に収斂。単独 deferred 候補5件はいずれも出現1件・影響小で living pool 維持が妥当

## Decision 候補除外記録

禁止条件フィルタリングゲート（agentdev-decision-guidelines 除外基準）を全17判定単位に適用。**恒久契約候補（Decision）への昇華対象は 0件**。代表例を記録する。

- **対象item**: 問題クラス1（gh spawn 故障）、問題クラス4（git 前置確認）
- **除外理由**: 運用ルール（前置確認・checkpoint・blocked 報告の手順・承認境界の定義で、技術選定・設計判断のトレードオフを含まない）
- **根拠事実**: 予防策がすべて「手順の前置チェック追加・運用文書への明文化」であり、アーキテクチャ変更や技術選定の代替案比較を含まない
- **代替反映先候補**: worktree-operations.md・readiness-and-cleanup.md・issue-operation-safety.md・consumer-project-setup.md（guide/reference）

- **対象item**: 問題クラス5（coverage --req）、単独1（issue_update role）
- **除外理由**: command仕様（CLI／Custom Tool の入出力・引数解析・入力契約の定義）
- **根拠事実**: 予防策が「実装へのカンマ split 追加または README 文言修正」「Tool 操作契約の規則明記」であり、入出力契約・手順の定義域
- **代替反映先候補**: scripts README・coverage.ts・issue-operation-safety.md・agentdev-issue-tracking Design

- **対象item**: 問題クラス2（search population）・問題クラス3（突合見かけ差分）・問題クラス6（worktree projection）・単独2・5・9・10（IR-055 直書き・AUTOGEN 再生成・design 宣言追随・clone --depth）
- **除外理由**: 運用ルール／既存対策の更新（既存 gate・検査・手順の適用漏れ・補記で技術判断不在）
- **根拠事実**: いずれも既存機構（missing-design ゲート・AUTOGEN ゲート・配布境界 gate・IR-055・knowledge 文書）に対する手順補記・注記追加であり、新たな技術判断を含まない
- **代替反映先候補**: REQ-092/093 系文書・case-run/case-close references・definition-pr-and-idempotency.md・qg-4-final-acceptance.md・agentdev-skill-authoring・docs/knowledge 知識文書

- **対象item**: 単独3・4・6・7・8・11（delta baseline・fixture 復元・RU frontmatter・LSP timeout・入口のみ修正・Cloudflare schema）
- **除外理由**: 技術判断不在（観測・検証技法・実装パターンの知見記録で設計判断を含まない）
- **根拠事実**: 調査候補の記録・テスト fixture パターン・フォールバック手順・review 観点であり、アーキテクチャ上の決定を含まない
- **代替反映先候補**: deferred（living pool 維持）・project knowledge（単独11 のみ候補）

## 補記: 本レポートの判定根拠と制約

- deferred.md は全文読みではなく 2フェーズ読込（インデックススキャン121エントリ → タグ一致・見出しトークン一致・直近20件の over-inclusive 候選52件の本文読込）で実施。未読込の deferred エントリ（約69件・2026-06〜2026-09 前半の単発系が中心）との追加重複は promote 時の突合で再確認可能
- inbox エントリの見出しは日付なし形式が多数だが、新13フィールド schema に適合するため正規化はフィールド欠落補正（1件の「問題事象」空文字）のみで完結
- 昇華可能性の評価は 8軸スコア・禁止条件ゲート・既存対策照合に基づく learning 固有の評価であり、採用済み成果物の生成・反映先の確定は行っていない（req-define の変更影響分析が確定する責務）

## STEP-4 adversarial-review 結果（2026-09-27 実施）

- **発動判定**: 発動（skip 条件非該当: inbox 23エントリ）。読み取り専用対論型レビュー（Orchestrator/Reviewer/Reviewee、対称的相互反証、収束監査実施）
- **unresolved**: 0件。処分区分の変更要求 0件、クラスタ再分割要求 0件、HITL/自律の再振り分け要求 0件
- **accepted findings（反映済み・反映予定）**:
  - A-1（反映済み）: 問題クラス1の発生件数軸 3→2/5、加重合計 31→30/40。rubric「同一問題クラス内のエントリ数」は inbox 内件数基準であり deferred 既知事象の加算は過大計上
  - A-2（成果物生成時反映）: 問題クラス1（duplicate）の統合時、統合先 deferred エントリへ「2026-09-27 3回目再発・Root Case 2件 blocked の実績」と「予防策候補の反映先文書未反映」を追記する amendment を実施する
  - A-3（成果物生成時反映）: 問題クラス4の採用済み成果物に「revert 残骸側は根本原因未特定・前置確認欠落は予防策ベースの統合根拠」を明記する
  - A-4（成果物生成時反映）: 単独9の採用済み成果物は「新規 REQ 行の draft 契約に design 対応投影が無い」という自足的情報として保持し、REQ-021-029 design 版の要否判断は req-define 変更影響分析へ委ねる記述とする
- **成果物生成時の留保（review 推奨）**: 問題クラス6の成果物は projection 系／依存整備系を分節化する
- **収束監査の結論**: 暫定処分集合（promote 候補 10＋境界1・deferred 5・duplicate 1・rejected 0、自律確定 6・HITL 11）は上記修正付きで成立。STEP-5 へ進行可能
