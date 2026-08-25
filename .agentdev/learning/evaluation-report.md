# 評価レポート

## メタデータ
- **実行日時**: 2026-08-22 17:15
- **対象エントリ数**: 35件（inbox: 35件, deferred: 59件）
- **問題クラス数**: 10（未分類含む: 11）

## 問題クラス一覧

### 問題クラス1: AUTOGEN 索引再生成の発火要因把握不足（A1）

- **根本原因**: AUTOGEN 索引は generate_indexes.ts が単一生成源であり、SPEC の行数・status を変える操作（docs-only 変更、case-close の昇格、生成元の正規化）は発火主体を問わず索引差分を生む。各工程が自分の操作が発火要因になることを認識せず再生成を commit していない
- **再発条件**: SPEC 行数・status を変える変更で、当該工程が PR 作成前（または昇格後）の dry-run 差分確認と再生成 commit を実施しない場合
- **予防策**: case-run の PR 作成手順へ dry-run 前置、case-close の SPEC 確定フローへ昇格後 dry-run 再実行・差分は引継ぎ報告、AUTOGEN 表変更は「生成元正規化 → 再生成 → 差分精査」を標準手順化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（PR 2253、Epic 2205 昇格、PR 2375） |
| 影響度 | 4/5 | Epic Wave クローズ停止・後段 block を生む |
| 横展開性 | 3/5 | AUTOGEN 生成物を持つプロジェクト全般 |
| 反映先明確度 | 4/5 | case-run PR 作成手順、case-close SPEC 確定フロー |
| 自動化適性 | 4/5 | dry-run は機械実行可、手順への組み込みのみ |
| プロジェクト固有知識再利用性 | 4/5 | generate_indexes.ts 運用の中核知見 |
| 再発可能性 | 4/5 | 発火要因は日常操作（docs-only 変更・昇格） |
| 費用対効果 | 4/5 | dry-run 前置は低コスト高効果 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 既存 command/skill へ反映（case-run、case-close 手順）

#### エントリ一覧
- docs-only SPEC 変更で AUTOGEN block 索引の再生成 commit 欠落（PR 2253） [inbox]
- case-close の SPEC 昇格（draft → accepted）は spec-health-metrics AUTOGEN 差分を生む（Epic 2205） [inbox]
- 2026-08-22: AUTOGEN 表は生成元を正規化して再生成する（PR 2375） [inbox]

### 問題クラス2: base drift — PR 検証 base とマージ時点 main の状態乖離（A2）

- **根本原因**: PR 検証・再生成は検証時点 base への絶対判定であり、並行マージ（他 PR、生成器の導出規則変更）が checker・AUTOGEN 状態を変化させ得る
- **再発条件**: PR 検証からマージの間に、checker 違反を増やす他 PR または導出規則変更が main へマージされる場合
- **予防策**: case-close の post-merge（main）checker / dry-run 再実行を base drift 検出の実効手段として維持し、AUTOGEN 再生成を含む OPEN PR は規則変更コミットの base 包含を確認する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（PR 2260、PR 2270） |
| 影響度 | 4/5 | マージ後 main の NG が Wave クローズを阻害 |
| 横展開性 | 3/5 | 並行マージ運用のプロジェクト全般 |
| 反映先明確度 | 4/5 | case-close Epic Wave クローズ E4、post-merge 検証 |
| 自動化適性 | 4/5 | post-merge 再実行は機械可 |
| プロジェクト固有知識再利用性 | 3/5 | 生成器規則変更の横断は本リポジトリ固有局面 |
| 再発可能性 | 4/5 | 並行開発が続く限り構造的に再発 |
| 費用対効果 | 4/5 | post-merge 検証は既存手順の徹底 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 command へ反映（case-close post-merge 検証手順。E5b 前段 gate・autogen-freshness-gate は既存）

#### エントリ一覧
- PR 検証時 base とマージ時点 main の checker NG 状態が乖離する（base drift、PR 2260） [inbox]
- 2026-08-21: 計測日導出規則変更を跨いだ OPEN PR の AUTOGEN 計測日が新規則 dry-run で WOULD UPDATE（PR 2270） [inbox]

### 問題クラス3: worktree 環境の依存解決・環境前提変動（B）

- **根本原因**: git worktree は追跡ファイルのみ展開し、node_modules（gitignore・非追跡）は伝播しない。bun install 成果物の有無・junction 有無がテスト実行結果・件数・pre-existing fail 構成を環境依存で変動させる
- **再発条件**: worktree・fresh checkout で依存解決（bun install、node_modules コピー）を前置せずテスト・検査を実行する場合
- **予防策**: worktree テスト実行手順への bun install 前置・投影構成 node_modules コピーの明示、検証記録への環境ラベル（junction 有無・node_modules 有無）添付

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 5/5 | 5件（PR 2261×2系、PR 2265、PR 2356、PR 2368 tsc 側面） |
| 影響度 | 3/5 | 大量 fail・誤帰属の原因になるが手順で回復可 |
| 横展開性 | 2/5 | worktree + bun 構成のプロジェクト限定 |
| 反映先明確度 | 4/5 | git-worktree、case-run 検証手順 |
| 自動化適性 | 3/5 | bun install 前置は半自動、ラベル記録は手順 |
| プロジェクト固有知識再利用性 | 5/5 | 本リポジトリの実行環境中核知見 |
| 再発可能性 | 5/5 | worktree を使う限り毎回直面 |
| 費用対効果 | 4/5 | 前置手順の明記は低コスト |
| **加重合計** | **31/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-git-worktree、case-run 検証手順）

#### エントリ一覧
- untracked な bun install 成果物（scripts/node_modules）が worktree フルスイートで順序依存失敗（PR 2261） [inbox]
- bun install 成果物のサードパーティ README が実配布物スキャンに引っかかる（PR 2262） [inbox]
- full suite の pre-existing fail 構成が baseline 表記と環境実測で乖離（PR 2265） [inbox]
- 2026-08-20: worktree の scripts ディレクトリは node_modules 未解決で開始し bun test が大量 fail（PR 2356/2355） [inbox]
- 2026-08-21: worktree の tsc --noEmit 検証は投影構成の node_modules コピーを前置（PR 2368） [inbox]

### 問題クラス4: bun test 実行形態の標準形（C）

- **根本原因**: bun test のテスト発見は cwd 基準の再帰走査で、隠しディレクトリ（.opencode/）・ネスト package.json 境界・`./` prefix の解釈が実行形態で変わり、拾い上げ対象と件数が変わる
- **再発条件**: 対象ディレクトリを明示しない、または `./` prefix なしの相対パスで bun test を実行する場合
- **予防策**: 正規形（`./` prefix 付きディレクトリ明示）と 3 cwd 分割実行（ルート、.opencode/plugins、repo-agentdev-integrity/scripts）の標準化、環境ラベル付き件数突合

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（PR 2261、PR 2283/2284、PR 2368） |
| 影響度 | 3/5 | 拾い漏れは suite green の誤認を生む |
| 横展開性 | 2/5 | bun + 本リポジトリ構成固有 |
| 反映先明確度 | 4/5 | quality-gates（AG-035 運用）、case-run/case-close 手順 |
| 自動化適性 | 3/5 | 正規形の固定は手順、件数突合は機械可 |
| プロジェクト固有知識再利用性 | 5/5 | full integrity suite 運用の中核 |
| 再発可能性 | 4/5 | 手順未明記のまま再実行され得る |
| 費用対効果 | 4/5 | 正規形統一は反復コスト削減大 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 skill へ反映（agentdev-quality-gates の full integrity suite 運用）

#### エントリ一覧
- projection/source 構成差が Ran N tests の N/M 件数突合を環境間でずらす（PR 2261） [inbox]
- bun test の実行 cwd によって隠しディレクトリ・ネスト package 配下の拾い上げが変わる（PR 2283/2284） [inbox]
- 2026-08-21: worktree で bun test に ./ prefix なしの相対パスを渡すと filters did not match（PR 2368） [inbox]

### 問題クラス5: 配布依存境界 gate の PR 作成前実行徹底（D）

- **根本原因**: 配布物（src/opencode/**）は producer 内部 ID（REQ/DEC/TS/UC 等）・自己ホスト文書構造（docs/designs パス）を参照できない。gate（check_distribution_boundary.ts）は存在するが case-run の品質統制での実行が必須化されておらず、省略すると違反が case-close 最終 gate で初検出され Wave クローズが部分停止する
- **再発条件**: 配布物変更 PR で case-run が gate を実行せず PR を作成した場合
- **予防策**: case-run の品質統制・PR 作成手順へ「配布物変更時の check_distribution_boundary.ts --profile source 実行」を必須ステップとして明示。新規配布スキル作成時のコメント・description 規約（ドメイン語で表現）も併記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 4件（PR 2281、PR 2341、PR 2355/2356、PR 2375） |
| 影響度 | 4/5 | Wave 部分停止・マージ中止の実害（Epic 2307） |
| 横展開性 | 3/5 | 配布物を持つプラグイン開発全般 |
| 反映先明確度 | 5/5 | case-run 品質統制・PR 作成手順に特定済 |
| 自動化適性 | 4/5 | gate 自体は機械実行、実行を必須化するのみ |
| プロジェクト固有知識再利用性 | 4/5 | 配布依存境界（REQ-029、DEC-014）運用中核 |
| 再発可能性 | 4/5 | 習慣（ID をコメントへ書く）が根強い |
| 費用対効果 | 5/5 | gate 実行の徹底のみで Wave 停止を予防 |
| **加重合計** | **33/40** | |

- **推奨処分案**: 既存 command へ反映（case-run 品質統制。PR 2355/2356 では予防策が機能した実績あり = application miss の解消）

#### エントリ一覧
- 配布物本文への内部 ID 直書きは distribution boundary gate で blocking（PR 2281） [inbox]
- 配布物変更 PR で case-run が gate を省略すると concrete-id 違反が case-close 最終 gate 初検出（PR 2341、Epic 2307 Wave 部分停止） [inbox]
- 2026-08-20: 新規配布スキル scripts のコメント・description への producer 内部 ID 埋め込みが同 Wave 両 PR で連続発生（PR 2355/2356、gate は PR 作成前に検出・修正） [inbox]
- 2026-08-22: 配布物への横断是正では Design パス参照・具体 DEC-NNN 記述が IR-055 の新規違反になる（PR 2375） [inbox]

### 問題クラス6: 機械置換・横断是正の対象設計漏れ（E）

- **根本原因**: 機械置換は識別子（トークン）単位と文字列置換の複数系統で運用され、行再構成（一文一行分割）や正規表現リテラル内パス文字列は対象設計から漏れる。old 文字列の転写ミスは MISS 印字で検出可能だが中断時に見逃される
- **再発条件**: 大量ファイルへの一括置換・識別子リネームで、old 側の grep 実在確認・MISS 印字確認・リテラル内パスの別 grep をせずに進める場合
- **予防策**: 機械置換手順へ「old 側 grep 実在確認」「MISS 印字の逐次確認」「リテラル内パス・パターン文字列の別系統 grep」を組み込む。X-4 と IR-055 exempt の相互作用は delta 増加時の行移動由来確認で対処

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（PR 2275、PR 2280、PR 2350） |
| 影響度 | 3/5 | 取り残し・baseline 誤差は局所、検出不能化は重大（check_test_impact） |
| 横展開性 | 3/5 | 機械置換を運用するプロジェクト全般 |
| 反映先明確度 | 4/5 | case-run 委譲時手順、doc-writing 機械置換規則 |
| 自動化適性 | 3/5 | grep 確認は半自動、MISS 確認は手順 |
| プロジェクト固有知識再利用性 | 4/5 | 横断是正 PR の反復運用知見 |
| 再発可能性 | 4/5 | 横断是正は今後も反復実施 |
| 費用対効果 | 4/5 | 確認手順の追加は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 skill/command へ反映（doc-writing 機械置換規則、case-run 機械置換手順）

#### エントリ一覧
- X-4 一文一行分割が IR-055 の {...} 行 exempt 判定を移動させ baseline delta 警告を増やす（PR 2275） [inbox]
- 機械置換スクリプトの old 側転写ミスは MISS 印字を残して中断時に見逃される（PR 2280） [inbox]
- 2026-08-20: 機械置換の境界設計におけるトークン境界保護と識別子リネーム時のリテラル内パス漏れ（PR 2350） [inbox]

### 問題クラス7: 検証網羅性 — サブセット green と手書き検収の限界（F）

- **根本原因**: 並列 Wave の個別 worktree は他 PR の変更を含まないため、サブセットテストの green がマージ後の全体 green を保証しない。大規模エントリの定形項目網羅は手書きでは保証できない
- **再発条件**: 新規配布物を追加する PR でフル integrity suite を実施せずマージする場合、および定形項目を多数含む成果物を機械検収なしで検収する場合
- **予防策**: 配布物追加 PR の品質統制へフル suite（少なくとも check_integrity.test.ts）必須化、監査レポート等の機械検収（ラベル存在の正規表現検査）、delta NG 集計の証拠源活用

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（Epic 2351、PR 2374×2） |
| 影響度 | 4/5 | マージ後 main 赤固定・監査品質の構造的リスク |
| 横展開性 | 3/5 | 並列開発・大量定形項目のプロジェクト全般 |
| 反映先明確度 | 4/5 | case-run 品質統制、監査検収手順 |
| 自動化適性 | 4/5 | フル suite・機械検収は機械実行 |
| プロジェクト固有知識再利用性 | 3/5 | suite 構成は本リポジトリ固有 |
| 再発可能性 | 4/5 | 並列 Wave 運用が続く限り構造的 |
| 費用対効果 | 4/5 | suite 実行時間対リスク低減は妥当 |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存 command へ反映（case-run 品質統制、検証手順）

#### エントリ一覧
- 2026-08-20: フル integrity suite 未実施のままマージされた新規配布物追加 PR で IR-055 delta 違反がマージ後 main で初検出（PR 2355、Epic 2351） [inbox]
- 2026-08-22: 大規模監査レポートのエントリ完全性は手書きでは欠落しやすい（PR 2374、機械検収で7件補完） [inbox]
- 2026-08-22: 機械検査（check_integrity）の delta NG 集計は観点V10の証拠源として有効（PR 2374） [inbox]

### 問題クラス8: 参照・宣言の実在確認欠落と変動値の固定記載（G）

- **根本原因**: SPEC 等の保存時に参照先用語が参照先成果物に実在するかの確認手順がない。件数等の変動値を規定本文へ固定記載すると運用追加で即座に陳腐化する。宣言的データ yaml の消費者宣言は実装変化がヘッダーへ反映されない
- **再発条件**: バッチ保存で実在確認なしに参照先を記載する場合、変動値を本文へ固定する場合、yaml 新設時に消費者を実装と同時確定しない場合
- **予防策**: 保存手順へ「整合先・参照先用語の実在 grep 確認」「変動値の本文固定記載チェック」を組み込む。data yaml 新設時に消費者実装を同時確定し同期条件をヘッダーへ併記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（PR 2273、PR 2276、PR 2377） |
| 影響度 | 3/5 | dangling 参照・陳腐化は局所的品質低下 |
| 横展開性 | 4/5 | 実在 grep 確認・変動値分離は汎用 |
| 反映先明確度 | 4/5 | design-save/req-save 保存手順、doc-writing 査読観点、checker 共通契約 |
| 自動化適性 | 3/5 | grep 確認は半自動、変動値検出はルール化可能 |
| プロジェクト固有知識再利用性 | 3/5 | 文書規約の中核だが他文書体系でも普遍 |
| 再発可能性 | 4/5 | 保存作業のたびに潜在 |
| 費用対効果 | 4/5 | 確認手順の追加は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 既存 skill へ反映（保存手順、doc-writing 査読観点）

#### エントリ一覧
- SPEC バッチ保存で参照先用語の実在確認を欠き dangling な整合先表記が残存（PR 2273） [inbox]
- 規定本文への件数ハードコードは運用追加で即座に陳腐化する（PR 2276） [inbox]
- 2026-08-22: 検出用データ yaml の「Consumed by」宣言は実装と乖離しやすい（PR 2377） [inbox]

### 問題クラス9: 走査・checker 実装の信頼性（H）

- **根本原因**: ディレクトリ単位のエラー握り潰し（catch-and-skip）は静かな部分レポートを生む。Bun/Windows の node:fs globSync はドット始まり要素を列挙できず junction を下降する。checker の repoRoot 解決は cwd 相対で起動前提が明記されていない
- **再発条件**: 走査エラーを握り潰す実装が残存する場合、glob を素で使う場合、repo root 以外を cwd に checker を起動する場合
- **予防策**: 列挙件数の期待値突合（二重確認規約）、globWalkRel/enumerateFilesRel 共通ヘルパー経由への限定、checker 共通実行契約へ起動 cwd 前提（repo root 起点）の明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（PR 2357×2、PR 2377） |
| 影響度 | 3/5 | 静かな部分走査は検査信頼性を損なう |
| 横展開性 | 3/5 | checker・走査実装を持つプロジェクト全般 |
| 反映先明確度 | 4/5 | checker-execution-contracts Design、repo-agentdev-integrity SKILL.md |
| 自動化適性 | 4/5 | 件数突合・ヘルパー経由は機械化 |
| プロジェクト固有知識再利用性 | 4/5 | Bun/Windows 固有制約の実測記録 |
| 再発可能性 | 3/5 | 共通ヘルパーで構造的に解消済み、運用徹底が残課題 |
| 費用対効果 | 4/5 | 件数突合の追加は低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: spec 候補（checker-execution-contracts Design 既存への反映。エラー伝播方針は intake item 2026-08-21-node-fs-glob-design-complement.md で Design確定候補化済みのため、本クラスはその横断知見側面）

#### エントリ一覧
- 2026-08-21: 再帰列挙のディレクトリ単位エラー握り潰しは静かな部分レポートを生む（PR 2357） [inbox]
- 2026-08-21: Windows + Bun 1.3.10 の node:fs globSync はドット始まりパス要素を列挙できず junction/symlink を下降する（PR 2357） [inbox]
- 2026-08-22: repo-agentdev-integrity 配下の checker は repo root 起点の起動が前提（PR 2377） [inbox]

### 問題クラス10: NG baseline 運用（I）

- **根本原因**: baseline は環境依存表記・導入時点の既知違反を抱え、機械生成必須契約と手書き運用の境界で冗長 entry・赤固定が起きる。full fail gate のままだと新規検査導入で main が赤のままワークフローが破壊される
- **再発条件**: 環境別表記 entry が残存する状態で正規化のみ先行導入する場合、baseline 初期化なしに新規検査を導入する場合
- **予防策**: baseline 再生成タイミングでの環境別表記統合、新規検査導入手順へ「既知違反の additions manifest 初期化（provenance/reason 記録）と delta 0 確認」を標準ステップ化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（PR 2254、PR 2376） |
| 影響度 | 3/5 | main 赤固定はワークフロー破壊、冗長 entry は運用ノイズ |
| 横展開性 | 2/5 | baseline 運用は本リポジトリの機械検査構成固有 |
| 反映先明確度 | 4/5 | integrity-contracts（baseline entry 運用契約）、IR ルール baseline 運用節 |
| 自動化適性 | 4/5 | additions manifest・delta 0 確認は機械運用 |
| プロジェクト固有知識再利用性 | 4/5 | ng-baseline 運用の中核知見 |
| 再発可能性 | 3/5 | 新規検査追加のたびに潜在 |
| 費用対効果 | 4/5 | 導入手順の標準化は低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: spec 候補（integrity-contracts の baseline entry 運用契約への反映）

#### エントリ一覧
- ng-baseline.json の環境別表記重複 entry は正規化導入後に冗長化する（PR 2254） [inbox]
- 2026-08-22: 新規検査クラス導入時の既知違反は additions manifest（provenance/reason 必須）で baseline 初期化する（PR 2376） [inbox]

### 未分類

- backlog 統合バッチの旧スナップショット分析から生成した Issue が作成時点で解消済みになる（Issue 2222） → **deferred**（単発。case-open preflight の already-done 検出は反映先候補として継続保持）
- augmentation の意味定義・役割宣言追加が変更対象成果物リストに事前明示されないまま実施された（PR 2262） → **deferred**（単発、かつ artifact-graph 撤去（DEC-017）により反映先の一部が消滅。execution contract の変更対象網羅という一般知見のみ維持）
- 2026-08-20: 大規模 PR の targeted docs guard --files 渡しでコマンド行長上限に近づくリスクと gh files API 100件上限（PR 2350） → **deferred**（単発だが --base-ref による回避手順の価値が高い。次回再評価で昇華判断）
- 2026-08-22: 廃止語彙検出と検証 fixture の共存は existence_probe（実在なら検出 skip）で成立する（PR 2376） → **duplicate**（IR-065/IR-066 ルールファイルの許容条件として existence_probe が既に明記済み。エントリ自身が「ルールファイルの許容条件として明記済み」と記録）

## promote 時prune結果

- **対象エントリ数**: 35件（staged 31 / deferred 3 / duplicate 1）
- **prune実施**: あり
- **prune候補**: 32件（staged 31 + duplicate 1。staged 分の証拠は採用済み成果物の「元learning item/根拠」セクションへ保存）
- **prune却下**: 0件

## 全体傾向
- 高頻出・高影響の問題クラス: worktree 依存解決（5件）、配布依存境界 gate 徹底（4件・スコア33/40 最高）
- 横展開性が高い問題クラス: 参照実在確認・変動値分離（G）、検証網羅性（F）
- 自動化適性が高い問題クラス: 配布依存境界 gate（D）、AUTOGEN dry-run（A1）、フル suite（F）
- 全体的な観察所見: 2026-08 下半期の学びは「対策は存在するが手順への組み込み・実行徹底が不足」（application miss）が支配的。反映先の大半が case-run の品質統制・PR 作成手順に集中しており、case-run 手順への横断反映が本バッチの主たる昇華先

## ADR候補除外記録
- **対象item**: 全10問題クラス
- **除外理由**: 運用ルール（作業手順・検証手順の定義）、command仕様（品質統制・PR 作成手順の定義）、仕様変更のみ（既存 gate・生成器の運用徹底で技術判断を含まない）
- **根拠事実**: 各クラスの予防策はすべて既存 command/skill/Design への手順追加・明示化であり、新規のアーキテクチャ判断・技術選定を含まない
- **代替反映先候補**: 既存 command（case-run、case-close）、既存 skill（git-worktree、quality-gates、doc-writing）、既存 Design（checker-execution-contracts、integrity-contracts）

## 経路D review 発動条件判定記録（STEP-4）

- **判定**: 発動しない
- **根拠**: `agentdev-learning-pipeline` SKILL.md「常に守る不変条件」は経路D（adversarial-review）を「ユーザー明示要求時のみ」発動する任意助言手段と定め、明示要求がない場合は従来フロー（STEP-5 自律確定/HITL）を維持する。本次実行（backlog-auto 経由の learning-promote）はユーザー明示要求を含まないため発動しない。skip 条件（1件のみ重複確定 / inbox 空）には該当しないが、capability skill の不変条件が上優先する

## 自律確定記録（STEP-5）

全問題クラス・未分類を含む判定を自律確定した。根拠は workflow-contracts Design「promote系判断確定とHITL境界」の自律確定可能要件8項に対する以下の確認:

| 要件 | 確認結果 |
|---|---|
| 1. 適用すべき既存契約と判断根拠を特定できる | 各エントリの「想定反映先」が明記され、既存対策照合で application miss（手順未組み込み）と特定済み |
| 2. 選択肢間に本質的な競合が残っていない | 反映先は既存成果物への手順追加に一意（「新規X化」不要、既存反映優先規則に従う） |
| 3. ユーザー固有の目的・価値観・優先順位の推測を要しない | 予防策は各エントリに自律対応内容として実績記録済み |
| 4. 要件・仕様の新しい対象範囲をユーザーに代わって決定しない | 昇華は promoted/ まで（RU 化・要件化は backlog-review→req-define の正規経路で別途判断） |
| 5. 正規情報源間に未解決の矛盾がない | deferred.md 既存59エントリと照合し同一問題クラスの重複なし（近接知見は発展関係と確認） |
| 6. 判断に必要な情報が欠落していない | 35エントリすべてが13フィールド新フォーマット準拠 |
| 7. 必要な対論型レビューを実施済みなら未解決の本質的争点が残っていない | 経路D は不変条件により不発動（上記記録） |
| 8. 既存の明示的な安全境界を迂回しない | deferred・未処理の自動削除なし（deferred 3件は living pool 保持）。破壊的変更（inbox 強制クリア等）なし — 正規の原子的移動手順に従う |

- **HITL移送条件該当**: なし（8条件いずれも非該当。形式的最終確認のみを理由とするHITL移送は共通規則により禁止）
- **判定結果**: promote 31件（10クラス→採用済み成果物6件へ集約）、deferred 3件（未分類単発）、duplicate 1件（IR-065/066 既記載）
- **成果物集約方針**: 問題クラス単位の評価を維持しつつ、反映先単位で6件の採用済み成果物へ集約する（backlog-review の RU 統合・分割判定に委ねるため）。クラス↔成果物の対応は各成果物の「元learning item/根拠」セクションに明記する
