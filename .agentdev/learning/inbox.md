# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_list の全件走査で safety page limit に到達し state/search フィルタ必須を確認

- **問題事象**: agentdev_gh issue_list 操作で state を指定せず search のみで既存 Case 冪等検出を実行したところ、リポジトリの Issue 総数が多く「issue_list reached the safety page limit (10 pages of 100)」の operation-failed（retryable）が返った。ヒット有無の確認目的でも全ページ走査が発生する
- **発生局面**: 実装（case-open STEP-5 冪等検出の既存 Root Case 検索。Case #3080 実行中）
- **検知方法**: agentdev_gh issue_list 操作の operation-failed 応答（safety page limit メッセージ、contingency に gh CLI 読み取り fallback 提示）
- **根本原因**: issue_list は search 条件がヒットしなくても filter に一致する Issue をページング全走査するため、state 未指定（open + closed 全件）では大規模リポジトリで安全上限に到達する。filter を絞らずに広い検索を行った呼出側の使い方が直接原因
- **自律対応内容**: state: open を付与して再実行し、同一 search 条件で空結果を取得して冪等検出を完了した。gh CLI への切替は不要だった（1回目の再試行で解消）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool の公開契約変更は不要。使用側の運用知見）
- **横展開観点**: agentdev_gh issue_list の全呼び出し箇所（case-open STEP-5、case-ready、issue workflow 等）で state/search/labels フィルタを必須運用とする。冪等検出は open 状態のみで足りる Case 群が多い
- **再発条件**: Issue 数が大きいリポジトリ（1000 件超相当）で issue_list を state なし・search なしまたは広義 search で呼び出した場合
- **予防策候補**: workflow reference の冪等検出手順に「issue_list には state フィルタを付与する」旨を明記する。Tool 応答の contingency に filter 絞り込みヒントを含める
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（GitHub I/O 失敗時切替継続手順の周辺）、その他 issue_list を使う workflow skill references
- **関連**: .agentdev/integrity/reports/cross-dependency-input-3080.json、Case #3080、Definition PR #3081
- **タグ**: `#agentdev-gh` `#issue_list` `#冪等検出` `#ページ上限`

---

## PowerShell WriteLine の CRLF 出力が bash パイプ受信の行指向処理を破壊する

- **問題事象**: PowerShell `[Console]::WriteLine` は CRLF を出力し、bash の `$(...)` パイプ受信では行末 CR が残って `base64 -d` 等の行指向処理が失敗する。末尾行のみ CR が剥がれて一部成功するため検出が遅れる
- **発生局面**: 実装（TS-004 導入検証の HKCU 環境変数列挙実測。Case #3080 case-run 実行中）
- **検知方法**: 列挙エントリのデコード失敗（14 変数中 13 エントリが失敗）
- **根本原因**: `[Console]::WriteLine` の CRLF 出力（コンソール標準の行末が LF 前提の bash パイプと不整合）
- **自律対応内容**: `[Console]::OpenStandardOutput()` への LF 付きバイト直書きへ修正し、fix-and-reverify で列挙完全性を 0 malformed に解消
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: `docs/knowledge/windows-powershell-bulk-io-corruption.md` の隣接系統（PowerShell 経由の外部連携処理全般）。本 Case の知識文書（supervisor-bridge-credential-supply.md）にも回避策を記載済み。learning inbox への昇格候補として PR 本文に記録されたものを case-close が回収
- **再発条件**: PowerShell 標準出力を bash 側の行指向ツールへパイプする全処理
- **予防策候補**: PowerShell から外部へ stdout を渡す場合は `[Console]::OpenStandardOutput()` + LF 付きバイト書き出しを標準手段とする旨を windows-powershell-bulk-io-corruption.md 系の知識へ追記する
- **想定反映先**: docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接系統の追記候補）
- **関連**: PR #3082 検証差分 TS-004、docs/knowledge/supervisor-bridge-credential-supply.md
- **タグ**: `#windows` `#PowerShell` `#CRLF` `#bash連携`

---

## worktree で bun test フル suite 正規形（3 cwd 分割）は .opencode/plugins 未伝播のため分割実行への代替が必要

- **問題事象**: bun test フル suite 正規形（3 cwd 分割実行）の分割③ `bun test ./.opencode/plugins/ ./scripts/` は、worktree に `.opencode/plugins` が未伝播（junction 非伝播の構造的制約）のためそのままでは成立しない
- **発生局面**: 実装（TS-001 bun test フル suite 実行。Case #3080 case-run / case-close 実行中）
- **検知方法**: worktree 上で分割③の plugins 経路が対象欠落となる件数突合での判別
- **根本原因**: `.opencode/plugins` の junction が worktree へ伝播しない構造的制約
- **自律対応内容**: scripts 経路（worktree）と plugins 経路（main root）への分割実行に代替し、環境ラベル（実行環境・実施範囲）を記録して worktree-run と main-run の混在を回避
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 bun test 正規形契約は plugins 未実施を未実行対象として扱う運用注記と整合。正規形を変更しない）
- **横展開観点**: REQ-060 / QG-4 bun test 正規形の worktree 適用時の標準知見。case-close の QG-4 機械受理基準（件数突合・環境ラベル）で実施範囲を判別可能にする運用が有効
- **再発条件**: worktree 上で 3 cwd 分割実行の分割③を実行する全 Case
- **予防策候補**: case-run / case-close の bun test 正規形 reference に「worktree での分割③は plugins 経路を main root から実行し環境ラベルで記録する」代替手順を明記する
- **想定反映先**: .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（worktree 環境差の運用注記周辺）
- **関連**: PR #3082 検証差分、QG-4 bun test フル suite 正規形
- **タグ**: `#bun-test` `#worktree` `#正規形` `#分割実行`

---

## traceability sidecar と inline ADF-COVERS の同一 artifact × 同一 role 二重宣言は duplicate-inconsistencies を起こす

- **問題事象**: traceability sidecar と inline ADF-COVERS の同一 artifact × 同一 role の二重宣言は、REQ セット不一致として duplicate-inconsistencies を起こす
- **発生局面**: 実装（traceability sidecar 作成。Case #3080 case-run 実行中）
- **検知方法**: traceability check の duplicate-inconsistencies finding
- **根本原因**: 同一対応関係が複数情報源に分散すると、check が表現形式を区別せず突合するためセット不一致として検出される
- **自律対応内容**: 単一情報源への集約（inline 既存なら inline 追加、sidecar なら sidecar のみ）に修正。role が違えば（implementation と verification）同一 artifact で併存可能
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の同一論理対応関係の取り扱い契約「sidecar と inline declaration を同じ論理的な対応関係として突合」の帰結）
- **横展開観点**: トレーサビリティ対応宣言を書く全工程（req-define、case-open、case-run、inspect 系）での宣言配置ルールとして横展開可能
- **再発条件**: 同一 artifact に sidecar と inline の両方で同一 role の対応関係を宣言した場合
- **予防策候補**: 宣言追加時に「同一 artifact × 同一 role は単一情報源のみ」というルールを agentdev-traceability の sidecar / policy authoring 手順へ明記する
- **想定反映先**: .opencode/skills/agentdev-traceability/SKILL.md または references（sidecar authoring 手順）
- **関連**: PR #3082、traceability/supervisor-bridge.yaml
- **タグ**: `#traceability` `#sidecar` `#ADF-COVERS` `#二重宣言`

---

## worktree での bun test 依存整備は junction 2 ディレクトリで足りる（削除は node fs.rmdirSync が確実）

- **問題事象**: worktree での bun test 実行には gitignore 対象 node_modules が未伝播のため依存解決失敗が発生する。また検証後の junction 削除は Git Bash の rmdir では「Not a directory」で拒否され、PowerShell Remove-Item は NonInteractive モードで確認プロンプトが出て失敗する
- **発生局面**: 実装（TS-001 bun test 実行の依存整備。Case #3080 case-run / case-close 実行中）
- **検知方法**: 依存解決失敗の fail、junction 削除コマンドの失敗応答
- **根本原因**: 依存解決に必要な package 境界は 2 箇所（agentdev-project-extensions/scripts と repo-* プレフィックス検査基盤 scripts）に限られる。Windows junction の削除はファイルシステム種別に依存したコマンド差分がある
- **自律対応内容**: junction 2 ディレクトリ（`.opencode/skills/repo-agentdev-integrity/scripts/node_modules` と `src/opencode/skills/agentdev-project-extensions/scripts/node_modules`、いずれも main 側実体への junction）の作成で整備し、検証後の削除は node `fs.rmdirSync` を使用（main 側実体は不変）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 依存パッケージ前置契約の許容手段 2〔junction 作成〕の実運用確認）
- **横展開観点**: worktree 上で bun test を実行する全 Case の依存整備・後始末の標準手順として横展開可能
- **再発条件**: worktree で bun test を依存未整備のまま実行した場合、または junction を Git Bash / PowerShell 標準コマンドで削除しようとした場合
- **予防策候補**: junction 削除は node `fs.rmdirSync` を標準手段とする旨を agentdev-git-worktree の worktree 構造的制約 reference へ追記する
- **想定反映先**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md（worktree 構造的制約・依存整備の節）
- **関連**: PR #3082 検証差分、QG-4 依存パッケージ前置
- **タグ**: `#bun-test` `#worktree` `#junction` `#依存整備`
