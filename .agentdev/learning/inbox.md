# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 宣言的ルールデータの silent skip を契約テストで固定する（OU-005、PR #2147）

- **問題事象**: check_workflow_preventive.ts の YAML 読み取り（collectForbiddenRegexes）はリスト内コメント行でリストキーをリセットし、`forbidden_unconditional_patterns` を静かにスキップしていた（check 7(ii) で実際には読み取られていなかった）。
- **発生局面**: 実装（commands_error_cases.test.ts の期待値単一化に伴う新テスト追加時）
- **検知方法**: 新規契約テストが YAML と checker 実装の乖離を検出して暴露
- **根本原因**: 宣言的ルールデータのパース処理がコメント行の扱いでリストキー状態を破壊しており、読み取り漏れがエラーにならない silent skip 構造だった
- **自律対応内容**: currentListKey リセット欠陥を修正し collectForbiddenRegexes を export、テストが checker 所有の YAML 読み取りロジックを単一再利用する構成に変更
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-010-062 の単一実装原則の適用実例）
- **横展開観点**: 検出ビュー（YAML 等の宣言データ）と checker 実装の一致を契約テストで固定するとこの種の欠陥が露出する
- **再発条件**: YAML 等の宣言的ルールデータにコメント行を含むリストを checker が独自パースする場合
- **予防策候補**: 宣言データの読み取りは silent skip を許さず、検出ビューと実装の一致を契約テストで固定する
- **想定反映先**: checker 実装・テスト設計の参考（learning-promote で判定）
- **関連**: PR #2147, Issue #2139 (CLOSED), Epic #2134
- **タグ**: `#checker` `#yaml` `#contract-test`

## PowerShell で git stash を扱う際のクォーティングと pathspec（OU-001、PR #2148）

- **問題事象**: PowerShell で `git stash pop stash@{0}` が構文エラーになる。また `git stash push -u` に node_modules 実態のある pathspec を渡すと大量ファイルが stash に取り込まれ CRLF 警告が発生した。
- **発生局面**: 実装（worktree 検証での stash 往復）
- **検知方法**: コマンド実行時のエラーと警告出力
- **根本原因**: `stash@{0}` が pwsh の hashtable リテラルと解釈される。未追跡ファイル込みの stash は pathspec 外の実態も取り込む
- **自律対応内容**: `'stash@{0}'` のように引用符で括り、除外 pathspec の指定か node_modules 一時退避で回避
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: PowerShell 上で `@{}` を含む git 引数（stash、`HEAD@{n}` 等）はすべて引用符必須
- **再発条件**: pwsh で stash ref を引用符なしで渡す場合、worktree で node_modules を含む stash 往返を行う場合
- **予防策候補**: stash ref は常に引用符、worktree 検証の stash は除外 pathspec 指定
- **想定反映先**: agentdev-git-worktree / agentdev-gh-cli 手続の補強候補（learning-promote で判定）
- **関連**: PR #2148, Issue #2135 (CLOSED), Epic #2134
- **タグ**: `#powershell` `#git` `#worktree`

## worktree フルスイート失敗の帰属確認手順（OU-004、PR #2149）

- **問題事象**: worktree でフルテストスイートを実行した際、自変更と無関係の失敗（check_extensions のフルスイート時のみの失敗）が混在し、自変更由来と誤認しうる所があった。
- **発生局面**: 実装（worktree での scripts フルテスト）
- **検知方法**: 失敗テストの単体再実行と base コミットでの再現比較
- **根本原因**: テスト間の実行順序依存の汚染がフルスイート時のみ発生する既知失敗で、実行形態による差異の帰属確認を飛ばすと誤認する
- **自律対応内容**: 単体実行と `git stash push -- <path>` による base 再現の双方で帰属を確認してから修正対象と判断した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree・main 環境差（junction 有無、node_modules 有無）による失敗も同一手順で帰属確認する
- **再発条件**: フルスイートと単体実行で結果が変わるテストが存在する環境での検証
- **予防策候補**: 失敗は「単体再実行」「base 再現」の二段階で帰属を確認してから修正判断する
- **想定反映先**: case-run 検証手順の参考（learning-promote で判定）
- **関連**: PR #2149, Issue #2138 (CLOSED), Epic #2134
- **タグ**: `#testing` `#worktree` `#attribution`

## 並列 Wave で同一ファイルを改変する複数 PR のマージ順依存と Level 1 機械的解消の限界（Epic #2134 Wave 1 case-close）

- **問題事象**: Wave 1 の PR #2147（ファイル全面再構成）と PR #2146（同一ファイルの一部期待値更新）を続けてマージする際、#2147 のマージ直後に #2146 が CONFLICTING となり、Level 1 rebase（git rebase origin/main）が内容コンフリクトで失敗した。
- **発生局面**: case-close（Epic Wave クローズの squash merge シーケンス）
- **検知方法**: mergeable 状態取得（CONFLICTING/DIRTY 遷移）と rebase 実行時の CONFLICT (content)
- **根本原因**: 同一 Wave の並列子Issue が同一テストファイルを変更範囲に含み、先行マージ PR が他方の変更と同一リージョンを異なる文言で書き換えていた。両側とも `docs/decisions/README.md` を期待する同種の修正だったが、文言の内容選択が必要なため機械的解消（rebase のみ）の範囲を超えた
- **自律対応内容**: スキルの Level 1 手順に従い rebase を試み、コンフリクト確認後に `git rebase --abort` で worktree を復元し、case-auto へ Level 1 失敗としてエスカレーション（Level 2/3 は実施せず）。Epic ステータス追跡テーブルの当該行は `pending` 維持
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（コンフリクト解消モデル Level 1/2/3 分離の遵守実例）
- **横展開観点**: Wave 構成時に変更ファイルの重複を検知し、重複 PR 間に依存（または同一ファイルの調整）を設定すれば回避できる
- **再発条件**: 同一 Wave の並列子Issue の変更範囲が同一ファイルで重なり、かつ双方が同一リージョンを編集する場合
- **予防策候補**: case-open の execution_unit 構成時に変更ファイル重複を依存ヒントに反映する、または case-run の前置 gate で他 PR とのファイル重複を警告する
- **想定反映先**: epic-tracker / case-open の Wave 構成基準（learning-promote で判定）
- **関連**: PR #2146, PR #2147, Issue #2137 (OPEN), Epic #2134
- **タグ**: `#epic-wave` `#merge-conflict` `#level1-escalation`

## 網羅 grep でのパス glob の落とし穴（OU-010、PR #2153）

- **問題事象**: `Select-String -Path '<dir>/**/*'` 形式の網羅 grep は、スキル直下の SKILL.md（サブディレクトリ外のファイル）を取りこぼす場合があった（本 Issueでは intake 系 SKILL.md の `工程-N` ラベルが一時見落とし）。
- **発生局面**: 実装（16 Workflow Skill の順序ラベル3変種の残存確認 grep）
- **検知方法**: 件数整合の二重確認（列挙ベース集計と再 grep の一致）で検出
- **根本原因**: PowerShell の `-Path` glob（`**/*`）がディレクトリ直下のファイルをマッチ対象に含まないケースがある
- **自律対応内容**: `Get-ChildItem -Recurse -File` でファイル列挙してから `Select-String -LiteralPath` に渡す方式へ切り替え、取りこぼしを解消
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: ラベル・参照の網羅検査では glob 依存の grep ではなく列挙ベースでファイル集合を確定してから grep する
- **再発条件**: PowerShell で `Select-String -Path` に再帰 glob を渡して網羅検査する場合
- **予防策候補**: 網羅検査は `Get-ChildItem -Recurse -File` + `-LiteralPath` を標準手順化し、件数整合の二重確認を必須とする
- **想定反映先**: case-run 検証手順・skill-authoring 査読観点の参考（learning-promote で判定）
- **関連**: PR #2153, Issue #2144 (CLOSED), Epic #2134
- **タグ**: `#powershell` `#grep` `#label-sweep`

## AUTOGEN 再生成ブロックを含む並列 PR の連続マージは rebase で機械解消できない（OU-002/#2151、Epic #2134 Wave 2 case-close）

- **問題事象**: PR #2152（AUTOGEN 再生成を含む大規模 PR）マージ後に PR #2151（別日の AUTOGEN 再生成を含む PR）が CONFLICTING となり、Level 1 rebase（git rebase origin/main）が `docs/specs/quality/spec-health-metrics.md` の AUTOGEN ブロックで内容コンフリクトして失敗した。
- **発生局面**: case-close（Epic Wave クローズの squash merge シーケンス）
- **検知方法**: mergeable 状態取得（CONFLICTING/DIRTY）と rebase 実行時の CONFLICT (content)。req-health-metrics.md は自動解消されたが spec-health-metrics.md は衝突（同一ファイル内でも hunk 単位で成否が分かれる）
- **根本原因**: 両 PR が同一 AUTOGEN ブロックを異なる基準日・内容で再生成していた。生成物同士の衝突のため文言選択ではなく、正解は「新 base 上での再生成」であり手動マージや rebase の機械的解消の範囲を超える
- **自律対応内容**: Level 1 手順に従い rebase 試行→コンフリクト確認→`git rebase --abort` で worktree を PR HEAD へ復元→case-auto へ Level 1 失敗エスカレーション。Epic ステータス追跡テーブル当該行は `pending` 維持、Issue は OPEN 維持
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（Level 1/2/3 分離の遵守実例。Wave 1 の #2146/#2147 事例（文言選択型）と同じ停止境界・別根因）
- **横展開観点**: AUTOGEN 対象ファイル（索引・メトリクス系）を変更範囲に含む複数 PR を同一 Wave に並列配置すると、マージ順に関係なく再生成同士が衝突する。Level 2 では手動編集ではなく新 base での `generate_indexes.ts` 再実行で解消するのが正道
- **再発条件**: 同一 Wave の並列子Issue が同じ AUTOGEN ブロックを持つファイル（health-metrics、integrity-rule-catalog、rule-ownership 等）を変更範囲に含む場合
- **予防策候補**: case-open の execution_unit 構成時に AUTOGEN 対象ファイルの重複を依存ヒントに反映する。case-auto の Level 2 解消レシピに「再生成で解消」を明記する
- **想定反映先**: epic-tracker / case-open の Wave 構成基準、case-auto コンフリクト解消レシピ（learning-promote で判定）
- **関連**: PR #2151 (OPEN), PR #2152, Issue #2136 (OPEN), Epic #2134
- **タグ**: `#epic-wave` `#merge-conflict` `#autogen` `#level1-escalation`


## NG baseline の bucket key は完全一致のため承認追加は findings JSON からの機械生成を要する（OU-002、PR #2151）

- **問題事象**: NG baseline の bucket key は `category\tcheck\tfile\tevidence` の完全一致で決まるため、手書きでの承認済み baseline entry 追加は evidence 文字列の不一致で baseline が効かない。
- **発生局面**: 実装（ng-baseline.json への承認済み entry 15件追加）
- **検知方法**: baseline 適用後の check_integrity 再実行で approved additions として info 払い下げされるかの確認
- **根本原因**: bucket key が検出 findings の evidence 文字列を含む完全一致であり、人手での再現が困難
- **自律対応内容**: 対象実行の findings JSON から additions manifest を機械生成する手順（`--update-ng-baseline --ng-baseline-additions`）で追加した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（integrity-contracts SPEC「NG baseline 運用手順」の運用実例。報告分類の明確化は SPEC確定候補として intake 記録済み）
- **横展開観点**: baseline entry の追加は必ず対象実行の findings JSON から機械生成する
- **再発条件**: findings JSON を介さず手書きで baseline entry を追加する場合
- **予防策候補**: 手書き追加の禁止を NG baseline 運用手順へ明文化する
- **想定反映先**: integrity-contracts SPEC（learning-promote で判定）
- **関連**: PR #2151 (MERGED), Issue #2136 (CLOSED), Epic #2134
- **タグ**: `#integrity` `#baseline` `#tooling`

## baseline entry のパス bucket key は生成環境のパス解決に依存する（OU-002 case-close QG-4、PR #2151）

- **問題事象**: merged main の QG-4 検証で delta 1件（command-capture-duty / `.opencode/commands/agentdev/case-close.md`）が「新規かつ未管理」と計上された。実体は NG21 分類 N17 の承認済み baseline entry だが、登録パス（worktree 環境で機械生成された `src/opencode/commands/agentdev/case-close.md`）と main リポジトリ junction 環境の検出パス（`.opencode/…`）が一致しなかった。
- **発生局面**: case-close（QG-4 完了条件検証、merged main で check_integrity を実行）
- **検知方法**: delta 報告の「1 new unmanaged NG」と元観測 report-5（2026-08-15、同一 .opencode/ パスで観測済み）・ng-baseline.json 登録パス（src/ 表記）の突合
- **根本原因**: baseline の additions manifest をパス解決が異なる環境（worktree、junction 未伝播）で生成したため、bucket key の file 表記が検出環境と異なった
- **自律対応内容**: N17 は新規ではなく承認済み baseline entry の適用範囲と判断し、QG-4 は判断根拠を対応記録コメントに記録のうえ合格判定。パス key 不整合は intake（N17 item）へ記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（DEC-013 運用の境界事例）
- **横展開観点**: junction 環境と非 junction 環境で検出パス表記が変わる checker の baseline 運用では、パス正規化（または検出環境と同一環境での機械生成）が必要
- **再発条件**: worktree 等の junction 未伝播環境で生成した baseline entry を junction 実在環境の検査に適用する場合
- **予防策候補**: checker 側でパス正規化（.opencode/ と src/ の換算）を導入するか、baseline 適用時の unmatched additions と unmanaged delta の対を警告する
- **想定反映先**: repo-agentdev-integrity checker / integrity-contracts SPEC NG baseline 運用手順（learning-promote で判定）
- **関連**: PR #2151 (MERGED), Issue #2136 (CLOSED), Epic #2134, intake-2026-08-16-ou002-ng17-case-close-capture-boundaries-ref.md
- **タグ**: `#integrity` `#baseline` `#worktree` `#junction`

## 機械判定スクリプトの AUTOGEN ブロック判定は行全体マッチにする（OU-009、PR #2154）

- **問題事象**: 一文一行機械判定で AUTOGEN ブロックの判定に部分一致を使ったため、本文中のマーカー言及（インラインコード例）が誤発火し、index-auto-generation.md 5 行 / autogen-freshness-gate.md 1 行の検出漏れが発生した。
- **発生局面**: 実装（docs 横断の X-4 機械是正）
- **検知方法**: 是正後の再計測でAUTOGEN ブロック周辺に違反残が残ったことからの逆算特定
- **根本原因**: ブロックマーカー（`<!-- AUTOGEN:BEGIN/END -->`）の判定を部分一致で行った場合、マーカーを言及する本文行までブロック境界と誤認する
- **自律対応内容**: generate_indexes.ts と同一形式の行全体マッチへ変更し、検出漏れ 6 行を是正した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 生成物ブロックのスキップ判定は実装（generator）と同一のマッチ形式（行全体）を使うべきである
- **再発条件**: マーカー行を本文中に言及する文書へ機械判定を適用し、部分一致でブロック判定する場合
- **予防策候補**: 機械判定系スクリプトのブロック判定は generator と同一の行全体マッチを標準とする
- **想定反映先**: mechanical-replacement-rules.md / 機械判定スクリプト設計（learning-promote で判定）
- **関連**: PR #2154 (MERGED), Issue #2143 (CLOSED), Epic #2134
- **タグ**: `#mechanical-judgment` `#autogen` `#detection`

## bun test のパス引数は ./ prefix と実行件数検証まで要する（Epic #2134 Wave 3 case-close）

- **問題事象**: bun test に `./` prefix なしの相対パス（ディレクトリ・ファイル混合）を渡したところ、Windows 環境では実行ファイルの一部だけが走り 160 pass / EXIT 0 で正常終了した。`./` prefix 付きで再実行すると実際は 2274 tests / 106 files だった。
- **発生局面**: case-close（Epic 完了条件の full integrity suite 実行）
- **検知方法**: PR #2154 の実績値（コマンド系 4 ファイルのみで 267 tests）と部分実行の合計（160 tests）が矛盾したことによる疑念と、bun の "filters did not match any test files" 注意の確認
- **根本原因**: bun test の引数はパス指定ではなくフィルタ解釈であり、Windows のパス解釈差で `./` なし相対パスの一部だけが実ファイルに一致する。部分実行も EXIT 0 で終わるため fail がなくても件数が妥当かの検証がないと気づけない
- **自律対応内容**: 全テストディレクトリを `./` prefix 付きで明示指定して再実行し、`Ran N tests across M files` の N/M を直前実績と突合して全件実行を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 検証スイート全体の合格判定は pass/fail のみでなく実行件数の妥当性検証まで含める
- **再発条件**: Windows 環境で bun test に `./` なし相対パスを渡す場合
- **予防策候補**: full suite 実行手順に `Ran N tests across M files` の件数突合を必須ステップとして明記する
- **想定反映先**: quality-gates QG-4 / docs-check 実行手順（learning-promote で判定）
- **関連**: Epic #2134, PR #2154 (MERGED), Issue #2143 (CLOSED)
- **タグ**: `#bun` `#testing` `#full-suite` `#windows`

## Epic Wave 連続 squash merge での隣接行コンフリクトは Level 1 rebase で機械解消不能（Epic 2156 Wave 1 case-close）

- **問題事象**: Epic #2156 Wave 1 の並列子Issue（#2157〜#2160）の PR を連続 squash merge した際、4番目の PR #2171 が CONFLICTING/DIRTY となった。競合は docs/specs/skills/agentdev-doc-diagnostics.md のみで、先行マージ済み PR #2170（REQ-010-025→REQ-036-013）と PR #2171（REQ-010-048→REQ-039-004）が互いに隣接行（L98/L99）を機械置換していた
- **発生局面**: デプロイ（case-close Epic Wave マージフェーズ）
- **検知方法**: mergeable UNKNOWN ポーリング中の CONFLICTING 遷移検出と、Level 1 rebase 実行時の content conflict（rebase 手順に従い証拠採取後 abort）
- **根本原因**: 複数子Issue が同一ファイルの隣接行を変更する Wave 構成。git の 3-way merge は隣接行変更を自動解消しない。マージ順序を変えてもいずれかの PR で確定的に発生する
- **自律対応内容**: コンフリクト解消モデル Level 1 に従い rebase を abort し、当該子Issue を pending 維持のまま case-auto Level 2/3 へエスカレーション（union 解は自明でも内容編集は case-close 責務外）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（既存コンフリクト解消モデルの運用事例。昇華判断は learning-promote に委ねる）
- **横展開観点**: 機械的置換を複数子Issue で並行適用する Epic では、変更ファイルの行近接度を Wave 構成時に確認する価値がある
- **再発条件**: 複数子Issue が同一ファイルの近接行を変更し、case-close が順次 squash merge する場合
- **予防策候補**: case-open の Wave 構成時に同一ファイルの行近接する変更を並列 Wave に配置しない、または後続 PR のマージ前に先行 rebase を適用する
- **想定反映先**: agentdev-epic-tracker（Wave 構成ガイド）、agentdev-workflow-case-close（マージ前 rebase 判定）
- **関連**: PR #2170/#2171、Epic #2156、docs/specs/skills/agentdev-doc-diagnostics.md
- **タグ**: `#epic-wave` `#squash-merge` `#conflict`

## JSON 出力検証スクリプトの pwsh リダイレクト破損と exit 1 時の stdout 喪失（OU-006、PR #2172）

- **問題事象**: check_integrity.ts --json の出力を pwsh のリダイレクトでファイルへ書き出したところ UTF-8 が cp932 化けし JSON が不正コントロール文字で破損した。また ng 残存時は exit 1 を返すため Node execSync が例外を投げ、stdout を後続処理に渡せなかった。
- **発生局面**: case-close QG-4 再検証（worktree で check_integrity 実行）
- **検知方法**: JSON.parse の SyntaxError（Bad control character）と execSync の Command failed エラー
- **根本原因**: pwsh のパイプライン・リダイレクト経由のネイティブコマンド出力はエンコーディング変換を受ける。execSync は非ゼロ exit で例外を投げ、stdout は err.stdout へ退避されるのみ
- **自律対応内容**: spawnSync で実行し r.stdout を status に関わらず常に取得。ファイル書き出しも Node fs.writeFileSync に統一
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（agentdev-gh-cli READ 手続き既定の適用実例）
- **横展開観点**: bun/node 系スクリプトの JSON 出力読み取りでも gh と同一の READ 安全手順が必要。exit code が意味を持つ検証スクリプトは spawnSync（status と stdout の分離）が適する
- **再発条件**: pwsh でネイティブコマンド出力をリダイレクトやパイプで受け取る場合、失敗しうるコマンドの stdout を execSync で使う場合
- **予防策候補**: JSON 出力する検証スクリプトの呼び出しは spawnSync + fs.writeFileSync（UTF-8）へ統一する
- **想定反映先**: agentdev-gh-cli 標準手続きの適用範囲解説（learning-promote で判定）
- **関連**: PR #2172, Issue #2163 (CLOSED), Epic #2162
- **タグ**: #check-integrity #powershell #json #encoding


## retired REQ の ID は他 REQ の行ID 接頭辞と部分一致するため検索設計で除外が必要（OU-009、PR #2174）

- **問題事象**: retired REQ の参照整理（REQ-024）では、対象 REQ の ID（REQ-024）が他 REQ の行ID 接頭辞（REQ-010-024 等）と部分一致する。素朴な grep では行ID を対象 REQ 参照として誤検出する潜在があった
- **発生局面**: 実装（docs/** 全域の REQ-024 形式参照掃引）
- **検知方法**: 本 Issue では PATTERN TRAP として事前指定あり。REQ-024 単独と REQ-024-NNN 行ID を検索語とし、REQ-010- 等の前置に一致するものを除外する検索設計で臨み、誤検出0件で完了
- **根本原因**: REQ-ID 体系がハイフン区切りの階層（REQ-{NNNN}-{NNN} 行ID）であるため、短い ID が長い行ID の一部に現れる
- **自律対応内容**: 「対象 ID 単独」「行ID（-NNN 付き）」「前置一致の除外」を区別した検索設計で掃引し、REQ-010-024 等との混同なしを確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: AG-007 規則7 の参照整理や REQ-ID を含む網羅検査では、対象 ID が他行ID の接頭辞・接尾辞と部分一致する可能性を検索設計に織り込む
- **再発条件**: 対象 REQ-ID の部分文字列が別 REQ の行ID に現れる状況で、単純文字列 grep で網羅検査する場合
- **予防策候補**: RETIRE 整理系 Issue の掃引手順に「対象 ID 単独」「行ID 付き」「前置一致除外」の3点確認を標準化する
- **想定反映先**: AG-007 参照整理手順 / case-run 検証手順（learning-promote で判定）
- **関連**: PR #2174, Issue #2166 (CLOSED), Epic #2162
- **タグ**: `#retire` `#grep` `#pattern-trap`

## worktree 環境の check_integrity は ir035 See Also warning を環境差異として発生させる（OU-010、PR #2177）

- **問題事象**: worktree 環境で check_integrity を実行すると `ir035-skill-see-also-reference` warning が 4 件発生した（agentdev-req-file-manager、agentdev-decision-file-manager、agentdev-gh-cli、agentdev-workflow-templates の See Also スキルディレクトリ未検出）。post-merge main では warning 0 件となり発生しない
- **発生局面**: 検証（case-run の worktree での check_integrity 実行）
- **検知方法**: worktree（warning 4 件）と merged main（warning 0 件）での check_integrity 実行結果の差分
- **根本原因**: install-consumer-opencode.ps1 が作成する junction（.opencode/ 配下）が git worktree へ反映されない環境由来。worktree には .opencode/ の実体が無く See Also 先のスキルディレクトリを検出できない
- **自律対応内容**: 既知の環境差異として記録し修正不要と判断。main での再実行により解消を確認して QG-4 の根拠とした
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree で check_integrity の warning を評価する場面では、ir035 系 warning を環境差異の候補として main 再実行で切り分ける
- **再発条件**: git worktree 上で See Also ディレクトリ解決を含む integrity 検査を実行する場合
- **予防策候補**: worktree での check_integrity 結果解釈時に「main では発生しない環境差異 warning」の切り分け手順を設ける
- **想定反映先**: repo-agentdev-integrity の ir035 運用注記（learning-promote で判定）
- **関連**: PR #2177, Issue #2167 (CLOSED), Epic #2162
- **タグ**: `#check-integrity` `#worktree` `#junction`

## check_changed_docs.ts --base-ref はコミット前の作業ツリー変更を検出しない（OU-010、PR #2177）

- **問題事象**: check_changed_docs.ts に `--base-ref origin/main` を指定してコミット前の作業ツリーで実行すると files checked: 0 となり変更を検出しない。コミット後は files checked: 1 となり正常に検出する
- **発生局面**: 検証（case-run のコミット前事前検証タイミング）
- **検知方法**: コミット前後での files checked 数の差（0 → 1）
- **根本原因**: 同スクリプトが base-ref との commit diff を検出対象とする仕様であり、未コミットの作業ツリー状態は比較対象に含まれない
- **自律対応内容**: コミット後に再実行して targeted docs guard 相当の検証を完了した。仕様通りの挱いでありスクリプト側の変更はしていない
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: コミット前の case-run 事前検証では当該スクリプトは機能しない。検証タイミングの設計では「コミット後にしか検証できない検査」として扱う
- **再発条件**: コミット前の作業ツリーで check_changed_docs.ts --base-ref を検証根拠にしようとする場合
- **予防策候補**: case-run の検証手順では check_changed_docs.ts をコミット後の実行として位置付ける、または staging 差分を対象に取る機能追加を検討する
- **想定反映先**: case-run 検証手順 / check_changed_docs.ts 仕様注記（learning-promote で判定）
- **関連**: PR #2177, Issue #2167 (CLOSED), Epic #2162
- **タグ**: `#check-changed-docs` `#docs-check` `#verification-timing`

## bun test の gitignore 探索と cwd 依存テストにより「全体実行 pass」の記述が再現不能になる（OU-001、PR #2184）

- **問題事象**: repo root から `bun test` を実行しても bun の gitignore-aware 探索により `.opencode/skills/repo-agentdev-integrity/scripts` 配下のスイート（2020 test / 83 files）は検出されない（734 files searched で該当なし）。スイート全体の実行には scripts ディレクトリを cwd とする必要があるが、その実行形態では check_extensions.test.ts「classifies the real skill tree deterministically」が cwd 相対パス解決で fail する。PR 本文の「bun test 2020 pass / 0 fail（repo root 実行）」は本環境ではどの実行形態でも再現できなかった
- **発生局面**: case-close（QG-4 完了条件「全体実行 pass」の再検査）
- **検知方法**: worktree・main 両環境で repo root 起動・scripts dir 起動の2実行形態を試行比較し、失敗1件は PR 取り込み前 main での再現比較で帰属確認
- **根本原因**: bun のテスト発見が `.opencode/skills/*` の gitignore パターンと `repo-*` 再包含をディレクトリ探索として処理しきれず、repo root 起動ではスイートが対象外になる。加えてスイート内に cwd 依存の実repo統合テストが混在する
- **自律対応内容**: スイート全体は scripts ディレクトリを cwd として実行（2019 pass / 1 fail）し、fail 1件は PR 前 main でも同一失敗する既存事象として PR Findings 記載済みの intake 候補と整理した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 「全体実行 pass」の検証証拠は実行 cwd と起動コマンドを明記しないと環境依存で再現不能になる。失敗混在時は帰属確認（base 再現比較）を必ず実施する
- **再発条件**: bun test で .gitignore 再包含ディレクトリ配下のスイートを検証する場面、cwd 依存テストを含むスイートの全体実行を証拠化する場面
- **予防策候補**: PR 本文・検証手順には実行 cwd とコマンド形式を明記する。cwd 依存テストは修正対象として intake 化する（本件は PR Findings 記載済み）
- **想定反映先**: case-run 検証手順・PR 本文テンプレートの参考（learning-promote で判定）
- **関連**: PR #2184, Issue #2179 (CLOSED), Epic #2178
- **タグ**: `#bun` `#testing` `#cwd`

## 配布物記述削減前のコマンド契約テスト routing token 対象確認（OU-003、PR #2186）

- **問題事象**: コマンド本文の STEP 要約削減において、distribution_boundary_routing_contract.test.ts がコマンド本文の特定セクション（case-run ### Step 7-1）の検出器エントリポイント（check_distribution_boundary.ts）、--profile source、result 状態語（completed-pr / blocked）の routing token を機械検証しており、削減するとテスト不合格となるセクションが存在した。
- **発生局面**: 実装（16コマンドの STEP 要約・権威情報源宣言重複の削減）
- **検知方法**: 一度削減してテスト不合格を確認し復帰（実測）
- **根本原因**: コマンド本文の特定セクションが契約テストの期待値固定対象であることが記述上から読み取れない
- **自律対応内容**: 対象セクションを公開 interface として原形維持し、削減対象を「工程詳細の再要約」のみに限定した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 配布物の記述削減系 Issue では、対象コマンドの契約テスト grep（routing token・期待値固定セクションの検出）を削減前に実施する
- **再発条件**: 契約テストがコマンド本文の文言・セクション構造を期待値固定している状態で本文削減を行う場合
- **予防策候補**: 記述削減系 Issue のテスト戦略に「契約テスト grep を削減前実施」を組み込む
- **想定反映先**: agentdev-command-authoring の記述削減手順の参考（learning-promote で判定）
- **関連**: PR #2186, Issue #2181 (CLOSED), Epic #2178
- **タグ**: #contract-test #command-reduction

## プレースホルダ除去時の IR-055 baseline delta 再検証必須（OU-005、PR #2187）

- **問題事象**: プレースホルダ ID（{NNN} 形式）を含む行は IR-055 の検査免除（template placeholder exemption）になるため、プレースホルダ除去は同行の他パターン（src/opencode/、repo-local、docs/specs/ 参照）を新規違反として顕在化させ得る。PR #2187 で 6 件顕在化し、即時修正した。
- **発生局面**: 実装（references 配下のプレースホルダ ID 表記整理）
- **検知方法**: プレースホルダ除去後の check_integrity.ts 実行で新規 delta として検出
- **根本原因**: IR-055 の exemption が行単位（{...} 含む行全体を走査免除）であり、プレースホルダ以外の違反も同行は隠蔽される構造
- **自律対応内容**: 顕在化した 6 件を配布物向け表現（.opencode/...、自己ホストリポジトリ固有 等）へ修正して解消
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 配布物のプレースホルダ整理時は IR-055 baseline delta の再検証を必須工程とする
- **再発条件**: プレースホルダを含む行のプレースホルダのみを除去する編集を行う場合
- **予防策候補**: プレースホルダ整理 Issue の検証手順へ IR-055 delta 再検証を明示する
- **想定反映先**: agentdev-skill-authoring または checker 実行契約の参考（learning-promote で判定）
- **関連**: PR #2187, Issue #2182 (CLOSED), Epic #2178
- **タグ**: #ir055 #placeholder #baseline

## 検証スクリプトの対象ファイル収集で git diff --diff-filter=d による削除済み除外（OU-005、PR #2187）

- **問題事象**: git diff --name-only の出力には削除済みファイルが含まれるため、検証スクリプトが各ファイルを読む前に ENOENT が発生した。
- **発生局面**: 実装（TS-008 検証: 変更ファイル群の注記走査）
- **検知方法**: 検証スクリプト実行時の ENOENT エラー
- **根本原因**: --name-only が削除済みパスも返す仕様に対し、対象全件が存在することを前提とした読み込みを行っていた
- **自律対応内容**: --diff-filter=d で削除済みファイルを除外して再実行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: diff 出力をファイル読み込みに使う検証スクリプト全般に当てはまる
- **再発条件**: 削除を含む変更セットを --name-only で収集して直接読む場合
- **予防策候補**: 対象収集には常に --diff-filter=d（または存在確認）を組み合わせる
- **想定反映先**: 検証スクリプト・テスト戦略テンプレートの参考（learning-promote で判定）
- **関連**: PR #2187, Issue #2182 (CLOSED), Epic #2178
- **タグ**: #git #verification

## worktree での check_integrity 検証は .opencode junction 一時作成で main repo 等価環境を再現する（OU-004、PR #2188）

- **問題事象**: check_integrity の ir035（See Also skill directory not found）は worktree で .opencode/skills|commands 配下の junction が未伝播（git 管理外のため）となることで既定 fail する。
- **発生局面**: 実装（worktree 内での main repo 等価の整合性検証）
- **検知方法**: worktree 内 check_integrity.ts 実行時の ir035 fail
- **根本原因**: junction は git 管理外のローカルリンクであり、git worktree には複製されない。checker は .opencode 配下のスキル・コマンド実体の存在を前提としている
- **自律対応内容**: worktree の .opencode/skills|commands へ一時的に junction を作成して main repo 等価環境を再現すると exit 0 になることを確認（本 PR で適用。gitignore 済みのため worktree に残置）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: .opencode junction 依存の checker を worktree で実行する場面全般に当てはまる
- **再発条件**: worktree 内で .opencode 配下実体を前提とする検査を実行する場合
- **予防策候補**: worktree 検証手順に .opencode junction 一時作成（検証後はクリーンアップ対象として扱う）を明示する
- **想定反映先**: 検証手順・worktree 運用の参考（learning-promote で判定）
- **関連**: PR #2188, Issue #2183 (CLOSED), Epic #2178 (CLOSED)
- **タグ**: #worktree #junction #check-integrity

## PowerShell 一括読み書きによる配布物ファイル破壊の再発防止（OU-0001、PR #2198）

- **問題事象**: PowerShell で await を含む誤ったコマンドが部分失敗した際、後続の Set-Content が空変数のまま実行され8ファイルが空になった（git 復元 + 再構築で回復）。
- **発生局面**: 実装（配布スキル src/opencode/skills/agentdev-artifact-graph 配下の編集）
- **検知方法**: 部分失敗したコマンド列の実行後、対象ファイルが空であることを確認
- **根本原因**: PowerShell のパイプライン・変数展開を含む一括読み書きは部分失敗時に空書き込みへ到達しうる。逐次 edit ツールと異なり中間状態の検証がない
- **自律対応内容**: git 復元と再構築で回復。以後の配布物編集は per-line edit ツールに限定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows 環境での配布物編集全般。AGENTS.md の「Write ツール全面上書きは新規ファイル限定」警告の PowerShell 版として一般化できる
- **再発条件**: PowerShell による複数ファイルへの一括読み書き（Get-Content → 加工 → Set-Content）を失敗しうる-chain で実行する場合
- **予防策候補**: 配布物編集は per-line edit ツールに限定し、PowerShell 一括読み書きを禁止/制限する規約化
- **想定反映先**: agentdev-skill-authoring または AGENTS.md 編集規約の参考（learning-promote で判定）
- **関連**: PR #2198, Issue #2190 (CLOSED), Epic #2189
- **タグ**: #powershell #encoding #editing

## ジャンクション未伝播 worktree での検査代替と node_modules 伝播（OU-0003、PR #2197）

- **問題事象**: ジャンクション未伝播の git worktree では .opencode/skills/agentdev-* が空のため .opencode 前提の検査（check_extensions.ts 等）が実行不能。また新規 worktree では scripts/node_modules が未伝播で bun test が実行できない。
- **発生局面**: 実装（worktree 内での配布依存境界 gate・テスト実行）
- **検知方法**: worktree 内で .opencode 配下前提の検査・テスト実行時にエラー
- **根本原因**: junction は git 管理外のローカルリンクであり git worktree には複製されない。node_modules も git 管理外
- **自律対応内容**: src 側の check_distribution_boundary.ts --profile source と artifact-graph scripts の bun test（bun install --cwd 実行後）で代替検証
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: worktree で .opencode 前提検査を実行する場面全般
- **再発条件**: worktree 内で .opencode 配下実体や node_modules を前提とする検査・テストを実行する場合
- **予防策候補**: worktree 検証手順に (1) src 側スクリプト経由の代替経路、(2) bun install --cwd の前置を明示する
- **想定反映先**: 検証手順・worktree 運用の参考（learning-promote で判定）
- **関連**: PR #2197, Issue #2192 (CLOSED), Epic #2189
- **タグ**: #worktree #junction #bun

## 配布物への具体 ID・docs パス直書きは配布依存境界 gate で違反になる（OU-0004、PR #2199）

- **問題事象**: 配布物（src/opencode/skills 配下）へ具体 ID（REQ-020 等）や docs/ 配下パスを直接記述すると配布依存境界 gate（check_distribution_boundary --profile source）が違反になる。
- **発生局面**: 実装（effectiveness/candidate_limit サブスイート作成）
- **検知方法**: 配布依存境界 gate 実行（case-run Step 7-1）
- **根本原因**: 配布物はプロジェクト非依存が要件であり、具体 ID・docs パスはプロジェクト固有情報
- **自律対応内容**: effectiveness 既存資産の規約（REQ-{NNNN} プレースホルダ、採番フォーマッタ関数による ID 合成、文字列分割によるパス合成）に従って通過
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 配布物へ言及を書く場面全般
- **再発条件**: 配布物に具体 ID や docs パスを文字列リテラルで記述する場合
- **予防策候補**: 配布物編集時のプレースホルダ・合成規約を authoring ガイドへ集約する
- **想定反映先**: agentdev-skill-authoring または effectiveness 資産規約の参考（learning-promote で判定）
- **関連**: PR #2199, Issue #2193 (CLOSED), Epic #2189
- **タグ**: #distribution-boundary #placeholder

## 複数 worktree 検査はループ変数で作業ディレクトリを切り替える（case-close 実行、Epic 2189）

- **問題事象**: 複数 worktree で同一 detector を実行する際、bash ツールの workdir を最初の worktree に固定したまま foreach ループを回したため、4回すべて同一 worktree で検査を実施していた（検査対象の取り違え）。
- **発生局面**: case-close E4-0（配布依存境界 最終 gate の4 worktree 実行）
- **検知方法**: 実行結果の scanned_files 件数が全ループ同一（313）であることに着眼して疑い、workdir 指定の誤りを特定。workdir を個別指定して再実行し是正
- **根本原因**: ループ変数（worktree 名）を出力表示にのみ使い、実行場所（workdir）に反映していなかった
- **自律対応内容**: worktree ごとに個別 workdir 指定で再実行し、scanned_files の差異（314/306/314）で実施場所を検証
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 複数ディレクトリに対する同一コマンド実行全般。実行場所は出力だけでなく実行結果の指標（件数・パス）でも検証する
- **再発条件**: ループ内でディレクトリを扱う際、実行場所をループ変数にバインドし忘れた場合
- **予防策候補**: 複数 worktree 検査手順に「実行結果の指標で実施場所を検証」を明示する
- **想定反映先**: case-close E4-0 運用の参考（learning-promote で判定）
- **関連**: Epic #2189（case-close 実行中に検知・是正。PR 由来ではない自律学び）
- **タグ**: #worktree #verification #tooling
