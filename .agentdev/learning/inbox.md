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

