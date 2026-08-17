# 評価レポート

## メタデータ
- **実行日時**: 2026-08-18 00:13
- **対象エントリ数**: 26件（inbox: 26件、deferred 再評価: 6件 — deferred.md（約60エントリ）は既存対策照合・重複確認の参照用として読込。本 run では inbox エントリと同根（根本原因・再発条件・予防策が同一）の6エントリのみ living pool 再評価の対象として問題クラスの構成員に含めた。前回レポートが「living pool の再評価は次回実行時に行う」と記録した判定の実施。残り deferred エントリの全件再評価は今回も行わない）
- **問題クラス数**: 8（未分類含まず。クラス8 + 未分類7件は処分欄に個別記載）

## 問題クラス一覧

### 問題クラス1: worktree・実行形態の環境差に由来する検査失敗の帰属確認と main 等価再現

- **根本原因**: git 管理外のリソース（`.opencode/` junction、node_modules）が git worktree へ複製されず、またフルスイートと単体実行でテスト結果が変わる実行形態差により、検査・テスト失敗の帰属（自変更由来か環境差か）が一見で判定できない。帰属確認手順と main 等価環境の再現手順が検証手順として未整備
- **再発条件**: Windows + junction 環境で worktree 内の検査・テスト実行、フルスイートと単体実行で結果が変わるテストが存在する環境での検証
- **予防策**: (1) 失敗は「単体再実行」「base・main 再現」の二段階で帰属確認してから修正判断する、(2) worktree の `.opencode/skills|commands` へ一時 junction 作成で main 等価環境を再現する、(3) junction 依存検査は src 側スクリプトによる代替経路と `bun install --cwd` 前置で実行する、の各手順を worktree 検証手順（worktree-test-fallback SPEC、case-run 検証手順）へ反映する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 6件（inbox 4 + deferred 同根 2。intake 側にも同根 2 item） |
| 影響度 | 3/5 | QG-4 判定の揺れ・誤帰属による誤修正・検査不能。復旧可能だが検証根拠を損なう |
| 横展開性 | 3/5 | worktree + junction + bun の Windows プロジェクト全般 |
| 反映先明確度 | 4/5 | worktree-test-fallback SPEC（draft）、case-run 検証手順、agentdev-git-worktree と特定済み |
| 自動化適性 | 3/5 | 一時 junction 作成・bun install --cwd の手順化は容易。帰属確認自体は半手動 |
| プロジェクト固有知識再利用性 | 4/5 | junction 未伝播・実行形態差という環境固有知見 |
| 再発可能性 | 5/5 | worktree 検証は毎 Epic で実施。直近3 Epic でも反復 |
| 費用対効果 | 4/5 | 手順明記は低コストで誤帰属・検査不能を防止 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 昇華（spec 候補 + 既存 skill へ反映）。worktree 検証手順（case-run 検証手順、agentdev-git-worktree）への環境差切り分け・一時 junction・代替経路の手順反映と、worktree-test-fallback SPEC への checker 環境差扱いの補強
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: worktree-test-fallback SPEC（draft）が「構造系テストの src/ fallback 実行」「junction 依存 checker の skip」を規定 / deferred pool に同根2エントリ（lint_skills.ts junction 一時作成、README 参照 fallback）/ intake inbox に同根2 item（ir035-worktree-junction-fallback、checkextensions-worktree-junction-failure）。**ギャップ: fix gap**（環境差 warning の切り分け手順（main 再実行）、check_integrity 向け一時 junction 再現、node_modules 伝播の代替手順（src 側スクリプト + bun install --cwd）が SPEC・手順のいずれにも未規定）

#### エントリ一覧
- worktree フルスイート失敗の帰属確認手順（OU-004、PR #2149）[inbox]
- worktree 環境の check_integrity は ir035 See Also warning を環境差異として発生させる（OU-010、PR #2177）[inbox]
- worktree での check_integrity 検証は .opencode junction 一時作成で main repo 等価環境を再現する（OU-004、PR #2188）[inbox]
- ジャンクション未伝播 worktree での検査代替と node_modules 伝播（OU-0003、PR #2197）[inbox]
- Windows worktree 環境で lint_skills.ts を実行するためのジャンクション一時作成パターン [deferred]
- worktree ジャンクション未伝播環境での README 参照 fallback 実装パターン [deferred]

### 問題クラス2: Epic Wave 並列 PR の同一ファイル衝突と Level 1 機械解消の限界

- **根本原因**: 同一 Wave の並列子Issue の変更範囲が同一ファイルで重なり（同一リージョン文言置換・隣接行・AUTOGEN ブロック再生成）、連続 squash merge の際に先行マージが他方を CONFLICTING にする。文言選択・再生成を要する衝突は git rebase の機械的解消の範囲を超え、Level 2/3 エスカレーションと Wave 停止が発生する
- **再発条件**: 同一 Wave の並列子Issue の変更範囲が同一ファイルで重なり、かつ同一リージョン・隣接行・AUTOGEN ブロックのいずれかを双方が編集する場合
- **予防策**: case-open の execution_unit 構成時に変更ファイルの重複（特に AUTOGEN 対象ファイル・行近接の機械置換）を依存ヒントに反映し並列 Wave に配置しない。case-auto の Level 2 解消レシピに AUTOGEN は「新 base 上での再生成で解消」を明記する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | 4件（inbox 3 + deferred 同根 1。Epic #2134/#2156/#1719 で反復） |
| 影響度 | 4/5 | Epic Wave のマージ停止・Level 2/3 エスカレーション・子Issue の pending 長期化 |
| 横展開性 | 4/5 | 並列 Wave + squash merge を使う開発全般 |
| 反映先明確度 | 4/5 | epic-wave-model SPEC（execution_unit 構成）、execution-unit-construction.md、case-auto Level 2 レシピと特定済み |
| 自動化適性 | 4/5 | 変更ファイル重複検知は execution_unit 構成アルゴリズムへ組み込み可能 |
| プロジェクト固有知識再利用性 | 4/5 | Wave モデル・AUTOGEN 運用の固有知見 |
| 再発可能性 | 5/5 | 横断是正・メトリクス系 Epic で構造的に反復（3 Epic で4事例） |
| 費用対効果 | 4/5 | 構成時チェックの組込みは中コストで Wave 停止を予防 |
| **加重合計** | **34/40** | |

- **推奨処分案**: 昇華（spec 候補）。execution_unit 構成アルゴリズムの技術的依存判定への「変更ファイル重複・AUTOGEN 対象重複・行近接の機械置換」反映と Level 2 レシピの追記
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: epic-wave-model SPEC「execution_unit 間の並列可否は連結成分（技術的依存のみがエッジ）で判定」、execution-unit-construction.md（連結成分アルゴリズム）あり。**ギャップ: fix gap**（技術的依存の判定要素に変更ファイル重複・AUTOGEN 対象重複・行近接が含まれず、Level 2 解消レシピに再生成解消の明記なし）

#### エントリ一覧
- 並列 Wave で同一ファイルを改変する複数 PR のマージ順依存と Level 1 機械的解消の限界（Epic #2134 Wave 1）[inbox]
- AUTOGEN 再生成ブロックを含む並列 PR の連続マージは rebase で機械解消できない（OU-002/#2151）[inbox]
- Epic Wave 連続 squash merge での隣接行コンフリクトは Level 1 rebase で機械解消不能（Epic 2156 Wave 1）[inbox]
- 複数PR跨ぎ semantically 競合の Level 2 コンフリクト解消パターン（Epic #1719 Wave 2）[deferred]

### 問題クラス3: bun test 実行形態契約（フィルタ解釈・gitignore 探索・実行件数突合）

- **根本原因**: bun test の引数はパス指定ではなくフィルタ解釈であり、`./` prefix の有無・gitignore-aware 探索・起動 cwd によって実行対象が変化する。部分実行も EXIT 0 で終わるため、実行件数を検証しないと検証空洞化（全体実行と思い込みの部分実行）が検出できない
- **再発条件**: Windows 環境で bun test に `./` なし相対パスを渡す場合、gitignore 再包含ディレクトリ配下のスイートを repo root 起動で検証する場合、cwd 依存テストを含むスイートの全体実行を証拠化する場合
- **予防策**: full suite 実行手順に (1) 全テストディレクトリを `./` prefix 付きで明示指定、(2) `Ran N tests across M files` の N/M を直前実績と突合する件数検証を必須ステップとして明記、(3) PR 本文・検証手順に実行 cwd とコマンド形式を明記する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 4/5 | 160 pass / EXIT 0 で 2274 tests の 7% しか走らない検証空洞化。完了判定の信頼性を損なう |
| 横展開性 | 3/5 | bun test + Windows + gitignore 環境全般 |
| 反映先明確度 | 4/5 | quality-gates SPEC（full integrity suite 合格基準）、case-close・docs-check 実行手順と特定済み |
| 自動化適性 | 4/5 | 件数突合（N/M の比較）は自動化容易 |
| プロジェクト固有知識再利用性 | 4/5 | bun のフィルタ解釈・gitignore 探索という固有知見 |
| 再発可能性 | 4/5 | full suite 実行のたびに潜在 |
| 費用対効果 | 5/5 | prefix 付き指定と件数突合の明記は低コストで検証空洞化を構造的に防止 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 昇華（spec 候補）。quality-gates SPEC の full integrity suite 合格基準への件数突合必須化と実行形式（cwd・prefix）明記要求の反映
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: quality-gates SPEC に full integrity suite 合格基準あり（識別子中心評価・実測値は補助値）。**ギャップ: fix gap**（`Ran N tests across M files` の件数突合・実行 cwd とコマンド形式の明記要求が未規定）

#### エントリ一覧
- bun test のパス引数は ./ prefix と実行件数検証まで要する（Epic #2134 Wave 3）[inbox]
- bun test の gitignore 探索と cwd 依存テストにより「全体実行 pass」の記述が再現不能になる（OU-001、PR #2184）[inbox]

### 問題クラス4: 機械検査のパターンマッチ・網羅検査設計の欠陥（glob・部分一致・ID 接頭辞・silent skip）

- **根本原因**: 検出・パースのパターンマッチ手段が検出対象の正確な構造と噛み合わない。(1) 宣言的データのパーサがコメント行でリストキー状態を破壊し読み取り漏れがエラーにならない、(2) pwsh の `-Path` glob が直下ファイルをマッチしない、(3) ブロックマーカー判定の部分一致が本文言及行を誤認する、(4) 階層 ID 体系で短い ID が長い行ID の一部に現れ素朴な grep が誤検出する
- **再発条件**: YAML 等の宣言的データを checker が独自パースする場合、PowerShell で再帰 glob により網羅検査する場合、マーカー行を本文に言及する文書へ機械判定を適用する場合、REQ-ID 部分文字列が別行ID に現れる状態で文字列 grep する場合
- **予防策**: 機械判定の標準手順化 — (1) ブロック判定は generator と同一の行全体マッチ、(2) 網羅検査は列挙ベース（`Get-ChildItem -Recurse -File` + `-LiteralPath`）でファイル集合を確定し件数整合の二重確認、(3) 検索設計に「対象 ID 単独 / 行ID 付き / 前置一致除外」の3点確認、(4) 宣言データの読み取りは silent skip を許さず検出ビューと実装の一致を契約テストで固定する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 4件（4種のマッチ設計欠陥） |
| 影響度 | 3/5 | 検出漏れ（是正漏れが下流で発覚し手戻り）と誤検出の双方 |
| 横展開性 | 4/5 | 機械検査・grep・checker を使う開発全般 |
| 反映先明確度 | 4/5 | checker-execution-contracts SPEC（draft）、mechanical-replacement-rules、case-run 検証手順と特定済み |
| 自動化適性 | 4/5 | 標準マッチ形式・列挙ベース手順の規約化、契約テスト化は自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | 検出設計・ID 体系の固有知見 |
| 再発可能性 | 4/5 | 網羅検査・機械判定は高頻度で実施 |
| 費用対効果 | 4/5 | 手順・規約の明文化は低コスト |
| **加重合計** | **30/40** | |

- **推奨処分案**: 昇華（spec 候補）。checker-execution-contracts SPEC への機械判定マッチ形式の標準規定と、網羅検査手順（列挙ベース+件数整合）・ID 検索設計の明文化
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: checker-execution-contracts SPEC（draft）に「検出 glob による検出漏れと検出過剰は許容しない」「宣言的データ YAML の schema 原則」あり。**ギャップ: fix gap**（原則はあるが、行全体マッチ統一・列挙ベース+件数整合・ID 前置一致除外・宣言データの silent skip 禁止+契約テスト固定の具体手順が未規定）

#### エントリ一覧
- 宣言的ルールデータの silent skip を契約テストで固定する（OU-005、PR #2147）[inbox]
- 網羅 grep でのパス glob の落とし穴（OU-010、PR #2153）[inbox]
- 機械判定スクリプトの AUTOGEN ブロック判定は行全体マッチにする（OU-009、PR #2154）[inbox]
- retired REQ の ID は他 REQ の行ID 接頭辞と部分一致するため検索設計で除外が必要（OU-009、PR #2174）[inbox]

### 問題クラス5: NG baseline bucket key の再現性契約（機械生成必須・パス正規化）

- **根本原因**: NG baseline の bucket key は `category\tcheck\tfile\tevidence` の完全一致で決まるため、(1) 手書き追加は evidence 文字列の不一致で baseline が効かず、(2) worktree 等のパス解決が異なる環境で生成した entry は検出環境のパス表記と一致せず unmatched になる。生成・適用の実行契約が運用手順に明文化されていない
- **再発条件**: findings JSON を介さず手書きで baseline entry を追加する場合、worktree 等 junction 未伝播環境で生成した baseline entry を junction 実在環境の検査に適用する場合
- **予防策**: NG baseline 運用手順への (1) baseline entry の追加は対象実行の findings JSON からの機械生成に限る（手書き追加禁止）の明文化、(2) パス bucket key の正規化（`.opencode/` と `src/` の換算）または unmatched additions と unmanaged delta の対警告の導入

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 3/5 | baseline 不発効・QG-4 の誤差分計上。判断根拠の記録コスト増 |
| 横展開性 | 3/5 | baseline ratchet 運用を持つプロジェクト全般 |
| 反映先明確度 | 5/5 | integrity-contracts SPEC「NG baseline 運用手順」に直接対応 |
| 自動化適性 | 4/5 | 機械生成 CLI は既存（--update-ng-baseline）。正規化は checker 拡張 |
| プロジェクト固有知識再利用性 | 4/5 | baseline key 仕様・環境依存パスの固有知見 |
| 再発可能性 | 4/5 | baseline 追加・worktree 検証のたびに潜在 |
| 費用対効果 | 4/5 | 手書き禁止の明文化は低コスト。正規化は中コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: 昇華（spec 候補）。integrity-contracts SPEC「NG baseline 運用手順」への機械生成必須・手書き禁止・パス正規化の明文化
- **処分判定**: promote（カテゴリ7: spec 候補）
- **既存対策照合**: integrity-contracts SPEC「NG baseline 運用手順」節あり（機械生成 CLI の手順は運用実例として存在）/ intake inbox に報告分類の明確化 item（spec-cand-ng-baseline-legacy-provenance-reporting）あり。**ギャップ: fix gap**（手書き追加禁止の明文化なし、パス bucket key の環境依存対策（正規化・対警告）なし。intake item は報告分類のみで本クラスの中核をカバーしない）

#### エントリ一覧
- NG baseline の bucket key は完全一致のため承認追加は findings JSON からの機械生成を要する（OU-002、PR #2151）[inbox]
- baseline entry のパス bucket key は生成環境のパス解決に依存する（OU-002 case-close QG-4、PR #2151）[inbox]

### 問題クラス6: git stash の環境依存挙動と worktree 検証手順

- **根本原因**: git stash は stash ref（refs/stash）を worktree 間で共有し、変更なし worktree での stash 生成が no-op になり pop が無関係な既存 stash を対象にする。また `stash@{0}` 等の `@{}` を含む引数は pwsh の hashtable リテラルと解釈され構文エラーになる。stash 往復は worktree・pwsh 環境で構造的に危険
- **再発条件**: 複数 worktree が存在するリポジトリで変更の有無を確認せず stash 往復する場合、pwsh で stash ref を引用符なしで渡す場合、worktree で node_modules を含む stash 往返を行う場合
- **予防策**: agentdev-git-worktree の検証手順へ (1) worktree では stash 不使用、baseline 比較は detached worktree で行う標準手順の明記、(2) `@{}` を含む git 引数（stash、`HEAD@{n}` 等）は引用符必須、除外 pathspec の指定を明記する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 3/5 | 無関係 stash の誤 pop による conflict 状態・大量ファイルの stash 取り込み。復旧可能だが手戻り |
| 横展開性 | 4/5 | pwsh + worktree 環境の git 操作全般 |
| 反映先明確度 | 4/5 | agentdev-git-worktree skill（検証手順）に特定済み |
| 自動化適性 | 3/5 | 代替手順（detached worktree）の標準手順化は可能。防止は手順依存 |
| プロジェクト固有知識再利用性 | 4/5 | stash ref 共有・pwsh 構文の固有知見 |
| 再発可能性 | 4/5 | worktree 検証での一時退避は頻繁に発生 |
| 費用対効果 | 4/5 | 代替手順の明記は低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: 昇華（既存 skill へ反映）。agentdev-git-worktree の worktree 検証手順への stash 不使用・detached worktree 標準手順とクォーティング規則の反映
- **処分判定**: promote（カテゴリ2: 既存 skill へ反映）
- **既存対策照合**: なし（agentdev-git-worktree SKILL.md に stash 運用の記述なし）。**ギャップ: なし（対策不在。新規手順の反映が必要）**

#### エントリ一覧
- PowerShell で git stash を扱う際のクォーティングと pathspec（OU-001、PR #2148）[inbox]
- worktree 環境では git stash を使わず detached worktree で baseline 比較する（OU-001、PR #2201）[inbox]

### 問題クラス7: pwsh 経由ネイティブコマンド出力の破損と Node.js 実行経路への統一

- **根本原因**: pwsh のパイプライン・リダイレクト経由のネイティブコマンド出力はエンコーディング変換（UTF-8 → cp932 化け・制御文字破損）を受け、また execSync は非ゼロ exit で例外を投ぎ stdout を後続処理に渡せない。検証スクリプト・JSON 出力の読み取り経路として pwsh を介する構成が構造的に破損を生む
- **再発条件**: pwsh でネイティブコマンド出力をリダイレクトやパイプで受け取る場合、失敗しうる検証コマンド（exit code が意味を持つ）の stdout を execSync で使う場合
- **予防策**: JSON 出力する検証スクリプトの呼出しは spawnSync（status と stdout の分離）+ `fs.writeFileSync`（UTF-8）へ統一する。適用範囲を gh CLI に限定せず bun/node 系スクリプト全般へ拡張する（agentdev-gh-cli 標準手続きの適用範囲解説の拡張）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 3件（inbox 1 + deferred 同根 2。3経路で反復） |
| 影響度 | 4/5 | 検証根拠（JSON・件数計測）の破損。QG-4 の判断材料が信頼できなくなる |
| 横展開性 | 4/5 | Windows 環境のネイティブコマンド出力扱い全般 |
| 反映先明確度 | 4/5 | agentdev-gh-cli 標準手続き（READ 安全手順）の適用範囲解説、検証スクリプト呼出手順と特定済み |
| 自動化適性 | 4/5 | spawnSync + fs.writeFileSync への統一は機械的に徹底可能 |
| プロジェクト固有知識再利用性 | 4/5 | pwsh・Node.js child_process の相互作用という固有知見 |
| 再発可能性 | 4/5 | 検証スクリプト呼び出しのたびに潜在（前回評価以降も反復） |
| 費用対効果 | 4/5 | 呼出形式の統一は低コスト |
| **加重合計** | **31/40** | |

- **推奨処分案**: 昇華（既存 skill へ反映）。agentdev-gh-cli 標準手続きの適用範囲解説（gh CLI に限らない検証スクリプト全般への拡張）と case-run 検証手順への spawnSync 統一の反映
- **処分判定**: promote（カテゴリ2: 既存 skill へ反映）
- **既存対策照合**: agentdev-gh-cli standard-procedures Section 3「安全な読み取り手順」あり（gh CLI WRITE/READ 向け）。**ギャップ: fix gap**（適用範囲が gh CLI に限定され、bun/node 系検証スクリプト（check_integrity --json 等）の JSON 出力読み取りと exit code が意味を持つコマンドの stdout 取得（spawnSync 分離）が未カバー）

#### エントリ一覧
- JSON 出力検証スクリプトの pwsh リダイレクト破損と exit 1 時の stdout 喪失（OU-006、PR #2172）[inbox]
- gh CLI 出力の PowerShell パイプライン経由読み取りによる UTF-8 損傷と Node.js execSync 回避 [deferred]
- Windows worktree 環境で check_integrity.ts の subprocess JSON が空 stdout を返す問題 [deferred]

### 問題クラス8: 検査文字列・契約トークンを固定する機械検査と本文編集の相互作用

- **根本原因**: 契約テスト・checker が配布物本文の特定トークン（routing token、期待値固定セクション、capture 責務の概念名文字列等）を機械検証していることが、本文の記述上から読み取れない。本文削減・抽象化の際にトークンを除去するとテスト不合格・チェック違反として初めて発覚する
- **再発条件**: 契約テスト・checker が本文トークン・文字列を期待値固定している配布物に対し、トークン残存確認なしに記述削減・抽象化を行う場合
- **予防策**: 記述削減・抽象化系の変更前に、対象ファイルを参照する `*.test.ts`・checker の grep（routing token・期待値固定セクション・概念名文字列の検出）を実施する手順を authoring（command-authoring / skill-authoring）へ反映する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（inbox 1 + deferred 同根 1） |
| 影響度 | 4/5 | テスト不合格・チェック違規4件等の手戻り。Wave 統合時の陳腐化 fail にも直結 |
| 横展開性 | 4/5 | 契約テスト・文字列 checker を持つ配布物編集全般 |
| 反映先明確度 | 4/5 | agentdev-command-authoring、agentdev-skill-authoring の記述削減手順と特定済み |
| 自動化適性 | 3/5 | grep 確認は手順化可能。固定トークンの特定は判断を含む |
| プロジェクト固有知識再利用性 | 4/5 | 配布物と契約テストの相互作用という固有知見 |
| 再発可能性 | 4/5 | 記述削減・抽象化は継続的に発生（前回クラス3の再反復） |
| 費用対効果 | 4/5 | 事前 grep 手順の明記は低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: 昇華（既存 skill へ反映）。command-authoring / skill-authoring の記述削減・抽象化手順への「契約テスト・checker 固定トークンの事前確認」の反映
- **処分判定**: promote（カテゴリ2: 既存 skill へ反映）
- **既存対策照合**: なし（agentdev-command-authoring・agentdev-skill-authoring の SKILL.md に契約テスト固定トークンの事前確認手順なし。前回 learning-promote の問題クラス3として promote → RU 化済みだが、authoring skill への反映は未到達）。**ギャップ: なし（対策不在。前回 RU 由来の反映待ち）**

#### エントリ一覧
- 配布物記述削減前のコマンド契約テスト routing token 対象確認（OU-003、PR #2186）[inbox]
- CaptureBoundary チェックと配布物参照境界（IR-059）の相互作用と両立運用 [deferred]

### 未分類
- check_changed_docs.ts --base-ref はコミット前の作業ツリー変更を検出しない（OU-010、PR #2177）[inbox] — **duplicate 推奨**（targeted-docs-guard-implementation SPEC accepted が「--base-ref は worktree 環境（case-run）での変更ファイル検出に使用、files_checked 0件は WARNING」「コミット後（case-close）は --files 標準」を規定済み。case-run SPEC も targeted docs guard の委譲前実行を規定済み。エントリ自身も「仕様通りの挙い」と認識。新規性なし）
- プレースホルダ除去時の IR-055 baseline delta 再検証必須（OU-005、PR #2187）[inbox] — deferred 推奨（同一メカニズム（IR-055 exemption の行単位性による delta 顕在化）の intake item（spec-cand-ir055-exemption-new-delta-emergence）が checker 実行点の明確化を管理中。learning 側の固有値（プレースホルダ整理時の再検証必須工程化）は単発。前回 E25 と同じく living pool で維持し次回 intake 側処分と照合）
- 検証スクリプトの対象ファイル収集で git diff --diff-filter=d による削除済み除外（OU-005、PR #2187）[inbox] — deferred 推奨（出現1件。検証スクリプト技法の知見）
- PowerShell 一括読み書きによる配布物ファイル破壊の再発防止（OU-0001、PR #2198）[inbox] — deferred 推奨（出現1件。AGENTS.md 既存警告（Write ツール全面上書き制限）の PowerShell 版一般化候補。本 run でも pwsh 出力の cp932 化けが反復観測されておりクラス7 と隣接するが、根本原因（パイプライン部分失敗時の空書き込み）が異なるためクラスタ化せず）
- 配布物への具体 ID・docs パス直書きは配布依存境界 gate で違反になる（OU-0004、PR #2199）[inbox] — deferred 推奨（出現1件。対策本体は配布依存境界 gate（check_distribution_boundary）と effectiveness 既存資産の規約（プレースホルダ・合成）が既存。authoring ガイドへの集約は改善候補の域）
- 複数 worktree 検査はループ変数で作業ディレクトリを切り替える（case-close 実行、Epic 2189）[inbox] — deferred 推奨（出現1件。実行指標（件数・パス）による実施場所検証の技法。一般ツール運用知見）
- Phase 0（req-save/spec-save）起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる（OU-001 case-close、PR #2201）[inbox] — deferred 推奨（出現1件。ただし反映先（case-run 前置 gate への dry-run チェック追加 / spec-save 完了報告での再生成案内）が明確で影響大（Epic 差戻し直結）。次回 living pool 再評価の最優先候補。HITL で promote への変更を選択可能）

## promote 時prune結果

- **対象エントリ数**: 32件（inbox 26件 + deferred 構成員 6件）
- **prune実施**: 未実施（HITL 承認後に実施）
- **prune候補**: 31件（staged 31件 = promote 8クラスの構成員。inbox 25件 + deferred 同根 6件。duplicate 1件）
- **prune却下**: 0件

## 全体傾向
- **高頻出・高影響**: 問題クラス2（Wave 並列 PR 同一ファイル衝突、34/40）が最高スコア。3 Epic で4事例の反復で、Epic 停止に直結する
- **横展開性が高い**: 問題クラス7（pwsh 経由出力破損、Windows 全般）、問題クラス4（機械検査のマッチ設計、検査全般）、問題クラス8（契約トークンと本文編集、配布物編集全般）
- **自動化適性が高い**: 問題クラス3（件数突合）、問題クラス5（機械生成・パス正規化）、問題クラス2（構成時のファイル重複検知）
- **全体的な観察所見**: 26件中19件が Epic #2134〜#2201（直近の大規模 Epic 群 + backlog-auto 実装）の case-run/case-close 運用由来。大規模 Epic の並列実行と Windows worktree 環境の相互作用に知見が集中している。前回 promote 済み主題の再発が2件（クラス8=前回クラス3 の再反復、E15=前回クラス2 の重複）あり、前者は authoring 手順への未反映（application miss）、後者は SPEC 化済み（duplicate）。deferred 同根6エントリの living pool 再評価により、単発では未分類となっていた E12・E17 を反復根拠付きでクラス化した。intake inbox に同根 item が2件（クラス1 関連）存在し、backlog-review での統合時に参照される

## ADR候補除外記録
- **対象item**: 全問題クラス（1〜8）
- **除外理由**: 技術判断不在（全クラスともアーキテクチャ上の決定・技術選定を含まず、検証手順・運用契約・ checker 拡張の明文化が本質）
- **根拠事実**: 各クラスの予防策は SPEC への規定・既存 skill 手順への反映・アルゴリズム要素の追加であり、代替案間の技術的トレードオフ判断を含まない
- **代替反映先候補**: 各クラスのとおり spec 候補（クラス1〜5）および既有 skill への反映（クラス6〜8）
