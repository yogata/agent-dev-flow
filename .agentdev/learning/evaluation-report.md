# 評価レポート

## メタデータ
- **実行日時**: 2026-10-05 01:47（backlog-auto stage 2 並行委譲実行。STEP-6 永続化時点の実測値に是正。初回記載 00:40 は stage 1 完了より前の誤記であった）
- **対象エントリ数**: 71件（inbox: 71件、deferred 判定対象: 既存 deferred は候補照合ベースで突合）
- **問題クラス数**: 16（未分類 22 単位を含む判定単位合計 38）

## 実行状態（resume 再構成用）

- STEP-1〜STEP-5（判定確定準備）まで実施済み。STEP-6（採用済み成果物生成・deferred 移動・prune・commit/push）は parent の Git 排他枠待ちで未実施
- inbox.md は未クリア、promoted/ は未生成（本レポートの判定確定を STEP-6 で反映する）

## 問題クラス一覧

### 問題クラス1: project extension rules 読込の後置による書込み前適用漏れ（PC-1）

- **根本原因**: workflow 委譲実行で project extension rules（yomiyasu-application-before-write・REQ-098 系）の読込が docs 編集・GitHub 書込みより後段に配置される。extension は fail-open のため適用漏れが silently 継続し、遡及適用（投稿後 lint）で回復する構造が反復する
- **再発条件**: extension rules に書込み前プロシージャを持つ workflow（case-open 等）の委譲実行で、読込前置が手順化されていない場合
- **予防策**: 各 workflow skill の STEP reference・委譲 prompt へ「最初の GitHub 書込み・docs 編集前の extension rules 読込」前置の明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件 |
| 影響度 | 2/5 | 成果物品質への実害なし（遡及適用で完結・保持指摘のみ）。局所的な手戻りが反復（Jev 分布: 水準2 に 0.58） |
| 横展開性 | 3/5 | extension 機構を持つ ADF workflow（case-open/case-run/case-close 等）で発生。類似構成（extension 委譲実行）で発生し得る |
| 反映先明確度 | 4/5 | 対象 STEP reference（root-case-and-definition-package.md）・extension 構成が特定済。実測: 同 reference に extension 前置の記述なし（grep）、case-open SKILL.md L76 は agentdev-project-extensions の連携列挙のみ |
| 自動化適性 | 2/5 | 手順追記・委譲 prompt 前置指示が主体。機械検査化は困難 |
| プロジェクト固有知識再利用性 | 3/5 | extension 機構（fail-open）と委譲実行の構造的リスク。ADF 内では中程度の再利用性 |
| 再発可能性 | 5/5 | 4独立委譲で再現・前置手順は未整備のため構造的に継続（Jev 分布: 水準5 に 0.85） |
| 費用対効果 | 4/5 | 手順追記は低コストで適用漏れ撲滅（Jev 分布は水準3/4 ほぼ二峰） |
| **加重合計** | **26/40** | Jev 検証済み（observation 20261004T164150Z-d080。横展開性・費用対効果は Jev 値から最終判断で水準引き上げ〔semantic_disagreement〕） |

- **推奨処分案**: 5 既存対策の更新（agentdev-project-extensions 読込契機規約・case-open 等 workflow STEP reference・委譲 prompt テンプレートへの読込前置明示。ギャップ分類: fix gap ＋ application miss）

#### エントリ一覧
- 2026-10-03 case-open（OU-002・#3333）yomiyasu 適用順序違反 [inbox]
- 2026-10-03 並行 case-open（OU-006・#3335）extension 読込が STEP-5 まで後ろ倒し [inbox]
- 2026-10-03 project extension 未読込 deviation の再発（OU-011/OU-012・2例目） [inbox]
- 2026-10-04 case-open（#3440）Root Case 本文を GitHub 書込み前に yomiyasu 推敲せず投稿 [inbox]

### 問題クラス2: worktree の git 管理外依存未伝播による環境差 fail と由来分類運用（PC-2）

- **根本原因**: worktree は git 管理外の投影・生成物（.opencode/skills junction・plugins junction・node_modules・textlint vendor・src/opencode-local）を伝播しないため、テスト・checker 実行が環境差 fail・未実施となる
- **再発条件**: worktree 内でこれら領域に依存するテスト・checker を実行する場合（全 case-run/case-close で構造的）
- **予防策**: (a) 由来分類（main root 対照・baseline 再現・同一条件実行）の evidence 化、(b) 環境差の明示記録（未実施を実行済み扱いしない）、(c) 依存生成・ junction 投影の前置手順、(d) skip/fallback 判定の明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 5件 |
| 影響度 | 3/5 | 回帰判定の難読化・QG 判定汚染（実害は検証時） |
| 横展開性 | 4/5 | worktree 運用を持つ全 workflow・同種構成で汎用 |
| 反映先明確度 | 4/5 | checker-execution-contracts.md に worktree fallback 節・環境ラベル規定が実在（L97/L178-186/L211 実測）。由来分類手順の知識文書化が候補 |
| 自動化適性 | 3/5 | skip/fallback 判定・環境ラベル記録は自動化可、対照実行は半自動 |
| プロジェクト固有知識再利用性 | 4/5 | worktree 検証運用の中核知識 |
| 再発可能性 | 5/5 | worktree 実行が続く限り構造的 |
| 費用対効果 | 4/5 | 手順・知識文書化は低コストで判定誤り削減 |
| **加重合計** | **31/40** | |

- **推奨処分案**: 4 project knowledge（worktree 環境差 fail の由来分離と明示記録運用の知識文書。backlog-review の利用者承認後に docs/knowledge/ へ直接保存される候補。checker 実行契約 fallback 節への相互参照付記）

#### エントリ一覧
- 2026-10-03 worktree bun test 分割1 の src/opencode-local 未伝播 fail は main root 同結果実行で由来分類（#3405 再観測含む） [inbox]
- 2026-10-03 worktree で skills_structure.test.ts の See Also 参照検査が projection 不全で 4 件 fail [inbox]
- 2026-10-03 textlint guard 系の vendor 未生成 worktree では pre-existing fail 39 件が難読化 [inbox]
- 2026-10-04 worktree bun test 分割③ は plugins junction 未伝播により未実施。環境差の明示記録運用 [inbox]
- 2026-10-04 integrity suite 分割① の pre-existing fail 4件+error 1件は baseline 既存債務 [inbox]

### 問題クラス3: worktree・main root のパス深さ構造に結合した repoRoot 計算テスト（PC-3）

- **根本原因**: import.meta.dir からの固定階層上昇で repoRoot を解決するテストが worktree 深度・main root 構造に結合し、実行環境で green/fail が逆転する（false green・ENOENT fail）
- **再発条件**: worktree 実行で作成・検証した相対階層数前提の repoRoot 計算を別深度環境で実行する場合
- **予防策**: repoRoot 解決の git 依存化（git rev-parse）・階層数非固定探索、期待値参照先の明示、main root 正規形での再実測

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 4/5 | 検証漏れ（false green）と main root 正規形 fail の両方向の品質リスク |
| 横展開性 | 4/5 | import.meta.dir 系 repoRoot 計算を持つテスト全般 |
| 反映先明確度 | 4/5 | 対象テストファイル（process-conformance.test.ts・skills_structure.test.ts）が特定済 |
| 自動化適性 | 3/5 | 修正は一度の実装変更で完了 |
| プロジェクト固有知識再利用性 | 4/5 | worktree 並列検証の基盤知識 |
| 再発可能性 | 4/5 | 既存テストが残存し main root 実行のたびに顕在化 |
| 費用対効果 | 4/5 | 修正コスト低で検証信頼性が向上 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 5 既存対策の更新（既知欠陥テストの repoRoot 解決修正・integrity 基盤のテスト repoRoot 解決規約。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-03 worktree 内 bun test が repoRoot 計算で main repo root の SKILL.md を読む（false green） [inbox]
- 2026-10-04 main root での bun test は path 深さ依存テストの fail を観測（green/fail 逆転） [inbox]
- 2026-10-04 worktree 深度前提の repoRoot 計算テストは main root 実行で ENOENT fail（process-conformance.test.ts） [inbox]

### 問題クラス4: bash 経由 checker 観測の形式誤り（終了コード・stderr 結合・パス形式）（PC-4）

- **根本原因**: Windows Git Bash 経由で checker を実行・観測する際、パイプ終了コード・stdout/stderr 結合・MSYS 形式パスが観測を壊す。checker 契約自体は正常で観測方法の誤り
- **再発条件**: bash パイプ経由の `echo $?`、`2>&1` 結合取得、`$(pwd)` 展開の MSYS パスを --root へ渡す場合
- **予防策**: パイプなし実行・PIPESTATUS、stderr 分離取得、--root は Windows 形式絶対パス（C:/ 記法）直書き、対象 0 件の合格を検査不能と区別

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 6件 |
| 影響度 | 3/5 | 誤合格・誤判定しかけ（fail-open の穴を含む）。実害は観測段階 |
| 横展開性 | 4/5 | 全 checker 観測・Windows Git Bash 環境で汎用 |
| 反映先明確度 | 4/5 | checker 実行契約・各 reference 実測手順が対象。現行契約に観測規律の集約記載なし（実測: checker-execution-contracts.md に stderr 分離・MSYS パス規律の記述なし） |
| 自動化適性 | 2/5 | 手順注記が主体 |
| プロジェクト固有知識再利用性 | 4/5 | Windows 検証運用の定番知見（前回 U12 MSYS 系の拡張系統） |
| 再発可能性 | 4/5 | 観測は日常操作で手順化まで反復 |
| 費用対効果 | 4/5 | 注記・知識文書化は低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: 4 project knowledge（Windows Git Bash 経由 checker 観測規律の知識文書。docs/knowledge 直接保存候補。checker 実行契約への注記候補を付記）

#### エントリ一覧
- 2026-10-03 bash パイプ経由 checker 実行の echo "exit=$?" はパイプ最終コマンドの終了コードを返す（#3337） [inbox]
- 2026-10-03 bash pipe 経由の dollar-question は最後のコマンドの終了コードを見る（#3340・同型） [inbox]
- 2026-10-04 check_integrity の sha^:path 参照 git fatal が stderr に出るが JSON は有効（stderr 分離取得） [inbox]
- 2026-10-04 Git Bash $(pwd) の POSIX パスと bun --root の組合せで対象 0 件の PASS（fail-open の穴） [inbox]
- 2026-10-04 traceability check --root に MSYS 形式パスを渡すと宣言走査が空になる（C:/ 形式必須） [inbox]
- 2026-10-04 freshness checker 内部の git コマンドが再作成履歴ファイルで fatal を出す（pre-existing） [inbox]

### 問題クラス5: pin 型・anchor 型テスト期待値の変更追随漏れ（PC-5）

- **根本原因**: 配布物文言・構造・パス・型を pin するテスト（integrity suite・scripts/self・anchor テスト）が当該データ変更と同一変更単位で更新されない。bun test は型検査を行わないため型不整合は typecheck で別途顕在化する
- **再発条件**: pin 型テストが存在する文言・構造・パス・型を破壊的に変更する Case を実行する場合
- **予防策**: (a) 変更対象行の文言を grep し期待値結合テストを事前確認、(b) bun test 3 分割全 green による追随判定、(c) typecheck 併用、(d) structure-migration-followup-checklist.md への pin 型テスト群観点の追記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件 |
| 影響度 | 3/5 | 差し戻し・追加検証の手戻り（検証時の実害。Jev 分布: 水準3 に 0.99） |
| 横展開性 | 3/5 | 配布物 references・構造を編集する Case 全般（類似構成で発生し得る） |
| 反映先明確度 | 4/5 | REQ-019-003 gate（宣言的データ参照）は実装済み（check_test_impact.ts 実測）。pin 型テスト群・typecheck 併用の観点は checklist に未記載（grep 実測） |
| 自動化適性 | 3/5 | 事前 grep・typecheck 併用は部分自動化、gate 観点拡張は容易 |
| プロジェクト固有知識再利用性 | 4/5 | 検査基盤と配布物の同期課題（前回 PC-2 系の継続系統） |
| 再発可能性 | 5/5 | 配布物変更が続く限り構造的・連続発生（Jev 分布: 水準5 に 0.72） |
| 費用対効果 | 4/5 | checklist・手順追記は低コスト |
| **加重合計** | **29/40** | Jev 検証済み（observation 20261004T164150Z-d080。固有知識再利用性は Jev 値から最終判断で水準引き上げ〔semantic_disagreement〕） |

- **推奨処分案**: 5 既存対策の更新（structure-migration-followup-checklist.md・refs 編集手順への pin 型テスト群・typecheck 併用観点の追記。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-04 破壊的構造様式変更で pin 型テスト群 44 fail・同一変更で追随更新 [inbox]
- 2026-10-04 integrity suite の pre-existing fail 3件+error 1件は src/opencode-local 削除の追随漏れ [inbox]
- 2026-10-04 docs 文言期待テスト（anchor テスト）の存在を refs 変更前に grep する手順価値 [inbox]
- 2026-10-05 records-report.test.ts の RecordOccasion 型不整合 tsc error が残存（bun test は pass） [inbox]

### 問題クラス6: traceability sidecar 単一情報源違反（同一 artifact × role 重複）（PC-6）

- **根本原因**: sidecar 追加時に同一 artifact × role の既存宣言（inline 宣言・他 sidecar）を事前確認しない
- **再発条件**: 複数 component にまたがる artifact の対応宣言を sidecar に追加する場合
- **予防策**: sidecar 追加時の事前確認観点（既存宣言検索）。既存手順・検出機構が実在

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 3/5 | check fail・登録先のやり直し（無損失） |
| 横展開性 | 4/5 | sidecar を追加する全工程 |
| 反映先明確度 | 5/5 | agentdev-traceability SKILL.md L35「対応宣言追加前の事前確認」・L52-56 単一情報源優先規則・sidecar-and-policy.md 事前確認節・check の duplicate-inconsistencies 検出が実在（実測） |
| 自動化適性 | 4/5 | 検出は check が機械担保済み |
| プロジェクト固有知識再利用性 | 3/5 | traceability 運用の基礎知識 |
| 再発可能性 | 3/5 | 事前確認手順の適用徹底で低下 |
| 費用対効果 | 3/5 | 既存対策の適用で足りる |
| **加重合計** | **28/40** | |

- **推奨処分案**: duplicate（既存の事前確認手順・単一情報源優先規則・duplicate-inconsistencies 検出機構がカバー。3件とも検出機構が機能し規律どおり解消した事例の記録。観測の新規性は「REQ ID 相違でも検出される」仕様の実証で SKILL.md L56 記述と一致。adversarial-review B1 部分合意: 事前確認の適用徹底観点は PC-16 の traceability 実行手順更新の情報候補へ付記して知見を保存する）

#### エントリ一覧
- 2026-10-03 既存 inline 宣言がある Design への sidecar 登録は duplicate-inconsistencies を招く [inbox]
- 2026-10-03 duplicate-inconsistencies は同一 artifact × role の sidecar 間重複を REQ ID 相違でも検出 [inbox]
- 2026-10-03 同一 artifact × role 重複は component 側への単一情報源統合が必要 [inbox]

### 問題クラス7: 合意入力（draft/RU/合意観測）の時間差陳腐化と適用時再実測（PC-7）

- **根本原因**: draft/RU 実測時点と case-open/case-run 適用時点の間に他 Case の merge が入り、可変メタデータ（frontmatter updated）・fail 構成・採番状態の前提が陳腐化する
- **再発条件**: 並行 Case 運用で draft/RU 作成から適用までの間に同一ファイルへ変更が merge される場合
- **予防策**: 適用時の再実測（canonical 比較・現行 HEAD 再実測・採番衝突検査・対象パス実在検証）の前置。現行規約（canonical Definition 比較）は一部担保するが可変メタデータ系・採番系の明示なし

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 3/5 | 期待値修正対象の誤特定・上書きリスク（機械的割当てで回復） |
| 横展開性 | 3/5 | 並行 Case 運用の case-open/case-run |
| 反映先明確度 | 4/5 | case-open 再実測規律・artifact_actions 適用手順が対象 |
| 自動化適性 | 3/5 | 採番衝突検査・実在検証は自動化可 |
| プロジェクト固有知識再利用性 | 4/5 | 並行運用の構造的リスク知識 |
| 再発可能性 | 4/5 | 並行 Case 運用が続く限り構造的 |
| 費用対効果 | 4/5 | 適用手順への検証前置は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 5 既存対策の更新（case-open artifact_actions 適用手順への採番衝突検査・対象実在検証・可変メタデータ再実測の明示。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-03 REQ-032 frontmatter updated 乖離は case-open 実測時点で解消済み（時間差陳腐化） [inbox]
- 2026-10-03 合意入力時点の pre-existing fail は case-run 実行時点で解消済みの可能性 [inbox]
- 2026-10-04 req-define ドラフトの新設行番号が既存行と衝突（max+1 採番で割当て） [inbox]

### 問題クラス8: checker baseline の provenance 保全・登録欠落（PC-8）

- **根本原因**: baseline 登録・更新経路に provenance 保全と merge 側登録の契約運用が未整備（全量再生成は既存 approved エントリの判断記録を消失させる、REQ 行 merge 側は baseline 登録を行わない、NG baseline が未登録の残存系統がある）
- **再発条件**: baseline 再生成を cap 更新目的で実行する場合、他 Case の REQ 行 merge 後に baseline 未登録で後続 Case が分岐する場合、廃止 REQ 行参照を是正しても NG baseline を登録しない場合
- **予防策**: cap 更新（明示フラグ）と全量再生成の使い分け、merge 側（case-close baseline 手順）での provenance 付き登録、NG baseline 登録の参照是正セット運用

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 3/5 | NG 計上残続・判断記録（provenance）喪失リスク |
| 横展開性 | 3/5 | baseline 運用を持つ checker 系全般 |
| 反映先明確度 | 5/5 | REQ-010-079（baseline は provenance を伴い cap 引上げは明示フラグ経由のみ）が実在（REQ-010.md L53 実測）。case-close baseline 更新手順・IR-055 手順が対象 |
| 自動化適性 | 4/5 | merge 側登録の自動化・再生成の保全確認は実装可能 |
| プロジェクト固有知識再利用性 | 4/5 | baseline 運用の中核知識 |
| 再発可能性 | 4/5 | merge 運用が続く限り反復観測される |
| 費用対効果 | 4/5 | 手順・ツール整備は限定変更で効果大 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 5 既存対策の更新（REQ-010-079 運用の case-close baseline 更新手順への反映・再生成経路の provenance 保全・merge 側登録の規約明示。ギャップ分類: fix gap + application miss）

#### エントリ一覧
- 2026-10-03 REQ-003-055 phantom NG は文言の履歴参照化だけでは解消せず NG baseline 登録が必要 [inbox]
- 2026-10-04 IR-055 baseline 再生成は既存 approved エントリの provenance を喪失させる [inbox]
- 2026-10-05 check_integrity の frontmatter updated ドリフトは他 Case merge 起因で baseline 登録が必要 [inbox]

### 問題クラス9: 既知違反の checker findings 混入と対照実測による由来分離（PC-9）

- **根本原因**: checker findings に baseline 未登録の既知違反（docs/reports の旧 REQ 行参照残骸・無関係 REQ 系 fail）が混入し、--req 限定でも形式検査系（unknown-req-refs 等）は全体出力される仕様の理解と対照実行（main root・baseline 再現）が必要
- **再発条件**: REQ 行廃止・移管時にレポート参照が追随しない場合、全体走査系 checker で対象外の既知 NG が findings に混在する場合
- **予防策**: (a) REQ 行廃止・移管の artifact_actions への参照残存確認追加、(b) unknown-req-refs 等の baseline 登録・分離表示、(c) 対照実行（base で同 check 再実行）による変更起因分離の標準化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 2/5 | 判別手間・誤差し戻しの誘発（証跡としては保全） |
| 横展開性 | 3/5 | traceability check・全体走査系 checker 全般 |
| 反映先明確度 | 4/5 | traceability check 実行手順の結果解釈・baseline 登録が対象 |
| 自動化適性 | 4/5 | baseline 登録・分離表示は checker 改善で自動化可 |
| プロジェクト固有知識再利用性 | 3/5 | checker 運用の実務知識 |
| 再発可能性 | 4/5 | docs/reports 残骸が残る間・全体走査系で反復 |
| 費用対効果 | 4/5 | baseline 登録は一度で継続効果 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 5 既存対策の更新（traceability check 実行手順の結果解釈（completeness と形式検査系の区別）・unknown-req-refs の baseline 登録・廃止時参照残存確認。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-04 REQ-053 系 wave レポート参照が REQ 行廃止・移管時に追随していない可能性（16件継続） [inbox]
- 2026-10-04 無関係 REQ 系の checker fail は対照検証で変更起因から分離する [inbox]
- 2026-10-04 traceability check の --req 指定時も形式検査系 findings は全体スキャンで出力される [inbox]

### 問題クラス10: bun 系ツールの cwd・依存・対象範囲の実行形態規律の未集約（PC-10）

- **根本原因**: bun test（worktree root・./ 付き相対パス）・bun x tsc（package 配下 cwd）・checker（--root 明示）で cwd・依存生成・対象範囲の前提が実行形態ごとに異なり、規律が断片的・未集約
- **再発条件**: worktree root から tsc を実行する場合、worktree 再作成後に依存復元なしで検証する場合、3 cwd 分割で未収録配置（tools 等）を網羅前提にする場合
- **予防策**: bun 系実行手順の cwd・依存前提・未収録配置確認の注記集約（checker 実行契約・bun test 正規形契約へ）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件 |
| 影響度 | 2/5 | 実行失敗・検証漏れは前置で回避可能 |
| 横展開性 | 4/5 | scripts package を持つ skill 領域・typecheck・フル suite 網羅確認全般 |
| 反映先明確度 | 4/5 | checker 実行契約・qg-4-final-acceptance.md「3 cwd 分割実行」節が対象 |
| 自動化適性 | 2/5 | 手順注記が主体 |
| プロジェクト固有知識再利用性 | 4/5 | bun 実行形態の実務規律 |
| 再発可能性 | 4/5 | 実行のたびに効く規律で未集約の間反復 |
| 費用対効果 | 4/5 | 注記集約は低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: 5 既存対策の更新（checker 実行契約・bun test 実行形態契約への cwd・依存前提・未収録配置確認の集約注記。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-03 bun x tsc は package 配下の cwd で実行する必要がある（bun test と逆の cwd 規律） [inbox]
- 2026-10-03 worktree 再作成では node_modules が復元されず bun install 前置が必要 [inbox]
- 2026-10-04 bun test 3 cwd 分割の分割②は src/common/tools/ を含まない（補完実行が必要） [inbox]

### 問題クラス11: 識別子・テーブル構造の暗黙前提による静的データ破壊（PC-11）

- **根本原因**: 同一概念の語彙（記録契機等）を複数モジュールで独立定義し、テーブル列位置を暗黙前提とした正規表現を実装するため、語彙外値の静的破棄・形式追加時の既存列破壊が silently 進行する
- **再発条件**: 識別子を複数モジュールで独立定義し語彙差異検出の機械検査がない場合、複数形式世代が共存するデータへ列位置前提の置換を実行する場合
- **予防策**: 識別子定義の単一モジュール集約（export 共有）または語彙一致機械検査の併設、列特定はヘッダー列名起点、複数形式世代前提の回帰テスト併設（構造化データ操作の設計原則）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 5/5 | 適用済みデータの静的破棄（silent data loss）。未検出のまま永続化すれば記録データの喪失・修正不能な破壊に至る（Jev 分布: 水準5 に 0.93。最終判断は Jev に一致） |
| 横展開性 | 4/5 | 識別子共有・構造化データ操作を持つ実装全般 |
| 反映先明確度 | 4/5 | 対象モジュール（record-comments/epic-reflect/tracking-table）特定済・設計原則としてDesign 化可能 |
| 自動化適性 | 4/5 | 語彙一致テスト・回帰テストは機械検査化済み（本 Case で新設） |
| プロジェクト固有知識再利用性 | 4/5 | 実装パターン原則として高価値（前回 U17 の能力検証分離原則と同系） |
| 再発可能性 | 3/5 | 当該実装は修正済み・回帰テスト新設済み。同型の新規実作成時に反復し得る |
| 費用対効果 | 4/5 | 原則のDesign 記述は低コストで横展開効く |
| **加重合計** | **30/40** | Jev 検証済み（observation 20261004T164150Z-d080） |

- **推奨処分案**: 3 恒久契約候補（Design）（構造化データ操作の設計原則: 語彙一致機械検査・単一定義共有・構造前提の明示。禁止条件フィルタリングゲート適合: 技術判断（静的破壊防止の実装パターン原則）を含む）

#### エントリ一覧
- 2026-10-03 同一概念を複数モジュールで別識別子実装すると静的破棄が silently 起きる [inbox]
- 2026-10-03 列位置前提の正規表現置換はテーブル形式追加時に既存列を破壊する [inbox]

### 問題クラス12: 配布依存境界 link profile gate の worktree 実行構造（PC-12）

- **根本原因**: .opencode/** junction 投影は git 非追跡のため worktree に伝播せず、link profile gate が zero-targets で fail-closed になる
- **再発条件**: worktree で link profile gate を実行する場合（src/common 配下変更を伴う全 case-run）
- **予防策**: junction 投影構成（bun fs.symlinkSync）の前置手順の標準化、zero-targets の無効分類明示、main root 再実行の条件明示

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 3/5 | gate 未実施・fail-closed 停止（無効分類の明示で回復） |
| 横展開性 | 3/5 | link gate を実行する case-run 委譲全般 |
| 反映先明確度 | 4/5 | checker-execution-contracts.md L178-186 に worktree 実行環境ラベル規定が実在。junction 投影構成手順の充実が対象（fix gap） |
| 自動化適性 | 3/5 | 投影構成スクリプトの標準化は自動化可 |
| プロジェクト固有知識再利用性 | 4/5 | worktree gate 実行の中核手順知識 |
| 再発可能性 | 5/5 | worktree 実行が続く限り構造的 |
| 費用対効果 | 4/5 | 手順明記は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 5 既存対策の更新（checker 実行契約 fallback 節への junction 投影構成手順・zero-targets 無効分類の明示。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-04 producer worktree では link gate が構造的に zero-targets になる（無効分類で明示） [inbox]
- 2026-10-04 link profile gate の worktree 実行は junction 投影構成が実務経路 [inbox]

### 問題クラス13: 配布物本文への concrete ID 直書きと解消パターン（PC-13）

- **根本原因**: 配布物本文に REQ 行 ID 等 concrete ID/path を直書きする（対応関係の正は traceability sidecar）
- **再発条件**: 配布物本文へ新規参照を追記する実装を行う場合
- **予防策**: 名称参照 + sidecar 集約の規律（detector が機械担保）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 2/5 | gate 違反は検出・解消ループで完結 |
| 横展開性 | 3/5 | 配布物本文を書く工程 |
| 反映先明確度 | 5/5 | 配布依存境界 Design（distribution-boundary.md L132「配布物本文の記述規則（concrete-id・ADF-COVERS 宣言の本文直書き禁止、traceability sidecar への対応宣言…）」を実測確認）・detector (IR-059) が正確に機能（#42 実証）。エントリ #34 の「issue-operation-safety.md 規律追記済み」記述は grep で確認できなかったが、Design 側に規律の正が実在する（adversarial-review B3 是正） |
| 自動化適性 | 5/5 | detector が機械担保済み |
| プロジェクト固有知識再利用性 | 3/5 | 配布依存境界の解消パターン |
| 再発可能性 | 3/5 | detector があるため検出漏れなし |
| 費用対効果 | 3/5 | 既存規律・ detector で足りる |
| **加重合計** | **26/40** | |

- **推奨処分案**: duplicate（既存規律（distribution-boundary.md L132 実測）と detector の検出→解消 feedback loop がカバー。機能実証の記録）

#### エントリ一覧
- 2026-10-03 E4-1 gate 違反の解消は配布物本文の名称参照化と sidecar 集約で完結 [inbox]
- 2026-10-04 concrete-id 検出は REQ 行 ID の配布物直書きを正確に検出し節名参照で完結 [inbox]

### 問題クラス14: worktree 検証の依存前提に関する実行形態知見（PC-14）

- **根本原因**: なし（問題ではなく実行形態の知見記録。repo-agentdev-integrity scripts は node_modules 同梱で main root 依存生成なしに直接実行可、bun:test + 標準モジュールのみのテストは依存整備不要）
- **再発条件**: worktree 内検証の実行形態選択時
- **予防策**: 依存最小化テスト指針・worktree 検証実行形態の標準化候補

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 2/5 | 検証環境整備の省略効果（正面の知見） |
| 横展開性 | 4/5 | worktree 検証全般 |
| 反映先明確度 | 3/5 | checker 実行契約・worktree 検証手順が対象（標準化候補の段階） |
| 自動化適性 | 3/5 | 実行形態の判別可能な記録とセットで標準化可 |
| プロジェクト固有知識再利用性 | 4/5 | worktree 検証の実務知見 |
| 再発可能性 | 3/5 | 実行形態選択の場面で参照価値 |
| 費用対効果 | 3/5 | 知識文書化は低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: 4 project knowledge（worktree 検証実行形態の知識文書。PC-2 の知識文書へ統合保存候補）

#### エントリ一覧
- 2026-10-03 worktree 内で repo-agentdev-integrity scripts が node_modules 同梱により直接実行可能 [inbox]
- 2026-10-04 worktree の node_modules 未伝播でも bun:test + fs/path のみのテストは動作する [inbox]

### 問題クラス15: coverage と check の役割分担と宣言走査経路の手順化欠落（PC-16）

- **根本原因**: coverage --req は advisory・関係全件列挙であり reqId ごとの design 宣言欠落は check --req の missing-design findings が正、extension yaml・sidecar 経由の宣言走査経路は複数系統ある、という役割分担・網羅手順が手順化されていない
- **再発条件**: 複数行を coverage のカンマ列挙で一括確認し帰着件数のみで欠落判定する場合、extensions 側 ADF-COVERS 宣言を持つ REQ 行を編集する場合
- **予防策**: design 対応事前確認手順への「check --req 併用・coverage は reqId 単位実測帰着」「traceability 配下 sidecar の REQ-NNN 全件検索」の明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 3/5 | missing-design 誤判定（開発工程の誤解釈） |
| 横展開性 | 3/5 | case-open STEP-3・REQ 行参照追随の場面 |
| 反映先明確度 | 4/5 | case-open STEP-3 事前確認手順・agentdev-traceability 実行手順が対象 |
| 自動化適性 | 3/5 | 手順明記が主体（網羅検索の wrapper 化は可能） |
| プロジェクト固有知識再利用性 | 4/5 | traceability 運用の実務手順知識 |
| 再発可能性 | 4/5 | 意味変更行の design 対応確認で都度効く |
| 費用対効果 | 4/5 | 手順追記は低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: 5 既存対策の更新（case-open STEP-3 意味変更行 design 対応事前確認手順・agentdev-traceability SKILL.md 実行手順への追記。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-04 coverage --req の複数行カンマ列挙では design 宣言欠落が判別できず check --req 併用が正 [inbox]
- 2026-10-04 traceability check の extensions yaml 走査経路は manual rg では検出しにくい [inbox]

### 問題クラス16: 配布依存境界 gate の baseline 比較運用の未文書化（PC-17）

- **根本原因**: baseline 退避物（ok/failures/stats 形式）と delta 検査用 BaselineFile（entries 形式）の役割分離（退避=比較証跡、BaselineFile=delta 入力）と、比較判定基準（failures 一致 + 分類層一致。scanned 差は環境差で変動）が文書化されていない
- **再発条件**: baseline 退避物を --delta に渡す場合、scanned 件数差のみで合否判定する場合
- **予防策**: checker 実行契約・配布依存境界 Design の運用注記への明記（--delta 入力形式・退避物比較経路・判定基準）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 2/5 | 比較手段の誤りはエラーで気づく（cannot load baseline） |
| 横展開性 | 3/5 | gate baseline 比較を実施する case-run/case-close |
| 反映先明確度 | 4/5 | checker 実行契約・distribution-boundary Design が対象 |
| 自動化適性 | 3/5 | 判定基準の明文化・比較 wrapper 化は可能 |
| プロジェクト固有知識再利用性 | 3/5 | gate 運用の実務知識 |
| 再発可能性 | 4/5 | baseline 比較のたびに効く |
| 費用対効果 | 4/5 | 注記明記は低コスト |
| **加重合計** | **25/40** | |

- **推奨処分案**: 5 既存対策の更新（checker 実行契約・配布依存境界 Design の運用注記。ギャップ分類: fix gap）

#### エントリ一覧
- 2026-10-04 gate の base ベースライン比較は failures 数一致を判定基準にし scanned 差を不合格根拠にしない [inbox]
- 2026-10-04 gate の baseline 退避物と delta 検査用 BaselineFile は形式非互換 [inbox]

## 未分類（単発 22 単位）

8軸は代表軸の要点のみ記載（全軸の根拠は各エントリ本文）。

| 単位 | エントリ | 8軸要点 | 推奨処分案 |
|---|---|---|---|
| U1 | 2026-10-03 REQ 行変更 Definition PR の索引再生成は REQ commit 後に実行（計測日導出） | 23/40。generate_indexes の計測日が REQ 群 commit から導出される設計と commit 前後の実行順序が手順未明文化。追補候補（definition-pr-and-idempotency.md 手順 2.5）が具体的 | 5 既存対策の更新 |
| U2 | 2026-10-03 draft target_design パスが実在パスと不一致（ドメイン誤記） | 23/40。合意前の target 系パス実在検証（ファイル存在・Design インデックス slug 突合）が上流（req-define）にない。PC-7 と同じ「合意入力の検証前置」系統（adversarial-review A3 限定: 根因は合意前の検証欠落で PC-7 の合意後陳腐化とは別だが、予防策・成果物が同一のため PC-7 成果物へ統合） | 5 既存対策の更新（PC-7 成果物へ統合） |
| U3 | 2026-10-03 yomiyasu lint の表行は構造保護で char_count 0（セル抽出が必要） | 20/40。単発・lint 運用知見。yomiyasu skill 手順への追記候補 | 6 deferred |
| U4 | 2026-10-03 issue_list の labels フィルタは role・バッチ識別に使えない | 22/40。issue-operation-safety.md L111 が labels 使用規律（Case 絞り込みは search+state）を明記済み（実測）。物理ラベル不揃いの観測は既存規律の適用実証 | duplicate |
| U5 | 2026-10-03 checker 実行経路の ESM 互換性は checker 個別に異なる（node 非対応は bun 経由） | 23/40。checker-execution-contracts.md「安定実行経路」への実機制約（require 残存・Bun.YAML 依存）明記候補。前回 U2 の累積観測（traceability check・check_changed_docs） | 5 既存対策の更新 |
| U6 | 2026-10-03 IR-055 warning 総数 ratchet の計数対象の構成は checker 実測対照でしか確定できない | 21/40。checker-execution-contracts.md への実行面追記は補完済み（entry 記述）。integrity-contracts.md 側の明文化が望ましいが単発 | 6 deferred |
| U7 | 2026-10-03 third-party 取得機構経由の配置は IR-068 登録と exemptions 登録の 2 段構成が必要 | 22/40。登録手順の知見。反映先（IR-068 運用・third-party-sync 契約）は実在するが単発 | 6 deferred |
| U8 | 2026-10-03 git worktree remove の Filename too long 部分失敗は robocopy /MIR 手順で解消（実用実績） | 22/40。worktree-operations.md L459-468 に robocopy /MIR フォールバック手順が実在（実測）。当該手順の適用実績記録 | duplicate |
| U9 | 2026-10-03 branch が複数コミット構成だと git cherry による squash merge 判定が非等価になる | 23/40。複数コミット構成では「変更範囲限定 + 変更ファイル内容一致（diff 空）」で判定する手順が具体的。worktree クリーンアップ（branch -D 前確認）手順への追記候補 | 5 既存対策の更新 |
| U10 | 2026-10-03 spawnSync 型 timeout 境界の環境変動が suite fail 由来分類を複雑化させる | 22/40。既存知識文書（windows-bun-test-spawn-timeout-classification.md）が由来分類を所有。RA-012（#3355）影響範囲へ check_integrity.test.ts 内 timeout 15000ms の確認事項追加を推奨 | 5 既存対策の更新 |
| U11 | 2026-10-03 yomiyasu lint 実行経路は extension rule の標準入力規定と Windows 破損回避指針が緊張する | 24/40。extension rule（REQ-098）が POSIX 標準入力前提で Windows 代替経路（ファイル引数+検査後削除）未定義（rule 文面を実測）。rule 改訂候補が具体的 | 5 既存対策の更新 |
| U12 | 2026-10-03 git push が credential helper（GCM）の対話待ちでハングする | 24/40。git-noninteractive-auth.md が gh 橋・GCM 併存を記載（実測）するが push 限定の credential.helper 上書き contingency は未記載（「ハング」の記述なし）。Windows git 知識の追補候補が具体的 | 5 既存対策の更新 |
| U13 | 2026-10-03 MSYS bash 経由の cmd //c mklink /J は引数が渡らず対話プロンプトで終了する | 21/40。worktree-operations.md L151-159 は node fs.symlinkSync 標準・mklink cwd 基準の注意を明記済み（実測）。標準手段の適用で当該失敗経路は回避される | duplicate |
| U14 | 2026-10-03 case-run 側で配布依存境界 checker の記録が PR 検証差分に欠落し E4-1 で初検出 blocked | 23/40。case-run STEP-S5 の checker 実行記録を PR 品質メトリクス表の必須行とする追補候補が具体的 | 5 既存対策の更新 |
| U15 | 2026-10-03 Epic の事前記録マージ順序を守った Wave 1 rebase コンフリクトは和集合で解消 | 21/40。重複許可 Wave 構成の定型的競合と Level 1 和集合解消の観察記録。Epic 構成ガイド追記候補 | 6 deferred |
| U16 | 2026-10-04 bash heredoc 経由のスクリプト書込みはバックスラッシュが転送層で消費される | 23/40。worktree-operations.md 破損回避節（2技法）は argv escape と heredoc 打ち切りの2機構のみで「quoted heredoc でもバックスラッシュ保護されない」は未記載（実測）。知識文書・同節への追補候補 | 5 既存対策の更新 |
| U17 | 2026-10-04 .agentdev 配下 domain state が untracked 残留し Form Zero が成立しない | 24/40。保存系 workflow の「保存と同時の明示パス commit」規律・次工程入口の untracked 検出の追加候補が具体的 | 5 既存対策の更新 |
| U18 | 2026-10-04 case-open 委譲指示の cleanup 権限記述が現行契約と乖離（REQ-030-007） | 22/40。委譲 prompt テンプレートから case-open 所有でない cleanup 権限文言の除去候補が具体的 | 5 既存対策の更新 |
| U19 | 2026-10-04 bun test 1.3.6 のパスフィルタはサブストリングマッチで類似パスを実行対象に選択し得る | 21/40。bun 実行形態の注意（パス指定存在確認・件数突合）。PC-10 系の累積観測だが単発 | 6 deferred |
| U20 | 2026-10-04 realization_actions が reference 専列挙のとき SKILL.md 制御平面の重複記述が追随漏れになり得る | 22/40。SKILL.md 制御平面と reference の同概念記述横断突合観点の追加候補。単発 | 6 deferred |
| U21 | 2026-10-03 LongPathsEnabled 有効環境では Filename too long 部分失敗が再現しない（robocopy 手順の検証構成） | 20/40。環境設定（LongPathsEnabled=0x1）で挙動が変化。再現検証は「手順の対象となる失敗状態を作ってから手順を実行する」構成で実測し環境ラベルを実測根拠へ付記。robocopy 手順本体は worktree-operations.md L459-468 がカバー（U8 と同一）だが検証構成の知見は既存節に未記載 | 6 deferred |
| U22 | 2026-10-04 Windows で PowerShell cmdlet 経由の一括編集を行わず node readFileSync/writeFileSync を使った実績（予防的遵守の実績記録） | 20/40。問題事象なし。AGENTS.md 規律（PowerShell 標準 cmdlet 経由の一括読み書き回避）と docs/knowledge/windows-powershell-bulk-io-corruption.md が既存カバー。遵守実績の記録 | duplicate |

## 判定集計（STEP-5 判定確定準備・adversarial-review 是正後の確定値）

エントリ総数 71 の内訳（staged 55 + deferred 7 + duplicate 9 = 71）:

- **promote（staged）**: 55エントリ
  - 「5 既存対策の更新」: 40エントリ = 問題クラス PC-1(4)・PC-3(3)・PC-5(4)・PC-7(3)・PC-8(3)・PC-9(3)・PC-10(3)・PC-12(2)・PC-16(2)・PC-17(2) の計29 + 単位 U1・U2・U5・U9・U10・U11・U12・U14・U16・U17・U18 の11
  - 「4 project knowledge」: 13エントリ = PC-2(5)・PC-4(6)・PC-14(2)
  - 「3 恒久契約候補（Design）」: 2エントリ = PC-11(2)
- **deferred（6）**: 7件 = U3（yomiyasu 表行）・U6（IR-055 ratchet 構成）・U7（third-party 2段構成）・U15（Wave 和集合）・U19（bun test パスフィルタ）・U20（SKILL.md 重複追随）・U21（LongPathsEnabled 再現検証構成）
- **duplicate**: 9件 = PC-6(3)・PC-13(2)・U4（issue_list labels）・U8（robocopy 実用実績）・U13（mklink）・U22（PowerShell 遵守実績）
- **rejected（7）**: 0件

### 採用済み成果物の統合案（STEP-6 で生成。この段階では未生成）

| 成果物名（案） | 判定単位 | 処分区分 |
|---|---|---|
| existing-measure-update-extension-rules-prefetch | PC-1 | 5 |
| project-knowledge-worktree-env-fail-classification | PC-2, PC-14 | 4 |
| existing-measure-update-reporoot-worktree-coupling | PC-3 | 5 |
| project-knowledge-windows-checker-observation | PC-4 | 4 |
| existing-measure-update-test-expectation-pin-followup | PC-5 | 5 |
| existing-measure-update-stale-input-reverification | PC-7, U2 | 5 |
| existing-measure-update-baseline-provenance | PC-8 | 5 |
| existing-measure-update-traceability-interpretation | PC-9, PC-16 | 5 |
| existing-measure-update-bun-execution-contracts | PC-10, U5 | 5 |
| existing-measure-update-link-gate-worktree | PC-12 | 5 |
| existing-measure-update-gate-baseline-comparison | PC-17 | 5 |
| design-candidate-structural-data-identifiers | PC-11 | 3 |
| existing-measure-update-worktree-cleanup-verification | U9 | 5 |
| existing-measure-update-spawn-timeout-followup | U10 | 5 |
| existing-measure-update-yomiyasu-windows-path | U11 | 5 |
| existing-measure-update-git-push-gcm-contingency | U12 | 5 |
| existing-measure-update-case-run-record-completeness | U14 | 5 |
| existing-measure-update-heredoc-backslash | U16 | 5 |
| existing-measure-update-form-zero-persistence | U17 | 5 |
| existing-measure-update-delegation-prompt-contract | U18 | 5 |
| existing-measure-update-index-regen-order | U1 | 5 |

（staged 55件は上記成果物群へ割当。U2 は PC-7 成果物へ、U5 は PC-10 成果物へ統合計上）

## promote 時 prune 結果

- **対象エントリ数**: 71件（inbox 71 + deferred 再評価対象）
- **prune実施**: 未実施（STEP-6 は parent 排他枠待ち。本レポート確定後に deferred 移動・prune・commit/push を実施する）
- **prune予定**: duplicate 9件（PC-6: 3件、PC-13: 2件、U4/U8/U13/U22）および staged 55件（採用済み成果物生成後に「元learning item/ 根拠」へ証拠保存して除去）
- **prune却下**: なし

## 全体傾向

- **高頻出・高影響の問題クラス**: PC-4（bash 経由 checker 観測の形式誤り、6件・29/40）と PC-2（worktree 管理外依存未伝播、5件・31/40）が最大系統。PC-11（静的データ破壊、2件・30/40・影響度5）は件数小だが潜在被害が最大。case-open〜case-close の実行・検証運用の知見が 2026-10-03〜05 の集中実行で大量蓄積した
- **横展開性が高い問題クラス**: PC-2（worktree 運用全体）・PC-4（全 checker 観測）・PC-3（repoRoot 系テスト）・PC-5（pin 型テスト全般）
- **自動化適性が高い問題クラス**: PC-5（事前 grep・gate 観点拡張）・PC-8（merge 側 baseline 登録）・PC-9（baseline 登録・分離表示）・PC-13（detector 済み・実証）
- **全体的な観察所見**: (a) 前回 promote で指摘した主題（テスト期待値同期・spawn timeout・gh 系）の継続観測に加え、worktree 並列実行に起因する環境差 fail の由来分類運用が定着しつつある（PC-2/PC-3/PC-9）。(b) yomiyasu/extension 系の書込み前適用漏れが 4 件の独立委譲で再現し、構造的リスクとして確定した（PC-1）。(c) baseline の provenance 保全・登録が 3 系統で共通課題として浮上した（PC-8）。(d) 既存対策（traceability sidecar 事前確認・robocopy 手順・labels 規律・symlinkSync 標準・concrete ID 規律）が機能した事例は duplicate として整理し、知識の重複昇華を避けた

## deferred 反映先実在性確認（STEP-3 手続き4）

今回の新規 deferred 判定 7 単位の `想定反映先` と、既存 deferred の要再評価備考について実測確認した。

| 対象 | 想定反映先 | 実測結果 |
|---|---|---|
| U3（yomiyasu 表行） | yomiyasu skill 運用・lint 手順 | .opencode/skills/yomiyasu/ 実在（AGENTS.md・extension rule が参照） |
| U6（IR-055 ratchet 構成） | integrity-contracts.md | docs/designs/integrity/integrity-contracts.md 実在（designs 一覧実測） |
| U7（third-party 2段構成） | third-party-sync 契約・IR-068 運用 | agentdev-workflow-third-party-sync 実在・IR-068 は integrity-rule-catalog 系で実在 |
| U21（LongPathsEnabled 検証構成） | worktree-operations.md 検証構成注記 | src/common/skills/agentdev-git-worktree/references/worktree-operations.md 実在（robocopy 節 L459-468 実測。環境ラベル・検証構成の記述は未確認のため deferred で知見保持） |
| U15（Wave 和集合解消） | case-ready Wave 構成・case-auto Level 1 手順 | agentdev-workflow-case-ready / case-auto の references 実在 |
| U19（bun test パスフィルタ） | bun 実行形態契約 | checker-execution-contracts.md 実在 |
| U20（SKILL.md 重複記述追随） | docs-check 系検査観点・case-run 完了条件横断突合 | repo-agentdev-integrity scripts 実在 |
| 既存 deferred 2件の「agentdev-doc-writing 不在」備考（L258/L338） | 現行化または廃棄の確定 | 当該スキルは不在（実測）。旧参照の REQ-0153 は現行 docs に不存在（`ls docs/requirements/ \| grep -c 0153` = 0、`grep -rln REQ-0153 docs/` 0件）のため参照として採用しない。実測確認された現行の実在先は docs/knowledge/grep-zero-criteria-legacy-term-quotation.md、agentdev-quality-gates（qg-3-implementation-deviation.md・qg-4-final-acceptance.md）、agentdev-workflow-case-close issue-resolution-and-qg4.md。機械置換規則（mechanical-replacement-rules.md）は src/docs 全域で不在のため現行所有先未確定。判定: 反映先候補を実在確認済みの上記3系統へ現行化し、機械置換規則側の行き先は未確定として deferred 側に不確実性を保持する（実在しない参照を掲げない）。エントリ自体は知見価値が残るため deferred 継続（prune しない） |

## Decision候補除外記録

- **対象item**: 全判定単位（PC-1〜PC-17・U1〜U21）
- **除外理由**: 技術判断不在（本報告の知見は手順追記・既知事象の追補・知識文書化・設計原則の候補整理が主体。PC-11 は Design 候補として扱い Decision から除外）。恒久契約への直接確定は行わず、req-define → case 経路で確定される
- **根拠事実**: 各エントリの Decision/REQ/spec影響フィールドが「なし」と記録されているか、Design 追記履行（REQ-101-005 委譲事項）など契約内処理。例外は PC-11（設計原則）で 3 Design 候補として振り分け
- **代替反映先候補**: 各問題クラスの推奨処分案・成果物統合案のとおり（workflow references・checker 実行契約・docs/knowledge・Design）

## review（adversarial-review）結果

- **発動条件判定**: 発動（default-on。evaluation-report.md 反映済み、skip 条件〔inbox 空／1件のみで重複確実〕非該当。件数計数は機械導出値 71 件。Jev 事前評価も発動 true 0.94〔observation 20261004T164150Z-d080〕）
- **review 戦略**: 対象 = evaluation-report.md（分類・8軸・処分案）。2系統の独立 stream（A: 知見活用者視点〔backlog-review/req-define 消費観点の分類過不足〕、B: 保守者視点〔prune による知見損失・誤 duplicate・証拠性〕）で challenge → counter-challenge → convergence → convergence audit を実施
- **finding と処置（統合・duplicate 整理後）**:
  - A4/A6/B6（集計数値の不整合）: accepted（修正）。判定集計を staged 55 / deferred 7 / duplicate 9 = 71 へ是正し、prune 予定・成果物統合案の数値を一致させた
  - A3（U2 と PC-7 の根因相違）: 限定（accepted）。U2 の根因は合意前検証欠落で PC-7（合意後陳腐化）と別だが予防策・成果物が同一のため統合維持とし、記載に根因の違いを明記
  - B1（PC-6 duplicate の適用徹底観点の保存）: 部分合意（accepted）。PC-16 成果物の情報候補へ付記することで知見保存を担保
  - B3（PC-13 既存規律の未実測）: accepted（是正）。grep 実測の結果、issue-operation-safety.md には規律を確認できず、distribution-boundary.md L132 に規律の正を実在確認。判定根拠を訂正のうえ duplicate 維持
  - B5/A 系（Jev 改訂スコアの反映）: accepted。PC-1（29→26）・PC-5（31→29）・PC-11（影響度 4→5・再発 4→3、合計 30 維持）を反映
  - 撤回: A1（U3 と PC-4 の統合提案 — 根因が別で正しく分離されている）、A2（U12 と前回 PC-1〔gh exit 66〕の同根因疑い — harness spawn 劣化と credential helper 対話待ちで機構が別）、A5（PC-3 の 5 区分帰属疑い — 既存テストの不備は fix gap として 5 に帰属可能）、B2（U4 duplicate 根拠 — L111 実測で強固）、B4（PC-2 の 5 区分への変更案 — 契約の存在と由来分類手順の知識は別物で docs/knowledge が正しい昇華先。Jev 0.94 も一致）
- **戻しループ**: accepted finding の反映は集計・注記・根拠訂正レベルで、分類構造と処分区分の意味内容は不変のため再 review 発動条件（新たな本質的争点）非該当。停止条件（新 finding なし・全 finding 処理済み・unresolved なし）を満たし離脱
- **unresolved**: なし（ユーザー判断事項・blocker なし）

## 自律確定記録（STEP-5）

- **自律確定範囲**: 全判定単位（PC-1〜PC-14・PC-16・PC-17・U1〜U22）の処分判定を自律確定した（staged 55〔5 区分 40・4 区分 13・3 区分 2〕・deferred 7・duplicate 9・rejected 0）
- **HITL 不要理由（主要根拠）**: (a) 各判定は処分区分基準と既存対策照合の実測証拠（grep・ファイル実在・行番号）から正規契約に従って導出可能であり、委譲された裁量の範囲を超えない。(b) duplicate 判定 9件は全て実測確認済みの既存対策（worktree-operations.md robocopy 節 L459-468・symlinkSync 標準 L151-159、agentdev-traceability SKILL.md L35/L52-56、issue-operation-safety.md L111、distribution-boundary.md L132 + IR-059 detector、AGENTS.md PowerShell 規律 + docs/knowledge/windows-powershell-bulk-io-corruption.md）による被覆が確実。(c) 破壊的変更（inbox 全体強制クリア・大量一括削除）に該当しない（通常の原子的移動・prune 手順の範囲）。(d) 恒久契約への直接確定を行わず candidate 止まり（PC-11 も Design「候補」）で、docs/knowledge 直接保存も backlog-review の利用者承認という下流 HITL が残る。したがって本 workflow 段階で人間判断への引き上げ条件に該当する項目はない
- **STEP-6 への引き継ぎ**: 判定確定済みのため STEP-6（採用済み成果物生成・deferred 移動〔deferred 7件追記・L258/L338 の反映先現行化〕・prune〔staged 55 + duplicate 9〕・`git pull --ff-only` → 明示パス commit `chore(agentdev): promote learning findings` → push）は追加確認なしで実行可能。本実行は backlog-auto stage 2 の parent 排他枠待ちで STEP-6 直前に一時停止している（キュー引き継ぎであり新規 HITL や workflow 失敗ではない）
- **判定確定の証跡**: 本節（自律確定記録）と Jev 観測（20261004T164150Z-d080・最終判断反映済み）、永続化成果物（STEP-6 実施後の promoted/・クリア済み inbox.md・追記済み deferred.md）の双方から再構成できる
