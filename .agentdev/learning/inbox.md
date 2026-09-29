# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-29 Case #3233（case-close Capture 回収・PR #3235 本文 learning 候補）

- bun test フル suite の実測 197.77〜235.88 秒（integrity suite 2600 台・Windows・依存整備なし）は REQ-060-007 の timeout 300〜600 秒標準の妥当性を実測裏付けした。既定 120 秒では打ち切りとなる実測値
- worktree 内の配布物編集では distribution boundary（concrete-id）と IR-055（runtime-unresolved-reference）の両 gate が語彙制約を課す。REQ 行 ID の対応関係は traceability sidecar へ集約する運用が実効的（PR #3235 で 9 sidecar 更新・1 sidecar 新規作成）

## 2026-09-29 Case #3233（case-close 工程内検知）

- git 履歴依存 checker（IR-072 等）の実測結果は commit 前 working tree と commit 後 HEAD で変化し得る（updated 進行 commit が自身を last content-change と判定する構造）。検証記録には実測局面（commit 前後）の明示が必要で、QG-4 checker 実測手順の merge 直前 HEAD 実施規定（REQ-032-030）がこの乖離を検出した実例。checker 側は frontmatter のみ commit 除外で恒久対応済み（e7f1f639）
- case-close の Design 状態評価による Design 本体への経緯追記は merge 前に PR へ含める必要がある。merge 後の追記は反映経路が intake 回収に限定される（本 Case で intake 化: `.agentdev/intake/inbox/2026-09-29-3233-checker-execution-contracts-lifecycle-notes.md`）

## 2026-09-29 Case #3236（case-close Capture 回収・PR #3238 本文 learning 候補）

### copyTree 型再帰コピーの skip 判定は root 起点の相対パスで行う

- **問題事象**: `copyTree` 型の再帰コピーで `path.relative` を各再帰レベルで計算すると、skip 判定のプレフィックス比較（`tests/`、`vendor/` 等）が再帰先基準の相対パスで壊れる
- **発生局面**: 実装（Case #3236 / PR #3238、TS-005 配布検査の fix）
- **検知方法**: TS-005 配布検査テスト実行時の初回 4 fail（fixture への test ファイル残留を検出。従来の `tests/` 除外は fixture に test ファイルが残留していても検査が壊れないため潜在していた）
- **根本原因**: skip 判定の相対パスが再帰先ディレクトリ基準で計算され、root 起点のプレフィックス（`tests/`、`vendor/`）と一致しない。ディレクトリ自体（末尾スラッシュなしの名前）も skip 判定に含まれていなかった
- **自律対応内容**: root 起点の相対パスを伝播する方式へ修正し、ディレクトリ自体の除外も追加（commit ba6bc9bb）。最終 HEAD で 8 pass / 0 fail を再確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 再帰コピー・再帰列挙では相対パスを再帰レベルごとに計算せず root 起点で伝播させる。skip 判定はファイル・ディレクトリ両形式を扱う
- **再発条件**: copyTree 型の再帰コピーで exclude プレフィックス判定を各再帰レベルの相対パスで行った場合
- **予防策候補**: 再帰コピー util に root 起点相対パスの除外検査（浅い階層からの単体テスト）を付ける
- **想定反映先**: 配布物コピー系スクリプト（package-release-archive.ps1 等）・類似 util 実装時の判断基準
- **関連**: `scripts/self/release/textlint-guard-distribution.test.ts`、PR #3238、Case #3236
- **タグ**: `#typescript` `#配布検査` `#再帰コピー`

### 同一 worktree・同一ブランチへの複数サブエージェント並行委譲は二重実装競合を生む

- **問題事象**: 同一 worktree・同一ブランチに複数の実行担当サブエージェントが並行で委譲されると、git status 上の編集が相互に進行して二重実装・競合となる
- **発生局面**: 実装（Case #3236、case-run 実装委譲 DEL-3236-1 の実行中）
- **検知方法**: git status・commit・PR・Issue コメント等の durable state による帰属確認
- **根本原因**: 複数委譲が同一作業領域を共有し、進行中の編集の帰属が durable state から判別できないまま並行進行した
- **自律対応内容**: durable state による帰属確認と、並行進行中は同一ファイル編集を避ける協調観測（guard の fail-closed 拒否 → 実取得 → 再適用）を実施
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（運用上の回避。Wave 実行制御の契約変更はしていない）
- **横展開観点**: 委譲実行前に durable state で帰属を確認し、並行進行が判明した場合は同一ファイル編集を避ける
- **再発条件**: 同一 worktree・同一ブランチへの複数サブエージェント同時委譲
- **予防策候補**: 並行進行検出時は同一ファイル編集を避け、guard fail-closed 拒否後は実取得 → 再適用で協調する
- **想定反映先**: case-run / case-auto orchestration stage 3 の Wave 実行制御（委譲前重複実行時検出の補完知見）
- **関連**: PR #3238、Case #3236、`src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「同一ファイルへの複数 edit の規律」
- **タグ**: `#並行実行` `#durable-state` `#委譲`

### PowerShell 5.1 実行経路の案内文言は ASCII 限定が安全

- **問題事象**: archive installer は release archive 生成スクリプトから Windows PowerShell 5.1 で起動される経路を持ち、BOM なし UTF-8 の多バイト文言が ANSI デコードで文字化けする
- **発生局面**: 実装（Case #3236 / PR #3238、scripts/consumer/archive/install.ps1 の案内文言設計）
- **検知方法**: 実装時の実行経路分析（release archive 生成スクリプトからの起動経路確認）
- **根本原因**: PowerShell 5.1 の既定エンコーディング（ANSI/cp932）では BOM なし UTF-8 スクリプトを正しくデコードできない
- **自律対応内容**: archive installer 版の案内文言を ASCII 限定にした（checkout consumer 版・self-sync 版は日本語のまま）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（決定事項として PR 本文に記録済み）
- **横展開観点**: PowerShell 5.1 で実行され得るスクリプトの表示文言は ASCII 限定が安全。AGENTS.md の PowerShell 一括読み書き禁止規律（cp932 破壊）と同根の知見
- **再発条件**: Windows PowerShell 5.1 実行経路を持つスクリプトへ多バイト文言を書いた場合
- **予防策候補**: installer 系・導入系スクリプトの案内文言は ASCII 限定を既定とする
- **想定反映先**: scripts/consumer/archive/ 配下の文言規律、docs/knowledge/windows-powershell-bulk-io-corruption.md の横展開候補
- **関連**: `scripts/consumer/archive/install.ps1`、PR #3238、Case #3236
- **タグ**: `#powershell` `#エンコーディング` `#windows`

### 環境依存 fail の分類は base 再現確認を証跡として残す

- **問題事象**: bun test の checker 実行系テスト（IR-055・NG21 回帰）が本環境の FS 性能で 15s timeout を超過する 4 件の環境依存 fail を出す
- **発生局面**: CI/検証（Case #3236 / PR #3238、bun test フル suite 実行）
- **検知方法**: bun test フル suite 実行時の fail 報告（2636 pass / 4 fail）
- **根本原因**: 本環境 FS の性能で checker 実行が 15s timeout を超過する環境差（コード起因ではない）
- **自律対応内容**: base（main 6d2bfc15・当該変更なし）で同一 4 fail を再現確認し、環境依存と分類。fail 分類の証跡として PR 本文へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 環境依存 fail の疑いがある場合は、変更起因性を base 再現確認で切り分け、証跡を検証差分へ残す
- **再発条件**: FS 性能依存の checker テストを低速環境で実行した場合
- **予防策候補**: base 再現確認（main リポジトリでの同一テスト実行）を fail 分類の標準手順とする
- **想定反映先**: bun test 実行形態契約・QG 検証の fail 分類手順
- **関連**: `.opencode/skills/repo-agentdev-integrity/scripts/`（IR-055・NG21 checker）、PR #3238、Case #3236
- **タグ**: `#bun-test` `#環境依存` `#timeout`

## 2026-09-30 Case #3239（case-close 工程内検知）

### 検証スクリプト内の gh コマンド文字列リテラルは write guard が誤検出する

- **問題事象**: bash 上の node -e 検証スクリプトの文字列リテラルに gh 書込みコマンド（merge コマンド等）の全文を含めると、実際の処理がファイル読取・比較のみでも agentdev-gh-write-guard が fail-closed でコマンド全体をブロックする（rule=gh pr WRITE）
- **発生局面**: 検証（Case #3239 / PR #3241、case-close、ステージング成果物の機械検証）
- **検知方法**: guard ブロックのエラーメッセージ（コマンド全文が引っかかった旨）を直接観測
- **根本原因**: guard がコマンド文字列のパターンマッチで書込みを検出するため、実行対象でないドキュメント文字列・検証スクリプト内のリテラルも対象になる
- **自律対応内容**: 検証スクリプトから gh コマンドのリテラルを排除し、正規表現抽出＋git/GitHub 由来の定数との比較で検証する構成に切り替えた。コマンド文字列を含む成果物ファイルの作成は bash 経由せず write tool を使用した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: ステージング成果物（Supervisor 適用用のコマンド文書）の検証・作成を行う場面全般。guard の fail-closed 動作自体は維持し、回避ではなく検証構造の変更で対処する
- **再発条件**: 検証・読取スクリプト内に gh 書込みコマンドの文字列リテラルを含めた場合
- **予防策候補**: gh コマンド全文の埋込みを要する検証は、ファイルから regex で対象行を抽出し期待値（変数化した定数）と比較する構成を標準とする
- **想定反映先**: worktree-operations.md「書込み guard 運用指針」節のブロック事例
- **関連**: `agentdev-gh-write-guard`、Case #3239 の case-close ステージング検証
- **タグ**: `#write-guard` `#gh` `#誤検出`

### bun install 済み worktree の git worktree remove は Filename too long で部分削除になる

- **問題事象**: `git worktree remove` が bun install で生成された node_modules 深階層（Windows MAX_PATH 超過）の削除に失敗し、管理登録は解除されるがディスクに src 等が部分残存する（error: failed to delete ... Filename too long）
- **発生局面**: クリーンアップ（Case #3239 / PR #3241、case-close STEP-6-1、`.worktrees/3239-refactor` 削除）
- **検知方法**: worktree remove の非ゼロ exit とエラーメッセージ、削除後の `ls` による残存確認
- **根本原因**: bun install で生成した依存ツリーのパス長が Windows のパス長上限を超え、git 内部の削除処理が辿れない（既知の junction reparse 事象とは別系統）
- **自律対応内容**: `git worktree prune` → node `fs.rmSync(path, {recursive:true, force:true})` のフォールバックで完全削除し、`ls` で消滅確認。ブランチ削除は管理登録解除後に行った
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 依存パッケージ前置（bun install）を実施した worktree の削除全般。junction 削除フォールバック手順と同様に Windows 固有の削除失敗系
- **再発条件**: worktree 内で bun install 等により深階層の gitignore 対象ファイルが生成された状態で git worktree remove を実行した場合
- **予防策候補**: worktree remove 失敗時は prune + node fs.rmSync recursive のフォールバック手順を削除失敗系の標準に含める
- **想定反映先**: worktree-operations.md の worktree 削除失敗フォールバック手順
- **関連**: `.worktrees/3239-refactor`、bun install 依存前置、Case #3239
- **タグ**: `#worktree` `#windows` `#filename-too-long`

### main 側に帰着した Jev 観測 untracked ファイルは hash 同一性証明後に削除して pull で復元する

- **問題事象**: worktree コンテキストの Jev 覕測が main 側 `.agentdev/jev-observations/` に書かれる契約のため、PR で commit された観測 JSON と同一パスの untracked ファイルが main root に残留し、`git pull --ff-only` の重複ファイルチェック（STEP-6-3-1）に掛かる
- **発生局面**: 実行前同期（Case #3239 / PR #3241、case-close STEP-6-3、観測 2 件）
- **検知方法**: 重複ファイルチェックの `git status --porcelain`（PR 変更 20 ファイルとの交差）
- **根本原因**: Custom Tool `agentdev_jev` の書込先 root 内部解決契約（worktree 実行でも main 側に帰着）と、case-run が同一パスを worktree 側で commit したことの組み合わせ
- **自律対応内容**: `git cat-file` で origin/main の commit 版 blob を取得し sha256 比較でバイト同一を証明してから untracked 側を削除、`git pull --ff-only` で同一内容を復元し復元後 hash 再確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: git 管理対象の domain state が worktree と main 側で二重生成される場面の安全解消手順。同一性が証明できない場合は構造化エラー停止を維持する
- **再発条件**: worktree 実行の Workflow が main 側に git 管理対象ファイルを生成し、同一パスを PR 側で commit した場合
- **予防策候補**: 重複検出時は hash 同一性証明（cat-file blob 比較）を削除の前提条件とする手順化
- **想定反映先**: case-close STEP-6-3-1 重複ファイルチェックの対処手順
- **関連**: `.agentdev/jev-observations/`、PR #3241、Case #3239
- **タグ**: `#jev-observations` `#git-pull` `#重複ファイル`

