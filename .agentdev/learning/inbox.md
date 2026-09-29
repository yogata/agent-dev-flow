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

