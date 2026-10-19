# 評価レポート

## メタデータ

- **実行日時**: 2026-10-20（backlog-auto stage 2 learning 系統。run 開始 2026-10-20T00:26+09:00 頃。前回 run〔2026-10-19T15:10Z 頃起動〕は Jev evaluator の network outage で blocked・本 run で再開）
- **基準 revision**: 866c86aaf（main HEAD。本 run は git 操作禁止のため run 実行時 HEAD の一致検証は未実施）
- **対象エントリ数**: inbox 20 件、deferred 253 件（見出し 257 行のうち 4 行は様式・説明見出し。実行前実測）
- **問題クラス数**: 20（inbox 順 C1〜C20。deferred pool 同根先行エントリを統合する複数構成クラス: C1=2、C7=3、C8=2、C11=2、C12=2、C19=3。他は単独 1 エントリ構成）
- **Jev**: 分類 1 評価（20261019T154236Z-dc04）・8軸 7 評価（20261019T154431Z-b4e1〔C1〜C3〕・20261019T154603Z-d79e〔C4〜C6〕・20261019T154717Z-31f1〔C7〜C9〕・20261019T154836Z-96e8〔C10〜C12〕・20261019T154958Z-0cf4〔C13〜C15〕・20261019T155120Z-9e5c〔C16〜C18〕・20261019T155225Z-6186〔C19〜C20〕）・処分区分 1 評価（20261019T160237Z-2f9e）・昇華可能性 1 評価（20261019T160410Z-50da）。全 observation に finalResult を observation_write で追記済み。score 形式の value は水準番号（1〜5）で記録（実装上水準 5 は scale index 上限のため 4 として記録した軸あり〔C8/C11/C13/C17 の反映先明確度=5。本レポート本文のスコアは水準番号どおり〕）。evaluator が scale 範囲外の 0 を返した軸は水準 1 を最終判断し差異理由 unknown で記録（c8/c9/c10/c13/c14/c16/c17/c20 の影響度・c17 再発可能性）。evaluator との主要差異: 発生件数以外の 7 軸で C1 横展開性〔evaluator 1 → 最終 3・3 回観測の系統的事象〕、C4 再利用性〔1 → 4・回復契約遵守規律の一般化〕等を semantic_disagreement で記録。処分区分は C9〔promote → deferred・最終 gate 担保〕、C10〔promote → deferred・既存突合が手順内で捕捉〕、C14〔duplicate → deferred・観点保持〕を semantic_disagreement で最終判断。昇華可能性は evaluator と全問一致。発生件数軸は deterministic 境界により機械導出（C1=2、C7=3、C8=2、C11=2、C12=2、C19=3、他=1）
- **旧 report**: 2026-10-17 実行分（Case #3758/#3776/#3779 系 8 件対象）のため本レポートで上書き置換
- **extension**: .agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml の読込は本 run で 5 セクションすべて空を再実測（context/rules/checks/acceptance_gates/must_not とも空。fail-open）
- **前回 blocked session の扱い**: Jev 失敗観測 2 件（.agentdev/jev-observations/20261019T151035Z-e9e1.json・20261019T151343Z-80e0.json）は失敗記録として再利用せず、本 run で全評価を再実行した。永続状態（inbox/deferred/evaluation-report/promoted）は前回 blocked session により不変（実測確認済み）であり再開点 STEP-1/STEP-2 から再構築した

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取・全文読取）で確認できた場合に限った。既存対策が不在な整備要求の判断材料は恒久契約候補（REQ）として扱った（C15）。Decision 候補は禁止条件ゲート（agentdev-decision-guidelines 除外基準）で全単位除外した。既知欠陥の記録で修正対象が明確な場合は恒久検出経路の既存有無と恒久記録への反映済みを確認し、学習価値のないものを rejected とした（C17/C20）。

## 問題クラス一覧

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / プロジェクト固有知識再利用性 / 再発可能性 / 費用対効果。加重合計は満点 40（/40）。C 番号は inbox 見出しの出現順（E1〜E20）に対応。

### C1: opencode serve（plugin ホスト）内の gh 起動環境劣化による agentdev_gh 全操作失敗

- **根本原因**: opencode serve（plugin ホスト）プロセス内の起動環境劣化。plugin ホスト経路のみが失敗し bash 直叩きと CliRunner 直接実行が正常
- **再発条件**: opencode serve の長時間稼働環境で agentdev_gh を呼び出した場合（20261015・20261016 E2E 前例と今回の 3 回目）
- **予防策**: 委譲前疎通確認（軽量 issue_read 1 件）の追加候補、serve 側 exit 66 連続回数カウントと再起動要求の自動化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E1 + deferred pool 同根先行エントリ（L2347）の 2 エントリ構成 |
| 影響度 | 2/5 | blocked 停止が発生・serve 再起動で回復。write-proxy payload 先行保存と残骸確認で重複生成なし |
| 横展開性 | 3/5 | 同一 harness（opencode serve 長時間稼働）での case-auto 実行全般に当てはまる系統的事象（3 回観測） |
| 反映先明確度 | 4/5 | issue-operation-recovery.md 劣化サイクル節と名指し可能。恒久手順既存で追加反映の余地は小 |
| 自動化適性 | 3/5 | 疎通確認は手順化済み。serve 再起動の自動化は harness 責務で実現性は限定的 |
| 再利用性 | 2/5 | 既存手順適用の記録であり新規運用知識としての追加価値は小 |
| 再発可能性 | 4/5 | 長時間稼働では継続再発。同一問題クラスは deferred pool 内に 5 回までの再発記録（L2347 見出し・L2364-2366 追記）と E2E 前例 2 回・本件を持ち、再発回数としては 5 回超。既存手順の適用で回復は確実 |
| 費用対効果 | 1/5 | 恒久手順既存で追加対策の価値なし（委譲前疎通確認は既存規定） |
| **加重合計** | **21/40** | |

- **推奨処分案**: duplicate。恒久手順 issue-operation-recovery.md に委譲前疎通確認・2 段分離試験・write-proxy payload 標準配置・残骸確認・gh exit 66 例外手順が規定済み（実測 L28/L35-38/L40-48/L52-62・adversarial-review 実読確認）。inbox E1 の自律対応は既存手順どおりの適用。deferred pool 同根先行 L2347（同一現象・learning 固有残余知見に「最初の委譲前に読み取り 1 操作で死活確認」を明記済み）
- **既存対策照合**: 対策あり・ギャップなし
- **統合記録**: 先行エントリ（L2347）へ「統合追記（2026-10-20 learning-promote）」を適用し、再発の事実と duplicate 受理根拠を記録。あわせて L2365 の再評価約束（「4 回再発のため次回 learning-promote で知識文書化を再評価する」）への回答として、既存恒久手順（issue-operation-recovery.md 劣化サイクル・縮退運用節）が知識文書化の実質を担う旨を記録
- **エントリ一覧**
  - case-open STEP-2 で agentdev_gh 全操作が gh exit 66 で恒常失敗し serve 再起動待ちで blocked になった [inbox]

### C2: issue_create の labels 空配列起票で物理ラベルが付与されず labels フィルタ検出が不能になる

- **根本原因**: labels 空配列は Tool 契約上の必須最低形であり起票時の既定ラベル付与は設けない契約。空配列起票では labels 検索経路が失われる
- **再発条件**: labels 空配列で起票後、labels フィルタ付き issue_list で冪等検出・Case 群取得を行う場合
- **予防策**: 起票時の検索・整理用ラベル付与を既定化する検討、issue-operation-safety.md への起票ラベル指針追記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | state: open 全件取得＋タイトル書式で回避済み・手戻りなし |
| 横展開性 | 3/5 | Root Case・追跡Issue 起票は全 command 共通操作 |
| 反映先明確度 | 4/5 | issue-operation-safety.md「issue_create の labels 引数の明示」節と名指し可能（実測） |
| 自動化適性 | 4/5 | 起票時ラベル付与は labels 引数に加えるだけで機械的 |
| 再利用性 | 3/5 | 起票運用知識として全起票局面で再利用 |
| 再発可能性 | 3/5 | labels 空配列起票が標準形の間は繰り返し起こり得る |
| 費用対効果 | 3/5 | 起票ラベル指針の追記は低コストで検出安定性を向上 |
| **加重合計** | **22/40** | |

- **推奨処分案**: duplicate〔adversarial-review accepted finding（B5・orchestrator 実測再検証で受理・Jev 再判定 r-c2=true）により deferred から変更〕。既存恒久規律の実測被覆: issue-operation-safety.md L61「labels 引数は tracking 論理値専用（規律と受理能力の区別）」・L124「Case Issue の work_type を labels へ指定できる運用は任意であり、付与義務と起票時の既定付与は設けない」・L125「role: case と labels の組み合わせは起票時に受理される」＋E2 の想定反映先 root-case-and-definition-package.md L47（手順 6）に「検索・整理用ラベル〔work_type 等〕の任意付与契約…起票時の既定付与は設けず、呼出側が都度判断する」の契約規定が実在。決定的なのは同 L61 の検出規律であり、Case Issue の絞り込みの標準は labels 引数非依存（search 引数＋state の組合せ）である。E2 が実際に使った回避手段（state: open 全件＋タイトル書式）こそ既存の標準検出規律であり、失敗様式（labels フィルタ検出不能）は既存恒久対策で機能的に網羅済み。「付与指針の不在」は既存契約が意図的に採らない選択（既定付与なし契約）で fix gap ではない
- **既存対策照合**: 対策あり・ギャップなし（labels 非依存の Case 検出規律 L61 が既存・起票ラベル任意付与契約 L47 が既存）
- **エントリ一覧**
  - issue_create の labels 空配列では role に応じた物理ラベルが付与されず issue_list の labels フィルタで検出できない [inbox]

### C3: bash コマンド文字列長上限でヒアドキュメントが途切れ node stdin script が構文エラーになる

- **根本原因**: bash ツールのコマンド文字列に長さ上限があり、長いヒアドキュメントを含む単一コマンドは後半が失われる（約 13KB で途切れ）
- **再発条件**: 10KB 超の inline スクリプト・入力 JSON を単一 bash コマンドのヒアドキュメントで渡す場合
- **予防策**: prepare_definition_pr の入力 JSON 組立手順へ分割書込み（cat > / cat >> 断片追記＋最後の一括 node 実行）の標準手順追記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | SyntaxError で停止・5 分割追記で回復・実害は作業停止のみ |
| 横展開性 | 3/5 | 10KB 超の inline 組立はハーネス機械工程全般で起こり得るが長文単一コマンド渡しは限定 |
| 反映先明確度 | 4/5 | definition-pr-and-idempotency.md 機械工程条項・worktree-operations.md 標準手段節と名指し可能 |
| 自動化適性 | 4/5 | 分割書込みは機械的手順として実装可能 |
| 再利用性 | 3/5 | 機械工程の入力組立知識として再利用 |
| 再発可能性 | 3/5 | 10KB 超組立を単一コマンドで渡す場合に繰り返し起こり得る |
| 費用対効果 | 3/5 | 分割書込み手順の明記は低コストで停止を防止 |
| **加重合計** | **23/40** | |

- **推奨処分案**: duplicate〔adversarial-review accepted finding（B6・orchestrator 実測再検証で受理・Jev 再判定 r-c3=true）により deferred から変更。初期評価の「分割書込み 0 件」は grep 語（断片/分割/cat >>）に依存した実測であり「ヒアドキュメント」「標準手段」語の実測を欠いた〕。既存恒久対策の実測被覆: worktree-operations.md L251-256「標準手段（guard ブロック時の切替先）」節が「shell inline・heredoc に起因するコンテンツ破損の回避（3 技法）」を規定し、(a) 一時スクリプトファイル経由（「日本語を含む長大なコンテンツの書き出し」を適用対象として明記）・(b) PowerShell 単一引用符ヒアドキュメントを含む。knowledge 文書 windows-git-bash-inline-content-corruption.md L14 機構 2「ヒアドキュメント stdin の中途打ち切り（Case #3158）: …中途で打ち切られファイルが不完全になる。検知方法: 書き出し結果の内容突合」— E3 の事象（約 15KB ヒアドキュメントが約 13KB で途切れ・here-document delimited by end-of-file）は機構 2 そのものであり、E3 の回復（断片追記→一括実行）は標準手段 (a) の変形。残余は prepare_definition_pr 入力 JSON 組立への断片追記定型レシピ明記のみ（影響は小）
- **既存対策照合**: 対策あり（失敗機構の知識化 windows-git-bash-inline-content-corruption.md 機構 2＋標準手段 3 技法 worktree-operations.md L251-256）・ギャップ: 機械工程入力組立への定型レシピ明記のみ（影響は小）
- **エントリ一覧**
  - bash ヒアドキュメント約13KB でコマンドが途切れ node stdin script が構文エラーになる [inbox]

### C4: Custom Tool 障害時に tool 内部 API を直接起動する一時ブリッジで非正規経由書込み

- **根本原因**: 障害時の回復手段を既存文書で確認せず「内部 runner の直接実行が技術的に可能」を「正規経路として許容される」と誤って解釈した
- **再発条件**: Tool 障害中に GitHub 書込みを要する記録契機が発生し、回復契約を確認せず内部 API の直接起動に至る場合
- **予防策**: issue-operation-recovery.md へ「tool 内部モジュールの直接起動は読み取りを含め非許容」の明記、障害時の最初の対応手順に同文書の必読を組み込む

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 3/5 | 復旧後に全投稿（子 Issue 6 件・SSoT コメント 3 件・判断変更記録）を正規経路で訂正する作業が発生・ユーザー確認あり |
| 横展開性 | 3/5 | Custom Tool 障害時の全局面（6 系統 Workflow で Custom Tool を使用）で起こり得る |
| 反映先明確度 | 4/5 | issue-operation-recovery.md 縮退運用パターン節と名指し可能（明記 gap を実測） |
| 自動化適性 | 2/5 | 文書明記は機械的検証対象外（1 文の追記） |
| 再利用性 | 4/5 | 「技術的代替経路の存在を以て正規とは解釈しない」は Custom Tool 運用全般に再利用可能な規律 |
| 再発可能性 | 3/5 | Tool 障害（exit 66 系は 3 回観測）のたびに同じ誤解釈の可能性がある |
| 費用対効果 | 4/5 | 1 文の明記で非正規書込みの再発を防止できる低コスト高効果 |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: issue-operation-recovery.md に「tool 内部モジュールの直接起動は読み取りを含め非許容」の明記が不在（実測 grep 0。「直接起動」「内部モジュール」「内部 API」「非許容」のいずれもヒットなし）。同文書は bash gh 代理（読み取り限定）と harness 再起動待ちのみを規定し、内部モジュール直接起動の禁止規定を持たない。反映先: 同文書「劣化サイクルの定量観測と縮退運用パターン」節の gh exit 66 例外手順の近傍へ追記＋診断手順節に回復文書必読の組込候補。追記文言は「tool 内部モジュールの直接起動は読み取りを含め非許容」ではなく〔adversarial-review 指摘（A1）を受理: 同文書 L30-31 の診断手順（2 段分離試験）は CliRunner 直接実行を読み取り切り分けとして正当に規定し、custom-tool-contracts.md L111 は読取 contingency を許容するため、この文言は既存手順と矛盾する〕、「内部モジュール（CliRunner 等）の直接起動は診断手順の読み取り切り分けに限定され、書込みを含む操作での直接起動は非許容（正規経路は Custom Tool に限定）」の形へ修正して引き渡す
- **既存対策照合**: 対策あり（回復契約・bash gh 読み取り限定の規定）・ギャップ: fix gap（内部直接起動の非許容明記不在）
- **エントリ一覧**
  - Custom Tool 障害時に tool 内部 API を直接起動する一時ブリッジを作成し非正規経由で書き込んだ [inbox]

### C5: 工程記録の日時を実測せず逆算で書き込み完了確定前に終了日時を設定

- **根本原因**: 記録契約（開始日時は初回実着手の実測値のみ、終了日時は completed 確定時のみ）を記録の見栄え優先で省略し、観測できない値を埋めるために逆算推定を生成＋raw 正規表現置換で本文を書換した
- **再発条件**: 記録契約上の時刻が未観測のまま記録欄を埋める必要が生じ、推定値の生成と raw での本文書換えを選択する場合
- **予防策**: 未観測時刻の境界表現（既知の上限・下限時刻の併記）を記録様式として提供

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（L4378 は計測漏れで根本原因が別のため数えない・近縁記録のみ） |
| 影響度 | 3/5 | 子 Issue 6 件の進行状況を実測値へ置換訂正・case-close で実測終了日時を再設定・ユーザー確認あり |
| 横展開性 | 3/5 | 工程記録・時刻記録の運用全般（未観測値を推定で埋める構造は記録作業全般に適用可能） |
| 反映先明確度 | 4/5 | record-comments.ts（様式サポート候補）＋issue-lifecycle-records.md（記録契約）と名指し可能 |
| 自動化適性 | 4/5 | 境界表現の様式サポートは script 実装で機械化可能 |
| 再利用性 | 3/5 | 工程記録の様式知識として再利用 |
| 再発可能性 | 3/5 | 未観測時刻で記録欄を埋める場面は長時間 Case で繰り返し起こり得る |
| 費用対効果 | 3/5 | 様式サポート追加は中程度コストで記録整合性を向上 |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: record-comments.ts に未観測時刻の境界表現の様式サポートが不在（実測。様式語「未記録」「実測」「推定」「上限」「下限」「N/A」のいずれも 0 件。「境界」1 件は別文脈）。issue-lifecycle-records.md にも境界表現様式の規定なし（実測）。反映先: record-comments.ts の構築・検証関数への境界表現様式サポート追加候補＋issue-lifecycle-records.md の記録契約への未観測時刻の取扱い補足。〔adversarial-review 指摘（A2）を受理: 未観測時刻の扱いは記録契約 L43（終了日時は completed 確定時にのみ設定）の下では「設定しない」が現行の正解であり、境界表現の様式は (a) 日時欄の書式例外を新設する Design 契約変更か (b) 本文記録上の補足表現に留めるかの設計分岐を含む。issue-lifecycle-records.md は docs/designs/workflows/ 配下の Design であり、その更新は backlog-review 承認経由の対象である旨を成果物へ明記して引き渡す〕
- **既存対策照合**: 対策あり（記録契約は issue-lifecycle-records.md に既存）・ギャップ: fix gap（境界表現の様式サポート不在）
- **エントリ一覧**
  - 工程記録の日時を実測せず逆算で書き込み、完了確定前に終了日時を設定した [inbox]

### C6: bun 1.3.6 test runner が最終テストファイルの fail でも終了コード 0 を返す race

- **根本原因**: bun 1.3.6 test runner において最終ファイル相当の fail 集計が終了コードへ反映されない race（ファイル読込順序依存）
- **再発条件**: bun 1.3.6 で bun test の最終ファイルに fail が集中する場合（baseline: commit e7f5c1fb・2026-10-18・QG-4 正規形 3 cwd 分割実行での観測）
- **予防策**: QG-4 正規形の実行構成へ file-level split（fail 検出対象ファイルの独立 gate 化）を標準化、bun バージョン更新時に race の再検証

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | fail 1 件がゲートをすり抜ける潜在リスク・実際の merge 判定は file-level split の独立 gate で防止済み・悪い merge は未発生 |
| 横展開性 | 3/5 | bun 固有の race だが「終了コードで機械受理するゲートはランナー既知の race を前提に fail 検出対象を独立 gate 化する」観点は機械ゲート運用一般に適用可能 |
| 反映先明確度 | 4/5 | qg-4-final-acceptance.md 実行形態節（3 cwd 分割実行）と名指し可能（file-level split の規定不在を実測） |
| 自動化適性 | 4/5 | file-level split 標準化は gate 構成の規定変更で機械化可能 |
| 再利用性 | 3/5 | 機械ゲート運用知識として再利用 |
| 再発可能性 | 3/5 | bun 1.3.6 修正まで恒常再現・split 未標準化のため再発し得る（条件付き） |
| 費用対効果 | 4/5 | split 標準化は低コストでゲート信頼性を確保 |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: qg-4-final-acceptance.md に file-level split・bun race への規定が不在（実測。「file-level」0 件・「--timeout」0 件。3 cwd 分割と「終了コードの記録」規定のみ）。E6 の自律対応（fail 検出対象ファイルを独立 gate へ分離: split-1a 汎用 + split-1b 対象ファイル単独）は 3 PR の QG-4 で実績あり。反映先: 同文書「3 cwd 分割実行」節の実行形態規律へ file-level split の標準化追記＋bun 版更新時の race 再検証規定
- **既存対策照合**: 対策あり（3 cwd 分割正規形・fail 由来分類手順）・ギャップ: fix gap（file-level split の標準規定不在）
- **エントリ一覧**
  - bun 1.3.6 の test runner が最終テストファイルの fail でも終了コード 0 を返す場合がある [inbox]

### C7: 並行実行負荷下で timeout 系テストが既定 timeout 超過により間欠失敗する

- **根本原因**: 並行実行形態によるリソース競合で hook/spawn 既定 timeout（5s）に達する実行が発生（コード欠陥ではなく実行形態由来）
- **再発条件**: 複数 worktree でフル suite を並行実行する場合（3 回観測）
- **予防策**: QG-4 正規形の並行実行時における標準 --timeout 指針の整備

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | E7 + deferred pool 同根先行 L4694・L4819 の 3 エントリ構成 |
| 影響度 | 2/5 | 間欠失敗の再実行コスト・solo 再実行と timeout 延長で全件解消済み |
| 横展開性 | 3/5 | 並行テスト実行は worktree 並列 Case 実行時に発生（同一工程種別） |
| 反映先明確度 | 4/5 | qg-4-final-acceptance.md（fail 由来分類手順）＋windows-bun-test-spawn-timeout-classification.md と名指し可能 |
| 自動化適性 | 4/5 | 標準 --timeout 指針の明記は gate 構成の規定変更で機械化可能 |
| 再利用性 | 3/5 | 並行実行 fail の起因分離知識（3 件統合）として再利用 |
| 再発可能性 | 4/5 | 並行実行は頻繁・既知 race・3 回観測・指針未整備 |
| 費用対効果 | 3/5 | 指針明記は低コストだが既存手順で解消可能なため削減効果は中程度 |
| **加重合計** | **26/40** | |

- **推奨処分案**: deferred。既存知識文書 windows-bun-test-spawn-timeout-classification.md が「単独再実行＋十分な timeout」（L13）「timeout 延長後も fail が残る場合は環境由来と扱わない」（L15）「固定 timeout は実測分布に基づく値」（L17）の手順を所有し、qg-4-final-acceptance.md の「単独→フル再実行」由来分類手順（L412-423）も既存。毎回の手順適用で解消済み・実害は再実行コストのみ。〔adversarial-review 指摘（B7）を受理し gap 記述を修正: 標準化の方法（実測分布に基づく明示 --timeout の指定）は既存規定 L17 そのものが指示しており、明示 timeout 方式の前例（agentdev-textlint-guard tests/parallel.test.ts L145 timeout 60_000・deferred L4819 が check_test_impact.test.ts・gate.test.ts を修正対象候補と特定済み）も repo 内に実在するため、「実測分布規定との緊張」は解決可能である。promote 対案（qg-4-final-acceptance.md への timeout 系疑似 fail の再実行標準追記）は継続再発頻度と promote 済みクラス（C6 は構造的すり抜け・C7 は可視 fail）との差異を踏まえ、本 run では deferred を維持する〕3 回目の再発事実を先行エントリ L4694 へ統合追記して保持。再評価条件: 同種 timeout 系間欠失敗の再発頻度上昇時、qg-4 reference の timeout 指針整備機会発生時
- **既存対策照合**: 対策あり（既存知識文書＋qg-4 由来分類手順）・ギャップ: 標準 --timeout 数値指針の不在（qg-4 reference 実測）・既存手順で解消可能
- **統合記録**: 先行エントリ（L4694）へ「統合追記（2026-10-20 learning-promote）」を適用し、3 回目の再発事実（E7・L4819 含む）と deferred 維持根拠を記録
- **エントリ一覧**
  - 並行負荷下で git fixture 系テストが hook timeout により間欠失敗する [inbox]

### C8: Windows long path 制限で git worktree remove が Filename too long により失敗

- **根本原因**: worktree 内 gitignore 済み依存実体（node_modules、vendor）が Windows long path 制限を超え git の削除処理が失敗（LongPathsEnabled 無効環境のみ）
- **再発条件**: bun install 済み worktree（node_modules の深いパス）を Windows で削除する場合
- **予防策**: worktree クリーンアップ手順へ依存実体の先行掃除ステップを明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E8 + deferred pool 同根先行 L3449（既存処分判定あり）の 2 エントリ構成 |
| 影響度 | 1/5 | 既存手順で解消・作業継続可・実害なし |
| 横展開性 | 2/5 | Windows 環境の worktree 削除に限定（LongPathsEnabled 無効環境） |
| 反映先明確度 | 5/5 | worktree-operations.md に既存手順が自足的に整備済み（L452-478 実測） |
| 自動化適性 | 4/5 | 既存手順は機械的実行可能 |
| 再利用性 | 3/5 | Windows 環境知識として再利用 |
| 再発可能性 | 2/5 | LongPathsEnabled 無効環境で worktree 削除する場合に再発・既存手順あり |
| 費用対効果 | 1/5 | 既存手順完全被覆で追加対策の価値なし |
| **加重合計** | **20/40** | |

- **推奨処分案**: duplicate。worktree-operations.md に「MAX_PATH 起因の部分削除残存時のフォールバック（node fs.rmSync）」「Filename too long 起因の部分削除残存時の robocopy /MIR フォールバック（終了コード判定と 4 ステップ手順を含む L480-488）」「LongPathsEnabled 有効環境では事象が再現しない（検証構成条件・reg query 前置確認）」の既存手順が整備済み（実測 L452-488・adversarial-review 実読確認）。付記: E8 予防策候補の「依存実体の先行掃除ステップ」は通常削除手順（L403-429）に未だ明記されないが、フォールバック連鎖が機能的に被覆する。E8 の自律対応（依存実体の先行掃除→prune→ディレクトリ削除）は既存手順の適用事例。deferred pool 同根先行 L3449 は 2026-10-08 に同根確認済みの処分判定を持つ
- **既存対策照合**: 対策あり・ギャップなし（恒久手順による完全被覆を実測で確認）
- **統合記録**: 先行エントリ（L3449）へ「統合追記（2026-10-20 learning-promote）」を適用し、再発の事実と duplicate 受理根拠を記録
- **エントリ一覧**
  - Windows の long path 制限で git worktree remove が Filename too long により失敗する [inbox]

### C9: 配布境界 checker の case-run 事前実行省略を case-close 最終 gate が捕捉

- **根本原因**: 実装 PR 作成工程で配布境界 checker の事前実行が省略された（予防観点の引き渡しのみで委譲内の事前面が機能しなかった）
- **再発条件**: case-run 委譲で PR 作成前の配布境界 checker が省略された場合
- **予防策**: case-run 委譲プロンプトの標準検査リストへ配布境界 checker の実行を明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | case-close 最終 gate が設計どおり検出・コメント 1 行の concrete ID 除去修正（1 commit）で解消 |
| 横展開性 | 3/5 | case-run 委譲プロンプト構築は全 Issue で発生 |
| 反映先明確度 | 4/5 | harness-delegation.md 委譲プロンプト構築節（MUST NOT DO 必須 L330 等）と名指し可能 |
| 自動化適性 | 4/5 | 検査リストへの明示は機械的 |
| 再利用性 | 3/5 | 委譲プロンプト構築知識として再利用 |
| 再発可能性 | 3/5 | 委譲で checker 実行が省略され得る構造（検査リスト明示なし） |
| 費用対効果 | 3/5 | 検査リスト明示は低コストだが最終 gate が既に担保 |
| **加重合計** | **22/40** | |

- **推奨処分案**: duplicate〔adversarial-review accepted finding（B8・orchestrator 実測再検証で受理・Jev 再判定 r-c9=true）により deferred から変更〕。既存恒久対策の実測被覆: agentdev-workflow-case-run single.md L138「STEP-S3-5 配布依存境界の事前委譲 gate: PR 対象ファイルに src/common/{commands,skills}/** 変更を含む場合、委譲前に事前 gate を必須実行する（オプション扱いは廃止）」が 2026-10-05（commit a7e3b8a9f・E9 の PR #3790 より先行）に必須化済み・L142「checker 実行記録の必須行化（PR テンプレート品質メトリクス表）」・L143「二重構造の維持（case-run 前置 gate と case-close 最終 gate）」が既存。E9 は既存の必須前置手順の適用逸脱であり、case-close 最終 gate の捕捉は二重構造の設計どおり機能した。委譲プロンプトへの検査リスト明示不在は、必須 STEP が既に存在する以上、重複通知に近似する残余
- **既存対策照合**: 対策あり（STEP-S3-5 必須前置 gate＋case-close 最終 gate の二重構造・checker 実行記録必須行）・ギャップなし
- **エントリ一覧**
  - 配布境界 checker が case-run 工程の見逃しを case-close 最終 gate で捕捉した [inbox]

### C10: covers コメント連鎖の文字列組立で ID 順序乖離が生じ verbatim 包含突合が捕捉

- **根本原因**: 逐次依存する ADF-COVERS コメント連鎖を文字列置換（行末トークン対象）で組立てたため、識別子列挙の挿入点ではなく行末への追記になり、最終形の ID 順序が draft 合意文言と乖離したまま commit された
- **再発条件**: covers 連鎖の中間段が前段 newText と一致する限り連鎖整合は成立するため、最終段の ID 順序を検査する突合が省略された場合に再発
- **予防策**: covers 連鎖組立では最終形を draft から直接抽出した文字列と byte 照合する手順を入力組立の標準に含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | 乖離した commit が発生・PR 作成前に既存突合で検出・訂正 edit で解消 |
| 横展開性 | 2/5 | covers 連鎖・DefinitionEdit 組立の限定局面 |
| 反映先明確度 | 4/5 | definition-pr-and-idempotency.md L40 verbatim 包含突合と名指し可能 |
| 自動化適性 | 4/5 | byte 一致照合は手順規定＋script で機械化可能 |
| 再利用性 | 3/5 | Definition 編集組立の運用知識として再利用 |
| 再発可能性 | 3/5 | 連鎖組立は繰り返し起こり得る・既存突合が事後担保 |
| 費用対効果 | 2/5 | 既存包含突合で検出済み・byte 照合への強化は追加価値が中程度以下 |
| **加重合計** | **21/40** | |

- **推奨処分案**: deferred〔adversarial-review 反映で gap 記述を修正〕。definition-pr-and-idempotency.md の verbatim 包含突合（L40・合意済み content の各段落・各行が逐語的に含まれることを機械的検索で確認する fail-closed 必須手順＝行単位 byte 一致照合）が設計どおり機能し MISSING 1 件を検出・PR 前に訂正済み。初期評価の gap 記述「byte 一致照合の標準規定不在」は不正確（adversarial-review 指摘を受理し修正。inbox E10 の検知方法自身が「byte 一致照合」と記録）。真の残余は「適用前の組立時点で最終形を draft 抽出文字列と照合する」pre-apply 版照合と「挿入点を識別子列挙内の直前 ID に固定する」組立規律の不在である。再評価条件: 包含突合での捕捉漏れ（commit 残存）の再発時、機械工程手順の改訂機会発生時
- **既存対策照合**: 対策あり（適用後 verbatim 包含突合が手順内で機能・実績あり）・ギャップ: 適用前組立時照合と挿入点固定規律の不在（予防面の強化候補）
- **エントリ一覧**
  - covers コメント連鎖の文字列組立で ID 順序乖離が生じ verbatim 包含突合が捕捉した [inbox]

### C11: 実装後に sidecar 追加方針を決めると配布物本文への REQ 行 ID 直書きが checker concrete-id で検出

- **根本原因**: 対応関係の正が traceability sidecar である規律に対し、実装者が本文の説明文に要件行 ID を書き込む実装順になった（sidecar 追加方針が本文編集より後に確定）
- **再発条件**: 配布対象ファイル（.md/.ts）を新規作成・追記する実装で、sidecar 宣言追加を後回しにして本文へ要件行 ID を書いた場合
- **予防策**: 委譲 prompt の配布物本文記述規約に「要件行 ID は sidecar のみ、本文は意味記述」を明示し、実装着手時の最初の commit で sidecar 宣言を先行させる

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E11 + deferred pool 同根先行 L4513 の 2 エントリ構成 |
| 影響度 | 2/5 | checker が 23 件検出・本文から ID 除去＋sidecar 集約で修正済み・checker が設計どおり機能 |
| 横展開性 | 4/5 | 配布物実装（.md/.ts 新規作成・追記）全般に適用可能 |
| 反映先明確度 | 5/5 | harness-delegation.md 委譲指示規律節（L285-293）が既存規律として自足的に整備済み |
| 自動化適性 | 4/5 | sidecar 先行宣言は機械的・checker による恒久事後検出あり |
| 再利用性 | 3/5 | 配布境界規律の運用知識（知識文書に知識化済み） |
| 再発可能性 | 3/5 | 規律ありでも実装順の誤りは起こり得る（L4513 規律策定後の再発例） |
| 費用対効果 | 1/5 | 恒久規律＋checker＋知識文書の既存で追加対策の価値なし |
| **加重合計** | **24/40** | |

- **推奨処分案**: duplicate。harness-delegation.md 委譲指示規律節（canonical 参照は節名のみ・対応関係は sidecar へ・PR 作成前に sidecar 登録・L285-293 実測）＋知識文書 distribution-concrete-id-placement.md（concrete ID 配置知識・3 系統同時衝突）による恒久被覆を実測で確認。E11 自身が「PR #3790 由来の学びと同根」＝L4513 と同根を申告。checker が設計どおり検出・修正済み
- **既存対策照合**: 対策あり・ギャップなし（恒久規律＋知識文書＋checker による被覆）
- **統合記録**: 先行エントリ（L4513）へ「統合追記（2026-10-20 learning-promote）」を適用し、再発の事実と duplicate 受理根拠を記録
- **エントリ一覧**
  - 実装後に sidecar 追加方針を決めると配布物本文への REQ 行 ID 直書きが checker concrete-id で検出される [inbox]

### C12: worktree 配布物 Markdown 編集で新規行の docs/ literal 参照が IR-055 で検出されるため抽象表現へ合わせる

- **根本原因**: 追加した手順書文が「docs/designs/…」の literal パスで参照先を記述した。配布物はプロジェクト相対の runtime 解決を前提とせず、既存 SKILL.md 本体は抽象表現で参照していた
- **再発条件**: 配布物 Markdown への新規行追加で参照先を literal パスで記述した場合（2 回発生）
- **予防策**: 配布物編集時の記述規約（既存表現への統一・抽象化参照）を委譲 prompt へ引き渡す

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E12 + deferred pool 同根先行 L4243 の 2 エントリ構成 |
| 影響度 | 2/5 | check_integrity が新規 NG 検出・抽象表現へ修正し再実行で 0 件・実害は修正作業 1 回 |
| 横展開性 | 3/5 | 配布物 Markdown を触る委譲（case-open STEP-4・case-run 委譲）で起こり得る |
| 反映先明確度 | 4/5 | harness-delegation.md 委譲指示規律節の近傍へ追加可能・名指し可能（規律不在を実測） |
| 自動化適性 | 4/5 | 記述規約の引き渡しは委譲 prompt への追記で機械的・checker は既存の事後検知 |
| 再利用性 | 3/5 | 配布物記述の表現規約知識として再利用 |
| 再発可能性 | 4/5 | 2 回発生・docs/ パス literal 参照は繰り返し起こり得る・事前防止規律なし |
| 費用対効果 | 3/5 | 委譲 prompt 記述規約への追記は低コストで事前防止に寄与 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: harness-delegation.md に IR-055 系・docs/ 配下パス literal 参照禁止の規律が不在（実測 grep 0。IR-055 は 0 件。「具参照」「docs/ 配下パス」の規律記述なし。委譲指示規律節 L285-293 は concrete ID 直書きのみ対象）。同根先行 L4243 も「配布物編集を伴う workflow skill への具参照禁止の注記」を反映先として保持していた（処分判定なし）。C11（concrete ID 直書き）とは別の検出カテゴリ（IR-055 runtime-unresolved-reference）であり既存規律では被覆されない。反映先: 同文書委譲指示規律節への「docs/ 配下パスの literal 参照禁止・抽象化参照統一」追記＋yomiyasu 拡張 rule の指摘候補（情報候補）
- **既存対策照合**: 対策あり（IR-055 checker による事後検知）・ギャップ: fix gap（委譲段階の事前防止規律の不在・2 回の実発生）
- **統合記録**: 先行エントリ（L4243）は promote 統合の根拠として本レポートと採用済み成果物へ証拠保存のうえ prune
- **エントリ一覧**
  - worktree 配布物 Markdown 編集では IR-055（runtime-unresolved-reference）が新規行の docs/ literal 参照を検出するため抽象表現へ合わせる [inbox]

### C13: REQ 追加の設計 PR で計測日収束が 2 段で発生し frontmatter updated 追随は stagePaths に事前包含できない

- **根本原因**: generate_indexes は commit 前配置で動作するため commit author date を参照できず req-metrics 計測日が 1 日遅れで書かれる。さらに派生物 req-health-metrics.md の frontmatter updated は generate_indexes が更新しないため、REQ 行追加と派生物更新が同一 PR の commit になった時点で frontmatter updated がずれる。stagePaths への事前包含は派生物確定後になるため構造的に不能
- **再発条件**: REQ 行追加（frontmatter updated を進行させる編集を含む）を伴う Definition PR で、generate_indexes 派生物が自動更新対象に含まれる場合
- **予防策**: prepare_definition_pr へ計測日収束の自動補正（generate_indexes 再実行＋frontmatter updated 追随＋補正 commit）を組込む拡張の検討

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 既定 contingency で収束・追加 commit 2 回・check_integrity 再実行・実害なし |
| 横展開性 | 3/5 | generate_indexes 派生物を含む Definition PR に限定される特殊構造 |
| 反映先明確度 | 5/5 | definition-pr-and-idempotency.md L60-61 に既存規定が自足的に整備済み |
| 自動化適性 | 4/5 | 既存 contingency は機械的手順・script 組込拡張も機械的 |
| 再利用性 | 3/5 | Definition PR 運用知識として再利用 |
| 再発可能性 | 4/5 | REQ 行追加 PR では構造的に常時発生し得る（既存 contingency で検出即解消） |
| 費用対効果 | 3/5 | 既定 contingency 既存で対応可能・script 組込は改善候補 |
| **加重合計** | **24/40** | |

- **推奨処分案**: duplicate。definition-pr-and-idempotency.md に「計測日収束は 2 段検出であり、(a) req-metrics の計測日 AUTOGEN 更新と (b) req-updated-freshness による frontmatter updated 追随の両方を同一 PR 内の追加 commit で収束させて初めて完了」（L60）と「stagePaths への事前包含は構造的に不能・commit 後の changedFiles 事後突合と明示パス指定補正 commit を標準 contingency」（L61）の既存規定あり（実測）。inbox E13 は「reference の標準 contingency どおり」と申告する適用事例
- **既存対策照合**: 対策あり・ギャップなし（既定 contingency の完全被覆を実測で確認）
- **エントリ一覧**
  - REQ 追加の設計PRでは計測日収束が2段で発生し frontmatter updated 追随は stagePaths に事前包含できない [inbox]

### C14: DefinitionEdit の行構造事前確認は行内連結を拒否するため行内追記は隣接行を含む 2 行編集で表現

- **根本原因**: 対象行単独を oldText とする行内追記は「追加行の末尾行への連結」と同型になり、行の追加のみを許す行構造事前確認（validateEditLineStructure の連結検出規則）と衝突する
- **再発条件**: prepare_definition_pr への DefinitionEdit 入力を組み立てる際に、単一箇条書き行への行内追記を oldText=対象行のみで組み立てた場合
- **予防策**: req-define 側の draft 組立（artifact_actions content の表現）へ、行内追記を含む content が DefinitionEdit へ転記可能な構造である旨の注記を追加する検討

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 機械検証に到達する前に reference 読込で回避・実害なし |
| 横展開性 | 2/5 | DefinitionEdit 組立・draft 組立の限定局面 |
| 反映先明確度 | 4/5 | definition-pr-and-idempotency.md（組立手順）＋req-define draft-data 契約 reference と名指し可能 |
| 自動化適性 | 2/5 | 注記追記は文書修正・既存機械検証が実害を防ぐため新規自動化の余地小 |
| 再利用性 | 3/5 | 17 編集の検証済み回避構成は実用知識 |
| 再発可能性 | 3/5 | 行内追記の組立は REQ 適用範囲の追記で繰り返し起こり得る |
| 費用対効果 | 2/5 | fail-closed 機械検証が実害なし・注記追記の削減効果は小 |
| **加重合計** | **18/40** | |

- **推奨処分案**: deferred。行構造事前確認の機械検証（Case #3779 由来）が既存で fail-closed 保護・実害なし・出現 1 件。回避構成（oldText に隣接行を含め newText が oldText の接頭辞にならない形・置換対象 2 行の一意性事前検証）は実用知見として living pool で保持。再評価条件: 行構造検証の組立失敗再発時、draft 組立契約の改訂機会発生時
- **既存対策照合**: 対策あり（機械検証の fail-closed）・ギャップ: draft 組立側の転記可能性注記不在（影響は小）
- **エントリ一覧**
  - DefinitionEdit の行構造事前確認は行内連結を拒否するため単一箇条書き行への行内追記は隣接行を含む2行編集で表現する [inbox]

### C15: case-run scripts 配下に package 単位の型検査基盤が存在せず新規 .ts の typecheck が定型化されていない

- **根本原因**: src/common/skills/agentdev-workflow-case-run/scripts/ 配下には tsconfig.json と package.json が存在せず、package 単位 typecheck（bun run typecheck）が適用されない（本変更で導入した欠陥ではなく既存の領域特性）
- **再発条件**: 当該配下へ新規 .ts を追加する委譲の場合（C20 の長期未検出の構造的一因）
- **予防策**: 当該配下への tsconfig 導入または検証手段の定型記載の追加

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | bun test 実行（exit 0）と bun build トランスパイル通過で代替検証済み・実害は検証手段の粒度不足 |
| 横展開性 | 3/5 | repo root 直下の package 構成外 scripts 領域（scripts/self/release 等は未解決の同型課題）。skills scripts 領域は 15 スキルで package 構成済み（adversarial-review 実測）であり case-run scripts は唯一の適用漏れ領域 |
| 反映先明確度 | 4/5 | scripts 配下 tsconfig 追加＋agentdev-quality-gates 型検査水準記載＋REQ-112 方針参照と名指し可能 |
| 自動化適性 | 4/5 | tsconfig 導入は package.json＋tsconfig 追加で bun run typecheck が効く機械的整備 |
| 再利用性 | 3/5 | 型検査基盤整備の判断知識として再利用 |
| 再発可能性 | 4/5 | scripts 配下への新規 .ts 追加委譲は繰り返し起こり得る・C20 で同構造の未検出が実証済み |
| 費用対効果 | 3/5 | tsconfig 導入は中程度コストで検証手段を定型化 |
| **加重合計** | **24/40** | |

- **推奨処分案**: 恒久契約候補（REQ）。case-run scripts 配下には既存の typecheck 基盤が存在せず（実測: record-comments.ts・tests のみ・tsconfig/package.json 不在）、REQ-112/113 は local package tsconfig 統合の REQ（適用範囲 src/common/tools/agentdev-gh/ のみ・「他 local ツール package への横展開は REQ-112 が判断材料として記録」と明記）であり scripts 領域は未対象。既存対策（typecheck 基盤）が存在しないため「既存対策の更新」ではなく検証基盤整備という機能追加の要因＝REQ 候補。promoted 成果物は REQ-112 の方針（extends 参照共有・typecheck 組込み）を scripts 領域へ適用する是非の判断材料として req-define へ引き渡す
- **既存対策照合**: 対策なし（typecheck 基盤不在）・ギャップ: 該当なし（新規整備の判断材料）
- **エントリ一覧**
  - case-run scripts 配下には package 単位の型検査基盤が存在せず新規 .ts の typecheck が定型化されていない [inbox]

### C16: bun test 全件実行で textlint 並列系のみタイミング起因のフレークが観測され再実行で 0 fail

- **根本原因**: textlint 並列系テストのタイミング依存（推測。断定せず記録）
- **再発条件**: bun test 全件（textlint vendor 生成後）を CI 相当の 1 回実行で判定する場合
- **予防策**: textlint 並列系テストの同期化または再実行手順の恒常化、フレーク分類基準（タイミング起因と不具合の区別）の整備

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 再実行で 0 fail 解消・本変更と無関係の環境タイミング起因として記録・実害なし |
| 横展開性 | 2/5 | textlint 並列系に固有（フレーク分類観点は既存知識文書で被覆） |
| 反映先明確度 | 3/5 | agentdev-textlint-guard・agentdev-learning-pipeline と名指し可能だが具体箇所は不明確 |
| 自動化適性 | 3/5 | 同期化は実装変更・フレーク分類基準は手順化可能 |
| 再利用性 | 2/5 | 再実行での起因分離は既存知識文書で被覆済み・固有部分は少ない |
| 再発可能性 | 2/5 | タイミング依存は非決定的に再現・低頻度 |
| 費用対効果 | 1/5 | 再実行で解消・1 回のみの観測で安定化投資の根拠なし |
| **加重合計** | **15/40** | |

- **推奨処分案**: deferred〔adversarial-review 反映で被覆根拠を修正〕。タイミング起因は推測段階・出現 1 件・再実行で解消。既存被覆の根拠は windows-bun-test-spawn-timeout-classification.md L21 の「suite 全体の負荷が要因の場合」の再実行・main HEAD 対照実行による由来分離手順と bun-test-execution-form-drift-signals.md の実行形態逸脱判別（同文書の適用条件は spawn/timeout 系に限定寄りである点に留意）。加えて textlint 並列系には明示 timeout が既に実在（agentdev-textlint-guard tests/parallel.test.ts L145 timeout 60_000・adversarial-review 実測）。フレーク分類基準の整備候補を living pool で保持。再評価条件: 同種フレークの再発（2 回目）時
- **既存対策照合**: 対策あり（再実行による起因分離手順）・ギャップ: textlint 並列系固有の同期化は未実施（推測段階）
- **エントリ一覧**
  - bun test 全件実行で textlint 並列系のみタイミング起因のフレークが観測され再実行で 0 fail になる [inbox]

### C17: REQ 採用根拠照合の正規利用経路検証は恒常的 anchor 型テストと一回限りの実操作証跡の二層運用で機能する

- **根本原因**: なし（運用設計どおりの確認。実装の誤りではない）
- **再発条件**: 実操作検証を要件とする REQ 行の新規整備・更新の場合（問題ではなく設計確認）
- **予防策**: なし（現行運用で機能・inbox 自身が明記）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 問題が発生していない確認記録 |
| 横展開性 | 2/5 | REQ 検証手段の宣言設計に限定 |
| 反映先明確度 | 5/5 | REQ-110 TS-010 行へ具体試験名記録済み・sidecar verification 宣言登録済み（実測） |
| 自動化適性 | 4/5 | 恒常検証手段（anchor 型テスト 6 test）は既に実装済み |
| 再利用性 | 3/5 | 検証手段の二層設計パターンは REQ 整備で再利用可能（REQ-110 に具体化済み） |
| 再発可能性 | 1/5 | 問題が発生していないため再発なし |
| 費用対効果 | 1/5 | 現行運用で機能・追加対策不要 |
| **加重合計** | **18/40** | |

- **推奨処分案**: rejected（学習価値なし）。問題が発生していない運用設計の確認記録であり、恒久記録への反映は既に完了している（実測: REQ-110.md の TS-010 定義所在・REQ-110-033 検証手段としての二層運用・traceability sidecar verification 宣言）。inbox 自身が「予防策候補: なし（現行運用で機能）」と申告。学習 pool の保持対象ではない。恒久検出経路（anchor 型テスト）が既存で機能する。prune 対象（本 report と実行記録に根拠を保存）
- **既存対策照合**: 対策あり（恒久検証手段＋恒久記録への反映済み）・ギャップなし
- **エントリ一覧**
  - REQ 採用根拠照合の正規利用経路検証は恒常的 anchor 型テストと一回限りの実操作証跡の二層運用で機能する [inbox]

### C18: case-revise 由来の Definition Amendment draft が untracked のまま cleanup へ到達し removal commit が不成立

- **根本原因**: draft 作成後の git 永続化手順が例外経路（case-revise → case-ready）のどの工程でも実行されていなかった（推測を含む）。cleanup script の冪等化前置きが untracked draft を git rm 対象から除外し removal commit 対象が空で commit 不成立
- **再発条件**: case-revise が draft を生成・更新する場合、または req-define が draft を永続化 commit なしで次工程へ引き渡す場合
- **予防策**: draft 作成・更新後の git 永続化を case-revise / req-define の手順へ明示、または cleanup 前の untracked draft 検知時の警告メッセージ明確化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（L835 は RU 未コミット削除で対象・工程が別のため数えない・近縁前例のみ） |
| 影響度 | 3/5 | cleanup removal commit 不成立・draft が git 履歴に残らないまま削除・canonical 投影済みで復元不要だったが証跡欠落の構造 |
| 横展開性 | 3/5 | case-revise → case-ready 例外経路＋req-define draft 払出しで起こり得る |
| 反映先明確度 | 4/5 | case-revise／req-define 手順＋case-ready cleanup script と名指し可能（明記 gap を実測） |
| 自動化適性 | 4/5 | 永続化手順の明記・cleanup 前検知の警告は機械的 |
| 再利用性 | 3/5 | draft/RU lifecycle 管理の運用知識として再利用 |
| 再発可能性 | 4/5 | case-revise 経路は繰り返し起こり得る・手順明記なし・L835 が近縁前例 |
| 費用対効果 | 4/5 | 手順明記は低コストで証跡欠落リスクを除去 |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: case-revise SKILL.md と references（definition-revision.md・handoff-and-update.md・impact-reassessment.md）に draft 永続化 commit 手順の明記なし（実測 grep 0。draft＋commit/永続化・git add・untracked のいずれもヒットなし）。req-define draft-generation.md にも draft 保存時の git 永続化 commit の明記なし（実測。STEP-9 ドラフト保存あり・commit 0 件）。反映先: agentdev-workflow-req-define draft-generation.md STEP-9 を永続化責務の一元化の主対象（保存時の git 永続化明記）とし、agentdev-workflow-case-revise 側へは「引き継ぐ draft が commit 済み（tracked）であることの確認」に限定〔adversarial-review 指摘を受理: case-revise は draft を生成・更新せず入力として消費する（SKILL.md L19・definition-revision.md L10）〕・agentdev-workflow-case-ready cleanup script（untracked draft 検知時の報告文言明確化候補）
- **既存対策照合**: 対策あり（cleanup の fail-closed 検知は機能）・ギャップ: fix gap（draft 生成工程の永続化手順明記不在・検知遅延）
- **エントリ一覧**
  - 2026-10-19: case-revise 由来の Definition Amendment draft が untracked のまま cleanup へ到達し removal commit が不成立した [inbox]

### C19: 依存生成未実施 worktree で repo root 全体 bun test が 76 fail となり変更起因失敗との分類にスイート分解が必要

- **根本原因**: 依存生成手順（README「開発者セットアップ」の bun install && bun run build:engine）未実施環境での全体実行は fail-closed で依存解決失敗が fail として混入し、fail 一覧から環境差と変更起因が構造的に分かれない
- **再発条件**: worktree または新規 checkout 環境で依存生成を実施せず repo root 全体の bun test を実行する場合（3 回観測）
- **予防策**: 依存生成手順未実施環境での全体実行時に、依存由来 fail と検査 fail の判別指針（依存生成前置の案内出力との突合・案内メッセージの明示化）を提示する仕組み

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | E19 + deferred pool 同根先行 L3617・L4037 の 3 エントリ構成 |
| 影響度 | 2/5 | fail 明細の依存集中確認＋スイート分解で検査範囲を確定・実害は分類コストのみ |
| 横展開性 | 4/5 | worktree・新規 checkout 環境全般で繰り返し起こり得る |
| 反映先明確度 | 4/5 | worktree-environment-fail-classification.md・README セットアップ節・worktree-operations.md と名指し可能 |
| 自動化適性 | 4/5 | 判別前置（vendor 存在確認）は機械的手順化可能 |
| 再利用性 | 3/5 | 環境差 fail 分類の運用知識（3 件統合）として再利用 |
| 再発可能性 | 4/5 | 依存生成未実施環境は繰り返し発生（3 回観測） |
| 費用対効果 | 3/5 | 判別前置の明記は低コストだが既存 fail-closed 案内もあり効果は部分的 |
| **加重合計** | **27/40** | |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: README セットアップ節に fail-closed 案内の記載あり、worktree-environment-fail-classification.md に由来分離 3 手手段＋依存前提の実行形態別判断表あり。ただし「依存生成済み/未生成の判別前置（vendor 配下 bundle・辞書の存在確認）」の明記は不在（worktree-operations.md の node_modules 伝播状態確認手順 L169-174 は node_modules 系のみ・vendor 判別なし。同根先行 L4037 が 2026-10-11 実測で「checker 本体・README は未修正」を記録）。3 回の再発（L3617・L4037・E19）で判別前置の統合具体化の機会。反映先: worktree-environment-fail-classification.md への「依存生成未実施環境の判別前置＋fail 明細の依存集中観点」接続追記（知識文書更新は backlog-review 承認経由）＋worktree-operations.md 依存整備節への vendor 判別前置補足候補
- **既存対策照合**: 対策あり（README fail-closed 案内・由来分離 3 手段）・ギャップ: fix gap（vendor 系判別前置の明記不在・3 回の実発生）
- **統合記録**: 先行エントリ（L3617・L4037）は promote 統合の根拠として本レポートと採用済み成果物へ証拠保存のうえ prune
- **エントリ一覧**
  - 2026-10-19: 依存生成未実施 worktree で repo root 全体 bun test が 76 fail となり、変更起因失敗との分類にスイート分解が必要だった [inbox]

### C20: HOLD_AND_CONTINUE_TOKENS の宣言のみの未使用状態が typecheck 枠組み不在下で長期未検出となり anchor 照合テストの token 定義と本文表現の対応関係が保守観点として残存

- **根本原因**: テストヘルパ定数の追加が参照結線なしで先行し、case-run scripts は package（tsconfig/package.json）を持たないため型検査枠組みが不在で長期未検出だった
- **再発条件**: anchor 照合テストに token 群を追加する際に参照結線を作らず、かつ当該テスト領域の型検査が実行されない場合
- **予防策**: token 群定義への対応関係明示（どの SKILL のどの表現を期待値とするか）、token 群追加時の参照結線確認の手順化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 参照化済み（anchor 照合追加・実測 3 件）で解消済み・実害なし |
| 横展開性 | 2/5 | anchor 型テストに限定 |
| 反映先明確度 | 3/5 | tests 定義コメントと名指し可能だが「対応関係明示」の具体箇所は曖昧 |
| 自動化適性 | 3/5 | コメント明示は機械的に追加可能・参照結線確認は手順化可能 |
| 再利用性 | 2/5 | anchor 型テストの保守知識・解消済み問題 |
| 再発可能性 | 2/5 | 未使用化は型検査不在下で再発し得るが今回は解消済み・C15 の typecheck 基盤化に依存 |
| 費用対効果 | 2/5 | 解消済み問題の予防投資価値小 |
| **加重合計** | **16/40** | |

- **推奨処分案**: rejected（学習価値なし）。問題は PR #3815 の anchor 照合追加で既に対応済み（実測: 定義＋参照 3 件・定義側に目的コメント「過剰停止防止の核心トークン」あり）。すでに別の対策で十分対応済みであり、残る保守観点（SKILL 本文表現との対応関係明示）は anchor 照合テスト自体が対応関係を検査するため追加対策の価値が小さい。型検査枠組み不在の課題は inbox 自身が intake（同日別 entry）として分離管理と明記。prune 対象（本 report と実行記録に根拠を保存）
- **既存対策照合**: 対策あり（anchor 照合追加による参照化）・ギャップなし
- **エントリ一覧**
  - 2026-10-19: HOLD_AND_CONTINUE_TOKENS の宣言のみの未使用状態が typecheck 枠組み不在下で長期未検出となり、anchor 照合テストの token 定義と本文表現の対応関係が保守観点として残存 [inbox]

### 未分類

- なし。20 件すべて問題クラス C1〜C20 へ帰属。Jev 分類評価も全件同一帰属（observation 20261019T154236Z-dc04・全問 true）。入力正規化: 20 件すべて 13 フィールド形式相当で旧フォーマット正規化の適用はなし（E1〜E17 は「Decision/REQ/spec影響」、E18〜E20 は「REQ/Decision/spec影響」のフィールド表記ゆれはあるが同一意味フィールドで正規化影響なし）。元 inbox は解析時のみ読み、判定までは変更しなかった

## Decision 候補除外記録

- **対象 item**: C1〜C20 全単位
- **除外理由**: 技術判断不在 / 運用ルール / command 仕様
- **根拠事実**: 全単位が運用・検証・手順・記録様式の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない。昇華可能性評価（observation 20261019T160410Z-50da）も Decision 候補化は 0（昇華 true は C4/C5/C6/C12/C18/C19〔既存対策の更新〕と C15〔REQ 候補〕のみ）
- **代替反映先候補**: REQ/Design/配布 skill references/guide/knowledge（各クラスの反映先候補は問題クラス一覧の推奨処分案参照）

## 実行証跡

- STEP-1: inbox 20 エントリ（326 行）を読込・正規化（全件 13 フィールド形式相当）。deferred インデックススキャン: 見出し 257 行（実エントリ 253 件）。同クラス先行候補の本文読込（L2347〔C1 同根〕、L4378〔C5 近縁別根因〕、L4694/L4819〔C7 同根〕、L3449〔C8 同根〕、L4243〔C12 同根〕、L3617/L4037〔C19 同根〕、L4984〔C9 事前 gate 検出漏れの別現象・既に deferred 判定済み〕、L4513〔C11 同根〕、L4783〔C10/C14 近縁別根因〕、L2716〔C10 近縁別根因〕、L2064/L3596/L3638〔C13 IR-072 系近縁〕、L4340/L3407〔C15 近縁別領域〕、L835〔C18 近縁別工程〕、L4721/L4760〔C6 baseline 既存 fail 系別根因〕、L4205/L3680〔C2 別現象〕、L3053〔C3 別現象〕）。全面読みフォールバック対象エントリなし
- 既存対策の実測: issue-operation-recovery.md 全文（C1 被覆規定 L28/L35-38/L40-48/L52-61・C4 非許容明記 grep 0）、issue-operation-safety.md（C2 labels 空配列明示規定あり・検索ラベル指針なし）、qg-4-final-acceptance.md 全文 grep（C6/C7: file-level・--timeout・bun race 0 件）、windows-bun-test-spawn-timeout-classification.md / bun-test-execution-form-drift-signals.md / worktree-environment-fail-classification.md（C7/C16/C19 被覆確認）、worktree-operations.md（C8: L452-478 既存手順あり・C3 分割書込み 0 件・C19 node_modules 判別 L169-174）、harness-delegation.md 全文 grep（C9 checker 検査リスト明示なし・C11 委譲指示規律 L285-293 あり・C12 IR-055/literal 参照規律 0 件）、definition-pr-and-idempotency.md（C13 L60-61 既存規定・C10 L40 verbatim 包含突合・C14 行構造規定なし・C3 分割書込み 0 件）、case-revise SKILL.md＋references 3 件・req-define draft-generation.md（C18 draft 永続化 commit 明記 0 件）、record-comments.ts＋issue-lifecycle-records.md（C5 境界表現様式 0 件）、REQ-110.md（C17 TS-010 定義所在あり）、REQ-112/113.md（C15 スコープ agentdev-gh/ のみ）、case-run scripts 配下（C15/C20: tsconfig/package.json 不在・HOLD_AND_CONTINUE_TOKENS 参照 3 件）、README.md セットアップ節（C19 fail-closed 案内あり）、docs/knowledge/ 36 .md 一覧（C11 distribution-concrete-id-placement.md 被覆確認）、拡張 yaml 5 セクション空
- Jev 観測（本 run 生成・全 observation に finalResult を observation_write で追記済み）: 20261019T154236Z-dc04（分類 20 問）・20261019T154431Z-b4e1（C1〜C3 21 問）・20261019T154603Z-d79e（C4〜C6 21 問）・20261019T154717Z-31f1（C7〜C9 21 問）・20261019T154836Z-96e8（C10〜C12 21 問）・20261019T154958Z-0cf4（C13〜C15 21 問）・20261019T155120Z-9e5c（C16〜C18 21 問）・20261019T155225Z-6186（C19〜C20 14 問）・20261019T160237Z-2f9e（処分区分 20 問）・20261019T160410Z-50da（昇華可能性 20 問）・20261019T161352Z-26d8（review 発動条件 1 問・発動）・20261019T163136Z-0ace（review 反映後の再判定 3 問・全問 true）。invalid_input 失敗 4 件（score value 5 の scale index 超過・differenceReason の要否誤判定 3 件）は入力検証失敗で観測は生成されず、正しい入力で再送して成立
- 禁止条件フィルタリングゲート: 20 単位すべて技術判断不在・運用ルール該当で Decision 候補除外（deterministic 適用）
- 環境記録: 本 run は backlog-auto stage 2 の learning 系統として実行。git 操作は禁止（親 orchestrator serialization 契約・MUST NOT DO）。.agentdev/intake/・.agentdev/inspect/・.agentdev/backlog-auto/ には未接触

## STEP-4 adversarial-review

- 発動判定: 発動（Jev boolean true、観測 20261019T161352Z-26d8。inbox 20 件で skip 条件〔空・1 件のみで重複確実〕非該当、evaluation-report 反映済み。親判断の最終確定結果が発動条件を満たしたため後続評価を生成）
- review 構成: 独立 challenge stream 2 本（explore サブエージェント・相互の finding を非公開で並行実行）。Stream A = promote 系（C4/C5/C6/C12/C15/C18/C19）の処分判断の反証。Stream B = duplicate/deferred/rejected 系（C1/C8/C11/C13・C2/C3/C7/C9/C10/C14/C16・C17/C20）の反証と分類境界検証。両 stream 合計 13m 28s
- orchestrator（Reviewee）相互反証: 決定的反証を orchestrator が自ら実測で再検証し、4 件の ESSENTIAL finding を受理した。（1）B5（C2）: issue-operation-safety.md L61/L124-125 と root-case-and-definition-package.md L47（手順 6）の再読取 — labels 非依存の Case 検出規律と起票ラベル任意付与契約の既存を確認。（2）B6（C3）: worktree-operations.md L251-256（標準手段 3 技法）と windows-git-bash-inline-content-corruption.md L14（機構 2・Case #3158）の再読取 — E3 の事象が機構 2 そのものであることを確認。初期評価の「分割書込み 0 件」は grep 語選択に依存した実測であった。（3）B8（C9）: case-run single.md L138/L142/L143 の再読取 — STEP-S3-5 必須前置 gate（2026-10-05 必須化・E9 より先行）と二重構造の既存を確認。（4）B7（C7）: gap 記述の「実測分布規定との緊張」が知識文書 L17 と 60 秒前例（parallel.test.ts L145・deferred L4819 の修正対象特定）により解決可能であることを確認 — 処分は deferred 維持・根拠記述を修正
- accepted finding 反映（STEP-2 へ戻りレポート更新 → STEP-3 処分再実行・Jev 再判定 20261019T163136Z-0ace〔3 問全問 true・evaluator と一致〕）:
  - C2: deferred → duplicate（labels 非依存 Case 検出規律・起票ラベル任意付与契約の既存被覆を根拠に変更）
  - C3: deferred → duplicate（失敗機構の知識化 windows-git-bash-inline-content-corruption.md 機構 2＋標準手段 3 技法の既存被覆を根拠に変更）
  - C9: deferred → duplicate（STEP-S3-5 必須前置 gate＋二重構造の既存被覆を根拠に変更。E9 は必須手順の適用逸脱）
  - C1: duplicate 維持・記述修正（行引用 L52-62 へ修正・再発記録 5 回超の保持・統合追記に L2365 再評価約束への回答を含める）
  - C4: promote 維持・反映文言修正（「読み取りを含め非許容」は診断手順 L30-31・custom-tool-contracts.md L111 と矛盾するため「診断手順の読み取り切り分けに限定され、書込みを含む操作での直接起動は非許容」へ修正）
  - C5: promote 維持・(a)/(b) 設計分岐と Design 更新の backlog-review 承認経由を明記
  - C7: deferred 維持・gap 記述修正（標準化方法は既存規定 L17 が指示・60 秒前例実在。promote 対案は継続再発頻度と C6 との実害差を踏まえ deferred 維持）
  - C8: duplicate 維持・引用範囲 L452-488 へ修正
  - C10: deferred 維持・gap 記述修正（適用後 verbatim 包含突合は既存・実績あり。残余は pre-apply 照合と挿入点固定規律）
  - C15: REQ 候補維持・横展開性記述修正（skills scripts 15 スキルは package 構成済み・case-run scripts は唯一の適用漏れ領域）・promoted 成果物へ既存 15 パターンを REQ 判断材料として追記（A3 受理）
  - C16: deferred 維持・被覆根拠修正（L21 対照実行手順＋bun-test-execution-form-drift-signals.md＋parallel.test.ts timeout 60_000）
  - C17/C20: rejected 維持（恒久記録への反映完了を実測確認・B12/B13）
  - C18: promote 維持・反映先修正（永続化責務は req-define STEP-9 に一元・case-revise 側は tracked 確認に限定。A4 受理）
  - C19: promote 維持（知識文書 L35-37 の範囲外宣言と整合する形〔手順明記は範囲内・機構導入は範囲外〕の追記方針を追記）
  - 分類境界: C5 vs L4378・C18 vs L835・C9 vs C11/C12・C7 vs C6 の分離は両 stream とも確認（B14/B15/B16/B17）
- 戻しループ: STEP-2（レポート更新）→ STEP-3（処分再実行・Jev 再判定 0ace）→ STEP-4 発動条件判定（親条件不変）。再判定は accepted finding（orchestrator 実測済み）の機械的反映であり新たに未検証の争点を導入しないため、再 review は発動せず後続の意味評価と観測記録も生成せずに停止条件を満たしてループを離脱した（REQ-090-025 準拠）
- unresolved: なし（発見された本質的争点はすべて実測で解決。B7 の C7 promote 対案は実害差の判断として明示的に deferred を選択した記録であり unresolved ではない）

## promote 時 prune 結果（実績）

- **対象エントリ数**: inbox 20 件（原子的操作で統合追記・移動・prune を同時適用）
- **prune実施**: 16 件（promote 6〔C4/C5/C6/C12/C18/C19。採用済み成果物の「元learning item / 根拠」セクションへ証拠保存済み〕+ REQ 候補 1〔C15。promoted 成果物に証拠保存済み〕+ duplicate 7〔C1/C2/C3/C8/C9/C11/C13。C2/C3/C9 は adversarial-review accepted finding による duplicate 変更分を含む〕+ rejected 2〔C17/C20〕）
- **prune却下（deferred 残置）**: 4 件（C7/C10/C14/C16。移動日 2026-10-20 と処分判定を付して living pool へ追加）
- **既存 pool への追加 prune**: 実施せず（任意運用のため保守的に残置。同根先行エントリ L2347〔C1〕・L3449〔C8〕・L4513〔C11〕・L4694〔C7・L4819 含む〕は統合追記のみで残置。L3617/L4037〔C19〕は promote 統合の根拠として promoted 成果物と本レポートへ証拠保存のうえ保守方針により残置）
- **統合追記**: 4 件（L2347〔C1 duplicate 受理・L2365 再評価約束への回答を含む〕、L3449〔C8 duplicate 受理〕、L4513〔C11 duplicate 受理〕、L4694〔C7 deferred 維持・3 エントリ構成の記録〕）
- **検証結果**: inbox ヘッダーのみ（エントリ 0 件）、deferred 見出し 261 行（257+4）、移動 4 タイトル各 1 件・移動日 2026-10-20 ×4、統合追記マーカー ×4、pruned 16 タイトル不在、promoted 7 件生成、読戻し検証実施。deferred SHA-256 29148b94・inbox SHA-256 4fc9a667

## STEP-5 自律確定記録

- 自律確定: 20 単位すべて自律確定（ユーザー承認なし）。promote 6 単位（C4/C5/C6/C12/C18/C19）は既存恒久手順の具体的 gap を実測（grep・全文読取・adversarial-review 両 stream 検証・orchestrator 再実測）で確認できた既存対策の更新であり、正規契約と実測からの導出で一意に確定。REQ 候補 1 単位（C15）は既存対策が存在しない整備要求の判断材料として判定基準どおり REQ 候補とし（既存 15 スキルパターンの存在は A3 で受理し判断材料に追記）、promoted 成果物は判断材料の提供に留まり実現先を確定しない。duplicate 7 単位（C1/C2/C3/C8/C9/C11/C13）は恒久手順・恒久規律・知識文書・機械検査による被覆を実測で確認（うち C2/C3/C9 は adversarial-review ESSENTIAL findings B5/B6/B8 を orchestrator が実測再検証して受理したもの）。deferred 4 単位（C7/C10/C14/C16）は処分区分 6 の判定基準（単発・断片的・出現回数少・恒久被覆未確認）への該当を実測で確認。rejected 2 単位（C17/C20）は学習価値なし（恒久記録への反映済み・別対策で十分対応済み）を確認
- HITL 不要の理由（人間判断への引き上げ条件との照合）: （1）ユーザー固有の目的・価値観・優先順位の新規確定を要する事項なし。（2）正規情報源間の未解決規範矛盾なし（STEP-4 で C4 反映文言の診断手順との矛盾・C15 の REQ-112 構造差が実測で解決済み）。（3）対論型レビューの本質的争点は相互反証と実測検証ですべて解決済み（unresolved なし）。（4）要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定なし〔promote 7 単位は backlog-review/req-define 向けの提案ステージに限り、実現先の確定・恒久規範の確定は行わない。C19 の知識文書更新・C5 の Design 更新は backlog-review 承認経由の対象として成果物へ明記〕。（5）既存の明示的な安全境界が要求する操作の承認なし〔inbox クリアは正規の deferred 移動原子的操作プロシージャであり、prune 16 件は本 run 移動分の promote 時 prune で STEP-5 の判定確定と同時に承認済み。「inbox.md 全体強制クリア・大量エントリ一括削除」には該当しない。既存 pool への追加 prune は実施しない保守方針〕
- 判定の変更指示: なし（本 run は HITL 質問を発生させず STEP-6 へ進む）
- 破壊的変更: なし（既存 pool 253 件への追加 prune は実施しない。deferred 移動は原子的操作プロシージャの機械実行規律〔メモリ完結・全検証・一括原子書込〕に従い、統合追記 4 件・移動 4 件・inbox クリアを検証付きで実施。既存エントリの書換えは行っていない）

## STEP-6 実行記録

- promoted 7 件（issue-operation-recovery-tool-internal-launch-prohibition.md〔C4〕・progress-record-unobserved-time-boundary-notation.md〔C5〕・qg4-bun-test-exit0-race-file-level-split.md〔C6〕・harness-delegation-docs-literal-reference-prohibition.md〔C12〕・case-run-scripts-typecheck-baseline.md〔C15・REQ 候補〕・draft-git-persistence-procedure.md〔C18〕・dependency-generation-precheck-fail-classification.md〔C19〕）を新規生成（UTF-8 BOM なし・LF）。knowledge 文書分類の成果物は 0 件（全て既存対策の更新・REQ 候補であり backlog-review → RU 化 / req-define 経路。C19 は既存知識文書への接続追記提案を含むが新規知識文書の作成ではない）
- deferred 移動（原子的操作・メモリ完結＋全検証＋一括原子書込）: 統合追記 4 件 + 移動 4 件（移動日 2026-10-20）+ inbox クリアを実施し読戻し検証済み（deferred 見出し 261 行・SHA 29148b94、inbox ヘッダーのみ・SHA 4fc9a667）。prune 16 件は inbox から deferred へ追記せず除去（証拠保存済み）
- evaluation-report.md は本レポートで上書き（中間ドラフト＋node 検証付き書込み）
- git 永続化: 実行しない（本 run は git 操作禁止契約下。手順 1 の git pull --ff-only も含めて git コマンドを一切実行せず、変更ファイルの一覧と提案 commit message を完了報告へ git-pending として記載）

## 全体傾向

- **昇華価値の中心**: C18（26/40・draft 永続化手順明記 gap・L835 と同型の untracked 削除が 2 例目で構造性を支持）、C12（26/40・IR-055 literal 参照の事前防止規律 gap・2 回の実発生）、C19（27/40・依存生成判別前置の明記 gap・3 回の再発）。いずれも既存恒久手順の具体的 gap を実測で確認した既存対策の更新
- **adversarial-review の効用**: deferred 4 単位のうち 3 単位（C2/C3/C9）の既存対策被覆が過小評価であったことを独立 stream が実測で発見し duplicate へ是正。初期評価の grep 語選択に依存した実測（C3）と、クラス固有の規定位置の見落とし（C2・C9）が是正された
- **恒久被覆による重複**: C1（issue-operation-recovery.md 劣化サイクル・縮退運用節）、C8（worktree-operations.md フォールバック手順）、C11（委譲指示規律＋distribution-concrete-id-placement.md）、C13（definition-pr-and-idempotency.md L60-61）は恒久被覆を実測で確認
- **保持型**: C7（timeout 指針の観点・3 エントリ構成で統合追記）、C10（pre-apply 照合と挿入点固定の観点）、C14（draft 組立転記可能性の観点）、C16（フレーク分類の観点）は deferred
- **廃棄**: C17（運用設計確認・恒久記録反映済み）、C20（anchor 照合追加で対応済み）は rejected
- **全体的な観察所見**: 本 batch は Case #3782/#3793/#3803 系の e2e 実行由来が中心。promote 6 単位のうち 5 単位（C4/C5/C6/C12/C18）は「規律・手順・様式の明記追加」型であり、恒久文書の文面 gap を実測で裏付けている。inbox 申告と恒久契約の乖離確認の重要性が再確認された（C4 の反映文言矛盾・C15 の REQ-112 構造差は inbox 申告のまま採用すると既存手順と衝突した）
